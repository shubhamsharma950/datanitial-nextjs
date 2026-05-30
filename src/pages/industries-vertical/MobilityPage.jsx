/**
 * MobilityPage.jsx
 * Route: /mobility
 * WordPress Page ID: 1310
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

const PAGE_ID  = 1310;
const ACF_FIELD = null;

export default function MobilityPage() {
  return (
    <InnerPageLayout
      pageId={PAGE_ID}
      acfField={ACF_FIELD}
      fallbackTitle="Mobility"
      fallbackDescription="Data intelligence solutions tailored for the mobility and transportation industry."
    >
      <SEO
        title="Mobility Data Intelligence"
        description="Data intelligence solutions tailored for the mobility and transportation industry. Fleet analytics, route optimization, and competitive insights."
        keywords="mobility data, transportation analytics, fleet intelligence, ride-sharing insights"
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
