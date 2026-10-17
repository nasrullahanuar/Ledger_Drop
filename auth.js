// ================= Accounts (stored in this browser only) =================
// Usernames, emails and best scores live in localStorage on this device. Passwords are salted and
// hashed (PBKDF2) and never stored in plain text. A real server would be needed for cross-device
// accounts and emailed password resets.
var Auth=(function(){
  var $=function(s){return document.querySelector(s)},$$=function(s){return[].slice.call(document.querySelectorAll(s))};
  var KEY="ledgerdrop-users",SES="ledgerdrop-session",A={user:null,guest:false,onPlay:function(){}},users={},sessionBest=0;
  function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){}}
  function load(){try{users=JSON.parse(ls(KEY)||"{}")||{}}catch(e){users={}}}
  function save(){ls(KEY,JSON.stringify(users))}
  function hex(buf){return[].map.call(new Uint8Array(buf),function(x){return("0"+x.toString(16)).slice(-2)}).join("")}
  function rand(){var a=new Uint8Array(12);if(window.crypto&&crypto.getRandomValues)crypto.getRandomValues(a);else for(var i=0;i<12;i++)a[i]=Math.random()*256;return hex(a)}
  function hash(salt,pw){
    if(window.crypto&&crypto.subtle&&window.TextEncoder){
      var enc=new TextEncoder();
      return crypto.subtle.importKey("raw",enc.encode(pw),"PBKDF2",false,["deriveBits"]).then(function(k){
        return crypto.subtle.deriveBits({name:"PBKDF2",salt:enc.encode(salt),iterations:100000,hash:"SHA-256"},k,256)}).then(hex);
    }
    var s=salt+":"+pw,h1=0xdeadbeef,h2=0x41c6ce57;   // fallback when WebCrypto is unavailable (insecure origin)
    for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}
    h1=Math.imul(h1^h1>>>16,2246822507)^Math.imul(h2^h2>>>13,3266489909);h2=Math.imul(h2^h2>>>16,2246822507)^Math.imul(h1^h1>>>13,3266489909);
    return Promise.resolve("f"+(h2>>>0).toString(16)+(h1>>>0).toString(16));
  }
  function msg(t,ok){var m=$("#authMsg");m.textContent=t||"";m.className="msg"+(t?(ok?" ok":" err"):"")}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
  function findByEmail(e){e=e.trim().toLowerCase();for(var k in users)if(users[k].email===e)return users[k];return null}
  function setUser(rec){A.user=rec;A.guest=false;ls(SES,rec.name.toLowerCase())}

  // ---- public API used by the game ----
  A.name=function(){return A.user?A.user.name:"Guest"};
  A.best=function(){return A.user?(A.user.best||0):sessionBest};
  A.record=function(score,top){
    var prev=A.best(),nb=score>prev;
    if(A.user){A.user.best=Math.max(prev,score);A.user.last=score;A.user.games=(A.user.games||0)+1;A.user.top=Math.max(A.user.top||0,top||0);save()}
    else sessionBest=Math.max(sessionBest,score);
    return{best:Math.max(prev,score),newBest:nb};
  };
  A.render=function(){
    var u=A.user,card=!!(u||A.guest);
    $("#authCard").hidden=!card;$("#authForms").hidden=card;
    $("#authTitle").textContent=card?(u?"Welcome back":"Guest mode"):"Sign in to save scores";
    if(u){
      $("#hello").innerHTML="Signed in as <b>"+esc(u.name)+"</b>";
      $("#acctStats").innerHTML="<div><small>Best score</small><b>"+(u.best||0)+"</b></div><div><small>Last score</small><b>"+(u.last||0)+"</b></div><div><small>Games</small><b>"+(u.games||0)+"</b></div>";
      $("#cardSwitch").textContent="Sign out";
    }else if(A.guest){
      $("#hello").innerHTML="Playing as <b>Guest</b>";
      $("#acctStats").innerHTML="<p class='note'>Guest scores are not saved. Sign in or create an account to keep your records.</p>";
      $("#cardSwitch").textContent="Sign in / create account";
    }
    tab("in");msg("");
  };
  function tab(v){
    $$("#authTabs button").forEach(function(b){b.classList.toggle("on",b.dataset.v===v)});
    $("#fIn").hidden=v!=="in";$("#fUp").hidden=v!=="up";$("#fForgot").hidden=v!=="forgot";$("#authTabs").hidden=v==="forgot";
    msg("");
  }

  // ---- forms ----
  $$("#authTabs button").forEach(function(b){b.onclick=function(){tab(b.dataset.v)}});
  $$("[data-show]").forEach(function(b){b.onclick=function(){var i=$("#"+b.dataset.show),show=i.type==="password";i.type=show?"text":"password";b.textContent=show?"Hide":"Show"}});
  $("#forgotLink").onclick=function(){tab("forgot")};
  $("#forgotBack").onclick=function(){tab("in")};

  $("#fUp").onsubmit=function(e){
    e.preventDefault();
    var name=$("#upUser").value.trim(),email=$("#upEmail").value.trim().toLowerCase(),p1=$("#upPass").value,p2=$("#upPass2").value;
    if(!/^[A-Za-z0-9_]{3,12}$/.test(name))return msg("Username must be 3 to 12 letters, numbers or underscores.");
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return msg("Please enter a valid email address.");
    if(p1.length<6)return msg("Password must be at least 6 characters.");
    if(p1!==p2)return msg("The two passwords do not match.");
    if(users[name.toLowerCase()])return msg("That username is already taken.");
    if(findByEmail(email))return msg("An account with this email already exists. Try Forgot username or password.");
    var salt=rand();
    hash(salt,p1).then(function(h){
      var rec={name:name,email:email,salt:salt,hash:h,best:0,last:0,games:0,top:0,created:Date.now()};
      users[name.toLowerCase()]=rec;save();setUser(rec);$("#fUp").reset();A.render();msg("Account created. Your scores will now be saved.",true);
    });
  };
  $("#fIn").onsubmit=function(e){
    e.preventDefault();
    var name=$("#inUser").value.trim(),pw=$("#inPass").value,rec=users[name.toLowerCase()];
    if(!name||!pw)return msg("Enter your username and password.");
    if(!rec)return msg("Username or password is incorrect.");
    hash(rec.salt,pw).then(function(h){
      if(h!==rec.hash)return msg("Username or password is incorrect.");
      setUser(rec);$("#fIn").reset();A.render();msg("Signed in. Welcome back!",true);
    });
  };
  $("#fForgot").onsubmit=function(e){
    e.preventDefault();
    var rec=findByEmail($("#fgEmail").value),np=$("#fgPass").value;
    if(!rec)return msg("No account uses that email address.");
    var found="Your username is "+rec.name+".";
    if(!np)return msg(found+" To set a new password, type one below and press Recover again.",true);
    if(np.length<6)return msg(found+" The new password must be at least 6 characters.");
    var salt=rand();
    hash(salt,np).then(function(h){
      rec.salt=salt;rec.hash=h;save();$("#fForgot").reset();$("#inUser").value=rec.name;
      tab("in");msg(found+" Password updated. You can sign in now.",true);
    });
  };
  $("#guestBtn").onclick=function(){A.guest=true;A.user=null;ls(SES,null);A.onPlay()};
  $("#cardPlay").onclick=function(){A.onPlay()};
  $("#cardSwitch").onclick=function(){A.user=null;A.guest=false;ls(SES,null);A.render()};

  load();var s=ls(SES);if(s&&users[s])A.user=users[s];
  return A;
})();
