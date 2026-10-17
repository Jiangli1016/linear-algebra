/* 互动组件（四）：第二章新概念的理解实验 */
(function(){
'use strict';
var D=window.D,W=window.WIDGETS,F=D.F,K=D.K,$=D.$,$$=D.$$,esc=D.esc,frame=D.frame,opt=D.opt,idxOpts=D.idxOpts,X=D.mx,P=X.P,mm=X.mm;
function strM(M){return M.map(function(r){return r.map(function(x){return x.toString()})})}
function fire(el){el.dispatchEvent(new Event('change',{bubbles:true}))}
function clone(M){return M.map(function(r){return r.slice()})}
function btns(PR,attr){return Object.keys(PR).map(function(k){return '<button class="btn sm" type="button" data-'+attr+'="'+k+'">'+PR[k][0]+'</button>'}).join('')}
function resizeV(v,m,n){var a=[];for(var i=0;i<m;i++){a.push([]);for(var j=0;j<n;j++)a[i].push(v&&v[i]&&v[i][j]!==undefined?v[i][j]:'0')}return a}

/* =============== §2.1 特殊矩阵识别器 =============== */
W.mtypes=function(el){
  var body=frame(el);
  var PR={o:['零矩阵',[[0,0,0],[0,0,0]]],i:['单位阵',[[1,0,0],[0,1,0],[0,0,1]]],s:['数量阵',[[3,0,0],[0,3,0],[0,0,3]]],d:['对角阵',[[2,0,0],[0,-1,0],[0,0,5]]],u:['上三角',[[1,2,3],[0,4,5],[0,0,6]]],l:['下三角',[[1,0,0],[2,3,0],[4,5,6]]],sy:['对称阵',[[1,1,0],[1,3,5],[0,5,-1]]],k:['反对称阵',[[0,2,1],[-2,0,-5],[-1,5,0]]],r:['行向量',[[1,0,4]]],c:['列向量',[[1],[1],[0]]]};
  body.innerHTML='<div class="ctrl">'+btns(PR,'p')+'</div><div class="ctrl"><label>大小 <select class="m">'+opt(['1','2','3','4'],'3')+'</select> × <select class="n">'+opt(['1','2','3','4'],'3')+'</select></label><span class="small muted">改任何一个数，判断会立即更新</span></div><div class="row">'+K('A=')+'<span class="ed"></span></div><div class="mt-chips"></div><div class="mt-why small"></div><p class="small muted" style="margin:.5rem 0 .2rem">包含关系（深色 = A 属于这一类）：</p><ol class="flow mt-flow"></ol>';
  var A=null,ed,sel='diag',vals=PR.d[1].map(function(r){return r.map(String)});
  function cells(f){var c=[];for(var i=0;i<A.length;i++)for(var j=0;j<A[0].length;j++)if(f(i,j))c.push([i,j]);return c}
  function nm(c){return '('+(c[0]+1)+', '+(c[1]+1)+')'}
  function T(){
    var m=A.length,n=A[0].length,sq=m===n,z=function(i,j){return A[i][j].isZero()};
    var notSq={ok:false,msg:'不是方阵（'+m+' ≠ '+n+'），这一类只对方阵定义。',cells:[]};
    function res(c,msgOk,msgBad){return c.length?{ok:false,msg:msgBad(c),cells:c}:{ok:true,msg:msgOk,cells:[]}}
    var t={};
    t.sq=sq?{ok:true,msg:'行数 = 列数 = '+m+'，是 '+m+' 阶方阵。',cells:[]}:{ok:false,msg:'行数 '+m+' ≠ 列数 '+n+'，是长方阵。',cells:[]};
    t.zero=res(cells(function(i,j){return !z(i,j)}),'所有元素都是 0：这是 '+m+'×'+n+' 零矩阵 O。',function(c){return nm(c[0])+' 元不为 0（共 '+c.length+' 个非零元）。'});
    t.row=m===1?{ok:true,msg:'只有 1 行：'+n+' 维行向量。',cells:[]}:{ok:false,msg:'有 '+m+' 行，不是行向量。',cells:[]};
    t.col=n===1?{ok:true,msg:'只有 1 列：'+m+' 维列向量。',cells:[]}:{ok:false,msg:'有 '+n+' 列，不是列向量。',cells:[]};
    if(!sq){['diag','scal','unit','up','lo','sym','skew'].forEach(function(k){t[k]=notSq});return t}
    t.up=res(cells(function(i,j){return i>j&&!z(i,j)}),'主对角线以下全为 0。',function(c){return '主对角线以下的 '+nm(c[0])+' 元不为 0。'});
    t.lo=res(cells(function(i,j){return i<j&&!z(i,j)}),'主对角线以上全为 0。',function(c){return '主对角线以上的 '+nm(c[0])+' 元不为 0。'});
    t.diag=res(cells(function(i,j){return i!==j&&!z(i,j)}),'非对角元全为 0：既是上三角阵，也是下三角阵。',function(c){return '非对角元 '+nm(c[0])+' 不为 0。'});
    if(t.diag.ok){
      t.scal=res(cells(function(i,j){return i===j&&!A[i][j].eq(A[0][0])}),'对角元全相等，A = '+A[0][0].toString()+'·I。',function(c){return '对角元不全相等：'+nm(c[0])+' 元 ≠ (1, 1) 元。'});
      t.unit=t.scal.ok?(A[0][0].eq(1)?{ok:true,msg:'对角元全为 1：A = I。',cells:[]}:{ok:false,msg:'对角元都是 '+A[0][0].toString()+'，不是 1。',cells:cells(function(i,j){return i===j})}):{ok:false,msg:'连数量阵都不是。',cells:t.scal.cells};
    }else{t.scal={ok:false,msg:'先要是对角阵：'+t.diag.msg,cells:t.diag.cells};t.unit=t.scal}
    t.sym=res(cells(function(i,j){return i!==j&&!A[i][j].eq(A[j][i])}),'对每个 i, j 都有 aᵢⱼ = aⱼᵢ：关于主对角线对称，A′ = A。',function(c){return nm(c[0])+' 元与 '+nm([c[0][1],c[0][0]])+' 元不相等。'});
    t.skew=res(cells(function(i,j){return !A[i][j].eq(A[j][i].neg())}),'aᵢⱼ = −aⱼᵢ，对角元全为 0：A′ = −A。',function(c){return c[0][0]===c[0][1]?'对角元 '+nm(c[0])+' 不为 0（反对称阵的对角元必须是 0）。':nm(c[0])+' 元不等于 '+nm([c[0][1],c[0][0]])+' 元的相反数。'});
    return t;
  }
  var NAMES=[['sq','方阵'],['zero','零矩阵'],['row','行向量'],['col','列向量'],['diag','对角阵'],['scal','数量阵'],['unit','单位阵'],['up','上三角'],['lo','下三角'],['sym','对称阵'],['skew','反对称阵']];
  function draw(){
    var why=$('.mt-why',body);
    if(!A){why.innerHTML=D.BAD;return}
    var t=T();
    $('.mt-chips',body).innerHTML=NAMES.map(function(p){var r=t[p[0]];return '<button type="button" class="chip-b '+(r.ok?'ok':'no')+(p[0]===sel?' sel':'')+'" data-k="'+p[0]+'">'+(r.ok?'✓ ':'✗ ')+p[1]+'</button>'}).join('');
    var r=t[sel],nmS=NAMES.filter(function(p){return p[0]===sel})[0][1];
    why.innerHTML='<b>'+nmS+'？</b>'+(r.ok?'<span class="ok"> 是。</span>':'<span class="no"> 不是。</span>')+esc(r.msg)+(r.cells.length?' <span class="muted">（黄色标出相关位置）</span>':'');
    ed.mark(function(i,j){return r.cells.some(function(c){return c[0]===i&&c[1]===j})});
    var chain=[['unit','单位阵'],['scal','数量阵'],['diag','对角阵'],['up','上三角阵'],['sq','方阵']];
    $('.mt-flow',body).innerHTML=chain.map(function(c,k){return (k?'<li class="arr">⊂</li>':'')+'<li class="'+(t[c[0]].ok?'key':'')+'">'+c[1]+'</li>'}).join('');
    fire(body);
  }
  function load(v){vals=v.map(function(r){return r.map(String)});$('.m',body).value=vals.length;$('.n',body).value=vals[0].length;ed=null;ed=new D.MatEd($('.ed',body),vals,function(M){A=M;if(ed)draw()},{pm:true});draw()}
  body.addEventListener('click',function(e){
    var c=e.target.closest('.chip-b');if(c){sel=c.dataset.k;draw();return}
    var b=e.target.closest('button[data-p]');if(b)load(PR[b.dataset.p][1]);
  });
  body.addEventListener('change',function(e){var s=e.target;if(!s.matches||!s.matches('select'))return;e.stopPropagation();load(resizeV(ed.vals,+$('.m',body).value,+$('.n',body).value))});
  ed=null;load(PR.d[1]);
};

/* =============== 平面变换绘图（§2.2、§2.3 共用） =============== */
var SHAPE=[[0,0],[0,2],[1.4,2],[1.4,1.55],[0.5,1.55],[0.5,1.15],[1.1,1.15],[1.1,0.75],[0.5,0.75],[0.5,0]];
var TR={R:['旋转 90°',[['0','-1'],['1','0']]],F:['关于 x 轴反射',[['1','0'],['0','-1']]],S:['水平错切',[['1','1'],['0','1']]],C:['伸缩',[['2','0'],['0','1/2']]],Y:['关于 y = x 反射',[['0','1'],['1','0']]],J:['投影到 x 轴',[['1','0'],['0','0']]]};
function ap(M,p){return [M[0][0].val()*p[0]+M[0][1].val()*p[1],M[1][0].val()*p[0]+M[1][1].val()*p[1]]}
function plane(M,cap,o){
  o=o||{};var S=20,R=3.5,c=R*S,w=2*c,tx=function(x){return (c+x*S).toFixed(1)},ty=function(y){return (c-y*S).toFixed(1)};
  var g='';for(var k=-3;k<=3;k++)g+='<line class="grid" x1="'+tx(k)+'" y1="0" x2="'+tx(k)+'" y2="'+w+'"/><line class="grid" x1="0" y1="'+ty(k)+'" x2="'+w+'" y2="'+ty(k)+'"/>';
  g+='<line class="axis" x1="0" y1="'+c+'" x2="'+w+'" y2="'+c+'"/><line class="axis" x1="'+c+'" y1="0" x2="'+c+'" y2="'+w+'"/>';
  var Mx=M||X.eye(2),d=D.det(Mx),cls=d.isZero()?'area-zero':d.val()>0?'area-pos':'area-neg';
  if(o.ghost)g+='<polygon class="pl-ghost" points="'+SHAPE.map(function(p){return tx(p[0])+','+ty(p[1])}).join(' ')+'"/>';
  g+='<polygon class="'+cls+'" points="'+SHAPE.map(function(p){var q=ap(Mx,p);return tx(q[0])+','+ty(q[1])}).join(' ')+'"/>';
  var e1=ap(Mx,[1,0]),e2=ap(Mx,[0,1]);
  g+='<line class="vu" x1="'+c+'" y1="'+c+'" x2="'+tx(e1[0])+'" y2="'+ty(e1[1])+'"/><line class="vv" x1="'+c+'" y1="'+c+'" x2="'+tx(e2[0])+'" y2="'+ty(e2[1])+'"/>';
  return '<figure class="pf"><svg class="plot" viewBox="0 0 '+w+' '+w+'" role="img" aria-label="'+esc(cap.replace(/<[^>]+>/g,''))+'">'+g+'</svg><figcaption class="small">'+cap+'</figcaption></figure>';
}
var LEG='<p class="tiny muted">蓝线：e₁ 的像（矩阵第 1 列）；青线：e₂ 的像（矩阵第 2 列）。图形变成红色表示被“翻面”（行列式为负），虚线表示被压扁（行列式为 0）。</p>';

/* =============== §2.2 乘法 = 变换的复合；幂 =============== */
W.compose=function(el){
  var body=frame(el),pow=el.dataset.mode==='pow',A=null,B=null,ea,eb,k=4;
  if(pow){
    body.innerHTML='<div class="ctrl">A：'+btns(TR,'a')+'</div><div class="row">'+K('A=')+'<span class="ea"></span></div><div class="ctrl"><label>k = <input type="range" class="kr" min="0" max="12" value="4"></label><b class="kv">4</b></div><div class="cp-out"></div>'+LEG;
  }else{
    body.innerHTML='<div class="ctrl">A：'+btns(TR,'a')+'</div><div class="ctrl">B：'+btns(TR,'b')+'</div><div class="row cp-in"><span class="p4-g">'+K('A=')+'<span class="ea"></span></span><span class="p4-g">'+K('B=')+'<span class="eb"></span></span></div><div class="cp-out"></div>'+LEG;
  }
  function powM(M,n){var R=X.eye(2);for(var t=0;t<n;t++)R=mm(R,M);return R}
  function draw(){
    var o=$('.cp-out',body);
    if(!A||(!pow&&!B)){o.innerHTML=D.BAD;return}
    if(pow){
      var Ak=powM(A,k),h='<div class="pf-row">'+plane(null,'原图形')+'<span class="dp-ar">'+K('A^{'+k+'}')+' →</span>'+plane(Ak,K('A^{'+k+'}x'),{ghost:true})+'</div>';
      h+='<div class="row"><span class="p4-g">'+K('A^{'+k+'}=')+P(Ak,{cls:'sm'})+'</span><span class="small">——把 A 这个变换连续做 '+k+' 次。</span></div>';
      var per=0;for(var t=1;t<=12;t++){if(X.meq(powM(A,t),X.eye(2))){per=t;break}}
      if(per) h+='<div class="ok-note">'+K('A^{'+per+'}=I')+'：做 '+per+' 次回到原样，所以 '+K('A^{k}')+' 以 '+per+' 为周期重复。</div>';
      else if(X.meq(mm(A,A),A)) h+='<div class="ok-note">'+K('A^2=A')+'（幂等阵）：投影做一次和做多次效果一样，所以 '+K('A^k=A')+'。统计中的“帽子矩阵” '+K("H=X(X'X)^{-1}X'")+' 就是这种矩阵。</div>';
      else h+='<p class="small muted">拖动 k 观察规律：错切 '+K('A^k=\\begin{pmatrix}1&k\\\\0&1\\end{pmatrix}')+'，伸缩 '+K('A^k=\\mathrm{diag}\\{2^k,2^{-k}\\}')+'。</p>';
      o.innerHTML=h;fire(body);return;
    }
    var AB=mm(A,B),BA=mm(B,A),eq=X.meq(AB,BA);
    var h2='<p class="small"><b>先 B 后 A</b>：'+K('x\\mapsto A(Bx)=(AB)x')+'</p><div class="pf-row">'+plane(null,'原图形')+'<span class="dp-ar">B →</span>'+plane(B,K('Bx'))+'<span class="dp-ar">A →</span>'+plane(AB,K('(AB)x'))+'</div>';
    h2+='<p class="small"><b>先 A 后 B</b>：'+K('x\\mapsto B(Ax)=(BA)x')+'</p><div class="pf-row">'+plane(null,'原图形')+'<span class="dp-ar">A →</span>'+plane(A,K('Ax'))+'<span class="dp-ar">B →</span>'+plane(BA,K('(BA)x'))+'</div>';
    h2+='<div class="row"><span class="p4-g">'+K('AB=')+P(AB,{cls:'sm'})+'</span><span class="p4-g">'+K('BA=')+P(BA,{cls:'sm'})+'</span><span class="chip '+(eq?'pos':'neg')+'">'+(eq?'这一对可交换：AB = BA':'AB ≠ BA：先后顺序不同，结果不同')+'</span></div>';
    h2+='<p class="small muted">为什么乘法要“行乘列”？因为 (AB)x = A(Bx)：AB 的第 j 列 = A 乘 B 的第 j 列，正是“先做 B 再做 A”把 eⱼ 送到的位置。矩阵乘法就是变换的复合，而先穿袜子再穿鞋 ≠ 先穿鞋再穿袜子。</p>';
    o.innerHTML=h2;fire(body);
  }
  function build(va,vb){A=B=null;ea=null;eb=null;ea=new D.MatEd($('.ea',body),va,function(m){A=m;if(ea&&(pow||eb))draw()},{pm:true});if(!pow)eb=new D.MatEd($('.eb',body),vb,function(m){B=m;if(ea&&eb)draw()},{pm:true});draw()}
  var va=TR.R[1],vb=TR.F[1];
  body.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.dataset.a){va=TR[b.dataset.a][1];if(pow)build(va);else{ea.set(va)}}else if(b.dataset.b){vb=TR[b.dataset.b][1];eb.set(vb)}});
  if(pow)body.addEventListener('input',function(e){if(e.target.classList.contains('kr')){k=+e.target.value;$('.kv',body).textContent=k;draw()}});
  build(pow?TR.R[1]:va,vb);
};

