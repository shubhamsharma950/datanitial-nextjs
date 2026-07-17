/**
 * Header.jsx  —  Homepage / public-facing header
 * ─────────────────────────────────────────────────────────────────────────────
 * Desktop: sticky bar — logo | nav links | CTA button
 * Mobile:  hamburger → slide-in drawer with accordion submenus
 *
 * Submenus are fetched dynamically from WordPress:
 *   Solutions  → WP menu slug "footer-solutions"
 *   Industries → WP menu slug "footer-industries"
 *   Resources  → direct link to /resources (no dropdown)
 *
 * Primary nav items come from the custom /custom/v1/menu endpoint.
 * Logo + CTA come from /theme/v1/site-info.
 */

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Header.css";

import WP_BASE from "../services/wpBase";

const SITE_ORIGIN = "mediumvioletred-cod-278845.hostingersite.com";

/* ── Nav items whose title triggers a dropdown ── */
const DROPDOWN_TITLES = ["Solutions", "Industries"];

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
        id:    item.ID,
        title: item.title ?? "",
        href:  resolveHref(item.url ?? "#"),
      }));
  } catch {
    return [];
  }
}

/* ════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════ */
export default function Header() {
  const [navItems,   setNavItems]   = useState([]);
  const [submenus,   setSubmenus]   = useState({ Solutions: [], Industries: [] });
  const [logoUrl,    setLogoUrl]    = useState("");
  const [logoAlt,    setLogoAlt]    = useState("Datanitial");
  const [ctaLabel,   setCtaLabel]   = useState("Get Quote");
  const [ctaUrl,     setCtaUrl]     = useState("/contact-us");
  const [loading,    setLoading]    = useState(true);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [openSub,    setOpenSub]    = useState(null);
  const mobileRef                   = useRef(null);
  const location                    = useLocation();

  /* ── Fetch site-info + primary nav + both submenus in parallel ── */
  useEffect(() => {
    Promise.allSettled([
      fetch(`${WP_BASE}/theme/v1/site-info`).then((r) => r.json()),
      fetch(`${WP_BASE}/menus/v1/menus/header-menu`).then((r) => r.json()),
      fetchMenuBySlug("footer-solutions"),
      fetchMenuBySlug("footer-industries"),
    ]).then(([siteRes, menuRes, solRes, indRes]) => {
      /* ── Site info ── */
      if (siteRes.status === "fulfilled") {
        const d = siteRes.value;
        if (d?.logo_url) setLogoUrl(d.logo_url);
        if (d?.logo_alt) setLogoAlt(d.logo_alt);
        if (d?.site_name && !d?.logo_url) setLogoAlt(d.site_name);
        const gq = d?.get_quote;
        if (gq && typeof gq === "object") {
          if (gq.label) setCtaLabel(gq.label);
          if (gq.url)   setCtaUrl(resolveHref(gq.url));
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
        Solutions:  solRes.status === "fulfilled" ? solRes.value  : [],
        Industries: indRes.status === "fulfilled" ? indRes.value  : [],
      });

      setLoading(false);
    });
  }, []);

  /* ── Sticky shadow ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  const closeMenu = () => { setMenuOpen(false); setOpenSub(null); };

  /* ── Chevron SVG ── */
  const Chevron = ({ open }) => (
    <svg
      className={`hdr__chevron${open ? " hdr__chevron--open" : ""}`}
      viewBox="0 0 24 24" fill="none" aria-hidden="true"
      width={14} height={14}
    >
      <polyline points="6 9 12 15 18 9" strokeWidth="2"
        stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

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
                <img
                  src="https://mediumvioletred-cod-278845.hostingersite.com/wp-content/uploads/2026/04/favss.png"
                  alt={logoAlt}
                  className="hdr__logo-favicon"
                />
                {logoUrl ? (
                  <img src={logoUrl} alt={logoAlt} className="hdr__logo-img" height={40} />
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
                  const hasDropdown = DROPDOWN_TITLES.includes(item.title);
                  const items       = submenus[item.title] ?? [];
                  const isActive    = location.pathname === item.href ||
                                      location.pathname.startsWith(item.href + "/");

                  /* Resources and other plain links — no dropdown */
                  if (!hasDropdown) {
                    return item.internal !== false ? (
                      <Link
                        key={item.id}
                        to={item.href}
                        className={`hdr__nav-link${isActive ? " hdr__nav-link--active" : ""}`}
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <a
                        key={item.id}
                        href={item.href}
                        className="hdr__nav-link"
                        target={item.target}
                        rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                      >
                        {item.title}
                      </a>
                    );
                  }

                  /* Solutions / Industries — dropdown on hover */
                  return (
                    <div key={item.id} className="hdr__nav-dropdown">
                      <Link
                        to={item.href === "#" ? item.href : item.href}
                        className={`hdr__nav-link hdr__nav-link--has-dropdown${isActive ? " hdr__nav-link--active" : ""}`}
                        aria-haspopup="true"
                        onClick={(e) => item.href === "#" && e.preventDefault()}
                      >
                        {item.title}
                        <Chevron open={false} />
                      </Link>
                      {items.length > 0 && (
                        <div className="hdr__dropdown-panel" role="menu">
                          {items.map((sub) => (
                            <Link
                              key={sub.id}
                              to={sub.href}
                              className="hdr__dropdown-item"
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

          {/* ── Desktop CTA ── */}
          <Link to={ctaUrl} className="hdr__cta">{ctaLabel}</Link>

          {/* ── Hamburger ── */}
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

      {/* ── Backdrop ── */}
      <div
        className={`hdr__overlay${menuOpen ? " is-open" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* ── Mobile drawer ── */}
      <nav
        id="mobile-nav"
        ref={mobileRef}
        className={`hdr__mobile${menuOpen ? " is-open" : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={menuOpen ? "false" : "true"}
      >
        {/* Drawer top bar */}
        <div className="hdr__mobile-topbar">
          <Link to="/" className="hdr__mobile-drawer-logo" onClick={closeMenu} aria-label={`${logoAlt} – go to homepage`}>
            <img
              src="https://mediumvioletred-cod-278845.hostingersite.com/wp-content/uploads/2026/04/favss.png"
              alt={logoAlt}
              height={36}
            />
          </Link>
          <button className="hdr__mobile-close" aria-label="Close menu" onClick={closeMenu}>
            <svg viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round" />
              <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <div className="hdr__mobile-links">
          {navItems.map((item) => {
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
              <div key={item.id} className="hdr__mobile-item">
                {item.internal !== false ? (
                  <Link
                    to={hasChildren ? "#" : item.href}
                    className={`hdr__mobile-link${isActive ? " hdr__mobile-link--active" : ""}${hasChildren ? " has-children" : ""}`}
                    onClick={hasChildren ? toggleSub : closeMenu}
                  >
                    <span>{item.title}</span>
                    {hasChildren && (
                      <svg
                        className={`hdr__mobile-chevron${isExpanded ? " is-open" : ""}`}
                        viewBox="0 0 24 24" fill="none"
                      >
                        <polyline points="6 9 12 15 18 9" strokeWidth="2"
                          stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className={`hdr__mobile-link${hasChildren ? " has-children" : ""}`}
                    target={item.target}
                    rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                    onClick={hasChildren ? toggleSub : closeMenu}
                  >
                    <span>{item.title}</span>
                    {hasChildren && (
                      <svg
                        className={`hdr__mobile-chevron${isExpanded ? " is-open" : ""}`}
                        viewBox="0 0 24 24" fill="none"
                      >
                        <polyline points="6 9 12 15 18 9" strokeWidth="2"
                          stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </a>
                )}

                {/* Accordion submenu */}
                {hasChildren && isExpanded && subItems.length > 0 && (
                  <div className="hdr__mobile-submenu">
                    {subItems.map((sub) => (
                      <Link
                        key={sub.id}
                        to={sub.href}
                        className="hdr__mobile-sublink"
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
