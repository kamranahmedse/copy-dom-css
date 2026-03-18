# Copy DOM + CSS

Point at any element on a webpage, click, and get its complete HTML with all styles inlined on your clipboard. Paste it into any HTML file and it renders exactly like the original, fonts and all.

## Usage

Install it from the [Chrome Webstore](https://dub.sh/copy-dom-css)

## Usage

- Click the extension icon in the toolbar
- Hover over any element to highlight it
- Click to copy. Done. It's on your clipboard.
- Press **Escape** to cancel

## What gets captured

- Full HTML tree of the selected element
- All computed styles, inlined on each element
- Custom fonts (`@font-face` rules with resolved URLs)
- Pseudo-elements (`::before`, `::after`) converted to real elements
- SVG icons with correct colors and dimensions
- Images with absolute URLs and preserved sizes

## Background

I built this while migrating an old codebase. I needed to recreate parts of the UI in a new stack and didn't want to hand-code any of it. So I'd grab the rendered output with this extension, paste it into Claude Code, and let it do the rest. Saved me a lot of tedious work.

## Dev

```bash
npm run watch
```

## License

[MIT](LICENSE)
