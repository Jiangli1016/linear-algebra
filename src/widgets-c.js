/* 互动组件（三）：第二章 矩阵 */
(function(){
'use strict';
var D=window.D,W=window.WIDGETS,F=D.F,Fr=D.Fr,fmt=D.fmt,K=D.K,T=D.T,$=D.$,$$=D.$$,esc=D.esc,frame=D.frame,opt=D.opt,idxOpts=D.idxOpts;

/* ---------- 矩阵工具（精确分数） ---------- */
function zeros(m,n){var a=[];for(var i=0;i<m;i++){a.push([]);for(var j=0;j<n;j++)a[i].push(F(0))}return a}
function eye(n){var a=zeros(n,n);for(var i=0;i<n;i++)a[i][i]=F(1);return a}
function mm(A,B){
  if(!A.length||!B.length||A[0].length!==B.length) return null;
  var m=A.length,k=B.length,n=B[0].length,C=zeros(m,n);
  for(var i=0;i<m;i++)for(var j=0;j<n;j++){var s=F(0);for(var r=0;r<k;r++)s=s.add(A[i][r].mul(B[r][j]));C[i][j]=s}
  return C;
}
function madd(A,B,c){c=c===undefined?F(1):F(c);return A.map(function(r,i){return r.map(function(x,j){return x.add(B[i][j].mul(c))})})}
function msc(A,c){return A.map(function(r){return r.map(function(x){return x.mul(c)})})}
function tr(A){return D.transpose(A)}
function meq(A,B){if(!A||!B||A.length!==B.length||A[0].length!==B[0].length)return false;for(var i=0;i<A.length;i++)for(var j=0;j<A[0].length;j++)if(!A[i][j].eq(B[i][j]))return false;return true}
function isZero(A){return A.every(function(r){return r.every(function(x){return x.isZero()})})}
function inv(A){
  var n=A.length,M=A.map(function(r,i){return r.concat(eye(n)[i])});
  for(var c=0;c<n;c++){
    var p=-1;for(var r=c;r<n;r++)if(!M[r][c].isZero()){p=r;break}
    if(p<0) return null;
    var t=M[c];M[c]=M[p];M[p]=t;var pv=M[c][c];M[c]=M[c].map(function(x){return x.div(pv)});
    for(r=0;r<n;r++)if(r!==c&&!M[r][c].isZero()){var f=M[r][c];M[r]=M[r].map(function(x,j){return x.sub(f.mul(M[c][j]))})}
  }
  return M.map(function(r){return r.slice(n)});
}
function cofM(A){var n=A.length;return A.map(function(r,i){return r.map(function(_,j){var m=n===1?F(1):D.det(D.minorOf(A,i,j));return (i+j)%2?m.neg():m})})}
function P(M,o){o=o||{};return D.matHTML(M,{cls:'pm '+(o.cls||''),cell:o.cell,show:o.show})}
function texM(M,env){return '\\begin{'+(env||'pmatrix')+'}'+M.map(function(r){return r.map(function(x){return x instanceof Fr?x.tex():String(x)}).join('&')}).join('\\\\')+'\\end{'+(env||'pmatrix')+'}'}
function resize(vals,m,n,fill){var a=[];for(var i=0;i<m;i++){a.push([]);for(var j=0;j<n;j++){var v=vals&&vals[i]&&vals[i][j]!==undefined?vals[i][j]:(fill?fill(i,j):D.randInt(-3,4));a[i].push(v)}}return a}
function strM(M){return M.map(function(r){return r.map(function(x){return x.toString()})})}
function fnum(x,dp){return D.fnum(x,dp===undefined?3:dp)}
D.mx={zeros:zeros,eye:eye,mm:mm,madd:madd,msc:msc,inv:inv,cofM:cofM,meq:meq,P:P,texM:texM};

/* ---------- 第二章导引：矩阵乘法“行乘列”自动演示 ---------- */
W.hero2=function(el){
  var A=D.toM([[1,0,1],[2,1,0]]),B=D.toM([[1,0,1,1],[1,1,2,-1],[-1,0,-1,0]]),C=mm(A,B),k=0,timer=0,hold=false;
  el.innerHTML='<div class="h2-wrap"><div class="h2-row"><span class="h2-lab">A<sub>2×3</sub></span><span class="h2-a"></span><span class="h2-lab">B<sub>3×4</sub></span><span class="h2-b"></span></div><div class="h2-row"><span class="h2-lab">= AB<sub>2×4</sub></span><span class="h2-c"></span></div><div class="h2-f small"></div><p class="tiny muted" style="text-align:center;margin:.3rem 0 0">例 2.2.1 · 点击 AB 的任一元素可固定查看</p></div>';
  function draw(){
    var i=Math.floor(k/4),j=k%4;
    $('.h2-a',el).innerHTML=P(A,{cell:function(r){return r===i?'ra':''}});
    $('.h2-b',el).innerHTML=P(B,{cell:function(r,c){return c===j?'mk':''}});
    $('.h2-c',el).innerHTML=D.matHTML(C,{cls:'pm click',cell:function(r,c){return r===i&&c===j?'on':(r<i||(r===i&&c<j))?'':'h2-dim'}});
    var t=A[i].map(function(x,r){return D.pt(x)+'\\cdot'+D.pt(B[r][j])}).join('+');
    $('.h2-f',el).innerHTML=K('c_{'+(i+1)+(j+1)+'}='+t+'='+C[i][j].tex());
  }
  function tick(){if(!hold&&document.body.contains(el)){k=(k+1)%8;draw()}else if(!document.body.contains(el))clearInterval(timer)}
  el.addEventListener('click',function(e){var c=e.target.closest('.h2-c .c');if(!c)return;k=(+c.dataset.i)*4+(+c.dataset.j);hold=true;draw()});
  el.addEventListener('mouseleave',function(){hold=false});
  draw();
  if(!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)) timer=setInterval(tick,1600);
};

/* ---------- §2.2 矩阵乘法：尺寸检查 + 行乘列 ---------- */
W.matmul=function(el){
  var body=frame(el);
  var PR={ex1:['例 2.2.1',[[1,0,1],[2,1,0]],[[1,0,1,1],[1,1,2,-1],[-1,0,-1,0]]],ex2:['例 2.2.2 行×列',[[1,0,4]],[[1],[1],[0]]],ex2b:['例 2.2.2 列×行',[[1],[1],[0]],[[1,0,4]]],ex3:['习题 2.2 第 3 题',[[1,0,3],[2,-1,0]],[[1,-1],[2,3],[4,0]]],bad:['尺寸不合',[[1,2],[3,4]],[[1,0,2],[0,1,1],[2,1,0]]]};
  body.innerHTML='<div class="ctrl mm-pre">'+Object.keys(PR).map(function(k){return '<button class="btn sm" data-p="'+k+'">'+PR[k][0]+'</button>'}).join('')+'<button class="btn sm rnd">随机</button><button class="btn sm sw">交换顺序（看 BA）</button></div>'+
    '<div class="ctrl">A：<select class="am">'+opt(['1','2','3','4'],'2')+'</select>×<select class="ak">'+opt(['1','2','3','4'],'3')+'</select>　B：<select class="bk">'+opt(['1','2','3','4'],'3')+'</select>×<select class="bn">'+opt(['1','2','3','4'],'4')+'</select></div>'+
    '<div class="mm-dims"></div><div class="mm-grid"><div><div class="tiny muted">A</div><div class="ea"></div></div><div><div class="tiny muted">B</div><div class="eb"></div></div><div class="mm-res"><div class="tiny muted">AB（点任一元素）</div><div class="ec"></div></div></div><div class="mm-f"></div>';
  var va=[[1,0,1],[2,1,0]],vb=[[1,0,1,1],[1,1,2,-1],[-1,0,-1,0]],A=null,B=null,si=0,sj=0,ea,eb;
  function dims(){return [+$('.am',body).value,+$('.ak',body).value,+$('.bk',body).value,+$('.bn',body).value]}
  function setDims(a,b){$('.am',body).value=a.length;$('.ak',body).value=a[0].length;$('.bk',body).value=b.length;$('.bn',body).value=b[0].length}
  function build(){
    ea=eb=null;A=B=null;
    ea=new D.MatEd($('.ea',body),va,function(m){A=m;if(m)va=strM(m);calc()},{pm:true});
    eb=new D.MatEd($('.eb',body),vb,function(m){B=m;if(m)vb=strM(m);calc()},{pm:true});
    calc();
  }
  function calc(){
    if(!ea||!eb) return;
    var d=dims(),ok=d[1]===d[2];
    $('.mm-dims',body).innerHTML='<span class="mm-d">('+d[0]+' × <b class="'+(ok?'ok':'no')+'">'+d[1]+'</b>)</span><span class="mm-d">(<b class="'+(ok?'ok':'no')+'">'+d[2]+'</b> × '+d[3]+')</span><span class="mm-arrow">→</span>'+(ok?'<span class="mm-d ok">'+d[0]+' × '+d[3]+'</span><span class="small muted">内维相等，外维保留</span>':'<span class="mm-d no">无意义</span><span class="small no">A 的列数 '+d[1]+' ≠ B 的行数 '+d[2]+'</span>');
    var ec=$('.ec',body),f=$('.mm-f',body);
    if(!ok||!A||!B){ec.innerHTML=ok?D.BAD:'<p class="no small">内维不等，AB 没有定义。</p>';f.innerHTML='';ea.mark(function(){return false});eb.mark(function(){return false});body.dispatchEvent(new Event('change',{bubbles:true}));return}
    var C=mm(A,B);if(!C||C.length!==d[0]||C[0].length!==d[3]){ec.innerHTML=D.BAD;return}si=Math.min(si,d[0]-1);sj=Math.min(sj,d[3]-1);
    ec.innerHTML=D.matHTML(C,{cls:'pm click',cell:function(i,j){return i===si&&j===sj?'on':''}});
    ea.mark(function(i){return i===si});eb.mark(function(i,j){return j===sj});
    var t=A[si].map(function(x,r){return D.pt(x)+'\\cdot'+D.pt(B[r][sj])}).join('+');
    f.innerHTML='<p class="small">'+K('c_{'+(si+1)+(sj+1)+'}')+' = A 的第 '+(si+1)+' 行 × B 的第 '+(sj+1)+' 列：'+K('='+t+'='+C[si][sj].tex())+'</p>';
  }
  body.addEventListener('click',function(e){
    var c=e.target.closest('.ec .c');if(c){si=+c.dataset.i;sj=+c.dataset.j;calc();return}
    var b=e.target.closest('button');if(!b)return;
    if(b.dataset.p){var p=PR[b.dataset.p];va=p[1].map(function(r){return r.map(String)});vb=p[2].map(function(r){return r.map(String)});setDims(va,vb);si=sj=0;build()}
    else if(b.classList.contains('rnd')){var d=dims();va=resize(null,d[0],d[1]);vb=resize(null,d[1],d[3]);$('.bk',body).value=d[1];build()}
    else if(b.classList.contains('sw')){var t=va;va=vb;vb=t;setDims(va,vb);si=sj=0;build()}
  });
  body.addEventListener('change',function(e){
    var s=e.target;if(!s.matches||!s.matches('select'))return;var d=dims();
    va=resize(va,d[0],d[1]);vb=resize(vb,d[2],d[3]);build();
  });
  build();
};

/* ---------- §2.2 AB 与 BA：不交换、零因子、二项式 ---------- */
W.noncomm=function(el){
  var body=frame(el);
  var PR={z:['例 2.2.3：AB = O',[[0,0],[0,1]],[[0,1],[0,0]]],g:['一般的两个矩阵',[[1,2],[3,4]],[[0,1],[1,0]]],c:['可交换的一对',[[1,2],[0,1]],[[1,3],[0,1]]],s:['与数量矩阵',[[1,2],[3,4]],[[2,0],[0,2]]],t:['三阶',[[1,0,0],[0,1,0],[3,1,1]],[[1,0,0],[2,1,0],[0,0,1]]]};
  body.innerHTML='<div class="ctrl">'+Object.keys(PR).map(function(k){return '<button class="btn sm" data-p="'+k+'">'+PR[k][0]+'</button>'}).join('')+'<button class="btn sm rnd">随机 2 阶</button></div>'+
    '<div class="row nc-in"><span class="p4-g">'+K('A=')+'<span class="ea"></span></span><span class="p4-g">'+K('B=')+'<span class="eb"></span></span></div><div class="nc-out"></div>';
  var va=PR.z[1],vb=PR.z[2],A=null,B=null,ready=false;
  function build(){ready=false;A=B=null;new D.MatEd($('.ea',body),va,function(m){A=m;calc()},{pm:true});new D.MatEd($('.eb',body),vb,function(m){B=m;calc()},{pm:true});ready=true;calc()}
  function calc(){
    if(!ready)return;
    var o=$('.nc-out',body);if(!A||!B||A.length!==B.length){o.innerHTML=D.BAD;return}
    var AB=mm(A,B),BA=mm(B,A),eq=meq(AB,BA),S=madd(A,B),S2=mm(S,S),bin=madd(madd(mm(A,A),AB,2),mm(B,B)),diff=madd(S2,bin,-1);
    var h='<div class="nc-grid"><div><div class="tiny muted">AB</div>'+P(AB)+'</div><div><div class="tiny muted">BA</div>'+P(BA)+'</div><div><div class="tiny muted">AB − BA</div>'+P(madd(AB,BA,-1))+'</div></div>';
    h+='<div class="row" style="gap:.4rem;margin:.4rem 0"><span class="chip '+(eq?'pos':'neg')+'">'+(eq?'AB = BA：可交换':'AB ≠ BA')+'</span>'+(isZero(AB)?'<span class="chip neg">AB = O，但 A ≠ O、B ≠ O</span>':'')+(isZero(BA)&&!isZero(A)&&!isZero(B)?'<span class="chip neg">BA = O</span>':'')+'</div>';
    h+='<p class="small">'+K('(A+B)^2-(A^2+2AB+B^2)=BA-AB=')+P(diff,{cls:'sm'})+(isZero(diff)?' <span class="ok">二项式展开成立</span>':' <span class="no">普通的完全平方公式不成立</span>')+'</p>';
    if(isZero(AB)&&!isZero(A)&&!isZero(B)) h+='<div class="err-note">两个非零矩阵的乘积可以是零矩阵，所以“AB = O ⇒ A = O 或 B = O”不成立，消去律也不能随便用。</div>';
    o.innerHTML=h;body.dispatchEvent(new Event('change',{bubbles:true}));
  }
  body.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.dataset.p){va=PR[b.dataset.p][1];vb=PR[b.dataset.p][2]}else{va=resize(null,2,2);vb=resize(null,2,2)}build()});
  build();
};

