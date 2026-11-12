// Transparent agronomic modeling coefficients; intended for decision-support exploration with local extension advice.
// Integrates crop characteristics, soil attributes, and multi-criteria farmer priority weights.

export const CROPS = [
  {id:'rice', name:'Aman rice', family:'Poaceae', seasons:['wet'], soils:['clay','loam'], water:760, yield:4.8, price:29000, cost:79000, uptake:105, fix:0, residue:23, canopy:8, root:1, pests:['stem borer'], diseases:['blast'], drought:.52, flood:.16, heat:.28, color:'olive', icon:'wheat', forage:'Medium (straw)', erosionControl:8, organicMatterBio:2.8, rootDepthMeters:0.45, frostTolerance:10, marketRisk:'Low', coverCrop:false, droughtTolerance:1, floodTolerance:5, heatTolerance:3, soilStructureBonus:4},
  {id:'maize', name:'Maize', family:'Poaceae', seasons:['dry'], soils:['loam','sandy'], water:580, yield:8.2, price:25000, cost:102000, uptake:145, fix:0, residue:25, canopy:7, root:2, pests:['stem borer','armyworm'], diseases:['fusarium'], drought:.46, flood:.58, heat:.35, color:'gold', icon:'wheat', forage:'High (stover/silage)', erosionControl:6, organicMatterBio:3.4, rootDepthMeters:1.10, frostTolerance:6, marketRisk:'Medium', coverCrop:false, droughtTolerance:2, floodTolerance:1, heatTolerance:3, soilStructureBonus:6},
  {id:'lentil', name:'Lentil', family:'Fabaceae', seasons:['dry'], soils:['loam','clay'], water:290, yield:1.5, price:94000, cost:55000, uptake:70, fix:58, residue:16, canopy:5, root:1, pests:['aphid'], diseases:['root rot'], drought:.16, flood:.62, heat:.32, color:'coral', icon:'sprout', forage:'High (haulm)', erosionControl:7, organicMatterBio:1.2, rootDepthMeters:0.60, frostTolerance:3, marketRisk:'Low', coverCrop:false, droughtTolerance:4, floodTolerance:1, heatTolerance:2, soilStructureBonus:8},
  {id:'mung', name:'Mung bean', family:'Fabaceae', seasons:['dry','wet'], soils:['loam','sandy'], water:320, yield:1.45, price:90000, cost:53000, uptake:65, fix:55, residue:17, canopy:7, root:1, pests:['aphid','pod borer'], diseases:['root rot'], drought:.20, flood:.55, heat:.20, color:'green', icon:'sprout', forage:'High (biomass)', erosionControl:8, organicMatterBio:1.4, rootDepthMeters:0.55, frostTolerance:8, marketRisk:'Medium', coverCrop:true, droughtTolerance:4, floodTolerance:2, heatTolerance:4, soilStructureBonus:8},
  {id:'mustard', name:'Mustard', family:'Brassicaceae', seasons:['dry'], soils:['loam','clay'], water:280, yield:1.7, price:68000, cost:49000, uptake:75, fix:0, residue:15, canopy:6, root:2, pests:['aphid'], diseases:['alternaria'], drought:.22, flood:.6, heat:.34, color:'gold', icon:'flower', forage:'Medium (oilcake)', erosionControl:7, organicMatterBio:1.8, rootDepthMeters:0.85, frostTolerance:2, marketRisk:'Medium', coverCrop:false, droughtTolerance:4, floodTolerance:1, heatTolerance:2, soilStructureBonus:7},
  {id:'sesame', name:'Sesame', family:'Pedaliaceae', seasons:['wet'], soils:['loam','sandy'], water:350, yield:1.2, price:105000, cost:49000, uptake:60, fix:0, residue:12, canopy:5, root:2, pests:['leaf roller'], diseases:['phyllody'], drought:.15, flood:.68, heat:.19, color:'coral', icon:'flower', forage:'Low', erosionControl:6, organicMatterBio:1.1, rootDepthMeters:0.90, frostTolerance:12, marketRisk:'Medium-High', coverCrop:false, droughtTolerance:5, floodTolerance:1, heatTolerance:4, soilStructureBonus:6},
  {id:'jute', name:'Jute', family:'Malvaceae', seasons:['wet'], soils:['loam','clay'], water:620, yield:2.7, price:54000, cost:80000, uptake:90, fix:0, residue:20, canopy:9, root:2, pests:['hairy caterpillar'], diseases:['stem rot'], drought:.35, flood:.3, heat:.15, color:'green', icon:'leaf', forage:'Low', erosionControl:9, organicMatterBio:2.9, rootDepthMeters:1.40, frostTolerance:12, marketRisk:'Medium', coverCrop:false, droughtTolerance:2, floodTolerance:4, heatTolerance:5, soilStructureBonus:9},
  {id:'wheat', name:'Wheat', family:'Poaceae', seasons:['dry'], soils:['loam','clay'], water:440, yield:3.6, price:34000, cost:66000, uptake:100, fix:0, residue:20, canopy:7, root:1, pests:['aphid','armyworm'], diseases:['fusarium'], drought:.3, flood:.58, heat:.52, color:'gold', icon:'wheat', forage:'Medium (bhusa)', erosionControl:7, organicMatterBio:2.2, rootDepthMeters:0.80, frostTolerance:2, marketRisk:'Low', coverCrop:false, droughtTolerance:3, floodTolerance:1, heatTolerance:1, soilStructureBonus:6},
  {id:'chickpea', name:'Chickpea', family:'Fabaceae', seasons:['dry'], soils:['loam','clay'], water:260, yield:1.6, price:82000, cost:52000, uptake:70, fix:52, residue:14, canopy:5, root:2, pests:['pod borer'], diseases:['root rot'], drought:.12, flood:.64, heat:.28, color:'coral', icon:'sprout', forage:'High', erosionControl:7, organicMatterBio:1.3, rootDepthMeters:0.95, frostTolerance:3, marketRisk:'Low', coverCrop:false, droughtTolerance:5, floodTolerance:1, heatTolerance:3, soilStructureBonus:8},
  {id:'potato', name:'Potato', family:'Solanaceae', seasons:['dry'], soils:['loam','sandy'], water:520, yield:22, price:14000, cost:192000, uptake:125, fix:0, residue:8, canopy:8, root:1, pests:['cutworm'], diseases:['late blight'], drought:.4, flood:.65, heat:.5, color:'purple', icon:'leaf', forage:'None', erosionControl:4, organicMatterBio:0.9, rootDepthMeters:0.40, frostTolerance:1, marketRisk:'High', coverCrop:false, droughtTolerance:2, floodTolerance:1, heatTolerance:1, soilStructureBonus:3},
  {id:'sorghum', name:'Sorghum', family:'Poaceae', seasons:['wet'], soils:['loam','sandy','clay'], water:400, yield:3.5, price:28000, cost:46000, uptake:85, fix:0, residue:24, canopy:8, root:3, pests:['stem borer','armyworm'], diseases:['anthracnose'], drought:.13, flood:.5, heat:.12, color:'olive', icon:'wheat', forage:'High (fodder)', erosionControl:9, organicMatterBio:3.6, rootDepthMeters:1.80, frostTolerance:8, marketRisk:'Medium', coverCrop:false, droughtTolerance:5, floodTolerance:2, heatTolerance:5, soilStructureBonus:9},
  {id:'fallow', name:'Rest & cover', family:'Rest', seasons:['wet','dry'], soils:['loam','clay','sandy'], water:0, yield:0, price:0, cost:12000, uptake:0, fix:0, residue:8, canopy:4, root:0, pests:[], diseases:[], drought:0, flood:0, heat:0, color:'neutral', icon:'leaf', forage:'None', erosionControl:2, organicMatterBio:0.2, rootDepthMeters:0.00, frostTolerance:0, marketRisk:'None', coverCrop:true, droughtTolerance:5, floodTolerance:5, heatTolerance:5, soilStructureBonus:1}
];

