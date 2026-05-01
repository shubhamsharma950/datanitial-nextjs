/**
 * ContactPage.jsx
 * Uses InnerPageLayout with the Contact Us WordPress page.
 * Update pageId to match the WordPress Contact page ID.
 */

import InnerPageLayout from "./InnerPageLayout";

export default function ContactPage() {
  return (
    <InnerPageLayout
      pageId={13}
      acfField="contact_page"
      fallbackTitle="Contact Us"
      fallbackDescription="Get in touch with our team. We'd love to hear from you and help your business grow."
    >
      {/* Page-specific content goes here */}
    </InnerPageLayout>
  );
}
