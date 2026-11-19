/* subhrojyotidey.com — chapter engine
   One particle system, five states of the same matter. Scroll is the story.
   Hero: a calm drifting field — raw potential (cursor bends it, click ripples it).
   01 the wheel (building) · 02 one dart becomes many (scale)
   03 the OralVac silhouette (precision) · 04 a quiet neural constellation (intelligence).
   Craft rules: one idea per state, shapes face the camera and hold still;
   motion lives in the scroll-scrubbed transitions, never in free-running spin. */
(function(){
  "use strict";

  var PATENTS=[
    {no:"US20240090656A1", title:"Syringe Toothbrush", status:"Pending", granted:false, img:"assets/patent-1.svg",
     desc:"Syringe-based fluid delivery integrated with brushing mechanics — waterless oral hygiene for clinical and bedside environments.",
     link:"https://patents.google.com/patent/US20240090656A1"},
    {no:"US12677937B2", title:"Electric Toothbrush", status:"Granted · 2026", granted:true, img:"assets/patent-2.svg",
     desc:"Electrically-actuated toothbrush system for assisted oral care in hospital and long-term care settings.",
     link:"https://patents.google.com/patent/US20240090657A1"},
    {no:"US20240245497A1", title:"Sedation Toothbrush", status:"Pending", granted:false, img:"assets/patent-3.svg",
     desc:"Oral care instrument engineered for sedated or unconscious patients in ICU and surgical environments.",
     link:"https://patents.google.com/patent/US20240245497A1"},
    {no:"US12662051B2", title:"Automatic Trailer Hitch", status:"Granted · 2026", granted:true, img:"assets/patent-4.svg",
     desc:"Automated coupling mechanism eliminating manual alignment during hitching — safer solo operation.",
     link:"https://patents.google.com/patent/US20240166003A1"},
    {no:"US20250275834A1", title:"Artificial Palatal Expansion Kit", status:"Pending", granted:false, img:"assets/patent-5.svg",
     desc:"Rapid palatal expansion with embedded electronics for programmable force delivery and treatment monitoring.",
     link:"https://patents.google.com/patent/US20250275834A1"}
  ];

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lowPower = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) && window.innerWidth<820;
  var targetProgress=0, displayProgress=0, manualUntil=0, playing=false, playT=0, motionPaused=reduced;
  var currentPhase=-1, inSummary=false;

  /* ---------- UI wiring (works even if WebGL fails) ---------- */
  var railFill=document.getElementById('railFill');
  var railBtns=[].slice.call(document.querySelectorAll('.rail button'));
  var deck=document.querySelector('.deck');
  var summaryEl=document.getElementById('summary');
  var secs=[].slice.call(document.querySelectorAll('section.chapter'));

  function setPhaseUI(p){
    if(p===currentPhase) return; currentPhase=p;
    railBtns.forEach(function(b,i){ b.classList.toggle('active', i===(inSummary?4:p)); });
  }
  function setSummaryUI(on){
    if(on===inSummary) return; inSummary=on;
    deck.style.opacity=on?'0':'1'; deck.style.pointerEvents=on?'none':'';
    deck.style.transition='opacity .4s';
    railBtns.forEach(function(b,i){ b.classList.toggle('active', i===(on?4:currentPhase)); });
  }
  var playBtn=document.getElementById('playBtn');
  function goToPhase(p, smooth){
    if(p===4){ summaryEl.scrollIntoView({behavior:reduced?'auto':'smooth'}); return; }
    playing=false; playBtn.textContent='▶ Play';
    targetProgress=(p+1)/4; manualUntil=Date.now()+(smooth?900:4000);
    setPhaseUI(p);
    if(smooth && secs[p]) secs[p].scrollIntoView({behavior:reduced?'auto':'smooth', block:'center'});
  }
  railBtns.forEach(function(b){ b.addEventListener('click', function(){ goToPhase(parseInt(b.dataset.phase,10), true); }); });

  playBtn.addEventListener('click', function(){
    playing=!playing;
    if(playing){ playT = targetProgress>=0.99 ? 0 : targetProgress; playBtn.textContent='❚❚ Stop'; manualUntil=Date.now()+60000; }
    else playBtn.textContent='▶ Play';
  });
  var motionBtn=document.getElementById('motionBtn');
  function syncMotionBtn(){ motionBtn.textContent=motionPaused?'Resume motion':'Pause motion'; motionBtn.setAttribute('aria-pressed', motionPaused?'true':'false'); }
  motionBtn.addEventListener('click', function(){ motionPaused=!motionPaused; syncMotionBtn(); });

  /* rotating contact headline — English / Hindi / French, with matching flag */
  var ctSwap=document.getElementById('ctSwap'), ctFlag=document.getElementById('ctFlag');
  if(ctSwap && !reduced){
    var CT=[
      {h:"Let's build <em>something real.</em>", l:"en", f:"us"},
      {h:"चलिए, कुछ <em>असली बनाते हैं।</em>", l:"hi", f:"in"},
      {h:"Construisons <em>quelque chose de vrai.</em>", l:"fr", f:"ca"}
    ], cti=0;
    setInterval(function(){
      ctSwap.classList.add('ct-out');
      if(ctFlag) ctFlag.classList.add('sw');
      setTimeout(function(){
        cti=(cti+1)%CT.length;
        ctSwap.innerHTML=CT[cti].h; ctSwap.setAttribute('lang',CT[cti].l);
        ctSwap.classList.remove('ct-out');
        if(ctFlag){ ctFlag.className='flag '+CT[cti].f; }
      }, 460);
    }, 4000);
  }

  /* chapter cards rise in as they enter view */
  var chCards=[].slice.call(document.querySelectorAll('section.chapter .card'));
  if(!reduced && 'IntersectionObserver' in window && chCards.length){
    chCards.forEach(function(c){ c.classList.add('pre'); });
    var rio=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in'); rio.unobserve(e.target); }
      });
    },{threshold:.15});
    chCards.forEach(function(c){ rio.observe(c); });
  }
  if(reduced) syncMotionBtn();

  /* scroll -> progress: piecewise over five stages.
     Stage 0 is the hero field; chapter i's center is exactly p = (i+1)/4. */
  var anchors=[0,1,2,3,4];
  function measure(){
    anchors=[0].concat(secs.map(function(s){ return s.offsetTop + s.offsetHeight*0.5 - window.innerHeight*0.5; }));
  }
  function progressAt(y){
    if(y<=anchors[0]) return 0;
    if(y>=anchors[4]) return 1;
    for(var i=0;i<4;i++){
      if(y<anchors[i+1]) return (i + (y-anchors[i])/(anchors[i+1]-anchors[i]))/4;
    }
    return 1;
  }
  function onScroll(){
    var y=window.scrollY||document.documentElement.scrollTop;
    setSummaryUI(y > summaryEl.offsetTop - window.innerHeight*0.55);
    if(Date.now()<manualUntil && !playing) return;
    targetProgress=progressAt(y);
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', function(){ measure(); onScroll(); });
  measure(); onScroll();

  /* counters */
  var counted=false;
  function runCounters(){
    if(counted) return; counted=true;
    [].slice.call(document.querySelectorAll('[data-count]')).forEach(function(el){
      var end=parseInt(el.dataset.count,10), t0=performance.now();
      (function step(t){ var k=Math.min(1,(t-t0)/1100); el.textContent=Math.round(end*(1-Math.pow(1-k,3))); if(k<1) requestAnimationFrame(step); })(t0);
    });
  }
  if('IntersectionObserver' in window){
    var statsEl=document.querySelector('.stats')||summaryEl;
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting) runCounters(); }); },{threshold:.15});
    io.observe(statsEl);
  } else runCounters();

  /* ---------- patent panel ---------- */
  var panel=document.getElementById('patentPanel');
  var ppNo=document.getElementById('ppNo'), ppTitle=document.getElementById('ppTitle'),
      ppStatus=document.getElementById('ppStatus'), ppDesc=document.getElementById('ppDesc'),
      ppLink=document.getElementById('ppLink'), ppImg=document.getElementById('ppImg');
  function openPatent(i){
    var p=PATENTS[i];
    ppNo.textContent=p.no; ppTitle.textContent=p.title; ppStatus.textContent=p.status;
    ppStatus.className='pp-status'+(p.granted?'':' pending');
    ppDesc.textContent=p.desc; ppLink.href=p.link; ppImg.src=p.img;
    panel.classList.add('open');
  }
  document.getElementById('ppClose').addEventListener('click', function(){ panel.classList.remove('open'); });

  /* ---------- WebGL ---------- */
  var canvas=document.getElementById('gl'), renderer;
  if(typeof THREE==='undefined'){ document.getElementById('fallback').style.display='flex'; return; }
  try{
    renderer=new THREE.WebGLRenderer({canvas:canvas, antialias:!lowPower, alpha:true, powerPreference:'high-performance'});
  }catch(e){ document.getElementById('fallback').style.display='flex'; return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, lowPower?1.5:2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.15;

  var scene=new THREE.Scene();
  scene.fog=new THREE.FogExp2(0x070b0f, 0.016);
  var camera=new THREE.PerspectiveCamera(52, 1, 0.1, 300);
  camera.position.set(0, 4.5, 30);

  var pmrem=new THREE.PMREMGenerator(renderer);
  if(THREE.RoomEnvironment){ scene.environment=pmrem.fromScene(new THREE.RoomEnvironment(), .04).texture; }

  scene.add(new THREE.AmbientLight(0x88aabb, .7));
  var key=new THREE.DirectionalLight(0xbfefff, 2.2); key.position.set(8,14,10); scene.add(key);
  var rim=new THREE.DirectionalLight(0xffb454, 1.4); rim.position.set(-12,4,-8); scene.add(rim);
  var pt=new THREE.PointLight(0x3ee6ff, 60, 60); pt.position.set(0,2,6); scene.add(pt);

  var grid=new THREE.GridHelper(90, 45, 0x1d4b5a, 0x12242e);
  grid.position.y=-9; grid.material.transparent=true; grid.material.opacity=.5; scene.add(grid);

  function makeSprite(){
    var c=document.createElement('canvas'); c.width=c.height=64;
    var g=c.getContext('2d'), grad=g.createRadialGradient(32,32,0,32,32,32);
    grad.addColorStop(0,'rgba(255,255,255,1)'); grad.addColorStop(.35,'rgba(255,255,255,.85)'); grad.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle=grad; g.fillRect(0,0,64,64);
    return new THREE.CanvasTexture(c);
  }

  var N=lowPower?1800:4500;
  function rnd(a,b){ return a+Math.random()*(b-a); }
  var TAU=Math.PI*2;

  /* -- sampling helpers ------------------------------------------------ */
  function jit(p,j){ return [p[0]+rnd(-j,j), p[1]+rnd(-j,j), p[2]+rnd(-j,j)]; }
  function onSeg(a,b){ var t=Math.random(); return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t]; }
  /* torus in the XY plane (wheel standing upright), axis along Z */
  function torusXY(cx,cy,cz,R,r){
    var u=Math.random()*TAU, v=Math.random()*TAU, w=R+r*Math.cos(v);
    return [cx+w*Math.cos(u), cy+w*Math.sin(u), cz+r*Math.sin(v)];
  }
  /* torus in the YZ plane (ring facing +X), axis along X */
  function torusYZ(cx,cy,cz,R,r){
    var u=Math.random()*TAU, v=Math.random()*TAU, w=R+r*Math.cos(v);
    return [cx+r*Math.sin(v)*.6, cy+w*Math.cos(u), cz+w*Math.sin(u)];
  }
  /* cylinder surface along X */
  function cylX(x0,x1,cy,cz,r){
    var a=Math.random()*TAU;
    return [rnd(x0,x1), cy+r*Math.cos(a), cz+r*Math.sin(a)];
  }
  /* cylinder surface along Y */
  function cylY(y0,y1,cx,cz,r){
    var a=Math.random()*TAU;
    return [cx+r*Math.cos(a), rnd(y0,y1), cz+r*Math.sin(a)];
  }
  /* filled disc in the XZ plane at height y */
  function discXZ(cx,y,cz,R){
    var a=Math.random()*TAU, r=R*Math.sqrt(Math.random());
    return [cx+r*Math.cos(a), y+rnd(-.08,.08), cz+r*Math.sin(a)];
  }
  /* box surface */
  function boxSurf(x0,x1,y0,y1,z0,z1){
    var f=Math.floor(Math.random()*6);
    var x=rnd(x0,x1), y=rnd(y0,y1), z=rnd(z0,z1);
    if(f===0)x=x0; else if(f===1)x=x1; else if(f===2)y=y0; else if(f===3)y=y1; else if(f===4)z=z0; else z=z1;
    return [x,y,z];
  }

  /* -- state 1: foundation — one bold wheel, facing the camera ----------
     The simplest honest symbol of building a machine by hand. It slowly
     rolls in place; because a wheel is symmetric, its silhouette never
     changes, so the motion reads as calm instead of chaotic. */
  function genWheel(){
    var m=Math.random(), p, a;
    if(m<.36){ /* tire */
      p=torusXY(0,0,0,6.9,.85);
    } else if(m<.48){ /* rim ring */
      a=Math.random()*TAU;
      p=[5.5*Math.cos(a), 5.5*Math.sin(a), rnd(-.2,.2)];
    } else if(m<.54){ /* bead ring */
      a=Math.random()*TAU;
      p=[6.15*Math.cos(a), 6.15*Math.sin(a), rnd(-.3,.3)];
    } else if(m<.84){ /* six spokes */
      var sp6=Math.floor(Math.random()*6), ang=sp6*TAU/6, tt=Math.random();
      var r=1.35+(5.5-1.35)*tt;
      p=[r*Math.cos(ang)+rnd(-.16,.16), r*Math.sin(ang)+rnd(-.16,.16), rnd(-.22,.22)];
    } else if(m<.94){ /* hub */
      p=torusXY(0,0,0,1.25,.35);
    } else { /* six lug bolts */
      var lb=Math.floor(Math.random()*6), la=lb*TAU/6+TAU/12;
      p=jit([2.25*Math.cos(la), 2.25*Math.sin(la), .28], .17);
    }
    return p;
  }

  /* -- state 2: scale — one foam dart replicated into a perfect array --
     Hasbro in a single image: the same simple unit, manufactured into
     many. The multiplication IS the story; the morph from one wheel into
     an army of identical darts shows what scale means. */
  var DART_COLS=6, DART_ROWS=3;
  function genDarts(){
    var d=Math.floor(Math.random()*(DART_COLS*DART_ROWS));
    var cx=((d%DART_COLS)-(DART_COLS-1)/2)*3.4;
    var cy=(Math.floor(d/DART_COLS)-(DART_ROWS-1)/2)*7.0;
    var m=Math.random(), p;
    if(m<.60){ /* foam body */
      p=cylY(-2.6,1.3,0,0,.62);
    } else if(m<.80){ /* soft dome tip */
      var u=Math.random()*TAU, cv=Math.random(), sv=Math.sqrt(1-cv*cv);
      p=[.62*sv*Math.cos(u), 1.3+.78*cv, .62*sv*Math.sin(u)];
    } else if(m<.90){ /* tip collar */
      var a3=Math.random()*TAU;
      p=[.66*Math.cos(a3), rnd(.95,1.3), .66*Math.sin(a3)];
    } else { /* base lip */
      var a5=Math.random()*TAU;
      p=[.70*Math.cos(a5), -2.6+rnd(-.12,.12), .70*Math.sin(a5)];
    }
    p[0]+=cx; p[1]+=cy;
    return p;
  }

  /* -- state 3: precision — the OralVac, presented flat-on -------------
     A product reveal, not a 3D replica: depth is compressed so the CAD
     geometry reads as one crisp silhouette facing the viewer. */
  var BR_FLAT=.3;
  function brTilt(p){ return [p[0], p[1], p[2]*BR_FLAT]; }
  function genBrush(){
    var m=Math.random(), p;
    if(m<.05){ /* thumb disc */
      p=discXZ(0,-8.9,0,1.5);
    } else if(m<.15){ /* cruciform plunger fins */
      var y=rnd(-8.7,-5.1), wHalf=.9;
      if(Math.random()<.5) p=[rnd(-wHalf,wHalf), y, rnd(-.06,.06)];
      else p=[rnd(-.06,.06), y, rnd(-wHalf,wHalf)];
    } else if(m<.21){ /* plunger stabiliser discs */
      p=discXZ(0, Math.random()<.5?-7.6:-6.3, 0, 1.12);
    } else if(m<.24){ /* barrel entry flange */
      p=discXZ(0,-5.0,0,1.6);
    } else if(m<.49){ /* barrel */
      p=cylY(-5.0,1.6,0,0,1.3);
    } else if(m<.53){ /* graduation rings on barrel */
      var ry=[-3.8,-2.4,-1.0,0.4][Math.floor(Math.random()*4)];
      var a=Math.random()*TAU;
      p=[1.32*Math.cos(a), ry+rnd(-.05,.05), 1.32*Math.sin(a)];
    } else if(m<.60){ /* shoulder taper */
      var ty=rnd(1.6,3.0), k=(ty-1.6)/1.4, tr=1.3-(1.3-.5)*k, a4=Math.random()*TAU;
      p=[tr*Math.cos(a4), ty, tr*Math.sin(a4)];
    } else if(m<.67){ /* neck */
      var ny=rnd(3.0,5.0);
      p=cylY(ny,ny,(ny-3.0)*0.1,0,.42); p[1]=ny;
    } else if(m<.80){ /* brush head slab */
      var hy=rnd(5.0,8.6), hx=.2+(hy-5.0)*.05;
      p=boxSurf(hx-.5,hx+.5,hy,hy,-.62,.62); p[1]=hy;
      if(hy>8.3){ p[0]*= .7; p[2]*=.7; } /* rounded tip */
    } else { /* bristle field on the +X face */
      var row=Math.floor(Math.random()*8), colz=Math.floor(Math.random()*3);
      var by=5.35+row*.41, bz=-.42+colz*.42, bx0=.2+(by-5.0)*.05+.5;
      var t2=Math.random();
      p=[bx0+t2*1.05, by+rnd(-.05,.05), bz+rnd(-.06,.06)];
    }
    return brTilt(p);
  }

  /* -- shape 4: Chemical Mechanix — the living neural mesh ------------- */
  var centers=[]; for(var c=0;c<42;c++){ centers.push([rnd(-11,11), rnd(-6,6.5), rnd(-5,5)]); }
  function genNeural(i){
    var cen=centers[i%centers.length], g3=1.1;
    return [cen[0]+rnd(-g3,g3), cen[1]+rnd(-g3,g3)*.8, cen[2]+rnd(-g3,g3)];
  }

  /* build the four chapter states + the hero field */
  var S=[new Float32Array(N*3), new Float32Array(N*3), new Float32Array(N*3), new Float32Array(N*3)];
  var HERO=new Float32Array(N*3);
  for(var i=0;i<N;i++){
    var p1=genWheel(), p2=genDarts(), p3=genBrush(), p4=genNeural(i);
    S[0][i*3]=p1[0]; S[0][i*3+1]=p1[1]; S[0][i*3+2]=p1[2];
    S[1][i*3]=p2[0]; S[1][i*3+1]=p2[1]; S[1][i*3+2]=p2[2];
    S[2][i*3]=p3[0]; S[2][i*3+1]=p3[1]; S[2][i*3+2]=p3[2];
    S[3][i*3]=p4[0]; S[3][i*3+1]=p4[1]; S[3][i*3+2]=p4[2];
    /* hero: unformed matter, spread wide and calm */
    HERO[i*3]=rnd(-17,17); HERO[i*3+1]=rnd(-7,11); HERO[i*3+2]=rnd(-8,4);
  }

  /* swap in the true OralVac geometry (surface-sampled from the CAD model);
     the procedural brush stays as the fallback if the fetch fails */
  fetch('assets/oralvac-pts.json').then(function(r){ return r.json(); }).then(function(f){
    var M=Math.floor(f.length/3);
    for(var i=0;i<N;i++){
      var j=(i%M)*3;
      /* head up, face toward the viewer, depth compressed to a silhouette */
      var q=brTilt([f[j+2], -f[j+1], -f[j]]);
      S[2][i*3]=q[0]; S[2][i*3+1]=q[1]; S[2][i*3+2]=q[2];
    }
  }).catch(function(){});

  /* synapse lines between neighbouring clusters */
  var edges=[], linePos=[];
  for(var a=0;a<centers.length;a++) for(var b=a+1;b<centers.length;b++){
    var dx=centers[a][0]-centers[b][0], dy=centers[a][1]-centers[b][1], dz=centers[a][2]-centers[b][2];
    if(dx*dx+dy*dy+dz*dz<42){
      edges.push([centers[a],centers[b]]);
      linePos.push(centers[a][0],centers[a][1],centers[a][2], centers[b][0],centers[b][1],centers[b][2]);
    }
  }
  var lineGeo=new THREE.BufferGeometry(); lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos,3));
  var lines=new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({color:0x3ee6ff, transparent:true, opacity:0}));
  scene.add(lines);

  /* data packets travelling along the synapses */
  var pkN=edges.length;
  var pkGeo=new THREE.BufferGeometry();
  var pkPos=new Float32Array(pkN*3);
  pkGeo.setAttribute('position', new THREE.BufferAttribute(pkPos,3));
  var pkMat=new THREE.PointsMaterial({size:.62, map:makeSprite(), color:0xffd27a, transparent:true, opacity:0, depthWrite:false, blending:THREE.AdditiveBlending, sizeAttenuation:true});
  var packets=new THREE.Points(pkGeo, pkMat); scene.add(packets);

  var geo=new THREE.BufferGeometry();
  var pos=new Float32Array(N*3); pos.set(S[0]);
  geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  var col=new Float32Array(N*3); geo.setAttribute('color', new THREE.BufferAttribute(col,3));
  var mat=new THREE.PointsMaterial({size:.34, map:makeSprite(), vertexColors:true, transparent:true, opacity:.95, depthWrite:false, blending:THREE.AdditiveBlending, sizeAttenuation:true});
  var points=new THREE.Points(geo, mat); scene.add(points);

  /* core ornament */
  var core=new THREE.Group(); scene.add(core);
  var ico=new THREE.Mesh(new THREE.IcosahedronGeometry(2.1,1), new THREE.MeshStandardMaterial({color:0x12333d, metalness:.85, roughness:.28, wireframe:true, emissive:0x0a2e3d, emissiveIntensity:.7}));
  core.add(ico);

  /* patent constellation — 5 orbiting nodes, visible in chapter 03 */
  var patGroup=new THREE.Group(); core.add(patGroup);
  var patMeshes=[], patHits=[], patAngle=0, hoveredPat=-1;
  for(var pi=0; pi<5; pi++){
    var pm=new THREE.Mesh(
      new THREE.SphereGeometry(.42, 18, 18),
      new THREE.MeshStandardMaterial({color:0xffb454, metalness:.6, roughness:.25, emissive:0xff8a00, emissiveIntensity:1.2, transparent:true, opacity:0})
    );
    var pa=pi*(Math.PI*2/5)+.5;
    pm.position.set(Math.cos(pa)*9.8, Math.sin(pa)*9.8, 0);
    pm.userData.index=pi;
    patGroup.add(pm); patMeshes.push(pm);
    var halo=new THREE.Mesh(new THREE.SphereGeometry(.8, 14, 14),
      new THREE.MeshBasicMaterial({color:0xffb454, transparent:true, opacity:0, depthWrite:false, blending:THREE.AdditiveBlending}));
    pm.add(halo); pm.userData.halo=halo;
    var hit=new THREE.Mesh(new THREE.SphereGeometry(1.7, 8, 8),
      new THREE.MeshBasicMaterial({transparent:true, opacity:0, depthWrite:false}));
    hit.userData.index=pi; pm.add(hit); patHits.push(hit);
  }

  /* distant stars */
  var starCount=lowPower?250:500;
  var starGeo=new THREE.BufferGeometry(); var sp=new Float32Array(starCount*3);
  for(var s2=0;s2<starCount;s2++){ sp[s2*3]=rnd(-70,70); sp[s2*3+1]=rnd(-28,34); sp[s2*3+2]=rnd(-55,-18); }
  starGeo.setAttribute('position', new THREE.BufferAttribute(sp,3));
  var stars=new THREE.Points(starGeo, new THREE.PointsMaterial({size:.22, map:makeSprite(), color:0x6fb7c4, transparent:true, opacity:.55, depthWrite:false}));
  scene.add(stars);

  /* palette: hero pale steel → steel → circuit green → gold → cyan */
  var cH=new THREE.Color(0xcfe9f2), cA=new THREE.Color(0x9adbe8), cB=new THREE.Color(0x4ade9e), cC=new THREE.Color(0xffb454), cD=new THREE.Color(0x3ee6ff), tmpC=new THREE.Color();
  var cLineA=new THREE.Color(0x3ee6ff), cLineB=new THREE.Color(0x9b7bff);
  var mouseX=0, mouseY=0, pointerWorld=new THREE.Vector3(999,999,999), hasPointer=false;
  var lastPtrX=0, lastPtrY=0;

  var projV=new THREE.Vector3();
  function patentAt(cx, cy){
    if(wRing<.35) return -1;
    var best=-1, bestD=52;
    for(var q=0;q<5;q++){
      patMeshes[q].getWorldPosition(projV); projV.project(camera);
      if(projV.z>1) continue;
      var sx=(projV.x*.5+.5)*window.innerWidth, sy=(-projV.y*.5+.5)*window.innerHeight;
      var d=Math.hypot(cx-sx, cy-sy);
      if(d<bestD){ bestD=d; best=q; }
    }
    return best;
  }
  window.addEventListener('pointermove', function(e){
    lastPtrX=e.clientX; lastPtrY=e.clientY;
    mouseX=(e.clientX/window.innerWidth-.5)*2; mouseY=(e.clientY/window.innerHeight-.5)*2;
    if(!lowPower){
      var v=new THREE.Vector3(mouseX,-mouseY,.5).unproject(camera);
      var dir=v.sub(camera.position).normalize(), dist=-camera.position.z/dir.z;
      pointerWorld.copy(camera.position).add(dir.multiplyScalar(dist)); hasPointer=true;
    }
  }, {passive:true});

  /* click → patent node, or send a ripple through the hero field */
  var wHero=0, wRing=0, burst=0, burstC=new THREE.Vector3();
  window.addEventListener('click', function(e){
    if(e.target.closest('a,button,.card,.deck,.rail,header,#patentPanel,.finale,input,textarea')) return;
    var hit=patentAt(e.clientX, e.clientY);
    if(hit>=0){ openPatent(hit); return; }
    if(wHero>.5 && !motionPaused && hasPointer){ burst=1; burstC.copy(pointerWorld); }
  });

  function resize(){
    var w=window.innerWidth, h=window.innerHeight;
    renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize); resize();

  function weights(p){
    var seg=Math.min(3.999, Math.max(0, p*4)), i0=Math.floor(seg), f=seg-i0;
    f=f*f*(3-2*f);
    var w=[0,0,0,0,0]; w[i0]=1-f; w[i0+1]=f; return w;
  }

  var blueprint=document.getElementById('blueprint');
  var lastNow=performance.now(), elapsed=0, wheelAng=0;
  function frame(){
    requestAnimationFrame(frame);
    try{
      var now=performance.now(); var dt=Math.min((now-lastNow)/1000,.05); lastNow=now; elapsed+=dt; var t=elapsed;
      if(playing){
        playT+=dt/14; if(playT>=1){ playT=1; playing=false; playBtn.textContent='▶ Play'; }
        targetProgress=playT; manualUntil=Date.now()+500;
      }
      displayProgress+=(targetProgress-displayProgress)*Math.min(1, dt*3.2+.012);
      var p=displayProgress, w=weights(p);
      setPhaseUI(Math.min(3, Math.max(0, Math.round(p*4)-1)));
      railFill.style.height=(p*100).toFixed(1)+'%';

      /* blueprint flash at phase boundaries */
      var segf=(p*4)%1, flash=4*segf*(1-segf);
      blueprint.style.opacity=(p>0.02 && p<0.98 ? Math.max(0, flash-.55)*0.9 : 0).toFixed(3);

      wRing=w[3]; wHero=w[0];

      var arr=geo.attributes.position.array, carr=geo.attributes.color.array;
      /* the wheel's roll is baked per-particle; a symmetric shape rolling in
         place keeps a constant silhouette, so it reads calm, not chaotic */
      if(!motionPaused) wheelAng+=dt*.3;
      var cW=Math.cos(wheelAng), sW=Math.sin(wheelAng);
      if(burst>.003) burst*=Math.exp(-dt*1.5);
      var CL=centers.length;
      for(var i=0;i<N;i++){
        var i3=i*3;
        var hx=0, hy=0, hz=0;
        if(w[0]>.004){ /* hero field: slow independent drift per particle */
          hx=HERO[i3]; hy=HERO[i3+1]; hz=HERO[i3+2];
          if(!motionPaused){
            hx+=Math.sin(t*.26+i*1.7)*.7;
            hy+=Math.cos(t*.21+i*2.3)*.55;
            hz+=Math.sin(t*.17+i*.9)*.5;
          }
        }
        var w1x=S[0][i3], w1y=S[0][i3+1];
        if(w[1]>.004){ var wrx=w1x*cW-w1y*sW; w1y=w1x*sW+w1y*cW; w1x=wrx; }
        var x=hx*w[0]+w1x*w[1]+S[1][i3]*w[2]+S[2][i3]*w[3]+S[3][i3]*w[4];
        var y=hy*w[0]+w1y*w[1]+S[1][i3+1]*w[2]+S[2][i3+1]*w[3]+S[3][i3+1]*w[4];
        var z=hz*w[0]+S[0][i3+2]*w[1]+S[1][i3+2]*w[2]+S[2][i3+2]*w[3]+S[3][i3+2]*w[4];
        if(!motionPaused){
          y+=Math.sin(t*1.1+i*.37)*.05;
          if(hasPointer){ /* cursor bends the field — widest on the hero */
            var ddx=x-pointerWorld.x, ddy=y-pointerWorld.y, d2=ddx*ddx+ddy*ddy;
            var RR=10+14*w[0];
            if(d2<RR && d2>.001){ var f2=(RR-d2)/RR*(1.1+.9*w[0]), dlen=Math.sqrt(d2); x+=ddx/dlen*f2; y+=ddy/dlen*f2; }
          }
          if(burst>.003 && w[0]>.05){ /* click ripple */
            var bdx=x-burstC.x, bdy=y-burstC.y, b2=bdx*bdx+bdy*bdy;
            if(b2<90 && b2>.001){ var bf=burst*w[0]*(90-b2)/90*3.2, bl=Math.sqrt(b2); x+=bdx/bl*bf; y+=bdy/bl*bf; }
          }
        }
        arr[i3]=x; arr[i3+1]=y; arr[i3+2]=z;
        tmpC.setRGB(
          cH.r*w[0]+cA.r*w[1]+cB.r*w[2]+cC.r*w[3]+cD.r*w[4],
          cH.g*w[0]+cA.g*w[1]+cB.g*w[2]+cC.g*w[3]+cD.g*w[4],
          cH.b*w[0]+cA.b*w[1]+cB.b*w[2]+cC.b*w[3]+cD.b*w[4]);
        if(w[4]>.35 && !motionPaused){
          /* clusters breathe in slow waves — thinking, not flickering */
          var pulse=.78+.3*Math.sin(t*1.6-(i%CL)*.5);
          tmpC.multiplyScalar(pulse);
        }
        carr[i3]=tmpC.r; carr[i3+1]=tmpC.g; carr[i3+2]=tmpC.b;
      }
      geo.attributes.position.needsUpdate=true; geo.attributes.color.needsUpdate=true;

      /* parallax only — formed shapes hold still and stay readable */
      points.rotation.y=mouseX*(0.06+0.22*w[0]);
      points.rotation.x=mouseY*(0.03+0.14*w[0]);
      lines.rotation.copy(points.rotation);
      packets.rotation.copy(points.rotation);
      lines.material.opacity=w[4]*.5;
      if(!motionPaused) tmpC.lerpColors(cLineA, cLineB, .5+.5*Math.sin(t*.45));
      else tmpC.copy(cLineA);
      lines.material.color.copy(tmpC);
      lines.position.y=Math.sin(t*.6)*(motionPaused?0:.06);
      packets.position.y=lines.position.y;

      /* packets drift along the synapses — slow, deliberate */
      if(w[4]>.01){
        for(var e2=0;e2<pkN;e2++){
          var ed=edges[e2], spd=.12+(e2%5)*.05, ph3=e2*.37;
          var u2=motionPaused ? ((ph3)%1) : ((t*spd+ph3)%1);
          pkPos[e2*3]  =ed[0][0]+(ed[1][0]-ed[0][0])*u2;
          pkPos[e2*3+1]=ed[0][1]+(ed[1][1]-ed[0][1])*u2;
          pkPos[e2*3+2]=ed[0][2]+(ed[1][2]-ed[0][2])*u2;
        }
        pkGeo.attributes.position.needsUpdate=true;
      }
      pkMat.opacity=w[4]*.95;

      ico.rotation.y=t*.25; ico.rotation.x=t*.13;
      ico.scale.setScalar(.3+w[0]*.4+w[4]*.3);
      ico.material.emissiveIntensity=.4+w[4]*1.1;
      core.position.y=Math.sin(t*.9)*(motionPaused?0:.18);
      grid.position.z=motionPaused?0:(t*.35%2);
      stars.rotation.y=t*.006;

      /* patent constellation — orbit slows to a stop while a node is hovered */
      hoveredPat = lowPower ? -1 : patentAt(lastPtrX, lastPtrY);
      if(!motionPaused && hoveredPat<0) patAngle+=dt*.07;
      patGroup.rotation.z=patAngle;
      patGroup.rotation.y=points.rotation.y*.4;
      for(var q=0;q<5;q++){
        var pmq=patMeshes[q];
        pmq.material.opacity=w[3];
        pmq.material.emissiveIntensity = hoveredPat===q ? 2.4 : 1.2;
        pmq.userData.halo.material.opacity=w[3]*(hoveredPat===q ? .5 : .18+.12*Math.sin(t*2+q*1.3));
        var sc=(hoveredPat===q?1.3:1)+.12*Math.sin(t*2.2+q*2.1);
        pmq.scale.setScalar(w[3]>0.01?sc:0.0001);
      }
      document.body.style.cursor = hoveredPat>=0 ? 'pointer' : '';
      if(wRing<.2 && panel.classList.contains('open')) panel.classList.remove('open');

      var camDist=30 - w[2]*2 - w[4]*2;
      var targetX=mouseX*2.2, targetY=4.5 - mouseY*1.4 + w[3]*1.2;
      camera.position.x+=(targetX-camera.position.x)*.04;
      camera.position.y+=(targetY-camera.position.y)*.04;
      camera.position.z+=(camDist-camera.position.z)*.04;
      camera.lookAt(0,0,0);
      pt.intensity=40 + w[4]*50 + Math.sin(t*2.2)*8;

      renderer.render(scene,camera);
    }catch(err){ /* keep the page readable even if a frame fails */ }
  }
  setPhaseUI(0);
  frame();
})();
