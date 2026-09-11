/* homepage — magnetic display letters + gentle parallax shapes */
(function(){
  var letters=document.querySelectorAll(".hero-title .lt");
  var fine=matchMedia("(pointer:fine)").matches;

  /* after the rise-in animation, hand control to JS so magnets can move them.
     must pin transform:none inline BEFORE killing the animation, otherwise the
     letters snap back to their hidden translateY(120%) base state */
  letters.forEach(function(l){
    l.addEventListener("animationend",function(){
      l.style.transform="none";
      l.style.animation="none";
    });
  });

  if(fine&&letters.length){
    var mx=innerWidth/2,my=innerHeight/2;
    addEventListener("mousemove",function(e){mx=e.clientX;my=e.clientY;},{passive:true});
    (function pull(){
      letters.forEach(function(l){
        var r=l.getBoundingClientRect();
        var dx=mx-(r.left+r.width/2),dy=my-(r.top+r.height/2);
        var d=Math.hypot(dx,dy)||1;
        if(d<240){
          var f=(1-d/240)*16;
          l.style.translate=(dx/d*f).toFixed(2)+"px "+(dy/d*f).toFixed(2)+"px";
        }else{
          l.style.translate="0px 0px";
        }
      });
      requestAnimationFrame(pull);
    })();
  }

  /* soft parallax on the decorative orbs */
  var shapes=document.querySelectorAll("[data-parallax]");
  if(shapes.length){
    addEventListener("scroll",function(){
      shapes.forEach(function(s){
        var f=parseFloat(s.dataset.parallax)||0;
        s.style.transform="translateY("+(scrollY*f).toFixed(1)+"px)";
      });
    },{passive:true});
  }
})();
