/**
 * routes.jsx
 * Central routing configuration for the Datanitial React app.
 * Add new pages here — import the page component and add a <Route>.
 */

import { Routes, Route } from "react-router-dom";

import HomePage      from "./pages/HomePage";
import ResourcesPage from "./pages/ResourcesPage";
import AboutPage     from "./pages/AboutPage";
import SolutionsPage from "./pages/SolutionsPage";
import IndustriesPage from "./pages/IndustriesPage";
import ContactPage   from "./pages/ContactPage";
import NotFoundPage  from "./pages/NotFoundPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Main ── */}
      <Route path="/"            element={<HomePage />} />

      {/* ── Primary nav pages ── */}
      <Route path="/about-us"    element={<AboutPage />} />
      <Route path="/solutions"   element={<SolutionsPage />} />
      <Route path="/industries"  element={<IndustriesPage />} />
      <Route path="/resources"   element={<ResourcesPage />} />
      <Route path="/contact-us"  element={<ContactPage />} />

      {/* ── 404 fallback ── */}
      <Route path="*"            element={<NotFoundPage />} />
    </Routes>
  );
}
