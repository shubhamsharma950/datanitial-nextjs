/**
 * AboutPage.jsx
 * Uses InnerPageLayout with the About Us WordPress page (ID: 10, ACF: about_page).
 */

import InnerPageLayout from "./InnerPageLayout";
import "./AboutPage.css";

export default function AboutPage() {
  return (
    <InnerPageLayout
      pageId={10}
      acfField="about_page"
      fallbackTitle="About Us"
      fallbackDescription="At Datanitial, we empower businesses with scalable data solutions that turn complex web data into clear, actionable insights."
    >
      {/* Page-specific content goes here */}
    </InnerPageLayout>
  );
}
