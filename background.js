const DAILY_LIMIT = 1* 60 * 1000;
let usage = {};

function getToday() {
    const today = new Date().toISOString().split("T")[0];
    return today;
}

chrome.storage.local.get("usage",(data)=>{
    usage = data.usage || {} ;
    console.log("Usage loaded: ",usage);
})

chrome.runtime.onMessage.addListener((message,sender,sendResponse)=>{
    console.log("Message received: ",message);
    if(message.type === "updateTime"){
        const today = getToday();
        if(!usage[today]) usage[today] = 0;
        usage[today] += message.timeSpent;
        chrome.storage.local.set({usage});

        if(usage[today] >=  DAILY_LIMIT){
            chrome.tabs.update(sender.tab.id, {url: chrome.runtime.getURL("detox.html")});
            chrome.declarativeNetRequest.updateEnabledRulesets({
                enableRulesetIds: ["detoxRules"],
            });
            console.log("Daily Limit Reached For Shorts");
        } 
        sendResponse({status:"ok"});
    }
    return true;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo ,tab)=>{
    if( changeInfo.status === "loading" &&
     tab.url.includes("youtube.com/shorts"))
     {
       const today = getToday();
       if(usage[today] >= DAILY_LIMIT) {
        chrome.tabs.update(tabId,{
            url:chrome.runtime.getURL("detox.html")
        });
       }}
});

function scheduleReset() {
    const now = new Date();
    const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,0,0
    );

    const msUntilMidnight = midnight - now;
    setTimeout(()=>{
        usage = {};
        chrome.storage.local.set({usage});
        chrome.declarativeNetRequest.updateEnabledRulesets({
            disableRulesetIds: ["detoxRules"]
        });
        console.log("Daily usage reset , scroll responsibly");
        scheduleReset();
    },msUntilMidnight);
}

scheduleReset();