/* 互动组件（五）：第三章 线性空间 */
(function(){
'use strict';
var D=window.D,W=window.WIDGETS,F=D.F,K=D.K,$=D.$,esc=D.esc,frame=D.frame,opt=D.opt,X=D.mx,P=X.P,mm=X.mm,ri=D.randInt;

/* ---------- 公用工具 ---------- */
function fire(el){el.dispatchEvent(new Event('change',{bubbles:true}))}
function rref(M0){
  var M=M0.map(function(r){return r.slice()}),m=M.length,n=m?M[0].length:0,r=0,piv=[];
  for(var c=0;c<n&&r<m;c++){
    var p=-1;for(var i=r;i<m;i++)if(!M[i][c].isZero()){p=i;break}
    if(p<0)continue;
    var t=M[r];M[r]=M[p];M[p]=t;var pv=M[r][c];M[r]=M[r].map(function(x){return x.div(pv)});
    for(i=0;i<m;i++)if(i!==r&&!M[i][c].isZero()){var f=M[i][c],Rr=M[r];M[i]=M[i].map(function(x,j){return x.sub(f.mul(Rr[j]))})}
    piv.push(c);r++;
  }
  return {R:M,piv:piv,rank:r};
}
function nullspace(M){
  var n=M[0].length,o=rref(M),free=[];for(var j=0;j<n;j++)if(o.piv.indexOf(j)<0)free.push(j);
  return free.map(function(f){var v=[];for(var j=0;j<n;j++)v.push(F(0));v[f]=F(1);o.piv.forEach(function(c,i){v[c]=o.R[i][f].neg()});return v});
}
function T(M){return M[0].map(function(_,j){return M.map(function(r){return r[j]})})}
function rv(v){return '('+v.map(function(x){return x.tex()}).join(',\\ ')+')'}
function cv(v){return '\\begin{pmatrix}'+v.map(function(x){return x.tex()}).join('\\\\')+'\\end{pmatrix}'}
function cf(x){return x.val()<0?'('+x.tex()+')':x.tex()}
function comb(ks,names,skipZero){var s='',first=true;ks.forEach(function(k,i){if(skipZero&&k.isZero())return;var neg=k.val()<0,a=neg?k.neg():k;s+=(neg?'-':(first?'':'+'))+(a.eq(1)?'':a.tex())+names[i];first=false});return first?'0':s}
function fr(x){return D.parseFr(String(x))}
function toFr(rows){return rows.map(function(r){return r.map(fr)})}
function btns(PR,attr){return Object.keys(PR).map(function(k){return '<button class="btn sm" type="button" data-'+attr+'="'+k+'">'+PR[k][0]+'</button>'}).join('')}
D.la3={rref:rref,nullspace:nullspace,T:T,rv:rv,cv:cv,comb:comb};

/* 平面画布：带可拖动的控制点 */
function Plane(host,o){
  o=o||{};var R=o.R||5,Wd=o.size||300,S=Wd/(2*R),c=Wd/2,snap=o.snap||1;
  host.innerHTML='<svg class="plot pl2" viewBox="0 0 '+Wd+' '+Wd+'" role="img" aria-label="'+esc(o.label||'坐标平面')+'"></svg>';
  var svg=host.querySelector('svg');svg.style.touchAction='none';
  var self={R:R,S:S,W:Wd,svg:svg,onmove:null,drag:null};
  self.tx=function(x){return (c+x*S).toFixed(1)};self.ty=function(y){return (c-y*S).toFixed(1)};
  self.grid=function(){var g='';for(var k=-R;k<=R;k++){g+='<line class="grid" x1="'+self.tx(k)+'" y1="0" x2="'+self.tx(k)+'" y2="'+Wd+'"/><line class="grid" x1="0" y1="'+self.ty(k)+'" x2="'+Wd+'" y2="'+self.ty(k)+'"/>'}return g+'<line class="axis" x1="0" y1="'+c+'" x2="'+Wd+'" y2="'+c+'"/><line class="axis" x1="'+c+'" y1="0" x2="'+c+'" y2="'+Wd+'"/>'};
  self.arrow=function(x0,y0,x1,y1,cls){
    var X0=+self.tx(x0),Y0=+self.ty(y0),X1=+self.tx(x1),Y1=+self.ty(y1),dx=X1-X0,dy=Y1-Y0,L=Math.sqrt(dx*dx+dy*dy);
    if(L<1)return '';var ux=dx/L,uy=dy/L,h=Math.min(11,L*0.45),w=h*0.55,bx=X1-ux*h,by=Y1-uy*h;
    return '<line class="'+cls+'" x1="'+X0+'" y1="'+Y0+'" x2="'+bx.toFixed(1)+'" y2="'+by.toFixed(1)+'"/><polygon class="ah '+cls+'" points="'+X1.toFixed(1)+','+Y1.toFixed(1)+' '+(bx-uy*w).toFixed(1)+','+(by+ux*w).toFixed(1)+' '+(bx+uy*w).toFixed(1)+','+(by-ux*w).toFixed(1)+'"/>';
  };
  self.line=function(dx,dy,cls,px,py){px=px||0;py=py||0;if(Math.abs(dx)<1e-9&&Math.abs(dy)<1e-9)return '';var t=4*R/Math.sqrt(dx*dx+dy*dy);return '<line class="'+cls+'" x1="'+self.tx(px-dx*t)+'" y1="'+self.ty(py-dy*t)+'" x2="'+self.tx(px+dx*t)+'" y2="'+self.ty(py+dy*t)+'"/>'};
  self.handle=function(id,x,y,cls){return '<circle data-h="'+id+'" class="'+(cls||'hu')+'" cx="'+self.tx(x)+'" cy="'+self.ty(y)+'" r="9"/>'};
  self.label=function(x,y,t,cls){return '<text class="'+(cls||'')+'" x="'+(+self.tx(x)+8)+'" y="'+(+self.ty(y)-8)+'">'+t+'</text>'};
  function pt(e){var r=svg.getBoundingClientRect();return [((e.clientX-r.left)/r.width*Wd-c)/S,(c-(e.clientY-r.top)/r.height*Wd)/S]}
  function sn(v){v=Math.round(v/snap)*snap;return Math.max(-R+snap,Math.min(R-snap,v))}
  svg.addEventListener('pointerdown',function(e){var h=e.target.closest('[data-h]');if(!h)return;self.drag=h.dataset.h;try{svg.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault()});
  svg.addEventListener('pointermove',function(e){if(!self.drag)return;var p=pt(e);if(self.onmove)self.onmove(self.drag,sn(p[0]),sn(p[1]))});
  function end(){self.drag=null}svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
  return self;
}
D.Plane=Plane;

/* =============== §3.1 数域：四则运算封闭吗？ =============== */
function Q2(a,b,d){return {a:a,b:b,d:d}}
function qtex(x){var a=x.a,b=x.b,s=x.d===-1?'\\mathrm i':(x.d==='c'?'\\sqrt[3]{2}':'\\sqrt{'+x.d+'}');
  if(b.isZero())return a.tex();var bt=b.eq(1)?'':b.eq(-1)?'-':b.tex();
  if(a.isZero())return bt+s;return a.tex()+(b.val()<0?'':'+')+bt+s}
function qop(x,y,op){var d=x.d;
  if(op==='+')return Q2(x.a.add(y.a),x.b.add(y.b),d);
  if(op==='-')return Q2(x.a.sub(y.a),x.b.sub(y.b),d);
  if(op==='×')return Q2(x.a.mul(y.a).add(F(d).mul(x.b).mul(y.b)),x.a.mul(y.b).add(x.b.mul(y.a)),d);
  var N=y.a.mul(y.a).sub(F(d).mul(y.b).mul(y.b));if(N.isZero())return null;
  return Q2(x.a.mul(y.a).sub(F(d).mul(x.b).mul(y.b)).div(N),x.b.mul(y.a).sub(x.a.mul(y.b)).div(N),d);}
function isInt(f){return f.isZero()||Number.isInteger(f.val())}
W.fieldcheck=function(el){
  var body=frame(el);
  function rq(){return F(ri(-6,6)).div(F([1,1,2,3][ri(0,3)]))}
  var SETS={
    Z:{n:'整数集 ℤ',tex:'\\mathbb Z',gen:function(){return Q2(F(ri(-9,9)),F(0),2)},in:function(x){return x.b.isZero()&&isInt(x.a)},ce:[Q2(F(1),F(0),2),Q2(F(2),F(0),2)],why:'1 ÷ 2 = 1/2 ∉ ℤ：对除法不封闭（ℤ 是“数环”，不是数域）。'},
    N:{n:'自然数集 ℕ',tex:'\\mathbb N',gen:function(){return Q2(F(ri(0,9)),F(0),2)},in:function(x){return x.b.isZero()&&isInt(x.a)&&x.a.val()>=0},ce:[Q2(F(1),F(0),2),Q2(F(2),F(0),2)],why:'1 − 2 = −1 ∉ ℕ：连减法都不封闭。'},
    E:{n:'偶数集',tex:'2\\mathbb Z',gen:function(){return Q2(F(2*ri(-4,4)),F(0),2)},in:function(x){return x.b.isZero()&&isInt(x.a)&&x.a.val()%2===0},ce:[Q2(F(2),F(0),2),Q2(F(2),F(0),2)],why:'2 ÷ 2 = 1 不是偶数。更根本地，数域必须含 1，而 1 不是偶数（习题 3.1 第 1(1) 题）。'},
    Q:{n:'有理数集 ℚ',tex:'\\mathbb Q',gen:function(){return Q2(rq(),F(0),2)},in:function(x){return x.b.isZero()},ce:null,why:'有理数的和、差、积、商（除数非零）仍是有理数：ℚ 是数域，而且是最小的数域（定理 3.1.1）。'},
    Q2:{n:'ℚ(√2) = {a + b√2}',tex:'\\mathbb Q(\\sqrt2)',gen:function(){return Q2(rq(),rq(),2)},in:function(){return true},ce:null,why:'除法时分子分母同乘共轭 c − d√2，分母 c² − 2d² ≠ 0 是有理数（√2 是无理数），结果仍是 a + b√2 型：ℚ(√2) 是数域。'},
    Z2:{n:'ℤ[√2] = {a + b√2，a, b 为整数}',tex:'\\mathbb Z[\\sqrt2]',gen:function(){return Q2(F(ri(-5,5)),F(ri(-3,3)),2)},in:function(x){return isInt(x.a)&&isInt(x.b)},ce:[Q2(F(1),F(0),2),Q2(F(2),F(0),2)],why:'1 ÷ 2 = 1/2，系数不再是整数：只是数环，不是数域。'},
    Qi:{n:'ℚ(i) = {a + bi}',tex:'\\mathbb Q(\\mathrm i)',gen:function(){return Q2(rq(),rq(),-1)},in:function(){return true},ce:null,why:'除以 c + di 时乘以共轭 c − di，分母 c² + d² > 0：ℚ(i) 是数域（习题 3.1 第 1(3) 题）。'}
  };
  body.innerHTML='<div class="ctrl"><label>数集 <select class="st">'+opt(Object.keys(SETS).map(function(k){return [k,SETS[k].n]}),'Q2')+'</select></label><button class="btn sm pri again" type="button">再抽两个数</button><button class="btn sm ce" type="button">看反例</button></div><div class="fc-out"></div>';
  var cur='Q2',x,y;
  function draw(){
    var S=SETS[cur],h='<p class="small">取 '+K('x='+qtex(x))+'，'+K('y='+qtex(y))+'：</p><div class="tw"><table class="t small"><tr><th>运算</th><th>结果</th><th>仍在 '+K(S.tex)+' 中？</th></tr>';
    ['+','-','×','÷'].forEach(function(op){
      var r=op==='÷'&&y.a.isZero()&&y.b.isZero()?null:qop(x,y,op),ok=r&&S.in(r);
      h+='<tr><td>'+K('x'+(op==='×'?'\\times ':op==='÷'?'\\div ':op)+'y')+'</td><td>'+(r?K(qtex(r)):'除数为 0，不考虑')+'</td><td>'+(r?(ok?'<span class="ok">✓</span>':'<span class="no">✗</span>'):'—')+'</td></tr>';
    });
    h+='</table></div>';
    h+=(S.ce?'<div class="err-note"><b>不是数域。</b>'+S.why+'</div>':'<div class="ok-note"><b>是数域。</b>'+S.why+'</div>');
    $('.fc-out',body).innerHTML=h;$('.ce',body).hidden=!S.ce;fire(body);
  }
  function sample(){var S=SETS[cur];x=S.gen();do{y=S.gen()}while(y.a.isZero()&&y.b.isZero());draw()}
  body.addEventListener('change',function(e){if(e.target.classList&&e.target.classList.contains('st')){e.stopPropagation();cur=e.target.value;sample()}});
  body.addEventListener('click',function(e){if(e.target.closest('.again'))sample();else if(e.target.closest('.ce')){var S=SETS[cur];if(!S.ce)return;x=S.ce[0];y=S.ce[1];draw()}});
  sample();
};

/* =============== §3.2 向量加法与数乘的几何意义 =============== */
W.vec2d=function(el){
  var body=frame(el),a=[2,1],b=[1,3],k=1.5;
  body.innerHTML='<div class="w-grid"><div class="v2-pl"></div><div><div class="ctrl"><label>k = <input type="range" class="kr" min="-2" max="2.5" step="0.5" value="1.5"></label><b class="kv">1.5</b></div><label class="ctrl small"><input type="checkbox" class="sub"> 同时显示 α − β</label><div class="v2-out"></div></div></div><p class="tiny muted">拖动 α（蓝）、β（青）的端点；橙色是 α + β，虚线围成平行四边形；紫色是 kα。</p>';
  var pl=Plane($('.v2-pl',body),{R:5,size:300,snap:0.5,label:'向量的加法与数乘'});
  function draw(){
    var s=[a[0]+b[0],a[1]+b[1]],ka=[k*a[0],k*a[1]],sub=$('.sub',body).checked,d=[a[0]-b[0],a[1]-b[1]];
    var g=pl.grid();
    g+='<polygon class="pl-para" points="'+[[0,0],a,s,b].map(function(p){return pl.tx(p[0])+','+pl.ty(p[1])}).join(' ')+'"/>';
    g+=pl.arrow(0,0,ka[0],ka[1],'v-k');
    if(sub)g+=pl.arrow(b[0],b[1],a[0],a[1],'v-d');
    g+=pl.arrow(0,0,s[0],s[1],'v-w')+pl.arrow(0,0,a[0],a[1],'vu')+pl.arrow(0,0,b[0],b[1],'vv');
    g+=pl.label(a[0],a[1],'α','tu')+pl.label(b[0],b[1],'β','tv')+pl.label(s[0],s[1],'α+β','tw')+pl.label(ka[0],ka[1],'kα','tk2');
    g+=pl.handle('a',a[0],a[1],'hu')+pl.handle('b',b[0],b[1],'hv');
    pl.svg.innerHTML=g;
    var f=function(v){return '('+v.map(function(x){return D.fnum(x,2)}).join(',\\ ')+')'};
    var h='<p>'+K('\\alpha='+f(a))+'，'+K('\\beta='+f(b))+'</p><p>'+K('\\alpha+\\beta='+f(s))+'：分量分别相加，几何上是<b>平行四边形法则</b>。</p><p>'+K('k\\alpha='+f(ka))+'：'+(k>0?'沿原方向伸缩为 '+k+' 倍。':k<0?'反向，长度变为 '+(-k)+' 倍。':'得到零向量。')+'</p>';
    if(sub)h+='<p>'+K('\\alpha-\\beta='+f(d))+'：从 β 的终点指向 α 的终点。</p>';
    $('.v2-out',body).innerHTML=h;fire(body);
  }
  pl.onmove=function(id,x,y){if(id==='a')a=[x,y];else b=[x,y];draw()};
  body.addEventListener('input',function(e){if(e.target.classList.contains('kr')){k=+e.target.value;$('.kv',body).textContent=k;draw()}});
  body.addEventListener('change',function(e){if(e.target.classList&&e.target.classList.contains('sub')){e.stopPropagation();draw()}});
  draw();
};

/* =============== §3.3 这是线性空间吗？逐条检验八条公理 =============== */
W.axioms=function(el){
  var body=frame(el);
  var AX=['加法交换律','加法结合律','存在零向量','存在负向量','1 · α = α','k(α + β) = kα + kβ','(k + l)α = kα + lα','k(lα) = (kl)α'];
  var C={
    rp:{n:'正实数集 ℝ⁺：a ⊕ b = ab，k ∘ a = aᵏ',ok:true,zero:'零向量是数 1（a ⊕ 1 = a·1 = a）',neg:'a 的负向量是 1/a（a ⊕ 1/a = 1）',ax:['ab = ba','(ab)c = a(bc)','a ⊕ 1 = a，零向量是 1','a ⊕ (1/a) = 1，负向量是 1/a','1 ∘ a = a¹ = a','k ∘ (a ⊕ b) = (ab)ᵏ = aᵏbᵏ = (k∘a) ⊕ (k∘b)','(k+l) ∘ a = aᵏ⁺ˡ = aᵏ·aˡ','k ∘ (l ∘ a) = (aˡ)ᵏ = aᵏˡ'],calc:true,src:'习题 3.3 第 1(7) 题'},
    ut:{n:'n 阶实上三角阵全体，通常的加法与数乘',ok:true,zero:'零矩阵 O（它也是上三角阵）',neg:'−A（仍是上三角阵）',ax:['矩阵加法交换','矩阵加法结合','O 是上三角阵','−A 是上三角阵','1·A = A','矩阵数乘分配律','矩阵数乘分配律','矩阵数乘结合律'],note:'关键只在<b>封闭性</b>：两个上三角阵之和、数乘仍是上三角阵；八条规则直接从矩阵运算继承。',src:'习题 3.3 第 1(2) 题'},
    sq:{n:'以 0 为极限的数列 {aₙ}，逐项相加、逐项数乘',ok:true,zero:'零数列 (0, 0, 0, …)',neg:'{−aₙ}',ax:['逐项相加可交换','逐项相加可结合','零数列','{−aₙ} 也趋于 0','1·{aₙ} = {aₙ}','逐项成立','逐项成立','逐项成立'],note:'封闭性来自极限运算：lim(aₙ + bₙ) = 0 + 0 = 0，lim(kaₙ) = 0。',src:'习题 3.3 第 1(6) 题'},
    p8:{n:'实数对：(a₁,b₁) ⊕ (a₂,b₂) = (a₁+a₂, b₁+b₂+a₁a₂)，k∘(a,b) = (ka, kb + k(k−1)a²/2)',ok:true,zero:'(0, 0)',neg:'(a, b) 的负向量是 (−a, a² − b)',ax:['a₁a₂ = a₂a₁，可交换','两种结合方式第二个分量都是 b₁+b₂+b₃+a₁a₂+a₁a₃+a₂a₃','(a,b) ⊕ (0,0) = (a,b)','(a,b) ⊕ (−a, a²−b) = (0, b + a² − b − a²) = (0,0)','1∘(a,b) = (a, b + 0) = (a,b)','展开后两边都等于 (k(a₁+a₂), …)，可直接验证','第二个分量：(k+l)b + (k+l)(k+l−1)a²/2 = [kb + k(k−1)a²/2] + [lb + l(l−1)a²/2] + kl·a²','直接验证'],note:'这个“奇怪”的加法也满足八条公理。可以这样理解：令 (a, b) ↦ (a, b − a²/2)，它把这里的运算变成通常的向量运算。',src:'习题 3.3 第 1(8) 题'},
    cr:{n:'复数集 ℂ，看成实数域 ℝ 上的空间',ok:true,zero:'数 0',neg:'−z',ax:['复数加法交换','复数加法结合','0','−z','1·z = z','实数乘复数的分配律','分配律','结合律'],note:'同一个集合 ℂ 也可以看成 ℂ 上的线性空间。在哪个数域上讨论，决定了数乘里的 k 能取什么（例 3.3.5）。',src:'例 3.3.5'},
    deg:{n:'次数<b>恰好</b>等于 n 的实系数多项式',ok:false,fails:[['加法不封闭','xⁿ + (−xⁿ + 1) = 1，次数是 0，跑出了集合。'],['没有零向量','零多项式的次数不是 n（不属于这个集合）。']],src:'习题 3.3 第 1(1) 题'},
    lie:{n:'n 阶实矩阵，A ⊕ B = AB − BA，数乘不变',ok:false,fails:[['加法交换律','B ⊕ A = BA − AB = −(A ⊕ B)，一般 ≠ A ⊕ B。'],['存在零向量','取 A = I：I ⊕ Z = Z − Z = O ≠ I，所以找不到 Z 使所有 A ⊕ Z = A。'],['k(α + β) = kα + kβ','(kA) ⊕ (kB) = k²(AB − BA)，而 k(A ⊕ B) = k(AB − BA)。']],src:'习题 3.3 第 1(4) 题'},
    jor:{n:'n 阶实矩阵，A ⊕ B = AB + BA，数乘不变',ok:false,fails:[['存在负向量','零向量只能是 ½I（A·½I + ½I·A = A）。但取 A = O：O ⊕ B = O ≠ ½I，所以 O 没有负向量。'],['k(α + β) = kα + kβ','(kA) ⊕ (kB) = k²(AB + BA)，而 k(A ⊕ B) = k(AB + BA)，k ≠ 0, 1 时不等。']],src:'习题 3.3 第 1(5) 题'},
    p9:{n:'实数对：(a₁,b₁) ⊕ (a₂,b₂) = (a₁+a₂, b₁−b₂)，通常的数乘',ok:false,fails:[['加法交换律','(a₂,b₂) ⊕ (a₁,b₁) = (a₁+a₂, b₂−b₁)，第二个分量变号，一般不相等。'],['加法结合律','第二个分量：(b₁ − b₂) − b₃ ≠ b₁ − (b₂ − b₃)。']],src:'习题 3.3 第 1(9) 题'},
    p10:{n:'实数对：(a₁,b₁) ⊕ (a₂,b₂) = (a₁+a₂, 0)，k∘(a,b) = (ka, 0)',ok:false,fails:[['零向量','(a,b) ⊕ Z 的第二个分量总是 0，b ≠ 0 时不可能等于 (a,b)。'],['1 · α = α','1∘(a,b) = (a,0) ≠ (a,b)（b ≠ 0）。']],src:'习题 3.3 第 1(10) 题'}
  };
  body.innerHTML='<div class="ctrl"><label>候选 <select class="cs">'+opt(Object.keys(C).map(function(k){return [k,C[k].n.replace(/<[^>]+>/g,'')]}),'rp')+'</select></label></div><div class="ax-out"></div>';
  var cur='rp';
  function draw(){
    var c=C[cur],h='<p class="small muted">'+c.src+'</p><p><b>'+c.n+'</b></p>';
    if(c.ok){
      h+='<div class="ok-note">是线性空间。'+c.zero+'；'+c.neg+'。</div><ol class="ax-list">'+AX.map(function(a,i){return '<li><span class="ok">✓</span> <b>'+a+'</b>：'+c.ax[i]+'</li>'}).join('')+'</ol>';
      if(c.note)h+='<p class="small">'+c.note+'</p>';
      if(c.calc)h+='<div class="ax-calc ctrl"><label>a = <input class="num ia" value="2"></label><label>b = <input class="num ib" value="3"></label><label>k = <input class="num ik" value="2"></label></div><div class="ax-res small"></div>';
    }else{
      h+='<div class="err-note">不是线性空间。只要有一条不满足就不行：</div><ul class="ax-list">'+c.fails.map(function(f){return '<li><span class="no">✗</span> <b>'+f[0]+'</b>：'+f[1]+'</li>'}).join('')+'</ul>';
    }
    $('.ax-out',body).innerHTML=h;calc();fire(body);
  }
  function calc(){
    var r=$('.ax-res',body);if(!r)return;var a=parseFloat($('.ia',body).value),b=parseFloat($('.ib',body).value),k=parseFloat($('.ik',body).value);
    if(!(a>0&&b>0)||isNaN(k)){r.innerHTML='<span class="muted">a、b 要取正数</span>';return}
    var n=function(x){return D.fnum(x,4)};
    r.innerHTML='a ⊕ b = '+n(a*b)+'，k ∘ a = '+n(Math.pow(a,k))+'。验证第 (6) 条：k ∘ (a ⊕ b) = ('+n(a*b)+')^'+n(k)+' = '+n(Math.pow(a*b,k))+'，(k∘a) ⊕ (k∘b) = '+n(Math.pow(a,k))+' × '+n(Math.pow(b,k))+' = '+n(Math.pow(a,k)*Math.pow(b,k))+' <span class="ok">✓</span>';
  }
  body.addEventListener('change',function(e){if(e.target.classList&&e.target.classList.contains('cs')){e.stopPropagation();cur=e.target.value;draw()}});
  body.addEventListener('input',function(e){if(e.target.closest('.ax-calc'))calc()});
  draw();
};

/* 整数化系数 */
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=a%b;a=b;b=t}return a}
function intVec(v){var L=1;v.forEach(function(x){L=L/gcd(L,x.d)*x.d});var w=v.map(function(x){return x.n*(L/x.d)}),g=0;w.forEach(function(x){g=gcd(g,x)});g=g||1;
  var lead=w.filter(function(x){return x!==0})[0]||1;if(lead<0)g=-g;return w.map(function(x){return F(x/g)})}

/* =============== §3.4 平面上的线性表示与线性相关 =============== */
W.lincomb2d=function(el){
  var body=frame(el),mode=el.dataset.mode||'rep',v={a1:[2,1],a2:[1,2],b:[4,5],a3:[-2,1]};
  body.innerHTML='<div class="ctrl"><label>看什么 <select class="md">'+opt([['rep','β 能否由 α₁, α₂ 线性表示？'],['dep','平面上任意 3 个向量都线性相关']],mode)+'</select></label><button class="btn sm col" type="button">让 α₁, α₂ 共线</button></div><div class="w-grid"><div class="lc-pl"></div><div class="lc-out"></div></div><p class="tiny muted">拖动各向量的端点（取整数坐标）。</p>';
  var pl=Plane($('.lc-pl',body),{R:6,size:300,snap:1,label:'线性表示'});
  function V(p){return [F(p[0]),F(p[1])]}
  function draw(){
    var a1=v.a1,a2=v.a2,g=pl.grid(),h='',A1=V(a1),A2=V(a2),det=A1[0].mul(A2[1]).sub(A2[0].mul(A1[1]));
    $('.col',body).hidden=mode!=='rep';
    if(mode==='rep'){
      var b=v.b,B=V(b);
      if(!det.isZero()){
        var k1=B[0].mul(A2[1]).sub(A2[0].mul(B[1])).div(det),k2=A1[0].mul(B[1]).sub(B[0].mul(A1[1])).div(det),p1=[k1.val()*a1[0],k1.val()*a1[1]];
        g+='<polyline class="dash" points="0,0 0,0" />'+'<line class="dash" x1="'+pl.tx(p1[0])+'" y1="'+pl.ty(p1[1])+'" x2="'+pl.tx(b[0])+'" y2="'+pl.ty(b[1])+'"/>';
        g+=pl.arrow(0,0,p1[0],p1[1],'v-k');
        h='<p>'+K('\\beta='+comb([k1,k2],['\\alpha_1','\\alpha_2']))+'</p><div class="ok-note">α₁, α₂ 不共线（线性无关），所以平面上<b>每个</b> β 都能表示，而且<b>表示唯一</b>（定理 3.4.3）。系数就是方程组 '+K('k_1\\alpha_1+k_2\\alpha_2=\\beta')+' 的唯一解。</div><p class="small muted">紫色是 '+K('k_1\\alpha_1')+'，虚线是再加上 '+K('k_2\\alpha_2')+' 的一段。</p>';
      }else{
        var zero=a1[0]===0&&a1[1]===0&&a2[0]===0&&a2[1]===0,dir=(a1[0]||a1[1])?a1:a2;
        if(!zero)g+=pl.line(dir[0],dir[1],'span-l');
        var on=zero?(b[0]===0&&b[1]===0):(dir[0]*b[1]-dir[1]*b[0]===0);
        if(on){h='<div class="ok-note">α₁, α₂ 共线（线性相关），β 恰好在它们所在的直线上：能表示，但<b>表示不唯一</b>——有无穷多种写法（定理 3.4.3）。</div>';
          var rel=nullspace([[A1[0],A2[0]],[A1[1],A2[1]]]);if(rel.length)h+='<p class="small">因为 '+K(comb(intVec(rel[0]),['\\alpha_1','\\alpha_2'])+'=0')+'，在任何一种表示上加上它的倍数，又得到一种新的表示。</p>';}
        else h='<div class="err-note">α₁, α₂ 共线，它们的线性组合只能落在一条直线上（图中的粗线）。β 不在这条直线上，所以<b>不能</b>由 α₁, α₂ 线性表示——对应的方程组无解。</div>';
      }
      g+=pl.arrow(0,0,a1[0],a1[1],'vu')+pl.arrow(0,0,a2[0],a2[1],'vv')+pl.arrow(0,0,b[0],b[1],'v-w');
      g+=pl.label(a1[0],a1[1],'α₁','tu')+pl.label(a2[0],a2[1],'α₂','tv')+pl.label(b[0],b[1],'β','tw');
      g+=pl.handle('a1',a1[0],a1[1],'hu')+pl.handle('a2',a2[0],a2[1],'hv')+pl.handle('b',b[0],b[1],'hw');
    }else{
      var a3=v.a3,M=[[F(a1[0]),F(a2[0]),F(a3[0])],[F(a1[1]),F(a2[1]),F(a3[1])]],ns=nullspace(M),k=intVec(ns[0]);
      var pts=[[0,0]],cur=[0,0];[a1,a2,a3].forEach(function(p,i){cur=[cur[0]+k[i].val()*p[0],cur[1]+k[i].val()*p[1]];pts.push(cur)});
      g+='<polyline class="chain" points="'+pts.map(function(p){return pl.tx(p[0])+','+pl.ty(p[1])}).join(' ')+'"/>';
      g+=pl.arrow(0,0,a1[0],a1[1],'vu')+pl.arrow(0,0,a2[0],a2[1],'vv')+pl.arrow(0,0,a3[0],a3[1],'v-w');
      g+=pl.label(a1[0],a1[1],'α₁','tu')+pl.label(a2[0],a2[1],'α₂','tv')+pl.label(a3[0],a3[1],'α₃','tw');
      g+=pl.handle('a1',a1[0],a1[1],'hu')+pl.handle('a2',a2[0],a2[1],'hv')+pl.handle('a3',a3[0],a3[1],'hw');
      var j=2;while(j>=0&&k[j].isZero())j--;
      var others=[0,1,2].filter(function(i){return i!==j}),names=['\\alpha_1','\\alpha_2','\\alpha_3'];
      h='<p>'+K(comb(k,names,true)+'=0')+'</p><div class="ok-note">系数不全为零，所以 α₁, α₂, α₃ <b>线性相关</b>。无论怎样拖动，平面上的 3 个向量总是相关的（推论 3.5.1：2 维空间中超过 2 个的向量组必相关）。</div>';
      h+='<p class="small">由定理 3.4.2，系数非零的那个向量可以由其余向量表示：'+K(names[j]+'='+comb(others.map(function(i){return k[i].div(k[j]).neg()}),others.map(function(i){return names[i]})))+'</p><p class="small muted">折线依次画出 '+K('k_1\\alpha_1,\\ +k_2\\alpha_2,\\ +k_3\\alpha_3')+'，最后回到原点。</p>';
    }
    pl.svg.innerHTML=g;$('.lc-out',body).innerHTML=h;fire(body);
  }
  pl.onmove=function(id,x,y){v[id]=[x,y];draw()};
  body.addEventListener('change',function(e){if(e.target.classList&&e.target.classList.contains('md')){e.stopPropagation();mode=e.target.value;draw()}});
  body.addEventListener('click',function(e){if(e.target.closest('.col')){v.a2=[2*v.a1[0],2*v.a1[1]];if(Math.abs(v.a2[0])>5||Math.abs(v.a2[1])>5)v.a2=[-v.a1[0],-v.a1[1]];draw()}});
  draw();
};

/* =============== §3.4 判断 Kⁿ 中向量组的线性相关性 =============== */
W.lindep=function(el){
  var body=frame(el),A=null,ed;
  var PR={a:['例 3.4.3',[[1,2,3],[2,-1,-4],[1,1,1]]],b:['例 3.6.6',[[-1,3,1],[2,1,0],[1,4,1]]],c:['例 3.6.7',[[1,2,-1],[0,2,2],[2,1,3]]],d:['4 个 3 维向量',[[1,0,1],[0,1,1],[1,1,0],[2,3,1]]],e:['含零向量',[[1,2,0],[0,0,0],[3,1,1]]]};
  body.innerHTML='<div class="ctrl">'+btns(PR,'p')+'</div><div class="ctrl"><label>向量个数 m <select class="m">'+opt(['2','3','4'],'3')+'</select></label><label>维数 n <select class="n">'+opt(['2','3','4'],'3')+'</select></label><span class="small muted">每一行是一个向量 αᵢ</span></div><div class="row"><span class="ed"></span></div><div class="ld-out"></div>';
  function draw(){
    var o=$('.ld-out',body);if(!A){o.innerHTML=D.BAD;return}
    var m=A.length,names=A.map(function(_,i){return '\\alpha_{'+(i+1)+'}'}),M=T(A),ns=nullspace(M),r=m-ns.length;
    var h='<p class="small">解齐次方程组 '+K(names.map(function(n,i){return 'k_{'+(i+1)+'}'+n}).join('+')+'=0')+'，即系数矩阵以 αᵢ 为<b>列</b>：'+K(X.texM(M))+'，秩 = '+r+'。</p>';
    if(!ns.length) h+='<div class="ok-note">只有零解 '+K('k_1=\\cdots=k_'+m+'=0')+'：向量组<b>线性无关</b>（秩 = 向量个数）。</div>';
    else{
      var k=intVec(ns[0]),j=m-1;while(k[j].isZero())j--;var oth=[];for(var i=0;i<m;i++)if(i!==j)oth.push(i);
      h+='<div class="err-note">有非零解，例如 '+K(comb(k,names,true)+'=0')+'：向量组<b>线性相关</b>（秩 '+r+' < 向量个数 '+m+'）。</div>';
      h+='<p class="small">由定理 3.4.2，'+K(names[j])+' 的系数非零，它可以由其余向量表示：'+K(names[j]+'='+comb(oth.map(function(i){return k[i].div(k[j]).neg()}),oth.map(function(i){return names[i]}),true))+'。</p>';
      if(A.some(function(row){return row.every(function(x){return x.isZero()})}))h+='<p class="small">（含零向量的向量组一定线性相关：例 3.4.5。）</p>';
      if(m>A[0].length)h+='<p class="small">（'+m+' 个 '+A[0].length+' 维向量：个数超过维数，必定相关——推论 3.5.1。）</p>';
    }
    o.innerHTML=h;fire(body);
  }
  function load(v){$('.m',body).value=v.length;$('.n',body).value=v[0].length;ed=null;ed=new D.MatEd($('.ed',body),v.map(function(r){return r.map(String)}),function(M){A=M;if(ed)draw()},{pm:true});draw()}
  function resize(){var m=+$('.m',body).value,n=+$('.n',body).value,v=[];for(var i=0;i<m;i++){v.push([]);for(var j=0;j<n;j++)v[i].push(ed.vals[i]&&ed.vals[i][j]!==undefined?ed.vals[i][j]:String(ri(-2,3)))}load(v)}
  body.addEventListener('click',function(e){var b=e.target.closest('button[data-p]');if(b)load(PR[b.dataset.p][1])});
  body.addEventListener('change',function(e){if(e.target.matches&&e.target.matches('select')){e.stopPropagation();resize()}});
  load(PR.a[1]);
};

/* =============== §3.5 逐个筛选：极大无关组、秩、基扩张 =============== */
W.maxindep=function(el){
  var body=frame(el),vecs=null,ed,step=0,names=[];
  var PR={a:['例 3.5.1',[[1,0],[0,1],[1,1]]],b:['例 3.6.5',[[1,0,2],[2,-1,3],[3,-2,4],[4,-3,5]]],c:['习题 3.6 第 4 题',[[1,2,3,4],[2,3,4,5],[3,4,5,6],[4,5,6,7]]],d:['基扩张：v₁, v₂ + e₁…e₄',[[1,1,0,0],[0,1,1,0],[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]]};
  body.innerHTML='<div class="ctrl">'+btns(PR,'p')+'</div><div class="ctrl"><button class="btn sm rot" type="button">换个顺序（把第一个移到最后）</button><button class="btn sm pri nx" type="button">下一个向量</button><button class="btn sm all" type="button">全部筛完</button><button class="btn sm rs" type="button">重来</button></div><div class="row"><span class="ed"></span></div><div class="mi-out"></div>';
  function draw(){
    var o=$('.mi-out',body);if(!vecs){o.innerHTML=D.BAD;return}
    var kept=[],log=[],ext=$('.ed',body).dataset.ext==='1';
    for(var i=0;i<Math.min(step,vecs.length);i++){
      var M=T(kept.map(function(k){return vecs[k]}).concat([vecs[i]]));
      var ok=rref(M).rank===kept.length+1;
      if(ok){kept.push(i);log.push('<li><span class="ok">留下</span> '+K(names[i])+'：与已留下的向量线性无关。</li>')}
      else{var B=T(kept.map(function(k){return vecs[k]})),sol=rref(B.map(function(r,ii){return r.concat([vecs[i][ii]])})),co=kept.map(function(_,c){var row=sol.piv.indexOf(c);return row<0?F(0):sol.R[row][kept.length]});
        log.push('<li><span class="no">去掉</span> '+K(names[i]+'='+comb(co,kept.map(function(k){return names[k]}),true))+'：可由已留下的向量表示（冗余）。</li>')}
    }
    var h='<p class="small">按顺序检查每个向量：若它与已留下的向量线性无关就留下，否则它是冗余的，去掉。</p><ol class="small mi-log">'+log.join('')+'</ol>';
    if(step>=vecs.length){
      h+='<div class="ok-note">极大线性无关组：'+K('\\{'+kept.map(function(k){return names[k]}).join(',\\ ')+'\\}')+'，秩 = '+kept.length+'。'+(ext?'前两个向量 v₁, v₂ 都被留下，再从 e₁, …, e₄ 中补上 '+(kept.length-2)+' 个，得到 '+K('\\mathbb K^4')+' 的一组基——这就是基扩张定理 3.5.4。':'换个顺序再筛一次：选出的向量可能不同，但<b>个数总是 '+kept.length+'</b>（定理 3.5.1）——这个数就是秩。')+'</div>';
    }else h+='<p class="small muted">已检查 '+step+' / '+vecs.length+' 个。</p>';
    o.innerHTML=h;fire(body);
  }
  function load(v,ext){vecs=null;names=v.map(function(_,i){return ext?(i<2?'v_{'+(i+1)+'}':'e_{'+(i-1)+'}'):'\\alpha_{'+(i+1)+'}'});step=0;$('.ed',body).dataset.ext=ext?'1':'';ed=null;ed=new D.MatEd($('.ed',body),v.map(function(r){return r.map(String)}),function(M){vecs=M;if(ed){step=Math.min(step,M?M.length:0);draw()}},{pm:true});draw()}
  body.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
    if(b.dataset.p)load(PR[b.dataset.p][1],b.dataset.p==='d');
    else if(b.classList.contains('nx')){if(vecs&&step<vecs.length){step++;draw()}}
    else if(b.classList.contains('all')){if(vecs){step=vecs.length;draw()}}
    else if(b.classList.contains('rs')){step=0;draw()}
    else if(b.classList.contains('rot')){var v=ed.vals.slice(1).concat([ed.vals[0]]);load(v,false)}});
  load(PR.a[1],false);
};

