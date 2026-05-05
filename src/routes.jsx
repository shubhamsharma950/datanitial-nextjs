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
import SolutionsPage   from "./pages/SolutionsPage";
import IndustriesPage  from "./pages/IndustriesPage";
import ContactPage     from "./pages/ContactPage";
import NotFoundPage    from "./pages/NotFoundPage";

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

      {/* ── Industries ── */}
      <Route path="/industries"                   element={<IndustriesPage />} />
      <Route path="/industries/e-commerce"        element={<IndustriesPage />} />
      <Route path="/industries/finance-banking"   element={<IndustriesPage />} />
      <Route path="/industries/healthcare"        element={<IndustriesPage />} />
      <Route path="/industries/real-estate"       element={<IndustriesPage />} />
      <Route path="/industries/travel-hospitality" element={<IndustriesPage />} />

      {/* ── Resources ── */}
      <Route path="/resources"              element={<ResourcesPage />} />
      <Route path="/resources/blog"         element={<ResourcesPage />} />
      <Route path="/resources/case-studies" element={<ResourcesPage />} />
      <Route path="/resources/whitepapers"  element={<ResourcesPage />} />

      {/* ── Blog detail ── */}
      <Route path="/blog/:slug"             element={<PostDetailPage type="blog" />} />

      {/* ── Case Study detail ── */}
      <Route path="/case-studies/:slug"     element={<PostDetailPage type="case-study" />} />

      {/* ── 404 fallback ── */}
      <Route path="*"            element={<NotFoundPage />} />
    </Routes>
  );
}
