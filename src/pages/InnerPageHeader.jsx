/**
 * InnerPageHeader.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Standalone header for all inner pages.
 *
 * Desktop: white pill bar — logo | nav links (with hover dropdowns) | CTA
 * Mobile:  transparent bar + slide-in drawer with accordion submenus
 *
 * All menu data is fetched from WordPress:
 *   Primary nav  → /custom/v1/menu  (same as homepage header)
 *   Solutions dropdown  → WP menu slug "footer-solutions"
 *   Industries dropdown → WP menu slug "footer-industries"
 *   Mobile drawer nav   → WP menu slug "secondary-menu"
 *   Resources           → direct link /resources (no dropdown)
 *
 * Logo + CTA come from /theme/v1/site-info.
 */

import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

import WP_BASE from "../services/wpBase";

const SITE_ORIGIN = "darkred-worm-224502.hostingersite.com";

/* ── Nav items whose title triggers a dropdown ── */
const DROPDOWN_TITLES = ["Solutions", "Industries"];

/* ── Fallbacks ── */
const FALLBACK_NAV = [
  { id: 1, title: "About Us",   href: "/about-us",   internal: true, target: "_self" },
  { id: 2, title: "Solutions",  href: "/solutions",  internal: true, target: "_self" },
  { id: 3, title: "Industries", href: "/industries", internal: true, target: "_self" },
  { id: 4, title: "Resources",  href: "/resources",  internal: true, target: "_self" },
  { id: 5, title: "Contact Us", href: "/contact-us", internal: true, target: "_self" },
];
const FALLBACK_LOGO = {
  url: "https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/04/favss.png",
  alt: "Datanitial",
};
const FALLBACK_CTA = { label: "Get Quote", href: "/contact-us" };

