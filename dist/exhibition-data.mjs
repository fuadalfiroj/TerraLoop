import {polygonAreaHa,polygonCenter} from './geo.mjs';

export const EXHIBITION_VERSION=1;
export const EXHIBITION_BACKUP_KEY='terraloop-before-exhibition-v1';
export const EXHIBITION_PROVENANCE={
  title:'TerraLoop exhibition farm collection',version:EXHIBITION_VERSION,
  synthetic:true,created:'2026-09-30',
  description:'Three fictional Bangladesh farm stories for repeatable product demonstrations. Names, boundaries, seasonal records, climate values, and outcomes are invented examples. They are not farmer surveys, NASA observations, or forecasts.',
  units:{area:'ha',yield:'t/ha',irrigation:'mm',fertilizer:'kg N/ha',nitrogen:'kg N/ha',rain:'mm',temperature:'°C',currency:'BDT'},
  calendar:'A planning year contains Kharif (Jun–Nov) and Rabi (Dec–May of the following calendar year). Feedback year matches the planting/planning year; harvestYear is explicit.',
  linkage:'Each feedback record points to a historyId and uses that record’s actual yield. Plot area and centre are calculated from its boundary. Effective climate rainfall is 65% of the mean raw seasonal rainfall in the five example years. Future metrics are calculated by the app, not prewritten.'
};

