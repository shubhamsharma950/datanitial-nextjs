import { useEffect, useState } from "react";
import "./IndustriesSection.css";

const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.NEXT_PUBLIC_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

const ACF_URL = `${WP_BASE}/wp/v2/pages/63?_fields=acf`;

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

/* ── Resolve WP media ID → URL ── */
async function resolveMedia(val) {
  if (!val) return "";
  // If it's already a URL string, return it directly
  if (typeof val === "string") {
    if (val.startsWith("http") || val.startsWith("/")) return val;
    return ""; // numeric string ID — fall through below won't happen
  }
  // ACF image/file object with .url already resolved
  if (typeof val === "object" && val.url) return val.url;
  // ACF file/image field returns { type, value } where value is the ID
  const id = typeof val === "object" ? (val.value ?? val.id ?? null) : val;
  if (!id) return "";
  try {
    const r = await fetch(`${WP_BASE}/wp/v2/media/${id}?_fields=source_url`);
    const d = await r.json();
    return d.source_url || "";
  } catch { return ""; }
}

/* ── Parse bullets from textarea ── */
function parseBullets(raw) {
  if (!raw) return [];
  return raw.split(/\r?\n/).map(b => b.trim()).filter(Boolean);
}

/* ── Skeleton ── */
function Skeleton() {
  return (
    <section className="ind">
      <div className="container">
        <div className="ind__badge-wrap">
          <div className="skeleton" style={{ width: 120, height: 30, borderRadius: 999 }} />
        </div>
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
   Reads ACF service_tab_systom from page 63
   Each tab key has its own field naming pattern
═══════════════════════════════════════════════ */
export default function IndustriesSection() {
  const [sectionTitle, setSectionTitle] = useState("Transforming Web Data into Business Intelligence");
  const [sectionDesc,  setSectionDesc]  = useState("We deliver enterprise-grade data extraction and intelligence solutions that scale with your business — ensuring accuracy, speed, and reliability for smarter decision-making.");
  const [tabs,         setTabs]         = useState([]);
  const [activeTab,    setActiveTab]    = useState(0);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    fetch(ACF_URL)
      .then(r => r.json())
      .then(async data => {
        const acf = data?.acf;
        if (!acf) return;

        // Section title & description
        if (acf.title)       setSectionTitle(acf.title);
        if (acf.discreption) setSectionDesc(acf.discreption);

        const sts = acf.service_tab_systom;
        if (!sts || typeof sts !== "object") return;

        // Tab definitions — label + field key prefix
        const tabDefs = [
          { id: "real_estate",           label: "Real Estate",          prefix: "real_estate" },
          { id: "food_delivery",         label: "Food Delivery",        prefix: "food_delivery" },
          { id: "mobility",              label: "Mobility",             prefix: "mobility" },
          { id: "retail_&_ecommerce",    label: "Retail & ecommerce",   prefix: "retail_&_ecommerce" },
          { id: "travel_&_hospitality",  label: "Travel & Hospitality", prefix: "travel_&_hospitality" },
          { id: "location_intelligence", label: "Location Intelligence",prefix: "location_intelligence" },
        ];

        // Build tabs in parallel (resolve all media IDs)
        const built = await Promise.all(
          tabDefs.map(async ({ id, label, prefix }) => {
            const tab = sts[id] || sts[prefix] || {};
            if (!tab || typeof tab !== "object") return null;

            // Icon: some tabs use `prefix_icon`, real_estate uses `prefix` directly (URL string)
            const iconField  = tab[`${prefix}_icon`] ?? tab[`${prefix}`] ?? null;
            // Image: ACF returns full object with .url, or a media ID
            const imageField = tab[`${prefix}_image`] ?? null;

            const [iconUrl, imageUrl] = await Promise.all([
              resolveMedia(iconField),
              resolveMedia(imageField),
            ]);

            // Description — try prefix_dis, then dis
            const desc = tab[`${prefix}_dis`] || tab.dis || tab.description || "";

            // Bullets — try prefix_bullet, prefix_buttet (WP typo for real_estate), bullet
            const rawBullets = tab[`${prefix}_bullet`] || tab[`${prefix}_buttet`] || tab.bullet || tab.bullets || "";

            // Learn more link
            const lm = tab.learn_more;
            const learnUrl = typeof lm === "object" ? (lm?.url || "#") : (lm || "#");

            return { id, label, icon: iconUrl, image: imageUrl, description: desc, bullets: parseBullets(rawBullets), learn_more: learnUrl };
          })
        );

        const valid = built.filter(Boolean).filter(t => t.description || t.bullets.length || t.image);
        if (valid.length) setTabs(valid);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;

  // If no tabs loaded, show default tab labels so bar is always visible
  const displayTabs = tabs.length > 0 ? tabs : [
    { id: "real_estate",           label: "Real Estate",           icon: "", image: "", description: "", bullets: [], learn_more: "#" },
    { id: "food_delivery",         label: "Food Delivery",         icon: "", image: "", description: "", bullets: [], learn_more: "#" },
    { id: "mobility",              label: "Mobility",              icon: "", image: "", description: "", bullets: [], learn_more: "#" },
    { id: "retail_ecommerce",      label: "Retail & ecommerce",    icon: "", image: "", description: "", bullets: [], learn_more: "#" },
    { id: "travel_hospitality",    label: "Travel & Hospitality",  icon: "", image: "", description: "", bullets: [], learn_more: "#" },
    { id: "location_intelligence", label: "Location Intelligence", icon: "", image: "", description: "", bullets: [], learn_more: "#" },
  ];

  const active = displayTabs[activeTab] || displayTabs[0];

  return (
    <section className="ind" aria-label="Industries">
      <div className="container">

        {/* ── Badge ── */}
        <div className="badge-sec">
          <StarIcon />
          <span>INDUSTRIES</span>
        </div>

        {/* ── Section header ── */}
        <div className="ind__header">
          <h2 className="ind__title head-title">{sectionTitle}</h2>
          <p  className="ind__desc head__desc">{sectionDesc}</p>
        </div>

       <div className="tab-container">
           {/* ── Tab bar ── */}
        <div className="ind__tabs" role="tablist" aria-label="Industry tabs">
          {displayTabs.map((tab, i) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={i === activeTab}
              className={`ind__tab${i === activeTab ? " ind__tab--active" : ""}`}
              onClick={() => setActiveTab(i)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Content card ── */}
        <div className="ind__card" key={active.id}>

          {/* Left */}
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
            <a href={active.learn_more || "#contact"} className="ind__learn-more">
              Learn More
            </a>
          </div>

          {/* Right */}
          <div className="ind__card-right">
            {active.image ? (
              <img src={active.image} alt={active.label} className="ind__card-img" loading="lazy" />
            ) : (
              <div className="ind__card-placeholder" aria-hidden="true">
                <svg viewBox="0 0 300 240" fill="none">
                  <rect width="300" height="240" rx="20" fill="#eef1fb" />
                  <rect x="60" y="40" width="90" height="110" rx="10" fill="#c8d4f8" />
                  <rect x="80" y="60" width="50" height="35" rx="5" fill="#8fa8f0" />
                  <rect x="85" y="105" width="40" height="45" rx="4" fill="#8fa8f0" />
                  <rect x="170" y="60" width="75" height="100" rx="10" fill="#d4ddf8" />
                  <rect x="180" y="78" width="55" height="28" rx="4" fill="#8fa8f0" />
                  <rect x="185" y="116" width="45" height="44" rx="4" fill="#8fa8f0" />
                  <circle cx="195" cy="145" r="30" fill="#e8edf8" />
                  <circle cx="195" cy="145" r="20" fill="#c8d4f8" />
                  <rect x="40" y="168" width="220" height="4" rx="2" fill="#c8d4f8" />
                  <circle cx="150" cy="52" r="22" fill="#8fa8f0" />
                  <circle cx="150" cy="46" r="9" fill="#6b8de8" />
                  <rect x="137" y="58" width="26" height="16" rx="5" fill="#6b8de8" />
                </svg>
              </div>
            )}
          </div>

        </div>
        
       </div>

      </div>
    </section>
  );
}

