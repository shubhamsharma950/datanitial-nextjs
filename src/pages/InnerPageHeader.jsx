/**
 * InnerPageHeader.jsx
 * Standalone reusable header for all inner pages.
 * Renders a white rounded desktop navbar (logo left, nav center, CTA right)
 * and a transparent mobile header (logo + hamburger).
 *
 * Usage:
 *   import InnerPageHeader from "./InnerPageHeader";
 *   <InnerPageHeader />
 */

import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

/* ── WordPress data endpoints ── */
const WP_BASE = "https://darkred-worm-224502.hostingersite.com/wp-json";
const SITE_ORIGIN = "darkred-worm-224502.hostingersite.com";

/* ── Static sub-menu definitions ── */
const SUBMENUS = {
  Solutions: [
    { title: "Web Data Extraction",         href: "/solutions/web-data-extraction" },
    { title: "Mobile Application Scraping", href: "/solutions/mobile-application-scraping" },
    { title: "Real Time API",               href: "/solutions/real-time-api" },
    { title: "RPA",                         href: "/solutions/rpa" },
    { title: "Data Analytics",              href: "/solutions/data-analytics" },
  ],
  Industries: [
    { title: "E-Commerce",                  href: "/industries/e-commerce" },
    { title: "Finance & Banking",           href: "/industries/finance-banking" },
    { title: "Healthcare",                  href: "/industries/healthcare" },
    { title: "Real Estate",                 href: "/industries/real-estate" },
    { title: "Travel & Hospitality",        href: "/industries/travel-hospitality" },
  ],
  Resources: [
    { title: "Blog",                        href: "/resources/blog" },
    { title: "Case Studies",               href: "/resources/case-studies" },
    { title: "Whitepapers",                href: "/resources/whitepapers" },
  ],
};

const HAS_CHILDREN = Object.keys(SUBMENUS);

/* ── Static fallback nav (used while WP loads or on error) ── */
const FALLBACK_NAV = [
  { id: 1, title: "About Us",    href: "/about-us" },
  { id: 2, title: "Solutions",   href: "/solutions" },
  { id: 3, title: "Industries",  href: "/industries" },
  { id: 4, title: "Resources",   href: "/resources" },
  { id: 5, title: "Contact Us",  href: "/contact-us" },
];

const FALLBACK_LOGO = {
  url: "https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/04/favss.png",
  alt: "Datanitial",
};

const FALLBACK_CTA = { label: "Get Quote", href: "/contact-us" };

