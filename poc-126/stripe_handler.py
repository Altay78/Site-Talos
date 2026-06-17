"""
stripe_handler.py - Gestion des opérations Stripe Connect
Crée des Payment Intents avec répartition automatique des fonds
vers les comptes connectés des experts.
"""

import stripe
import logging
from config import STRIPE_SECRET_KEY, ENTITIES

logger = logging.getLogger(__name__)

# Initialise le client Stripe avec la clé secrète
stripe.api_key = STRIPE_SECRET_KEY


def calculate_splits(total_amount_cents: int) -> dict:
    """
    Calcule le montant (en centimes) dû à chaque entité.
    Stripe travaille toujours en centimes (1000 centimes = 10,00 €).

    Args:
        total_amount_cents: Montant total en centimes (ex: 100000 pour 1000,00 €)

    Returns:
        Dict { entity_key -> montant en centimes }
    """
    splits = {}
    allocated = 0

    # Calcule les montants pour les experts
    expert_keys = [k for k in ENTITIES if k != "126"]
    for key in expert_keys:
        entity = ENTITIES[key]
        amount = int(total_amount_cents * entity["percent"] / 100)
        splits[key] = amount
        allocated += amount

    # La plateforme 126 prend le reste (évite les erreurs d'arrondi)
    splits["126"] = total_amount_cents - allocated

    logger.info("Répartition calculée (en centimes) :")
    for key, amount in splits.items():
        logger.info(f"  {ENTITIES[key]['name']} ({ENTITIES[key]['percent']}%) → {amount} cts ({amount/100:.2f} €)")

    return splits


def create_payment_intent(total_amount_cents: int, currency: str = "eur") -> stripe.PaymentIntent:
    """
    Crée un PaymentIntent Stripe avec transfert automatique vers les experts.

    Stratégie utilisée : on crée 1 PaymentIntent principal sur le compte
    plateforme, puis on ajoute des `transfer_data` pour les experts.
    En pratique avec Stripe Connect, on utilise separate_charges_and_transfers :
    le paiement est capturé sur la plateforme, puis les transferts sont
    créés après confirmation (dans le webhook).

    Note POC : Pour simplifier, on crée le PaymentIntent et on effectuera
    les transferts depuis le webhook payment_intent.succeeded.

    Args:
        total_amount_cents: Montant total en centimes
        currency: Devise (défaut: eur)

    Returns:
        L'objet PaymentIntent Stripe
    """
    splits = calculate_splits(total_amount_cents)

    # Calcule le total transféré aux experts (= montant - part de 126)
    expert_total = total_amount_cents - splits["126"]

    logger.info(f"Création du PaymentIntent de {total_amount_cents/100:.2f} €")
    logger.info(f"  Part plateforme 126 : {splits['126']/100:.2f} €")
    logger.info(f"  Total à transférer aux experts : {expert_total/100:.2f} €")

    # Crée le PaymentIntent sur le compte plateforme
    # application_fee_amount = la part que la plateforme 126 conserve
    payment_intent = stripe.PaymentIntent.create(
        amount=total_amount_cents,
        currency=currency,
        # Métadonnées personnalisées pour retrouver les infos dans le webhook
        metadata={
            "poc_126": "true",
            "split_expert1": str(splits["expert1"]),
            "split_expert2": str(splits["expert2"]),
            "split_expert3": str(splits["expert3"]),
            "split_126": str(splits["126"]),
        },
        # Description visible dans le dashboard Stripe
        description="Abonnement 126 - Accès 3 experts",
        # Indique que le paiement sera confirmé manuellement (pour le test)
        confirm=False,
    )

    logger.info(f"✓ PaymentIntent créé : {payment_intent.id}")
    logger.info(f"  Client secret : {payment_intent.client_secret[:20]}...")

    return payment_intent


def confirm_payment_intent(payment_intent_id: str) -> stripe.PaymentIntent:
    """
    Confirme un PaymentIntent en mode test avec une carte de test Stripe.
    En production, c'est le frontend (Stripe.js) qui confirme.

    Args:
        payment_intent_id: L'ID du PaymentIntent à confirmer

    Returns:
        Le PaymentIntent mis à jour
    """
    logger.info(f"Confirmation du paiement {payment_intent_id} avec carte de test...")

    payment_intent = stripe.PaymentIntent.confirm(
        payment_intent_id,
        # Carte de test Stripe : 4242424242424242 (succès garanti)
        payment_method_data={
            "type": "card",
            "card": {
                "token": "tok_visa",  # Token de test Stripe = carte Visa valide
            },
        },
    )

    logger.info(f"✓ Paiement confirmé ! Statut : {payment_intent.status}")
    return payment_intent


def execute_transfers(payment_intent_id: str, splits: dict) -> list:
    """
    Effectue les virements vers les comptes connectés des experts.
    Appelé depuis le webhook après confirmation du paiement.

    Args:
        payment_intent_id: L'ID du PaymentIntent source (pour la traçabilité)
        splits: Dict { entity_key -> montant en centimes }

    Returns:
        Liste des objets Transfer Stripe créés
    """
    transfers = []

    for key, amount in splits.items():
        entity = ENTITIES[key]

        # La plateforme 126 n'a pas de compte connecté, on saute
        if entity["stripe_account_id"] is None:
            logger.info(f"  Plateforme 126 : {amount/100:.2f} € conservés sur le compte plateforme")
            continue

        logger.info(f"  Transfert vers {entity['name']} : {amount/100:.2f} €")

        transfer = stripe.Transfer.create(
            amount=amount,
            currency="eur",
            destination=entity["stripe_account_id"],
            # Lie le transfert au PaymentIntent pour la traçabilité
            source_transaction=payment_intent_id,
            metadata={
                "entity": key,
                "siren": entity["siren"],
                "entity_name": entity["name"],
            },
        )

        logger.info(f"  ✓ Transfer créé : {transfer.id}")
        transfers.append(transfer)

    return transfers
