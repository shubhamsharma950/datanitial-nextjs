import { useEffect, useRef, useState } from "react";
import { getHeaderMenuItems, getSiteInfo } from "../services/api";
import "./Header.css";

const WP_BASE    = "http://localhost/wordpress/wp-json";
const FALLBACK_NAV = [
  { id: 1, title: "About Us",   url: "#about",      target: "_self" },
  { id: 2, title: "Solutions",  url: "#solutions",  target: "_self" },
  { id: 3, title: "Industries", url: "#industries", target: "_self" },
  { id: 4, title: "Resources",  url: "#resources",  target: "_self" },
  { id: 5, title: "Contact Us", url: "#contact",    target: "_self" },
];

export default function Header() {
  const [navItems,  setNavItems]  = useState([]);
  const [siteInfo,  setSiteInfo]  = useState({
    site_name: "Datanitial",
    logo_url:  "",
    logo_alt:  "Datanitial",
    get_quote: { label: "Get Quote", url: "/get-quote" },
  });
  /* CTA from ACF via custom/v1/menu endpoint */
  const [ctaLabel,  setCtaLabel]  = useState("Get Quote");
  const [ctaUrl,    setCtaUrl]    = useState("/get-quote");
  const [loading,   setLoading]   = useState(true);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [scrolled,  setScrolled]  = useState(false);
  const mobileRef                 = useRef(null);

  /* ── Fetch CTA from ACF custom endpoint ── */
  useEffect(() => {
    fetch(`${WP_BASE}/custom/v1/menu`)
      .then((res) => res.json())
      .then((data) => {
        // data[0].acf can be a string label or an object { label, url }
        const acf = data?.[0]?.acf;
        if (acf && typeof acf === "object") {
          if (acf.label) setCtaLabel(acf.label);
          if (acf.url)   setCtaUrl(acf.url);
        } else if (acf && typeof acf === "string") {
          setCtaLabel(acf);
        }
      })
      .catch(() => {
        // keep fallback values
      });
  }, []);

  /* ── Fetch site info + nav menu from WordPress ── */
  useEffect(() => {
    Promise.allSettled([
      getSiteInfo(),
      getHeaderMenuItems(),
    ]).then(([infoRes, menuRes]) => {
      if (infoRes.status === "fulfilled" && infoRes.value) {
        setSiteInfo(infoRes.value);
      }
      if (menuRes.status === "fulfilled" && menuRes.value?.length) {
        setNavItems(menuRes.value);
      } else {
        setNavItems(FALLBACK_NAV);
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
      // Don't close if clicking the burger button itself (it handles its own toggle)
      if (e.target.closest(".hdr__burger")) return;
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <header className={`hdr${scrolled ? " hdr--scrolled" : ""}`}>
      <div className="hdr__inner">

        {/* ── Logo ── */}
        <a href="/" className="hdr__logo" aria-label={`${siteInfo.site_name} – go to homepage`}>
          {loading ? (
            <span className="hdr__logo-skeleton" aria-hidden="true" />
          ) : (
            <img
              src={siteInfo.logo_url || "/favicon.png"}
              alt={siteInfo.logo_alt || siteInfo.site_name}
              className="hdr__logo-img"
              height={40}
            />
          )}
        </a>

        {/* ── Desktop nav ── */}
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

        {/* ── CTA button — label & URL from ACF via custom/v1/menu ── */}
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
