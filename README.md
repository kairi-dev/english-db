# My English DB

A small PWA for keeping a list of English words and chunks. Add it to your phone’s home screen and use it like an app. Data is stored in your browser (localStorage); no account or server required.

## Quick start

- **Development:** run `npm run dev` and open the app in your browser.
- **Production:** run `npm run build`, then serve the `dist/` folder (see **Free hosting** below).
- **Install as app:** open the app on your phone over HTTPS and use “Add to Home Screen”.

## Free hosting (static, no backend)

Deploy the `dist/` folder so your phone can open the app over HTTPS. All of these have a free tier:

- **[Vercel](https://vercel.com)** – Connect your Git repo or drag-and-drop `dist/`. Instant HTTPS URL.
- **[Netlify](https://netlify.com)** – Same idea: connect repo or upload `dist/`. Free HTTPS.
- **[GitHub Pages](https://pages.github.com)** – Push the repo, enable Pages, set source to the branch and folder (e.g. `dist/` or use a build step). Free `*.github.io` URL.
- **[Cloudflare Pages](https://pages.cloudflare.com)** – Connect Git or upload `dist/`. Free tier with HTTPS.

After deploy, open the given URL on your phone; PWA install will work over HTTPS.

## Phone won’t open the app (when using `npm run dev`)

The dev server runs on your PC. Phones often can’t reach it because of firewalls or network (e.g. WSL2). Easiest fix: **deploy to one of the free hosts above** and use the HTTPS URL on your phone.

If you still want to test over LAN:

1. Run `npm run dev -- --host 0.0.0.0` so the server listens on all interfaces.
2. Find your PC’s local IP (e.g. `ipconfig` on Windows, “Wi‑Fi” → IPv4).
3. On the phone, open `http://<that-IP>:5173`.
4. If it doesn’t load, the Windows firewall may be blocking port 5173; add an inbound rule for that port or use a free host instead.

## How to use

- **Header:** Tap the search icon to show or hide the search bar. The middle text is the app title.
- **List:** Tap a row to expand and see its description; tap again to collapse.
- **Swipe:** Swipe a row to the right to reveal actions: **Edit**, **Move to top**, and **Delete**.
- **Add:** Tap the **+** button at the bottom right. A new row appears at the top; fill in the title and description, then tap **Done**. There are no character limits or format rules.

All data stays in your device’s browser storage. It’s free and works offline after the first load.
