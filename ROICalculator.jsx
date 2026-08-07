'use client'; // interactif (useState) — nécessaire si utilisé dans un App Router Next.js

import { useMemo, useState } from 'react';
import { Clock, TrendingUp, Wallet, ArrowRight } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Formateurs — Intl gère les espaces insécables et la devise
   correctement en français ("6 000 €", pas "6000€").
   ───────────────────────────────────────────────────────────── */
const fmtEUR = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});
const fmtHeures = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

/* ─────────────────────────────────────────────────────────────
   Palette — tokens Talos « Onyx Bronze » (talos-site/v2.css).
   En dur ici pour que le composant soit autonome (aucune
   dépendance à une config Tailwind ou à des variables CSS
   externes). Si le projet expose déjà ces tokens via
   tailwind.config, remplace simplement ces hex par tes classes
   sémantiques (bg-ink, text-parch, bg-bronze, etc.).
   ───────────────────────────────────────────────────────────── */
const INK      = '#140F0C'; // fond de section
const INK_2    = '#1C1611'; // cartes
const GRAPHITE = '#352A20'; // piste de slider (portion non remplie)
const PARCH    = '#F6EEE7'; // texte principal
const LINE     = 'rgba(246,238,231,.08)';
const BRONZE   = '#E0631F';
const BRONZE_2 = '#9A3F12';

/* ─────────────────────────────────────────────────────────────
   Slider réutilisable — étiquette + valeur courante + piste
   remplie dynamiquement (dégradé calculé sur le pourcentage).
   Le thumb custom (rond blanc cerclé de bronze) est stylé via
   les variants arbitraires ::-webkit-slider-thumb / -moz-.
   ───────────────────────────────────────────────────────────── */
function ROISlider({ id, label, icon: Icon, value, onChange, min, max, step, formatValue }) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <label htmlFor={id} className="mb-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-white/75">
          <Icon size={16} className="shrink-0 text-[--bronze]" style={{ color: BRONZE }} aria-hidden="true" />
          {label}
        </span>
        <span className="font-mono text-sm font-bold tabular-nums" style={{ color: PARCH }}>
          {formatValue(value)}
        </span>
      </label>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={formatValue(value)}
        className="h-2 w-full cursor-pointer appearance-none rounded-full accent-[#E0631F]
          [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2
          [&::-webkit-slider-thumb]:border-[#E0631F] [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
          [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:appearance-none
          [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2
          [&::-moz-range-thumb]:border-[#E0631F] [&::-moz-range-thumb]:bg-white
          [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${BRONZE} ${pct}%, ${GRAPHITE} ${pct}%)`,
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Carte résultat standard (temps récupéré / chantiers en plus).
   ───────────────────────────────────────────────────────────── */
function ResultCard({ icon: Icon, value, label, sub }) {
  return (
    <div
      className="rounded-2xl border p-6"
      style={{ background: INK_2, borderColor: LINE }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: 'rgba(224,99,31,.12)', border: '1px solid rgba(224,99,31,.28)' }}
        >
          <Icon size={18} style={{ color: BRONZE }} aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold text-white/70">{label}</span>
      </div>
      <div className="text-3xl font-extrabold tracking-tight" style={{ color: PARCH }}>
        {value}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-white/55">{sub}</p>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═════════════════════════════════════════════════════════════ */
export default function ROICalculator() {
  const [devisParMois, setDevisParMois] = useState(15);   // V — 1 à 50
  const [montantMoyen, setMontantMoyen] = useState(3000); // P — 500 à 20 000, pas 500

  const { tempsRecupere, chantiersSupp, caAdditionnel } = useMemo(() => {
    const chantiers = Math.round(devisParMois * 0.15);
    return {
      tempsRecupere: devisParMois * 1.5,
      chantiersSupp: chantiers,
      caAdditionnel: chantiers * montantMoyen,
    };
  }, [devisParMois, montantMoyen]);

  // Garde-fou UX : sous ~4 devis/mois, chantiersSupp arrondit à 0 et le CTA
  // afficherait « récupérer ces 0 € » — on bascule alors sur un message
  // qui reste vrai (le gain de temps, lui, n'est jamais nul).
  const ctaLabel =
    chantiersSupp > 0
      ? `Voir comment récupérer ces ${fmtEUR.format(caAdditionnel)} (Démo 15 min) →`
      : `Voir comment gagner ${fmtHeures.format(tempsRecupere)} h dès ce mois-ci (Démo 15 min) →`;

  return (
    <section className="px-6 py-24" style={{ background: INK }}>
      <div className="mx-auto max-w-6xl">

        {/* ── en-tête ── */}
        <div className="mb-14 max-w-2xl">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ borderColor: 'rgba(246,238,231,.15)', color: '#AB9F95' }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: BRONZE }} />
            Calculez votre gain
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: PARCH }}>
            Ce que Talos change dans <em className="not-italic" style={{ color: BRONZE }}>votre chiffre d'affaires.</em>
          </h2>
          <p className="mt-4 text-lg text-white/60">
            Ajustez les deux curseurs selon votre activité réelle — les résultats se mettent à jour instantanément.
          </p>
        </div>

        {/* ── grille : curseurs | résultats ── */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">

          {/* COLONNE GAUCHE — curseurs */}
          <div
            className="rounded-2xl border p-8 sm:p-10"
            style={{ background: INK_2, borderColor: LINE }}
          >
            <div className="flex flex-col gap-10">
              <ROISlider
                id="devisParMois"
                label="Devis par mois"
                icon={TrendingUp}
                value={devisParMois}
                onChange={setDevisParMois}
                min={1}
                max={50}
                step={1}
                formatValue={(v) => `${v} devis`}
              />
              <ROISlider
                id="montantMoyen"
                label="Montant moyen d'un chantier"
                icon={Wallet}
                value={montantMoyen}
                onChange={setMontantMoyen}
                min={500}
                max={20000}
                step={500}
                formatValue={(v) => fmtEUR.format(v)}
              />
            </div>
          </div>

          {/* COLONNE DROITE — résultats */}
          <div className="flex flex-col gap-5">
            <ResultCard
              icon={Clock}
              value={`${fmtHeures.format(tempsRecupere)} h / mois`}
              label="Temps récupéré"
              sub="Fini les soirées sur l'ordinateur et les week-ends sacrifiés."
            />
            <ResultCard
              icon={TrendingUp}
              value={`+${chantiersSupp} chantier${chantiersSupp > 1 ? 's' : ''}`}
              label="Chantiers supplémentaires signés"
              sub="En répondant dans l'heure, vous devancez vos concurrents."
            />

            {/* Carte 3 — le point culminant, doit « crever l'écran » */}
            <div
              className="rounded-2xl p-8 text-white shadow-2xl"
              style={{ background: `linear-gradient(150deg, ${BRONZE_2}, ${BRONZE})` }}
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                  <Wallet size={18} aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-white/85">
                  Chiffre d'affaires additionnel / mois
                </span>
              </div>
              <div className="text-5xl font-extrabold tracking-tight tabular-nums">
                {fmtEUR.format(caAdditionnel)}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/85">
                Rentabilisez Talos dès votre premier chantier signé.
              </p>
            </div>
          </div>
        </div>

        {/* ── CTA final — libellé dynamique ── */}
        <div className="mt-12 flex justify-center">
          <a
            href="/reserver" // à adapter : route/ancre de prise de RDV
            className="inline-flex min-h-[54px] items-center gap-2 rounded-full px-8 text-base font-bold text-white transition-transform hover:-translate-y-0.5"
            style={{ background: BRONZE }}
          >
            {ctaLabel}
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>

      </div>
    </section>
  );
}
