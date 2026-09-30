import {simulationFrame, PHASES} from './simulation-model.mjs';
import {createFieldScene} from './field-scene.mjs';
import {MAX_VISIBLE, MAX_CUSTOM, selectableCrops, comparisonSeries, relativeChange} from './comparison.mjs';
import {crop, slot} from './engine.mjs';

const fmt=n=>Math.round(n).toLocaleString('en-US');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const seasonName=row=>`${row.year} ${row.season==='wet'?'Kharif':'Rabi'}`;
const dot=p=>`<i class="plan-dot" style="background:${p.color}"></i>`;

function customEditor(config,sim,farm,length) {
  const p=config.custom.find(p=>p.id===sim.editor);
  if(!p)return '';
  return `<div class="rotation-editor"><div class="editor-heading"><label>Rotation name<input id="custom-name" maxlength="48" value="${esc(p.name)}"></label><div><button class="btn secondary" id="repeat-year">Repeat first year</button><button class="btn secondary" id="close-editor">Done editing</button></div></div><p>Choose a crop for each season. Options match your soil and planting season.</p><div class="crop-sequence-editor">${p.crops.slice(0,length).map((id,i)=>{
    const options=selectableCrops(farm,i),allowed=options.some(c=>c.id===id);
    return `<label>${seasonName(slot(i))}<select id="custom-crop-${i}" data-custom-crop="${i}" aria-label="${esc(p.name)} ${seasonName(slot(i))}">${!allowed?`<option value="${id}" selected>${esc(crop(id).name)} · outside crop pool</option>`:''}${options.map(c=>`<option value="${c.id}" ${id===c.id?'selected':''}>${c.name}</option>`).join('')}</select><small>${crop(id).family}</small></label>`;
  }).join('')}</div><button class="text-button remove-rotation" id="remove-custom">Remove this custom rotation</button></div>`;
}

function delta(value,reference,unit='') {
  const change=relativeChange(value,reference);
  if(value===reference)return '<small>Same as reference</small>';
  return `<small>${change===null?`${value-reference>0?'+':'−'}${fmt(Math.abs(value-reference))}${unit}`:`${change>0?'+':''}${change.toFixed(1)}%`} vs reference</small>`;
}