/* =============== §3.5 替换定理（引理 3.5.1）的过程 =============== */
W.exchange=function(el){
  var body=frame(el);
  var PR={a:['A 有 3 个向量',[[1,1,0],[0,1,1],[1,0,1]]],b:['A 有 2 个向量',[[1,2,0],[0,1,3]]],c:['“多”用“少”表示：4 个向量',[[1,0,1],[1,1,0],[0,1,1],[1,1,1]]]};
  body.innerHTML='<div class="ctrl">'+btns(PR,'p')+'<button class="btn sm pri nx" type="button">替换下一个</button><button class="btn sm rs" type="button">重来</button></div><p class="small">B = {β₁, β₂, β₃} = {e₁, e₂, e₃} 是 '+K('\\mathbb K^3')+' 的标准基；把 A 中的向量 α₁, α₂, … 一个一个换进 B。</p><div class="ex-out"></div>';
  var Av,step=0,cur;
  function names(set){return set.map(function(s){return s[0]==='a'?'\\alpha_{'+s.slice(1)+'}':'\\beta_{'+s.slice(1)+'}'})}
  function vecOf(s){return s[0]==='a'?Av[+s.slice(1)-1]:[0,1,2].map(function(j){return F(j===+s.slice(1)-1?1:0)})}
  function draw(){
    var log=[],set=['b1','b2','b3'],stop=false;
    for(var i=0;i<step&&!stop;i++){
      var a=Av[i],M=T(set.map(vecOf)),sol=rref(M.map(function(r,ii){return r.concat([a[ii]])})),co=set.map(function(_,c){var row=sol.piv.indexOf(c);return row<0?F(0):sol.R[row][3]});
      var expr=K('\\alpha_{'+(i+1)+'}='+comb(co,names(set),true));
      var idx=-1;for(var c=0;c<3;c++)if(set[c][0]==='b'&&!co[c].isZero()){idx=c;break}
      if(idx<0){log.push('<li>'+expr+'：所有系数非零的都已是 α，说明 α'+(i+1)+' 可由 α₁, …, α'+i+' 表示——<b>A 线性相关</b>。这正是“多”（'+Av.length+' 个）用“少”（3 个）表示必相关。</li>');stop=true;break}
      var old=set[idx];set[idx]='a'+(i+1);
      log.push('<li>'+expr+'，'+K(names([old])[0])+' 的系数 '+co[idx].tex()+' ≠ 0，解出 '+K(names([old])[0])+' 后用 '+K('\\alpha_{'+(i+1)+'}')+' 替换它。现在的组：'+K('\\{'+names(set).join(',\\ ')+'\\}')+'，仍能表示整个空间。</li>');
    }
    var h='<ol class="small mi-log">'+log.join('')+'</ol>';
    if(!stop&&step>=Av.length)h+='<div class="ok-note">A 的 '+Av.length+' 个向量全部换进去了，说明 r = '+Av.length+' ≤ s = 3。引理 3.5.1 的证明正是这个过程：每一步总能找到一个 β 换出去（因为 A 线性无关），所以 A 的向量个数不会超过 B。</div>';
    else if(!stop)h+='<p class="small muted">已替换 '+step+' / '+Av.length+' 个。</p>';
    $('.ex-out',body).innerHTML=h;fire(body);
  }
  function load(k){Av=toFr(PR[k][1]);step=0;draw()}
  body.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.dataset.p)load(b.dataset.p);else if(b.classList.contains('nx')){if(step<Av.length){step++;draw()}}else if(b.classList.contains('rs')){step=0;draw()}});
  load('a');
};

