document.addEventListener('DOMContentLoaded', () => {
  const sessionBtn = document.getElementById('session-btn');
  const statusEl = document.getElementById('status');
  const domainDisplay = document.getElementById('domain-display');
  const deleteNowBtn = document.getElementById('delete-now-btn');
  const nukeBtn = document.getElementById('nuke-btn'); // --- New ---
  const timersListEl = document.getElementById('active-timers-list'); // --- New ---
  
  let currentTab;
  let currentDomain;

  // --- Main setup function ---
  async function setupPopup() {
    // 1. Get current tab info
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0] && tabs[0].url) {
      currentTab = tabs[0];
      try {
        const url = new URL(currentTab.url);
        if (url.protocol.startsWith('http')) {
          currentDomain = url.hostname;
          domainDisplay.textContent = `Site: ${currentDomain}`;
        } else {
          disableButtons("Invalid protocol (e.g., 'chrome://')");
        }
      } catch (e) {
        disableButtons("Invalid URL");
      }
    } else {
      disableButtons("Could not get tab info.");
    }
    
    // 2. Load the active timers dashboard
    loadTimerDashboard();
  }

  // --- NEW: Load Active Timers ---
  async function loadTimerDashboard() {
    timersListEl.innerHTML = ""; // Clear list
    const alarms = await chrome.alarms.getAll();
    const cookieAlarms = alarms.filter(a => a.name.startsWith("delete-cookies-"));

    if (cookieAlarms.length === 0) {
      timersListEl.innerHTML = "<p style='text-align: center; color: #555;'>No active timers.</p>";
      return;
    }

    cookieAlarms.sort((a, b) => a.scheduledTime - b.scheduledTime); // Sort by soonest

    for (const alarm of cookieAlarms) {
      const domain = alarm.name.replace("delete-cookies-", "");
      const remaining = alarm.scheduledTime - Date.now();
      const friendlyTime = formatTime(remaining);

      const entry = document.createElement('div');
      entry.className = 'timer-entry';
      entry.innerHTML = `
        <span class="timer-domain">${domain}</span>
        <span>${friendlyTime}</span>
        <button class="cancel-alarm" data-name="${alarm.name}">Cancel</button>
      `;
      timersListEl.appendChild(entry);
    }
    
    // Add listeners to new "Cancel" buttons
    document.querySelectorAll('.cancel-alarm').forEach(button => {
      button.addEventListener('click', (e) => {
        const alarmName = e.target.dataset.name;
        chrome.alarms.clear(alarmName, (wasCleared) => {
          if (wasCleared) {
            statusEl.textContent = `Timer for ${alarmName.replace("delete-cookies-", "")} cancelled.`;
            loadTimerDashboard(); // Refresh the list
          }
        });
      });
    });
  }
  
  // --- NEW: Helper to format time ---
  function formatTime(ms) {
    if (ms < 0) return "Expired";
    let totalSeconds = Math.floor(ms / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    
    // Format to HH:MM:SS or MM:SS
    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');
    if (hours > 0) {
      return `${hours}:${minutes}:${seconds}`;
    } else {
      return `${minutes}:${seconds}`;
    }
  }

  // --- Button Listeners ---
  sessionBtn.addEventListener('click', () => {
    if (!currentTab || !currentDomain) return;
    chrome.runtime.sendMessage(
      { type: "TRACK_SESSION", tabId: currentTab.id, domain: currentDomain }, 
      (response) => { statusEl.textContent = response.message; window.close(); }
    );
  });

  const timerButtons = document.querySelectorAll('.timer-btn');
  timerButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      if (!currentTab || !currentDomain) return;
      const duration = parseInt(e.target.dataset.minutes);
      const friendlyText = e.target.textContent;
      chrome.runtime.sendMessage(
        { type: "SET_TIMER", domain: currentDomain, duration: duration, text: friendlyText },
        (response) => { statusEl.textContent = response.message; window.close(); }
      );
    });
  });

  deleteNowBtn.addEventListener('click', () => {
    if (!currentTab || !currentDomain) return;
    chrome.runtime.sendMessage(
      { type: "DELETE_NOW", domain: currentDomain }, 
      (response) => { statusEl.textContent = response.message; }
    );
  });

  // --- NEW: Nuke Button Listener ---
  nukeBtn.addEventListener('click', () => {
    if (!currentTab || !currentDomain) return;
    // Show a confirmation prompt
    if (confirm(`ARE YOU SURE?\n\nThis will delete ALL data (cookies, local storage, etc.) for ${currentDomain} and reload the page.`)) {
      chrome.runtime.sendMessage(
        { type: "NUKE_SITE", domain: currentDomain, url: currentTab.url }, 
        (response) => { 
          statusEl.textContent = response.message;
          // Reload the tab to see the effect
          chrome.tabs.reload(currentTab.id);
          window.close();
        }
      );
    }
  });

  function disableButtons(message) {
    domainDisplay.textContent = message;
    sessionBtn.disabled = true;
    deleteNowBtn.disabled = true;
    nukeBtn.disabled = true; // --- New ---
    
    document.querySelectorAll('.timer-btn').forEach(btn => {
      btn.disabled = true;
      btn.style.backgroundColor = '#ccc';
    });
    
    sessionBtn.style.backgroundColor = '#ccc';
    deleteNowBtn.style.backgroundColor = '#ccc';
    nukeBtn.style.backgroundColor = '#ccc'; // --- New ---
  }
  
  // --- Run setup ---
  setupPopup();
});