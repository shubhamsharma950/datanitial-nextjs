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
 *           ├── form_image              → Image
 *           └── contact_form_shortcode  → Text Area
 */

import { useEffect, useState } from "react";
import { fetchContactPage, resolveImg, WP_BASE } from "./contactApi";
import "./ContactFormSection.css";

/* ── Default fallback content ── */
const DEFAULTS = {
  badge_text:     "GET IN TOUCH",
  heading:        "Let's Talk. Let's Build.",
  sub_heading:    "Have a question, suggestion, or just want to say hello? Our team is ready to assist.",
  form_title:     "Send us a message",
  form_sub_title: "Don't Hesitate, we're just a message away. Our Super friendly team will get back to you as soon as possible",
  form_image:     "",
  shortcode:      "",
};

const INITIAL_FORM = {
  "your-firstname": "",
  "your-email":     "",
  "your-phone":     "",
  "your-subject":   "",
  "your-message":   "",
};

/* ─────────────────────────────────────────────────────────────────────────
   Contact Form
───────────────────────────────────────────────────────────────────────── */
function ContactForm() {
  const [form,   setForm]   = useState(INITIAL_FORM);
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form["your-firstname"].trim()) e["your-firstname"] = "First name is required.";
    if (!form["your-email"].trim())     e["your-email"]     = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form["your-email"]))
                                        e["your-email"]     = "Enter a valid email.";
    if (!form["your-message"].trim())   e["your-message"]   = "Message is required.";
    return e;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setStatus("sending");

    try {
      const acfData = await fetchContactPage().catch(() => ({}));
      const formId  = acfData?.cf7_form_id || 1;

      const body = new URLSearchParams();
      Object.entries(form).forEach(([k, v]) => body.append(k, v));

      const res = await fetch(
        `${WP_BASE}/contact-form-7/v1/contact-forms/${formId}/feedback`,
        { method: "POST", body }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data?.status === "mail_sent") {
        setStatus("success");
        setForm(INITIAL_FORM);
      } else {
        setStatus("error");
      }
    } catch {
      /* Fallback: mailto */
      const subject = encodeURIComponent(form["your-subject"] || "Contact from website");
      const bodyStr = encodeURIComponent(
        `Name: ${form["your-firstname"]}\nEmail: ${form["your-email"]}\nPhone: ${form["your-phone"]}\n\n${form["your-message"]}`
      );
      window.location.href = `mailto:info@datanitial.com?subject=${subject}&body=${bodyStr}`;
      setStatus("success");
      setForm(INITIAL_FORM);
    }
  }

  if (status === "success") {
    return (
      <div className="cfs__success" role="alert">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="cfs__success-icon">
          <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="1.8" />
          <path d="M8 12l3 3 5-5" stroke="#22c55e" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h3>Message Sent!</h3>
        <p>Thank you for reaching out. Our team will get back to you shortly.</p>
        <button className="cfs__success-reset" onClick={() => setStatus("idle")}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="cfs__form" onSubmit={handleSubmit} noValidate aria-label="Contact form">
      {/* Row 1: First Name + Email */}
      <div className="cfs__form-row">
        <div className={`cfs__form-group${errors["your-firstname"] ? " cfs__form-group--error" : ""}`}>
          <label htmlFor="cfs-firstname" className="cfs__form-label">First Name</label>
          <input
            id="cfs-firstname" type="text" name="your-firstname"
            value={form["your-firstname"]} onChange={handleChange}
            className="cfs__form-input" placeholder="Enter your First Name"
            autoComplete="given-name" aria-required="true"
            aria-describedby={errors["your-firstname"] ? "cfs-firstname-err" : undefined}
          />
          {errors["your-firstname"] && (
            <span id="cfs-firstname-err" className="cfs__form-error" role="alert">
              {errors["your-firstname"]}
            </span>
          )}
        </div>

        <div className={`cfs__form-group${errors["your-email"] ? " cfs__form-group--error" : ""}`}>
          <label htmlFor="cfs-email" className="cfs__form-label">Email</label>
          <input
            id="cfs-email" type="email" name="your-email"
            value={form["your-email"]} onChange={handleChange}
            className="cfs__form-input" placeholder="Enter your Email"
            autoComplete="email" aria-required="true"
            aria-describedby={errors["your-email"] ? "cfs-email-err" : undefined}
          />
          {errors["your-email"] && (
            <span id="cfs-email-err" className="cfs__form-error" role="alert">
              {errors["your-email"]}
            </span>
          )}
        </div>
      </div>

      {/* Row 2: Phone + Subject */}
      <div className="cfs__form-row">
        <div className="cfs__form-group">
          <label htmlFor="cfs-phone" className="cfs__form-label">Phone Number</label>
          <input
            id="cfs-phone" type="tel" name="your-phone"
            value={form["your-phone"]} onChange={handleChange}
            className="cfs__form-input" placeholder="Enter your Phone Number"
            autoComplete="tel"
          />
        </div>

        <div className="cfs__form-group">
          <label htmlFor="cfs-subject" className="cfs__form-label">Subject</label>
          <input
            id="cfs-subject" type="text" name="your-subject"
            value={form["your-subject"]} onChange={handleChange}
            className="cfs__form-input" placeholder="Enter your Subject"
          />
        </div>
      </div>

      {/* Message */}
      <div className={`cfs__form-group${errors["your-message"] ? " cfs__form-group--error" : ""}`}>
        <label htmlFor="cfs-message" className="cfs__form-label">Your Message</label>
        <textarea
          id="cfs-message" name="your-message"
          value={form["your-message"]} onChange={handleChange}
          className="cfs__form-input cfs__form-textarea"
          placeholder="Type your message"
          rows={5} aria-required="true"
          aria-describedby={errors["your-message"] ? "cfs-message-err" : undefined}
        />
        {errors["your-message"] && (
          <span id="cfs-message-err" className="cfs__form-error" role="alert">
            {errors["your-message"]}
          </span>
        )}
      </div>

      {status === "error" && (
        <p className="cfs__form-submit-error" role="alert">
          Something went wrong. Please try again.
        </p>
      )}

      <button
        type="submit" className="cfs__form-submit"
        disabled={status === "sending"} aria-busy={status === "sending"}
      >
        {status === "sending" ? (
          <><span className="cfs__spinner" aria-hidden="true" /> Sending…</>
        ) : (
          "Submit"
        )}
      </button>
    </form>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   ContactFormSection — exported component
───────────────────────────────────────────────────────────────────────── */
export default function ContactFormSection() {
  const [data,    setData]    = useState(DEFAULTS);
  const [imgUrl,  setImgUrl]  = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContactPage()
      .then(async (acf) => {
        // form_section group
        const fs = acf?.form_section ?? {};
        // form_card nested group inside form_section
        const fc = fs?.form_card ?? {};

        const merged = {
          badge_text:     fs.badge_text              || DEFAULTS.badge_text,
          heading:        fs.heading                 || DEFAULTS.heading,
          // WP field name is "discerption" (typo in ACF)
          sub_heading:    fs.discerption             || DEFAULTS.sub_heading,
          form_title:     fc.form_title              || DEFAULTS.form_title,
          form_sub_title: fc.form_sub_title          || DEFAULTS.form_sub_title,
          // contact_form_shortcode stored as raw text/HTML in form_card
          shortcode:      fc.contact_form_shortcode  || "",
        };
        setData(merged);

        // form_image lives inside form_card group
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
                <div className="cfs__skeleton cfs__skeleton--text" aria-hidden="true" />
              </>
            ) : (
              <>
                <h3 className="cfs__card-title">{data.form_title}</h3>
                <p className="cfs__card-sub">{data.form_sub_title}</p>
              </>
            )}
            {/* If WP provides a CF7 shortcode/HTML, render it; otherwise use built-in form */}
            {!loading && data.shortcode ? (
              <div
                className="cfs__shortcode"
                dangerouslySetInnerHTML={{ __html: data.shortcode }}
              />
            ) : (
              <ContactForm />
            )}
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
