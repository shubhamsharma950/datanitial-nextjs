/**
 * SimpleInnerPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Lightweight inner page that renders only the banner with a page title.
 * Used for footer-linked pages that don't yet have full content.
 *
 * Props:
 *   title       {string}  Page title shown in the banner
 *   fallbackBg  {string}  Optional CSS gradient override
 */

import { useEffect } from "react";
import InnerPageHeader from "./InnerPageHeader";
import InnerPageBanner from "./InnerPageBanner";
import PageLoader from "./PageLoader";
import "./InnerPageLayout.css";

export default function SimpleInnerPage({ title = "Page", fallbackBg }) {
  /* Add inner-page body class so global header is hidden */
  useEffect(() => {
    document.body.classList.add("inner-page");
    return () => document.body.classList.remove("inner-page");
  }, []);

  const banner = {
    title,
    description: "",
    ctaText: "",
    ctaLink: "",
    featuredImage: null,
  };

  return (
    <div className="ipl">
      <PageLoader />
      <div className="ipl__hero">
        <InnerPageHeader />
        <InnerPageBanner
          loading={false}
          banner={banner}
          fallbackBg={
            fallbackBg ||
            "linear-gradient(135deg, #0d0f2b 0%, #1a1060 60%, #0d0f2b 100%)"
          }
        />
      </div>
    </div>
  );
}
