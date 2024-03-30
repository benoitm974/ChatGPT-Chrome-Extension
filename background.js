chrome.runtime.onInstalled.addListener(() => {
    console.log("ChatGPT-Extension loaded.")

    const api_URL = "https://api.openai.com/v1";
    chrome.storage.sync.set({"chatGPT_api_URL": api_URL}, function() {
        console.log("API url saved - using: " + api_URL);
    });

    //create context menu
    chrome.contextMenus.create({
        id: "wording",
        title: "Spelling & Grammar",
        contexts: ["selection"],
    });
    
    chrome.contextMenus.create({
        id: "improve",
        title: "Suggest Improvement",
        contexts: ["selection"],
    });
});

// listener for context menu
chrome.contextMenus.onClicked.addListener(function (info, tab) {

    chrome.storage.sync.get({
        selectedModel: false,
        chatGPT_api_key: false,
        chatGPT_api_URL: false
    }, function(items) {
        chrome.tabs.sendMessage(tab.id, { config: items, info: info })
    });

});