/* ---------- §2.2 (AB)' = B'A' ---------- */
W.transp=function(el){
  var body=frame(el);
  body.innerHTML='<div class="ctrl"><button class="btn sm pri rnd">换一组数</button><label><input type="checkbox" class="sq"> 用 2 阶方阵</label></div><div class="row nc-in"><span class="p4-g">'+K('A=')+'<span class="ea"></span></span><span class="p4-g">'+K('B=')+'<span class="eb"></span></span></div><div class="tp-out"></div>';
  var A,B;
  function gen(){var sq=$('.sq',body).checked;A=D.randM(2,-2,4);if(!sq){A=D.toM(resize(null,2,3))}B=D.toM(resize(null,sq?2:3,2));draw()}
  function draw(){
    $('.ea',body).innerHTML=P(A);$('.eb',body).innerHTML=P(B);
    var X=tr(mm(A,B)),Y=mm(tr(B),tr(A)),Z=mm(tr(A),tr(B));
    var h='<div class="nc-grid"><div><div class="tiny muted">(AB)′ · '+X.length+'×'+X[0].length+'</div>'+P(X)+'</div><div><div class="tiny muted">B′A′ · '+Y.length+'×'+Y[0].length+'</div>'+P(Y)+'</div><div><div class="tiny muted">A′B′ · '+Z.length+'×'+Z[0].length+'</div>'+P(Z)+'</div></div>';
    h+='<p class="small"><span class="chip pos">(AB)′ = B′A′ ✓</span> '+(meq(X,Z)?'<span class="chip">这一组恰好 A′B′ 也相等</span>':'<span class="chip neg">(AB)′ ≠ A′B′'+(X.length!==Z.length?'：连尺寸都不同':'')+'</span>')+'</p>';
    h+='<p class="small muted">理由：(AB)′ 的 (j,i) 元 = AB 的 (i,j) 元 = A 的第 i 行 · B 的第 j 列 = B′ 的第 j 行 · A′ 的第 i 列 = B′A′ 的 (j,i) 元。</p>';
    $('.tp-out',body).innerHTML=h;body.dispatchEvent(new Event('change',{bubbles:true}));
  }
  body.addEventListener('click',function(e){if(e.target.closest('.rnd'))gen()});
  $('.sq',body).addEventListener('change',function(e){e.stopPropagation();gen()});
  A=D.toM([[1,0,3],[2,-1,0]]);B=D.toM([[1,-1],[2,3],[4,0]]);draw();
};

