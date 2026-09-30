import {polygonAreaHa,polygonCenter,validateBoundary,parseCoordinates,inSupportedRegion,savedSelection} from './geo.mjs';

const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function farmMapHTML(farm,icon) {
  return `<div class="page-heading"><div><div class="eyebrow">START WITH YOUR LAND</div><h1>A place to grow your future.</h1><p>Find your farm, zoom in, and mark the land you want to plan.</p></div><button class="btn secondary" data-action="farm">${icon('settings',17)} Farm settings</button></div>
  <div class="land-layout"><section class="land-map-panel panel"><form id="place-search" class="place-search"><label class="sr-only" for="place-query">Town or latitude, longitude</label><input id="place-query" placeholder="Search a town or paste latitude, longitude" autocomplete="off" maxlength="160"><button class="btn" type="submit">Find place</button></form><div id="place-results" class="place-results" aria-live="polite"></div>
  <div class="map-toolbar"><div class="map-mode"><button id="map-pin" type="button">${icon('pin',16)} Drop a pin</button><button id="map-draw" type="button">${icon('edit',16)} Draw boundary</button></div><label class="map-layer-label">View <select id="map-layer"><option value="satellite">Satellite · Esri</option><option value="street">Street map · OSM</option></select></label></div>
  <div id="farm-map" class="farm-map" aria-label="Interactive farm selection map. Use arrow keys to pan and plus or minus to zoom." tabindex="0"></div><div id="map-load-status" class="map-load-status" role="status">Loading map imagery…</div>
  <div class="map-help"><span>${icon('info',16)} Click corners around your field, then finish the boundary. Drag a corner to adjust it.</span><button id="map-center-point" class="text-button">Use map centre</button></div>
  <div class="map-credit">Town search: <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a> / <a href="https://www.geonames.org/" target="_blank" rel="noopener">GeoNames</a>. Imagery is historical; it does not establish land ownership.</div></section>
  <aside class="selection-panel panel padded"><span class="eyebrow">YOUR FIELD SELECTION</span><h2 id="selection-title">${farm.boundary?'Your saved boundary':'Set your farm location'}</h2><p id="selection-instruction">Pick a point or trace a field boundary.</p><div class="selection-area"><strong id="selection-area">${farm.boundary?polygonAreaHa(farm.boundary).toFixed(3):Number(farm.area).toFixed(3)}</strong><span>hectares</span><small id="selection-area-note">${farm.boundary?'Estimated from your outline':'Manual farm area · draw to measure'}</small></div>
  <div class="selection-facts"><div><span>Latitude</span><b id="selection-lat">${farm.lat.toFixed(6)}</b></div><div><span>Longitude</span><b id="selection-lon">${farm.lon.toFixed(6)}</b></div><div><span>Boundary corners</span><b id="selection-corners">${farm.boundary?.length||0}</b></div></div>
  <div class="boundary-actions"><button class="btn secondary" id="boundary-undo">Undo corner</button><button class="btn secondary" id="boundary-finish">Finish outline</button><button class="text-button" id="boundary-clear">Clear draft outline</button></div>
  <p id="selection-error" class="field-error" role="alert"></p><button class="btn save-selection" id="save-selection">Save farm selection</button><button class="text-button" id="selection-revert">Revert to saved farm</button>
  <div class="selection-next"><b>Connected to your farm</b><p>The saved centre sets the NASA climate location. Field area scales irrigation volume and farm income.</p></div><p class="small muted">Boundary area is approximate. The crop model currently supports Bangladesh. Your outline stays in this browser.</p></aside></div>`;
}

