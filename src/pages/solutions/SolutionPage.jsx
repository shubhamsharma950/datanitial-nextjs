/**
 * SolutionPage.jsx  —  pages/solutions/
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable wrapper for all dedicated solution pages.
 * Renders the exact same layout as SolutionDetailPage but fetches content
 * from the given WordPress post ID via SolutionDetailContext.
 *
 * Usage:
 *   <SolutionPage
 *     pageId={1330}
 *     seoTitle="Web Data Extraction"
 *     seoDescription="..."
 *     seoKeywords="..."
 *     fallbackTitle="Web Data Extraction"
 *     fallbackDescription="..."
 *   />
 */

import InnerPageLayout       from "../InnerPageLayout";
import SEO                   from "../../components/SEO";
import SdSectionOne          from "../../components/solution-detail/SdSectionOne";
import SdSectionProblems     from "../../components/solution-detail/SdSectionProblems";
import SdCard1               from "../../components/solution-detail/SdCard1";
import SdCard2               from "../../components/solution-detail/SdCard2";
import SdCard3               from "../../components/solution-detail/SdCard3";
import SdSectionDataInAction from "../../components/solution-detail/SdSectionDataInAction";
import SdWhatWeDo            from "../../components/solution-detail/SdWhatWeDo";
import SdExtractionProcess   from "../../components/solution-detail/SdExtractionProcess";
import FaqSection            from "../../components/FaqSection";
import { SolutionDetailContext } from "../../components/solution-detail/SolutionDetailContext";

export default function SolutionPage({
  pageId,
  seoTitle,
  seoDescription,
  seoKeywords,
  fallbackTitle       = "Solution",
  fallbackDescription = "Explore our enterprise-grade data solutions built for speed, scale, and reliability.",
}) {
  return (
    <SolutionDetailContext.Provider value={pageId}>
      <InnerPageLayout
        pageId={pageId}
        acfField=""
        fallbackTitle={fallbackTitle}
        fallbackDescription={fallbackDescription}
      >
        <SEO
          title={seoTitle || fallbackTitle}
          description={seoDescription || fallbackDescription}
          keywords={seoKeywords || ""}
        />

        <SdSectionOne />
        <SdSectionProblems />
        <SdCard1 />
        <SdCard2 />
        <SdCard3 />
        <SdSectionDataInAction />
        <SdWhatWeDo />
        <SdExtractionProcess />
        <FaqSection />
      </InnerPageLayout>
    </SolutionDetailContext.Provider>
  );
}
