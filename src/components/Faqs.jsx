import { useEffect, useState } from "react";
import "./FaqSection.css";

const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.NEXT_PUBLIC_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

const PRIMARY_URL  = `${WP_BASE}/theme/v1/get-to-know-us`;
const FALLBACK_URL = `${WP_BASE}/wp/v2/pages/63?_fields=acf`;

/* ── Fallback ── */
const FALLBACK = {
  title:       "Unlock the power of data with Datanitial",
  description: "We are one of the world's Top 3 web data scraping firms, delivering specialized data collection and analysis solutions to clients ranging from startups to Fortune 500 corporations.",
  cards: [
    { number: "01", title: "Data Protection",           description: "Ensure your data is securely handled with strict protocols, encryption, and compliance standards at every stage.", image: "" },
    { number: "02", title: "Data Loss Prevention",      description: "Prevent data leaks and loss with continuous monitoring, controlled access, and automated safeguards.", image: "" },
    { number: "03", title: "Data Extraction Scalability", description: "Scale data extraction effortlessly to handle millions of records across multiple sources without performance drops.", image: "" },
    { number: "04", title: "Data Quality",              description: "Deliver accurate, clean, and structured data through advanced validation and quality checks.", image: "" },
  ],
};

/* ── Parse from native ACF ── */
async function parseFromAcf(acf) {
  const ku  = acf?.know_us;
  if (!ku) return FALLBACK;
  const kuc = ku.know_us_card || {};
  const cards = [];
  for (let i = 1; i <= 4; i++) {
    const c = kuc[`card_${i}`];
    if (!c) continue;
    let imgUrl = "";
    if (c.card_img && typeof c.card_img === "number") {
      try {
        const r = await fetch(`${WP_BASE}/wp/v2/media/${c.card_img}?_fields=source_url`);
        const d = await r.json();
        imgUrl = d.source_url || "";
      } catch { imgUrl = ""; }
    } else if (c.card_img?.url) {
      imgUrl = c.card_img.url;
    }
    cards.push({
      number:      String(i).padStart(2, "0"),
      title:       c.card_title || "",
      description: c.card_dis   || "",
      image:       imgUrl,
    });
  }
  return {
    title:       ku.title       || FALLBACK.title,
    description: ku.discerption || FALLBACK.description,
    cards:       cards.length   ? cards : FALLBACK.cards,
  };
}

/* ── Star icon ── */
const StarIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="gtku-badge__icon">
    <circle cx="10" cy="10" r="10" fill="#2E3192" />
    <g stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
      <line x1="10" y1="5.2" x2="10" y2="14.8" />
      <line x1="6.8" y1="7"  x2="13.2" y2="13" />
      <line x1="13.2" y1="7" x2="6.8"  y2="13" />
    </g>
  </svg>
);

/* ── Skeleton ── */
function Skeleton() {
  return (
    <section className="gtku">
      <div className="container">
        <div className="gtku__layout">
          <div className="gtku__left">
            <div className="skeleton" style={{ width: 120, height: 28, borderRadius: 999, marginBottom: 20 }} />
            <div className="skeleton" style={{ width: "90%", height: 36, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: "80%", height: 18 }} />
          </div>
          <div className="gtku__right">
            {[1,2,3,4].map(i => (
              <div key={i} className="gtku-card gtku-card--skeleton">
                <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 8 }} />
                <div className="skeleton" style={{ width: "60%", height: 24, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: "100%", height: 200, borderRadius: 12 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   GET TO KNOW US
   Layout:
     Left  — STICKY: badge + title + description
     Right — SCROLLS: numbered cards (01-04)
               each: number + title + desc + image
   Scroll behavior: left stays fixed while right
   scrolls through all cards
═══════════════════════════════════════════════ */
export default function FaqSection() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(PRIMARY_URL)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(d => setData(d))
      .catch(() => {
        fetch(FALLBACK_URL)
          .then(r => r.json())
          .then(async d => setData(await parseFromAcf(d?.acf)))
          .catch(() => setData(FALLBACK));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;

  const { title, description, cards } = data || FALLBACK;

  return (
    <section className="gtku" aria-label="Get To Know Us">
      <div className="container">
        <div className="gtku__layout">

          {/* ── LEFT — sticky badge + title + desc ── */}
          <div className="gtku__left">
            <div className="badge-sec-getknow">
              <StarIcon />
              <span>faqS0</span>
            </div>
            <h2 className="gtku__title">{title}</h2>
            <p  className="gtku__desc">{description}</p>
          </div>

          {/* ── RIGHT — scrolling cards with vertical timeline ── */}
          <div className="gtku__right">
            {/* Vertical line */}
            <div className="gtku__timeline" aria-hidden="true" />

            {cards.map((card, i) => (
              <article key={i} className="gtku-card">

                {/* Number + title row */}
                <div className="gtku-card__header">
                  <span className="gtku-card__num">{card.number}</span>
                  <h3 className="gtku-card__title">{card.title}</h3>
                </div>

                {/* Description */}
                {card.description && (
                  <p className="gtku-card__desc">{card.description}</p>
                )}

                {/* Image */}
                {card.image ? (
                  <div className="gtku-card__img-wrap">
                    {/* <img
                      src={card.image}
                      alt={card.title}
                      className="gtku-card__img"
                      loading="lazy"
                    /> */}
                    <img
                      src={card.image}
                      alt={card.title}
                      className="gtku-card__img"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="gtku-card__img-wrap gtku-card__img-placeholder" aria-hidden="true">
                    <svg viewBox="0 0 480 240" fill="none">
                      <rect width="480" height="240" rx="12" fill="#1a2a5e" />
                      <circle cx="100" cy="100" r="50" fill="#2b3d8e" opacity=".7" />
                      <circle cx="300" cy="130" r="70" fill="#3a4fcf" opacity=".4" />
                      <rect x="40" y="180" width="400" height="3" rx="2" fill="#4a5fd0" opacity=".3" />
                    </svg>
                  </div>
                )}

              </article>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
