/**
 * IndustriesPage.jsx
 * Uses InnerPageLayout with the Industries WordPress page.
 * Update pageId to match the WordPress Industries page ID.
 */

import InnerPageLayout from "./InnerPageLayout";

export default function IndustriesPage() {
  return (
    <InnerPageLayout
      pageId={12}
      acfField="industries_page"
      fallbackTitle="Industries We Serve"
      fallbackDescription="From e-commerce to finance, we deliver tailored data intelligence solutions across every major industry vertical."
    >
      {/* Page-specific content goes here */}
    </InnerPageLayout>
  );
}
