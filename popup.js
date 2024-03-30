document.getElementById("save-api-key").addEventListener("click", function() {
    const apiKey = document.getElementById("api-key-input").value;
    chrome.storage.sync.set({"chatGPT_api_key": apiKey}, function() {
        console.log("API key saved");
        restoreOptions();
    });
});

// Saves options to chrome.storage
function saveOptions() {
    var option1 = document.getElementById('addCopyButtonToggle').checked;
    var option2 = document.getElementById('autoCopyResultToggle').checked;
    var option3 = document.getElementById('model-select').value;
    chrome.storage.sync.set({
        addCopyButtonToggle: option1,
        autoCopyResultToggle: option2,
        selectedModel: option3,
    }, function() {
        // Update status to let user know options were saved.
        console.log('Options saved.');
    });
}

// Restores toggle state using the preferences stored in chrome.storage
function restoreOptions() {
    // Use default value false for both options
    chrome.storage.sync.get({
        addCopyButtonToggle: true,
        autoCopyResultToggle: false,
        selectedModel: false,
        chatGPT_api_key: false,
        chatGPT_api_URL: false
    }, function(items) {
        document.getElementById('addCopyButtonToggle').checked = items.addCopyButtonToggle;
        document.getElementById('autoCopyResultToggle').checked = items.autoCopyResultToggle;
        if (items.chatGPT_api_key){
            const keyInput = document.getElementById('api-key-input');
            keyInput.value = "<hidden>";
            keyInput.style = "color:grey"
        }

        //get model list (fail silently if access key is not set)
        const api_key = items.chatGPT_api_key;
        const api_URL = items.chatGPT_api_URL;

        if (api_key && api_URL) {
            populateModel(api_URL, api_key, items.selectedModel);
        }
    });
}

function populateModel(api_URL, api_key, selectedModel){
    fetch(api_URL+"/models", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + api_key
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error in request');
            }
            return response.json();  
    })
    .then(json => {
        const models = json.data.filter((aModel => aModel.owned_by === "openai"));
        const select = document.getElementById('model-select');
        models.forEach(aModel => {
            var opt = document.createElement('option');
            const modelID = aModel.id;
            opt.value = modelID;
            opt.innerHTML = modelID;
            if (modelID == selectedModel) {
                opt.selected = 'selected';
            }
            select.appendChild(opt);
        });
        // Create a new 'change' event
        const event = new Event('change');
        select.dispatchEvent(event);
    })
    .catch(error => {
        console.error('An error occurred:', error);
    });
}


document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('addCopyButtonToggle').addEventListener('change', saveOptions);
document.getElementById('autoCopyResultToggle').addEventListener('change', saveOptions);
document.getElementById('model-select').addEventListener('change', saveOptions);