/* =============== §2.3 逆矩阵 = 撤销变换 =============== */
W.invgeo=function(el){
  var body=frame(el),A=null,ea,bk='R';
  var PR={S:TR.S,C:TR.C,R:TR.R,J:TR.J,K:['压成直线',[['2','4'],['1','2']]]};
  body.innerHTML='<div class="ctrl">A：'+btns(PR,'a')+'</div><div class="row">'+K('A=')+'<span class="ea"></span></div><div class="ig-1"></div><h4 class="ig-h">两步变换怎样撤销？</h4><div class="ctrl">第二个变换 B：'+btns({R:TR.R,F:TR.F,S:TR.S,C:TR.C},'b')+'</div><div class="ig-2"></div>'+LEG;
  function kernel(M){var a=M[0][0],b=M[0][1],c=M[1][0],d=M[1][1];if(!a.isZero()||!b.isZero())return [b.neg(),a];if(!c.isZero()||!d.isZero())return [d.neg(),c];return [F(1),F(0)]}
  function draw(){
    var o=$('.ig-1',body),o2=$('.ig-2',body);if(!A){o.innerHTML=D.BAD;o2.innerHTML='';return}
    var d=D.det(A),Ai=d.isZero()?null:X.inv(A),h;
    if(Ai){
      h='<div class="pf-row">'+plane(null,'原图形')+'<span class="dp-ar">A →</span>'+plane(A,K('Ax'))+'<span class="dp-ar">'+K('A^{-1}')+' →</span>'+plane(mm(Ai,A),K('A^{-1}(Ax)=x'))+'</div>';
      h+='<div class="row"><span class="p4-g">'+K('|A|='+d.tex()+'\\ne0,\\quad A^{-1}=')+P(Ai,{cls:'sm'})+'</span></div><p class="small">做完 A 再做 '+K('A^{-1}')+'，每个点都回到原处，即 '+K('A^{-1}A=I')+'；反过来 '+K('AA^{-1}=I')+' 表示“先撤销再做”也回到原处。</p>';
    }else{
      var v=kernel(A),vt='\\begin{pmatrix}'+v[0].tex()+'\\\\'+v[1].tex()+'\\end{pmatrix}';
      h='<div class="pf-row">'+plane(null,'原图形')+'<span class="dp-ar">A →</span>'+plane(A,K('Ax')+'：被压扁')+'</div>';
      h+='<div class="err-note">'+K('|A|=0')+'：整个平面被压到一条直线（或一点）上。例如 '+K('A'+vt+'=\\begin{pmatrix}0\\\\0\\end{pmatrix}=A\\begin{pmatrix}0\\\\0\\end{pmatrix}')+'——两个不同的点被送到同一个点，没有任何变换能把它们“分开还原”，所以 A 没有逆矩阵。</div>';
    }
    o.innerHTML=h;
    var Bv=TR[bk][1].map(function(r){return r.map(function(x){return D.parseFr(x)})});
    if(!Ai){o2.innerHTML='<p class="small muted">A 不可逆时无法撤销，请先选一个可逆的 A。</p>';fire(body);return}
    var Bi=X.inv(Bv),AB=mm(A,Bv),good=mm(mm(Bi,Ai),AB),bad=mm(mm(Ai,Bi),AB),badOk=X.meq(bad,X.eye(2));
    var h2='<p class="small">先做 B 再做 A，得到 '+K('ABx')+'。撤销时要<b>先撤销最后做的 A</b>，再撤销 B：</p><div class="pf-row">'+plane(AB,K('(AB)x'),{ghost:true})+'<span class="dp-ar">'+K('B^{-1}A^{-1}')+' →</span>'+plane(good,'回到原图 ✓')+'<span class="dp-ar">'+K('A^{-1}B^{-1}')+' →</span>'+plane(bad,badOk?'这一对恰好也回到原图':'没有回到原图 ✗',{ghost:true})+'</div>';
    h2+='<p class="small">所以 '+K('(AB)^{-1}=B^{-1}A^{-1}')+'：脱鞋袜要按“先脱鞋、后脱袜”的反序。</p>';
    o2.innerHTML=h2;fire(body);
  }
  body.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.dataset.a)ea.set(PR[b.dataset.a][1]);else if(b.dataset.b){bk=b.dataset.b;draw()}});
  ea=null;ea=new D.MatEd($('.ea',body),TR.S[1],function(m){A=m;if(ea)draw()},{pm:true});draw();
};

