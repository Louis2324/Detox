let lastActive = Date.now();

function sendUsage(){
  const now = Date.now();
  const timeSpent = now - lastActive;
  lastActive = now;
  chrome.runtime.sendMessage({
    type:"updateTime",
    timeSpent,
  })
}

setInterval(sendUsage,10000);