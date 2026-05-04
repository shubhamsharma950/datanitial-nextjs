/**
 * SolutionsPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Solutions inner page — also handles all /solutions/* sub-routes.
 *
 * WordPress setup:
 *   post=13
 *   Page ID : 13
 *   ACF Group field name: solutions_page
 *
 * Sub-route slugs (handled by the same component):
 *   /solutions/web-data-extraction
 *   /solutions/mobile-application-scraping
 *   /solutions/real-time-api
 *   /solutions/rpa
 *   /solutions/data-analytics
 *
 * To give each sub-page its own WP content, create child pages in WordPress
 * and update the PAGE_ID map below with the correct IDs.
 */

import { useLocation } from "react-router-dom";
import InnerPageLayout  from "./InnerPageLayout";
import InnerPageContent from "./InnerPageContent";
import "./SolutionsPage.css";

/* ── Map sub-route path → WordPress page ID + badge text ── */
const ROUTE_MAP = {
  "/solutions/web-data-extraction":         { pageId: 11, badge: "WEB DATA EXTRACTION" },
  "/solutions/mobile-application-scraping": { pageId: 11, badge: "MOBILE SCRAPING" },
  "/solutions/real-time-api":               { pageId: 11, badge: "REAL-TIME API" },
  "/solutions/rpa":                         { pageId: 11, badge: "RPA" },
  "/solutions/data-analytics":              { pageId: 11, badge: "DATA ANALYTICS" },
};

const DEFAULT = { pageId: 11, badge: "OUR SOLUTIONS" };
const ACF_FIELD = "solutions_page";

export default function SolutionsPage() {
  const { pathname } = useLocation();
  const { pageId, badge } = ROUTE_MAP[pathname] ?? DEFAULT;

  return (
    <InnerPageLayout
      pageId={pageId}
      acfField={ACF_FIELD}
      fallbackTitle="Our Solutions"
      fallbackDescription="Scalable, enterprise-grade data solutions designed to transform how your business collects, processes, and acts on data."
    >
      <InnerPageContent
        pageId={pageId}
        acfField={ACF_FIELD}
        badgeText={badge}
      />
    </InnerPageLayout>
  );
}
