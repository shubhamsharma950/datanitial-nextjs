/**
 * DynamicSectionRenderer.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders an array of normalised section objects produced by innerPageApi.js.
 *
 * Supported section types:
 *   heading_h2   → <h2>
 *   heading_h3   → <h3>
 *   heading_h4   → <h4>
 *   paragraph    → <div dangerouslySetInnerHTML> (supports WP wysiwyg HTML)
 *   image        → <figure> with optional caption
 *   cta_block    → CTA button (primary / secondary / outline)
 *   two_column   → two-column layout with HTML content in each column
 *   card_grid    → responsive grid of icon + title + text cards
 *   icon_list    → horizontal/vertical list of icon + text items
 *
 * Props:
 *   sections  {Array}   Normalised section objects from fetchInnerPage()
 *   className {string}  Optional extra class on the wrapper
 */

import "./DynamicSectionRenderer.css";

/* ── Individual section renderers ── */

function HeadingSection({ section }) {
  const Tag = section.type === "heading_h2"
    ? "h2"
    : section.type === "heading_h3"
    ? "h3"
    : "h4";

  return (
    <Tag className={`dsr__heading dsr__heading--${Tag}`}>
      {section.text}
    </Tag>
  );
}

function ParagraphSection({ section }) {
  return (
    <div
      className="dsr__paragraph"
      dangerouslySetInnerHTML={{ __html: section.html }}
    />
  );
}

function ImageSection({ section }) {
  if (!section.url) return null;
  return (
    <figure className="dsr__image-wrap">
      <img
        src={section.url}
        alt={section.alt || ""}
        className="dsr__image"
        loading="lazy"
      />
      {section.caption && (
        <figcaption className="dsr__image-caption">{section.caption}</figcaption>
      )}
    </figure>
  );
}

function CtaBlock({ section }) {
  const cls = `dsr__cta-btn dsr__cta-btn--${section.style || "primary"}`;
  const isExternal = section.link?.startsWith("http");
  return (
    <div className="dsr__cta-wrap">
      <a
        href={section.link || "#"}
        className={cls}
        rel={isExternal ? "noopener noreferrer" : undefined}
        target={isExternal ? "_blank" : "_self"}
      >
        {section.text}
        <svg className="dsr__cta-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M4 10h12M11 5l5 5-5 5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </div>
  );
}

function TwoColumnSection({ section }) {
  return (
    <div className="dsr__two-col">
      <div
        className="dsr__two-col__left"
        dangerouslySetInnerHTML={{ __html: section.leftContent }}
      />
      <div
        className="dsr__two-col__right"
        dangerouslySetInnerHTML={{ __html: section.rightContent }}
      />
    </div>
  );
}

function CardGrid({ section }) {
  if (!section.cards?.length) return null;
  return (
    <div className="dsr__card-grid">
      {section.cards.map((card, i) => (
        <article key={i} className="dsr__card">
          {card.icon && (
            <div className="dsr__card__icon-wrap" aria-hidden="true">
              <img src={card.icon} alt="" className="dsr__card__icon" loading="lazy" />
            </div>
          )}
          {card.title && <h3 className="dsr__card__title">{card.title}</h3>}
          {card.text  && <p  className="dsr__card__text">{card.text}</p>}
        </article>
      ))}
    </div>
  );
}

function IconList({ section }) {
  if (!section.items?.length) return null;
  return (
    <ul className="dsr__icon-list" role="list">
      {section.items.map((item, i) => (
        <li key={i} className="dsr__icon-list__item">
          {item.icon && (
            <img src={item.icon} alt="" className="dsr__icon-list__icon" loading="lazy" aria-hidden="true" />
          )}
          <span className="dsr__icon-list__text">{item.text}</span>
        </li>
      ))}
    </ul>
  );
}

/* ── Section dispatcher ── */
function Section({ section }) {
  switch (section.type) {
    case "heading_h2":
    case "heading_h3":
    case "heading_h4":
      return <HeadingSection section={section} />;
    case "paragraph":
      return <ParagraphSection section={section} />;
    case "image":
      return <ImageSection section={section} />;
    case "cta_block":
      return <CtaBlock section={section} />;
    case "two_column":
      return <TwoColumnSection section={section} />;
    case "card_grid":
      return <CardGrid section={section} />;
    case "icon_list":
      return <IconList section={section} />;
    default:
      return null;
  }
}

/* ── Main export ── */
export default function DynamicSectionRenderer({ sections = [], className = "" }) {
  if (!sections.length) return null;

  return (
    <div className={`dsr ${className}`.trim()}>
      {sections.map((section, i) => (
        <Section key={i} section={section} />
      ))}
    </div>
  );
}