/* =============== §2.2 对称 + 反对称分解 =============== */
W.symdec=function(el){
  var body=frame(el),A=null,ed;
  body.innerHTML='<div class="ctrl"><label>阶数 <select class="n">'+opt(['2','3','4'],'3')+'</select></label><button class="btn sm rnd" type="button">随机</button></div><div class="row">'+K('A=')+'<span class="ed"></span></div><div class="sd-out"></div>';
  function draw(){
    var o=$('.sd-out',body);if(!A){o.innerHTML=D.BAD;return}
    var At=D.transpose(A),S=X.msc(X.madd(A,At),F(1).div(2)),Kk=X.msc(X.madd(A,At,-1),F(1).div(2));
    var sym=function(i,j){return i===j?'':i<j?'mk':'ra'};
    o.innerHTML='<div class="nc-grid"><div><div class="tiny muted">'+K("S=\\tfrac12(A+A')")+'　对称</div>'+P(S,{cell:sym})+'</div><div><div class="tiny muted">'+K("K=\\tfrac12(A-A')")+'　反对称</div>'+P(Kk,{cell:sym})+'</div></div>'+
      '<p class="small"><span class="chip pos">'+"S′ = S ✓"+'</span><span class="chip pos">'+"K′ = −K ✓"+'</span><span class="chip '+(X.meq(X.madd(S,Kk),A)?'pos':'neg')+'">S + K = A ✓</span></p><p class="small muted">黄色与蓝色是关于主对角线对称的位置：S 中两者相等，K 中两者互为相反数，K 的对角线全为 0。S 的对角线就是 A 的对角线。</p>';
    fire(body);
  }
  function load(v){ed=null;ed=new D.MatEd($('.ed',body),v,function(m){A=m;if(ed)draw()},{pm:true});draw()}
  function rnd(){return D.randM(+$('.n',body).value,-3,5).map(function(r){return r.map(String)})}
  body.addEventListener('click',function(e){if(e.target.closest('.rnd'))load(rnd())});
  body.addEventListener('change',function(e){if(e.target.classList&&e.target.classList.contains('n')){e.stopPropagation();load(rnd())}});
  load([[1,2,0],[4,3,-1],[2,5,2]]);
};

