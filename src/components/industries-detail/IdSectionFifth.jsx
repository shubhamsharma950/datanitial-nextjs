/**
 * IdSectionFifth.jsx  —  Industries Detail / Section Fifth
 *
 * ACF path: section_fifth (Group)
 *   left_image          — Image  (person photo, fills left panel)
 *   center (Group)
 *     img               — Image  (small icon top of center card)
 *     title             — Text
 *     des               — Text Area  (can have multiple paragraphs \n\n)
 *     cta               — Link  { title, url, target }
 *   right_side (Group)
 *     bg_image          — Image  (illustration, fills right panel top)
 *     lists             — Text Area  (newline-separated bullet items)
 *
 * Layout (3 columns, equal height):
 *   LEFT   — full-bleed person photo, light bg, no text
 *   CENTER — dark navy card, icon top, title, description paragraphs, CTA button
 *   RIGHT  — light blue card, illustration image top, bullet list below
 *
 * Animations on scroll enter:
 *   Left  → slides from LEFT
 *   Center → slides from BOTTOM
 *   Right  → slides from RIGHT
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchIndustriesDetailPage, resolveImg } from "./industriesDetailApi";
import "./IdSectionFifth.css";

function Skeleton() {
  return (
    <section className="ids5">
      <div className="div">
        <div className="ids5__grid">
          <div className="skeleton ids5__col" style={{ minHeight: 480 }} />
          <div className="skeleton ids5__col" style={{ minHeight: 480 }} />
          <div className="skeleton ids5__col" style={{ minHeight: 480 }} />
        </div>
      </div>
    </section>
  );
}

export default function IdSectionFifth() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const leftRef   = useRef(null);
  const centerRef = useRef(null);
  const rightRef  = useRef(null);

  /* ── Fetch ── */
  useEffect(() => {
    let cancelled = false;
    fetchIndustriesDetailPage()
      .then(async (acf) => {
        const s  = acf?.section_fifth ?? {};
        const c  = s?.center          ?? {};
        const rs = s?.right_side      ?? {};

        const [leftImg, centerIcon, rightBg] = await Promise.all([
          resolveImg(s.left_image),
          resolveImg(c.img),
          resolveImg(rs.bg_image),
        ]);

        /* Split description into paragraphs */
        const paragraphs = c.des
          ? c.des.split(/\r?\n\r?\n|\r?\n/).map(p => p.trim()).filter(Boolean)
          : [];

        /* Split lists into bullet items */
        const listItems = rs.lists
          ? rs.lists.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
          : [];

        if (!cancelled) {
          setData({
            leftImg,
            center: {
              icon:       centerIcon,
              title:      c.title || "",
              paragraphs,
              cta:        c.cta   || null,
            },
            right: {
              bgImg: rightBg,
              listItems,
            },
          });
        }
      })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /* ── Scroll reveal ── */
  useEffect(() => {
    if (loading) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("ids5__col--visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    [leftRef, centerRef, rightRef].forEach(r => r.current && obs.observe(r.current));
    return () => obs.disconnect();
  }, [loading]);

  if (loading) return <Skeleton />;
  if (!data)   return null;

  const { center, right } = data;
  const ctaHref    = center.cta?.url    || "#";
  const ctaLabel   = center.cta?.title  || "Contact us";
  const ctaTarget  = center.cta?.target || "_self";
  const isExternal = ctaHref.startsWith("http");

  return (
    <section className="ids5" aria-label={center.title || "Keyword Intelligence"}>
      <div className="container-fifth">
        <div className="ids5__grid">

          {/* ══ LEFT — person photo ══ */}
          <div className="ids5__col ids5__col--left ids5__col--from-left" ref={leftRef}>
            {data.leftImg
              ? <img src={data.leftImg} alt="" className="ids5__left-img" loading="lazy" />
              : <div className="ids5__left-placeholder" aria-hidden="true" />
            }
          </div>

          {/* ══ CENTER — dark navy card ══ */}
          <div className="ids5__col ids5__col--center ids5__col--from-bottom" ref={centerRef}>
            {/* Icon */}
            {center.icon && (
              <div className="ids5__center-icon">
                <img src={center.icon} alt="" loading="lazy" />
              </div>
            )}

            {/* Title */}
            {center.title && (
              <h2 className="ids5__center-title">{center.title}</h2>
            )}

            {/* Description paragraphs */}
            {center.paragraphs.map((p, i) => (
              <p key={i} className="ids5__center-des">{p}</p>
            ))}

            {/* CTA */}
            {center.cta && (
              <div className="ids5__center-cta-wrap">
                {isExternal ? (
                  <a
                    href={ctaHref}
                    target={ctaTarget || "_blank"}
                    rel="noopener noreferrer"
                    className="ids5__center-cta"
                  >
                    {ctaLabel}
                  </a>
                ) : (
                  <Link to={ctaHref} className="ids5__center-cta">{ctaLabel}</Link>
                )}
              </div>
            )}
          </div>

          {/* ══ RIGHT — illustration + bullet list ══ */}
          <div className="ids5__col ids5__col--right ids5__col--from-right" ref={rightRef}>
            {/* Illustration image */}
            {right.bgImg && (
              <div className="ids5__right-img-wrap">
                <img src={right.bgImg} alt="" className="ids5__right-img" loading="lazy" />
              </div>
            )}

            {/* Bullet list */}
            {right.listItems.length > 0 && (
              <ul className="ids5__right-list">
                {right.listItems.map((item, i) => (
                  <li key={i} className="ids5__right-list-item">{item}</li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
