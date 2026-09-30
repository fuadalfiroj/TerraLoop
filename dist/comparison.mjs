import {crop, CROPS, slot, optimize, simulateSequence, metrics} from './engine.mjs';

export const MAX_VISIBLE = 4;
export const MAX_CUSTOM = 4;
export const PLAN_COLORS = ['#59885e', '#c39548', '#678eac', '#ac718a', '#829545', '#8a7dba', '#479c99', '#b78159'];
const PRESETS = ['adaptive', 'original', 'rice-maize', 'water'];

// Normalize saved preferences without changing a farmer's chosen crop sequence.
// Missing future seasons are extended from the current normal plan.
export function normalizeComparison(value, fallbackIds) {
  const custom = [];
  for (const item of (Array.isArray(value?.custom) ? value.custom : []).slice(0, MAX_CUSTOM)) {
    if (!/^custom-[a-z0-9-]{1,50}$/.test(item?.id) || custom.some(p => p.id === item.id)) continue;
    custom.push({id:item.id, name:String(item.name || 'My rotation').trim().slice(0, 48) || 'My rotation',
      crops:Array.from({length:Math.max(fallbackIds.length, Math.min(10, Array.isArray(item.crops)?item.crops.length:0))}, (_, i) => crop(item.crops?.[i]) ? item.crops[i] : fallbackIds[i] || 'fallow')});
  }
  const known = new Set([...PRESETS, ...custom.map(p => p.id)]);
  let selected = [...new Set(Array.isArray(value?.selected) ? value.selected : ['adaptive', 'rice-maize'])]
    .filter(id => known.has(id)).slice(0, MAX_VISIBLE);
  if (!selected.length) selected = ['adaptive'];
  return {custom, selected, reference:selected.includes(value?.reference) ? value.reference : selected[0]};
}

export function selectableCrops(farm, index) {
  return CROPS.filter(c => c.soils.includes(farm.soil) && c.seasons.includes(slot(index).season));
}

export function auditRotation(rows, farm) {
  const issues = [], annual = new Map();
  for (const row of rows) {
    const c = crop(row.id), season = row.season === 'wet' ? 'Kharif' : 'Rabi';
    if (!c.soils.includes(farm.soil)) issues.push(`${row.year} ${season}: ${c.name} is outside this model’s ${farm.soil}-soil crop pool.`);
    if (!c.seasons.includes(row.season)) issues.push(`${row.year} ${season}: ${c.name} is outside its modeled season.`);
    annual.set(row.year, (annual.get(row.year) || 0) + row.water.irrigation);
  }
  for (const [year, water] of annual) {
    if (water > farm.water) issues.push(`${year}: ${Math.round(water)} mm irrigation needed, ${Math.round(water - farm.water)} mm above the annual budget.`);
  }
  return {issues, annual:[...annual].map(([year,water]) => ({year,water})), feasible:issues.length === 0};
}

export function comparisonPlans(config, args) {
  const {normalRows, adaptiveRows, shock, ...model} = args;
  const fixed = ids => simulateSequence(ids, {...model, shock});
  const waterRows = optimize({...model, priority:'water', shock:null}).rows;
  const library = [
    {id:'adaptive', name:'TerraLoop adaptive', kind:'Adaptive', description:'Replans future crops after a disruption.', rows:adaptiveRows},
    {id:'original', name:'Original plan', kind:'Fixed', description:'Your normal plan, with its crops held fixed.', rows:fixed(normalRows.map(r => r.id))},
    {id:'rice-maize', name:'Rice → maize', kind:'Benchmark', description:'The same rice–maize pair repeated each year.', rows:fixed(normalRows.map((_,i) => i % 2 ? 'maize' : 'rice'))},
    {id:'water', name:'Water-saving plan', kind:'Fixed', description:'A water-priority plan, with its crops held fixed.', rows:fixed(waterRows.map(r => r.id))},
    ...config.custom.map(p => ({...p, kind:'Custom', description:'Your crop choices, held fixed under stress.', rows:fixed(p.crops.slice(0,normalRows.length))}))
  ].map((p, i) => ({...p, color:PLAN_COLORS[i], summary:metrics(p.rows), audit:auditRotation(p.rows, model.farm)}));
  return {library, visible:config.selected.map(id => library.find(p => p.id === id)).filter(p => p?.rows.length)};
}

export function comparisonSeries(rows, farm, metric) {
  let value = metric === 'nitrogen' ? farm.nitrogen : 0;
  return [value, ...rows.map(row => {
    value = metric === 'nitrogen' ? row.nitrogen : value + (metric === 'income' ? row.profit * farm.area : row.water.irrigation * farm.area * 10);
    return value;
  })];
}

export function relativeChange(value, reference) {
  if (!Number.isFinite(value) || !Number.isFinite(reference)) return null;
  if (reference === 0) return value === 0 ? 0 : null;
  return (value - reference) / Math.abs(reference) * 100;
}
