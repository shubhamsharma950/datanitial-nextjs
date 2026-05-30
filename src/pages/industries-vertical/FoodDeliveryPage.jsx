/**
 * FoodDeliveryPage.jsx
 * Route: /food-delivery
 * WordPress Page ID: 1308
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

const PAGE_ID  = 1308;
const ACF_FIELD = null;

export default function FoodDeliveryPage() {
  return (
    <InnerPageLayout
      pageId={PAGE_ID}
      acfField={ACF_FIELD}
      fallbackTitle="Food Delivery"
      fallbackDescription="Data intelligence solutions built for the food delivery industry."
    >
      <SEO
        title="Food Delivery Data Intelligence"
        description="Data intelligence solutions built for the food delivery industry. Menu analytics, pricing insights, delivery performance, and more."
        keywords="food delivery data, restaurant analytics, menu intelligence, delivery insights"
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
