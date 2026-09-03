# Talos — Logo

Marteau-T + éclair, **sans toit**. Texte **vectorisé en tracés** — aucune dépendance
à une police installée.

Slogan : **AU SERVICE DE VOTRE TEMPS**

## Le symbole
Un T qui est aussi une tête de marteau à griffe, traversé par un éclair.
Une **respiration constante de 16 unités** sépare le T de l'éclair qui passe derrière :
c'est ce qui les fait lire comme un seul objet découpé, et ce qui rend les versions
monochromes lisibles.

## Fichiers

### Logo complet + slogan — horizontal (877 × 300)
| Fichier | Fond |
|---|---|
| `lockup-slogan-braise-clair.svg` | crème `#FBF6F2` — **version principale** |
| `lockup-slogan-braise-sombre.svg` | noir `#161316` |
| `lockup-slogan-original.svg` | transparent, or `#C68A4E` + noir `#1A1A1A` |

### Logo complet + slogan — vertical (620 × 561)
`lockup-vertical-clair.svg` · `lockup-vertical-sombre.svg` · `lockup-vertical-original.svg`

### Logo sans slogan — horizontal (877 × 300)
`lockup-braise-clair.svg` · `lockup-braise-sombre.svg` · `lockup-original.svg`
`lockup-mono-noir.svg` · `lockup-mono-blanc.svg`

### Mark seul (viewBox `253 302 472 550`)
`mark-braise-clair.svg` · `mark-braise-sombre.svg` · `mark-original.svg`
`mark-mono-noir.svg` · `mark-mono-blanc.svg` · `mark-mono-orange.svg` — aplats une couleur
(tampon, gravure, sérigraphie)

### Usages
| Fichier | Usage |
|---|---|
| `avatar-1080.svg` / `.png` | profil réseaux, glow ember |
| `banniere-1600x600.svg` / `.png` | bannière, image OG |
| `favicon.svg` | favicon 64 px, coins arrondis |
| `board.html` | planche de présentation complète |

## Détail de calage
Dans les lockups horizontaux, le mark n'est **pas** centré sur son encre réelle mais sur une
boîte optique s'arrêtant à `y = 770` (`OPT_BOTTOM` dans `gen.py`). La queue de l'éclair est
fine : la compter dans le centrage faisait pendre le mark trop bas. Avec ce réglage, le haut
du T s'aligne sur la hauteur de capitale de « TALOS ».

## Palette
`#161316` noir · `#1E1A18` surface · `#453027` brun · `#C75C24` orange braise ·
`#E07E45` orange clair · `#C68A4E` or d'origine · `#F6EEE7` blanc chaud · `#BABABA` gris

## Typo
Helvetica Neue Bold pour « TALOS », Regular pour le slogan — convertis en tracés.
Le slogan est calé à la largeur exacte de « TALOS » (interlettrage calculé, pas à l'œil).

## Régénérer
```
python3 gen.py     # tous les SVG
python3 topng.py   # les PNG (Chrome headless, dimensions exactes)
```
Constantes en haut de `gen.py` : `T_PATH`, `BOLT`, `GAP`, `TAGLINE`, `OPT_BOTTOM`.
`textpath.py` convertit le texte en tracés (nécessite `fonttools`).

## Autres dossiers
- `archive-v1/` — version avec toit en chevron plein
- `explo/` — pistes écartées : manche fusionné en zigzag, toit dissous en données,
  segments réguliers, circuit, chevrons de diffusion, point d'agent, demi-hexagone
