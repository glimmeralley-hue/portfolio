/* playground — live experiments, all vanilla JS */
(function(){
  var rand=function(a,b){return a+Math.random()*(b-a);};

  /* ——— 01 · INK FIELD — generative flow-field painting ——— */
  var cv=document.getElementById("inkCanvas");
  if(cv){
    var ctx=cv.getContext("2d");
    var palettes=[
      ["#17130d","#e0481c","#5b5342","#a85520"],
      ["#0f3b46","#e0481c","#f4efe6","#177f6e"],
      ["#17130d","#c8451f","#efe3cf","#7a2e12"],
      ["#1d2440","#e0481c","#f4efe6","#8a93c4"]
    ];
    var pal=palettes[0],t=0,running=true,parts=[];
    var N=Math.max(500,Math.min(900,Math.floor(innerWidth/2)));
    var mouse={x:-9e3,y:-9e3};

    var size=function(){cv.width=cv.clientWidth;cv.height=cv.clientHeight;};
    var seed=function(){
      ctx.fillStyle="#f4efe6";ctx.fillRect(0,0,cv.width,cv.height);
      parts=Array.from({length:N},function(){return{x:rand(0,cv.width),y:rand(0,cv.height)};});
    };
    var angle=function(x,y){
      return (Math.sin(x*0.004+t)+Math.cos(y*0.0035-t*0.7)+Math.sin((x+y)*0.0016))*1.8;
    };
    var frame=function(){
      if(running){
        t+=0.004;
        ctx.fillStyle="rgba(244,239,230,0.02)";ctx.fillRect(0,0,cv.width,cv.height);
        ctx.lineWidth=1.1;ctx.lineCap="round";
        for(var i=0;i<parts.length;i++){
          var p=parts[i],a=angle(p.x,p.y);
          var vx=Math.cos(a)*1.6,vy=Math.sin(a)*1.6;
          var dx=p.x-mouse.x,dy=p.y-mouse.y,d=Math.hypot(dx,dy);
          if(d<120&&d>0){var f=(120-d)/120*2.2;vx+=dx/d*f;vy+=dy/d*f;}
          var px=p.x,py=p.y;
          p.x+=vx;p.y+=vy;
          ctx.strokeStyle=pal[i%pal.length];
          ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(p.x,p.y);ctx.stroke();
          if(p.x<0||p.x>cv.width||p.y<0||p.y>cv.height){p.x=rand(0,cv.width);p.y=rand(0,cv.height);}
        }
      }
      requestAnimationFrame(frame);
    };
    cv.addEventListener("pointermove",function(e){
      var r=cv.getBoundingClientRect();
      mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;
    });
    cv.addEventListener("pointerleave",function(){mouse.x=-9e3;mouse.y=-9e3;});
    addEventListener("resize",function(){size();seed();});
    if("IntersectionObserver" in window){
      new IntersectionObserver(function(en){running=en[0].isIntersecting;},{threshold:0}).observe(cv);
    }
    size();seed();frame();

    var shuf=document.getElementById("inkShuffle");
    if(shuf)shuf.addEventListener("click",function(){
      pal=palettes[Math.floor(Math.random()*palettes.length)];
      ctx.fillStyle="rgba(244,239,230,.55)";ctx.fillRect(0,0,cv.width,cv.height);
    });
    var save=document.getElementById("inkSave");
    if(save)save.addEventListener("click",function(){
      var a=document.createElement("a");
      a.download="dyllan-ink-field.png";
      a.href=cv.toDataURL("image/png");
      a.click();
    });
  }

  /* ——— 02 · TYPE SPECIMEN — weight follows the cursor ——— */
  var spec=document.getElementById("specimen");
  if(spec){
    var chars=Array.prototype.slice.call(spec.querySelectorAll(".spec-char"));
    var smx=-9e9,smy=-9e9;
    var st=chars.map(function(){return{w:340};});
    spec.addEventListener("pointermove",function(e){
      var r=spec.getBoundingClientRect();
      smx=e.clientX-r.left;smy=e.clientY-r.top;
    });
    spec.addEventListener("pointerleave",function(){smx=-9e9;smy=-9e9;});
    (function tick(){
      var idle=smx<-8e8;
      chars.forEach(function(c,i){
        var r=c.getBoundingClientRect();
        var w;
        if(idle){
          w=300+Math.sin(Date.now()/650+i)*140; /* idle wave on touch devices */
        }else{
          var d=Math.hypot(smx-(r.left+r.width/2),smy-(r.top+r.height/2));
          w=900-Math.min(600,d*2.6);
        }
        var s=st[i];s.w+=(w-s.w)*.15;
        c.style.fontVariationSettings='"wght" '+s.w.toFixed(0)+', "opsz" 144';
      });
      requestAnimationFrame(tick);
    })();
  }

  /* ——— 03 · RUBBER WORDS — grab, drag, springs back ——— */
  var el=document.getElementById("elasticWord");
  if(el){
    var x=0,y=0,vx=0,vy=0,drag=null,springing=false;
    var paint=function(){
      el.style.transform="translate("+x.toFixed(2)+"px,"+y.toFixed(2)+"px) rotate("+(x*0.04).toFixed(2)+"deg)";
    };
    var spring=function(){
      if(springing)return;
      springing=true;
      (function step(){
        if(drag){springing=false;return;}
        vx+=(0-x)*.075;vy+=(0-y)*.075;vx*=.86;vy*=.86;
        x+=vx;y+=vy;paint();
        if(Math.abs(vx)>.08||Math.abs(vy)>.08||Math.abs(x)>.5){
          requestAnimationFrame(step);
        }else{
          x=0;y=0;vx=0;vy=0;paint();springing=false;
        }
      })();
    };
    el.addEventListener("pointerdown",function(e){
      drag={ox:e.clientX-x,oy:e.clientY-y};
      el.setPointerCapture(e.pointerId);
      el.classList.add("grabbing");
    });
    el.addEventListener("pointermove",function(e){
      if(!drag)return;
      x=e.clientX-drag.ox;y=e.clientY-drag.oy;vx=0;vy=0;paint();
    });
    var up=function(){
      if(!drag)return;
      drag=null;el.classList.remove("grabbing");spring();
    };
    el.addEventListener("pointerup",up);
    el.addEventListener("pointercancel",up);
  }

  /* ——— 04 · EVERYDAY UI — carousel, switch, magnetic buttons ——— */
  var track=document.getElementById("carTrack");
  if(track){
    var slides=track.children,dots=document.querySelectorAll("#carDots .car-dot");
    var idx=0;
    var go=function(n){
      idx=(n+slides.length)%slides.length;
      track.style.transform="translateX(-"+idx*100+"%)";
      dots.forEach(function(d,j){d.classList.toggle("on",j===idx);});
    };
    var prev=document.getElementById("carPrev"),next=document.getElementById("carNext");
    if(prev)prev.addEventListener("click",function(){go(idx-1);});
    if(next)next.addEventListener("click",function(){go(idx+1);});
    dots.forEach(function(d,j){d.addEventListener("click",function(){go(j);});});
  }

  var sw=document.getElementById("demoSwitch");
  if(sw)sw.addEventListener("click",function(){sw.classList.toggle("on");});

})();
