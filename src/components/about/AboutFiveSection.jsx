/**
 * AboutFiveSection.jsx  —  Section 5
 * "From Data to Decisions" process section.
 * Left: badge + title + desc + CTA
 * Right: 4 step cards with icon, title, description, tags
 *
 * ACF: about_five_section (top-level under acf)
 *   badge_text   Text
 *   title        Text
 *   description  Text
 *   cta          Link  → { title, url, target }
 *   right_section_cart_1
 *     ├── icon         Image
 *     ├── discover     Text   (card title)
 *     ├── description  Text Area
 *     └── tags         Text Area (one tag per line)
 *   right_section_cart_2
 *     ├── icon         Image
 *     ├── build        Text
 *     ├── description  Text Area
 *     └── tags         Text Area
 *   right_section_cart_3
 *     ├── icon         Image
 *     ├── deliver      Text
 *     ├── description  Text Area
 *     └── tags         Text Area
 *   right_section_cart_4
 *     ├── icon         Image
 *     ├── optimize     Text
 *     ├── description  Text Area
 *     └── tags         Text Area
 */

import { useEffect, useState } from "react";
import { fetchAboutPage, resolveImg } from "./aboutApi";
import "./AboutFiveSection.css";

/** Split a textarea string into trimmed, non-empty lines */
function toLines(str) {
  if (!str) return [];
  return str.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

function Skeleton() {
  return (
    <section className="a5s" aria-busy="true">
      <div className="a5s__inner">
        <div className="a5s__left">
          <div className="skeleton" style={{ width: 110, height: 30, borderRadius: 50, marginBottom: 16 }} />
          <div className="skeleton" style={{ width: "80%", height: 40, borderRadius: 8, marginBottom: 12 }} />
          <div className="skeleton" style={{ width: "90%", height: 16, borderRadius: 6, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: "70%", height: 16, borderRadius: 6, marginBottom: 24 }} />
          <div className="skeleton" style={{ width: 110, height: 40, borderRadius: 8 }} />
        </div>
        <div className="a5s__right">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="a5s__step-sk">
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,.15)" }} />
              <div>
                <div className="skeleton" style={{ width: 100, height: 20, borderRadius: 6, marginBottom: 8, background: "rgba(255,255,255,.15)" }} />
                <div className="skeleton" style={{ width: "90%", height: 14, borderRadius: 6, background: "rgba(255,255,255,.1)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Normalise a single card group from ACF */
async function normaliseCard(raw, titleKey) {
  if (!raw) return null;
  return {
    icon:  await resolveImg(raw.icon),
    title: raw[titleKey] || "",
    desc:  raw.description || "",
    tags:  toLines(raw.tags),
  };
}

export default function AboutFiveSection() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchAboutPage()
      .then(async (page) => {
        const sec = page?.about_five_section ?? {};
        const cta = sec.cta ?? {};

        const steps = await Promise.all([
          normaliseCard(sec.right_section_cart_1, "discover"),
          normaliseCard(sec.right_section_cart_2, "build"),
          normaliseCard(sec.right_section_cart_3, "deliver"),
          normaliseCard(sec.right_section_cart_4, "optimize"),
        ]);

        if (!cancelled) setData({
          badge:   sec.badge_text  || "",
          title:   sec.title       || "",
          desc:    sec.description || "",
          ctaText: cta.title       || "Contact Us",
          ctaLink: cta.url         || "/contact-us",
          ctaTarget: cta.target    || "_self",
          steps: steps.filter(Boolean),
        });
      })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Skeleton />;
  if (!data)   return null;

  return (
    <section className="a5s" aria-label="Our Process">
      <div className="a5s__inner">

        {/* ── Left: text + CTA ── */}
        <div className="a5s__left">
          {data.badge && (
            <div className="faq-badge"><span className="faq-badge__icon" aria-hidden="true"></span><span className="faq-badge__label">our process</span></div>
          )}
          {data.title && <h2 className="a5s__title">{data.title}</h2>}
          {data.desc  && <p  className="a5s__desc">{data.desc}</p>}
          {data.ctaText && (
            <a
              href={data.ctaLink}
              target={data.ctaTarget}
              rel={data.ctaTarget === "_blank" ? "noopener noreferrer" : undefined}
              className="a5s__cta"
            >
              {data.ctaText}
            </a>
          )}
        </div>

        {/* ── Right: step cards ── */}
        <div className="a5s__right">
          {data.steps.map((step, i) => (
            <article key={i} className="a5s__step">
              <div className="a5s__step-header">
                <div className="a5s__step-icon-wrap" aria-hidden="true">
                  {step.icon
                    ? <img src={step.icon} alt="" className="a5s__step-icon" loading="lazy" />
                    : <div className="a5s__step-icon-placeholder" />
                  }
                </div>
                {step.title && <h3 className="a5s__step-title">{step.title}</h3>}
              </div>
              <div className="a5s__step-divider" aria-hidden="true" />
              {step.desc && <p className="a5s__step-desc">{step.desc}</p>}
              {step.tags.length > 0 && (
                <div className="a5s__step-tags" aria-label="Related topics">
                  {step.tags.map((tag, j) => (
                    <span key={j} className="a5s__step-tag">{tag}</span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
