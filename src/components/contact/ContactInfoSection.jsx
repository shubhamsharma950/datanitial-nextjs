/**
 * ContactInfoSection.jsx  —  Section 2
 * "Get in Touch" — heading, sub-heading, three info cards.
 *
 * Data source: contactApi → acf.info_section
 * Fields used:
 *   info_section (Group)
 *     ├── heading        → Text
 *     ├── sub_heading    → Text Area
 *     └── contact_items (Group)
 *           ├── email (Group)
 *           │     ├── icon       → Icon Picker  { value, type }
 *           │     ├── label      → Text
 *           │     └── link_value → Link         { url, title }
 *           ├── phone_call (Group)
 *           │     ├── icon       → Icon Picker
 *           │     ├── label      → Text
 *           │     └── link_value → Link
 *           └── office_address (Group)
 *                 ├── icon       → Icon Picker
 *                 ├── label      → Text
 *                 └── link_value → Link
 */

import { useEffect, useState } from "react";
import { fetchContactPage, resolveImg } from "./contactApi";
import "./ContactInfoSection.css";

/* ─────────────────────────────────────────────────────────────────────────
   Resolve ACF Link field → { url, title, target }
   Link field returns: { url, title, target } or a plain URL string
───────────────────────────────────────────────────────────────────────── */
function resolveLink(linkVal) {
  if (!linkVal) return { url: "", title: "" };
  if (typeof linkVal === "string") return { url: linkVal, title: linkVal };
  return {
    url:    linkVal.url    || "",
    title:  linkVal.title  || "",
    target: linkVal.target || "_self",
  };
}



const DEFAULTS = {
  heading:    "Get in Touch",
  sub_heading: "Have questions, feedback, or need assistance? Reach out to our team, and we'll be happy to help.",
  items: [
    { key: "email",          label: "Email Support",  iconUrl: "", link: { url: "mailto:info@datanitial.com", title: "info@datanitial.com" } },
    { key: "phone_call",     label: "Call Us",        iconUrl: "", link: { url: "tel:+917490947694",         title: "+91 7490947694" } },
    { key: "office_address", label: "Office Address", iconUrl: "", link: { url: "",                          title: "Koramangala 8th Block, Karnataka" } },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────
   Parse contact_items group → normalised array (async — resolves img URLs)
───────────────────────────────────────────────────────────────────────── */
async function buildItems(contactItems) {
  const keys = ["email", "phone_call", "office_address"];

  const results = await Promise.all(
    keys.map(async (key) => {
      const grp = contactItems?.[key];
      if (!grp) return null;

      const iconUrl = await resolveImg(grp.icon || "");
      const link    = resolveLink(grp.link_value);
      const label   = grp.label || "";

      if (!label && !link.title && !link.url) return null;

      return { key, label, iconUrl, link };
    })
  );

  return results.filter(Boolean);
}

/* ─────────────────────────────────────────────────────────────────────────
   Icon renderer — WP media image from ACF
───────────────────────────────────────────────────────────────────────── */
function CardIcon({ iconUrl, label }) {
  if (!iconUrl) return null;
  return (
    <img
      src={iconUrl}
      alt={label ? `${label} icon` : ""}
      className="cis__card-icon-img"
      loading="lazy"
      aria-hidden="true"
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   ContactInfoSection — exported component
───────────────────────────────────────────────────────────────────────── */
export default function ContactInfoSection() {
  const [heading,    setHeading]    = useState(DEFAULTS.heading);
  const [subHeading, setSubHeading] = useState(DEFAULTS.sub_heading);
  const [items,      setItems]      = useState(DEFAULTS.items);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    fetchContactPage()
      .then(async (acf) => {
        const is = acf?.info_section ?? {};

        setHeading(is.heading        || DEFAULTS.heading);
        setSubHeading(is.sub_heading || DEFAULTS.sub_heading);

        const parsed = await buildItems(is.contact_items);
        setItems(parsed.length ? parsed : DEFAULTS.items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="cis" aria-label="Contact information">
      <div className="cis__container">

        {/* Heading */}
        <div className="cis__top">
          {loading ? (
            <div className="cis__skeleton cis__skeleton--heading" aria-hidden="true" />
          ) : (
            <h2 className="cis__heading head-title">{heading}</h2>
          )}
          {loading ? (
            <div className="cis__skeleton cis__skeleton--text" aria-hidden="true" />
          ) : (
            <p className="cis__sub-heading head__desc">{subHeading}</p>
          )}
        </div>

        {/* Cards */}
        <div className="cis__cards" role="list">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="cis__card cis__card--skeleton" aria-hidden="true">
                  <div className="cis__skeleton cis__skeleton--icon" />
                  <div className="cis__skeleton cis__skeleton--label" />
                  <div className="cis__skeleton cis__skeleton--value" />
                </div>
              ))
            : items.map((item) => {
                const { url, title, target } = item.link;
                const isLink = !!url;

                return (
                  <div key={item.key} className="cis__card" role="listitem">
                    {/* Icon */}
                    <div className="cis__card-icon" aria-hidden="true">
                      <CardIcon iconUrl={item.iconUrl} label={item.label} />
                    </div>

                    {/* Label */}
                    <h3 className="cis__card-label">{item.label}</h3>

                    {/* Value — address is plain text, others linked if url present */}
                    {isLink && item.key !== "office_address" ? (
                      <a
                        href={url}
                        className="cis__card-value cis__card-value--link"
                        target={target === "_blank" ? "_blank" : undefined}
                        rel={target === "_blank" ? "noopener noreferrer" : undefined}
                      >
                        {title || url}
                      </a>
                    ) : (
                      <span
                        className="cis__card-value"
                        dangerouslySetInnerHTML={{ __html: title }}
                      />
                    )}
                  </div>
                );
              })}
        </div>

      </div>
    </section>
  );
}
