const EARTH_RADIUS = 6371008.8;
const rad = degrees => degrees * Math.PI / 180;
export const inSupportedRegion = ([lat, lon]) => Number.isFinite(lat) && Number.isFinite(lon) && lat >= 20.5 && lat <= 26.7 && lon >= 88 && lon <= 92.7;

function project(points) {
  const origin = points[0];
  const latScale = Math.cos(rad(points.reduce((sum, p) => sum + p[0], 0) / points.length));
  return points.map(([lat, lon]) => [EARTH_RADIUS * rad(lon - origin[1]) * latScale, EARTH_RADIUS * rad(lat - origin[0])]);
}

export function polygonAreaHa(points) {
  if (points.length < 3) return 0;
  // Local equal-scale projection; suitable for small farm parcels, not a legal survey.
  const xy = project(points);
  return Math.abs(xy.reduce((sum, p, i) => {
    const q = xy[(i + 1) % xy.length];
    return sum + p[0] * q[1] - q[0] * p[1];
  }, 0)) / 20000;
}

export function polygonCenter(points) {
  const xy = project(points);
  let area = 0, x = 0, y = 0;
  xy.forEach((p, i) => {
    const q = xy[(i + 1) % xy.length];
    const cross = p[0] * q[1] - q[0] * p[1];
    area += cross; x += (p[0] + q[0]) * cross; y += (p[1] + q[1]) * cross;
  });
  if (Math.abs(area) < 1e-8) return [...points[0]];
  const scale = Math.cos(rad(points.reduce((sum, p) => sum + p[0], 0) / points.length));
  return [points[0][0] + y / (3 * area) / EARTH_RADIUS * 180 / Math.PI, points[0][1] + x / (3 * area) / (EARTH_RADIUS * scale) * 180 / Math.PI];
}

const orient = (a, b, c) => (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
const onSegment = (a, b, c) => Math.abs(orient(a,b,c)) < 1e-7 && c[0] >= Math.min(a[0],b[0])-1e-7 && c[0] <= Math.max(a[0],b[0])+1e-7 && c[1] >= Math.min(a[1],b[1])-1e-7 && c[1] <= Math.max(a[1],b[1])+1e-7;
function crosses(a,b,c,d) {
  return (orient(a,b,c)*orient(a,b,d)<0 && orient(c,d,a)*orient(c,d,b)<0) || onSegment(a,b,c) || onSegment(a,b,d) || onSegment(c,d,a) || onSegment(c,d,b);
}
export function validateBoundary(points) {
  if (!Array.isArray(points) || points.length < 3) return 'Add at least three corners to outline your field.';
  if (points.length > 80) return 'Use up to 80 corners for a single field.';
  if (!points.every(p => Array.isArray(p) && p.length === 2 && inSupportedRegion(p))) return 'Choose a field in Bangladesh. The crop model currently supports this region.';
  const xy = project(points);
  for (let i = 0; i < xy.length; i++) {
    const a=xy[i], b=xy[(i+1)%xy.length];
    if (Math.hypot(a[0]-b[0],a[1]-b[1]) < .25) return 'Two corners are too close together. Move or undo the last corner.';
    for (let j = i+1; j < xy.length; j++) {
      if (j===i+1 || (i===0 && j===xy.length-1)) continue;
      if (crosses(a,b,xy[j],xy[(j+1)%xy.length])) return 'The boundary crosses itself. Move a corner or undo the last point.';
    }
  }
  const area=polygonAreaHa(points);
  if (area < .001) return 'The outline is too small or flat. Mark a field of at least 10 m².';
  if (area > 10000) return 'That outline exceeds 10,000 ha. Zoom in and select a smaller farm.';
  return null;
}
export function parseCoordinates(text) {
  const match = text.trim().match(/^(-?\d+(?:\.\d+)?)\s*[,;]\s*(-?\d+(?:\.\d+)?)$/);
  return match ? [+match[1],+match[2]] : null;
}
export function normalizedBoundary(points) {
  if (!points?.length || validateBoundary(points)) return [[.08,.08],[.92,.08],[.92,.92],[.08,.92]];
  const xy=project(points), xs=xy.map(p=>p[0]), ys=xy.map(p=>p[1]);
  const minX=Math.min(...xs), minY=Math.min(...ys), maxX=Math.max(...xs), maxY=Math.max(...ys);
  const size=Math.max(maxX-minX,maxY-minY);
  return xy.map(([x,y])=>[.08+(x-minX+(size-maxX+minX)/2)/size*.84,.92-(y-minY+(size-maxY+minY)/2)/size*.84]);
}

export function savedSelection(draft) {
  if (draft.points.length) {
    const error=validateBoundary(draft.points);
    if(error) throw Error(error);
    if(draft.drawing) throw Error('Finish the outline before saving your field.');
    const [lat,lon]=polygonCenter(draft.points);
    return {lat,lon,area:polygonAreaHa(draft.points),boundary:draft.points.map(p=>[...p]),locationSource:'Drawn field boundary'};
  }
  if(!inSupportedRegion([draft.lat,draft.lon])) throw Error('Choose a location in Bangladesh for this crop model.');
  return {lat:draft.lat,lon:draft.lon,boundary:null,locationSource:'Map pin'};
}
