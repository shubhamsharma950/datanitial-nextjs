/**
 * ContactPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Contact Us inner page.
 *
 * WordPress setup:
 *   Page ID : 13
 *   ACF Group field name: contact_page
 *
 * ACF fields (inside the group):
 *   banner_title          → hero H1
 *   banner_discription    → hero subtitle
 *   badge_text            → content badge label
 *   contact_email         → displayed email address
 *   contact_phone         → displayed phone number
 *   contact_address       → displayed address (wysiwyg or text)
 *   sections (Repeater)   → optional dynamic content sections above the form
 *
 * The contact form submits to WordPress via Contact Form 7 REST endpoint.
 * Falls back to a mailto link if the endpoint is unavailable.
 */

import { useEffect, useState } from "react";
import InnerPageLayout  from "./InnerPageLayout";
import InnerPageContent from "./InnerPageContent";
import { WP_BASE }      from "../services/innerPageApi";
import "./ContactPage.css";

const PAGE_ID   = 13;
const ACF_FIELD = "contact_page";

/* ─────────────────────────────────────────────────────────────────────────
   Hook: fetch contact info from ACF
───────────────────────────────────────────────────────────────────────── */
function useContactInfo() {
  const [info, setInfo] = useState({ email: "", phone: "", address: "" });

  useEffect(() => {
    fetch(`${WP_BASE}/wp/v2/pages/${PAGE_ID}?_fields=acf`)
      .then((r) => r.json())
      .then((d) => {
        const acf = d?.acf?.[ACF_FIELD] ?? {};
        setInfo({
          email:   acf.contact_email   || "",
          phone:   acf.contact_phone   || "",
          address: acf.contact_address || "",
        });
      })
      .catch(() => {});
  }, []);

  return info;
}

