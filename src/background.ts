chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "inject-picker") {
    injectPicker(message.tabId).then(() => sendResponse({ ok: true }));
    return true;
  }

  if (message.type === "copy-result") {
    handleCopyResult(message.html, sender.tab?.id);
  }
});

async function injectPicker(tabId: number) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["dist/content.js"],
  });

  await chrome.scripting.insertCSS({
    target: { tabId },
    css: getOverlayStyles(),
  });
}

function handleCopyResult(html: string, tabId?: number) {
  if (!tabId) {
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId },
    func: (text: string) => {
      navigator.clipboard.writeText(text);
    },
    args: [html],
  });
}

function getOverlayStyles(): string {
  return `
    .__copy-dom-overlay {
      position: fixed;
      pointer-events: none;
      border: 2px solid #6366f1;
      background: rgba(99, 102, 241, 0.08);
      border-radius: 3px;
      z-index: 2147483647;
      transition: all 0.1s ease-out;
    }

    .__copy-dom-tooltip {
      position: fixed;
      pointer-events: none;
      z-index: 2147483647;
      padding: 4px 8px;
      border-radius: 4px;
      background: #18181b;
      color: #e4e4e7;
      font: 500 11px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .__copy-dom-toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(0);
      z-index: 2147483647;
      padding: 10px 20px;
      border-radius: 8px;
      background: #18181b;
      color: #e4e4e7;
      font: 500 13px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      opacity: 0;
      transition: opacity 0.2s, transform 0.2s;
    }

    .__copy-dom-toast.--visible {
      opacity: 1;
    }

    body.__copy-dom-picking {
      cursor: crosshair !important;
    }

    body.__copy-dom-picking * {
      cursor: crosshair !important;
    }
  `;
}
