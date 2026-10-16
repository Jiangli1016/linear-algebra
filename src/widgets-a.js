/* 互动组件（一）：首页、§1.1–§1.4 */
(function(){
'use strict';
var D=window.D,W=window.WIDGETS,F=D.F,Fr=D.Fr,fmt=D.fmt,K=D.K,T=D.T,$=D.$,$$=D.$$,esc=D.esc;

/* 组件外框：标题来自页面里的 data-t / data-d */
function frame(el){
  var k=el.dataset.k||'互动',t=el.dataset.t||'',d=el.dataset.d||'';
  el.innerHTML='<div class="w-head"><span class="w-k">'+esc(k)+'</span><span class="w-t">'+esc(t)+'</span>'+(d?'<span class="w-d">'+T(d)+'</span>':'')+'</div><div class="w-body"></div>';
  return el.querySelector('.w-body');
}
D.frame=frame;
function opt(arr,sel){return arr.map(function(o){var v=Array.isArray(o)?o[0]:o,l=Array.isArray(o)?o[1]:o;return '<option value="'+esc(v)+'"'+(String(v)===String(sel)?' selected':'')+'>'+esc(l)+'</option>'}).join('')}
D.opt=opt;
function idxOpts(n,sel){var a=[];for(var i=0;i<n;i++) a.push([i,String(i+1)]);return opt(a,sel)}
D.idxOpts=idxOpts;

/* ---------- 首页：可编辑 3 阶行列式 ---------- */
W.hero3=function(el){
  var M=null,last=null;
  el.innerHTML='<div class="eq"><div class="ed"></div><span class="big">= <span class="v"></span></span></div>'+
    '<div class="btns" style="justify-content:center"><button class="btn sm" data-a="swap">交换第 1、2 行</button><button class="btn sm" data-a="scale">第 1 行 ×2</button><button class="btn sm" data-a="add">第 2 行 + 第 1 行</button><button class="btn sm" data-a="same">让两行相同</button><button class="btn sm" data-a="rand">随机</button></div><div class="msg small" style="text-align:center"></div>';
  var msg=$('.msg',el);
  var ed=new D.MatEd($('.ed',el),[[2,1,3],[0,-1,4],[1,2,5]],function(m){M=m;$('.v',el).innerHTML=m?fmt(D.det(m)):'—'});
  el.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b||!M) return;
    var A=D.cloneM(M),before=D.det(M),txt='';
    if(b.dataset.a==='swap'){var t=A[0];A[0]=A[1];A[1]=t;txt='交换两行，值变号（性质 4）'}
    else if(b.dataset.a==='scale'){A[0]=A[0].map(function(x){return x.mul(2)});txt='一行乘 2，值乘 2（性质 3）'}
    else if(b.dataset.a==='add'){A[1]=A[1].map(function(x,j){return x.add(A[0][j])});txt='一行加到另一行，值不变（性质 7）'}
    else if(b.dataset.a==='same'){A[2]=A[0].slice();txt='两行相同，值为 0（性质 5）'}
    else{A=D.randM(3,-3,5);txt='随机生成一个整数行列式'}
    ed.setFr(A);
    msg.innerHTML=b.dataset.a==='rand'?txt:fmt(before)+' → '+fmt(D.det(A))+'：'+txt;
  });
};

/* ---------- §1.1 二元方程组与两条直线 ---------- */
W.lines2=function(el){
  var body=frame(el);
  var keys=['a11','a12','b1','a21','a22','b2'],st={};
  var P={ex:[2,-1,5,3,2,11],par:[1,2,2,2,4,-2],same:[1,2,2,2,4,4],steep:[1,-1,0,1,1,4]};
  function load(a){keys.forEach(function(k,i){st[k]=F(a[i])})}
  load(P.ex);
  body.innerHTML='<div class="w-grid"><div>'+
    [1,2].map(function(r){return '<div class="row" style="margin:.35rem 0"><input class="num" data-k="a'+r+'1" aria-label="a'+r+'1">'+K('x_1+')+'<input class="num" data-k="a'+r+'2" aria-label="a'+r+'2">'+K('x_2=')+'<input class="num" data-k="b'+r+'" aria-label="b'+r+'"></div>'}).join('')+
    '<div class="btns"><button class="btn sm" data-l="ex">例 1.1.1</button><button class="btn sm" data-l="par">两直线平行</button><button class="btn sm" data-l="same">两直线重合</button><button class="btn sm" data-l="steep">垂直相交</button></div><div class="out"></div></div>'+
    '<div><svg class="plot" viewBox="0 0 400 400" role="img" aria-label="两条直线"></svg><div class="msg"></div></div></div>';
  var inputs=$$('input',body),out=$('.out',body),svg=$('svg',body),msg=$('.msg',body);
  function sync(){inputs.forEach(function(i){i.value=st[i.dataset.k].toString();i.classList.remove('bad')})}
  inputs.forEach(function(inp){inp.addEventListener('input',function(){var v=D.parseFr(inp.value);inp.classList.toggle('bad',!v);if(v){st[inp.dataset.k]=v;upd()}})});
  body.addEventListener('click',function(e){var b=e.target.closest('[data-l]');if(b){load(P[b.dataset.l]);sync();upd()}});
  function vm2(a,b,c,d){return '\\begin{vmatrix}'+a.tex()+'&'+b.tex()+'\\\\'+c.tex()+'&'+d.tex()+'\\end{vmatrix}'}
  function upd(){
    var a11=st.a11,a12=st.a12,b1=st.b1,a21=st.a21,a22=st.a22,b2=st.b2;
    var d=a11.mul(a22).sub(a12.mul(a21)),d1=b1.mul(a22).sub(a12.mul(b2)),d2=a11.mul(b2).sub(b1.mul(a21));
    var h=K('D='+vm2(a11,a12,a21,a22)+'='+D.pt(a11)+'\\cdot'+D.pt(a22)+'-'+D.pt(a12)+'\\cdot'+D.pt(a21)+'='+d.tex(),true);
    h+=K('D_1='+vm2(b1,a12,b2,a22)+'='+d1.tex(),true)+K('D_2='+vm2(a11,b1,a21,b2)+'='+d2.tex(),true);
    if(!d.isZero()){h+=K('x_1=\\frac{D_1}{D}='+d1.div(d).tex()+',\\quad x_2=\\frac{D_2}{D}='+d2.div(d).tex(),true);msg.innerHTML='<span class="ok">D ≠ 0</span>：两直线交于一点，方程组有唯一解。'}
    else msg.innerHTML=(d1.isZero()&&d2.isZero())?'<span class="no">D = 0</span>：两直线重合，有无穷多解，公式失效。':'<span class="no">D = 0</span>：两直线平行，无解，公式失效。';
    out.innerHTML=h;
    plot([[a11.val(),a12.val(),b1.val()],[a21.val(),a22.val(),b2.val()]],d.isZero()?null:[d1.div(d).val(),d2.div(d).val()]);
  }
  function plot(lines,ip){
    var S=22,O=200,R=9.2,X=function(x){return O+x*S},Y=function(y){return O-y*S},g='';
    for(var k=-9;k<=9;k++) g+='<line class="grid" x1="'+X(k)+'" y1="0" x2="'+X(k)+'" y2="400"/><line class="grid" x1="0" y1="'+Y(k)+'" x2="400" y2="'+Y(k)+'"/>';
    g+='<line class="axis" x1="0" y1="'+O+'" x2="400" y2="'+O+'"/><line class="axis" x1="'+O+'" y1="0" x2="'+O+'" y2="400"/><text x="384" y="'+(O-6)+'">x₁</text><text x="'+(O+6)+'" y="14">x₂</text>';
    for(k=-8;k<=8;k+=2) if(k) g+='<text class="tk" x="'+(X(k)-4)+'" y="'+(O+14)+'">'+k+'</text>';
    lines.forEach(function(l,idx){
      var a=l[0],b=l[1],c=l[2],p1,p2;
      if(Math.abs(b)>1e-12&&Math.abs(b)>=Math.abs(a)){p1=[-R,(c+a*R)/b];p2=[R,(c-a*R)/b]}
      else if(Math.abs(a)>1e-12){p1=[(c+b*R)/a,-R];p2=[(c-b*R)/a,R]}else return;
      g+='<line class="l'+(idx+1)+'" x1="'+X(p1[0])+'" y1="'+Y(p1[1])+'" x2="'+X(p2[0])+'" y2="'+Y(p2[1])+'"'+(idx?' stroke-dasharray="8 5"':'')+'/>';
    });
    g+='<rect x="6" y="6" width="96" height="44" rx="6" fill="var(--sheet)" opacity=".85"/><line class="l1" x1="12" y1="20" x2="34" y2="20"/><text x="40" y="24">方程 1</text><line class="l2" x1="12" y1="40" x2="34" y2="40" stroke-dasharray="8 5"/><text x="40" y="44">方程 2</text>';
    if(ip&&Math.abs(ip[0])<R&&Math.abs(ip[1])<R){var tx=X(ip[0])+9>330?X(ip[0])-90:X(ip[0])+9;g+='<circle class="ptk" cx="'+X(ip[0])+'" cy="'+Y(ip[1])+'" r="5.5"/><text x="'+tx+'" y="'+(Y(ip[1])-9)+'" style="font-weight:700">('+D.fnum(ip[0])+', '+D.fnum(ip[1])+')</text>'}
    svg.innerHTML=g;
  }
  sync();upd();
};

