document.addEventListener("DOMContentLoaded", async function () {
  const result = await chrome.storage.sync.get({
    grayscaleEnabled: true,
    pauseEnabled: true,
    dailyUsage: 0,
  });

  document.getElementById("grayscaleToggle").checked = result.grayscaleEnabled;
  document.getElementById("pauseToggle").checked = result.pauseEnabled;

  const minutes = Math.round(result.dailyUsage / 60_000);
  document.getElementById("timeDisplay").textContent = `${minutes} minutes`;

  document
    .getElementById("grayscaleToggle")
    .addEventListener("change", saveSettings);
  document
    .getElementById("pauseToggle")
    .addEventListener("change", saveSettings);
});

async function saveSettings() {
    const settings = {
        grayscaleEnabled: document.getElementById("grayscaleToggle").checked,
        pauseEnabled: document.getElementById("pauseToggle").checked
    }

    await chrome.storage.sync.set(settings);

    const tabs = await chrome.tabs.query({active:true , currentWindow:true});

    if(tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id , {
            type: "settingsUpdated",
            settings: settings
        })
    }
}

// helper file to store helper functions : Date parsing , dom object selection by id
