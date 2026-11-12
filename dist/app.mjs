import {CROPS,crop,DEFAULT_FARM,DEFAULT_HISTORY,SAMPLE_CLIMATE,RESIDUES,slot,calibration,eligible,optimize,simulateSequence,metrics,parsePower} from './engine.mjs';
import {farmMapHTML,mountFarmMap} from './farm-map.mjs';
import {simulationHTML,mountSimulation} from './rotation-studio.mjs';
import {normalizeComparison,comparisonPlans} from './comparison.mjs';
import {EXHIBITION_PROVENANCE,exhibitionFarm,exhibitionBaselineIds,exhibitionScene,exhibitionBundle,stageExhibition,restoreExhibitionBackup} from './exhibition-data.mjs';
import {exhibitionHTML,exhibitionChrome,bindExhibitionControls} from './exhibition-ui.mjs';
import {NASA_DATASETS,NASA_DATASET_CATALOG,SATELLITE_VS_GROUND,harmonizeEarthObservations,parseEnhancedPower,REGIONAL_EARTH_PROFILES} from './nasa-data.mjs';
import {SOIL_TEXTURE_INFO,computeErosionRisk,simulateSoilOrganicMatter,analyzeVulnerabilityGaps,generateStrategyExplanation} from './soil-health.mjs';
import {GLOSSARY_TERMS,glossaryModalHTML,bindGlossaryEvents} from './glossary.mjs';
import {NASA_RESOURCE_LINKS,evaluateResidueBurningImpact,evaluateFertilizerBenchmark,earthdataExplorerHTML} from './earthdata-hub.mjs';

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n => Math.round(n).toLocaleString('en-US');

const paths = {
  leaf: 'M20 4c-8-1-15 2-15 9a6 6 0 0 0 7 7c7-1 9-8 8-16ZM5 20l10-10',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  history: 'M3 11a9 9 0 1 1 2 7M3 4v7h7m2-5v6l4 2',
  route: 'M6 3v12a4 4 0 0 0 4 4h8M6 9h8a4 4 0 0 0 4-4V3M3 3h6M15 3h6M16 16l3 3-3 3',
  water: 'M12 3C9 8 5 12 5 16a7 7 0 0 0 14 0c0-4-4-8-7-13ZM8 16a4 4 0 0 0 4 4',
  shield: 'm12 3 8 3v6c0 5-5 8-8 10-3-2-8-5-8-10V6l8-3Zm-4 9 3 3 5-6',
  loop: 'M20 8a9 9 0 0 0-15-3L2 8m0-5v5h5m-3 8a9 9 0 0 0 15 3l3-3m0 5v-5h-5',
  book: 'M4 3h13a3 3 0 0 1 3 3v15H7a3 3 0 0 1-3-3V3Zm0 14h16M9 7h7M9 11h5',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Zm-5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  chevron: 'm9 5 7 7-7 7',
  down: 'm6 9 6 6 6-6',
  plus: 'M12 5v14M5 12h14',
  close: 'm6 6 12 12M6 18 18 6',
  check: 'm5 12 4 4L19 6',
  sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2m-1 7a6 6 0 1 1-12 0 6 6 0 0 1 12 0',
  cloud: 'M6 18a5 5 0 1 1 1-10 7 7 0 0 1 13 4 3 3 0 0 1-1 6H6m2 3v1m5-1v1m5-1v1',
  bolt: 'm13 2-9 12h7l-1 8 10-13h-8l1-7',
  wheat: 'M12 22V5m0 5C6 10 4 7 4 4c5 0 8 2 8 6Zm0 6c-6 0-8-3-8-6 5 0 8 2 8 6Zm0-6c6 0 8-3 8-6-5 0-8 2-8 6Zm0 6c6 0 8-3 8-6-5 0-8 2-8 6ZM12 5V2',
  sprout: 'M12 22V12M12 13C4 13 2 8 3 3c7 0 10 4 9 10Zm0 3c0-7 4-10 10-9 0 6-3 9-10 9',
  flower: 'M12 20v-7m-4 8 4-3 4 3M12 3c-3-4-6 0-3 3-5-1-6 4-2 5-1 5 4 6 5 2 1 4 6 3 5-2 4-1 3-6-2-5 3-3 0-7-3-3Z',
  info: 'M12 11v6m0-10v1m9 4a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  edit: 'm16 3 5 5L9 20l-6 1 1-6L16 3ZM13 6l5 5',
  arrow: 'M5 12h14m-5-5 5 5-5 5',
  settings: 'M4 7h16M4 17h16M8 4v6m8 4v6',
  menu: 'M3 6h18M3 12h18M3 18h18',
  target: 'M21 12a9 9 0 1 1-9-9m0 4a5 5 0 1 0 5 5m-5 0 9-9m-6 0h6v6',
  satellite: 'm5 3 4 4-4 4-4-4 4-4Zm14 10 4 4-4 4-4-4 4-4ZM9 7l8 8-4 4-8-8 4-4Zm-6 8a6 6 0 0 1 6 6m-6-3a3 3 0 0 1 3 3',
  money: 'M3 5h18v14H3V5Zm12 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6 9v6m12-6v6',
  database: 'M3 5c0-1.66 4.03-3 9-3s9 1.34 9 3v14c0 1.66-4.03 3-9 3s-9-1.34-9-3V5zm0 7c0 1.66 4.03 3 9 3s9-1.34 9-3m-18-3.5c0 1.66 4.03 3 9 3s9-1.34 9-3'
};

const icon = (name, size = 20) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.leaf}"/></svg>`;

let saved;
try { saved = JSON.parse(localStorage.getItem('terraloop-v1')); } catch {}
const valid = saved?.version === 1 && saved.farm && Number.isFinite(saved.farm.water) && saved.farm.water >= 0 && ['loam','clay','sandy'].includes(saved.farm.soil) && Array.isArray(saved.history) && Array.isArray(saved.feedback);

let state = valid ? saved : {
  version: 1,
  farm: {...DEFAULT_FARM},
  history: structuredClone(DEFAULT_HISTORY),
  feedback: [],
  climate: structuredClone(SAMPLE_CLIMATE),
  priority: 'balanced',
  horizon: 5,
  weights: null
};

if (!state.earthObs) {
  const reg = state.farm.region?.toLowerCase().includes('kurigram') ? REGIONAL_EARTH_PROFILES.kurigram
            : state.farm.region?.toLowerCase().includes('rangpur') ? REGIONAL_EARTH_PROFILES.rangpur
            : REGIONAL_EARTH_PROFILES.rajshahi;
  state.earthObs = harmonizeEarthObservations(state.climate?.source === 'NASA POWER' ? state.climate : reg, 21, state.farm.soil);
}

let page = 'overview', shock = null, selectedYear = 2028, selectedSeason = 0, loading = false, result, normalResult, mobile = false;
let pageCleanup = () => {};
const simState = {cursor: 0.59, playing: false, speed: 1, time: 0, motion: !matchMedia('(prefers-reduced-motion: reduce)').matches, metric: 'income', editor: null};
let simConfig, simWorkspace;

const nav = [
  ['overview', 'grid', 'Farm overview'],
  ['land', 'pin', 'Select farmland'],
  ['memory', 'history', 'Farm memory'],
  ['rotation', 'route', 'Rotation planner'],
  ['simulation', 'sprout', 'Farm simulation'],
  ['water', 'water', 'Water wallet'],
  ['climate', 'shield', 'Climate replay'],
  ['earth', 'satellite', 'Earth observations'],
  ['nasadatasets', 'database', 'NASA datasets'],
  ['learning', 'loop', 'Learning loop'],
  ['passport', 'book', 'Resilience passport'],
  ['exhibition', 'target', 'Exhibition studio']
];

function save() {
  if (state.exhibition) state.exhibition.scenario = shock;
  try {
    localStorage.setItem('terraloop-v1', JSON.stringify(state));
  } catch {
    toast('Browser storage is unavailable. Export your passport to keep a copy.');
  }
}

function recalc() {
  const args = {...state};
  normalResult = optimize(args);
  result = shock ? optimize({...args, shock, prefix: normalResult.rows.slice(0, (shock.year - 2026) * 2)}) : normalResult;
}

function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $('#toast').classList.remove('show'), 4200);
}

function confidence() {
  if (state.exhibition) return 'Illustrative';
  const obs = state.history.filter(h => h.source === 'Farmer entry' && !h.synthetic).length;
  return state.climate.source === 'NASA POWER' && obs >= 3 ? 'Moderate' : 'Low';
}

function badge(text, type = '') { return `<span class="badge ${type}">${text}</span>`; }
function header(title, subtitle, action = '') {
  return `<div class="page-heading"><div><div class="eyebrow">YOUR FARM, THROUGH TIME</div><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`;
}
function button(text, action, ic = '', cls = 'btn') {
  return `<button class="${cls}" data-action="${action}" ${!text ? `aria-label="${action === 'menu' ? 'Toggle navigation' : esc(action)}"` : ''}>${ic ? icon(ic, 17) : ''}${text}</button>`;
}
function sectionTitle(title, meta = '', action = '') {
  return `<div class="section-title"><div><h2>${title}</h2>${meta ? `<p>${meta}</p>` : ''}</div>${action}</div>`;
}

function controls() {
  const priorities = [
    ['balanced', 'Balanced resilience'],
    ['profit', 'Maximum income'],
    ['water', 'Save water'],
    ['soil_health', 'Soil health'],
    ['climate_resilience', 'Climate resilience']
  ];
  return `
    <div class="planner-controls">
      <div class="segmented" aria-label="Planning priority">
        ${priorities.map(([k, v]) => `
          <button data-priority="${k}" aria-pressed="${state.priority === k && !state.weights}" class="${state.priority === k && !state.weights ? 'active' : ''}">${v}</button>
        `).join('')}
        <button data-action="weights" class="${state.weights ? 'active' : ''}">${icon('settings', 14)} Priority sliders</button>
      </div>
      <label class="inline-label">Plan length
        <select id="horizon">
          ${[3, 4, 5].map(n => `<option value="${n}" ${n === state.horizon ? 'selected' : ''}>${n} years</option>`).join('')}
        </select>
      </label>
    </div>
  `;
}

function chart(rows, width = 600, height = 150, key = 'nitrogen') {
  const vals = rows.map(r => r[key]);
  const max = Math.max(...vals, 100), min = Math.min(...vals, 0);
  const pts = vals.map((v, i) => `${30 + i * (width - 50) / Math.max(1, vals.length - 1)},${height - 25 - (v - min) / (max - min) * (height - 45)}`);
  return `<svg class="line-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Estimated soil nitrogen over the rotation"><defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#bedc98" stop-opacity=".38"/><stop offset="1" stop-color="#bedc98" stop-opacity="0"/></linearGradient></defs>${[.25,.5,.75].map(v => `<path d="M30 ${height-25-v*(height-45)}H${width-20}" stroke="currentColor" opacity=".10" stroke-dasharray="3 5"/>`).join('')}<path d="M${pts.join(' L')} L${width-20} ${height-25}H30Z" fill="url(#chart-fill)"/><polyline points="${pts.join(' ')}" fill="none" stroke="currentColor" stroke-width="2.5"/>${pts.map((p, i) => `<circle cx="${p.split(',')[0]}" cy="${p.split(',')[1]}" r="3" fill="currentColor"/>${i%2===0?`<text x="${p.split(',')[0]}" y="${height-3}" text-anchor="middle" font-size="12" fill="currentColor" opacity=".6">${2026+i/2}</text>`:''}`).join('')}</svg>`;
}

