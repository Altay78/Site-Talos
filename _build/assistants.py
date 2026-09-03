# -*- coding: utf-8 -*-
"""Les pages « assistant » — un gabarit, un jeu de contenus par assistant.

La mise en forme (asst.css, b2.css, b3.css, b4.css) est commune. Ici on ne
décrit que ce qui change d'un assistant à l'autre : son personnage, sa
promesse, son parcours, ses missions et ses questions.

Pour ajouter un assistant : une entrée de plus dans ASSISTANTS, rien d'autre.
"""

import crew

# ── les trois icônes du compteur d'équipe ─────────────────────────────────
def _ic(d):
    return ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" '
            'stroke-linecap="round" stroke-linejoin="round">%s</svg>' % d)

ICO_EQUIPE  = _ic('<path d="M16 20v-1.6a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20"/>'
                  '<circle cx="9" cy="7.5" r="3.4"/>'
                  '<path d="M22 20v-1.6a4 4 0 0 0-3-3.9M16.5 4.3a4 4 0 0 1 0 7.4"/>')
ICO_MISSION = _ic('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.6"/>'
                  '<circle cx="12" cy="12" r="1"/>')
ICO_FONC    = _ic('<rect x="3" y="3" width="7.4" height="7.4" rx="2"/>'
                  '<rect x="13.6" y="3" width="7.4" height="7.4" rx="2"/>'
                  '<rect x="3" y="13.6" width="7.4" height="7.4" rx="2"/>'
                  '<path d="M17.3 13.6v7.4M13.6 17.3h7.4"/>')

# ── icônes (tracés seuls, le gabarit pose le <svg> autour) ────────────────
ICO = {
 'doc':     '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/>',
 'euro':    '<path d="M18 7a7 7 0 1 0 0 10"/><path d="M3 10h9M3 14h9"/>',
 'stylo':   '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
 'boucle':  '<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
 'inbox':   '<path d="M3 13.5h4.2l1.6 2.8h6.4l1.6-2.8H21"/><path d="M5.4 5.2 3 13.5v3.8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3.8l-2.4-8.3a2 2 0 0 0-1.9-1.4H7.3a2 2 0 0 0-1.9 1.4z"/>',
 'bulle':   '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.7-.8L3 21l1.9-5.1A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z"/>',
 'agenda':  '<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M16 2.5v4M8 2.5v4M3 10.5h18"/>',
 'cloche':  '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
 'alerte':  '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17v.1"/>',
 'balance': '<path d="M12 3v18M7 21h10"/><path d="M5 7h14M5 7 2 14h6zM19 7l-3 7h6z"/>',
 'graph':   '<path d="M3 3v18h18"/><path d="M7 14l3-3 3 3 5-6"/>',
 'horloge': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.2 1.9"/>',
 'carte':   '<path d="M20.8 10.3c0 5.6-8.8 11-8.8 11s-8.8-5.4-8.8-11a8.8 8.8 0 1 1 17.6 0z"/><circle cx="12" cy="10" r="3"/>',
}

def _svg(cle, taille=19, trait='1.9'):
    return ('<svg width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
            'stroke-width="%s" stroke-linecap="round" stroke-linejoin="round">%s</svg>'
            % (taille, taille, trait, ICO[cle]))

FLECHE = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" '
          'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>')
