import test from 'node:test';
import assert from 'node:assert/strict';
import {polygonAreaHa,polygonCenter,validateBoundary,savedSelection,normalizedBoundary,parseCoordinates,inSupportedRegion} from '../dist/geo.mjs';
import {simulationFrame} from '../dist/simulation-model.mjs';
import {DEFAULT_FARM,DEFAULT_HISTORY,SAMPLE_CLIMATE,optimize,metrics,simulateSequence} from '../dist/engine.mjs';
const square=[[24.37,88.60],[24.37,88.601],[24.371,88.601],[24.371,88.60]];
test('parcel geometry has stable area and centre regardless of winding',()=>{
  const area=polygonAreaHa(square);assert.ok(area>1.12&&area<1.14);
  assert.equal(area,polygonAreaHa([...square].reverse()));
  const center=polygonCenter(square);assert.ok(Math.abs(center[0]-24.3705)<1e-9);assert.ok(Math.abs(center[1]-88.6005)<1e-9);
  assert.equal(validateBoundary(square),null);
});
test('invalid, crossing, flat, oversized, and out-of-region parcels are rejected',()=>{
  for(const points of [[],square.slice(0,2),[square[0],square[2],square[1],square[3]],[[24,88],[24,88.01],[24,88.02]],[[24,88],[24,89],[25,89],[25,88]],[[0,0],[0,1],[1,1]],[[24,88],[24,88],[24.01,88.01]],[[24,88],[24,NaN],[24.01,88.01]]])assert.ok(validateBoundary(points));
});
test('saving an unfinished boundary is blocked; completed outline returns actual area',()=>{
  assert.throws(()=>savedSelection({points:square,drawing:true}),/Finish/);
  const result=savedSelection({points:square,drawing:false});assert.equal(result.area,polygonAreaHa(square));assert.equal(result.boundary.length,4);assert.equal(result.locationSource,'Drawn field boundary');
  result.boundary[0][0]=0;assert.equal(square[0][0],24.37);
  const pin=savedSelection({points:[],drawing:false,lat:24.37,lon:88.60});assert.equal(pin.boundary,null);assert.equal(pin.area,undefined);
});
test('coordinate parsing rejects malformed or unsupported locations',()=>{
  assert.deepEqual(parseCoordinates('24.3745, 88.6042'),[24.3745,88.6042]);assert.equal(parseCoordinates('Rajshahi'),null);assert.equal(parseCoordinates('24, 88, 22'),null);assert.equal(inSupportedRegion([91,200]),false);
  assert.throws(()=>savedSelection({points:[],lat:91,lon:200}),/Bangladesh/);
});
test('normalized parcel fits the visualization and preserves aspect ratio',()=>{
  const normalized=normalizedBoundary(square);assert.equal(normalized.length,4);assert.ok(normalized.every(p=>p.every(x=>x>=.0799&&x<=.9201)));
  assert.equal(normalizedBoundary(null).length,4);
});
const args={farm:DEFAULT_FARM,history:DEFAULT_HISTORY,climate:SAMPLE_CLIMATE};
const rows=optimize(args).rows;
test('simulation follows crop transitions and carries the previous nutrient state',()=>{
  const start=simulationFrame(rows,0,DEFAULT_FARM);assert.equal(start.nitrogen,DEFAULT_FARM.nitrogen);assert.equal(start.harvested,0);assert.equal(start.cumulativeIncome,0);
  const next=simulationFrame(rows,1,DEFAULT_FARM);assert.equal(next.row.id,rows[1].id);assert.equal(next.nitrogen,rows[0].nitrogen);assert.equal(next.harvested,1);assert.equal(next.cumulativeIncome,rows[0].profit*DEFAULT_FARM.area);
});
test('simulation completion exactly reconciles water and income with the planner',()=>{
  const end=simulationFrame(rows,rows.length,DEFAULT_FARM);const m=metrics(rows);assert.equal(end.harvested,rows.length);assert.equal(end.complete,true);assert.equal(end.cumulativeWater,m.water);assert.equal(end.nitrogen,rows.at(-1).nitrogen);assert.ok(Math.abs(end.cumulativeIncome-m.profit*DEFAULT_FARM.area)<DEFAULT_FARM.area);
  assert.equal(simulationFrame(rows,100,DEFAULT_FARM).complete,true);assert.equal(simulationFrame(rows,-10,DEFAULT_FARM).progress,0);
});
test('simulation scales farm totals with parcel area, keeping per-ha estimates unchanged',()=>{
  const a=simulationFrame(rows,1.5,DEFAULT_FARM),b=simulationFrame(rows,1.5,{...DEFAULT_FARM,area:DEFAULT_FARM.area*2});
  assert.equal(a.nitrogen,b.nitrogen);assert.equal(a.irrigation,b.irrigation);assert.equal(a.expectedHarvest*2,b.expectedHarvest);assert.equal(a.cumulativeIncome*2,b.cumulativeIncome);assert.equal(a.waterVolume*2,b.waterVolume);
});
test('scenario comparison applies identical pressure to the original and escape route',()=>{
  const shock={type:'drought',year:2028};const adaptive=optimize({...args,shock,prefix:rows.slice(0,4)}).rows;
  const original=simulateSequence(rows.map(r=>r.id),{...args,shock});
  const a=simulationFrame(adaptive,4.5,DEFAULT_FARM),b=simulationFrame(original,4.5,DEFAULT_FARM);assert.equal(a.row.shock,'drought');assert.equal(b.row.shock,'drought');assert.equal(a.row.year,b.row.year);
  assert.deepEqual(adaptive.slice(0,4).map(r=>r.id),rows.slice(0,4).map(r=>r.id));
});
