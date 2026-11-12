import test from 'node:test';
import assert from 'node:assert/strict';
import {
  NASA_DATASETS,
  NASA_DATASET_CATALOG,
  SATELLITE_VS_GROUND,
  calculateReferenceET,
  computeTrend,
  harmonizeEarthObservations,
  parseEnhancedPower,
  REGIONAL_EARTH_PROFILES
} from '../dist/nasa-data.mjs';
import {
  SOIL_TEXTURE_INFO,
  CROP_SOIL_ATTRIBUTES,
  computeErosionRisk,
  simulateSoilOrganicMatter,
  analyzeVulnerabilityGaps,
  generateStrategyExplanation
} from '../dist/soil-health.mjs';
import { GLOSSARY_TERMS, glossaryModalHTML } from '../dist/glossary.mjs';
import { NASA_RESOURCE_LINKS, evaluateResidueBurningImpact, evaluateFertilizerBenchmark, earthdataExplorerHTML } from '../dist/earthdata-hub.mjs';
import { optimize, DEFAULT_FARM, SAMPLE_CLIMATE } from '../dist/engine.mjs';

test('calculateReferenceET accurately estimates atmospheric evaporative demand', () => {
  // Test tropical Bangladesh conditions
  const et = calculateReferenceET(22, 34, 28, 18.5, 24);
  assert.ok(et >= 2.0 && et <= 7.0, `ET ${et} should fall within expected tropical range`);
  
  // Graceful fallback on missing data
  const fallback = calculateReferenceET(null, null, 25, null, 24);
  assert.ok(fallback >= 2.0 && fallback <= 6.5);
});

test('computeTrend calculates correct slope and direction for multi-year series', () => {
  const warming = computeTrend([26.0, 26.2, 26.5, 26.8, 27.2]);
  assert.equal(warming.direction, 'increasing');
  assert.ok(warming.slope > 0);

  const drying = computeTrend([1500, 1400, 1300, 1200, 1100]);
  assert.equal(drying.direction, 'decreasing');
  assert.ok(drying.slope < 0);

  const stable = computeTrend([0.65, 0.65, 0.66, 0.64, 0.65]);
  assert.equal(stable.direction, 'stable');
});

test('harmonizeEarthObservations blends SRTM elevation, SMAP moisture, and RUSLE erosivity', () => {
  const harmonized = harmonizeEarthObservations(REGIONAL_EARTH_PROFILES.rajshahi, 21, 'loam');
  assert.ok(harmonized);
  assert.equal(harmonized.elevationMeters, 21);
  assert.equal(harmonized.soilKFactor, 0.32); // Loam erodibility
  assert.ok(harmonized.lsFactor > 0);
  assert.ok(harmonized.rFactor > 1000, 'Rainfall erosivity should reflect monsoon climate');
  assert.equal(harmonized.graceGroundwaterAnomalyCmYear, -1.8);
  assert.ok(harmonized.averages.annualET0 > 1000);
  assert.ok(harmonized.averages.rootMoistWet > harmonized.averages.rootMoistDry, 'Wet season should have higher soil moisture than dry season');
});

test('parseEnhancedPower validates all 9 parameters and extracts heat/frost days', () => {
  const p = {
    PRECTOTCORR: {},
    T2M: {},
    T2M_MAX: {},
    T2M_MIN: {},
    GWETROOT: {},
    GWETPROF: {},
    ALLSKY_SFC_SW_DWN: {},
    WS2M: {},
    RH2M: {}
  };

  for (let i = 0; i < 365; i++) {
    const d = new Date(Date.UTC(2025, 0, i + 1)).toISOString().slice(0, 10).replaceAll('-', '');
    p.PRECTOTCORR[d] = i === 180 ? 65 : 2; // One extreme storm day >50mm
    p.T2M[d] = 26;
    p.T2M_MAX[d] = i === 120 ? 37 : 31; // One heat day >=35°C
    p.T2M_MIN[d] = i === 10 ? 3 : 18; // One frost/cold shock day <=4°C
    p.GWETROOT[d] = 0.65;
    p.GWETPROF[d] = 0.55;
    p.ALLSKY_SFC_SW_DWN[d] = 18.0;
    p.WS2M[d] = 2.1;
    p.RH2M[d] = 72;
  }

  const parsed = parseEnhancedPower({ properties: { parameter: p } });
  assert.equal(parsed.source, 'NASA POWER Enhanced');
  assert.equal(parsed.years.length, 1);
  assert.equal(parsed.years[0].heatDays, 1);
  assert.equal(parsed.years[0].frostDays, 1);
  assert.equal(parsed.years[0].extremeRainDays, 1);
  assert.equal(parsed.years[0].rootMoistWet, 0.65);
});