function summaryTable(visible,config,farm) {
  const reference=visible.find(p=>p.id===config.reference)||visible[0];
  const income=p=>p.rows.reduce((sum,row)=>sum+row.profit,0)*farm.area;
  const rows=[
    ['Net income · whole farm',p=>`৳${fmt(income(p))}`,income,''],
    ['Irrigation · whole farm',p=>`${fmt(p.summary.water*farm.area*10)} m³`,p=>p.summary.water*farm.area*10,' m³'],
    ['Irrigation · per hectare',p=>`${fmt(p.summary.water)} mm`],
    ['Ending soil nitrogen',p=>`${p.summary.nitrogen} kg N/ha`],
    ['Crop-family diversity',p=>`${p.summary.families} ${p.summary.families===1?'family':'families'}`],
    ['Largest seasonal yield loss',p=>`${p.summary.worstLoss}%`],
    ['Soil, season & water checks',p=>`<span class="comparison-status ${p.audit.feasible?'pass':'warn'}">${p.audit.feasible?'Within modeled limits':'Review constraints'}</span>`]
  ];
  return `<div class="table-wrap comparison-table"><table><thead><tr><th>Across the full rotation</th>${visible.map(p=>`<th>${dot(p)}${esc(p.name)}<small>${p.id===reference.id?'Reference':p.kind}</small></th>`).join('')}</tr></thead><tbody>${rows.map(([name,value,raw,unit])=>`<tr><td>${name}</td>${visible.map(p=>`<td>${value(p)}${raw&&p.id!==reference.id?delta(raw(p),raw(reference),unit):''}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function trajectory(visible,farm,metric) {
  const lines=visible.map(p=>({...p,values:comparisonSeries(p.rows,farm,metric)}));
  const all=lines.flatMap(p=>p.values),lo=Math.min(0,...all),hi=Math.max(1,...all),span=hi-lo;
  const x=i=>68+i/visible[0].rows.length*840,y=v=>190-(v-lo)/span*160;
  const compact=n=>Math.abs(n)>=1e6?`${(n/1e6).toFixed(1)}m`:Math.abs(n)>=1000?`${(n/1000).toFixed(0)}k`:fmt(n);
  const label=metric==='income'?'Accumulated net income in BDT':metric==='water'?'Accumulated irrigation in cubic metres':'Estimated soil nitrogen in kg N/ha';
  return `<svg class="trajectory-chart" viewBox="0 0 940 236" role="img" aria-label="${label}, compared at each harvest. Exact ending values are in the comparison table.">${[0,.25,.5,.75,1].map(t=>{const v=lo+t*span;return `<line x1="68" x2="908" y1="${y(v)}" y2="${y(v)}" stroke="#e3e9da"/><text x="55" y="${y(v)+4}" text-anchor="end">${compact(v)}</text>`;}).join('')}${lines.map(p=>`<polyline fill="none" stroke="${p.color}" stroke-width="3" stroke-linejoin="round" points="${p.values.map((v,i)=>`${x(i)},${y(v)}`).join(' ')}"/>`).join('')}<line id="trajectory-cursor" x1="68" x2="68" y1="22" y2="195" stroke="#344b39" stroke-dasharray="4 4" opacity=".45"/>${visible[0].rows.map((r,i)=>i%2===1?`<text x="${x(i+1)}" y="219" text-anchor="middle">${r.year}</text>`:'').join('')}<text x="68" y="219" text-anchor="middle">Start</text></svg>`;
}

export function simulationHTML({farm,rows,shock,icon,workspace,config,sim}) {
  const {visible,library}=workspace;
  if(!visible.length)return '<section class="panel padded"><h1>No rotation available</h1><p>Review your farm settings to generate a plan.</p></section>';
  return `<div class="page-heading"><div><div class="eyebrow">THE FARM TIME MACHINE</div><h1>Different choices. Living futures.</h1><p>Plant a possibility. Watch it grow. Compare what it leaves for your farm.</p></div><button class="btn secondary" data-action="land">${icon('pin',17)} ${farm.boundary?'Edit field boundary':'Select your land'}</button></div>
  <section class="panel comparison-setup"><div class="comparison-setup-heading"><div><h2>Choose your rotations</h2><p>View one to four plans. Every field represents your entire ${farm.area.toFixed(2)} ha farm.</p></div><span class="badge">${visible.length} / ${MAX_VISIBLE} displayed</span></div><div class="rotation-pickers">${library.map(p=>{const selected=config.selected.includes(p.id);return `<div class="rotation-picker ${selected?'selected':''}"><button data-compare-toggle="${p.id}" aria-pressed="${selected}" ${!selected&&visible.length===MAX_VISIBLE?'disabled':''} title="${esc(p.description)}">${dot(p)}<span>${esc(p.name)}<small>${p.kind}</small></span><b aria-hidden="true">${selected?'✓':'+'}</b></button>${p.kind==='Custom'?`<button class="edit-rotation" data-edit-rotation="${p.id}" aria-label="Edit ${esc(p.name)}">${icon('edit',14)}</button>`:''}</div>`;}).join('')}</div><div class="comparison-config"><button class="btn secondary" id="add-custom" ${config.custom.length>=MAX_CUSTOM||visible.length>=MAX_VISIBLE?'disabled':''}>${icon('plus',16)} Add custom rotation</button><span class="comparison-hint">${visible.length===MAX_VISIBLE?'Deselect a plan to add another.':'Custom rotations start as a copy of your reference.'}</span><label>Compare against<select id="comparison-reference">${visible.map(p=>`<option value="${p.id}" ${config.reference===p.id?'selected':''}>${esc(p.name)}</option>`).join('')}</select></label><label>Horizon<select id="comparison-horizon">${[3,4,5].map(n=>`<option value="${n}" ${rows.length===n*2?'selected':''}>${n} years</option>`).join('')}</select></label></div>${customEditor(config,sim,farm,rows.length)}<div class="comparison-message" id="comparison-message" role="status"></div></section>
  <section class="natural-studio"><div class="natural-studio-header"><div><span class="eyebrow light">SHARED SEASONAL TIMELINE</span><h2 id="sim-season-title"></h2></div><div class="natural-studio-meta"><span id="sim-phase-badge" class="growth-stage"></span><span>${farm.boundary?'Your drawn field outline':'Illustrative field footprint'} · ${farm.area.toFixed(2)} ha per plan</span></div></div>
  <div class="sim-playback"><div class="sim-transport"><button id="sim-rewind" class="sim-icon-btn" aria-label="Restart simulation">↺</button><button id="sim-prev" class="sim-icon-btn" aria-label="Previous season">‹</button><button id="sim-play" class="sim-play-btn" aria-label="Play simulation">▶ <span>Play</span></button><button id="sim-next" class="sim-icon-btn" aria-label="Next season">›</button></div><label class="sim-time-label">Travel through time<input id="sim-cursor" type="range" min="0" max="${rows.length}" step="0.01" value="0"><span id="sim-time-text"></span></label><label class="sim-speed-label">Speed<select id="sim-speed"><option value="1">1×</option><option value="2">2×</option><option value="4">4×</option></select></label></div>
  <div class="sim-season-strip">${rows.map((r,i)=>`<button data-sim-season="${i}" aria-label="Jump to ${seasonName(r)}"><b>${r.year}</b><span>${r.season==='wet'?'Kharif':'Rabi'}</span></button>`).join('')}</div>
  <div class="natural-plots count-${visible.length}">${visible.map((p,i)=>`<article class="natural-plot" style="--plan-color:${p.color}"><div class="plot-heading"><span>${dot(p)}${esc(p.name)}</span><small>${p.id===config.reference?'Reference':p.kind}</small></div><div class="plot-crop"><h3 id="plot-crop-${i}"></h3><span id="plot-state-${i}"></span></div><canvas id="field-${i}" width="600" height="330" role="img" aria-label="Seasonal crop growth for ${esc(p.name)}"></canvas><div class="plot-stats"><div><span>Expected harvest</span><b id="plot-yield-${i}"></b><small>tonnes · whole field</small></div><div><span>Irrigation so far</span><b id="plot-water-${i}"></b><small id="plot-volume-${i}"></small></div><div><span>Soil nitrogen</span><b id="plot-n-${i}"></b><small>kg N/ha · estimated</small></div></div><div class="plot-foot"><span id="plot-loss-${i}"></span><span id="plot-cover-${i}"></span></div><details class="plan-sequence"><summary>View crop sequence</summary><ol>${p.rows.map(r=>`<li><span>${seasonName(r)}</span><b>${crop(r.id).name}</b></li>`).join('')}</ol></details>${p.audit.issues.length?`<details class="plot-warning"><summary>Review ${p.audit.issues.length} constraint${p.audit.issues.length===1?'':'s'}</summary><ul>${p.audit.issues.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></details>`:''}</article>`).join('')}</div><div class="natural-scene-note"><span>Stylized growth & weather · seasonal estimates, not a daily forecast</span><label><input id="scene-motion" type="checkbox" ${sim.motion?'checked':''}> Wind & weather motion</label></div></section>
  <section class="panel conditions-panel"><div><h2>Change the conditions</h2><p>Apply the same weather pressure to every plan.</p></div><label>Disruption year<select id="sim-shock-year">${Array.from({length:rows.length/2},(_,i)=>`<option value="${2026+i}" ${2026+i===(shock?.year||2028)?'selected':''}>${2026+i}</option>`).join('')}</select></label><div class="sim-weather-buttons">${[['normal','leaf','Normal'],['drought','sun','Drought'],['flood','cloud','Flood'],['heat','bolt','Heat']].map(([type,ic,label])=>`<button data-sim-shock="${type}" aria-pressed="${(shock?.type||'normal')===type}" class="${(shock?.type||'normal')===type?'selected':''}">${icon(ic,20)}${label}</button>`).join('')}</div><p id="sim-event" role="status"></p></section>
  <section class="panel comparison-results"><div class="comparison-results-heading"><div><div class="eyebrow">FOLLOW THE DIFFERENCE</div><h2>What each rotation leaves behind</h2><p>Same land, starting soil, residue practice, and climate. All ${rows.length} seasons included.</p></div><label>Show trajectory<select id="comparison-metric"><option value="income" ${sim.metric==='income'?'selected':''}>Net income · ৳</option><option value="water" ${sim.metric==='water'?'selected':''}>Irrigation · m³</option><option value="nitrogen" ${sim.metric==='nitrogen'?'selected':''}>Soil nitrogen · kg/ha</option></select></label></div><div class="trajectory-legend">${visible.map(p=>`<span>${dot(p)}${esc(p.name)}</span>`).join('')}</div><div class="trajectory-scroll">${trajectory(visible,farm,sim.metric)}</div><p class="trajectory-note">Lines connect harvest estimates. The dotted marker follows playback.</p>${summaryTable(visible,config,farm)}<div class="comparison-assumptions"><p>Only TerraLoop adaptive replans after a disruption. Original, benchmark, water-saving, and custom crop sequences stay fixed.</p><p>Over-budget comparisons assume additional irrigation is supplied; their yields do not include a penalty for unavailable water. Income uses illustrative prices and input costs.</p></div></section>
  <section class="panel padded"><div class="section-title"><div><h2>A season, from seed to soil</h2><p>Growth, flowering, ripening, and harvest leave a different field for the next crop.</p></div></div><div class="natural-stages">${PHASES.map((p,i)=>`<button data-sim-phase="${i}"><span>0${i+1}</span>${p}</button>`).join('')}</div><p class="small muted">Growth stages are illustrative, with shared timing across crops. Harvest totals and nitrogen carry-over come from the seasonal rotation model.</p></section>`;
}

export function mountSimulation({farm,rows,shock,sim,workspace,config,onScenario,onConfig,onDraft,onHorizon}) {
  if(!workspace.visible.length)return ()=>{};
  const $=s=>document.querySelector(s),plans=workspace.visible;
  const canvases=plans.map((_,i)=>$(`#field-${i}`));
  const drawers=canvases.map(canvas=>createFieldScene(canvas,farm.boundary));
  let raf=0,last=0,lastPaint=0,disposed=false;
  sim.cursor=Math.min(rows.length,Math.max(0,sim.cursor));
  $('#sim-speed').value=String(sim.speed);
  const text=(id,value)=>{const el=$(id);if(el&&el.textContent!==String(value))el.textContent=String(value);};
  function paint() {
    if(disposed)return;
    const frames=plans.map(p=>simulationFrame(p.rows,sim.cursor,farm)),current=frames[0];
    text('#sim-season-title',`${current.row.year} · ${current.row.season==='wet'?'Kharif':'Rabi'}`);
    text('#sim-phase-badge',current.phase);
    text('#sim-time-text',`Season ${current.index+1} of ${rows.length} · ${Math.round(current.progress*100)}% through season`);
    $('#sim-cursor').value=sim.cursor;$('#sim-cursor').setAttribute('aria-valuetext',`${seasonName(current.row)}, ${current.phase}`);
    frames.forEach((frame,i)=>{
      const original=workspace.library.find(p=>p.id==='original').rows[frame.index];
      text(`#plot-crop-${i}`,frame.crop.name);
      text(`#plot-state-${i}`,plans[i].id==='adaptive'&&original.id!==frame.row.id?'Escape route activated':frame.crop.family);
      text(`#plot-yield-${i}`,frame.expectedHarvest.toFixed(2));text(`#plot-water-${i}`,`${fmt(frame.irrigation)} mm`);
      text(`#plot-volume-${i}`,`${fmt(frame.waterVolume)} m³ · this season`);text(`#plot-n-${i}`,fmt(frame.nitrogen));
      text(`#plot-loss-${i}`,frame.row.shock?`${frame.row.shock} · ${frame.stress}% yield loss`:'Normal seasonal conditions');
      text(`#plot-cover-${i}`,frame.crop.id==='fallow'?'Rest & residue':`${frame.canopy}% crop cover`);
      canvases[i].setAttribute('aria-label',`${plans[i].name}: ${frame.crop.name}, ${frame.phase}, ${frame.canopy}% modeled crop cover, ${frame.stress}% projected yield loss.`);
      drawers[i](frame,sim.time,sim.motion);
    });
    text('#sim-event',shock?(current.row.year<shock.year?`${shock.type} arrives in ${shock.year}. Earlier seasons remain unchanged.`:current.row.year===shock.year?`${shock.type[0].toUpperCase()+shock.type.slice(1)} in ${shock.year}. Each crop responds differently; compare its yield loss and irrigation demand.`:'The disruption has passed. Follow its effects through the remaining rotation.'):'Normal conditions. Introduce a disruption to explore how each rotation responds.');
    document.querySelectorAll('[data-sim-season]').forEach(el=>{const active=+el.dataset.simSeason===current.index;el.classList.toggle('active',active);el.classList.toggle('completed',+el.dataset.simSeason<current.harvested);el.setAttribute('aria-pressed',active);});
    document.querySelectorAll('[data-sim-phase]').forEach(el=>{const active=PHASES[+el.dataset.simPhase]===current.phase;el.classList.toggle('active',active);el.setAttribute('aria-pressed',active);});
    $('#sim-prev').disabled=sim.cursor===0;$('#sim-next').disabled=sim.cursor===rows.length;
    text('#sim-play span',sim.playing?'Pause':'Play');$('#sim-play').firstChild.textContent=sim.playing?'Ⅱ ':'▶ ';$('#sim-play').setAttribute('aria-label',sim.playing?'Pause simulation':'Play simulation');
    const x=68+sim.cursor/rows.length*840;$('#trajectory-cursor').setAttribute('x1',x);$('#trajectory-cursor').setAttribute('x2',x);
  }
  function pause(){sim.playing=false;last=0;cancelAnimationFrame(raf);}
  function tick(time){
    if(disposed||!sim.playing)return;
    const elapsed=last?Math.min(time-last,200):0;last=time;
    sim.time+=elapsed*sim.speed;sim.cursor=Math.min(rows.length,sim.cursor+elapsed/10000*sim.speed);
    if(sim.cursor===rows.length)sim.playing=false;
    if(time-lastPaint>33||!sim.playing){paint();lastPaint=time;}
    if(sim.playing)raf=requestAnimationFrame(tick);
  }
  function seek(position){pause();sim.cursor=Math.min(rows.length,Math.max(0,position));paint();}
  function change(next,focus){pause();onConfig(next,focus);}
  $('#sim-play').onclick=()=>{if(sim.playing){pause();paint();}else{if(sim.cursor===rows.length)sim.cursor=0;sim.playing=true;last=0;raf=requestAnimationFrame(tick);paint();}};
  $('#sim-rewind').onclick=()=>seek(0);
  $('#sim-prev').onclick=()=>seek(Math.floor(sim.cursor)-1);
  $('#sim-next').onclick=()=>seek(Math.floor(sim.cursor)+1);
  $('#sim-cursor').oninput=e=>seek(+e.target.value);
  $('#sim-speed').onchange=e=>{sim.speed=+e.target.value;};
  $('#scene-motion').onchange=e=>{sim.motion=e.target.checked;paint();};
  document.querySelectorAll('[data-sim-season]').forEach(el=>el.onclick=()=>seek(+el.dataset.simSeason));
  document.querySelectorAll('[data-sim-phase]').forEach(el=>el.onclick=()=>seek(Math.min(rows.length-1,Math.floor(sim.cursor))+[0,.13,.36,.59,.80,.96][+el.dataset.simPhase]));
  document.querySelectorAll('[data-sim-shock]').forEach(el=>el.onclick=()=>{pause();const year=+$('#sim-shock-year').value;sim.cursor=el.dataset.simShock==='normal'?sim.cursor:(year-2026)*2+.59;onScenario(el.dataset.simShock,year);});
  $('#sim-shock-year').onchange=e=>{if(shock){pause();sim.cursor=(+e.target.value-2026)*2+.59;onScenario(shock.type,+e.target.value);}};
  document.querySelectorAll('[data-compare-toggle]').forEach(el=>el.onclick=()=>{
    const id=el.dataset.compareToggle,next=structuredClone(config),selected=next.selected.includes(id);
    if(selected&&next.selected.length===1){text('#comparison-message','Keep at least one rotation visible.');return;}
    if(!selected&&next.selected.length>=MAX_VISIBLE)return;
    next.selected=selected?next.selected.filter(p=>p!==id):[...next.selected,id];
    if(!next.selected.includes(next.reference))next.reference=next.selected[0];
    change(next);
  });
  $('#comparison-reference').onchange=e=>change({...config,reference:e.target.value},'comparison-reference');
  $('#comparison-horizon').onchange=e=>{pause();onHorizon(+e.target.value);};
  $('#comparison-metric').onchange=e=>{sim.metric=e.target.value;change(config,'comparison-metric');};
  $('#add-custom').onclick=()=>{
    if(config.custom.length>=MAX_CUSTOM||config.selected.length>=MAX_VISIBLE)return;
    const id=`custom-${crypto.randomUUID()}`,name=`My rotation ${config.custom.length+1}`;
    const source=plans.find(p=>p.id===config.reference)||plans[0];
    const next=structuredClone(config);next.custom.push({id,name,crops:source.rows.map(r=>r.id)});next.selected.push(id);sim.editor=id;change(next,'custom-name');
  };
  document.querySelectorAll('[data-edit-rotation]').forEach(el=>el.onclick=()=>{sim.editor=el.dataset.editRotation;change(config,'custom-name');});
  if($('#custom-name')) {
    const edit=mutate=>{const next=structuredClone(config);mutate(next.custom.find(p=>p.id===sim.editor));return next;};
    $('#custom-name').oninput=e=>{config.custom.find(p=>p.id===sim.editor).name=e.target.value.trim()||'My rotation';onDraft(config);};
    $('#custom-name').onkeydown=e=>{if(e.key==='Enter'){sim.editor=null;change(config,'add-custom');}};
    document.querySelectorAll('[data-custom-crop]').forEach(el=>el.onchange=e=>change(edit(p=>{p.crops[+el.dataset.customCrop]=e.target.value;}),el.id));
    $('#repeat-year').onclick=()=>change(edit(p=>{p.crops=p.crops.map((_,i)=>p.crops[i%2]);}),'repeat-year');
    $('#close-editor').onclick=()=>{sim.editor=null;change(config,'add-custom');};
    $('#remove-custom').onclick=()=>{const next=structuredClone(config);next.custom=next.custom.filter(p=>p.id!==sim.editor);next.selected=next.selected.filter(p=>p!==sim.editor);sim.editor=null;change(next,'add-custom');};
  }
  const resize=new ResizeObserver(()=>paint());canvases.forEach(c=>resize.observe(c));paint();
  const visibility=()=>{if(document.hidden&&sim.playing){pause();paint();}};document.addEventListener('visibilitychange',visibility);
  return ()=>{disposed=true;pause();resize.disconnect();document.removeEventListener('visibilitychange',visibility);};
}
