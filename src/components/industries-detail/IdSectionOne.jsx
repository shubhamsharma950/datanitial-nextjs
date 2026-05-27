/**
 * IdSectionOne.jsx  —  Industries Detail / Section 1
 *
 * ACF path: section_one (Group)
 *   title        — Text
 *   description  — Text Area
 *   image        — Image (left side photo)
 *   image_box    — Group
 *     card1 (Group) → { img, title, description }
 *     card2 (Group) → { img, title, description }
 *     card3 (Group) → { img, title, description }
 *     card4 (Group) → { img, title, description }
 *
 * Layout (matches design):
 *
 *   ┌──────────────────┬──────────────────────────────────────────┐
 *   │                  │  Title                                   │
 *   │   [  image  ]    │  Description                             │
 *   │                  │  ┌──────────────┬──────────────┐         │
 *   │                  │  │ icon  card1  │ icon  card2  │         │
 *   │                  │  ├──────────────┼──────────────┤         │
 *   │                  │  │ icon  card3  │ icon  card4  │         │
 *   │                  │  └──────────────┴──────────────┘         │
 *   └──────────────────┴──────────────────────────────────────────┘
 */

import { useEffect, useRef, useState } from "react";
import { fetchIndustriesDetailPage, resolveImg } from "./industriesDetailApi";
import "./IdSectionOne.css";

/* ── Skeleton ── */
function Skeleton() {
  return (
    <section className="ids1">
      <div className="container-one">
        <div className="ids1__inner">
          <div className="skeleton ids1__image-wrap" />
          <div className="ids1__content">
            <div className="skeleton" style={{ width: "70%", height: 44, marginBottom: 16 }} />
            <div className="skeleton" style={{ width: "95%", height: 18, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: "85%", height: 18, marginBottom: 32 }} />
            <div className="ids1__cards-grid">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton ids1__card-skeleton" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function IdSectionOne() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const sectionRef            = useRef(null);

  /* ── Fetch ── */
  useEffect(() => {
    let cancelled = false;

    fetchIndustriesDetailPage()
      .then(async (acf) => {
        const s        = acf?.section_one ?? {};
        const imageBox = s?.image_box     ?? {};

        /* Resolve main image + all 4 card icons in parallel */
        const cardKeys = ["card1", "card2", "card3", "card4"];
        const [mainImg, ...cardImgs] = await Promise.all([
          resolveImg(s.image),
          ...cardKeys.map((k) => resolveImg(imageBox[k]?.img)),
        ]);

        const cards = cardKeys.map((k, i) => ({
          img:         cardImgs[i],
          imgAlt:      (typeof imageBox[k]?.img === "object" ? imageBox[k]?.img?.alt : "") || imageBox[k]?.title || "",
          title:       imageBox[k]?.title       || "",
          description: imageBox[k]?.description || "",
        }));

        if (!cancelled) {
          setData({
            title:       s.title       || "",
            description: s.description || "",
            mainImg,
            mainImgAlt:  s.image?.alt  || s.title || "Industry",
            cards,
          });
        }
      })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  /* ── Scroll reveal ── */
  useEffect(() => {
    if (loading || !sectionRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          sectionRef.current?.classList.add("ids1--visible");
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

  return (
    <section className="ids1" ref={sectionRef} aria-label={data.title || "Industry Detail Section"}>
      <div className="container-one">
        <div className="ids1__inner">

          {/* ══ LEFT: main image ══ */}
          <div className="ids1__image-wrap">
            {data.mainImg
              ? <img src={data.mainImg} alt={data.mainImgAlt} className="ids1__image" loading="lazy" />
              : <div className="ids1__image-placeholder" aria-hidden="true" />
            }
          </div>

          {/* ══ RIGHT: title + description + 2×2 cards ══ */}
          <div className="ids1__content">
            {data.title       && <h2 className="ids1__title head-title">{data.title}</h2>}
            {data.description && <p  className="ids1__desc head__desc">{data.description}</p>}

            {/* 2×2 icon-card grid — show if any card has an image or title */}
            {data.cards.some((c) => c.img || c.title) && (
              <div className="ids1__cards-grid">
                {data.cards.map((card, idx) => (
                  <div key={idx} className="ids1__card">
                    {card.img && (
                      <div className="ids1__card-icon">
                        <img src={card.img} alt={card.imgAlt} loading="lazy" />
                      </div>
                    )}
                    {card.title       && <h3 className="ids1__card-title">{card.title}</h3>}
                    {card.description && <p  className="ids1__card-desc">{card.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