test('RUSLE erosion model accurately evaluates soil loss against tolerable threshold', () => {
  const loamRisk = computeErosionRisk({ annualRain: 1400, soilType: 'loam', slopePct: 1.0, cropId: 'rice', residue: 'mulch' });
  assert.ok(loamRisk.soilLossTonsHa > 0);
  assert.equal(loamRisk.tolerableLimit, 7.0);
  assert.ok(loamRisk.soilLossTonsHa <= loamRisk.tolerableLimit, 'Mulched paddy should have soil loss within tolerable limit');

  // Bare fallow with residue removed should have higher soil loss
  const bareRisk = computeErosionRisk({ annualRain: 1400, soilType: 'loam', slopePct: 1.0, cropId: 'fallow', residue: 'remove' });
  assert.ok(bareRisk.soilLossTonsHa > loamRisk.soilLossTonsHa, 'Bare fallow should erode more than mulched rice');
});

test('Soil Organic Matter model simulates humification and decomposition dynamics', () => {
  const somSimulation = simulateSoilOrganicMatter({
    startOM: 1.45,
    rows: [
      { id: 'rice', retained: 20 },
      { id: 'lentil', retained: 16 },
      { id: 'rice', retained: 20 },
      { id: 'mung', retained: 18 }
    ],
    residue: 'mulch',
    soilType: 'loam'
  });

  assert.equal(somSimulation.startOM, 1.45);
  assert.ok(somSimulation.finalOM >= somSimulation.startOM, 'Mulched legume rotation should maintain or build SOM');
  assert.equal(somSimulation.omTrajectory.length, 5); // 0 + 4 seasons
});

test('analyzeVulnerabilityGaps detects post-monsoon and bare-fallow exposure', () => {
  const rows = [
    { id: 'rice', year: 2026, season: 'wet' },
    { id: 'fallow', year: 2026, season: 'dry' }, // Bare fallow
    { id: 'rice', year: 2027, season: 'wet' },
    { id: 'wheat', year: 2027, season: 'dry' } // Rice -> Wheat late sowing transition
  ];

  const gaps = analyzeVulnerabilityGaps(rows, SAMPLE_CLIMATE);
  assert.ok(gaps.length >= 2, 'Should detect at least bare fallow and post-monsoon transition');
  assert.ok(gaps.some(g => g.period.includes('Fallow')));
  assert.ok(gaps.some(g => g.period.includes('Post-Monsoon')));
});

test('generateStrategyExplanation provides 5-part explainability dossier', () => {
  const explanation = generateStrategyExplanation({
    strategyId: 'adaptive',
    strategyName: 'TerraLoop Adaptive',
    rows: [{ id: 'rice', water: { demand: 760 } }, { id: 'lentil', water: { demand: 290 } }],
    farm: DEFAULT_FARM,
    earthObs: harmonizeEarthObservations(REGIONAL_EARTH_PROFILES.rajshahi, 21, 'loam'),
    somResult: { netChange: 0.12, status: 'Building Carbon' },
    erosionResult: { soilLossTonsHa: 3.2, tolerableLimit: 7.0 },
    metricsData: { water: 350, retained: 25 }
  });

  assert.ok(explanation.why.length > 20, 'Should have descriptive why statement');
  assert.ok(explanation.evidence.length >= 2, 'Should provide supporting evidence items');
  assert.ok(explanation.benefits.length >= 2, 'Should quantify benefits');
  assert.ok(explanation.informationGaps.length >= 1, 'Should state information gaps');
  assert.ok(explanation.risksRequiringExpertReview.length >= 1, 'Should state risks requiring local review');
});