/* =============== §2.6（§2.2 引用）按列、按行看乘积 =============== */
W.colview=function(el){
  var body=frame(el),A=null,B=null,ea,eb,mode=el.dataset.mode||'col',pick=0;
  body.innerHTML='<div class="ctrl"><label>看法 <select class="md">'+opt([['col','按列：AB 的第 j 列 = A·(B 的第 j 列)'],['row','按行：AB 的第 i 行 = (A 的第 i 行)·B']],mode)+'</select></label><button class="btn sm rnd" type="button">换一组数</button></div><div class="row cb-in"><span class="p4-g">'+K('A=')+'<span class="ea"></span></span><span class="p4-g">'+K('B=')+'<span class="eb"></span></span></div><div class="cv-out"></div>';
  function col(M,j){return '\\begin{pmatrix}'+M.map(function(r){return r[j].tex()}).join('\\\\')+'\\end{pmatrix}'}
  function row(M,i){return '('+M[i].map(function(x){return x.tex()}).join(',\\ ')+')'}
  function cf(x){return x.val()<0?'('+x.tex()+')':x.tex()}
  function draw(){
    var o=$('.cv-out',body);if(!A||!B){o.innerHTML=D.BAD;return}
    var C=mm(A,B),n=A.length,h;pick=Math.min(pick,n-1);
    if(mode==='col'){
      h='<div class="row el-eq">'+P(A)+'<span>·</span>'+P(B,{cell:function(i,j){return j===pick?'mk':''}})+'<span>=</span>'+D.matHTML(C,{cls:'pm click',cell:function(i,j){return j===pick?'on':''}})+'</div>';
      h+='<p class="small">点 AB 的任一列。第 '+(pick+1)+' 列 = A 乘 B 的第 '+(pick+1)+' 列 = <b>A 的各列的组合</b>，系数是 B 第 '+(pick+1)+' 列的元素：</p>';
      h+='<div class="scroll-x">'+K(A[0].map(function(_,r){return cf(B[r][pick])+col(A,r)}).join('+')+'='+col(C,pick),true)+'</div>';
      h+='<p class="small muted">所以 '+K('AB=(A\\beta_1,A\\beta_2,\\dots)')+'；特别地 '+K('Ax=x_1a_1+\\cdots+x_na_n')+'。右乘一个矩阵，只是把 A 的列重新组合——这就是“列变换 = 右乘”的原因。</p>';
    }else{
      h='<div class="row el-eq">'+P(A,{cell:function(i){return i===pick?'mk':''}})+'<span>·</span>'+P(B)+'<span>=</span>'+D.matHTML(C,{cls:'pm click',cell:function(i){return i===pick?'on':''}})+'</div>';
      h+='<p class="small">点 AB 的任一行。第 '+(pick+1)+' 行 = A 的第 '+(pick+1)+' 行乘 B = <b>B 的各行的组合</b>，系数是 A 第 '+(pick+1)+' 行的元素：</p>';
      h+='<div class="scroll-x">'+K(B.map(function(_,r){return cf(A[pick][r])+row(B,r)}).join('+')+'='+row(C,pick),true)+'</div>';
      h+='<p class="small muted">左乘一个矩阵，结果的每一行都是 B 的各行的组合——这就是“行变换 = 左乘”（定理 2.4.3）的原因。例如左乘 '+K('T_{13}(c)')+'，第 3 行变成 c × 第 1 行 + 第 3 行。</p>';
    }
    o.innerHTML=h;fire(body);
  }
  function load(a,b){A=B=null;ea=eb=null;ea=new D.MatEd($('.ea',body),a,function(m){A=m;if(ea&&eb)draw()},{pm:true});eb=new D.MatEd($('.eb',body),b,function(m){B=m;if(ea&&eb)draw()},{pm:true});draw()}
  body.addEventListener('click',function(e){var c=e.target.closest('.cv-out .click .c');if(c){pick=mode==='col'?+c.dataset.j:+c.dataset.i;draw();return}if(e.target.closest('.rnd'))load(D.randM(3,-2,3).map(function(r){return r.map(String)}),D.randM(3,-2,3).map(function(r){return r.map(String)}))});
  body.addEventListener('change',function(e){if(e.target.classList&&e.target.classList.contains('md')){e.stopPropagation();mode=e.target.value;pick=0;draw()}});
  load([[1,2,0],[0,1,-1],[3,0,2]],[[2,1,0],[-1,0,1],[1,3,2]]);
};

