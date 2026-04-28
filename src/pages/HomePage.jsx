import { useEffect, useState } from "react";
import { getHomePage } from "../services/api";
import "./HomePage.css";

/* ... (Keep HeroSkeleton and CheckIcon as they are) ... */

export default function HomePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHomePage()
      .then((res) => {
        /**
         * We look for the 'custom_blocks' field we created in the PHP plugin.
         * We find the block named 'datainitial/data-services'.
         */
        const blocks = res?.custom_blocks || [];
        const serviceBlock = blocks.find(b => b.type === 'datainitial/data-services');

        if (serviceBlock) {
          // Map Gutenberg attributes to your component's expected format
          const dynamicData = {
            ...FALLBACK, // Keep fallback for sections not yet in Gutenberg
            hero: {
              ...FALLBACK.hero,
              heading: serviceBlock.attributes.heading || FALLBACK.hero.heading,
            },
            services: serviceBlock.attributes.useCases.map((item, index) => ({
              id: index,
              title: item.title,
              description: item.description,
              bullets: [], // You can add a 'bullets' field to your block.json later
            }))
          };
          setData(dynamicData);
        } else {
          setData(FALLBACK);
        }
      })
      .catch(() => setData(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <HeroSkeleton />;

  const d = data ?? FALLBACK;

  return (
    <main className="hp">
      {/* Hero Section */}
      <section className="hp-hero">
        <div className="container hp-hero__content">
           <h1 className="hp-hero__heading">
              {/* Note: In Gutenberg it's often one string, so we handle both cases */}
              {typeof d.hero.heading === 'string' 
                ? d.hero.heading.split("\n").map((line, i) => <span key={i} className="hp-hero__heading-line">{line}</span>)
                : d.hero.heading}
           </h1>
           {/* ... rest of your hero JSX ... */}
        </div>
      </section>

      {/* Services Section - Now Dynamic from Gutenberg */}
      <section className="hp-services section">
        <div className="container">
          <div className="hp-services__list">
            {d.services.map((svc, idx) => (
              <article key={idx} className="hp-service">
                <div className="hp-service__body">
                  <h3 className="hp-service__title">{svc.title}</h3>
                  <p className="hp-service__desc">{svc.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      
      {/* ... keep Tagline, Stats, and CTA as they are ... */}
    </main>
  );
}

// Keep your FALLBACK object here as well