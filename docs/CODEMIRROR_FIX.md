# CodeMirror Extension Conflict Fix

## Problem

Error: `Unrecognized extension value in extension set ([object Object])` - This occurs when multiple instances of `@codemirror/state` are loaded, breaking instanceof checks.

## Root Cause

1. **Removed conflicting package**: `@codemirror/basic-setup@0.20.0` was pulling in CodeMirror 0.20.x packages while other packages use 6.x
2. **Extension format issue**: Mixing `LanguageSupport` objects with raw extensions can cause conflicts
3. **Bundling conflicts**: `@uiw/react-codemirror` may bundle its own CodeMirror packages

## Solution Applied

### 1. Removed Conflicting Package
```bash
npm uninstall @codemirror/basic-setup
```

### 2. Updated Vite Configuration
Added dependency deduplication in `vite.config.js`:
```javascript
resolve: {
  dedupe: [
    '@codemirror/state',
    '@codemirror/view',
    '@codemirror/language',
    '@codemirror/autocomplete',
    '@codemirror/lint',
    '@codemirror/lang-markdown',
    '@codemirror/theme-one-dark',
    '@lezer/highlight',
    '@lezer/lr'
  ]
},
optimizeDeps: {
  include: [/* all CodeMirror packages */],
  force: true
}
```

### 3. Simplified Extension Usage
Temporarily simplified `canvaslLanguage()` to return just `markdown()` support to avoid extension conflicts. LSP features can be re-enabled once the base setup is stable.

### 4. Clean Reinstall
```bash
rm -rf node_modules package-lock.json
npm install
rm -rf node_modules/.vite  # Clear Vite cache
```

## Current Status

- ✅ Conflicting package removed
- ✅ Vite deduplication configured
- ✅ Simplified extension usage (markdown only for now)
- ✅ Dependencies reinstalled

## Next Steps

1. **Test the editor** - Verify it works with basic markdown support
2. **Gradually re-enable LSP features** - Add extensions one at a time to identify conflicts
3. **Monitor for conflicts** - Watch console for any remaining extension errors

## Re-enabling LSP Features

Once the base editor works, uncomment the LSP extensions in `canvasl-language.js`:

```javascript
// In canvasl-language.js, uncomment the extensions array
const extensions = [
  autocompletion({ override: [getLSPAutocomplete()] }),
  linter(getLSPLinter()),
  completionKeymap,
  lintKeymap
];

return new LanguageSupport(
  markdownSupport.language,
  [...markdownSupport.support, ...extensions]
);
```

## Verification

Check that all CodeMirror packages are deduped:
```bash
npm list @codemirror/state | grep deduped
```

All instances should show `deduped`, indicating npm resolved them to a single version.

