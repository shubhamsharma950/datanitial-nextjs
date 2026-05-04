import { useEffect, useState } from "react";
import "./FaqSection.css";

const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.NEXT_PUBLIC_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

const FAQ_URL = `${WP_BASE}/theme/v1/faqs`;

/* ── Fallback data ── */
const FALLBACK = {
  title:    "FAQS",
  subtitle: "Find quick answers about our web and mobile data extraction services.",
  dis:      "We're here to answer any question you may have.",
  items: [
    { question: "What is web data extraction?",            answer: "Web data extraction is the process of automatically collecting data from websites to analyze pricing, trends, and more." },
    { question: "Which platforms can you scrape data from?", answer: "We can scrape data from e-commerce sites, social media platforms, job boards, real estate portals, and many more." },
    { question: "Is mobile app data scraping possible?",   answer: "Yes, we support mobile app data extraction using advanced techniques including API interception and emulation." },
    { question: "How often is the data updated?",          answer: "Data update frequency depends on your requirements — we support real-time, hourly, daily, or weekly schedules." },
    { question: "Is web scraping legal?",                  answer: "Web scraping is legal when done on publicly available data and in compliance with a website's terms of service." },
    { question: "Can you provide structured data formats?", answer: "Yes, we deliver data in JSON, CSV, XML, Excel, or directly into your database." },
    { question: "Do you provide custom scraping solutions?", answer: "Absolutely. We build fully custom scrapers tailored to your specific data needs and target websites." },
  ],
};

/* ── Star badge icon ── */
// SVG replaced by CSS background-image on .faq-badge__icon

/* ── Toggle icon images ── */
const ICON_OPEN  = "https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/04/Button-close.png";
const ICON_CLOSE = "https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/04/Button.png";

/* ── Skeleton ── */
function Skeleton() {
  return (
    <section className="faq-section">
      <div className="container">
        <div className="faq-section__layout">
          <div className="faq-section__left">
            <div className="skeleton" style={{ width: 90, height: 30, borderRadius: 999, marginBottom: 20 }} />
            <div className="skeleton" style={{ width: "95%", height: 36, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: "80%", height: 36, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: "70%", height: 36, marginBottom: 32 }} />
            <div className="skeleton" style={{ width: "100%", height: 280, borderRadius: 18 }} />
          </div>
          <div className="faq-section__right">
            {[1,2,3,4,5,6,7].map(i => (
              <div key={i} className="skeleton" style={{ width: "100%", height: 60, borderRadius: 14, marginBottom: 10 }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Single accordion item ── */
function FaqItem({ question, answer, isOpen, onToggle, index }) {
  return (
    <div className={`faq-item${isOpen ? " faq-item--open" : ""}`} role="listitem">
      <button
        className="faq-item__trigger"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
        id={`faq-question-${index}`}
      >
        <span className="faq-item__question">{question}</span>
        <span className="faq-item__icon" aria-hidden="true">
          <img
            src={isOpen ? ICON_CLOSE : ICON_OPEN}
            alt={isOpen ? "Close" : "Open"}
            className="faq-item__icon-img"
          />
        </span>
      </button>

      <div
        id={`faq-answer-${index}`}
        role="region"
        aria-labelledby={`faq-question-${index}`}
        className="faq-item__body"
        hidden={!isOpen}
      >
        <p className="faq-item__answer">{answer}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   GET STARTED CTA BANNER
   Dark image background, badge + heading +
   description + Contact Us button
═══════════════════════════════════════════════ */
function GetStartedBanner() {
  return (
    <div className="gs-banner" aria-label="Get Started">
      {/* Dark overlay */}
      <div className="gs-banner__overlay" aria-hidden="true" />

      <div className="gs-banner__content">
        {/* Badge */}
         <div className="faq-badge">
                <span className="faq-badge__icon" aria-hidden="true" />
                <span className="faq-badge__label">{"GET STARTED"}</span>
              </div>

        {/* Heading */}
        <h2 className="gs-banner__heading">
          Ready to Take the Next Step?
        </h2>

        {/* Description */}
        <p className="gs-banner__desc">
          Join us and discover how data can power your next phase of growth.
        </p>

        {/* CTA */}
        <a href="/contact-us" className="secondary-btn">
          Contact Us
        </a>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   FAQ SECTION — main export
   Renders:
     1. FAQ two-column layout (left sticky + right accordion)
     2. Get Started CTA banner below
═══════════════════════════════════════════════ */
export default function FaqSection() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [openIdx, setOpenIdx] = useState(0);

  useEffect(() => {
    fetch(FAQ_URL)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(d => setData(d))
      .catch(() => setData(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;

  const { title, subtitle, dis, items } = data || FALLBACK;
  const toggle = (i) => setOpenIdx(prev => (prev === i ? null : i));

  return (
    <div className="faq-wrapper">

      {/* ══ FAQ SECTION ══ */}
      <section className="faq-section" aria-label="Frequently Asked Questions">
        {/* <div className="faq-section__container"> */}
        <div className="container">
          <div className="faq-section__layout">

            {/* ── LEFT: badge + heading + help card ── */}
            <div className="faq-section__left">
              <div className="faq-badge">
                <span className="faq-badge__icon" aria-hidden="true" />
                <span className="faq-badge__label">{"FAQS"}</span>
              </div>

              <h2 className="faq-section__heading">
                {/* {subtitle || FALLBACK.subtitle} */}
                {title}
              </h2>

              {/* Need More Help card */}
              <div className="faq-help-card" aria-label="Need More Help?">
                <div className="faq-help-card__overlay" />
                <div className="faq-help-card__content">
                  <p className="faq-help-card__title">{subtitle}</p>
                  <p className="faq-help-card__sub">
                   {dis}
                  </p>
                </div>
              </div>
            </div>

            {/* ── RIGHT: accordion ── */}
            <div className="faq-section__right" role="list" aria-label="FAQ list">
              {(items?.length ? items : FALLBACK.items).map((item, i) => (
                <FaqItem
                  key={i}
                  index={i}
                  question={item.question}
                  answer={item.answer}
                  isOpen={openIdx === i}
                  onToggle={() => toggle(i)}
                />
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ══ GET STARTED BANNER ══ */}
      <section className="gs-section" aria-label="Get Started">
        <div className="container">
          <GetStartedBanner />
        </div>
      </section>

    </div>
  );
}
