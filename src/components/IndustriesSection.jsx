import { useEffect, useState } from "react";
import "./IndustriesSection.css";

const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.NEXT_PUBLIC_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

const PRIMARY_URL  = `${WP_BASE}/theme/v1/industries`;
const FALLBACK_URL = `${WP_BASE}/wp/v2/pages/63?_fields=acf,title`;

/* ── Icons ── */
const StarIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="ind-badge__icon">
    <circle cx="10" cy="10" r="10" fill="#2E3192" />
    <g stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
      <line x1="10" y1="5.2" x2="10" y2="14.8" />
      <line x1="6.8" y1="7"  x2="13.2" y2="13" />
      <line x1="13.2" y1="7" x2="6.8"  y2="13" />
    </g>
  </svg>
);

/* ── Fallback tab data ── */
const FALLBACK_TABS = [
  { id: "real_estate",         label: "Real Estate",          icon: "", description: "Real estate data can be used to conduct market analysis, such as identifying trends in housing prices, rental rates, and inventory levels.", bullets: ["Identifying market trends","Conducting competitive analysis","Assessing property values","Targeting marketing efforts","Forecasting demand"], learn_more: "#", image: "" },
  { id: "food_delivery",       label: "Food Delivery",        icon: "", description: "Food delivery data helps optimize routes, track demand patterns, and improve customer satisfaction.", bullets: ["Route optimization","Demand forecasting","Customer behavior analysis","Menu performance tracking","Delivery time insights"], learn_more: "#", image: "" },
  { id: "mobility",            label: "Mobility",             icon: "", description: "Mobility data enables smarter transportation planning and fleet management.", bullets: ["Fleet tracking","Traffic pattern analysis","Ride demand forecasting","EV charging optimization","Urban mobility insights"], learn_more: "#", image: "" },
  { id: "retail_ecommerce",    label: "Retail & ecommerce",   icon: "", description: "Retail data powers competitive pricing, inventory management, and customer insights.", bullets: ["Price monitoring","Inventory optimization","Competitor analysis","Customer sentiment","Product trend tracking"], learn_more: "#", image: "" },
  { id: "travel_hospitality",  label: "Travel & Hospitality", icon: "", description: "Travel data helps businesses optimize pricing, availability, and customer experience.", bullets: ["Rate parity monitoring","Booking trend analysis","Review sentiment tracking","Competitor benchmarking","Demand forecasting"], learn_more: "#", image: "" },
  { id: "location_intelligence", label: "Location Intelligence", icon: "", description: "Location data provides insights for site selection, foot traffic analysis, and geo-targeted marketing.", bullets: ["Foot traffic analysis","Site selection","Geo-targeted marketing","Competitor proximity","Catchment area analysis"], learn_more: "#", image: "" },
];