test('GLOSSARY_TERMS catalog contains essential remote sensing and soil terms', () => {
  const ids = GLOSSARY_TERMS.map(t => t.id);
  assert.ok(ids.includes('et'), 'Must explain Evapotranspiration');
  assert.ok(ids.includes('smap_anomaly'), 'Must explain SMAP soil moisture anomaly');
  assert.ok(ids.includes('ndvi'), 'Must explain NDVI');
  assert.ok(ids.includes('esi'), 'Must explain Evaporative Stress Index / ECOSTRESS');
  assert.ok(ids.includes('grace_twsa'), 'Must explain GRACE groundwater');
  assert.ok(ids.includes('rusle'), 'Must explain RUSLE erosion equation');
  assert.ok(ids.includes('satellite_vs_ground'), 'Must explain satellite vs ground truth');
  assert.ok(ids.includes('decision_support'), 'Must explain decision support principle');

  const html = glossaryModalHTML();
  assert.ok(html.includes('glossary-dialog'));
  assert.ok(html.includes('Search scientific terms'));
});

test('Multi-criteria optimizer respects custom farmer weights', () => {
  // Test that setting high soil health weight selects more legume / high structure crops
  const soilFocused = optimize({
    farm: DEFAULT_FARM,
    horizon: 3,
    weights: { profit: 10, water: 50, soilHealth: 100, erosionRisk: 50, diversity: 80 }
  });

  assert.equal(soilFocused.rows.length, 6);
  assert.ok(!soilFocused.infeasible);
  const legumeCount = soilFocused.rows.filter(r => ['lentil', 'mung', 'chickpea'].includes(r.id)).length;
  assert.ok(legumeCount >= 1, 'High soil health weight should include legume crops');
});

test('NASA_RESOURCE_LINKS provides coordinate-tailored access to NASA portals', () => {
  const names = NASA_RESOURCE_LINKS.map(r => r.name);
  assert.ok(names.includes('NASA Worldview'), 'Must include Worldview');
  assert.ok(names.includes('NASA Giovanni'), 'Must include Giovanni');
  assert.ok(names.includes('NASA Earthdata Search'), 'Must include Earthdata Search');
  assert.ok(names.includes('NASA FIRMS (Fire Information)'), 'Must include FIRMS');
  assert.ok(names.includes('NASA SEDAC (CIESIN)'), 'Must include SEDAC');
  assert.ok(names.includes('NASA Open Data Portal'), 'Must include Open Data Portal');
  assert.ok(names.includes('NASA APIs (api.nasa.gov)'), 'Must include NASA APIs');
  assert.ok(names.includes('Earthdata Remote Sensors Directory'), 'Must include Remote Sensors Directory');

  // Verify bounding box generation for Rajshahi (24.37, 88.60)
  const wv = NASA_RESOURCE_LINKS.find(r => r.name === 'NASA Worldview');
  const wvUrl = wv.generateUrl(24.37, 88.60);
  assert.ok(wvUrl.includes('worldview.earthdata.nasa.gov'));
  assert.ok(wvUrl.includes('SMAP_L4'));

  const gio = NASA_RESOURCE_LINKS.find(r => r.name === 'NASA Giovanni');
  const gioUrl = gio.generateUrl(24.37, 88.60);
  assert.ok(gioUrl.includes('giovanni.gsfc.nasa.gov'));
  assert.ok(gioUrl.includes('bbox=88.35,24.12,88.85,24.62'));
});

test('evaluateResidueBurningImpact audits stubble burning via NASA FIRMS data', () => {
  const burnAssessment = evaluateResidueBurningImpact('Rajshahi', 'burn');
  assert.equal(burnAssessment.isBurn, true);
  assert.equal(burnAssessment.divisionStats.annualFires, 142);
  assert.ok(burnAssessment.firmsWarning.includes('FIRMS'));
  assert.ok(burnAssessment.recommendation.includes('straw mulching') || burnAssessment.recommendation.includes('zero-till'));

  const mulchAssessment = evaluateResidueBurningImpact('Rajshahi', 'mulch');
  assert.equal(mulchAssessment.isBurn, false);
  assert.ok(mulchAssessment.firmsWarning.includes('Conservation practice selected'));
});

