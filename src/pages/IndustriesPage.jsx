/**
 * IndustriesPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Industries inner page — also handles all /industries/* sub-routes.
 *
 * WordPress setup:
 *   Page ID : 12
 *   ACF Group field name: industries_page
 *
 * Sub-route slugs:
 *   /industries/e-commerce
 *   /industries/finance-banking
 *   /industries/healthcare
 *   /industries/real-estate
 *   /industries/travel-hospitality
 *
 * To give each industry its own WP content, create child pages and update
 * the ROUTE_MAP below with the correct WordPress page IDs.
 */

import { useLocation } from "react-router-dom";
import InnerPageLayout  from "./InnerPageLayout";
import InnerPageContent from "./InnerPageContent";
import "./IndustriesPage.css";

/* ── Map sub-route path → WordPress page ID + badge text ── */
const ROUTE_MAP = {
  "/industries/e-commerce":         { pageId: 12, badge: "E-COMMERCE" },
  "/industries/finance-banking":    { pageId: 12, badge: "FINANCE & BANKING" },
  "/industries/healthcare":         { pageId: 12, badge: "HEALTHCARE" },
  "/industries/real-estate":        { pageId: 12, badge: "REAL ESTATE" },
  "/industries/travel-hospitality": { pageId: 12, badge: "TRAVEL & HOSPITALITY" },
};

const DEFAULT   = { pageId: 12, badge: "INDUSTRIES WE SERVE" };
const ACF_FIELD = "industries_page";

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
    </InnerPageLayout>
  );
}