/* ---------- §1.1 有向面积 ---------- */
W.area2=function(el){
  var body=frame(el);
  body.innerHTML='<div class="w-grid"><div><svg class="plot" viewBox="0 0 420 420" role="img" aria-label="平行四边形面积"></svg><p class="tiny muted" style="text-align:center">拖动两个圆点改变两列（网格步长 0.5）</p></div><div><div class="out"></div>'+
    '<div class="tiny muted" style="margin-top:.4rem">正确的变换</div><div class="btns" style="margin-top:.25rem"><button class="btn sm" data-g="swap">交换两列</button><button class="btn sm" data-g="scale">第 1 列 ×2</button><button class="btn sm" data-g="half">第 1 列 ×½</button><button class="btn sm" data-g="shear">第 2 列 + ½·第 1 列</button><button class="btn sm" data-g="col">两列成比例</button><button class="btn sm" data-g="reset">重置</button></div>'+
    '<div class="tiny" style="color:var(--neg);font-weight:600;margin-top:.5rem">易错对照（虚线框是变换前的图形）</div><div class="btns" style="margin-top:.25rem"><button class="btn sm err" data-g="e1">✗ 第 2 列先 ×2 再加第 1 列</button><button class="btn sm" data-g="e1ok">✓ 第 2 列 + 2·第 1 列</button><button class="btn sm err" data-g="e2">✗ 以为“全体元素 ×2”只乘 2</button><button class="btn sm err" data-g="e3">✗ 交换两列忘了变号</button></div><div class="msg"></div>'+
    '<div class="tw"><table class="t l small"><tr><th>操作</th><th>几何上</th><th>代数上</th></tr><tr><td>一列乘 c</td><td>一条边伸缩 c 倍</td><td>性质 3</td></tr><tr><td>交换两列</td><td>转向反了</td><td>性质 4</td></tr><tr><td>两列成比例</td><td>压扁成线段</td><td>性质 5</td></tr><tr><td>倍加</td><td>剪切：同底等高</td><td>性质 7</td></tr></table></div></div></div>';
  var svg=$('svg',body),S=34,O=210,R=5.5,u=[2,1],v=[1,3],drag=null,anim=0;
  function P(p){return [O+p[0]*S,O-p[1]*S]}
  var base='<defs><marker id="mkU" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--accent)"/></marker><marker id="mkV" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--stat)"/></marker></defs>';
  for(var k=-6;k<=6;k++) base+='<line class="grid" x1="'+(O+k*S)+'" y1="0" x2="'+(O+k*S)+'" y2="420"/><line class="grid" x1="0" y1="'+(O+k*S)+'" x2="420" y2="'+(O+k*S)+'"/>';
  base+='<line class="axis" x1="0" y1="'+O+'" x2="420" y2="'+O+'"/><line class="axis" x1="'+O+'" y1="0" x2="'+O+'" y2="420"/><g class="dyn"></g>';
  svg.innerHTML=base;
  var dyn=$('.dyn',svg),out=$('.out',body),msg=$('.msg',body);
  function d2(){return u[0]*v[1]-v[0]*u[1]}
  var ghost=null;
  function draw(){
    var d=d2(),cls=Math.abs(d)<1e-9?'area-zero':(d>0?'area-pos':'area-neg');
    var gh=ghost?'<polygon class="area-ghost" points="'+P([0,0])+' '+P(ghost[0])+' '+P([ghost[0][0]+ghost[1][0],ghost[0][1]+ghost[1][1]])+' '+P(ghost[1])+'"/>':'';
    var o=P([0,0]),pu=P(u),pv=P(v),puv=P([u[0]+v[0],u[1]+v[1]]),c=P([(u[0]+v[0])/2,(u[1]+v[1])/2]);
    function lbl(p,t,cl){var x=p[0]+12,anchor='start';if(x>360){x=p[0]-12;anchor='end'}return '<text class="'+cl+'" x="'+x+'" y="'+Math.max(14,Math.min(410,p[1]+4))+'" text-anchor="'+anchor+'">'+t+'</text>'}
    dyn.innerHTML=gh+'<polygon class="'+cls+'" points="'+o+' '+pu+' '+puv+' '+pv+'"/>'+(cls!=='area-zero'?'<text x="'+c[0]+'" y="'+c[1]+'" text-anchor="middle" style="font-weight:700;font-size:14px">'+D.fnum(d)+'</text>':'')+
      '<line class="vu" x1="'+o[0]+'" y1="'+o[1]+'" x2="'+pu[0]+'" y2="'+pu[1]+'" marker-end="url(#mkU)"/><line class="vv" x1="'+o[0]+'" y1="'+o[1]+'" x2="'+pv[0]+'" y2="'+pv[1]+'" marker-end="url(#mkV)"/>'+
      '<circle class="hu" data-h="u" cx="'+pu[0]+'" cy="'+pu[1]+'" r="11"/><circle class="hv" data-h="v" cx="'+pv[0]+'" cy="'+pv[1]+'" r="11"/>'+lbl(pu,'u（第 1 列）','tu')+lbl(pv,'v（第 2 列）','tv');
    var orient=Math.abs(d)<1e-9?'两列共线，面积为 0':(d>0?'u 逆时针转到 v：取正号':'u 顺时针转到 v：取负号');
    out.innerHTML='<div class="row">'+D.matHTML([[D.fnum(u[0]),D.fnum(v[0])],[D.fnum(u[1]),D.fnum(v[1])]])+'<span class="big">= '+D.fnum(d)+'</span></div><p class="small">面积 = |det| = <b>'+D.fnum(Math.abs(d))+'</b>　'+orient+'</p>';
  }
  function snap(x){return Math.max(-R,Math.min(R,Math.round(x*2)/2))}
  function pt(e){var r=svg.getBoundingClientRect();return [(e.clientX-r.left)/r.width*420,(e.clientY-r.top)/r.height*420]}
  svg.addEventListener('pointerdown',function(e){var h=e.target.closest('[data-h]');if(!h) return;drag=h.dataset.h;cancelAnimationFrame(anim);try{svg.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault()});
  svg.addEventListener('pointermove',function(e){if(!drag) return;var p=pt(e),w=[snap((p[0]-O)/S),snap((O-p[1])/S)];if(drag==='u')u=w;else v=w;draw()});
  function end(){drag=null}
  svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
  function animTo(nu,nv,t,note,bad){
    cancelAnimationFrame(anim);var u0=u.slice(),v0=v.slice(),t0=performance.now(),before=d2();ghost=note?[u0,v0]:null;
    var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    function step(now){var k=reduce?1:Math.min(1,(now-t0)/600),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
      u=[u0[0]+(nu[0]-u0[0])*e,u0[1]+(nu[1]-u0[1])*e];v=[v0[0]+(nv[0]-v0[0])*e,v0[1]+(nv[1]-v0[1])*e];draw();
      if(k<1) anim=requestAnimationFrame(step);else{u=nu;v=nv;draw();msg.innerHTML='<b>'+t+'</b>：det '+D.fnum(before)+' → '+D.fnum(d2())+(note?'<div class="'+(bad?'err-note':'ok-note')+'">'+note+'</div>':'')}}
    anim=requestAnimationFrame(step);
  }
  var ops={swap:function(){animTo(v.slice(),u.slice(),'交换两列（性质 4）')},scale:function(){animTo([u[0]*2,u[1]*2],v.slice(),'第 1 列 ×2（性质 3）')},half:function(){animTo([u[0]/2,u[1]/2],v.slice(),'第 1 列 ×½（性质 3）')},
    shear:function(){animTo(u.slice(),[v[0]+u[0]/2,v[1]+u[1]/2],'第 2 列 + ½·第 1 列（性质 7，面积始终不变）')},col:function(){animTo(u.slice(),[u[0]*1.5,u[1]*1.5],'第 2 列 = 1.5·第 1 列（性质 5）')},reset:function(){animTo([2,1],[1,3],'重置')},
    e1:function(){u=[1.5,.5];v=[.5,1.5];draw();animTo(u.slice(),[2*v[0]+u[0],2*v[1]+u[1]],'第 2 列 ← 2·第 2 列 + 第 1 列','值变成了 2 倍，不是“不变”。被改动的第 2 列先乘了 2（性质 3），再做倍加（性质 7）。倍加时被改动的那一列系数必须是 1。',true)},
    e1ok:function(){u=[1.5,.5];v=[.5,1.5];draw();animTo(u.slice(),[v[0]+2*u[0],v[1]+2*u[1]],'第 2 列 ← 第 2 列 + 2·第 1 列','平行四边形被“剪切”，同底等高，面积不变：这才是性质 7 的倍加。',false)},
    e2:function(){u=[1.5,.5];v=[.5,1.5];draw();animTo([2*u[0],2*u[1]],[2*v[0],2*v[1]],'两列都 ×2（全体元素 ×2）','两条边都伸长 2 倍，面积变为 2² = 4 倍，不是 2 倍。一般地 |cA| = cⁿ|A|。',true)},
    e3:function(){u=[1.5,.5];v=[.5,1.5];draw();animTo(v.slice(),u.slice(),'交换两列','面积大小不变，但转向反了（从逆时针变成顺时针），值必须变号（性质 4）。',true)}};
  body.addEventListener('click',function(e){var b=e.target.closest('[data-g]');if(b) ops[b.dataset.g]()});
  draw();
};

/* ---------- §1.1 二阶性质验证器 ---------- */
W.props2=function(el){
  var body=frame(el);
  body.innerHTML='<div class="ctrl"><label>选择性质 <select class="ps">'+opt([['1','性质 1 上三角'],['2','性质 2 零行'],['3','性质 3 倍乘'],['4','性质 4 交换'],['5','性质 5 成比例'],['6','性质 6 可加性'],['7','性质 7 倍加'],['8','性质 8 转置']],'7')+'</select></label><button class="btn sm pri rnd">换一组数</button></div><div class="out"></div>';
  var sel=$('.ps',body),out=$('.out',body),r=function(){return D.randInt(-5,6)};
  function vm2(m){return D.vm(m)}
  function dv(m){return D.det(D.toM(m))}
  function run(){
    var a=r(),b=r(),c=r(),d=r(),k=D.randInt(2,4)*(Math.random()<.5?-1:1),A=[[a,b],[c,d]],L,R,lt,rt,note;
    switch(sel.value){
      case '1':L=[[a,b],[0,d]];lt=vm2(L);rt=a+'\\cdot'+D.pt(F(d));R=a*d;note='上三角：只剩主对角线乘积';break;
      case '2':L=[[0,0],[c,d]];lt=vm2(L);rt='0';R=0;note='零行使每一项都含 0';break;
      case '3':L=[[k*a,k*b],[c,d]];lt=vm2(L);rt=D.pt(F(k))+'\\cdot'+vm2(A);R=k*dv(A).val();note='第一行乘 '+k+'，值也乘 '+k;break;
      case '4':L=[[c,d],[a,b]];lt=vm2(L);rt='-'+vm2(A);R=-dv(A).val();note='交换两行，值变号';break;
      case '5':L=[[a,b],[k*a,k*b]];lt=vm2(L);rt='0';R=0;note='第二行是第一行的 '+k+' 倍';break;
      case '6':var c1=r(),d1=r();L=[[a,b],[c1+(c-c1),d1+(d-d1)]];lt='\\begin{vmatrix}'+a+'&'+b+'\\\\'+c1+'+('+(c-c1)+')&'+d1+'+('+(d-d1)+')\\end{vmatrix}';rt=vm2([[a,b],[c1,d1]])+'+'+vm2([[a,b],[c-c1,d-d1]]);R=dv([[a,b],[c1,d1]]).val()+dv([[a,b],[c-c1,d-d1]]).val();note='只拆第二行，第一行保持不变';break;
      case '7':L=[[a,b],[c+k*a,d+k*b]];lt=vm2(L);rt=vm2(A);R=dv(A).val();note='把第一行的 '+k+' 倍加到第二行';break;
      default:L=[[a,c],[b,d]];lt=vm2(L);rt=vm2(A);R=dv(A).val();note='行列互换';
    }
    var Lv=dv(L).val();
    out.innerHTML=K(lt+'='+rt,true)+'<div class="row small"><span>左边 = <b>'+D.fnum(Lv)+'</b></span><span>右边 = <b>'+D.fnum(R)+'</b></span><span class="'+(Math.abs(Lv-R)<1e-9?'ok':'no')+'">'+(Math.abs(Lv-R)<1e-9?'✓ 相等':'✗')+'</span><span class="muted">'+note+'</span></div>';
  }
  sel.addEventListener('change',run);$('.rnd',body).addEventListener('click',run);run();
};

/* ---------- §1.2 对角线法则 + 四阶陷阱 ---------- */
W.sarrus=function(el){
  var body=frame(el);
  body.innerHTML='<div class="w-grid"><div><div class="ed"></div><div class="btns"><button class="btn sm" data-p="a">例 1.2.1</button><button class="btn sm" data-p="b">习题 1.2 第 1(2) 题</button><button class="btn sm" data-p="r">随机</button></div><div class="mat"></div><p class="tiny muted">点右侧任一项，左图标出它取的三个元素</p></div><div class="terms"></div></div>'+
    '<details class="more"><summary>四阶也能画对角线吗？</summary><div class="dbody"><div class="trap"></div></div></details>';
  var M=null,cur=-1,PR={a:[[1,-1,2],[2,0,3],[-1,-3,2]],b:[[0,1,2],[2,1,1],[-1,3,1]]};
  var T6=[[[0,0],[1,1],[2,2],1],[[0,1],[1,2],[2,0],1],[[0,2],[1,0],[2,1],1],[[0,2],[1,1],[2,0],-1],[[0,1],[1,0],[2,2],-1],[[0,0],[1,2],[2,1],-1]];
  var ed=new D.MatEd($('.ed',body),PR.a,function(m){M=m;draw()});
  body.addEventListener('click',function(e){
    var b=e.target.closest('[data-p]');if(b){ed.set(b.dataset.p==='r'?D.randM(3,-3,4).map(function(r){return r.map(String)}):PR[b.dataset.p]);return}
    var t=e.target.closest('[data-t]');if(t){cur=+t.dataset.t===cur?-1:+t.dataset.t;draw()}
  });
  function draw(){
    if(!M){$('.terms',body).innerHTML=D.BAD;return}
    var on=cur>=0?T6[cur]:null;
    $('.mat',body).innerHTML=D.matHTML(M,{cell:function(i,j){if(!on) return '';for(var q=0;q<3;q++) if(on[q][0]===i&&on[q][1]===j) return on[3]>0?'pos':'neg';return 'off'}});
    var s=F(0),rows='';
    T6.forEach(function(t,ti){var p=M[t[0][0]][t[0][1]].mul(M[t[1][0]][t[1][1]]).mul(M[t[2][0]][t[2][1]]),v=t[3]>0?p:p.neg();s=s.add(v);
      rows+='<tr class="'+(ti===cur?'sum':'')+'" data-t="'+ti+'" style="cursor:pointer"><td>'+(t[3]>0?'<span class="chip pos">+</span>':'<span class="chip neg">−</span>')+'</td><td>'+K('a_{'+(t[0][0]+1)+(t[0][1]+1)+'}a_{'+(t[1][0]+1)+(t[1][1]+1)+'}a_{'+(t[2][0]+1)+(t[2][1]+1)+'}')+'</td><td class="mono">'+fmt(M[t[0][0]][t[0][1]])+'·'+fmt(M[t[1][0]][t[1][1]])+'·'+fmt(M[t[2][0]][t[2][1]])+'</td><td class="mono">'+fmt(v)+'</td></tr>'});
    var def=F(0);for(var i=0;i<3;i++){var t=M[i][0].mul(D.det(D.minorOf(M,i,0)));def=i%2?def.sub(t):def.add(t)}
    $('.terms',body).innerHTML='<div class="tw"><table class="t"><tr><th>号</th><th>项</th><th>因子</th><th>值</th></tr>'+rows+'<tr class="sum"><td colspan="3">六项之和</td><td class="mono">'+fmt(s)+'</td></tr></table></div><p class="small">按定义（第一列展开）'+K('a_{11}M_{11}-a_{21}M_{21}+a_{31}M_{31}')+' = <b>'+fmt(def)+'</b> '+(def.eq(s)?'<span class="ok">✓ 一致</span>':'')+'</p>';
  }
  // 四阶陷阱
  var A4=D.toM([[1,2,0,1],[0,1,3,2],[2,0,1,1],[1,1,2,0]]);
  function pseudo(A){var n=4,s=F(0),i,k,p;for(k=0;k<n;k++){p=F(1);for(i=0;i<n;i++)p=p.mul(A[i][(i+k)%n]);s=s.add(p)}for(k=0;k<n;k++){p=F(1);for(i=0;i<n;i++)p=p.mul(A[i][(k-i+n*2)%n]);s=s.sub(p)}return s}
  $('.trap',body).innerHTML='<div class="row">'+D.matHTML(A4)+'</div><p class="small">仿照三阶，把 4 条“主对角线方向”的乘积取正、4 条“副对角线方向”的乘积取负，得到 <b>'+fmt(pseudo(A4))+'</b>；但真正的值是 <b>'+fmt(D.det(A4))+'</b>。四阶行列式有 4! = 24 项，对角线法只凑出 8 项，而且符号也不对。</p>';
};

/* ---------- §1.2 / §1.3 余子式与代数余子式 ---------- */
W.minor=function(el){
  var body=frame(el);
  var PR={e121:['例 1.2.1（3 阶）',[[1,-1,2],[2,0,3],[-1,-3,2]]],e131:['例 1.3.1（5 阶）',[[1,0,-1,3,1],[0,2,-5,4,1],[3,-2,-1,1,0],[0,0,2,1,3],[1,3,-1,5,1]]],
    x1:['习题 1.3 第 1(1) 题',[[1,-1,1,1],[-1,2,-1,0],[1,1,2,-1],[1,-1,0,-2]]],x2:['习题 1.3 第 1(2) 题',[[3,1,0,-1],[2,1,1,0],[-1,3,1,2],[0,6,5,1]]]};
  var keys=(el.dataset.presets||'e121,e131,x1,x2').split(','),M=D.toM(PR[keys[0]][1]),sel=[0,0],showExp=false;
  body.innerHTML='<div class="ctrl"><select class="pre">'+opt(keys.map(function(k){return [k,PR[k][0]]}),keys[0])+'</select><button class="btn sm rnd">随机 4 阶</button><label><input type="checkbox" class="sg"> 符号棋盘</label></div>'+
    '<div class="w-grid"><div><p class="tiny muted">点击任一元素</p><div class="scroll-x mat"></div></div><div class="info"></div></div><div class="btns"><button class="btn sm exp">按第一列展开（定义）</button></div><div class="expo"></div>';
  function render(){
    var si=sel[0],sj=sel[1],n=M.length,sg=$('.sg',body).checked;
    $('.mat',body).innerHTML=D.matHTML(M,{cls:'click',cell:function(i,j){return i===si&&j===sj?'sel':(i===si||j===sj?'strike':'')},extra:sg?function(i,j){return '<span class="sg '+((i+j)%2?'m':'p')+'">'+((i+j)%2?'−':'+')+'</span>'}:null});
    var mn=D.minorOf(M,si,sj),mv=D.det(mn),neg=(si+sj)%2===1,A=neg?mv.neg():mv,ij=''+(si+1)+(sj+1);
    $('.info',body).innerHTML='<p>'+K('a_{'+ij+'}='+M[si][sj].tex())+'。划去第 '+(si+1)+' 行、第 '+(sj+1)+' 列：</p><div class="row scroll-x">'+K('M_{'+ij+'}=')+D.matHTML(mn,{cls:'sm'})+K('='+mv.tex())+'</div><p>'+K('A_{'+ij+'}=(-1)^{'+(si+1)+'+'+(sj+1)+'}M_{'+ij+'}='+(neg?'-':'')+'M_{'+ij+'}='+A.tex())+'</p>';
    if(showExp) exp();
  }
  function exp(){
    var n=M.length,sum=F(0),rows='';
    for(var i=0;i<n;i++){var m=D.det(D.minorOf(M,i,0)),A=i%2?m.neg():m,t=M[i][0].mul(A);sum=sum.add(t);
      rows+='<tr class="'+(M[i][0].isZero()?'z':'')+'"><td>'+(i+1)+'</td><td class="mono">'+fmt(M[i][0])+'</td><td class="mono">'+fmt(m)+'</td><td>'+(i%2?'−':'+')+'</td><td class="mono">'+fmt(A)+'</td><td class="mono">'+fmt(t)+'</td></tr>'}
    $('.expo',body).innerHTML='<div class="tw"><table class="t"><tr><th>i</th><th>'+K('a_{i1}')+'</th><th>'+K('M_{i1}')+'</th><th>'+K('(-1)^{i+1}')+'</th><th>'+K('A_{i1}')+'</th><th>'+K('a_{i1}A_{i1}')+'</th></tr>'+rows+'<tr class="sum"><td colspan="5">|A| = 各项之和</td><td class="mono">'+fmt(sum)+'</td></tr></table></div><p class="tiny muted">灰色行 '+K('a_{i1}=0')+'，不必计算余子式。</p>';
  }
  body.addEventListener('click',function(e){var c=e.target.closest('.mat .c');if(c){sel=[+c.dataset.i,+c.dataset.j];render()}});
  $('.pre',body).addEventListener('change',function(){M=D.toM(PR[this.value][1]);sel=[0,0];render()});
  $('.rnd',body).addEventListener('click',function(){M=D.randM(4,-3,3);sel=[0,0];render()});
  $('.sg',body).addEventListener('change',render);
  $('.exp',body).addEventListener('click',function(){showExp=!showExp;this.textContent=showExp?'收起展开表':'按第一列展开（定义）';if(showExp)exp();else $('.expo',body).innerHTML=''});
  render();
};

/* ---------- §1.3 性质实验室 ---------- */
W.lab=function(el){
  var body=frame(el);
  var EX={2:[[3,2],[4,3]],3:[[1,-1,2],[2,0,3],[-1,-3,2]],4:[[1,0,2,1],[2,-1,1,0],[1,0,0,3],[-1,0,2,1]]};
  body.innerHTML='<div class="w-grid"><div><div class="ctrl"><label>阶数 <select class="n">'+opt(['2','3','4'],'3')+'</select></label><button class="btn sm ex">教材例子</button><button class="btn sm rnd">随机</button></div><div class="ed"></div><div class="row"><span class="muted">当前值</span><span class="big v"></span></div></div>'+
    '<div><div class="ctrl"><select class="op">'+opt([['swap','交换两行（列）'],['scale','某行（列）乘常数'],['add','倍加到另一行（列）'],['trans','转置']],'add')+'</select><select class="mode">'+opt([['row','行'],['col','列']],'row')+'</select></div><div class="ctrl form"></div><div class="btns"><button class="btn pri go">执行</button><button class="btn undo">撤销</button></div><div class="msg"></div><ul class="log" style="list-style:none;padding:0;margin:.4rem 0;max-height:13rem;overflow:auto"></ul></div></div>'+
    '<div class="row props" style="gap:.35rem">'+[1,2,3,4,5,6,7,8].map(function(p){return '<span class="chip" data-p="'+p+'">性质 '+p+'</span>'}).join('')+'</div>';
  var M=null,hist=[],changed=null,edEl=$('.ed',body),log=$('.log',body),msg=$('.msg',body);
  var ed=new D.MatEd(edEl,EX[3],function(m){M=m;$('.v',body).innerHTML=m?fmt(D.det(m)):'—';form();if(changed){var c=changed;changed=null;ed.mark(function(i,j){return c.idx.indexOf(c.mode==='row'?i:j)>=0})}});
  function form(){
    var n=M?M.length:+$('.n',body).value,op=$('.op',body).value,W2=$('.mode',body).value==='row'?'行':'列';
    function g(cls,d){var e=$('.'+cls,body);return e?Math.min(+e.value,n-1):d}
    var i=g('fi',0),j=g('fj',Math.min(1,n-1)),kv=$('.fk',body)?$('.fk',body).value:'2';
    var si='<select class="fi">'+idxOpts(n,i)+'</select>',sj='<select class="fj">'+idxOpts(n,j)+'</select>',kin='<input class="num fk" value="'+esc(kv)+'" aria-label="倍数">';
    var h=op==='swap'?'交换第 '+si+' '+W2+'与第 '+sj+' '+W2:op==='scale'?'第 '+si+' '+W2+'乘 '+kin:op==='add'?'第 '+si+' '+W2+'的 '+kin+' 倍加到第 '+sj+' '+W2:'行变列、列变行';
    $('.form',body).innerHTML=h;$('.mode',body).hidden=op==='trans';
  }
  $('.op',body).addEventListener('change',form);$('.mode',body).addEventListener('change',form);
  function flash(ps){$$('.props .chip',body).forEach(function(c){var on=ps.indexOf(+c.dataset.p)>=0;c.classList.toggle('pos',on)})}
  function lineProp(A){
    function pair(x,y){for(var c=0;c<x.length;c++)for(var d=c+1;d<x.length;d++) if(!x[c].mul(y[d]).sub(x[d].mul(y[c])).isZero()) return false;return true}
    return [A,D.transpose(A)].some(function(B){for(var i=0;i<B.length;i++)for(var j=i+1;j<B.length;j++) if(pair(B[i],B[j])) return true;return false});
  }
  function zeroLine(A){return [A,D.transpose(A)].some(function(B){return B.some(function(r){return r.every(function(x){return x.isZero()})})})}
  $('.go',body).addEventListener('click',function(){
    if(!M){msg.innerHTML='<span class="no">请先修正输入。</span>';return}
    var op=$('.op',body).value,mode=op==='trans'?'row':$('.mode',body).value,W2=mode==='row'?'行':'列';
    var i=$('.fi',body)?+$('.fi',body).value:0,j=$('.fj',body)?+$('.fj',body).value:0,k=$('.fk',body)?D.parseFr($('.fk',body).value):null;
    if((op==='swap'||op==='add')&&i===j){msg.innerHTML='<span class="no">请选择两个不同的'+W2+'。</span>';return}
    if((op==='scale'||op==='add')&&!k){msg.innerHTML='<span class="no">倍数不合法。</span>';return}
    var A=mode==='col'?D.transpose(M):D.cloneM(M),desc,prop,rel,before=D.det(M),ks=k?fmt(k):'';
    if(op==='swap'){var t=A[i];A[i]=A[j];A[j]=t;desc='交换第 '+(i+1)+'、'+(j+1)+' '+W2;prop=4;rel='变号'}
    else if(op==='scale'){A[i]=A[i].map(function(x){return x.mul(k)});desc='第 '+(i+1)+' '+W2+' × '+ks;prop=3;rel='乘 '+ks}
    else if(op==='add'){var src=A[i];A[j]=A[j].map(function(x,c){return x.add(k.mul(src[c]))});desc='第 '+(j+1)+' '+W2+' + ('+ks+')×第 '+(i+1)+' '+W2;prop=7;rel='不变'}
    else{A=D.transpose(A);desc='转置';prop=8;rel='不变'}
    var N=mode==='col'?D.transpose(A):A;
    hist.push(D.cloneM(M));changed=op==='trans'?null:{mode:mode,idx:op==='swap'?[i,j]:op==='scale'?[i]:[j]};
    ed.setFr(N);
    var ps=[prop],ex='';
    if(zeroLine(N)){ps.push(2);ex='；出现零行（列），性质 2'}else if(lineProp(N)){ps.push(5);ex='；出现成比例的两行（列），性质 5'}
    log.insertAdjacentHTML('afterbegin','<li class="small" style="padding:.35rem .5rem;border-bottom:1px solid var(--rule)"><b>'+desc+'</b>：'+fmt(before)+' → '+fmt(D.det(N))+'　<span class="muted">值'+rel+'（性质 '+prop+'）'+ex+'</span></li>');
    msg.innerHTML='';flash(ps);
  });
  $('.undo',body).addEventListener('click',function(){if(!hist.length){msg.innerHTML='没有可撤销的操作。';return}ed.setFr(hist.pop());flash([])});
  function load(m){hist=[];log.innerHTML='';flash([]);msg.innerHTML='';ed.setFr(m)}
  $('.n',body).addEventListener('change',function(){load(D.toM(EX[this.value]))});
  $('.ex',body).addEventListener('click',function(){load(D.toM(EX[$('.n',body).value]))});
  $('.rnd',body).addEventListener('click',function(){load(D.randM(+$('.n',body).value))});
};

/* ---------- §1.3 为什么倍加不变：D' = D + c·D1 ---------- */
W.addinv=function(el){
  var body=frame(el);
  body.innerHTML='<div class="ctrl">把第 <select class="j">'+idxOpts(3,0)+'</select> 行的 <input class="num c" value="2"> 倍加到第 <select class="i">'+idxOpts(3,2)+'</select> 行</div><div class="ed"></div><div class="out"></div>';
  var M=null;
  var ed=new D.MatEd($('.ed',body),[[1,2,0],[3,-1,2],[0,4,1]],function(m){M=m;run()});
  function run(){
    var out=$('.out',body);if(!M){out.innerHTML=D.BAD;return}
    var i=+$('.i',body).value,j=+$('.j',body).value,c=D.parseFr($('.c',body).value);
    if(i===j){out.innerHTML='<p class="no small">请选择两个不同的行。</p>';return}
    if(!c){out.innerHTML='<p class="no small">倍数不合法。</p>';return}
    var Dp=D.cloneM(M);Dp[i]=M[i].map(function(x,k){return x.add(c.mul(M[j][k]))});
    var D1=D.cloneM(M);D1[i]=M[j].slice();
    var cell=function(r){return function(a){return a===i?'mk':(a===j&&r?'ra':'')}};
    out.innerHTML='<div class="scroll-x"><div class="row" style="flex-wrap:nowrap;gap:.5rem;padding:.3rem 0">'+
      '<span>'+K("D'=")+'</span>'+D.matHTML(Dp,{cls:'sm',cell:cell(0)})+'<span>=</span>'+D.matHTML(M,{cls:'sm',cell:cell(0)})+'<span>+'+K(D.pt(c))+'·</span>'+D.matHTML(D1,{cls:'sm',cell:cell(1)})+'</div></div>'+
      '<p class="small">'+K("D'="+D.det(Dp).tex()+'\\qquad D='+D.det(M).tex()+'\\qquad D_1='+D.det(D1).tex())+'</p><p class="small muted">第 '+(i+1)+' 行是两组数之和 → 拆成两个行列式（性质 6）→ 提出 c（性质 3）→ '+K('D_1')+' 的第 '+(i+1)+'、'+(j+1)+' 行相同，等于 0（性质 5）。</p>';
  }
  ['.i','.j'].forEach(function(s){$(s,body).addEventListener('change',run)});$('.c',body).addEventListener('input',run);
};

/* ---------- §1.4 按任意行（列）展开 + 异乘变零 ---------- */
W.expand=function(el){
  var body=frame(el);
  var PR={e1:['习题 1.4 第 2(1) 题',[[2,3,5],[1,2,0],[0,3,8]]],e2:['习题 1.4 第 2(2) 题',[[3,2,-2],[2,-1,3],[9,6,-7]]],e3:['习题 1.4 第 1(2) 题',[[1,0,-5],[6,2,-1],[5,-11,6]]],e4:['例 1.5.2（4 阶）',[[1,0,2,1],[2,-1,1,0],[1,0,0,3],[-1,0,2,1]]]};
  body.innerHTML='<div class="ctrl"><select class="pre">'+opt(Object.keys(PR).map(function(k){return [k,PR[k][0]]}),'e1')+'</select></div><div class="w-grid"><div><div class="ed"></div><div class="ctrl">按第 <select class="idx"></select> <select class="mode">'+opt([['row','行'],['col','列']],'row')+'</select> 展开</div><div class="view"></div><p class="tiny muted">每一行、每一列展开的结果：</p><div class="all"></div></div>'+
    '<div><div class="tab"></div><h4>异乘变零</h4><div class="ctrl">第 <select class="r"></select> 行元素 × 第 <select class="s"></select> 行的代数余子式</div><div class="alien"></div></div></div>';
  var M=null,lastN=0;
  function fill(sel,n,v){sel.innerHTML=idxOpts(n,v)}
  function upd(){
    if(!M){$('.tab',body).innerHTML=D.BAD;return}
    var n=M.length;
    if(n!==lastN){fill($('.idx',body),n,0);fill($('.r',body),n,0);fill($('.s',body),n,1);lastN=n}
    var mode=$('.mode',body).value,r=+$('.idx',body).value,Dv=D.det(M);
    $('.view',body).innerHTML=D.matHTML(M,{cell:function(i,j){return (mode==='row'?i===r:j===r)?'ra':''}});
    var rows='',sum=F(0);
    for(var k=0;k<n;k++){var i=mode==='row'?r:k,j=mode==='row'?k:r,m=D.det(D.minorOf(M,i,j)),A=(i+j)%2?m.neg():m,t=M[i][j].mul(A);sum=sum.add(t);
      rows+='<tr class="'+(M[i][j].isZero()?'z':'')+'"><td>'+K('a_{'+(i+1)+(j+1)+'}')+' = '+fmt(M[i][j])+'</td><td class="mono">'+fmt(m)+'</td><td>'+((i+j)%2?'−':'+')+'</td><td class="mono">'+fmt(A)+'</td><td class="mono">'+fmt(t)+'</td></tr>'}
    $('.tab',body).innerHTML='<div class="tw"><table class="t"><tr><th>元素</th><th>M</th><th>号</th><th>A</th><th>乘积</th></tr>'+rows+'<tr class="sum"><td colspan="4">按第 '+(r+1)+' '+(mode==='row'?'行':'列')+'展开</td><td class="mono">'+fmt(sum)+'</td></tr></table></div>';
    var all='';['row','col'].forEach(function(md){for(var t=0;t<n;t++){var s=F(0),z=0;for(var k=0;k<n;k++){var i=md==='row'?t:k,j=md==='row'?k:t;if(M[i][j].isZero()){z++;continue}s=s.add(M[i][j].mul(D.cof(M,i,j)))}all+='<span class="chip" title="含 '+z+' 个零">第'+(t+1)+(md==='row'?'行':'列')+'：'+fmt(s)+(z?' <span class="muted">('+z+'零)</span>':'')+'</span>'}});
    $('.all',body).innerHTML=all+'<p class="small ok">都等于 |A| = '+fmt(Dv)+'</p>';
    var ra=+$('.r',body).value,sa=+$('.s',body).value;
    if(ra===sa){$('.alien',body).innerHTML='<p class="small muted">两行相同时就是普通的按行展开。</p>';return}
    var s=F(0),terms=[];for(var k=0;k<n;k++){var c=D.cof(M,sa,k);s=s.add(M[ra][k].mul(c));terms.push(fmt(M[ra][k])+'·'+(c.n<0?'('+fmt(c)+')':fmt(c)))}
    var C=D.cloneM(M);C[sa]=M[ra].slice();
    $('.alien',body).innerHTML='<p class="small">'+K('\\sum_k a_{'+(ra+1)+'k}A_{'+(sa+1)+'k}')+' = '+terms.join(' + ')+' = <b>'+fmt(s)+'</b></p><p class="small muted">把第 '+(sa+1)+' 行换成第 '+(ra+1)+' 行得到下面的行列式，它两行相同，值为 0；按第 '+(sa+1)+' 行展开它，正好就是上面的和。</p><div class="row">'+D.matHTML(C,{cls:'sm',cell:function(i){return i===ra||i===sa?'mk':''}})+'<span>= '+fmt(D.det(C))+'</span></div>';
  }
  var ed=new D.MatEd($('.ed',body),PR.e1[1],function(m){M=m;upd()});
  $('.pre',body).addEventListener('change',function(){lastN=0;ed.set(PR[this.value][1])});
  ['.idx','.mode','.r','.s'].forEach(function(s){$(s,body).addEventListener('change',upd)});
};

/* ---------- §1.4 转置 ---------- */
W.transpose=function(el){
  var body=frame(el);
  body.innerHTML='<div class="ed"></div><div class="out"></div>';
  new D.MatEd($('.ed',body),[[2,0,1],[-1,3,4],[5,2,-2]],function(M){
    var o=$('.out',body);if(!M){o.innerHTML=D.BAD;return}
    var Tm=D.transpose(M),n=M.length;
    var rowT='',colA='';for(var i=0;i<n;i++){rowT+=(i?' + ':'')+fmt(Tm[0][i])+'·'+fmt(D.cof(Tm,0,i));colA+=(i?' + ':'')+fmt(M[i][0])+'·'+fmt(D.cof(M,i,0))}
    o.innerHTML='<div class="row" style="margin-top:.5rem">'+K("|A'|=")+D.matHTML(Tm,{cell:function(i,j){return i===0?'ra':''}})+'<span class="big">= '+fmt(D.det(Tm))+'</span></div><p class="small">'+K("|A'|")+' 按第一行展开：'+rowT+'<br>'+K('|A|')+' 按第一列展开：'+colA+'<br><span class="muted">两串数完全相同：'+K("|A'|")+' 的第一行就是 '+K('|A|')+' 的第一列，对应的余子式也互为转置。这正是教材用归纳法证明性质 8 的思路。</span></p>';
  });
};

/* ---------- §1.4 Cramer 法则 ---------- */
W.cramer=function(el){
  var body=frame(el);
  var PR={2:{ex:{A:[[2,-1],[3,2]],b:[5,11],t:'例 1.1.1'},sing:{A:[[1,2],[2,4]],b:[2,-2],t:'|A| = 0'}},
    3:{ex:{A:[[1,-1,1],[1,2,0],[1,0,-1]],b:[2,1,4],t:'习题 1.2 第 5(1) 题'},ex2:{A:[[1,1,1],[2,-5,-3],[4,8,2]],b:[0,10,4],t:'习题 1.2 第 5(2) 题'},sing:{A:[[1,2,3],[2,4,6],[1,0,1]],b:[1,2,3],t:'|A| = 0'}},
    4:{ex:{A:[[1,2,0,3],[2,5,-1,4],[3,6,1,10],[-1,-2,0,-2]],b:[1,2,3,4],t:'习题 1.4 第 6 题'},sing:{A:[[1,1,0,2],[0,1,1,1],[1,2,1,3],[2,0,1,1]],b:[1,2,3,4],t:'|A| = 0'}}};
  var n0=el.dataset.n||'3';
  body.innerHTML='<div class="ctrl"><label>未知数个数 <select class="n">'+opt(['2','3','4'],n0)+'</select></label><span class="pre"></span></div><div class="row" style="align-items:flex-start;gap:1rem"><div><div class="tiny muted">系数 '+K('a_{ij}')+'</div><div class="ea"></div></div><div><div class="tiny muted">常数项 '+K('b_i')+'</div><div class="eb"></div></div><div class="sys" style="min-width:12rem;flex:1"></div></div><div class="out"></div>';
  var A=null,b=null,ready=false;
  function sysTex(){
    return '\\begin{cases}'+A.map(function(r,i){var s='';r.forEach(function(c,j){if(c.isZero())return;var neg=c.n<0,ab=neg?c.neg():c,co=ab.eq(1)?'':ab.tex();s+=(s?(neg?'-':'+'):(neg?'-':''))+co+'x_{'+(j+1)+'}'});return (s||'0')+'='+b[i][0].tex()}).join('\\\\')+'\\end{cases}';
  }
  function upd(){
    if(!ready) return;var out=$('.out',body);
    if(!A||!b){out.innerHTML=D.BAD;$('.sys',body).innerHTML='';return}
    var n=A.length,Dv=D.det(A);$('.sys',body).innerHTML=K(sysTex(),true);
    var h='<div class="row" style="margin-top:.6rem">'+K('|A|=')+D.matHTML(A,{cls:'sm'})+'<span class="big">= '+fmt(Dv)+'</span></div>';
    if(Dv.isZero()){out.innerHTML=h+'<div class="box warn"><span class="tag">|A| = 0</span><p>Cramer 法则不能用：方程组要么无解，要么有无穷多解（第三章讨论）。看看系数里是不是有一行是其他行的组合。</p></div>';return}
    var xs=[],cards='';
    for(var j=0;j<n;j++){var Aj=A.map(function(r,i){return r.map(function(x,c){return c===j?b[i][0]:x})}),Dj=D.det(Aj),x=Dj.div(Dv);xs.push(x);
      cards+='<div class="panel"><div class="row">'+K('|A_{'+(j+1)+'}|=')+D.matHTML(Aj,{cls:'sm',cell:function(i,c){return c===j?'rb':''}})+'<span>= '+fmt(Dj)+'</span></div><div>'+K('x_{'+(j+1)+'}=\\dfrac{'+Dj.tex()+'}{'+Dv.tex()+'}='+x.tex())+'</div></div>'}
    var chk=A.map(function(r,i){return r.reduce(function(s,c,j){return s.add(c.mul(xs[j]))},F(0)).eq(b[i][0])});
    out.innerHTML=h+'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(13.5rem,1fr));gap:.6rem;margin-top:.6rem">'+cards+'</div><p class="small">代入检验：'+chk.map(function(o,i){return '第 '+(i+1)+' 个方程 <span class="'+(o?'ok':'no')+'">'+(o?'✓':'✗')+'</span>'}).join('　')+'　<span class="muted">（青色列 = 常数项）</span></p>';
  }
  function load(p){ready=false;var ea=new D.MatEd($('.ea',body),p.A,function(m){A=m;upd()}),eb=new D.MatEd($('.eb',body),p.b.map(function(x){return [x]}),function(m){b=m;upd()});A=ea.get();b=eb.get();ready=true;upd()}
  function setN(){var ps=PR[$('.n',body).value];$('.pre',body).innerHTML=Object.keys(ps).map(function(k){return '<button class="btn sm" data-c="'+k+'">'+ps[k].t+'</button>'}).join(' ');load(ps.ex)}
  $('.pre',body).addEventListener('click',function(e){var bt=e.target.closest('[data-c]');if(bt) load(PR[$('.n',body).value][bt.dataset.c])});
  $('.n',body).addEventListener('change',setN);setN();
};
/* ---------- §1.3 性质 5 的证明：提出因子 → 交换相同两行 → x = −x ---------- */
W.prop5=function(el){
  var body=frame(el);
  var NAMES=['看结构','提出因子','交换相同两行','只有 0 满足 x = −x','接近成比例'];
  var n=3,I=0,J=2,k=F(2),M=null,Pp=null,step=0,swapped=false,reached=false,xv=2,eps=0.5;
  body.innerHTML='<div class="ctrl"><label>阶数 <select class="n">'+opt(['3','4'],'3')+'</select></label><span>第 <select class="j" aria-label="第 j 行"></select> 行 =</span><input class="num k" value="2" aria-label="比例系数 k"><span>× 第 <select class="i" aria-label="第 i 行"></select> 行</span><button class="btn sm rnd">换一组数</button></div>'+
    '<div class="p5-nav" role="tablist">'+NAMES.map(function(t,s){return '<button class="chip btnlike" data-s="'+s+'" role="tab">'+(s+1)+'. '+t+'</button>'}).join('')+'</div>'+
    '<div class="p5-stage"></div>'+
    '<div class="btns"><button class="btn sm prev">上一步</button><button class="btn sm pri next">下一步</button><span class="tiny muted p5-cnt"></span></div>';
  var stage=$('.p5-stage',body);
  function rowStr(r){return '('+r.map(function(x){return x.tex()}).join(',\\ ')+')'}
  function cell(r){return r===I?'ra':r===J?'mk':''}
  function mat(A,o){o=o||{};return D.matHTML(A,{cls:o.cls||'',cell:function(r){return cell(r)},show:o.show})}
  function Bm(){var B=D.cloneM(M);B[J]=M[I].slice();return B}
  function Cm(){var C=D.cloneM(M);C[J]=Pp.slice();return C}
  function sel(){
    $('.i',body).innerHTML=idxOpts(n,I);$('.j',body).innerHTML=idxOpts(n,J);
  }
  function rebuildJ(){M[J]=M[I].map(function(x){return x.mul(k)})}
  function gen(fixed){
    if(fixed&&n===3&&I===0&&J===2){M=D.toM([[1,2,-1],[3,0,4],[2,4,-2]]);Pp=D.toM([[0,1,0]])[0];rebuildJ();return}
    for(var t=0;t<80;t++){
      M=D.randM(n,-4,5);
      if(M[I].every(function(x){return x.isZero()})) continue;
      rebuildJ();
      Pp=D.randM(1,-2,3)[0];
      if(!D.det(Cm()).isZero()) return;
    }
    Pp=M[0].map(function(_,c){return F(c===J?1:0)});
  }
  function show(s){step=Math.max(0,Math.min(NAMES.length-1,s));if(step!==2)swapped=false;render()}
  function nav(){
    $$('.p5-nav .chip',body).forEach(function(c){var on=+c.dataset.s===step;c.classList.toggle('pos',on);c.setAttribute('aria-selected',on?'true':'false')});
    $('.prev',body).disabled=step===0;$('.next',body).disabled=step===NAMES.length-1;
    $('.p5-cnt',body).textContent='第 '+(step+1)+' / '+NAMES.length+' 步';
  }
  var legend=function(){return '<p class="tiny muted">蓝色：第 '+(I+1)+' 行；黄色：第 '+(J+1)+' 行</p>'};
  function render(){
    nav();
    var B=Bm(),kt=D.pt(k),h='';
    if(step===0){
      h='<div class="scroll-x"><div class="row p5-eq">'+K('|A|=')+mat(M)+'</div></div>'+legend()+
        '<p>第 '+(J+1)+' 行的每个元素都是第 '+(I+1)+' 行对应元素的 '+K(k.tex())+' 倍：</p><div class="scroll-x">'+K('R_{'+(J+1)+'}='+rowStr(M[J])+'='+kt+'\\cdot'+rowStr(M[I])+'='+kt+'\\,R_{'+(I+1)+'}',true)+'</div>'+
        '<p class="small"><b>想一想</b>：不展开计算，能否看出 '+K('|A|')+' 等于多少？证明只用到两条已证的性质：<span class="chip">性质 3 倍乘</span><span class="chip">性质 4 交换</span></p>';
    }else if(step===1){
      h='<div class="scroll-x"><div class="row p5-eq">'+K('|A|=')+mat(M)+'<span>=</span>'+K(kt+'\\,\\cdot')+mat(B)+'<span>'+K('='+kt+'\\,|B|')+'</span></div></div>'+legend()+
        '<p>由<b>性质 3</b>（某一行乘 c，行列式也乘 c），从第 '+(J+1)+' 行提出公因子 '+K(k.tex())+'。</p>'+
        '<p>得到的 '+K('|B|')+' 中，第 '+(I+1)+' 行与第 '+(J+1)+' 行<b>完全相同</b>。“成比例”化成了“两行相同”。</p>'+
        (k.isZero()?'<div class="ok-note">k = 0 时第 '+(J+1)+' 行全为 0，也可以直接用性质 2；上面的等式 |A| = 0·|B| 同样成立。</div>':'');
    }else if(step===2){
      h='<div class="scroll-x"><div class="row p5-eq">'+K('|B|=')+'<span class="p5-b">'+mat(B)+'</span><button class="btn sm pri swap">▶ 交换第 '+(I+1)+'、'+(J+1)+' 行</button><span class="p5-b2 row" style="flex-wrap:nowrap;gap:.5rem"></span></div></div>'+legend()+'<div class="p5-after"></div>';
    }else if(step===3){
      h='<p>设 '+K('x=|B|')+'。上一步得到 '+K('x=-x')+'。拖动滑块，看看哪个数满足它：</p>'+
        '<svg class="p5-nl" viewBox="0 0 420 96" role="img" aria-label="数轴上的 x 与 −x"></svg>'+
        '<div class="ctrl" style="justify-content:center"><label>x = <input type="range" class="xr" min="-4" max="4" step="0.5" value="'+xv+'" aria-label="x 的值"></label><b class="xv"></b></div><div class="p5-res"></div><div class="p5-con"></div>';
    }else{
      h='<p>把第 '+(J+1)+' 行改成 '+K('k\\,R_{'+(I+1)+'}+\\varepsilon\\,p')+'，其中 '+K('p='+rowStr(Pp))+'：两行“接近”成比例。</p>'+
        '<div class="ctrl"><label>'+K('\\varepsilon')+' = <input type="range" class="er" min="-1" max="1" step="0.05" value="'+eps+'" aria-label="扰动 ε"></label><b class="ev"></b></div>'+
        '<div class="p5-eps"></div>';
    }
    stage.innerHTML=h;
    if(step===2){if(swapped) after(false);}
    if(step===3) line();
    if(step===4) epsUpd();
  }
  function after(){
    var B=Bm();
    $('.p5-b2',body).innerHTML=K("|B'|=")+mat(B);$('.swap',body).textContent='↻ 再交换一次';
    $('.p5-after',body).innerHTML=
      '<ul class="p5-two"><li><span class="chip pos">逐个元素比较</span> '+K("B'")+' 与 '+K('B')+' 的 '+(n*n)+' 个元素完全相同，所以 '+K("|B'|=|B|")+'；</li>'+
      '<li><span class="chip neg">性质 4</span> 交换任意两行，值变号，所以 '+K("|B'|=-|B|")+'。</li></ul>'+
      '<p>两者同时成立：'+K('|B|=-|B|')+'。</p>'+
      '<div class="err-note">易错：“交换后行列式根本没变，怎么会变号？”——性质 4 对<b>任意</b>两行都成立，包括相同的两行。正是“没变”与“变号”同时成立，才逼出 |B| 只能是 0；这并不是说 |B| 变成了负数。</div>';
  }
  function doSwap(){
    var b=$('.p5-b',body);if(!b) return;
    var ci=$$('.c[data-i="'+I+'"]',b),cj=$$('.c[data-i="'+J+'"]',b);
    var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    function done(){swapped=true;after();body.dispatchEvent(new Event('change',{bubbles:true}))}
    if(reduce||!ci.length||!ci[0].animate){done();return}
    var dy=cj[0].offsetTop-ci[0].offsetTop,last=null;
    ci.forEach(function(c){c.style.zIndex=2;last=c.animate([{transform:'translateY(0)'},{transform:'translateY('+dy+'px)'}],{duration:750,easing:'ease-in-out'})});
    cj.forEach(function(c){c.animate([{transform:'translateY(0)'},{transform:'translateY('+(-dy)+'px)'}],{duration:750,easing:'ease-in-out'})});
    last.onfinish=done;
  }
  function line(){
    var svg=$('.p5-nl',body);if(!svg) return;
    function X(v){return 210+v*46}
    var s='<line x1="12" y1="62" x2="408" y2="62" style="stroke:var(--ink-2,currentColor);stroke-width:1.5"/>';
    for(var v=-4;v<=4;v++) s+='<line x1="'+X(v)+'" y1="56" x2="'+X(v)+'" y2="68" style="stroke:currentColor;opacity:.5"/><text x="'+X(v)+'" y="86" text-anchor="middle" style="font-size:12px;fill:currentColor;opacity:.75">'+(v<0?'−'+(-v):v)+'</text>';
    if(xv===0){
      s+='<circle cx="'+X(0)+'" cy="62" r="9" style="fill:var(--pos)"/><text x="'+X(0)+'" y="40" text-anchor="middle" style="font-size:14px;font-weight:700;fill:var(--pos)">x = −x = 0</text>';
    }else{
      var a=X(xv),b=X(-xv),top=62-Math.min(46,Math.abs(xv)*12+12);
      s+='<path d="M'+a+',56 Q210,'+top+' '+b+',56" style="fill:none;stroke:currentColor;stroke-dasharray:4 4;opacity:.55"/>'+
        '<circle cx="'+a+'" cy="62" r="8" style="fill:var(--accent)"/><circle cx="'+b+'" cy="62" r="8" style="fill:var(--neg)"/>'+
        '<text x="'+a+'" y="44" text-anchor="middle" style="font-size:14px;font-weight:700;fill:var(--accent)">x</text><text x="'+b+'" y="44" text-anchor="middle" style="font-size:14px;font-weight:700;fill:var(--neg)">−x</text>';
    }
    svg.innerHTML=s;
    var f=function(v){return D.fnum(v,1)};
    $('.xv',body).textContent=f(xv);
    if(xv===0) reached=true;
    $('.p5-res',body).innerHTML=xv===0?'<p class="ok" style="text-align:center">x 与 −x 重合：只有 x = 0 满足 x = −x（2x = 0 ⇒ x = 0）。</p>':'<p class="no" style="text-align:center">x = '+f(xv)+'，−x = '+f(-xv)+'：关于原点对称的两个点，不重合。</p>';
    var B=Bm(),A=D.det(M);
    $('.p5-con',body).innerHTML=reached?'<div class="scroll-x">'+K('|B|=0\\quad\\Longrightarrow\\quad |A|='+D.pt(k)+'\\cdot|B|='+D.pt(k)+'\\cdot0=0',true)+'</div><p class="small">验算（直接按定义计算）：'+K('|A|='+A.tex())+'，'+K('|B|='+D.det(B).tex())+'。<span class="ok">✓ 性质 5 得证</span></p>':'<p class="small muted" style="text-align:center">把滑块拖到 0，得出结论。</p>';
  }
  function epsUpd(){
    var e=new Fr(Math.round(eps*20),20),A=D.cloneM(M);
    A[J]=M[J].map(function(x,c){return x.add(e.mul(Pp[c]))});
    var dv=D.det(A),c=D.det(Cm()),r=Math.min(1,Math.abs(dv.val())/Math.max(1e-9,Math.abs(c.val())));
    $('.ev',body).textContent=D.fnum(eps,2);
    $('.p5-eps',body).innerHTML='<div class="scroll-x"><div class="row p5-eq">'+K('|A_\\varepsilon|=')+mat(A,{show:function(v){return D.fnum(v.val(),2)}})+'<span class="big">= '+D.fnum(dv.val(),3)+'</span></div></div>'+
      '<div class="p5-bar'+(dv.val()<0?' neg':'')+'" aria-hidden="true"><span style="width:'+(r*100).toFixed(1)+'%"></span></div>'+
      '<p class="small">由<b>性质 6</b> 把第 '+(J+1)+' 行拆开：'+K('|A_\\varepsilon|=\\underbrace{|A|}_{=0}+\\varepsilon\\,|C|=\\varepsilon\\cdot('+c.tex()+')')+'，其中 '+K('|C|')+' 是第 '+(J+1)+' 行换成 p 的行列式。所以 ε → 0 时行列式随 ε <b>线性</b>地趋于 0。</p>'+
      '<p class="small muted">统计视角：回归中两个自变量几乎成比例（多重共线性）时，'+K('|X^{\\top}X|')+' 接近 0，系数估计极不稳定。</p>';
  }
  function reload(fixed){sel();gen(fixed);reached=false;swapped=false;render()}
  $('.n',body).addEventListener('change',function(){n=+this.value;I=Math.min(I,n-1);J=Math.min(J,n-1);if(I===J)J=I===0?1:0;reload(false)});
  $('.i',body).addEventListener('change',function(){I=+this.value;if(I===J)J=(I+1)%n;reload(false)});
  $('.j',body).addEventListener('change',function(){J=+this.value;if(I===J)I=(J+1)%n;reload(false)});
  $('.k',body).addEventListener('input',function(){var v=D.parseFr(this.value);this.classList.toggle('bad',!v);if(!v) return;k=v;rebuildJ();reached=false;swapped=false;render()});
  body.addEventListener('input',function(e){
    if(e.target.classList.contains('xr')){xv=+e.target.value;line()}
    else if(e.target.classList.contains('er')){eps=+e.target.value;epsUpd()}
  });
  body.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b) return;
    if(b.dataset.s!==undefined) show(+b.dataset.s);
    else if(b.classList.contains('prev')) show(step-1);
    else if(b.classList.contains('next')){show(step+1);if(step===2) setTimeout(doSwap,250)}
    else if(b.classList.contains('swap')){if(swapped){swapped=false;render();setTimeout(doSwap,60)}else doSwap()}
    else if(b.classList.contains('rnd')) reload(false);
  });
  reload(true);
};
/* ---------- §1.3 性质 4 的证明：相邻交换逐项对比 + 任意交换拆成奇数次相邻交换 ---------- */
W.prop4=function(el){
  var body=frame(el);
  var n=3,mode=0,r=0,I=0,J=2,M=null,pick=0,seq=[],cur=0,timer=0;
  body.innerHTML=
    '<div class="ctrl"><label>阶数 <select class="n">'+opt(['2','3','4','5'],'3')+'</select></label><span class="p4-sel"></span><button class="btn sm rnd">换一组数</button></div><div class="p4-stage"></div>';
  var stage=$('.p4-stage',body);
  function swapRows(A,a,b){var B=D.cloneM(A),t=B[a];B[a]=B[b];B[b]=t;return B}
  function gen(fixed){
    if(fixed&&n===3){M=D.toM([[2,1,3],[0,-1,4],[1,2,5]]);return}
    for(var t=0;t<60;t++){M=D.randM(n,-3,5);if(!D.det(M).isZero()) return}
  }
  function colorOf(orig,a,b){return orig===a?'ra':orig===b?'mk':''}
  function matO(A,origin,a,b,cls){return D.matHTML(A,{cls:cls||'',cell:function(t){return colorOf(origin[t],a,b)}})}
  function sel(){
    var h;
    if(mode===0){h='交换第 <select class="r">'+opt(Array.apply(null,{length:n-1}).map(function(_,t){return [t,(t+1)+'、'+(t+2)]}),r)+'</select> 行';}
    else h='交换第 <select class="i">'+idxOpts(n,I)+'</select> 行与第 <select class="j">'+idxOpts(n,J)+'</select> 行';
    $('.p4-sel',body).innerHTML=h;
    $$('.p5-nav .chip',body).forEach(function(c){var on=+c.dataset.m===mode;c.classList.toggle('pos',on);c.setAttribute('aria-selected',on?'true':'false')});
  }
  /* ---------- ① 相邻 ---------- */
  function term(A,i){var m=n===1?F(1):D.det(D.minorOf(A,i,0));var v=A[i][0].mul(m);return {a:A[i][0],m:m,v:i%2?v.neg():v,neg:i%2===1}}
  function tTex(t){return (t.neg?'-':'+')+'\\,'+D.pt(t.a)+'\\cdot'+D.pt(t.m)+'='+t.v.tex()}
  function renderA(){
    var B=swapRows(M,r,r+1),oA=[],oB=[];for(var t=0;t<n;t++){oA.push(t);oB.push(t===r?r+1:t===r+1?r:t)}
    var tA=[],tB=[],h='';for(t=0;t<n;t++){tA.push(term(M,t));tB.push(term(B,t))}
    h='<div class="row p4-pair"><span class="p4-g">'+K('|A|=')+matO(M,oA,r,r+1)+'</span><span class="p4-arrow">交换第 '+(r+1)+'、'+(r+2)+' 行 →</span><span class="p4-g">'+K('|B|=')+matO(B,oB,r,r+1)+'</span></div>'+
      '<p class="tiny muted">颜色跟着行走：蓝色是原第 '+(r+1)+' 行，黄色是原第 '+(r+2)+' 行。两个行列式都按<b>第一列</b>展开，第 '+K('i')+' 项为 '+K('(-1)^{i+1}a_{i1}M_{i1}')+'。点表格的一行看细节。</p>'+
      '<div class="p4-cols"><div class="tw"><table class="t p4-t"><tr><th>i</th><th>|A| 的第 i 项</th><th>|B| 的第 i 项</th><th>关系</th></tr>';
    for(t=0;t<n;t++){
      var pa=t===r?r+1:t===r+1?r:t,why=t===r||t===r+1?'位置互换':'归纳假设';
      h+='<tr data-i="'+t+'" class="'+(t===pick?'on ':'')+(t===r?'p4-a':t===r+1?'p4-b':'')+'"><td>'+(t+1)+'</td><td>'+K(tTex(tA[t]))+'</td><td>'+K(tTex(tB[t]))+'</td><td class="small">= −（|A| 第 '+(pa+1)+' 项）<span class="chip'+(why==='位置互换'?' neg':'')+'">'+why+'</span></td></tr>';
    }
    var sA=D.det(M),sB=D.det(B);
    h+='<tr class="sum"><td>和</td><td>'+K('|A|='+sA.tex())+'</td><td>'+K('|B|='+sB.tex())+'</td><td class="small">'+(sB.eq(sA.neg())?'<span class="ok">✓ |B| = −|A|</span>':'')+'</td></tr></table></div><div class="p4-det"></div></div>';
    stage.innerHTML=h;detail(B,oA,oB,tA,tB);
  }
  function detail(B,oA,oB,tA,tB){
    var i=pick,p=i+1,box=$('.p4-det',body),h;
    if(n===2){
      h='<p class="small"><b>归纳起点 n = 2</b>：直接计算 '+K('\\begin{vmatrix}c&d\\\\a&b\\end{vmatrix}=cb-da=-(ad-bc)')+'。第 1 项与第 2 项正好互换位置并各自变号。</p>';
      box.innerHTML='<div class="p4-box">'+h+'</div>';return;
    }
    function rowsOf(o,skip){return o.filter(function(_,t){return t!==skip})}
    var mA=D.minorOf(M,i,0),mB=D.minorOf(B,i,0),q=i===r?r+1:i===r+1?r:i,mQ=D.minorOf(M,q,0);
    var cA=function(o){return function(t){return colorOf(o[t],r,r+1)}};
    if(i===r||i===r+1){
      var q1=q+1;
      h='<p class="small"><b>第 '+p+' 项（被交换的行）</b>：划去 |B| 的第 '+p+' 行（它是原第 '+q1+' 行）后，剩下的行与划去 |A| 的第 '+q1+' 行<b>完全一样</b>：</p>'+
        '<div class="scroll-x"><div class="row p5-eq">'+K('N_{'+p+'1}=')+D.matHTML(mB,{cls:'sm',cell:cA(rowsOf(oB,i))})+K('=')+K('M_{'+q1+'1}=')+D.matHTML(mQ,{cls:'sm',cell:cA(rowsOf(oA,q))})+K('='+tB[i].m.tex())+'</div></div>'+
        '<p class="small">元素也相同：'+K('b_{'+p+'1}=a_{'+q1+'1}='+B[i][0].tex())+'。唯一不同的是行号：符号由 '+K('(-1)^{'+(q1+1)+'}')+' 变成 '+K('(-1)^{'+(p+1)+'}')+'，相反。所以 |B| 的第 '+p+' 项 = −（|A| 的第 '+q1+' 项）。</p>';
    }else{
      h='<p class="small"><b>第 '+p+' 项（没被交换的行）</b>：元素与符号都不变，只有余子式不同——'+K('N_{'+p+'1}')+' 正是 '+K('M_{'+p+'1}')+' 交换相邻两行（颜色）得到的 '+(n-1)+' 阶行列式：</p>'+
        '<div class="scroll-x"><div class="row p5-eq">'+K('M_{'+p+'1}=')+D.matHTML(mA,{cls:'sm',cell:cA(rowsOf(oA,i))})+K('='+tA[i].m.tex())+'<span class="p4-arrow">→</span>'+K('N_{'+p+'1}=')+D.matHTML(mB,{cls:'sm',cell:cA(rowsOf(oB,i))})+K('='+tB[i].m.tex())+'</div></div>'+
        '<p class="small">由<b>归纳假设</b>（'+(n-1)+' 阶时结论已成立）'+K('N_{'+p+'1}=-M_{'+p+'1}')+'，所以这一项变号。'+(n-1===2?'这里 '+(n-1)+' 阶正是归纳起点，可以直接算出来验证。':'')+'</p>';
    }
    box.innerHTML='<div class="p4-box">'+h+'</div>';
  }
  /* ---------- ② 任意两行 ---------- */
  function buildSeq(){
    var A=D.cloneM(M),o=[];for(var t=0;t<n;t++)o.push(t);
    seq=[{A:A,o:o.slice(),txt:'原行列式'}];
    function sw(a){A=swapRows(A,a,a+1);var x=o[a];o[a]=o[a+1];o[a+1]=x;seq.push({A:A,o:o.slice(),txt:'交换第 '+(a+1)+'、'+(a+2)+' 行',a:a})}
    for(t=I;t<J;t++) sw(t);
    for(t=J-2;t>=I;t--) sw(t);
    cur=0;
  }
  function renderB(){
    clearInterval(timer);timer=0;buildSeq();
    var d=J-I;
    stage.innerHTML='<p class="small">把“交换第 '+(I+1)+'、'+(J+1)+' 行”拆成<b>相邻</b>交换：先让蓝色行（原第 '+(I+1)+' 行）一步步下沉到第 '+(J+1)+' 行（'+d+' 次），再让黄色行（原第 '+(J+1)+' 行）一步步上移到第 '+(I+1)+' 行（'+(d-1)+' 次）。每一次相邻交换，值变号一次。</p>'+
      '<div class="btns"><button class="btn sm b-prev">上一步</button><button class="btn sm pri b-next">下一次交换</button><button class="btn sm b-play">自动播放</button><button class="btn sm b-all">全部显示</button></div>'+
      '<div class="p4-strip"></div><div class="p4-res"></div>';
    drawB();
  }
  function drawB(){
    var D0=D.det(M),h='',d=J-I;
    for(var s=0;s<=cur;s++){
      var st=seq[s],v=D.det(st.A);
      h+='<div class="p4-card'+(s===cur?' on':'')+'"><div class="tiny muted">'+(s===0?'开始':'第 '+s+' 次')+'</div>'+matO(st.A,st.o,I,J,'sm')+'<div class="tiny">'+st.txt+'</div><div><span class="chip '+(s%2?'neg':'pos')+'">'+(s%2?'−|A|':'|A|')+' = '+fmt(v)+'</span></div></div>';
    }
    $('.p4-strip',body).innerHTML=h;
    var last=seq.length-1,res='';
    if(cur===last){
      res='<p>共 '+K(d+'+'+(d-1)+'=2('+(J+1)+'-'+(I+1)+')-1='+last)+' 次相邻交换，是<b>奇数</b>：'+K('|B|=(-1)^{'+last+'}|A|=-|A|')+'。验算：'+K('|A|='+D0.tex()+',\\ |B|='+D.det(seq[last].A).tex())+' <span class="ok">✓</span></p>'+
        (d>1?'<div class="err-note">易错：蓝色行下沉 '+d+' 次后交换还没完成——此时黄色行停在第 '+J+' 行，还要再上移 '+(d-1)+' 次。总次数是 2(j−i)−1，不是 j−i；当 j−i 为偶数时，只数 j−i 次会误以为“不变号”。</div>':'<div class="ok-note">两行本来就相邻：1 次相邻交换，直接由 ① 得变号。</div>');
    }else res='<p class="small muted">已做 '+cur+' / '+last+' 次相邻交换。</p>';
    $('.p4-res',body).innerHTML=res;
    $('.b-prev',body).disabled=cur===0;$('.b-next',body).disabled=cur===last;$('.b-all',body).disabled=cur===last;
    $('.b-play',body).textContent=timer?'暂停':'自动播放';
    body.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function render(){sel();clearInterval(timer);timer=0;if(mode===0)renderA();else renderB()}
  function reload(fixed){gen(fixed);if(r>n-2)r=n-2;I=Math.min(I,n-1);J=Math.min(J,n-1);if(I>=J){I=0;J=n-1}pick=r;render()}
  body.addEventListener('change',function(e){
    var t=e.target;if(!t.matches||!t.matches('select')) return;
    if(t.classList.contains('n')){n=+t.value;J=n-1;reload(false)}
    else if(t.classList.contains('r')){r=+t.value;pick=r;render()}
    else if(t.classList.contains('i')||t.classList.contains('j')){
      var a=+$('.i',body).value,b=+$('.j',body).value;
      if(a===b){if(t.classList.contains('i')) b=a===n-1?a-1:a+1;else a=b===0?1:b-1}
      I=Math.min(a,b);J=Math.max(a,b);render();
    }
  });
  body.addEventListener('click',function(e){
    var b=e.target.closest('button,tr[data-i]');if(!b) return;
    if(b.dataset.m!==undefined){mode=+b.dataset.m;render()}
    else if(b.matches('tr[data-i]')){pick=+b.dataset.i;renderA()}
    else if(b.classList.contains('rnd')) reload(false);
    else if(b.classList.contains('b-next')){if(cur<seq.length-1){cur++;drawB()}}
    else if(b.classList.contains('b-prev')){if(cur>0){cur--;drawB()}}
    else if(b.classList.contains('b-all')){clearInterval(timer);timer=0;cur=seq.length-1;drawB()}
    else if(b.classList.contains('b-play')){
      if(timer){clearInterval(timer);timer=0;drawB();return}
      if(cur===seq.length-1)cur=0;
      timer=setInterval(function(){if(!document.body.contains(body)||cur>=seq.length-1){clearInterval(timer);timer=0}else cur++;drawB()},900);drawB();
    }
  });
  reload(true);
};
/* ---------- §1.3 性质 4：任意两行的交换 = 2(j−i)−1 次相邻交换（行真的在动） ---------- */
W.swapany=function(el){
  var body=frame(el);
  var n=5,I=0,J=3,M=null,orders=[],moves=[],cur=0,timer=0,D0=null;
  body.innerHTML='<div class="ctrl"><label>阶数 <select class="n">'+opt(['3','4','5','6'],'5')+'</select></label><span class="sw-sel"></span><button class="btn sm rnd">换一组数</button></div>'+
    '<div class="w-grid sw-grid"><div><div class="sw-board"></div></div><div class="sw-side"><div class="sw-count"></div><ol class="sw-log"></ol></div></div>'+
    '<div class="btns"><button class="btn sm s-reset" aria-label="回到开头">⏮ 重来</button><button class="btn sm s-prev">上一步</button><button class="btn sm pri s-next">下一步：相邻交换一次</button><button class="btn sm s-play">自动播放</button><button class="btn sm s-end">直接看结果</button></div>'+
    '<div class="sw-res"></div>';
  var board=$('.sw-board',body),reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function gen(fixed){
    if(fixed&&n===5){M=D.toM([[1,2,0,-1,3],[2,-1,1,0,1],[0,3,1,2,-2],[1,0,-2,1,0],[-1,1,0,2,1]]);}
    else for(var t=0;t<60;t++){M=D.randM(n,-3,5);if(!D.det(M).isZero()) break}
    D0=D.det(M);
  }
  function sel(){$('.sw-sel',body).innerHTML='交换第 <select class="i">'+idxOpts(n,I)+'</select> 行与第 <select class="j">'+idxOpts(n,J)+'</select> 行'}
  function plan(){
    var o=[];for(var t=0;t<n;t++)o.push(t);
    orders=[o.slice()];moves=[null];
    function sw(a,ph){var x=o[a];o[a]=o[a+1];o[a+1]=x;orders.push(o.slice());moves.push({a:a,ph:ph})}
    for(t=I;t<J;t++) sw(t,1);
    for(t=J-2;t>=I;t--) sw(t,2);
    cur=0;
  }
  function build(){
    var h='<div class="sw-labs">';for(var p=0;p<n;p++) h+='<div class="sw-lab" style="top:'+(p*2.6)+'em"><span>第 '+(p+1)+' 行</span></div>';
    h+='</div><div class="sw-rows" style="height:'+(n*2.6)+'em;width:'+(n*2.5+.6)+'em">';
    for(var r=0;r<n;r++){
      var c=r===I?' sw-i':r===J?' sw-j':'';
      h+='<div class="sw-row'+c+'" data-r="'+r+'" style="grid-template-columns:repeat('+n+',2.5em)">'+M[r].map(function(x){return '<span>'+fmt(x)+'</span>'}).join('')+'<em>原 '+(r+1)+'</em></div>';
    }
    board.innerHTML=h+'</div>';board.style.height=(n*2.6+.4)+'em';
    $$('.sw-row',board).forEach(function(e){if(reduce)e.style.transition='none'});
  }
  function sgnTex(k){return k%2?'-|A|':'|A|'}
  function draw(){
    var o=orders[cur],mv=moves[cur],d=J-I,total=moves.length-1;
    $$('.sw-row',board).forEach(function(e){
      var r=+e.dataset.r,p=o.indexOf(r);e.style.top=(p*2.6)+'em';
      e.classList.toggle('sw-mv',!!mv&&(p===mv.a||p===mv.a+1));
    });
    var A=o.map(function(r){return M[r]}),v=D.det(A);
    var phase=cur===0?'准备：蓝色是原第 '+(I+1)+' 行，黄色是原第 '+(J+1)+' 行':
      (mv.ph===1?'第一阶段：蓝色行向下“冒泡”，已下沉 '+Math.min(cur,d)+' / '+d+' 格':'第二阶段：黄色行向上“冒泡”，已上移 '+(cur-d)+' / '+(d-1)+' 格');
    var trail='';for(var k=0;k<=total;k++) trail+='<span class="sw-dot'+(k<=cur?(k%2?' neg':' pos'):'')+'" title="'+k+' 次">'+(k%2?'−':'+')+'</span>';
    $('.sw-count',body).innerHTML='<div class="small muted">'+phase+'</div>'+
      '<div class="sw-big">相邻交换 <b>'+cur+'</b> 次</div>'+
      '<div>'+K('(-1)^{'+cur+'}|A|='+(cur%2?'-':'')+D.pt(D0)+'='+v.tex())+'</div>'+
      '<div class="sw-trail" aria-label="符号轨迹">'+trail+'</div>';
    var lg='';for(k=1;k<=cur;k++){var m=moves[k];lg+='<li class="'+(m.ph===1?'p1':'p2')+'">交换第 '+(m.a+1)+'、'+(m.a+2)+' 行 <span class="muted">→ 值变号</span></li>'}
    $('.sw-log',body).innerHTML=lg||'<li class="muted" style="list-style:none">每一步只交换<b>相邻</b>两行（已证：相邻交换变号）。</li>';
    var lgEl=$('.sw-log',body);lgEl.scrollTop=lgEl.scrollHeight;
    var res='';
    if(cur===total){
      res='<div class="ok-note"><b>结果与“直接交换第 '+(I+1)+'、'+(J+1)+' 行”完全一样</b>：灰色的中间各行先各上移一格、再各下移一格，回到了原位。</div>'+
        '<p>相邻交换共 '+K(d+'+'+(d-1)+'=2('+(J+1)+'-'+(I+1)+')-1='+total)+' 次，是<b>奇数</b>，每次变号一次，所以 '+K('|B|=(-1)^{'+total+'}|A|=-|A|')+'。验算：'+K('|A|='+D0.tex()+',\\ |B|='+v.tex())+' <span class="ok">✓</span></p>'+
        (d>1?'<div class="err-note">易错：只数第一阶段的 '+d+' 次是不够的——那时黄色行停在第 '+J+' 行，交换还没完成。'+(d%2===0?'这里 '+d+' 是偶数，只数 '+d+' 次会误得“不变号”。':'')+'</div>':'<div class="small muted">两行本来就相邻：一次相邻交换就完成了。</div>');
    }
    $('.sw-res',body).innerHTML=res;
    $('.s-prev',body).disabled=cur===0;$('.s-reset',body).disabled=cur===0;$('.s-next',body).disabled=cur===total;$('.s-end',body).disabled=cur===total;
    $('.s-play',body).textContent=timer?'暂停':'自动播放';
    body.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function stop(){clearInterval(timer);timer=0}
  function reload(fixed){stop();gen(fixed);sel();plan();build();draw()}
  body.addEventListener('change',function(e){
    var t=e.target;if(!t.matches||!t.matches('select')) return;
    if(t.classList.contains('n')){n=+t.value;I=0;J=Math.min(3,n-1);reload(false);return}
    var a=+$('.i',body).value,b=+$('.j',body).value;
    if(a===b){if(t.classList.contains('i')) b=a===n-1?a-1:a+1;else a=b===0?1:b-1}
    I=Math.min(a,b);J=Math.max(a,b);stop();sel();plan();build();draw();
  });
  body.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b) return;var total=moves.length-1;
    if(b.classList.contains('rnd')) reload(false);
    else if(b.classList.contains('s-next')){stop();if(cur<total){cur++;draw()}}
    else if(b.classList.contains('s-prev')){stop();if(cur>0){cur--;draw()}}
    else if(b.classList.contains('s-reset')){stop();cur=0;draw()}
    else if(b.classList.contains('s-end')){stop();cur=total;draw()}
    else if(b.classList.contains('s-play')){
      if(timer){stop();draw();return}
      if(cur===total)cur=0;
      timer=setInterval(function(){if(!document.body.contains(body)||cur>=moves.length-1){stop();draw()}else{cur++;draw()}},1100);draw();
    }
  });
  reload(true);
};