/* =============== §3.6 行秩、列秩与子式 =============== */
W.rankview=function(el){
  var body=frame(el),A=null,ed;
  var PR={a:['例 3.6.1',[[1,2,3,4],[-1,-1,-1,-1],[1,3,5,7]]],b:['子式的例子',[[1,2,3,1,0],[-1,0,1,-2,4],[0,1,-3,5,7]]],c:['秩 1',[[1,2,-1],[2,4,-2],[-3,-6,3]]],d:['习题 3.6 第 1 题 ③',[[1,2,3,4],[2,3,4,1],[3,4,1,2],[4,1,2,3]]]};
  body.innerHTML='<div class="ctrl">'+btns(PR,'p')+'</div><div class="ctrl"><label>大小 <select class="m">'+opt(['2','3','4'],'3')+'</select> × <select class="n">'+opt(['2','3','4','5'],'4')+'</select></label></div><div class="row"><span class="ed"></span></div><div class="rk-out"></div>';
  function minors(k){var m=A.length,n=A[0].length,rng=function(t){var a=[];for(var q=0;q<t;q++)a.push(q);return a},rs=D.combos(rng(m),k),cs=D.combos(rng(n),k),nz=0,tot=0,first=null;
    rs.forEach(function(r){cs.forEach(function(c){tot++;var sub=r.map(function(i){return c.map(function(j){return A[i][j]})}),d=D.det(sub);if(!d.isZero()){nz++;if(!first)first={r:r,c:c,d:d,sub:sub}}})});return {nz:nz,tot:tot,first:first}}
  function draw(){
    var o=$('.rk-out',body);if(!A){o.innerHTML=D.BAD;return}
    var m=A.length,n=A[0].length,R=rref(A),C=rref(T(A)),h='<div class="w-grid">';
    h+='<div class="box prop"><span class="tag">行秩：行向量组的秩</span><p class="small">初等行变换化为（简化）阶梯形，数非零行：</p>'+P(R.R,{cls:'sm',cell:function(i,j){return R.piv[i]===j?'pvt':''}})+'<p>行秩 = <b>'+R.rank+'</b>；阶梯点在第 '+R.piv.map(function(c){return c+1}).join('、')+' 列 → 原矩阵这几列是列向量组的极大无关组（命题 3.6.1）。</p></div>';
    h+='<div class="box prop"><span class="tag">列秩：列向量组的秩</span><p class="small">对 A′ 做行变换（相当于对 A 做列变换）：</p>'+P(C.R,{cls:'sm',cell:function(i,j){return C.piv[i]===j?'pvt':''}})+'<p>列秩 = <b>'+C.rank+'</b>。</p></div></div>';
    h+='<p class="ok-note">行秩 = 列秩 = '+R.rank+'（推论 3.6.1），统称为矩阵的秩 r(A) = '+R.rank+'。</p>';
    var rows=[],r=R.rank,maxk=Math.min(m,n),firstR=null;
    for(var k=1;k<=maxk;k++){var mi=minors(k);rows.push('<tr'+(k===r?' class="sum"':'')+'><td>'+k+' 阶</td><td>'+mi.tot+'</td><td>'+mi.nz+'</td></tr>');if(k===r)firstR=mi.first}
    h+='<p class="small">子式刻画（定理 3.6.2）：</p><div class="tw"><table class="t small"><tr><th>阶数</th><th>子式个数</th><th>非零子式个数</th></tr>'+rows.join('')+'</table></div>';
    if(firstR)h+='<p class="small">例如取第 '+firstR.r.map(function(i){return i+1}).join('、')+' 行、第 '+firstR.c.map(function(j){return j+1}).join('、')+' 列的 '+r+' 阶子式 '+K(X.texM(firstR.sub,'vmatrix')+'='+firstR.d.tex())+' ≠ 0；而'+(r<maxk?'所有 '+(r+1)+' 阶子式都等于 0。':'没有更高阶的子式。')+' 所以 r(A) = 非零子式的最高阶数 = '+r+'。</p>';
    else if(r===0)h+='<p class="small">A = O，秩为 0。</p>';
    o.innerHTML=h;fire(body);
  }
  function load(v){$('.m',body).value=v.length;$('.n',body).value=v[0].length;ed=null;ed=new D.MatEd($('.ed',body),v.map(function(r){return r.map(String)}),function(M){A=M;if(ed)draw()},{pm:true});draw()}
  function resize(){var m=+$('.m',body).value,n=+$('.n',body).value,v=[];for(var i=0;i<m;i++){v.push([]);for(var j=0;j<n;j++)v[i].push(ed.vals[i]&&ed.vals[i][j]!==undefined?ed.vals[i][j]:String(ri(-2,3)))}load(v)}
  body.addEventListener('click',function(e){var b=e.target.closest('button[data-p]');if(b)load(PR[b.dataset.p][1])});
  body.addEventListener('change',function(e){if(e.target.matches&&e.target.matches('select')){e.stopPropagation();resize()}});
  load(PR.a[1]);
};

