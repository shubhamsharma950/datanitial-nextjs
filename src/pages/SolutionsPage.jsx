/**
 * SolutionsPage.jsx
 * Uses InnerPageLayout with the Solutions WordPress page.
 * Update pageId to match the WordPress Solutions page ID.
 */

import InnerPageLayout from "./InnerPageLayout";

export default function SolutionsPage() {
  return (
    <InnerPageLayout
      pageId={11}
      acfField="solutions_page"
      fallbackTitle="Our Solutions"
      fallbackDescription="Scalable, enterprise-grade data solutions designed to transform how your business collects, processes, and acts on data."
    >
      {/* Page-specific content goes here */}
    </InnerPageLayout>
  );
}
