"""
webhook_server.py - Serveur Flask qui écoute les événements Stripe
Reçoit payment_intent.succeeded, vérifie la signature, orchestre
le calcul des splits et la génération des factures.
"""

import json
import logging
import stripe
from flask import Flask, request, jsonify

from config import STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
from stripe_handler import execute_transfers
from invoice_generator import generate_all_invoices

logger = logging.getLogger(__name__)

# Initialise Stripe
stripe.api_key = STRIPE_SECRET_KEY

# Crée l'application Flask
app = Flask(__name__)


@app.route("/health", methods=["GET"])
def health():
    """Endpoint de santé pour vérifier que le serveur tourne."""
    return jsonify({"status": "ok", "message": "Serveur webhook 126 opérationnel"}), 200


@app.route("/webhook", methods=["POST"])
def webhook():
    """
    Point d'entrée principal du webhook Stripe.

    Stripe envoie une requête POST avec :
    - Le corps JSON de l'événement
    - L'en-tête Stripe-Signature pour vérifier l'authenticité

    Flux :
    1. Vérification de la signature (sécurité)
    2. Filtrage de l'événement payment_intent.succeeded
    3. Extraction des métadonnées de split
    4. Exécution des transferts vers les experts
    5. Génération des 4 factures
    """

    # ── Étape 1 : Récupère le corps brut (obligatoire pour vérifier la signature) ──
    payload = request.get_data()
    sig_header = request.headers.get("Stripe-Signature")

    # ── Étape 2 : Vérifie que la requête vient bien de Stripe ──────────────────
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        # Corps de la requête invalide
        logger.error("Webhook : corps invalide reçu")
        return jsonify({"error": "Invalid payload"}), 400
    except stripe.error.SignatureVerificationError:
        # Signature incorrecte = requête suspecte, on rejette
        logger.error("Webhook : signature invalide ! Requête rejetée.")
        return jsonify({"error": "Invalid signature"}), 400

    logger.info(f"Webhook reçu : {event['type']} (id: {event['id']})")

    # ── Étape 3 : Traite uniquement les paiements réussis ──────────────────────
    if event["type"] == "payment_intent.succeeded":
        _handle_payment_succeeded(event["data"]["object"])
    else:
        # On ignore les autres types d'événements pour ce POC
        logger.debug(f"Événement ignoré : {event['type']}")

    # Stripe exige une réponse 200 rapide pour confirmer la réception
    return jsonify({"received": True}), 200


def _handle_payment_succeeded(payment_intent: dict):
    """
    Logique métier déclenchée après un paiement confirmé.

    Args:
        payment_intent: L'objet PaymentIntent Stripe
    """
    pi_id = payment_intent["id"]
    total_amount = payment_intent["amount"]  # en centimes
    metadata = payment_intent.get("metadata", {})

    logger.info("=" * 60)
    logger.info(f"PAIEMENT CONFIRMÉ : {pi_id}")
    logger.info(f"Montant total : {total_amount / 100:.2f} €")
    logger.info("=" * 60)

    # ── Vérifie que c'est bien un paiement 126 (via métadonnées) ──────────────
    if metadata.get("poc_126") != "true":
        logger.warning(f"PaymentIntent {pi_id} non marqué 126, ignoré")
        return

    # ── Récupère les splits depuis les métadonnées du PaymentIntent ───────────
    # Les montants ont été calculés à la création et stockés dans metadata
    try:
        splits = {
            "126":     int(metadata["split_126"]),
            "expert1": int(metadata["split_expert1"]),
            "expert2": int(metadata["split_expert2"]),
            "expert3": int(metadata["split_expert3"]),
        }
    except (KeyError, ValueError) as e:
        logger.error(f"Métadonnées de split manquantes ou invalides : {e}")
        return

    logger.info("Splits récupérés depuis les métadonnées :")
    for key, amount in splits.items():
        logger.info(f"  {key} → {amount / 100:.2f} €")

    # ── Étape 4 : Exécute les transferts Stripe vers les experts ──────────────
    logger.info("\nExécution des transferts Stripe Connect...")
    try:
        transfers = execute_transfers(pi_id, splits)
        logger.info(f"✓ {len(transfers)} transferts effectués")
    except stripe.error.StripeError as e:
        logger.error(f"Erreur Stripe lors des transferts : {e}")
        # En production : alerter + mettre en file d'attente pour retry
        return

    # ── Étape 5 : Génère les 4 factures ───────────────────────────────────────
    logger.info("\nGénération des factures...")
    invoices = generate_all_invoices(splits, pi_id)

    # ── Résumé final ───────────────────────────────────────────────────────────
    logger.info("\n" + "=" * 60)
    logger.info("RÉSUMÉ DU TRAITEMENT")
    logger.info("=" * 60)
    logger.info(f"PaymentIntent : {pi_id}")
    logger.info(f"Montant total : {total_amount / 100:.2f} €")
    logger.info(f"Transferts effectués : {len(transfers)}")
    logger.info(f"Factures générées : {len(invoices)}")
    logger.info("\nDétail des factures :")
    for inv in invoices:
        logger.info(
            f"  [{inv['invoice_number']}] {inv['entity_name']} "
            f"(SIREN {inv['entity_siren']}) → {inv['amount_total_eur']:.2f} €"
        )
    logger.info("=" * 60)
    logger.info("✅ Flux complet traité avec succès !")
    logger.info("=" * 60 + "\n")
