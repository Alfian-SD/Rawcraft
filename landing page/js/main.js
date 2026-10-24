(function(){
  var nav=document.getElementById("nav"),tg=document.getElementById("navToggle"),menu=document.getElementById("navMenu");
  function onScroll(){nav.classList.toggle("is-scrolled",scrollY>24);}
  addEventListener("scroll",onScroll,{passive:true});onScroll();
  function close(){menu.classList.remove("open");tg.setAttribute("aria-expanded","false");tg.setAttribute("aria-label","Open menu");}
  tg.addEventListener("click",function(){
    var o=menu.classList.toggle("open");tg.setAttribute("aria-expanded",o);tg.setAttribute("aria-label",o?"Close menu":"Open menu");
  });
  menu.addEventListener("click",function(e){if(e.target.tagName==="A")close();});
  addEventListener("keydown",function(e){if(e.key==="Escape"){close();tg.focus();}});
  var world=document.getElementById("world"),cap=document.getElementById("worldCap");
  var caps={meadow:"Meadow — a calm place to start.",desert:"Desert — wide skies, long horizons.",night:"Night — the world after dark."};
  [].forEach.call(document.querySelectorAll("button[data-scene]"),function(b){
    b.addEventListener("click",function(){
      world.dataset.scene=b.dataset.scene;cap.textContent=caps[b.dataset.scene];
      [].forEach.call(b.parentNode.children,function(s){s.setAttribute("aria-pressed",s===b);});
    });
  });
  document.getElementById("yr").textContent=new Date().getFullYear();
})();
