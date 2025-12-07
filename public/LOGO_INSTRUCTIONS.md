# iMonad Logo Instructions

## Logo File Requirements

The iMonad logo should be:
- **Format**: PNG with transparent background
- **File name**: `imonad-logo.png`
- **Location**: Place in `/public/imonad-logo.png`
- **Recommended size**: At least 200x200 pixels (will be displayed at various sizes)

## Where the Logo is Used

Once you place the logo file at `/public/imonad-logo.png`, it will automatically be used in:

1. **Boot Screen** - Displayed when the app first loads (80x80px)
   - File: `components/BootScreen.tsx`

## How to Add the Logo

1. Save your iMonad PNG logo (with transparent background) to:
   ```
   /Users/ocean3/Development/Monad/public/imonad-logo.png
   ```

2. Restart the development server if it's running:
   ```bash
   npm run dev
   ```

3. The logo will automatically appear in the boot screen!

## Optional: Update App Icons

If you also want to replace the emoji icons in the app grid with the iMonad logo, you can:
- Update `components/HomeScreen.tsx` - Change the Monad app icon from "🔷" to use the logo
- Update `components/apps/Safari.tsx` - Update the Monad website preview

