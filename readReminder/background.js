chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "setReminder") {
    let delayInMinutes = message.time;
    chrome.alarms.create("readReminder", { delayInMinutes: 0.083 });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "readReminder") {
    chrome.storage.local.get(["savedArticles"], (data) => {
      let articles = data.savedArticles || [];
      if (articles.length > 0) {
        let randomIndex = Math.floor(Math.random() * articles.length);
        let article = articles[randomIndex];

        let notificationId = `readReminder-${Date.now()}`;

        let faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(article.url).hostname}`;

        chrome.notifications.create(notificationId, {
          type: "basic",
          iconUrl: faviconUrl,
          title: "Time to Read!",
          message: `Do you want to read this now?\n${article.title}`,
          buttons: [{ title: "Later" }, { title: "Read Now" }],
          priority: 2,
        });

        chrome.storage.local.set({ [notificationId]: article.url });
      }
    });
  }
});

chrome.notifications.onButtonClicked.addListener(
  (notificationId, buttonIndex) => {
    if (notificationId.startsWith("readReminder")) {
      chrome.storage.local.get([notificationId], (data) => {
        let url = data[notificationId];
        // エラー処理
        if (buttonIndex === 1) {
          chrome.tabs.create({ url: url });
        }
        chrome.notifications.clear(notificationId);
        chrome.storage.local.remove(notificationId);
      });
    }
  },
);

chrome.commands.onCommand.addListener((command) => {
  if (command === "save-article") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0 || !tabs[0].url) return;

      let article = { title: tabs[0].title, url: tabs[0].url };

      // notification
      let faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(article.url).hostname}`;
      chrome.notifications.create(article.url, {
        type: "basic",
        title: "saved notification",
        message: `added to the reading list\n ${article.title}`,
        iconUrl: faviconUrl,
        isClickable: true,
      });

      setTimeout(() => {
        chrome.notifications.clear(article.url);
      }, 3000);

      // すでに保存されているurlなら保存しない
      chrome.storage.local.get(["savedArticles"], (data) => {
        let articles = data.savedArticles || [];
        let exists = articles.some((item) => item.url === article.url);
        if (exists) {
          return;
        }
        articles.unshift(article);
        chrome.storage.local.set({ savedArticles: articles });
      });
    });
  }
});