export const crop = id => CROPS.find(c => c.id === id);

export const DEFAULT_FARM = {
  name: 'Padma River Farm',
  region: 'Rajshahi',
  lat: 24.3745,
  lon: 88.6042,
  area: 2.4,
  soil: 'loam',
  water: 650,
  nitrogen: 80,
  residue: 'mulch'
};

export const DEFAULT_HISTORY = [
  {id:'h1', year:2022, season:'wet', crop:'rice', yield:4.4, residue:'remove', pest:'stem borer', source:'Sample entry'},
  {id:'h2', year:2023, season:'dry', crop:'maize', yield:7.1, residue:'burn', source:'Sample entry'},
  {id:'h3', year:2023, season:'wet', crop:'rice', residue:'remove', source:'Sample entry'},
  {id:'h4', year:2024, season:'dry', crop:'wheat', yield:3.2, residue:'mulch', source:'Sample entry'},
  {id:'h5', year:2025, season:'wet', crop:'rice', yield:4.2, residue:'incorporate', pest:'stem borer', source:'Sample entry'}
];

export const SAMPLE_CLIMATE = {
  source: 'sample',
  wetRain: 480,
  dryRain: 110,
  temperature: 27.1,
  years: [
    {year: 2021, rain: 1460, temp: 26.6, tMax: 32.4, tMin: 20.1, solar: 18.2, rootMoistWet: 0.68, rootMoistDry: 0.35, profileMoist: 0.51, heatDays: 14, frostDays: 0, extremeRainDays: 4, highWindDays: 10},
    {year: 2022, rain: 1170, temp: 27.1, tMax: 33.8, tMin: 20.6, solar: 19.1, rootMoistWet: 0.58, rootMoistDry: 0.28, profileMoist: 0.44, heatDays: 22, frostDays: 1, extremeRainDays: 3, highWindDays: 14, event: 'Barind dry spell'},
    {year: 2023, rain: 1570, temp: 27.4, tMax: 33.2, tMin: 21.4, solar: 17.9, rootMoistWet: 0.72, rootMoistDry: 0.38, profileMoist: 0.56, heatDays: 16, frostDays: 0, extremeRainDays: 6, highWindDays: 9},
    {year: 2024, rain: 1340, temp: 27.7, tMax: 34.6, tMin: 21.0, solar: 18.8, rootMoistWet: 0.62, rootMoistDry: 0.30, profileMoist: 0.46, heatDays: 28, frostDays: 0, extremeRainDays: 4, highWindDays: 16, event: 'Extended April heatwave'},
    {year: 2025, rain: 1430, temp: 27.2, tMax: 33.0, tMin: 20.8, solar: 18.4, rootMoistWet: 0.66, rootMoistDry: 0.34, profileMoist: 0.49, heatDays: 18, frostDays: 0, extremeRainDays: 5, highWindDays: 11}
  ]
};

