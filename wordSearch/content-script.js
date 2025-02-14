chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === "fetchClipboard") {
    navigator.clipboard
      .readText()
      .then((word) => {
        sendResponse({ text: word });
      })
      .catch((err) => {
        console.error("クリップボードの取得に失敗:", err);
        sendResponse({ error: err });
      });
  }
  return true;
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === "fetchClipboard") {
    navigator.clipboard
      .readText()
      .then((word) => {
        sendResponse({ text: word });
      })
      .catch((err) => {
        console.error("クリップボードの取得に失敗:", err);
        sendResponse({ error: err });
      });
  }
  return true;
});

document.addEventListener("mouseup", () => {
  const selectedText = window.getSelection().toString();
  if (selectedText) {
    navigator.clipboard
      .writeText(selectedText)
      .then(() => {
        console.log(`選択したテキストをコピーしました：${selectedText}`);
      })
      .catch((err) => {
        console.error("クリップボードへの書き込みに失敗:", err);
      });
  }
});
