/**
 * RetailEcommercePage.jsx
 * Route: /retail-ecommerce
 * WordPress Page ID: 1312
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

const PAGE_ID  = 1312;
const ACF_FIELD = null;

export default function RetailEcommercePage() {
  return (
    <InnerPageLayout
      pageId={PAGE_ID}
      acfField={ACF_FIELD}
      fallbackTitle="Retail & eCommerce"
      fallbackDescription="Data intelligence solutions built for retail and eCommerce businesses."
    >
      <SEO
        title="Retail & eCommerce Data Intelligence"
        description="Data intelligence solutions built for retail and eCommerce businesses. Price monitoring, product analytics, competitor tracking, and more."
        keywords="retail data, ecommerce analytics, price monitoring, product intelligence, competitor tracking"
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
