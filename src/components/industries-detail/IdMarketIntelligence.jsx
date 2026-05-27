/**
 * IdMarketIntelligence.jsx  —  Industries Detail / Section 3
 *
 * Uses the WordPress SVG image as the background diagram.
 * SVG image dimensions: 755 × 654
 *
 * Circle positions (% of SVG dimensions):
 *   Top  cx≈377/755 = 49.9%   cy≈178/654 = 27.2%
 *   BL   cx≈126/755 = 16.7%   cy≈490/654 = 74.9%
 *   BR   cx≈629/755 = 83.3%   cy≈490/654 = 74.9%
 *
 * Center label sits at ~50% x, ~52% y
 */

import { useEffect, useRef, useState } from "react";
import { fetchIndustriesDetailPage } from "./industriesDetailApi";
import "./IdMarketIntelligence.css";

const SVG_URL = "https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/05/Rectangle-arrow.svg";

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

function CircleNode({ title, description, colorClass, delay }) {
  return (
    <div
      className={`idmi__circle ${colorClass}`}
      style={{ "--delay": `${delay}s` }}
      aria-label={title}
    >
      <span className="idmi__circle-title">{title}</span>
      {description && <span className="idmi__circle-desc">{description}</span>}
    </div>
  );
}

function Skeleton() {
  return (
    <section className="idmi">
      <div className="container">
        <div className="idmi__header">
          <div className="skeleton" style={{ width: 200, height: 34, borderRadius: 999, margin: "0 auto 20px" }} />
          <div className="skeleton" style={{ width: "55%", height: 44, margin: "0 auto 12px" }} />
          <div className="skeleton" style={{ width: "65%", height: 18, margin: "0 auto" }} />
        </div>
        <div className="idmi__svg-wrap">
          <div className="idmi__svg-wrap-inner">
            <img src={SVG_URL} alt="" aria-hidden="true" className="idmi__bg-svg" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function IdMarketIntelligence() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const sectionRef            = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetchIndustriesDetailPage()
      .then((acf) => {
        const s = acf?.market_intelligence ?? {};
        const b = s?.blocks ?? {};
        if (!cancelled) {
          setData({
            badge:       s.badge       || "MARKET INTELLIGENCE",
            title:       s.title       || "",
            description: s.description || "",
            one:   { title: b.one?.title   || "", des: b.one?.des   || "" },
            two:   { title: b.two?.title   || "", des: b.two?.des   || "" },
            three: { title: b.three?.title || "", des: b.three?.des || "" },
          });
        }
      })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (loading || !sectionRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          sectionRef.current?.classList.add("idmi--visible");
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [loading]);

  if (loading) return <Skeleton />;
  if (!data)   return null;

  return (
    <section className="idmi" ref={sectionRef} aria-label={data.title || "Market Intelligence"}>
      <div className="container">

        {/* ── Header ── */}
        <div className="idmi__header">
          <div className="badge-sec">
            <StarIcon />
            <span>{data.badge}</span>
          </div>
          {data.title       && <h2 className="idmi__title head-title">{data.title}</h2>}
          {data.description && <p  className="idmi__desc head__desc">{data.description}</p>}
        </div>

        {/* ── Diagram ── */}
        <div className="idmi__svg-wrap">
          <div className="idmi__svg-wrap-inner">

            {/* Background SVG — triangle lines, arrows, dots */}
            <img
              src={SVG_URL}
              alt=""
              aria-hidden="true"
              className="idmi__bg-svg"
            />

            {/* Top circle — cx=49.9% cy=27.2% */}
            <div className="idmi__node idmi__node--top">
              <CircleNode
                title={data.one.title}
                description={data.one.des}
                colorClass="idmi__circle--top"
                delay={0.3}
              />
            </div>

            {/* Bottom-left circle — cx=16.7% cy=74.9% */}
            <div className="idmi__node idmi__node--bl">
              <CircleNode
                title={data.two.title}
                description={data.two.des}
                colorClass="idmi__circle--bl"
                delay={0.5}
              />
            </div>

            {/* Bottom-right circle — cx=83.3% cy=74.9% */}
            <div className="idmi__node idmi__node--br">
              <CircleNode
                title={data.three.title}
                description={data.three.des}
                colorClass="idmi__circle--br"
                delay={0.7}
              />
            </div>

            {/* Center label — ~50% x, ~52% y */}
            <div className="idmi__center-label" aria-hidden="true">
              Marketing<br />Intelligence
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
