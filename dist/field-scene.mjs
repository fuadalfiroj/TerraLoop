import {normalizedBoundary} from './geo.mjs';

const rand = n => {const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
function inside([x,y], poly) {
  let yes=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++) {
    const a=poly[i],b=poly[j];
    if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])yes=!yes;
  }
  return yes;
}
const project=([x,y])=>[300+(x-.5)*(290+y*285),129+y*184];
function path(ctx,points){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();}
function ellipse(ctx,x,y,rx,ry,color,angle=0){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),angle,0,Math.PI*2);ctx.fill();}

const profiles={
  rice:{height:35,kind:'grass',tone:'#6d943b'}, wheat:{height:34,kind:'grain',tone:'#728d39'},
  maize:{height:62,kind:'maize',tone:'#4c7e36'}, sorghum:{height:55,kind:'grain',tone:'#56803d'},
  jute:{height:62,kind:'leaf',tone:'#4c793b'}, mustard:{height:35,kind:'flower',tone:'#66923f'},
  sesame:{height:42,kind:'flower',tone:'#60813c'}, potato:{height:19,kind:'bush',tone:'#4e8039'},
  lentil:{height:20,kind:'bush',tone:'#709449'}, chickpea:{height:23,kind:'bush',tone:'#6d944c'},
  mung:{height:24,kind:'bush',tone:'#548e40'}
};

function plant(ctx, x, y, size, seed, frame, time, motion) {
  const c=frame.crop, profile=profiles[c.id];
  if(!profile) return;
  const damaged=rand(seed+6)<frame.row.loss;
  const growth=frame.growth*(.78+rand(seed+2)*.3)*(damaged?.63:1);
  const h=profile.height*growth*size;
  if(h<1.3)return;
  const senescent=Math.min(1,frame.maturity)*(c.family==='Poaceae'?1:.7);
  const dry=damaged&&['drought','heat'].includes(frame.row.shock);
  const leaf=dry?'#a7914c':senescent>.5?'#a49b48':profile.tone;
  const highlight=dry?'#c4ae66':senescent>.5?'#ccb65c':'#8caf55';
  const sway=motion?Math.sin(time*.0013+seed*.4)*2.2*growth*size:0;
  const bend=sway+(dry?3*size:0), top=y-h;
  ctx.strokeStyle=senescent>.5?'#ab9552':'#577b36';ctx.lineWidth=Math.max(.65,1.05*size);
  ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x-bend*.3,y-h*.5,x+bend,top);ctx.stroke();
  if(profile.kind==='grass') {
    for(let k=-2;k<=2;k++) {
      ctx.strokeStyle=k%2?highlight:leaf;ctx.lineWidth=1.35*size;
      ctx.beginPath();ctx.moveTo(x+k*.6,y);ctx.quadraticCurveTo(x+k*4*size+bend,y-h*.55,x+k*3*size+bend,top+Math.abs(k)*3*size);ctx.stroke();
    }
  } else if(profile.kind==='bush') {
    for(let k=0;k<7;k++) {
      const a=k*2.399+seed, ex=x+Math.cos(a)*h*.43+bend,ey=top+h*.25+Math.sin(a)*h*.28;
      ctx.strokeStyle=leaf;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(ex,ey);ctx.stroke();
      ellipse(ctx,ex,ey,(3.4+growth)*size,2.5*size,k%2?leaf:highlight,a*.5);
      if(frame.phase==='Flowering'&&k%3===0)ellipse(ctx,ex,ey-2*size,1.15*size,.85*size,c.id==='potato'?'#e7d5e6':'#f3dfb5');
    }
  } else {
    const maize=profile.kind==='maize';
    for(let k=0;k<5;k++) {
      const side=k%2?-1:1, baseY=y-h*(.22+k*.13),baseX=x+bend*(.22+k*.13);
      const reach=(maize?13:6)*size*growth, rise=(maize?7:3)*size*growth;
      ctx.fillStyle=k%2?leaf:highlight;ctx.beginPath();ctx.moveTo(baseX,baseY);
      ctx.quadraticCurveTo(baseX+side*reach*.5,baseY-rise*1.8,baseX+side*reach,baseY-rise*.5);
      ctx.quadraticCurveTo(baseX+side*reach*.35,baseY+1.6*size,baseX,baseY);ctx.fill();
    }
  }
  if(frame.progress>.48&&profile.kind==='flower') {
    for(let k=0;k<4;k++)ellipse(ctx,x+bend+(rand(seed+k+20)-.5)*7*size,top+k*2*size,1.9*size,1.6*size,c.id==='mustard'?'#e6cd4a':'#eadbbd');
  }
  if(frame.progress>.57&&['grain','grass','maize'].includes(profile.kind)) {
    const grainColor=c.id==='sorghum'?'#a26f3e':senescent>.4?'#d5b45e':'#afb771';
    for(let k=0;k<5;k++) {
      ellipse(ctx,x+bend+(k%2?1.3:-1.3)*size,top+(k-3)*1.6*size,1.4*size,2.2*size,grainColor,k%2?.4:-.4);
    }
  }
}

