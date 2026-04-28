import { useEffect, useRef, useState } from "react";
import "./Header.css";

/* ── WordPress REST API base URL from env, falls back to production ── */
const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.NEXT_PUBLIC_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

export default function Header() {
  /* ── State ── */
  const [navItems,  setNavItems]  = useState([]);
  const [logoUrl,   setLogoUrl]   = useState("");
  const [logoAlt,   setLogoAlt]   = useState("Datanitial");
  const [ctaLabel,  setCtaLabel]  = useState("Get Quote");
  const [ctaUrl,    setCtaUrl]    = useState("/get-quote");
  const [loading,   setLoading]   = useState(true);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [scrolled,  setScrolled]  = useState(false);
  const mobileRef                 = useRef(null);

  /* ── Fetch all header data from WordPress ── */
  useEffect(() => {
    // Run both requests in parallel
    Promise.allSettled([

      // 1. Site info → logo + get_quote CTA
      fetch(`${WP_BASE}/theme/v1/site-info`)
        .then((r) => r.json()),

      // 2. Nav menu items
      fetch(`${WP_BASE}/custom/v1/menu`)
        .then((r) => r.json()),

    ]).then(([siteRes, menuRes]) => {

      // ── Logo & CTA ──
      if (siteRes.status === "fulfilled") {
        const d = siteRes.value;
        if (d?.logo_url)  setLogoUrl(d.logo_url);
        if (d?.logo_alt)  setLogoAlt(d.logo_alt);
        if (d?.site_name && !d?.logo_url) setLogoAlt(d.site_name);

        // get_quote can be { label, url, target } (ACF Link) or a plain string
        const gq = d?.get_quote;
        if (gq && typeof gq === "object") {
          if (gq.label)  setCtaLabel(gq.label);
          if (gq.url)    setCtaUrl(gq.url);
        } else if (typeof gq === "string" && gq) {
          setCtaLabel(gq);
        }
      }

      // ── Nav items ──
      if (menuRes.status === "fulfilled" && Array.isArray(menuRes.value)) {
        const items = menuRes.value
          .sort((a, b) => (a.menu_order ?? 0) - (b.menu_order ?? 0))
          .map((item) => ({
            id:     item.ID,
            title:  item.title,
            url:    item.url,
            target: item.target === "_blank" ? "_blank" : "_self",
          }));
        if (items.length) setNavItems(items);
      }

      setLoading(false);
    });
  }, []);

  /* ── Sticky shadow on scroll ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Close mobile menu on outside click ── */
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (e.target.closest(".hdr__burger")) return;
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  /* ── Render ── */
  return (
    <header className={`hdr${scrolled ? " hdr--scrolled" : ""}`}>
      <div className="hdr__inner">

        {/* ── Logo — dynamic from WordPress ── */}
        <a href="/" className="hdr__logo" aria-label={`${logoAlt} – go to homepage`}>
          {loading ? (
            <span className="hdr__logo-skeleton" aria-hidden="true" />
          ) : logoUrl ? (
            <img
              src={logoUrl}
              alt={logoAlt}
              className="hdr__logo-img"
              height={40}
            />
          ) : (
            /* Fallback text logo if WP has no logo set */
            <span className="hdr__logo-text">
              {logoAlt}
              <small>TRUSTED DATA COMPLAINT</small>
            </span>
          )}
        </a>

        {/* ── Desktop nav — dynamic from WordPress ── */}
        <nav className="hdr__nav" aria-label="Primary navigation">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="hdr__nav-skeleton" aria-hidden="true" />
              ))
            : navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  className="hdr__nav-link"
                  target={item.target}
                  rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                >
                  {item.title}
                </a>
              ))}
        </nav>

        {/* ── CTA button — dynamic from ACF "get_quote" field ── */}
        <a href={ctaUrl} className="hdr__cta">
          {ctaLabel}
        </a>

        {/* ── Hamburger (mobile) ── */}
        <button
          className={`hdr__burger${menuOpen ? " is-open" : ""}`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      <nav
        id="mobile-nav"
        ref={mobileRef}
        className={`hdr__mobile${menuOpen ? " is-open" : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={menuOpen ? "false" : "true"}
      >
        {navItems.map((item) => (
          <a
            key={item.id}
            href={item.url}
            className="hdr__mobile-link"
            target={item.target}
            rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            {item.title}
          </a>
        ))}
        <a
          href={ctaUrl}
          className="hdr__cta hdr__cta--mobile"
          onClick={() => setMenuOpen(false)}
        >
          {ctaLabel}
        </a>
      </nav>
    </header>
  );
}
