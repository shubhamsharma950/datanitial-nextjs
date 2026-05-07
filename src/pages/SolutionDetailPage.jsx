/**
 * SolutionDetailPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Solution Detail inner page — Page ID: 919
 *
 * Section order:
 *   1. InnerPageLayout banner  (title, description, CTA from acf.banner)
 *   2. SdSectionProblems       (problems vs solutions two-column layout)
 *   3. SdCard1                 (card1 — text-left, image-right)
 *   4. SdCard2                 (card2/card — image-left, text-right)
 *   5. SdCard3                 (card3 — text-left, image-right)
 *   6. SdSectionDataInAction   (orbital animation - data in action)
 *   7. SdExtractionProcess     (numbered steps — extraction process journey)
 *   8. FaqSection
 */

import InnerPageLayout          from "./InnerPageLayout";
import SdSectionProblems        from "../components/solution-detail/SdSectionProblems";
import SdCard1                  from "../components/solution-detail/SdCard1";
import SdCard2                  from "../components/solution-detail/SdCard2";
import SdCard3                  from "../components/solution-detail/SdCard3";
import SdSectionDataInAction    from "../components/solution-detail/SdSectionDataInAction";
import SdExtractionProcess      from "../components/solution-detail/SdExtractionProcess";
import FaqSection               from "../components/FaqSection";

const PAGE_ID  = 919;
const ACF_FIELD = ""; // banner fields are flat on acf.banner for this page

export default function SolutionDetailPage() {
  return (
    <InnerPageLayout
      pageId={PAGE_ID}
      acfField={ACF_FIELD}
      fallbackTitle="Solution Detail"
      fallbackDescription="Explore our enterprise-grade data solutions built for speed, scale, and reliability."
    >
      {/* 1. Problems vs Solutions */}
      <SdSectionProblems />

      {/* 2. Card 1 — text-left, image-right */}
      <SdCard1 />

      {/* 3. Card 2 — image-left, text-right */}
      <SdCard2 />

      {/* 4. Card 3 — text-left, image-right */}
      <SdCard3 />

      {/* 5. Data in Action - Orbital Animation */}
      <SdSectionDataInAction />

      {/* 6. Extraction Process — numbered steps journey */}
      <SdExtractionProcess />

      {/* 7. FAQ */}
      <FaqSection />
    </InnerPageLayout>
  );
}