/* ── Skeleton ── */
function Skeleton() {
  return (
    <section className="ind">
      <div className="container">
        <div className="ind__badge skeleton" style={{ width: 120, height: 30, borderRadius: 999, margin: "0 auto 20px" }} />
        <div className="skeleton" style={{ width: "55%", height: 44, margin: "0 auto 12px" }} />
        <div className="skeleton" style={{ width: "70%", height: 18, margin: "0 auto 40px" }} />
        <div className="skeleton" style={{ width: "100%", height: 56, borderRadius: 999, marginBottom: 32 }} />
        <div className="skeleton" style={{ width: "100%", height: 320, borderRadius: 20 }} />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   INDUSTRIES SECTION
   ACF: service_tab_systom on page 63
   Layout:
     - Badge + heading + sub-heading
     - Tab bar (pill buttons)
     - Content card: icon + description + bullets + learn more + image
═══════════════════════════════════════════════ */
export default function IndustriesSection() {
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [tabs,        setTabs]        = useState([]);
  const [activeTab,   setActiveTab]   = useState(0);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    fetch(PRIMARY_URL)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(d => {
        setTitle(d.title       || "Transforming Web Data into Business Intelligence");
        setDescription(d.description || "We deliver enterprise-grade data extraction and intelligence solutions.");
        setTabs(d.tabs?.length ? d.tabs : []);
      })
      .catch(() => {
        // Fallback: parse from native ACF endpoint
        fetch(FALLBACK_URL)
          .then(r => r.json())
          .then(d => {
            const acf = d?.acf;
            setTitle(acf?.title || "Transforming Web Data into Business Intelligence");
            setDescription(acf?.discreption || "We deliver enterprise-grade data extraction and intelligence solutions.");
            setTabs([]); // Will show empty state
          })
          .catch(() => {});
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;

  const active = tabs[activeTab] || tabs[0] || {};

  return (
    <section className="ind" aria-label="Industries">
      <div className="container">

        {/* ── Badge ── */}
        <div className="ind__badge-wrap">
          <div className="ind__badge">
            <StarIcon />
            <span>Industries</span>
          </div>
        </div>

        {/* ── Section header ── */}
        <div className="ind__header">
          {title       && <h2 className="ind__title">{title}</h2>}
          {description && <p  className="ind__desc">{description}</p>}
        </div>

        {/* ── Tab bar ── */}
        <div className="ind__tabs" role="tablist" aria-label="Industry tabs">
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={i === activeTab}
              aria-controls={`ind-panel-${tab.id}`}
              className={`ind__tab${i === activeTab ? " ind__tab--active" : ""}`}
              onClick={() => setActiveTab(i)}
            >
              {tab.icon && <img src={tab.icon} alt="" className="ind__tab-icon" />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Content card ── */}
        <div
          id={`ind-panel-${active.id}`}
          role="tabpanel"
          className="ind__card"
          key={active.id}
        >
          {/* Left: icon + description + bullets + CTA */}
          <div className="ind__card-left">
            {active.icon && (
              <img src={active.icon} alt={active.label} className="ind__card-icon" />
            )}

            {active.description && (
              <p className="ind__card-desc">{active.description}</p>
            )}

            {active.bullets?.length > 0 && (
              <ul className="ind__card-bullets">
                {active.bullets.map((b, i) => (
                  <li key={i} className="ind__card-bullet">
                    <span className="ind__bullet-dot" aria-hidden="true">•</span>
                    {b}
                  </li>
                ))}
              </ul>
            )}

            {active.learn_more && active.learn_more !== "#" && (
              <a
                href={active.learn_more}
                className="ind__learn-more"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn More
              </a>
            )}
            {(!active.learn_more || active.learn_more === "#") && (
              <a href="#contact" className="ind__learn-more">
                Learn More
              </a>
            )}
          </div>

          {/* Right: illustration/image */}
          <div className="ind__card-right">
            {active.image ? (
              <img
                src={active.image}
                alt={active.label}
                className="ind__card-img"
                loading="lazy"
              />
            ) : (
              /* Placeholder illustration */
              <div className="ind__card-placeholder" aria-hidden="true">
                <svg viewBox="0 0 280 220" fill="none">
                  <rect width="280" height="220" rx="16" fill="#eef1fb" />
                  <rect x="60" y="40" width="80" height="100" rx="8" fill="#c8d4f8" />
                  <rect x="80" y="60" width="40" height="30" rx="4" fill="#8fa8f0" />
                  <rect x="85" y="100" width="30" height="40" rx="3" fill="#8fa8f0" />
                  <rect x="160" y="60" width="70" height="90" rx="8" fill="#d4ddf8" />
                  <rect x="170" y="75" width="50" height="25" rx="4" fill="#8fa8f0" />
                  <rect x="175" y="110" width="40" height="40" rx="3" fill="#8fa8f0" />
                  <circle cx="180" cy="130" r="28" fill="#e8edf8" />
                  <circle cx="180" cy="130" r="18" fill="#c8d4f8" />
                  <rect x="40" y="155" width="200" height="3" rx="2" fill="#c8d4f8" />
                  <circle cx="140" cy="50" r="20" fill="#8fa8f0" />
                  <circle cx="140" cy="44" r="8" fill="#6b8de8" />
                  <rect x="128" y="56" width="24" height="14" rx="4" fill="#6b8de8" />
                </svg>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}