/* ── URL helpers ── */
function resolveHref(url = "") {
  try {
    const u = new URL(url);
    if (u.hostname === SITE_ORIGIN || u.hostname === "localhost") return u.pathname;
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

/** Fetch a WP menu by slug → [{ id, title, href }] */
async function fetchMenuBySlug(slug) {
  try {
    const res = await fetch(`${WP_BASE}/menus/v1/menus/${slug}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.items ?? [])
      .sort((a, b) => (a.menu_order ?? 0) - (b.menu_order ?? 0))
      .map((item) => ({
        id:       item.ID,
        title:    item.title ?? "",
        href:     resolveHref(item.url ?? "#"),
        target:   item.target === "_blank" ? "_blank" : "_self",
        internal: isInternal(item.url ?? ""),
      }));
  } catch {
    return [];
  }
}

/* ════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════ */
export default function InnerPageHeader() {
  const [navItems,  setNavItems]  = useState(FALLBACK_NAV);
  const [mobileNav, setMobileNav] = useState([]);          // secondary-menu
  const [submenus,  setSubmenus]  = useState({ Solutions: [], Industries: [] });
  const [logo,      setLogo]      = useState(FALLBACK_LOGO);
  const [cta,       setCta]       = useState(FALLBACK_CTA);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [openSub,   setOpenSub]   = useState(null);
  const drawerRef                 = useRef(null);
  const location                  = useLocation();

  /* ── Fetch everything in parallel ── */
  useEffect(() => {
    Promise.allSettled([
      fetch(`${WP_BASE}/theme/v1/site-info`).then((r) => r.json()),
      fetch(`${WP_BASE}/menus/v1/menus/header-menu`).then((r) => r.json()),
      fetchMenuBySlug("footer-solutions"),
      fetchMenuBySlug("footer-industries"),
      fetchMenuBySlug("secondary-menu"),
    ]).then(([siteRes, menuRes, solRes, indRes, secRes]) => {
      /* ── Site info ── */
      if (siteRes.status === "fulfilled") {
        const d = siteRes.value;
        if (d?.logo_url) setLogo({ url: d.logo_url, alt: d.logo_alt || "Datanitial" });
        const gq = d?.get_quote;
        if (gq && typeof gq === "object" && gq.label) {
          setCta({ label: gq.label, href: resolveHref(gq.url || "/contact-us") });
        }
      }

      /* ── Primary nav from WP "Primary Menu" (header-menu) ── */
      if (menuRes.status === "fulfilled") {
        const raw = menuRes.value?.items ?? menuRes.value;
        if (Array.isArray(raw) && raw.length) {
          const items = raw
            .sort((a, b) => (a.menu_order ?? 0) - (b.menu_order ?? 0))
            .map((item) => ({
              id:       item.ID,
              title:    item.title,
              href:     resolveHref(item.url),
              target:   item.target === "_blank" ? "_blank" : "_self",
              internal: isInternal(item.url),
            }));
          setNavItems(items);
        }
      }

      /* ── Submenus ── */
      setSubmenus({
        Solutions:  solRes.status === "fulfilled" ? solRes.value : [],
        Industries: indRes.status === "fulfilled" ? indRes.value : [],
      });

      /* ── Mobile secondary nav ── */
      if (secRes.status === "fulfilled" && secRes.value.length) {
        setMobileNav(secRes.value);
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

  const closeMenu = () => { setMenuOpen(false); setOpenSub(null); };

  /* ── Chevron SVG ── */
  const Chevron = ({ open }) => (
    <svg
      className={`iph__chevron${open ? " iph__chevron--open" : ""}`}
      viewBox="0 0 24 24" fill="none" aria-hidden="true"
      width={14} height={14}
    >
      <polyline points="6 9 12 15 18 9" strokeWidth="2"
        stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  /* ── Drawer nav: use secondary-menu if loaded, else fall back to primary nav ── */
  const drawerItems = mobileNav.length > 0 ? mobileNav : navItems;

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
              const hasDropdown = DROPDOWN_TITLES.includes(item.title);
              const dropItems   = submenus[item.title] ?? [];
              const isActive    = location.pathname === item.href ||
                                  location.pathname.startsWith(item.href + "/");

              /* Plain link — no dropdown */
              if (!hasDropdown) {
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
              }

              /* Solutions / Industries — hover dropdown */
              return (
                <div key={item.id} className="iph__nav-dropdown">
                  <Link
                    to={item.href === "#" ? item.href : item.href}
                    className={`iph__nav-link iph__nav-link--has-dropdown${isActive ? " iph__nav-link--active" : ""}`}
                    aria-haspopup="true"
                    onClick={(e) => item.href === "#" && e.preventDefault()}
                  >
                    {item.title}
                    <Chevron open={false} />
                  </Link>
                  {dropItems.length > 0 && (
                    <div className="iph__dropdown-panel" role="menu">
                      {dropItems.map((sub) => (
                        <Link
                          key={sub.id}
                          to={sub.href}
                          className="iph__dropdown-item"
                          role="menuitem"
                        >
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* CTA */}
          {isInternal(cta.href) ? (
            <Link to={cta.href} className="hdr__cta">{cta.label}</Link>
          ) : (
            <a href={cta.href} className="hdr__cta">{cta.label}</a>
          )}
        </div>
      </header>

      {/* ════════════════════════════════
          MOBILE HEADER — transparent bar
      ════════════════════════════════ */}
      <header className="iph iph--mobile" role="banner">
        <div className="iph__mobile-bar">
          <Link to="/" className="iph__mobile-logo" aria-label={`${logo.alt} – go to homepage`}>
            <img
              src="https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/04/inner_mibile_log.png"
              alt={logo.alt}
              height={38}
            />
          </Link>
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
        {/* Drawer top bar */}
        <div className="iph__drawer-topbar">
          <Link to="/" className="iph__drawer-logo-link" onClick={closeMenu} aria-label={`${logo.alt} – go to homepage`}>
            <img
              src="https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/04/favss.png"
              alt={logo.alt}
              height={53}
            />
          </Link>
          <button className="iph__drawer-close" aria-label="Close menu" onClick={closeMenu}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round" />
              <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Drawer nav links — from secondary-menu (or primary nav fallback) */}
        <div className="iph__drawer-links">
          {drawerItems.map((item) => {
            const hasChildren = DROPDOWN_TITLES.includes(item.title);
            const isExpanded  = openSub === item.title;
            const isActive    = location.pathname === item.href ||
                                location.pathname.startsWith(item.href + "/");
            const subItems    = submenus[item.title] ?? [];

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
                        viewBox="0 0 24 24" fill="none" aria-hidden="true"
                      >
                        <polyline points="6 9 12 15 18 9" strokeWidth="2"
                          stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
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
                        viewBox="0 0 24 24" fill="none" aria-hidden="true"
                      >
                        <polyline points="6 9 12 15 18 9" strokeWidth="2"
                          stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </a>
                )}

                {/* Accordion submenu */}
                {hasChildren && isExpanded && subItems.length > 0 && (
                  <div className="iph__drawer-submenu">
                    {subItems.map((sub) => (
                      <Link
                        key={sub.id}
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
