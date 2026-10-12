(function(){
  // ================= Settings (edit freely) =================
  var ITEMS=[
    {n:"Coin",r:16,c:"#e9b43c"},{n:"Sticky note",r:22,c:"#f4e06d"},{n:"Receipt",r:28,c:"#d9cfb8"},
    {n:"Pen",r:35,c:"#7fa9d6"},{n:"Stamp",r:43,c:"#d97b7b"},{n:"Calculator",r:52,c:"#a9b4bd"},
    {n:"Invoice",r:61,c:"#a9c6e4"},{n:"Ledger",r:72,c:"#c98a5a"},{n:"Folder",r:84,c:"#e8c36a"},
    {n:"Laptop",r:97,c:"#9aa7b4"},{n:"Bank safe",r:111,c:"#86b394"},{n:"Audit trophy",r:126,c:"#f2c94c"}
  ];
  var W=420,H=640,LINE=110,MAXDROP=4,TIME_LIMIT=180,WIN_BONUS=500,COMBO_WINDOW=1600,SHAKES=2;

  // ================= Hand-drawn icons (unit space -1..1) =================
  function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
  function fs(c,f,s,lw){c.fillStyle=f;c.fill();if(s){c.strokeStyle=s;c.lineWidth=lw||.06;c.stroke()}}
  function ln(c,x1,y1,x2,y2,col,lw){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=col;c.lineWidth=lw||.07;c.lineCap="round";c.stroke()}
  function txt(c,s,x,y,sz,col){c.save();c.translate(x,y);c.scale(sz/100,sz/100);c.font="bold 100px Georgia,serif";c.textAlign="center";c.textBaseline="middle";c.fillStyle=col;c.fillText(s,0,0);c.restore()}
  var ICONS=[
    function(c){c.beginPath();c.arc(0,0,.85,0,7);fs(c,"#f6c945","#a87410",.08);c.beginPath();c.arc(0,0,.62,0,7);c.strokeStyle="#c58f1c";c.lineWidth=.05;c.stroke();txt(c,"$",0,.05,1,"#a87410")},
    function(c){rr(c,-.8,-.8,1.6,1.6,.08);fs(c,"#fff07a","#c9b52f");c.beginPath();c.moveTo(.8,.3);c.lineTo(.3,.8);c.lineTo(.8,.8);c.closePath();fs(c,"#e0c93c");ln(c,-.5,-.45,.45,-.45,"#b8a12a",.07);ln(c,-.5,-.1,.45,-.1,"#b8a12a",.07);ln(c,-.5,.25,0,.25,"#b8a12a",.07)},
    function(c){c.beginPath();c.moveTo(-.55,-.9);c.lineTo(.55,-.9);c.lineTo(.55,.8);for(var k=0;k<5;k++){c.lineTo(.55-(k+.5)*.22,.95);c.lineTo(.55-(k+1)*.22,.8)}c.closePath();fs(c,"#fffdf5","#b8ad94");ln(c,-.35,-.6,.35,-.6,"#999",.06);ln(c,-.35,-.3,.2,-.3,"#999",.06);ln(c,-.35,0,.35,0,"#999",.06);ln(c,-.35,.4,.35,.4,"#333",.1)},
    function(c){c.save();c.rotate(-.785);rr(c,-.16,-.95,.32,1.35,.08);fs(c,"#2f6db5","#1c4a85");rr(c,-.17,-.95,.34,.5,.08);fs(c,"#1f4f8f");c.beginPath();c.moveTo(-.16,.4);c.lineTo(.16,.4);c.lineTo(0,.9);c.closePath();fs(c,"#e8d9b0","#8b7b4b",.04);ln(c,-.07,-.35,-.07,.3,"rgba(255,255,255,.5)",.06);c.restore()},
    function(c){rr(c,-.2,-.9,.4,.75,.15);fs(c,"#a0522d","#6b3410");rr(c,-.13,-.2,.26,.2,.03);fs(c,"#555");rr(c,-.75,-.02,1.5,.34,.08);fs(c,"#c0392b","#7f1d12");rr(c,-.85,.4,1.7,.4,.08);fs(c,"#37474f","#1c262c",.04);rr(c,-.7,.48,1.4,.14,.05);fs(c,"#5c6bc0")},
    function(c){rr(c,-.65,-.9,1.3,1.8,.15);fs(c,"#455a64","#263238");rr(c,-.5,-.75,1,.42,.05);fs(c,"#b9e6c9");txt(c,"8.8",0,-.54,.34,"#26413a");for(var r=0;r<3;r++)for(var k=0;k<3;k++){rr(c,-.5+k*.37,-.15+r*.36,.28,.26,.05);fs(c,k==2?"#ff9800":"#cfd8dc")}},
    function(c){rr(c,-.65,-.9,1.3,1.8,.06);fs(c,"#fff","#9aa7b4");rr(c,-.65,-.9,1.3,.42,.06);fs(c,"#1976d2");txt(c,"INVOICE",0,-.69,.2,"#fff");ln(c,-.45,-.25,.45,-.25,"#aaa",.06);ln(c,-.45,0,.45,0,"#aaa",.06);ln(c,-.45,.25,.1,.25,"#aaa",.06);rr(c,.05,.5,.45,.25,.03);fs(c,"#e8f1fb","#1976d2",.04);txt(c,"$",.28,.63,.2,"#1976d2")},
    function(c){rr(c,-.7,-.9,1.4,1.8,.1);fs(c,"#8b3a2f","#4e1f19");rr(c,-.7,-.9,.25,1.8,.1);fs(c,"#6e2b22");rr(c,-.25,-.55,.8,.7,.04);fs(c,"#f3e6c4","#b79b5a",.03);ln(c,-.1,-.3,.4,-.3,"#a08850",.05);ln(c,-.1,-.1,.4,-.1,"#a08850",.05);txt(c,"LEDGER",.15,.4,.2,"#f3e6c4")},
    function(c){rr(c,-.85,-.7,.7,.3,.06);fs(c,"#d8a73a");rr(c,-.85,-.5,1.7,1.25,.08);fs(c,"#e3b648","#a77d1b");rr(c,-.7,-.4,1.4,.8,.03);fs(c,"#fff");ln(c,-.5,-.2,.5,-.2,"#bbb",.05);rr(c,-.85,-.1,1.7,.85,.08);fs(c,"#f3cb5e","#a77d1b")},
    function(c){rr(c,-.7,-.7,1.4,1,.07);fs(c,"#37474f","#1c262c");rr(c,-.58,-.58,1.16,.76,.03);fs(c,"#e8f5e9");[.2,.35,.5,.65].forEach(function(h,k){c.fillStyle="#43a047";c.fillRect(-.45+k*.27,.12-h,.18,h)});c.beginPath();c.moveTo(-.9,.4);c.lineTo(.9,.4);c.lineTo(.78,.6);c.lineTo(-.78,.6);c.closePath();fs(c,"#b0bec5","#78909c",.04)},
    function(c){rr(c,-.8,-.8,1.6,1.6,.12);fs(c,"#5f7a8a","#33454f");rr(c,-.62,-.62,1.24,1.24,.08);fs(c,"#78909c","#33454f",.04);c.beginPath();c.arc(-.05,0,.38,0,7);fs(c,"#cfd8dc","#455a64",.05);for(var k=0;k<8;k++){var a=k*.785;ln(c,-.05+Math.cos(a)*.27,Math.sin(a)*.27,-.05+Math.cos(a)*.34,Math.sin(a)*.34,"#455a64",.04)}ln(c,-.05,0,.1,-.2,"#c0392b",.07);rr(c,.42,-.25,.12,.5,.05);fs(c,"#ffd54f","#b8860b",.03)},
    function(c){c.lineWidth=.1;c.strokeStyle="#d4a017";c.beginPath();c.arc(-.62,-.45,.28,Math.PI*.5,Math.PI*1.5);c.stroke();c.beginPath();c.arc(.62,-.45,.28,-Math.PI*.5,Math.PI*.5);c.stroke();c.beginPath();c.moveTo(-.55,-.85);c.lineTo(.55,-.85);c.quadraticCurveTo(.55,.1,0,.2);c.quadraticCurveTo(-.55,.1,-.55,-.85);c.closePath();fs(c,"#ffd54a","#b8860b");rr(c,-.1,.2,.2,.35,.03);fs(c,"#e0a82e","#b8860b",.04);rr(c,-.45,.55,.9,.3,.06);fs(c,"#8d6e63","#5d4037",.05);txt(c,"★",0,-.4,.6,"#fff3b0")}
  ];
  var S=2.5,sprites=[];
  function makeSprite(i){
    var it=ITEMS[i],r=it.r,sz=Math.ceil(2*r*S),cv2=document.createElement("canvas");cv2.width=cv2.height=sz;
    var c=cv2.getContext("2d");c.translate(sz/2,sz/2);c.scale(S,S);
    c.beginPath();c.arc(0,0,r-1,0,7);c.fillStyle=it.c;c.fill();
    var g=c.createRadialGradient(-r*.35,-r*.4,r*.05,0,0,r);
    g.addColorStop(0,"rgba(255,255,255,.65)");g.addColorStop(.5,"rgba(255,255,255,0)");g.addColorStop(1,"rgba(0,0,0,.28)");
    c.fillStyle=g;c.fill();c.lineWidth=Math.max(1.5,r*.06);c.strokeStyle="rgba(30,40,35,.8)";c.stroke();
    c.save();c.scale(r*.64,r*.64);ICONS[i](c);c.restore();
    c.beginPath();c.ellipse(-r*.3,-r*.5,r*.35,r*.16,-.6,0,7);c.fillStyle="rgba(255,255,255,.3)";c.fill();
    return cv2;
  }
  for(var q=0;q<ITEMS.length;q++)sprites.push(makeSprite(q));

  // ================= Sound (Web Audio, no files) =================
  var actx=null,muted=false,lastThud=0;
  function initAudio(){
    if(!actx){try{actx=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}
    if(actx&&actx.state==="suspended")actx.resume();
  }
  function tone(f,dur,type,vol,delay,endF){
    if(!actx||muted)return;
    var t=actx.currentTime+(delay||0),o=actx.createOscillator(),g=actx.createGain();
    o.type=type||"sine";o.frequency.setValueAtTime(f,t);
    if(endF)o.frequency.exponentialRampToValueAtTime(endF,t+dur);
    g.gain.setValueAtTime(vol||.15,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+dur+.02);
  }
  var sfx={
    drop:function(){tone(420,.1,"triangle",.14,0,180)},
    thud:function(v,r){tone(140-r*.5,.09,"sine",Math.min(.18,v*.015),0,60)},
    merge:function(l,cb){var f=250*Math.pow(1.12,l)*(1+.07*(cb-1));tone(f,.16,"sine",.2);tone(f*1.5,.2,"triangle",.12,.06);if(cb>1)tone(f*2,.15,"square",.05,.1)},
    shake:function(){for(var i=0;i<6;i++)tone(90+Math.random()*60,.1,"sawtooth",.08,i*.05)},
    win:function(){[523,659,784,1047,1319].forEach(function(f,i){tone(f,.3,"triangle",.2,i*.11)})},
    lose:function(){[330,262,196,130].forEach(function(f,i){tone(f,.3,"sawtooth",.12,i*.15)})},
    tick:function(){tone(880,.05,"square",.07)}
  };

  // ================= Setup =================
  var M=Matter,Engine=M.Engine,Bodies=M.Bodies,Composite=M.Composite,Events=M.Events,Body=M.Body;
  var $=function(id){return document.getElementById(id)};
  var cv=$("game"),ctx=cv.getContext("2d"),nctx=$("next").getContext("2d");
  var D=Math.min(2,window.devicePixelRatio||1);
  cv.width=W*D;cv.height=H*D;ctx.setTransform(D,0,0,D,0,0);
  var wrapEl=$("wrap"),scoreEl=$("score"),bestEl=$("best"),timeEl=$("time"),timeBox=$("timeBox");
  var startScreen=$("startScreen"),endScreen=$("endScreen"),shakeBtn=$("shakeBtn");

  var engine,world,score,best=0,current,nextLvl,aimX,canDrop,state="ready",fx,parts,timeLeft,lastSec;
  var top,combo,lastMerge,maxCombo,shakeMag,shakesLeft,comboShow;
  try{best=+localStorage.getItem("ledgerdrop-best")||0}catch(e){}
  bestEl.textContent=best;

  var legendEls=[];
  ITEMS.forEach(function(it,i){
    var d=document.createElement("div"),c=document.createElement("canvas");c.width=c.height=60;
    c.getContext("2d").drawImage(sprites[i],0,0,60,60);d.appendChild(c);d.appendChild(document.createTextNode(it.n));
    $("legend").appendChild(d);legendEls.push(d);
  });
  function rnd(){return Math.floor(Math.random()*(MAXDROP+1))}
  function fmt(s){s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+":"+("0"+(s%60)).slice(-2)}
  function setTop(l){
    if(l>top)top=l;
    for(var i=0;i<=top;i++){var le=legendEls[i];if(!le.classList.contains("on")){le.classList.add("on");if(state==="playing"){le.classList.add("new");(function(e){setTimeout(function(){e.classList.remove("new")},1000)})(le)}}}
    $("goalFill").style.width=((top+1)/ITEMS.length*100)+"%";$("goalText").textContent="Top: "+ITEMS[top].n;
  }

  // Cached background: ruled accounting paper with depth shading
  var bg=document.createElement("canvas");bg.width=W*D;bg.height=H*D;
  (function(){
    var b=bg.getContext("2d");b.scale(D,D);
    var g=b.createLinearGradient(0,0,0,H);g.addColorStop(0,"#f7f1dc");g.addColorStop(1,"#eadfc0");b.fillStyle=g;b.fillRect(0,0,W,H);
    b.strokeStyle="rgba(90,140,170,.22)";b.lineWidth=1;b.beginPath();
    for(var y=24;y<H;y+=26){b.moveTo(0,y+.5);b.lineTo(W,y+.5)}b.stroke();
    b.strokeStyle="rgba(200,70,70,.35)";b.beginPath();b.moveTo(38.5,0);b.lineTo(38.5,H);b.moveTo(41.5,0);b.lineTo(41.5,H);b.stroke();
    var l=b.createLinearGradient(0,0,18,0);l.addColorStop(0,"rgba(0,0,0,.28)");l.addColorStop(1,"rgba(0,0,0,0)");b.fillStyle=l;b.fillRect(0,0,18,H);
    var r=b.createLinearGradient(W,0,W-18,0);r.addColorStop(0,"rgba(0,0,0,.28)");r.addColorStop(1,"rgba(0,0,0,0)");b.fillStyle=r;b.fillRect(W-18,0,18,H);
    var f=b.createLinearGradient(0,H,0,H-22);f.addColorStop(0,"rgba(0,0,0,.3)");f.addColorStop(1,"rgba(0,0,0,0)");b.fillStyle=f;b.fillRect(0,H-22,W,22);
  })();

  function reset(){
    engine=Engine.create({gravity:{y:1.15},positionIterations:10,velocityIterations:8});world=engine.world;
    var t=60,o={isStatic:true,friction:.4,frictionStatic:.6};
    Composite.add(world,[
      Bodies.rectangle(W/2,H+t/2-2,W+2*t,t,o),
      Bodies.rectangle(-t/2+2,H/2,t,H*2,o),
      Bodies.rectangle(W+t/2-2,H/2,t,H*2,o)
    ]);
    score=0;scoreEl.textContent=0;canDrop=true;fx=[];parts=[];top=0;combo=0;lastMerge=0;maxCombo=0;shakeMag=0;comboShow=0;
    shakesLeft=SHAKES;shakeBtn.textContent="Shake x"+shakesLeft;shakeBtn.disabled=false;
    legendEls.forEach(function(e){e.classList.remove("on")});setTop(MAXDROP);top=0;
    legendEls.forEach(function(e,i){if(i>MAXDROP)e.classList.remove("on")});
    timeLeft=TIME_LIMIT;lastSec=TIME_LIMIT;timeEl.textContent=fmt(timeLeft);timeBox.classList.remove("low");
    aimX=W/2;current=rnd();nextLvl=rnd();drawNext();
    Events.on(engine,"collisionStart",onCollide);
  }
  function start(){initAudio();reset();state="playing";startScreen.classList.remove("show");endScreen.classList.remove("show")}

  function makeBody(lvl,x,y){
    var b=Bodies.circle(x,y,ITEMS[lvl].r,{restitution:.18,friction:.35,frictionStatic:.5,frictionAir:.004,density:.001*(1+lvl*.12),slop:.02});
    b.lvl=lvl;b.born=performance.now();b.merged=false;b.overSince=0;return b;
  }

  function burst(x,y,lvl,col){
    var n=10+lvl*3;
    for(var i=0;i<n;i++){var a=Math.random()*6.28,s=1.5+Math.random()*(3+lvl*.4);
      parts.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1.5,life:1,rot:Math.random()*6,vr:(Math.random()-.5)*.4,w:3+Math.random()*4,h:2+Math.random()*3,
        col:Math.random()<.5?col:["#fff","#ffd54a","#7bc9a2","#7fa9d6"][i%4]})}
  }

  function onCollide(ev){
    if(state!=="playing")return;
    var now=performance.now();
    ev.pairs.forEach(function(p){
      var a=p.bodyA,b=p.bodyB;
      var v=Math.hypot(a.velocity.x-b.velocity.x,a.velocity.y-b.velocity.y);
      if(v>4&&now-lastThud>70){lastThud=now;sfx.thud(v,a.isStatic?b.circleRadius:a.circleRadius)}
      if(a.isStatic||b.isStatic||a.merged||b.merged||a.lvl!==b.lvl)return;
      a.merged=b.merged=true;
      var x=(a.position.x+b.position.x)/2,y=(a.position.y+b.position.y)/2,l=a.lvl;
      Composite.remove(world,a);Composite.remove(world,b);
      if(l===ITEMS.length-1)return;
      var nb=makeBody(l+1,x,y);Composite.add(world,nb);
      combo=(now-lastMerge<COMBO_WINDOW)?combo+1:1;lastMerge=now;
      if(combo>maxCombo)maxCombo=combo;if(combo>1)comboShow=now;
      var mult=Math.min(4,1+(combo-1)*.5),pts=Math.round((l+1)*(l+2)*mult);
      score+=pts;scoreEl.textContent=score;
      fx.push({x:x,y:y,t:now,txt:"+"+pts});
      burst(x,y,l,ITEMS[l+1].c);
      if(l>=5)shakeMag=Math.max(shakeMag,2+l*.5);
      var R=ITEMS[l+1].r*2.2;
      Composite.allBodies(world).forEach(function(o){
        if(o.isStatic||o===nb)return;
        var dx=o.position.x-x,dy=o.position.y-y,d=Math.hypot(dx,dy)||1;
        if(d<R){var k=2.2*(1-d/R);Body.setVelocity(o,{x:o.velocity.x+dx/d*k,y:o.velocity.y+dy/d*k})}
      });
      setTop(l+1);
      if(l+1===ITEMS.length-1){score+=WIN_BONUS;scoreEl.textContent=score;finish(true)}
      else sfx.merge(l,combo);
    });
  }

  function drop(){
    if(!canDrop||state!=="playing")return;
    var r=ITEMS[current].r,x=Math.max(r+4,Math.min(W-r-4,aimX));
    Composite.add(world,makeBody(current,x,LINE-r-14));
    sfx.drop();canDrop=false;current=nextLvl;nextLvl=rnd();drawNext();
    setTimeout(function(){canDrop=true},550);
  }

  function shake(){
    if(state!=="playing"||shakesLeft<=0)return;
    shakesLeft--;shakeBtn.textContent="Shake x"+shakesLeft;if(!shakesLeft)shakeBtn.disabled=true;
    Composite.allBodies(world).forEach(function(b){
      if(!b.isStatic)Body.setVelocity(b,{x:b.velocity.x+(Math.random()-.5)*10,y:b.velocity.y-4-Math.random()*5})});
    shakeMag=9;sfx.shake();
  }

  function finish(won){
    if(state!=="playing")return;
    state="ended";
    if(score>best){best=score;bestEl.textContent=best;try{localStorage.setItem("ledgerdrop-best",best)}catch(e){}}
    $("endTitle").textContent=won?"Audit passed!":"Books not closed";
    $("endText").innerHTML=(won?"You built the Audit trophy.":(timeLeft<=0?"Time ran out.":"Items piled over the limit."))+
      "<br>Score: <b>"+score+"</b><br>Top item: "+ITEMS[top].n+"<br>Best combo: x"+maxCombo;
    endScreen.classList.remove("win","lose");endScreen.classList.add("show",won?"win":"lose");$("stamp").textContent=won?"PAID":"OVERDUE";won?sfx.win():sfx.lose();
    if(won)for(var i=0;i<80;i++)burst(W/2,H/2,11,"#ffd54a");
  }

  // ================= Drawing =================
  function drawNext(){
    nctx.clearRect(0,0,72,72);var s=34*Math.sqrt(ITEMS[nextLvl].r/ITEMS[MAXDROP].r)*1.0;
    nctx.drawImage(sprites[nextLvl],36-s,36-s,2*s,2*s);
  }
  function drawBall(c,i,x,y,s,ang,alpha){
    var r=ITEMS[i].r*s;c.save();c.globalAlpha=alpha*.2;c.fillStyle="#000";c.beginPath();c.ellipse(x+r*.08,y+r*.12,r*.98,r*.98,0,0,7);c.fill();
    c.globalAlpha=alpha;c.translate(x,y);c.rotate(ang);c.drawImage(sprites[i],-r,-r,2*r,2*r);c.restore();
  }

  function render(now,dt){
    ctx.save();
    if(shakeMag>.1){ctx.translate((Math.random()-.5)*shakeMag,(Math.random()-.5)*shakeMag);shakeMag*=.88}else shakeMag=0;
    ctx.drawImage(bg,0,0,W,H);
    // limit line
    ctx.setLineDash([8,6]);ctx.strokeStyle="#c0392b";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,LINE);ctx.lineTo(W,LINE);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle="#c0392b";ctx.font="11px 'Courier New',monospace";ctx.textAlign="left";ctx.fillText("CREDIT LIMIT",46,LINE-5);
    var danger=false;
    if(world)Composite.allBodies(world).forEach(function(b){
      if(b.isStatic)return;if(b.overSince)danger=true;
      var age=now-b.born,s=age<200?.6+.4*(age/200)+(age<100?.12:0):1;
      drawBall(ctx,b.lvl,b.position.x,b.position.y,s,b.angle,1);
    });
    if(danger&&state==="playing"&&Math.floor(now/250)%2){ctx.fillStyle="rgba(192,57,43,.2)";ctx.fillRect(0,0,W,LINE)}
    if(state==="playing"){
      var r=ITEMS[current].r,ax=Math.max(r+4,Math.min(W-r-4,aimX));
      ctx.setLineDash([3,7]);ctx.strokeStyle="rgba(90,100,95,.6)";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(ax,LINE);ctx.lineTo(ax,H);ctx.stroke();ctx.setLineDash([]);
      drawBall(ctx,current,ax,LINE-r-14,1,0,canDrop?1:.35);
    }
    // particles
    for(var i=parts.length-1;i>=0;i--){
      var p=parts[i];p.vy+=.12;p.x+=p.vx;p.y+=p.vy;p.rot+=p.vr;p.life-=dt/900;
      if(p.life<=0){parts.splice(i,1);continue}
      ctx.save();ctx.globalAlpha=p.life;ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.col;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore();
    }
    // floating score + combo
    fx=fx.filter(function(f){return now-f.t<800});
    fx.forEach(function(f){var k=(now-f.t)/800;ctx.globalAlpha=1-k;ctx.font="bold 16px 'Courier New',monospace";ctx.textAlign="center";
      ctx.strokeStyle="#fff";ctx.lineWidth=3;ctx.strokeText(f.txt,f.x,f.y-k*40);ctx.fillStyle="#1f6b4f";ctx.fillText(f.txt,f.x,f.y-k*40)});
    ctx.globalAlpha=1;
    if(now-comboShow<1200&&combo>1){var k2=(now-comboShow)/1200;ctx.globalAlpha=1-k2*k2;ctx.font="bold "+(26+Math.min(combo,6)*2)+"px Georgia,serif";ctx.textAlign="center";
      ctx.strokeStyle="#fff";ctx.lineWidth=5;ctx.strokeText("COMBO x"+combo,W/2,LINE+40);ctx.fillStyle="#d4731c";ctx.fillText("COMBO x"+combo,W/2,LINE+40);ctx.globalAlpha=1}
    ctx.restore();
    wrapEl.classList.toggle("danger",danger&&state==="playing");
  }

  // ================= Loop =================
  var last=performance.now();
  function loop(now){
    var dt=Math.min(33,now-last);last=now;
    if(state==="playing"){
      Engine.update(engine,dt);
      timeLeft-=dt/1000;timeEl.textContent=fmt(timeLeft);
      var sec=Math.ceil(timeLeft);if(sec<=10&&sec<lastSec&&sec>0)sfx.tick();
      lastSec=sec;timeBox.classList.toggle("low",timeLeft<=10);
      if(timeLeft<=0){timeLeft=0;timeEl.textContent="0:00";finish(false)}
      Composite.allBodies(world).forEach(function(b){
        if(b.isStatic||state!=="playing")return;
        if(now-b.born>1200&&b.position.y-ITEMS[b.lvl].r<LINE){
          if(!b.overSince)b.overSince=now;if(now-b.overSince>2000)finish(false);
        }else b.overSince=0;
      });
    }
    render(now,dt);requestAnimationFrame(loop);
  }

  // ================= Input =================
  function setAim(e){var rc=cv.getBoundingClientRect();aimX=(e.clientX-rc.left)*(W/rc.width)}
  cv.addEventListener("pointermove",setAim);cv.addEventListener("pointerdown",setAim);
  cv.addEventListener("pointerup",function(e){setAim(e);drop()});
  document.addEventListener("keydown",function(e){
    if(e.key==="ArrowLeft")aimX-=14;else if(e.key==="ArrowRight")aimX+=14;
    else if(e.key===" "&&state==="playing"){e.preventDefault();drop()}
  });
  $("startBtn").onclick=start;$("restartBtn").onclick=start;$("resetBtn").onclick=start;shakeBtn.onclick=shake;
  $("muteBtn").onclick=function(){muted=!muted;this.textContent="Sound: "+(muted?"off":"on");initAudio()};

  new MutationObserver(function(){scoreEl.classList.remove("pop");void scoreEl.offsetWidth;scoreEl.classList.add("pop")}).observe(scoreEl,{childList:true});
  reset();requestAnimationFrame(loop);
})();
