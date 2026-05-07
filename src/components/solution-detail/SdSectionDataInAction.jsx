/**
 * SdSectionDataInAction.jsx  —  components/solution-detail/
 * ─────────────────────────────────────────────────────────────────────────────
 * "Data in Action" section — scattered layout with central logo and use cases.
 *
 * ACF path: acf.section_data_in_action
 *   title        → <h2>
 *   description  → <p>
 *   image        → central logo
 *   use_cases    → array of scattered images
 *
 * Data source: getSdSectionDataInAction() from solutionsDetailApi.js
 */

import { useEffect, useRef, useState } from "react";
import { getSdSectionDataInAction } from "./solutionsDetailApi";
import "./SdSectionDataInAction.css";

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
    <section className="sddia">
      <div className="container">
        <div className="sddia__inner">
          <div className="skeleton" style={{ width: 200, height: 36, borderRadius: 999, margin: "0 auto 20px" }} />
          <div className="skeleton" style={{ width: "55%", height: 52, margin: "0 auto 16px" }} />
          <div className="skeleton" style={{ width: "70%", height: 22, margin: "0 auto 32px" }} />
          <div className="skeleton" style={{ width: "100%", height: 500, borderRadius: 12, margin: "0 auto" }} />
        </div>
      </div>
    </section>
  );
}

/* ── Main component ── */
export default function SdSectionDataInAction() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const [showImages, setShowImages] = useState(false); // State for showing/hiding images
  const [logoClicked, setLogoClicked] = useState(false); // Track if logo was clicked
  const sectionRef = useRef(null);
  const stageRef = useRef(null);

  /* ── Fetch ── */
  useEffect(() => {
    let cancelled = false;
    getSdSectionDataInAction()
      .then((d)  => { 
        if (!cancelled) {
          if (d && (d.title || d.description || d.image)) {
            setData(d);
          } else {
            setData({
              title: "Unlocking Value Across Use Cases",
              description: "See how businesses leverage web data to drive insights, optimize strategies, and stay ahead in competitive markets.",
              image: "https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/05/l1.png"
            });
          }
        }
      })
      .catch((err) => { 
        console.error("Error loading Data in Action:", err);
        if (!cancelled) {
          setData({
            title: "Unlocking Value Across Use Cases",
            description: "See how businesses leverage web data to drive insights, optimize strategies, and stay ahead in competitive markets.",
            image: "https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/05/l1.png"
          });
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /* ── Intersection Observer for visibility ── */
  useEffect(() => {
    if (!stageRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.3, rootMargin: '0px' }
    );

    observer.observe(stageRef.current);
    return () => {
      if (stageRef.current) {
        observer.unobserve(stageRef.current);
      }
    };
  }, [loading]);

  if (loading) return <Skeleton />;
  if (!data)   return null;

  // Handle logo click - show images and swap logo
  const handleLogoClick = () => {
    if (!logoClicked) {
      setShowImages(true);
      setLogoClicked(true);
    }
  };

  // 11 scattered use case images - positioned further apart to match Figma
  const useCases = data.use_cases || [
    { image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=100&h=100&fit=crop", alt: "Use case 1", x: -450, y: -50 },
    { image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop", alt: "Use case 2", x: -350, y: -200 },
    { image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop", alt: "Use case 3", x: -150, y: -250 },
    { image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=100&h=100&fit=crop", alt: "Use case 4", x: 150, y: -250 },
    { image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop", alt: "Use case 5", x: 350, y: -200 },
    { image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=100&h=100&fit=crop", alt: "Use case 6", x: 450, y: -50 },
    { image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop", alt: "Use case 7", x: 500, y: 120 },
    { image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&h=100&fit=crop", alt: "Use case 8", x: 450, y: 280 },
    { image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=100&h=100&fit=crop", alt: "Use case 9", x: 150, y: 350 },
    { image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=100&h=100&fit=crop", alt: "Use case 10", x: -150, y: 350 },
    { image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=100&h=100&fit=crop", alt: "Use case 11", x: -450, y: 280 },
  ];

  return (
    <section
      className="sddia"
      ref={sectionRef}
      aria-label={data.title || "Data in Action"}
    >
      <div className="container">
        <div className="sddia__inner">
          {/* Header Text */}
          <div className={`sddia__header${isInView ? ' sddia__header--visible' : ''}`}>
            {/* NO Badge - removed to match Figma */}
            
            {data.title && (
              <h2 className="sddia__title">{data.title}</h2>
            )}
            {data.description && (
              <p
                className="sddia__desc"
                dangerouslySetInnerHTML={{ __html: data.description }}
              />
            )}
          </div>

          {/* Scattered Stage */}
          <div 
            className={`sddia__stage${isInView ? ' sddia__stage--visible' : ''}`}
            ref={stageRef}
          >
            {/* Concentric Rings - Full circles visible */}
            <div className="orbital-ring orbital-ring--outer" />
            <div className="orbital-ring orbital-ring--middle" />
            <div className="orbital-ring orbital-ring--inner" />

            {/* Central Logo - Clickable to reveal images */}
            <div 
              className={`sddia__logo-container${logoClicked ? ' sddia__logo-container--clicked' : ''}`}
              onClick={handleLogoClick}
              role="button"
              tabIndex={0}
              aria-label="Click to reveal use cases"
              style={{ cursor: logoClicked ? 'default' : 'pointer' }}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !logoClicked) {
                  e.preventDefault();
                  handleLogoClick();
                }
              }}
            >
              <img
                src={logoClicked 
                  ? "https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/05/l2.png"
                  : "https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/05/l1.png"
                }
                alt={data.title || "Solution logo"}
                className="sddia__logo"
              />
            </div>

            {/* Scattered Use Case Images - Show only after logo click */}
            {showImages && useCases.map((useCase, index) => (
              <div
                key={index}
                className="scattered-node"
                style={{
                  left: `calc(50% + ${useCase.x}px)`,
                  top: `calc(50% + ${useCase.y}px)`,
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <img
                  src={useCase.image}
                  alt={useCase.alt}
                  className="scattered-node__image"
                  style={{
                    animationDelay: `${index * 0.2}s`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
