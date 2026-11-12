// Scientific Terminology, Remote Sensing Glossary, and Decision-Support Guide
// Explains NASA Earth observation metrics, soil health indicators, and agronomic principles.

export const GLOSSARY_TERMS = [
  {
    id: 'et',
    term: 'Evapotranspiration (ET & ET₀)',
    category: 'Water & Atmosphere',
    short: 'Total water vapor lost through soil evaporation and plant transpiration.',
    full: 'Evapotranspiration combines direct water evaporation from the soil surface with transpiration through plant leaf stomata. Reference Evapotranspiration (ET₀) measures the evaporative demand of the atmosphere for a well-watered reference grass crop. When crop water demand exceeds precipitation plus root-zone soil water, an irrigation deficit occurs. NASA ECOSTRESS and NASA POWER calculate daily and seasonal ET to track crop thirst before physical wilting begins.'
  },
  {
    id: 'smap_anomaly',
    term: 'Soil Moisture Anomaly',
    category: 'NASA Earth Observations',
    short: 'Difference between current root-zone soil wetness and long-term historical average.',
    full: 'Measured by NASA’s Soil Moisture Active Passive (SMAP) satellite using L-band microwave radiometry (assimilated in Level-4 products into 0–100 cm root-zone depth). A negative anomaly indicates agricultural drought (depleted moisture available to roots), while a high positive anomaly signals potential waterlogging, oxygen deprivation in root zones, and delayed field trafficability.'
  },
  {
    id: 'ndvi',
    term: 'NDVI (Normalized Difference Vegetation Index)',
    category: 'Vegetation & Remote Sensing',
    short: 'Satellite index measuring photosynthetic vigor, greenness, and canopy density.',
    full: 'Calculated from Landsat (30 m) and MODIS/Sentinel-2 as (NIR − Red) / (NIR + Red). Healthy green vegetation absorbs red light for photosynthesis while strongly reflecting near-infrared radiation. NDVI values range from 0.1 (bare soil / dry stubble) to 0.85+ (dense, vigorous canopy). In TerraLoop, canopy coverage and bare-ground windows are modeled to avoid prolonged bare soil periods where erosion and organic matter oxidation accelerate.'
  },
  {
    id: 'esi',
    term: 'Evaporative Stress Index (ESI) & ECOSTRESS',
    category: 'NASA Earth Observations',
    short: 'Ratio of actual evapotranspiration to potential atmospheric demand.',
    full: 'NASA’s ECOSTRESS instrument aboard the International Space Station measures thermal infrared radiance at 70-meter resolution. The Evaporative Stress Index indicates anomalous water stress based on land surface temperature changes. When a plant runs short of soil water, it closes stomata, ceases evaporative cooling, and heats up several degrees above ambient air temperature days before visible leaves brown or curl.'
  },
  {
    id: 'grace_twsa',
    term: 'Terrestrial Water Storage Anomaly (GRACE / GRACE-FO)',
    category: 'NASA Earth Observations',
    short: 'Basin-scale changes in total water mass, including deep groundwater aquifers.',
    full: 'NASA’s Gravity Recovery and Climate Experiment (GRACE and GRACE-FO) twin satellites measure subtle monthly changes in Earth’s gravity field caused by moving water mass. In South Asia, GRACE data has revealed multi-year groundwater depletion rates of ~1.5 to 2.5 cm/year equivalent water height across the Ganges-Brahmaputra alluvial aquifers due to intensive dry-season tubewell pumping.'
  },
  {
    id: 'gpm_imerg',
    term: 'GPM Extreme Precipitation & Storm Erosivity',
    category: 'Precipitation & Hazards',
    short: 'Satellite radar/radiometer constellation tracking storm intensity and flash flood potential.',
    full: 'The Global Precipitation Measurement (GPM) Integrated Multi-satellite Retrievals (IMERG) provides 0.1° (~10 km) precipitation estimates every 30 minutes. High-intensity storms (>50 mm/day) generate severe kinetic impact (high kinetic energy erosivity factor R in RUSLE), dislodging soil aggregates and initiating surface crusting and gully runoff on unprotected bare fields.'
  },
  {
    id: 'frost_risk',
    term: 'Frost Risk & Cold Shock',
    category: 'Climate Hazards',
    short: 'Occurrence of minimum surface temperatures below critical crop thresholds.',
    full: 'In sub-tropical regions like northern Bangladesh, true freezing is rare, but cold shocks with minimum temperatures (T2M_MIN) falling below 4°C to 7°C during December–January can halt flowering, cause sterile pollen in boro rice or winter maize, and favor fungal blights (such as late blight in potatoes). Satellite reanalysis captures microclimate cold pooling in low-lying river charlands.'
  },
  {
    id: 'rusle',
    term: 'RUSLE (Revised Universal Soil Loss Equation)',
    category: 'Soil Health',
    short: 'Empirical model estimating annual topsoil loss: A = R × K × LS × C × P.',
    full: 'RUSLE calculates tons of topsoil eroded per hectare per year by multiplying Rainfall Erosivity (R, from NASA GPM/POWER), Soil Erodibility (K, based on sand/silt/clay fractions), Topographic Slope Length & Steepness (LS, derived from SRTM elevation models), Crop Cover & Canopy Management (C), and Conservation Support Practices (P, such as residue retention and mulching). Keeping soil loss below the tolerable limit (T ≈ 7.0 t/ha/yr) is crucial for sustained fertility.'
  },
  {
    id: 'som_cycling',
    term: 'Soil Organic Matter (SOM) & Humification',
    category: 'Soil Health',
    short: 'The carbon-rich living, decomposing, and stabilized biological fraction of soil.',
    full: 'Soil organic matter improves moisture holding capacity (1% increase in SOM holds up to 150,000 liters more water per hectare), feeds the soil microbial microbiome, binds soil into stable aggregates, and buffers pH. In hot, humid climates, soil microbial respiration decomposes organic matter rapidly. Rotations with high-residue crops, legume green manures, and reduced tillage/mulching build long-term carbon rather than mining it.'
  },
  {
    id: 'n_fixation',
    term: 'Biological Nitrogen Fixation (BNF)',
    category: 'Nutrient Cycling',
    short: 'Symbiotic conversion of atmospheric N₂ into plant-available ammonium by rhizobia.',
    full: 'Legumes (lentils, mung beans, chickpeas) form root nodules with symbiotic Rhizobium bacteria. These microbes convert inert atmospheric nitrogen (N₂) into bioavailable forms. Depending on harvest index and residue management, a well-managed pulse crop can fix 40–80 kg N/ha, reducing synthetic urea fertilizer requirements for the subsequent cereal in the rotation.'
  },
  {
    id: 'satellite_vs_ground',
    term: 'Satellite Observations vs. Ground Truth',
    category: 'Data Science & Validation',
    short: 'Why satellite datasets must be combined with local farmer knowledge and ground tests.',
    full: 'Satellites provide continuous, wall-to-wall spatial coverage across vast regions where weather stations and soil labs do not exist. However, satellites view large grid pixels (e.g., 500m to 50km) and primarily measure electromagnetic signals from the top few millimeters of surface canopy or soil skin. Ground-based soil tests, manual rain gauges, and local farmer observation ground-truth these broad spatial trends, catching local subsoil compaction, micronutrient deficiencies, and pest infestations that satellites cannot see.'
  },
  {
    id: 'decision_support',
    term: 'Decision-Support vs. Automated Prescription',
    category: 'Principles & Ethics',
    short: 'The boundary between exploratory modeling and human agricultural stewardship.',
    full: 'TerraLoop is intentionally engineered as an exploratory decision-support tool, not an automated prescription engine. Computer models simplify biological realities and cannot know a farmer’s family labor constraints, immediate financial liquidity, credit access, local grain broker relationships, or unexpected mechanical breakdowns. The tool reveals trade-offs, highlights unseen risks, and compares resilient alternatives, empowering the farmer and local extension officers to make the final informed decision.'
  }
];

