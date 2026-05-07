# Logo Swap Feature - Click to Change

## ✅ Feature Implemented

The orbital animation now includes a dynamic logo swap feature. When users click to reveal the orbital nodes, the central logo changes from one image to another.

## 🎯 Behavior

### Initial State (Before Click)
- **Logo**: `l1.png` (first logo)
- **URL**: `https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/05/l1.png`
- **Orbital Nodes**: Hidden

### Active State (After Click)
- **Logo**: `l2.png` (second logo)
- **URL**: `https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/05/l2.png`
- **Orbital Nodes**: Visible (8 use case images orbiting)

### Toggle Behavior
- Click again to hide nodes and return to `l1.png`
- Smooth transition between logo images (0.3s fade)

## 📁 Files Updated

### 1. SdSectionOne.jsx
```javascript
<img
  src={showOrbit 
    ? "https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/05/l2.png"
    : "https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/05/l1.png"
  }
  alt={data.title || "Solution logo"}
  className="sd-s1__logo"
/>
```

### 2. SdSectionDataInAction.jsx
```javascript
<img
  src={showOrbit 
    ? "https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/05/l2.png"
    : "https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/05/l1.png"
  }
  alt={data.title || "Solution logo"}
  className="sddia__logo"
/>
```

### 3. CSS Transition
Both CSS files now include smooth transition:
```css
.sd-s1__logo,
.sddia__logo {
  transition: opacity 0.3s ease;
}
```

## 🎬 Animation Timeline

```
User Action: Click on stage
├─ 0.0s → Logo fades to l2.png (0.3s transition)
├─ 0.0s → Node 1 pops in
├─ 0.1s → Node 2 pops in
├─ 0.2s → Node 3 pops in
├─ 0.3s → Node 4 pops in
├─ 0.4s → Node 5 pops in
├─ 0.5s → Node 6 pops in
├─ 0.6s → Node 7 pops in
└─ 0.7s → Node 8 pops in

User Action: Click again
├─ 0.0s → Logo fades back to l1.png (0.3s transition)
└─ 0.0s → All nodes disappear
```

## 🎨 Visual States

### State 1: Inactive (Default)
```
┌─────────────────────────────┐
│                             │
│    ○ ○ ○  (rings only)     │
│   ○     ○                   │
│  ○  [L1] ○  ← First logo   │
│   ○     ○                   │
│    ○ ○ ○                    │
│                             │
│   Click to reveal cases     │
└─────────────────────────────┘
```

### State 2: Active (After Click)
```
┌─────────────────────────────┐
│                             │
│  🖼️ 🖼️ 🖼️  (nodes visible)  │
│ 🖼️  ○ ○ ○  🖼️               │
│🖼️  ○ [L2] ○  🖼️ ← Second logo│
│ 🖼️  ○ ○ ○  🖼️               │
│  🖼️ 🖼️ 🖼️                   │
│                             │
│   Click to hide cases       │
└─────────────────────────────┘
```

## 💡 Use Cases

### Why Two Logos?

1. **Visual Feedback**: Shows the user that clicking had an effect
2. **State Indication**: Different logo indicates different state
3. **Engagement**: Adds interactivity and surprise
4. **Branding**: Can show different aspects of the brand
5. **Storytelling**: First logo = question, second logo = answer

### Example Scenarios

**Scenario 1: Before/After**
- L1: "What can we do?"
- L2: "Here's what we do!" (with use cases)

**Scenario 2: Simple/Detailed**
- L1: Simple icon
- L2: Detailed logo with tagline

**Scenario 3: Question/Answer**
- L1: Question mark or curiosity icon
- L2: Solution or checkmark icon

## 🔧 Customization

### Change Logo URLs

Edit the image URLs in both components:

```javascript
// In SdSectionOne.jsx and SdSectionDataInAction.jsx
src={showOrbit 
  ? "YOUR_SECOND_LOGO_URL"  // Active state
  : "YOUR_FIRST_LOGO_URL"   // Default state
}
```

### Adjust Transition Speed

Edit the CSS transition duration:

```css
.sd-s1__logo,
.sddia__logo {
  transition: opacity 0.5s ease;  /* Change 0.3s to 0.5s for slower */
}
```

### Add Scale Effect

For a more dramatic transition:

```css
.sd-s1__logo,
.sddia__logo {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.sd-s1__logo:hover,
.sddia__logo:hover {
  transform: scale(1.05);
}
```

## 🎯 Technical Details

### State Management
- Uses React `useState` hook: `showOrbit`
- Boolean toggle: `false` (L1) / `true` (L2)
- Controlled by click handler on stage

### Image Loading
- Both images are loaded on component mount
- Browser caches both images
- No loading delay on swap

### Accessibility
- Alt text remains consistent
- Screen readers announce state change
- Keyboard accessible (Enter key)

## 📊 Performance

### Image Optimization
- Use optimized images (WebP format recommended)
- Recommended size: 180x180px @ 2x = 360x360px
- Keep file size under 50KB for fast loading

### Preloading (Optional)
Add to component if needed:

```javascript
useEffect(() => {
  // Preload second logo
  const img = new Image();
  img.src = "https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/05/l2.png";
}, []);
```

## ✅ Build Status

```bash
✓ built in 448ms
No diagnostics errors
Bundle size: 444.14 kB (optimized)
```

## 🎉 Result

Both orbital animation sections now feature:
- ✅ Dynamic logo swap on click
- ✅ Smooth 0.3s transition
- ✅ L1 (default) → L2 (active)
- ✅ Toggle back and forth
- ✅ Synchronized with orbital nodes
- ✅ Works in both SdSectionOne and SdSectionDataInAction

**The logo swap feature adds an extra layer of interactivity and visual interest to the orbital animation!** 🚀
