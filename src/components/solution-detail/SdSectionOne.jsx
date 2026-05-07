/**
 * SdSectionOne.jsx  —  components/solution-detail/
 * ─────────────────────────────────────────────────────────────────────────────
 * Section 1: Centred badge + title + description header block with orbital animation.
 *
 * ACF path: acf.section_one
 *   badge_text   → pill badge
 *   title        → <h2>
 *   description  → <p>
 *   image        → central logo
 *   use_cases    → array of orbiting images
 *
 * Data source: getSdSectionOne() from solutionsDetailApi.js
 */

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { getSdSectionOne } from "./solutionsDetailApi";
import "./SdSectionOne.css";

/* ── Star icon — matches badge-sec pattern ── */
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
    <section className="sd-s1">
      <div className="container">
        <div className="sd-s1__header">
          <div className="skeleton" style={{ width: 200, height: 36, borderRadius: 999, margin: "0 auto 20px" }} />
          <div className="skeleton" style={{ width: "55%", height: 52, margin: "0 auto 16px" }} />
          <div className="skeleton" style={{ width: "70%", height: 22, margin: "0 auto 32px" }} />
          <div className="skeleton" style={{ width: "100%", height: 360, borderRadius: 12, margin: "0 auto" }} />
        </div>
      </div>
    </section>
  );
}

/* ── Orbital Node Component ── */
function OrbitalNode({ image, alt, index, radius, totalNodes }) {
  const angle = (index / totalNodes) * 360;
  const radian = (angle * Math.PI) / 180;
  const x = Math.cos(radian) * radius;
  const y = Math.sin(radian) * radius;

  return (
    <div
      className="orbital-node"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        animationDelay: `${index * 0.1}s`,
      }}
    >
      <img
        src={image}
        alt={alt || `Use case ${index + 1}`}
        className="orbital-node__image"
        style={{
          animationDelay: `${index * 0.3}s`,
        }}
      />
    </div>
  );
}

/* ── Main component ── */
export default function SdSectionOne() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOrbit, setShowOrbit] = useState(false);
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const isInView = useInView(stageRef, { once: true, amount: 0.3 });

  /* ── Fetch ── */
  useEffect(() => {
    let cancelled = false;
    getSdSectionOne()
      .then((d)  => { if (!cancelled) setData(d); })
      .catch(()  => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Skeleton />;
  if (!data)   return null;

  // Mock use case images if not provided by API
  const useCases = data.use_cases || [
    { image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=100&h=100&fit=crop", alt: "Use case 1" },
    { image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop", alt: "Use case 2" },
    { image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop", alt: "Use case 3" },
    { image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=100&h=100&fit=crop", alt: "Use case 4" },
    { image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop", alt: "Use case 5" },
    { image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=100&h=100&fit=crop", alt: "Use case 6" },
    { image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop", alt: "Use case 7" },
    { image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&h=100&fit=crop", alt: "Use case 8" },
  ];

  return (
    <section
      className="sd-s1"
      ref={sectionRef}
      aria-label={data.title || "Solution Detail Section One"}
    >
      <div className="container">
        {/* Three Column Layout */}
        <div className={`sd-s1__grid${isInView ? ' sd-s1__grid--visible' : ''}`}>
          
          {/* Left Column - Vision & Mission */}
          <div className="sd-s1__column sd-s1__column--left">
            <div className="sd-s1__card">
              <h3 className="sd-s1__card-title">
                Our <span className="highlight">Vision</span>
              </h3>
              <p className="sd-s1__card-text">
                To become a global leader in data intelligence by building advanced, scalable solutions that redefine how businesses collect, process, and use data.
              </p>
            </div>
            
            <div className="sd-s1__card">
              <h3 className="sd-s1__card-title">
                Our <span className="highlight">Mission</span>
              </h3>
              <p className="sd-s1__card-text">
                To become a global leader in data intelligence by building advanced, scalable solutions that redefine how businesses collect, process, and use data.
              </p>
            </div>
          </div>

          {/* Center Column - Orbital Animation */}
          <div className="sd-s1__column sd-s1__column--center">
            <div 
              className={`sd-s1__stage${isInView ? ' sd-s1__stage--visible' : ''}`}
              ref={stageRef}
              onClick={() => setShowOrbit(!showOrbit)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && setShowOrbit(!showOrbit)}
              aria-label="Toggle use cases display"
            >
              {/* Concentric Rings */}
              <div className="orbital-ring orbital-ring--outer" />
              <div className="orbital-ring orbital-ring--middle" />
              <div className="orbital-ring orbital-ring--inner" />

              {/* Central Logo */}
              {data.image && (
                <div className="sd-s1__logo-container">
                  <img
                    src={showOrbit 
                      ? "https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/05/l2.png"
                      : "https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/05/l1.png"
                    }
                    alt={data.title || "Solution logo"}
                    className="sd-s1__logo"
                  />
                </div>
              )}

              {/* Orbiting Use Cases */}
              {showOrbit && useCases.map((useCase, index) => (
                <OrbitalNode
                  key={index}
                  image={useCase.image}
                  alt={useCase.alt}
                  index={index}
                  radius={200}
                  totalNodes={useCases.length}
                />
              ))}
            </div>
          </div>

          {/* Right Column - Goal & Who We Serve */}
          <div className="sd-s1__column sd-s1__column--right">
            <div className="sd-s1__card">
              <h3 className="sd-s1__card-title">
                Our <span className="highlight">Goal</span>
              </h3>
              <p className="sd-s1__card-text">
                To provide end-to-end data solutions that help businesses extract, process, and utilize data efficiently.
              </p>
            </div>
            
            <div className="sd-s1__card sd-s1__card--bordered">
              <h3 className="sd-s1__card-title">
                Who <span className="highlight">We Serve</span>
              </h3>
              <p className="sd-s1__card-text">
                Built for businesses that rely on data to drive smarter decisions, optimize operations, and stay ahead of the competition.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