/* ---------- §1.2 三阶行列式 = 平行六面体的有向体积（可拖动旋转） ---------- */
W.vol3=function(el){
  var body=frame(el);
  var EX=[[2,1,0],[0,2,1],[0,0,3]];
  body.innerHTML='<div class="w-grid"><div><svg class="plot vol-svg" viewBox="0 0 400 360" role="img" aria-label="三个列向量张成的平行六面体"></svg><p class="tiny muted" style="text-align:center">拖动图形可旋转视角</p></div>'+
    '<div><p class="small">三列 '+K('u,v,w')+' 是三个空间向量（编辑数字试试）：</p><div class="ed"></div><div class="out"></div>'+
    '<div class="btns"><button class="btn sm" data-g="ex">示例</button><button class="btn sm" data-g="cube">单位立方体</button><button class="btn sm" data-g="scale">w ×2</button><button class="btn sm" data-g="shear">w + u（倍加）</button><button class="btn sm" data-g="swap">交换 u、v</button><button class="btn sm" data-g="flat">w = u + v</button></div><div class="msg"></div></div></div>';
  var svg=$('svg',body),out=$('.out',body),msg=$('.msg',body),th=-0.6,ph=0.42,cols=null,anim=0,ed;
  function colsOf(m){return [0,1,2].map(function(j){return [m[0][j].val(),m[1][j].val(),m[2][j].val()]})}
  function add(a,b){return [a[0]+b[0],a[1]+b[1],a[2]+b[2]]}
  function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}
  function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]}
  function nrm(a){return Math.sqrt(dot(a,a))}
  function draw(){
    if(!cols) return;
    var u=cols[0],v=cols[1],w=cols[2],O=[0,0,0];
    var V=[O,u,v,w,add(u,v),add(u,w),add(v,w),add(add(u,v),w)];
    var mx=3;V.forEach(function(p){mx=Math.max(mx,Math.abs(p[0]),Math.abs(p[1]),Math.abs(p[2]))});
    var S=128/mx,ct=Math.cos(th),st=Math.sin(th),cp=Math.cos(ph),sp=Math.sin(ph);
    function P(p){var x1=p[0]*ct-p[1]*st,y1=p[0]*st+p[1]*ct,z1=p[2];var y2=y1*cp+z1*sp,z2=-y1*sp+z1*cp;return [200+S*x1,205-S*z2,y2]}
    var Q=V.map(P),dt=dot(cross(u,v),w),cls=Math.abs(dt)<1e-9?'area-zero':(dt>0?'area-pos':'area-neg');
    var F=[[0,1,4,2],[3,5,7,6],[0,1,5,3],[2,4,7,6],[0,2,6,3],[1,4,7,5]];
    F.sort(function(a,b){function d(f){return f.reduce(function(s,i){return s+Q[i][2]},0)}return d(b)-d(a)});
    var h='';
    [[[mx*1.15,0,0],'x'],[[0,mx*1.15,0],'y'],[[0,0,mx*1.15],'z']].forEach(function(a){var p=P(a[0]),o=P(O);h+='<line class="axis" x1="'+o[0]+'" y1="'+o[1]+'" x2="'+p[0]+'" y2="'+p[1]+'"/><text x="'+(p[0]+4)+'" y="'+(p[1]-4)+'" style="font-size:12px;fill:currentColor;opacity:.6">'+a[1]+'</text>'});
    F.forEach(function(f){h+='<polygon class="'+cls+' vol-face" points="'+f.map(function(i){return Q[i][0].toFixed(1)+','+Q[i][1].toFixed(1)}).join(' ')+'"/>'});
    var n=cross(u,v),nn=dot(n,n);
    if(nn>1e-9&&Math.abs(dt)>1e-9){var k=dot(w,n)/nn,foot=[w[0]-k*n[0],w[1]-k*n[1],w[2]-k*n[2]],a=P(w),b=P(foot);
      h+='<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" style="stroke:currentColor;stroke-dasharray:4 3;opacity:.7"/><text x="'+((a[0]+b[0])/2+5)+'" y="'+((a[1]+b[1])/2)+'" style="font-size:12px;fill:currentColor">h</text>';}
    [[u,'u','var(--accent)'],[v,'v','var(--stat)'],[w,'w','var(--neg)']].forEach(function(e){var o=P(O),p=P(e[0]);
      h+='<line x1="'+o[0]+'" y1="'+o[1]+'" x2="'+p[0]+'" y2="'+p[1]+'" style="stroke:'+e[2]+';stroke-width:3;stroke-linecap:round"/><circle cx="'+p[0]+'" cy="'+p[1]+'" r="4" style="fill:'+e[2]+'"/><text x="'+(p[0]+6)+'" y="'+(p[1]-6)+'" style="font-size:14px;font-weight:700;fill:'+e[2]+'">'+e[1]+'</text>'});
    svg.innerHTML=h;
    var base=nrm(n),hgt=base>1e-9?Math.abs(dt)/base:0,f=function(x){return D.fnum(x,2)};
    out.innerHTML='<p class="small">'+K('\\det=u\\cdot(v\\times w)='+f(dt).replace('−','-'))+'</p><p class="small">底面（u、v 张成的平行四边形）面积 = <b>'+f(base)+'</b>，高 h = <b>'+f(hgt)+'</b>，体积 = 底 × 高 = <b>'+f(base*hgt)+'</b> = |det|。</p>'+
      '<p class="small">'+(Math.abs(dt)<1e-9?'<span class="no">三个向量共面，体积为 0</span>':dt>0?'<span class="ok">det > 0：u、v、w 构成右手系</span>':'<span class="no">det < 0：u、v、w 构成左手系（方向反了）</span>')+'</p>';
  }
  function setM(m){cols=colsOf(m);draw()}
  ed=new D.MatEd($('.ed',body),EX,function(m){if(m){cancelAnimationFrame(anim);setM(m)}});
  function animTo(tc,txt,note){
    cancelAnimationFrame(anim);var c0=cols.map(function(c){return c.slice()}),t0=performance.now(),before=dot(cross(c0[0],c0[1]),c0[2]);
    var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    function step(now){var k=reduce?1:Math.min(1,(now-t0)/700),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
      cols=c0.map(function(c,j){return c.map(function(x,i){return x+(tc[j][i]-x)*e})});draw();
      if(k<1) anim=requestAnimationFrame(step);else{ed.set([0,1,2].map(function(i){return [0,1,2].map(function(j){return tc[j][i]})}));
        msg.innerHTML='<b>'+txt+'</b>：det '+D.fnum(before)+' → '+D.fnum(dot(cross(tc[0],tc[1]),tc[2]))+(note?'<div class="small" style="margin-top:.3rem">'+note+'</div>':'')}}
    anim=requestAnimationFrame(step);
  }
  var ops={
    ex:function(){animTo([[2,0,0],[1,2,0],[0,1,3]],'示例','底面在 xy 平面上，面积 2 × 2 = 4；w 的竖直分量是高 3；体积 4 × 3 = 12，恰好等于上三角行列式的对角线乘积 2 × 2 × 3。')},
    cube:function(){animTo([[1,0,0],[0,1,0],[0,0,1]],'单位立方体','det I = 1：单位立方体体积为 1（性质 1）。')},
    scale:function(){var c=cols;animTo([c[0],c[1],c[2].map(function(x){return 2*x})],'第 3 列 ×2（性质 3）','一条棱伸长 2 倍，体积也变为 2 倍。')},
    shear:function(){var c=cols;animTo([c[0],c[1],add(c[2],c[0])],'第 3 列 + 第 1 列（性质 7）','w 沿着底面方向滑动，高不变、底不变——体积不变。这是“倍加不变”的几何含义。')},
    swap:function(){var c=cols;animTo([c[1],c[0],c[2]],'交换第 1、2 列（性质 4）','形状完全没变，体积不变；但右手系变成了左手系，所以符号相反。')},
    flat:function(){var c=cols;animTo([c[0],c[1],add(c[0],c[1])],'第 3 列 = 第 1 列 + 第 2 列','三个向量落在同一平面里，六面体被压扁，体积为 0。统计中“总分 = 语文 + 数学”就是这种情形（完全多重共线性）。')}
  };
  body.addEventListener('click',function(e){var b=e.target.closest('[data-g]');if(b) ops[b.dataset.g]()});
  var drag=null;
  svg.addEventListener('pointerdown',function(e){drag=[e.clientX,e.clientY,th,ph];try{svg.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault()});
  svg.addEventListener('pointermove',function(e){if(!drag) return;th=drag[2]-(e.clientX-drag[0])/120;ph=Math.max(-1.3,Math.min(1.3,drag[3]+(e.clientY-drag[1])/120));draw()});
  function end(){drag=null}svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
  setM(D.toM(EX));
};
/* ---------- §1.3 行操作 vs 列操作：按第一列展开后逐项对比 ---------- */
W.rowcol=function(el){
  var body=frame(el);
  var n=3,op='rswap',t=0,c=F(2),M=null;
  var OPS=[['rswap','交换相邻两行'],['rscale','某一行乘 c'],['cswap','交换相邻两列'],['cscale','某一列乘 c']];
  body.innerHTML='<div class="ctrl"><label>阶数 <select class="n">'+opt(['3','4'],'3')+'</select></label><label>操作 <select class="op">'+opt(OPS,op)+'</select></label><span class="rc-idx"></span><button class="btn sm rnd">换一组数</button></div>'+
    '<div class="btns rc-quick"><span class="tiny muted">快速对比：</span><button class="btn sm" data-q="r">交换第 1、2 行</button><button class="btn sm" data-q="c2">交换第 2、3 列</button><button class="btn sm err" data-q="c1">交换第 1、2 列</button></div>'+
    '<div class="rc-stage"></div>';
  var stage=$('.rc-stage',body);
  function isRow(){return op[0]==='r'}
  function isSwap(){return op.indexOf('swap')>0}
  function gen(fixed){
    if(fixed&&n===3){M=D.toM([[2,1,3],[1,-1,2],[3,2,1]]);return}
    for(var k=0;k<60;k++){M=D.randM(n,-3,5);if(!D.det(M).isZero())return}
  }
  function idx(){
    var L=isRow()?'行':'列',h;
    if(isSwap()) h='交换第 <select class="t">'+opt(Array.apply(null,{length:n-1}).map(function(_,k){return [k,(k+1)+'、'+(k+2)]}),t)+'</select> '+L;
    else h='第 <select class="t">'+idxOpts(n,t)+'</select> '+L+'乘 c = <input class="num c" value="'+esc(c.toString())+'" aria-label="倍数 c">';
    $('.rc-idx',body).innerHTML=h;
  }
  function apply(A){
    var B=D.cloneM(A),T=isRow()?B:D.transpose(B);
    if(isSwap()){var x=T[t];T[t]=T[t+1];T[t+1]=x}else T[t]=T[t].map(function(v){return v.mul(c)});
    return isRow()?T:D.transpose(T);
  }
  function lines(){return isSwap()?[t,t+1]:[t]}
  function bigCell(i,j){var L=lines(),on=isRow()?L.indexOf(i)>=0:L.indexOf(j)>=0;return (j===0?'rc-coef ':'')+(on?'mk':'')}
  function term(A,i){var m=D.det(D.minorOf(A,i,0)),v=A[i][0].mul(m);return {a:A[i][0],m:m,v:i%2?v.neg():v,mi:D.minorOf(A,i,0)}}
  function miniCell(i){ // 余子式里哪一行/列来自被操作的线
    var L=lines();
    return function(r,cc){
      if(isRow()){var orig=r<i?r:r+1;return L.indexOf(orig)>=0?'mk':''}
      var oc=cc+1;return L.indexOf(oc)>=0?'mk':'';
    };
  }
  function tex(tm,i){return (i%2?'-':'+')+D.pt(tm.a)+'\\cdot'+D.pt(tm.m)+'='+tm.v.tex()}
  function rel(i,TA,TB){
    var f=isSwap()?F(-1):c,fs=isSwap()?'-':c.tex()+'\\cdot',j=i,why='',bad=false,cls='';
    if(isRow()){
      if(isSwap()&&(i===t||i===t+1)){j=i===t?t+1:t;why='被操作的那一项：两个系数换位，余子式相同';cls='neg'}
      else if(!isSwap()&&i===t){why='被操作的那一项：系数乘 c，余子式不受影响';cls='neg'}
      else why='余子式里也做了同样的'+(isSwap()?'相邻行交换':'倍乘')+' → 归纳假设';
    }else{
      if(t===0&&isSwap()){bad=true}
      else if(t===0){why='第 1 列是系数列：每个系数都乘 c，余子式不变';cls='neg'}
      else why='系数不变；余子式里做了同样的'+(isSwap()?'相邻列交换':'倍乘')+' → 归纳假设';
    }
    if(bad) return '<span class="no">✗ 无对应</span><div class="tiny muted">系数从第 1 列的 '+K(TA[i].a.tex())+' 变成了原第 2 列的 '+K(TB[i].a.tex())+'，余子式也换成另一个</div>';
    var ok=TB[i].v.eq(TA[j].v.mul(f));
    return K('='+fs+'(\\text{第 '+(j+1)+' 项})')+(ok?' <span class="ok">✓</span>':' <span class="no">?</span>')+'<div class="tiny"><span class="chip'+(cls?' '+cls:'')+'">'+why+'</span></div>';
  }
  function render(){
    var B=apply(M),TA=[],TB=[],i;
    for(i=0;i<n;i++){TA.push(term(M,i));TB.push(term(B,i))}
    var L=isRow()?'行':'列',bad=!isRow()&&isSwap()&&t===0;
    var h='<div class="row rc-pair"><span class="p4-g">'+K('|A|=')+D.matHTML(M,{cell:bigCell})+'</span><span class="p4-arrow">'+$('.op',body).selectedOptions[0].textContent+' →</span><span class="p4-g">'+K('|B|=')+D.matHTML(B,{cell:bigCell})+'</span></div>'+
      '<p class="tiny muted">灰底的第 1 列是展开时的<b>系数列</b>；黄色是被操作的'+L+'。两个行列式都按定义<b>沿第一列展开</b>，第 i 项 = '+K('(-1)^{i+1}a_{i1}M_{i1}')+'。</p>'+
      '<div class="tw"><table class="t rc-t"><tr><th>i</th><th>|A| 的第 i 项（余子式）</th><th>|B| 的第 i 项（余子式）</th><th>对应关系</th></tr>';
    for(i=0;i<n;i++){
      h+='<tr'+(bad?' class="rc-bad"':'')+'><td>'+(i+1)+'</td><td><div class="rc-cell">'+D.matHTML(TA[i].mi,{cls:'xs',cell:miniCell(i)})+K(tex(TA[i],i))+'</div></td><td><div class="rc-cell">'+D.matHTML(TB[i].mi,{cls:'xs',cell:miniCell(i)})+K(tex(TB[i],i))+'</div></td><td class="small">'+rel(i,TA,TB)+'</td></tr>';
    }
    var dA=D.det(M),dB=D.det(B),f=isSwap()?F(-1):c;
    h+='<tr class="sum"><td>和</td><td>'+K('|A|='+dA.tex())+'</td><td>'+K('|B|='+dB.tex())+'</td><td class="small">'+(dB.eq(dA.mul(f))?'<span class="ok">'+(isSwap()?'|B| = −|A|':'|B| = c|A|')+'</span>':'')+'</td></tr></table></div>';
    if(bad) h+='<div class="err-note">逐项对比失败：交换第 1、2 列后，B 的系数列整个换成了原第 2 列，|B| 的第 i 项与 |A| 的任何一项都不是“同一个系数 × 同一个余子式”，“单独看被操作的一项、其余交给归纳”无从下手。总和仍然是 −|A|——结论是对的，只是要换一条路证明：先证 5′（两列相同为 0）和 6′（列可加），再推出 4′。</div>';
    else if(isRow()) h+='<div class="ok-note">行操作：被操作的行在第 '+lines().map(function(x){return x+1}).join('、')+' 项里作为<b>系数</b>出现，在其余各项里<b>原样待在余子式中</b>（黄色）。每一行的处境都一样，所以对任何一行都能这样逐项证明。</div>';
    else if(t===0) h+='<div class="ok-note">倍乘第 1 列仍可逐项处理：每一项的系数都乘 c，余子式不变。真正的困难出在<b>把第 1 列与别的列交换或比较</b>时——试试“交换第 1、2 列”。</div>';
    else h+='<div class="ok-note">只动第 2 列以后的列：系数列没变，被操作的列在每个余子式里都原样出现（黄色），可以交给归纳假设。</div>';
    stage.innerHTML=h;
    body.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function reset(){idx();render()}
  body.addEventListener('change',function(e){
    var x=e.target;if(!x.matches||!x.matches('select')) return;
    if(x.classList.contains('n')){n=+x.value;t=Math.min(t,n-2);gen(false);reset()}
    else if(x.classList.contains('op')){op=x.value;if(isSwap())t=Math.min(t,n-2);reset()}
    else if(x.classList.contains('t')){t=+x.value;render()}
  });
  body.addEventListener('input',function(e){if(e.target.classList.contains('c')){var v=D.parseFr(e.target.value);e.target.classList.toggle('bad',!v);if(v){c=v;render()}}});
  body.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b) return;
    if(b.classList.contains('rnd')){gen(false);render();return}
    var q=b.dataset.q;if(!q) return;
    op=q==='r'?'rswap':'cswap';t=q==='c2'?1:0;$('.op',body).value=op;reset();
  });
  gen(true);reset();
};
})();
