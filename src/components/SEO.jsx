/**
 * SEO.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable SEO component for managing page metadata.
 * 
 * Usage:
 *   <SEO 
 *     title="Page Title" 
 *     description="Page description for search engines"
 *   />
 * 
 * Props:
 *   - title (string, required): Page title
 *   - description (string, required): Meta description for SEO
 *   - keywords (string, optional): Meta keywords
 *   - ogImage (string, optional): Open Graph image URL
 *   - ogType (string, optional): Open Graph type (default: "website")
 *   - canonical (string, optional): Canonical URL
 */

import { Helmet } from "react-helmet-async";

export default function SEO({ 
  title, 
  description, 
  keywords = "",
  ogImage = "",
  ogType = "website",
  canonical = ""
}) {
  const siteTitle = "Datanitial - Enterprise Web Scraping Experts";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const currentUrl = canonical || window.location.href;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
    </Helmet>
  );
}
