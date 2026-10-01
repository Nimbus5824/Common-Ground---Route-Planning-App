# Common Ground: Technical Specification

## Implementation Direction

The original project brief describes a lightweight, framework-free static site built with HTML, CSS, and JavaScript. The current repository instead uses React, TypeScript, and Vite. This document preserves the original technical direction as a product target; it does not describe the current implementation as framework-free.

## Original Target Stack

- **HTML:** Semantic single-page structure for cards, map containers, charts, and forms.
- **CSS:** Custom styles, mobile-first responsive layout, utility classes, and lightweight transitions.
- **JavaScript:** Route management, data fetching, chart rendering, collaboration behavior, and optional local storage.
- **Mapping:** A map API such as Google Maps, Mapbox, or an OpenStreetMap-based service.
- **Charts:** Simple custom visualizations or a lightweight chart library.
- **Deployment:** Static deployment on Vercel, with external APIs supplying dynamic data.

The original target avoids heavy front-end frameworks and bundlers. Any change from that target should be treated as an implementation decision and reflected in the project documentation.

## Data Sources and Integrations

### Maps and Traffic
Use a map and traffic provider to calculate routes and travel times, show traffic conditions, and render maps and waypoint markers. Possible providers include Google Maps, Mapbox, or an OpenStreetMap-based service.

### Points of Interest and Reviews
Potential sources include Google Places/Google Maps APIs and Yelp Fusion. Use them to search by category and retrieve ratings, review counts, names, addresses, and basic place details.

### Weather
Use a weather API such as OpenWeatherMap for conditions at waypoints and route-relevant rain, snow, wind, and visibility information.

### API Configuration
- Document required API keys, credentials, rate limits, and usage constraints.
- Keep secrets out of committed source code.
- Configure keys through deployment environment variables (for example, Vercel) or a local configuration mechanism appropriate to the implementation.
- Fetch data from JavaScript and update the relevant interface elements.

## Baseline Static-Site Structure

The original brief proposed the following minimal deployment structure:

```text
/
├── index.html
├── styles.css
└── script.js
```

This is a baseline target from the brief, not the structure of the current Vite repository. See [README.md](README.md) for current setup instructions and project scripts.
