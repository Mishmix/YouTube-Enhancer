# YouTube Enhancer by Mishmix

A Chrome MV3 extension that lets you cosmetically clean up the left-side guide on YouTube.

## Installation

1. Download or clone this repository.
2. Open `chrome://extensions` in Chromium-based browsers.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and choose the `youtube-enhancer-by-mishmix` folder.

## Usage

* Open the options page from the extension card or via the context menu.
* Use **Enable All**, **Reset**, **Export**, **Import**, and search to manage tweaks quickly.
* Group switches disable an entire block while preserving the on/off state of individual tweaks.
* The UI adapts to light and dark system themes.

## Available tweaks

### Основное меню YouTube
- Hide Home entry
- Hide Subscriptions
- Hide channel list
- Hide empty subscriptions block
- Hide Shorts
- Hide YouTube Music
- Hide Downloads
- Hide Your videos
- Hide Explorer block

### Личная навигация
- Hide History
- Hide Playlists
- Hide Watch later
- Hide Liked videos
- Hide Your clips

### Дополнительные сервисы YouTube
- Hide YouTube Studio
- Hide YouTube Kids
- Hide empty "More from YouTube"

### Служебные разделы и ссылки
- Hide Report history
- Hide Help
- Hide Send feedback
- Hide footer guide links
- Remove copyright footer
- Hide Settings

## Privacy

* No data collection. No network requests.

## Icons

Icons are not bundled. You can add them later by defining the `icons` field in `manifest.json` and placing the files under `/icons`.

## Sanity-check

1. Load the unpacked extension and open YouTube with the guide visible.
2. Press **Enable All** — the selected guide items should disappear.
3. Disable the "Личная навигация" group — child toggles gray out, but keep their values.
4. Switch system theme between light/dark — the options UI remains legible.
5. Export settings → Reset → Import — the previous state is restored.
6. Navigate to a video and back (SPA navigation) — tweaks persist without flicker.
7. Inspect DevTools — there are no console errors and no icons (by design).
