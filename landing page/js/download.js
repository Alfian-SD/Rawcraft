(function(){
  var c=(window.RAWCRAFT||{}).download||{};
  var btns=[].slice.call(document.querySelectorAll("[data-dl-cta]"));
  var main=document.getElementById("dlBtn"),status=document.getElementById("dlStatus"),hero=document.querySelector("[data-dl-status]");
  function set(id,v){document.getElementById(id).textContent=v||"Not published yet";}
  set("dlVer",c.version);set("dlSize",c.size);set("dlDate",c.date);set("dlSum",c.sha256);
  document.getElementById("dlReq").textContent=c.requirements||"Windows 10 or 11";
  function unavailable(msg){
    status.textContent=msg;if(hero)hero.textContent="Coming soon";
    main.setAttribute("aria-disabled","true");main.textContent="Download not available yet";
    btns.forEach(function(b){b.addEventListener("click",function(e){if(b.getAttribute("aria-disabled")==="true"){e.preventDefault();document.getElementById("download").scrollIntoView();}});});
  }
  if(!/^https:\/\//.test(c.url||"")){unavailable("Coming soon. The installer hasn’t been released yet.");return;}
  function enable(){
    btns.forEach(function(b){b.href=c.url;b.setAttribute("download","");b.removeAttribute("aria-disabled");});
    main.textContent="Download for Windows";
    status.textContent=(c.version?"Version "+c.version+". ":"")+"Ready to download.";
    if(hero)hero.textContent=c.version?"Version "+c.version:"Available now";
  }
  fetch(c.url,{method:"HEAD",mode:"no-cors"}).then(enable,function(){unavailable("The download is unreachable right now. Please try again later.");});
})();
