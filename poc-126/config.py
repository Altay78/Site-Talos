"""
config.py - Chargement et validation de la configuration
Lit les variables du fichier .env et expose une structure claire
pour le reste de l'application.
"""

import os
from dotenv import load_dotenv

# Charge le fichier .env situé dans le même dossier
load_dotenv()


def _require(key: str) -> str:
    """Récupère une variable d'environnement obligatoire, plante si absente."""
    val = os.getenv(key)
    if not val:
        raise EnvironmentError(
            f"Variable d'environnement manquante : {key}\n"
            f"Vérifiez votre fichier .env (copiez .env.example → .env)"
        )
    return val


# ── Clés API ──────────────────────────────────────────────────────────────────
STRIPE_SECRET_KEY = _require("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = _require("STRIPE_WEBHOOK_SECRET")
PENNYLANE_API_KEY = os.getenv("PENNYLANE_API_KEY", "")  # optionnel

# ── Définition des 4 entités ──────────────────────────────────────────────────
# Chaque entité est un dict avec : nom, SIREN, pourcentage de répartition,
# et (pour les experts) l'ID du compte Stripe Connect.

ENTITIES = {
    "126": {
        "name": _require("ENTITY_126_NAME"),
        "siren": _require("ENTITY_126_SIREN"),
        "percent": int(_require("ENTITY_126_PERCENT")),
        "stripe_account_id": None,  # La plateforme garde sa part, pas de transfer
    },
    "expert1": {
        "name": _require("EXPERT1_NAME"),
        "siren": _require("EXPERT1_SIREN"),
        "percent": int(_require("EXPERT1_PERCENT")),
        "stripe_account_id": _require("EXPERT1_STRIPE_ACCOUNT_ID"),
    },
    "expert2": {
        "name": _require("EXPERT2_NAME"),
        "siren": _require("EXPERT2_SIREN"),
        "percent": int(_require("EXPERT2_PERCENT")),
        "stripe_account_id": _require("EXPERT2_STRIPE_ACCOUNT_ID"),
    },
    "expert3": {
        "name": _require("EXPERT3_NAME"),
        "siren": _require("EXPERT3_SIREN"),
        "percent": int(_require("EXPERT3_PERCENT")),
        "stripe_account_id": _require("EXPERT3_STRIPE_ACCOUNT_ID"),
    },
}

# Validation : la somme des pourcentages doit faire 100
_total_percent = sum(e["percent"] for e in ENTITIES.values())
if _total_percent != 100:
    raise ValueError(
        f"La somme des pourcentages doit être 100%, actuellement : {_total_percent}%"
    )

# Port du serveur webhook
WEBHOOK_PORT = int(os.getenv("WEBHOOK_PORT", "5000"))
