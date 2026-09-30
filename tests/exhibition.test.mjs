import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {EXHIBITION_FARMS,EXHIBITION_STEPS,EXHIBITION_BACKUP_KEY,makeExhibitionState,exhibitionBaselineIds,exhibitionScene,exhibitionBundle,stageExhibition,restoreExhibitionBackup} from '../dist/exhibition-data.mjs';
import {exhibitionHTML,exhibitionChrome} from '../dist/exhibition-ui.mjs';
import {crop,slot,optimize,simulateSequence,metrics,DEFAULT_FARM,DEFAULT_HISTORY,SAMPLE_CLIMATE} from '../dist/engine.mjs';
import {polygonAreaHa,polygonCenter,validateBoundary} from '../dist/geo.mjs';
import {normalizeComparison,comparisonPlans,auditRotation} from '../dist/comparison.mjs';
const original=()=>({version:1,farm:{...DEFAULT_FARM,name:'My original farm'},history:structuredClone(DEFAULT_HISTORY),climate:structuredClone(SAMPLE_CLIMATE),feedback:[],horizon:3,priority:'water'});
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};};

test('three distinct farm stories contain complete, linked five-year histories',()=>{
  assert.equal(EXHIBITION_FARMS.length,3);
  assert.equal(new Set(EXHIBITION_FARMS.map(p=>p.state.farm.soil)).size,3);
  assert.equal(new Set(EXHIBITION_FARMS.map(p=>p.scenario.type)).size,3);
  for(const p of EXHIBITION_FARMS){
    const s=p.state;assert.equal(s.history.length,10);assert.equal(s.feedback.length,6);
    assert.equal(new Set(s.history.map(h=>h.id)).size,10);
    assert.deepEqual([...new Set(s.history.map(h=>h.year))],[2021,2022,2023,2024,2025]);
    for(const h of s.history){assert.ok(crop(h.crop));assert.ok(h.synthetic);assert.equal(h.source,'Exhibition example');assert.equal(h.harvestYear,h.year+(h.season==='dry'?1:0));}
    for(const f of s.feedback){const h=s.history.find(h=>h.id===f.historyId);assert.ok(h);assert.equal(f.actual,h.yield);assert.equal(f.crop,h.crop);assert.equal(f.pest,h.pest);assert.equal(f.year,h.year);assert.equal(f.season,h.season);assert.ok(f.predicted>0);}
    assert.equal(s.climate.synthetic,true);assert.equal(s.climate.source,'sample');
    assert.equal(s.climate.wetRain,Math.round(s.climate.years.reduce((n,y)=>n+y.wetRain,0)/5*.65));
    assert.equal(s.climate.dryRain,Math.round(s.climate.years.reduce((n,y)=>n+y.dryRain,0)/5*.65));
    assert.ok(s.climate.years.every(y=>y.rain===y.wetRain+y.dryRain));
  }
  const rice=makeExhibitionState().feedback.find(f=>f.crop==='rice'&&f.year===2024);
  assert.ok(Math.abs((rice.actual-rice.predicted)/rice.predicted*100+12.5)<1e-9);
});
test('mapped parcels have valid outlines, measured areas, and matching centres',()=>{
  for(const p of EXHIBITION_FARMS){const f=p.state.farm;assert.equal(validateBoundary(f.boundary),null);assert.ok(Math.abs(polygonAreaHa(f.boundary)-f.area)<.00051);assert.deepEqual(polygonCenter(f.boundary),[f.lat,f.lon]);}
});
for(const p of EXHIBITION_FARMS)test(`${p.id}: planner, comparison, water wallet, and passport share their inputs`,()=>{
  const s=makeExhibitionState(p.id),normal=optimize(s).rows,shock={type:p.scenario.type,year:p.scenario.year};
  const prefix=normal.slice(0,(shock.year-2026)*2),adaptive=optimize({...s,shock,prefix}).rows;
  assert.equal(adaptive.length,10);assert.deepEqual(adaptive.slice(0,prefix.length),prefix);
  assert.equal(auditRotation(normal,s.farm).feasible,true);assert.equal(auditRotation(adaptive,s.farm).feasible,true);
  const config=normalizeComparison(s.simComparison,normal.map(r=>r.id));
  const comparisons=comparisonPlans(config,{...s,normalRows:normal,adaptiveRows:adaptive,shock});
  assert.equal(comparisons.visible.length,3);
  assert.deepEqual(comparisons.visible[0].summary,metrics(adaptive));
  assert.deepEqual(comparisons.visible[1].rows,simulateSequence(exhibitionBaselineIds(s),{...s,shock}));
  for(const plan of s.simComparison.custom)plan.crops.forEach((id,i)=>{assert.ok(crop(id).seasons.includes(slot(i).season));assert.ok(crop(id).soils.includes(s.farm.soil));});
  assert.ok(adaptive.filter(r=>r.year===shock.year).some(r=>r.id!==normal[r.index].id),'curated disruption changes the plan');
  assert.ok(comparisons.visible.every(p=>Object.values(p.summary).every(v=>typeof v!=='number'||Number.isFinite(v))));
});
test('scene navigation sets one shared stress scenario and aligns playback to the selected season',()=>{
  assert.equal(EXHIBITION_STEPS.reduce((n,s)=>n+s.seconds,0),160);
  for(const p of EXHIBITION_FARMS){const state=makeExhibitionState(p.id);
    for(let i=0;i<10;i++){const scene=exhibitionScene(state,i);assert.equal(scene.page,EXHIBITION_STEPS[i].page);assert.equal(scene.scenario?.type||null,i>=5?p.scenario.type:null);if(i>=5){assert.equal(slot(scene.selectedSeason).year,p.scenario.year);assert.equal(slot(scene.selectedSeason).season,p.scenario.season);assert.equal(Math.floor(scene.cursor),scene.selectedSeason);}}
  }
});
test('switching and restarting stories preserve the original workspace and restore it exactly',()=>{
  const store=storage(),before=original();let loaded=stageExhibition(store,before,'padma');
  loaded.farm.water=77;loaded=stageExhibition(store,loaded,'dharla');loaded=stageExhibition(store,loaded,'dharla');
  assert.deepEqual(JSON.parse(store.getItem(EXHIBITION_BACKUP_KEY)),before);
  assert.deepEqual(restoreExhibitionBackup(store),before);
  assert.deepEqual(JSON.parse(store.getItem('terraloop-v1')),before);
  assert.equal(makeExhibitionState('padma').farm.water,650);
  const copy=exhibitionBundle();copy.farms[0].state.history[0].yield=100;assert.notEqual(makeExhibitionState().history[0].yield,100);
});
test('invalid backup or failed storage never overwrites a valid current farm',()=>{
  const store=storage();store.setItem('terraloop-v1','untouched');store.setItem(EXHIBITION_BACKUP_KEY,'{}');
  assert.throws(()=>restoreExhibitionBackup(store),/invalid/);assert.equal(store.getItem('terraloop-v1'),'untouched');
  assert.throws(()=>stageExhibition({setItem(){throw Error('Storage full');}},original(),'padma'),/Storage full/);
  assert.throws(()=>makeExhibitionState('unknown'),/Unknown/);
});
test('the studio and guide disclose synthetic data and expose recording controls',()=>{
  const s=makeExhibitionState();const html=exhibitionHTML(s);assert.match(html,/synthetic examples/);assert.match(html,/Restore my previous farm/);
  assert.equal((html.match(/data-load-exhibition=/g)||[]).length,3);
  assert.match(exhibitionChrome(s,'learning'),/4.8 predicted versus 4.2 actual/);
  assert.equal(exhibitionChrome(s,'exhibition'),'');s.exhibition.guide=false;
  assert.match(exhibitionChrome(s,'overview'),/Show guide/);assert.doesNotMatch(exhibitionChrome(s,'overview'),/id="exhibit-scene-select"/);
});
test('the portable dataset matches the collection loaded by the application',()=>{
  assert.deepEqual(JSON.parse(readFileSync(new URL('../dist/data/exhibition-farms.json',import.meta.url),'utf8')),exhibitionBundle());
});
