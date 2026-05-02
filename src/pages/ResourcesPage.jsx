/**
 * ResourcesPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Resources & Insights inner page — also handles /resources/* sub-routes.
 *
 * WordPress setup:
 *   Page ID : 14
 *   ACF Group field name: resources_page
 *
 * Sub-route slugs:
 *   /resources/blog
 *   /resources/case-studies
 *   /resources/whitepapers
 *
 * The ResourcesBlog component is rendered as a static child below the
 * dynamic ACF sections so the blog grid always appears on this page.
 */

import { useLocation } from "react-router-dom";
import InnerPageLayout  from "./InnerPageLayout";
import InnerPageContent from "./InnerPageContent";
import ResourcesBlog    from "../components/ResourcesBlog";
import "./ResourcesPage.css";

/* ── Map sub-route path → badge text ── */
const BADGE_MAP = {
  "/resources/blog":         "BLOG",
  "/resources/case-studies": "CASE STUDIES",
  "/resources/whitepapers":  "WHITEPAPERS",
};

const PAGE_ID   = 14;
const ACF_FIELD = "resources_page";

export default function ResourcesPage() {
  const { pathname } = useLocation();
  const badge = BADGE_MAP[pathname] ?? "RESOURCES & INSIGHTS";

  return (
    <InnerPageLayout
      pageId={PAGE_ID}
      acfField={ACF_FIELD}
      fallbackTitle="Resources & Insights"
      fallbackDescription="Explore our latest articles, guides, and case studies to stay ahead in the world of data intelligence."
    >
      <InnerPageContent
        pageId={PAGE_ID}
        acfField={ACF_FIELD}
        badgeText={badge}
      >
        {/* Blog grid always rendered below dynamic ACF sections */}
        <ResourcesBlog />
      </InnerPageContent>
    </InnerPageLayout>
  );
}
