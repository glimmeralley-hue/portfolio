/* work gallery — drag/swipe, arrows, dots, gentle autoplay */
(function(){
  var g=document.getElementById('gallery');
  if(!g)return;
  var strip=g.querySelector('.g-strip');
  var view=g.querySelector('.g-viewport');
  var slides=strip.children;
  var dotsBox=g.querySelector('.g-dots');
  var cur=0,timer=null;
  var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

  for(var i=0;i<slides.length;i++){
    var d=document.createElement('button');
    d.className='g-dot';
    d.setAttribute('aria-label','Go to slide '+(i+1));
    (function(n){d.addEventListener('click',function(){go(n);restart();});})(i);
    dotsBox.appendChild(d);
  }
  var dots=dotsBox.children;

  function go(n){
    cur=(n+slides.length)%slides.length;
    strip.style.transform='translateX(-'+cur*100+'%)';
    for(var j=0;j<dots.length;j++)dots[j].classList.toggle('on',j===cur);
  }

  g.querySelector('.g-prev').addEventListener('click',function(){go(cur-1);restart();});
  g.querySelector('.g-next').addEventListener('click',function(){go(cur+1);restart();});

  /* drag / swipe */
  var startX=null,dx=0,w=1;
  view.addEventListener('pointerdown',function(e){
    startX=e.clientX;dx=0;w=view.clientWidth;
    strip.style.transition='none';
    view.setPointerCapture(e.pointerId);
    stop();
  });
  view.addEventListener('pointermove',function(e){
    if(startX===null)return;
    dx=e.clientX-startX;
    strip.style.transform='translateX('+(-cur*100+dx/w*100)+'%)';
  });
  function endDrag(){
    if(startX===null)return;
    strip.style.transition='';
    if(Math.abs(dx)>w*.15)go(cur+(dx<0?1:-1));else go(cur);
    startX=null;dx=0;restart();
  }
  view.addEventListener('pointerup',endDrag);
  view.addEventListener('pointercancel',endDrag);

  /* autoplay — pause on hover, off for reduced motion */
  function start(){if(reduced||timer)return;timer=setInterval(function(){go(cur+1);},4500);}
  function stop(){if(timer){clearInterval(timer);timer=null;}}
  function restart(){stop();start();}
  g.addEventListener('mouseenter',stop);
  g.addEventListener('mouseleave',start);

  go(0);start();
})();