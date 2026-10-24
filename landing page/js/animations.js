(function(){
  var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js");
  var els=[].slice.call(document.querySelectorAll(".reveal"));
  if(reduce||!("IntersectionObserver" in window)){els.forEach(function(e){e.classList.add("in")});}
  else{
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}})},{threshold:.12});
    els.forEach(function(e){io.observe(e)});
  }
  var hero=document.querySelector(".hero");
  if(reduce||!matchMedia("(hover:hover) and (pointer:fine)").matches||!hero)return;
  var layers=[].slice.call(hero.querySelectorAll("[data-depth]")),x=0,y=0,t=false;
  hero.addEventListener("pointermove",function(e){
    var r=hero.getBoundingClientRect();x=(e.clientX-r.left)/r.width-.5;y=(e.clientY-r.top)/r.height-.5;
    if(!t){t=true;requestAnimationFrame(function(){
      layers.forEach(function(l){var d=+l.dataset.depth/10;l.style.transform="translate3d("+(-x*d)+"px,"+(-y*d*.6)+"px,0)";});
      t=false;});}
  },{passive:true});
})();