CHEV = ('<svg class="f-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" '
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9.5l6 6 6-6"/></svg>')


# ═══════════════════════════════════════════════════════════════════════════
#  LE GABARIT — quatre blocs, identiques pour tous les assistants
# ═══════════════════════════════════════════════════════════════════════════

def _b1(a):
    caps = '\n'.join(
        '          <li>\n            <i aria-hidden="true">%s</i>\n            %s</li>'
        % (_svg(ic, 20), txt) for ic, txt in a['caps'])
    return u'''<section class="t-asst">

  <!-- ═══ BLOC 1 · PRÉSENTATION ═══════════════════════════════════════════ -->
  <div class="b1">
    <div class="shell b1-grid">

      <div class="b1-media">
        <picture>
          <source srcset="perso/assistant-%(slug)s.webp" type="image/webp">
          <img class="perso" src="perso/assistant-%(slug)s.png" width="%(pw)d" height="%(ph)d"
               decoding="async" fetchpriority="high" alt="%(alt)s">
        </picture>
      </div>

      <div class="b1-txt">
        <p class="role">%(role)s</p>
        <h1>%(h1)s</h1>

        <p class="proof">
          <span class="proof-i">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <b>+30 artisans</b> accompagnés
          </span>
          <span class="proof-sep" aria-hidden="true"></span>
          <span class="proof-i">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
            Mise en place <b>incluse</b>
          </span>
        </p>

        <p class="pitch">%(pitch)s</p>

        <ul class="caps">
%(caps)s
        </ul>

        <div class="actions">
          <a class="btn btn-1" href="reserver.html">Je veux mon assistant %(fleche)s</a>
          <a class="btn btn-2" href="reserver.html">Réserver une démo</a>
        </div>
      </div>

    </div>
  </div>

</section>
''' % dict(a, caps=caps, fleche=FLECHE)


def _b2(a):
    cartes = []
    for i, (titre, ico, accroche, detail, ph) in enumerate(a['parcours'], 1):
        cartes.append(u'''      <article class="fx-card">
        <div class="fx-txt">
          <h3>%s</h3>
          <p class="fx-win">
            <span class="fx-ic" aria-hidden="true">%s</span>
            %s
          </p>
          <details class="fx-info">
            <summary>
              <span class="fx-i" aria-hidden="true"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 10.5v6"/><path d="M12 6.9v.2"/></svg></span>
              <span class="fx-lbl-off">Comment ça marche</span>
              <span class="fx-lbl-on">Réduire</span>
              <svg class="fx-chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9.5l6 6 6-6"/></svg>
            </summary>
            <p>%s</p>
          </details>
        </div>
        <div class="fx-vis">
          <div class="fx-phone">
            <span class="fx-k act"></span><span class="fx-k vu"></span><span class="fx-k vd"></span><span class="fx-k pw"></span>
            <div class="fx-bezel">
              <div class="fx-screen">
                <div class="fx-ph"><b>Écran %02d</b><span>%s</span><i>780 × 1688 px · PNG</i></div>
                <img width="780" height="1688" loading="lazy" decoding="async" alt="%s">
              </div>
            </div>
            <div class="fx-glare"></div>
          </div>
          <button class="fx-open" type="button" aria-label="Voir l'écran en entier">
            <span class="fx-mag" aria-hidden="true"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M11 8.5v5M8.5 11h5"/></svg></span>
          </button>
        </div>
      </article>''' % (titre, _svg(ico), accroche, detail, i, ph, ph))

    return u'''
  <!-- ═══ BLOC 2 · LE PARCOURS ════════════════════════════════════════════ -->
  <section class="t-feat" id="parcours">
    <div class="fx-in">
      <div class="fx-head">
        <span class="fx-eyebrow"><i></i>Comment votre assistant travaille</span>
        <h2>%(b2h2)s</h2>
        <p>%(b2lede)s</p>
        <p class="fx-kicker">%(b2kicker)s</p>
      </div>

      <div class="fx-rail" id="fxRail">
%(cartes)s

        <a class="fx-card act2 fx-more" href="offres.html">
          <div class="fx-txt">
            <span class="fx-next">Et ce n'est pas tout</span>
            <b>Découvrir<br>les autres assistants.</b>
            <span>Chaque assistant a ses missions. Voir toute l'équipe Talos.</span>
            <span class="fx-ico" aria-hidden="true"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg></span>
          </div>
        </a>
      </div>

      <div class="fx-nav">
        <button class="fx-arrow" id="fxPrev" type="button" aria-label="Étape précédente" aria-controls="fxRail"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5l-7 7 7 7"/></svg></button>
        <div class="fx-dots" id="fxDots" role="tablist" aria-label="Navigation des étapes"></div>
        <button class="fx-arrow" id="fxNext" type="button" aria-label="Étape suivante" aria-controls="fxRail"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 5l7 7-7 7"/></svg></button>
      </div>
    </div>

    <dialog class="fx-zoom" id="fxZoom" aria-label="Aperçu de l'écran en entier">
      <button class="fx-zoom-x" id="fxZoomClose" type="button" aria-label="Fermer l'aperçu"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg></button>
      <figure>
        <div class="fx-phone">
          <span class="fx-k act"></span><span class="fx-k vu"></span><span class="fx-k vd"></span><span class="fx-k pw"></span>
          <div class="fx-bezel"><div class="fx-screen"><img id="fxZoomImg" alt=""></div></div>
        </div>
      </figure>
    </dialog>
  </section>
''' % dict(a, cartes='\n'.join(cartes))


def _b3(a):
    colonnes, synth = [], []
    for n, (nom, feats) in enumerate(a['missions'], 1):
        lignes = '\n'.join(
            '        <details class="f">\n          <summary>%s%s</summary>\n          <p>%s</p>\n        </details>'
            % (t, CHEV, d) for t, d in feats)
        colonnes.append('      <div>\n        <p class="mh">%s <span class="mh-n">· %d</span></p>\n%s\n      </div>'
                        % (nom, len(feats), lignes))
        synth.append('          <li><b>%s</b><i>%d</i></li>' % (nom, len(feats)))
    total = sum(len(f) for _, f in a['missions'])
    return u'''
  <!-- ═══ BLOC 3 · LA DOULEUR QUI DISPARAÎT + LE DÉTAIL ═══════════════════ -->
  <section class="t-asst">
    <div class="b3" id="missions">
      <div class="shell">

        <div class="b3-top">
          <div>
            <p class="b3-tag">Talos, %(role_bas)s 24/7</p>
            <h2>%(douleur)s</h2>
            <div class="actions">
              <a class="btn btn-1" href="reserver.html">Je veux mon assistant %(fleche)s</a>
              <a class="btn btn-2" href="reserver.html">Réserver une démo</a>
            </div>
          </div>

          <div class="synth">
            <div class="synth-h">
              <b>Ce qu'il prend en charge</b>
              <span>%(nm)d missions · %(total)d fonctionnalités</span>
            </div>
            <ol>
%(synth)s
            </ol>
            <p class="synth-f"><b>Les plus demandées :</b> %(demandees)s</p>
          </div>
        </div>

        <div class="b3-grid">
%(colonnes)s
        </div>

      </div>
    </div>
  </section>
''' % dict(a, colonnes='\n'.join(colonnes), synth='\n'.join(synth),
           nm=len(a['missions']), total=total, fleche=FLECHE)


def _b4(a):
    def liste(items):
        return '\n'.join(
            '        <details class="f">\n          <summary>%s%s</summary>\n          <p>%s</p>\n        </details>'
            % (q, CHEV, r) for q, r in items)
    return u'''
  <!-- ═══ BLOC 4 · FAQ ════════════════════════════════════════════════════ -->
  <section class="t-asst">
    <div class="b4" id="faq">
      <div class="shell">

        <div class="b4-head">
          <p class="b4-tag">F.A.Q</p>
          <h2>Les questions qu'on nous pose</h2>
          <p>Celles qui reviennent à chaque rendez-vous. Si la vôtre n'y est pas,
            posez-la — on répond vite.</p>
        </div>

        <div class="b4-tabs" role="tablist" aria-label="Catégories de questions">
          <button class="tab" type="button" role="tab" id="faqT1" aria-selected="true" aria-controls="faqP1">Quelles missions ?</button>
          <button class="tab" type="button" role="tab" id="faqT2" aria-selected="false" aria-controls="faqP2">Fonctionnement</button>
        </div>

        <div class="b4-list" id="faqP1" role="tabpanel" aria-labelledby="faqT1">
%(q1)s
        </div>

        <div class="b4-list" id="faqP2" role="tabpanel" aria-labelledby="faqT2" hidden>
%(q2)s
        </div>

        <div class="b4-foot">
          <div>
            <b>Il vous reste une question ?</b>
            <span>Quinze minutes au téléphone, sans engagement. On répond, même si
              vous ne travaillez pas avec nous.</span>
          </div>
          <a class="btn btn-1" href="reserver.html">Réserver une démo %(fleche)s</a>
        </div>

      </div>
    </div>
  </section>
''' % dict(q1=liste(a['faq_missions']), q2=liste(a['faq_fonctionnement']), fleche=FLECHE)


def corps(a):
    """Le corps complet d'une page assistant."""
    return _b1(a) + _b2(a) + _b3(a) + _b4(a)


# ═══════════════════════════════════════════════════════════════════════════
#  LES CONTENUS — un dictionnaire par assistant
# ═══════════════════════════════════════════════════════════════════════════

COMMERCIAL = dict(
 slug='commercial', pw=530, ph=1400,
 alt="L'assistant commercial de Talos",
 titre=u"Assistant commercial — Talos | Vos devis partent le soir même",
 desc=u"L'assistant commercial de Talos chiffre vos devis depuis un mail, un vocal ou une "
      u"photo, les fait signer avec acompte, puis les relance jusqu'à la réponse.",
 role=u"Assistant Devis &amp; Relances",
 role_bas=u"votre assistant commercial",
 h1=u"Découvrez votre assistant commercial",
 pitch=u"Votre Assistant Commercial rédige vos devis à partir d'un mail, d'une note vocale ou "
       u"d'une photo, les chiffre sur votre grille tarifaire, les envoie à la signature avec "
       u"l'acompte, puis les relance jusqu'à la réponse du client.",
 caps=[('doc', u"Rédige vos devis en minutes"), ('euro', u"Chiffre sur votre grille tarifaire"),
       ('stylo', u"Fait signer et encaisse l'acompte"), ('boucle', u"Relance à J+3, J+7 et J+14")],
 b2h2=u"De la demande du soir<br>jusqu'à la <em>signature</em>.",
 b2lede=u"Un client vous écrit hors horaires. Le lendemain matin, le devis est chiffré, envoyé, "
        u"et il se relance tout seul jusqu'à la réponse.",
 b2kicker=u"Vous faites votre métier. Il s'occupe des devis.",
 parcours=[
  (u"Demande", 'inbox', u"Ne laissez plus passer une demande.",
   u"Un client écrit à 22 h : votre assistant répond, pose les bonnes questions et remonte une "
   u"demande complète — chantier, adresse, délai, budget évoqué.", u"La demande client qui arrive"),
  (u"Devis", 'doc', u"Vos devis en quelques minutes.",
   u"Depuis ce mail, une note vocale ou une photo prise sur place, le devis est chiffré sur votre "
   u"grille tarifaire, avec ses variantes et ses conditions de paiement.", u"Le devis chiffré, prêt à relire"),
  (u"Signature", 'stylo', u"Signé et encaissé sans courir.",
   u"Le client signe depuis son téléphone et règle l'acompte dans la foulée. Vous démarrez le "
   u"chantier avec de la trésorerie.", u"La signature et l'acompte"),
  (u"Relance", 'boucle', u"Plus de devis signés, moins d'oublis.",
   u"Sans réponse, le devis est relancé à J+3, J+7 puis J+14. Dès que le client répond ou signe, "
   u"tout s'arrête.", u"Le suivi des devis en attente"),
 ],
 douleur=u"Faire vos devis le soir n'est plus votre problème.",
 demandees=u"le devis dicté depuis le chantier, la signature en ligne avec acompte, et la relance "
           u"qui s'arrête toute seule dès que le client répond.",
 missions=[
  (u"Génération de devis", [
   (u"Depuis un e-mail", u"Le client décrit son besoin par mail : le devis en sort chiffré, sans une seule ressaisie de votre part."),
   (u"Depuis un formulaire", u"Les demandes reçues via votre site arrivent déjà structurées — chantier, adresse, délai, budget évoqué."),
   (u"Depuis une note vocale", u"Vous dictez ce que vous avez vu sur place : pièces, mesures, contraintes d'accès. Talos transcrit puis structure."),
   (u"Depuis une photo", u"Un plan, un état des lieux, le devis papier d'un concurrent : la photo suffit à lancer le chiffrage."),
   (u"Chiffrage sur votre grille tarifaire", u"Vos prix, vos prestations, vos marges. Jamais un tarif sorti de nulle part."),
  ]),
  (u"Envoi &amp; signature", [
   (u"Trois variantes Éco, Standard, Premium", u"Le client choisit son niveau au lieu de choisir entre vous et un concurrent. Vous signez plus souvent, et plus cher."),
   (u"Signature en ligne", u"Il signe depuis son téléphone, sans imprimer ni scanner. Vous êtes prévenu à la seconde."),
   (u"Demande d'acompte", u"30 % à la commande, encaissés par carte au moment de la signature. Le chantier démarre avec de la trésorerie."),
   (u"Date de validité", u"Chaque devis porte sa date limite. C'est elle qui crée l'urgence — pas vous."),
   (u"Conditions de paiement", u"Échéances, retenue de garantie, modalités de règlement : posées automatiquement."),
  ]),
  (u"Relance &amp; suivi", [
   (u"Relance à J+3", u"Un premier rappel court, trois jours après l'envoi. Celui que personne ne pense à faire."),
   (u"Relance à J+7", u"Une semaine plus tard, on reformule la proposition et on propose d'en discuter de vive voix."),
   (u"Relance à J+14", u"Dernière relance, avec la date de validité en rappel. Après, on laisse le dossier tranquille."),
   (u"Arrêt après réponse", u"Le client répond ? La séquence s'arrête immédiatement. Personne n'est harcelé en votre nom."),
   (u"Arrêt après signature", u"Devis signé, relances terminées — et la facture s'enclenche toute seule derrière."),
   (u"Détection des ouvertures répétées", u"Un devis relu trois fois, c'est un client qui hésite. Talos le repère et vous le signale."),
   (u"Relance « chaude »", u"Ces dossiers-là remontent en haut de la pile, avec le montant en jeu."),
  ]),
 ],
 faq_missions=[
  (u"Est-ce qu'il chiffre vraiment le devis tout seul ?", u"Oui, à partir de votre grille tarifaire — vos prestations, vos prix, vos marges. Il ne sort jamais un tarif inventé. Si une prestation manque à la grille, il vous la signale au lieu de deviner."),
  (u"Est-ce qu'il envoie les devis sans mon accord ?", u"Jamais. Il prépare, vous relisez, vous envoyez. C'est vrai pour les devis comme pour les relances."),
  (u"Et s'il se trompe sur un chiffrage ?", u"Vous corrigez avant l'envoi, comme sur un brouillon. Et il retient vos corrections : plus vous le reprenez, moins vous avez à le reprendre."),
  (u"Que se passe-t-il quand le client répond à une relance ?", u"La séquence s'arrête immédiatement et le dossier remonte dans votre pile du matin."),
  (u"Est-ce qu'il gère aussi mes factures et mes impayés ?", u"Pas celui-ci : l'assistant commercial s'arrête à la signature. La facturation et le recouvrement sont le travail de deux autres assistants."),
  (u"Est-ce qu'il travaille la nuit et le week-end ?", u"C'est même là qu'il sert le plus. Une demande reçue à 22 h le samedi est qualifiée dans la foulée."),
 ],
)

FAQ_FONCTIONNEMENT = [
 (u"Combien de temps pour le mettre en place ?", u"Comptez une semaine. On récupère vos documents et vos règles, on branche votre boîte mail, et il commence à travailler. La mise en place est incluse — vous n'avez rien à paramétrer."),
 (u"Est-ce que je dois changer de logiciel ?", u"Non. Il se branche sur ce que vous utilisez déjà : votre messagerie, votre agenda, votre logiciel de gestion s'il y en a un."),
 (u"Qu'est-ce que je vois, concrètement, tous les matins ?", u"Une pile : ce qu'il a préparé pendant la nuit, avec le montant en jeu et le temps que ça vous prendra de tout valider. En général deux minutes."),
 (u"Où sont hébergées mes données ?", u"En France. Votre banque est consultée en lecture seule, et chaque action est horodatée dans un journal que vous pouvez relire."),
 (u"Et si je veux arrêter ?", u"Vous partez avec vos données : clients, documents, historique, tout est exportable. Sans engagement et sans frais de sortie."),
]
COMMERCIAL['faq_fonctionnement'] = [
 (u"Comment il connaît mes prix ?", u"Vous nous transmettez votre grille tarifaire, même sous forme d'un vieux tableur ou de vos derniers devis. On la met en forme pour lui, et vous la modifiez ensuite depuis votre espace."),
] + FAQ_FONCTIONNEMENT

TRESORERIE = dict(
 slug='tresorerie', pw=652, ph=1400,
 alt="L'assistante trésorerie de Talos",
 titre=u"Assistante trésorerie — Talos | Faites rentrer votre argent sans courir",
 desc=u"L'assistante trésorerie de Talos détecte vos factures en retard, relance à J+7, J+15 et "
      u"J+30, prépare la mise en demeure et calcule vos pénalités. Et vous dit ce qui rentre.",
 role=u"Assistante Impayés &amp; Prévision",
 role_bas=u"votre assistante trésorerie",
 h1=u"Découvrez votre assistante trésorerie",
 pitch=u"Votre Assistante Trésorerie repère vos factures en retard, relance vos clients à votre "
       u"place avec le bon ton au bon moment, prépare les pénalités et la mise en demeure quand "
       u"il le faut, et vous dit chaque semaine ce qui va rentrer.",
 caps=[('horloge', u"Détecte les factures en retard"), ('boucle', u"Relance à J+7, J+15 et J+30"),
       ('balance', u"Prépare pénalités et mise en demeure"), ('graph', u"Prévoit vos encaissements")],
 b2h2=u"De la facture oubliée<br>jusqu'à l'<em>encaissement</em>.",
 b2lede=u"Une facture dépasse son échéance. Votre assistante s'en aperçoit avant vous, relance en "
        u"douceur, puis durcit le ton — jusqu'au règlement.",
 b2kicker=u"Vous n'avez plus à jouer le mauvais rôle.",
 parcours=[
  (u"Retard", 'horloge', u"Vous savez qui doit, et depuis quand.",
   u"Dès qu'une échéance est dépassée, la facture bascule dans les impayés avec son ancienneté "
   u"et le montant en jeu. Plus besoin d'éplucher vos relevés.", u"Les factures en retard"),
  (u"Relance", 'boucle', u"Un rappel courtois, puis ferme.",
   u"J+7 un rappel poli, J+15 plus direct, J+30 la dernière chance avant mise en demeure. Chaque "
   u"niveau est écrit, vous validez.", u"La relance graduée"),
  (u"Recouvrement", 'balance', u"Les mots qui font payer.",
   u"Pénalités de retard, indemnité forfaitaire de 40 €, mise en demeure, proposition "
   u"d'échéancier : le vocabulaire légal que vous n'osez pas sortir.", u"La mise en demeure"),
  (u"Prévision", 'graph', u"Vous savez ce qui rentre.",
   u"Projection des encaissements à venir et alerte hebdomadaire si le solde passe sous votre "
   u"seuil. Vous voyez le trou arriver avant d'y tomber.", u"La prévision de trésorerie"),
 ],
 douleur=u"Courir après vos clients n'est plus votre problème.",
 demandees=u"la relance graduée qui s'arrête au paiement, le calcul automatique des pénalités, "
           u"et l'alerte du lundi matin sur ce qui va rentrer.",
 missions=[
  (u"Relances impayés", [
   (u"Détection des factures en retard", u"Dès l'échéance dépassée, la facture bascule dans les impayés avec son ancienneté et le montant en jeu."),
   (u"Relance à J+7", u"Un rappel court et courtois. Beaucoup de retards ne sont qu'un oubli — celui-là suffit souvent."),
   (u"Relance à J+15", u"Le ton se fait plus direct, avec le détail de la facture et la date d'échéance dépassée."),
   (u"Relance à J+30", u"Dernier rappel avant procédure, avec les pénalités annoncées noir sur blanc."),
  ]),
  (u"Recouvrement &amp; pénalités", [
   (u"Seuil d'escalade", u"Vous décidez à partir de quel montant et de quel retard on passe au niveau supérieur. En dessous, on n'insiste pas."),
   (u"Génération de la mise en demeure", u"Le courrier est prêt, aux bonnes mentions légales, avec la facture jointe. Vous relisez et vous envoyez."),
   (u"Proposition d'échéancier", u"Plutôt qu'un bras de fer, un étalement en trois ou quatre fois. Un client qui paie tard vaut mieux qu'un client perdu."),
   (u"Calcul des pénalités de retard", u"Au taux légal en vigueur, calculées jour par jour depuis l'échéance."),
   (u"Indemnité forfaitaire de 40 €", u"Elle vous est due de plein droit sur chaque facture professionnelle en retard. Encore faut-il la réclamer."),
   (u"Mention des pénalités dès le niveau 2", u"Annoncer les pénalités change le comportement du payeur bien avant d'avoir à les appliquer."),
  ]),
  (u"Prévision de trésorerie", [
   (u"Projection des encaissements", u"Ce qui doit rentrer, semaine par semaine, à partir de vos devis signés et de vos factures émises."),
   (u"Alerte hebdomadaire", u"Chaque lundi à 8 h, par e-mail et SMS : le solde prévu, ce qui est en retard, et ce qui mérite votre attention."),
  ]),
 ],
 faq_missions=[
  (u"Est-ce qu'elle relance mes clients sans me prévenir ?", u"Non. Chaque relance est écrite à l'avance et attend votre validation. Vous gardez la main sur le ton et sur le moment."),
  (u"Et si je ne veux pas relancer un client en particulier ?", u"Vous le mettez en pause. Il sort de la séquence sans sortir de votre suivi — vous continuez à voir ce qu'il vous doit."),
  (u"Est-ce qu'elle peut vraiment rédiger une mise en demeure ?", u"Elle prépare le courrier avec les mentions légales et la facture jointe. Vous relisez et vous envoyez. Pour un contentieux, prenez un professionnel du recouvrement."),
  (u"Les pénalités de retard, c'est légal ?", u"Elles sont dues de plein droit entre professionnels, tout comme l'indemnité forfaitaire de 40 €. Beaucoup d'artisans ne les réclament jamais."),
  (u"Est-ce qu'elle voit mon compte en banque ?", u"En lecture seule, et uniquement pour rapprocher les paiements. Elle ne peut initier aucun virement."),
  (u"Est-ce qu'elle fait aussi mes factures ?", u"Non, elle s'occupe de les faire payer. L'émission des factures est le travail de l'assistant facturation."),
 ],
 faq_fonctionnement=[
  (u"Comment elle sait qu'une facture est payée ?", u"Par le rapprochement avec votre compte professionnel, consulté en lecture seule. Dès que le virement arrive, la relance s'arrête."),
 ] + FAQ_FONCTIONNEMENT,
)

CLIENT = dict(
 slug='client', pw=411, ph=1400,
 alt="L'assistante client de Talos",
 titre=u"Assistante client — Talos | Vos clients ont une réponse, même la nuit",
 desc=u"L'assistante client de Talos répond à vos clients 24 h/24, qualifie leurs demandes, "
      u"place les rendez-vous dans votre agenda et envoie les confirmations et rappels.",
 role=u"Assistante Réponses &amp; Rendez-vous",
 role_bas=u"votre assistante client",
 h1=u"Découvrez votre assistante client",
 pitch=u"Votre Assistante Client répond à vos clients 24 h/24, qualifie leurs demandes, organise "
       u"leurs rendez-vous dans votre agenda et leur envoie automatiquement les confirmations "
       u"et les rappels.",
 caps=[('bulle', u"Répond jour et nuit, week-end compris"), ('carte', u"Qualifie et situe la demande"),
       ('agenda', u"Place les rendez-vous dans votre agenda"), ('cloche', u"Confirme et rappelle avant l'heure")],
 b2h2=u"Du message du soir<br>jusqu'au <em>rendez-vous</em>.",
 b2lede=u"Un client vous écrit à 21 h. Il obtient une réponse tout de suite, un créneau qui vous "
        u"arrange, et un rappel la veille. Vous n'avez rien fait.",
 b2kicker=u"Vous ne rappelez plus personne le soir.",
 parcours=[
  (u"Réponse", 'bulle', u"Un client sans réponse, c'est un client perdu.",
   u"Hors horaires, votre assistante répond depuis votre base de connaissances : vos prestations, "
   u"votre zone, vos délais. Jamais un prix ferme sans votre validation.", u"La réponse hors horaires"),
  (u"Qualification", 'carte', u"La bonne demande, avec les bonnes infos.",
   u"Nature des travaux, adresse, urgence, budget évoqué : elle pose les questions qui manquent "
   u"et vérifie que le chantier est dans votre zone d'intervention.", u"La demande qualifiée"),
  (u"Rendez-vous", 'agenda', u"Votre agenda se remplit tout seul.",
   u"Elle propose des créneaux compatibles avec vos déplacements, tient compte du temps de trajet, "
   u"crée la fiche client et pose l'événement dans votre agenda.", u"La prise de rendez-vous"),
  (u"Rappels", 'cloche', u"Moins de rendez-vous manqués.",
   u"Un rappel la veille, un autre deux heures avant, par SMS et par e-mail. Le client confirme, "
   u"ou replanifie sans vous appeler.", u"Le rappel avant l'intervention"),
 ],
 douleur=u"Rappeler vos clients le soir n'est plus votre problème.",
 demandees=u"la réponse automatique hors horaires, le créneau proposé en tenant compte du trajet, "
           u"et le rappel de la veille qui vide vos rendez-vous manqués.",
 missions=[
  (u"Réponse aux demandes 24/7", [
   (u"Réponse hors horaires", u"Le soir, le week-end, pendant les congés : le client obtient une réponse dans la minute au lieu d'une messagerie."),
   (u"Qualification de la demande", u"Urgence, devis, renseignement, suivi de chantier : chaque message est classé avant d'arriver chez vous."),
   (u"Collecte des informations manquantes", u"Adresse, nature des travaux, délai souhaité, budget évoqué : elle demande ce qui manque, poliment."),
   (u"Réponses basées sur votre base de connaissances", u"Vos prestations, vos délais, votre zone, vos matériaux habituels. Plus vous la nourrissez, plus elle est précise."),
   (u"Aucun prix ferme sans votre validation", u"Elle peut donner un ordre de grandeur si vous l'autorisez, jamais un engagement chiffré."),
   (u"Transfert vers vous hors périmètre", u"Si la demande sort du cadre ou si le client insiste, elle passe la main avec tout le contexte."),
  ]),
  (u"Prise de rendez-vous", [
   (u"Proposition de créneaux", u"Deux ou trois créneaux compatibles avec votre agenda réel, pas une liste théorique."),
   (u"Zone d'intervention respectée", u"Un chantier hors de votre secteur ne se transforme pas en rendez-vous qui vous fera perdre la matinée."),
   (u"Temps de trajet pris en compte", u"Elle laisse de la marge entre deux interventions selon la distance, pour que la journée tienne debout."),
   (u"Ajout à votre agenda", u"L'événement arrive dans Google Agenda ou Outlook, avec l'adresse et le motif."),
   (u"Création de la fiche client", u"Coordonnées, historique, canal préféré : la fiche existe avant même votre premier échange."),
   (u"Confirmation au client", u"Il reçoit le récapitulatif tout de suite : date, heure, adresse, nature de l'intervention."),
  ]),
  (u"Rappels &amp; confirmations", [
   (u"Rappel à J-1", u"La veille, un message court qui rappelle l'heure et l'adresse."),
   (u"Rappel à H-2", u"Deux heures avant, le dernier signal. C'est celui qui évite le déplacement pour rien."),
   (u"SMS et e-mail", u"Sur le canal que le client utilise vraiment, pas sur celui qui vous arrange."),
   (u"Confirmation du client", u"Un mot de sa part et le rendez-vous passe en confirmé dans votre agenda."),
   (u"Replanification en cas d'empêchement", u"S'il ne peut pas, elle propose un autre créneau au lieu d'annuler sèchement."),
  ]),
 ],
 faq_missions=[
  (u"Est-ce qu'elle donne des prix à mes clients ?", u"Jamais un prix ferme sans votre validation. Vous pouvez l'autoriser à donner un ordre de grandeur, mais elle ne vous engage sur rien."),
  (u"Comment elle sait quoi répondre ?", u"Vous lui donnez votre base de connaissances : prestations, zone, délais, matériaux, questions fréquentes. Elle ne répond que dans ce périmètre."),
  (u"Et si le client pose une question qu'elle ne comprend pas ?", u"Elle ne bricole pas de réponse. Elle collecte les informations et vous passe la main avec le contexte complet."),
  (u"Est-ce que le client sait qu'il parle à une IA ?", u"C'est vous qui décidez du ton et de la présentation. On recommande la transparence : elle se présente comme votre assistante."),
  (u"Est-ce qu'elle peut prendre un rendez-vous hors de ma zone ?", u"Non. Votre secteur est paramétré, et un chantier hors zone vous est remonté plutôt que placé dans l'agenda."),
  (u"Est-ce qu'elle fait aussi les devis ?", u"Non, elle qualifie et organise. Le chiffrage est le travail de l'assistant commercial."),
 ],
 faq_fonctionnement=[
  (u"Sur quels canaux elle répond ?", u"E-mail, formulaire de votre site, WhatsApp et SMS. On branche ceux que vous utilisez déjà."),
 ] + FAQ_FONCTIONNEMENT,
)


FACTURATION = dict(
 slug='facturation', pw=402, ph=1400,
 alt="L'assistant facturation de Talos",
 titre=u"Assistant facturation — Talos | Vos factures partent sans que vous y pensiez",
 desc=u"L'assistant facturation de Talos transforme chaque devis signé en facture conforme : "
      u"acomptes, situations, TVA, numérotation continue, format électronique 2026 et archivage.",
 role=u"Assistant Factures &amp; Encaissements",
 role_bas=u"votre assistant facturation",
 h1=u"Découvrez votre assistant facturation",
 pitch=u"Votre Assistant Facturation reprend le devis au moment de la signature et sort la "
       u"facture : acompte, situations de travaux, TVA au bon taux, numérotation continue. "
       u"Au format électronique attendu en 2026, archivé, prêt pour votre comptable.",
 caps=[('doc', u"Facture dès le devis signé"), ('euro', u"Acomptes et situations de travaux"),
       ('balance', u"TVA, mentions et numérotation"), ('carte', u"Format électronique 2026")],
 b2h2=u"Du devis signé<br>jusqu'à la <em>facture conforme</em>.",
 b2lede=u"Le client signe. La facture d'acompte part dans la foulée, les situations suivent "
        u"l'avancement, et le solde tombe à la réception du chantier.",
 b2kicker=u"Vous facturez sans y penser. Et sans erreur.",
 parcours=[
  (u"Signature", 'stylo', u"La facture démarre toute seule.",
   u"Dès que le devis est signé, la facture d'acompte est générée avec le bon montant et les "
   u"bonnes mentions. Vous n'avez rien à ressaisir.", u"Le devis signé qui bascule en facture"),
  (u"Avancement", 'euro', u"Chaque situation à son moment.",
   u"Sur un chantier long, les situations de travaux suivent l'avancement que vous déclarez. "
   u"Le reste à facturer est toujours juste.", u"La situation de travaux"),
  (u"Conformité", 'balance', u"Conforme, sans y penser.",
   u"Numérotation continue, TVA au bon taux, mentions obligatoires et format électronique "
   u"attendu en 2026 : la facture est carrée avant de partir.", u"La facture au format 2026"),
  (u"Archivage", 'doc', u"Tout est rangé, tout est retrouvable.",
   u"Chaque facture est archivée avec son devis et son chantier, et exportée pour votre "
   u"comptable. Fini le classeur du mois de janvier.", u"L'archive et l'export comptable"),
 ],
 douleur=u"Refaire vos factures le dimanche n'est plus votre problème.",
 demandees=u"la facture d'acompte qui part le jour de la signature, les situations de travaux "
           u"qui suivent l'avancement, et l'export prêt pour le comptable.",
 missions=[
  (u"Émission des factures", [
   (u"Facture depuis le devis signé", u"Le devis devient facture sans ressaisie : mêmes lignes, mêmes prix, même client."),
   (u"Facture d'acompte", u"Le pourcentage convenu à la commande, facturé le jour de la signature."),
   (u"Situations de travaux", u"Sur les chantiers longs, chaque situation suit l'avancement que vous déclarez, avec le reste à facturer."),
   (u"Facture de solde", u"À la réception du chantier, le solde tient compte de tout ce qui a déjà été facturé."),
   (u"Avoirs et corrections", u"Une erreur, un geste commercial : l'avoir est émis proprement, rattaché à la facture d'origine."),
  ]),
  (u"Conformité &amp; classement", [
   (u"Numérotation continue", u"Une seule série, sans trou ni doublon. C'est la première chose que regarde un contrôle."),
   (u"TVA et mentions obligatoires", u"Taux applicable, autoliquidation, mentions légales : posés automatiquement selon le type de chantier."),
   (u"Format électronique 2026", u"Les factures sont émises au format attendu par la réforme, prêtes à être transmises."),
   (u"Archivage pendant dix ans", u"Chaque facture est conservée avec son devis et son chantier, et retrouvable en deux clics."),
   (u"Export pour votre comptable", u"Un export mensuel propre, dans le format que votre cabinet attend."),
  ]),
 ],
 faq_missions=[
  (u"Est-ce qu'il envoie mes factures sans mon accord ?", u"Non. Il les prépare, vous relisez, vous envoyez. Comme pour les devis."),
  (u"Et la facturation électronique de 2026, je dois faire quoi ?", u"Rien de votre côté : les factures sortent déjà au format attendu. C'est la raison d'être de cet assistant."),
  (u"Est-ce qu'il gère les situations de travaux ?", u"Oui. Vous déclarez l'avancement, il calcule la situation et le reste à facturer."),
  (u"Et si je facture hors Talos, sur un logiciel à moi ?", u"Il reprend votre numérotation là où elle en est, pour ne pas casser la série."),
  (u"Est-ce qu'il relance mes impayés ?", u"Non, il émet et archive. Le recouvrement est le travail de l'assistant trésorerie."),
  (u"Est-ce que mon comptable peut y accéder ?", u"Oui, avec un accès en lecture ou un export mensuel dans son format."),
 ],
 faq_fonctionnement=[
  (u"Comment il sait qu'un devis est signé ?", u"Par la signature en ligne, ou parce que vous le marquez comme signé. La facture d'acompte suit dans la foulée."),
 ] + FAQ_FONCTIONNEMENT,
)


ADMINISTRATIF = dict(
 slug='administratif', pw=411, ph=1400,
 alt="L'assistant administratif de Talos",
 titre=u"Assistant administratif — Talos | Votre boîte mail triée avant votre café",
 desc=u"L'assistant administratif de Talos trie votre boîte mail en six catégories, résume les "
      u"longs échanges, remonte les urgences et classe chaque pièce au bon chantier.",
 role=u"Assistant Emails &amp; Demandes",
 role_bas=u"votre assistant administratif",
 h1=u"Découvrez votre assistant administratif",
 pitch=u"Votre Assistant Administratif trie vos emails, en extrait ce qui compte — un devis à "
       u"faire, une facture fournisseur, une urgence chantier — et ne vous sollicite que "
       u"lorsque votre attention est vraiment nécessaire.",
 caps=[('inbox', u"Trie votre boîte en six catégories"), ('bulle', u"Résume les longs échanges"),
       ('alerte', u"Remonte les urgences"), ('doc', u"Classe les pièces au bon chantier")],
 b2h2=u"De la boîte pleine<br>à la <em>pile du matin</em>.",
 b2lede=u"Deux cents mails par semaine, et trois qui comptent vraiment. Votre assistant fait le "
        u"tri pendant la nuit et vous montre les trois.",
 b2kicker=u"Vous ouvrez votre boîte une fois par jour, pas vingt.",
 parcours=[
  (u"Tri", 'inbox', u"Six catégories, plus une boîte fourre-tout.",
   u"Demande client, facture fournisseur, administratif, chantier, publicité, sans suite : "
   u"chaque mail est rangé dès son arrivée, avec ce qu'il contient.", u"La boîte triée du matin"),
  (u"Résumé", 'bulle', u"Vingt échanges tiennent en trois lignes.",
   u"Un fil qui traîne depuis dix jours est résumé : ce qui a été décidé, ce qui bloque, et ce "
   u"qu'on attend de vous.", u"Le résumé d'un long fil"),
  (u"Urgences", 'alerte', u"Ce qui ne peut pas attendre remonte.",
   u"Un chantier bloqué, une relance de l'assurance, une échéance qui tombe : ces mails-là "
   u"passent devant, avec le motif de l'alerte.", u"L'alerte remontée en haut de pile"),
  (u"Classement", 'doc', u"Chaque pièce à son chantier.",
   u"Facture fournisseur, PV de réception, attestation : le document est détaché, nommé et "
   u"rangé dans le dossier du bon chantier.", u"La pièce classée au bon dossier"),
 ],
 douleur=u"Passer vos soirées dans votre boîte mail n'est plus votre problème.",
 demandees=u"le tri automatique dès la réception, le résumé des fils qui s'éternisent, et le "
           u"classement des factures fournisseurs au bon chantier.",
 missions=[
  (u"Tri de la boîte mail", [
   (u"Tri en six catégories", u"Demande client, facture fournisseur, administratif, chantier, publicité, sans suite. Chaque mail est rangé dès son arrivée."),
   (u"Résumé des longs échanges", u"Un fil de vingt messages tient en trois lignes : ce qui a été décidé, ce qui bloque, ce qu'on attend de vous."),
   (u"Extraction des informations", u"Adresse, dates, montants, références : sorties du corps du mail et posées à côté du dossier."),
   (u"Détection des urgences", u"Un chantier bloqué ou une échéance qui tombe remonte en haut de la pile, avec le motif."),
   (u"Accusé de réception", u"Le client sait que son message est arrivé, même quand vous êtes sur un toit."),
   (u"Mise à l'écart des publicités", u"Les newsletters et démarchages sortent de la boîte principale sans être supprimés."),
  ]),
  (u"Classement &amp; suivi", [
   (u"Classement au bon chantier", u"Chaque mail et chaque pièce jointe rejoint le dossier du chantier concerné."),
   (u"Factures fournisseurs", u"Détachées, nommées, rangées, et prêtes pour le comptable en fin de mois."),
   (u"Pièces du dossier", u"Devis, PV de réception, attestations, plans : rangés au même endroit que le reste du chantier."),
   (u"Rappel des pièces manquantes", u"Une attestation qui manque au dossier vous est signalée avant que ce soit un problème."),
   (u"Recherche dans l'historique", u"« Le mail où le client parlait de la porte de garage » se retrouve en une question."),
  ]),
 ],
 faq_missions=[
  (u"Est-ce qu'il répond à mes mails à ma place ?", u"Il prépare, vous relisez, vous envoyez. Seul l'accusé de réception part automatiquement, et vous en fixez le texte."),
  (u"Est-ce qu'il peut supprimer un mail important par erreur ?", u"Il ne supprime rien. Il range — et tout reste consultable, y compris la catégorie « sans suite »."),
  (u"Comment il sait à quel chantier rattacher un mail ?", u"Par le client, l'adresse, la référence du devis ou le nom du fichier. En cas de doute, il vous demande plutôt que de deviner."),
  (u"Est-ce qu'il lit toute ma boîte mail ?", u"Il traite la boîte que vous lui confiez. Vous pouvez en exclure des expéditeurs ou des dossiers entiers."),
  (u"Et mes mails personnels ?", u"Ils n'ont rien à faire là : on branche votre adresse professionnelle, pas votre boîte privée."),
  (u"Est-ce qu'il prend aussi mes rendez-vous ?", u"Non, il trie et classe. Les réponses aux clients et l'agenda sont le travail de l'assistant client."),
 ],
 faq_fonctionnement=[
  (u"Est-ce que je peux corriger un classement ?", u"Oui, et il le retient. Un dossier déplacé une fois ne se retrouve pas au mauvais endroit la fois suivante."),
 ] + FAQ_FONCTIONNEMENT,
)


ASSISTANTS = [COMMERCIAL, ADMINISTRATIF, FACTURATION, TRESORERIE, CLIENT]


# ═══════════════════════════════════════════════════════════════════════════
#  LA PAGE OFFRES — le hall d'entrée : une carte par assistant
# ═══════════════════════════════════════════════════════════════════════════

# Résumé d'une ligne par assistant, pour la carte du hall.
PROMESSE = {
 'commercial': u"Prépare vos devis depuis un mail, un vocal ou une photo, les fait signer avec "
               u"acompte, puis les relance jusqu'à la réponse.",
 'tresorerie': u"Repère vos factures en retard, relance à votre place, prépare pénalités et mise "
               u"en demeure, et vous dit ce qui va rentrer.",
 'client':     u"Répond à vos clients 24 h/24, qualifie leurs demandes, remplit votre agenda et "
               u"envoie confirmations et rappels.",
 'facturation': u"Transforme chaque devis signé en facture conforme : acomptes, situations, TVA, "
                u"numérotation, format 2026 et archivage.",
 'administratif': u"Trie votre boîte mail, résume les longs échanges, remonte les urgences et "
                  u"classe chaque pièce au bon chantier.",
}
COURT = {'commercial': u"Assistant commercial", 'tresorerie': u"Assistante trésorerie",
         'client': u"Assistante client", 'facturation': u"Assistant facturation",
         'administratif': u"Assistant administratif"}

A_VENIR = []   # les cinq assistants ont leur page


def hub():
    """Le corps de la page Offres — l'équipe présentée en carrousel."""
    tot_m = sum(len(a['missions']) for a in ASSISTANTS) 
    tot_f = sum(sum(len(f) for _, f in a['missions']) for a in ASSISTANTS) 

    return u'''<section class="t-asst">
  <div class="of">
    <div class="shell">

      <div class="of-head">
        <h1>Une équipe <em>sur mesure</em></h1>
        <p>Choisissez les assistants dont vous avez besoin. Ils prennent en charge les
          tâches qui vous prennent du temps, pendant que vous vous concentrez sur vos
          chantiers.</p>
        <ul class="of-stats">
          <li><span class="of-ic" aria-hidden="true">%s</span>
            <span><b>%d</b><small>assistants</small></span></li>
          <li><span class="of-ic" aria-hidden="true">%s</span>
            <span><b>%d</b><small>missions</small></span></li>
          <li><span class="of-ic" aria-hidden="true">%s</span>
            <span><b>%d</b><small>fonctionnalités</small></span></li>
        </ul>
      </div>

%s

      <div class="of-socle">
        <div>
          <b>Le poste de commande est inclus, quel que soit l'assistant</b>
          <span>Priorités du jour, synthèse de ce qui a été fait cette nuit, alertes et vision
            centralisée : client, chantier, devis, facture et échanges au même endroit.
            Vos assistants travaillent, vous ouvrez Talos le matin.</span>
        </div>
        <a class="btn btn-1" href="reserver.html">Réserver une démo %s</a>
      </div>

    </div>
  </div>
</section>
''' % (ICO_EQUIPE, len(ASSISTANTS) + len(A_VENIR),
       ICO_MISSION, tot_m, ICO_FONC, tot_f, crew.bloc(False), FLECHE)