/* =============== §2.4 动手消元：方程组 ⟷ 增广矩阵 ⟷ 左乘初等矩阵 =============== */
function eqTex(r){var s='',first=true;for(var j=0;j<r.length-1;j++){var c=r[j];if(c.isZero())continue;var neg=c.val()<0,ab=neg?c.neg():c;s+=(neg?'-':(first?'':'+'))+(ab.eq(1)?'':ab.tex())+'x_'+(j+1);first=false}return (first?'0':s)+'='+r[r.length-1].tex()}
function lead(r,n){for(var j=0;j<n;j++)if(!r[j].isZero())return j;return Infinity}
function isEch(M,n){var k=-1;for(var i=0;i<M.length;i++){var l=lead(M[i],n);if(l===Infinity){for(var t=i+1;t<M.length;t++)if(lead(M[t],n)!==Infinity)return false;return true}if(l<=k)return false;k=l}return true}
function isRref(M,n){if(!isEch(M,n))return false;for(var i=0;i<M.length;i++){var l=lead(M[i],n);if(l===Infinity)continue;if(!M[i][l].eq(1))return false;for(var t=0;t<M.length;t++)if(t!==i&&!M[t][l].isZero())return false}return true}
function elemM(n,op){var E=X.eye(n);if(op.t==='P'){var t=E[op.i];E[op.i]=E[op.j];E[op.j]=t}else if(op.t==='D'){E[op.i][op.i]=op.c}else{E[op.j][op.i]=op.c}return E}
function opName(op){return op.t==='P'?'P_{'+(op.i+1)+(op.j+1)+'}':op.t==='D'?'P_{'+(op.i+1)+'}('+op.c.tex()+')':'T_{'+(op.i+1)+(op.j+1)+'}('+op.c.tex()+')'}
function opInv(op){return op.t==='P'?op:op.t==='D'?{t:'D',i:op.i,c:F(1).div(op.c)}:{t:'T',i:op.i,j:op.j,c:op.c.neg()}}
function opDesc(op){return op.t==='P'?'交换第 '+(op.i+1)+'、'+(op.j+1)+' 行':op.t==='D'?'第 '+(op.i+1)+' 行乘 '+K(op.c.tex()):'第 '+(op.i+1)+' 行乘 '+K(op.c.tex())+' 加到第 '+(op.j+1)+' 行'}
D.ops={elemM:elemM,opName:opName,opInv:opInv,opDesc:opDesc,isEch:isEch,isRref:isRref,lead:lead};

