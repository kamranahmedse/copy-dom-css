# Copy DOM + CSS

Point at any element on a webpage, click, and get its complete HTML with all styles inlined on your clipboard. Paste it into any HTML file and it renders exactly like the original, fonts and all.

![copy-dom-css](https://github.com/user-attachments/assets/placeholder.png)

## Install

```bash
git clone https://github.com/kamrify/copy-dom-css.git
cd copy-dom-css
npm install && npm run build
```

Then load it into Chrome:

1. Go to `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked** and select the project folder

## Usage

1. Click the extension icon in the toolbar
2. Hover over any element to highlight it
3. Click to copy. Done. It's on your clipboard.
4. Press **Escape** to cancel

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
