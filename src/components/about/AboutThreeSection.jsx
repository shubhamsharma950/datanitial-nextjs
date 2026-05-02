/**
 * AboutThreeSection.jsx  —  Section 3
 * Three-column: 2 cards LEFT | tall center image | 2 cards RIGHT
 *
 * Features:
 *  - Title second word highlighted in brand color
 *  - Card hover drop-shadow lift effect
 *  - Fav icon (favss.png) animates in when section enters viewport
 */

import { useEffect, useRef, useState } from "react";
import { fetchAboutPage, resolveImg } from "./aboutApi";
import "./AboutThreeSection.css";

const FAV_ICON_URL =
  "https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/04/favss.png";

/** Split title so the second word gets the highlight colour */
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

function InfoCard({ title, desc, visible, delay }) {
  return (
    <div
      className={`a3s__card${visible ? " a3s__card--visible" : ""}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {title && (
        <h3 className="a3s__card-title">
          <SplitTitle title={title} />
        </h3>
      )}
      {desc && <p className="a3s__card-desc">{desc}</p>}
    </div>
  );
}

function Skeleton() {
  return (
    <section className="a3s" aria-busy="true">
      <div className="a3s__inner">
        <div className="a3s__col">
          {[1, 2].map((i) => (
            <div key={i} className="a3s__card a3s__card--visible">
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
            <div key={i} className="a3s__card a3s__card--visible">
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

export default function AboutThreeSection() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  /* Fetch data */
  useEffect(() => {
    let cancelled = false;
    fetchAboutPage()
      .then(async (page) => {
        const sec = page?.about_three_section ?? {};
        // center_image is a full ACF image object — grab .url directly
        const img = sec.center_image?.url
          ? sec.center_image.url
          : await resolveImg(sec.center_image);
        if (!cancelled) setData({
          leftTop:  { title: sec.our_vision   || "", desc: sec.left_top_desc     || "" },
          leftBot:  { title: sec.our_mision   || "", desc: sec.left_bottom_desc  || "" },
          img,
          rightTop: { title: sec.our_goal     || "", desc: sec.right_top_desc    || "" },
          rightBot: { title: sec.who_we_serve || "", desc: sec.right_bottom_desc || "" },
        });
      })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /* Intersection Observer — runs AFTER data is set so sectionRef is on real section */
  useEffect(() => {
    if (loading || !sectionRef.current) return;

    const el = sectionRef.current;

    // If already in viewport (e.g. page loaded scrolled here), show immediately
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading]); // re-run once loading becomes false

  if (loading) return <Skeleton />;
  if (!data)   return null;

  return (
    <section
      className="a3s"
      aria-label="Vision, Mission, Goal and Who We Serve"
      ref={sectionRef}
    >
      <div className="a3s__inner">

        {/* Left cards */}
        <div className="a3s__col">
          <InfoCard {...data.leftTop}  visible={visible} delay={0}   />
          <InfoCard {...data.leftBot}  visible={visible} delay={150} />
        </div>

        {/* Center image with animated fav icon */}
        <div className="a3s__center-col">
          <div className="a3s__center-img-wrap">
            {/* Animated fav icon overlay */}
            <div className={`a3s__fav-wrap${visible ? " a3s__fav-wrap--visible" : ""}`}>
              <img
                src={FAV_ICON_URL}
                alt="Datanitial icon"
                className="a3s__fav-icon"
                loading="lazy"
              />
            </div>

            {data.img
              ? <img src={data.img} alt="Datanitial" className="a3s__center-img" loading="lazy" />
              : <div className="a3s__center-img-placeholder" aria-hidden="true" />
            }
          </div>
        </div>

        {/* Right cards */}
        <div className="a3s__col">
          <InfoCard {...data.rightTop} visible={visible} delay={0}   />
          <InfoCard {...data.rightBot} visible={visible} delay={150} />
        </div>

      </div>
    </section>
  );
}