function statCards() {
  const m = metrics(result.rows), base = metrics(baseline());
  const waterSave = base.water ? Math.round((base.water - m.water) / base.water * 100) : 0;
  const som = simulateSoilOrganicMatter({startOM: SOIL_TEXTURE_INFO[state.farm.soil]?.typicalBaselineOM || 1.45, rows: result.rows, residue: state.farm.residue, soilType: state.farm.soil});
  const erosion = computeErosionRisk({annualRain: state.earthObs?.averages?.annualRain || 1400, soilType: state.farm.soil, cropId: result.rows[0]?.id || 'rice', residue: state.farm.residue});

  return `
    <div class="stats">
      <div class="stat">${icon('shield')}<span>Rotation outlook</span><strong>${shock ? 'Adapting' : 'Balanced'} <small class="stat-unit">${state.horizon} years</small></strong><p>${shock ? `${esc(shock.type)} escape route applied` : 'A plan with room to adapt'}</p></div>
      <div class="stat">${icon('water')}<span>Planned irrigation</span><strong>${fmt(m.water)} <small>mm</small></strong><p class="good">${waterSave >= 0 ? `${waterSave}% less than` : `${-waterSave}% more than`} ${esc(baselineLabel())}</p></div>
      <div class="stat">${icon('sprout')}<span>Soil Organic Matter</span><strong>${som.finalOM}% <small class="good">${som.netChange >= 0 ? '+' : ''}${som.netChange}%</small></strong><p>${som.status} (${erosion.soilLossTonsHa} t/ha/yr erosion)</p></div>
      <div class="stat">${icon('satellite')}<span>NASA Earth Data</span><strong>${confidence()} <small class="confidence-dot"></small></strong><p>${state.climate.source === 'NASA POWER' ? 'SMAP/GPM/POWER active' : 'Connecting improves context'}</p></div>
    </div>
  `;
}

function baselineLabel() {
  return state.simComparison?.custom?.find(p => p.id === 'custom-current')?.name || exhibitionFarm(state.exhibition?.farmId)?.baselineName || 'Rice–maize baseline';
}

function baseline(sh = shock) {
  return simulateSequence(exhibitionBaselineIds(state), {...state, shock: sh});
}

function timeline(compact = false) {
  return `<div class="rotation-timeline ${compact ? 'compact' : ''}">${Array.from({length: state.horizon}, (_, i) => {
    const rows = result.rows.slice(i * 2, i * 2 + 2);
    return `<div class="year-column"><div class="year-label">${2026 + i}${shock?.year === 2026 + i ? badge('Adapted', 'amber') : i === 0 ? badge('Start here', 'green') : ''}</div>${rows.map(r => {
      const c = crop(r.id);
      return `<button class="crop-card ${c.color}" data-season="${r.index}"><span class="crop-season">${r.season === 'wet' ? 'KHARIF · JUN–NOV' : 'RABI · DEC–MAY'}</span><span class="crop-icon">${icon(c.icon, 25)}</span><strong>${c.name}</strong><span class="crop-benefit">${c.fix ? 'N-fixing legume' : c.id === 'fallow' ? 'Soil recovery' : c.id === 'rice' ? 'Monsoon cereal' : c.family === 'Poaceae' ? 'Deep-rooted cereal' : 'Rotation diversity'}</span><span class="crop-water">${icon('water', 13)} ${fmt(r.water.irrigation)} mm irrigation ${icon('chevron', 13)}</span></button>`;
    }).join('')}</div>`;
  }).join('')}</div>`;
}

function overview() {
  const m = metrics(result.rows);
  const gaps = analyzeVulnerabilityGaps(result.rows, state.climate);
  const som = simulateSoilOrganicMatter({startOM: SOIL_TEXTURE_INFO[state.farm.soil]?.typicalBaselineOM || 1.45, rows: result.rows, residue: state.farm.residue, soilType: state.farm.soil});
  const erosion = computeErosionRisk({annualRain: state.earthObs?.averages?.annualRain || 1400, soilType: state.farm.soil, cropId: result.rows[0]?.id || 'rice', residue: state.farm.residue});

  return `
    ${header('Every season is a new possibility.', 'A living strategy for your land. Rooted in the past, ready for what’s next.', button('Edit farm', 'farm', 'settings', 'btn secondary'))}
    <div class="hero-grid">
      <section class="twin-hero">
        <div class="hero-top"><span class="eyebrow light">THE FARM TIME MACHINE</span>${badge('NASA Earth Observations Enhanced', 'light')}</div>
        <div class="hero-copy"><h2>A healthier farm.<br>A more resilient <em>future.</em></h2><p>Explore what the next ${state.horizon} years could look like.<br>Every crop protects the soil and conserves water.</p>${button('Run farm simulation', 'simulation', 'loop', 'btn lime')}</div>
        <div class="hero-chart"><span>ESTIMATED NITROGEN CARRY-OVER</span>${chart(result.rows, 470, 160)}<div class="hero-chart-foot"><strong>${m.nitrogen}<small> kg N/ha</small></strong><span>at the end of your plan</span></div></div>
        <div class="hero-footer">${icon('loop', 16)} ${result.rows.length} seasons connected <span>•</span> ${m.families} crop families <span>•</span> SOM: ${som.finalOM}% (${som.status})</div>
      </section>
      <section class="farm-panel">
        <div class="farm-panel-title"><span class="eyebrow">YOUR PATCH OF EARTH</span>${icon('pin', 18)}</div>
        <div class="field-map" aria-label="Field boundary schematic"><svg viewBox="0 0 340 130" role="img"><defs><pattern id="furrows" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(25)"><path d="M0 0V8" stroke="#b4c3a4" stroke-width="2"/></pattern></defs><path d="M0 5 150 0 178 59 20 70Z" fill="#d7dfcb"/><path d="m173 0 167 0v65l-133-9Z" fill="#ced9bb"/><path d="m0 85 157-10 24 55H0Z" fill="#bccda9"/><path d="m176 72 164 10v48H199Z" fill="url(#furrows)"/><circle cx="159" cy="65" r="12" fill="#1c4f3b"/><circle cx="159" cy="65" r="4" fill="#d5edaf"/></svg><span>FIELD SCHEMATIC</span></div>
        <h3>${esc(state.farm.name)}</h3>
        <p>${icon('pin', 14)} ${esc(state.farm.region)}, Bangladesh</p>
        <div class="farm-facts">
          <div><strong>${state.farm.area} <small>ha</small></strong><span>Farm area</span></div>
          <div><strong>${esc(state.farm.soil)}<small> soil</small></strong><span>${SOIL_TEXTURE_INFO[state.farm.soil]?.name || 'Farmer supplied'}</span></div>
        </div>
        <button class="text-button" data-action="land">Select farmland on map ${icon('chevron', 14)}</button>
      </section>
    </div>
    ${statCards()}
    ${gaps.length ? `
      <div class="vulnerability-banner">
        ${icon('shield', 24)}
        <div>
          <strong>Seasonal Transition Notice: ${esc(gaps[0].period)}</strong>
          <p>${esc(gaps[0].vulnerability)} <em>Action: ${esc(gaps[0].recommendation)}</em></p>
        </div>
      </div>
    ` : ''}
    <section class="panel rotation-panel">
      ${sectionTitle('The next chapter of your farm', `${state.horizon}-year adaptive rotation · Two planning seasons per year`, button('Open planner', 'rotation', '', 'text-button'))}
      ${timeline(true)}
      <div class="panel-note">${icon('info', 16)} A supportive strategy balancing soil health, water limits, and income. Select any crop to inspect its agronomic role.</div>
    </section>
    <div class="bottom-grid">
      <section class="panel insight-panel">
        <div class="round-icon">${icon('satellite', 22)}</div>
        <div>
          <span class="eyebrow">NASA EARTH OBSERVATIONS</span>
          <h3>SMAP, GPM & ECOSTRESS Insights</h3>
          <p>Root-zone soil wetness, reference ET (${state.earthObs?.averages?.annualET0 || 1420} mm/yr), and flood storm hazards mapped to your coordinates.</p>
          ${button('Explore Earth observations', 'earth', '', 'text-button')}
        </div>
      </section>
      <section class="panel insight-panel shield-panel">
        <div class="round-icon amber-bg">${icon('book', 22)}</div>
        <div>
          <span class="eyebrow">SCIENTIFIC GLOSSARY</span>
          <h3>Understand the Earth Data</h3>
          <p>Clear explanations of Evapotranspiration, SMAP anomalies, RUSLE soil loss, and satellite vs ground truth differences.</p>
          <button class="text-button" data-action="glossary">Open scientific glossary ${icon('chevron', 14)}</button>
        </div>
      </section>
    </div>
  `;
}

