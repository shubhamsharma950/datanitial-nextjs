/**
 * AboutThreeSection.jsx  —  Section 3
 * Original design: 2 info cards LEFT | tall center image | 2 info cards RIGHT
 *
 * Animation sequence (triggers on scroll into view):
 *  1. Center image box zooms in from tiny → full size  (~1.1s)
 *  2. After zoom completes → left cards slide up (staggered)
 *                          → right cards slide up (staggered)
 *
 * Content from ACF: about_three_section
 *   left_top  → our_vision  / left_top_desc
 *   left_bot  → our_mision  / left_bottom_desc
 *   right_top → our_goal    / right_top_desc
 *   right_bot → who_we_serve/ right_bottom_desc
 *   center_image
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { fetchAboutPage, resolveImg } from "./aboutApi";
import "./AboutThreeSection.css";

const FAV_ICON_URL =
  "https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/04/favss.png";

/* ── Split title: second word gets highlight colour ── */
function SplitTitle({ title }) {
  if (!title) return null;
  const words = title.trim().split(/\s+/);
  if (words.length < 2) return <>{title}</>;
  const [first, second, ...rest] = words;
  return (
    <>
      {first}{" "}
      <span className="a3s__hl">{second}</span>
      {rest.length ? " " + rest.join(" ") : ""}
    </>
  );
}

/* ── Info card with slide-up animation ── */
function InfoCard({ title, desc, isVisible, delay }) {
  return (
    <motion.div
      className="a3s__card"
      initial={{ opacity: 0, y: 48 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 48 }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {title && (
        <h3 className="a3s__card-title">
          <SplitTitle title={title} />
        </h3>
      )}
      {desc && <p className="a3s__card-desc">{desc}</p>}
    </motion.div>
  );
}

/* ── Skeleton ── */
function Skeleton() {
  return (
    <section className="a3s" aria-busy="true">
      <div className="a3s__inner">
        <div className="a3s__col">
          {[1, 2].map((i) => (
            <div key={i} className="a3s__card">
              <div className="skeleton" style={{ width: "60%", height: 26, borderRadius: 8, marginBottom: 10 }} />
              <div className="skeleton" style={{ width: "100%", height: 15, borderRadius: 6, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: "85%", height: 15, borderRadius: 6 }} />
            </div>
          ))}
        </div>
        <div className="a3s__center-col">
          <div className="skeleton a3s__center-img-sk" />
        </div>
        <div className="a3s__col">
          {[1, 2].map((i) => (
            <div key={i} className="a3s__card">
              <div className="skeleton" style={{ width: "60%", height: 26, borderRadius: 8, marginBottom: 10 }} />
              <div className="skeleton" style={{ width: "100%", height: 15, borderRadius: 6, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: "85%", height: 15, borderRadius: 6 }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Main component ── */
export default function AboutThreeSection() {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [centerIn,   setCenterIn]   = useState(false); // center zoom started
  const [sidesReady, setSidesReady] = useState(false); // cards can appear

  const observerRef = useRef(null);

  /* Trigger sequence: center first, then sides after zoom completes */
  const triggerSequence = useCallback(() => {
    setCenterIn(true);
    setTimeout(() => setSidesReady(true), 1200);
  }, []);

  /* Ref callback — attaches observer the moment real section mounts */
  const attachObserver = useCallback((el) => {
    if (!el) return;

    // Already in viewport when mounted
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      triggerSequence();
      return;
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          triggerSequence();
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    observerRef.current.observe(el);
  }, [triggerSequence]);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  /* Fetch ACF data */
  useEffect(() => {
    let cancelled = false;
    fetchAboutPage()
      .then(async (page) => {
        const sec = page?.about_three_section ?? {};
        const img = sec.center_image?.url
          ? sec.center_image.url
          : await resolveImg(sec.center_image);

        if (!cancelled) setData({
          leftTop:  { title: sec.our_vision    || "", desc: sec.left_top_desc    || "" },
          leftBot:  { title: sec.our_mision    || "", desc: sec.left_bottom_desc || "" },
          img,
          rightTop: { title: sec.our_goal      || "", desc: sec.right_top_desc   || "" },
          rightBot: { title: sec.who_we_serve  || "", desc: sec.right_bottom_desc|| "" },
        });
      })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Skeleton />;
  if (!data)   return null;

  return (
    <section
      className="a3s"
      aria-label="Vision, Mission, Goal and Who We Serve"
      ref={attachObserver}
    >
      <div className="a3s__inner">

        {/* ── Left cards (appear after center zoom) ── */}
        <div className="a3s__col">
          <InfoCard {...data.leftTop} isVisible={sidesReady} delay={0.05} />
          <InfoCard {...data.leftBot} isVisible={sidesReady} delay={0.22} />
        </div>

        {/* ── Center image — zooms in first ── */}
        <div className="a3s__center-col">
          <motion.div
            className="a3s__center-img-wrap"
            initial={{ opacity: 0, scale: 0.15 }}
            animate={centerIn ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.15 }}
            transition={{ duration: 1.1, delay: 0.05, ease: [0.34, 1.3, 0.64, 1] }}
          >
            {/* Fav icon overlay */}
            <motion.div
              className="a3s__fav-wrap"
              initial={{ opacity: 0, scale: 0.4, rotate: -15 }}
              animate={centerIn ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.4, rotate: -15 }}
              transition={{ duration: 0.7, delay: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <img
                src={FAV_ICON_URL}
                alt="Datanitial icon"
                className="a3s__fav-icon"
                loading="lazy"
              />
            </motion.div>

            {data.img
              ? <img src={data.img} alt="Datanitial" className="a3s__center-img" loading="lazy" />
              : <div className="a3s__center-img-placeholder" aria-hidden="true" />
            }
          </motion.div>
        </div>

        {/* ── Right cards (appear after center zoom) ── */}
        <div className="a3s__col">
          <InfoCard {...data.rightTop} isVisible={sidesReady} delay={0.05} />
          <InfoCard {...data.rightBot} isVisible={sidesReady} delay={0.22} />
        </div>

      </div>
    </section>
  );
}
