(() => {
  if ((window as any).__copyDomPickerActive) {
    return;
  }
  (window as any).__copyDomPickerActive = true;

  const overlay = createOverlay();
  const tooltip = createTooltip();
  const toast = createToast();
  let currentTarget: Element | null = null;

  document.body.classList.add("__copy-dom-picking");
  document.addEventListener("mousemove", onMouseMove, true);
  document.addEventListener("click", onClick, true);
  document.addEventListener("keydown", onKeyDown, true);

  function createOverlay(): HTMLDivElement {
    const el = document.createElement("div");
    el.className = "__copy-dom-overlay";
    document.body.appendChild(el);
    return el;
  }

  function createTooltip(): HTMLDivElement {
    const el = document.createElement("div");
    el.className = "__copy-dom-tooltip";
    el.style.display = "none";
    document.body.appendChild(el);
    return el;
  }

  function createToast(): HTMLDivElement {
    const el = document.createElement("div");
    el.className = "__copy-dom-toast";
    el.textContent = "Copied to clipboard!";
    document.body.appendChild(el);
    return el;
  }

  function onMouseMove(e: MouseEvent) {
    const target = document.elementFromPoint(e.clientX, e.clientY);

    if (
      !target ||
      target === overlay ||
      target === tooltip ||
      target === toast
    ) {
      return;
    }

    currentTarget = target;
    const rect = target.getBoundingClientRect();

    overlay.style.top = `${rect.top}px`;
    overlay.style.left = `${rect.left}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;

    const tag = target.tagName.toLowerCase();
    const id = target.id ? `#${target.id}` : "";
    const classes = Array.from(target.classList)
      .filter((c) => !c.startsWith("__copy-dom"))
      .slice(0, 3)
      .map((c) => `.${c}`)
      .join("");

    tooltip.textContent = `${tag}${id}${classes}`;
    tooltip.style.display = "block";

    const tooltipX = Math.min(e.clientX + 12, window.innerWidth - 200);
    const tooltipY = e.clientY + 20;
    tooltip.style.left = `${tooltipX}px`;
    tooltip.style.top = `${tooltipY}px`;
  }

  function onClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (!currentTarget) {
      return;
    }

    const html = extractElementWithStyles(currentTarget);
    chrome.runtime.sendMessage({ type: "copy-result", html });

    showToast();
    cleanup();
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      cleanup();
    }
  }

  function showToast() {
    toast.classList.add("--visible");
    setTimeout(() => {
      toast.classList.remove("--visible");
      setTimeout(() => toast.remove(), 200);
    }, 1500);
  }

  function cleanup() {
    document.body.classList.remove("__copy-dom-picking");
    document.removeEventListener("mousemove", onMouseMove, true);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("keydown", onKeyDown, true);
    overlay.remove();
    tooltip.remove();
    (window as any).__copyDomPickerActive = false;
  }

  const PROPERTIES = [
    "display",
    "position",
    "top",
    "right",
    "bottom",
    "left",
    "float",
    "clear",
    "z-index",
    "overflow-x",
    "overflow-y",
    "margin-top",
    "margin-right",
    "margin-bottom",
    "margin-left",
    "padding-top",
    "padding-right",
    "padding-bottom",
    "padding-left",
    "border-top-width",
    "border-right-width",
    "border-bottom-width",
    "border-left-width",
    "border-top-style",
    "border-right-style",
    "border-bottom-style",
    "border-left-style",
    "border-top-color",
    "border-right-color",
    "border-bottom-color",
    "border-left-color",
    "border-top-left-radius",
    "border-top-right-radius",
    "border-bottom-right-radius",
    "border-bottom-left-radius",
    "background-color",
    "background-image",
    "background-size",
    "background-position",
    "background-repeat",
    "color",
    "font-family",
    "font-size",
    "font-weight",
    "font-style",
    "line-height",
    "letter-spacing",
    "text-align",
    "text-decoration-line",
    "text-decoration-color",
    "text-decoration-style",
    "text-transform",
    "white-space",
    "word-break",
    "word-spacing",
    "vertical-align",
    "box-shadow",
    "text-shadow",
    "opacity",
    "transform",
    "flex-direction",
    "flex-wrap",
    "flex-grow",
    "flex-shrink",
    "flex-basis",
    "justify-content",
    "align-items",
    "align-self",
    "align-content",
    "order",
    "gap",
    "row-gap",
    "column-gap",
    "grid-template-columns",
    "grid-template-rows",
    "grid-column-start",
    "grid-column-end",
    "grid-row-start",
    "grid-row-end",
    "box-sizing",
    "list-style-type",
    "list-style-position",
    "text-overflow",
    "visibility",
    "border-collapse",
    "border-spacing",
    "table-layout",
    "aspect-ratio",
    "object-fit",
    "object-position",
    "cursor",
    "outline-style",
    "outline-width",
    "outline-color",
    "fill",
    "stroke",
    "stroke-width",
    "stroke-linecap",
    "stroke-linejoin",
    "animation-name",
    "animation-duration",
    "animation-timing-function",
    "animation-delay",
    "animation-iteration-count",
    "animation-direction",
    "animation-fill-mode",
    "animation-play-state",
    "transition-property",
    "transition-duration",
    "transition-timing-function",
    "transition-delay",
  ];

  const SVG_NS = "http://www.w3.org/2000/svg";
  const SVG_TAGS = new Set([
    "svg", "path", "g", "circle", "rect", "line", "polyline",
    "polygon", "ellipse", "text", "tspan", "defs", "clipPath",
    "mask", "use", "symbol", "linearGradient", "radialGradient",
    "stop", "filter", "feGaussianBlur", "feOffset", "feMerge",
    "feMergeNode", "feFlood", "feComposite", "feBlend",
  ]);

  function isSvgElement(el: Element): boolean {
    return SVG_TAGS.has(el.tagName.toLowerCase());
  }

  function extractElementWithStyles(element: Element): string {
    const clone = element.cloneNode(true) as Element;
    inlineStyles(element, clone);
    resolveUrls(clone);
    cleanupAttributes(clone);

    const usedFonts = collectUsedFonts(element);
    const fontFaces = extractFontFaces(usedFonts);

    const usedAnimations = collectUsedAnimations(element);
    const keyframes = extractKeyframes(usedAnimations);

    const styleBlocks = [...fontFaces, ...keyframes];

    if (styleBlocks.length > 0) {
      return `<style>\n${styleBlocks.join("\n\n")}\n</style>\n\n${clone.outerHTML}`;
    }

    return clone.outerHTML;
  }

  function collectUsedFonts(root: Element): Set<string> {
    const fonts = new Set<string>();

    function walk(el: Element) {
      const computed = window.getComputedStyle(el);
      const family = computed.getPropertyValue("font-family");
      if (family) {
        for (const f of family.split(",")) {
          fonts.add(f.trim().replace(/^["']|["']$/g, ""));
        }
      }

      for (const child of Array.from(el.children)) {
        if (!child.className?.toString().includes("__copy-dom")) {
          walk(child);
        }
      }
    }

    walk(root);
    return fonts;
  }

  function extractFontFaces(usedFonts: Set<string>): string[] {
    const fontRules: string[] = [];

    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules)) {
          if (!(rule instanceof CSSFontFaceRule)) {
            continue;
          }

          const family = rule.style
            .getPropertyValue("font-family")
            .replace(/^["']|["']$/g, "");

          if (!usedFonts.has(family)) {
            continue;
          }

          const cssText = resolveUrlsInCssText(rule.cssText, sheet.href);
          fontRules.push(cssText);
        }
      } catch {
        // cross-origin stylesheet, try link-based fallback
        if (sheet.href) {
          fontRules.push(...extractFontFacesFromLink(sheet.href, usedFonts));
        }
      }
    }

    return fontRules;
  }

  function resolveUrlsInCssText(cssText: string, baseHref: string | null): string {
    const base = baseHref || document.baseURI;
    return cssText.replace(/url\(["']?(?!data:)([^"')]+)["']?\)/g, (_, url) => {
      try {
        return `url("${new URL(url, base).href}")`;
      } catch {
        return `url("${url}")`;
      }
    });
  }

  function extractFontFacesFromLink(href: string, usedFonts: Set<string>): string[] {
    // For cross-origin sheets (like Google Fonts), emit an @import so the browser fetches them
    for (const font of usedFonts) {
      if (href.toLowerCase().includes(font.toLowerCase().replace(/\s+/g, "+"))) {
        return [`@import url("${href}");`];
      }
    }
    return [];
  }

  function collectUsedAnimations(root: Element): Set<string> {
    const animations = new Set<string>();

    function walk(el: Element) {
      const computed = window.getComputedStyle(el);
      const name = computed.getPropertyValue("animation-name");
      if (name && name !== "none") {
        for (const n of name.split(",")) {
          const trimmed = n.trim();
          if (trimmed && trimmed !== "none") {
            animations.add(trimmed);
          }
        }
      }

      for (const child of Array.from(el.children)) {
        if (!child.className?.toString().includes("__copy-dom")) {
          walk(child);
        }
      }
    }

    walk(root);
    return animations;
  }

  function extractKeyframes(usedAnimations: Set<string>): string[] {
    if (usedAnimations.size === 0) {
      return [];
    }

    const keyframeRules: string[] = [];

    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules)) {
          if (!(rule instanceof CSSKeyframesRule)) {
            continue;
          }

          if (!usedAnimations.has(rule.name)) {
            continue;
          }

          keyframeRules.push(rule.cssText);
        }
      } catch {
        // cross-origin stylesheet, skip
      }
    }

    return keyframeRules;
  }

  function inlineStyles(original: Element, clone: Element) {
    const tag = original.tagName.toLowerCase();
    const isSvg = isSvgElement(original);

    if (isSvg && tag !== "svg") {
      inlineSvgPresentationAttrs(original, clone);
    } else {
      const computed = window.getComputedStyle(original);
      const styles: string[] = [];

      for (const prop of PROPERTIES) {
        const value = computed.getPropertyValue(prop);
        if (!value) {
          continue;
        }
        styles.push(`${prop}: ${value}`);
      }

      const rect = original.getBoundingClientRect();
      styles.push(`width: ${rect.width}px`);
      styles.push(`height: ${rect.height}px`);

      if (tag === "svg") {
        clone.setAttribute("width", String(rect.width));
        clone.setAttribute("height", String(rect.height));
      }

      clone.setAttribute("style", styles.join("; "));
    }

    if (tag === "img") {
      const rect = original.getBoundingClientRect();
      clone.setAttribute("width", String(Math.round(rect.width)));
      clone.setAttribute("height", String(Math.round(rect.height)));
    }

    injectPseudoElements(original, clone);

    const origChildren = Array.from(original.children).filter(
      (c) => !c.className?.toString().includes("__copy-dom")
    );
    const cloneChildren = Array.from(clone.children);

    for (let i = 0; i < origChildren.length; i++) {
      if (cloneChildren[i]) {
        inlineStyles(origChildren[i], cloneChildren[i]);
      }
    }
  }

  function injectPseudoElements(original: Element, clone: Element) {
    for (const pseudo of ["::before", "::after"] as const) {
      const computed = window.getComputedStyle(original, pseudo);
      const content = computed.getPropertyValue("content");

      if (!content || content === "none" || content === "normal") {
        continue;
      }

      const span = document.createElement("span");
      const styles: string[] = [];

      for (const prop of PROPERTIES) {
        const value = computed.getPropertyValue(prop);
        if (!value) {
          continue;
        }
        styles.push(`${prop}: ${value}`);
      }

      span.setAttribute("style", styles.join("; "));

      const textContent = content.replace(/^["']|["']$/g, "");
      span.textContent = textContent;

      if (pseudo === "::before") {
        clone.insertBefore(span, clone.firstChild);
      } else {
        clone.appendChild(span);
      }
    }
  }

  function inlineSvgPresentationAttrs(original: Element, clone: Element) {
    const computed = window.getComputedStyle(original);
    const svgProps = [
      "fill", "stroke", "stroke-width", "stroke-linecap",
      "stroke-linejoin", "opacity", "fill-opacity", "stroke-opacity",
      "fill-rule", "clip-rule", "color",
    ];

    for (const prop of svgProps) {
      const value = computed.getPropertyValue(prop);
      if (value) {
        clone.setAttribute(prop, value);
      }
    }
  }

  function cleanupAttributes(el: Element) {
    el.removeAttribute("class");
    el.removeAttribute("id");

    for (const child of Array.from(el.children)) {
      if (isSvgElement(child)) {
        child.removeAttribute("class");
        child.removeAttribute("id");
      }
      cleanupAttributes(child);
    }
  }

  function resolveUrls(el: Element) {
    if (el.tagName === "IMG") {
      const src = el.getAttribute("src");
      if (src) {
        el.setAttribute("src", new URL(src, document.baseURI).href);
      }
      const srcset = el.getAttribute("srcset");
      if (srcset) {
        el.setAttribute(
          "srcset",
          srcset.replace(/(\S+)(\s+\S+)?/g, (match, url, descriptor) => {
            try {
              return new URL(url, document.baseURI).href + (descriptor || "");
            } catch {
              return match;
            }
          })
        );
      }
    }

    if (el.tagName === "A") {
      const href = el.getAttribute("href");
      if (href) {
        try {
          el.setAttribute("href", new URL(href, document.baseURI).href);
        } catch {
          // keep as-is
        }
      }
    }

    if (el.tagName === "SOURCE") {
      const srcset = el.getAttribute("srcset");
      if (srcset) {
        try {
          el.setAttribute("srcset", new URL(srcset, document.baseURI).href);
        } catch {
          // keep as-is
        }
      }
    }

    const style = el.getAttribute("style") || "";
    if (style.includes("url(")) {
      el.setAttribute(
        "style",
        style.replace(/url\(["']?(?!data:)([^"')]+)["']?\)/g, (_, url) => {
          try {
            return `url("${new URL(url, document.baseURI).href}")`;
          } catch {
            return `url("${url}")`;
          }
        })
      );
    }

    for (const child of Array.from(el.children)) {
      resolveUrls(child);
    }
  }
})();
