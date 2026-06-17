"""
main.py - Point d'entrée du POC 126

Deux modes disponibles :
  python main.py server   → Lance uniquement le serveur webhook Flask
  python main.py simulate → Simule un paiement complet de bout en bout
  python main.py          → Lance le serveur ET simule un paiement (mode démo)
"""

import sys
import time
import logging
import threading

from webhook_server import app
from stripe_handler import create_payment_intent, confirm_payment_intent
from config import WEBHOOK_PORT

# ── Configuration des logs ────────────────────────────────────────────────────
# Format lisible avec timestamp, niveau et message
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


def start_server(blocking: bool = True):
    """
    Lance le serveur Flask webhook.

    Args:
        blocking: Si True, bloque le thread courant (mode serveur seul).
                  Si False, lance en arrière-plan (mode démo).
    """
    logger.info(f"Démarrage du serveur webhook sur http://localhost:{WEBHOOK_PORT}")
    logger.info(f"Endpoint webhook : http://localhost:{WEBHOOK_PORT}/webhook")
    logger.info(f"Endpoint santé   : http://localhost:{WEBHOOK_PORT}/health")

    if blocking:
        # Mode bloquant : le serveur tourne jusqu'à Ctrl+C
        app.run(host="0.0.0.0", port=WEBHOOK_PORT, debug=False)
    else:
        # Mode non-bloquant : lance Flask dans un thread séparé
        thread = threading.Thread(
            target=lambda: app.run(host="0.0.0.0", port=WEBHOOK_PORT, debug=False, use_reloader=False),
            daemon=True,  # Le thread s'arrête quand le programme principal s'arrête
        )
        thread.start()
        # Laisse le temps au serveur de démarrer avant de simuler
        time.sleep(1)
        logger.info("Serveur démarré en arrière-plan")


def simulate_payment(amount_euros: float = 1000.0):
    """
    Simule un paiement de bout en bout via l'API Stripe en mode test.

    Étapes :
    1. Crée un PaymentIntent avec les splits dans les métadonnées
    2. Confirme le paiement avec une carte de test Stripe
    3. Stripe envoie le webhook → traité par le serveur Flask
       (si le serveur tourne ET que Stripe CLI redirige vers localhost)

    Args:
        amount_euros: Montant en euros (défaut: 1000€)
    """
    amount_cents = int(amount_euros * 100)

    logger.info("\n" + "=" * 60)
    logger.info("SIMULATION D'UN PAIEMENT TEST")
    logger.info("=" * 60)
    logger.info(f"Montant : {amount_euros:.2f} €")

    # ── Étape 1 : Crée le PaymentIntent ───────────────────────────────────────
    logger.info("\n[1/2] Création du PaymentIntent...")
    payment_intent = create_payment_intent(amount_cents)

    # ── Étape 2 : Confirme le paiement ────────────────────────────────────────
    logger.info("\n[2/2] Confirmation du paiement (carte de test Stripe)...")
    confirmed = confirm_payment_intent(payment_intent.id)

    logger.info("\n" + "─" * 60)
    logger.info(f"PaymentIntent ID : {confirmed.id}")
    logger.info(f"Statut final     : {confirmed.status}")
    logger.info("─" * 60)

    if confirmed.status == "succeeded":
        logger.info("\n✅ Paiement confirmé côté Stripe !")
        logger.info("\n→ Stripe va maintenant envoyer un webhook payment_intent.succeeded")
        logger.info("  Si le serveur tourne + Stripe CLI actif :")
        logger.info("    stripe listen --forward-to localhost:5000/webhook")
        logger.info("  Vous devriez voir les logs de traitement dans ce terminal.\n")
    else:
        logger.warning(f"\n⚠️  Statut inattendu : {confirmed.status}")
        logger.warning("Vérifiez vos clés Stripe test dans le .env")

    return confirmed


def run_demo():
    """
    Mode démo complet : lance le serveur en arrière-plan ET simule un paiement.
    Utile pour tester localement sans Stripe CLI.

    Note : Sans Stripe CLI, le webhook ne sera PAS reçu par le serveur local.
    Ce mode est utile pour vérifier que la création du PaymentIntent fonctionne.
    Pour tester le webhook complet, utilisez Stripe CLI (voir README ci-dessous).
    """
    logger.info("Mode DÉMO - Serveur + simulation de paiement")
    start_server(blocking=False)

    logger.info("\n⚠️  Note : Sans Stripe CLI, le webhook ne sera pas reçu localement.")
    logger.info("  Pour le flux complet, ouvrez un 2ème terminal et lancez :")
    logger.info("  stripe listen --forward-to localhost:5000/webhook\n")

    simulate_payment(amount_euros=1000.0)

    logger.info("\nServeur webhook toujours actif. Appuyez sur Ctrl+C pour arrêter.")
    try:
        # Garde le programme en vie pour que le serveur continue de tourner
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("\nArrêt du serveur. Au revoir !")


# ── Point d'entrée ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "demo"

    if mode == "server":
        # Lance uniquement le serveur (attendre les webhooks de Stripe CLI)
        logger.info("Mode : SERVEUR WEBHOOK UNIQUEMENT")
        start_server(blocking=True)

    elif mode == "simulate":
        # Simule uniquement un paiement (le serveur doit tourner dans un autre terminal)
        logger.info("Mode : SIMULATION PAIEMENT UNIQUEMENT")
        simulate_payment(amount_euros=1000.0)

    elif mode == "demo":
        # Mode démo : les deux ensemble
        run_demo()

    else:
        print(f"Mode inconnu : '{mode}'")
        print("Usage : python main.py [server|simulate|demo]")
        sys.exit(1)
