/**
 * ContactFormSection.jsx  —  Section 1
 * "Let's Talk. Let's Build." — badge, heading, sub-heading,
 * left card (form) + right image.
 *
 * ACF structure (WP Page ID: 18):
 *   form_section (Group)
 *     ├── badge_text                → Text
 *     ├── heading                   → Text
 *     ├── discerption               → Text Area  (WP typo — maps to sub_heading)
 *     └── form_card (Group)
 *           ├── form_title              → Text
 *           ├── form_sub_title          → Text Area
 *           └── form_image              → Image
 */

import { useEffect, useState } from "react";
import { fetchContactPage, resolveImg } from "./contactApi";
import ContactForm from "./ContactForm";
import "./ContactFormSection.css";

/* ── Default fallback content ── */
const DEFAULTS = {
  badge_text:     "GET IN TOUCH",
  heading:        "Let's Talk. Let's Build.",
  sub_heading:    "Have a question, suggestion, or just want to say hello? Our team is ready to assist.",
  form_title:     "Send us a message",
  form_sub_title: "Don't Hesitate, we're just a message away. Our Super friendly team will get back to you as soon as possible",
};

export default function ContactFormSection() {
  const [data,    setData]    = useState(DEFAULTS);
  const [imgUrl,  setImgUrl]  = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContactPage()
      .then(async (acf) => {
        const fs = acf?.form_section ?? {};
        const fc = fs?.form_card     ?? {};

        setData({
          badge_text:     fs.badge_text     || DEFAULTS.badge_text,
          heading:        fs.heading        || DEFAULTS.heading,
          sub_heading:    fs.discerption    || DEFAULTS.sub_heading, // WP typo in ACF
          form_title:     fc.form_title     || DEFAULTS.form_title,
          form_sub_title: fc.form_sub_title || DEFAULTS.form_sub_title,
        });

        const img = await resolveImg(fc.form_image || "");
        setImgUrl(img);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="cfs" aria-label="Contact form section">
      <div className="cfs__container">

        {/* Top: badge + heading */}
        <div className="cfs__top">
          {!loading && data.badge_text && (
            <div className="badge-sec cfs__badge">
              <span className="badge-sec__icon" aria-hidden="true" />
              <span>{data.badge_text}</span>
            </div>
          )}
          {loading ? (
            <div className="cfs__skeleton cfs__skeleton--heading" aria-hidden="true" />
          ) : (
            <h2 className="cfs__heading">{data.heading}</h2>
          )}
          {loading ? (
            <div className="cfs__skeleton cfs__skeleton--text" aria-hidden="true" />
          ) : (
            <p className="cfs__sub-heading">{data.sub_heading}</p>
          )}
        </div>

        {/* Bottom: form card + image */}
        <div className="cfs__body">

          {/* Left: form card */}
          <div className="cfs__card">
            {loading ? (
              <>
                <div className="cfs__skeleton cfs__skeleton--title" aria-hidden="true" />
                <div className="cfs__skeleton cfs__skeleton--text"  aria-hidden="true" />
              </>
            ) : (
              <>
                <h3 className="cfs__card-title">{data.form_title}</h3>
                <p  className="cfs__card-sub">{data.form_sub_title}</p>
              </>
            )}
            <ContactForm />
          </div>

          {/* Right: image */}
          <div className="cfs__image-wrap" aria-hidden="true">
            {imgUrl ? (
              <img src={imgUrl} alt="" className="cfs__image" loading="lazy" />
            ) : (
              <div className="cfs__image-placeholder" />
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
