/* shared behaviour — vanilla JS, no dependencies
   cursor · mobile nav · reveal-on-scroll · magnetic elements · copy email */
(function(){
  var doc=document;

  /* active nav link */
  var here=location.pathname.split("/").pop()||"index.html";
  doc.querySelectorAll(".site-nav a").forEach(function(a){
    if(a.getAttribute("href")===here)a.setAttribute("aria-current","page");
  });

  /* mobile nav */
  var toggle=doc.querySelector(".nav-toggle");
  if(toggle){
    toggle.addEventListener("click",function(){doc.body.classList.toggle("nav-open");});
    doc.querySelectorAll(".site-nav a").forEach(function(a){
      a.addEventListener("click",function(){doc.body.classList.remove("nav-open");});
    });
  }

  /* header hairline on scroll */
  var head=doc.querySelector(".site-head");
  addEventListener("scroll",function(){if(head)head.classList.toggle("scrolled",scrollY>10);},{passive:true});

  /* custom cursor — desktop only, decorative */
  var fine=matchMedia("(pointer:fine)").matches;
  if(fine){
    var dot=doc.createElement("div");dot.className="cursor-dot";
    var ring=doc.createElement("div");ring.className="cursor-ring";
    doc.body.append(dot,ring);
    var mx=-100,my=-100,rx=-100,ry=-100;
    addEventListener("mousemove",function(e){
      mx=e.clientX;my=e.clientY;
      dot.style.transform="translate("+mx+"px,"+my+"px) translate(-50%,-50%)";
    },{passive:true});
    (function loop(){
      rx+=(mx-rx)*.16;ry+=(my-ry)*.16;
      ring.style.transform="translate("+rx+"px,"+ry+"px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
    doc.addEventListener("mouseover",function(e){
      if(e.target.closest("a,button,[data-cursor]"))doc.body.classList.add("cursor-hover");
    });
    doc.addEventListener("mouseout",function(e){
      if(e.target.closest("a,button,[data-cursor]"))doc.body.classList.remove("cursor-hover");
    });
  }

  /* reveal on scroll */
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){
        en.target.style.transitionDelay=(en.target.dataset.delay||0)+"ms";
        en.target.classList.add("in-view");
        io.unobserve(en.target);
      }
    });
  },{threshold:.12});
  doc.querySelectorAll("[data-reveal]").forEach(function(el){io.observe(el);});

  /* magnetic elements (subtle pull toward cursor) */
  if(fine){
    doc.querySelectorAll(".magnetic").forEach(function(el){
      el.addEventListener("mousemove",function(e){
        var r=el.getBoundingClientRect();
        var x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;
        el.style.transform="translate("+x*.22+"px,"+y*.22+"px)";
      });
      el.addEventListener("mouseleave",function(){el.style.transform="";});
    });
  }

  /* copy-to-clipboard buttons */
  doc.querySelectorAll("[data-copy]").forEach(function(btn){
    btn.addEventListener("click",function(){
      var done=function(){
        var old=btn.textContent;
        btn.textContent="copied ✓";
        setTimeout(function(){btn.textContent=old;},1800);
      };
      if(navigator.clipboard)navigator.clipboard.writeText(btn.dataset.copy).then(done,done);
      else done();
    });
  });

  /* current year */
  doc.querySelectorAll("[data-year]").forEach(function(el){el.textContent=new Date().getFullYear();});
})();
