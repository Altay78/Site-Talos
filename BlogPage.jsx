"use client";

import { useMemo, useState } from "react";
import { Search, Clock, ArrowRight, Sparkles, Mail } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Mock data — structure prête pour un CMS (Supabase, MDX, Notion…)           */
/* -------------------------------------------------------------------------- */

const CATEGORIES = [
  "Tous",
  "Guides Pratiques",
  "Cas d'Usage",
  "Productivité TPE",
  "Automatisations",
];

const FEATURED_POST = {
  slug: "audit-2h-par-semaine",
  title: "Les 7 tâches que toute TPE peut arrêter de faire à la main dès demain",
  excerpt:
    "Relances de devis, saisie comptable, prise de rendez-vous, reporting… Nous avons chronométré ces tâches chez 12 artisans et commerçants. Voici où partent réellement vos heures, et lesquelles se récupèrent en une après-midi de paramétrage.",
  category: "Guides Pratiques",
  readingTime: "9 min",
  date: "2 août 2026",
  author: { name: "Altay Sakalli", role: "Fondateur, Talos" },
  cover:
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80",
};

const POSTS = [
  {
    slug: "relance-devis-sans-deranger",
    title: "Comment automatiser la relance des devis sans déranger ses clients",
    excerpt:
      "Une séquence de trois messages, espacés intelligemment, qui double le taux de signature sans jamais donner l'impression de harceler.",
    category: "Automatisations",
    readingTime: "6 min",
    date: "28 juillet 2026",
    author: "Altay Sakalli",
    cover:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "plombier-12h-par-mois",
    title: "Un plombier de Lyon a récupéré 12 h par mois. Voici son workflow",
    excerpt:
      "Devis, planning, factures et relances : le détail exact des quatre automatisations en place, et ce qu'elles lui coûtent chaque mois.",
    category: "Cas d'Usage",
    readingTime: "8 min",
    date: "21 juillet 2026",
    author: "Alice Rousseau",
    cover:
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "boite-mail-zero",
    title: "Traiter sa boîte mail en 20 minutes par jour, sans méthode complexe",
    excerpt:
      "Trois règles de tri, un tri automatique des pièces jointes, et une réponse type qui couvre 40 % des messages entrants.",
    category: "Productivité TPE",
    readingTime: "5 min",
    date: "15 juillet 2026",
    author: "Altay Sakalli",
    cover:
      "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "choisir-premiere-automatisation",
    title: "Quelle tâche automatiser en premier ? La règle des 3 critères",
    excerpt:
      "Fréquence, durée, agacement. Un tableau simple pour classer vos tâches et ne pas commencer par la mauvaise.",
    category: "Guides Pratiques",
    readingTime: "7 min",
    date: "9 juillet 2026",
    author: "Alice Rousseau",
    cover:
      "https://images.unsplash.com/photo-1454165833762-3b8b0f4b5d0f?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "facturation-recurrente",
    title: "Facturation récurrente : arrêter de la refaire tous les 1ers du mois",
    excerpt:
      "Génération, envoi, relance d'impayés et pointage bancaire, enchaînés automatiquement à partir de votre outil actuel.",
    category: "Automatisations",
    readingTime: "6 min",
    date: "1 juillet 2026",
    author: "Altay Sakalli",
    cover:
      "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "restauratrice-reservations",
    title: "Une restauratrice a divisé ses no-shows par trois avec deux SMS",
    excerpt:
      "Confirmation à J-1, rappel à H-3, et une liste d'attente qui se remplit toute seule dès qu'une table se libère.",
    category: "Cas d'Usage",
    readingTime: "5 min",
    date: "24 juin 2026",
    author: "Alice Rousseau",
    cover:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
  },
];

/* -------------------------------------------------------------------------- */
/*  Sous-composants                                                            */
/* -------------------------------------------------------------------------- */