function parcel(lat,lon,width,length) {
  const scale=6371008.8*Math.PI/180;
  const offsets=[[-.50,-.50],[.36,-.50],[.50,-.30],[.46,.50],[-.50,.44]];
  const boundary=offsets.map(([x,y])=>[lat+y*length/scale,lon+x*width/(scale*Math.cos(lat*Math.PI/180))]);
  const center=polygonCenter(boundary);
  return {lat:center[0],lon:center[1],area:+polygonAreaHa(boundary).toFixed(3),boundary,locationSource:'Illustrative exhibition boundary'};
}
function historyRows(farmId, rows) {
  return rows.map(([year,season,crop,yieldValue,irrigation,fertilizer,residue,pest,notes])=>({
    id:`${farmId}-${year}-${season}`,year,season,crop,yield:yieldValue,irrigation,fertilizer,residue,pest,notes,
    harvestYear:year+(season==='dry'?1:0),source:'Exhibition example',synthetic:true
  }));
}
function climateRows(rows) {
  const years=rows.map(([year,wetRain,dryRain,temp,event])=>({year,wetRain,dryRain,rain:wetRain+dryRain,temp,event}));
  return {source:'sample',label:'Exhibition climate · synthetic',synthetic:true,
    wetRain:Math.round(years.reduce((s,y)=>s+y.wetRain,0)/years.length*.65),
    dryRain:Math.round(years.reduce((s,y)=>s+y.dryRain,0)/years.length*.65),
    temperature:+(years.reduce((s,y)=>s+y.temp,0)/years.length).toFixed(1),years,effectiveRainFraction:.65};
}
const definitions=[
  {
    id:'padma',name:'Padma Growers Farm',region:'Rajshahi',tag:'Drought & fertilizer pressure',color:'#759655',
    headline:'The familiar rotation is getting thirsty.',
    summary:'A small family-run farm wants to reduce irrigation dependence after repeated rice and maize seasons, while retaining a dependable income.',
    settings:{...parcel(24.4096,88.5484,162,166),soil:'loam',water:650,nitrogen:64,residue:'mulch'},
    scenario:{type:'drought',year:2028,season:'dry'},
    baselineName:'Familiar rice → maize',baseline:['rice','maize'],alternativeName:'Pulses & cereals',alternative:['mung','chickpea','sorghum','lentil','sesame','chickpea','mung','wheat','sorghum','lentil'],
    climate:climateRows([[2021,790,200,26.7,'Regular monsoon'],[2022,720,160,27.1,'Short dry-season showers'],[2023,890,230,27.0,'Wetter monsoon'],[2024,540,100,28.0,'Long dry spell'],[2025,760,210,27.4,'Rainfall recovery']]),
    records:[
      [2021,'wet','rice',4.6,220,108,'remove','Low stem-borer pressure','Rice straw removed for livestock; dependable monsoon harvest.'],
      [2021,'dry','maize',7.8,380,142,'remove','Armyworm patches','Maize followed rice; a shared pump supplied the dry-season irrigation.'],
      [2022,'wet','rice',4.4,245,112,'burn','Stem borer','Repeated cereal hosts; sedges returned along the field edge.'],
      [2022,'dry','maize',7.0,420,150,'remove','Armyworm','Pump queues increased. Yield was below the 8.2 t/ha planning estimate.'],
      [2023,'wet','rice',4.7,170,106,'incorporate','Low pest pressure','More rain reduced irrigation. Some straw was incorporated after harvest.'],
      [2023,'dry','lentil',1.42,95,22,'incorporate','Aphid patches','First pulse trial interrupted the cereal sequence; less irrigation was needed.'],
      [2024,'wet','rice',4.2,330,118,'remove','Stem borer','The long dry spell raised pump use. Actual yield was 12.5% below 4.8 t/ha.'],
      [2024,'dry','maize',6.6,475,155,'mulch','Armyworm','Extra irrigation could not fully offset the hot, dry growing period.'],
      [2025,'wet','mung',1.52,80,18,'mulch','Minor aphids','A second pulse trial beat the 1.45 t/ha estimate; residues were kept as mulch.'],
      [2025,'dry','chickpea',1.58,115,20,'mulch','Low pod-borer pressure','The household kept the low-water crop and mulch practice for the next plan.']
    ],
    observations:[[2022,'dry',8.2,'more','partly'],[2023,'dry',1.5,'less','yes'],[2024,'wet',4.8,'more','partly'],[2024,'dry',8.0,'more','no'],[2025,'wet',1.45,'less','yes'],[2025,'dry',1.6,'same','yes']],
    cues:{overview:'A family farm is moving away from pump-heavy cereal repetition.',land:'The illustrative parcel is the same shape used in every simulation field. Its measured area scales water volume and income.',memory:'Follow the 2024 dry spell, higher irrigation, and lower rice yield; then the 2025 pulse and mulch trials.',rotation:'Balance dependable income with nitrogen carry-over and fewer repeated host families.',simulation:'Compare the familiar rice–maize pattern, the pulse-led alternative, and the adaptive plan on identical land.',water:'Show how the selected crop fits the 650 mm annual irrigation allowance.',climate:'Replay a constructed 2028 drought against the five-year synthetic rainfall context.',learning:'The 2024 rice outcome is 4.8 predicted versus 4.2 actual. It is the same harvest recorded in Farm Memory.',passport:'Close with the adaptive plan versus this farm’s familiar rice–maize rotation.'}
  },
  {
    id:'dharla',name:'Dharla Community Farm',region:'Kurigram',tag:'Flood recovery & heavy soil',color:'#6b98a0',
    headline:'Keep a way back after the water recedes.',
    summary:'A shared clay-soil farm has experienced waterlogging. It needs a rotation that recognizes its soil, retains useful residue, and prepares for recovery.',
    settings:{...parcel(25.8120,89.6630,134,151),soil:'clay',water:500,nitrogen:58,residue:'incorporate'},
    scenario:{type:'flood',year:2027,season:'wet'},
    baselineName:'Familiar rice → wheat',baseline:['rice','wheat'],alternativeName:'Rice, pulses & mustard',alternative:['rice','lentil','sorghum','mustard','rice','chickpea','jute','lentil','rice','mustard'],
    climate:climateRows([[2021,1350,210,25.9,'Regular monsoon'],[2022,1810,250,26.0,'Prolonged wet period'],[2023,1460,190,26.4,'Typical recovery year'],[2024,1620,220,26.5,'Intense monsoon spells'],[2025,1540,200,26.2,'Short waterlogging period']]),
    records:[
      [2021,'wet','rice',4.8,90,100,'incorporate','Minor stem borer','Aman rice established in heavy soil; straw returned after harvest.'],
      [2021,'dry','wheat',3.4,240,95,'remove','Low aphid pressure','The first dry-season cereal followed rice without a host-family break.'],
      [2022,'wet','rice',3.7,40,96,'incorporate','Blast symptoms','Prolonged wet conditions and waterlogging reduced harvest.'],
      [2022,'dry','mustard',1.48,90,68,'incorporate','Minor aphids','Sowing waited until drainage improved; mustard changed the crop family.'],
      [2023,'wet','jute',2.55,70,88,'remove','Stem-rot patches','A jute trial diversified the wet-season crop but required careful drainage.'],
      [2023,'dry','lentil',1.38,75,24,'incorporate','Root-rot patches','Lentil performed unevenly in low spots; wet soil remained a concern.'],
      [2024,'wet','rice',4.25,65,103,'incorporate','Blast symptoms','Intense rain interrupted field work; fertilizer was split around wet spells.'],
      [2024,'dry','wheat',3.22,255,102,'incorporate','Aphid patches','The cereal crop needed more irrigation after the monsoon receded.'],
      [2025,'wet','rice',4.5,55,98,'incorporate','Low stem-borer pressure','Drainage channels helped after brief waterlogging; residue incorporation continued.'],
      [2025,'dry','mustard',1.66,82,70,'incorporate','Minor aphids','Mustard recovered close to its planning estimate and changed the host family.']
    ],
    observations:[[2022,'wet',4.8,'less','partly'],[2023,'wet',2.7,'same','partly'],[2023,'dry',1.5,'less','partly'],[2024,'wet',4.8,'less','partly'],[2024,'dry',3.6,'more','partly'],[2025,'dry',1.7,'same','yes']],
    cues:{overview:'A cooperative-style farm balances heavy soil, waterlogging history, and recovery crops.',land:'This synthetic parcel supplies the map, field footprint, and whole-farm volume calculations.',memory:'The wet 2022 example links lower rice yield with waterlogging. Later mustard trials break the cereal sequence.',rotation:'Clay soil excludes maize from the recommended crop pool. The relevant familiar baseline here is rice–wheat.',simulation:'Compare rice–wheat, a diversified pulse/mustard plan, and TerraLoop’s adaptive sequence.',water:'A wetter climate can reduce irrigation while flood stress still reduces yield. These are different effects.',climate:'Apply the 2027 flood scenario. Recovery suggestions assume standing floodwater has receded.',learning:'Rice and lentil outcomes capture the different costs of waterlogging; their yield adjustments carry into the planner.',passport:'Compare against rice–wheat, the same familiar rotation used in the simulation.'}
  },
  {
    id:'teesta',name:'Teesta Char Farm',region:'Rangpur',tag:'Sandy soil & a limited water supply',color:'#b38d59',
    headline:'Make a smaller water budget go further.',
    summary:'A small sandy-soil farm alternates sorghum and maize, trials mung bean, and retains mulch. Its limited pump allocation makes crop choice especially visible.',
    settings:{...parcel(25.7340,89.3370,115,111),soil:'sandy',water:400,nitrogen:46,residue:'mulch'},
    scenario:{type:'heat',year:2029,season:'dry'},
    baselineName:'Familiar sorghum → maize',baseline:['sorghum','maize'],alternativeName:'Mung & sesame cycle',alternative:['mung','mung','sesame','mung','sorghum','mung','sesame','mung','sorghum','mung'],
    climate:climateRows([[2021,850,145,26.1,'Steady wet season'],[2022,720,115,26.7,'Dry-season water limits'],[2023,970,175,26.3,'Wetter monsoon'],[2024,670,95,27.5,'Hot dry period'],[2025,850,140,27.0,'Patchy dry-season rain']]),
    records:[
      [2021,'wet','sorghum',3.3,75,78,'remove','Minor stem borer','Sorghum established on sandy soil with a small irrigation supplement.'],
      [2021,'dry','maize',7.5,410,138,'remove','Armyworm','The household bought additional pumping hours beyond its usual allocation.'],
      [2022,'wet','sesame',1.12,65,58,'mulch','Leaf-roller patches','Sesame reduced wet-season water demand and introduced another crop family.'],
      [2022,'dry','maize',6.7,450,148,'remove','Armyworm','Higher pumping cost and lower yield squeezed the margin.'],
      [2023,'wet','mung',1.4,35,20,'mulch','Minor pod borer','Mung bean was tried with retained surface cover.'],
      [2023,'dry','potato',19.0,360,122,'mulch','Cutworm patches','A higher-value crop produced more tonnage but needed more inputs.'],
      [2024,'wet','sorghum',3.05,115,82,'mulch','Stem borer','A hot, dry spell increased irrigation frequency on the sandy field.'],
      [2024,'dry','maize',6.3,480,151,'mulch','Armyworm','Extra purchased water did not prevent a lower-than-expected maize harvest.'],
      [2025,'wet','sesame',1.18,60,56,'mulch','Minor leaf roller','Mulch was retained to keep soil covered between seasons.'],
      [2025,'dry','mung',1.43,165,18,'mulch','Minor aphids','A lower-water dry-season pulse nearly matched its 1.45 t/ha estimate.']
    ],
    observations:[[2022,'dry',8.2,'more','no'],[2023,'wet',1.45,'less','yes'],[2023,'dry',22,'same','partly'],[2024,'wet',3.5,'more','partly'],[2024,'dry',7.8,'more','no'],[2025,'dry',1.45,'less','yes']],
    cues:{overview:'A small farm prioritizes affordable irrigation and soil cover.',land:'A smaller parcel reduces total cubic metres and income while per-hectare estimates remain comparable.',memory:'Maize needed extra purchased water. The later mung-bean trial used less irrigation.',rotation:'The sandy-soil crop pool and 400 mm annual water limit both shape the recommended sequence.',simulation:'Compare a high-water familiar pattern with the mung/sesame alternative and an adaptive plan.',water:'Lower the irrigation slider to show how a finite water allowance changes the crop pool.',climate:'Apply heat in 2029: modeled crop-water demand rises by 16%, with crop-specific yield stress.',learning:'Two disappointing maize outcomes lower that crop’s farm multiplier; mung-bean outcomes remain closer to expectations.',passport:'The familiar sorghum–maize plan can exceed the current budget. Its comparison assumes extra water is purchased.'}
  }
];

