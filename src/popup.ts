const pickBtn = document.getElementById("pick-btn") as HTMLButtonElement;

pickBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id) {
    return;
  }

  pickBtn.disabled = true;
  pickBtn.textContent = "Activating...";

  chrome.runtime.sendMessage({ type: "inject-picker", tabId: tab.id }, () => {
    window.close();
  });
});
