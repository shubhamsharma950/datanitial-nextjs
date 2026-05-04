/**
 * IndustriesTwoSection.jsx  —  Section 2
 * "Industry-Specific Customization"
 *
 * ACF path: acf → section_two (Group)
 *   badge_text        Text
 *   title             Text
 *   description       Text Area
 *   side_image        Image  → default right-side image
 *   items (Group)
 *     custom      (Group) → { title, description, hover_image }
 *     flexible    (Group) → { title, description, hover_image }
 *     integration (Group) → { title, description, hover_image }
 *
 * Behaviour:
 *   - Active item advances automatically on a 3 s timer.
 *   - The divider BELOW the active item shows an animated progress fill.
 *   - Image crossfades to the active item's hover_image.
 *   - No hover / focus interaction on items.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { fetchIndustriesPage, resolveImg } from "./industriesApi";
import "./IndustriesTwoSection.css";

const INTERVAL_MS = 3000; // time each item stays active

const StarIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <circle cx="10" cy="10" r="10" fill="#2E3192" />
    <g stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
      <line x1="10" y1="5.2" x2="10" y2="14.8" />
      <line x1="6.8" y1="7"  x2="13.2" y2="13" />
      <line x1="13.2" y1="7" x2="6.8"  y2="13" />
    </g>
  </svg>
);

/* ── The three fixed sub-group keys inside items, in display order ── */
const ITEM_KEYS = [
  { key: "custom",      number: "01" },
  { key: "flexible",    number: "02" },
  { key: "integration", number: "03" },
];

function Skeleton() {
  return (
    <section className="ind2">
      <div className="container">
        <div className="skeleton" style={{ width: 220, height: 32, borderRadius: 999, margin: "0 auto 24px" }} />
        <div className="skeleton" style={{ width: "55%", height: 44, margin: "0 auto 12px" }} />
        <div className="skeleton" style={{ width: "70%", height: 18, margin: "0 auto 48px" }} />
        <div className="ind2__body">
          <div className="ind2__list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12, marginBottom: 16 }} />
            ))}
          </div>
          <div className="skeleton ind2__image-wrap" style={{ borderRadius: 20 }} />
        </div>
      </div>
    </section>
  );
}

export default function IndustriesTwoSection() {
  const [data,         setData]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [activeIndex,  setActiveIndex]  = useState(0);
  const [displayedImg, setDisplayedImg] = useState("");
  const [fading,       setFading]       = useState(false);

  const sectionRef  = useRef(null);
  const timerRef    = useRef(null);
  const dataRef     = useRef(null);   // stable ref so timer closure always sees latest data

  /* ── Fetch ── */
  useEffect(() => {
    let cancelled = false;
    fetchIndustriesPage()
      .then(async (acf) => {
        const s        = acf?.section_two ?? {};
        const itemsGrp = s.items          ?? {};
        const sideImg  = await resolveImg(s.side_image);

        const items = await Promise.all(
          ITEM_KEYS.map(async ({ key, number }) => {
            const grp = itemsGrp[key] ?? {};
            return {
              number,
              key,
              title:       grp.title       || "",
              description: grp.description || "",
              hoverImage:  await resolveImg(grp.hover_image),
              hoverAlt:    grp.hover_image?.alt || grp.title || "",
            };
          })
        );

        if (!cancelled) {
          const firstImg = items[0]?.hoverImage || sideImg;
          setDisplayedImg(firstImg);
          const resolved = {
            badge:       s.badge_text  || "INDUSTRY-SPECIFIC CUSTOMIZATION",
            title:       s.title       || "",
            description: s.description || "",
            sideImage:   sideImg,
            sideAlt:     s.side_image?.alt || "Industry customization",
            items,
          };
          dataRef.current = resolved;
          setData(resolved);
        }
      })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /* ── Crossfade helper ── */
  const goToIndex = useCallback((nextIndex) => {
    const d = dataRef.current;
    if (!d) return;
    const nextImg = d.items[nextIndex]?.hoverImage || d.sideImage;
    setFading(true);
    setTimeout(() => {
      setDisplayedImg(nextImg || "");
      setActiveIndex(nextIndex);
      setFading(false);
    }, 220);
  }, []);

  /* ── Auto-advance timer — starts once data is loaded ── */
  useEffect(() => {
    if (!data) return;
    const total = data.items.length;
    let current = 0;

    timerRef.current = setInterval(() => {
      current = (current + 1) % total;
      goToIndex(current);
    }, INTERVAL_MS);

    return () => clearInterval(timerRef.current);
  }, [data, goToIndex]);

  /* ── Scroll reveal ── */
  useEffect(() => {
    if (loading || !sectionRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          sectionRef.current?.classList.add("ind2--visible");
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [loading]);

  if (loading) return <Skeleton />;
  if (!data)   return null;

  const currentImg = displayedImg || data.sideImage;

  return (
    <section className="ind2" ref={sectionRef} aria-label="Industry-Specific Customization">
      <div className="container">

        {/* ── Header ── */}
        <div className="ind2__header">
          <div className="badge-sec">
            <StarIcon />
            <span>{data.badge}</span>
          </div>
          {data.title       && <h2 className="ind2__title head-title">{data.title}</h2>}
          {data.description && <p  className="ind2__desc head__desc">{data.description}</p>}
        </div>

        {/* ── Body: list + image ── */}
        <div className="ind2__body">

          {/* Left: three items */}
          <div className="ind2__list" role="list">
            {data.items.map((item, i) => (
              <div
                key={item.key}
                role="listitem"
                className={`ind2__item${i === activeIndex ? " ind2__item--active" : ""}`}
                aria-label={`${item.number} — ${item.title}`}
              >
                <div className="ind2__item-inner">
                  {/* Number badge */}
                  <div
                    className={`ind2__num${i === activeIndex ? " ind2__num--active" : ""}`}
                    aria-hidden="true"
                  >
                    {item.number}
                  </div>

                  {/* Text */}
                  <div className="ind2__item-text">
                    {item.title       && <h3 className="ind2__item-title">{item.title}</h3>}
                    {item.description && <p  className="ind2__item-desc">{item.description}</p>}
                  </div>
                </div>

                {/* Divider — only after each item, active one shows progress fill */}
                <div
                  className={`ind2__item-divider${i === activeIndex ? " ind2__item-divider--active" : ""}`}
                  aria-hidden="true"
                />
              </div>
            ))}
          </div>

          {/* Right: image panel */}
          <div className="ind2__image-wrap" aria-hidden="true">
            {currentImg ? (
              <img
                src={currentImg}
                alt={data.items[activeIndex]?.hoverAlt || data.sideAlt}
                className={`ind2__image${fading ? " ind2__image--fading" : ""}`}
                loading="lazy"
              />
            ) : (
              <div className="ind2__image-placeholder" />
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