/* ─────────────────────────────────────────────────────────────────────────
   Contact info cards
───────────────────────────────────────────────────────────────────────── */
function ContactInfoCards({ info }) {
  const items = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="22,6 12,13 2,6"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      label: "Email Us",
      value: info.email,
      href:  info.email ? `mailto:${info.email}` : null,
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      label: "Call Us",
      value: info.phone,
      href:  info.phone ? `tel:${info.phone.replace(/\s/g, "")}` : null,
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="10" r="3"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      label: "Our Office",
      value: info.address,
      href:  null,
    },
  ].filter((item) => item.value);

  if (!items.length) return null;

  return (
    <div className="cp__info-cards">
      {items.map((item, i) => (
        <div key={i} className="cp__info-card">
          <div className="cp__info-card__icon" aria-hidden="true">
            {item.icon}
          </div>
          <div className="cp__info-card__body">
            <span className="cp__info-card__label">{item.label}</span>
            {item.href ? (
              <a href={item.href} className="cp__info-card__value">
                {item.value}
              </a>
            ) : (
              <span
                className="cp__info-card__value"
                dangerouslySetInnerHTML={{ __html: item.value }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Contact form
───────────────────────────────────────────────────────────────────────── */
const INITIAL_FORM = {
  name:    "",
  email:   "",
  company: "",
  phone:   "",
  subject: "",
  message: "",
};

function ContactForm() {
  const [form,   setForm]   = useState(INITIAL_FORM);
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.name.trim())    e.name    = "Name is required.";
    if (!form.email.trim())   e.email   = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                              e.email   = "Enter a valid email address.";
    if (!form.message.trim()) e.message = "Message is required.";
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
      /* Try CF7 REST endpoint */
      const res = await fetch(
        `${WP_BASE}/contact-form-7/v1/contact-forms/1/feedback`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            "your-name":    form.name,
            "your-email":   form.email,
            "your-company": form.company,
            "your-phone":   form.phone,
            "your-subject": form.subject,
            "your-message": form.message,
          }),
        }
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
      /* Fallback: open mailto */
      const subject = encodeURIComponent(form.subject || "Contact from website");
      const body    = encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\nCompany: ${form.company}\nPhone: ${form.phone}\n\n${form.message}`
      );
      window.location.href = `mailto:info@datanitial.com?subject=${subject}&body=${body}`;
      setStatus("success");
      setForm(INITIAL_FORM);
    }
  }

  if (status === "success") {
    return (
      <div className="cp__form-success" role="alert">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="cp__form-success__icon">
          <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="1.8" />
          <path d="M8 12l3 3 5-5" stroke="#22c55e" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h3>Message Sent!</h3>
        <p>Thank you for reaching out. Our team will get back to you within 24 hours.</p>
        <button className="cp__form-reset" onClick={() => setStatus("idle")}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="cp__form" onSubmit={handleSubmit} noValidate aria-label="Contact form">
      <div className="cp__form-row">
        {/* Name */}
        <div className={`cp__form-group${errors.name ? " cp__form-group--error" : ""}`}>
          <label htmlFor="cf-name" className="cp__form-label">
            Full Name <span aria-hidden="true">*</span>
          </label>
          <input
            id="cf-name" type="text" name="name" value={form.name}
            onChange={handleChange} className="cp__form-input"
            placeholder="John Smith" autoComplete="name"
            aria-required="true"
            aria-describedby={errors.name ? "cf-name-err" : undefined}
          />
          {errors.name && (
            <span id="cf-name-err" className="cp__form-error" role="alert">{errors.name}</span>
          )}
        </div>

        {/* Email */}
        <div className={`cp__form-group${errors.email ? " cp__form-group--error" : ""}`}>
          <label htmlFor="cf-email" className="cp__form-label">
            Email Address <span aria-hidden="true">*</span>
          </label>
          <input
            id="cf-email" type="email" name="email" value={form.email}
            onChange={handleChange} className="cp__form-input"
            placeholder="john@company.com" autoComplete="email"
            aria-required="true"
            aria-describedby={errors.email ? "cf-email-err" : undefined}
          />
          {errors.email && (
            <span id="cf-email-err" className="cp__form-error" role="alert">{errors.email}</span>
          )}
        </div>
      </div>

      <div className="cp__form-row">
        {/* Company */}
        <div className="cp__form-group">
          <label htmlFor="cf-company" className="cp__form-label">Company</label>
          <input
            id="cf-company" type="text" name="company" value={form.company}
            onChange={handleChange} className="cp__form-input"
            placeholder="Acme Corp" autoComplete="organization"
          />
        </div>

        {/* Phone */}
        <div className="cp__form-group">
          <label htmlFor="cf-phone" className="cp__form-label">Phone Number</label>
          <input
            id="cf-phone" type="tel" name="phone" value={form.phone}
            onChange={handleChange} className="cp__form-input"
            placeholder="+1 (555) 000-0000" autoComplete="tel"
          />
        </div>
      </div>

      {/* Subject */}
      <div className="cp__form-group">
        <label htmlFor="cf-subject" className="cp__form-label">Subject</label>
        <input
          id="cf-subject" type="text" name="subject" value={form.subject}
          onChange={handleChange} className="cp__form-input"
          placeholder="How can we help you?"
        />
      </div>

      {/* Message */}
      <div className={`cp__form-group${errors.message ? " cp__form-group--error" : ""}`}>
        <label htmlFor="cf-message" className="cp__form-label">
          Message <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="cf-message" name="message" value={form.message}
          onChange={handleChange} className="cp__form-input cp__form-textarea"
          placeholder="Tell us about your project or data needs..."
          rows={6} aria-required="true"
          aria-describedby={errors.message ? "cf-message-err" : undefined}
        />
        {errors.message && (
          <span id="cf-message-err" className="cp__form-error" role="alert">{errors.message}</span>
        )}
      </div>

      {status === "error" && (
        <p className="cp__form-submit-error" role="alert">
          Something went wrong. Please try again or email us directly.
        </p>
      )}

      <button
        type="submit" className="cp__form-submit"
        disabled={status === "sending"} aria-busy={status === "sending"}
      >
        {status === "sending" ? (
          <><span className="cp__form-spinner" aria-hidden="true" /> Sending…</>
        ) : (
          <>
            Send Message
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="cp__form-submit-arrow">
              <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Contact section: info cards + form
───────────────────────────────────────────────────────────────────────── */
function ContactSection() {
  const info = useContactInfo();

  return (
    <section className="cp__section" aria-label="Contact information and form">
      <div className="cp__section-inner">
        {/* Left: info + cards */}
        <div className="cp__left">
          <div className="badge-sec cp__badge">
            <span className="badge-sec__icon" aria-hidden="true" />
            <span>GET IN TOUCH</span>
          </div>
          <h2 className="cp__left-title">Let's Start a Conversation</h2>
          <p className="cp__left-desc">
            Have a project in mind or want to learn more about our data solutions?
            Fill out the form and our team will get back to you within 24 hours.
          </p>
          <ContactInfoCards info={info} />
        </div>

        {/* Right: form */}
        <div className="cp__right">
          <div className="cp__form-card">
            <h3 className="cp__form-card__title">Send Us a Message</h3>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Page export
───────────────────────────────────────────────────────────────────────── */
export default function ContactPage() {
  return (
    <InnerPageLayout
      pageId={PAGE_ID}
      acfField={ACF_FIELD}
      fallbackTitle="Contact Us"
      fallbackDescription="Get in touch with our team. We'd love to hear from you and help your business grow."
    >
      {/* Dynamic ACF sections (intro text, etc.) */}
      <InnerPageContent
        pageId={PAGE_ID}
        acfField={ACF_FIELD}
        badgeText=""
      />

      {/* Contact info + form */}
      <ContactSection />
    </InnerPageLayout>
  );
}
