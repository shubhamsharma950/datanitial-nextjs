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
 * Sections rendered below the banner (all data from solutionsApi.js / page 13):
 *   SolutionsSectionOne   — "Solving Your Data Bottlenecks" (alternating cards)
 *   SolutionsSectionTwo   — "More Than Just Data Access"    (text + image split)
 *   SolutionsSectionThree — "Designed Around Your Stack"    (3-col workflow cards)
 */

import { useLocation } from "react-router-dom";
import InnerPageLayout        from "./InnerPageLayout";
import SolutionsSectionOne    from "../components/solutions/SolutionsSectionOne";
import SolutionsSectionTwo    from "../components/solutions/SolutionsSectionTwo";
import SolutionsSectionThree  from "../components/solutions/SolutionsSectionThree";
import FaqSection from "../components/FaqSection";
import "./SolutionsPage.css";
import OurSolutions from "../components/OurSolutions";

/* ── Map sub-route path → WordPress page ID ── */
const ROUTE_MAP = {
  "/solutions/web-data-extraction":         { pageId: 13 },
  "/solutions/mobile-application-scraping": { pageId: 13 },
  "/solutions/real-time-api":               { pageId: 13 },
  "/solutions/rpa":                         { pageId: 13 },
  "/solutions/data-analytics":              { pageId: 13 },
};

const DEFAULT   = { pageId: 13 };
const ACF_FIELD = "solutions_page";

export default function SolutionsPage() {
  const { pathname } = useLocation();
  const { pageId }   = ROUTE_MAP[pathname] ?? DEFAULT;

  return (
    <InnerPageLayout
      pageId={pageId}
      acfField={ACF_FIELD}
      fallbackTitle="Our Solutions"
      fallbackDescription="Scalable, enterprise-grade data solutions designed to transform how your business collects, processes, and acts on data."
    >
      {/* ── Dynamic sections — all data fetched from solutionsApi.js ── */}
      <SolutionsSectionOne />
      {/* OurSolutions form home page  */}
      <OurSolutions detailLink="/solutions/detail" />
      <SolutionsSectionTwo />
      <SolutionsSectionThree />
       {/* FaqSection footer sec  */}
       <FaqSection />
    </InnerPageLayout>
  );
}
