chrome.commands.onCommand.addListener((command) => {
  if (command === "searchOnWordBook") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length == 0) return;

      chrome.tabs.sendMessage(
        tabs[0].id,
        { command: "fetchClipboard" },
        (response) => {
          if (response && response.text) {
            let searchUrl = `https://www.tentan.jp/word/${encodeURIComponent(
              response.text
            )}`;
            chrome.tabs.create({ url: searchUrl });
          } else {
            console.log("クリップボードのデータが取得できませんでした。");
          }
        }
      );
    });
  }
});
