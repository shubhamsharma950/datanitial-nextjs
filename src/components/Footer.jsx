import { useEffect, useState } from "react";
import { getFooterSiteInfo, getFooterOptions, getFooterMenuItems } from "../services/api";
import "./Footer.css";

/* ─────────────────────────────────────────────────────────────
   STATIC FALLBACK DATA
   Used when the WordPress API is unreachable / not yet set up.
───────────────────────────────────────────────────────────── */
const FALLBACK = {
  siteName: "Datanitial",
  description:
    "Datanitial offers advanced web data crawling services, transforming billions of web pages into actionable insights. We provide accurate, clean, and comprehensive data to help businesses uncover trends, make informed decisions, and stay ahead in their industry.",
  industries: [
    { ID: 1, title: "Enterprise Web Crawling",  url: "#" },
    { ID: 2, title: "Mobile App Scraping",       url: "#" },
    { ID: 3, title: "Web Scraping API",          url: "#" },
    { ID: 4, title: "Custom Data Extraction",    url: "#" },
    { ID: 5, title: "Price Scraping Services",   url: "#" },
    { ID: 6, title: "Real-Time Web Crawling",    url: "#" },
    { ID: 7, title: "Digital Shelf Analytics",   url: "#" },
    { ID: 8, title: "AI-Powered Scraping",       url: "#" },
  ],
  solutions: [
    { ID: 1, title: "Mobile App Scraping",          url: "#" },
    { ID: 2, title: "Real Time API",                url: "#" },
    { ID: 3, title: "Data Analytics Dashboard",     url: "#" },
    { ID: 4, title: "Hotel Price Monitoring",       url: "#" },
    { ID: 5, title: "Restaurant Details And Menu",  url: "#" },
  ],
  contact: {
    address: "Koramangala, Koramangala 8th Block, Bangalore – South, Karnataka",
    email:   "Info@Datanitial.Com",
    phone:   "+91 749 094 7694",
  },
  social: [
    { id: "facebook",  label: "Facebook",  url: "#" },
    { id: "twitter",   label: "Twitter",   url: "#" },
    { id: "instagram", label: "Instagram", url: "#" },
    { id: "youtube",   label: "YouTube",   url: "#" },
  ],
  whatsapp: "https://wa.me/917490947694",
};

/* ─────────────────────────────────────────────────────────────
   INLINE SVG ICONS  (crisp, pixel-perfect)
───────────────────────────────────────────────────────────── */
const icons = {
  /* ── Social ── */
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L2.25 2.25h6.988l4.26 5.632 4.746-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),

  /* ── Contact ── */
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),

  /* ── WhatsApp FAB ── */
  whatsapp: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  ),
};

/* ─────────────────────────────────────────────────────────────
   FOOTER COMPONENT
───────────────────────────────────────────────────────────── */
export default function Footer() {
  const [siteName,    setSiteName]    = useState(FALLBACK.siteName);
  const [description, setDescription] = useState(FALLBACK.description);
  const [industries,  setIndustries]  = useState(FALLBACK.industries);
  const [solutions,   setSolutions]   = useState(FALLBACK.solutions);
  const [contact,     setContact]     = useState(FALLBACK.contact);
  const [social,      setSocial]      = useState(FALLBACK.social);
  const [whatsapp,    setWhatsapp]    = useState(FALLBACK.whatsapp);

  const year = new Date().getFullYear();

  useEffect(() => {
    /* Site name + description from WP site-info endpoint */
    getFooterSiteInfo()
      .then((res) => {
        if (res?.data?.site_name)  setSiteName(res.data.site_name);
        if (res?.data?.tagline)    setDescription(res.data.tagline);
      })
      .catch(() => {});

    /* Industries menu */
    getFooterMenuItems("footer-industries")
      .then((items) => { if (items?.length) setIndustries(items); })
      .catch(() => {});

    /* Ready Solutions menu */
    getFooterMenuItems("footer-solutions")
      .then((items) => { if (items?.length) setSolutions(items); })
      .catch(() => {});

    /* Custom footer options (contact, social, whatsapp) */
    getFooterOptions()
      .then((res) => {
        if (!res?.data) return;
        const d = res.data;
        if (d.contact)  setContact(d.contact);
        if (d.social)   setSocial(d.social);
        if (d.whatsapp) setWhatsapp(d.whatsapp);
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="ftr" role="contentinfo">

      {/* ── Main columns ── */}
      <div className="ftr__main">
        <div className="ftr__grid">

          {/* Col 1 – Brand */}
          <div className="ftr__col ftr__col--brand">
            <a href="/" className="ftr__logo" aria-label={`${siteName} – home`}>
              <img src="/fav.png" alt="" width={33} height={44} aria-hidden="true" />
              <span>{siteName}</span>
            </a>
            <p className="ftr__desc">{description}</p>
            <ul className="ftr__social" aria-label="Social media">
              {social.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    className="ftr__social-link"
                    aria-label={s.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {icons[s.id] ?? null}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 2 – Industries */}
          <div className="ftr__col">
            <h3 className="ftr__heading">Industries</h3>
            <ul className="ftr__links">
              {industries.map((item) => (
                <li key={item.ID}>
                  <a href={item.url} className="ftr__link">
                    <span className="ftr__link-arrow" aria-hidden="true">›</span>
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 – Ready Solutions */}
          <div className="ftr__col">
            <h3 className="ftr__heading">Ready Solutions</h3>
            <ul className="ftr__links">
              {solutions.map((item) => (
                <li key={item.ID}>
                  <a href={item.url} className="ftr__link">
                    <span className="ftr__link-arrow" aria-hidden="true">›</span>
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 – Contact */}
          <div className="ftr__col">
            <h3 className="ftr__heading">Contact</h3>
            <ul className="ftr__contact">
              <li className="ftr__contact-item">
                <span className="ftr__contact-icon">{icons.pin}</span>
                <span>{contact.address}</span>
              </li>
              <li className="ftr__contact-item">
                <span className="ftr__contact-icon">{icons.mail}</span>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
              <li className="ftr__contact-item">
                <span className="ftr__contact-icon">{icons.phone}</span>
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* ── Watermark ── */}
      <div className="ftr__watermark" aria-hidden="true">
        TRUSTED DATA COMPLAINT
      </div>

      {/* ── Bottom bar ── */}
      <div className="ftr__bottom">
        <p>© {year} All rights reserved</p>
      </div>

      {/* ── WhatsApp FAB ── */}
      <a
        href={whatsapp}
        className="ftr__wa"
        aria-label="Chat on WhatsApp"
        target="_blank"
        rel="noopener noreferrer"
      >
        {icons.whatsapp}
      </a>

    </footer>
  );
}