export function createFieldScene(canvas, boundary) {
  const ctx=canvas.getContext('2d'),poly=normalizedBoundary(boundary),outline=poly.map(project);
  const plants=[];
  for(let row=0;row<16;row++)for(let col=0;col<25;col++) {
    const seed=row*31+col,point=[.04+col*.038+(rand(seed)-.5)*.013,.04+row*.059+(rand(seed+1)-.5)*.014];
    if(inside(point,poly))plants.push({point,seed});
  }
  return function draw(frame,time=0,motion=true) {
    const w=canvas.clientWidth||600,h=canvas.clientHeight||330,dpr=Math.min(2,window.devicePixelRatio||1);
    if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
    ctx.setTransform(canvas.width/600,0,0,canvas.height/330,0,0);ctx.clearRect(0,0,600,330);
    const drought=frame.row.shock==='drought',flood=frame.row.shock==='flood',heat=frame.row.shock==='heat';
    const wet=frame.row.season==='wet',clock=motion?time:0;
    const sky=ctx.createLinearGradient(0,0,0,160);
    sky.addColorStop(0,flood?'#a3b7b4':drought||heat?'#ded3b3':wet?'#c4d8d4':'#bdd9dc');sky.addColorStop(1,'#f2eed8');
    ctx.fillStyle=sky;ctx.fillRect(0,0,600,155);
    const sun=ctx.createRadialGradient(460,44,3,460,44,65);sun.addColorStop(0,heat?'#fff0acd9':'#fff9d7d0');sun.addColorStop(1,'#fff9d700');ctx.fillStyle=sun;ctx.fillRect(392,0,140,115);
    for(let i=0;i<4;i++) {
      const x=((i*172+clock*.004)%780)-90,y=35+rand(i+3)*31;
      ellipse(ctx,x,y,48,9,flood?'#9daead80':'#ffffef80');ellipse(ctx,x+22,y-7,30,12,flood?'#9daead80':'#ffffef75');
    }
    // Stylized surroundings provide depth, without implying a surveyed landscape.
    ctx.fillStyle=drought?'#a6a171':'#8fa681';ctx.beginPath();ctx.moveTo(0,124);ctx.bezierCurveTo(140,84,240,135,380,107);ctx.bezierCurveTo(460,89,525,120,600,105);ctx.lineTo(600,190);ctx.lineTo(0,190);ctx.fill();
    const meadow=ctx.createLinearGradient(0,119,0,330);meadow.addColorStop(0,drought?'#b0ab78':'#96aa7c');meadow.addColorStop(1,drought?'#c2b98b':'#adba85');ctx.fillStyle=meadow;ctx.fillRect(0,135,600,195);
    for(let i=0;i<150;i++) {
      const x=rand(i+950)*600,y=136+rand(i+1250)*194;
      ctx.strokeStyle=drought?'#90865035':'#68884f40';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+1,y-2-rand(i)*3);ctx.stroke();
    }
    ctx.save();ctx.shadowColor='#45563535';ctx.shadowBlur=10;ctx.shadowOffsetY=4;path(ctx,outline);ctx.fillStyle='#786a45';ctx.fill();ctx.restore();
    ctx.save();path(ctx,outline);ctx.clip();
    const soil=ctx.createLinearGradient(0,126,0,315);soil.addColorStop(0,drought?'#ae9160':'#958057');soil.addColorStop(1,drought?'#c2a575':'#ab9366');ctx.fillStyle=soil;ctx.fillRect(0,120,600,210);
    for(let y=.03;y<1;y+=.059) {
      const a=project([0,y]),b=project([1,y]);ctx.strokeStyle='#67512c30';ctx.lineWidth=2.3;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();
      ctx.strokeStyle='#e3cc971f';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a[0],a[1]+2);ctx.lineTo(b[0],b[1]+2);ctx.stroke();
    }
    for(let i=0;i<340;i++)ellipse(ctx,rand(i+220)*600,125+rand(i+480)*198,.5+rand(i)*1.6,.4,'#60492725');
    if(drought)for(let i=0;i<35;i++) {
      const x=rand(i+511)*600,y=140+rand(i+222)*175;ctx.strokeStyle='#79603b48';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(x-5,y-3);ctx.lineTo(x,y);ctx.lineTo(x+6,y-1);ctx.moveTo(x,y);ctx.lineTo(x+2,y+5);ctx.stroke();
    }
    if((frame.crop.id==='rice'&&wet)||flood) {
      ctx.fillStyle=flood?'#83adbc85':'#9bb7ab50';ctx.fillRect(0,125,600,195);
      for(let i=0;i<18;i++){const x=rand(i+404)*600,y=135+rand(i+405)*170;ctx.strokeStyle='#d2e5db80';ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse(x,y,7+Math.sin(clock*.002+i)*2,1.2,0,0,Math.PI);ctx.stroke();}
    }
    ctx.restore();
    path(ctx,outline);ctx.strokeStyle='#61713c88';ctx.lineWidth=3;ctx.stroke();
    for(const {point,seed} of plants) {
      const [x,y]=project(point),size=.43+point[1]*.69;
      const harvested=frame.harvestProgress>0&&point[0]<frame.harvestProgress;
      if(harvested||frame.crop.id==='fallow') {
        ctx.strokeStyle='#beaa75';ctx.lineWidth=1.4*size;ctx.beginPath();ctx.moveTo(x-2,y);ctx.lineTo(x+2,y-1);ctx.moveTo(x,y);ctx.lineTo(x,y-3*size);ctx.stroke();
      } else {
        if(frame.growth>.1)ellipse(ctx,x+2,y,5*frame.growth*size,1.3*size,'#34482022');
        plant(ctx,x,y,size,seed,frame,clock,motion);
      }
    }
    if(flood) {
      ctx.save();path(ctx,outline);ctx.clip();ctx.fillStyle='#8fbcc92b';ctx.fillRect(0,130,600,185);ctx.restore();
      if(motion)for(let i=0;i<40;i++) {const x=rand(i+633)*640-20,y=(rand(i+222)*330+clock*.09)%330;ctx.strokeStyle='#e0eef181';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-3,y+9);ctx.stroke();}
    }
    const shade=ctx.createLinearGradient(0,300,0,330);shade.addColorStop(0,'#50633700');shade.addColorStop(1,'#50633722');ctx.fillStyle=shade;ctx.fillRect(0,290,600,40);
  };
}
