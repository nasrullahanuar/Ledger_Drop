(function(){
  var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
  var M=Matter,Engine=M.Engine,Bodies=M.Bodies,Composite=M.Composite,Events=M.Events,Body=M.Body,Query=M.Query;
  sfx.pop=function(){tone(600,.12,"square",.1,0,150)};
  sfx.power=function(){tone(660,.1,"triangle",.15);tone(990,.14,"triangle",.12,.08)};
  sfx.hit=function(){tone(100,.25,"sawtooth",.15,0,50)};

  // ================= Difficulty settings (edit freely) =================
  var DIFF={
    easy:{label:"Easy",time:240,maxDrop:3,gravity:1,grace:3000,cd:450,pw:3,mult:1,combo:1800,
      info:"4 minutes. Only small items drop. 3 of each power-up. Very forgiving limit line."},
    medium:{label:"Medium",time:180,maxDrop:4,gravity:1.15,grace:2000,cd:550,pw:2,mult:1.5,combo:1600,
      info:"3 minutes. 2 of each power-up. Scores x1.5."},
    hard:{label:"Hard",time:120,maxDrop:5,gravity:1.3,grace:1200,cd:650,pw:1,mult:2,combo:1200,
      info:"2 minutes. Bigger items drop, heavier gravity, 1 of each power-up. Scores x2."}
  };
  var mode="solo",diff="medium",cfg=DIFF.medium,state="menu",timeLeft=0,lastSec=0,boards=[],legendEls=[];

  function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  function fmt(s){s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+":"+("0"+(s%60)).slice(-2)}
  function screen(id){$$(".screen").forEach(function(e){e.classList.toggle("show",e.id===id)})}
  function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){}}
  function drawBall(c,i,x,y,s,ang,alpha){
    var r=ITEMS[i].r*s;c.save();c.globalAlpha=alpha*.2;c.fillStyle="#000";c.beginPath();c.arc(x+r*.08,y+r*.12,r*.98,0,7);c.fill();
    c.globalAlpha=alpha;c.translate(x,y);c.rotate(ang);c.drawImage(sprites[i],-r,-r,2*r,2*r);c.restore();
  }

  // ================= Board (one play field; solo uses 1, versus uses 2) =================
  function Board(i,name,seed){
    var self=this;this.i=i;this.name=name;this.rand=rng(seed);
    var sec=document.createElement("section");sec.className="board";
    sec.innerHTML='<div class="bhead"><div class="who"><b></b><small></small></div><div class="stat"><small>Score</small><b class="sc">0</b></div><div class="next"><canvas width="72" height="72"></canvas></div></div>'+
      '<div class="frame"><div class="wrap"><canvas class="cv"></canvas><div class="pick"></div><div class="toast"></div></div></div>'+
      '<div class="pw"><button class="small" data-p="elim"><em>\u2715</em> Remove <i></i></button><button class="small" data-p="shake"><em>\u224b</em> Shake <i></i></button><button class="small" data-p="pick"><em>\u2605</em> Pick <i></i></button></div>';
    $("#boards").appendChild(sec);this.sec=sec;
    this.cv=$(".cv",sec);this.cv.width=W*D;this.cv.height=H*D;this.ctx=this.cv.getContext("2d");this.ctx.setTransform(D,0,0,D,0,0);
    this.nctx=$(".next canvas",sec).getContext("2d");this.wrap=$(".wrap",sec);this.toastEl=$(".toast",sec);this.pickEl=$(".pick",sec);
    this.scEl=$(".sc",sec);this.subEl=$(".who small",sec);$(".who b",sec).textContent=name;
    for(var l=0;l<=cfg.maxDrop;l++)(function(l){
      var b=document.createElement("button"),c=document.createElement("canvas");c.width=c.height=60;c.getContext("2d").drawImage(sprites[l],0,0,60,60);
      b.appendChild(c);b.title=ITEMS[l].n;b.onclick=function(){self.choose(l)};self.pickEl.appendChild(b);
    })(l);
    $$(".pw button",sec).forEach(function(b){b.onclick=function(){self.power(b.dataset.p)}});
    function pt(e){var p=self.toPt(e);self.pt=p;self.aimX=p.x}
    this.cv.addEventListener("pointermove",pt);this.cv.addEventListener("pointerdown",pt);
    this.cv.addEventListener("pointerup",function(e){pt(e);self.click()});
    this.reset();
  }
  var P=Board.prototype;
  P.toPt=function(e){var rc=this.cv.getBoundingClientRect();return{x:(e.clientX-rc.left)*W/rc.width,y:(e.clientY-rc.top)*H/rc.height}};
  P.roll=function(){return Math.floor(this.rand()*(cfg.maxDrop+1))};
  P.reset=function(){
    var self=this,t=60,o={isStatic:true,friction:.4,frictionStatic:.6};
    this.engine=Engine.create({gravity:{y:cfg.gravity},positionIterations:10,velocityIterations:8});this.world=this.engine.world;
    Composite.add(this.world,[Bodies.rectangle(W/2,H+t/2-2,W+2*t,t,o),Bodies.rectangle(-t/2+2,H/2,t,H*2,o),Bodies.rectangle(W+t/2-2,H/2,t,H*2,o)]);
    Events.on(this.engine,"collisionStart",function(e){self.collide(e)});
    this.score=0;this.top=0;this.combo=0;this.lastMerge=0;this.maxCombo=0;this.fx=[];this.parts=[];this.shakeMag=0;this.comboShow=0;
    this.canDrop=true;this.aimX=W/2;this.pt=null;this.targeting=false;this.danger=false;this.sent=0;
    this.left={elim:cfg.pw,shake:cfg.pw,pick:cfg.pw};
    this.current=this.roll();this.nextLvl=this.roll();this.drawNext();
    var best=+store("ledgerdrop-best-"+diff)||0;
    this.subEl.textContent=mode==="solo"?"Best: "+best:(this.i?"\u2190 \u2192 \u00b7 \u2193 to drop":"A / D \u00b7 S to drop");
    this.updateUI();
  };
  P.updateUI=function(){
    var self=this;this.scEl.textContent=this.score;
    $$(".pw button",this.sec).forEach(function(b){var k=b.dataset.p,n=self.left[k];$("i",b).textContent="\u00d7"+n;b.disabled=!n;b.classList.toggle("armed",k==="elim"&&self.targeting)});
    if(mode==="solo")syncLegend(this.top);
  };
  P.toast=function(m){var e=this.toastEl;e.textContent=m;e.classList.add("show");clearTimeout(this.tt);this.tt=setTimeout(function(){e.classList.remove("show")},1500)};
  P.mk=function(l,x,y){
    var b=Bodies.circle(x,y,ITEMS[l].r,{restitution:.18,friction:.35,frictionStatic:.5,frictionAir:.004,density:.001*(1+l*.12),slop:.02});
    b.lvl=l;b.born=performance.now();b.merged=false;b.overSince=0;b.junk=false;return b;
  };
  P.burst=function(x,y,lvl,col){
    for(var i=0,n=10+lvl*3;i<n;i++){var a=Math.random()*6.28,s=1.5+Math.random()*(3+lvl*.4);
      this.parts.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1.5,life:1,rot:Math.random()*6,vr:(Math.random()-.5)*.4,w:3+Math.random()*4,h:2+Math.random()*3,
        col:Math.random()<.5?col:["#fff","#ffd54a","#7bc9a2","#7fa9d6"][i%4]})}
  };
  P.collide=function(ev){
    if(state!=="playing")return;
    var self=this,now=performance.now();
    ev.pairs.forEach(function(p){
      var a=p.bodyA,b=p.bodyB,v=Math.hypot(a.velocity.x-b.velocity.x,a.velocity.y-b.velocity.y);
      if(v>4&&now-lastThud>70){lastThud=now;sfx.thud(v,a.isStatic?b.circleRadius:a.circleRadius)}
      if(a.isStatic||b.isStatic||a.merged||b.merged||a.lvl!==b.lvl)return;
      a.merged=b.merged=true;
      var x=(a.position.x+b.position.x)/2,y=(a.position.y+b.position.y)/2,l=a.lvl;
      Composite.remove(self.world,a);Composite.remove(self.world,b);
      if(l===ITEMS.length-1)return;
      var nb=self.mk(l+1,x,y);Composite.add(self.world,nb);
      self.combo=(now-self.lastMerge<cfg.combo)?self.combo+1:1;self.lastMerge=now;
      if(self.combo>self.maxCombo)self.maxCombo=self.combo;if(self.combo>1)self.comboShow=now;
      var pts=Math.round((l+1)*(l+2)*Math.min(4,1+(self.combo-1)*.5)*cfg.mult);
      self.score+=pts;self.fx.push({x:x,y:y,t:now,txt:"+"+pts});self.burst(x,y,l,ITEMS[l+1].c);
      if(l>=5)self.shakeMag=Math.max(self.shakeMag,2+l*.5);
      var R=ITEMS[l+1].r*2.2;
      Composite.allBodies(self.world).forEach(function(o){
        if(o.isStatic||o===nb)return;
        var dx=o.position.x-x,dy=o.position.y-y,d=Math.hypot(dx,dy)||1;
        if(d<R){var k=2.2*(1-d/R);Body.setVelocity(o,{x:o.velocity.x+dx/d*k,y:o.velocity.y+dy/d*k})}
      });
      if(l+1>self.top)self.top=l+1;
      // versus: strong merges and combos attack the opponent
      if(boards.length>1){
        var n=(l>=3?1:0)+(l>=7?1:0)+(self.combo>1?1:0);
        if(n){boards[1-self.i].junk(n);self.sent+=n;self.toast("Attack! +"+n+" junk sent")}
      }
      self.updateUI();
      if(l+1===ITEMS.length-1)endMatch("trophy",self);else sfx.merge(l,self.combo);
    });
  };
  P.junk=function(n){
    var self=this;this.sec.classList.add("hit");setTimeout(function(){self.sec.classList.remove("hit")},500);sfx.hit();this.toast("Incoming junk!");
    for(var k=0;k<n;k++)setTimeout(function(){
      if(state!=="playing")return;
      var l=Math.random()<.5?0:1,r=ITEMS[l].r,b=self.mk(l,r+10+Math.random()*(W-2*r-20),20);b.junk=true;Composite.add(self.world,b);
    },k*350);
  };
  P.drop=function(){
    if(!this.canDrop)return;var self=this,r=ITEMS[this.current].r,x=Math.max(r+4,Math.min(W-r-4,this.aimX));
    Composite.add(this.world,this.mk(this.current,x,LINE-r-14));sfx.drop();this.canDrop=false;
    this.current=this.nextLvl;this.nextLvl=this.roll();this.drawNext();
    setTimeout(function(){self.canDrop=true},cfg.cd);
  };
  P.click=function(){
    if(state!=="playing")return;
    if(this.targeting){
      var hit=this.hit();
      if(hit){Composite.remove(this.world,hit);this.burst(hit.position.x,hit.position.y,hit.lvl,ITEMS[hit.lvl].c);
        this.left.elim--;this.targeting=false;sfx.pop();this.updateUI()}
    }else this.drop();
  };
  P.hit=function(){
    if(!this.pt)return null;
    return Query.point(Composite.allBodies(this.world).filter(function(b){return!b.isStatic}),this.pt)[0]||null;
  };
  P.power=function(k){
    if(state!=="playing"||!this.left[k])return;
    this.pickEl.classList.remove("show");
    if(k==="shake"){
      this.left.shake--;
      Composite.allBodies(this.world).forEach(function(b){if(!b.isStatic)Body.setVelocity(b,{x:b.velocity.x+(Math.random()-.5)*10,y:b.velocity.y-4-Math.random()*5})});
      this.shakeMag=9;sfx.shake();
    }else if(k==="elim"){
      this.targeting=!this.targeting;if(this.targeting)this.toast("Tap an item to remove it");
    }else{
      this.targeting=false;this.pickEl.classList.toggle("show");
    }
    this.updateUI();
  };
  P.choose=function(l){
    this.left.pick--;this.current=l;this.pickEl.classList.remove("show");sfx.power();this.toast("Next drop: "+ITEMS[l].n);this.updateUI();
  };
  P.drawNext=function(){
    var s=34*Math.sqrt(ITEMS[this.nextLvl].r/ITEMS[cfg.maxDrop].r);
    this.nctx.clearRect(0,0,72,72);this.nctx.drawImage(sprites[this.nextLvl],36-s,36-s,2*s,2*s);
  };
  P.update=function(now,dt){
    Engine.update(this.engine,dt);var over=false,dg=false;
    Composite.allBodies(this.world).forEach(function(b){
      if(b.isStatic)return;
      if(now-b.born>1200&&b.position.y-ITEMS[b.lvl].r<LINE){
        if(!b.overSince)b.overSince=now;dg=true;if(now-b.overSince>cfg.grace)over=true;
      }else b.overSince=0;
    });
    this.danger=dg;return over;
  };
  P.render=function(now,dt){
    var c=this.ctx,self=this;c.save();
    if(this.shakeMag>.1){c.translate((Math.random()-.5)*this.shakeMag,(Math.random()-.5)*this.shakeMag);this.shakeMag*=.88}else this.shakeMag=0;
    c.drawImage(bg,0,0,W,H);
    c.setLineDash([8,6]);c.strokeStyle="#c0392b";c.lineWidth=2;c.beginPath();c.moveTo(0,LINE);c.lineTo(W,LINE);c.stroke();c.setLineDash([]);
    c.fillStyle="#c0392b";c.font="11px 'Courier New',monospace";c.textAlign="left";c.fillText("CREDIT LIMIT",46,LINE-5);
    Composite.allBodies(this.world).forEach(function(b){
      if(b.isStatic)return;
      var age=now-b.born,s=age<200?.6+.4*(age/200)+(age<100?.12:0):1;
      drawBall(c,b.lvl,b.position.x,b.position.y,s,b.angle,1);
      if(b.junk){c.beginPath();c.arc(b.position.x,b.position.y,ITEMS[b.lvl].r,0,7);c.strokeStyle="rgba(192,57,43,.9)";c.lineWidth=2.5;c.stroke()}
    });
    if(this.danger&&state==="playing"&&Math.floor(now/250)%2){c.fillStyle="rgba(192,57,43,.2)";c.fillRect(0,0,W,LINE)}
    if(state==="playing"){
      if(this.targeting){
        var h=this.hit();c.fillStyle="rgba(10,20,15,.18)";c.fillRect(0,0,W,H);
        if(h){c.beginPath();c.arc(h.position.x,h.position.y,ITEMS[h.lvl].r+4,0,7);c.setLineDash([6,4]);c.strokeStyle="#ff3b2f";c.lineWidth=3;c.stroke();c.setLineDash([])}
      }else{
        var r=ITEMS[this.current].r,ax=Math.max(r+4,Math.min(W-r-4,this.aimX));
        c.setLineDash([3,7]);c.strokeStyle="rgba(90,100,95,.6)";c.lineWidth=1.5;c.beginPath();c.moveTo(ax,LINE);c.lineTo(ax,H);c.stroke();c.setLineDash([]);
        drawBall(c,this.current,ax,LINE-r-14,1,0,this.canDrop?1:.35);
      }
    }
    for(var i=this.parts.length-1;i>=0;i--){
      var p=this.parts[i];p.vy+=.12;p.x+=p.vx;p.y+=p.vy;p.rot+=p.vr;p.life-=dt/900;
      if(p.life<=0){this.parts.splice(i,1);continue}
      c.save();c.globalAlpha=p.life;c.translate(p.x,p.y);c.rotate(p.rot);c.fillStyle=p.col;c.fillRect(-p.w/2,-p.h/2,p.w,p.h);c.restore();
    }
    this.fx=this.fx.filter(function(f){return now-f.t<800});
    this.fx.forEach(function(f){var k=(now-f.t)/800;c.globalAlpha=1-k;c.font="bold 16px 'Courier New',monospace";c.textAlign="center";
      c.strokeStyle="#fff";c.lineWidth=3;c.strokeText(f.txt,f.x,f.y-k*40);c.fillStyle="#1f6b4f";c.fillText(f.txt,f.x,f.y-k*40)});
    c.globalAlpha=1;
    if(now-this.comboShow<1200&&this.combo>1){var k2=(now-this.comboShow)/1200;c.globalAlpha=1-k2*k2;c.font="bold "+(26+Math.min(this.combo,6)*2)+"px Georgia,serif";c.textAlign="center";
      c.strokeStyle="#fff";c.lineWidth=5;c.strokeText("COMBO x"+this.combo,W/2,LINE+40);c.fillStyle="#d4731c";c.fillText("COMBO x"+this.combo,W/2,LINE+40);c.globalAlpha=1}
    c.restore();
    this.wrap.classList.toggle("danger",this.danger&&state==="playing");
    this.cv.style.cursor=this.targeting?"crosshair":"pointer";
  };

  // ================= Legend (solo collection) =================
  ITEMS.forEach(function(it,i){
    var d=document.createElement("div"),c=document.createElement("canvas");c.width=c.height=60;
    c.getContext("2d").drawImage(sprites[i],0,0,60,60);d.appendChild(c);d.title=it.n;
    $("#legend").appendChild(d);legendEls.push(d);
  });
  function syncLegend(top){
    for(var i=0;i<=Math.max(top,cfg.maxDrop);i++){var e=legendEls[i];
      if(!e.classList.contains("on")){e.classList.add("on");if(state==="playing"){e.classList.add("new");setTimeout(function(x){x.classList.remove("new")},1000,e)}}}
  }

  // ================= Match flow =================
  function begin(){
    initAudio();
    var v1=$("#n1").value.trim(),n1=v1||"Guest",n2=$("#n2").value.trim()||"Guest 2";store("ledgerdrop-name",v1);
    if(mode==="versus"&&n2===n1)n2+=" (2)";
    cfg=DIFF[diff];state="menu";$("#boards").innerHTML="";$("#result").classList.remove("show");
    legendEls.forEach(function(e){e.classList.remove("on","new")});
    var seed=Math.random()*1e9|0;boards=[new Board(0,n1,seed)];if(mode==="versus")boards.push(new Board(1,n2,seed));
    $("#sGame").classList.toggle("versus",mode==="versus");
    $("#diffChip").textContent=cfg.label+" \u00b7 "+(mode==="versus"?"Versus":"Solo");
    timeLeft=cfg.time;lastSec=cfg.time;$("#time").textContent=fmt(timeLeft);$("#timeBox").classList.remove("low");
    screen("sGame");fit();state="playing";
  }
  function toMenu(){state="menu";boards=[];$("#boards").innerHTML="";$("#result").classList.remove("show");screen("sSetup")}

  function endMatch(reason,who){
    if(state!=="playing")return;state="ended";
    var a=boards[0],b=boards[1],cls,stamp,title,body,win=null;
    if(reason==="trophy"){who.score+=WIN_BONUS;who.updateUI()}
    if(!b){
      var won=reason==="trophy",key="ledgerdrop-best-"+diff,bst=+store(key)||0;if(a.score>bst){store(key,a.score);bst=a.score}
      cls=won?"win":"lose";stamp=won?"PAID":"OVERDUE";title=won?"Audit passed!":"Books not closed";
      body="<p>"+(won?"You built the Audit trophy.":reason==="time"?"Time ran out.":"Items piled over the limit.")+"</p><p>Score <b>"+a.score+"</b> &middot; Best ("+cfg.label+") "+bst+"<br>Top item: "+ITEMS[a.top].n+" &middot; Best combo x"+a.maxCombo+"</p>";
      sfx[won?"win":"lose"]();
    }else{
      win=reason==="trophy"?who:reason==="overflow"?(who===a?b:a):(a.score>b.score?a:b.score>a.score?b:null);
      cls=win?"win":"lose";stamp=win?"WINNER":"DRAW";title=win?win.name+" wins!":"It's a draw";
      var why=reason==="trophy"?who.name+" built the Audit trophy first.":reason==="overflow"?who.name+"'s pile overflowed.":win?"Higher score when time ran out.":"Equal scores at the bell.";
      body="<p>"+why+"</p><table class='tbl'>"+[a,b].map(function(x){return"<tr class='"+(x===win?"w":"")+"'><td>"+x.name+"</td><td>"+x.score+"</td><td>"+ITEMS[x.top].n+"</td><td>sent "+x.sent+"</td></tr>"}).join("")+"</table>";
      sfx.win();
    }
    var r=$("#result");r.className="overlay fixed show "+cls;
    r.innerHTML='<div class="sheet"><div class="stamp">'+stamp+'</div><h2>'+title+'</h2>'+body+'<div class="row"><button class="btn" id="resAgain">'+(b?"Rematch":"Play again")+'</button><button class="link" id="resMenu">Menu</button></div></div>';
    $("#resAgain").onclick=begin;$("#resMenu").onclick=toMenu;
  }

  // ================= Loop =================
  var last=performance.now();
  function loop(now){
    var dt=Math.min(33,now-last);last=now;
    if(state==="playing"){
      var ov=null;boards.forEach(function(b){if(b.update(now,dt)&&!ov)ov=b});
      timeLeft-=dt/1000;$("#time").textContent=fmt(timeLeft);
      var sec=Math.ceil(timeLeft);if(sec<=10&&sec<lastSec&&sec>0)sfx.tick();lastSec=sec;$("#timeBox").classList.toggle("low",timeLeft<=10);
      if(ov)endMatch("overflow",ov);else if(timeLeft<=0){timeLeft=0;$("#time").textContent="0:00";endMatch("time")}
    }
    boards.forEach(function(b){b.render(now,dt)});requestAnimationFrame(loop);
  }

  // ================= Menus & input =================
  function seg(id,fn){$$("#"+id+" button").forEach(function(b){b.onclick=function(){$$("#"+id+" button").forEach(function(x){x.classList.toggle("on",x===b)});fn(b.dataset.v)}})}
  seg("modeSeg",function(v){mode=v;$("#p2row").hidden=v!=="versus";$("#vsNote").hidden=v!=="versus"});
  seg("diffSeg",function(v){diff=v;$("#diffInfo").textContent=DIFF[v].info});
  $("#diffInfo").textContent=DIFF[diff].info;
  $$(".chip[data-g]").forEach(function(c){c.onclick=function(){$("#"+c.dataset.g).value=c.dataset.v}});
  $("#n1").value=store("ledgerdrop-name")||"";
  $("#playBtn").onclick=function(){initAudio();screen("sSetup");if(!store("ledgerdrop-seen"))openGuide()};
  $("#backBtn").onclick=function(){screen("sStart")};
  $("#goBtn").onclick=begin;$("#menuBtn").onclick=toMenu;
  $("#muteBtn").onclick=function(){muted=!muted;this.textContent="Sound: "+(muted?"off":"on");initAudio()};
  $$("#floaters canvas").forEach(function(c,i){c.getContext("2d").drawImage(sprites[i],0,0,c.width,c.height)});

  document.addEventListener("keydown",function(e){
    if(state!=="playing"||(e.target&&e.target.tagName==="INPUT"))return;
    var k=e.key;
    if(k==="Escape"){boards.forEach(function(b){b.targeting=false;b.pickEl.classList.remove("show");b.updateUI()});return}
    var map=boards.length===1?[{l:["ArrowLeft","a","A"],r:["ArrowRight","d","D"],d:[" ","Enter","ArrowDown","s","S"]}]
      :[{l:["a","A"],r:["d","D"],d:["s","S"," "]},{l:["ArrowLeft"],r:["ArrowRight"],d:["ArrowDown","Enter"]}];
    map.forEach(function(m,i){var b=boards[i];
      if(m.l.indexOf(k)>-1){e.preventDefault();b.aimX-=14}else if(m.r.indexOf(k)>-1){e.preventDefault();b.aimX+=14}
      else if(m.d.indexOf(k)>-1){e.preventDefault();b.click()}});
  });
  // ================= Fit to screen =================
  function fit(){
    var g=$("#sGame");if(!g.classList.contains("show"))return;
    var n=Math.max(1,boards.length),b=$(".board",g),cs=getComputedStyle(g);
    var w=g.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
    var used=$(".top",g).offsetHeight+($("#legend").offsetHeight||0)+(b?$(".bhead",b).offsetHeight+$(".pw",b).offsetHeight:80);
    var pad=parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom)+22+44;
    var bw=Math.min((window.innerHeight-used-pad)*420/640+22,(w-12*(n-1))/n);
    $("#boards").style.setProperty("--bw",Math.max(150,Math.floor(bw))+"px");
  }
  window.addEventListener("resize",fit);window.addEventListener("orientationchange",fit);

  // ================= How to play guide (pauses a running game) =================
  function ill(list){return'<div class="ill">'+list.map(function(x){return typeof x==="number"?'<canvas data-s="'+x+'"></canvas>':'<span>'+x+'</span>'}).join("")+'</div>'}
  var chain='<div class="ill chain">'+ITEMS.map(function(_,i){return'<canvas data-s="'+i+'"></canvas>'}).join("")+'</div>';
  var SLIDES=[
    {t:"Goal",h:chain+"<p>Merge matching items to climb the chain, from a <b>Coin</b> all the way up to the <b>Audit trophy</b>.</p><p>Build the trophy before the timer runs out to win.</p>"},
    {t:"Drop and merge",h:ill([0,"+",0,"\u2192",1])+"<p><b>Aim:</b> move the mouse, drag your finger, or press <kbd>\u2190</kbd> <kbd>\u2192</kbd>.</p><p><b>Drop:</b> click, tap, or press <kbd>Space</kbd>.</p><p>Two identical items that touch merge into the next item up.</p>"},
    {t:"Mind the credit limit",h:'<div class="limit"></div><p>If your pile stays above the red dashed line for too long, the books overflow and you lose.</p><p>Grace time: Easy 3s, Medium 2s, Hard 1.2s. Keep the pile low by merging small items early.</p>'},
    {t:"Power-ups",h:'<ul class="pwl"><li><b>\u2715 Remove</b> &ndash; tap it, then tap any item in your box to delete it.</li><li><b>\u224b Shake</b> &ndash; rattles the box to unstick items.</li><li><b>\u2605 Pick</b> &ndash; choose which item you drop next.</li></ul><p>Uses are limited: 3 on Easy, 2 on Medium, 1 on Hard. Press <kbd>Esc</kbd> to cancel Remove.</p>'},
    {t:"Combos and score",h:"<p>Merge again quickly to build a <b>combo</b>, up to x4 points.</p><p>Bigger items are worth more. Medium scores x1.5 and Hard x2. Building the Audit trophy adds a +500 bonus.</p><p>Your best score is saved for each difficulty.</p>"},
    {t:"Versus (2 players)",h:"<p><b>Player 1:</b> <kbd>A</kbd> <kbd>D</kbd> to move, <kbd>S</kbd> to drop.<br><b>Player 2:</b> <kbd>\u2190</kbd> <kbd>\u2192</kbd> to move, <kbd>\u2193</kbd> or <kbd>Enter</kbd> to drop. On a touch screen, tap your own box.</p><p>Big merges and combos send red junk coins into your opponent's box.</p><p>Win by building the trophy first, or by having the higher score when time ends. If your pile overflows, you lose.</p>"}
  ];
  var gi=0,guidePaused=false;
  function showSlide(){
    var s=SLIDES[gi];$("#gtitle").textContent=s.t;$("#gbody").innerHTML=s.h;
    $$("#gbody canvas").forEach(function(c){c.width=c.height=60;c.getContext("2d").drawImage(sprites[+c.dataset.s],0,0,60,60)});
    $("#gdots").innerHTML=SLIDES.map(function(_,i){return'<i class="'+(i===gi?"on":"")+'" data-i="'+i+'"></i>'}).join("");
    $$("#gdots i").forEach(function(d){d.onclick=function(){gi=+d.dataset.i;showSlide()}});
    $("#gPrev").style.visibility=gi?"visible":"hidden";$("#gNext").textContent=gi===SLIDES.length-1?"Got it!":"Next";
  }
  function openGuide(){gi=0;if(state==="playing"){state="paused";guidePaused=true}showSlide();$("#guide").classList.add("show")}
  function closeGuide(){
    $("#guide").classList.remove("show");store("ledgerdrop-seen","1");
    if(guidePaused&&state==="paused")state="playing";guidePaused=false;
  }
  $("#gNext").onclick=function(){if(gi<SLIDES.length-1){gi++;showSlide()}else closeGuide()};
  $("#gPrev").onclick=function(){if(gi){gi--;showSlide()}};
  $("#guide").addEventListener("click",function(e){if(e.target===this)closeGuide()});
  ["helpBtn0","helpBtn1","helpBtn"].forEach(function(id){$("#"+id).onclick=openGuide});
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&$("#guide").classList.contains("show"))closeGuide()});

  requestAnimationFrame(loop);
})();
