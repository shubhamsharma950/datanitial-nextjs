/**
 * TravelHospitalityPage.jsx
 * Route: /travel-hospitality
 * WordPress Page ID: 1314
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

const PAGE_ID  = 1314;
const ACF_FIELD = null;

export default function TravelHospitalityPage() {
  return (
    <InnerPageLayout
      pageId={PAGE_ID}
      acfField={ACF_FIELD}
      fallbackTitle="Travel & Hospitality"
      fallbackDescription="Data intelligence solutions tailored for the travel and hospitality industry."
    >
      <SEO
        title="Travel & Hospitality Data Intelligence"
        description="Data intelligence solutions tailored for the travel and hospitality industry. Hotel pricing, OTA monitoring, review analytics, and more."
        keywords="travel data, hospitality analytics, hotel pricing, OTA monitoring, review intelligence"
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