W.elimlab=function(el){
  var body=frame(el);
  var PR={a:['例 2.4.1',[[0,1,1,2],[2,3,2,5],[3,1,-1,-1]]],b:['习题 2.3 第 2 题',[[1,-1,3,8],[2,-1,4,11],[-1,2,-4,-11]]],c:['无解的方程组',[[1,1,1,1],[1,2,3,2],[2,3,4,4]]]};
  body.innerHTML='<div class="ctrl">'+btns(PR,'p')+'<button class="btn sm rnd" type="button">随机方程组</button></div>'+
    '<div class="ctrl el-ops"><select class="ty" aria-label="变换类型">'+opt([['P','第一类：交换两行'],['D','第二类：某行乘 c（c ≠ 0）'],['T','第三类：第 i 行乘 c 加到第 j 行']],'T')+'</select><label>i <select class="oi">'+idxOpts(3,0)+'</select></label><label class="lj">j <select class="oj">'+idxOpts(3,1)+'</select></label><label class="lc">c <input class="num oc" value="1" aria-label="c"></label></div>'+
    '<div class="btns"><button class="btn sm pri go" type="button">执行这一步</button><button class="btn sm hint" type="button">提示下一步</button><button class="btn sm undo" type="button">撤销</button><button class="btn sm reset" type="button">重来</button></div>'+
    '<div class="el-msg small"></div><div class="w-grid el-view"><div><div class="tiny muted">增广矩阵 '+K('(A\\mid\\beta)')+'</div><div class="el-M scroll-x"></div></div><div><div class="tiny muted">对应的方程组</div><div class="el-eq scroll-x"></div></div></div><div class="el-st"></div><div class="el-acc small"></div><ol class="el-log small"></ol>';
  var M0,M,hist,log,Pacc,last=[];
  function load(v){M0=D.toM(v);M=clone(M0);hist=[];log=[];Pacc=X.eye(3);last=[];$('.el-msg',body).innerHTML='';draw()}
  function vis(){var t=$('.ty',body).value;$('.lj',body).hidden=t==='D';$('.lc',body).hidden=t==='P'}
  function draw(){
    $('.el-M',body).innerHTML=D.matHTML(M,{cls:'pm aug',cell:function(i,j){var c=[];if(j===3)c.push('divl');if(last.indexOf(i)>=0)c.push('mk');return c.join(' ')}});
    $('.el-eq',body).innerHTML=K('\\begin{cases}'+M.map(eqTex).join('\\\\')+'\\end{cases}',true);
    var st='',bad=M.some(function(r){return lead(r,3)===Infinity&&!r[3].isZero()});
    if(bad) st='<div class="err-note">出现了 “0 = 非零数” 的方程：方程组<b>无解</b>（增广矩阵的阶梯形中出现 (0, 0, 0 | b)，b ≠ 0）。</div>';
    else if(isRref(M,3)&&M.every(function(r,i){return lead(r,3)===i})) st='<div class="ok-note">已化为简化阶梯形，左边是 I：解为 '+K(M.map(function(r,i){return 'x_'+(i+1)+'='+r[3].tex()}).join(',\\ '))+'。</div>';
    else if(isRref(M,3)) st='<div class="ok-note">已是简化阶梯形，但有零行：方程组有无穷多解（第三章讨论）。</div>';
    else if(isEch(M,3)) st='<p class="small"><span class="chip pos">已是阶梯形</span> 消元阶段完成，可以从最后一个方程回代；继续用行变换化为简化阶梯形，就是“回代”的矩阵写法。</p>';
    $('.el-st',body).innerHTML=st;
    $('.el-acc',body).innerHTML=log.length?'<p>累计左乘的矩阵 '+K('P=E_{'+log.length+'}\\cdots E_1=')+P(Pacc,{cls:'sm'})+'，验证 '+K('P\\,(A\\mid\\beta)_{\\text{原}}=')+'当前矩阵 <span class="ok">'+(X.meq(mm(Pacc,M0),M)?'✓':'✗')+'</span>'+(isRref(M,3)&&M.every(function(r,i){return lead(r,3)===i})?'。<b>此时 P 正是 A⁻¹</b>：§2.5 的求逆方法就来自这里。':'')+'</p>':'<p class="muted">每执行一步，都相当于左乘一个初等矩阵；这里会显示它们的乘积。</p>';
    $('.el-log',body).innerHTML=log.map(function(op,k){return '<li>'+opDesc(op)+'　⟺　左乘 '+K('E_{'+(k+1)+'}='+opName(op))+'</li>'}).join('');
    fire(body);
  }
  function doOp(op){
    var E=elemM(3,op);hist.push({M:M,P:Pacc});M=mm(E,M);Pacc=mm(E,Pacc);log.push(op);last=op.t==='P'?[op.i,op.j]:op.t==='D'?[op.i]:[op.j];$('.el-msg',body).innerHTML='';draw();
  }
  function readOp(){
    var t=$('.ty',body).value,i=+$('.oi',body).value,j=+$('.oj',body).value,c=D.parseFr($('.oc',body).value),m=$('.el-msg',body);
    if(t!=='D'&&i===j){m.innerHTML='<span class="no">i 与 j 必须不同。</span>';return null}
    if(t!=='P'&&!c){m.innerHTML='<span class="no">c 需要是整数、小数或分数。</span>';return null}
    if(t==='D'&&c.isZero()){m.innerHTML='<span class="no">第二类变换要求 c ≠ 0：乘 0 会丢掉一个方程，无法撤销。</span>';return null}
    return {t:t,i:i,j:j,c:c};
  }
  function hint(){
    var r=0;
    for(var c=0;c<3&&r<3;c++){
      var p=-1;for(var i=r;i<3;i++)if(!M[i][c].isZero()){if(p<0)p=i;if(M[i][c].eq(1)||M[i][c].eq(-1)){p=i;break}}
      if(p<0)continue;
      if(M[r][c].isZero()||(p!==r&&!(M[r][c].eq(1)||M[r][c].eq(-1))&&(M[p][c].eq(1)||M[p][c].eq(-1))))return {t:'P',i:r,j:p,c:F(1)};
      for(i=0;i<3;i++)if(i!==r&&!M[i][c].isZero())return {t:'T',i:r,j:i,c:M[i][c].div(M[r][c]).neg()};
      if(!M[r][c].eq(1))return {t:'D',i:r,c:F(1).div(M[r][c])};
      r++;
    }
    return null;
  }
  function rnd(){for(var t=0;t<200;t++){var A=D.randM(3,-3,3),d=D.det(A);if(!d.isZero()){var x=[D.randInt(-3,3),D.randInt(-3,3),D.randInt(-3,3)];return A.map(function(r){var b=F(0);r.forEach(function(a,j){b=b.add(a.mul(x[j]))});return r.map(String).concat([b.toString()])})}}}
  body.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;
    if(b.dataset.p)load(PR[b.dataset.p][1]);
    else if(b.classList.contains('rnd'))load(rnd());
    else if(b.classList.contains('go')){var op=readOp();if(op)doOp(op)}
    else if(b.classList.contains('undo')){if(hist.length){var h=hist.pop();M=h.M;Pacc=h.P;log.pop();last=[];draw()}}
    else if(b.classList.contains('reset')){load(strM(M0))}
    else if(b.classList.contains('hint')){var o=hint(),m=$('.el-msg',body);if(!o){m.innerHTML='已经化到最简，不需要再变换了。';return}
      $('.ty',body).value=o.t;$('.oi',body).value=o.i;if(o.t!=='D')$('.oj',body).value=o.j;$('.oc',body).value=o.c.toString();vis();
      m.innerHTML='建议：'+opDesc(o)+'（已填入上面的选项，点“执行这一步”）';}
  });
  body.addEventListener('change',function(e){if(e.target.classList&&e.target.classList.contains('ty')){e.stopPropagation();vis()}});
  vis();load(PR.a[1]);
};

