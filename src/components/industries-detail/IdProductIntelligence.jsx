/**
 * IdProductIntelligence.jsx  —  Industries Detail / Product Intelligence Section
 *
 * ACF path: product_intelligence (Group)
 *   badge       — Text
 *   title       — Text
 *   description — Text Area
 *   cards (Group)
 *     one   (Group) → { title, des, image }
 *     two   (Group) → { title, des, image }
 *     three (Group) → { title, des, image }
 *
 * Layout: centered header + 3 equal cards in a row
 *   Card 1 (left)   — slides in from LEFT
 *   Card 2 (center) — slides in from BOTTOM (taller, elevated)
 *   Card 3 (right)  — slides in from RIGHT
 *
 * Background: light blue gradient (matches design)
 */

import { useEffect, useRef, useState } from "react";
import { fetchIndustriesDetailPage, resolveImg } from "./industriesDetailApi";
import "./IdProductIntelligence.css";

/* ── Badge star icon ── */
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

/* ── Skeleton ── */
function Skeleton() {
  return (
    <section className="idpi">
      <div className="container">
        <div className="idpi__header">
          <div className="skeleton" style={{ width: 200, height: 34, borderRadius: 999, margin: "0 auto 24px" }} />
          <div className="skeleton" style={{ width: "55%", height: 48, margin: "0 auto 16px" }} />
          <div className="skeleton" style={{ width: "70%", height: 18, margin: "0 auto 8px" }} />
          <div className="skeleton" style={{ width: "60%", height: 18, margin: "0 auto" }} />
        </div>
        <div className="idpi__cards">
          {[0, 1, 2].map(i => (
            <div key={i} className={`skeleton idpi__card-skel ${i === 1 ? "idpi__card-skel--center" : ""}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function IdProductIntelligence() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const cardRefs              = useRef([]);

  /* ── Fetch ── */
  useEffect(() => {
    let cancelled = false;
    fetchIndustriesDetailPage()
      .then(async (acf) => {
        const s = acf?.product_intelligence ?? {};
        const c = s?.cards ?? {};

        const [imgOne, imgTwo, imgThree] = await Promise.all([
          resolveImg(c.one?.image),
          resolveImg(c.two?.image),
          resolveImg(c.three?.image),
        ]);

        if (!cancelled) {
          setData({
            badge:       s.badge       || "PRODUCT INTELLIGENCE",
            title:       s.title       || "",
            description: s.description || "",
            cards: [
              { title: c.one?.title   || "", des: c.one?.des   || "", img: imgOne   },
              { title: c.two?.title   || "", des: c.two?.des   || "", img: imgTwo   },
              { title: c.three?.title || "", des: c.three?.des || "", img: imgThree },
            ],
          });
        }
      })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /* ── Scroll reveal — each card has its own direction ── */
  useEffect(() => {
    if (loading || !data) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("idpi__card--visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    cardRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [loading, data]);

  if (loading) return <Skeleton />;
  if (!data)   return null;

  /* Animation direction classes */
  const dirClass = ["idpi__card--from-left", "idpi__card--from-bottom", "idpi__card--from-right"];

  return (
    <section className="idpi" aria-label={data.title || "Product Intelligence"}>
      <div className="container">

        {/* ── Header ── */}
        <div className="idpi__header">
          <div className="badge-sec">
            <StarIcon />
            <span>{data.badge}</span>
          </div>
          {data.title       && <h2 className="idpi__title head-title">{data.title}</h2>}
          {data.description && <p  className="idpi__desc head__desc">{data.description}</p>}
        </div>

        {/* ── 3 Cards ── */}
        <div className="idpi__cards">
          {data.cards.map((card, idx) => {
            const isCenter = idx === 1;
            return (
              <article
                key={idx}
                ref={(el) => (cardRefs.current[idx] = el)}
                className={`idpi__card ${dirClass[idx]} ${isCenter ? "idpi__card--center" : ""}`}
                aria-label={card.title}
              >
                {/* Image — for center card this floats above the body */}
                <div className="idpi__card-img-wrap">
                  {card.img
                    ? <img src={card.img} alt={card.title} className="idpi__card-img" loading="lazy" />
                    : <div className="idpi__card-img-placeholder" aria-hidden="true" />
                  }
                </div>

                {/* Card body */}
                <div className="idpi__card-body">
                  {card.title && <h3 className="idpi__card-title">{card.title}</h3>}
                  {card.des   && <p  className="idpi__card-des">{card.des}</p>}
                </div>
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}
