chrome.commands.onCommand.addListener((command) => {
  if (command === "searchOnWordBook") {
    chrome.storage.local.get("savedWords", (data) => {
      const savedWords = data.savedWords || [];
      if (savedWords.length === 0) {
        console.log("保存された単語がありません。");
        return;
      }
      const word = savedWords[0];
      const searchUrl = `https://www.tentan.jp/word/${encodeURIComponent(
        word
      )}`;

      chrome.tabs.create({ url: searchUrl, active: false }, (tab) => {
        const listener = (message, sender, sendResponse) => {
          if (
            message.command === "dynamicContentExtracted" &&
            sender.tab &&
            sender.tab.id === tab.id
          ) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (tabs.length === 0) return;
              chrome.tabs.sendMessage(
                tabs[0].id,
                {
                  command: "displaySearchResult",
                  html: message.html,
                  word: word,
                },
                (response) => {
                  if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                  }
                }
              );
            });
            chrome.tabs.remove(tab.id);
            chrome.runtime.onMessage.removeListener(listener);
          }
        };
        chrome.runtime.onMessage.addListener(listener);
      });
    });
  }
});
