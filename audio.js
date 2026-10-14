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

