/**
 * IndustriesDetailPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Industries Detail inner page — route: /industries-detail
 *
 * WordPress setup:
 *   Page ID : 1191
 *   ACF Group field name: null (flat fields)
 *
 * Page sections (below the banner):
 *   Section 1 — InnerPageContent  (dynamic ACF sections)
 *   Section 2 — IdSectionOne … IdMarketIntelligence
 *   Section 3 — FaqSection
 */

import InnerPageLayout  from "./InnerPageLayout";
import SEO from "../components/SEO";
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
      <SEO 
        title="Industry Detail"
        description="Explore in-depth insights and tailored data intelligence solutions for your industry. Brand monitoring, market intelligence, product analytics, and more."
        keywords="industry detail, brand monitoring, market intelligence, product analytics, data intelligence"
      />
      
      <InnerPageContent
        pageId={PAGE_ID}
        acfField={ACF_FIELD}
      />

      <IdSectionOne          pageId={PAGE_ID} />
      <IdSectionTwo          pageId={PAGE_ID} />
      <IdReviewSection       pageId={PAGE_ID} />
      <IdProductIntelligence pageId={PAGE_ID} />
      <IdSectionFifth        pageId={PAGE_ID} />
      <IdMarketIntelligence  pageId={PAGE_ID} />

      <FaqSection />
    </InnerPageLayout>
  );
}
