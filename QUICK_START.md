# 🚀 Orbital Animation - Quick Start

## Preview the Demo
Open `ORBITAL_DEMO.html` in your browser to see the animation in action.

## Run the React App
```bash
cd datanitial-nextjs
npm install
npm run dev
```

## How It Works

### 1. **Before Click** (Initial State)
- Badge, title, and description fade in
- Three concentric rings expand from center
- Central logo appears with floating animation
- Clean, minimal presentation

### 2. **After Click** (Orbital State)
- 8 use case images pop in sequentially
- Each node has independent floating motion
- Hover over nodes for scale effect
- Click again to hide nodes

## Key Features

✅ **Interactive Toggle** - Click to reveal/hide orbital nodes  
✅ **Smooth Animations** - 60fps GPU-accelerated transforms  
✅ **Responsive Design** - Works on all screen sizes  
✅ **Accessible** - Keyboard navigation and ARIA labels  
✅ **Customizable** - Easy to adjust colors, timing, and layout  

## Component Location
```
src/components/solution-detail/
├── SdSectionOne.jsx  ← Main component
└── SdSectionOne.css  ← Styles
```

## Customization Examples

### Change Orbit Radius
```javascript
// In SdSectionOne.jsx, line ~95
<OrbitalNode
  radius={280}  // Increase for larger orbit
  // ...
/>
```

### Adjust Animation Speed
```javascript
// In SdSectionOne.jsx, logo float animation
animate={{ y: [0, -10, 0] }}
transition={{
  duration: 4,  // Change to 2 for faster float
  repeat: Infinity,
  ease: "easeInOut",
}}
```

### Modify Ring Colors
```css
/* In SdSectionOne.css */
.orbital-ring {
  border: 1px solid #6366f1;  /* Change color here */
}
```

### Add More Nodes
```javascript
// In SdSectionOne.jsx, add more items to useCases array
const useCases = [
  { image: "url1", alt: "Case 1" },
  { image: "url2", alt: "Case 2" },
  // Add more...
];
```

## Animation Timeline
```
0.0s → Text fades in
0.2s → Outer ring expands
0.3s → Middle ring expands
0.4s → Inner ring expands
0.5s → Logo appears
0.6s → First node pops in
...  → Remaining nodes (0.1s apart)
```

## Browser Support
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (iOS 12+)
- ❌ IE11 (not supported)

## Dependencies
- `framer-motion` - Animation library
- `react` - UI framework

## Documentation
- 📖 **Full Guide**: `ORBITAL_ANIMATION_GUIDE.md`
- 📋 **Summary**: `IMPLEMENTATION_SUMMARY.md`
- 🎨 **Demo**: `ORBITAL_DEMO.html`

## Troubleshooting

### Nodes not appearing?
Make sure you click the central stage area.

### Animations not smooth?
Check if hardware acceleration is enabled in your browser.

### Build errors?
Run `npm install` to ensure all dependencies are installed.

## Next Steps
1. Open `ORBITAL_DEMO.html` to see the pure CSS version
2. Run `npm run dev` to see the React version
3. Read `ORBITAL_ANIMATION_GUIDE.md` for technical details
4. Customize colors, timing, and layout to match your brand

---

**Need help?** Check the full documentation in `ORBITAL_ANIMATION_GUIDE.md`