export const RESIDUES = {remove:0, burn:.03, incorporate:.75, mulch:.55, compost:.65, livestock:.08};

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

export const slot = i => ({
  year: 2026 + Math.floor(i / 2),
  season: i % 2 ? 'dry' : 'wet',
  label: i % 2 ? 'Rabi · Dec–May' : 'Kharif · Jun–Nov'
});

export function calibration(feedback, id) {
  const items = feedback.filter(f => f.crop === id && f.predicted > 0 && Number.isFinite(f.actual) && f.actual >= 0);
  return items.reduce((v, f) => clamp(v * 0.75 + clamp(f.actual / f.predicted, 0.4, 1.4) * 0.25, 0.55, 1.25), 1);
}

export function waterBudget(c, farm, climate, season, shock) {
  let rain = season === 'wet' ? climate.wetRain : climate.dryRain;
  if (shock?.type === 'drought') rain *= 0.35;
  if (shock?.type === 'flood') rain *= 1.35;
  if (shock?.rainFactor != null && Number.isFinite(shock.rainFactor)) rain *= shock.rainFactor;

  let demand = c.water * (shock?.type === 'heat' ? 1.16 : 1);
  if (shock?.tempDelta && Number.isFinite(shock.tempDelta)) demand *= (1 + shock.tempDelta * 0.035);

  const soil = c.id === 'fallow' ? 0 : (farm.residue === 'mulch' ? 65 : 45);
  return {
    rain: Math.round(rain),
    soil,
    demand: Math.round(demand),
    irrigation: Math.ceil(Math.max(0, demand - rain - soil))
  };
}

export function eligible(farm, season, climate, shock, remaining = farm.water) {
  return CROPS.filter(c => c.soils.includes(farm.soil) && c.seasons.includes(season) && waterBudget(c, farm, climate, season, shock).irrigation <= remaining);
}

export function transition(a, b) {
  if (!a) return {nitrogen:0, pest:0, disease:0, weed:0, roots:0, score:0};
  const rest = b.id === 'fallow';
  const pest = !b.pests.some(p => a.pests.includes(p));
  const disease = !b.diseases.some(d => a.diseases.includes(d));
  const nitrogen = a.fix > 0 && b.uptake > 80 ? 12 : 0;
  const weed = a.family !== b.family ? 8 : 0;
  const roots = a.root !== b.root ? 4 : 0;
  return {
    nitrogen,
    pest: pest ? 8 : 0,
    disease: disease ? 8 : 0,
    weed,
    roots,
    score: nitrogen + (pest ? 8 : -8) + (disease ? 8 : -8) + weed + roots - (a.family === b.family ? 18 : 0) - (rest ? 20 : 0)
  };
}

