# Rebuilding the deck

`build.js` generates `../SMARTSELL_LOreal_Sales_Track_2026.pptx` with pptxgenjs (theme, layouts, native charts, speaker notes). Screenshots come from `../screens/`, which were captured from the live prototype.

```bash
npm install pptxgenjs react react-dom react-icons sharp qrcode
```
```bash
SKILL_DIR=<path to the pptx skill> node build.js ../SMARTSELL_LOreal_Sales_Track_2026.pptx
```
`SKILL_DIR` supplies `scripts/apply_theme.js`, which writes the burgundy theme colours into the file. Without it, the deck builds but falls back to Office's default palette.

## Redesigned deck

`build-redesign.js` generates `../SMARTSELL_LOreal_Sales_Track_2026_Redesign.pptx` in the burgundy/charcoal/ivory editorial system, with the L'Oréal logo from `../brand/`. It reads speaker notes from `notes.json` (exported from the previous deck).

```bash
npm install pptxgenjs react react-dom react-icons sharp qrcode
```
```bash
SKILL_DIR=<path to the pptx skill> node build-redesign.js ../SMARTSELL_LOreal_Sales_Track_2026_Redesign.pptx
```
