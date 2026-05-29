/**
 * RealEstatePage.jsx
 * Route: /real-estate
 * WordPress Page ID: 1191
 */

import InnerPageLayout  from "../InnerPageLayout";
import SEO from "../../components/SEO";
import InnerPageContent from "../InnerPageContent";
import IdSectionOne          from "../../components/industries-detail/IdSectionOne";
import IdSectionTwo          from "../../components/industries-detail/IdSectionTwo";
import IdProductIntelligence from "../../components/industries-detail/IdProductIntelligence";
import IdSectionFifth        from "../../components/industries-detail/IdSectionFifth";
import IdReviewSection       from "../../components/industries-detail/IdReviewSection";
import IdMarketIntelligence  from "../../components/industries-detail/IdMarketIntelligence";
import FaqSection            from "../../components/FaqSection";
import "../IndustriesPage.css";

const PAGE_ID  = 1191;
const ACF_FIELD = null;

export default function RealEstatePage() {
  return (
    <InnerPageLayout
      pageId={PAGE_ID}
      acfField={ACF_FIELD}
      fallbackTitle="Real Estate"
      fallbackDescription="Leverage data intelligence solutions tailored for the real estate industry."
    >
      <SEO
        title="Real Estate Data Intelligence"
        description="Leverage data intelligence solutions tailored for the real estate industry. Market insights, property analytics, and more."
        keywords="real estate data, property intelligence, real estate analytics, market insights"
      />

      <InnerPageContent pageId={PAGE_ID} acfField={ACF_FIELD} />

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