export function simulateCrop(c, farm, climate, feedback, i, prev, n, shock) {
  const active = shock && shock.year === slot(i).year ? shock : null;
  const water = waterBudget(c, farm, climate, slot(i).season, active);
  const compat = transition(prev, c);
  let loss = 0;
  if (active?.type && c[active.type] != null) {
    loss = c[active.type] * 0.8;
  } else if (active?.tempDelta || active?.rainFactor) {
    const droughtSens = active.rainFactor < 0.7 ? c.drought * (1 - active.rainFactor) : 0;
    const heatSens = active.tempDelta > 1.5 ? c.heat * (active.tempDelta / 4) : 0;
    loss = Math.min(0.85, (droughtSens + heatSens) * 0.8);
  }
  const production = c.yield * calibration(feedback, c.id) * (1 - loss) * (prev?.family === c.family ? 0.95 : 1);
  const retained = c.residue * (RESIDUES[farm.residue] ?? 0);
  const fertilizer = Math.max(0, c.uptake - c.fix - Math.max(0, n - 35));
  const next = clamp(n + fertilizer + c.fix + retained - c.uptake - 9, 0, 180);
  const profit = production * c.price - c.cost - fertilizer * 27 - water.irrigation * 18;
  return {
    id: c.id,
    ...slot(i),
    index: i,
    water,
    loss,
    yield: production,
    profit,
    nitrogen: next,
    nitrogenDelta: next - n,
    fertilizer,
    retained,
    compat,
    shock: active?.type || (loss > 0 ? 'climate-stress' : null)
  };
}

function previousCrop(history) {
  return crop(
    history
      .filter(h => crop(h.crop) && Number.isFinite(h.year))
      .sort((a, b) => a.year - b.year || (['wet', 'dry'].indexOf(a.season) - ['wet', 'dry'].indexOf(b.season)))
      .at(-1)?.crop
  );
}

export function optimize({
  farm = DEFAULT_FARM,
  history = [],
  feedback = [],
  climate = SAMPLE_CLIMATE,
  priority = 'balanced',
  horizon = 5,
  shock = null,
  prefix = [],
  weights = null
} = {}) {
  let beam = [{rows: [], score: 0, n: farm.nitrogen, used: 0, prev: previousCrop(history)}];
  let examined = 0;

  for (let i = 0; i < horizon * 2; i++) {
    const next = [];
    for (const path of beam) {
      const used = i % 2 ? path.used : 0;
      const s = slot(i);
      const active = shock?.year === s.year ? shock : null;
      let pool = eligible(farm, s.season, climate, active, farm.water - used);
      if (prefix[i]) pool = pool.filter(c => c.id === prefix[i].id);

      for (const c of pool) {
        examined++;
        const r = simulateCrop(c, farm, climate, feedback, i, path.prev, path.n, shock);
        const repeats = path.rows.filter(x => x.id === c.id).length;

        // Multi-criteria scoring
        let score;
        if (weights) {
          // Dynamic weights (0 to 100 each)
          const wProfit = (weights.profit ?? 50) / 50;
          const wWater = (weights.water ?? 50) / 50;
          const wSoil = (weights.soilHealth ?? 50) / 50;
          const wDiversity = (weights.diversity ?? 50) / 50;
          const wErosion = (weights.erosionRisk ?? 50) / 50;

          score = (r.profit / 3000) * wProfit
                + r.compat.score * 1.2 * wDiversity
                - (r.water.irrigation * 0.05) * wWater
                - r.loss * 100
                + (c.fix > 0 ? 12 : 0) * wSoil
                + ((c.soilStructureBonus || 5) * 1.5) * wSoil
                + ((c.erosionControl || 5) * 1.2) * wErosion
                - repeats * 7
                - (c.id === 'fallow' ? 22 : 0);
        } else if (priority === 'soil_health') {
          score = (r.profit / 4500)
                + r.compat.score * 1.8
                - (r.water.irrigation * 0.04)
                - r.loss * 100
                + (c.fix > 0 ? 20 : 0)
                + ((c.soilStructureBonus || 5) * 3)
                + ((c.erosionControl || 5) * 2)
                - repeats * 9
                - (c.id === 'fallow' ? 15 : 0);
        } else if (priority === 'climate_resilience') {
          score = (r.profit / 3500)
                + r.compat.score * 1.5
                - (r.water.irrigation * 0.12)
                - r.loss * 180
                + ((c.droughtTolerance || 3) * 4)
                + (c.fix > 0 ? 10 : 0)
                - repeats * 8
                - (c.id === 'fallow' ? 20 : 0);
        } else {
          // Backward-compatible default formula for 'balanced', 'profit', 'water'
          score = r.profit / (priority === 'profit' ? 1600 : 3500)
                + r.compat.score * (priority === 'balanced' ? 1.4 : 0.8)
                - r.water.irrigation * (priority === 'water' ? 0.17 : 0.025)
                - r.loss * 100
                + (c.fix > 0 ? 9 : 0)
                - repeats * 7
                - (c.id === 'fallow' ? 22 : 0);
        }

        next.push({
          rows: [...path.rows, r],
          score: path.score + score,
          n: r.nitrogen,
          used: used + r.water.irrigation,
          prev: c
        });
      }
    }
    beam = next.sort((a, b) => b.score - a.score).slice(0, 64);
    if (!beam.length) return {rows: [], examined, infeasible: true};
  }
  return {rows: beam[0].rows, examined, infeasible: false};
}

