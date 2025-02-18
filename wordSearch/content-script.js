if (
  window.location.hostname === "www.tentan.jp" &&
  window.location.pathname.startsWith("/word/")
) {
  window.addEventListener("load", () => {
    setTimeout(() => {
      chrome.runtime.sendMessage({
        command: "dynamicContentExtracted",
        html: document.documentElement.innerHTML,
      });
    }, 2000);
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === "displaySearchResult") {
    displayResultPanel(message.html, message.word);
    sendResponse({ success: true });
    return false;
  }
  return false;
});

document.addEventListener("mouseup", () => {
  const selectedText = window.getSelection().toString().trim();
  if (!isAscii(selectedText)) return;
  if (selectedText) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      try {
        const span = document.createElement("span");
        span.style.backgroundColor = "rgba(173, 216, 230, 0.6)";
        range.surroundContents(span);
      } catch (e) {
        console.error("選択テキストのハイライトに失敗:", e);
      }
    }
    chrome.storage.local.get("savedWords").then((result) => {
      let savedWordsList = result.savedWords || [];
      const same = savedWordsList.some((word) => word === selectedText);
      if (!same) {
        savedWordsList.unshift(selectedText);
        chrome.storage.local.set({ savedWords: savedWordsList });
      } else {
        console.log("the same word already in list");
      }
    });
  }
});

function displayResultPanel(htmlText, word) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");
  const flipElem = doc.getElementById("flip_m1");
  let posMeaning = "";
  if (flipElem) {
    posMeaning = flipElem.innerText.trim();
  }
  let partOfSpeech = "",
    meaning = "";
  const match = posMeaning.match(/【(.*?)】\s*(.*)/);
  if (match) {
    partOfSpeech = match[1];
    meaning = match[2];
  }
  let explanation = "";
  const exJpElements = doc.querySelectorAll(".ex_jp");
  const exJpElement = exJpElements[0];
  if (exJpElement === undefined) {
    console.log("exJpElement is undefined");
    return;
  }
  explanation = exJpElement.innerText;

  let staticModContent = "";
  const exampleMods = doc.querySelectorAll(".static_mod");
  if (exampleMods.length > 1) {
    staticModContent += exampleMods[1].innerText;
  }

  let panel = document.getElementById("word-search-panel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "word-search-panel";
    panel.style.position = "fixed";
    panel.style.top = "0";
    panel.style.right = "-400px";
    panel.style.width = "400px";
    panel.style.height = "100%";
    panel.style.backgroundColor = "rgba(255,255,255,0.8)";
    panel.style.color = "#000";
    panel.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
    panel.style.transition = "right 0.5s ease-in-out";
    panel.style.zIndex = "10000";
    panel.style.overflowY = "auto";
    panel.style.padding = "20px";
    document.body.appendChild(panel);
  } else {
    panel.innerHTML = "";
    panel.style.right = "-400px";
  }
  panel.offsetHeight;
  setTimeout(() => {
    panel.style.right = "0";
  }, 10);

  function* contentGenerator() {
    yield `<h2>${word}</h2>`;
    if (partOfSpeech || meaning) {
      yield `<p><strong>品詞:</strong> ${partOfSpeech} <br><strong>意味:</strong> ${meaning}</p>`;
    }
    if (explanation) {
      yield `<div><strong>説明:</strong><br>${explanation}</div>`;
    }
    if (staticModContent) {
      yield `<div><strong>ヒント・例文:</strong><br>${staticModContent}</div>`;
    }
  }
  const generator = contentGenerator();

  function animateElementText(element, speed = 50) {
    function wrapTextNodes(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        const fragment = document.createDocumentFragment();
        for (const char of text) {
          const span = document.createElement("span");
          span.textContent = char;
          span.style.opacity = "0";
          fragment.appendChild(span);
        }
        node.parentNode.replaceChild(fragment, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach((child) => wrapTextNodes(child));
      }
    }
    wrapTextNodes(element);
    const spans = element.querySelectorAll("span");
    spans.forEach((span, index) => {
      setTimeout(() => {
        span.style.transition = "opacity 0.3s";
        span.style.opacity = "1";
      }, index * speed);
    });
  }

  function displayNext() {
    const next = generator.next();
    if (!next.done) {
      const container = document.createElement("div");
      container.innerHTML = next.value;
      panel.appendChild(container);
      animateElementText(container, 50);
      const totalChars = container.querySelectorAll("span").length;
      const totalDelay = totalChars * 50 + 300;
      setTimeout(displayNext, totalDelay);
    }
  }
  displayNext();
}

function isAscii(str) {
  return [...str].every((char) => char.charCodeAt(0) <= 127);
}
