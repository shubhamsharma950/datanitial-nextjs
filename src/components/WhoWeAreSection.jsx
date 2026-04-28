import { useEffect, useState } from "react";
import "./WhoWeAreSection.css";

const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.NEXT_PUBLIC_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

const HOME_PAGE_ID = 63;

/* ── Check icon ── */
const CheckIcon = () => (
  <svg className="wwa-card__check" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <circle cx="10" cy="10" r="10" />
    <path fill="none" d="M6 10l3 3 5-5" stroke="#fff" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Skeleton ── */
function WhoWeAreSkeleton() {
  return (
    <section className="wwa">
      <div className="wwa__inner">
        <div className="wwa__header">
          <div className="skeleton" style={{ width: "60%", height: 36, margin: "0 auto 12px" }} />
          <div className="skeleton" style={{ width: "80%", height: 18, margin: "0 auto" }} />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="wwa-card wwa-card--skeleton">
            <div className="skeleton wwa-card__img-wrap" />
            <div className="wwa-card__body">
              <div className="skeleton" style={{ width: "50%", height: 22, marginBottom: 10 }} />
              <div className="skeleton" style={{ width: "90%", height: 14, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: "70%", height: 14 }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Parse a card row from ACF ── */
function parseCard(row) {
  // card_image: ACF Image field returns object { url, alt, ... } or attachment ID
  let image_url = "";
  let image_alt = "";

  if (row.card_image && typeof row.card_image === "object") {
    image_url = row.card_image.url  || row.card_image.sizes?.large || "";
    image_alt = row.card_image.alt  || "";
  } else if (typeof row.card_image === "string" && row.card_image.startsWith("http")) {
    image_url = row.card_image;
  }

  // card_checkbox: textarea — split by newline into bullet array
  const bullets = row.card_checkbox
    ? row.card_checkbox.split("\n").map(b => b.trim()).filter(Boolean)
    : [];

  return {
    image:       image_url,
    image_alt:   image_alt || row.card_title || "",
    title:       row.card_title || "",
    description: row.card_dis   || "",
    bullets,
  };
}

/* ═══════════════════════════════════════════════
   WHO WE ARE SECTION
   ACF Field Group: group_69f06b52863c0
   Page ID: 63 (Home)

   Data flow:
   1. Try /theme/v1/who-we-are  (custom endpoint)
   2. Fallback: /wp/v2/pages/63?_fields=acf  (native WP REST)
   Both read: who_we_are.chose_us_, who_we_are.we_are_dis,
              we_are_card[].card_image, card_title, card_dis, card_checkbox
═══════════════════════════════════════════════ */
export default function WhoWeAreSection() {
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionDesc,  setSectionDesc]  = useState("");
  const [cards,        setCards]        = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    // Try custom endpoint first (needs updated functions.php on Hostinger)
    fetch(`${WP_BASE}/theme/v1/who-we-are`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        if (data.section_title) setSectionTitle(data.section_title);
        if (data.section_desc)  setSectionDesc(data.section_desc);
        if (Array.isArray(data.cards) && data.cards.length) setCards(data.cards);
      })
      .catch(() => {
        // Fallback: read ACF directly from native WP REST API
        fetch(`${WP_BASE}/wp/v2/pages/${HOME_PAGE_ID}?_fields=acf`)
          .then(r => r.json())
          .then(data => {
            const acf = data?.acf;
            if (!acf || typeof acf !== "object" || Array.isArray(acf)) return;
            const whoGroup = acf.who_we_are;
            if (whoGroup) {
              if (whoGroup.chose_us_)  setSectionTitle(whoGroup.chose_us_);
              if (whoGroup.we_are_dis) setSectionDesc(whoGroup.we_are_dis);
            }
            const cardData = acf.we_are_card;
            if (Array.isArray(cardData) && cardData.length) {
              setCards(cardData.map(parseCard));
            } else if (cardData && typeof cardData === "object") {
              const parsed = parseCard(cardData);
              if (parsed.title || parsed.image) setCards([parsed]);
            }
          })
          .catch(() => {});
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <WhoWeAreSkeleton />;

  // Only hide if truly no data AND not loading
  if (!sectionTitle && !sectionDesc && cards.length === 0) {
    return (
      <section className="wwa" aria-label="Who We Are">
        <div className="wwa__inner">
          <div className="wwa__header">
            <p style={{ color: "#aaa", textAlign: "center", padding: "40px 0" }}>
              Add content in WordPress → Pages → Home → ACF fields
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="wwa" aria-label="Who We Are">
      <div className="wwa__inner">

        {/* ── Section header ── */}
        {(sectionTitle || sectionDesc) && (
          <div className="wwa__header">
            {sectionTitle && <h2 className="wwa__title">{sectionTitle}</h2>}
            {sectionDesc  && <p  className="wwa__desc">{sectionDesc}</p>}
          </div>
        )}

        {/* ── Cards ── */}
        {cards.length > 0 && (
          <div className="wwa__cards">
            {cards.map((card, i) => (
              <article key={i} className="wwa-card" aria-label={card.title}>

                {/* Image */}
                <div className="wwa-card__img-wrap">
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={card.image_alt}
                      className="wwa-card__img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="wwa-card__img-placeholder" aria-hidden="true">
                      <svg viewBox="0 0 80 60" fill="none">
                        <rect width="80" height="60" rx="8" fill="#0d1b4b" />
                        <circle cx="20" cy="20" r="10" fill="#1a3a8f" opacity=".8" />
                        <circle cx="55" cy="35" r="14" fill="#1e4db7" opacity=".5" />
                        <rect x="8" y="44" width="64" height="3" rx="2" fill="#2563eb" opacity=".4" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="wwa-card__body">
                  {card.title       && <h3 className="wwa-card__title">{card.title}</h3>}
                  {card.description && <p  className="wwa-card__desc">{card.description}</p>}
                  {card.bullets?.length > 0 && (
                    <ul className="wwa-card__bullets">
                      {card.bullets.map((b, bi) => (
                        <li key={bi} className="wwa-card__bullet">
                          <CheckIcon />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

              </article>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
