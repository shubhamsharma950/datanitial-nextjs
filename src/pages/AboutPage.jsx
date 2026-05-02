/**
 * AboutPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * About Us inner page — 5 dynamic sections, all data from WordPress ACF.
 *
 * WordPress setup  (Page ID: 10, top-level ACF group: about_page)
 * ─────────────────────────────────────────────────────────────────
 * Section 1 — about_section
 *   title, description, right_image,
 *   sub_description_reviews → { avatar_1-4, star_rating, trust_text }
 *
 * Section 2 — about_two_section
 *   left_title, left_description, stats (Repeater → number/label),
 *   center_image, right_description, right_quote, cta_text, cta_link
 *
 * Section 3 — about_three_section
 *   left_top/bottom & right_top/bottom → { title, highlight, desc }
 *   center_image
 *
 * Section 4 — about_four_section
 *   badge_text, title, description,
 *   col_left_title, col_right_title,
 *   left_items / right_items (Repeater → { text })
 *
 * Section 5 — about_five_section
 *   badge_text, title, description, cta_text, cta_link,
 *   steps (Repeater → { icon, title, description, tags → { tag_text } })
 */

import InnerPageLayout    from "./InnerPageLayout";
import AboutSection       from "../components/about/AboutSection";
import AboutTwoSection    from "../components/about/AboutTwoSection";
import AboutThreeSection  from "../components/about/AboutThreeSection";
import AboutFourSection   from "../components/about/AboutFourSection";
import AboutFiveSection   from "../components/about/AboutFiveSection";
import "./AboutPage.css";
import BrandLogoSlider from "../components/about/BrandLogoSlider";

const PAGE_ID   = 10;
const ACF_FIELD = "about_page";

export default function AboutPage() {
  return (
    <InnerPageLayout
      pageId={PAGE_ID}
      acfField={ACF_FIELD}
      fallbackTitle="About Us"
      fallbackDescription="At Datanitial, we empower businesses with scalable data solutions that turn complex web data into clear, actionable insights."
    >
      {/* Section 0.1 — About brand slider */}
      <BrandLogoSlider />

      {/* Section 1 — About Datanitial: title + desc + trust row + image */}
      <AboutSection />

      {/* Section 2 — Journey: left text+stats | center image | right text+quote+CTA */}
      <AboutTwoSection />

      {/* Section 3 — Vision / Mission / Goal / Who We Serve: 2 cards | center image | 2 cards */}
      <AboutThreeSection />

      {/* Section 4 — Data Advantage: comparison table Other Firms vs Datanitial */}
      <AboutFourSection />

      {/* Section 5 — Our Process: left text+CTA | right stacked step cards */}
      <AboutFiveSection />
    </InnerPageLayout>
  );
}
