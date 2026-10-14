  // ================= Settings (edit freely) =================
  var ITEMS=[
    {n:"Coin",r:16,c:"#e9b43c"},{n:"Sticky note",r:22,c:"#f4e06d"},{n:"Receipt",r:28,c:"#d9cfb8"},
    {n:"Pen",r:35,c:"#7fa9d6"},{n:"Stamp",r:43,c:"#d97b7b"},{n:"Calculator",r:52,c:"#a9b4bd"},
    {n:"Invoice",r:61,c:"#a9c6e4"},{n:"Ledger",r:72,c:"#c98a5a"},{n:"Folder",r:84,c:"#e8c36a"},
    {n:"Laptop",r:97,c:"#9aa7b4"},{n:"Bank safe",r:111,c:"#86b394"},{n:"Audit trophy",r:126,c:"#f2c94c"}
  ];
  var W=420,H=640,LINE=110,WIN_BONUS=500;

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


var D=Math.min(2,window.devicePixelRatio||1);
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