export function simulateSequence(ids, {farm, climate, feedback = [], history = [], shock = null}) {
  let n = farm.nitrogen, prev = previousCrop(history);
  return ids.map((id, i) => {
    const r = simulateCrop(crop(id), farm, climate, feedback, i, prev, n, shock);
    n = r.nitrogen;
    prev = crop(id);
    return r;
  });
}

export function metrics(rows) {
  return {
    water: Math.round(rows.reduce((v, r) => v + r.water.irrigation, 0)),
    profit: Math.round(rows.reduce((v, r) => v + r.profit, 0)),
    families: new Set(rows.filter(r => r.id !== 'fallow').map(r => crop(r.id).family)).size,
    pest: rows.filter(r => r.compat.pest > 0).length,
    disease: rows.filter(r => r.compat.disease > 0).length,
    weed: rows.filter(r => r.compat.weed > 0).length,
    nitrogen: Math.round(rows.at(-1)?.nitrogen || 0),
    worstLoss: Math.round(Math.max(0, ...rows.map(r => r.loss)) * 100),
    retained: Math.round(rows.reduce((v, r) => v + r.retained, 0))
  };
}

export function parsePower(data) {
  const p = data?.properties?.parameter;
  if (!p?.PRECTOTCORR || !p?.T2M) throw Error('NASA returned an incomplete rainfall or temperature series.');
  const years = new Map();
  let wet = 0, dry = 0, wetDays = 0, dryDays = 0, temp = 0, tempN = 0;
  for (const [date, value] of Object.entries(p.PRECTOTCORR)) {
    if (!/^\d{8}$/.test(date) || !Number.isFinite(value) || value < 0) continue;
    const year = +date.slice(0, 4), month = +date.slice(4, 6);
    if (!years.has(year)) years.set(year, {year, rain: 0, temp: 0, count: 0, rainDays: 0});
    const y = years.get(year);
    y.rain += value;
    y.rainDays++;
    if (month >= 6 && month <= 11) {
      wet += value;
      wetDays++;
    } else {
      dry += value;
      dryDays++;
    }
    const t = p.T2M[date];
    if (Number.isFinite(t) && t > -90 && t < 65) {
      y.temp += t;
      y.count++;
      temp += t;
      tempN++;
    }
  }
  if (wetDays < 150 || dryDays < 150 || tempN < 300) throw Error('Not enough valid observations for a seasonal summary.');
  const list = [...years.values()]
    .filter(y => y.rainDays >= 330 && y.count >= 330)
    .map(y => ({year: y.year, rain: Math.round(y.rain), temp: +(y.temp / y.count).toFixed(1)}));
  if (!list.length) throw Error('No complete historical year was returned.');
  return {
    source: 'NASA POWER',
    wetRain: Math.round((wet / wetDays) * 183 * 0.65),
    dryRain: Math.round((dry / dryDays) * 182 * 0.65),
    temperature: +(temp / tempN).toFixed(1),
    years: list,
    retrieved: new Date().toISOString()
  };
}