export const EXHIBITION_FARMS=definitions.map(d=>{
  const history=historyRows(d.id,d.records);
  const feedback=d.observations.map(([year,season,predicted,irrigation,useful])=>{
    const h=history.find(h=>h.year===year&&h.season===season);
    return {id:`outcome-${h.id}`,historyId:h.id,crop:h.crop,year,season,harvestYear:h.harvestYear,predicted,actual:h.yield,pest:h.pest,irrigation,useful,source:'Exhibition example',synthetic:true};
  });
  const {records,observations,settings,...profile}=d;
  return {...profile,state:{version:1,farm:{name:d.name,region:d.region,...settings},history,feedback,climate:d.climate,priority:'balanced',horizon:5,
    simComparison:{selected:['adaptive','custom-current','custom-diverse'],reference:'custom-current',custom:[
      {id:'custom-current',name:d.baselineName,crops:Array.from({length:10},(_,i)=>d.baseline[i%2])},
      {id:'custom-diverse',name:d.alternativeName,crops:[...d.alternative]}
    ]},exhibition:{datasetVersion:EXHIBITION_VERSION,farmId:d.id,step:0,scenario:null,guide:true,synthetic:true}}};
});

export const EXHIBITION_STEPS=[
  {id:'overview',page:'overview',title:'Meet the farm',seconds:12},
  {id:'land',page:'land',title:'Locate the field',seconds:12},
  {id:'memory',page:'memory',title:'Read its past',seconds:20},
  {id:'rotation',page:'rotation',title:'Plan five years',seconds:15},
  {id:'simulation',page:'simulation',title:'Compare rotations',seconds:20},
  {id:'climate',page:'climate',title:'Introduce a disruption',seconds:15,stress:true},
  {id:'escape',page:'simulation',title:'Watch the response',seconds:20,stress:true},
  {id:'water',page:'water',title:'Balance the water',seconds:15,stress:true},
  {id:'learning',page:'learning',title:'Learn from harvests',seconds:18,stress:true},
  {id:'passport',page:'passport',title:'Show the passport',seconds:13,stress:true}
];
export const exhibitionFarm=id=>EXHIBITION_FARMS.find(p=>p.id===id);
export function makeExhibitionState(id='padma') {
  const profile=exhibitionFarm(id);if(!profile)throw Error('Unknown exhibition farm.');
  return structuredClone(profile.state);
}
export function exhibitionBaselineIds(state) {
  const profile=exhibitionFarm(state.exhibition?.farmId);
  const pair=profile?.baseline||['rice','maize'];
  const custom=profile?state.simComparison?.custom?.find(p=>p.id==='custom-current'):null;
  return Array.from({length:state.horizon*2},(_,i)=>custom?.crops?.[i]||pair[i%2]);
}
export function exhibitionScene(state,index) {
  const profile=exhibitionFarm(state.exhibition?.farmId),step=EXHIBITION_STEPS[index];
  if(!profile||!step)throw Error('Unknown exhibition scene.');
  const scenario=step.stress?{type:profile.scenario.type,year:profile.scenario.year}:null;
  const slot=(profile.scenario.year-2026)*2+(profile.scenario.season==='dry'?1:0);
  return {page:step.page,scenario,selectedYear:profile.scenario.year,selectedSeason:step.stress?slot:1,cursor:step.stress?slot+.59:.59,index};
}
export function exhibitionBundle(){return {provenance:EXHIBITION_PROVENANCE,farms:structuredClone(EXHIBITION_FARMS),walkthrough:EXHIBITION_STEPS};}

export function stageExhibition(storage,current,id) {
  const next=makeExhibitionState(id);
  // Preserve the user's current workspace once; switching/resetting demos cannot overwrite it.
  if(!current.exhibition)storage.setItem(EXHIBITION_BACKUP_KEY,JSON.stringify(current));
  storage.setItem('terraloop-v1',JSON.stringify(next));
  return next;
}
export function restoreExhibitionBackup(storage) {
  const raw=storage.getItem(EXHIBITION_BACKUP_KEY);
  if(!raw)throw Error('No previous farm backup is available in this browser.');
  const state=JSON.parse(raw);
  if(state.version!==1||!state.farm||!Number.isFinite(state.farm.water)||!Array.isArray(state.history)||!Array.isArray(state.feedback)||state.exhibition)throw Error('The previous farm backup is invalid. It has been kept for recovery.');
  storage.setItem('terraloop-v1',JSON.stringify(state));return state;
}