/* =============== §3.7 / §3.8 平面上的基与坐标 =============== */
W.basis2d=function(el){
  var body=frame(el),trans=el.dataset.mode==='trans',v={f1:[2,1],f2:[-1,1],a:[3,3]};
  body.innerHTML='<div class="w-grid"><div class="bz-pl"></div><div class="bz-out"></div></div><p class="tiny muted">拖动 f₁（蓝）、f₂（青）改变基，拖动 α（橙）改变向量。浅灰是标准坐标网格，彩色斜网格是基 {f₁, f₂} 的“坐标纸”。</p>';
  var pl=Plane($('.bz-pl',body),{R:6,size:300,snap:1,label:'基与坐标'});
  function draw(){
    var f1=v.f1,f2=v.f2,a=v.a,g=pl.grid(),h='',d=f1[0]*f2[1]-f2[0]*f1[1];
    if(d!==0){for(var k=-8;k<=8;k++){g+=pl.line(f1[0],f1[1],'skew',k*f2[0],k*f2[1])+pl.line(f2[0],f2[1],'skew',k*f1[0],k*f1[1])}}
    var Fm=[[F(f1[0]),F(f2[0])],[F(f1[1]),F(f2[1])]],lam=[F(a[0]),F(a[1])];
    if(d!==0){
      var Ai=X.inv(Fm),mu=[Ai[0][0].mul(lam[0]).add(Ai[0][1].mul(lam[1])),Ai[1][0].mul(lam[0]).add(Ai[1][1].mul(lam[1]))],p=[mu[0].val()*f1[0],mu[0].val()*f1[1]];
      g+='<line class="dash" x1="'+pl.tx(0)+'" y1="'+pl.ty(0)+'" x2="'+pl.tx(p[0])+'" y2="'+pl.ty(p[1])+'"/><line class="dash" x1="'+pl.tx(p[0])+'" y1="'+pl.ty(p[1])+'" x2="'+pl.tx(a[0])+'" y2="'+pl.ty(a[1])+'"/>';
      h+='<p>在标准基 {e₁, e₂} 下：'+K('[\\alpha]_e='+cv(lam))+'</p><p>在基 {f₁, f₂} 下：'+K('\\alpha='+comb(mu,['f_1','f_2'])+'，\\ [\\alpha]_f='+cv(mu))+'</p>';
      h+='<p class="small">同一个向量 α，换一组基，坐标就变了；但在每一组基下坐标都是<b>唯一</b>的（引理 3.7.1）。</p>';
      if(trans){
        h+='<div class="box idea"><span class="tag">过渡矩阵与坐标变换</span><p>从 {e} 到 {f} 的过渡矩阵 A 的第 j 列是 '+K('f_j')+' 在 {e} 下的坐标：'+K('A='+X.texM(Fm))+'。</p><p>'+K('[\\alpha]_e=A\\,[\\alpha]_f')+'：'+K(cv(lam)+'='+X.texM(Fm)+cv(mu))+' <span class="ok">✓</span></p><p class="small">反过来 '+K('[\\alpha]_f=A^{-1}[\\alpha]_e')+'。注意方向：A 把<b>新</b>坐标变成<b>旧</b>坐标。</p></div>';
      }else h+='<p class="small">把 α 对应到它的坐标 '+K('[\\alpha]_f')+'，就把平面（抽象的向量）和 '+K('\\mathbb K^2')+'（数组）一一对应起来——这就是“坐标化”。</p>';
    }else h='<div class="err-note">f₁, f₂ 共线（线性相关），不是基：大部分向量无法表示，能表示的也不唯一。坐标无从谈起。</div>';
    g+=pl.arrow(0,0,f1[0],f1[1],'vu')+pl.arrow(0,0,f2[0],f2[1],'vv')+pl.arrow(0,0,a[0],a[1],'v-w');
    g+=pl.label(f1[0],f1[1],'f₁','tu')+pl.label(f2[0],f2[1],'f₂','tv')+pl.label(a[0],a[1],'α','tw');
    g+=pl.handle('f1',f1[0],f1[1],'hu')+pl.handle('f2',f2[0],f2[1],'hv')+pl.handle('a',a[0],a[1],'hw');
    pl.svg.innerHTML=g;$('.bz-out',body).innerHTML=h;fire(body);
  }
  pl.onmove=function(id,x,y){v[id]=[x,y];draw()};
  draw();
};

