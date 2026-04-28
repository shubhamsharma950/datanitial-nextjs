import { useEffect, useState } from "react";
import "./WhoWeAreSection.css";

const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.NEXT_PUBLIC_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

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
          <div className="skeleton" style={{ width: "40%", height: 16, marginBottom: 12 }} />
          <div className="skeleton" style={{ width: "60%", height: 36, marginBottom: 12 }} />
          <div className="skeleton" style={{ width: "80%", height: 18 }} />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="wwa-card wwa-card--skeleton">
            <div className="skeleton wwa-card__img-wrap" />
            <div className="wwa-card__body">
              <div className="skeleton" style={{ width: "50%", height: 22, marginBottom: 10 }} />
              <div className="skeleton" style={{ width: "90%", height: 14, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: "80%", height: 14 }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   WHO WE ARE SECTION
   Fetches from /theme/v1/who-we-are (page ID 63)
   ACF fields: who_we_are group + we_are_card group/repeater
═══════════════════════════════════════════════ */
export default function WhoWeAreSection() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${WP_BASE}/theme/v1/who-we-are`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <WhoWeAreSkeleton />;
  if (!data?.cards?.length) return null;

  return (
    <section className="wwa" aria-label="Who We Are">
      <div className="wwa__inner">

        {/* ── Section header ── */}
        {(data.section_title || data.section_desc) && (
          <div className="wwa__header">
            {data.section_title && (
              <h2 className="wwa__title">{data.section_title}</h2>
            )}
            {data.section_desc && (
              <p className="wwa__desc">{data.section_desc}</p>
            )}
          </div>
        )}

        {/* ── Cards ── */}
        <div className="wwa__cards">
          {data.cards.map((card, i) => (
            <article key={i} className="wwa-card">

              {/* Image */}
              <div className="wwa-card__img-wrap">
                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.image_alt || card.title}
                    className="wwa-card__img"
                    loading="lazy"
                  />
                ) : (
                  <div className="wwa-card__img-placeholder" aria-hidden="true" />
                )}
              </div>

              {/* Body */}
              <div className="wwa-card__body">
                {card.title && (
                  <h3 className="wwa-card__title">{card.title}</h3>
                )}
                {card.description && (
                  <p className="wwa-card__desc">{card.description}</p>
                )}
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

      </div>
    </section>
  );
}