/* ── Helpers ── */
function resolveHref(url = "") {
  try {
    const u = new URL(url);
    if (u.hostname === SITE_ORIGIN || u.hostname === "localhost") {
      return u.pathname;
    }
  } catch { /* already relative */ }
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

/* ════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════ */
export default function InnerPageHeader() {
  const [navItems,  setNavItems]  = useState(FALLBACK_NAV);
  const [logo,      setLogo]      = useState(FALLBACK_LOGO);
  const [cta,       setCta]       = useState(FALLBACK_CTA);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [openSub,   setOpenSub]   = useState(null); // which submenu is expanded
  const drawerRef                 = useRef(null);
  const location                  = useLocation();

  /* ── Fetch WP site-info + menu ── */
  useEffect(() => {
    Promise.allSettled([
      fetch(`${WP_BASE}/theme/v1/site-info`).then((r) => r.json()),
      fetch(`${WP_BASE}/custom/v1/menu`).then((r) => r.json()),
    ]).then(([siteRes, menuRes]) => {
      if (siteRes.status === "fulfilled") {
        const d = siteRes.value;
        if (d?.logo_url) setLogo({ url: d.logo_url, alt: d.logo_alt || "Datanitial" });
        const gq = d?.get_quote;
        if (gq && typeof gq === "object" && gq.label) {
          setCta({ label: gq.label, href: gq.url || "/contact-us" });
        }
      }
      if (menuRes.status === "fulfilled" && Array.isArray(menuRes.value) && menuRes.value.length) {
        const items = menuRes.value
          .sort((a, b) => (a.menu_order ?? 0) - (b.menu_order ?? 0))
          .map((item) => ({
            id:     item.ID,
            title:  item.title,
            href:   resolveHref(item.url),
            target: item.target === "_blank" ? "_blank" : "_self",
            internal: isInternal(item.url),
          }));
        setNavItems(items);
      }
    });
  }, []);

  /* ── Lock body scroll when drawer open ── */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  /* ── Close drawer on route change ── */
  useEffect(() => {
    setMenuOpen(false);
    setOpenSub(null);
  }, [location.pathname]);

  /* ── Close drawer on outside click ── */
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const ctaInternal = isInternal(cta.href);
  const closeMenu = () => { setMenuOpen(false); setOpenSub(null); };

  return (
    <>
      {/* ════════════════════════════════
          DESKTOP HEADER — white pill bar
      ════════════════════════════════ */}
      <header className="iph iph--desktop" role="banner">
        <div className="iph__pill">

          {/* Logo */}
          <Link to="/" className="iph__logo" aria-label={`${logo.alt} – go to homepage`}>
            <img src={logo.url} alt={logo.alt} height={48} />
          </Link>

          {/* Nav */}
          <nav className="iph__nav" aria-label="Inner page navigation">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href ||
                               location.pathname.startsWith(item.href + "/");
              return item.internal !== false ? (
                <Link
                  key={item.id}
                  to={item.href}
                  className={`iph__nav-link${isActive ? " iph__nav-link--active" : ""}`}
                >
                  {item.title}
                </Link>
              ) : (
                <a
                  key={item.id}
                  href={item.href}
                  className="iph__nav-link"
                  target={item.target}
                  rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                >
                  {item.title}
                </a>
              );
            })}
          </nav>

          {/* CTA */}
          {ctaInternal ? (
            <Link to={resolveHref(cta.href)} className="hdr__cta">
              {cta.label}
            </Link>
          ) : (
            <a href={cta.href} className="hdr__cta">
              {cta.label}
            </a>
          )}
        </div>
      </header>

      {/* ════════════════════════════════
          MOBILE HEADER — transparent bar
      ════════════════════════════════ */}
      <header className="iph iph--mobile" role="banner">
        <div className="iph__mobile-bar">

          {/* Mobile logo */}
          <Link to="/" className="iph__mobile-logo" aria-label={`${logo.alt} – go to homepage`}>
            <img src="https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/04/inner_mibile_log.png" alt={logo.alt} height={38} />
          </Link>

          {/* Hamburger */}
          <button
            className={`iph__burger${menuOpen ? " is-open" : ""}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="iph-mobile-drawer"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Backdrop */}
      <div
        className={`iph__backdrop${menuOpen ? " is-open" : ""}`}
        aria-hidden="true"
        onClick={closeMenu}
      />

      {/* ════════════════════════════════
          MOBILE DRAWER
      ════════════════════════════════ */}
      <nav
        id="iph-mobile-drawer"
        ref={drawerRef}
        className={`iph__drawer${menuOpen ? " is-open" : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        {/* Drawer top bar: logo left, close right */}
        <div className="iph__drawer-topbar">
          <Link to="/" className="iph__drawer-logo-link" onClick={closeMenu} aria-label={`${logo.alt} – go to homepage`}>
            <img src='https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/04/favss.png' alt={logo.alt} height={53} />
          </Link>
          <button
            className="iph__drawer-close"
            aria-label="Close menu"
            onClick={closeMenu}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round" />
              <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Drawer nav links */}
        <div className="iph__drawer-links">
          {navItems.map((item) => {
            const hasChildren = HAS_CHILDREN.includes(item.title);
            const isExpanded  = openSub === item.title;
            const isActive    = location.pathname === item.href ||
                                location.pathname.startsWith(item.href + "/");

            const toggleSub = (e) => {
              if (hasChildren) {
                e.preventDefault();
                setOpenSub(isExpanded ? null : item.title);
              }
            };

            return (
              <div key={item.id} className="iph__drawer-item">
                {/* Parent row */}
                {item.internal !== false ? (
                  <Link
                    to={hasChildren ? "#" : item.href}
                    className={`iph__drawer-link${isActive ? " iph__drawer-link--active" : ""}${hasChildren ? " has-children" : ""}`}
                    onClick={hasChildren ? toggleSub : closeMenu}
                  >
                    <span>{item.title}</span>
                    {hasChildren && (
                      <svg
                        className={`iph__drawer-chevron${isExpanded ? " is-open" : ""}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <polyline points="6 9 12 15 18 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className={`iph__drawer-link${hasChildren ? " has-children" : ""}`}
                    target={item.target}
                    rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                    onClick={hasChildren ? toggleSub : closeMenu}
                  >
                    <span>{item.title}</span>
                    {hasChildren && (
                      <svg
                        className={`iph__drawer-chevron${isExpanded ? " is-open" : ""}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <polyline points="6 9 12 15 18 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </a>
                )}

                {/* Sub-menu */}
                {hasChildren && isExpanded && (
                  <div className="iph__drawer-submenu">
                    {(SUBMENUS[item.title] || []).map((sub) => (
                      <Link
                        key={sub.href}
                        to={sub.href}
                        className="iph__drawer-sublink"
                        onClick={closeMenu}
                      >
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </>
  );
}

