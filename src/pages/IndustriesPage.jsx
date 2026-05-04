/**
 * IndustriesPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Industries inner page — also handles all /industries/* sub-routes.
 *
 * WordPress setup:
 *   Page ID : 15
 *   ACF Group field name: industries_page
 *
 * Sub-route slugs:
 *   /industries/e-commerce
 *   /industries/finance-banking
 *   /industries/healthcare
 *   /industries/real-estate
 *   /industries/travel-hospitality
 *
 * Page sections (below the banner):
 *   Section 1 — IndustriesOneSection   "Built for Scale. Trusted Across Industries."
 *   Section 2 — IndustriesTwoSection   "Industry-Specific Customization" (hover image swap)
 *   Section 3 — IndustriesThreeSection "What Powers Every Industry Solution" (2×2 grid)
 */

import { useLocation } from "react-router-dom";
import InnerPageLayout         from "./InnerPageLayout";
import InnerPageContent        from "./InnerPageContent";
import IndustriesOneSection    from "../components/industries/IndustriesOneSection";
import IndustriesTwoSection    from "../components/industries/IndustriesTwoSection";
import IndustriesThreeSection  from "../components/industries/IndustriesThreeSection";
import "./IndustriesPage.css";
import FaqSection from "../components/FaqSection";
import IndustriesSection from "../components/IndustriesSection";

/* ── Map sub-route path → WordPress page ID + badge text ── */
const ROUTE_MAP = {
  "/industries/e-commerce":         { pageId: 15, badge: "E-COMMERCE" },
  "/industries/finance-banking":    { pageId: 15, badge: "FINANCE & BANKING" },
  "/industries/healthcare":         { pageId: 15, badge: "HEALTHCARE" },
  "/industries/real-estate":        { pageId: 15, badge: "REAL ESTATE" },
  "/industries/travel-hospitality": { pageId: 15, badge: "TRAVEL & HOSPITALITY" },
};

// const DEFAULT   = { pageId: 15, badge: "INDUSTRIES WE SERVE" };
const DEFAULT   = { pageId: 15,};
// ACF fields are flat under acf{} — no wrapper group for this page
const ACF_FIELD = null;

export default function IndustriesPage() {
  const { pathname } = useLocation();
  const { pageId, badge } = ROUTE_MAP[pathname] ?? DEFAULT;

  return (
    <InnerPageLayout
      pageId={pageId}
      acfField={ACF_FIELD}
      fallbackTitle="Industries We Serve"
      fallbackDescription="From e-commerce to finance, we deliver tailored data intelligence solutions across every major industry vertical."
    >
      <InnerPageContent
        pageId={pageId}
        acfField={ACF_FIELD}
        badgeText={badge}
      />

      {/* ── Custom page sections ── */}
      <IndustriesOneSection />
      {/* IndustriesSection from home page  */}
      <IndustriesSection />
      <IndustriesTwoSection />
      <IndustriesThreeSection />
      {/* FaqSection footer sec  */}
      <FaqSection />
    </InnerPageLayout>
  );
}
