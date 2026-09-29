# Common Ground — route storytelling app

A mobile-first, framework-free route story planner served from `index.html`. It includes an illustrated route, categorized editable stops, live category filters, route highlights, local draft storage, shareable read-only guest links, and admin/collaborator/guest presentation states.

## Run locally

Open `index.html` in a browser, or serve the repository root with any static HTTP server. No build step or package installation is required. Draft stops are saved in the current browser's local storage.

## Deploy to Vercel

Import the repository into Vercel and deploy it as a static site with the repository root as the project root. No build command or output directory is needed.

## Data and API configuration

The current route, traffic, weather, review scores, and recommendations are illustrative sample content. The app does not make external API requests and does not require API credentials.

For live data, add a server-side Vercel Function (or another trusted API proxy) and have the browser call that endpoint. Keep private credentials out of `script.js`, client-side config files, and committed source: static HTML cannot securely read Vercel environment variables. Configure provider credentials in the Vercel project's **Settings → Environment Variables**, then read them only in the server-side function. A public browser key may be used only when the provider explicitly supports restricting it by domain and API.

Possible providers and configuration:

| Data | Example provider | Example server-side environment variable |
| --- | --- | --- |
| Maps, directions, traffic | Google Maps Platform, Mapbox, or an OpenStreetMap routing provider | `MAPS_API_KEY` |
| Places and reviews | Google Places or Yelp Fusion | `PLACES_API_KEY` or `YELP_API_KEY` |
| Weather | OpenWeatherMap | `WEATHER_API_KEY` |

Enable only the APIs needed in the provider dashboard, restrict credentials to the required APIs and deployment domains where supported, and check each provider's current rate limits, attribution rules, caching limits, and billing terms before launch. Do not call paid or secret-key APIs directly from this static client.

## Sharing and roles

“Share plan” creates a link containing the stop names and categories in the URL fragment and opens it as a read-only guest view. Fragments are not sent in HTTP requests, but anyone with the link can see its plan content; do not put private information in stops. Changes remain local to the browser and are not synchronized between collaborators. The role selector demonstrates the admin, collaborator, and guest controls locally; real-time collaboration, authentication, server-persisted plans, and authoritative permissions require a backend.

## Accessibility

The interface uses semantic sections and form labels, keyboard-operable map pins and controls, live announcements for changes, visible focus rings, descriptive map/chart text, and reduced-motion preferences.