test('evaluateFertilizerBenchmark compares nitrogen levels against SEDAC CIESIN baseline', () => {
  const lowN = evaluateFertilizerBenchmark('Rajshahi', 90);
  assert.ok(lowN.difference < 0);
  assert.ok(lowN.evaluation.includes('below the SEDAC regional application benchmark'));

  const highN = evaluateFertilizerBenchmark('Rajshahi', 220);
  assert.ok(highN.difference > 0);
  assert.ok(highN.evaluation.includes('exceeds conventional regional application'));
});

test('earthdataExplorerHTML renders satellite portals and sensor catalog', () => {
  const html = earthdataExplorerHTML(DEFAULT_FARM);
  assert.ok(html.includes('NASA EARTHDATA & OPEN PLATFORMS'));
  assert.ok(html.includes('Which Satellite Measures What?'));
  assert.ok(html.includes('Microwave Radiometers (SMAP, GPM)'));
  assert.ok(html.includes('Thermal Infrared (ECOSTRESS, MODIS)'));
  assert.ok(html.includes('Satellite Gravimetry (GRACE / GRACE-FO)'));
});

test('NASA_DATASET_CATALOG provides complete metadata on all 12 datasets including why used and connection status', () => {
  assert.ok(Array.isArray(NASA_DATASET_CATALOG));
  assert.equal(NASA_DATASET_CATALOG.length, 12, 'Must catalog all 12 NASA datasets and platforms');

  const validStatuses = ['connected', 'model', 'reference', 'linked'];
  for (const item of NASA_DATASET_CATALOG) {
    assert.ok(item.id, 'Dataset must have id');
    assert.ok(item.name, 'Dataset must have display name');
    assert.ok(item.fullName, 'Dataset must have full name');
    assert.ok(validStatuses.includes(item.status), `Invalid status ${item.status}`);
    assert.ok(item.statusLabel, 'Must have status label');
    assert.ok(item.url.startsWith('https://'), 'Must have valid NASA HTTPS url');
    assert.ok(item.why && item.why.length > 20, 'Must explain why dataset is used');
    assert.ok(item.parameters, 'Must specify parameters');
    assert.ok(item.resolution, 'Must specify spatial resolution');
    assert.ok(item.howUsed && item.howUsed.length > 20, 'Must explain how dataset connects to website');
  }

  const ids = NASA_DATASET_CATALOG.map(d => d.id);
  assert.ok(ids.includes('power'), 'Must include NASA POWER');
  assert.ok(ids.includes('srtm'), 'Must include SRTM');
  assert.ok(ids.includes('smap'), 'Must include SMAP');
  assert.ok(ids.includes('gpm'), 'Must include GPM');
  assert.ok(ids.includes('ecostress'), 'Must include ECOSTRESS');
  assert.ok(ids.includes('modis_landsat'), 'Must include MODIS & Landsat');
  assert.ok(ids.includes('grace'), 'Must include GRACE');
  assert.ok(ids.includes('firms'), 'Must include FIRMS');
  assert.ok(ids.includes('sedac'), 'Must include SEDAC');
  assert.ok(ids.includes('worldview'), 'Must include Worldview');
  assert.ok(ids.includes('giovanni'), 'Must include Giovanni');
  assert.ok(ids.includes('earthdata_search'), 'Must include Earthdata Search');

  // Verify status counts
  const connected = NASA_DATASET_CATALOG.filter(d => d.status === 'connected');
  const modeled = NASA_DATASET_CATALOG.filter(d => d.status === 'model');
  const reference = NASA_DATASET_CATALOG.filter(d => d.status === 'reference');
  const linked = NASA_DATASET_CATALOG.filter(d => d.status === 'linked');

  assert.equal(connected.length, 3, 'Must have 3 connected live data feeds (POWER, SRTM, Worldview/GIBS)');
  assert.equal(modeled.length, 4, 'Must have 4 modeled/derived feeds (SMAP, GPM, ECOSTRESS, MODIS/Landsat)');
  assert.equal(reference.length, 3, 'Must have 3 reference/benchmark feeds (GRACE, FIRMS, SEDAC)');
  assert.equal(linked.length, 2, 'Must have 2 deep portal links (Giovanni, Earthdata Search)');
});
