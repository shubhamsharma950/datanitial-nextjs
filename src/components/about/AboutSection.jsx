import { useEffect, useState, useRef } from "react";
import "./AboutSection.css";

const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

const PAGE_URL = `${WP_BASE}/wp/v2/pages/10?_fields=acf`;

export default function AboutSection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

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

  // Intersection Observer to trigger animations when section comes into view
  useEffect(() => {
    if (loading || !sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          console.log('AboutSection: Animation triggered - section is visible');
          setIsVisible(true);
        }
      },
      {
        threshold: 0.2, // Trigger when 20% of section is visible
        rootMargin: "0px"
      }
    );

    const currentRef = sectionRef.current;
    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loading]);

  if (loading) return <div className="about-section about-section--loading" aria-busy="true" />;
  if (!data) return null;

  const { title, description, sub_description_reviews, right_image } = data;

  // sub_description_reviews contains: image (array of avatar objects) and des (text)
  const reviewAvatars = sub_description_reviews?.image || [];
  const reviewText    = sub_description_reviews?.des   || "";

  return (
    <section 
      ref={sectionRef}
      className={`about-section ${isVisible ? 'about-section--visible' : ''}`} 
      aria-label="About Section"
    >
      <div className="about-section__inner">

        {/* ── Left ── */}
        <div className="about-section__left">
          {title && (
            <h2 className="about-section__title about-section__title--animated">
              {title}
            </h2>
          )}
          {description && (
            <p className="about-section__desc about-section__desc--animated">
              {description.split('.').filter(Boolean).map((line, i) => (
                <span 
                  key={i} 
                  className="about-section__desc-line"
                  style={{ '--line-index': i }}
                >
                  {line.trim()}{i < description.split('.').filter(Boolean).length - 1 ? '.' : ''}
                </span>
              ))}
            </p>
          )}

          {/* Reviews row */}
          {(reviewAvatars.length > 0 || reviewText) && (
            <div className="about-section__reviews about-section__reviews--animated">
              {reviewAvatars.length > 0 && (
                <div className="about-section__avatars">
                  {reviewAvatars.map((avatar, i) => {
                    const src = avatar?.url || (typeof avatar === "string" ? avatar : "");
                    const alt = avatar?.alt || `Client ${i + 1}`;
                    return src ? (
                      <img
                        key={i}
                        src='https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/05/abotusec-rating.png'
                        alt={alt}
                        className="about-section__avatar"
                        style={{ '--avatar-index': i }}
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
                  className="about-section__avatar about-section__stars-img"
                  loading="lazy"
                />
                {reviewText && (
                  <p className="about-section__review-text about-section__review-text--animated">
                    {reviewText}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Right — image sits over the blue background half ── */}
        <div className="about-section__right">
          {right_image?.url && (
            <div className="about-section__img-wrap about-section__img-wrap--animated">
              <img
                src={right_image.url}
                alt={right_image.alt || title || "About"}
                className="about-section__img about-section__img--ken-burns"
                loading="lazy"
              />
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
