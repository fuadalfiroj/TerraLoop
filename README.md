# TerraLoop: The Farm Time Machine

A crop-rotation planning prototype for smallholder farms. Ten connected views let a farmer record past seasons, generate multi-year rotation plans, simulate climate disruptions, compare strategies side by side and export a portable resilience passport - all inside a single browser tab with no installation required.

Built for the NASA Space Apps Challenge.

![Farm simulation comparison under drought stress](img/natural-simulation-preview.png)

---

## Table of Contents

- [Quick Start](#quick-start)
- [What TerraLoop Does](#what-terraloop-does)
- [Features](#features)
- [How the Optimizer Works](#how-the-optimizer-works)
- [Crop Database](#crop-database)
- [Water Budget Model](#water-budget-model)
- [Nitrogen Balance Model](#nitrogen-balance-model)
- [Climate Stress and Escape Routes](#climate-stress-and-escape-routes)
- [NASA POWER Integration](#nasa-power-integration)
- [Farm Simulation](#farm-simulation)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Validation Summary](#validation-summary)
- [Data and Model Boundaries](#data-and-model-boundaries)
- [Sources](#sources)
- [Team](#team-cyberpookie)

---

## Quick Start

Requires Node.js. No dependency installation, no build step, no API keys.

```sh
cd TerraLoop
node server.mjs
# Open http://127.0.0.1:4173
```

Run tests:

```sh
node --test tests/engine.test.mjs tests/experience.test.mjs tests/comparison.test.mjs tests/exhibition.test.mjs
```


---

## What TerraLoop Does

Smallholder farmers in Bangladesh often repeat the same crop sequences year after year. Continuous monoculture depletes soil nitrogen, builds pest and disease pressure and leaves the farm exposed when rainfall fails or floods arrive. There is rarely a planning tool that accounts for a specific farm's soil, water allocation, history and local climate in one place.

TerraLoop addresses this through seven connected capabilities:

1. **Record and learn from farm history.** Season-by-season crop records, yields, pest observations and residue decisions are stored locally and feed into future plans.
2. **Generate optimized multi-year rotations.** A beam-search optimizer evaluates thousands of eligible crop transitions across 3–5 years, constrained by soil type, seasonal suitability and an annual irrigation budget.
3. **Simulate climate disruptions.** Constructed drought, flood and heat scenarios are applied to any future year. Earlier seasons stay fixed; the remaining plan is re-optimized as an escape route.
4. **Compare strategies side by side.** Up to four rotation plans - adaptive, fixed baselines and user-defined sequences - share the same farm inputs and stress scenario. Whole-farm income, irrigation, nitrogen, diversity and yield loss are compared in a summary table and trajectory charts.
5. **Track water and nitrogen budgets.** A seasonal water balance and a simplified soil-nitrogen balance run through every planned season, scaled to the drawn field area.
6. **Connect to NASA climate data.** Optional integration with NASA POWER provides 2021–2025 daily precipitation and temperature observations for the farm's coordinates.
7. **Export a resilience passport.** A printable, JSON-exportable comparison of two rotation strategies with full provenance and stated assumptions.

---

## Features

### Ten Connected Views

| View | Route | Purpose |
|---|---|---|
| Farm overview | `#overview` | Dashboard with rotation summary, nitrogen chart, key stats and confidence level |
| Select farmland | `#land` | Leaflet map with satellite/street tiles, boundary drawing, town search and area measurement |
| Farm memory | `#memory` | Editable season-by-season crop history with optional yield, pest, irrigation and residue fields |
| Rotation planner | `#rotation` | Beam-search optimizer with three planning priorities, suitability gate and compatibility scores |
| Farm simulation | `#simulation` | Procedural Canvas field scenes with shared playback, comparison table and trajectory charts |
| Water wallet | `#water` | Seasonal water balance, annual compliance meters and an interactive budget slider |
| Climate replay | `#climate` | Disaster deck (drought / flood / heat), escape-route visualization and historical climate bars |
| Learning loop | `#learning` | Outcome recording, prediction-error table and per-crop yield multiplier calibration |
| Resilience passport | `#passport` | Side-by-side comparison with baseline, confidence panel, JSON export and print layout |
| Exhibition studio | `#exhibition` | Three pre-built farm stories with a 10-scene guided walkthrough for demonstrations |

### Map and Field Selection

- Esri satellite imagery and OpenStreetMap street tiles, switchable in the toolbar.
- Two modes: drop a pin for quick location, or draw a polygon boundary with up to 80 draggable corners.
- Town search via Open-Meteo / GeoNames (country-filtered to Bangladesh) and direct coordinate entry.
- Polygon validation rejects self-intersecting, sub-10 m², over-10,000 ha and out-of-region boundaries.
- Saving calculates area in hectares and the centroid, preserves unrelated farm settings and invalidates climate when the location changes. Nothing is written until the farmer selects **Save farm selection**.

### Visual Simulation

- Procedural Canvas rendering with crop-specific stems, leaves, grain heads and flowers.
- Perspective planting rows constrained to the drawn field polygon.
- Six growth stages: Sowing → Emergence → Vegetative growth → Flowering → Ripening → Harvest.
- Drought, flood and heat weather effects rendered on the scene.
- Play / pause, 1×–4× speed, scrubbing, season stepping and growth-stage shortcuts.
- Wind animation respects `prefers-reduced-motion`.

### Comparison Studio

- One to four plans visible simultaneously: TerraLoop adaptive, original plan, rice–maize benchmark, water-saving plan and up to four user-defined custom rotations.
- Custom rotation editor: per-season crop selection filtered by soil and season eligibility, plan renaming, first-year repeat.
- All visible plans share the same farm, starting nitrogen, climate, history, feedback, residue practice and scenario. Only the adaptive plan replans under stress.
- Trajectory charts for cumulative net income (BDT), cumulative irrigation (m³) and soil nitrogen (kg N/ha). Summary table with reference-relative differences and constraint audit warnings.

### Learning Loop

- Record harvest outcomes: predicted vs. actual yield, pest observations, irrigation comparison.
- A bounded exponentially weighted multiplier adjusts per-crop yield estimates for the specific farm.
- New observations carry 25% weight; history carries 75%. Individual ratios are clamped to 0.4–1.4; the final multiplier is bounded to 0.55–1.25×.
- Only yield outcomes update predictions. Other observations are saved as notes.

### Data Persistence and Export

- All farm data is stored in browser `localStorage`. There is no server database or authentication.
- JSON export of the resilience passport includes the farm profile, rotation, metrics, baseline comparison, climate data, feedback and an explicit list of limitations.
- Exhibition dataset export packages all three farm stories with provenance metadata.
- The passport view supports `window.print()`.


---

## How the Optimizer Works

The rotation engine (`engine.mjs`) uses a heuristic beam search with 64 candidates retained at each planning step. At every season slot, it evaluates all crops eligible for the farm's soil type, the current season (Kharif or Rabi) and the remaining annual irrigation budget.

### Scoring

Each crop transition is scored by:

```
score = profit_term
      + compatibility_score
      - water_penalty
      - loss_penalty
      + legume_bonus
      - repeat_penalty
      - fallow_penalty
```

| Term | Calculation |
|---|---|
| Profit | `profit / (priority === 'profit' ? 1600 : 3500)` |
| Compatibility | `transition_score × (priority === 'balanced' ? 1.4 : 0.8)` |
| Water penalty | `irrigation × (priority === 'water' ? 0.17 : 0.025)` |
| Loss penalty | `disaster_loss × 100` |
| Legume bonus | `+9` if nitrogen-fixing |
| Repeat penalty | `7 × previous_uses` |
| Fallow penalty | `22` |

### Transition Compatibility

The `transition()` function scores sequential crop pairs:

| Factor | Bonus | Penalty |
|---|---|---|
| Nitrogen pairing (fixer → high-demand) | +12 | - |
| Pest-host break | +8 | −8 if shared hosts |
| Disease-host break | +8 | −8 if shared hosts |
| Weed-cycle disruption (different family) | +8 | - |
| Rooting-depth diversity | +4 | - |
| Same botanical family | - | −18 |
| Fallow follow | - | −20 |

### Planning Priorities

Three modes adjust the weight of each term:

- **Balanced resilience** - default; equal weight on income, compatibility and water.
- **Maximum income** - profit term weighted higher; compatibility lower.
- **Save water** - water penalty weighted higher; profit term lower.

### Escape Routes

When a disaster scenario is applied to a future year:

1. All seasons before the disruption year remain fixed.
2. The optimizer re-plans from the disruption point forward under modified rainfall and crop-sensitivity coefficients.
3. Soil, season and annual water constraints are enforced for the re-planned segment.
4. Fixed comparison plans do not replan - only the adaptive plan changes.

---

## Crop Database

Eleven crops and one fallow option. All coefficients are illustrative demonstration values, not locally calibrated agronomic advice. Prices are in BDT.

| Crop | Family | Season | Soils | Water (mm) | Yield (t/ha) | Price (৳/t) | Cost (৳/ha) |
|---|---|---|---|---:|---:|---:|---:|
| Aman rice | Poaceae | Wet | clay, loam | 760 | 4.8 | 29,000 | 79,000 |
| Maize | Poaceae | Dry | loam, sandy | 580 | 8.2 | 25,000 | 102,000 |
| Lentil | Fabaceae | Dry | loam, clay | 290 | 1.5 | 94,000 | 55,000 |
| Mung bean | Fabaceae | Both | loam, sandy | 320 | 1.45 | 90,000 | 53,000 |
| Mustard | Brassicaceae | Dry | loam, clay | 280 | 1.7 | 68,000 | 49,000 |
| Sesame | Pedaliaceae | Wet | loam, sandy | 350 | 1.2 | 105,000 | 49,000 |
| Jute | Malvaceae | Wet | loam, clay | 620 | 2.7 | 54,000 | 80,000 |
| Wheat | Poaceae | Dry | loam, clay | 440 | 3.6 | 34,000 | 66,000 |
| Chickpea | Fabaceae | Dry | loam, clay | 260 | 1.6 | 82,000 | 52,000 |
| Potato | Solanaceae | Dry | loam, sandy | 520 | 22.0 | 14,000 | 192,000 |
| Sorghum | Poaceae | Wet | all | 400 | 3.5 | 28,000 | 46,000 |
| Rest & cover | - | Both | all | 0 | 0 | 0 | 12,000 |

Each crop also carries: nitrogen uptake and fixation rates, residue return, canopy cover, rooting depth category, pest and disease host lists and drought / flood / heat sensitivity coefficients.

### Residue Handling

| Practice | Nitrogen return fraction |
|---|---:|
| Remove | 0% |
| Burn | 3% |
| Incorporate | 75% |
| Mulch | 55% |
| Compost | 65% |
| Livestock | 8% |

---

## Water Budget Model

Each season's water balance:

```
effective_rainfall  = seasonal_rain × 0.65
soil_moisture       = 65 mm (mulch) or 45 mm (other) or 0 mm (fallow)
crop_demand         = base_water × (1.16 if heat stress, else 1.0)
required_irrigation = max(0, crop_demand − effective_rainfall − soil_moisture)
```

Disaster modifiers on effective rainfall:

| Scenario | Modifier |
|---|---|
| Drought | × 0.35 (65% reduction) |
| Flood | × 1.35 (35% increase, but with flood-damage coefficients) |
| Heat | No rain change; demand increases 16% |

Annual constraint: total irrigation across both seasons of a planning year must not exceed the farm's water budget. The budget resets each year.

Whole-farm volume: `irrigation_mm × area_ha × 10 = m³`.

---

## Nitrogen Balance Model

A simplified available-nitrogen balance (kg N/ha) runs through every season:

```
N_next = clamp(N + fertilizer + fixation + residue − uptake − 9, 0, 180)
```

Where:

- `fertilizer = max(0, uptake − fixation − max(0, N − 35))`
- `fixation` = biological N fixation (legumes: 52–58 kg/ha; others: 0)
- `residue` = crop residue × handling fraction (see table above)
- `9` = assumed annual loss (leaching and denitrification)

This is not a fertilizer prescription or a complete soil-carbon model.

---

## Climate Stress and Escape Routes

Three constructed disaster scenarios, each with per-crop sensitivity coefficients:

| Scenario | Rainfall effect | Demand effect | Most tolerant | Most sensitive |
|---|---|---|---|---|
| Drought | −65% | - | Chickpea (0.12), Sorghum (0.13) | Rice (0.52), Maize (0.46) |
| Flood | +35% | - | Rice (0.16), Jute (0.30) | Sesame (0.68), Potato (0.65) |
| Heat | - | +16% | Sorghum (0.12), Jute (0.15) | Wheat (0.52), Potato (0.50) |

Sensitivity values represent the fraction of yield lost under that scenario (multiplied by 0.8 to produce the final loss coefficient).

These are constructed stress tests, not forecasts or real-time disaster alerts.

---

## NASA POWER Integration

Optional connection to the [NASA POWER](https://power.larc.nasa.gov/) daily point API. Fetches `PRECTOTCORR` (daily precipitation) and `T2M` (2-metre temperature) for the farm's coordinates, 2021–2025.

Processing steps:

1. Validate each observation date and reject fill values (negative precipitation, temperatures outside −90 to 65 °C).
2. Split rainfall into wet season (June–November) and dry season (December–May).
3. Calculate effective seasonal rainfall: `daily_average × 183 days × 0.65`.
4. Require ≥ 150 valid wet-season days, ≥ 150 dry-season days and ≥ 330 days per complete year.
5. API failures or location changes preserve the existing climate data. Errors are displayed; the current plan is not discarded.

No Google API key is needed. The farm's coordinates are sent only when the farmer clicks **Connect NASA history**.

---

## Farm Simulation

![Farm simulation comparison under drought stress](img/farm-simulation.png)

The farm simulation renders one to four rotation plans as procedural Canvas field scenes running on a shared timeline. Each plan receives the same farm boundary, starting soil nitrogen, climate inputs, residue practice and stress scenario. The only variable is the crop sequence itself.

Every field is drawn using the farmer's actual parcel outline. A 16 × 25 planting grid is clipped to the polygon boundary, and crop-specific plants — stems, leaves, grain heads, flowers - grow through six staged phases: Sowing, Emergence, Vegetative growth, Flowering, Ripening, and Harvest. Plant height, leaf colour, and canopy density change with progress. A progressive left-to-right clearing animates the harvest. Drought renders cracked soil and wilted stems; flood adds standing water and rain streaks; heat intensifies the sun and stresses foliage colour.

Playback controls are shared across all visible fields: play / pause, 1×–4× speed, a scrub slider spanning all seasons, season-jump buttons, and six growth-stage shortcuts. The timeline strip highlights the active season and marks completed harvests. Real-time per-field stats update during playback: expected harvest in tonnes, irrigation in mm and m³, soil nitrogen in kg N/ha, crop cover percentage, and yield loss percentage. When a disaster scenario is active, the adaptive plan's escape-route crop is labeled and its fixed-plan counterpart's higher loss is visible in direct comparison.

---

## Architecture

- **Zero runtime dependencies.** No framework, no bundler, no `npm install`. ES Modules throughout.
- **Static file server.** `server.mjs` is a dependency-free Node.js HTTP server (33 lines). It serves the `dist/` directory on port 4173.
- **Client-side state.** A single mutable state object in `app.mjs`. `render()` rebuilds the full view via string-template HTML. Canvas scenes are the only retained stateful DOM elements.
- **No virtual DOM.** Full innerHTML re-render on state change. Navigation is hash-based.
- **Vendored Leaflet.** Leaflet 1.9.4 is included under `dist/vendor/` with its BSD-2-Clause license. Map tiles require internet; all other functionality works offline.
- **Accessibility.** Native `<dialog>` for modals, `aria-live="polite"` for toasts, ARIA labels on interactive elements, keyboard-accessible map controls and `prefers-reduced-motion` support.
- **No external icon library.** All icons are inline SVG path data.

---

## Project Structure

```
TerraLoop-main/
├── package.json                        Project metadata (v1.3.0, no dependencies)
├── server.mjs                          Static file server (port 4173)
├── README.md                           This file
├── EXHIBITION-GUIDE.md                 2:40 recording script for demonstrations
├── VALIDATION.md                       Test and browser verification log
├── exhibition-preview.png              Exhibition studio screenshot
├── natural-simulation-preview.png      Field simulation screenshot
│
├── dist/                               Client-side application
│   ├── index.html                      Entry point
│   ├── app.mjs                         Main application (state, routing, 10 views,
│   │                                   modals, NASA fetch, export, WebMCP)
│   ├── engine.mjs                      Optimizer, crop database, water/nitrogen
│   │                                   model, NASA parser, transition scoring
│   ├── farm-map.mjs                    Leaflet map UI, boundary drawing, search
│   ├── geo.mjs                         Area, centroid, validation, projection
│   ├── rotation-studio.mjs             Simulation playback, comparison controls,
│   │                                   custom editor, trajectory charts
│   ├── comparison.mjs                  Plan normalization, audit, series
│   ├── simulation-model.mjs            Growth stages, frame interpolation
│   ├── field-scene.mjs                 Procedural Canvas crop rendering
│   ├── exhibition-data.mjs             Farm definitions, scene config, backup
│   ├── exhibition-ui.mjs               Exhibition templates and bindings
│   ├── style.css                       Main styles
│   ├── experience.css                  Farmland and playback styles
│   ├── rotation-studio.css             Comparison and field card styles
│   ├── exhibition.css                  Exhibition styles
│   ├── data/
│   │   └── exhibition-farms.json       Portable exhibition dataset
│   └── vendor/
│       ├── leaflet.js                  Leaflet 1.9.4
│       ├── leaflet.css                 Leaflet stylesheet
│       └── LEAFLET-LICENSE.txt         BSD-2-Clause
│
└── tests/
    ├── engine.test.mjs                 Optimizer, water, feedback, NASA parsing
    ├── experience.test.mjs             Geometry, validation, simulation frames
    ├── comparison.test.mjs             Preferences, trajectories, growth stages
    └── exhibition.test.mjs             Linked histories, parcels, backup/restore
```

---


### Coverage

**Engine** - 36 soil / water / scenario combinations with annual feasibility checks; water-conservation priority selects less irrigation than maximum-income priority; escape routes preserve earlier seasons and remain feasible; water balance is non-negative for all crops; feedback calibration is bounded and crop-specific; shared pest hosts are penalized across families; NASA parser rejects fill values and incomplete series.

**Geometry and simulation** - polygon area and centroid are stable regardless of winding order; crossed, flat, oversized and out-of-region boundaries are rejected; unfinished outlines cannot be saved; coordinate parsing accepts valid pairs and rejects malformed input; simulation frames carry nutrient state; completed simulation reconciles water and income with the planner; farm area scales totals without changing per-hectare estimates; stress scenarios apply identical pressure to all plans.

**Comparison** - preferences normalize correctly and recover from invalid data; shorter horizons preserve saved future crop choices; all comparison plans share the same scenario; custom crop pools respect soil and season eligibility; trajectories reconcile with playback totals; growth stages progress from bare soil through flowering, ripening and harvest.

**Exhibition** - three farms contain complete, linked five-year histories; all 18 feedback records link to the correct history entry; parcel boundaries are valid with areas matching their stated values; planner, comparison, water wallet and passport share their inputs; scene navigation sets the correct stress scenario and season; story switching preserves and restores the original backup; the UI discloses synthetic data; the portable JSON matches the runtime collection.

---

## Validation Summary

The following checks were performed in the browser and are documented in [VALIDATION.md](VALIDATION.md):

- 33 automated tests pass across the engine, geometry, simulation, comparison and exhibition modules.
- All three exhibition stories load correctly. Rajshahi drought changes the 2028 adaptive year from Jute + Potato to Sorghum + Lentil. Water Wallet and passport agree on 1,562 mm for the adaptive plan versus 3,450 mm for the familiar rice–maize baseline.
- Story switching and browser restoration return the prior farm. Reload preserves the active scene and stress scenario.
- Desktop (1440 px) and mobile (390 px) layouts produce no document overflow. The mobile viewport fits within 375 px content width.
- NASA POWER daily history loads for the sample Rajshahi coordinates. Source labels update from sample to historical data.
- WebMCP registration, read action, drought mutation and invalid-year rejection verified. No browser errors during the final interaction check.
- Four plans displayed under 2028 drought: adaptive sesame (12% loss), rice benchmark (42%), custom mung bean (16%), water-saving sorghum (10%). The benchmark's constraint warning appears.
- Field boundary drawing, saving and reload preserve corners, area and centroid on a separate test origin. The user's original farm data is not affected.
- Syntax checks pass for all eight application modules (`node --check`).

---

## Data and Model Boundaries

The first run contains labeled sample farm history and climate. All crop, water, nutrient, cost, price and disaster-response coefficients are illustrative, not locally calibrated. Local agronomic validation is required before operational use.

**What TerraLoop is not:**

- Not a validated daily crop-growth model.
- Not a fertilizer prescription or a complete soil-carbon model.
- Not a weather forecast, climate prediction, or real-time disaster warning.
- Not a satellite crop-identification or phenology-reconstruction tool.
- Not a land-ownership survey. Map imagery is historical, not live.
- Not a financial advisor. Prices and costs are fixed illustrative values, not market forecasts.

**Specific constraints:**

- Confidence is a qualitative data-quality label, not a statistical probability.
- Effective rainfall uses a fixed 65% fraction of seasonal precipitation.
- Soil water is an assumed starting amount per crop, not a calibrated hydrological carry-over.
- The beam search is heuristic and does not guarantee a globally optimal rotation.
- The rice–maize baseline is unconstrained and may exceed the farm's irrigation budget. Over-budget comparisons assume extra irrigation is supplied rather than modeling additional yield penalties.
- Growth stages use shared timing across all crops; they are not crop-specific phenology.
- There is no server database or authentication. Farm records and boundaries exist only in the current browser and origin. Deployment does not migrate local data.
- Passport import, region-wide learning, imagery-based reconstruction, soil-map ingestion and real-time alerts are not implemented.
- Only Bangladesh is currently supported.

Map imagery requires internet access and is attributed in the map. Leaflet 1.9.4 is vendored under its BSD-2-Clause license. Town search uses Open-Meteo / GeoNames, sends only explicitly submitted queries, caches results for the view and accepts coordinates without a geocoding request. Map providers receive tile requests for the viewed area; selected boundaries are stored locally. Map geometry uses a local metric projection suitable for small parcels in Bangladesh, not a legal survey.

---

## Sources

These sources inform the conceptual framing, not the prototype coefficients.

- NASA POWER daily API - https://power.larc.nasa.gov/docs/services/api/temporal/daily/
- NASA POWER data request tutorial - https://power.larc.nasa.gov/docs/tutorials/service-data-request/api/
- Leaflet - https://leafletjs.com/
- OpenStreetMap tile policy - https://operations.osmfoundation.org/policies/tiles/
- Esri imagery attribution - https://support.esri.com/en-us/knowledge-base/what-is-the-correct-way-to-cite-an-arcgis-online-basema-000012040
- Open-Meteo geocoding - https://open-meteo.com/en/docs/geocoding-api
- UMN Extension, nutrient carry-over and nitrogen credits - https://blog-nwcrops.extension.umn.edu/2019/04/cover-crops-and-nitrogen-credits.html

---

## Team CyberPookie


Project TerraLoop developed for NASA Space Apps Challenge 2026.

| # | Member Name | Role / Focus | GitHub Profile |
|---|---|---|---|
| 1 | Fuad Al Firoj | Team Lead & Backend Developer | [fuadalfiroj](https://github.com/fuadalfiroj) |
| 2 | Rajesh Karmaker | Technical Lead | [rajeshkarmaker](https://github.com/rajeshkarmaker) |
| 3 | Saudha Biswas | UI/UX Designer & Frontend Developer |  |
| 4 | Emtiaz Ahomad | Data Person | [mdemtiazahomad-star](https://github.com/mdemtiazahomad-star) |
| 5 | Priyanta Datta Partho | Video Narrator & Presenter | [pr1yanta](https://github.com/pr1yanta) |
| 6 | Masfi Mimu | Video Narrator & Presenter |  |




