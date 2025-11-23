// Initialize storage with default values
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    grayscaleEnabled: true,
    pauseEnabled: true,
    dailyUsage: 0,
    lastReset: new Date().toDateString(),
  });
  console.log("Detox extension installed and ready!");
});

let activeTabId = null;
let startTime = null;

chrome.tabs.onActivated.addListener((activeInfo) => {
  trackTabSwitch(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active) {
    trackTabSwitch(tabId);
  }
});

function trackTabSwitch(tabId) {
  if (activeTabId !== null && startTime !== null) {
    const timeSpent = Date.now() - startTime;
    updateUsageTime(timeSpent);
  }

  chrome.tabs.get(tabId, (tab) => {
    if (tab && isSocialMediaSite(tab.url)) {
      activeTabId = tabId;
      startTime = Date.now();
    } else {
      activeTabId = null;
      startTime = null;
    }
  });
}

function isSocialMediaSite(url) {
  if (!url) return false;

  const socialSites = [
    "youtube.com",
    "twitter.com",
    "x.com",
    "facebook.com",
    "instagram.com",
    "tiktok.com",
    "reddit.com",
  ];

  return socialSites.some((site) => url.includes(site));
}

function updateUsageTime(timeSpent) {
  chrome.storage.sync.get(["dailyUsage", "lastReset"], (data) => {
    const today = new Date().toDateString();

    // Reset if it's a new day
    if (data.lastReset !== today) {
      data.dailyUsage = 0;
      chrome.storage.sync.set({ lastReset: today });
    }

    const newUsage = (data.dailyUsage || 0) + timeSpent;
    chrome.storage.sync.set({ dailyUsage: newUsage });
  });
}

// Reset daily usage at midnight
function scheduleDailyReset() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);

  const msUntilMidnight = midnight - now;

  setTimeout(() => {
    chrome.storage.sync.set({
      dailyUsage: 0,
      lastReset: new Date().toDateString(),
    });
    console.log("Daily usage reset");
    scheduleDailyReset(); // Schedule next reset
  }, msUntilMidnight);
}

// Start the reset scheduler
scheduleDailyReset();
