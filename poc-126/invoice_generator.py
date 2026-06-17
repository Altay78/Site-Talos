"""
invoice_generator.py - Génération des factures pour chaque entité
Utilise un mock par défaut. Si PENNYLANE_API_KEY est défini,
bascule sur l'API Pennylane réelle (à implémenter).
"""

import logging
import requests
from datetime import date
from config import ENTITIES, PENNYLANE_API_KEY

logger = logging.getLogger(__name__)

# Compteur global de numéros de facture (en mémoire, suffit pour un POC)
# En production : stocker en base de données
_invoice_counters = {"126": 0, "expert1": 0, "expert2": 0, "expert3": 0}


def _next_invoice_number(entity_key: str) -> str:
    """
    Génère un numéro de facture séquentiel par entité.
    Format : FAC-{ANNÉE}-{ENTITÉ}-{NUMÉRO_SÉQUENTIEL}
    Ex: FAC-2026-126-001, FAC-2026-EXP1-001
    """
    _invoice_counters[entity_key] += 1
    prefixes = {"126": "PLF", "expert1": "EX1", "expert2": "EX2", "expert3": "EX3"}
    prefix = prefixes.get(entity_key, "INV")
    num = str(_invoice_counters[entity_key]).zfill(3)
    year = date.today().year
    return f"FAC-{year}-{prefix}-{num}"


# ── MODE MOCK ─────────────────────────────────────────────────────────────────

def mock_create_invoice(entity_key: str, amount_cents: int, payment_intent_id: str) -> dict:
    """
    Simule la création d'une facture sans appel API externe.
    Retourne un dict structuré identique à ce que retournerait Pennylane.

    À remplacer par pennylane_create_invoice() quand vous aurez les accès.

    Args:
        entity_key: Clé de l'entité ("126", "expert1", "expert2", "expert3")
        amount_cents: Montant en centimes
        payment_intent_id: Référence du paiement Stripe pour la traçabilité

    Returns:
        Dict représentant une facture structurée
    """
    entity = ENTITIES[entity_key]
    invoice_number = _next_invoice_number(entity_key)
    amount_euros = amount_cents / 100

    # Calcul de la TVA (20% - adapter selon le statut fiscal de chaque entité)
    # Note : les auto-entrepreneurs peuvent être exonérés de TVA
    tva_rate = 0.20
    amount_ht = round(amount_euros / (1 + tva_rate), 2)
    tva_amount = round(amount_euros - amount_ht, 2)

    invoice = {
        "id": f"mock_{invoice_number}",         # ID de la facture (Pennylane génère un vrai UUID)
        "invoice_number": invoice_number,        # Numéro séquentiel par entité
        "status": "finalized",                   # Statut: brouillon → finalisé → payé
        "entity_key": entity_key,
        "entity_name": entity["name"],           # Nom commercial / raison sociale
        "entity_siren": entity["siren"],         # SIREN unique de l'entité
        "date": date.today().isoformat(),        # Date d'émission
        "due_date": date.today().isoformat(),    # Date d'échéance (immédiat car déjà payé)
        "currency": "EUR",
        "amount_total_eur": amount_euros,        # Montant TTC
        "amount_ht_eur": amount_ht,              # Montant HT
        "tva_amount_eur": tva_amount,            # Montant TVA
        "tva_rate_percent": int(tva_rate * 100),
        "line_items": [
            {
                "description": "Abonnement 126 - Accès expertise",
                "quantity": 1,
                "unit_price_ht": amount_ht,
                "total_ht": amount_ht,
            }
        ],
        "payment_reference": payment_intent_id,  # Référence du paiement Stripe
        "mock": True,                             # Flag pour identifier les fausses factures
    }

    logger.info(f"  [MOCK] Facture générée : {invoice_number} | {entity['name']} | {amount_euros:.2f} €")
    return invoice


# ── MODE PENNYLANE RÉEL ───────────────────────────────────────────────────────

def pennylane_create_invoice(entity_key: str, amount_cents: int, payment_intent_id: str) -> dict:
    """
    Crée une vraie facture via l'API Pennylane.
    Documentation : https://pennylane.readme.io/reference/invoices

    À activer en renseignant PENNYLANE_API_KEY dans le .env.
    Note : Pennylane nécessite un compte par entité, ou une configuration
    multi-entités selon votre abonnement.
    """
    entity = ENTITIES[entity_key]
    amount_euros = amount_cents / 100
    amount_ht = round(amount_euros / 1.20, 2)

    headers = {
        "Authorization": f"Bearer {PENNYLANE_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "invoice": {
            "date": date.today().isoformat(),
            "deadline": date.today().isoformat(),
            "currency": "EUR",
            "line_items": [
                {
                    "label": "Abonnement 126 - Accès expertise",
                    "quantity": "1",
                    "unit": "piece",
                    "unit_price": str(amount_ht),
                    "vat_rate": "FR_20",
                }
            ],
            "special_mention": f"SIREN : {entity['siren']} | Réf paiement : {payment_intent_id}",
        }
    }

    try:
        response = requests.post(
            "https://app.pennylane.com/api/external/v1/customer_invoices",
            json=payload,
            headers=headers,
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()
        logger.info(f"  [PENNYLANE] Facture créée : {data.get('invoice', {}).get('invoice_number')} | {entity['name']}")
        return data.get("invoice", {})

    except requests.RequestException as e:
        logger.error(f"  [PENNYLANE] Erreur API pour {entity['name']} : {e}")
        logger.warning(f"  → Bascule sur mock pour {entity['name']}")
        return mock_create_invoice(entity_key, amount_cents, payment_intent_id)


# ── POINT D'ENTRÉE PRINCIPAL ──────────────────────────────────────────────────

def generate_all_invoices(splits: dict, payment_intent_id: str) -> list:
    """
    Génère les 4 factures (une par entité) en quasi-simultané.
    Choisit automatiquement mock ou Pennylane selon la config.

    Args:
        splits: Dict { entity_key -> montant en centimes }
        payment_intent_id: Référence du paiement Stripe

    Returns:
        Liste des 4 factures générées
    """
    # Choisit la fonction de création selon la présence de la clé API
    if PENNYLANE_API_KEY:
        logger.info("Mode Pennylane RÉEL activé")
        create_fn = pennylane_create_invoice
    else:
        logger.info("Mode MOCK activé (pas de clé Pennylane)")
        create_fn = mock_create_invoice

    invoices = []

    logger.info("─" * 50)
    logger.info("Génération des factures...")

    for entity_key, amount_cents in splits.items():
        if amount_cents <= 0:
            logger.warning(f"  Montant nul pour {entity_key}, facture ignorée")
            continue

        invoice = create_fn(entity_key, amount_cents, payment_intent_id)
        invoices.append(invoice)

    logger.info(f"✓ {len(invoices)} factures générées avec succès")
    logger.info("─" * 50)

    return invoices
