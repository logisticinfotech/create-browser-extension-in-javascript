<p align="center"><img src="icons/icon64x64.png"></p>


##How to create browser extension?

-what is Browser extension?

An extension is a  mini software tool for modifying a web browser. 
many extensions are available, including user interface,modification,add blocking and screenshot.


-how can we make extension?

it is easy to create your own extension.We need to required manifest.json file and other html,script,css and required image or icon.

you must create manifest.json file in root directory

manifest.json
{
  "name": "Personal Note",
  "description": "we can save simple note.",
  "version": "1.0",
  "author": "Ramesh Vaniya",

  "icons": {
    "32": "icons/icon32x32.png"
  }, 
  "browser_action": {
        "default_title": "Personal Note",
        "default_icon": {
          "32": "icons/icon32x32.png",
          "16": "icons/icon16x16.png",
          "12": "icons/icon12x12.png"
        },  
    "default_popup": "option.html"
  },
    "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "css": ["styles/style.css"],
      "js": ["scripts/background.js"],
      "run_at": "document_start"
    }
  ],
  "permissions": [
    "activeTab",
    “storage”
  ],
  "manifest_version": 2
}
<img src="icons/note-screenshot.png"></p>

## upload extension in your local browser (Google chrome)

- please follow below image for open extension list.
<img src="settings/chrome-setting1.png.png"></p>

- you need to allow development mode in google chrome.
<img src="chrome-setting2.png"></p>

## upload extension in your local browser (Firefox)

- please follow below image for open extension list.
<img src="settings/firefox-setting1.png"></p>

- installed extension
<img src="firefox-setting2.png"></p>

[our extension in firefox store]
(https://addons.mozilla.org/en-US/firefox/addon/personal-note)

[You can check full detail about it. you can open our blog](https://github.com/logisticinfotech/laravel-user-role-base-permision-without-any-package).
