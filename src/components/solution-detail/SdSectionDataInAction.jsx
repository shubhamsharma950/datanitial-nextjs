/**
 * SdSectionDataInAction.jsx  —  components/solution-detail/
 * ─────────────────────────────────────────────────────────────────────────────
 * "Data in Action" section — text LEFT, image RIGHT layout.
 *
 * ACF path: acf.section_data_in_action
 *   title        → <h2>
 *   description  → <p>
 *   image        → right-side image
 *
 * Data source: getSdSectionDataInAction() from solutionsDetailApi.js
 */

import { useEffect, useRef, useState } from "react";
import { getSdSectionDataInAction } from "./solutionsDetailApi";
import "./SdSectionDataInAction.css";

/* ── Skeleton ── */
function Skeleton() {
  return (
    <section className="sddia">
      <div className="container">
        <div className="sddia__inner">
          <div className="sddia__text">
            <div className="skeleton" style={{ width: "70%", height: 52, marginBottom: 20 }} />
            <div className="skeleton" style={{ width: "90%", height: 20, marginBottom: 10 }} />
            <div className="skeleton" style={{ width: "80%", height: 20 }} />
          </div>
          <div className="skeleton sddia__img-skeleton" />
        </div>
      </div>
    </section>
  );
}

/* ── Main component ── */
export default function SdSectionDataInAction() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  /* ── Fetch ── */
  useEffect(() => {
    let cancelled = false;
    getSdSectionDataInAction()
      .then((d)  => { if (!cancelled) setData(d); })
      .catch(()  => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /* ── Scroll reveal ── */
  useEffect(() => {
    if (loading || !sectionRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
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
    <section
      className={`sddia${visible ? " sddia--visible" : ""}`}
      ref={sectionRef}
      aria-label={data.title || "Data in Action"}
    >
      <div className="container">
        <div className="sddia__inner">

          {/* ── Text side (left) ── */}
          <div className="sddia__text">
            {data.title && (
              <h2 className="sddia__title">{data.title}</h2>
            )}
            {data.description && (
              <p className="sddia__desc">{data.description}</p>
            )}
          </div>

          {/* ── Image side (right) ── */}
          <div className="sddia__img-wrap" aria-hidden="true">
            {data.image ? (
              <img
                src={data.image}
                alt={data.title || "Data in Action"}
                className="sddia__img"
                loading="lazy"
              />
            ) : (
              <div className="sddia__img-placeholder" />
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