/* =============== §3.7 / §3.8 多项式空间的坐标：Taylor 展开 =============== */
W.polycoord=function(el){
  var body=frame(el),c=[F(1),F(-2),F(3)],a=F(1);
  body.innerHTML='<div class="ctrl"><span>'+K('p(x)=')+'</span><input class="num pc" data-i="0" value="1" aria-label="常数项">'+K('+')+'<input class="num pc" data-i="1" value="-2" aria-label="一次项系数">'+K('x+')+'<input class="num pc" data-i="2" value="3" aria-label="二次项系数">'+K('x^2')+'</div><div class="ctrl"><label>a = <input type="range" class="ar" min="-4" max="4" step="1" value="2"></label><b class="av">1</b><span class="small muted">新基 {1, x − a, (x − a)²}</span></div><div class="w-grid"><div class="pc-plot"></div><div class="pc-out"></div></div>';
  function pv(x){return c[0].val()+c[1].val()*x+c[2].val()*x*x}
  function draw(){
    var p_a=c[0].add(c[1].mul(a)).add(c[2].mul(a).mul(a)),d1=c[1].add(F(2).mul(c[2]).mul(a)),d2=c[2];
    var mu=[p_a,d1,d2],lam=c,A=[[F(1),a.neg(),a.mul(a)],[F(0),F(1),F(2).mul(a).neg()],[F(0),F(0),F(1)]];
    var h='<p>在基 {1, x, x²} 下：'+K('[p]_E='+cv(lam))+'</p><p>在基 {1, x−a, (x−a)²} 下（a = '+a.tex()+'）：</p><div class="scroll-x">'+K('p(x)='+mu[0].tex()+(mu[1].val()<0?'':'+')+mu[1].tex()+'(x'+(a.val()<0?'+'+a.neg().tex():a.isZero()?'':'-'+a.tex())+')'+(mu[2].val()<0?'':'+')+mu[2].tex()+'(x'+(a.val()<0?'+'+a.neg().tex():a.isZero()?'':'-'+a.tex())+')^2',true)+'</div><p>'+K('[p]_F='+cv(mu)+'=\\begin{pmatrix}p(a)\\\\p\'(a)\\\\p\'\'(a)/2!\\end{pmatrix}')+'：新坐标正是 Taylor 系数。</p>';
    h+='<p class="small">从 E 到 F 的过渡矩阵（各列是 1, x−a, (x−a)² 在 E 下的坐标）：'+K('A='+X.texM(A))+'，且 '+K('[p]_E=A[p]_F')+' <span class="ok">'+(X.meq(mm(A,mu.map(function(x){return [x]})),lam.map(function(x){return [x]}))?'✓':'✗')+'</span>（习题 3.8 第 5 题）。</p>';
    $('.pc-out',body).innerHTML=h;
    var Wd=300,H=220,sx=function(x){return 20+(x+3)*(Wd-30)/6},ys=[],mn=1e9,mx=-1e9;for(var x=-3;x<=3.001;x+=0.1){var y=pv(x);ys.push([x,y]);mn=Math.min(mn,y);mx=Math.max(mx,y)}
    mn=Math.min(mn,0);mx=Math.max(mx,0);if(mx-mn<1){mx+=1;mn-=1}
    var sy=function(y){return H-15-(y-mn)/(mx-mn)*(H-30)};
    var g='<line class="axis" x1="20" y1="'+sy(0)+'" x2="'+(Wd-10)+'" y2="'+sy(0)+'"/><line class="axis" x1="'+sx(0)+'" y1="5" x2="'+sx(0)+'" y2="'+(H-5)+'"/>';
    g+='<polyline class="l1" points="'+ys.map(function(p){return sx(p[0]).toFixed(1)+','+sy(p[1]).toFixed(1)}).join(' ')+'"/>';
    var av=a.val();if(av>=-3&&av<=3)g+='<line class="dash" x1="'+sx(av)+'" y1="5" x2="'+sx(av)+'" y2="'+(H-5)+'"/><circle class="dot" cx="'+sx(av)+'" cy="'+sy(pv(av))+'" r="5"/>';
    $('.pc-plot',body).innerHTML='<svg class="plot" viewBox="0 0 '+Wd+' '+H+'" role="img" aria-label="多项式的图像">'+g+'</svg><p class="tiny muted" style="text-align:center">同一个多项式（向量），只是换了一组基来描述</p>';
    fire(body);
  }
  body.addEventListener('input',function(e){
    if(e.target.classList.contains('ar')){a=F(+e.target.value).div(F(2));$('.av',body).textContent=a.toString();draw()}
    else if(e.target.classList.contains('pc')){var f=D.parseFr(e.target.value);if(f){c[+e.target.dataset.i]=f;draw()}}
  });
  draw();
};

