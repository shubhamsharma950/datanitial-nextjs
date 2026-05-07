import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./OurSolutions.css";

const ARROW_ICON_URL =
  "https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/05/ddsf.png";

const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.NEXT_PUBLIC_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

const PRIMARY_URL  = `${WP_BASE}/theme/v1/our-solutions`;
const FALLBACK_URL = `${WP_BASE}/wp/v2/pages/63?_fields=acf`;

/* ── Icons ── */
const StarIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="sol-badge__icon">
    <circle cx="10" cy="10" r="10" fill="#2E3192" />
    <g stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
      <line x1="10" y1="5.2" x2="10" y2="14.8" />
      <line x1="6.8" y1="7"  x2="13.2" y2="13" />
      <line x1="13.2" y1="7" x2="6.8"  y2="13" />
    </g>
  </svg>
);

const PlusIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" className="sol-item__icon" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" className={open ? "sol-item__icon-v sol-item__icon-v--hide" : "sol-item__icon-v"} />
    <line x1="8"  y1="12" x2="16" y2="12" />
  </svg>
);

/* ── Skeleton ── */
function Skeleton() {
  return (
    <section className="sol">
      <div className="container">
        <div className="badge-sec skeleton" style={{ width: 130, height: 30, borderRadius: 999 }} />
        <div className="skeleton" style={{ width: "55%", height: 44, margin: "0 auto 12px" }} />
        <div className="skeleton" style={{ width: "65%", height: 18, margin: "0 auto 56px" }} />
        {[1,2,3,4,5].map(i => (
          <div key={i} className="skeleton" style={{ width: "100%", height: 64, borderRadius: 8, marginBottom: 2 }} />
        ))}
      </div>
    </section>
  );
}

/* ── Parse fallback from native ACF ── */
function parseFromAcf(acf) {
  const sol = acf?.our_solutions;
  const faq = acf?.our_solutions_faq;
  const items = [];
  if (faq && typeof faq === "object") {
    for (let i = 1; i <= 5; i++) {
      const q   = faq[`question${i}`] || "";
      const ans = faq[`answer${i}`]   || {};
      const img        = typeof ans === "object" ? (ans.image?.url || ans.image || "") : "";
      const answer     = typeof ans === "object" ? (ans.discretions || "") : "";
      const list_raw   = typeof ans === "object" ? (ans.list_items  || "") : "";
      const list_items = list_raw
        ? list_raw.split("\n").map(s => s.trim()).filter(Boolean)
        : [];
      if (q || img || answer || list_items.length) {
        items.push({ question: q, image: img, answer, list_items });
      }
    }
  }
  return {
    title:       sol?.title       || "Scalable Data Solutions for Modern Businesses",
    description: sol?.discreption || "Built to handle complex data needs, our solutions deliver reliable, structured, and actionable insights across industries.",
    items,
  };
}

/* ═══════════════════════════════════════════════
   OUR SOLUTIONS — Accordion section
   ACF: our_solutions (title/desc) + our_solutions_faq (question1/answer1…question5/answer5)
   Answer panel: image + description text + bullet list (matches design screenshot)
═══════════════════════════════════════════════ */
export default function OurSolutions({ detailLink = null }) {
  const [title,       setTitle]       = useState("Scalable Data Solutions for Modern Businesses");
  const [description, setDescription] = useState("Built to handle complex data needs, our solutions deliver reliable, structured, and actionable insights across industries.");
  const [items,       setItems]       = useState([]);
  const [openIndex,   setOpenIndex]   = useState(null);
  const [loading,     setLoading]     = useState(true);
  const sectionRef                    = useRef(null);

  /* ── Scroll reveal ── */
  useEffect(() => {
    if (loading) return;
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("sol--visible"); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loading]);

  /* ── Fetch ── */
  useEffect(() => {
    fetch(PRIMARY_URL)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(d => {
        if (d.title)       setTitle(d.title);
        if (d.description) setDescription(d.description);
        if (d.items?.length) setItems(d.items);
      })
      .catch(() => {
        fetch(FALLBACK_URL)
          .then(r => r.json())
          .then(d => {
            const parsed = parseFromAcf(d?.acf);
            setTitle(parsed.title);
            setDescription(parsed.description);
            setItems(parsed.items);
          })
          .catch(() => {});
      })
      .finally(() => setLoading(false));
  }, []);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  if (loading) return <Skeleton />;

  return (
    <section className="sol" ref={sectionRef} aria-label="Our Solutions">
      <div className="container">

        {/* ── Badge ── */}
        <div className="badge-sec">
          <StarIcon />
          <span>OUR SOLUTIONS</span>
        </div>

        {/* ── Header ── */}
        <div className="sol__header">
          <h2 className="sol__title head-title">{title}</h2>
          <p  className="sol__desc head__desc">{description}</p>
        </div>

        {/* ── Accordion ── */}
        <div className="sol__list" role="list">
          {items.map((item, i) => (
            <div
              key={i}
              className={`sol__item${openIndex === i ? " sol__item--open" : ""}`}
              role="listitem"
              style={{ "--delay": `${i * 0.07}s` }}
            >
              {/* Row — always visible */}
              <div className="sol__item-header">
                {detailLink ? (
                  /* ── SolutionsPage mode: title + icon both link to detail page ── */
                  <Link
                    to={detailLink}
                    className="sol__item-header-link"
                    aria-label={`View details for ${item.question}`}
                  >
                    <span className="sol__item-title">
                      {item.question.toUpperCase()}
                    </span>
                    <img
                      src={ARROW_ICON_URL}
                      alt=""
                      className="sol__item-arrow-icon"
                      aria-hidden="true"
                    />
                  </Link>
                ) : (
                  /* ── Default mode: accordion toggle ── */
                  <button
                    className="sol__item-header-btn"
                    aria-expanded={openIndex === i}
                    onClick={() => toggle(i)}
                  >
                    <span className="sol__item-title">
                      {item.question.toUpperCase()}
                    </span>
                    <PlusIcon open={openIndex === i} />
                  </button>
                )}
              </div>

              {/* Expandable answer panel */}
              <div
                className="sol__item-body"
                aria-hidden={openIndex !== i}
              >
                <div className="sol__item-body-inner">
                  <div className="sol__answer-panel">

                    {/* Left: image */}
                    {item.image && (
                      <div className="sol__answer-img-wrap">
                        <img
                          src={item.image}
                          alt={item.question}
                          className="sol__answer-img"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Middle: description text */}
                    {item.answer && (
                      <p className="sol__answer-text">{item.answer}</p>
                    )}

                    {/* Right: bullet list */}
                    {item.list_items?.length > 0 && (
                      <ul className="sol__answer-list" aria-label="Key points">
                        {item.list_items.map((point, j) => (
                          <li key={j} className="sol__answer-list-item">
                            <span className="sol__answer-bullet" aria-hidden="true" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    )}

                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
