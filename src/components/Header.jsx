import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Header.css";

/* ── WordPress REST API base URL from env, falls back to production ── */
const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.NEXT_PUBLIC_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

/* Nav items that have sub-menus (show chevron) */
const HAS_CHILDREN = ["Solutions", "Industries", "Resources"];

/**
 * Map WordPress menu URLs → React Router internal paths.
 * If the URL contains the site domain, strip it to a relative path.
 * External URLs (different domain) stay as <a href>.
 */
const SITE_ORIGIN = "darkred-worm-224502.hostingersite.com";

function resolveHref(url = "") {
  try {
    const u = new URL(url);
    if (u.hostname === SITE_ORIGIN || u.hostname === "localhost") {
      return u.pathname; // internal → relative path
    }
  } catch { /* relative URL already */ }
  // Already relative
  if (url.startsWith("/") || url.startsWith("#")) return url;
  return url;
}

function isInternal(url = "") {
  try {
    const u = new URL(url);
    return u.hostname === SITE_ORIGIN || u.hostname === "localhost";
  } catch {
    return url.startsWith("/") || url.startsWith("#");
  }
}

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
    Promise.allSettled([
      fetch(`${WP_BASE}/theme/v1/site-info`).then((r) => r.json()),
      fetch(`${WP_BASE}/custom/v1/menu`).then((r) => r.json()),
    ]).then(([siteRes, menuRes]) => {
      if (siteRes.status === "fulfilled") {
        const d = siteRes.value;
        if (d?.logo_url)  setLogoUrl(d.logo_url);
        if (d?.logo_alt)  setLogoAlt(d.logo_alt);
        if (d?.site_name && !d?.logo_url) setLogoAlt(d.site_name);
        const gq = d?.get_quote;
        if (gq && typeof gq === "object") {
          if (gq.label) setCtaLabel(gq.label);
          if (gq.url)   setCtaUrl(gq.url);
        } else if (typeof gq === "string" && gq) {
          setCtaLabel(gq);
        }
      }
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

  /* ── Lock body scroll when drawer is open ── */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const location = useLocation();
  const closeMenu = () => setMenuOpen(false);

  /* ── Render ── */
  return (
    <>
      <header className={`hdr${scrolled ? " hdr--scrolled" : ""}`}>
        <div className="hdr__inner">

          {/* ── Logo ── */}
          <Link to="/" className="hdr__logo" aria-label={`${logoAlt} – go to homepage`}>
            {loading ? (
              <span className="hdr__logo-skeleton" aria-hidden="true" />
            ) : (
              <>
                {/* Favicon icon — shown only on mobile */}
                <img
                  src="https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/04/favss.png"
                  alt={logoAlt}
                  className="hdr__logo-favicon"
                />
                {/* Full logo — shown on desktop */}
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={logoAlt}
                    className="hdr__logo-img"
                    height={40}
                  />
                ) : (
                  <span className="hdr__logo-text">
                    {logoAlt}
                    <small>TRUSTED DATA COMPLAINT</small>
                  </span>
                )}
              </>
            )}
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hdr__nav" aria-label="Primary navigation">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="hdr__nav-skeleton" aria-hidden="true" />
                ))
              : navItems.map((item) => {
                  const href     = resolveHref(item.url);
                  const internal = isInternal(item.url);
                  const isActive = location.pathname === href;
                  return internal ? (
                    <Link
                      key={item.id}
                      to={href}
                      className={`hdr__nav-link${isActive ? " hdr__nav-link--active" : ""}`}
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <a
                      key={item.id}
                      href={item.url}
                      className="hdr__nav-link"
                      target={item.target}
                      rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                    >
                      {item.title}
                    </a>
                  );
                })}
          </nav>

          {/* ── Desktop CTA ── */}
          {isInternal(ctaUrl) ? (
            <Link to={resolveHref(ctaUrl)} className="hdr__cta">{ctaLabel}</Link>
          ) : (
            <a href={ctaUrl} className="hdr__cta">{ctaLabel}</a>
          )}

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
      </header>

      {/* ── Backdrop overlay ── */}
      <div
        className={`hdr__overlay${menuOpen ? " is-open" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* ── Mobile drawer — slides in from right ── */}
      <nav
        id="mobile-nav"
        ref={mobileRef}
        className={`hdr__mobile${menuOpen ? " is-open" : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={menuOpen ? "false" : "true"}
      >
        {/* Close (×) button */}
        <button
          className="hdr__mobile-close"
          aria-label="Close menu"
          onClick={closeMenu}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Nav links */}
        {navItems.map((item) => {
          const href      = resolveHref(item.url);
          const internal  = isInternal(item.url);
          const hasChildren = HAS_CHILDREN.includes(item.title);
          const isActive  = location.pathname === href;

          const inner = (
            <>
              {item.title}
              {hasChildren && (
                <svg className="chevron" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              )}
            </>
          );

          return internal ? (
            <Link
              key={item.id}
              to={href}
              className={`hdr__mobile-link${isActive ? " hdr__mobile-link--active" : ""}`}
              onClick={closeMenu}
            >
              {inner}
            </Link>
          ) : (
            <a
              key={item.id}
              href={item.url}
              className="hdr__mobile-link"
              target={item.target}
              rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
              onClick={closeMenu}
            >
              {inner}
            </a>
          );
        })}

        {/* Mobile CTA */}
        {/* <a
          href={ctaUrl}
          className="hdr__cta hdr__cta--mobile"
          onClick={closeMenu}
        >
          {ctaLabel}
        </a> */}
      </nav>
    </>
  );
}