function CategoryPill({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap",
        "transition-all duration-200 ring-1",
        active
          ? "bg-slate-900 text-white ring-slate-900 shadow-sm"
          : "bg-white/70 text-slate-600 ring-slate-200 hover:text-slate-900 hover:ring-slate-300",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function Meta({ category, readingTime }) {
  return (
    <div className="flex items-center gap-3 text-xs font-medium tracking-wide">
      <span className="text-[#C5531C]">{category}</span>
      <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden="true" />
      <span className="inline-flex items-center gap-1.5 text-slate-500">
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
        {readingTime}
      </span>
    </div>
  );
}

function FeaturedCard({ post }) {
  return (
    <article className="group overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-slate-900/5">
      <div className="grid gap-0 lg:grid-cols-2">
        <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:h-full">
          <img
            src={post.cover}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            loading="eager"
          />
          <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-[#C5531C]" aria-hidden="true" />
            À la une
          </span>
        </div>

        <div className="flex flex-col justify-center gap-5 p-7 sm:p-10 lg:p-12">
          <Meta category={post.category} readingTime={post.readingTime} />

          <h2 className="text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-[2rem]">
            {post.title}
          </h2>

          <p className="text-base leading-relaxed text-slate-600">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="text-sm">
              <p className="font-medium text-slate-900">{post.author.name}</p>
              <p className="text-slate-500">
                {post.author.role} · {post.date}
              </p>
            </div>

            <a
              href={`/blog/${post.slug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#C5531C] transition-colors hover:text-[#A8451A]"
            >
              Lire l'article
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

function PostCard({ post }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5">
      <a href={`/blog/${post.slug}`} className="flex h-full flex-col">
        <div className="aspect-[16/10] overflow-hidden bg-slate-100">
          <img
            src={post.cover}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </div>

        <div className="flex flex-1 flex-col gap-3 p-6">
          <Meta category={post.category} readingTime={post.readingTime} />

          <h3 className="text-lg font-semibold leading-snug tracking-tight text-slate-900">
            {post.title}
          </h3>

          <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
            {post.excerpt}
          </p>

          <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-slate-500">
            <span className="font-medium text-slate-700">{post.author}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden="true" />
            <time>{post.date}</time>
          </div>
        </div>
      </a>
    </article>
  );
}

function LeadMagnet() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    if (!email) return;
    // TODO : brancher sur l'endpoint newsletter / Supabase
    setSent(true);
  }

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#FDF6F1] to-[#FAE9DC] px-7 py-12 ring-1 ring-slate-200/70 sm:px-12 sm:py-16">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#F4823E]/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#C5531C] ring-1 ring-[#C5531C]/15">
          <Mail className="h-3.5 w-3.5" aria-hidden="true" />
          Guide gratuit
        </span>

        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Combien d'heures pouvez-vous automatiser ce mois-ci&nbsp;?
        </h2>

        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Le guide des 12 automatisations les plus rentables pour une TPE, avec
          le temps récupéré et le coût réel de chacune. Un e-mail, rien d'autre.
        </p>

        {sent ? (
          <p className="mt-8 text-sm font-medium text-slate-900">
            C'est envoyé — vérifiez votre boîte de réception.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="lead-email" className="sr-only">
              Adresse e-mail
            </label>
            <input
              id="lead-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="vous@entreprise.fr"
              className="w-full flex-1 rounded-xl border-0 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200 transition focus:outline-none focus:ring-2 focus:ring-[#C5531C]/40"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#C5531C] focus:outline-none focus:ring-2 focus:ring-[#C5531C]/40 focus:ring-offset-2"
            >
              Recevoir le guide
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        )}

        <p className="mt-4 text-xs text-slate-500">
          Pas de spam. Désinscription en un clic.
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function BlogPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tous");

  const filteredPosts = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return POSTS.filter((post) => {
      const matchesCategory = category === "Tous" || post.category === category;
      const matchesQuery =
        !needle ||
        post.title.toLowerCase().includes(needle) ||
        post.excerpt.toLowerCase().includes(needle);

      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  const showFeatured = category === "Tous" && !query.trim();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      {/* Hero ------------------------------------------------------------- */}
      <section className="border-b border-slate-200/70 bg-white">
        <div className="mx-auto max-w-6xl px-6 pb-14 pt-20 sm:pb-16 sm:pt-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium tracking-wide text-[#C5531C]">
              Le blog Talos
            </p>

            <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Reprenez les heures que
              <br className="hidden sm:block" /> votre métier vous prend.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              Des guides concrets, des cas réels et des workflows prêts à copier,
              pour automatiser ce qui vous ralentit — sans devenir informaticien.
            </p>
          </div>

          {/* Recherche */}
          <div className="mx-auto mt-10 max-w-xl">
            <label htmlFor="blog-search" className="sr-only">
              Rechercher un article
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="blog-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un article, un outil, un métier…"
                className="w-full rounded-full border-0 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200 transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C5531C]/40"
              />
            </div>
          </div>

          {/* Filtres */}
          <div className="mt-6 flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:justify-center sm:overflow-visible">
            {CATEGORIES.map((item) => (
              <CategoryPill
                key={item}
                label={item}
                active={category === item}
                onClick={() => setCategory(item)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contenu ---------------------------------------------------------- */}
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20 lg:px-8">
        {showFeatured && (
          <div className="mb-16 sm:mb-20">
            <FeaturedCard post={FEATURED_POST} />
          </div>
        )}

        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            {showFeatured ? "Derniers articles" : "Résultats"}
          </h2>
          <p className="text-sm text-slate-500">
            {filteredPosts.length} article{filteredPosts.length > 1 ? "s" : ""}
          </p>
        </div>

        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-slate-200/70">
            <p className="text-base font-medium text-slate-900">
              Aucun article ne correspond à cette recherche.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Essayez un autre mot-clé ou revenez à toutes les catégories.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("Tous");
              }}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#C5531C] transition-colors hover:text-[#A8451A]"
            >
              Réinitialiser les filtres
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="mt-16 sm:mt-20">
          <LeadMagnet />
        </div>
      </div>
    </main>
  );
}
