applyDetoxSettings();

chrome.runtime.onMessage.addEventListener((message, sender, sendResponse) => {
  if (message.type === "settingsUpdated") {
    applyDetoxSettings(message.settings);
  }
});

async function applyDetoxSettings(settings = null) {
  if (!settings) {
    settings = await chrome.storage.sync.get({
      grayscaleEnabled: true,
      pauseEnabled: true,
    });
  }

  if (settings.grayscaleEnabled) {
    document.body.style.filter = `grayscale(100%)`;
  } else {
    document.body.style.filter = "none";
  }

  if (settings.pauseEnabled && isSocialMediaFeed()) {
    addMindfulPause();
  }
}

const isSocialMediaFeed = () => {
  const url = window.location.href;
  const path = window.location.pathname;

  if (url.includes("youtube.com/shorts")) {
    return true;
  }

  if (
    url.includes("instagram.com/reels") &&
    (path == "/" || path.includes("home"))
  ) {
    return true;
  }

  return false;
};

function addMindfulPause() {
  // Check if pause already exists
  if (document.getElementById("detox-pause-modal")) return;

  const modal = document.createElement("div");
  modal.id = "detox-pause-modal";
  modal.innerHTML = `
        <div class="detox-pause-content">
            <h3>🌱 Mindful Moment</h3>
            <p>What brings you here right now?</p>
            <div class="detox-buttons">
                <button class="detox-btn" data-reason="break">Taking a break</button>
                <button class="detox-btn" data-reason="specific">Looking for something specific</button>
                <button class="detox-btn" data-reason="habit">Just checking out of habit</button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  // Add event listeners to buttons
  modal.querySelectorAll(".detox-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const reason = e.target.dataset.reason;
      console.log(`User visiting for: ${reason}`);
      modal.remove();

      // Send usage data to background script
      chrome.runtime.sendMessage({
        type: "mindfulPauseCompleted",
        reason: reason,
        timestamp: Date.now(),
      });
    });
  });
}
