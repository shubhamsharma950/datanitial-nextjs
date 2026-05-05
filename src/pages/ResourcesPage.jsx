/**
 * ResourcesPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Resources & Insights page — WordPress Page ID: 17
 *
 * ACF Group field name: resources_page
 * WordPress admin: post.php?post=17
 *
 * Page sections (each in its own component under components/resources/):
 *   Section 1 — Featured Resource Card
 *     • ACF: page 17 → section_one (badge, title, description)
 *     • Post: WP posts filtered by category "Featured"
 *
 *   Section 2 — Latest Blog Posts Grid
 *     • ACF: page 17 → section_two (badge, title, description)
 *     • Posts: GET /wp/v2/posts (with load-more pagination)
 *
 *   Section 3 — Case Studies Grid
 *     • ACF: page 17 → section_three (badge, title, description)
 *     • Posts: GET /wp/v2/case-studies (with load-more pagination)
 */

import InnerPageLayout        from "./InnerPageLayout";
import InnerPageBanner        from "./InnerPageBanner";
import ResourcesSectionOne    from "../components/resources/ResourcesSectionOne";
import ResourcesSectionTwo    from "../components/resources/ResourcesSectionTwo";
import ResourcesSectionThree  from "../components/resources/ResourcesSectionThree";
import "./ResourcesPage.css";

const PAGE_ID   = 17;
const ACF_FIELD = "resources_page";

export default function ResourcesPage() {
  return (
    <InnerPageLayout
      pageId={PAGE_ID}
      acfField={ACF_FIELD}
      fallbackTitle="Resources & Insights"
      fallbackDescription="Explore our latest articles, guides, and case studies to stay ahead in the world of data intelligence."
    >
      {/* Banner is rendered by InnerPageLayout via InnerPageBanner internally */}

      {/* Section 1 — Featured Resource Card */}
      <ResourcesSectionOne />

      {/* Section 2 — Latest Blog Posts Grid */}
      <ResourcesSectionTwo />

      {/* Section 3 — Case Studies Grid */}
      <ResourcesSectionThree />

    </InnerPageLayout>
  );
}
