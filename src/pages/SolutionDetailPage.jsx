/**
 * SolutionDetailPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Solution Detail inner page — Page ID: 919
 *
 * Section order:
 *   1. InnerPageLayout banner  (title, description, CTA from acf.banner)
 *   2. SdSectionOne            (badge + title + description header)
 *   3. SdSectionProblems       (problems vs solutions two-column layout)
 *   4. SdCard1                 (card1 — text-left, image-right)
 *   5. SdCard2                 (card2/card — image-left, text-right)
 *   6. SdCard3                 (card3 — text-left, image-right)
 *   7. SdSectionDataInAction   (data in action — text-left, image-right)
 *   8. SdExtractionProcess     (numbered steps — extraction process journey)
 *   9. FaqSection
 */

import InnerPageLayout          from "./InnerPageLayout";
import SdSectionOne             from "../components/solution-detail/SdSectionOne";
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
      {/* 1. Section One — centred header */}
      <SdSectionOne />

      {/* 2. Problems vs Solutions */}
      <SdSectionProblems />

      {/* 3. Card 1 — text-left, image-right */}
      <SdCard1 />

      {/* 4. Card 2 — image-left, text-right */}
      <SdCard2 />

      {/* 5. Card 3 — text-left, image-right */}
      <SdCard3 />

      {/* 6. Data in Action */}
      <SdSectionDataInAction />

      {/* 7. Extraction Process — numbered steps journey */}
      <SdExtractionProcess />

      {/* 8. FAQ */}
      <FaqSection />
    </InnerPageLayout>
  );
}