/* ---------- §2.2 统计视角：转移矩阵的幂（马尔可夫链） ---------- */
W.markov=function(el){
  var body=frame(el),S=['晴','阴','雨'];
  var Pm=[[0.7,0.2,0.1],[0.3,0.4,0.3],[0.2,0.3,0.5]],pi0=[1,0,0],k=1;
  body.innerHTML='<div class="w-grid"><div><p class="small">转移矩阵 '+K('P')+'：第 i 行是“今天为状态 i，明天各状态的概率”，每行之和为 1。</p><div class="mk-p"></div><div class="ctrl">今天：<select class="s0">'+opt([[0,'晴'],[1,'阴'],[2,'雨']],0)+'</select></div><div class="ctrl"><label>天数 k = <input type="range" class="kr" min="0" max="20" value="1"></label><b class="kv"></b></div></div><div><div class="mk-pk"></div><div class="mk-bar"></div><p class="small muted mk-n"></p></div></div>';
  function pow(M,n){var R=[[1,0,0],[0,1,0],[0,0,1]];for(var t=0;t<n;t++){R=R.map(function(r){return [0,1,2].map(function(j){return r[0]*M[0][j]+r[1]*M[1][j]+r[2]*M[2][j]})})}return R}
  function show(M){return D.matHTML(M,{cls:'pm sm',show:function(v){return fnum(v,3)}})}
  function draw(){
    $('.mk-p',body).innerHTML='<div class="row">'+K('P=')+show(Pm)+'<span class="tiny muted">行：今天　列：明天<br>（晴、阴、雨）</span></div>';
    var Pk=pow(Pm,k),s=+$('.s0',body).value,pi=Pk[s];
    $('.kv',body).textContent=k;
    $('.mk-pk',body).innerHTML='<div class="row">'+K('P^{'+k+'}=')+show(Pk)+'</div>';
    $('.mk-bar',body).innerHTML='<p class="small">今天'+S[s]+'，'+k+' 天后的分布 = '+K('P^{'+k+'}')+' 的第 '+(s+1)+' 行：</p>'+pi.map(function(p,i){return '<div class="mk-r"><span>'+S[i]+'</span><span class="mk-b"><i style="width:'+(p*100).toFixed(1)+'%"></i></span><b>'+fnum(p,3)+'</b></div>'}).join('');
    $('.mk-n',body).textContent=k>=10?'k 较大时 Pᵏ 的三行几乎相同：无论今天是什么天气，很多天以后的分布都趋于同一个“平稳分布”（第六章用特征值解释）。':'拖动 k，观察 Pᵏ 的各行如何越来越接近。';
    body.dispatchEvent(new Event('change',{bubbles:true}));
  }
  body.addEventListener('input',function(e){if(e.target.classList.contains('kr')){k=+e.target.value;draw()}});
  body.addEventListener('change',function(e){if(e.target.classList.contains('s0'))draw()});
  draw();
};
})();
;(function(){
'use strict';
var D=window.D,W=window.WIDGETS,F=D.F,Fr=D.Fr,fmt=D.fmt,K=D.K,$=D.$,$$=D.$$,esc=D.esc,frame=D.frame,opt=D.opt,idxOpts=D.idxOpts,X=D.mx,P=X.P,mm=X.mm;

/* ---------- §2.3 伴随矩阵与逆矩阵 ---------- */
W.adjinv=function(el){
  var body=frame(el);
  var PR={a:['习题 2.3 第 1(1) 题',[[1,1,-1],[1,2,-3],[0,1,1]]],b:['例 2.5.3 的矩阵',[[1,2,3],[2,1,2],[1,3,4]]],c:['二阶',[[2,5],[1,3]]],d:['奇异阵',[[1,2,3],[2,4,6],[1,0,1]]]};
  body.innerHTML='<div class="ctrl">'+Object.keys(PR).map(function(k){return '<button class="btn sm" data-p="'+k+'">'+PR[k][0]+'</button>'}).join('')+'<label>阶数 <select class="n">'+opt(['2','3','4'],'3')+'</select></label><button class="btn sm rnd">随机</button></div>'+
    '<div class="w-grid"><div><div class="row">'+K('A=')+'<span class="ed"></span></div><div class="aj-cof"></div></div><div><div class="aj-adj"></div><div class="aj-info"></div></div></div><div class="aj-out"></div>';
  var A=null,ed,pick=[0,1];
  function load(v){ed=new D.MatEd($('.ed',body),v,function(m){A=m;calc()},{pm:true})}
  function calc(){
    if(!A){$('.aj-out',body).innerHTML=D.BAD;return}
    var n=A.length,C=X.cofM(A),Adj=D.transpose(C),d=D.det(A),pi=Math.min(pick[0],n-1),pj=Math.min(pick[1],n-1);
    $('.aj-cof',body).innerHTML='<p class="small">① 代数余子式按原位置排成 '+K('(A_{ij})')+'：</p>'+P(C,{cls:'sm',cell:function(i,j){return i===pj&&j===pi?'mk':''}});
    $('.aj-adj',body).innerHTML='<p class="small">② <b>转置</b>得伴随矩阵 '+K('A^*')+'（点任一元素）：</p>'+D.matHTML(Adj,{cls:'pm sm click',cell:function(i,j){return i===pi&&j===pj?'on':''}});
    var mi=D.minorOf(A,pj,pi);
    $('.aj-info',body).innerHTML='<p class="small">'+K('A^*')+' 的 ('+(pi+1)+','+(pj+1)+') 元是 '+K('A_{'+(pj+1)+(pi+1)+'}')+'（下标反过来！）：划去 A 的第 '+(pj+1)+' 行、第 '+(pi+1)+' 列，'+K('A_{'+(pj+1)+(pi+1)+'}=(-1)^{'+(pi+pj+2)+'}'+(n>1?texM(mi,'vmatrix'):'1')+'='+Adj[pi][pj].tex())+'</p>';
    var AA=mm(A,Adj),h='<p class="small">③ '+K('AA^*=')+P(AA,{cls:'sm'})+K('=|A|\\,I_'+n+',\\quad |A|='+d.tex())+'</p>';
    if(d.isZero()) h+='<div class="err-note">|A| = 0：AA* = O，A 不可逆，绝不能写 A* / |A|。</div>';
    else{var Iv=X.msc(Adj,F(1).div(d));h+='<p class="small">④ '+K('A^{-1}=\\dfrac{1}{|A|}A^*=')+P(Iv,{cls:'sm'})+'　验算 '+K('AA^{-1}=I')+' <span class="ok">'+(X.meq(mm(A,Iv),X.eye(n))?'✓':'✗')+'</span></p>'}
    $('.aj-out',body).innerHTML=h;body.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function texM(M,env){return X.texM(M,env)}
  body.addEventListener('click',function(e){
    var c=e.target.closest('.aj-adj .c');if(c){pick=[+c.dataset.i,+c.dataset.j];calc();return}
    var b=e.target.closest('button');if(!b)return;
    if(b.dataset.p){var v=PR[b.dataset.p][1];$('.n',body).value=v.length;load(v)}else if(b.classList.contains('rnd'))load(D.randM(+$('.n',body).value,-3,4).map(function(r){return r.map(String)}));
  });
  body.addEventListener('change',function(e){if(e.target.classList&&e.target.classList.contains('n'))load(D.randM(+e.target.value,-3,4).map(function(r){return r.map(String)}))});
  load(PR.a[1]);
};

/* ---------- §2.4 初等矩阵：行左列右 ---------- */
W.elem=function(el){
  var body=frame(el),M=D.toM([[1,2,0,3],[2,-1,1,0],[0,3,2,1]]);
  body.innerHTML='<div class="ctrl"><label>类型 <select class="ty">'+opt([['P','第一类 Pᵢⱼ：交换'],['D','第二类 Pᵢ(c)：倍乘'],['T','第三类 Tᵢⱼ(c)：倍加']],'T')+'</select></label><label>作用在 <select class="sd">'+opt([['L','左边（行变换）'],['R','右边（列变换）']],'L')+'</select></label><span class="el-par"></span><button class="btn sm rnd">换一个 A</button></div><div class="el-out"></div>';
  var st={ty:'T',sd:'L',i:0,j:2,c:F(2)};
  function par(){
    var n=st.sd==='L'?3:4,h='i = <select class="pi">'+idxOpts(n,Math.min(st.i,n-1))+'</select>';
    if(st.ty!=='D') h+=' j = <select class="pj">'+idxOpts(n,Math.min(st.j,n-1))+'</select>';
    if(st.ty!=='P') h+=' c = <input class="num pc" value="'+esc(st.c.toString())+'" aria-label="c">';
    $('.el-par',body).innerHTML=h;
  }
  function E(n){
    var e=X.eye(n),i=Math.min(st.i,n-1),j=Math.min(st.j,n-1);
    if(st.ty==='P'){var t=e[i];e[i]=e[j];e[j]=t}else if(st.ty==='D'){e[i][i]=st.c}else{e[j][i]=st.c}
    return e;
  }
  function draw(){
    var n=st.sd==='L'?3:4,i=Math.min(st.i,n-1),j=Math.min(st.j,n-1),o=$('.el-out',body);
    if((st.ty!=='D')&&i===j){o.innerHTML='<p class="no small">请选择两个不同的下标 i ≠ j。</p>';return}
    if(st.ty==='D'&&st.c.isZero()){o.innerHTML='<p class="no small">第二类初等矩阵要求 c ≠ 0。</p>';return}
    var Em=E(n),R=st.sd==='L'?mm(Em,M):mm(M,Em),I1=i+1,J1=j+1,c=st.c.tex();
    var name=st.ty==='P'?'P_{'+I1+J1+'}':st.ty==='D'?'P_{'+I1+'}('+c+')':'T_{'+I1+J1+'}('+c+')';
    var L=st.sd==='L'?'行':'列',desc;
    if(st.ty==='P') desc='交换第 '+I1+'、'+J1+' '+L;
    else if(st.ty==='D') desc='第 '+I1+' '+L+'乘 '+K(c);
    else desc=st.sd==='L'?'第 '+I1+' 行乘 '+K(c)+' 加到第 '+J1+' 行':'第 '+J1+' 列乘 '+K(c)+' 加到第 '+I1+' 列';
    var chg=function(r,cc){if(st.sd==='L'){return (st.ty==='P'&&(r===i||r===j))||(st.ty==='D'&&r===i)||(st.ty==='T'&&r===j)?'mk':''}return (st.ty==='P'&&(cc===i||cc===j))||(st.ty==='D'&&cc===i)||(st.ty==='T'&&cc===i)?'mk':''};
    var eH=P(Em,{cls:'sm',cell:function(r,cc){return Em[r][cc].eq(r===cc?F(1):F(0))?'':'ra'}});
    var h='<div class="row el-eq">'+(st.sd==='L'?'<span class="p4-g">'+K(name+'=')+eH+'</span><span>·</span>'+P(M):P(M)+'<span>·</span><span class="p4-g">'+K(name+'=')+eH+'</span>')+'<span>=</span>'+P(R,{cell:chg})+'</div>';
    h+='<p class="small"><b>'+(st.sd==='L'?'左乘':'右乘')+'</b> '+K(name)+'（'+n+' 阶）= 对 A <b>'+desc+'</b>（黄色）。'+K(name)+' 本身就是对 '+K('I_'+n)+' 做同样变换得到的（蓝色是与单位阵不同的位置）。</p>';
    var Ei=X.inv(Em),inN=st.ty==='P'?name:st.ty==='D'?'P_{'+I1+'}('+F(1).div(st.c).tex()+')':'T_{'+I1+J1+'}('+st.c.neg().tex()+')';
    h+='<p class="small">'+K(name+'^{-1}='+inN)+'，'+K('|'+name+'|='+D.det(Em).tex())+'。逆变换把这一步“撤销”，仍是同类初等矩阵。</p>';
    if(st.ty==='T') h+='<p class="tiny muted">约定（与教材一致）：'+K('T_{ij}(c)')+' 是把 '+K('I_n')+' 的第 i 行乘 c 加到第 j 行，即 (j, i) 位置为 c；它右乘时是把第 j 列乘 c 加到第 i 列。</p>';
    o.innerHTML=h;body.dispatchEvent(new Event('change',{bubbles:true}));
  }
  body.addEventListener('change',function(e){
    var t=e.target;if(!t.matches)return;
    if(t.classList.contains('ty')){st.ty=t.value;par()}else if(t.classList.contains('sd')){st.sd=t.value;par()}
    else if(t.classList.contains('pi'))st.i=+t.value;else if(t.classList.contains('pj'))st.j=+t.value;else return;
    draw();
  });
  body.addEventListener('input',function(e){if(e.target.classList.contains('pc')){var v=D.parseFr(e.target.value);e.target.classList.toggle('bad',!v);if(v){st.c=v;draw()}}});
  body.addEventListener('click',function(e){if(e.target.closest('.rnd')){M=D.toM([[1,2,3,4],[5,6,7,8],[9,10,11,12]].map(function(r){return r.map(function(){return D.randInt(-3,5)})}));draw()}});
  par();draw();
};

/* ---------- 通用分步播放器（初等变换过程） ---------- */
function player(host,steps,o){
  o=o||{};var cur=0,timer=0;
  host.innerHTML='<div class="pl-stage scroll-x"></div><div class="pl-txt small"></div><div class="btns"><button class="btn sm pl-first">⏮</button><button class="btn sm pl-prev">上一步</button><span class="tiny muted pl-cnt"></span><button class="btn sm pri pl-next">下一步</button><button class="btn sm pl-all">直接看结果</button><button class="btn sm pl-play">自动播放</button></div><ol class="pl-log small"></ol><div class="pl-end"></div>';
  function cellCls(s){return function(i,j){var c=[];if(o.div!==undefined&&j===o.div)c.push('divl');if(s.hr&&s.hr.indexOf(i)>=0)c.push('mk');if(s.hc&&s.hc.indexOf(j)>=0)c.push('mk');if(s.pv&&s.pv[0]===i&&s.pv[1]===j)c.push('pvt');return c.join(' ')}}
  function draw(){
    var s=steps[cur];
    $('.pl-stage',host).innerHTML=D.matHTML(s.M,{cls:'pm'+(o.div!==undefined?' aug':''),cell:cellCls(s)});
    $('.pl-txt',host).innerHTML=cur===0?(o.start||'起点'):s.ops.join('；');
    $('.pl-cnt',host).textContent=cur+' / '+(steps.length-1);
    $('.pl-log',host).innerHTML=steps.slice(1,cur+1).map(function(x){return '<li>'+x.ops.join('；')+'</li>'}).join('');
    $('.pl-end',host).innerHTML=cur===steps.length-1&&o.end?o.end(steps[cur].M):'';
    $('.pl-prev',host).disabled=cur===0;$('.pl-first',host).disabled=cur===0;$('.pl-next',host).disabled=cur===steps.length-1;$('.pl-all',host).disabled=cur===steps.length-1;
    $('.pl-play',host).textContent=timer?'暂停':'自动播放';
    host.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function stop(){clearInterval(timer);timer=0}
  host.onclick=function(e){
    var b=e.target.closest('button');if(!b||!host.contains(b))return;
    if(b.classList.contains('pl-next')){stop();if(cur<steps.length-1)cur++}
    else if(b.classList.contains('pl-prev')){stop();if(cur>0)cur--}
    else if(b.classList.contains('pl-first')){stop();cur=0}
    else if(b.classList.contains('pl-all')){stop();cur=steps.length-1}
    else if(b.classList.contains('pl-play')){if(timer){stop()}else{if(cur===steps.length-1)cur=0;timer=setInterval(function(){if(!document.body.contains(host)||cur>=steps.length-1){stop();draw()}else{cur++;draw()}},1300)}}
    else return;
    draw();
  };
  draw();
}
D.player=player;

/* 化简算法：返回步骤列表 */
function pickRow(M,c,from,to){var best=-1;for(var r=from;r<to;r++){if(M[r][c].isZero())continue;if(best<0)best=r;if(M[r][c].eq(1)||M[r][c].eq(-1)){best=r;break}}return best}
function rowAdd(M,a,b,c){M[b]=M[b].map(function(x,j){return x.add(c.mul(M[a][j]))})}
function colAdd(M,a,b,c){M.forEach(function(r){r[b]=r[b].add(c.mul(r[a]))})}
function nm(i){return i+1}
function echelonSteps(A0,full,ncols){
  var M=D.cloneM(A0),m=M.length,n=ncols||M[0].length,steps=[{M:D.cloneM(M),ops:[]}],r=0;
  for(var c=0;c<n&&r<m;c++){
    var p=pickRow(M,c,r,m);if(p<0)continue;
    if(p!==r){var t=M[p];M[p]=M[r];M[r]=t;steps.push({M:D.cloneM(M),ops:['交换第 '+nm(r)+'、'+nm(p)+' 行（左乘 '+K('P_{'+nm(r)+nm(p)+'}')+'）'],hr:[r,p],pv:[r,c]})}
    if(full&&!M[r][c].eq(1)){var pv=M[r][c],ic=F(1).div(pv);M[r]=M[r].map(function(x){return x.mul(ic)});steps.push({M:D.cloneM(M),ops:['第 '+nm(r)+' 行乘 '+K(ic.tex())+'（左乘 '+K('P_{'+nm(r)+'}('+ic.tex()+')')+'）'],hr:[r],pv:[r,c]})}
    var ops=[],hr=[];
    for(var i=full?0:r+1;i<m;i++){if(i===r||M[i][c].isZero())continue;var f=M[i][c].div(M[r][c]).neg();rowAdd(M,r,i,f);ops.push('第 '+nm(r)+' 行乘 '+K(f.tex())+' 加到第 '+nm(i)+' 行（'+K('T_{'+nm(r)+nm(i)+'}('+f.tex()+')')+'）');hr.push(i)}
    if(ops.length)steps.push({M:D.cloneM(M),ops:ops,hr:hr,pv:[r,c]});
    r++;
  }
  return {steps:steps,rank:r};
}
function standardSteps(A0){
  var M=D.cloneM(A0),m=M.length,n=M[0].length,steps=[{M:D.cloneM(M),ops:[]}],r=0;
  while(r<m&&r<n){
    var pr=-1,pc=-1;
    for(var c=r;c<n&&pr<0;c++){var p=pickRow(M,c,r,m);if(p>=0){pr=p;pc=c}}
    if(pr<0)break;
    for(var cc=r;cc<n;cc++)for(var rr=r;rr<m;rr++)if(M[rr][cc].eq(1)||M[rr][cc].eq(-1)){if(!(M[pr][pc].eq(1)||M[pr][pc].eq(-1))){pr=rr;pc=cc}}
    if(pr!==r){var t=M[pr];M[pr]=M[r];M[r]=t;steps.push({M:D.cloneM(M),ops:['交换第 '+nm(r)+'、'+nm(pr)+' 行'],hr:[r,pr]})}
    if(pc!==r){M.forEach(function(row){var t=row[pc];row[pc]=row[r];row[r]=t});steps.push({M:D.cloneM(M),ops:['交换第 '+nm(r)+'、'+nm(pc)+' 列'],hc:[r,pc]})}
    var ops=[],hr=[];
    for(var i=r+1;i<m;i++){if(M[i][r].isZero())continue;var f=M[i][r].div(M[r][r]).neg();rowAdd(M,r,i,f);ops.push('第 '+nm(r)+' 行乘 '+K(f.tex())+' 加到第 '+nm(i)+' 行');hr.push(i)}
    if(ops.length)steps.push({M:D.cloneM(M),ops:ops,hr:hr,pv:[r,r]});
    ops=[];var hc=[];
    for(var j=r+1;j<n;j++){if(M[r][j].isZero())continue;var g=M[r][j].div(M[r][r]).neg();colAdd(M,r,j,g);ops.push('第 '+nm(r)+' 列乘 '+K(g.tex())+' 加到第 '+nm(j)+' 列');hc.push(j)}
    if(ops.length)steps.push({M:D.cloneM(M),ops:ops,hc:hc,pv:[r,r]});
    if(!M[r][r].eq(1)){var ic=F(1).div(M[r][r]);M[r]=M[r].map(function(x){return x.mul(ic)});steps.push({M:D.cloneM(M),ops:['第 '+nm(r)+' 行乘 '+K(ic.tex())],hr:[r],pv:[r,r]})}
    r++;
  }
  return {steps:steps,rank:r};
}
D.echelonSteps=echelonSteps;

/* ---------- §2.4 化阶梯形 / 相抵标准型 ---------- */
W.reduce=function(el){
  var body=frame(el);
  var PR={e2:['例 2.4.2',[[2,0,-1,3],[1,2,-2,4],[0,1,3,-1]]],e3:['例 2.4.3',[[0,2,-4],[-1,-4,5],[3,1,7],[0,5,-10],[2,3,0]]],e1:['例 2.4.1 增广矩阵',[[0,1,1,2],[2,3,2,5],[3,1,-1,-1]]],h:['习题 2.4 第 2(2) 题',[[1,0,-1,2,3],[2,2,1,3,8],[3,4,4,5,11],[1,2,4,3,1]]]};
  body.innerHTML='<div class="ctrl">'+Object.keys(PR).map(function(k){return '<button class="btn sm" data-p="'+k+'">'+PR[k][0]+'</button>'}).join('')+'</div><div class="ctrl"><label>目标 <select class="md">'+opt([['ech','阶梯形（只用行变换）'],['rref','简化阶梯形（只用行变换）'],['std','相抵标准型（行、列变换）']],'std')+'</select></label><label>大小 <select class="m">'+opt(['2','3','4','5'],'3')+'</select>×<select class="n">'+opt(['2','3','4','5'],'4')+'</select></label><button class="btn sm rnd">随机</button></div><div class="row">'+K('A=')+'<span class="ed"></span></div><div class="rd-pl"></div>';
  var A=null,ed;
  function load(v){$('.m',body).value=v.length;$('.n',body).value=v[0].length;ed=new D.MatEd($('.ed',body),v.map(function(r){return r.map(String)}),function(m){A=m;run()},{pm:true})}
  function run(){
    var host=$('.rd-pl',body);if(!A){host.innerHTML=D.BAD;return}
    var md=$('.md',body).value,res=md==='std'?standardSteps(A):echelonSteps(A,md==='rref');
    player(host,res.steps,{start:'从 A 出发。黄色是每一步被改动的行（列），蓝框是主元。',end:function(){
      if(md==='std') return '<div class="ok-note">得到相抵标准型 '+K('\\begin{pmatrix}I_{'+res.rank+'}&O\\\\O&O\\end{pmatrix}')+'，r = '+res.rank+'。无论怎样变换，r 都不变（第三章：r 就是 A 的秩）。</div>';
      return '<div class="ok-note">已化为'+(md==='rref'?'简化':'')+'阶梯形：非零行 '+res.rank+' 个，阶梯点的列标严格递增。'+(md==='ech'?'只用行变换一般到不了标准型，例如 (0, 1, 2)。':'')+'</div>';
    }});
  }
  function rnd(){var m=+$('.m',body).value,n=+$('.n',body).value,a=[];for(var i=0;i<m;i++){a.push([]);for(var j=0;j<n;j++)a[i].push(D.randInt(-3,4))}return a}
  body.addEventListener('click',function(e){var b=e.target.closest('button');if(!b||b.closest('.rd-pl'))return;if(b.dataset.p)load(PR[b.dataset.p][1]);else if(b.classList.contains('rnd'))load(rnd())});
  body.addEventListener('change',function(e){var t=e.target;if(!t.matches||!t.matches('select'))return;if(t.classList.contains('md'))run();else if(t.classList.contains('m')||t.classList.contains('n'))load(rnd())});
  load(PR.e2[1]);
};

/* ---------- §2.5 初等变换法求逆 / 解矩阵方程 ---------- */
W.gjinv=function(el){
  var body=frame(el);
  var PR={e3:['例 2.5.3 求逆',[[1,2,3],[2,1,2],[1,3,4]],null],h2:['习题 2.5 第 1(2) 题',[[1,1,0],[-2,1,-1],[3,1,1]],null],e4:['例 2.5.4 解 AX = B',[[1,0,1],[-1,1,1],[2,-1,1]],[[1,1],[0,1],[-1,0]]],h3:['习题 2.5 第 3 题',[[2,2,3],[1,-1,0],[-1,2,1]],[[4,-1],[2,1],[1,0]]],sg:['奇异阵',[[1,2,1],[2,4,3],[3,6,4]],null]};
  body.innerHTML='<div class="ctrl">'+Object.keys(PR).map(function(k){return '<button class="btn sm" data-p="'+k+'">'+PR[k][0]+'</button>'}).join('')+'</div><div class="row gj-in"><span class="p4-g">'+K('A=')+'<span class="ea"></span></span><span class="p4-g gj-b">'+K('B=')+'<span class="eb"></span></span></div><div class="gj-pl"></div>';
  var A=null,B=null,mode;
  function load(k){var p=PR[k];mode=p[2]?'eq':'inv';$('.gj-b',body).hidden=mode!=='eq';
    new D.MatEd($('.ea',body),p[1].map(function(r){return r.map(String)}),function(m){A=m;run()},{pm:true});
    if(p[2])new D.MatEd($('.eb',body),p[2].map(function(r){return r.map(String)}),function(m){B=m;run()},{pm:true});else B=null;run()}
  function run(){
    var host=$('.gj-pl',body);if(!A||(mode==='eq'&&!B)){host.innerHTML=D.BAD;return}
    var n=A.length,R=mode==='eq'?B:X.eye(n),Mx=A.map(function(r,i){return r.concat(R[i])});
    var res=echelonSteps(Mx,true,n),last=res.steps[res.steps.length-1].M,ok=res.rank===n;
    player(host,res.steps,{div:n,start:mode==='eq'?'作 (A | B)，只做初等行变换，把左边化为 I。':'作 (A | I)，只做初等行变换，把左边化为 I。',end:function(){
      if(!ok) return '<div class="err-note">左边化不成单位阵（出现了零行），说明 |A| = 0，A 不可逆'+(mode==='eq'?'，不能写 X = A⁻¹B':'')+'。</div>';
      var Rt=last.map(function(r){return r.slice(n)});
      return '<div class="ok-note">左边已是 I，右边就是 '+(mode==='eq'?K('X=A^{-1}B=')+X.P(Rt,{cls:'sm'})+'　验算 AX = B '+(X.meq(mm(A,Rt),B)?'✓':'✗'):K('A^{-1}=')+X.P(Rt,{cls:'sm'})+'　验算 '+K('AA^{-1}=I')+' '+(X.meq(mm(A,Rt),X.eye(n))?'✓':'✗'))+'</div>';
    }});
  }
  body.addEventListener('click',function(e){var b=e.target.closest('button');if(b&&b.dataset.p&&!b.closest('.gj-pl'))load(b.dataset.p)});
  load('e3');
};

/* ---------- §2.5 |AB| = |A||B| 的几何意义 ---------- */
W.detprod=function(el){
  var body=frame(el);
  body.innerHTML='<div class="row dp-in"><span class="p4-g">'+K('A=')+'<span class="ea"></span></span><span class="p4-g">'+K('B=')+'<span class="eb"></span></span><button class="btn sm rnd">随机</button></div><div class="dp-figs"></div><div class="dp-out"></div>';
  var A=null,B=null;
  function fig(M,cls,t){
    var S=26,O=[80,80],pts=[[0,0],[1,0],[1,1],[0,1]].map(function(p){var x=M?M[0][0].val()*p[0]+M[0][1].val()*p[1]:p[0],y=M?M[1][0].val()*p[0]+M[1][1].val()*p[1]:p[1];return [O[0]+x*S,O[1]-y*S]});
    var g='';for(var k=-3;k<=3;k++)g+='<line class="grid" x1="'+(O[0]+k*S)+'" y1="0" x2="'+(O[0]+k*S)+'" y2="160"/><line class="grid" x1="0" y1="'+(O[1]+k*S)+'" x2="160" y2="'+(O[1]+k*S)+'"/>';
    return '<figure class="dp-f"><svg viewBox="0 0 160 160" class="plot">'+g+'<line class="axis" x1="0" y1="80" x2="160" y2="80"/><line class="axis" x1="80" y1="0" x2="80" y2="160"/><polygon class="'+cls+'" points="'+pts.map(function(p){return p.join(',')}).join(' ')+'"/></svg><figcaption class="small">'+t+'</figcaption></figure>';
  }
  function calc(){
    if(!A||!B){$('.dp-out',body).innerHTML=D.BAD;return}
    var C=mm(A,B),a=D.det(A),b=D.det(B),c=D.det(C),cl=function(d){return d.isZero()?'area-zero':d.val()>0?'area-pos':'area-neg'};
    $('.dp-figs',body).innerHTML='<div class="dp-row">'+fig(null,'area-pos','单位正方形<br>面积 1')+'<span class="dp-ar">B →</span>'+fig(B,cl(b),'B 作用后<br>有向面积 '+K(b.tex()))+'<span class="dp-ar">A →</span>'+fig(C,cl(c),'再用 A：即 AB<br>有向面积 '+K(c.tex()))+'</div>';
    var S=X.madd(A,B),s=D.det(S);
    $('.dp-out',body).innerHTML='<p class="small">'+K('|AB|='+c.tex()+',\\qquad |A|\\,|B|='+D.pt(a)+'\\cdot'+D.pt(b)+'='+a.mul(b).tex())+' <span class="ok">✓</span>　面积先被 B 放大 '+K('|B|')+' 倍，再被 A 放大 '+K('|A|')+' 倍。</p><p class="small">对比：'+K('|A+B|='+s.tex()+',\\ |A|+|B|='+a.add(b).tex())+(s.eq(a.add(b))?'（这一组恰好相等）':' <span class="no">一般不相等</span>')+'。</p>';
    body.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function load(a,b){new D.MatEd($('.ea',body),a,function(m){A=m;calc()},{pm:true});new D.MatEd($('.eb',body),b,function(m){B=m;calc()},{pm:true})}
  body.addEventListener('click',function(e){if(e.target.closest('.rnd'))load(D.randM(2,-2,2),D.randM(2,-2,2))});
  load([[1,1],[0,2]],[['3/2','0'],['1/2','1']]);
};
})();
;(function(){
'use strict';
var D=window.D,W=window.WIDGETS,F=D.F,Fr=D.Fr,fmt=D.fmt,K=D.K,$=D.$,$$=D.$$,esc=D.esc,frame=D.frame,opt=D.opt,X=D.mx,P=X.P,mm=X.mm;
function sub(M,r0,r1,c0,c1){return M.slice(r0,r1).map(function(r){return r.slice(c0,c1)})}

/* ---------- §2.6 分块乘法 ---------- */
W.blockmul=function(el){
  var body=frame(el);
  var PR={e1:{t:'例 2.6.1',A:[[1,0,2,-1,0],[0,1,1,-2,1],[0,0,3,1,0],[1,0,-2,0,1]],B:[[1,0,2],[0,1,0],[-1,1,3],[0,1,-1],[2,0,1]],rA:[2,2],k:[2,1,2],cB:[2,1]},
          d:{t:'分块对角相乘（例 2.6.2）',A:[[1,1,0,0,0],[-1,1,0,0,0],[0,0,1,0,0],[0,0,1,1,0],[0,0,0,0,1]],B:[[2,0,0,0,0],[1,1,0,0,0],[0,0,1,2,0],[0,0,0,1,0],[0,0,0,0,3]],rA:[2,2,1],k:[2,2,1],cB:[2,2,1]}};
  body.innerHTML='<div class="ctrl">'+Object.keys(PR).map(function(k){return '<button class="btn sm" data-p="'+k+'">'+PR[k].t+'</button>'}).join('')+'<button class="btn sm rnd">换一组数（分块不变）</button></div><div class="row bm-mats"></div><div class="bm-f"></div>';
  var cfg,A,B,pi=0,pj=0;
  function cuts(a){var s=[0];a.forEach(function(x){s.push(s[s.length-1]+x)});return s}
  function blk(M,rs,cs){var R=cuts(rs),C=cuts(cs);return function(i,j){var c=[];if(C.indexOf(j)>0&&j>0)c.push('bl');if(R.indexOf(i)>0&&i>0)c.push('bt');return c}}
  function draw(){
    var R=cuts(cfg.rA),Kc=cuts(cfg.k),Cc=cuts(cfg.cB),C=mm(A,B);
    var fa=blk(A,cfg.rA,cfg.k),fb=blk(B,cfg.k,cfg.cB),fc=blk(C,cfg.rA,cfg.cB);
    var inBlk=function(i,j){return i>=R[pi]&&i<R[pi+1]&&j>=Cc[pj]&&j<Cc[pj+1]};
    $('.bm-mats',body).innerHTML=D.matHTML(A,{cls:'pm sm',cell:function(i,j){return fa(i,j).concat(i>=R[pi]&&i<R[pi+1]?['ra']:[]).join(' ')}})+'<span>·</span>'+D.matHTML(B,{cls:'pm sm',cell:function(i,j){return fb(i,j).concat(j>=Cc[pj]&&j<Cc[pj+1]?['mk']:[]).join(' ')}})+'<span>=</span>'+D.matHTML(C,{cls:'pm sm click',cell:function(i,j){return fc(i,j).concat(inBlk(i,j)?['on']:[]).join(' ')}});
    var terms=[],sum=null,ts=[];
    for(var k=0;k<cfg.k.length;k++){var Ab=sub(A,R[pi],R[pi+1],Kc[k],Kc[k+1]),Bb=sub(B,Kc[k],Kc[k+1],Cc[pj],Cc[pj+1]),pr=mm(Ab,Bb);sum=sum?X.madd(sum,pr):pr;terms.push('A_{'+(pi+1)+(k+1)+'}B_{'+(k+1)+(pj+1)+'}');ts.push(X.texM(Ab)+X.texM(Bb))}
    $('.bm-f',body).innerHTML='<p class="small">点 AB 的任一块。'+K('C_{'+(pi+1)+(pj+1)+'}='+terms.join('+'))+'：</p><div class="scroll-x">'+K('='+ts.join('+')+'='+X.texM(sum),true)+'</div><p class="small muted">块与块相乘要“对得上”：A 的列怎么分，B 的行就要怎么分（这里都是 '+cfg.k.join('+')+'）。</p>';
    body.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function load(k,rnd){cfg=PR[k];A=D.toM(rnd?cfg.A.map(function(r){return r.map(function(x){return x?D.randInt(-3,3)||1:0})}):cfg.A);B=D.toM(rnd?cfg.B.map(function(r){return r.map(function(x){return x?D.randInt(-3,3)||1:0})}):cfg.B);pi=0;pj=0;draw()}
  var curK='e1';
  body.addEventListener('click',function(e){
    var c=e.target.closest('.bm-mats .click .c');
    if(c){var R=cuts(cfg.rA),Cc=cuts(cfg.cB),i=+c.dataset.i,j=+c.dataset.j;for(var a=0;a<R.length-1;a++)if(i>=R[a]&&i<R[a+1])pi=a;for(var b=0;b<Cc.length-1;b++)if(j>=Cc[b]&&j<Cc[b+1])pj=b;draw();return}
    var bt=e.target.closest('button');if(!bt)return;if(bt.dataset.p){curK=bt.dataset.p;load(curK)}else if(bt.classList.contains('rnd'))load(curK,true);
  });
  load('e1');
};

/* ---------- §2.6 Schur 补与降阶公式 ---------- */
W.schur=function(el){
  var body=frame(el);
  body.innerHTML='<div class="ctrl"><label>阶数 <select class="n">'+D.opt(['3','4','5'],'4')+'</select></label><label>A 取左上角 <select class="m"></select> 阶</label><button class="btn sm rnd">随机</button><button class="btn sm ex">例：(a_ia_j+1) 型</button></div><div class="row">'+K('M=')+'<span class="ed"></span></div><div class="sc-out"></div>';
  var M=null,ed;
  function mopts(){var n=+$('.n',body).value,cur=+($('.m',body).value||2);$('.m',body).innerHTML=D.opt(Array.from({length:n-1},function(_,i){return String(i+1)}),String(Math.min(cur,n-1)))}
  function load(v){ed=new D.MatEd($('.ed',body),v,function(x){M=x;calc()},{pm:true})}
  function calc(){
    var o=$('.sc-out',body);if(!M){o.innerHTML=D.BAD;return}
    var n=M.length,m=+$('.m',body).value,A=sub(M,0,m,0,m),B=sub(M,0,m,m,n),C=sub(M,m,n,0,m),Dd=sub(M,m,n,m,n),dA=D.det(A),dM=D.det(M);
    var mk=function(i,j){var c=[];if(j===m)c.push('bl');if(i===m)c.push('bt');return c.join(' ')};
    $('.ed',body).querySelectorAll('input').forEach(function(inp){var i=+inp.dataset.i,j=+inp.dataset.j;inp.classList.toggle('blk-l',j===m);inp.classList.toggle('blk-t',i===m)});
    var h='<p class="small">分块 '+K('M=\\begin{pmatrix}A&B\\\\C&D\\end{pmatrix}')+'，A 为 '+m+' 阶，D 为 '+(n-m)+' 阶。</p>';
    if(dA.isZero()){h+='<div class="err-note">这样分块时 |A| = 0，A 不可逆，不能用 '+K('|A|\\,|D-CA^{-1}B|')+'。换一个分块位置，或在 D 可逆时用 '+K('|D|\\,|A-BD^{-1}C|')+'。</div>'}
    else{
      var Ai=X.inv(A),S=X.madd(Dd,mm(mm(C,Ai),B),-1),dS=D.det(S);
      h+='<p class="small">① 第三类分块初等变换：用 '+K('-CA^{-1}')+' 左乘第一分块行，加到第二分块行（行列式不变）：</p><div class="scroll-x">'+K('\\begin{pmatrix}A&B\\\\C&D\\end{pmatrix}\\longrightarrow\\begin{pmatrix}A&B\\\\O&D-CA^{-1}B\\end{pmatrix}',true)+'</div>';
      h+='<p class="small">② Schur 补 '+K('D-CA^{-1}B=')+P(S,{cls:'sm'})+'，'+K('|D-CA^{-1}B|='+dS.tex())+'</p>';
      h+='<p class="small">③ 分块三角：'+K('|M|=|A|\\,|D-CA^{-1}B|='+D.pt(dA)+'\\cdot'+D.pt(dS)+'='+dA.mul(dS).tex())+'；直接计算 '+K('|M|='+dM.tex())+' <span class="ok">'+(dA.mul(dS).eq(dM)?'✓':'✗')+'</span></p>';
      h+='<p class="small muted">原来要算 '+n+' 阶行列式，现在只要算 '+m+' 阶和 '+(n-m)+' 阶的（加上求 '+K('A^{-1}')+'）。</p>';
    }
    o.innerHTML=h;body.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function rnd(n){for(var t=0;t<50;t++){var v=D.randM(n,-2,3);if(!D.det(v).isZero())return v.map(function(r){return r.map(String)})}return v}
  body.addEventListener('change',function(e){var t=e.target;if(!t.matches||!t.matches('select'))return;if(t.classList.contains('n')){mopts();load(rnd(+t.value))}else calc()});
  body.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.classList.contains('rnd'))load(rnd(+$('.n',body).value));else if(b.classList.contains('ex')){var a=[1,2,-1,3];$('.n',body).value='4';mopts();$('.m',body).value='1';load(a.map(function(x,i){return a.map(function(y,j){return String(i===j?x*x:x*y+1)})}))}});
  mopts();$('.m',body).value='2';load([[2,1,1,0],[1,1,0,2],[1,0,3,1],[0,2,1,2]].map(function(r){return r.map(String)}));
};

/* ---------- *§2.7 Cauchy–Binet 公式 ---------- */
W.cauchy=function(el){
  var body=frame(el);
  body.innerHTML='<div class="ctrl"><label>A 为 <select class="m">'+D.opt(['2','3'],'2')+'</select> × <select class="n">'+D.opt(['2','3','4'],'3')+'</select>，B 为 n × m</label><button class="btn sm rnd">随机</button><button class="btn sm lg">Lagrange 恒等式</button></div><div class="row cb-in"><span class="p4-g">'+K('A=')+'<span class="ea"></span></span><span class="p4-g">'+K('B=')+'<span class="eb"></span></span></div><div class="cb-out"></div>';
  var A=null,B=null,lag=false;
  function rm(m,n){var a=[];for(var i=0;i<m;i++){a.push([]);for(var j=0;j<n;j++)a[i].push(String(D.randInt(-2,3)))}return a}
  function load(a,b){new D.MatEd($('.ea',body),a,function(x){A=x;calc()},{pm:true});new D.MatEd($('.eb',body),b,function(x){B=x;calc()},{pm:true})}
  function calc(){
    var o=$('.cb-out',body);if(!A||!B){o.innerHTML=D.BAD;return}
    var m=A.length,n=A[0].length;if(B.length!==n||B[0].length!==m){o.innerHTML='';return}
    var C=mm(A,B),dC=D.det(C),h='<p class="small">'+K('AB=')+P(C,{cls:'sm'})+'，'+K('|AB|='+dC.tex())+'</p>';
    if(m>n){h+='<div class="ok-note">m = '+m+' > n = '+n+'：A 取不出 '+m+' 阶子式，公式右边是空和，|AB| = 0。确实 '+K('|AB|='+dC.tex())+'。</div>'}
    else{
      var cs=D.combos(Array.from({length:n},function(_,i){return i}),m),sum=F(0);
      h+='<div class="tw"><table class="t small"><tr><th>选的列（行）号</th><th>A 的 '+m+' 阶子式</th><th>B 的对应子式</th><th>乘积</th></tr>';
      cs.forEach(function(J){var a=D.det(A.map(function(r){return J.map(function(j){return r[j]})})),b=D.det(J.map(function(j){return B[j]})),pr=a.mul(b);sum=sum.add(pr);
        h+='<tr><td>'+J.map(function(j){return j+1}).join(', ')+'</td><td>'+K(a.tex())+'</td><td>'+K(b.tex())+'</td><td>'+K(pr.tex())+'</td></tr>'});
      h+='<tr class="sum"><td colspan="3">求和（共 '+K('\\binom{'+n+'}{'+m+'}='+cs.length)+' 项）</td><td>'+K(sum.tex())+' '+(sum.eq(dC)?'<span class="ok">= |AB| ✓</span>':'')+'</td></tr></table></div>';
      if(m===n) h+='<p class="small muted">m = n 时只有一项：|AB| = |A||B|，就是乘积行列式定理。</p>';
      if(lag) h+='<p class="small">这里 B = A′：每个乘积都是一个平方 '+K('(a_ib_j-a_jb_i)^2')+'，所以 '+K('\\bigl(\\sum a_i^2\\bigr)\\bigl(\\sum b_i^2\\bigr)-\\bigl(\\sum a_ib_i\\bigr)^2=\\sum_{i\\lt j}(a_ib_j-a_jb_i)^2\\ge0')+'——这就是 Lagrange 恒等式与 Cauchy–Schwarz 不等式。</p>';
    }
    o.innerHTML=h;body.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function fresh(){lag=false;var m=+$('.m',body).value,n=+$('.n',body).value;load(rm(m,n),rm(n,m))}
  body.addEventListener('change',function(e){var t=e.target;if(t.matches&&t.matches('select'))fresh()});
  body.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.classList.contains('rnd'))fresh();else if(b.classList.contains('lg')){$('.m',body).value='2';$('.n',body).value='4';var a=rm(2,4);lag=true;load(a,a[0].map(function(_,j){return [a[0][j],a[1][j]]}))}});
  load([['1','2','0'],['-1','1','3']],[['2','1'],['0','1'],['1','-1']]);
};

/* ---------- §2.5 统计视角：用逆矩阵算回归系数 ---------- */
W.ols=function(el){
  var body=frame(el);
  var xs=[1,2,3,4,5],ys=[2,3,5,6,9];
  body.innerHTML='<div class="w-grid"><div><svg class="plot ol-svg" viewBox="0 0 320 240" role="img" aria-label="散点与回归直线"></svg><p class="tiny muted" style="text-align:center">拖动圆点改变数据（取整到 0.5）</p></div><div class="ol-out"></div></div>';
  var svg=$('.ol-svg',body),drag=-1;
  function sx(x){return 30+x*48}function sy(y){return 220-y*20}
  function calc(){
    var n=xs.length,X=xs.map(function(x){return [F(1),D.parseFr(String(x))]}),Y=ys.map(function(y){return [D.parseFr(String(y))]});
    var Xt=D.transpose(X),XtX=mm(Xt,X),XtY=mm(Xt,Y),d=D.det(XtX),o=$('.ol-out',body),h='';
    h+='<p class="small">设计矩阵 '+K('X=(\\mathbf 1,\\ x)')+'（'+n+'×2），正规方程 '+K("X'X\\hat\\beta=X'y")+'：</p>';
    h+='<div class="scroll-x">'+K("X'X="+D.mx.texM(XtX)+",\\quad X'y="+D.mx.texM(XtY))+'</div>';
    if(d.isZero()){h+='<div class="err-note">|X′X| = 0（所有 x 相同），X′X 不可逆，斜率无法估计。</div>'}
    else{var I=X.length?D.mx.inv(XtX):null,b=mm(I,XtY);
      h+='<p class="small">'+K("|X'X|="+d.tex()+"\\ne0")+'，所以</p><div class="scroll-x">'+K("\\hat\\beta=(X'X)^{-1}X'y="+D.mx.texM(I)+D.mx.texM(XtY)+"="+D.mx.texM(b),true)+'</div><p class="small">回归直线 '+K('\\hat y='+D.fnum(b[0][0].val(),3)+(b[1][0].val()<0?'':'+')+D.fnum(b[1][0].val(),3)+'x')+'。'+K("(X'X)^{-1}=\\dfrac{1}{|X'X|}(X'X)^*")+'，正是 §2.3 的伴随矩阵公式。</p>';
      var b0=b[0][0].val(),b1=b[1][0].val();draw(b0,b1);}
    if(d.isZero())draw(null,null);
    o.innerHTML=h;body.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function draw(b0,b1){
    var g='';for(var k=0;k<=6;k++)g+='<line class="grid" x1="'+sx(k)+'" y1="20" x2="'+sx(k)+'" y2="220"/>';for(k=0;k<=10;k+=2)g+='<line class="grid" x1="30" y1="'+sy(k)+'" x2="318" y2="'+sy(k)+'"/>';
    g+='<line class="axis" x1="30" y1="220" x2="318" y2="220"/><line class="axis" x1="30" y1="20" x2="30" y2="220"/>';
    if(b0!==null)g+='<line x1="'+sx(0)+'" y1="'+sy(b0)+'" x2="'+sx(6)+'" y2="'+sy(b0+6*b1)+'" style="stroke:var(--accent);stroke-width:2.5"/>';
    xs.forEach(function(x,i){g+='<circle data-k="'+i+'" cx="'+sx(x)+'" cy="'+sy(ys[i])+'" r="8" style="fill:var(--stat);cursor:grab"/>'});
    svg.innerHTML=g;
  }
  function pt(e){var r=svg.getBoundingClientRect();return [(e.clientX-r.left)/r.width*320,(e.clientY-r.top)/r.height*240]}
  svg.style.touchAction='none';
  svg.addEventListener('pointerdown',function(e){var c=e.target.closest('[data-k]');if(!c)return;drag=+c.dataset.k;try{svg.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault()});
  svg.addEventListener('pointermove',function(e){if(drag<0)return;var p=pt(e);xs[drag]=Math.max(0,Math.min(6,Math.round((p[0]-30)/48*2)/2));ys[drag]=Math.max(0,Math.min(10,Math.round((220-p[1])/20*2)/2));calc()});
  function end(){drag=-1}svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
  calc();
};
})();
;(function(){
'use strict';
var D=window.D,W=window.WIDGETS,F=D.F,K=D.K,$=D.$,frame=D.frame,opt=D.opt,X=D.mx,P=X.P,mm=X.mm,ri=D.randInt;
/* ---------- 第二章综合练习：无限出题 ---------- */
W.drill2=function(el){
  var body=frame(el);
  body.innerHTML='<div class="ctrl"><label>题型 <select class="ty">'+opt([['mul','乘积 AB 的某个元素'],['inv','逆矩阵 A⁻¹ 的某个元素'],['det','行列式综合（|kA|、|A⁻¹|、|A*| …）']],'mul')+'</select></label><button class="btn sm pri new">出一道题</button></div><div class="q"></div><div class="frow row"><input class="txt ans" placeholder="你的答案（可写 a/b）" autocomplete="off" aria-label="答案"><button class="btn sm pri chk">检查</button><button class="btn sm sol">看解答</button><span class="fmsg small"></span></div><div class="steps"></div><p class="small muted stat"></p>';
  var cur=null,tries=0,right=0;
  function rm(m,n,lo,hi){var a=[];for(var i=0;i<m;i++){a.push([]);for(var j=0;j<n;j++)a[i].push(ri(lo,hi))}return D.toM(a)}
  function gMul(){
    var m=ri(2,3),k=ri(2,4),n=ri(2,3),A=rm(m,k,-3,4),B=rm(k,n,-3,4),i=ri(0,m-1),j=ri(0,n-1),C=mm(A,B);
    var terms=A[i].map(function(a,r){return D.pt(a)+'\\cdot'+D.pt(B[r][j])});
    return {q:'<p class="small">'+K('A')+' 为 '+m+'×'+k+'，'+K('B')+' 为 '+k+'×'+n+'。求 '+K('AB')+' 的 ('+(i+1)+', '+(j+1)+') 元。</p><div class="row">'+K('A=')+P(A)+K('B=')+P(B)+'</div>',ans:C[i][j],
      sol:'<p class="small">先看尺寸：('+m+'×'+k+')('+k+'×'+n+') → '+m+'×'+n+'。(i, j) 元 = A 的第 '+(i+1)+' 行 × B 的第 '+(j+1)+' 列：</p><div class="scroll-x">'+K('c_{'+(i+1)+(j+1)+'}='+terms.join('+')+'='+C[i][j].tex(),true)+'</div><div class="row">'+K('AB=')+P(C,{cell:function(r,c){return r===i&&c===j?'mk':''}})+'</div>'};
  }
  function gInv(){
    var A,d;for(var t=0;t<400;t++){A=rm(3,3,-2,3);d=D.det(A);if(!d.isZero()&&Math.abs(d.val())<=2)break}
    var i=ri(0,2),j=ri(0,2),Iv=X.inv(A),C=X.cofM(A),mi=D.minorOf(A,j,i);
    return {q:'<p class="small">求 '+K('A^{-1}')+' 的 ('+(i+1)+', '+(j+1)+') 元。</p><div class="row">'+K('A=')+P(A)+'</div>',ans:Iv[i][j],
      sol:'<p class="small">'+K('|A|='+d.tex())+'。由 '+K('A^{-1}=\\frac1{|A|}A^*')+'，'+K('A^{-1}')+' 的 ('+(i+1)+', '+(j+1)+') 元是 '+K('\\dfrac{A_{'+(j+1)+(i+1)+'}}{|A|}')+'（下标反过来）：</p><div class="scroll-x">'+K('A_{'+(j+1)+(i+1)+'}=(-1)^{'+(i+j+2)+'}'+X.texM(mi,'vmatrix')+'='+C[j][i].tex()+',\\qquad \\frac{'+C[j][i].tex()+'}{'+d.tex()+'}='+Iv[i][j].tex(),true)+'</div><div class="row">'+K('A^{-1}=')+P(Iv,{cell:function(r,c){return r===i&&c===j?'mk':''}})+'</div><p class="small muted">也可以用 (A | I) → (I | A⁻¹) 验证。</p>'};
  }
  function gDet(){
    var n=ri(2,4),a=[-3,-2,-1,1,2,3][ri(0,5)],b=[-2,-1,1,2,3][ri(0,4)],k=[-2,-1,2,3][ri(0,3)],A=F(a),B=F(b),Kf=F(k),pw=function(x,e){var r=F(1);for(var t=0;t<e;t++)r=r.mul(x);return r};
    var kinds=[
      ['|'+k+'A|',pw(Kf,n).mul(A),'|kA|=k^n|A|='+Kf.tex()+'^{'+n+'}\\cdot'+D.pt(A)],
      ['|'+k+'A^{-1}|',pw(Kf,n).div(A),'|kA^{-1}|=k^n|A|^{-1}='+D.pt(Kf)+'^{'+n+'}\\cdot\\frac1{'+a+'}'],
      ['|A^*|',pw(A,n-1),'|A^*|=|A|^{n-1}='+D.pt(A)+'^{'+(n-1)+'}'],
      ['|A^{-1}B\'|',B.div(A),'|A^{-1}B\'|=|A|^{-1}|B|=\\frac{'+b+'}{'+a+'}'],
      ['|'+k+'AB^2|',pw(Kf,n).mul(A).mul(B).mul(B),'|kAB^2|=k^n|A||B|^2='+D.pt(Kf)+'^{'+n+'}\\cdot'+D.pt(A)+'\\cdot'+D.pt(B)+'^2'],
      ['|(AB)^{-1}A\'|',F(1).div(B),'|(AB)^{-1}A\'|=\\frac{|A|}{|A||B|}=\\frac1{|B|}'],
      ['|A^*A|',pw(A,n),'A^*A=|A|I_n,\\ |A^*A|=|A|^n']
    ],c=kinds[ri(0,kinds.length-1)];
    return {q:'<p class="small">'+K('A,B')+' 为 '+n+' 阶方阵，'+K('|A|='+a+',\\ |B|='+b)+'。求 '+K(c[0])+'。</p>',ans:c[1],sol:'<div class="scroll-x">'+K(c[2]+'='+c[1].tex(),true)+'</div><p class="small muted">用到：|AB| = |A||B|，|kA| = kⁿ|A|，|A′| = |A|，|A⁻¹| = |A|⁻¹，|A*| = |A|ⁿ⁻¹。</p>'};
  }
  function gen(){var t=$('.ty',body).value;cur=t==='mul'?gMul():t==='inv'?gInv():gDet();$('.q',body).innerHTML=cur.q;$('.steps',body).innerHTML='';$('.fmsg',body).innerHTML='';$('.ans',body).value='';body.dispatchEvent(new Event('change',{bubbles:true}))}
  function check(){var v=D.parseFr($('.ans',body).value),m=$('.fmsg',body);if(!v){m.innerHTML='<span class="muted">请输入一个数</span>';return}tries++;var ok=v.eq(cur.ans);if(ok)right++;m.innerHTML=ok?'<span class="ok">正确</span>':'<span class="no">不对，再算一遍或看解答</span>';$('.stat',body).textContent='本次已检查 '+tries+' 次，答对 '+right+' 次。'}
  $('.new',body).addEventListener('click',gen);
  $('.ty',body).addEventListener('change',function(e){e.stopPropagation();gen()});
  $('.chk',body).addEventListener('click',check);$('.ans',body).addEventListener('keydown',function(e){if(e.key==='Enter')check()});
  $('.sol',body).addEventListener('click',function(){$('.steps',body).innerHTML=cur.sol;body.dispatchEvent(new Event('change',{bubbles:true}))});
  gen();
};
})();
