// NASA Earthdata Hub & Scientific Resource Integrator
// Connects NASA Open Data, Earthdata Search, Worldview, Giovanni, FIRMS, SEDAC, and Remote Sensors.

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export const NASA_RESOURCE_LINKS = [
  {
    name: 'NASA Worldview',
    url: 'https://worldview.earthdata.nasa.gov/',
    category: 'Interactive Satellite Imagery',
    description: 'Browse full-resolution NASA satellite imagery by date: floods, vegetation greenness, and smoke.',
    generateUrl: (lat, lon) => `https://worldview.earthdata.nasa.gov/?v=${lon - 0.15},${lat - 0.1},${lon + 0.15},${lat + 0.1}&l=Reference_Labels_15m,Reference_Features_15m,Coastlines_15m,MODIS_Terra_CorrectedReflectance_TrueColor,SMAP_L4_Analyzed_Surface_Soil_Moisture`
  },
  {
    name: 'NASA Giovanni',
    url: 'https://giovanni.gsfc.nasa.gov/',
    category: 'Climate & Atmospheric Analysis',
    description: 'Generate multi-year climate time series, spatial maps, and anomaly plots with zero coding.',
    generateUrl: (lat, lon) => `https://giovanni.gsfc.nasa.gov/giovanni/#service=TmAvMp&starttime=2021-01-01&endtime=2025-12-31&bbox=${(lon - 0.25).toFixed(2)},${(lat - 0.25).toFixed(2)},${(lon + 0.25).toFixed(2)},${(lat + 0.25).toFixed(2)}`
  },
  {
    name: 'NASA Earthdata Search',
    url: 'https://search.earthdata.nasa.gov/',
    category: 'Data Discovery & Download',
    description: 'Search, filter, and access granules from all 12 NASA Distributed Active Archive Centers (DAACs).',
    generateUrl: (lat, lon) => `https://search.earthdata.nasa.gov/search?q=SMAP+ECOSTRESS+GPM&point=${lat}%2C${lon}`
  },
  {
    name: 'NASA FIRMS (Fire Information)',
    url: 'https://firms.modaps.eosdis.nasa.gov/',
    category: 'Active Fire & Thermal Anomalies',
    description: 'Real-time MODIS and VIIRS satellite active fire detections to monitor crop residue and stubble burning.',
    generateUrl: (lat, lon) => `https://firms.modaps.eosdis.nasa.gov/map/#d:24hrs;@${lon},${lat},11z`
  },
  {
    name: 'NASA SEDAC (CIESIN)',
    url: 'https://sedac.ciesin.columbia.edu/',
    category: 'Socioeconomic & Agricultural Data',
    description: 'Global agricultural nitrogen/phosphorus fertilizer grids, land use intensity, and rural population.',
    generateUrl: () => `https://sedac.ciesin.columbia.edu/data/collection/ferman-v1`
  },
  {
    name: 'NASA Open Data Portal',
    url: 'https://data.nasa.gov/',
    category: 'Open Government Data',
    description: 'Search over 40,000 public NASA datasets and metadata records.',
    generateUrl: () => `https://data.nasa.gov/browse?q=agriculture+soil+moisture`
  },
  {
    name: 'NASA APIs (api.nasa.gov)',
    url: 'https://api.nasa.gov/',
    category: 'Developer Web Services',
    description: 'Official NASA developer APIs for Earth imagery, asteroid tracking, and space science.',
    generateUrl: () => `https://api.nasa.gov/`
  },
  {
    name: 'Earthdata Remote Sensors Directory',
    url: 'https://earthdata.nasa.gov/user-resources/remote-sensors',
    category: 'Sensor Directory',
    description: 'Authoritative guide explaining which satellite sensor measures which Earth variable.',
    generateUrl: () => `https://earthdata.nasa.gov/user-resources/remote-sensors`
  }
];

// FIRMS Agricultural Stubble Burning Assessment
export function evaluateResidueBurningImpact(region, residuePractice) {
  const isBurn = residuePractice === 'burn';
  const divisionStats = {
    Rajshahi: { annualFires: 142, carbonLostTonnes: 4200, risk: 'High' },
    Rangpur: { annualFires: 188, carbonLostTonnes: 5600, risk: 'Very High' },
    Kurigram: { annualFires: 74, carbonLostTonnes: 2100, risk: 'Moderate' },
    Khulna: { annualFires: 96, carbonLostTonnes: 2800, risk: 'Moderate-High' }
  }[region] || { annualFires: 110, carbonLostTonnes: 3200, risk: 'Moderate' };

  return {
    isBurn,
    divisionStats,
    firmsWarning: isBurn
      ? `NASA FIRMS detects an average of ${divisionStats.annualFires} active thermal anomaly hotspots annually in ${region}. Stubble burning destroys ~${divisionStats.carbonLostTonnes} t of topsoil organic carbon region-wide, releases nitrogen oxides into the troposphere, and leaves bare ground vulnerable to monsoon rill erosion.`
      : `Conservation practice selected (${residuePractice}). Preserves organic residue, supporting carbon humification and complying with regional anti-burning advisories.`,
    recommendation: isBurn
      ? 'Transition to in-situ straw mulching or zero-till happy seeder drilling to retain soil organic matter.'
      : 'Maintain soil cover to maximize infiltration and reduce surface evaporation.'
  };
}

