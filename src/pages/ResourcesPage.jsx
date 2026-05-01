/**
 * ResourcesPage.jsx
 * Uses InnerPageLayout with the Resources WordPress page.
 * Update pageId to match the WordPress Resources page ID.
 */

import InnerPageLayout from "./InnerPageLayout";
import ResourcesBlog from "../components/ResourcesBlog";

export default function ResourcesPage() {
  return (
    <InnerPageLayout
      pageId={14}
      acfField="resources_page"
      fallbackTitle="Resources & Insights"
      fallbackDescription="Explore our latest articles, guides, and case studies to stay ahead in the world of data intelligence."
    >
      <ResourcesBlog />
    </InnerPageLayout>
  );
}
