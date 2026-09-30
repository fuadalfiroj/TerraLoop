# Validation — 2026-09-29

## Exhibition dataset — 2026-09-30

- 33 automated tests pass across the engine, geometry, simulation, comparison, and exhibition modules. Exhibition checks cover all 30 history / 18 feedback links, crop and season validity, measured parcels, synthetic climate aggregation, annual irrigation feasibility, shared comparison inputs, scene alignment, independent copies, backup restoration, and portable JSON consistency.
- All three stories were loaded through the browser: Rajshahi drought (2028), Kurigram flood (2027), and Rangpur heat (2029). Their crop changes and farm-specific passport baselines were verified.
- All ten Rajshahi recording scenes were exercised. The memory shows ten seasons; learning shows six matching outcomes. Drought changes the 2028 adaptive year from Jute + Potato to Sorghum + Lentil. Water Wallet and passport agree on 1,562 mm, versus 3,450 mm for the familiar rice–maize baseline.
- Story switching and browser restoration returned the prior Padma River Farm. Reload preserved the active scene and stress scenario. The final preview is reset to Padma Growers Farm, normal conditions, scene 1, ready for recording.
- Three field canvases rendered, and Play/Pause controls worked. Desktop (1440px) and mobile (390px) layouts were reviewed; no document overflow was found. Hide/Show guide preserves the synthetic data label.
- Rapid navigation away from the map exposed a pending Leaflet CSS zoom callback. Disabling map zoom animation resolved it; subsequent scene transitions produced no new errors.
- Real map tiles loaded around the illustrative boundary. Dataset climate, records, and boundaries remain explicitly synthetic; no live NASA request is needed to replay the demonstration.
- Recording script: `EXHIBITION-GUIDE.md`. Portable data: `dist/data/exhibition-farms.json`. Preview: `exhibition-preview.png`.

- `node --check dist/app.mjs` and `node --check dist/engine.mjs`: passed.
- `node --test tests/engine.test.mjs`: 7 tests passed, including 36 soil / water / scenario combinations with annual feasibility checks.
- Local preview served successfully on http://127.0.0.1:4173. Desktop and mobile layouts inspected through the browser. The mobile water view had a 375px content width and 375px scroll width (no unintended page overflow).
- The browser displayed live NASA POWER annual history for 2021–2025 at the sample Rajshahi coordinates. Source labels changed from sample to historical data.
- WebMCP registration, read action, valid drought mutation, visible state readback, and invalid out-of-range year rejection verified. The drought test changed the 2028 dry crop from lentil to chickpea while preserving the earlier two years.
- The Water Wallet season selector updated to the drought-affected chickpea season: 85 mm rain + 65 mm soil + 110 mm irrigation − 260 mm demand = 0 mm balance. Annual limits remained satisfied.
- No browser error logs were present during the final interaction check.

## Field selection and simulation update

- `node --test tests/engine.test.mjs tests/experience.test.mjs`: 16 tests passed. New coverage includes polygon area/centroid, crossing and invalid boundaries, coordinate parsing, safe selection persistence, seasonal interpolation, completed income, farm-area scaling, and shared stress scenarios.
- Syntax checks passed for the app, map, and simulation modules.
- Real satellite tiles rendered. Rajshahi town search returned a matching Bangladesh result and recentered the map.
- On an isolated test origin, selected four field corners, finished and saved the boundary, and reloaded. The four corners, 1.121 ha area, and centre at 24.374499, 88.604499 persisted. The user's original farm data was preserved.
- The saved field appeared in simulation as “Your drawn field outline”; modeled harvest scaled to the selected area (1.63 tonnes for the displayed mung bean season).
- Playback advanced through the full rotation and stopped at the final harvest. Season jumps and drought controls updated visible crops, nitrogen, water, income, and stress estimates. A crop can remain in place when the optimizer does not find a better escape route.
- Map and simulation layouts were visually checked at desktop and 390px mobile viewport widths. Document content remained within the viewport (375px content width, including room for the scrollbar). No browser console errors were recorded during these checks.
- The simulation is a visualization of illustrative seasonal model outputs, not a validated daily crop-growth model or a climate forecast.

## Natural simulation and rotation comparison update

- All eight application modules passed `node --check`. All 23 tests passed with `node --test tests/engine.test.mjs tests/experience.test.mjs tests/comparison.test.mjs`. npm was not on PATH, so equivalent Node commands were used directly.
- New tests cover shared history and scenario inputs, 1–4 visible plans, restoring saved custom choices, preserving future crops with shorter horizons, soil/season eligibility, combined annual water limits, comparison trajectory reconciliation, and progression to fully harvested fields.
- Browser checks used a separate local origin on port 4175 to avoid changing the user's farm records. Created and renamed a custom rotation, changed the first dry-season crop to chickpea, repeated the first-year pair, and verified all crop choices and the name survived reload.
- Four plans displayed together under the 2028 drought: adaptive sesame (12% modeled loss), rice benchmark (42%), custom mung bean (16%), and water-saving sorghum (10%). The benchmark's annual irrigation constraint warning appeared. Adding a fifth visible plan was disabled.
- Changed the reference to rice–maize and selected irrigation trajectories; displayed totals and reference differences updated. Playback ran at 4× to the final 2030 harvest, stopped automatically, and showed zero remaining crop cover in all four plots. No browser errors were recorded during the playback check.
- Single-plan selection worked; removing the final visible plan was prevented with an explanatory message. A three-year horizon showed six seasons and a matching slider maximum. Custom crop choices remained saved.
- Desktop field scenes and 390px mobile controls, custom editor, timeline and crop cards were visually inspected. The mobile document width was 375px within the 390px viewport; comparison tables and season strips scroll within their containers. Temporary viewport overrides were reset.
- The user's preview was reloaded with the completed simulation. `natural-simulation-preview.png` records the new crop-field comparison using sample test-farm data. Stylized growth stages and fixed coefficients remain illustrative, not a validated daily agronomy model.

Publication is not completed. Sites registration exists, but the earlier hosting attempt encountered Git's ownership check. Automatic approval review rejected a process-scoped safe-directory exception because it would bypass that protection before connecting to an external private repository without explicit user authorization. No workaround was attempted. `.openai/hosting.json` retains the existing project registration; no live deployment is claimed. This update is available locally.
