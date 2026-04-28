import { useEffect, useRef, useState } from "react";
import "./WhoWeAreSection.css";

const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.NEXT_PUBLIC_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

// Fetch ACF directly from native WP REST API — no custom endpoint needed
const ACF_URL = `${WP_BASE}/wp/v2/pages/63?_fields=acf`;

/* ── Check icon ── */
const CheckIcon = () => (
  <svg className="wwa-card__check" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <circle cx="10" cy="10" r="10" />
    <path fill="none" d="M6 10l3 3 5-5" stroke="#fff" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const StarIcon = () => (
<svg  className="wwa-card__check"  viewBox="0 0 20 20"  fill="currentColor"  aria-hidden="true">   <circle cx="10" cy="10" r="10" fill="#2E3192" /> <g    stroke="#ffffff"    strokeWidth="1.8"    strokeLinecap="round"  > <line x1="10" y1="5.2" x2="10" y2="14.8" /> <line x1="6.8" y1="7" x2="13.2" y2="13" /><line x1="13.2" y1="7" x2="6.8" y2="13" />  </g></svg>
);

/* ── Skeleton ── */
function WhoWeAreSkeleton() {
  return (
    <section className="wwa">
      <div className="container">
        <div className="wwa__header">
          <div className="skeleton" style={{ width: "60%", height: 36, margin: "0 auto 12px" }} />
          <div className="skeleton" style={{ width: "80%", height: 18, margin: "0 auto" }} />
        </div>
        <div className="wwa__cards">
          {[1, 2, 3].map((i) => (
            <div key={i} className="wwa-card wwa-card--skeleton">
              <div className="skeleton wwa-card__img-wrap" />
              <div className="wwa-card__body">
                <div className="skeleton" style={{ width: "60%", height: 20, marginBottom: 10 }} />
                <div className="skeleton" style={{ width: "90%", height: 14, marginBottom: 6 }} />
                <div className="skeleton" style={{ width: "70%", height: 14 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Resolve image URL from ACF image field (ID or object) ── */
async function resolveImage(val) {
  if (!val) return { url: "", alt: "" };

  // Already an object with url
  if (typeof val === "object" && val.url) {
    return { url: val.url, alt: val.alt || "" };
  }

  // Numeric ID — fetch from WP media endpoint
  if (typeof val === "number" || (typeof val === "string" && /^\d+$/.test(val))) {
    try {
      const r = await fetch(`${WP_BASE}/wp/v2/media/${val}?_fields=source_url,alt_text`);
      const d = await r.json();
      return { url: d.source_url || "", alt: d.alt_text || "" };
    } catch {
      return { url: "", alt: "" };
    }
  }

  // String URL
  if (typeof val === "string") return { url: val, alt: "" };
  return { url: "", alt: "" };
}

/* ═══════════════════════════════════════════════
   WHO WE ARE SECTION
   Reads ACF from /wp/v2/pages/63?_fields=acf
   Field group: group_69f06b52863c0
═══════════════════════════════════════════════ */
export default function WhoWeAreSection() {
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionDesc,  setSectionDesc]  = useState("");
  const [cards,        setCards]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const cardRefs                        = useRef([]);

  /* ── Scroll reveal via IntersectionObserver ── */
  useEffect(() => {
    if (loading || cards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); // animate once
          }
        });
      },
      { threshold: 0.15 }
    );

    cardRefs.current.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [loading, cards]);

  useEffect(() => {
    fetch(ACF_URL)
      .then(r => r.json())
      .then(async (data) => {
        const acf = data?.acf;
        if (!acf || typeof acf !== "object") return;

        // ── Section title & description ──
        const who = acf.who_we_are;
        if (who) {
          setSectionTitle(who.chose_us_  || "");
          setSectionDesc(who.we_are_dis  || "");
        }

        // ── Cards ──
        const cg = acf.we_are_card;
        if (!cg || typeof cg !== "object") return;

        const imgGroup    = cg.we_are_card_image  || {};
        const titleGroup  = cg.we_are_card_title  || {};
        const disGroup    = cg.we_are_card_dis     || {};
        const bulletGroup = cg.card_bullet_point   || {};

        // Resolve all 3 images in parallel
        const [img1, img2, img3] = await Promise.all([
          resolveImage(imgGroup.image1),
          resolveImage(imgGroup.image2),
          resolveImage(imgGroup.image3),
        ]);
        const images = [img1, img2, img3];

        const built = [];
        for (let i = 1; i <= 3; i++) {
          const img   = images[i - 1];
          const title = titleGroup[`title${i}`]       || "";
          // Note: ACF field name is "discreption" (typo in WP) not "discretion"
          const desc  = disGroup[`discreption${i}`]   ||
                        disGroup[`discretion${i}`]    || "";
          const raw   = bulletGroup[`card_point${i}`] || "";
          const bullets = raw
            .split(/\r?\n/)
            .map(b => b.trim())
            .filter(Boolean);

          if (title || img.url || desc) {
            built.push({
              image:       img.url,
              image_alt:   img.alt || title,
              title,
              description: desc,
              bullets,
            });
          }
        }
        setCards(built);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <WhoWeAreSkeleton />;

  if (!sectionTitle && !sectionDesc && cards.length === 0) return null;

  return (
    <section className="wwa" aria-label="Who We Are">
      <div className="">
        <div className="badge-sec">
            <StarIcon />
            <h6 className="badge">who we are</h6>
        </div>

        {/* ── Section header ── */}
        {(sectionTitle || sectionDesc) && (
          <div className="wwa__header container">
            {sectionTitle && <h2 className="wwa__title">{sectionTitle}</h2>}
            {sectionDesc  && <p  className="wwa__desc">{sectionDesc}</p>}
          </div>
        )}

      {/* ── Cards ── */}
      {cards.length > 0 && (
        <div className="wwa__cards">
          {cards.map((card, i) => (
            <article
              key={i}
              className="wwa-card"
              aria-label={card.title}
              ref={(el) => (cardRefs.current[i] = el)}
            >
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
