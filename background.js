// --- NEW: Notification Helper ---
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'images/icon48.png',
    title: title,
    message: message
  });
}

// --- Core Function: Delete Cookies ---
async function deleteCookiesForDomain(domain) {
  let cookiesDeleted = 0;
  try {
    const cookies = await chrome.cookies.getAll({ domain: domain });
    
    if (cookies.length === 0) {
      console.log(`No cookies found for ${domain}`);
      return 0; // Return count
    }

    for (const cookie of cookies) {
      const protocol = cookie.secure ? "https:" : "http:";
      const cookieUrl = `${protocol}//${cookie.domain}${cookie.path}`;
      
      await chrome.cookies.remove({
        url: cookieUrl,
        name: cookie.name,
        storeId: cookie.storeId
      });
      cookiesDeleted++;
    }
    
    console.log(`Successfully deleted ${cookiesDeleted} cookies for ${domain}`);
    // --- NEW: Show notification on success ---
    if (cookiesDeleted > 0) {
      showNotification("Cookies Cleared", `Deleted ${cookiesDeleted} cookies for ${domain}.`);
    }
    return cookiesDeleted; // Return count
  } catch (error) {
    console.error(`Error deleting cookies for ${domain}:`, error);
  }
}

// --- Event Listener 1: Messages from Popup ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message.type === "TRACK_SESSION") {
      await chrome.storage.session.get(['sessionTabs'], async (result) => {
        const sessionTabs = result.sessionTabs || {};
        sessionTabs[message.tabId] = message.domain;
        await chrome.storage.session.set({ sessionTabs: sessionTabs });
        console.log(`Now tracking tab ${message.tabId} for domain ${message.domain}`);
        sendResponse({ message: `Tracking ${message.domain} for this session.` });
      });
    } 
    
    else if (message.type === "SET_TIMER") {
      const alarmName = `delete-cookies-${message.domain}`;
      await chrome.alarms.clear(alarmName);
      await chrome.alarms.create(alarmName, {
        delayInMinutes: message.duration 
      });
      console.log(`Alarm set for ${message.domain} in ${message.duration} minutes.`);
      sendResponse({ message: `Cookies for ${message.domain} will be deleted in ${message.text}.` });
    }
    
    else if (message.type === "DELETE_NOW") {
      console.log(`Manual deletion triggered for ${message.domain}`);
      const count = await deleteCookiesForDomain(message.domain);
      sendResponse({ message: `Deleted ${count} cookies from ${message.domain}.` });
    }
    
    // --- Nuke Site Handler (CORRECTED) ---
    else if (message.type === "NUKE_SITE") {
      console.log(`Nuke triggered for ${message.domain}`);
      try {
        const origin = new URL(message.url).origin;
        await chrome.browsingData.remove(
          { origins: [origin] },
          {
            "cookies": true,
            "localStorage": true,
            // "sessionStorage": true, // This line was removed - it caused the error.
            "indexedDB": true,
            "webSQL": true,
            "cacheStorage": true
          }
        );
        console.log(`Successfully wiped all data for ${origin}`);
        showNotification("Site Data Wiped", `All site data for ${message.domain} has been cleared.`);
        sendResponse({ message: `Wiped all data for ${message.domain}.` });
      } catch (e) {
        console.error(`Error nuking site ${message.domain}:`, e);
        sendResponse({ message: "Error wiping data." });
      }
    }
    
  })();
  return true; // Keep message port open for async response
});

// --- Event Listener 2: Tab Closed ---
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  const result = await chrome.storage.session.get(['sessionTabs']);
  const sessionTabs = result.sessionTabs;

  if (sessionTabs && sessionTabs[tabId]) {
    const domain = sessionTabs[tabId];
    console.log(`Tracked tab ${tabId} (${domain}) was closed. Deleting cookies.`);
    await deleteCookiesForDomain(domain); // Notification is now handled inside this function
    delete sessionTabs[tabId];
    await chrome.storage.session.set({ sessionTabs: sessionTabs });
  }
});

// --- Event Listener 3: Alarm Fired ---
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith("delete-cookies-")) {
    const domain = alarm.name.replace("delete-cookies-", "");
    console.log(`Alarm fired for ${domain}. Deleting cookies.`);
    await deleteCookiesForDomain(domain); // Notification is now handled inside this function
  }
});