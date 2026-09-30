import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeComparison,comparisonPlans,auditRotation,selectableCrops,comparisonSeries,relativeChange} from '../dist/comparison.mjs';
import {growthStage,simulationFrame} from '../dist/simulation-model.mjs';
import {DEFAULT_FARM,DEFAULT_HISTORY,SAMPLE_CLIMATE,optimize,simulateSequence} from '../dist/engine.mjs';

const args={farm:DEFAULT_FARM,history:DEFAULT_HISTORY,climate:SAMPLE_CLIMATE,horizon:5};
const normalRows=optimize(args).rows, ids=normalRows.map(r=>r.id);
test('fixed comparisons and optimizer use the same latest dated crop even with unsorted memory',()=>{
  const history=[{year:2025,season:'wet',crop:'mung'},{year:2023,season:'wet',crop:'rice'},{crop:'maize'}];
  const settings={...args,history};const plan=optimize(settings).rows;
  assert.deepEqual(simulateSequence(plan.map(r=>r.id),settings),plan);
});
test('comparison preferences retain valid unique plans, enforce 1–4 visible and recover invalid data',()=>{
  const config=normalizeComparison({selected:['missing','adaptive','adaptive','original','rice-maize','water','custom-one'],reference:'missing',custom:[{id:'custom-one',name:'My plan',crops:['invalid']},{id:'<script>',crops:ids}]},ids);
  assert.deepEqual(config.selected,['adaptive','original','rice-maize','water']);assert.equal(config.reference,'adaptive');
  assert.equal(config.custom.length,1);assert.deepEqual(config.custom[0].crops,ids);
  assert.deepEqual(normalizeComparison({selected:[]},ids).selected,['adaptive']);
});
test('shorter horizons do not erase saved future crop choices; comparisons stay aligned',()=>{
  const chosen=ids.map((id,i)=>i===8?'rice':id),shortRows=normalRows.slice(0,6);
  const config=normalizeComparison({custom:[{id:'custom-one',name:'Mine',crops:chosen}],selected:['custom-one','adaptive']},ids.slice(0,6));
  assert.equal(config.custom[0].crops.length,10);assert.equal(config.custom[0].crops[8],'rice');
  const plans=comparisonPlans(config,{...args,horizon:3,normalRows:shortRows,adaptiveRows:shortRows,shock:null});
  assert.ok(plans.visible.every(p=>p.rows.length===6));
  assert.equal(normalizeComparison(config,ids).custom[0].crops[8],'rice');
});
test('all comparison plans share a scenario; custom choices stay fixed and adaptive history stays fixed',()=>{
  const shock={type:'drought',year:2028},chosen=ids.map((_,i)=>i%2?'maize':'rice');
  const config=normalizeComparison({selected:['adaptive','original','rice-maize','custom-one'],custom:[{id:'custom-one',name:'Mine',crops:chosen}]},ids);
  const adaptiveRows=optimize({...args,shock,prefix:normalRows.slice(0,4)}).rows;
  const result=comparisonPlans(config,{...args,normalRows,adaptiveRows,shock});
  for(const plan of result.visible){assert.equal(plan.rows[4].shock,'drought');assert.equal(plan.rows[5].shock,'drought');assert.equal(plan.rows[3].shock,null);}
  assert.deepEqual(result.visible[3].rows.map(r=>r.id),chosen);
  assert.deepEqual(result.visible[0].rows.slice(0,4),normalRows.slice(0,4));
  assert.deepEqual(result.visible[3].rows,result.visible[2].rows);
});
test('custom crop pool respects soil and season while audit reports combined annual water excess',()=>{
  const farm={...DEFAULT_FARM,soil:'clay',water:300};
  assert.ok(selectableCrops(farm,0).every(c=>c.soils.includes('clay')&&c.seasons.includes('wet')));
  assert.ok(!selectableCrops(farm,1).some(c=>c.id==='maize'));
  const rows=simulateSequence(['rice','maize'],{...args,farm});
  const audit=auditRotation(rows,farm);assert.equal(audit.feasible,false);
  assert.ok(audit.issues.some(s=>s.includes('soil')));assert.ok(audit.issues.some(s=>s.includes('above the annual budget')));
  assert.equal(audit.annual[0].water,rows[0].water.irrigation+rows[1].water.irrigation);
});
test('comparison trajectories reconcile with playback totals and scale by farm area',()=>{
  const end=simulationFrame(normalRows,normalRows.length,args.farm);
  const income=comparisonSeries(normalRows,args.farm,'income'),water=comparisonSeries(normalRows,args.farm,'water'),nitrogen=comparisonSeries(normalRows,args.farm,'nitrogen');
  assert.ok(Math.abs(income.at(-1)-end.cumulativeIncome)<1e-7);
  assert.ok(Math.abs(water.at(-1)-end.cumulativeWater*args.farm.area*10)<1e-7);
  assert.equal(nitrogen.at(-1),end.nitrogen);assert.equal(nitrogen[0],args.farm.nitrogen);
  assert.deepEqual(comparisonSeries(normalRows,{...args.farm,area:args.farm.area*2},'income'),income.map(n=>n*2));
  assert.equal(relativeChange(10,0),null);assert.equal(relativeChange(0,0),0);assert.equal(relativeChange(-5,-10),50);
});
test('growth advances from bare soil through flowering and ripening to harvested residue',()=>{
  assert.equal(growthStage(0).growth,0);assert.equal(growthStage(.59).phase,'Flowering');assert.equal(growthStage(.8).phase,'Ripening');
  assert.equal(growthStage(.96).phase,'Harvest');assert.ok(growthStage(.96).harvestProgress>.5);
  const end=simulationFrame(normalRows,normalRows.length,args.farm);assert.equal(end.canopy,0);assert.equal(end.harvestProgress,1);
  assert.equal(growthStage(.5,true).growth,0);
  for(const progress of [-1,0,.1,.5,.95,1,2])for(const key of ['growth','maturity','harvestProgress'])assert.ok(growthStage(progress)[key]>=0&&growthStage(progress)[key]<=1);
});