/* =============== §3.8 用 (A | B) → (I | A⁻¹B) 求过渡矩阵 =============== */
W.trans3=function(el){
  var body=frame(el),A=null,B=null,ea,eb;
  body.innerHTML='<p class="small">K³ 中两组基：f₁, f₂, f₃ 作为 A 的列，g₁, g₂, g₃ 作为 B 的列（都是在标准基下的坐标，即 A、B 分别是从 {e} 到 {f}、{g} 的过渡矩阵）。</p><div class="row cb-in"><span class="p4-g">'+K('A=(f_1,f_2,f_3)=')+'<span class="ea"></span></span><span class="p4-g">'+K('B=(g_1,g_2,g_3)=')+'<span class="eb"></span></span></div><div class="tr-pl"></div>';
  function run(){
    var host=$('.tr-pl',body);if(!A||!B){host.innerHTML=D.BAD;return}
    if(D.det(A).isZero()){host.innerHTML='<div class="err-note">|A| = 0：f₁, f₂, f₃ 线性相关，不是基。</div>';return}
    var M=A.map(function(r,i){return r.concat(B[i])}),res=D.echelonSteps(M,true,3);
    D.player(host,res.steps,{div:3,start:'{e} → {f} 的过渡矩阵是 A，{e} → {g} 的是 B，所以 {f} → {g} 的过渡矩阵 P 满足 B = AP，即 P = A⁻¹B。作 (A | B) 做初等行变换：',end:function(){var Pm=X.inv(A),PP=mm(Pm,B);return '<div class="ok-note">从 {f} 到 {g} 的过渡矩阵 '+K('P=A^{-1}B='+X.texM(PP))+'。第 j 列就是 '+K('g_j')+' 在基 {f} 下的坐标；验算：'+K('AP=B')+' <span class="ok">'+(X.meq(mm(A,PP),B)?'✓':'✗')+'</span></div>'}});
    fire(body);
  }
  ea=new D.MatEd($('.ea',body),[['1','2','1'],['0','1','1'],['-1','1','1']],function(m){A=m;if(eb)run()},{pm:true});
  eb=new D.MatEd($('.eb',body),[['0','-1','1'],['1','1','2'],['1','0','1']],function(m){B=m;run()},{pm:true});
};

/* =============== §3.9 这个子集是子空间吗？ =============== */
W.subtest=function(el){
  var body=frame(el);
  var S={
    l0:{n:'直线 y = 2x（过原点）',in:function(p){return p[1]===2*p[0]},gen:function(){var t=ri(-2,2);return [t,2*t]},sub:true,ce:null,draw:function(pl){return pl.line(1,2,'span-l')}},
    l1:{n:'直线 y = 2x + 1（不过原点）',in:function(p){return p[1]===2*p[0]+1},gen:function(){var t=ri(-2,1);return [t,2*t+1]},sub:false,ce:[[0,1],[1,3],2],draw:function(pl){return pl.line(1,2,'span-l',0,1)},why:'不含零向量；而且 (0,1) + (1,3) = (1,4) 不在直线上。'},
    ax:{n:'两条坐标轴的并集',in:function(p){return p[0]===0||p[1]===0},gen:function(){var t=ri(-3,3);return ri(0,1)?[t,0]:[0,t]},sub:false,ce:[[2,0],[0,3],1],draw:function(pl){return pl.line(1,0,'span-l')+pl.line(0,1,'span-l')},why:'(2,0) + (0,3) = (2,3) 不在坐标轴上：两个子空间的并集一般不是子空间。'},
    q1:{n:'第一象限 {x ≥ 0, y ≥ 0}',in:function(p){return p[0]>=0&&p[1]>=0},gen:function(){return [ri(0,3),ri(0,3)]},sub:false,ce:[[2,1],[1,2],-1],draw:function(pl){return '<rect class="reg" x="'+pl.tx(0)+'" y="0" width="'+(pl.W/2)+'" height="'+(pl.W/2)+'"/>'},why:'(−1)·(2,1) = (−2,−1) 跑出了第一象限：对数乘不封闭。'},
    dk:{n:'圆盘 x² + y² ≤ 4',in:function(p){return p[0]*p[0]+p[1]*p[1]<=4},gen:function(){var L=[[0,0],[1,0],[0,1],[1,1],[-1,1],[2,0],[0,-2],[-1,-1],[1,-1]];return L[ri(0,L.length-1)]},sub:false,ce:[[1,1],[1,0],3],draw:function(pl){return '<circle class="reg" cx="'+pl.tx(0)+'" cy="'+pl.ty(0)+'" r="'+(2*pl.S)+'"/>'},why:'3·(1,1) = (3,3) 不在圆盘内；(1,1)+(1,0) = (2,1) 也跑出去了。'},
    z:{n:'只含零向量 {0}',in:function(p){return p[0]===0&&p[1]===0},gen:function(){return [0,0]},sub:true,ce:null,draw:function(pl){return '<circle class="dot" cx="'+pl.tx(0)+'" cy="'+pl.ty(0)+'" r="6"/>'}},
    pl:{n:'整个平面 ℝ²',in:function(){return true},gen:function(){return [ri(-2,2),ri(-2,2)]},sub:true,ce:null,draw:function(){return ''}}
  };
  body.innerHTML='<div class="ctrl"><label>子集 <select class="ss">'+opt(Object.keys(S).map(function(k){return [k,S[k].n]}),'l1')+'</select></label><button class="btn sm pri smp" type="button">随机抽样检验</button><button class="btn sm ce" type="button">给出反例</button></div><div class="w-grid"><div class="st-pl"></div><div class="st-out"></div></div>';
  var pl=Plane($('.st-pl',body),{R:6,size:300,label:'子集与封闭性'}),cur='l1',x,y,k;
  function draw(){
    var s=S[cur],sum=[x[0]+y[0],x[1]+y[1]],kx=[k*x[0],k*x[1]],ok1=s.in(sum),ok2=s.in(kx);
    var g=pl.grid()+s.draw(pl)+pl.arrow(0,0,x[0],x[1],'vu')+pl.arrow(0,0,y[0],y[1],'vv')+pl.arrow(0,0,sum[0],sum[1],'v-w')+pl.arrow(0,0,kx[0],kx[1],'v-k')+pl.label(x[0],x[1],'α','tu')+pl.label(y[0],y[1],'β','tv')+pl.label(sum[0],sum[1],'α+β','tw')+pl.label(kx[0],kx[1],k+'α','tk2');
    pl.svg.innerHTML=g;
    var f=function(p){return '('+p[0]+',\\ '+p[1]+')'};
    var h='<p>'+K('\\alpha='+f(x)+',\\ \\beta='+f(y)+',\\ k='+k)+'</p><p>'+K('\\alpha+\\beta='+f(sum))+' '+(ok1?'<span class="ok">在集合中 ✓</span>':'<span class="no">不在集合中 ✗</span>')+'</p><p>'+K('k\\alpha='+f(kx))+' '+(ok2?'<span class="ok">在集合中 ✓</span>':'<span class="no">不在集合中 ✗</span>')+'</p>';
    h+=s.sub?'<div class="ok-note">这是子空间：任意两个元素之和、任意数乘都还在里面（只需检验这两条封闭性，命题 3.9.1）。</div>':'<div class="err-note">不是子空间：'+s.why+'</div>';
    $('.st-out',body).innerHTML=h;$('.ce',body).hidden=s.sub;fire(body);
  }
  function sample(){var s=S[cur];x=s.gen();y=s.gen();k=[-1,2,-2,3][ri(0,3)];draw()}
  body.addEventListener('change',function(e){if(e.target.classList&&e.target.classList.contains('ss')){e.stopPropagation();cur=e.target.value;sample()}});
  body.addEventListener('click',function(e){if(e.target.closest('.smp'))sample();else if(e.target.closest('.ce')){var c=S[cur].ce;if(!c)return;x=c[0];y=c[1];k=c[2];draw()}});
  sample();
};

