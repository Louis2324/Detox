const DAILY_LIMIT = 30 * 60 * 1000;
let usage ={};

function getToday() {
    const today = new Date().toISOString().split("T")[0];
    return today;
}

chrome.runtime.onMessage.addEventListener((message,sender,sendResponse)=>{
    if(message.type === "updateTime"){
        const today = getToday();
        if(!usage[today]) usage[today] = 0;
        usage[today] += message.timeSpent;
        chrome.storage.local.set({usage});
        if(usage[today] >=  DAILY_LIMIT){
            chrome.tabs.update(sender.tab.id, {url: chrome.runtime.getURL("detox.html")});
        } 
    }
});