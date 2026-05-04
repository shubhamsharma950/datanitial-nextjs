/**
 * AboutFourSection.jsx  —  Section 4
 * "From Data Struggles to Data Advantage" comparison table.
 *
 * ACF: about_four_section (top-level under acf)
 *   badge_text       Text
 *   title            Text
 *   description      Text
 *   other_firms      Text  — left column heading
 *   with_datanitial  Text  — right column heading
 *   left__items      Text Area — one item per line
 *   right_items      Text Area — one item per line
 */

import { useEffect, useState } from "react";
import { fetchAboutPage } from "./aboutApi";
import "./AboutFourSection.css";

/* ── Check icons ── */
function CheckOff() {
  return (
    <svg className="a4s__check a4s__check--off" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckOn() {
  return (
    <svg className="a4s__check a4s__check--on" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Skeleton() {
  return (
    <section className="a4s" aria-busy="true">
      <div className="a4s__inner">
        <div className="a4s__header">
          <div className="skeleton" style={{ width: 160, height: 34, borderRadius: 50, margin: "0 auto 16px" }} />
          <div className="skeleton" style={{ width: "55%", height: 48, borderRadius: 10, margin: "0 auto 12px" }} />
          <div className="skeleton" style={{ width: "65%", height: 18, borderRadius: 6, margin: "0 auto" }} />
        </div>
        <div className="a4s__table">
          {[1, 2].map((col) => (
            <div key={col} className="a4s__col">
              <div className="skeleton" style={{ width: "40%", height: 22, borderRadius: 6, marginBottom: 20 }} />
              {[1,2,3,4,5,6].map((r) => (
                <div key={r} className="skeleton" style={{ width: "80%", height: 18, borderRadius: 6, marginBottom: 12 }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Split a textarea string into a trimmed, non-empty array of lines */
function toLines(str) {
  if (!str) return [];
  return str.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

export default function AboutFourSection() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchAboutPage()
      .then((page) => {
        const sec = page?.about_four_section ?? {};
        if (!cancelled) setData({
          badge:         sec.badge_text      || "",
          title:         sec.title           || "",
          description:   sec.description     || "",
          leftColTitle:  sec.other_firms      || "Other Firms",
          rightColTitle: sec.with_datanitial  || "With Datanitial",
          leftItems:     toLines(sec.left__items),
          rightItems:    toLines(sec.right_items),
        });
      })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Skeleton />;
  if (!data)   return null;

  return (
    <section className="a4s" aria-label="Data advantage comparison">
      <div className="a4s__inner">

        {/* Header */}
        <div className="a4s__header">
          {data.badge && (
            <div className="badge-sec a4s__badge">
              <span className="badge-sec__icon" aria-hidden="true" />
              <span>{data.badge}</span>
            </div>
          )}
          {data.title       && <h2 className="a4s__title head-title">{data.title}</h2>}
          {data.description && <p  className="a4s__desc head__desc">{data.description}</p>}
        </div>

        {/* Comparison table */}
        <div className="a4s__table" role="table" aria-label="Comparison table">

          {/* Left: Other Firms */}
          <div className="a4s__col a4s__col--left" role="columnheader">
            <h3 className="a4s__col-title-l">{data.leftColTitle}</h3>
            <ul className="a4s__list" role="list">
              {data.leftItems.map((item, i) => (
                <li key={i} className="a4s__item a4s__item--off">
                  <CheckOff />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: With Datanitial */}
          <div className="a4s__col a4s__col--right" role="columnheader">
            <h3 className="a4s__col-title-r">{data.rightColTitle}</h3>
            <ul className="a4s__list" role="list">
              {data.rightItems.map((item, i) => (
                <li key={i} className="a4s__item a4s__item--on">
                  <CheckOn />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