export function glossaryModalHTML() {
  return `
    <div class="glossary-dialog">
      <div class="glossary-search-bar">
        <input type="search" id="glossary-search" placeholder="Search scientific terms (e.g. Evapotranspiration, SMAP, RUSLE, NDVI)..." autocomplete="off">
        <div class="glossary-filter-pills">
          <button class="pill active" data-category="all">All Terms</button>
          <button class="pill" data-category="NASA Earth Observations">NASA Satellites</button>
          <button class="pill" data-category="Water & Atmosphere">Water & Climate</button>
          <button class="pill" data-category="Soil Health">Soil & Carbon</button>
          <button class="pill" data-category="Data Science & Validation">Validation</button>
        </div>
      </div>
      <div class="glossary-list" id="glossary-results">
        ${GLOSSARY_TERMS.map(renderGlossaryItem).join('')}
      </div>
    </div>
  `;
}

function renderGlossaryItem(t) {
  return `
    <article class="glossary-card" data-id="${t.id}" data-category="${t.category}">
      <div class="glossary-card-header">
        <span class="badge ${t.category.includes('NASA') ? 'blue' : t.category.includes('Soil') ? 'green' : 'amber'}">${t.category}</span>
        <h3>${t.term}</h3>
      </div>
      <p class="glossary-short"><strong>Summary:</strong> ${t.short}</p>
      <div class="glossary-full"><p>${t.full}</p></div>
    </article>
  `;
}

export function bindGlossaryEvents(container) {
  const searchInput = container.querySelector('#glossary-search');
  const pills = container.querySelectorAll('.glossary-filter-pills .pill');
  const items = container.querySelectorAll('.glossary-card');

  function filter() {
    const q = (searchInput?.value || '').toLowerCase().trim();
    const activePill = container.querySelector('.glossary-filter-pills .pill.active');
    const cat = activePill?.dataset.category || 'all';

    items.forEach(el => {
      const matchCat = cat === 'all' || el.dataset.category === cat;
      const text = el.textContent.toLowerCase();
      const matchQuery = !q || text.includes(q);
      el.style.display = matchCat && matchQuery ? 'block' : 'none';
    });
  }

  searchInput?.addEventListener('input', filter);
  pills.forEach(p => {
    p.addEventListener('click', () => {
      pills.forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      filter();
    });
  });
}
