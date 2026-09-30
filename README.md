# TerraLoop — The Farm Time Machine

A runnable, responsive crop-rotation planning prototype for a Bangladesh demo farm. No dependency installation is needed.

```powershell
cd D:\Projects\NasaSpaceApp\terraloop
node server.mjs
# Open http://127.0.0.1:4173
node --test tests/engine.test.mjs tests/experience.test.mjs tests/comparison.test.mjs tests/exhibition.test.mjs
```

## What works

- Ten connected views: farm overview, farmland selection, editable farm memory, rotation planner, farm simulation, water wallet, climate replay / disaster shield, learning loop, resilience passport, and exhibition studio.
- **Exhibition studio** (`#exhibition`) loads three coherent fictional farm stories in Rajshahi, Kurigram, and Rangpur. The collection contains 30 crop-history records and 18 linked harvest outcomes, synthetic five-year climate histories, measured illustrative parcels, and three preselected comparison rotations per farm. A ten-scene recording guide links normal conditions, stress playback, water, learning, and passport views. Dataset switching/reset preserves the original browser workspace for restoration. See [EXHIBITION-GUIDE.md](EXHIBITION-GUIDE.md) for the 2:40 recording script and [the portable JSON](dist/data/exhibition-farms.json) for the full collection. Synthetic inputs are labeled throughout; modeled results are computed rather than prewritten.
- Interactive Leaflet map with Esri satellite imagery and OpenStreetMap street tiles, town / coordinate search, draggable farm pins, and editable polygon boundaries. Drawing uses click-to-add corners or keyboard-accessible map-centre controls. Crossed, incomplete, excessively large, and out-of-region boundaries are rejected. Saving calculates approximate hectares and the polygon centroid, preserves unrelated farm settings, and invalidates climate when the location changes. Nothing is saved until the farmer selects **Save farm selection**.
- Natural field scenes with crop-specific stems, leaves, grain heads and flowers; perspective planting rows; wind, drought, flood and heat effects; ripening and a progressive harvest. The selected parcel footprint is preserved. Play / pause, season stepping, scrubbing, 1×–4× speed, and six growth-stage shortcuts control all visible plots together. Reduced-motion preferences disable wind and weather motion by default.
- Compare one to four rotations over three to five years: TerraLoop adaptive, original plan, rice–maize benchmark, water-saving plan, and up to four saved custom rotations. Edit crops season by season, repeat a first-year pair, rename a plan, choose a reference, or inspect its whole sequence. Custom crop menus respect modeled soil and season suitability; annual water excess is flagged. Shortening the horizon preserves saved future crop choices.
- Comparison tables and harvest trajectories show whole-farm net income and irrigation, ending soil nitrogen, crop-family diversity, and worst seasonal stress loss. Selected plans share the same farm, starting nitrogen, climate, history, feedback, residue practice and scenario. Only the adaptive plan changes crops under stress; all other plans remain fixed. Farm area scales cubic metres, tonnes and BDT. Crop development and stage timing are illustrative, not a validated daily crop-growth model. Over-budget comparisons assume extra irrigation is supplied rather than modeling additional water-shortage yield penalties.
- Three- to five-year beam search (64 candidates retained at each step), with wet and dry planning seasons. Climate scope is Bangladesh; soil, seasonal crop suitability, and annual irrigation limits are checked before scoring.
- An explicit compatibility function considers nitrogen pairing, overlapping illustrative pest and disease hosts, family diversity, and rooting depth. Crop choice balances these against illustrative income and water use.
- A simplified nitrogen state accounts for fertilizer, biological fixation, crop uptake, residue returns, and loss. Farm settings select residue treatment. This is not a fertilizer prescription or a complete carbon/soil model.
- Click or drag drought, flood, and heat scenarios onto a year. Earlier seasons stay fixed, and the remaining plan is optimized under the scenario. The normal plan and rice–maize comparison remain available.
- NASA POWER daily point API integration for `PRECTOTCORR` and `T2M` from 2021–2025. Click **Connect NASA history** in Climate replay. Missing/fill observations are rejected; API failures preserve the current data and display an error. Farm coordinate changes invalidate downloaded climate.
- Optional farm memories, outcome-based crop yield multipliers, browser-local saving, and JSON / print passport export with provenance and assumptions.
- Two feature-detected WebMCP actions: `read_rotation` and `apply_climate_scenario`.

