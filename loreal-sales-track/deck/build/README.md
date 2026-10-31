# Rebuilding the deck

`build.js` generates `../SMARTSELL_LOreal_Sales_Track_2026.pptx` with pptxgenjs (theme, layouts, native charts, speaker notes). Screenshots come from `../screens/`, which were captured from the live prototype.

```bash
npm install pptxgenjs react react-dom react-icons sharp qrcode
```
```bash
SKILL_DIR=<path to the pptx skill> node build.js ../SMARTSELL_LOreal_Sales_Track_2026.pptx
```
`SKILL_DIR` supplies `scripts/apply_theme.js`, which writes the burgundy theme colours into the file. Without it, the deck builds but falls back to Office's default palette.