/* =============== §3.9 交与和：维数公式 =============== */
W.sumint=function(el){
  var body=frame(el),A=null,B=null,ea,eb;
  var PR={a:['习题 3.9 第 7 题',[[1,0,-1,0],[0,1,2,1],[2,1,0,1]],[[-1,1,1,1],[1,-1,-3,-1],[-1,1,-1,1]]],b:['例 3.9.1：V₄ 与 V₅',[[1,0,0],[0,1,0]],[[0,1,0],[0,0,1]]],c:['直和：直线 + 平面',[[1,1,1]],[[1,0,0],[0,1,0]]],d:['两个平面相同',[[1,0,1],[0,1,1]],[[1,1,2],[1,-1,0]]]};
  body.innerHTML='<div class="ctrl">'+btns(PR,'p')+'</div><div class="row cb-in"><span class="p4-g">'+K('V_1=L(')+'<span class="ea"></span>'+K(')')+'</span><span class="p4-g">'+K('V_2=L(')+'<span class="eb"></span>'+K(')')+'</span></div><p class="tiny muted">每一行是一个生成向量。</p><div class="si-out"></div>';
  function basis(M){var o=rref(T(M));return o.piv.map(function(c){return M[c]})}
  function draw(){
    var o=$('.si-out',body);if(!A||!B||A[0].length!==B[0].length){o.innerHTML=D.BAD;return}
    var b1=basis(A),b2=basis(B),bs=basis(A.concat(B)),n1=b1.length,n2=b2.length,ns=bs.length;
    var Mx=T(b1.concat(b2.map(function(v){return v.map(function(x){return x.neg()})}))),nsp=n1&&n2?nullspace(Mx):[],inter=nsp.map(function(z){return intVec(b1[0].map(function(_,j){var s=F(0);for(var i=0;i<n1;i++)s=s.add(z[i].mul(b1[i][j]));return s}))});
    var L=function(vs){return vs.length?'\\{'+vs.map(rv).join(',\\ ')+'\\}':'\\varnothing'};
    var h='<div class="tw"><table class="t small"><tr><th>子空间</th><th>一组基</th><th>维数</th></tr><tr><td>'+K('V_1')+'</td><td>'+K(L(b1))+'</td><td>'+n1+'</td></tr><tr><td>'+K('V_2')+'</td><td>'+K(L(b2))+'</td><td>'+n2+'</td></tr><tr><td>'+K('V_1+V_2')+'</td><td>'+K(L(bs))+'</td><td>'+ns+'</td></tr><tr class="sum"><td>'+K('V_1\\cap V_2')+'</td><td>'+(inter.length?K(L(inter)):K('\\{0\\}'))+'</td><td>'+inter.length+'</td></tr></table></div>';
    h+='<p class="small">'+K('V_1+V_2=L(V_1\\cup V_2)')+'：把两组生成向量放在一起求极大无关组。'+K('V_1\\cap V_2')+'：解 '+K('x_1\\alpha_1+\\cdots=y_1\\beta_1+\\cdots')+'，即齐次方程组 '+K('(\\text{基}_1\\mid-\\text{基}_2)\\binom{x}{y}=0')+'。</p>';
    h+='<p class="ok-note">维数公式：'+K('\\dim(V_1+V_2)='+ns+'='+n1+'+'+n2+'-'+inter.length+'=\\dim V_1+\\dim V_2-\\dim(V_1\\cap V_2)')+' ✓</p>';
    h+=inter.length?'<p class="small">交不是零空间，所以 '+K('V_1+V_2')+' 不是直和；公共方向在 '+K('\\dim V_1+\\dim V_2')+' 中被数了两次。</p>':'<p class="small">'+K('V_1\\cap V_2=\\{0\\}')+'，所以 '+K('V_1+V_2=V_1\\oplus V_2')+' 是直和，维数可加。</p>';
    o.innerHTML=h;fire(body);
  }
  function load(k){A=B=null;ea=eb=null;ea=new D.MatEd($('.ea',body),PR[k][1].map(function(r){return r.map(String)}),function(m){A=m;if(ea&&eb)draw()},{pm:true});eb=new D.MatEd($('.eb',body),PR[k][2].map(function(r){return r.map(String)}),function(m){B=m;if(ea&&eb)draw()},{pm:true});draw()}
  body.addEventListener('click',function(e){var b=e.target.closest('button[data-p]');if(b)load(b.dataset.p)});
  load('a');
};

/* =============== §3.9 直和 = 分解唯一 =============== */
W.dsum2d=function(el){
  var body=frame(el),three=false,v={u:[2,1],w:[-1,2],z:[1,-2],a:[3,4]};
  body.innerHTML='<div class="ctrl"><label>情形 <select class="md">'+opt([['2','两个子空间 V₁ = L(u)、V₂ = L(w)'],['3','三个子空间 L(u)、L(w)、L(z)（两两交为 0）']],'2')+'</select></label></div><div class="w-grid"><div class="ds-pl"></div><div class="ds-out"></div></div><p class="tiny muted">拖动 u、w（、z）改变子空间（过原点的直线），拖动 α 改变要分解的向量。</p>';
  var pl=Plane($('.ds-pl',body),{R:6,size:300,snap:1,label:'直和分解'});
  function solve2(p,q,t){var d=p[0]*q[1]-q[0]*p[1];if(d===0)return null;return [F(t[0]*q[1]-q[0]*t[1]).div(F(d)),F(p[0]*t[1]-t[0]*p[1]).div(F(d))]}
  function draw(){
    var u=v.u,w=v.w,z=v.z,a=v.a,g=pl.grid()+pl.line(u[0],u[1],'span-l')+pl.line(w[0],w[1],'span-l2'),h='';
    if(three)g+=pl.line(z[0],z[1],'span-l3');
    var s=solve2(u,w,a);
    if(!three){
      if(s){var p=[s[0].val()*u[0],s[0].val()*u[1]],q=[s[1].val()*w[0],s[1].val()*w[1]];
        g+='<line class="dash" x1="'+pl.tx(p[0])+'" y1="'+pl.ty(p[1])+'" x2="'+pl.tx(a[0])+'" y2="'+pl.ty(a[1])+'"/><line class="dash" x1="'+pl.tx(q[0])+'" y1="'+pl.ty(q[1])+'" x2="'+pl.tx(a[0])+'" y2="'+pl.ty(a[1])+'"/>'+pl.arrow(0,0,p[0],p[1],'vu')+pl.arrow(0,0,q[0],q[1],'vv');
        h='<p>'+K('\\alpha=\\underbrace{'+s[0].tex()+'u}_{\\in V_1}+\\underbrace{'+s[1].tex()+'w}_{\\in V_2}')+'</p><div class="ok-note">'+K('V_1\\cap V_2=\\{0\\}')+'，'+K('\\mathbb R^2=V_1\\oplus V_2')+' 是直和：每个 α 都能分解，而且<b>分解唯一</b>（定理 3.9.3 (5)）。</div>';
      }else h='<div class="err-note">u、w 共线，V₁ = V₂，'+K('V_1+V_2')+' 只是一条直线：'+K('V_1\\cap V_2=V_1\\ne\\{0\\}')+'，不是直和。直线上的向量有无穷多种分解（例如 α = v + 0 = 0 + v），直线外的向量根本无法分解。</div>';
    }else{
      var s0=solve2(u,w,a),am=[a[0]-z[0],a[1]-z[1]],s1=solve2(u,w,am);
      if(s0&&s1&&solve2(u,z,[1,0])!==null&&solve2(w,z,[1,0])!==null){
        var p0=[s0[0].val()*u[0],s0[0].val()*u[1]],p1=[s1[0].val()*u[0],s1[0].val()*u[1]],q1=[p1[0]+s1[1].val()*w[0],p1[1]+s1[1].val()*w[1]];
        g+='<polyline class="chain" points="'+[[0,0],p0,a].map(function(pp){return pl.tx(pp[0])+','+pl.ty(pp[1])}).join(' ')+'"/><polyline class="chain2" points="'+[[0,0],p1,q1,a].map(function(pp){return pl.tx(pp[0])+','+pl.ty(pp[1])}).join(' ')+'"/>';
        h='<p>分解一：'+K('\\alpha='+s0[0].tex()+'u+'+cf(s0[1])+'w+0\\cdot z')+'</p><p>分解二：'+K('\\alpha='+s1[0].tex()+'u+'+cf(s1[1])+'w+1\\cdot z')+'</p><div class="err-note">三条直线两两相交都只有零向量，但同一个 α 有两种（其实无穷多种）分解，所以 '+K('L(u)+L(w)+L(z)')+' <b>不是</b>直和。直和要求每个 '+K('V_i')+' 与<b>其余之和</b>的交为 0，而不是两两相交为 0（习题 3.9 第 9 题）。维数也说明问题：1 + 1 + 1 = 3 > 2。</div>';
      }else h='<div class="err-note">有两条直线重合了，请把 u、w、z 拖成三个不同的方向。</div>';
      g+=pl.arrow(0,0,z[0],z[1],'v-k')+pl.label(z[0],z[1],'z','tk2')+pl.handle('z',z[0],z[1],'hk');
    }
    g+=pl.arrow(0,0,u[0],u[1],'vu')+pl.arrow(0,0,w[0],w[1],'vv')+pl.arrow(0,0,a[0],a[1],'v-w')+pl.label(u[0],u[1],'u','tu')+pl.label(w[0],w[1],'w','tv')+pl.label(a[0],a[1],'α','tw')+pl.handle('u',u[0],u[1],'hu')+pl.handle('w',w[0],w[1],'hv')+pl.handle('a',a[0],a[1],'hw');
    pl.svg.innerHTML=g;$('.ds-out',body).innerHTML=h;fire(body);
  }
  pl.onmove=function(id,x,y){if(x===0&&y===0&&id!=='a')return;v[id]=[x,y];draw()};
  body.addEventListener('change',function(e){if(e.target.classList&&e.target.classList.contains('md')){e.stopPropagation();three=e.target.value==='3';draw()}});
  draw();
};

