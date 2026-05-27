/**
 * IndustriesDetailPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Industries Detail inner page — route: /industries-detail
 *
 * WordPress setup:
 *   Page ID : 1191
 *   ACF Group field name: null (flat fields, same as Industries page)
 *
 * Page sections (below the banner):
 *   Section 1 — InnerPageContent  (dynamic ACF sections)
 *   Section 2 — FaqSection
 */

import InnerPageLayout  from "./InnerPageLayout";
import InnerPageContent from "./InnerPageContent";
import IdSectionOne          from "../components/industries-detail/IdSectionOne";
import IdSectionTwo          from "../components/industries-detail/IdSectionTwo";
import IdProductIntelligence from "../components/industries-detail/IdProductIntelligence";
import IdSectionFifth        from "../components/industries-detail/IdSectionFifth";
import IdReviewSection       from "../components/industries-detail/IdReviewSection";
import IdMarketIntelligence  from "../components/industries-detail/IdMarketIntelligence";
import FaqSection            from "../components/FaqSection";
import "./IndustriesPage.css";

const PAGE_ID  = 1191;
const ACF_FIELD = null; // flat ACF fields — no wrapper group

export default function IndustriesDetailPage() {
  return (
    <InnerPageLayout
      pageId={PAGE_ID}
      acfField={ACF_FIELD}
      fallbackTitle="Industry Detail"
      fallbackDescription="Explore in-depth insights and tailored data intelligence solutions for your industry."
    >
      <InnerPageContent
        pageId={PAGE_ID}
        acfField={ACF_FIELD}
      />

      {/* ── Section 1: image left + title + 2×2 icon-cards ── */}
      <IdSectionOne />
      {/* EnterpriseWebCrawlingPage */}
      

      {/* ── Section 2: Brand Monitoring — two equal cards ── */}
      <IdSectionTwo />
      
      {/* ── Section 3: Review & Ratings — full-width bg image ── */}
      <IdReviewSection />

      {/* ── Product Intelligence — 3 animated cards ── */}
      <IdProductIntelligence />



      <IdSectionFifth />

      {/* ── Section 3: Market Intelligence — triangle diagram ── */}
      <IdMarketIntelligence />

      {/* ── FAQ footer section ── */}
      <FaqSection />
    </InnerPageLayout>
  );
}
