(function(){
  var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
  var M=Matter,Engine=M.Engine,Bodies=M.Bodies,Composite=M.Composite,Events=M.Events,Body=M.Body,Query=M.Query;
  sfx.pop=function(){tone(600,.12,"square",.1,0,150)};
  sfx.power=function(){tone(660,.1,"triangle",.15);tone(990,.14,"triangle",.12,.08)};
  sfx.boom=function(){tone(90,.45,"sawtooth",.2,0,30);tone(220,.2,"square",.08,0,50)};

  // ================= Settings (edit freely) =================
  var TIME=600,MAXDROP=4,GRAVITY=1.15,GRACE=2200,CD=500,COMBO=1600;
  var BOMB_R=95,REWARD=1500,TIME_BONUS=30,TOPUP=9;          // TOPUP = highest item level that can be upgraded
  var START={elim:3,up:2,bomb:1,pick:3,shake:3,time:2};     // boosts at the start
  var NAMES={elim:"Remove",up:"Upgrade",bomb:"Bomb",pick:"Pick",shake:"Shake",time:"+30 sec"};
  var KEYS=["elim","up","bomb","pick","shake","time"];


  // ================= Characters: every item has a personality and real feelings =================
  var CH=[
    {line:"Cocky and fresh from the till",lid:.35,brow:0,mouth:"smirk",glint:1},
    {line:"Nervous. Don't forget to pay the supplier!",lid:0,brow:"worry",mouth:"small"},
    {line:"Sleepy after a long day in a wallet",lid:.55,brow:0,mouth:"flat",zz:1},
    {line:"Confident. Signs off every entry",lid:.1,brow:"calm",mouth:"smile",wink:1},
    {line:"Grumpy official: APPROVED... or is it?",lid:.25,brow:"angry",mouth:"flat"},
    {line:"A proper nerd who loves numbers",lid:0,brow:0,mouth:"smile",glasses:1},
    {line:"Anxious. Payment is due in 30 days",lid:0,brow:"worry",mouth:"wavy",sweat:1},
    {line:"Wise old soul who counts every cent",lid:.15,brow:"calm",mouth:"smile",monocle:1},
    {line:"Overwhelmed by paperwork",lid:.3,brow:"worry",mouth:"wavy",bags:1},
    {line:"Exhausted. Spreadsheet open since Monday",lid:.4,brow:0,mouth:"flat",bags:1},
    {line:"Stoic guardian of the company's secrets",lid:.2,brow:"angry",mouth:"flat"},
    {line:"Proud and shining. The auditor is impressed!",lid:0,brow:0,mouth:"grin",blush:1,glint:1}
  ];
  var TAU=Math.PI*2;
  function star4(c,x,y,s){c.beginPath();for(var k=0;k<8;k++){var a=k*Math.PI/4-Math.PI/2,q=k%2?s*.3:s;c.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q)}c.closePath();c.fill()}

  // Draws the face on top of an item. c is already centred on the item. r = item radius.
  function drawFace(c,i,mood,t,r,look){
    var P=CH[i],small=r<26,er=r*(small?.1:.135),ex=r*.21,lw=Math.max(.9,r*.03),lid=P.lid||0,INK="#1b1b1b";
    var blink=(t+i*777)%3800<130,wink=P.wink&&(t+i*500)%7000<260;
    var Mo={idle:["open",P.mouth],excited:["wide","smile"],fall:["wide","O"],happy:["happy","open"],scared:["wide","wavy"],nervous:["wide","frown"],
            hurt:["hurt","frown"],dizzy:["x","wavy"],cry:["cry","frown"],star:["star","open"]}[mood]||["open","smile"];
    var ek=Mo[0],mk=Mo[1];if(mood==="idle"&&blink)ek="closed";
    c.save();c.translate(0,r*.12);c.lineCap="round";c.lineJoin="round";c.strokeStyle=INK;c.fillStyle=INK;c.lineWidth=lw*1.5;
    if(!small){c.fillStyle="rgba(255,255,255,.42)";c.beginPath();c.ellipse(0,r*.07,r*.46,r*.35,0,0,TAU);c.fill();c.fillStyle=INK}
    [-1,1].forEach(function(s){
      var k=ek,x=s*ex;if(wink&&s===1&&mood==="idle")k="closed";
      c.save();c.translate(x,0);
      if(k==="open"||k==="wide"||k==="cry"){
        var w=er*(k==="wide"?1.3:1);
        if(small){c.beginPath();c.arc(0,0,w*.9,0,TAU);c.fill()}
        else{
          var h=w*1.15,pr=w*(k==="wide"?.42:.58),px=look.x*(w-pr)*.85,py=(k==="cry"?-.35:look.y)*(h-pr)*.85;
          c.beginPath();c.ellipse(0,0,w,h,0,0,TAU);c.fillStyle="#fff";c.fill();c.lineWidth=lw;c.stroke();
          c.beginPath();c.arc(px,py,pr,0,TAU);c.fillStyle=INK;c.fill();
          c.beginPath();c.arc(px+pr*.35,py-pr*.38,pr*.3,0,TAU);c.fillStyle="#fff";c.fill();
          if(lid>0&&k==="open"){c.save();c.beginPath();c.ellipse(0,0,w,h,0,0,TAU);c.clip();c.fillStyle=ITEMS[i].c;c.fillRect(-w,-h,2*w,h*2*lid);c.restore();
            c.lineWidth=lw*1.3;c.beginPath();c.moveTo(-w,-h+h*2*lid);c.lineTo(w,-h+h*2*lid);c.stroke()}
        }
      }else if(k==="closed"){c.beginPath();c.moveTo(-er,0);c.lineTo(er,0);c.stroke()}
      else if(k==="happy"){c.beginPath();c.arc(0,er*.6,er*1.05,Math.PI*1.1,Math.PI*1.9);c.stroke()}
      else if(k==="hurt"){c.beginPath();c.moveTo(s*er,-er);c.lineTo(-s*er,0);c.lineTo(s*er,er);c.stroke()}
      else if(k==="x"){c.beginPath();c.moveTo(-er,-er);c.lineTo(er,er);c.moveTo(er,-er);c.lineTo(-er,er);c.stroke()}
      else if(k==="star"){c.fillStyle="#ffcf3a";star4(c,0,0,er*1.9);c.lineWidth=lw;c.stroke()}
      c.restore();
      // eyebrows
      if(!small){
        var bk=P.brow,lift=0;
        if(mood==="scared"||mood==="fall"||mood==="nervous"||mood==="hurt"||mood==="cry"){bk="worry";lift=mood==="nervous"?.1:.5}
        else if(mood==="happy"||mood==="star"||mood==="dizzy")bk=0;
        if(bk){
          var by=-er*(1.9+lift),o=bk==="angry"?-.35:bk==="worry"?.35:0,inn=bk==="angry"?.4:bk==="worry"?-.4:-.1;
          c.lineWidth=lw*1.6;c.beginPath();c.moveTo(x+s*er*1.1,by+o*er);c.lineTo(x-s*er*1.1,by+inn*er);c.stroke();
        }
      }
    });
    c.lineWidth=lw*1.5;
    // accessories and personality details
    if(P.bags&&!small){c.strokeStyle="rgba(80,50,110,.5)";[-1,1].forEach(function(s){c.beginPath();c.arc(s*ex,er*1.35,er*.9,.2*Math.PI,.8*Math.PI);c.stroke()});c.strokeStyle=INK}
    if(P.glasses){[-1,1].forEach(function(s){c.beginPath();c.arc(s*ex,0,er*1.9,0,TAU);c.stroke()});c.beginPath();c.moveTo(-ex+er*1.9,0);c.lineTo(ex-er*1.9,0);c.stroke()}
    if(P.monocle){c.strokeStyle="#c9971b";c.lineWidth=lw*1.6;c.beginPath();c.arc(ex,0,er*1.9,0,TAU);c.stroke();c.beginPath();c.moveTo(ex+er*.6,er*1.8);c.quadraticCurveTo(ex+er*1.4,er*4,ex+er*.4,er*5);c.stroke();c.strokeStyle=INK;c.lineWidth=lw*1.5}
    if(mood==="happy"||mood==="star"||(P.blush&&mood==="idle")){c.fillStyle="rgba(255,105,135,.45)";[-1,1].forEach(function(s){c.beginPath();c.ellipse(s*ex*1.75,er*1.8,er*.95,er*.55,0,0,TAU);c.fill()});c.fillStyle=INK}
    // mouth
    var my=r*.2,mw=r*.15;c.lineWidth=lw*1.6;
    if(mk==="smile"||mk==="small"){var w2=mk==="small"?mw*.6:mw;c.beginPath();c.arc(0,my-w2*.35,w2,.15*Math.PI,.85*Math.PI);c.stroke()}
    else if(mk==="smirk"){c.beginPath();c.moveTo(-mw,my);c.quadraticCurveTo(0,my+mw*.5,mw,my-mw*.45);c.stroke()}
    else if(mk==="flat"){c.beginPath();c.moveTo(-mw*.7,my);c.lineTo(mw*.7,my);c.stroke()}
    else if(mk==="wavy"){c.beginPath();c.moveTo(-mw,my);for(var q=0;q<3;q++)c.quadraticCurveTo(-mw+(q+.5)*mw*2/3,my+(q%2?1:-1)*mw*.45,-mw+(q+1)*mw*2/3,my);c.stroke()}
    else if(mk==="frown"){c.beginPath();c.arc(0,my+mw*.7,mw*.8,1.15*Math.PI,1.85*Math.PI);c.stroke()}
    else if(mk==="O"){c.beginPath();c.ellipse(0,my+mw*.2,mw*.6,mw*.85,0,0,TAU);c.fill()}
    else if(mk==="grin"||mk==="open"){c.beginPath();c.moveTo(-mw,my-mw*.3);c.quadraticCurveTo(0,my+mw*1.9,mw,my-mw*.3);c.closePath();c.fill();
      c.fillStyle="#ff7a8a";c.beginPath();c.ellipse(0,my+mw*.6,mw*.45,mw*.28,0,0,TAU);c.fill();c.fillStyle=INK}
    // extras: sweat, tears, dizzy stars, snoring, sparkle
    if(mood==="scared"||mood==="nervous"||(P.sweat&&mood==="idle")){
      var sy=-er*.5+((t/300)%2)*er*.4;c.fillStyle="#7fc8f8";c.beginPath();c.moveTo(ex*2.1,sy-er*1.2);c.quadraticCurveTo(ex*2.1+er*.9,sy+er*.5,ex*2.1,sy+er*.9);c.quadraticCurveTo(ex*2.1-er*.9,sy+er*.5,ex*2.1,sy-er*1.2);c.fill();c.fillStyle=INK}
    if(mood==="cry"){c.fillStyle="#6cc3ff";[-1,1].forEach(function(s,n){var ty=er*1.2+(((t/18)+n*40)%60)/60*r*.35;c.beginPath();c.ellipse(s*ex,ty,er*.35,er*.55,0,0,TAU);c.fill()});c.fillStyle=INK}
    if(mood==="dizzy"){c.fillStyle="#ffcf3a";for(var d=0;d<3;d++){var a=t*.007+d*2.09;star4(c,Math.cos(a)*r*.5,-r*.62+Math.sin(a)*r*.12,r*.1)}c.fillStyle=INK}
    if(P.zz&&mood==="idle"&&!small){c.fillStyle="#3a4a6a";c.font="bold "+Math.round(r*.22)+"px Georgia,serif";c.textAlign="center";
      var zt=(t/30)%60;c.globalAlpha=1-zt/60;c.fillText("z",r*.55+zt*.1,-r*.3-zt*r*.006*10);c.globalAlpha=1;c.fillStyle=INK}
    if(P.glint&&mood==="idle"){var gp=(t+i*900)%3200;if(gp<500){c.fillStyle="#fff";star4(c,r*.5,-r*.55,r*.2*Math.sin(gp/500*Math.PI))}}
    c.restore();
  }
  // sq > 0 squashes, sq < 0 stretches
  function drawCharRaw(c,l,x,y,s,ang,mood,sq,look,alpha,t){
    var r=ITEMS[l].r*s;
    c.save();c.globalAlpha=alpha*.2;c.fillStyle="#000";c.beginPath();c.arc(x+r*.08,y+r*.12,r*.98,0,7);c.fill();
    c.globalAlpha=alpha;c.translate(x,y);c.scale(1+sq,1-sq);c.rotate(ang);c.drawImage(sprites[l],-r,-r,2*r,2*r);
    c.rotate(-ang*.6);drawFace(c,l,mood,t,r,look);c.restore();
  }
  function moodOf(b,age,now,v){
    if(G.tmode==="bomb"&&G.pt&&Math.hypot(b.position.x-G.pt.x,b.position.y-G.pt.y)-ITEMS[b.lvl].r<BOMB_R)return"scared";
    if(G.hoverB===b)return G.tmode==="elim"?"cry":(b.lvl<=TOPUP?"star":"hurt");
    if(b.dizzyT>now)return"dizzy";
    if(b.hurtT>now)return"hurt";
    if(b.overSince)return"scared";
    if(b.cheerT>now||(b.fromMerge&&age<1400))return"happy";
    if(v>1.6)return"fall";
    if(b.position.y-ITEMS[b.lvl].r<LINE+50)return"nervous";
    return"idle";
  }
  function drawChar(c,b,now,age,s){
    var l=b.lvl,x=b.position.x,y=b.position.y,v=Math.hypot(b.velocity.x,b.velocity.y),mood=moodOf(b,age,now,v);
    b.sq=(b.sq||0)*.86;var sq=b.sq;if(mood==="fall"&&sq<.02)sq=-Math.min(.1,v*.01);
    var jit=mood==="scared"?ITEMS[l].r*.025:0,look;
    if(G.pt){var dx=G.pt.x-x,dy=G.pt.y-y,d=Math.hypot(dx,dy)||1,k=Math.min(1,d/160);look={x:dx/d*k,y:dy/d*k}}else look={x:0,y:.3};
    if(mood==="fall")look={x:0,y:1};
    drawCharRaw(c,l,x+(Math.random()-.5)*jit*2,y+(Math.random()-.5)*jit*2,s,b.angle,mood,sq,look,1,now);
  }
  var PORT={};
  function portrait(i){
    if(PORT[i])return PORT[i];var c=document.createElement("canvas");c.width=c.height=60;
    drawCharRaw(c.getContext("2d"),i,30,30,27/ITEMS[i].r,0,"idle",0,{x:0,y:.3},1,1000);return(PORT[i]=c);
  }
  function newFriend(l){toast("New friend: "+ITEMS[l].n+". "+CH[l].line)}

  var state="menu",timeLeft=0,lastSec=0,legendEls=[],G=null,last=performance.now();
  var cv=$("#cv"),ctx=cv.getContext("2d"),nctx=$("#next").getContext("2d");
  cv.width=W*D;cv.height=H*D;ctx.setTransform(D,0,0,D,0,0);
  var wrap=$("#wrap"),toastEl=$("#toast"),pickEl=$("#pick"),tt;

  function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  function fmt(s){s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+":"+("0"+(s%60)).slice(-2)}
  function screen(id){$$(".screen").forEach(function(e){e.classList.toggle("show",e.id===id)})}
  function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){}}
  function holdY(r){return Math.max(r+8,LINE-r-14)}
  function toast(m){toastEl.textContent=m;toastEl.classList.add("show");clearTimeout(tt);tt=setTimeout(function(){toastEl.classList.remove("show")},1600)}
  function drawBall(c,i,x,y,s,ang,alpha){
    var r=ITEMS[i].r*s;c.save();c.globalAlpha=alpha*.2;c.fillStyle="#000";c.beginPath();c.arc(x+r*.08,y+r*.12,r*.98,0,7);c.fill();
    c.globalAlpha=alpha;c.translate(x,y);c.rotate(ang);c.drawImage(sprites[i],-r,-r,2*r,2*r);c.restore();
  }

  // ================= Game setup =================
  function newGame(){
    var eng=Engine.create({gravity:{y:GRAVITY},positionIterations:10,velocityIterations:8}),t=60,o={isStatic:true,friction:.4,frictionStatic:.6};
    Composite.add(eng.world,[Bodies.rectangle(W/2,H+t/2-2,W+2*t,t,o),Bodies.rectangle(-t/2+2,H/2,t,H*2,o),Bodies.rectangle(W+t/2-2,H/2,t,H*2,o)]);
    Events.on(eng,"collisionStart",collide);
    var g={engine:eng,world:eng.world,rand:rng(Math.random()*1e9|0),score:0,top:0,combo:0,lastMerge:0,maxCombo:0,fx:[],parts:[],shakeMag:0,comboShow:0,
      canDrop:true,aimX:W/2,pt:null,tmode:null,danger:false,blast:null,nextReward:REWARD,used:0,left:{}};
    for(var k in START)g.left[k]=START[k];
    G=g;g.current=roll();g.nextLvl=roll();drawNext();updateUI();
  }
  function roll(){return Math.floor(G.rand()*(MAXDROP+1))}
  function mk(l,x,y){
    var b=Bodies.circle(x,y,ITEMS[l].r,{restitution:.18,friction:.35,frictionStatic:.5,frictionAir:.004,density:.001*(1+l*.12),slop:.02});
    b.lvl=l;b.born=performance.now();b.merged=false;b.overSince=0;return b;
  }
  function bodies(){return Composite.allBodies(G.world).filter(function(b){return!b.isStatic})}
  function burst(x,y,lvl,col){
    for(var i=0,n=10+lvl*3;i<n;i++){var a=Math.random()*6.28,s=1.5+Math.random()*(3+lvl*.4);
      G.parts.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1.5,life:1,rot:Math.random()*6,vr:(Math.random()-.5)*.4,w:3+Math.random()*4,h:2+Math.random()*3,star:i%5===0,
        col:Math.random()<.5?col:["#fff","#ffd54a","#7bc9a2","#7fa9d6"][i%4]})}
  }
  function updateUI(){
    $("#score").textContent=G.score;
    $$("#pw button").forEach(function(b){var k=b.dataset.p,n=G.left[k];$("i",b).textContent="\u00d7"+n;b.disabled=!n;b.classList.toggle("armed",G.tmode===k)});
    syncLegend(G.top);
  }
  function drawNext(){
    var l=G.nextLvl,s=34*Math.sqrt(ITEMS[l].r/ITEMS[MAXDROP].r)/ITEMS[l].r;nctx.clearRect(0,0,72,72);drawCharRaw(nctx,l,36,36,s,0,"idle",0,{x:0,y:.5},1,1500);
  }
  function giveReward(){
    var ks=["elim","up","bomb","pick","shake","time","elim","pick"],k=ks[Math.floor(Math.random()*ks.length)];
    G.left[k]++;toast("Bonus boost: "+NAMES[k]+"!");sfx.power();
  }

  // ================= Merging =================
  function collide(ev){
    if(state!=="playing"||!G)return;
    var now=performance.now();
    ev.pairs.forEach(function(p){
      var a=p.bodyA,b=p.bodyB,v=Math.hypot(a.velocity.x-b.velocity.x,a.velocity.y-b.velocity.y);
      [a,b].forEach(function(o){if(!o.isStatic&&v>2.2){o.sq=Math.min(.3,v*.04);if(v>6)o.hurtT=now+650}});
      if(v>4&&now-lastThud>70){lastThud=now;sfx.thud(v,a.isStatic?b.circleRadius:a.circleRadius)}
      if(a.isStatic||b.isStatic||a.merged||b.merged||a.lvl!==b.lvl)return;
      a.merged=b.merged=true;
      var x=(a.position.x+b.position.x)/2,y=(a.position.y+b.position.y)/2,l=a.lvl;
      Composite.remove(G.world,a);Composite.remove(G.world,b);
      if(l===ITEMS.length-1)return;
      var nb=mk(l+1,x,y);nb.fromMerge=true;Composite.add(G.world,nb);
      G.combo=(now-G.lastMerge<COMBO)?G.combo+1:1;G.lastMerge=now;
      if(G.combo>G.maxCombo)G.maxCombo=G.combo;if(G.combo>1)G.comboShow=now;
      if(G.combo>=3)bodies().forEach(function(o){o.cheerT=now+1300});
      var pts=Math.round((l+1)*(l+2)*Math.min(4,1+(G.combo-1)*.5));
      G.score+=pts;G.fx.push({x:x,y:y,t:now,txt:"+"+pts});burst(x,y,l,ITEMS[l+1].c);
      if(l>=5)G.shakeMag=Math.max(G.shakeMag,2+l*.5);
      var R=ITEMS[l+1].r*2.2;
      bodies().forEach(function(o){
        if(o===nb)return;
        var dx=o.position.x-x,dy=o.position.y-y,d=Math.hypot(dx,dy)||1;
        if(d<R){var k=2.2*(1-d/R);Body.setVelocity(o,{x:o.velocity.x+dx/d*k,y:o.velocity.y+dy/d*k})}
      });
      if(l+1>G.top){G.top=l+1;if(l+1>MAXDROP)newFriend(l+1)}
      while(G.score>=G.nextReward){G.nextReward+=REWARD;giveReward()}
      updateUI();
      if(l+1===ITEMS.length-1)endGame("trophy");else sfx.merge(l,G.combo);
    });
  }

  // ================= Actions =================
  function drop(){
    if(!G.canDrop)return;var r=ITEMS[G.current].r,x=Math.max(r+4,Math.min(W-r-4,G.aimX));
    Composite.add(G.world,mk(G.current,x,holdY(r)));sfx.drop();G.canDrop=false;
    G.current=G.nextLvl;G.nextLvl=roll();drawNext();
    setTimeout(function(){if(G)G.canDrop=true},CD);
  }
  function hitBody(){return G.pt?Query.point(bodies(),G.pt)[0]||null:null}
  function click(){
    if(state!=="playing")return;
    var m=G.tmode,h;
    if(m==="elim"){
      if(h=hitBody()){Composite.remove(G.world,h);burst(h.position.x,h.position.y,h.lvl,ITEMS[h.lvl].c);G.left.elim--;G.tmode=null;sfx.pop()}
    }else if(m==="up"){
      if(h=hitBody()){
        if(h.lvl>TOPUP){toast("This item can't be upgraded")}
        else{var p=h.position,nb=mk(h.lvl+1,p.x,p.y);nb.fromMerge=true;Composite.remove(G.world,h);Composite.add(G.world,nb);burst(p.x,p.y,h.lvl,ITEMS[h.lvl+1].c);
          if(nb.lvl>G.top){G.top=nb.lvl;if(nb.lvl>MAXDROP)newFriend(nb.lvl)}G.left.up--;G.tmode=null;sfx.merge(h.lvl,2)}
      }
    }else if(m==="bomb"){
      if(!G.pt)return;
      bodies().forEach(function(b){if(Math.hypot(b.position.x-G.pt.x,b.position.y-G.pt.y)-ITEMS[b.lvl].r<BOMB_R){Composite.remove(G.world,b);burst(b.position.x,b.position.y,b.lvl,ITEMS[b.lvl].c)}});
      G.blast={x:G.pt.x,y:G.pt.y,t:performance.now()};bodies().forEach(function(b){b.dizzyT=performance.now()+1000});G.shakeMag=11;G.left.bomb--;G.tmode=null;sfx.boom();
    }else drop();
    updateUI();
  }
  function power(k){
    if(state!=="playing"||!G.left[k])return;
    pickEl.classList.remove("show");
    if(k==="shake"){
      G.left.shake--;G.tmode=null;
      bodies().forEach(function(b){b.dizzyT=performance.now()+1700;Body.setVelocity(b,{x:b.velocity.x+(Math.random()-.5)*10,y:b.velocity.y-4-Math.random()*5})});
      G.shakeMag=9;sfx.shake();
    }else if(k==="time"){
      G.left.time--;G.tmode=null;timeLeft+=TIME_BONUS;toast("+"+TIME_BONUS+" seconds");sfx.power();
    }else if(k==="pick"){
      G.tmode=null;pickEl.classList.toggle("show");
    }else{
      G.tmode=G.tmode===k?null:k;
      if(G.tmode)toast(k==="elim"?"Tap an item to remove it":k==="up"?"Tap an item to upgrade it":"Tap a spot to blast it");
    }
    updateUI();
  }
  function choose(l){G.left.pick--;G.current=l;pickEl.classList.remove("show");sfx.power();toast("Next drop: "+ITEMS[l].n);updateUI()}

  // ================= Frame update and drawing =================
  function update(now,dt){
    Engine.update(G.engine,dt);var over=false,dg=false;
    bodies().forEach(function(b){
      if(now-b.born>1200&&b.position.y-ITEMS[b.lvl].r<LINE){
        if(!b.overSince)b.overSince=now;dg=true;if(now-b.overSince>GRACE)over=true;
      }else b.overSince=0;
    });
    G.danger=dg;return over;
  }
  function ring(c,x,y,r,col,dash){c.beginPath();c.arc(x,y,r,0,7);if(dash)c.setLineDash(dash);c.strokeStyle=col;c.lineWidth=3;c.stroke();c.setLineDash([])}
  function render(now,dt){
    var c=ctx;c.save();
    if(G.shakeMag>.1){c.translate((Math.random()-.5)*G.shakeMag,(Math.random()-.5)*G.shakeMag);G.shakeMag*=.88}else G.shakeMag=0;
    c.drawImage(bg,0,0,W,H);
    c.setLineDash([8,6]);c.strokeStyle="#c0392b";c.lineWidth=2;c.beginPath();c.moveTo(0,LINE);c.lineTo(W,LINE);c.stroke();c.setLineDash([]);
    c.fillStyle="#c0392b";c.font="11px 'Courier New',monospace";c.textAlign="left";c.fillText("CREDIT LIMIT",46,LINE-5);
    G.hoverB=(G.tmode==="elim"||G.tmode==="up")?hitBody():null;
    bodies().forEach(function(b){
      var age=now-b.born,s=age<200?.6+.4*(age/200)+(age<100?.12:0):1;
      drawChar(c,b,now,age,s);
    });
    if(G.danger&&state==="playing"&&Math.floor(now/250)%2){c.fillStyle="rgba(192,57,43,.2)";c.fillRect(0,0,W,LINE)}
    if(state==="playing"){
      if(G.tmode){
        c.fillStyle="rgba(10,20,15,.2)";c.fillRect(0,0,W,H);
        if(G.tmode==="bomb"){if(G.pt){c.beginPath();c.arc(G.pt.x,G.pt.y,BOMB_R,0,7);c.fillStyle="rgba(255,120,40,.18)";c.fill();ring(c,G.pt.x,G.pt.y,BOMB_R,"#ff7a2f",[8,6])}}
        else{var h=hitBody();if(h){var up=G.tmode==="up";ring(c,h.position.x,h.position.y,ITEMS[h.lvl].r+4,up&&h.lvl<=TOPUP?"#2fbf71":"#ff3b2f",[6,4]);
          if(up&&h.lvl<=TOPUP){c.font="bold 13px 'Courier New',monospace";c.textAlign="center";c.fillStyle="#fff";c.strokeStyle="#0d3b27";c.lineWidth=4;
            c.strokeText("\u2192 "+ITEMS[h.lvl+1].n,h.position.x,h.position.y-ITEMS[h.lvl].r-10);c.fillText("\u2192 "+ITEMS[h.lvl+1].n,h.position.x,h.position.y-ITEMS[h.lvl].r-10)}}}
      }else{
        var r=ITEMS[G.current].r,ax=Math.max(r+4,Math.min(W-r-4,G.aimX));
        c.setLineDash([3,7]);c.strokeStyle="rgba(90,100,95,.6)";c.lineWidth=1.5;c.beginPath();c.moveTo(ax,LINE);c.lineTo(ax,H);c.stroke();c.setLineDash([]);
        drawCharRaw(c,G.current,ax,holdY(r)+Math.sin(now*.006)*2,1,0,"excited",0,{x:0,y:.6},G.canDrop?1:.35,now);
      }
    }
    if(G.blast){var k=(now-G.blast.t)/500;if(k>=1)G.blast=null;else{c.globalAlpha=1-k;ring(c,G.blast.x,G.blast.y,BOMB_R*(.4+k),"#ff7a2f");c.globalAlpha=1}}
    for(var i=G.parts.length-1;i>=0;i--){
      var p=G.parts[i];p.vy+=.12;p.x+=p.vx;p.y+=p.vy;p.rot+=p.vr;p.life-=dt/900;
      if(p.life<=0){G.parts.splice(i,1);continue}
      c.save();c.globalAlpha=p.life;c.translate(p.x,p.y);c.rotate(p.rot);c.fillStyle=p.col;if(p.star)star4(c,0,0,p.w*1.6);else c.fillRect(-p.w/2,-p.h/2,p.w,p.h);c.restore();
    }
    G.fx=G.fx.filter(function(f){return now-f.t<800});
    G.fx.forEach(function(f){var k=(now-f.t)/800;c.globalAlpha=1-k;c.font="bold 16px 'Courier New',monospace";c.textAlign="center";
      c.strokeStyle="#fff";c.lineWidth=3;c.strokeText(f.txt,f.x,f.y-k*40);c.fillStyle="#1f6b4f";c.fillText(f.txt,f.x,f.y-k*40)});
    c.globalAlpha=1;
    if(now-G.comboShow<1200&&G.combo>1){var k2=(now-G.comboShow)/1200;c.globalAlpha=1-k2*k2;c.font="bold "+(26+Math.min(G.combo,6)*2)+"px Georgia,serif";c.textAlign="center";
      c.strokeStyle="#fff";c.lineWidth=5;c.strokeText("COMBO x"+G.combo,W/2,LINE+40);c.fillStyle="#d4731c";c.fillText("COMBO x"+G.combo,W/2,LINE+40);c.globalAlpha=1}
    c.restore();
    wrap.classList.toggle("danger",G.danger&&state==="playing");
    cv.style.cursor=G.tmode?"crosshair":"pointer";
  }

  // ================= Legend =================
  ITEMS.forEach(function(it,i){
    var d=document.createElement("div"),c=document.createElement("canvas");c.width=c.height=60;
    c.getContext("2d").drawImage(portrait(i),0,0,60,60);d.appendChild(c);d.title=it.n+": "+CH[i].line;$("#legend").appendChild(d);legendEls.push(d);
  });
  function syncLegend(top){
    for(var i=0;i<=Math.max(top,MAXDROP);i++){var e=legendEls[i];
      if(!e.classList.contains("on")){e.classList.add("on");if(state==="playing"){e.classList.add("new");setTimeout(function(x){x.classList.remove("new")},1000,e)}}}
  }

  // ================= Game flow =================
  function begin(){
    initAudio();
    $("#result").classList.remove("show");$("#pauseOv").classList.remove("show");$("#pauseBtn").textContent="Pause";state="menu";
    legendEls.forEach(function(e){e.classList.remove("on","new")});
    $("#who").textContent=Auth.name();$("#best").textContent="Best: "+Auth.best();
    newGame();timeLeft=TIME;lastSec=TIME;$("#time").textContent=fmt(timeLeft);$("#timeBox").classList.remove("low");
    pickEl.classList.remove("show");screen("sGame");fitSoon();state="playing";
  }
  function toMenu(){state="menu";G=null;$("#result").classList.remove("show");$("#pauseOv").classList.remove("show");$("#pauseBtn").textContent="Pause";Auth.render();screen("sAuth")}
  // ---- pause ----
  function pauseGame(){
    if(state!=="playing")return;state="paused";pickEl.classList.remove("show");if(G){G.tmode=null;updateUI()}
    $("#pauseOv").classList.add("show");$("#pauseBtn").textContent="Resume";
  }
  function resumeGame(){
    if(state!=="paused"||!$("#pauseOv").classList.contains("show"))return;
    state="playing";last=performance.now();$("#pauseOv").classList.remove("show");$("#pauseBtn").textContent="Pause";
  }
  function quitGame(){if(G&&G.score>0)Auth.record(G.score,G.top);toMenu()}
  function endGame(reason){
    if(state!=="playing")return;state="ended";
    var won=reason==="trophy";if(won)G.score+=600;updateUI();
    var rec=Auth.record(G.score,G.top),bst=rec.best,newBest=rec.newBest;
    $("#best").textContent="Best: "+bst;
    var why=won?"You built the Audit trophy!":reason==="time"?"Time's up. The books are closed.":"Items piled over the credit limit.";
    var r=$("#result");r.className="overlay fixed show "+(won?"win":"lose");
    r.innerHTML='<div class="sheet"><div class="stamp">'+(won?"PAID":"OVERDUE")+'</div><h2>'+(won?"Audit passed!":"Books not closed")+'</h2><p>'+why+'</p>'+
      '<p>Score <b>'+G.score+'</b>'+(newBest?' &middot; New best!':' &middot; Best '+bst)+'<br>Top item: '+ITEMS[G.top].n+' &middot; Best combo x'+G.maxCombo+'</p>'+(Auth.user?'':'<p class="note">Guest scores are not saved. Sign in next time to keep your records.</p>')+
      '<div class="row"><button class="btn" id="resAgain">Play again</button><button class="link" id="resMenu">Menu</button></div></div>';
    $("#resAgain").onclick=begin;$("#resMenu").onclick=toMenu;sfx[won?"win":"lose"]();
  }
  function loop(now){
    var dt=Math.min(33,now-last);last=now;
    if(G){
      if(state==="playing"){
        var over=update(now,dt);timeLeft-=dt/1000;$("#time").textContent=fmt(timeLeft);
        var sec=Math.ceil(timeLeft);if(sec<=10&&sec<lastSec&&sec>0)sfx.tick();lastSec=sec;$("#timeBox").classList.toggle("low",timeLeft<=10);
        if(over)endGame("overflow");else if(timeLeft<=0){timeLeft=0;$("#time").textContent="0:00";endGame("time")}
      }
      render(now,dt);
    }
    requestAnimationFrame(loop);
  }

  // ================= Fit the box to the screen =================
  function fit(){
    var g=$("#sGame");if(!g.classList.contains("show"))return;
    var cs=getComputedStyle(g),rs=getComputedStyle(document.documentElement),wide=window.matchMedia("(min-width:760px)").matches;
    var vh=(window.visualViewport?window.visualViewport.height:window.innerHeight)-parseFloat(rs.paddingTop)-parseFloat(rs.paddingBottom);
    var w=g.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight),topH=$(".top",g).offsetHeight;
    var padV=parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom)+8+22+8,bw;
    if(wide)bw=Math.min((vh-topH-padV)*420/640+22,w-270);
    else bw=Math.min((vh-topH-$(".bhead",g).offsetHeight-$("#pw").offsetHeight-$("#legend").offsetHeight-padV-24)*420/640+22,w);
    $("#board").style.setProperty("--bw",Math.max(150,Math.floor(bw))+"px");
  }
  function fitSoon(){fit();requestAnimationFrame(fit);setTimeout(fit,150)}
  window.addEventListener("resize",fit);window.addEventListener("orientationchange",fitSoon);window.addEventListener("load",fit);
  if(window.visualViewport)window.visualViewport.addEventListener("resize",fit);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);

  // ================= Guide (pauses a running game) =================
  function ill(list){return'<div class="ill">'+list.map(function(x){return typeof x==="number"?'<canvas data-s="'+x+'"></canvas>':'<span>'+x+'</span>'}).join("")+'</div>'}
  var chain='<div class="ill chain">'+ITEMS.map(function(_,i){return'<canvas data-s="'+i+'"></canvas>'}).join("")+'</div>';
  var SLIDES=[
    {t:"Goal",h:chain+"<p>Merge matching items to climb the chain, from a <b>Coin</b> all the way up to the <b>Audit trophy</b>.</p><p>You have <b>10 minutes</b>. Build the trophy to win, or score as high as you can.</p>"},
    {t:"Meet the items",h:"<p>Every item is a character with real feelings. They get <b>scared</b> when falling or near the limit, <b>dizzy</b> after a hard landing or a shake, and <b>happy</b> when they merge. Their eyes follow your pointer!</p><div class='meet'>"+ITEMS.map(function(it,i){return"<div><canvas data-s='"+i+"'></canvas><span><b>"+it.n+"</b><br>"+CH[i].line+"</span></div>"}).join("")+"</div>"},
    {t:"Drop and merge",h:ill([0,"+",0,"\u2192",1])+"<p><b>Aim:</b> move the mouse, drag your finger, or press <kbd>\u2190</kbd> <kbd>\u2192</kbd>.</p><p><b>Drop:</b> click, tap, or press <kbd>Space</kbd>.</p><p>Two identical items that touch merge into the next item up.</p>"},
    {t:"Mind the credit limit",h:'<div class="limit"></div><p>If your pile stays above the red dashed line for more than about 2 seconds, the books overflow and the game ends.</p><p>Merge small items early to keep the pile low.</p>'},
    {t:"Boosts",h:'<ul class="pwl"><li><b>\u2715 Remove</b> tap it, then tap an item to delete it.</li><li><b>\u21e7 Upgrade</b> tap an item to evolve it to the next level.</li><li><b>\u2729 Bomb</b> tap a spot to blast everything nearby.</li><li><b>\u2605 Pick</b> choose your next item.</li><li><b>\u224b Shake</b> rattle the box to unstick items.</li><li><b>+ 30 sec</b> add 30 seconds.</li></ul><p>Shortcut keys <kbd>1</kbd>\u2013<kbd>6</kbd>. <kbd>Esc</kbd> cancels.</p>'},
    {t:"Score and bonus boosts",h:"<p>Merge again quickly to build a <b>combo</b>, up to x4 points. Bigger items are worth more.</p><p>Every <b>1,500 points</b> you earn a free random boost.</p><p>Building the Audit trophy adds a +600 bonus. Sign in to keep your best score (guest scores are not saved). Press <kbd>P</kbd> to pause.</p>"}
  ];
  var gi=0,guidePaused=false;
  function showSlide(){
    var s=SLIDES[gi];$("#gtitle").textContent=s.t;$("#gbody").innerHTML=s.h;
    $$("#gbody canvas").forEach(function(c){c.width=c.height=60;c.getContext("2d").drawImage(portrait(+c.dataset.s),0,0,60,60)});
    $("#gdots").innerHTML=SLIDES.map(function(_,i){return'<i class="'+(i===gi?"on":"")+'" data-i="'+i+'"></i>'}).join("");
    $$("#gdots i").forEach(function(d){d.onclick=function(){gi=+d.dataset.i;showSlide()}});
    $("#gPrev").style.visibility=gi?"visible":"hidden";$("#gNext").textContent=gi===SLIDES.length-1?"Got it!":"Next";
  }
  function openGuide(){gi=0;if(state==="playing"){state="paused";guidePaused=true}showSlide();$("#guide").classList.add("show")}
  function closeGuide(){$("#guide").classList.remove("show");store("ledgerdrop-seen","1");if(guidePaused&&state==="paused")state="playing";guidePaused=false}

  // ================= Wiring =================
  for(var l=0;l<=MAXDROP;l++)(function(l){
    var b=document.createElement("button"),c=document.createElement("canvas");c.width=c.height=60;c.getContext("2d").drawImage(portrait(l),0,0,60,60);
    b.appendChild(c);b.title=ITEMS[l].n;b.onclick=function(){if(G&&G.left.pick>0&&state==="playing")choose(l)};pickEl.appendChild(b);
  })(l);
  $$("#pw button").forEach(function(b){b.onclick=function(){if(G)power(b.dataset.p)}});
  function pt(e){var rc=cv.getBoundingClientRect(),p={x:(e.clientX-rc.left)*W/rc.width,y:(e.clientY-rc.top)*H/rc.height};if(G){G.pt=p;G.aimX=p.x}}
  cv.addEventListener("pointermove",pt);cv.addEventListener("pointerdown",pt);cv.addEventListener("pointerup",function(e){pt(e);if(G)click()});
  document.addEventListener("keydown",function(e){
    var k=e.key;
    if(k==="Escape"){
      if($("#guide").classList.contains("show"))closeGuide();
      else if(state==="paused")resumeGame();
      else if(G&&(G.tmode||pickEl.classList.contains("show"))){G.tmode=null;pickEl.classList.remove("show");updateUI()}
      else if(state==="playing")pauseGame();
      return}
    if((k==="p"||k==="P")&&G&&!(e.target&&e.target.tagName==="INPUT")&&!$("#guide").classList.contains("show")){if(state==="playing")pauseGame();else resumeGame();return}
    if(state!=="playing"||!G||(e.target&&e.target.tagName==="INPUT"))return;
    if(k==="ArrowLeft"||k==="a"||k==="A"){e.preventDefault();G.aimX-=14}
    else if(k==="ArrowRight"||k==="d"||k==="D"){e.preventDefault();G.aimX+=14}
    else if(k===" "||k==="Enter"||k==="ArrowDown"||k==="s"||k==="S"){e.preventDefault();G.tmode?0:drop()}
    else if(k>="1"&&k<="6")power(KEYS[+k-1]);
  });
  $("#gNext").onclick=function(){if(gi<SLIDES.length-1){gi++;showSlide()}else closeGuide()};
  $("#gPrev").onclick=function(){if(gi){gi--;showSlide()}};
  $("#guide").addEventListener("click",function(e){if(e.target===this)closeGuide()});
  ["helpBtn0","helpBtn1","helpBtn"].forEach(function(id){$("#"+id).onclick=openGuide});
  $("#playBtn").onclick=function(){initAudio();Auth.render();screen("sAuth");if(!store("ledgerdrop-seen"))openGuide()};
  $("#backBtn").onclick=function(){screen("sStart")};
  Auth.onPlay=begin;
  $("#pauseBtn").onclick=function(){if(state==="playing")pauseGame();else resumeGame()};
  $("#resumeBtn").onclick=resumeGame;
  $("#pRestart").onclick=begin;$("#pHelp").onclick=openGuide;$("#pQuit").onclick=quitGame;
  document.addEventListener("visibilitychange",function(){if(document.hidden)pauseGame()});
  window.addEventListener("blur",pauseGame);
  $("#muteBtn").onclick=function(){muted=!muted;this.textContent="Sound: "+(muted?"off":"on");initAudio()};
  var vs=$("#vol");vs.value=store("ledgerdrop-vol")||100;setVolume(vs.value/100);
  vs.oninput=function(){setVolume(vs.value/100);store("ledgerdrop-vol",vs.value);initAudio()};
  vs.onchange=function(){sfx.power()};
  $$("#floaters canvas").forEach(function(c,i){c.getContext("2d").drawImage(portrait(i),0,0,c.width,c.height)});
  requestAnimationFrame(loop);
})();