/* =============== §3.10 线性方程组解的结构 =============== */
W.solstruct=function(el){
  var body=frame(el),M=null,ed,ks=null;
  var PR={a:['例 3.10.1',[[1,3,-2,4,1,2],[2,6,-3,5,2,5],[4,11,-7,15,5,3],[1,3,-1,1,1,3]]],b:['例 3.10.2',[[1,2,-1,3,1,2],[2,4,-2,6,3,6],[-1,-2,1,-1,3,4]]],c:['习题 3.10 第 1(1) 题',[[1,-1,2,0,3],[1,-1,1,-2,2],[-1,1,-1,2,0],[-3,1,-8,-10,-1]]],d:['习题 3.10 第 2 题（λ = 5）',[[2,3,1,1,1],[1,2,-1,4,2],[1,3,-4,11,5]]],e:['唯一解',[[1,-1,3,8],[2,-1,4,11],[-1,2,-4,-11]]],f:['齐次方程组',[[1,1,-1,-1,0],[2,-5,3,2,0],[7,-7,3,1,0]]]};
  body.innerHTML='<div class="ctrl">'+btns(PR,'p')+'</div><div class="row"><span class="ed"></span></div><p class="tiny muted">输入增广矩阵 (A | β)：最后一列是常数项。</p><div class="ss-out"></div>';
  function xn(i){return 'x_{'+(i+1)+'}'}
  function draw(){
    var o=$('.ss-out',body);if(!M){o.innerHTML=D.BAD;return}
    var n=M[0].length-1,R=rref(M),rA=R.piv.filter(function(c){return c<n}).length,rAb=R.rank,h='';
    h+='<div class="row el-eq">'+D.matHTML(R.R,{cls:'pm aug sm',cell:function(i,j){var c=[];if(j===n)c.push('divl');if(R.piv[i]===j)c.push('pvt');return c.join(' ')}})+'<span class="small">简化阶梯形（只用行变换）</span></div>';
    h+='<p>'+K('r(A)='+rA+',\\quad r(\\widetilde A)='+rAb+',\\quad n='+n)+'</p>';
    if(rA!==rAb){o.innerHTML=h+'<div class="err-note">'+K('r(A)\\ne r(\\widetilde A)')+'：阶梯形中出现 (0, …, 0 | 非零数)，即 “0 = 非零数”，方程组<b>无解</b>（定理 3.10.1 (3)）。β 不能由 A 的列向量线性表示。</div>';fire(body);return}
    var free=[];for(var j=0;j<n;j++)if(R.piv.indexOf(j)<0)free.push(j);
    var gam=[];for(j=0;j<n;j++)gam.push(F(0));R.piv.forEach(function(c,i){if(c<n)gam[c]=R.R[i][n]});
    var etas=free.map(function(f){var e=[];for(var j=0;j<n;j++)e.push(F(0));e[f]=F(1);R.piv.forEach(function(c,i){if(c<n)e[c]=R.R[i][f].neg()});return e});
    var homog=M.every(function(r){return r[n].isZero()});
    if(!free.length){h+='<div class="ok-note">'+K('r(A)=r(\\widetilde A)=n')+'：<b>唯一解</b> '+K('x='+cv(gam))+'。A 的列向量线性无关，β 的表示唯一。</div>';o.innerHTML=h;fire(body);return}
    h+='<p class="small">主变量 '+K(R.piv.filter(function(c){return c<n}).map(xn).join(','))+'，自由变量 '+K(free.map(xn).join(','))+'（共 n − r = '+free.length+' 个）。</p>';
    if(!homog)h+='<p>① 自由变量全取 0，得一个<b>特解</b> '+K('\\gamma='+cv(gam))+'</p>';
    h+='<p>'+(homog?'①':'②')+' 依次令一个自由变量为 1、其余为 0，得导出组 Ax = 0 的<b>基础解系</b>（解空间的一组基，'+free.length+' 个向量）：</p><div class="scroll-x">'+K(etas.map(function(e,i){return '\\eta_{'+(i+1)+'}='+cv(e)}).join(',\\quad '),true)+'</div>';
    var gen=etas.map(function(_,i){return 'k_{'+(i+1)+'}\\eta_{'+(i+1)+'}'}).join('+')+(homog?'':'+\\gamma');
    h+='<div class="ok-note">'+(homog?'全部解：':'全部解（定理 3.10.3）：')+K('x='+gen)+'，'+K('k_i')+' 任意。'+(homog?'解集是 '+n+' 维空间中的 '+free.length+' 维子空间。':'解集 = 特解 γ + 导出组的 '+free.length+' 维解空间（把子空间平移了 γ）。')+'</div>';
    h+='<div class="ctrl"><button class="btn sm rk" type="button">随机取一组 k 验证</button></div><div class="ss-chk small"></div>';
    o.innerHTML=h;
    if(ks){var x=gam.map(function(g,j){var s=homog?F(0):g;etas.forEach(function(e,i){s=s.add(F(ks[i]).mul(e[j]))});return s}),Ax=M.map(function(r){var s=F(0);for(var j=0;j<n;j++)s=s.add(r[j].mul(x[j]));return s}),ok=Ax.every(function(v,i){return v.eq(M[i][n])});
      $('.ss-chk',body).innerHTML=K(ks.map(function(k,i){return 'k_{'+(i+1)+'}='+k}).join(',\\ '))+' 时 '+K('x='+rv(x))+'，代入得 '+K('Ax='+rv(Ax))+' '+(ok?'<span class="ok">= β ✓</span>':'<span class="no">✗</span>')}
    fire(body);
  }
  function load(v){ks=null;ed=null;ed=new D.MatEd($('.ed',body),v.map(function(r){return r.map(String)}),function(m){M=m;ks=null;if(ed)draw()},{pm:true});draw()}
  body.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.dataset.p)load(PR[b.dataset.p][1]);else if(b.classList.contains('rk')){var n=M[0].length-1,R=rref(M),f=n-R.piv.filter(function(c){return c<n}).length;ks=[];for(var i=0;i<f;i++)ks.push(ri(-3,3));draw()}});
  load(PR.a[1]);
};

/* =============== §3.10 非齐次解集 = 特解 + 齐次解空间 =============== */
W.affine2d=function(el){
  var body=frame(el),b=4,g=[4,0],t=1;
  body.innerHTML='<div class="ctrl"><span>方程 '+K('x_1+2x_2=b')+'</span><label>b = <input type="range" class="br" min="-4" max="5" step="1" value="4"></label><b class="bv">4</b></div><div class="ctrl"><label>t = <input type="range" class="tr" min="-3" max="3" step="0.5" value="1"></label><b class="tv2">1</b></div><div class="w-grid"><div class="af-pl"></div><div class="af-out"></div></div><p class="tiny muted">拖动橙色点 γ（只能在解直线上滑动）：换一个特解，解集不变。</p>';
  var pl=Plane($('.af-pl',body),{R:6,size:300,snap:0.5,label:'非齐次方程组的解集'}),eta=[-2,1];
  function proj(x,y){var s=((x-b)*(-2)+y)/5;s=Math.round(s*2)/2;return [b-2*s,s]}
  function draw(){
    var p=[g[0]+t*eta[0],g[1]+t*eta[1]],G=pl.grid()+pl.line(-2,1,'span-l2')+pl.line(-2,1,'span-l',b,0);
    G+=pl.arrow(0,0,eta[0],eta[1],'vv')+pl.label(eta[0],eta[1],'η','tv')+pl.arrow(0,0,g[0],g[1],'v-w')+pl.arrow(g[0],g[1],p[0],p[1],'v-k')+'<circle class="dot" cx="'+pl.tx(p[0])+'" cy="'+pl.ty(p[1])+'" r="5"/>'+pl.label(p[0],p[1],'γ+tη','tk2')+pl.handle('g',g[0],g[1],'hw')+pl.label(g[0],g[1],'γ','tw');
    pl.svg.innerHTML=G;
    var f=function(v){return '('+v.map(function(x){return D.fnum(x,2)}).join(',\\ ')+')'};
    $('.af-out',body).innerHTML='<p>导出组 '+K('x_1+2x_2=0')+' 的解空间：过原点的直线（青色虚线），基础解系 '+K('\\eta=(-2,1)')+'，维数 n − r = 2 − 1 = 1。</p><p>'+(b===0?'b = 0：方程组本身就是齐次的，解集就是这条过原点的直线（一个子空间）。':'特解 '+K('\\gamma='+f(g))+'（满足 '+K(D.fnum(g[0],2)+'+2\\cdot'+D.fnum(g[1],2)+'='+b)+'）。')+'</p><p>全部解 '+K('x=\\gamma+t\\eta')+'：把解空间平移 γ 得到的直线（蓝色）。当前 t = '+t+'，'+K('x='+f(p))+'。</p>'+(b!==0?'<p class="small">b ≠ 0 时解集不过原点，<b>不是子空间</b>：两个解之和不再是解（和满足 '+K('x_1+2x_2=2b')+'），但两个解之差是导出组的解。</p>':'');
    fire(body);
  }
  pl.onmove=function(id,x,y){g=proj(x,y);draw()};
  body.addEventListener('input',function(e){if(e.target.classList.contains('br')){b=+e.target.value;$('.bv',body).textContent=b;g=[b,0];draw()}else if(e.target.classList.contains('tr')){t=+e.target.value;$('.tv2',body).textContent=t;draw()}});
  draw();
};

/* =============== 第三章综合练习：随机出题 =============== */
W.drill3=function(el){
  var body=frame(el);
  body.innerHTML='<div class="ctrl"><label>题型 <select class="ty">'+opt([['rank','求矩阵的秩'],['dim','齐次方程组解空间的维数'],['coord','向量在一组基下的坐标']],'rank')+'</select></label><button class="btn sm pri new" type="button">出一道题</button></div><div class="q"></div><div class="frow row"><input class="txt ans" placeholder="你的答案（可写 a/b）" autocomplete="off" aria-label="答案"><button class="btn sm pri chk" type="button">检查</button><button class="btn sm sol" type="button">看解答</button><span class="fmsg small"></span></div><div class="steps"></div><p class="small muted stat"></p>';
  var cur=null,tries=0,right=0;
  function rm(m,n,lo,hi){var a=[];for(var i=0;i<m;i++){a.push([]);for(var j=0;j<n;j++)a[i].push(F(ri(lo,hi)))}return a}
  function lowRank(m,n,r){for(var t=0;t<100;t++){var A=mm(rm(m,r,-2,2),rm(r,n,-2,2));if(rref(A).rank===r)return A}return rm(m,n,-2,2)}
  function gRank(){var r=ri(1,3),A=lowRank(3,4,r),R=rref(A);return {q:'<p class="small">求 r(A)：</p><div class="row">'+K('A=')+P(A)+'</div>',ans:F(R.rank),sol:'<p class="small">初等行变换化为简化阶梯形，数非零行：</p><div class="row">'+P(R.R,{cls:'sm',cell:function(i,j){return R.piv[i]===j?'pvt':''}})+'</div><p class="small">r(A) = '+R.rank+'；第 '+R.piv.map(function(c){return c+1}).join('、')+' 列是列向量组的极大无关组。</p>'}}
  function gDim(){var r=ri(1,3),A=lowRank(3,5,r),R=rref(A);return {q:'<p class="small">齐次方程组 Ax = 0 的解空间是几维的？</p><div class="row">'+K('A=')+P(A)+'</div>',ans:F(5-R.rank),sol:'<div class="row">'+P(R.R,{cls:'sm',cell:function(i,j){return R.piv[i]===j?'pvt':''}})+'</div><p class="small">r(A) = '+R.rank+'，未知数 n = 5，解空间维数 = n − r(A) = '+(5-R.rank)+'（基础解系含 '+(5-R.rank)+' 个向量）。</p>'}}
  function gCoord(){var Bm;for(var t=0;t<200;t++){Bm=rm(3,3,-1,2);var d=D.det(Bm);if(d.eq(1)||d.eq(-1))break}var mu=[F(ri(-2,2)),F(ri(-2,2)),F(ri(-2,2))],a=Bm.map(function(r){return r[0].mul(mu[0]).add(r[1].mul(mu[1])).add(r[2].mul(mu[2]))}),i=ri(0,2),fs=[0,1,2].map(function(j){return Bm.map(function(r){return r[j]})});
    return {q:'<p class="small">'+K('\\mathbb K^3')+' 的一组基 '+K('f_1='+rv(fs[0])+',\\ f_2='+rv(fs[1])+',\\ f_3='+rv(fs[2]))+'。求 '+K('\\alpha='+rv(a))+' 在这组基下的第 '+(i+1)+' 个坐标。</p>',ans:mu[i],sol:'<p class="small">解方程组 '+K('x_1f_1+x_2f_2+x_3f_3=\\alpha')+'，即 '+K(X.texM(Bm)+'x='+cv(a))+'，得 '+K('x='+cv(mu))+'。所以 '+K('\\alpha='+comb(mu,['f_1','f_2','f_3'],true))+'，第 '+(i+1)+' 个坐标是 '+mu[i].tex()+'。</p>'}}
  function gen(){var t=$('.ty',body).value;cur=t==='rank'?gRank():t==='dim'?gDim():gCoord();$('.q',body).innerHTML=cur.q;$('.steps',body).innerHTML='';$('.fmsg',body).innerHTML='';$('.ans',body).value='';fire(body)}
  function check(){var v=D.parseFr($('.ans',body).value),m=$('.fmsg',body);if(!v){m.innerHTML='<span class="muted">请输入一个数</span>';return}tries++;var ok=v.eq(cur.ans);if(ok)right++;m.innerHTML=ok?'<span class="ok">正确</span>':'<span class="no">不对，再算一遍或看解答</span>';$('.stat',body).textContent='本次已检查 '+tries+' 次，答对 '+right+' 次。'}
  $('.new',body).addEventListener('click',gen);
  $('.ty',body).addEventListener('change',function(e){e.stopPropagation();gen()});
  $('.chk',body).addEventListener('click',check);$('.ans',body).addEventListener('keydown',function(e){if(e.key==='Enter')check()});
  $('.sol',body).addEventListener('click',function(){$('.steps',body).innerHTML=cur.sol;fire(body)});
  gen();
};
})();
