/**
 * routes.jsx
 * Central routing configuration for the Datanitial React app.
 * Add new pages here — import the page component and add a <Route>.
 */

import { Routes, Route } from "react-router-dom";

import HomePage        from "./pages/HomePage";
import ResourcesPage   from "./pages/ResourcesPage";
import PostDetailPage  from "./pages/PostDetailPage";
import AboutPage       from "./pages/AboutPage";
import SolutionsPage        from "./pages/SolutionsPage";
import SolutionDetailPage   from "./pages/SolutionDetailPage";
import IndustriesPage       from "./pages/IndustriesPage";
import IndustriesDetailPage from "./pages/IndustriesDetailPage";
import ContactPage     from "./pages/ContactPage";
import NotFoundPage    from "./pages/NotFoundPage";

/* ── Footer: Industries pages ── */
import EnterpriseWebCrawlingPage  from "./pages/industries/EnterpriseWebCrawlingPage";
import MobileAppScrapingPage      from "./pages/industries/MobileAppScrapingPage";
import WebScrapingApiPage         from "./pages/industries/WebScrapingApiPage";
import CustomDataExtractionPage   from "./pages/industries/CustomDataExtractionPage";
import PriceScrapingServicesPage  from "./pages/industries/PriceScrapingServicesPage";
import RealTimeWebCrawlingPage    from "./pages/industries/RealTimeWebCrawlingPage";
import DigitalShelfAnalyticsPage  from "./pages/industries/DigitalShelfAnalyticsPage";
import AiPoweredScrapingPage      from "./pages/industries/AiPoweredScrapingPage";

/* ── Footer: Ready Solutions pages ── */
import SolMobileAppScrapingPage   from "./pages/solutions/SolMobileAppScrapingPage";
import RealTimeApiPage            from "./pages/solutions/RealTimeApiPage";
import DataAnalyticsDashboardPage from "./pages/solutions/DataAnalyticsDashboardPage";
import HotelPriceMonitoringPage   from "./pages/solutions/HotelPriceMonitoringPage";
import RestaurantDetailsMenuPage  from "./pages/solutions/RestaurantDetailsMenuPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Main ── */}
      <Route path="/"            element={<HomePage />} />

      {/* ── Primary nav pages ── */}
      <Route path="/about-us"    element={<AboutPage />} />
      <Route path="/contact-us"  element={<ContactPage />} />

      {/* ── Solutions ── */}
      <Route path="/solutions"                              element={<SolutionsPage />} />
      <Route path="/solutions/web-data-extraction"          element={<SolutionsPage />} />
      <Route path="/solutions/mobile-application-scraping"  element={<SolutionsPage />} />
      <Route path="/solutions/real-time-api"                element={<SolutionsPage />} />
      <Route path="/solutions/rpa"                          element={<SolutionsPage />} />
      <Route path="/solutions/data-analytics"               element={<SolutionsPage />} />

      {/* ── Solution Detail ── */}
      <Route path="/solutions/detail"                           element={<SolutionDetailPage />} />
      <Route path="/solutions/detail/:slug"                     element={<SolutionDetailPage />} />

      {/* ── Industries ── */}
      <Route path="/industries"                   element={<IndustriesPage />} />
      <Route path="/industries/e-commerce"        element={<IndustriesPage />} />
      <Route path="/industries/finance-banking"   element={<IndustriesPage />} />
      <Route path="/industries/healthcare"        element={<IndustriesPage />} />
      <Route path="/industries/real-estate"       element={<IndustriesPage />} />
      <Route path="/industries/travel-hospitality" element={<IndustriesPage />} />

      {/* ── Industries Detail ── */}
      <Route path="/industries-detail" element={<IndustriesDetailPage />} />

      {/* ── Resources ── */}
      <Route path="/resources"              element={<ResourcesPage />} />
      <Route path="/resources/blog"         element={<ResourcesPage />} />
      <Route path="/resources/case-studies" element={<ResourcesPage />} />
      <Route path="/resources/whitepapers"  element={<ResourcesPage />} />

      {/* ── Blog detail ── */}
      <Route path="/blog/:slug"             element={<PostDetailPage type="blog" />} />

      {/* ── Case Study detail ── */}
      <Route path="/case-studies/:slug"     element={<PostDetailPage type="case-study" />} />

      {/* ── Footer: Industries pages ── */}
      <Route path="/enterprise-web-crawling"  element={<EnterpriseWebCrawlingPage />} />
      <Route path="/mobile-app-scraping"      element={<MobileAppScrapingPage />} />
      <Route path="/web-scraping-api"         element={<WebScrapingApiPage />} />
      <Route path="/custom-data-extraction"   element={<CustomDataExtractionPage />} />
      <Route path="/price-scraping-services"  element={<PriceScrapingServicesPage />} />
      <Route path="/real-time-web-crawling"   element={<RealTimeWebCrawlingPage />} />
      <Route path="/digital-shelf-analytics"  element={<DigitalShelfAnalyticsPage />} />
      <Route path="/ai-powered-scraping"      element={<AiPoweredScrapingPage />} />

      {/* ── Footer: Ready Solutions pages ── */}
      <Route path="/real-time-api-solution"       element={<RealTimeApiPage />} />
      <Route path="/data-analytics-dashboard"     element={<DataAnalyticsDashboardPage />} />
      <Route path="/hotel-price-monitoring"       element={<HotelPriceMonitoringPage />} />
      <Route path="/restaurant-details-menu"      element={<RestaurantDetailsMenuPage />} />
      {/* /mobile-app-scraping is shared — Industries version above handles it */}

      {/* ── 404 fallback ── */}
      <Route path="*"            element={<NotFoundPage />} />
    </Routes>
  );
}
