/**
 * AboutTwoSection.jsx  —  Section 2
 * Three-column: left text+stats | center image | right text+quote+CTA
 *
 * ACF structure (WP Page ID: 10):
 *   counter_section (Group)
 *     ├── content_ (Group)
 *     │     ├── left_heading        Text
 *     │     ├── left_description    Text Area
 *     │     ├── center_image        Image
 *     │     ├── right_description   Text Area
 *     │     ├── quote_text          Text Area
 *     │     └── button              Link  → { url, title, target }
 *     └── counter_sec (Group)
 *           ├── years_of_experience  Text Area
 *           ├── projects_delivered   Text Area
 *           ├── satisfied_clients    Text Area
 *           └── team_members         Text Area
 */

import { useEffect, useState } from "react";
import { fetchAboutPage, resolveImg } from "./aboutApi";
import "./AboutTwoSection.css";

function Skeleton() {
  return (
    <section className="a2s" aria-busy="true">
      <div className="a2s__inner">
        {[1, 2, 3].map((i) => (
          <div key={i} className="a2s__col">
            <div className="skeleton" style={{ width: "80%", height: 28, borderRadius: 8, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: "100%", height: 16, borderRadius: 6, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: "90%", height: 16, borderRadius: 6 }} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AboutTwoSection() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchAboutPage()
      .then(async (page) => {
        const sec        = page?.counter_section ?? {};
        const content    = sec.content_   ?? {};
        const counterSec = sec.counter_sec ?? {};

        const img = await resolveImg(content.center_image);

        // button is an ACF Link field: { url, title, target }
        const btn = content.button ?? {};

        // Build stats from the four counter_sec sub-fields
        const stats = [
          { value: counterSec.years_of_experience, label: "Years of Experience" },
          { value: counterSec.projects_delivered,  label: "Projects Delivered"  },
          { value: counterSec.satisfied_clients,   label: "Satisfied Clients"   },
          { value: counterSec.team_members,         label: "Team Members"        },
        ].filter((s) => s.value);

        if (!cancelled) setData({
          leftHeading:      content.left_heading      || "",
          leftDescription:  content.left_description  || "",
          stats,
          img,
          rightDescription: content.right_description || "",
          quoteText:        content.quote_text         || "",
          ctaText:          btn.title                  || "Contact Us",
          ctaLink:          btn.url                    || "/contact-us",
          ctaTarget:        btn.target                 || "_self",
        });
      })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Skeleton />;
  if (!data)   return null;

  return (
    <section className="a2s" aria-label="About — data analytics journey">
      <div className="a2s__inner">

        {/* ── Col 1: heading + description + stats grid ── */}
        <div className="a2s__col a2s__col--left">
          {data.leftHeading     && <h2 className="a2s__left-title">{data.leftHeading}</h2>}
          {data.leftDescription && <p  className="a2s__left-desc">{data.leftDescription}</p>}

          {data.stats.length > 0 && (
            <div className="a2s__stats">
              {data.stats.map((s, i) => (
                <div key={i} className="a2s__stat">
                  <span className="a2s__stat-num">{s.value}</span>
                  <span className="a2s__stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Col 2: center image ── */}
        <div className="a2s__col a2s__col--center">
          <div className="a2s__img-wrap">
            {data.img
              ? <img src={data.img} alt="Data analytics" className="a2s__img" loading="lazy" />
              : <div className="a2s__img-placeholder" aria-hidden="true" />
            }
          </div>
        </div>

        {/* ── Col 3: right description + quote + CTA ── */}
        <div className="a2s__col a2s__col--right">
          {data.rightDescription && <p className="a2s__right-desc">{data.rightDescription}</p>}
          {data.quoteText        && <blockquote className="a2s__quote">"{data.quoteText}"</blockquote>}
          {data.ctaText && (
            <a href={data.ctaLink} target={data.ctaTarget} rel={data.ctaTarget === "_blank" ? "noopener noreferrer" : undefined} className="a2s__cta">
              {data.ctaText}
            </a>
          )}
        </div>

      </div>
    </section>
  );
}