function rotation() {
  const m = metrics(result.rows);
  const baselineOM = SOIL_TEXTURE_INFO[state.farm.soil]?.typicalBaselineOM || 1.45;
  const som = simulateSoilOrganicMatter({startOM: baselineOM, rows: result.rows, residue: state.farm.residue, soilType: state.farm.soil});
  const erosion = computeErosionRisk({annualRain: state.earthObs?.averages?.annualRain || 1400, soilType: state.farm.soil, cropId: result.rows[0]?.id || 'rice', residue: state.farm.residue});
  const gaps = analyzeVulnerabilityGaps(result.rows, state.climate);
  const explanation = generateStrategyExplanation({
    strategyId: 'adaptive',
    strategyName: 'TerraLoop Adaptive Rotation',
    rows: result.rows,
    farm: state.farm,
    earthObs: state.earthObs,
    somResult: som,
    erosionResult: erosion,
    metricsData: m
  });

  return `
    ${header('Plan seasons. Build resilience.', 'Find a sequence that works with your soil, your water, and your priorities.', button('Generate adaptive rotation', 'generate', 'loop'))}
    ${controls()}
    <div class="gate-bar">
      <span>${icon('settings', 17)} SUITABILITY GATE</span>
      <strong>${CROPS.length - 1} crops</strong>${icon('chevron', 14)}
      <span>Bangladesh climate</span>${icon('chevron', 14)}
      <span>${esc(state.farm.soil)} soil (K=${erosion.factors.K})</span>${icon('chevron', 14)}
      <strong>${eligible(state.farm, 'dry', state.climate, null).filter(c => c.id !== 'fallow').length} dry-season options</strong>
      <span class="gate-end">${fmt(result.examined)} transitions evaluated</span>
    </div>
    ${shock ? `<div class="notice amber">${icon('shield')} ${esc(shock.type)} stress applied in ${shock.year}. Earlier seasons remain fixed. ${button('Clear stress test', 'clear-shock', '', 'text-button')}</div>` : ''}
    <section class="panel">
      ${sectionTitle('Your adaptive rotation', `2026–${2025 + state.horizon} · ${state.farm.water} mm annual irrigation limit`)}
      ${timeline()}
      <div class="panel-note">${icon('check', 16)} Every recommended year fits your irrigation budget. Winter seasons finish in the next calendar year.</div>
    </section>

    <!-- Strategy Explainability Dossier -->
    <section class="explain-box">
      <div class="explain-header">
        ${icon('leaf', 24)}
        <div>
          <span class="eyebrow">STRATEGY EXPLANATION & AGROECOLOGICAL EVIDENCE</span>
          <h3>Why This Rotation Was Suggested</h3>
        </div>
      </div>
      <p style="margin-bottom:16px;color:#4c604b;line-height:1.7">${esc(explanation.why)}</p>
      <div class="explain-sections">
        <div class="explain-col">
          <h4>${icon('satellite', 16)} NASA Earth Observations & Soil Evidence</h4>
          <ul>${explanation.evidence.map(e => `<li>${esc(e)}</li>`).join('')}</ul>
        </div>
        <div class="explain-col">
          <h4>${icon('sprout', 16)} Quantified Farm Benefits</h4>
          <ul>${explanation.benefits.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
        </div>
        <div class="explain-col">
          <h4>${icon('info', 16)} Information Gaps (Needing Ground Checks)</h4>
          <ul>${explanation.informationGaps.map(g => `<li>${esc(g)}</li>`).join('')}</ul>
        </div>
        <div class="explain-col">
          <h4>${icon('shield', 16)} Risks Requiring Local Review</h4>
          <ul>${explanation.risksRequiringExpertReview.map(r => `<li>${esc(r)}</li>`).join('')}</ul>
        </div>
      </div>
    </section>

    ${gaps.length ? `
      <section class="panel padded">
        ${sectionTitle('Seasonal Vulnerability Windows', 'Times when fields may be bare or transitions are tight')}
        <div style="display:flex;flex-direction:column;gap:12px">
          ${gaps.map(g => `
            <div class="vulnerability-banner" style="margin:0">
              ${icon('shield', 20)}
              <div>
                <strong>${esc(g.period)}: ${esc(g.vulnerability)}</strong>
                <p><em>Recommendation:</em> ${esc(g.recommendation)}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    ` : ''}

    <div class="two-grid">
      <section class="panel padded">
        ${sectionTitle('Soil Health & Carbon Trajectory', 'Soil Organic Matter (SOM) & Nitrogen dynamics')}
        ${chart(result.rows)}
        <div class="mini-metrics">
          <span><b>${m.nitrogen}</b> kg N/ha ending available</span>
          <span><b>${som.finalOM}%</b> SOM (${som.status})</span>
        </div>
        <p class="small muted">Modeled SOM started at ${som.startOM}% and shifts to ${som.finalOM}% (${som.netChange >= 0 ? '+' : ''}${som.netChange}%). Annual RUSLE soil loss is estimated at ${erosion.soilLossTonsHa} t/ha/yr vs 7.0 t/ha tolerable limit.</p>
      </section>
      <section class="panel padded">
        ${sectionTitle('Why these crops work together', 'Compatibility evaluated at every transition')}
        ${[['Disease-host breaks', m.disease, result.rows.length], ['Pest-host breaks', m.pest, result.rows.length], ['Weed-cycle disruption', m.weed, result.rows.length], ['Crop-family diversity', m.families, 6]].map(([n, v, max]) => `
          <div class="score-row"><span>${n}</span><div class="meter"><i style="width:${v / max * 100}%"></i></div><b>${v}${max === 6 ? ' families' : ' transitions'}</b></div>
        `).join('')}
        <p class="small muted">Alternating root depths and plant families reduces soil compaction and breaks continuous pest breeding cycles.</p>
      </section>
    </div>
  `;
}

function earth() {
  const eo = state.earthObs || harmonizeEarthObservations(state.climate, 21, state.farm.soil);
  const avg = eo?.averages || {};
  const trends = eo?.trends || {};

  return `
    ${header('NASA Earth Observations & Agro-Climatology', 'Harmonized satellite measurements (SMAP, GPM, ECOSTRESS, POWER, GRACE, SRTM) mapped to your farm.', `
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        ${button(loading ? 'Connecting…' : 'Connect NASA live', 'fetch-climate', 'satellite', 'btn')}
        <button class="btn secondary" data-nav="nasadatasets">${icon('database', 16)} Dataset Directory</button>
        <button class="btn secondary" data-action="earthdata-hub">${icon('satellite', 16)} Earthdata Portals</button>
        <button class="btn secondary" data-action="glossary">${icon('book', 16)} Glossary</button>
      </div>
    `)}

    <div class="earth-summary-banner">
      <div>
        <span class="eyebrow light">NASA SATELLITE RECONSTRUCTION</span>
        <h2>${esc(state.farm.region)} Agro-Climatic Grid</h2>
        <p>Location: ${state.farm.lat}° N, ${state.farm.lon}° E · Elevation: ${eo.elevationMeters}m (SRTM DEM) · Topographic slope: ~${eo.estimatedSlopePct}% (LS factor: ${eo.lsFactor})</p>
      </div>
      <div class="earth-badge-group">
        ${badge(state.climate.source === 'NASA POWER' ? 'NASA POWER LIVE' : 'SYNTHETIC RECONSTRUCTION', 'light')}
        ${badge(`GRACE TWSA: ${eo.graceGroundwaterAnomalyCmYear} cm/yr`, 'light')}
      </div>
    </div>

    <!-- Earth Stats Grid -->
    <div class="earth-stats-grid">
      <div class="earth-stat-card">
        <span class="eyebrow">SMAP ROOT-ZONE MOISTURE</span>
        <strong>${(avg.rootMoistWet * 100).toFixed(0)}% <small>wet</small> / ${(avg.rootMoistDry * 100).toFixed(0)}% <small>dry</small></strong>
        <p>0–100 cm root wetness. Dry-season deficit: ${avg.waterDeficitDrySeason || 380} mm.</p>
        <span class="trend-tag ${trends.soilMoisture?.direction || 'stable'}">Trend: ${trends.soilMoisture?.direction || 'stable'} (${trends.soilMoisture?.slope > 0 ? '+' : ''}${trends.soilMoisture?.slope || 0}/yr)</span>
      </div>

      <div class="earth-stat-card">
        <span class="eyebrow">REFERENCE ET (ET₀) & DEMAND</span>
        <strong>${fmt(avg.annualET0 || 1420)} <small>mm/year</small></strong>
        <p>Atmospheric evaporative demand based on solar irradiance & temperature.</p>
        <span class="trend-tag ${trends.temperature?.direction || 'increasing'}">Temp trend: +${trends.temperature?.slope || 0.12}°C/yr</span>
      </div>

      <div class="earth-stat-card">
        <span class="eyebrow">GPM EXTREME PRECIPITATION</span>
        <strong>${avg.annualExtremeRainDays || 5} <small>days/yr &gt;50mm</small></strong>
        <p>Storm intensity factor (RUSLE R-factor: ${eo.rFactor}). High storm splash erosion risk.</p>
        <span class="trend-tag ${trends.rain?.direction || 'stable'}">Rain trend: ${trends.rain?.direction || 'stable'}</span>
      </div>

      <div class="earth-stat-card">
        <span class="eyebrow">HEAT & FROST VULNERABILITY</span>
        <strong>${avg.annualHeatDays || 18} <small>heat days</small> / ${avg.annualFrostDays || 0} <small>frost</small></strong>
        <p>Days Tmax &ge;35°C (flowering sterility risk) and Tmin &le;4°C (winter blight risk).</p>
        <span class="trend-tag stable">Cold shock: December–January</span>
      </div>
    </div>

    <!-- Scenario Explorer / What-If Sliders -->
    <section class="scenario-explorer-box">
      <div class="section-title" style="padding:0 0 10px">
        <div>
          <h2>Climate Anomaly Explorer</h2>
          <p>Test how shifting temperature and rainfall patterns impact rotation feasibility.</p>
        </div>
      </div>
      <div class="scenario-sliders-grid">
        <div class="slider-control-group">
          <div class="slider-header">
            <span>Temperature Shift (ΔT)</span>
            <output id="slider-temp-val">+0.0°C</output>
          </div>
          <input type="range" id="slider-temp" min="-2.0" max="4.0" step="0.5" value="0.0">
          <div class="slider-ticks"><span>-2.0°C (cooler)</span><span>Normal</span><span>+4.0°C (extreme warming)</span></div>
        </div>

        <div class="slider-control-group">
          <div class="slider-header">
            <span>Rainfall Factor (ΔRain)</span>
            <output id="slider-rain-val">100%</output>
          </div>
          <input type="range" id="slider-rain" min="50" max="150" step="5" value="100">
          <div class="slider-ticks"><span>50% (severe drought)</span><span>100% (normal)</span><span>150% (heavy flood)</span></div>
        </div>
      </div>
      <div style="margin-top:16px;display:flex;justify-content:flex-end">
        <button class="btn" id="apply-scenario-sliders">${icon('loop', 16)} Recalculate with climate shift</button>
      </div>
    </section>

    <!-- Pre-Configured NASA Earthdata Portals -->
    <section class="panel padded">
      ${sectionTitle('NASA Earthdata Web Portals (Coordinates Linked)', 'Explore satellite datasets directly in NASA scientific interfaces')}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:12px">
        ${NASA_RESOURCE_LINKS.slice(0, 4).map(r => `
          <a href="${r.generateUrl(state.farm.lat, state.farm.lon)}" target="_blank" rel="noopener" class="nasa-resource-card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <span class="badge blue">${esc(r.category)}</span>
              <span style="font-size:11px;color:#286b4f">Launch Portal ↗</span>
            </div>
            <strong style="font-size:14px;color:#274332;display:block">${esc(r.name)}</strong>
            <p style="font-size:11px;color:#64755f;margin-top:4px;line-height:1.5">${esc(r.description)}</p>
          </a>
        `).join('')}
      </div>
      <div style="margin-top:14px;display:flex;justify-content:flex-end">
        <button class="btn secondary" data-action="earthdata-hub">${icon('satellite', 16)} Open Full Earthdata & Sensors Explorer</button>
      </div>
    </section>

    <!-- NASA Earth Observation Datasets Catalog -->
    <section class="panel padded">
      ${sectionTitle('NASA Earth Observations Harmonization Grid', 'Satellite missions informing crop planning and soil protection')}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-top:16px">
        ${NASA_DATASETS.map(d => `
          <div style="background:#f9faf6;border:1px solid #e2e8da;border-radius:8px;padding:16px">
            <span class="badge blue">${esc(d.id.toUpperCase())}</span>
            <h3 style="font-size:15px;margin:8px 0 4px;color:#2c4b37">${esc(d.name)}</h3>
            <p style="font-size:11px;color:#677762;margin-bottom:8px"><strong>Sensor:</strong> ${esc(d.sensor)} · <strong>Res:</strong> ${esc(d.resolution)} (${esc(d.temporal)})</p>
            <p style="font-size:11px;color:#556650;line-height:1.5"><strong>Application:</strong> ${esc(d.application)}</p>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Satellite vs Ground Truth Matrix -->
    <section class="panel padded">
      ${sectionTitle('Satellite Remote Sensing vs. Ground Truth', 'Why satellite indices and local farmer measurements must be combined')}
      <div class="table-wrap">
        <table class="sat-matrix-table">
          <thead>
            <tr>
              <th style="width:18%">Observation Dimension</th>
              <th style="width:34%">NASA Satellite Observations</th>
              <th style="width:24%">Ground-Based Farm Measurement</th>
              <th style="width:24%">Decision-Support Role</th>
            </tr>
          </thead>
          <tbody>
            ${SATELLITE_VS_GROUND.map(m => `
              <tr>
                <td><strong>${esc(m.aspect)}</strong></td>
                <td>${esc(m.satellite)}</td>
                <td>${esc(m.ground)}</td>
                <td><em style="color:#3e6344">${esc(m.fusionRole)}</em></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="supportive-notice">
        <strong>Farmer-Centered Decision Boundary:</strong> Satellite datasets provide broad regional context across decades. They cannot observe local plow-pan depth, seed variety purity, or local drainage ditches. Use satellite insights to guide possibilities, and ground-truth them with your field observations.
      </div>
    </section>
  `;
}

function nasadatasets() {
  const datasets = NASA_DATASET_CATALOG;

  const statusColors = {
    connected: '#1a8a4a',
    model: '#2e7dba',
    reference: '#9a6d1f',
    linked: '#6b5fa5'
  };

  const statusIcons = {
    connected: 'check',
    model: 'settings',
    reference: 'book',
    linked: 'arrow'
  };

  return `
    ${header('NASA Datasets', 'All NASA Earth observation datasets used in TerraLoop — what they measure, why they matter, and how they connect.', `
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        ${button('Connect NASA live', 'fetch-climate', 'satellite', 'btn')}
        <button class="btn secondary" data-action="glossary">${icon('book', 16)} Glossary</button>
      </div>
    `)}

    <div class="notice">${icon('satellite')} ${datasets.length} NASA datasets and services integrated · ${datasets.filter(d => d.status === 'connected').length} live API connections · ${datasets.filter(d => d.status === 'linked').length} portal deep links · ${datasets.filter(d => d.status === 'model').length} modeled/derived · ${datasets.filter(d => d.status === 'reference').length} reference benchmarks</div>

    <section class="panel padded" style="margin-top:20px">
      ${sectionTitle('Connection Status Legend', 'How each dataset connects to TerraLoop')}
      <div style="display:flex;gap:20px;flex-wrap:wrap;margin-top:12px">
        <div style="display:flex;align-items:center;gap:6px"><span class="badge" style="background:${statusColors.connected};color:#fff">✓ Live API Connected</span> <small style="color:#677762">Real-time data fetched from NASA servers</small></div>
        <div style="display:flex;align-items:center;gap:6px"><span class="badge" style="background:${statusColors.model};color:#fff">⚙ Modeled / Derived</span> <small style="color:#677762">Computed from connected datasets using validated equations</small></div>
        <div style="display:flex;align-items:center;gap:6px"><span class="badge" style="background:${statusColors.reference};color:#fff">📖 Reference Data</span> <small style="color:#677762">Published statistics and pre-downloaded benchmarks</small></div>
        <div style="display:flex;align-items:center;gap:6px"><span class="badge" style="background:${statusColors.linked};color:#fff">→ Portal Deep Link</span> <small style="color:#677762">Opens NASA web portal pre-configured for your farm</small></div>
      </div>
    </section>

    <section class="panel padded" style="margin-top:20px">
      ${sectionTitle('All NASA Datasets', datasets.length + ' datasets powering crop rotation decisions')}
      <div style="display:grid;grid-template-columns:1fr;gap:16px;margin-top:16px">
        ${datasets.map(d => `
          <div style="background:#f9faf6;border:1px solid #e2e8da;border-radius:10px;padding:20px;position:relative">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:12px">
              <div>
                <span class="badge" style="background:${statusColors[d.status]};color:#fff">${d.statusLabel}</span>
                <h3 style="font-size:17px;margin:8px 0 2px;color:#2c4b37">${esc(d.name)}</h3>
                <p style="font-size:12px;color:#677762;margin:0">${esc(d.fullName)}</p>
              </div>
              <a href="${d.url}" target="_blank" rel="noopener" style="font-size:12px;color:#286b4f;text-decoration:none;white-space:nowrap">Visit NASA page ↗</a>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-bottom:12px">
              <div style="background:#f0f4eb;border-radius:6px;padding:10px">
                <div style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#8a9a82;margin-bottom:4px">Why Used</div>
                <p style="font-size:12px;color:#3e5538;line-height:1.6;margin:0">${esc(d.why)}</p>
              </div>
              <div style="background:#f0f4eb;border-radius:6px;padding:10px">
                <div style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#8a9a82;margin-bottom:4px">How Connected</div>
                <p style="font-size:12px;color:#3e5538;line-height:1.6;margin:0">${esc(d.howUsed)}</p>
              </div>
            </div>

            <div style="display:flex;flex-wrap:wrap;gap:16px;font-size:11px;color:#677762">
              <span><strong>Parameters:</strong> ${esc(d.parameters)}</span>
              <span><strong>Resolution:</strong> ${esc(d.resolution)}</span>
              ${d.localFile !== 'None (queried live)' && d.localFile !== 'None (assimilated via POWER)' && d.localFile !== 'None (computed client-side)' && d.localFile !== 'None (C-factor from crop database)' && d.localFile !== 'None (published constant)' && d.localFile !== 'None (live tile service)' && d.localFile !== 'None (web portal)' && d.localFile !== 'None (computed from POWER precipitation)' ? `<span><strong>Local file:</strong> dist/data/${esc(d.localFile)}</span>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <section class="panel padded" style="margin-top:20px">
      ${sectionTitle('Satellite vs. Ground-Truth Comparison', 'Why satellite indices and local farmer measurements must be combined')}
      <div class="table-wrap">
        <table class="sat-matrix-table">
          <thead>
            <tr>
              <th style="width:18%">Dimension</th>
              <th style="width:34%">NASA Satellite Observations</th>
              <th style="width:24%">Ground-Based Measurement</th>
              <th style="width:24%">Decision-Support Role</th>
            </tr>
          </thead>
          <tbody>
            ${SATELLITE_VS_GROUND.map(m => `
              <tr>
                <td><strong>${esc(m.aspect)}</strong></td>
                <td>${esc(m.satellite)}</td>
                <td>${esc(m.ground)}</td>
                <td><em style="color:#3e6344">${esc(m.fusionRole)}</em></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="supportive-notice" style="margin-top:16px">
        <strong>Important:</strong> Satellite data provides regional patterns across years and large areas. It cannot see individual field drainage, seed variety health, or local market prices. Always ground-truth satellite insights with your own observations and local agricultural expertise.
      </div>
    </section>
  `;
}

function memory() {
  const years = [...new Set([...(state.exhibition ? [2021,2022,2023,2024,2025] : [2022,2023,2024,2025,2026]), ...state.history.map(h => h.year).filter(Boolean)])].sort((a,b) => a - b);
  return `
    ${header('Every farm has a story.', 'Teach TerraLoop what you remember. Every history field is optional.', button('Add a season', 'add-history', 'plus'))}
    <div class="notice">${icon('history')} ${state.history.length} recorded seasons · ${state.exhibition ? 'Synthetic exhibition history · 2021–2025. Select a card for the full season story.' : state.history.filter(h => h.source === 'Sample entry').length + ' sample entries. Replace these with your own farm history.'}</div>
    <div class="memory-timeline">${years.map(y => `
      <section class="memory-year">
        <div class="memory-year-label">${y}</div>
        ${state.history.filter(h => h.year === y).sort((a,b) => a.season === 'wet' ? -1 : 1).map(h => {
          const c = crop(h.crop);
          return `<button class="memory-card" data-history="${esc(h.id)}"><span class="crop-icon ${c?.color || 'neutral'}">${icon(c?.icon || 'leaf', 22)}</span><strong>${c?.name || 'Crop not recorded'}</strong><span>${h.season === 'wet' ? 'Kharif' : 'Rabi'} · ${h.yield != null ? h.yield + ' t/ha' : 'Yield unknown'}</span><span class="small muted">${esc(h.source || 'Farmer entry')}</span>${h.irrigation != null ? `<span class="memory-detail">${h.irrigation} mm irrigation · ${esc(h.residue || 'Residue unknown')}</span>` : ''}${h.pest ? badge(esc(h.pest), 'amber') : ''}${h.notes ? `<span class="memory-note">${esc(h.notes)}</span>` : ''}</button>`;
        }).join('')}
        ${!state.history.some(h => h.year === y) ? `<div class="history-gap">${icon('plus', 25)}<strong>A story to fill in</strong><span>No confirmed history.<br>You can add this later.</span>${button('Add memory', 'add-history', '', 'text-button')}</div>` : ''}
      </section>
    `).join('')}</div>
    <div class="two-grid">
      <section class="panel padded">
        ${sectionTitle('What your history tells us')}
        <div class="insight-line">${icon('wheat')}<div><b>${state.history.filter(h => crop(h.crop)?.uptake > 90).length} nitrogen-demanding crops recorded</b><p>Alternate demand with legumes and account for nutrients removed at harvest.</p></div></div>
        <div class="insight-line">${icon('shield')}<div><b>${new Set(state.history.map(h => crop(h.crop)?.family).filter(Boolean)).size} crop families in your memory</b><p>Shared pest and disease hosts influence the next transition.</p></div></div>
        <div class="insight-line">${icon('leaf')}<div><b>Residue decisions carry forward</b><p>Current plan uses ${esc(state.farm.residue)}. Change the farm profile to compare residue handling.</p></div></div>
      </section>
      <section class="panel padded tinted">
        ${icon('satellite', 28)}
        <h3>Missing memories are welcome.</h3>
        <p>NASA POWER can add rainfall and temperature context to these years. It cannot identify which crop you grew.</p>
        <p class="small muted">Satellite phenology reconstruction needs an imagery pipeline and farmer confirmation. Satellite crop identification is not connected. Exhibition records are explicitly marked as synthetic examples.</p>
        ${button('Explore climate history', 'climate', 'satellite', 'btn secondary')}
      </section>
    </div>
  `;
}

function water() {
  const rows = result.rows;
  const r = rows[Math.min(selectedSeason, rows.length - 1)], m = metrics(rows);
  return `
    ${header('Make every drop count.', 'A water budget for each season, and a limit for the whole year.', button('Change water access', 'farm', 'settings', 'btn secondary'))}
    <div class="water-summary">
      <div>
        <span class="eyebrow">YOUR ${state.horizon}-YEAR WATER WALLET</span>
        <h2>${fmt(m.water)} <small>mm planned irrigation</small></h2>
        <p>Annual limit: ${fmt(state.farm.water)} mm · Whole-farm volume: ${fmt(m.water * state.farm.area * 10)} m³</p>
      </div>
      <div class="water-orb">${icon('water', 50)}</div>
    </div>
    <div class="two-grid">
      <section class="panel padded">
        ${sectionTitle('Seasonal balance')}
        <label>Choose a season
          <select id="water-season">
            ${rows.map(x => `<option value="${x.index}" ${x.index === r.index ? 'selected' : ''}>${x.year} ${x.season === 'wet' ? 'Kharif' : 'Rabi'} · ${crop(x.id).name}</option>`).join('')}
          </select>
        </label>
        <div class="wallet-lines">
          ${[['Effective rainfall', r.water.rain, '+'], ['Available soil water', r.water.soil, '+'], ['Planned irrigation', r.water.irrigation, '+'], ['Crop requirement', r.water.demand, '−']].map(([label, v, s]) => `
            <div><span>${label}</span><strong class="${s === '−' ? '' : 'good'}">${s} ${fmt(v)} <small>mm</small></strong></div>
          `).join('')}
          <div class="wallet-total"><span>Estimated balance</span><strong>${fmt(r.water.rain + r.water.soil + r.water.irrigation - r.water.demand)} <small>mm</small></strong></div>
        </div>
        <p class="small muted">Positive balance is a seasonal surplus, not stored water guaranteed for the next season. Soil water is a scenario assumption.</p>
      </section>
      <section class="panel padded">
        ${sectionTitle('Stay within the annual limit', 'Irrigation in mm · wet + dry planning seasons')}
        ${Array.from({length: state.horizon}, (_, i) => {
          const use = rows.slice(i * 2, i * 2 + 2).reduce((s, r) => s + r.water.irrigation, 0);
          return `<div class="annual-water"><div><strong>${2026 + i}</strong><span>${use} / ${state.farm.water} mm</span></div><div class="wide-meter"><i style="width:${state.farm.water ? use / state.farm.water * 100 : 0}%"></i></div></div>`;
        }).join('')}
        <div class="panel-note">${icon('check', 16)} Unused irrigation remains unallocated. The budget resets each planning year.</div>
      </section>
    </div>
    <section class="panel padded">
      ${sectionTitle('Water access changes your options', 'Move the slider to regenerate your plan under a different annual constraint.')}
      <label class="range-label">Annual irrigation budget <output id="water-value">${state.farm.water} mm</output>
        <input id="water-budget" type="range" min="0" max="1500" step="25" value="${state.farm.water}">
      </label>
      <div class="range-ends"><span>Rain-dependent</span><span>Reliable irrigation</span></div>
    </section>
  `;
}

function climate() {
  const b = metrics(baseline()), m = metrics(result.rows);
  return `
    ${header('Prepare for the unexpected.', 'Replay climate pressure. See the trade-offs. Keep an escape route ready.', button(loading ? 'Connecting…' : 'Connect NASA history', 'fetch-climate', 'satellite', 'btn secondary'))}
    <div class="notice ${state.climate.source === 'sample' ? 'amber' : ''}">
      ${icon('info')} ${state.climate.synthetic ? 'Synthetic exhibition climate is active. These values are invented examples, not NASA observations.' : state.climate.source === 'sample' ? 'Sample climate is active. Connecting sends your farm’s coordinates to NASA POWER for 2021–2025 observations.' : `NASA POWER historical observations · ${state.farm.lat}° N, ${state.farm.lon}° E · Retrieved ${new Date(state.climate.retrieved).toLocaleDateString()}`}
    </div>
    <div class="stress-layout">
      <section class="panel padded">
        <span class="eyebrow">THE DISASTER DECK</span>
        <h2>What happens if…</h2>
        <p>Choose a scenario, then a year. You can also drag a scenario onto a year.</p>
        <div class="disaster-deck">
          ${[['drought', 'sun', 'Drought', '65% less effective rain'], ['flood', 'cloud', 'Flood', 'Waterlogging stress'], ['heat', 'bolt', 'Extreme heat', '16% higher water demand']].map(([id, ic, title, desc]) => `
            <button draggable="true" data-disaster="${id}" class="disaster-card ${shock?.type === id ? 'selected' : ''}" aria-pressed="${shock?.type === id}">${icon(ic, 28)}<strong>${title}</strong><span>${desc}</span></button>
          `).join('')}
        </div>
        <div class="year-targets">
          ${Array.from({length: state.horizon}, (_, i) => `<button data-year="${2026 + i}" class="${selectedYear === 2026 + i ? 'selected' : ''}" aria-pressed="${selectedYear === 2026 + i}">${2026 + i}</button>`).join('')}
        </div>
        <p class="small muted">Constructed stress scenarios, not forecasts or NASA disaster alerts. Recovery planting assumes floodwater has receded.</p>
        ${shock ? button('Reset to normal conditions', 'clear-shock', 'loop', 'btn secondary') : ''}
      </section>
      <section class="escape-panel">
        <div class="eyebrow light">ADAPTIVE ESCAPE ROUTE</div>
        <h2>${shock ? 'A disruption. A different path.' : 'A plan B, before you need it.'}</h2>
        <p>${shock ? `${esc(shock.type)} scenario · ${shock.year}` : 'Select a scenario to compare the original and adapted rotation.'}</p>
        <div class="escape-path">
          <div><span>ORIGINAL PLAN</span><strong>${normalResult.rows.filter(r => r.year === selectedYear).map(r => crop(r.id).name).join(' + ')}</strong></div>
          <span class="escape-symbol">${icon('route', 30)}</span>
          <div class="escape-destination"><span>${shock ? 'ADAPTED PLAN' : 'READY TO ADAPT'}</span><strong>${result.rows.filter(r => r.year === selectedYear).map(r => crop(r.id).name).join(' + ')}</strong></div>
        </div>
        <div class="escape-metrics">
          <div><b>${b.worstLoss}%</b><span>${esc(baselineLabel())} peak yield loss</span></div>
          <div><b>${m.worstLoss}%</b><span>Adaptive peak yield loss</span></div>
        </div>
        <p class="small">${shock ? 'Earlier years stay fixed. The remaining plan is re-evaluated under the same soil and water constraints.' : 'An escape route is chosen from eligible crops, with the annual water limit preserved.'}</p>
      </section>
    </div>
    ${shock ? shieldAdvice(shock.type) : ''}
    <section class="panel padded">
      ${sectionTitle('The climate your farm has lived through', `${state.climate.synthetic ? 'Synthetic exhibition climate' : state.climate.source === 'sample' ? 'Illustrative sample' : 'NASA POWER'} · annual precipitation and average temperature`)}
      <div class="climate-bars">
        ${state.climate.years.map(y => `
          <div>
            <span>${fmt(y.rain)} mm</span>
            <div class="rain-bar"><i style="height:${Math.max(5, y.rain / Math.max(...state.climate.years.map(z => z.rain)) * 100)}%"></i></div>
            <strong>${y.year}</strong>
            <small>${y.temp}°C</small>
            ${y.event ? `<small>${esc(y.event)}</small>` : ''}
          </div>
        `).join('')}
      </div>
      <p class="small muted">Effective seasonal rain uses an illustrative 65% fraction. Data derived from GMAO MERRA-2 and CERES solar irradiance.</p>
    </section>
  `;
}

function shieldAdvice(type) {
  const advice = {
    drought: ['Before: review lower-water crops and retain mulch where appropriate.', 'During: prioritize limited irrigation for crop-sensitive growth stages.', 'After: record yield and water use to update the farm response.'],
    flood: ['Before: inspect drainage and avoid highly flood-sensitive planting.', 'During: postpone field work and fertilizer application on inundated soil.', 'After: confirm drainage and soil condition before planting a recovery crop.'],
    heat: ['Before: review local sowing windows and heat-tolerant varieties.', 'During: monitor soil moisture and avoid unnecessary root disturbance.', 'After: record flowering damage and actual yield for the next simulation.']
  }[type];
  return `
    <section class="panel padded">
      ${sectionTitle('Disaster shield', 'Preparation prompts to review with a local extension adviser')}
      <div class="three-grid">${advice.map((s, i) => `<div class="advice"><span>0${i + 1}</span><p>${s}</p></div>`).join('')}</div>
    </section>
  `;
}

function learning() {
  return `
    ${header('Every harvest teaches us something.', 'Compare expectations with reality to personalize future yield estimates.', button('Record an outcome', 'feedback', 'plus'))}
    <div class="learning-levels">
      ${[['01', 'Global knowledge', 'Illustrative crop water, nutrient, and host relationships.', 'Available'], ['02', 'Regional context', 'Bangladesh seasonal crop pool and optional NASA climate history.', 'Fixed regional rules'], ['03', 'Your farm', 'Yield multipliers updated from your own recorded outcomes.', `${state.feedback.length} outcomes recorded`]].map(([n, t, d, s]) => `
        <section class="panel padded"><span class="level-number">${n}</span><h3>${t}</h3><p>${d}</p>${badge(s, n === '03' ? 'green' : '')}</section>
      `).join('')}
    </div>
    <section class="panel padded">
      ${sectionTitle('Prediction meets the harvest', 'Prediction error = (actual − predicted) / predicted')}
      ${state.feedback.length ? `
        <div class="table-wrap">
          <table>
            <thead><tr><th>Crop / season</th><th>Predicted</th><th>Actual</th><th>Error</th><th>Farm multiplier</th></tr></thead>
            <tbody>${state.feedback.map(f => `
              <tr>
                <td><b>${crop(f.crop).name}</b><br><span class="small muted">${esc(f.year)}${f.season ? ' ' + (f.season === 'wet' ? 'Kharif' : 'Rabi') : ''} · ${esc(f.pest || 'No pest report')}</span></td>
                <td>${f.predicted} t/ha</td>
                <td>${f.actual} t/ha</td>
                <td>${((f.actual - f.predicted) / f.predicted * 100).toFixed(1)}%</td>
                <td>${calibration(state.feedback, f.crop).toFixed(2)}×</td>
              </tr>
            `).join('')}</tbody>
          </table>
        </div>
      ` : `
        <div class="empty-state">${icon('sprout', 40)}<h3>Your next harvest starts the learning loop.</h3><p>Record a prediction and actual outcome. TerraLoop will adjust that crop’s yield estimate for this farm.</p>${button('Add your first outcome', 'feedback', 'plus')}</div>
      `}
    </section>
    <div class="notice">${icon('info')} TerraLoop adapts locally using a bounded, weighted yield multiplier. Regional model training and cross-farm learning are scheduled for future regional releases. Feedback is stored securely in this browser.</div>
  `;
}

function passport() {
  const m = metrics(result.rows), b = metrics(baseline());
  const waterPlanRows = optimize({...state, priority: 'water', shock: null}).rows;
  const w = metrics(waterPlanRows);

  const baselineOM = SOIL_TEXTURE_INFO[state.farm.soil]?.typicalBaselineOM || 1.45;
  const somAdaptive = simulateSoilOrganicMatter({startOM: baselineOM, rows: result.rows, residue: state.farm.residue, soilType: state.farm.soil});
  const somBaseline = simulateSoilOrganicMatter({startOM: baselineOM, rows: baseline(), residue: state.farm.residue, soilType: state.farm.soil});
  const somWater = simulateSoilOrganicMatter({startOM: baselineOM, rows: waterPlanRows, residue: state.farm.residue, soilType: state.farm.soil});

  const erosionAdaptive = computeErosionRisk({annualRain: state.earthObs?.averages?.annualRain || 1400, soilType: state.farm.soil, cropId: result.rows[0]?.id || 'rice', residue: state.farm.residue});
  const erosionBaseline = computeErosionRisk({annualRain: state.earthObs?.averages?.annualRain || 1400, soilType: state.farm.soil, cropId: 'rice', residue: 'remove'});

  const explanationAdaptive = generateStrategyExplanation({
    strategyId: 'adaptive',
    strategyName: 'TerraLoop Adaptive Rotation',
    rows: result.rows,
    farm: state.farm,
    earthObs: state.earthObs,
    somResult: somAdaptive,
    erosionResult: erosionAdaptive,
    metricsData: m
  });

  const firmsAudit = evaluateResidueBurningImpact(state.farm.region, state.farm.residue);
  const sedacAudit = evaluateFertilizerBenchmark(state.farm.region, m.nitrogen);

  const rows = [
    ['Planned total irrigation', `${fmt(b.water)} mm`, `${fmt(m.water)} mm`, `${fmt(w.water)} mm`],
    ['Projected Soil Organic Matter (SOM)', `${somBaseline.finalOM}% (${somBaseline.netChange >= 0 ? '+' : ''}${somBaseline.netChange}%)`, `${somAdaptive.finalOM}% (${somAdaptive.netChange >= 0 ? '+' : ''}${somAdaptive.netChange}%)`, `${somWater.finalOM}% (${somWater.netChange >= 0 ? '+' : ''}${somWater.netChange}%)`],
    ['RUSLE Soil Loss Estimate', `${erosionBaseline.soilLossTonsHa} t/ha/yr`, `${erosionAdaptive.soilLossTonsHa} t/ha/yr`, `${erosionAdaptive.soilLossTonsHa} t/ha/yr`],
    ['Peak scenario yield loss', `${b.worstLoss}%`, `${m.worstLoss}%`, `${w.worstLoss}%`],
    ['Ending estimated available nitrogen', `${b.nitrogen} kg N/ha`, `${m.nitrogen} kg N/ha`, `${w.nitrogen} kg N/ha`],
    ['Disease-host breaks', b.disease, m.disease, w.disease],
    ['Pest-host breaks', b.pest, m.pest, w.pest],
    ['Crop-family diversity', `${b.families} families`, `${m.families} families`, `${w.families} families`],
    ['Estimated net margin / ha', `৳${fmt(b.profit)}`, `৳${fmt(m.profit)}`, `৳${fmt(w.profit)}`]
  ];

  return `
    ${header('Your resilience passport.', 'A transparent multi-strategy decision-support comparison for your land.', button('Export passport', 'export', 'download'))}
    
    <div class="supportive-notice">
      <strong>Decision-Support Notice:</strong> TerraLoop is designed to help farmers and extension specialists explore possibilities, evaluate trade-offs, and examine patterns in NASA Earth observations. It does not replace farmer judgment, intergenerational field experience, or local agronomic validation.
    </div>

    <section class="passport panel">
      <div class="passport-top">
        <div class="passport-brand">
          ${icon('leaf', 38)}
          <div>
            <span class="eyebrow">TERRALOOP · MULTI-STRATEGY PASSPORT</span>
            <h2>${esc(state.farm.name)}</h2>
            <p>${esc(state.farm.region)} · ${state.farm.area} ha · Soil: ${esc(state.farm.soil)} · 2026–${2025 + state.horizon}</p>
          </div>
        </div>
        ${badge(`${confidence()} data confidence`, 'amber')}
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Resilience & Soil Health Indicator</th>
              <th>${esc(baselineLabel())} (Conventional)</th>
              <th class="adaptive-cell">TerraLoop Adaptive Plan</th>
              <th>Water-Saving Alternative</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(([n, v, a, w]) => `
              <tr>
                <td>${n}</td>
                <td>${v}</td>
                <td class="adaptive-cell"><strong>${a}</strong></td>
                <td>${w}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="passport-bottom">
        <span>${icon('info', 18)} Tolerable soil loss threshold is 7.0 t/ha/yr. Estimates assume regional agro-ecological parameters.</span>
        ${button('Print passport', 'print', '', 'btn secondary')}
      </div>
    </section>

    ${firmsAudit.isBurn ? `
      <div class="firms-burn-warning">
        <strong>${icon('bolt', 16)} NASA FIRMS Stubble Fire Alert (${esc(state.farm.region)})</strong>
        <p>${esc(firmsAudit.firmsWarning)}</p>
      </div>
    ` : ''}

    <div class="sedac-benchmark-box">
      <strong>${icon('info', 14)} NASA SEDAC Regional Fertilizer Benchmark (CIESIN)</strong>
      <p>${esc(sedacAudit.evaluation)}</p>
    </div>

    <!-- Strategy Explainability Section -->
    <section class="explain-box">
      <div class="explain-header">
        ${icon('leaf', 24)}
        <div>
          <span class="eyebrow">EXPLAINABILITY DOSSIER</span>
          <h3>Scientific Rationale Behind Recommended Strategy</h3>
        </div>
      </div>
      <p style="margin-bottom:14px;color:#435c45;line-height:1.7">${esc(explanationAdaptive.why)}</p>
      <div class="explain-sections">
        <div class="explain-col">
          <h4>${icon('satellite', 16)} Supporting NASA & Soil Evidence</h4>
          <ul>${explanationAdaptive.evidence.map(e => `<li>${esc(e)}</li>`).join('')}</ul>
        </div>
        <div class="explain-col">
          <h4>${icon('sprout', 16)} Specific Benefits Offered</h4>
          <ul>${explanationAdaptive.benefits.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
        </div>
        <div class="explain-col">
          <h4>${icon('info', 16)} Known Data Gaps (Satellite Limits)</h4>
          <ul>${explanationAdaptive.informationGaps.map(g => `<li>${esc(g)}</li>`).join('')}</ul>
        </div>
        <div class="explain-col">
          <h4>${icon('shield', 16)} Risks Requiring Expert Local Review</h4>
          <ul>${explanationAdaptive.risksRequiringExpertReview.map(r => `<li>${esc(r)}</li>`).join('')}</ul>
        </div>
      </div>
    </section>

    <div class="two-grid">
      <section class="panel padded">
        ${sectionTitle('Confidence & Source Provenance')}
        ${[
          ['NASA Earth observations', state.climate.synthetic ? 'Synthetic exhibition reconstruction' : state.climate.source === 'NASA POWER' ? 'Connected · GMAO MERRA-2, SMAP, GPM' : 'Sample regional climate'],
          ['Farm history records', state.exhibition ? `${state.history.length} synthetic records` : `${state.history.filter(h => h.source === 'Farmer entry' && !h.synthetic).length} farmer-confirmed records`],
          ['Soil profile & texture', `${esc(state.farm.soil)} texture (K-factor: ${erosionAdaptive.factors.K})`],
          ['Crop response engine', 'Illustrative multi-criteria beam search'],
          ['Farm yield calibration', `${state.feedback.length} recorded harvest outcomes`]
        ].map(([n, v]) => `<div class="confidence-row"><span>${n}</span><b>${v}</b></div>`).join('')}
      </section>
      <section class="panel padded tinted">
        <h3>A strategy built on continuous learning.</h3>
        <p>Adding local soil test reports, tubewell flow rates, and harvest yield records refines model predictions.</p>
        <p class="small muted">Income calculations use fixed regional price proxies in BDT (৳) without commodity futures forecasting. Nitrogen is a mass balance, not a commercial prescription.</p>
        <p class="small"><a href="https://power.larc.nasa.gov/" target="_blank" rel="noopener">NASA POWER API</a> · <a href="https://smap.jpl.nasa.gov/" target="_blank" rel="noopener">NASA SMAP</a> · <a href="https://gpm.nasa.gov/" target="_blank" rel="noopener">NASA GPM</a></p>
      </section>
    </div>
  `;
}

function exhibition() { return exhibitionHTML(state); }

function loadExhibition(id) {
  try {
    state = stageExhibition(localStorage, state, id);
    resetExhibitionView();
    recalc();
    navigate('overview');
    toast('Exhibition story loaded. Your previous farm backup is preserved.');
  } catch (e) {
    toast('Could not load story: ' + e.message);
  }
}

function resetExhibitionView() {
  shock = null;
  selectedYear = exhibitionFarm(state.exhibition?.farmId)?.scenario.year || 2028;
  selectedSeason = 1;
  Object.assign(simState, {cursor: 0.59, playing: false, time: 0, editor: null, metric: 'income'});
}

function runExhibitionScene(index) {
  if (!state.exhibition) return;
  const scene = exhibitionScene(state, index);
  state.horizon = 5;
  state.exhibition.step = index;
  state.exhibition.guide = true;
  shock = scene.scenario;
  selectedYear = scene.selectedYear;
  selectedSeason = scene.selectedSeason;
  Object.assign(simState, {cursor: scene.cursor, playing: false, time: 0, editor: null});
  recalc();
  save();
  navigate(scene.page);
}

function restorePreviousFarm() {
  try {
    const previous = restoreExhibitionBackup(localStorage);
    state = previous;
    resetExhibitionView();
    recalc();
    navigate('overview');
    toast('Your previous farm has been restored.');
  } catch (e) {
    toast(e.message);
  }
}

function downloadExhibition() {
  const url = URL.createObjectURL(new Blob([JSON.stringify(exhibitionBundle(), null, 2)], {type: 'application/json'}));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'terraloop-exhibition-farms.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Three farm datasets and their recording route exported.');
}

function land() { return farmMapHTML(state.farm, icon); }

function simulation() {
  simConfig = normalizeComparison(state.simComparison, normalResult.rows.map(r => r.id));
  simWorkspace = comparisonPlans(simConfig, {...state, shock, normalRows: normalResult.rows, adaptiveRows: result.rows});
  return simulationHTML({farm: state.farm, rows: result.rows, shock, icon, workspace: simWorkspace, config: simConfig, sim: simState});
}

function render() {
  pageCleanup();
  pageCleanup = () => {};
  const contentMap = {overview, rotation, memory, water, climate, earth, nasadatasets, learning, passport, land, simulation, exhibition};
  const content = (contentMap[page] || overview)();

  $('#app').innerHTML = `
    <aside class="sidebar ${mobile ? 'open' : ''}">
      <a class="brand" href="#overview" aria-label="TerraLoop farm overview">
        <span class="brand-icon">${icon('leaf', 27)}</span>TerraLoop<span class="brand-period">.</span>
      </a>
      <div class="workspace-label">FARM DECISION SUPPORT</div>
      <nav>
        ${nav.map(([id, ic, title]) => `
          <button data-nav="${id}" class="nav-item ${page === id ? 'active' : ''}" ${page === id ? 'aria-current="page"' : ''}>
            ${icon(ic, 19)}<span>${title}</span>${id === 'rotation' ? '<span class="nav-count">' + state.horizon + 'Y</span>' : ''}
          </button>
        `).join('')}
      </nav>
      <div class="sidebar-bottom">
        <div class="nasa-card">
          ${icon('satellite', 23)}
          <div>
            <strong>NASA Earth Observations</strong>
            <p>SMAP · GPM · POWER · SRTM</p>
            <span>${state.climate.synthetic ? 'Exhibition profile' : state.climate.source === 'sample' ? 'Sample grid active' : 'Live historical data'}</span>
          </div>
        </div>
        <button class="farm-switch" data-action="farm">
          <span class="avatar">${esc(state.farm.name[0] || 'F')}</span>
          <span><strong>${esc(state.farm.name)}</strong><small>${esc(state.farm.region)}, Bangladesh</small></span>
          ${icon('settings', 17)}
        </button>
      </div>
    </aside>
    <div class="app-main">
      <header class="topbar">
        <div>
          ${button('', 'menu', 'menu', 'icon-button mobile-menu')}
          <span class="breadcrumb">My workspace <span>/</span> <b>${nav.find(n => n[0] === page)?.[2] || 'Farm overview'}</b></span>
        </div>
        <div class="topbar-right">
          <button class="btn secondary" data-action="glossary" style="padding:6px 12px;min-height:32px;font-size:11px">
            ${icon('book', 14)} Scientific Glossary
          </button>
          <span class="local-label">${icon('check', 14)} Saved locally</span>
          ${badge(state.exhibition ? 'CASE STUDY ACTIVE' : 'PRODUCTION WORKSPACE', state.exhibition ? 'demo' : 'green')}
          <span class="avatar small-avatar">${esc(state.farm.name[0] || 'F')}</span>
        </div>
      </header>
      <main id="main-content">
        ${exhibitionChrome(state, page)}
        ${content}
      </main>
      <footer>
        <span>TerraLoop <span class="footer-dot">·</span> The Farm Time Machine · NASA Space Apps Challenge</span>
        <span>TerraLoop Decision-Support System · Climate data is ${state.climate.source === 'sample' ? 'illustrative baseline' : 'historical NASA observations'} · Does not replace farmer judgment</span>
      </footer>
    </div>
  `;
  bind();
}

function navigate(next) {
  page = next;
  mobile = false;
  location.hash = next;
  render();
  window.scrollTo({top: 0, behavior: 'instant'});
}

function update() {
  recalc();
  save();
  render();
}

function bindBase() {
  if (page === 'memory') {
    const unknown = state.history.filter(h => !h.year);
    if (unknown.length) {
      const panel = document.createElement('section');
      panel.className = 'panel padded';
      panel.innerHTML = '<h2>Memories without a year</h2><p>You can add a date later.</p><div class="unplaced-memories">' +
        unknown.map(h => '<button class="memory-card" data-history="' + esc(h.id) + '"><strong>' + esc(crop(h.crop)?.name || 'Unplaced memory') + '</strong><span>' + esc(h.notes || h.pest || 'Some details recorded') + '</span><span>Edit memory</span></button>').join('') +
        '</div>';
      document.querySelector('.memory-timeline').after(panel);
    }
  }

  document.querySelectorAll('[data-nav]').forEach(el => el.onclick = () => navigate(el.dataset.nav));
  document.querySelectorAll('[data-action]').forEach(el => el.onclick = () => action(el.dataset.action));
  document.querySelectorAll('[data-priority]').forEach(el => el.onclick = () => {
    state.priority = el.dataset.priority;
    state.weights = null;
    update();
    toast('Rotation recalculated for ' + el.dataset.priority.replace('_', ' ') + ' priority.');
  });
  document.querySelectorAll('[data-season]').forEach(el => el.onclick = () => seasonModal(+el.dataset.season));
  document.querySelectorAll('[data-history]').forEach(el => el.onclick = () => historyModal(state.history.find(h => h.id === el.dataset.history)));

  document.querySelectorAll('[data-disaster]').forEach(el => {
    el.onclick = () => applyShock(el.dataset.disaster, selectedYear);
    el.ondragstart = e => e.dataTransfer.setData('text/plain', el.dataset.disaster);
  });

  document.querySelectorAll('[data-year]').forEach(el => {
    el.onclick = () => {
      selectedYear = +el.dataset.year;
      if (shock) applyShock(shock.type, selectedYear);
      else render();
    };
    el.ondragover = e => { e.preventDefault(); el.classList.add('drag-over'); };
    el.ondragleave = () => el.classList.remove('drag-over');
    el.ondrop = e => {
      e.preventDefault();
      const type = e.dataTransfer.getData('text/plain');
      if (['drought', 'heat', 'flood'].includes(type)) applyShock(type, +el.dataset.year);
    };
  });

  if ($('#horizon')) $('#horizon').onchange = e => {
    state.horizon = +e.target.value;
    selectedYear = Math.min(selectedYear, 2025 + state.horizon);
    if (shock && shock.year > 2025 + state.horizon) shock = null;
    update();
  };

  if ($('#water-season')) $('#water-season').onchange = e => {
    selectedSeason = +e.target.value;
    render();
  };

  if ($('#water-budget')) {
    $('#water-budget').oninput = e => $('#water-value').textContent = e.target.value + ' mm';
    $('#water-budget').onchange = e => {
      state.farm.water = +e.target.value;
      update();
    };
  }

  // Earth observations sliders
  if ($('#slider-temp')) {
    $('#slider-temp').oninput = e => {
      const val = (+e.target.value).toFixed(1);
      $('#slider-temp-val').textContent = (val > 0 ? '+' : '') + val + '°C';
    };
  }
  if ($('#slider-rain')) {
    $('#slider-rain').oninput = e => {
      $('#slider-rain-val').textContent = e.target.value + '%';
    };
  }
  if ($('#apply-scenario-sliders')) {
    $('#apply-scenario-sliders').onclick = () => {
      const tempDelta = +$('#slider-temp').value;
      const rainFactor = +$('#slider-rain').value / 100;
      shock = {
        type: tempDelta >= 2.0 ? 'heat' : rainFactor <= 0.65 ? 'drought' : rainFactor >= 1.3 ? 'flood' : 'custom',
        tempDelta,
        rainFactor,
        year: selectedYear
      };
      recalc();
      save();
      render();
      toast(`Custom climate shift applied to year ${selectedYear} (ΔT: ${tempDelta > 0 ? '+' : ''}${tempDelta}°C, Rain: ${Math.round(rainFactor * 100)}%).`);
    };
  }
}

function bind() {
  bindBase();
  bindExhibitionControls({
    load: loadExhibition,
    scene: runExhibitionScene,
    restore: restorePreviousFarm,
    download: downloadExhibition,
    studio: () => navigate('exhibition'),
    toggle: () => {
      state.exhibition.guide = state.exhibition.guide === false;
      save();
      render();
    }
  });

  if (page === 'land') pageCleanup = mountFarmMap({
    farm: structuredClone(state.farm),
    notify: toast,
    onSave: selection => {
      const changed = Math.abs(selection.lat - state.farm.lat) > 1e-7 || Math.abs(selection.lon - state.farm.lon) > 1e-7;
      if (changed) {
        state.climate = structuredClone(SAMPLE_CLIMATE);
        state.earthObs = harmonizeEarthObservations(state.climate, 21, state.farm.soil);
      }
      state.farm = {...state.farm, ...selection, ...(selection.area ? {area: +selection.area.toFixed(3)} : {})};
      update();
      toast(changed ? 'Field saved. Connect NASA history for this new location.' : 'Field saved. Simulation and farm totals updated.');
    }
  });

  if (page === 'simulation') pageCleanup = mountSimulation({
    farm: state.farm,
    rows: result.rows,
    shock,
    sim: simState,
    workspace: simWorkspace,
    config: simConfig,
    onScenario: (type, year) => {
      if (type === 'normal') {
        shock = null;
        recalc();
        save();
        render();
      } else {
        applyShock(type, year);
      }
    },
    onConfig: (next, focus) => {
      state.simComparison = normalizeComparison(next, normalResult.rows.map(r => r.id));
      save();
      render();
      if (focus) document.getElementById(focus)?.focus({preventScroll: true});
    },
    onDraft: next => {
      state.simComparison = normalizeComparison(next, normalResult.rows.map(r => r.id));
      save();
    },
    onHorizon: years => {
      state.horizon = years;
      selectedYear = Math.min(selectedYear, 2025 + years);
      if (shock?.year > 2025 + years) shock = null;
      update();
    }
  });
}

function applyShock(type, year) {
  if (!['drought', 'flood', 'heat', 'custom'].includes(type) || !Number.isInteger(year) || year < 2026 || year > 2025 + state.horizon) {
    throw Error('Choose a valid scenario and a year within the plan.');
  }
  shock = {type, year};
  selectedYear = year;
  recalc();
  save();
  render();
  toast(`Escape routes recalculated for ${type} in ${year}.`);
}

function action(a) {
  if (nav.some(n => n[0] === a)) return navigate(a);
  if (a === 'menu') { mobile = !mobile; return render(); }
  if (a === 'farm') return farmModal();
  if (a === 'add-history') return historyModal();
  if (a === 'feedback') return feedbackModal();
  if (a === 'glossary') return glossaryModal();
  if (a === 'earthdata-hub') return modal('NASA Earthdata & Remote Sensors Hub', 'Direct access to NASA Worldview, Giovanni, FIRMS, SEDAC, and the Earthdata Remote Sensors directory.', earthdataExplorerHTML(state.farm));
  if (a === 'weights') return weightsModal();
  if (a === 'generate') { update(); toast(`${fmt(result.examined)} eligible transitions evaluated. Your plan is ready.`); }
  if (a === 'clear-shock') { shock = null; recalc(); save(); render(); }
  if (a === 'fetch-climate') fetchClimate();
  if (a === 'export') exportPassport();
  if (a === 'print') window.print();
}

function modal(title, subtitle, html) {
  const d = $('#modal');
  d.innerHTML = `
    <div class="modal-header">
      <div><h2>${title}</h2><p>${subtitle}</p></div>
      <button type="button" class="icon-button" id="close-modal" aria-label="Close dialog">${icon('close')}</button>
    </div>
    ${html}
  `;
  if (!d.open) d.showModal();
  $('#close-modal').onclick = () => d.close();
  d.onclick = e => { if (e.target === d) d.close(); };
}

const field = (label, name, value, type = 'text', extra = '') => `<label>${label}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;
const select = (label, name, values, current) => `<label>${label}<select name="${name}">${values.map(([value, text]) => `<option value="${esc(value)}" ${value === current ? 'selected' : ''}>${esc(text)}</option>`).join('')}</select></label>`;

function glossaryModal() {
  modal('NASA & Agricultural Science Glossary', 'Understand remote sensing indices, water metrics, and soil health indicators.', glossaryModalHTML());
  bindGlossaryEvents($('#modal'));
}

function weightsModal() {
  const w = state.weights || {profit: 50, water: 50, soilHealth: 50, erosionRisk: 50, diversity: 50};
  modal('Farmer Priority Sliders', 'Balance economic income, water savings, and soil health to suit your personal farm goals.', `
    <form id="weights-form" class="weight-sliders-modal">
      <div class="weight-row">
        <div class="weight-row-head"><span>Maximum Economic Profit</span><output id="w-profit-val">${w.profit}%</output></div>
        <input type="range" name="profit" min="0" max="100" value="${w.profit}">
        <small>Prioritizes high-margin cash crops (e.g. potato, maize, sesame).</small>
      </div>
      <div class="weight-row">
        <div class="weight-row-head"><span>Irrigation Water Conservation</span><output id="w-water-val">${w.water}%</output></div>
        <input type="range" name="water" min="0" max="100" value="${w.water}">
        <small>Minimizes tubewell pumping, saves fuel, and protects groundwater aquifers.</small>
      </div>
      <div class="weight-row">
        <div class="weight-row-head"><span>Soil Health & Biological N-Fixation</span><output id="w-soil-val">${w.soilHealth}%</output></div>
        <input type="range" name="soilHealth" min="0" max="100" value="${w.soilHealth}">
        <small>Rewards legumes, subsoil aerating taproots, and organic matter building.</small>
      </div>
      <div class="weight-row">
        <div class="weight-row-head"><span>Erosion Prevention & Soil Cover</span><output id="w-erosion-val">${w.erosionRisk}%</output></div>
        <input type="range" name="erosionRisk" min="0" max="100" value="${w.erosionRisk}">
        <small>Penalizes bare fields, prevents monsoon gully erosion, and preserves topsoil.</small>
      </div>
      <div class="weight-row">
        <div class="weight-row-head"><span>Crop Diversity & Pest Host Breaks</span><output id="w-diversity-val">${w.diversity}%</output></div>
        <input type="range" name="diversity" min="0" max="100" value="${w.diversity}">
        <small>Forces rotation across distinct botanical families to disrupt insect and fungus cycles.</small>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn secondary" id="reset-weights">Reset to Balanced</button>
        <button class="btn" type="submit">Apply custom priorities</button>
      </div>
    </form>
  `);

  const form = $('#weights-form');
  ['profit', 'water', 'soilHealth', 'erosionRisk', 'diversity'].forEach(key => {
    const input = form.elements[key];
    const out = form.querySelector(`#w-${key === 'soilHealth' ? 'soil' : key === 'erosionRisk' ? 'erosion' : key}-val`);
    if (input && out) {
      input.oninput = () => out.textContent = input.value + '%';
    }
  });

  $('#reset-weights').onclick = () => {
    state.weights = null;
    state.priority = 'balanced';
    $('#modal').close();
    update();
    toast('Priorities reset to balanced resilience.');
  };

  form.onsubmit = e => {
    e.preventDefault();
    state.weights = {
      profit: +form.elements.profit.value,
      water: +form.elements.water.value,
      soilHealth: +form.elements.soilHealth.value,
      erosionRisk: +form.elements.erosionRisk.value,
      diversity: +form.elements.diversity.value
    };
    $('#modal').close();
    update();
    toast('Custom priority weights applied. Rotation re-optimized.');
  };
}

function farmModal() {
  const f = state.farm;
  modal('Your farm, your starting point.', 'Farm settings are saved on this device. The crop catalog is scoped to Bangladesh.', `
    <form id="farm-form">
      <div class="farm-map-invite">
        <div><strong>Find your farm on the map</strong><p>Drop a pin or draw your field to measure its area.</p></div>
        <button type="button" class="btn secondary" id="pick-farm-map">Select on map</button>
      </div>
      <div class="form-grid">
        ${field('Farm name', 'name', f.name, 'text', 'required maxlength="60"')}
        ${field('District / region', 'region', f.region, 'text', 'required maxlength="40"')}
        ${field('Latitude', 'lat', f.lat, 'number', 'required step="any" min="20.5" max="26.7"')}
        ${field('Longitude', 'lon', f.lon, 'number', 'required step="any" min="88" max="92.7"')}
        ${field('Farm area (ha)', 'area', f.area, 'number', 'required min="0.001" max="10000" step="any"')}
        ${select('Soil texture', 'soil', [['loam', 'Loam (balanced)'], ['clay', 'Clay (moisture retentive)'], ['sandy', 'Sandy (rapid drainage)']], f.soil)}
        ${field('Annual irrigation limit (mm)', 'water', f.water, 'number', 'required min="0" max="10000" step="1"')}
        ${field('Starting available nitrogen (kg N/ha)', 'nitrogen', f.nitrogen, 'number', 'required min="0" max="180"')}
        ${select('Planned residue handling', 'residue', Object.keys(RESIDUES).map(k => [k, k[0].toUpperCase() + k.slice(1)]), f.residue)}
      </div>
      <p class="small muted">Location sets the NASA point request. Soil texture is farmer supplied; regional soil maps provide reference K-factors.</p>
      <div class="modal-actions"><button class="btn" type="submit">Save farm & recalculate</button></div>
    </form>
  `);

  $('#pick-farm-map').onclick = () => { $('#modal').close(); navigate('land'); };
  $('#farm-form').onsubmit = e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    for (const k of ['lat', 'lon', 'area', 'water', 'nitrogen']) data[k] = +data[k];
    data.name = data.name.trim();
    data.region = data.region.trim();
    if (!data.name || !data.region) return toast('Enter a farm name and region.');
    if (data.lat !== f.lat || data.lon !== f.lon) {
      state.climate = structuredClone(SAMPLE_CLIMATE);
      state.earthObs = harmonizeEarthObservations(state.climate, 21, data.soil);
    }
    state.farm = {...f, ...data, boundary: data.lat === f.lat && data.lon === f.lon && data.area === f.area ? f.boundary : null, locationSource: data.lat === f.lat && data.lon === f.lon ? f.locationSource : 'Manual coordinates'};
    $('#modal').close();
    update();
    toast('Farm profile saved. Rotation recalculated.');
  };
}

function historyModal(entry = {}) {
  modal(entry.id ? 'Edit a farm memory' : 'Teach TerraLoop about a season.', 'Add what you remember. Leave anything uncertain blank.', `
    <form id="history-form">
      <div class="form-grid">
        ${field('Year (optional)', 'year', entry.year ?? '', 'number', 'min="2021" max="2026"')}
        ${select('Season (optional)', 'season', [['', 'Not sure'], ['wet', 'Kharif · Jun–Nov'], ['dry', 'Rabi · Dec–May']], entry.season || '')}
        ${select('Crop (optional)', 'crop', [['', 'Not sure'], ...CROPS.map(c => [c.id, c.name])], entry.crop || '')}
        ${field('Yield (t/ha, optional)', 'yield', entry.yield ?? '', 'number', 'min="0" max="100" step="0.1"')}
        ${select('Residue (optional)', 'residue', [['', 'Not sure'], ...Object.keys(RESIDUES).map(k => [k, k])], entry.residue || '')}
        ${field('Pest / disease (optional)', 'pest', entry.pest || '', 'text', 'maxlength="120"')}
        ${field('Fertilizer applied (kg/ha, optional)', 'fertilizer', entry.fertilizer ?? '', 'number', 'min="0" max="3000"')}
        ${field('Irrigation (mm, optional)', 'irrigation', entry.irrigation ?? '', 'number', 'min="0" max="10000"')}
      </div>
      <label>Notes / unusual weather (optional)<textarea name="notes" maxlength="800">${esc(entry.notes || '')}</textarea></label>
      <div class="modal-actions">
        ${entry.id ? '<button type="button" class="btn danger" id="delete-history">Remove memory</button>' : ''}
        <button class="btn" type="submit">Save memory</button>
      </div>
    </form>
  `);

  $('#history-form').onsubmit = e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    if (!Object.values(d).some(v => v.trim())) return toast('Add any detail you remember, or close to skip.');
    const h = {...d, id: entry.id || crypto.randomUUID(), source: state.exhibition ? 'Exhibition example' : 'Farmer entry', ...(state.exhibition ? {synthetic: true, harvestYear: (+d.year) + (d.season === 'dry' ? 1 : 0)} : {})};
    for (const k of ['year', 'yield', 'fertilizer', 'irrigation']) h[k] = d[k] === '' ? null : +d[k];
    if (entry.id) state.history = state.history.map(x => x.id === entry.id ? h : x);
    else state.history.push(h);
    $('#modal').close();
    update();
    toast('Farm memory saved.');
  };

  if ($('#delete-history')) $('#delete-history').onclick = () => {
    state.history = state.history.filter(h => h.id !== entry.id);
    $('#modal').close();
    update();
    toast('Memory removed.');
  };
}

function seasonModal(i) {
  const r = result.rows[i], c = crop(r.id);
  const attr = CROP_SOIL_ATTRIBUTES[c.id] || {};
  modal(`${c.name} · ${r.year} ${r.season === 'wet' ? 'Kharif' : 'Rabi'}`, 'The agronomic role this season plays in your farm’s future.', `
    <div class="season-detail">
      <div class="crop-detail-icon ${c.color}">${icon(c.icon, 42)}</div>
      <div>
        <span class="eyebrow">${c.family} · ${attr.coverType || 'Crop'}</span>
        <h3>${c.fix ? 'A biological nitrogen-fixing partner.' : c.id === 'fallow' ? 'Soil recovery and carbon preservation window.' : 'Part of a diversified rotation sequence.'}</h3>
        <p>${c.fix ? `Fixes up to ${c.fix} kg N/ha via symbiotic rhizobia root nodules, reducing synthetic urea requirements.` : `Deep root penetration (~${c.rootDepthMeters}m) aerates the subsoil and breaks plow pans.`}</p>
      </div>
    </div>
    <div class="detail-grid">
      <div><span>Estimated yield</span><b>${r.yield.toFixed(2)} t/ha</b></div>
      <div><span>Planned irrigation</span><b>${r.water.irrigation} mm</b></div>
      <div><span>Estimated net margin</span><b>৳${fmt(r.profit)} / ha</b></div>
      <div><span>Fertilizer N needed</span><b>${fmt(r.fertilizer)} kg N/ha</b></div>
      <div><span>Root penetration</span><b>${c.rootDepthMeters} m</b></div>
      <div><span>Forage value</span><b>${c.forage}</b></div>
    </div>
    <div class="detail-reasons">
      <h3>Transition benefits</h3>
      ${[['Nitrogen pairing', r.compat.nitrogen], ['Different pest hosts', r.compat.pest], ['Different disease hosts', r.compat.disease], ['Weed disruption proxy', r.compat.weed], ['Rooting diversity', r.compat.roots]].map(([n, v]) => `
        <span>${icon(v ? 'check' : 'info', 16)} ${n}: ${v ? 'modeled benefit' : 'no modeled bonus'}</span>
      `).join('')}
    </div>
    <p class="small muted">Residue: ${esc(state.farm.residue)} · Estimated residue N credit: ${r.retained.toFixed(1)} kg/ha. Modeled values support field exploration and require local extension verification.</p>
  `);
}

function feedbackModal() {
  modal('Close the loop.', 'Tell TerraLoop what actually happened this season to personalize future predictions.', `
    <form id="feedback-form">
      <div class="form-grid">
        ${select('Crop planted', 'crop', CROPS.filter(c => c.yield > 0).map(c => [c.id, c.name]), 'rice')}
        ${field('Harvest year', 'year', 2026, 'number', 'required min="2022" max="2100"')}
        ${field('Predicted yield (t/ha)', 'predicted', 4.8, 'number', 'required min="0.01" max="100" step="0.01"')}
        ${field('Actual yield (t/ha)', 'actual', '', 'number', 'required min="0" max="100" step="0.01"')}
        ${field('Pest or disease observed', 'pest', '', 'text', 'maxlength="120"')}
        ${select('Irrigation vs. expectation', 'irrigation', [['', 'Not recorded'], ['less', 'Less than expected'], ['same', 'As expected'], ['more', 'More than expected']], '')}
        ${select('Was the recommendation useful?', 'useful', [['', 'Not recorded'], ['yes', 'Yes'], ['partly', 'Partly'], ['no', 'No']], '')}
      </div>
      <p class="small muted">Yield feedback updates an exponentially weighted yield calibration multiplier for this crop on your farm.</p>
      <div class="modal-actions"><button class="btn" type="submit">Save outcome & update model</button></div>
    </form>
  `);

  $('#feedback-form').elements.crop.onchange = e => {
    $('#feedback-form').elements.predicted.value = (crop(e.target.value).yield * calibration(state.feedback, e.target.value)).toFixed(2);
  };

  $('#feedback-form').onsubmit = e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    f.predicted = +f.predicted;
    f.actual = +f.actual;
    f.year = +f.year;
    f.id = crypto.randomUUID();
    if (state.exhibition) { f.synthetic = true; f.source = 'Exhibition example'; }
    state.feedback.push(f);
    $('#modal').close();
    update();
    toast('Outcome saved. Farm yield estimates updated.');
  };
}

async function fetchClimate() {
  if (loading) return;
  loading = true;
  render();
  const location = {lat: state.farm.lat, lon: state.farm.lon};
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 45000);
  const powerUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR,T2M,T2M_MAX,T2M_MIN,GWETROOT,GWETPROF,ALLSKY_SFC_SW_DWN,WS2M,RH2M&community=AG&longitude=${location.lon}&latitude=${location.lat}&start=20210101&end=20251231&format=JSON`;
  const elevUrl = `https://api.open-meteo.com/v1/elevation?latitude=${location.lat}&longitude=${location.lon}`;

  try {
    const [powerRes, elevRes] = await Promise.all([
      fetch(powerUrl, {signal: controller.signal}),
      fetch(elevUrl, {signal: controller.signal}).catch(() => null)
    ]);
    if (!powerRes.ok) throw Error(`NASA service responded with ${powerRes.status}.`);
    const powerJson = await powerRes.json();
    const climate = parseEnhancedPower(powerJson);

    let elevation = 21;
    if (elevRes && elevRes.ok) {
      try {
        const edata = await elevRes.json();
        if (Array.isArray(edata.elevation) && Number.isFinite(edata.elevation[0])) {
          elevation = Math.round(edata.elevation[0]);
        }
      } catch {}
    }

    const earthObs = harmonizeEarthObservations(climate, elevation, state.farm.soil);
    if (location.lat !== state.farm.lat || location.lon !== state.farm.lon) {
      throw Error('Farm location changed. Reconnect for the new coordinates.');
    }
    state.climate = {...climate, lat: location.lat, lon: location.lon, url: powerUrl};
    state.earthObs = earthObs;
    recalc();
    save();
    toast('NASA Earth observations and SRTM terrain connected. Rotation recalculated.');
  } catch (e) {
    toast(e.name === 'AbortError' ? 'NASA request timed out. Your existing climate data is unchanged.' : `${e.message} Existing climate data is unchanged.`);
  } finally {
    clearTimeout(timer);
    loading = false;
    render();
  }
}

function exportPassport() {
  const som = simulateSoilOrganicMatter({startOM: SOIL_TEXTURE_INFO[state.farm.soil]?.typicalBaselineOM || 1.45, rows: result.rows, residue: state.farm.residue, soilType: state.farm.soil});
  const erosion = computeErosionRisk({annualRain: state.earthObs?.averages?.annualRain || 1400, soilType: state.farm.soil, cropId: result.rows[0]?.id || 'rice', residue: state.farm.residue});
  const report = {
    product: 'TerraLoop Decision-Support System',
    exported: new Date().toISOString(),
    exhibition: state.exhibition ? EXHIBITION_PROVENANCE : null,
    baselineName: baselineLabel(),
    comparison: state.simComparison,
    farm: state.farm,
    priority: state.priority,
    weights: state.weights,
    horizon: state.horizon,
    scenario: shock,
    confidence: confidence(),
    earthObservations: state.earthObs,
    climate: state.climate,
    history: state.history,
    feedback: state.feedback,
    soilHealth: {
      soilTexture: state.farm.soil,
      organicMatter: som,
      erosionRisk: erosion
    },
    rotation: result.rows,
    metrics: metrics(result.rows),
    baseline: metrics(baseline()),
    limitations: [
      'TerraLoop is a decision-support exploration tool, not an automated prescription.',
      'Illustrative crop and economic coefficients; requires local extension validation.',
      'NASA Earth observations represent gridded landscape averages; ground testing confirms field compaction and micronutrients.',
      'Water is constrained per two-season planning year; soil storage is a scenario estimate.',
      'Farm calibration is local to this device; regional pooled learning is a planned integration.'
    ]
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], {type: 'application/json'}));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'terraloop-resilience-passport.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Resilience passport exported with assumptions and provenance.');
}

window.addEventListener('hashchange', () => {
  const target = location.hash.slice(1);
  if (nav.some(n => n[0] === target) && page !== target) {
    page = target;
    render();
  }
});

if (exhibitionFarm(state.exhibition?.farmId)) {
  const scene = exhibitionScene(state, Math.max(0, Math.min(9, state.exhibition.step || 0)));
  const stored = state.exhibition.scenario;
  shock = stored && ['drought', 'flood', 'heat', 'custom'].includes(stored.type) && stored.year >= 2026 && stored.year <= 2025 + state.horizon ? stored : null;
  selectedYear = shock?.year || scene.selectedYear;
  selectedSeason = scene.selectedSeason;
  simState.cursor = scene.cursor;
}

page = nav.some(n => n[0] === location.hash.slice(1)) ? location.hash.slice(1) : 'overview';
recalc();
save();
render();

if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  const tools = [
    {
      name: 'read_rotation',
      description: 'Read the current TerraLoop rotation, soil health metrics, NASA assumptions, and summary without changing it.',
      inputSchema: {type: 'object', properties: {}, additionalProperties: false},
      annotations: {readOnlyHint: true, untrustedContentHint: true},
      execute(input) {
        if (input && Object.keys(input).length) throw Error('No parameters are accepted.');
        return {
          rows: result.rows,
          metrics: metrics(result.rows),
          climateSource: state.climate.source,
          confidence: confidence(),
          earthObservations: state.earthObs
        };
      }
    },
    {
      name: 'apply_climate_scenario',
      description: 'Apply a constructed drought, flood, heat, or custom scenario to a planning year and recalculate visible escape routes.',
      inputSchema: {
        type: 'object',
        properties: {
          type: {type: 'string', enum: ['drought', 'flood', 'heat', 'custom']},
          year: {type: 'integer', minimum: 2026, maximum: 2030}
        },
        required: ['type', 'year'],
        additionalProperties: false
      },
      annotations: {readOnlyHint: false, untrustedContentHint: false},
      execute(input) {
        if (!input || Object.keys(input).some(k => !['type', 'year'].includes(k))) throw Error('Only type and year are accepted.');
        applyShock(input.type, input.year);
        navigate('climate');
        return {scenario: shock, metrics: metrics(result.rows)};
      }
    }
  ];
  for (const t of tools) {
    try { Promise.resolve(document.modelContext.registerTool(t, {signal: lifecycle.signal})).catch(() => {}); } catch {}
  }
  window.addEventListener('pagehide', () => lifecycle.abort(), {once: true});
}
