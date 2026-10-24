(function(){
  var tabs=[].slice.call(document.querySelectorAll('.app__side [role=tab]'));
  function select(t){
    tabs.forEach(function(b){
      var on=b===t;b.setAttribute("aria-selected",on);b.tabIndex=on?0:-1;
      document.getElementById(b.getAttribute("aria-controls")).hidden=!on;
    });t.focus();
  }
  tabs.forEach(function(b,i){
    b.addEventListener("click",function(){select(b)});
    b.addEventListener("keydown",function(e){
      var k=e.key,n=null;
      if(k==="ArrowDown"||k==="ArrowRight")n=tabs[(i+1)%tabs.length];
      else if(k==="ArrowUp"||k==="ArrowLeft")n=tabs[(i-1+tabs.length)%tabs.length];
      else if(k==="Home")n=tabs[0];else if(k==="End")n=tabs[tabs.length-1];
      if(n){e.preventDefault();select(n);}
    });
  });
  var play=document.querySelector("[data-demo]"),note=document.getElementById("demoNote");
  play.addEventListener("click",function(){note.textContent="This is a website demo. Install RawCraft to play.";});
  var mem=document.getElementById("mem"),out=document.getElementById("memOut");
  mem.addEventListener("input",function(){out.textContent=mem.value+" GB";});
})();
