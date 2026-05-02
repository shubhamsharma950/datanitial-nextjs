import { useEffect, useState } from "react";
import "./AboutSection.css";

const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

const PAGE_URL = `${WP_BASE}/wp/v2/pages/10?_fields=acf`;

export default function AboutSection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(PAGE_URL)
      .then((r) => r.json())
      .then((json) => {
        const section = json?.acf?.about_section;
        if (section) setData(section);
      })
      .catch((err) => console.error("AboutSection fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="about-section about-section--loading" aria-busy="true" />;
  if (!data) return null;

  const { title, description, sub_description_reviews, right_image } = data;

  // sub_description_reviews contains: image (array of avatar objects) and des (text)
  const reviewAvatars = sub_description_reviews?.image || [];
  const reviewText    = sub_description_reviews?.des   || "";

  return (
    <section className="about-section" aria-label="About Section">
      <div className="about-section__inner">

        {/* ── Left ── */}
        <div className="about-section__left">
          {title && <h2 className="about-section__title">{title}</h2>}
          {description && <p className="about-section__desc">{description}</p>}

          {/* Reviews row */}
          {(reviewAvatars.length > 0 || reviewText) && (
            <div className="about-section__reviews">
              {reviewAvatars.length > 0 && (
                <div className="about-section__avatars">
                  {reviewAvatars.map((avatar, i) => {
                    const src = avatar?.url || (typeof avatar === "string" ? avatar : "");
                    const alt = avatar?.alt || `Client ${i + 1}`;
                    return src ? (
                      // <img
                      //   key={i}
                      //   src={src}
                      //   alt={alt}
                      //   className="about-section__avatar"
                      //   loading="lazy"
                      // />
                      <img
                        key={i}
                        src='https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/05/abotusec-rating.png'
                        alt={alt}
                        className="about-section__avatar"
                        loading="lazy"
                      />
                    ) : null;
                  })}
                </div>
              )}

              <div className="about-section__review-meta">
                {/* Stars */}
                 <img
                    
                        src='https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/05/abotusec-rating.png'
                        className="about-section__avatar"
                        loading="lazy"
                      />
                {/* <div className="about-section__stars" aria-label="5 star rating">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className="about-section__star" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.44.91-5.32L2.27 6.62l5.34-.78z" />
                    </svg>
                  ))}
                </div> */}
                {reviewText && <p className="about-section__review-text">{reviewText}</p>}
              </div>
            </div>
          )}
        </div>

        {/* ── Right — image sits over the blue background half ── */}
        <div className="about-section__right">
          {right_image?.url && (
            <div className="about-section__img-wrap">
              <img
                src={right_image.url}
                alt={right_image.alt || title || "About"}
                className="about-section__img"
                loading="lazy"
              />
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
