# Troubleshooting - Orbital Animation Not Loading

## Issue Fixed ✅

The component has been updated with:
1. Better error handling
2. Fallback data when API fails
3. Conditional rendering for the logo
4. Fixed `useInView` hook placement

## How to Debug

### 1. Check Browser Console
Open Developer Tools (F12) and look for:
- JavaScript errors
- Network errors (failed API calls)
- React warnings

### 2. Verify Dev Server is Running
```bash
cd datanitial-nextjs
npm run dev
```

The server should start on `http://localhost:5173` (or similar port).

### 3. Check if Component is Rendered
In the browser console, run:
```javascript
document.querySelector('.sddia')
```

If it returns `null`, the component isn't being rendered at all.

### 4. Check API Response
Open Network tab in DevTools and look for:
- Request to `/wp-json/wp/v2/pages/919`
- Check if it returns valid data
- Look for CORS errors

### 5. Test with Fallback Data
The component now includes fallback data, so it should display even if the API fails:
- Badge: "DATA IN ACTION"
- Title: "Unlocking Value Across Use Cases"
- Description: "See how businesses leverage..."
- Logo: Placeholder image

## Common Issues & Solutions

### Issue 1: White/Blank Screen
**Cause**: JavaScript error preventing render  
**Solution**: Check browser console for errors

### Issue 2: Skeleton Loading Forever
**Cause**: API call hanging or failing  
**Solution**: 
- Check network tab for failed requests
- Verify WordPress API is accessible
- Component now has fallback data

### Issue 3: No Animations
**Cause**: Framer Motion not loaded  
**Solution**:
```bash
npm install framer-motion
npm run dev
```

### Issue 4: Images Not Loading
**Cause**: CORS or invalid image URLs  
**Solution**: 
- Check image URLs in network tab
- Verify Unsplash images are accessible
- Check browser console for CORS errors

### Issue 5: Component Not in Page
**Cause**: Component not imported/used  
**Solution**: Check where `<SdSectionDataInAction />` is used

## Verification Steps

### Step 1: Check Component Import
Find where the component is used (likely in a solution detail page):
```bash
cd datanitial-nextjs
grep -r "SdSectionDataInAction" src/
```

### Step 2: Verify Framer Motion
```bash
npm list framer-motion
```

Should show: `framer-motion@11.x.x` (or similar)

### Step 3: Test Build
```bash
npm run build
```

Should complete without errors (already verified ✅)

### Step 4: Test in Browser
1. Open `http://localhost:5173`
2. Navigate to solution detail page
3. Scroll to "Data in Action" section
4. Should see:
   - Radial gradient background (light blue to white)
   - Title and description
   - Central logo with floating animation
   - Three glowing rings
5. Click the central area to reveal orbital nodes

## Manual Test with Demo
Open `ORBITAL_DEMO.html` in a browser to see a pure CSS/JS version without React dependencies.

## Debug Mode

Add this to the component to see what data is loaded:

```javascript
useEffect(() => {
  console.log("Data loaded:", data);
  console.log("Loading:", loading);
  console.log("Show orbit:", showOrbit);
}, [data, loading, showOrbit]);
```

## Expected Behavior

### On Page Load
1. Skeleton appears (gray placeholders)
2. API call is made
3. Data loads (or fallback data is used)
4. Section fades in

### On Scroll Into View
1. Header text fades in and slides up
2. Rings expand from center (staggered)
3. Central logo scales in and starts floating

### On Click
1. 8 orbital nodes pop in sequentially
2. Each node has independent floating motion
3. Hover over nodes for scale effect

## Still Not Working?

### Check These Files
1. `src/components/solution-detail/SdSectionDataInAction.jsx` - Component code
2. `src/components/solution-detail/SdSectionDataInAction.css` - Styles
3. `src/components/solution-detail/solutionsDetailApi.js` - API calls

### Verify Dependencies
```bash
npm install
npm run dev
```

### Clear Cache
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Restart dev server
npm run dev
```

### Check Port Conflicts
If port 5173 is in use:
```bash
# Kill process on port 5173 (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- --port 3000
```

## Contact Points

If the issue persists:
1. Check browser console for specific error messages
2. Verify the page you're viewing actually includes `<SdSectionDataInAction />`
3. Test the standalone demo: `ORBITAL_DEMO.html`
4. Check if other components on the page are loading correctly

## Recent Changes ✅

- Added fallback data for when API fails
- Fixed `useInView` hook placement
- Added conditional rendering for logo
- Added error logging to console
- Improved error handling in data fetch

The component should now load even if the API fails or returns incomplete data.
