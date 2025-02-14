document.addEventListener("DOMContentLoaded", () => {
  const articleList = document.getElementById("articleList");
  const saveButton = document.getElementById("saveArticle");
  const clearButton = document.getElementById("clearArticles");
  const reminderButton = document.getElementById("setReminder");

  function displayArticles() {
    chrome.storage.local.get("savedArticles", (data) => {
      articleList.innerHTML = "";
      let articles = data.savedArticles || [];
      articles.forEach((article, index) => {
        let li = document.createElement("li");

        let a = document.createElement("a");
        a.href = article.url;
        a.textContent = article.title;
        a.target = "_blank";

        let deleteButton = document.createElement("button");
        deleteButton.style.width = "40px";
        deleteButton.style.height = "40px";
        deleteButton.style.marginRight = "10px";
        deleteButton.textContent = "🗑";
        deleteButton.style.padding = "10px";
        deleteButton.addEventListener("click", () => deleteArticle(index));

        li.appendChild(deleteButton);
        li.appendChild(a);
        articleList.appendChild(li);
      });
    });
  }

  /* TODO sync saved content between multi devices of the sam account */
  saveButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      let article = { title: tabs[0].title, url: tabs[0].url };
      chrome.storage.local.get(["savedArticles"], (data) => {
        let articles = data.savedArticles || [];
        let exists = articles.some((item) => item.url === article.url);
        if (exists) {
          return;
        }
        articles.unshift(article);
        chrome.storage.local.set({ savedArticles: articles }, () => {
          displayArticles();
        });
      });
    });
  });

  function deleteArticle(index) {
    chrome.storage.local.get("savedArticles", (data) => {
      let articles = data.savedArticles || [];
      articles.splice(index, 1);
      chrome.storage.local.set({ savedArticles: articles }, () => {
        displayArticles();
      });
    });
  }

  clearButton.addEventListener("click", () => {
    chrome.storage.local.remove("savedArticles", () => {
      displayArticles();
    });
  });

  reminderButton.addEventListener("click", () => {
    let randomMinutes = Math.floor(Math.random() * 60) + 5;
    chrome.runtime.sendMessage({ action: "setReminder", time: randomMinutes });

    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: "Reminder Set!",
      message: `Your reminder is set for ${randomMinutes} minutes later.`,
      priority: 2,
    });
  });

  displayArticles();
});
