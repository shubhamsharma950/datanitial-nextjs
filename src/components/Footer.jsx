import { useEffect, useState } from "react";
import { getFooterPostData, getFooterSocial } from "../services/api";
import "./Footer.css";

const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_WP_REST_URL) ||
  "https://mediumvioletred-cod-278845.hostingersite.com/wp-json";

const SITE_ORIGIN = "mediumvioletred-cod-278845.hostingersite.com";

/** Strip domain → relative path; keep external URLs as-is */
function resolveHref(url = "") {
  try {
    const u = new URL(url);
    if (u.hostname === SITE_ORIGIN || u.hostname === "localhost") return u.pathname;
  } catch { /* already relative */ }
  if (url.startsWith("/") || url.startsWith("#")) return url;
  return url;
}

/** Fetch a WP menu by slug → [{ id, title, href }] */
async function fetchMenuBySlug(slug) {
  try {
    const res = await fetch(`${WP_BASE}/menus/v1/menus/${slug}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.items ?? [])
      .sort((a, b) => (a.menu_order ?? 0) - (b.menu_order ?? 0))
      .map((item) => ({
        id:    item.ID,
        title: item.title ?? "",
        href:  resolveHref(item.url ?? "#"),
      }));
  } catch {
    return [];
  }
}

/* ─────────────────────────────────────────────────────────────
   INLINE SVG ICONS  (crisp, pixel-perfect)
───────────────────────────────────────────────────────────── */
const icons = {
  /* ── Social ── */
  medium: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
     <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
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
  const [logo,        setLogo]        = useState("");
  const [description, setDescription] = useState("");
  const [industries,  setIndustries]  = useState([]);
  const [solutions,   setSolutions]   = useState([]);
  const [contact,     setContact]     = useState({ address: "", email: "", phone: "" });
  const [social,      setSocial]      = useState([]);
  const [whatsapp,    setWhatsapp]    = useState("");

  const year = new Date().getFullYear();

  useEffect(() => {
    /* ── Brand / contact / social from ACF (unchanged) ── */
    getFooterPostData()
      .then((data) => {
        if (!data) return;
        if (data.logo)        setLogo(data.logo);
        if (data.description) setDescription(data.description);
        if (data.contact)     setContact((prev) => ({ ...prev, ...Object.fromEntries(
          Object.entries(data.contact).filter(([, v]) => v)
        )}));
        if (data.whatsapp)    setWhatsapp(data.whatsapp);
      })
      .catch(() => {});

    /* ── Industries & Solutions menus fetched directly from WP ── */
    fetchMenuBySlug("footer-industries")
      .then((items) => { if (items.length) setIndustries(items); })
      .catch(() => {});

    fetchMenuBySlug("footer-solutions")
      .then((items) => { if (items.length) setSolutions(items); })
      .catch(() => {});

    /* ── Social icons ── */
    getFooterSocial()
      .then((items) => { if (items?.length) setSocial(items); })
      .catch(() => {});
  }, []);

  return (
    <footer className="ftr" role="contentinfo">

      {/* ── Main columns ── */}
      <div className="ftr__main">
        <div className="ftr__grid">

          {/* Col 1 – Brand */}
          <div className="ftr__col ftr__col--brand">
            <a href="/" className="ftr__logo" aria-label="Home">
              {logo && <img src={logo} alt="Footer logo" />}
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
                    {s.icon_url
                      ? <img src={s.icon_url} alt={s.label} width={20} height={20} />
                      : (icons[s.id] ?? null)
                    }
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 2 + 3 – Industries & Ready Solutions (side-by-side on 380–768px) */}
          <div className="ftr__col--menus">

            {/* Col 2 – Industries */}
            <div className="ftr__col">
              <h3 className="ftr__heading">Industries</h3>
              <ul className="ftr__links">
                {industries.map((item) => (
                  <li key={item.id}>
                    <a href={item.href} className="ftr__link">
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
                  <li key={item.id}>
                    <a href={item.href} className="ftr__link">
                      <span className="ftr__link-arrow" aria-hidden="true">›</span>
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Col 4 – Contact */}
          <div className="ftr__col ftr__col--contact">
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
                <a href={`tel:${String(contact.phone || "").replace(/\s/g, "")}`}>{contact.phone}</a>
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
