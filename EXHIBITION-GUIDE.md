# TerraLoop exhibition recording

Open [TerraLoop](http://127.0.0.1:4173/#exhibition). If the preview is stopped, run `node server.mjs` from this folder. Select **Load Rajshahi story** for the main demonstration. The loader preserves your previous farm in this browser; **Exhibition studio → Restore my previous farm** brings it back.

Use **Next scene** or the **Recording scene** selector at the top. Each scene opens the relevant screen, sets a five-year horizon, and applies the same stress scenario across the planner, simulation, water wallet, and passport. **Hide guide** removes the scene controls and story cue for a cleaner capture; **Show guide** brings them back. **Reset & restart this story** restores all original exhibition inputs. **Restart tour** returns to normal conditions while retaining your edits.

## Main story: Padma Growers Farm, Rajshahi

This fictional 2.531 ha loam-soil farm has a 650 mm annual irrigation budget, 64 kg N/ha starting available nitrogen, and planned mulching. Its ten past seasons cover 2021–2025. Six harvest outcomes link to those same season records.

| Scene | Suggested time | Action and narration |
|---|---:|---|
| 1. Meet the farm | 12s | “TerraLoop plans a living strategy for the whole farm, across ten future seasons.” Show the farm, current water budget, and family diversity. |
| 2. Locate the field | 12s | Show the selected five-corner boundary and 2.531 ha area. “One field connects our map, water volumes, and income estimates.” The outline is illustrative, not a surveyed property. |
| 3. Read its past | 20s | Scroll through the ten history cards. Highlight 2024 rice: 4.2 t/ha, 330 mm irrigation, stem borer, and the dry-spell note. Then show the later pulse and mulch trials. |
| 4. Plan five years | 15s | Show the soil/season gate and generated rotation. Switch to **Save water** to demonstrate a different priority, then return to **Balanced resilience** for the figures below. |
| 5. Compare rotations | 20s | Three plans are already checked: adaptive, familiar rice–maize, and pulses & cereals. Press **Play** and show the growing fields. The familiar plan is the reference. Scroll down for whole-farm comparisons. |
| 6. Introduce a disruption | 15s | A constructed drought is applied in 2028 automatically. The original Jute + Potato year becomes Sorghum + Lentil in the adaptive plan. Earlier years stay fixed. |
| 7. Watch the response | 20s | Playback opens at flowering in 2028 Rabi. Show the same drought across all three fields. Fixed rotations retain their crops; the adaptive rotation has replanned. Press **Play** to continue growth and harvest. |
| 8. Balance the water | 15s | Show 1,562 mm over five years, approximately 39,534 m³ across the farm, with every adaptive year within 650 mm. The familiar baseline needs 3,450 mm and exceeds the 2028 annual allowance. |
| 9. Learn from harvests | 18s | “The same rice harvest appears here: 4.8 predicted, 4.2 actual, −12.5% error. The model adjusts this farm’s crop-yield multiplier.” Show the six recorded outcomes. |
| 10. Show the passport | 13s | Compare the same familiar baseline against the adaptive plan: water, nitrogen, host breaks, diversity, and illustrative income. Export or print if desired. |

Total suggested duration: **2 minutes 40 seconds**, excluding pauses and optional editing. On a narrow preview, expand the browser panel or use a normal desktop browser for side-by-side fields. Scroll to bring fields or results into view before recording that section. Maps need internet access; simulation and all exhibition records are local.

## Alternative stories

| Farm | Starting conditions | Stress story | Comparisons |
|---|---|---|---|
| Dharla Community Farm, Kurigram | 1.904 ha; clay; 500 mm/year; 58 kg N/ha; residue incorporation | 2022 waterlogging history and constructed 2027 flood | Adaptive; familiar rice–wheat; rice/pulses/mustard |
| Teesta Char Farm, Rangpur | 1.201 ha; sandy; 400 mm/year; 46 kg N/ha; mulch | Expensive purchased irrigation, weak maize outcomes, constructed 2029 heat | Adaptive; familiar sorghum–maize; mung/sesame cycle |

The flood example exposes trade-offs: an adaptive plan does not necessarily beat every fixed sequence on every measure. The Teesta familiar baseline exceeds its current irrigation allocation; the comparison flags that it assumes extra water is supplied. Do not describe these warnings as guaranteed feasible recommendations.

## Dataset and provenance

The source is `dist/exhibition-data.mjs`; the portable snapshot is `dist/data/exhibition-farms.json`. **Download dataset** exports all three profiles, records, scenario settings, units, and recording scenes. Passport exports include the active farm, input data, derived rotation, and exhibition provenance.

All farm names, outlines, crop records, harvest outcomes, and climate values in this collection are **synthetic exhibition examples**. They are not NASA observations, farmer surveys, or forecasts. Climate bars and effective rainfall come from the same five synthetic years. NASA POWER remains a separate, optional live connection; connecting it recalculates the plan and changes the repeatable example figures. Reset the story to return to the exhibition inputs.

All future estimates are computed by the existing prototype engine. Values change if you edit crop sequences, soil, water, residue handling, priority, feedback, or climate. The collection does not manufacture a success score or guarantee that the adaptive plan wins every comparison.
