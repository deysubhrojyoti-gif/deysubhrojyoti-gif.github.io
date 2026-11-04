/* subhrojyotidey.com — chapter engine
   One particle system, four morph targets. Scroll is the camera.
   Chapter accents: steel → circuit green → gold → cyan. */
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
    targetProgress=p/3; manualUntil=Date.now()+(smooth?900:4000);
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

  /* scroll -> progress: piecewise, so chapter i's center is exactly p = i/3.
     Hero holds the scatter; the mesh persists through the summary. */
  var anchors=[0,1,2,3];
  function measure(){
    anchors=secs.map(function(s){ return s.offsetTop + s.offsetHeight*0.5 - window.innerHeight*0.5; });
  }
  function progressAt(y){
    if(y<=anchors[0]) return 0;
    if(y>=anchors[3]) return 1;
    for(var i=0;i<3;i++){
      if(y<anchors[i+1]) return (i + (y-anchors[i])/(anchors[i+1]-anchors[i]))/3;
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
  var shapes=[new Float32Array(N*3), new Float32Array(N*3), new Float32Array(N*3), new Float32Array(N*3)];
  function rnd(a,b){ return a+Math.random()*(b-a); }
  /* shape 0: scattered cloud — the workshop floor */
  for(var i=0;i<N;i++){
    var r=13*Math.cbrt(Math.random()), th=Math.random()*Math.PI*2, ph=Math.acos(2*Math.random()-1);
    shapes[0][i*3]=r*Math.sin(ph)*Math.cos(th); shapes[0][i*3+1]=r*Math.cos(ph)*.72; shapes[0][i*3+2]=r*Math.sin(ph)*Math.sin(th);
  }
  /* shape 1: PCB plane — trace runs + pads */
  for(var j=0;j<N;j++){
    var mode=Math.random(), x,y=0,z;
    if(mode<.62){
      if(Math.random()<.5){ x=rnd(-11,11); z=Math.round(rnd(-7,7))*1.4; }
      else { x=Math.round(rnd(-11,11)/1.4)*1.4; z=rnd(-7,7); }
    } else if(mode<.85){ x=Math.round(rnd(-11,11)/1.4)*1.4; z=Math.round(rnd(-7,7)/1.4)*1.4; y=rnd(-.15,.15); }
    else { var a0=Math.random()*Math.PI*2, rr=rnd(0,.55); x=Math.round(rnd(-10,10)/2.8)*2.8+Math.cos(a0)*rr; z=Math.round(rnd(-6,6)/2.8)*2.8+Math.sin(a0)*rr; }
    shapes[1][j*3]=x; shapes[1][j*3+1]=y-1.5; shapes[1][j*3+2]=z;
  }
  /* shape 2: ring + spokes — the regulated mechanism */
  for(var k=0;k<N;k++){
    var m=Math.random(), px,py,pz;
    if(m<.68){ var ang=Math.random()*Math.PI*2, rad=7.4+rnd(-.7,.7); px=Math.cos(ang)*rad; py=Math.sin(ang)*rad; pz=rnd(-.5,.5); }
    else if(m<.9){ var s=Math.floor(Math.random()*8), sa=s*Math.PI/4, len=rnd(.6,7); px=Math.cos(sa)*len; py=Math.sin(sa)*len; pz=rnd(-.3,.3); }
    else { var a2=Math.random()*Math.PI*2, r2=rnd(0,1.6); px=Math.cos(a2)*r2; py=Math.sin(a2)*r2; pz=rnd(-.8,.8); }
    shapes[2][k*3]=px; shapes[2][k*3+1]=py; shapes[2][k*3+2]=pz;
  }
  /* shape 3: neural clusters — the factory mesh */
  var centers=[]; for(var c=0;c<42;c++){ centers.push([rnd(-11,11), rnd(-6,6.5), rnd(-5,5)]); }
  for(var n=0;n<N;n++){
    var cen=centers[n%centers.length], g3=1.1;
    shapes[3][n*3]=cen[0]+rnd(-g3,g3); shapes[3][n*3+1]=cen[1]+rnd(-g3,g3)*.8; shapes[3][n*3+2]=cen[2]+rnd(-g3,g3);
  }
  var linePos=[];
  for(var a=0;a<centers.length;a++) for(var b=a+1;b<centers.length;b++){
    var dx=centers[a][0]-centers[b][0], dy=centers[a][1]-centers[b][1], dz=centers[a][2]-centers[b][2];
    if(dx*dx+dy*dy+dz*dz<42) linePos.push(centers[a][0],centers[a][1],centers[a][2], centers[b][0],centers[b][1],centers[b][2]);
  }
  var lineGeo=new THREE.BufferGeometry(); lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos,3));
  var lines=new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({color:0x3ee6ff, transparent:true, opacity:0}));
  scene.add(lines);

  var geo=new THREE.BufferGeometry();
  var pos=new Float32Array(N*3); pos.set(shapes[0]);
  geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  var col=new Float32Array(N*3); geo.setAttribute('color', new THREE.BufferAttribute(col,3));
  var mat=new THREE.PointsMaterial({size:.34, map:makeSprite(), vertexColors:true, transparent:true, opacity:.95, depthWrite:false, blending:THREE.AdditiveBlending, sizeAttenuation:true});
  var points=new THREE.Points(geo, mat); scene.add(points);

  /* core objects */
  var core=new THREE.Group(); scene.add(core);
  var ico=new THREE.Mesh(new THREE.IcosahedronGeometry(2.1,1), new THREE.MeshStandardMaterial({color:0x12333d, metalness:.85, roughness:.28, wireframe:true, emissive:0x0a2e3d, emissiveIntensity:.7}));
  core.add(ico);
  var torus=new THREE.Mesh(new THREE.TorusGeometry(7.4,.34,14,90), new THREE.MeshStandardMaterial({color:0x8a5a1e, metalness:.9, roughness:.3, emissive:0x3a1e00, emissiveIntensity:.5, transparent:true, opacity:0}));
  core.add(torus);
  var hub=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,1.6,28), new THREE.MeshStandardMaterial({color:0xb8c4c8, metalness:.95, roughness:.22, transparent:true, opacity:0}));
  hub.rotation.x=Math.PI/2; core.add(hub);
  var board=new THREE.Mesh(new THREE.BoxGeometry(23,.28,15), new THREE.MeshStandardMaterial({color:0x0d3a2e, metalness:.4, roughness:.55, transparent:true, opacity:0}));
  board.position.y=-1.65; scene.add(board);

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
    /* generous invisible hit zone so the orbiting node is easy to click */
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

  /* chapter palette: steel → circuit green → gold → cyan */
  var cA=new THREE.Color(0x9adbe8), cB=new THREE.Color(0x4ade9e), cC=new THREE.Color(0xffb454), cD=new THREE.Color(0x3ee6ff), tmpC=new THREE.Color();
  var mouseX=0, mouseY=0, pointerWorld=new THREE.Vector3(999,999,999), hasPointer=false;
  var lastPtrX=0, lastPtrY=0;

  /* screen-space hit test: distance in CSS px from the pointer to each node's
     projected center — robust at any resolution, no raycast edge cases */
  var projV=new THREE.Vector3();
  function patentAt(cx, cy){
    if(wRing<.35) return -1;
    var best=-1, bestD=52; /* px radius */
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

  /* click → patent node */
  var wRing=0;
  window.addEventListener('click', function(e){
    if(e.target.closest('a,button,.card,.deck,.rail,header,#patentPanel,.finale,input,textarea')) return;
    var hit=patentAt(e.clientX, e.clientY);
    if(hit>=0) openPatent(hit);
  });

  function resize(){
    var w=window.innerWidth, h=window.innerHeight;
    renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize); resize();

  function weights(p){
    var seg=Math.min(2.999, Math.max(0, p*3)), i0=Math.floor(seg), f=seg-i0;
    f=f*f*(3-2*f);
    var w=[0,0,0,0]; w[i0]=1-f; w[i0+1]=f; return w;
  }

  var blueprint=document.getElementById('blueprint');
  var lastNow=performance.now(), elapsed=0;
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
      setPhaseUI(Math.min(3, Math.round(p*3)));
      railFill.style.height=(p*100).toFixed(1)+'%';

      /* blueprint flash at phase boundaries */
      var segf=(p*3)%1, flash=4*segf*(1-segf);
      blueprint.style.opacity=(p>0.02 && p<0.98 ? Math.max(0, flash-.55)*0.9 : 0).toFixed(3);

      wRing=w[2];
      var arr=geo.attributes.position.array, carr=geo.attributes.color.array;
      var spin=motionPaused?0:t*.05;
      for(var i=0;i<N;i++){
        var x=shapes[0][i*3]*w[0]+shapes[1][i*3]*w[1]+shapes[2][i*3]*w[2]+shapes[3][i*3]*w[3];
        var y=shapes[0][i*3+1]*w[0]+shapes[1][i*3+1]*w[1]+shapes[2][i*3+1]*w[2]+shapes[3][i*3+1]*w[3];
        var z=shapes[0][i*3+2]*w[0]+shapes[1][i*3+2]*w[1]+shapes[2][i*3+2]*w[2]+shapes[3][i*3+2]*w[3];
        if(!motionPaused){
          y+=Math.sin(t*1.3+i*.37)*.09;
          if(hasPointer){
            var ddx=x-pointerWorld.x, ddy=y-pointerWorld.y, d2=ddx*ddx+ddy*ddy;
            if(d2<16 && d2>.001){ var f2=(16-d2)/16*1.6, dlen=Math.sqrt(d2); x+=ddx/dlen*f2; y+=ddy/dlen*f2; }
          }
        }
        arr[i*3]=x; arr[i*3+1]=y; arr[i*3+2]=z;
        tmpC.setRGB(cA.r*w[0]+cB.r*w[1]+cC.r*w[2]+cD.r*w[3], cA.g*w[0]+cB.g*w[1]+cC.g*w[2]+cD.g*w[3], cA.b*w[0]+cB.b*w[1]+cC.b*w[2]+cD.b*w[3]);
        if(w[3]>.4){ var pulse=.75+.45*Math.sin(t*2.4+i*.9); tmpC.multiplyScalar(pulse); }
        carr[i*3]=tmpC.r; carr[i*3+1]=tmpC.g; carr[i*3+2]=tmpC.b;
      }
      geo.attributes.position.needsUpdate=true; geo.attributes.color.needsUpdate=true;

      points.rotation.y=spin+mouseX*.12;
      points.rotation.x=mouseY*.05;
      lines.rotation.y=points.rotation.y; lines.material.opacity=w[3]*.55;
      lines.position.y=Math.sin(t*.8)*(motionPaused?0:.15);
      ico.rotation.y=t*.25; ico.rotation.x=t*.13;
      ico.scale.setScalar(.35+w[1]*.9+w[3]*.25);
      ico.material.emissiveIntensity=.4+w[3]*1.1;
      torus.material.opacity=w[2]*.95; hub.material.opacity=w[2]*.95;
      torus.rotation.z=motionPaused?0:t*.18; torus.rotation.y=points.rotation.y*.4;
      hub.rotation.z=torus.rotation.z;
      board.material.opacity=w[1]*.85;
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
        pmq.material.opacity=w[2];
        pmq.material.emissiveIntensity = hoveredPat===q ? 2.4 : 1.2;
        pmq.userData.halo.material.opacity=w[2]*(hoveredPat===q ? .5 : .18+.12*Math.sin(t*2+q*1.3));
        var sc=(hoveredPat===q?1.3:1)+.12*Math.sin(t*2.2+q*2.1);
        pmq.scale.setScalar(w[2]>0.01?sc:0.0001);
      }
      document.body.style.cursor = hoveredPat>=0 ? 'pointer' : '';
      if(wRing<.2 && panel.classList.contains('open')) panel.classList.remove('open');

      var camDist=30 - w[1]*3 - w[3]*2;
      var targetX=mouseX*2.2, targetY=4.5 - mouseY*1.4 + w[2]*1.2;
      camera.position.x+=(targetX-camera.position.x)*.04;
      camera.position.y+=(targetY-camera.position.y)*.04;
      camera.position.z+=(camDist-camera.position.z)*.04;
      camera.lookAt(0,0,0);
      pt.intensity=40 + w[3]*50 + Math.sin(t*2.2)*8;

      renderer.render(scene,camera);
    }catch(err){ /* keep the page readable even if a frame fails */ }
  }
  setPhaseUI(0);
  frame();
})();