/* =============== §2.4 阶梯形判定器 =============== */
W.echcheck=function(el){
  var body=frame(el),A=null,ed;
  var PR={e1:['阶梯形 ①',[[2,1,0,3],[0,0,-1,1],[0,0,0,5]]],e2:['阶梯形 ②',[[1,2,0],[0,3,1],[0,0,0]]],z:['零行在上',[[1,2,0],[0,0,0],[0,1,1]]],s:['阶梯点同列',[[1,2,0],[0,3,1],[0,4,1]]],r:['简化阶梯形',[[1,0,2,0],[0,1,-1,0],[0,0,0,1]]],x:['例 2.4.3 的结果',[[-1,-4,5],[0,2,-4],[0,0,0],[0,0,0],[0,0,0]]]};
  body.innerHTML='<div class="ctrl">'+btns(PR,'p')+'</div><div class="ctrl"><label>大小 <select class="m">'+opt(['2','3','4','5'],'3')+'</select> × <select class="n">'+opt(['2','3','4','5'],'4')+'</select></label></div><div class="row">'+K('A=')+'<span class="ed"></span></div><div class="ec-out"></div>';
  function draw(){
    var o=$('.ec-out',body);if(!A){o.innerHTML=D.BAD;return}
    var m=A.length,n=A[0].length,ks=A.map(function(r){return lead(r,n)}),bad=-1,why='';
    for(var i=0;i<m-1;i++){
      if(ks[i]===Infinity&&ks[i+1]!==Infinity){bad=i+1;why='第 '+(i+1)+' 行是零行，却在非零的第 '+(i+2)+' 行上方（零行必须放在最下面）。';break}
      if(ks[i]!==Infinity&&ks[i+1]!==Infinity&&ks[i+1]<=ks[i]){bad=i+1;why='第 '+(i+2)+' 行的阶梯点在第 '+(ks[i+1]+1)+' 列，没有比第 '+(i+1)+' 行的阶梯点（第 '+(ks[i]+1)+' 列）更靠右。';break}
    }
    var r=ks.filter(function(k){return k!==Infinity}).length;
    var h='<div class="row">'+D.matHTML(A,{cls:'pm',cell:function(i,j){var c=[];if(ks[i]===j)c.push('pvt');if(i===bad)c.push('mk');return c.join(' ')}})+'<div class="tw"><table class="t small"><tr><th>行</th><th>第一个非零元的列标 '+K('k_i')+'</th></tr>'+ks.map(function(k,i){return '<tr'+(i===bad?' class="sum"':'')+'><td>'+(i+1)+'</td><td>'+(k===Infinity?K('+\\infty')+'（零行）':k+1)+'</td></tr>'}).join('')+'</table></div></div>';
    if(bad<0){
      h+='<div class="ok-note">是阶梯形：'+K('k_1\\lt k_2\\lt\\cdots')+' 严格递增，零行都在最下面。非零行 r = '+r+' 个，蓝框是阶梯点。</div>';
      var rr='';for(i=0;i<m&&!rr;i++){if(ks[i]===Infinity)break;if(!A[i][ks[i]].eq(1))rr='第 '+(i+1)+' 行的阶梯点是 '+A[i][ks[i]].toString()+'，不是 1。';else for(var t=0;t<m;t++)if(t!==i&&!A[t][ks[i]].isZero()){rr='第 '+(i+1)+' 个阶梯点所在的第 '+(ks[i]+1)+' 列中，第 '+(t+1)+' 行还有非零元。';break}}
      h+=rr?'<p class="small">不是简化阶梯形：'+rr+'</p>':'<p class="small"><span class="chip pos">还是简化阶梯形</span> 阶梯点都是 1，且阶梯点所在列的其余元素都是 0。</p>';
    }else h+='<div class="err-note">不是阶梯形：'+why+'</div>';
    o.innerHTML=h;fire(body);
  }
  function load(v){$('.m',body).value=v.length;$('.n',body).value=v[0].length;ed=null;ed=new D.MatEd($('.ed',body),v.map(function(r){return r.map(String)}),function(M){A=M;if(ed)draw()},{pm:true});draw()}
  body.addEventListener('click',function(e){var b=e.target.closest('button[data-p]');if(b)load(PR[b.dataset.p][1])});
  body.addEventListener('change',function(e){var s=e.target;if(!s.matches||!s.matches('select'))return;e.stopPropagation();load(resizeV(ed.vals,+$('.m',body).value,+$('.n',body).value))});
  load(PR.e1[1]);
};

