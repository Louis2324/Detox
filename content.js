let lastActive = Date.now();
console.log("Extension up and running");
function sendUsage(){
  const now = Date.now();
  const timeSpent = now - lastActive;
  lastActive = now;
  chrome.runtime.sendMessage({
    type:"updateTime",
    timeSpent,
  })
}

setInterval(()=>{
    sendUsage();
    console.log("Update timeSpent")
},10000);