## Data and model boundaries

The first run contains labeled sample farm history and climate. Crop, water, nutrient, cost, price, and disaster-response coefficients are illustrative, not locally calibrated. Confidence is a qualitative data-quality assessment, not a statistical probability. NASA POWER is gridded historical climate; historical replay does not constitute a forecast or real-time disaster warning. Effective rainfall uses an explicit 65% fraction of seasonal rainfall. Soil water is an assumed starting amount per crop, not a calibrated hydrological carry-over model. A planning year pairs June–November with December–May, which ends in the following calendar year.

There is no server database or authentication. Farm records and boundaries are saved only in the current browser / origin; deployment does not migrate local data. Passport exports provide a portable record, but importing them is not implemented. Only yield outcomes adjust predictions (bounded exponentially weighted multiplier); other reported observations remain notes. Region-wide learning, imagery-based crop/phenology reconstruction, soil-map ingestion, real-time disaster alerts, and validated crop-growth models remain integrations for production. The rice–maize baseline is an unconstrained comparison and may exceed the selected irrigation budget. The search is a heuristic beam search, not proof of a globally optimal rotation.

Map imagery requires internet access and is attributed in the map. It is neither live imagery nor a land-ownership survey. Leaflet 1.9.4 is vendored under its BSD-2-Clause license. Town search uses Open-Meteo / GeoNames (not address-level geocoding), sends only explicitly submitted queries, caches results for the view, and supports coordinates without a geocoding request. Map providers receive tile requests for the viewed area; selected boundaries are stored locally. Configure appropriate licensed map/search services before broad production use. Map geometry uses a local metric projection suitable for small parcels in Bangladesh, not a legal survey. No Google API key is needed.

## Files

- `dist/index.html`, `dist/app.mjs`, `dist/style.css`: UI and static assets.
- `dist/engine.mjs`: pure crop model, eligibility, water balance, search, climate parsing, and feedback.
- `dist/farm-map.mjs`, `dist/geo.mjs`: map interaction, saved selection, parcel validation, area and centroid calculations.
- `dist/rotation-studio.mjs`, `dist/rotation-studio.css`: comparison controls, custom rotation editor, playback, trajectories, and responsive field cards.
- `dist/comparison.mjs`, `dist/simulation-model.mjs`, `dist/field-scene.mjs`: comparison normalization and constraint checks, seasonal interpolation, and procedural crop scenes.
- `dist/experience.css`: farmland and shared playback styling.
- `dist/vendor/`: pinned Leaflet library, stylesheet, and license.
- `tests/engine.test.mjs`: scenario / soil / budget combinations, water conservation, fixed prefixes, balances, learning, host overlap, and NASA data validation.
- `tests/experience.test.mjs`: polygon validation, centroid / area consistency, safe saving, playback reconciliation, and area scaling.
- `tests/comparison.test.mjs`: comparison persistence and horizons, shared starting history and stress, fixed custom crops, annual constraints, trajectory reconciliation, and growth/harvest stages.
- `server.mjs`: dependency-free local static preview server on port 4173 (pass a different port as the first argument for an isolated test origin).

## Sources

- NASA POWER daily API: https://power.larc.nasa.gov/docs/services/api/temporal/daily/
- Leaflet: https://leafletjs.com/
- OpenStreetMap tile policy: https://operations.osmfoundation.org/policies/tiles/
- Esri imagery attribution: https://support.esri.com/en-us/knowledge-base/what-is-the-correct-way-to-cite-an-arcgis-online-basema-000012040
- Open-Meteo geocoding: https://open-meteo.com/en/docs/geocoding-api
- NASA POWER data request tutorial: https://power.larc.nasa.gov/docs/tutorials/service-data-request/api/
- UMN Extension nutrient carry-over context: https://blog-nwcrops.extension.umn.edu/2019/04/cover-crops-and-nitrogen-credits.html
- UMN Extension nitrogen-credit context: https://blog-nwcrops.extension.umn.edu/2019/04/cover-crops-and-nitrogen-credits.html

These sources inform the conceptual framing, not the prototype coefficients. Local agronomic validation is required before operational use.
