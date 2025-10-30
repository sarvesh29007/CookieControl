CookieControl 🍪
A lightweight and powerful Chrome extension for advanced, temporary cookie management. Take control of your privacy by deciding exactly how long sites can store data on your browser.

(Tip: Take a screenshot of your extension's popup and replace the line above. For example, if you name your screenshot promo.png in the images folder, you would change it to ![Screenshot](images/promo.png))

Features
Session-Only Deletion: Grant cookie permissions "For This Session Only." All cookies from that site are automatically deleted when the tab is closed.

Timed Deletion: Set a timer for cookies to be deleted. Choose from 15 minutes up to 6 hours.

Instant Deletion:

Delete Cookies NOW: Instantly clears all cookies for the current domain.

"Nuclear Option" Wipe: Instantly wipes all site data (Cookies, Local Storage, IndexedDB, etc.) and reloads the page, giving you a completely fresh start.

Active Timers Dashboard: A clean list in the popup shows all your active timers, their remaining time, and a "Cancel" button for each.

Desktop Notifications: Get a simple, non-intrusive desktop notification confirming when cookies have been successfully deleted.

How to Install (for Testing)
Since this is not on the Chrome Web Store, you can easily "sideload" it:

Download: Download this project's code and unzip it, or clone the repository to your computer.

Open Extensions Page: Open Google Chrome and go to chrome://extensions in your address bar.

Enable Developer Mode: In the top-right corner, toggle on "Developer mode".

Load the Extension: Click the "Load unpacked" button that just appeared.

Select Folder: Find and select your CookieControl project folder.

Done! The "CookieControl" icon will now appear in your browser's toolbar.

How to Use
Visit any website that uses cookies (e.g., a news site or shop).

Accept their cookie banner as you normally would.

Click the "CookieControl" icon in your toolbar.

Choose your action:

"For This Session Only": Cookies will be wiped when you close that tab.

"1 Hour": A timer starts. Cookies will be wiped in one hour.

"Delete Cookies NOW": Instantly deletes all cookies and shows a notification.

"Wipe All Site Data": A confirmation will appear. If you accept, all data for that site is wiped, and the page reloads.

Technology
This extension is built with modern, efficient tools:

Manifest V3: The current standard for Chrome extensions.

JavaScript (ES6+): Uses modern async/await for clean, asynchronous code.

Chrome Extension APIs:

cookies: To find and delete cookies.

tabs: To get the current tab and detect when it closes.

alarms: To run background timers for timed deletion.

storage: To store session data and user settings.

browsingData: To power the "Wipe All Site Data" feature.
<img width="16" height="16" alt="icon16" src="https://github.com/user-attachments/assets/ec03de43-5956-42d2-b557-cc4f0bff793d" />


notifications: To provide deletion confirmations.

HTML5 & CSS3: For the clean popup interface.