export function mountFarmMap({farm,onSave,notify}) {
  const L=window.L;
  if (!L) {document.querySelector('#farm-map').innerHTML='<div class="map-unavailable"><h3>The map library could not load.</h3><p>Reload the page, or use Farm settings to enter coordinates.</p></div>';document.querySelector('#save-selection').disabled=true;return ()=>{};}
  const $=s=>document.querySelector(s);
  const lifetime=new AbortController();
  let draft={lat:farm.lat,lon:farm.lon,points:structuredClone(farm.boundary||[]),drawing:false};
  let mode=draft.points.length?'boundary':'pin',dirty=false,mapErrors=0,lastSearch=0;
  const searchCache=new Map();
  // Scene navigation can remove the map immediately; avoid a pending CSS zoom callback.
  const map=L.map('farm-map',{zoomControl:true,scrollWheelZoom:true,doubleClickZoom:false,zoomAnimation:false,maxZoom:20}).setView([farm.lat,farm.lon],farm.boundary?17:15);
  const street=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:20,maxNativeZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>'});
  const satellite=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:20,maxNativeZoom:19,attribution:'Imagery &copy; <a href="https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9" target="_blank" rel="noopener">Esri</a>, Maxar, Earthstar Geographics, and the GIS User Community'});
  for(const layer of [street,satellite]) {
    layer.on('tileload',()=>{if(!lifetime.signal.aborted){$('#map-load-status').textContent='';}});
    layer.on('tileerror',()=>{if(!lifetime.signal.aborted&&++mapErrors>2)$('#map-load-status').textContent='Some map tiles could not load. Try the other map view or zoom out.';});
  }
  satellite.addTo(map);
  const shapes=L.layerGroup().addTo(map),handles=L.layerGroup().addTo(map);
  L.control.scale({imperial:false,position:'bottomleft'}).addTo(map);
  if(draft.points.length)map.fitBounds(draft.points,{padding:[45,45],maxZoom:19});
  const pinIcon=L.divIcon({className:'farm-pin-icon',html:'<span></span>',iconSize:[26,26],iconAnchor:[13,13]});
  function refresh() {
    if(lifetime.signal.aborted)return;
    shapes.clearLayers(); handles.clearLayers();
    const points=draft.points;
    if(points.length) {
      if(points.length>=3)L.polygon(points,{color:'#d1ee9f',weight:3,fillColor:'#82ad54',fillOpacity:.28,dashArray:draft.drawing?'7 5':null,interactive:false}).addTo(shapes);
      else L.polyline(points,{color:'#d1ee9f',weight:3,interactive:false}).addTo(shapes);
      points.forEach((p,i)=>{
        const handle=L.marker(p,{draggable:true,title:`Boundary corner ${i+1}. Drag to adjust.`,icon:L.divIcon({className:'boundary-corner',html:`<span>${i+1}</span>`,iconSize:[24,24],iconAnchor:[12,12]})}).addTo(handles);
        handle.on('dragend',e=>{const p=e.target.getLatLng();draft.points[i]=[p.lat,p.lng];dirty=true;refresh();});
        handle.on('click',()=>{if(i===0&&draft.drawing&&points.length>=3)finish();});
      });
    } else {
      L.marker([draft.lat,draft.lon],{draggable:true,icon:pinIcon,title:'Farm location. Drag to move.'}).on('dragend',e=>{const p=e.target.getLatLng();draft.lat=p.lat;draft.lon=p.lng;dirty=true;refresh();}).addTo(handles);
    }
    let point=points.length>=3&&!validateBoundary(points)?polygonCenter(points):[draft.lat,draft.lon];
    $('#selection-title').textContent=draft.drawing?'Trace your farm boundary':points.length?'Your field boundary':'Your farm pin';
    $('#selection-instruction').textContent=draft.drawing?`${points.length} corners added. Click the map to add another.`:dirty?'Ready to save this selection.':'Pan and zoom to find your land.';
    $('#selection-area').textContent=(points.length?polygonAreaHa(points):farm.area).toFixed(3);
    $('#selection-area-note').textContent=points.length>=3?'Estimated from your outline':points.length?'Add at least three corners to measure':'Manual farm area · draw to measure';
    $('#selection-lat').textContent=point[0].toFixed(6);$('#selection-lon').textContent=point[1].toFixed(6);$('#selection-corners').textContent=points.length;
    $('#boundary-undo').disabled=!points.length;
    $('#boundary-finish').disabled=points.length<3||!draft.drawing;
    $('#boundary-clear').disabled=!points.length;
    $('#map-pin').classList.toggle('active',mode==='pin');$('#map-pin').setAttribute('aria-pressed',mode==='pin');
    $('#map-draw').classList.toggle('active',mode==='boundary');$('#map-draw').setAttribute('aria-pressed',mode==='boundary');
    $('#map-center-point').textContent=mode==='boundary'?'Add map centre as corner':'Use map centre as pin';
    const error=points.length>=3?validateBoundary(points):(!inSupportedRegion(point)?'Choose a farm in Bangladesh for the current crop model.':'');
    $('#selection-error').textContent=error||'';
    $('#save-selection').disabled=!!error||draft.drawing||!!points.length&&points.length<3;
  }
  function addPoint(p) {
    if(!inSupportedRegion([p.lat,p.lng])){notify('Choose a location in Bangladesh for this crop catalog.');return;}
    if(mode==='boundary') {
      if(!draft.drawing){notify('Select Draw boundary to start a new outline, or drag an existing corner.');return;}
      if(draft.points.length>=80){notify('Use no more than 80 corners.');return;}
      draft.points.push([p.lat,p.lng]);
    } else {draft.lat=p.lat;draft.lon=p.lng;}
    dirty=true;refresh();
  }
  function finish(){const error=validateBoundary(draft.points);if(error){$('#selection-error').textContent=error;return;}draft.drawing=false;refresh();notify('Outline finished. Save the selection to use it for your farm.');}
  map.on('click',e=>addPoint(e.latlng));
  $('#map-pin').onclick=()=>{mode='pin';draft.drawing=false;draft.points=[];dirty=true;refresh();};
  $('#map-draw').onclick=()=>{mode='boundary';draft.points=[];draft.drawing=true;dirty=true;refresh();};
  $('#boundary-undo').onclick=()=>{draft.points.pop();draft.drawing=mode==='boundary';dirty=true;refresh();};
  $('#boundary-finish').onclick=finish;
  $('#boundary-clear').onclick=()=>{draft.points=[];draft.drawing=false;mode='pin';dirty=true;refresh();};
  $('#map-center-point').onclick=()=>addPoint(map.getCenter());
  $('#selection-revert').onclick=()=>{draft={lat:farm.lat,lon:farm.lon,points:structuredClone(farm.boundary||[]),drawing:false};mode=draft.points.length?'boundary':'pin';dirty=false;map.setView([farm.lat,farm.lon],16);if(draft.points.length)map.fitBounds(draft.points,{padding:[45,45],maxZoom:19});refresh();};
  $('#map-layer').onchange=e=>{mapErrors=0;map.removeLayer(street);map.removeLayer(satellite);(e.target.value==='street'?street:satellite).addTo(map);$('#map-load-status').textContent='Loading map view…';};
  $('#save-selection').onclick=()=>{try{onSave(savedSelection(draft));}catch(error){$('#selection-error').textContent=error.message;}};
  $('#place-search').onsubmit=async e=>{
    e.preventDefault();const query=$('#place-query').value.trim();const out=$('#place-results');if(!query)return;
    const coords=parseCoordinates(query);
    if(coords){if(!inSupportedRegion(coords)){out.textContent='Enter coordinates in Bangladesh (latitude, longitude).';return;}map.setView(coords,18);out.textContent='Map centred. Click to place a pin or draw your field.';return;}
    if(Date.now()-lastSearch<1200)return;
    lastSearch=Date.now();const submit=e.target.querySelector('button');submit.disabled=true;submit.textContent='Finding…';out.textContent='Searching towns in Bangladesh…';
    try {
      let matches=searchCache.get(query.toLowerCase());
      if(!matches){const response=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json&countryCode=BD`,{signal:AbortSignal.any([lifetime.signal,AbortSignal.timeout(12000)])});if(!response.ok)throw Error('Place search is unavailable. Try coordinates instead.');const data=await response.json();matches=(data.results||[]).filter(p=>p.country_code==='BD'&&inSupportedRegion([p.latitude,p.longitude]));searchCache.set(query.toLowerCase(),matches);}
      if(lifetime.signal.aborted)return;
      out.innerHTML=matches.length?matches.map((p,i)=>`<button type="button" class="place-result" data-place="${i}"><b>${escape(p.name)}</b><span>${escape([p.admin2,p.admin1,p.country].filter(Boolean).join(', '))}</span></button>`).join(''):'No matching town found. Try a nearby town, or paste latitude, longitude.';
      out.querySelectorAll('[data-place]').forEach(button=>button.onclick=()=>{const p=matches[+button.dataset.place];map.setView([p.latitude,p.longitude],15);out.textContent=`Centred on ${p.name}. Zoom in to select your land.`;});
    }catch(error){if(!lifetime.signal.aborted)out.textContent=error.name==='TimeoutError'?'Search timed out. Try coordinates instead.':error.message;}
    finally{if(!lifetime.signal.aborted){submit.disabled=false;submit.textContent='Find place';}}
  };
  refresh();const resize=new ResizeObserver(()=>map.invalidateSize({pan:false}));resize.observe($('#farm-map'));
  return ()=>{lifetime.abort();resize.disconnect();map.remove();};
}