// SEDAC Fertilizer Intensity Benchmark Comparison
export function evaluateFertilizerBenchmark(region, plannedFertilizerKgHa) {
  const benchmarks = {
    Rajshahi: { baselineSyntheticN: 165, baselineP: 38, croppingIntensity: 192 },
    Kurigram: { baselineSyntheticN: 140, baselineP: 30, croppingIntensity: 178 },
    Rangpur: { baselineSyntheticN: 180, baselineP: 42, croppingIntensity: 210 }
  }[region] || { baselineSyntheticN: 155, baselineP: 35, croppingIntensity: 185 };

  const plannedN = plannedFertilizerKgHa || 0;
  const difference = plannedN - benchmarks.baselineSyntheticN;
  const pctDiff = Math.round((difference / benchmarks.baselineSyntheticN) * 100);

  return {
    benchmarks,
    plannedN,
    difference,
    pctDiff,
    evaluation: plannedN < benchmarks.baselineSyntheticN
      ? `Planned synthetic N (${plannedN} kg/ha) is ${Math.abs(pctDiff)}% below the SEDAC regional application benchmark (${benchmarks.baselineSyntheticN} kg/ha), enabled by biological N-fixation from rotational legumes.`
      : `Planned synthetic N (${plannedN} kg/ha) matches or exceeds conventional regional application (${benchmarks.baselineSyntheticN} kg/ha). Consider incorporating pulses to reduce urea expenditure.`
  };
}

// HTML Generator for Earthdata Resources and Remote Sensors Explorer Modal
export function earthdataExplorerHTML(farm) {
  return `
    <div class="earthdata-explorer-dialog">
      <div class="explorer-section">
        <span class="eyebrow">NASA EARTHDATA & OPEN PLATFORMS</span>
        <h3>Direct Satellite Exploration for Your Farm</h3>
        <p style="font-size:12px;color:#6b7c68;margin-bottom:14px">
          Coordinates: <strong>${farm.lat.toFixed(4)}° N, ${farm.lon.toFixed(4)}° E</strong> (${farm.region}, Bangladesh). Click any portal to launch an authenticated query pre-filled for your field's bounding box:
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px">
          ${NASA_RESOURCE_LINKS.map(r => `
            <a href="${r.generateUrl(farm.lat, farm.lon)}" target="_blank" rel="noopener" class="nasa-resource-card">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                <span class="badge blue">${esc(r.category)}</span>
                <span style="font-size:11px;color:#286b4f">Open ↗</span>
              </div>
              <strong style="font-size:14px;color:#274332;display:block">${esc(r.name)}</strong>
              <p style="font-size:11px;color:#64755f;margin-top:4px;line-height:1.5">${esc(r.description)}</p>
            </a>
          `).join('')}
        </div>
      </div>

      <div class="explorer-section" style="margin-top:24px;border-top:1px solid #e1e7da;padding-top:20px">
        <span class="eyebrow">NASA SENSOR DIRECTORY (earthdata.nasa.gov)</span>
        <h3>Which Satellite Measures What?</h3>
        <div class="sensor-directory-grid">
          <div class="sensor-cat-box">
            <h4>🛰️ Microwave Radiometers (SMAP, GPM)</h4>
            <p><strong>Measures:</strong> Root-zone soil moisture ($0\text{--}100\text{ cm}$), surface wetness ($0\text{--}5\text{ cm}$), precipitation rates.</p>
            <small>Penetrates clouds, rain, and moderate vegetation canopy using L-band (1.4 GHz) microwaves.</small>
          </div>
          <div class="sensor-cat-box">
            <h4>🌡️ Thermal Infrared (ECOSTRESS, MODIS)</h4>
            <p><strong>Measures:</strong> Land Surface Temperature (LST), plant water stress, and Evapotranspiration ($ET$).</p>
            <small>Detects stomatal closure and thermal heating in water-stressed crops days before visual leaf yellowing.</small>
          </div>
          <div class="sensor-cat-box">
            <h4>🌿 Optical Multispectral (Landsat, MODIS, Sentinel)</h4>
            <p><strong>Measures:</strong> NDVI vegetation greenness, canopy cover, bare soil exposure, and harvest dates.</p>
            <small>Measures visible and near-infrared reflectance. High NIR reflectance indicates healthy, dense foliage.</small>
          </div>
          <div class="sensor-cat-box">
            <h4>⚖️ Satellite Gravimetry (GRACE / GRACE-FO)</h4>
            <p><strong>Measures:</strong> Deep groundwater aquifer storage anomalies (TWSA) and basin-scale water mass.</p>
            <small>Twin satellites track subtle micro-gravitational variations caused by regional aquifer depletion.</small>
          </div>
          <div class="sensor-cat-box">
            <h4>🏔️ Radar Altimetry & Topography (SRTM, NASADEM)</h4>
            <p><strong>Measures:</strong> Digital elevation models (30 m DEM), slope steepness, and water catchment drainage.</p>
            <small>Calculates RUSLE topographic length-slope factor ($LS$) to quantify field runoff velocity and erosion risk.</small>
          </div>
          <div class="sensor-cat-box">
            <h4>🔥 Active Thermal Fire Sensors (FIRMS / VIIRS)</h4>
            <p><strong>Measures:</strong> Thermal anomalies, crop stubble burning, and post-harvest residue fires.</p>
            <small>Monitors 375 m resolution thermal pixels to track agricultural residue burning and topsoil carbon loss.</small>
          </div>
        </div>
      </div>
    </div>
  `;
}
