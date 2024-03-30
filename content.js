chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    var div
    if (document.readyState === "complete") {
        div = injectDivBlock();
    } else {
        window.addEventListener("load", () => {
            div = injectDivBlock()
        });
    }

    //check message:
    var prompt="";
    switch (message.info.menuItemId) {
        case 'wording':
            prompt = "Check spelling and grammar";
            break;
        case 'improve':
            prompt = "Can you improve following";
            break;
        default:
            console.log("no default prompt match");
    };

    fetch(message.config.chatGPT_api_URL+"/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + message.config.chatGPT_api_key
        },
        body: JSON.stringify({
            model: message.config.selectedModel,
            messages: [{ "role": "user", "content": prompt + ". Input text: "+ message.info.selectionText }]
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Following error occured while fetching response \r\n Error " + response.status + ": " + response.statusText);
            }
            return response.json()
        })
        .then(data => {
            // get the first suggestion from the response
            const suggestion = data.choices[0].message.content.trim();
            const resultContent = div.querySelector(".result-content");
            resultContent.innerText = suggestion;
            // Check toggle options from storage
            chrome.storage.sync.get(["addCopyButtonToggle", "autoCopyResultToggle"], function(options) {
                if (options.addCopyButtonToggle) {
                    div.querySelector(".result-copy").style.display = "block";
                }
                if (options.autoCopyResultToggle) {
                    copyTextToClipboard(suggestion);
                }
            });
        })
        .catch(error => {
            console.log(error)
            // show alert if something went wrong.
            const resultContent = div.querySelector(".result-content");
            resultContent.innerHTML = error.toString();
        });
});

function copyTextToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
      //console.log('Copying to clipboard was successful!');
    }, function(err) {
      console.error('Could not copy text: ', err);
    });
}

function injectDivBlock() {
    const div = document.createElement("div");
    div.innerHTML = `
    <div class="result-header">
      <span class="result-close">&times;</span>
    </div>
    <div class="result-content">
    <div class="loading-text">Generating response</div>
    <div class="loading-dots">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
    </div>
    <div class="result-footer">
        <input class="result-copy" type="button" value="Copy" />
    </div>
  `;
    div.classList.add("result-block");
    document.body.appendChild(div);

    const closeButton = div.querySelector(".result-close");
    closeButton.addEventListener("click", () => {
        div.remove();
    });
    const copyButton = div.querySelector(".result-copy");
    copyButton.addEventListener("click", () => {
        copyTextToClipboard(div.querySelector(".result-content").innerText);
    });
    return div
}
