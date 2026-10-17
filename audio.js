// ================= Sound (Web Audio, no files) =================
// A master gain plus a compressor makes everything much louder without harsh clipping.
var actx=null,muted=false,lastThud=0,master=null,masterVol=1,MASTER_GAIN=4.5;
function initAudio(){
  if(!actx){
    try{
      actx=new (window.AudioContext||window.webkitAudioContext)();
      var comp=actx.createDynamicsCompressor();
      comp.threshold.value=-18;comp.knee.value=18;comp.ratio.value=8;comp.attack.value=.003;comp.release.value=.2;
      master=actx.createGain();master.gain.value=MASTER_GAIN*masterVol;
      master.connect(comp);comp.connect(actx.destination);
    }catch(e){}
  }
  if(actx&&actx.state==="suspended")actx.resume();
}
function setVolume(v){masterVol=v;if(master)master.gain.value=MASTER_GAIN*v}
function tone(f,dur,type,vol,delay,endF){
  if(!actx||muted||!master)return;
  var t=actx.currentTime+(delay||0),o=actx.createOscillator(),g=actx.createGain();
  o.type=type||"sine";o.frequency.setValueAtTime(f,t);
  if(endF)o.frequency.exponentialRampToValueAtTime(endF,t+dur);
  g.gain.setValueAtTime(vol||.15,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.02);
}
var sfx={
  drop:function(){tone(420,.1,"triangle",.2,0,180)},
  thud:function(v,r){tone(140-r*.5,.1,"sine",Math.min(.3,v*.025),0,60)},
  merge:function(l,cb){var f=250*Math.pow(1.12,l)*(1+.07*(cb-1));tone(f,.18,"sine",.28);tone(f*1.5,.22,"triangle",.18,.06);if(cb>1)tone(f*2,.16,"square",.08,.1)},
  shake:function(){for(var i=0;i<6;i++)tone(90+Math.random()*60,.1,"sawtooth",.12,i*.05)},
  win:function(){[523,659,784,1047,1319].forEach(function(f,i){tone(f,.32,"triangle",.3,i*.11)})},
  lose:function(){[330,262,196,130].forEach(function(f,i){tone(f,.32,"sawtooth",.18,i*.15)})},
  tick:function(){tone(880,.06,"square",.12)}
};
