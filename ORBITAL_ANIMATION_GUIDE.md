# Orbital Animation Implementation Guide

## Overview
This document explains the "Data in Action" orbital animation section implemented in `SdSectionOne.jsx`. The section features a central logo surrounded by concentric glowing rings, with use case images that orbit around the logo when clicked.

## Features

### 1. **Interactive Toggle**
- Click the central stage to reveal/hide orbiting use case images
- Smooth spring-based animations for natural motion
- Keyboard accessible (Enter key support)

### 2. **Visual Elements**

#### Central Logo
- 3D-style geometric logo at the center
- Continuous floating animation (4-second loop)
- Blue glow effect with drop-shadow
- White rounded container with shadow

#### Concentric Rings
- Three glowing rings with radial gradients
- Staggered fade-in animation (0.2s, 0.3s, 0.4s delays)
- Blue tint (#6366f1) with varying opacity
- Soft glow using box-shadow

#### Orbital Nodes
- 8 use case images positioned in circular orbit
- Staggered pop-in animation (0.1s delay per node)
- Independent floating animations (3-6 second loops)
- Hover effects with scale and shadow enhancement

### 3. **Animation Timeline**

```
0.0s → Text header fades in and moves up
0.2s → Outer ring expands and fades in
0.3s → Middle ring expands and fades in
0.4s → Inner ring expands and fades in
0.5s → Central logo scales in
0.6s → First orbital node pops in
0.7s → Second orbital node pops in
... (continues for all 8 nodes)
```

## Technical Implementation

### Component Structure

```jsx
<section className="sd-s1">
  <div className="container">
    {/* Header with badge, title, description */}
    <motion.div className="sd-s1__header">
      <div className="badge-sec">...</div>
      <h2>...</h2>
      <p>...</p>
    </motion.div>

    {/* Orbital Stage */}
    <div className="sd-s1__stage" onClick={toggleOrbit}>
      {/* Three concentric rings */}
      <motion.div className="orbital-ring orbital-ring--outer" />
      <motion.div className="orbital-ring orbital-ring--middle" />
      <motion.div className="orbital-ring orbital-ring--inner" />

      {/* Central logo */}
      <motion.div className="sd-s1__logo-container">
        <motion.img src={logo} />
      </motion.div>

      {/* Orbiting nodes */}
      {showOrbit && useCases.map((useCase, i) => (
        <OrbitalNode key={i} {...useCase} />
      ))}
    </div>
  </div>
</section>
```

### Orbital Positioning Algorithm

Each node is positioned using polar coordinates:

```javascript
const angle = (index / totalNodes) * 360;  // Distribute evenly
const radian = (angle * Math.PI) / 180;    // Convert to radians
const x = Math.cos(radian) * radius;       // X position
const y = Math.sin(radian) * radius;       // Y position
```

### Animation Properties

| Element | Animation Type | Duration | Easing |
|---------|---------------|----------|--------|
| Header | Fade + Slide | 0.6s | easeOut |
| Rings | Scale + Fade | 1.0s | default |
| Logo | Scale + Fade | 0.8s | default |
| Logo Float | Y-axis loop | 4.0s | easeInOut |
| Nodes | Spring scale | ~0.5s | spring (stiff: 100, damp: 10) |
| Node Float | Y-axis loop | 3-6s | easeInOut |

## CSS Architecture

### Background
```css
background: radial-gradient(
  ellipse at center,
  #E0E7FF 0%,    /* Light blue center */
  #F8FAFF 50%,   /* Very light blue */
  #FFFFFF 100%   /* White edges */
);
```

### Ring Styling
```css
.orbital-ring {
  border: 1px solid #6366f1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%);
  box-shadow: 0 0 60px rgba(99, 102, 241, 0.15);
}
```

### Node Styling
```css
.orbital-node__image {
  border-radius: 12px;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.12),           /* Main shadow */
    0 0 0 3px rgba(255, 255, 255, 0.8),       /* White border */
    0 0 0 4px rgba(99, 102, 241, 0.2);        /* Blue glow */
}
```

## Responsive Behavior

### Desktop (>1024px)
- Stage: 800px × 600px
- Outer ring: 700px diameter
- Logo: 180px × 180px
- Nodes: 80px × 80px
- Orbit radius: 280px

### Tablet (768px - 1024px)
- Stage: 700px × 500px
- Outer ring: 600px diameter
- Logo: 140px × 140px
- Nodes: 60px × 60px

### Mobile (<768px)
- Stage: 500px × 400px
- Outer ring: 450px diameter
- Logo: 140px × 140px
- Nodes: 60px × 60px

### Small Mobile (<480px)
- Stage: 100% × 350px
- Outer ring: 350px diameter
- Logo: 100px × 100px
- Nodes: 50px × 50px

## Data Structure

### Expected API Response
```javascript
{
  badge_text: "DATA IN ACTION",
  title: "Unlocking Value Across Use Cases",
  description: "See how businesses leverage web data...",
  image: "/path/to/central-logo.png",
  use_cases: [
    { image: "/path/to/use-case-1.jpg", alt: "Use case 1" },
    { image: "/path/to/use-case-2.jpg", alt: "Use case 2" },
    // ... 8 total
  ]
}
```

### Fallback Data
If `use_cases` is not provided by the API, the component uses placeholder images from Unsplash.

## Accessibility

- **Keyboard Navigation**: Stage is focusable and responds to Enter key
- **ARIA Labels**: Section and interactive elements have descriptive labels
- **Alt Text**: All images include meaningful alt attributes
- **Focus Indicators**: Standard browser focus styles apply

## Performance Considerations

1. **Framer Motion**: Uses GPU-accelerated transforms for smooth animations
2. **useInView Hook**: Animations only trigger when section is visible
3. **Once Flag**: Animations run once to avoid re-triggering on scroll
4. **CSS Transforms**: All animations use transform/opacity for 60fps performance

## Customization

### Adjust Orbit Radius
```javascript
<OrbitalNode
  radius={280}  // Change this value
  // ...
/>
```

### Change Animation Timing
```javascript
transition={{
  duration: 0.8,     // Animation duration
  delay: 0.5,        // Start delay
  type: "spring",    // Animation type
  stiffness: 100,    // Spring stiffness
  damping: 10        // Spring damping
}}
```

### Modify Ring Count
Add or remove `<motion.div className="orbital-ring">` elements in the stage.

### Change Node Count
Modify the `useCases` array length. The positioning algorithm automatically distributes nodes evenly.

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 12+)
- IE11: Not supported (requires Framer Motion polyfills)

## Dependencies

```json
{
  "framer-motion": "^11.x",
  "react": "^19.x"
}
```

## Future Enhancements

1. **Auto-rotation**: Nodes slowly rotate around the center
2. **Click handlers**: Individual node click events
3. **Tooltips**: Show use case details on hover
4. **Particle effects**: Add floating particles in the background
5. **Sound effects**: Subtle audio feedback on interactions
6. **3D transforms**: Add perspective for depth effect
