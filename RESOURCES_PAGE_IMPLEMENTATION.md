# Resources Page Implementation

## Overview
Complete implementation of the Resources page with three separate sections, each fetching data from WordPress REST API.

**WordPress Page ID:** 17  
**Admin URL:** `post.php?post=17`  
**ACF Group Field:** `resources_page`

---

## File Structure

```
react-frontend/src/
├── pages/
│   └── ResourcesPage.jsx          ← Main page component (updated)
│
└── components/resources/
    ├── resourcesApi.js            ← API layer (NEW)
    ├── ResourcesSectionOne.jsx    ← Featured card section (NEW)
    ├── ResourcesSectionOne.css    ← (NEW)
    ├── ResourcesSectionTwo.jsx    ← Blog posts grid (NEW)
    ├── ResourcesSectionTwo.css    ← (NEW)
    ├── ResourcesSectionThree.jsx  ← Case studies grid (NEW)
    └── ResourcesSectionThree.css  ← (NEW)
```

---

## Section Breakdown

### Section 1: Featured Resource Card
**Component:** `ResourcesSectionOne.jsx`  
**Background:** Light blue (`#eef4ff`)

**Data Sources:**
- **ACF Meta:** `page 17 → section_one`
  - `badge_text` (default: "FEATURED RESOURCES")
  - `title` (default: "Insights That Matter Most")
  - `description` (default: "Handpicked content to help you stay ahead...")

- **Featured Post:** WP posts filtered by category slug `"featured"`
  - API: `GET /wp/v2/categories?slug=featured` → get category ID
  - API: `GET /wp/v2/posts?categories={id}&per_page=1&_embed=1`
  - Falls back to latest post if no "Featured" category exists

**Layout:**
- Centred header (badge + title + description)
- Large horizontal card:
  - Left: post image with green "Featured" badge overlay
  - Right: date, read time, title, excerpt, "Read More" button

---

### Section 2: Latest Blog Posts Grid
**Component:** `ResourcesSectionTwo.jsx`  
**Background:** White

**Data Sources:**
- **ACF Meta:** `page 17 → section_two`
  - `badge_text` (default: "ALL BLOGS")
  - `title` (default: "Latest Insights & Articles")
  - `description` (default: "Stay updated with trends...")

- **Blog Posts:** Standard WP posts
  - API: `GET /wp/v2/posts?per_page=6&page={N}&_embed=1`
  - Supports pagination via "Load More" button

**Layout:**
- Centred header (badge + title + description)
- 3-column card grid (responsive: 2-col tablet, 1-col mobile)
- Each card: image, date, read time, title, "Read More…" link
- "Load More" button at bottom (fetches next page)

---

### Section 3: Case Studies Grid
**Component:** `ResourcesSectionThree.jsx`  
**Background:** Light blue-grey (`#f0f4ff`)

**Data Sources:**
- **ACF Meta:** `page 17 → section_three`
  - `badge_text` (default: "ALL CASE STUDIES")
  - `title` (default: "Real Results. Proven Impact.")
  - `description` (default: "See how businesses across industries...")

- **Case Studies:** Custom post type `case-studies`
  - API: `GET /wp/v2/case-studies?per_page=6&page={N}&_embed=1`
  - Supports pagination via "Load More" button

**Layout:**
- Centred header (badge + title + description)
- 3-column card grid (responsive: 2-col tablet, 1-col mobile)
- Each card: image, date, read time, title, "Read More…" link
- "Load More" button at bottom (fetches next page)

---

## WordPress Setup Required

### 1. ACF Fields (Page ID 17)
Create ACF group `resources_page` with three sub-groups:

```
resources_page (Group)
├── section_one (Group)
│   ├── badge_text    (Text)
│   ├── title         (Text)
│   └── description   (Text Area)
│
├── section_two (Group)
│   ├── badge_text    (Text)
│   ├── title         (Text)
│   └── description   (Text Area)
│
└── section_three (Group)
    ├── badge_text    (Text)
    ├── title         (Text)
    └── description   (Text Area)
```

### 2. Post Category
Create a category with slug `"featured"` for Section 1 featured posts.

### 3. Custom Post Type
Register custom post type with slug `"case-studies"` for Section 3.

**Example registration (functions.php):**
```php
function register_case_studies_cpt() {
  register_post_type('case-studies', [
    'labels' => [
      'name'          => 'Case Studies',
      'singular_name' => 'Case Study',
    ],
    'public'       => true,
    'has_archive'  => true,
    'show_in_rest' => true, // ← Required for REST API
    'supports'     => ['title', 'editor', 'thumbnail', 'excerpt'],
    'rewrite'      => ['slug' => 'case-studies'],
  ]);
}
add_action('init', 'register_case_studies_cpt');
```

---

## API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /wp/v2/pages/17?_fields=acf` | Fetch ACF meta for all sections |
| `GET /wp/v2/categories?slug=featured` | Resolve "Featured" category ID |
| `GET /wp/v2/posts?categories={id}&per_page=1&_embed=1` | Featured post (Section 1) |
| `GET /wp/v2/posts?per_page=6&page={N}&_embed=1` | Blog posts grid (Section 2) |
| `GET /wp/v2/case-studies?per_page=6&page={N}&_embed=1` | Case studies grid (Section 3) |

---

## Features

✅ **Modular architecture** — each section is a self-contained component  
✅ **Shared API layer** — `resourcesApi.js` caches page ACF data  
✅ **Load-more pagination** — Sections 2 & 3 support infinite scroll  
✅ **Skeleton loaders** — smooth loading states for all sections  
✅ **Responsive design** — mobile-first, 3-col → 2-col → 1-col  
✅ **Accessibility** — semantic HTML, ARIA labels, keyboard navigation  
✅ **Graceful fallbacks** — default text when ACF fields are empty  
✅ **Image optimization** — lazy loading, responsive images  
✅ **Consistent styling** — matches existing Solutions/Industries patterns  

---

## Testing Checklist

- [ ] Verify page loads at `/resources`
- [ ] Check ACF fields populate correctly (badge, title, description)
- [ ] Confirm featured post displays in Section 1
- [ ] Test blog posts grid loads 6 posts in Section 2
- [ ] Test case studies grid loads 6 posts in Section 3
- [ ] Click "Load More" buttons — verify pagination works
- [ ] Test responsive breakpoints (desktop, tablet, mobile)
- [ ] Verify skeleton loaders appear during fetch
- [ ] Check empty states when no posts exist
- [ ] Test featured image fallback (gradient background)
- [ ] Verify "Read More" links navigate correctly

---

## Notes

- **Pattern consistency:** Follows the same architecture as `solutions/` components
- **Performance:** Page ACF data is fetched once and cached in `resourcesApi.js`
- **Extensibility:** Easy to add Section 4, 5, etc. by creating new components
- **SEO-friendly:** Semantic HTML, proper heading hierarchy, alt text
- **No breaking changes:** Existing routes and imports remain unchanged

---

## Future Enhancements

- Add filters (by category, tag, date)
- Add search functionality
- Implement infinite scroll (replace "Load More" button)
- Add social share buttons on cards
- Add reading progress indicator
- Implement post views/likes counter
