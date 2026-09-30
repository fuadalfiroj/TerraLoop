import {crop} from './engine.mjs';

export const PHASES=['Sowing','Emergence','Vegetative growth','Flowering','Ripening','Harvest'];
export function growthStage(progress, isRest = false) {
  const p=Math.min(1,Math.max(0,progress));
  const phase=p<.08?0:p<.22?1:p<.50?2:p<.68?3:p<.90?4:5;
  const growth=isRest?0:Math.min(1,Math.max(0,(p-.045)/.52));
  return {phase:PHASES[phase],growth:Math.sin(growth*Math.PI/2),maturity:Math.min(1,Math.max(0,(p-.66)/.24)),harvestProgress:p===1?1:Math.min(1,Math.max(0,(p-.90)/.10))};
}
export function simulationFrame(rows, cursor, farm) {
  if (!rows.length) throw Error('Generate a rotation before starting the simulation.');
  const position=Math.min(rows.length,Math.max(0,Number.isFinite(cursor)?cursor:0));
  const index=Math.min(rows.length-1,Math.floor(position));
  const progress=position===rows.length?1:position-index;
  const row=rows[index], c=crop(row.id), previousN=index?rows[index-1].nitrogen:farm.nitrogen;
  const smooth=progress*progress*(3-2*progress);
  const stage=growthStage(progress,c.id==='fallow');
  const harvested=progress===1?index+1:index;
  const completed=rows.slice(0,harvested);
  return {
    index,progress,row,crop:c,...stage,complete:position===rows.length,
    nitrogen:previousN+(row.nitrogen-previousN)*smooth,
    irrigation:row.water.irrigation*progress,
    waterVolume:row.water.irrigation*progress*farm.area*10,
    canopy:Math.round(stage.growth*(1-stage.harvestProgress)*c.canopy/10*(1-row.loss)*100),
    stress:Math.round(row.loss*100),
    harvested,
    cumulativeIncome:completed.reduce((n,r)=>n+r.profit,0)*farm.area,
    cumulativeWater:completed.reduce((n,r)=>n+r.water.irrigation,0)+ (progress===1?0:row.water.irrigation*progress),
    expectedHarvest:row.yield*farm.area,
  };
}