/* =============== §2.5 非异阵 = 初等矩阵之积；|AB| = |A||B| =============== */
W.factor=function(el){
  var body=frame(el),A=null,B=null,ea,eb;
  var PR={a:['二阶',[[2,5],[1,3]]],b:['例 2.5.3',[[1,2,3],[2,1,2],[1,3,4]]],c:['含对调',[[0,2],[3,1]]],s:['奇异阵',[[1,2],[2,4]]]};
  body.innerHTML='<div class="ctrl">'+btns(PR,'p')+'<button class="btn sm rnd" type="button">随机可逆 3 阶</button></div><div class="row cb-in"><span class="p4-g">'+K('A=')+'<span class="ea"></span></span><span class="p4-g">'+K('B=')+'<span class="eb"></span></span></div><div class="fa-out"></div>';
  function decompose(A0){
    var M=clone(A0),n=M.length,ops=[];
    function act(op){M=mm(elemM(n,op),M);ops.push(op)}
    for(var c=0;c<n;c++){
      var p=-1;for(var r=c;r<n;r++)if(!M[r][c].isZero()){p=r;break}
      if(p<0)return {ok:false,ops:ops,M:M,col:c};
      if(p!==c)act({t:'P',i:c,j:p});
      if(!M[c][c].eq(1))act({t:'D',i:c,c:F(1).div(M[c][c])});
      for(r=0;r<n;r++)if(r!==c&&!M[r][c].isZero())act({t:'T',i:c,j:r,c:M[r][c].neg()});
    }
    return {ok:true,ops:ops,M:M};
  }
  function draw(){
    var o=$('.fa-out',body);if(!A||!B){o.innerHTML=D.BAD;return}
    var n=A.length,res=decompose(A),h='<p class="small">① 只用初等行变换把 A 化为 I（引理 2.5.1），每一步记下对应的初等矩阵：</p><ol class="small fa-log">'+res.ops.map(function(op,k){return '<li>'+opDesc(op)+'：'+K('E_{'+(k+1)+'}='+opName(op))+'，'+K('|E_{'+(k+1)+'}|='+D.det(elemM(n,op)).tex())+'</li>'}).join('')+'</ol>';
    if(!res.ok){
      h+='<div class="err-note">第 '+(res.col+1)+' 列从第 '+(res.col+1)+' 行往下全是 0，化不成 I：A 是奇异阵，不能写成初等矩阵之积。此时 '+K('|A|='+D.det(A).tex())+'，而且 '+K('|AB|='+D.det(mm(A,B)).tex()+'=|A||B|')+'（定理 2.5.2 的“A 奇异”情形）。</div>';
      o.innerHTML=h;fire(body);return;
    }
    var m=res.ops.length,inv=res.ops.map(opInv),prod=X.eye(n);inv.forEach(function(op){prod=mm(prod,elemM(n,op))});
    h+='<p class="small">② 于是 '+K('E_{'+m+'}\\cdots E_2E_1A=I')+'，两边依次左乘逆矩阵：'+K('A=E_1^{-1}E_2^{-1}\\cdots E_{'+m+'}^{-1}')+'——<b>非异阵 = 初等矩阵之积</b>（推论 2.5.1）：</p>';
    h+='<div class="fa-row">'+inv.map(function(op,k){return '<div class="fa-e"><div class="tiny">'+K('E_{'+(k+1)+'}^{-1}='+opName(op))+'</div>'+P(elemM(n,op),{cls:'sm'})+'<div class="tiny muted">行列式 '+K(D.det(elemM(n,op)).tex())+'</div></div>'}).join('<span class="dp-ar">·</span>')+'<span class="dp-ar">=</span>'+P(prod,{cls:'sm'})+'<span class="ok">'+(X.meq(prod,A)?'= A ✓':'✗')+'</span></div>';
    var dets=inv.map(function(op){return D.det(elemM(n,op))}),dA=dets.reduce(function(a,b){return a.mul(b)},F(1)),dB=D.det(B),dAB=D.det(mm(A,B));
    h+='<p class="small">③ 每乘一个初等矩阵，行列式就乘它的行列式（引理 2.5.2）：'+K('|A|='+dets.map(D.pt).join('\\cdot')+'='+dA.tex())+'（直接计算 '+K('|A|='+D.det(A).tex())+' ✓）。</p>';
    h+='<p class="small">④ 对 AB 同样逐个提出：'+K('|AB|=|E_1^{-1}|\\cdots|E_{'+m+'}^{-1}|\\,|B|=|A|\\,|B|='+D.pt(dA)+'\\cdot'+D.pt(dB)+'='+dA.mul(dB).tex())+'；直接计算 '+K('|AB|='+dAB.tex())+' <span class="ok">'+(dAB.eq(dA.mul(dB))?'✓':'✗')+'</span>。这就是定理 2.5.2 的证明思路。</p>';
    o.innerHTML=h;fire(body);
  }
  function load(a){var n=a.length,bM;for(var t=0;t<100;t++){bM=D.randM(n,-2,3);if(!D.det(bM).isZero())break}var b=strM(bM);A=B=null;ea=eb=null;ea=new D.MatEd($('.ea',body),a.map(function(r){return r.map(String)}),function(m){A=m;if(ea&&eb)draw()},{pm:true});eb=new D.MatEd($('.eb',body),b,function(m){B=m;if(ea&&eb)draw()},{pm:true});draw()}
  function rnd(){for(var t=0;t<300;t++){var M=D.randM(3,-2,3),d=D.det(M);if(!d.isZero()&&Math.abs(d.val())<=3)return strM(M)}return [[1,0,0],[0,1,0],[0,0,1]]}
  body.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.dataset.p)load(PR[b.dataset.p][1]);else if(b.classList.contains('rnd'))load(rnd())});
  load(PR.a[1]);
};
})();
