/* 互动组件（二）：§1.5–§1.7、总结与练习 */
(function(){
'use strict';
var D=window.D,W=window.WIDGETS,F=D.F,fmt=D.fmt,K=D.K,$=D.$,$$=D.$$,esc=D.esc,frame=D.frame,opt=D.opt,idxOpts=D.idxOpts;

/* ================= 消元降阶 ================= */
function elimSteps(A0,pref){
  var n=A0.length,M=D.cloneM(A0),sw=0,S=[];
  function push(o){o.M=D.cloneM(M);o.swaps=sw;S.push(o)}
  push({k:0,text:'初始行列式。目标：用性质 7 把主对角线下方化为 0。'});
  for(var k=0;k<n-1;k++){
    var p=-1,i;
    if(pref){for(i=k;i<n;i++){var v=M[i][k];if(v.d===1&&Math.abs(v.n)===1){p=i;break}}}
    if(p<0){for(i=k;i<n;i++) if(!M[i][k].isZero()){p=i;break}}
    if(p<0){push({k:k,final:true,zeroCol:true,text:'第 '+(k+1)+' 列从第 '+(k+1)+' 行往下全为 0：化成上三角后对角线上必有 0，所以 '+K('|A|=0')+'。'});return S}
    if(p!==k){var t=M[p];M[p]=M[k];M[k]=t;sw++;push({k:k,rows:[k,p],text:'交换第 '+(k+1)+' 行与第 '+(p+1)+' 行，换上合适的主元。<b>性质 4：变号</b>。'})}
    for(i=k+1;i<n;i++){
      if(M[i][k].isZero()) continue;
      var f=M[i][k].div(M[k][k]).neg();
      M[i]=M[i].map(function(x,j){return x.add(f.mul(M[k][j]))});
      push({k:k,rows:[i],text:K('r_{'+(i+1)+'}+\\left('+f.tex()+'\\right)r_{'+(k+1)+'}')+'：第 '+(k+1)+' 行的 '+K(f.tex())+' 倍加到第 '+(i+1)+' 行。<b>性质 7：值不变</b>。'});
    }
    push({k:k,block:true,text:'第 '+(k+1)+' 列主元以下全是 0。按这一列展开：'+K('|A|')+' = 主元 × 右下角的 '+(n-k-1)+' 阶行列式（蓝色），阶数降 1。'});
  }
  var prod=F(1),dg=[];for(var r=0;r<n;r++){prod=prod.mul(M[r][r]);dg.push(D.pt(M[r][r]))}
  var val=sw%2?prod.neg():prod;
  push({k:n,final:true,value:val,text:'上三角行列式（性质 1）：'+K('|A|=(-1)^{'+sw+'}\\cdot '+dg.join('\\cdot ')+'='+val.tex())});
  return S;
}
D.elimSteps=elimSteps;
function stepCell(s){
  return function(i,j){
    if(s.final&&!s.zeroCol) return i===j?'mk':(i>j?'off':'');
    var c=[];
    if(s.block&&i>s.k&&j>s.k) c.push('ra');
    if(i===s.k&&j===s.k) c.push('piv');
    if(s.rows&&s.rows.indexOf(i)>=0) c.push('mk');
    if(i>j&&(j<s.k||(s.block&&j===s.k))) c.push('off');
    return c.join(' ');
  };
}
W.elim=function(el){
  var body=frame(el);
  var PR={e152:['例 1.5.2（结果 12）',[[1,0,2,1],[2,-1,1,0],[1,0,0,3],[-1,0,2,1]]],e153:['例 1.5.3（主元为 0）',[[0,-2,4],[2,5,-1],[6,1,7]]],e154:['例 1.5.4',[[7,3,1,-5],[2,6,-3,0],[3,11,-1,4],[-6,5,2,-9]]],e155:['例 1.5.5',[[3,6,12],[2,-3,0],[5,1,2]]],x1:['习题 1.5 第 1(1) 题',[[1,2,-1,2],[3,0,1,5],[1,-2,0,3],[-2,-4,1,6]]],x2:['习题 1.5 第 1(2) 题',[[1,-1,2,-1],[-3,4,1,-1],[2,-5,-3,8],[-2,6,-4,1]]]};
  body.innerHTML='<div class="w-grid"><div><div class="ctrl"><select class="pre">'+opt(Object.keys(PR).map(function(k){return [k,PR[k][0]]}),'e152')+'</select></div><div class="ed"></div><label class="small" style="display:flex;gap:.4rem;align-items:center;margin-top:.5rem"><input type="checkbox" class="pref" checked> 优先用 ±1 作主元（手算少出分数）</label><p class="tiny muted">改动任一格子，步骤会重新生成。</p></div>'+
    '<div><div class="scroll-x stage" style="min-height:9rem"></div><div class="panel small txt" style="margin-top:.5rem;min-height:3.2em"></div><div class="btns"><button class="btn sm first" aria-label="回到开头">⏮</button><button class="btn sm prev">上一步</button><span class="cnt tiny muted"></span><button class="btn sm pri next">下一步</button><button class="btn sm play">自动播放</button></div></div></div>';
  var steps=[],idx=0,timer=null,A=null;
  function stop(){if(timer){clearInterval(timer);timer=null}$('.play',body).textContent='自动播放'}
  function build(){stop();steps=A?elimSteps(A,$('.pref',body).checked):[];idx=0;show()}
  function show(){
    if(!steps.length){$('.stage',body).innerHTML=D.BAD;$('.txt',body).innerHTML='';return}
    var s=steps[idx],cur=D.det(s.M),sg=s.swaps%2?-1:1;
    $('.stage',body).innerHTML='<div class="row" style="flex-wrap:nowrap;gap:1rem">'+D.matHTML(s.M,{cell:stepCell(s)})+'<div class="small" style="min-width:9rem">当前值 <b>'+fmt(cur)+'</b><br>已交换 '+s.swaps+' 次，符号 '+(sg>0?'+1':'−1')+'<br>符号 × 当前值 = <b class="big" style="font-size:1.1rem">'+fmt(sg>0?cur:cur.neg())+'</b><br><span class="tiny muted">每一步都等于原行列式</span></div></div>';
    $('.txt',body).innerHTML=s.text;$('.cnt',body).textContent=(idx+1)+' / '+steps.length;
    $('.prev',body).disabled=idx===0;$('.first',body).disabled=idx===0;$('.next',body).disabled=idx===steps.length-1;
  }
  var ed=new D.MatEd($('.ed',body),PR.e152[1],function(m){A=m;build()});
  $('.pre',body).addEventListener('change',function(){ed.set(PR[this.value][1])});
  $('.pref',body).addEventListener('change',build);
  $('.next',body).addEventListener('click',function(){stop();if(idx<steps.length-1){idx++;show()}});
  $('.prev',body).addEventListener('click',function(){stop();if(idx>0){idx--;show()}});
  $('.first',body).addEventListener('click',function(){stop();idx=0;show()});
  $('.play',body).addEventListener('click',function(){if(timer){stop();return}if(idx>=steps.length-1){idx=0;show()}this.textContent='暂停';timer=setInterval(function(){if(idx<steps.length-1){idx++;show()}else stop()},1600)});
};

/* ================= 结构诊断 ================= */
function analyse(M){
  var n=M.length,out=[],Tm=D.transpose(M),i,j,k;
  function isInt(){return M.every(function(r){return r.every(function(x){return x.isInt()})})}
  function zeros(v){return v.filter(function(x){return x.isZero()}).length}
  function prop(x,y){for(var c=0;c<x.length;c++)for(var d=c+1;d<x.length;d++) if(!x[c].mul(y[d]).sub(x[d].mul(y[c])).isZero()) return false;return true}
  // 零行列
  [['行',M],['列',Tm]].forEach(function(p){p[1].forEach(function(r,i){if(r.every(function(x){return x.isZero()})) out.push(['no','第 '+(i+1)+' '+p[0]+'全为 0','值为 0（性质 2）'])})});
  // 成比例
  [['行',M],['列',Tm]].forEach(function(p){var B=p[1];for(var a=0;a<n;a++)for(var b=a+1;b<n;b++){if(B[a].every(function(x){return x.isZero()})||B[b].every(function(x){return x.isZero()})) continue;if(prop(B[a],B[b])) out.push(['no','第 '+(a+1)+'、'+(b+1)+' '+p[0]+'成比例','值为 0（性质 5）'])}});
  // 三角
  var up=true,lo=true;for(i=0;i<n;i++)for(j=0;j<n;j++){if(i>j&&!M[i][j].isZero())up=false;if(i<j&&!M[i][j].isZero())lo=false}
  if(up||lo) out.push(['ok',(up&&lo?'对角':up?'上三角':'下三角')+'形','直接等于主对角线乘积（性质 1）']);
  // 公因子
  if(isInt()){
    [['行',M],['列',Tm]].forEach(function(p){p[1].forEach(function(r,i){var g=0;r.forEach(function(x){g=(function gc(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=a%b;a=b;b=t}return a})(g,x.n)});if(g>1) out.push(['tip','第 '+(i+1)+' '+p[0]+'有公因子 '+g,'先提出来（性质 3）'])})});
  }
  // 行和/列和相等
  function sums(B){return B.map(function(r){return r.reduce(function(s,x){return s.add(x)},F(0))})}
  var rs=sums(M),cs=sums(Tm);
  if(n>2&&rs.every(function(s){return s.eq(rs[0])})&&!rs[0].isZero()) out.push(['tip','每行元素之和都等于 '+rs[0].toString(),'把各列都加到第一列，提出公因子 '+rs[0].toString()+'（例 1.5.9 的套路）']);
  if(n>2&&cs.every(function(s){return s.eq(cs[0])})&&!cs[0].isZero()) out.push(['tip','每列元素之和都等于 '+cs[0].toString(),'把各行都加到第一行，提出公因子']);
  // Vandermonde
  function vand(B){if(n<3) return false;for(var r=0;r<n;r++){if(!B[r][0].eq(1)) return false;for(var c=2;c<n;c++) if(!B[r][c].eq(B[r][c-1].mul(B[r][1]))) return false}return true}
  if(vand(M)) out.push(['ok','Vandermonde 型（按行）','值 = ∏(x_j − x_i)，x 取第 2 列']);
  else if(vand(Tm)) out.push(['ok','Vandermonde 型（按列）','值 = ∏(x_j − x_i)，x 取第 2 行']);
  // 分块三角
  for(k=1;k<n;k++){var tr=true,bl=true;for(i=0;i<k;i++)for(j=k;j<n;j++) if(!M[i][j].isZero()) tr=false;for(i=k;i<n;i++)for(j=0;j<k;j++) if(!M[i][j].isZero()) bl=false;
    if((tr||bl)&&!(up||lo)){out.push(['ok','分块三角（'+k+' + '+(n-k)+'）',(tr?'右上':'左下')+'块全为 0：|A| = 左上块 × 右下块（Laplace 定理，例 1.7.2）']);break}}
  // 最优展开
  var best={z:-1};for(i=0;i<n;i++){var zr=zeros(M[i]);if(zr>best.z) best={z:zr,t:'第 '+(i+1)+' 行'};var zc=zeros(Tm[i]);if(zc>best.z) best={z:zc,t:'第 '+(i+1)+' 列'}}
  out.push(['tip','零最多的是'+best.t+'（'+best.z+' 个零）','沿它展开只需算 '+(n-best.z)+' 个 '+(n-1)+' 阶余子式'+(best.z===n-1?'：一步降阶':'；也可先用倍加再制造零')]);
  return out;
}
W.diagnose=function(el){
  var body=frame(el);
  var PR={a:[[2,0,1,0],[1,3,0,2],[0,0,4,0],[5,1,2,1]],b:[[1,1,1,1],[1,2,4,8],[1,3,9,27],[1,4,16,64]],c:[[3,1,1,1],[1,3,1,1],[1,1,3,1],[1,1,1,3]],d:[[2,1,0,0],[1,3,0,0],[4,-1,1,2],[5,2,3,-1]],e:[[3,6,12],[2,-3,0],[5,1,2]],f:[[1,2,3],[2,4,6],[0,5,1]]};
  body.innerHTML='<div class="ctrl"><label>阶数 <select class="n">'+opt(['2','3','4','5'],'4')+'</select></label><span class="pres"><button class="btn sm" data-p="a">有很多零</button><button class="btn sm" data-p="b">Vandermonde</button><button class="btn sm" data-p="c">行和相等</button><button class="btn sm" data-p="d">分块三角</button><button class="btn sm" data-p="e">有公因子</button><button class="btn sm" data-p="f">两行成比例</button><button class="btn sm" data-p="r">随机</button></span></div><div class="w-grid"><div class="ed"></div><div class="out"></div></div>';
  var ed=new D.MatEd($('.ed',body),PR.a,function(M){
    var o=$('.out',body);if(!M){o.innerHTML=D.BAD;return}
    var res=analyse(M),icon={no:'<span class="chip neg">=0</span>',ok:'<span class="chip pos">捷径</span>',tip:'<span class="chip">提示</span>'};
    o.innerHTML='<ol class="flow v" style="margin:0">'+res.map(function(r){return '<li style="width:100%">'+icon[r[0]]+' <b>'+r[1]+'</b><br><span class="small muted">'+r[2]+'</span></li>'}).join('')+'</ol><p class="row" style="margin-top:.6rem"><span class="muted">计算结果</span><span class="big">'+fmt(D.det(M))+'</span></p>';
  });
  $('.n',body).addEventListener('change',function(){ed.setFr(D.randM(+this.value,-3,3))});
  $('.pres',body).addEventListener('click',function(e){var b=e.target.closest('[data-p]');if(!b) return;if(b.dataset.p==='r'){ed.setFr(D.randM(+$('.n',body).value,-3,3));return}var m=PR[b.dataset.p];$('.n',body).value=String(m.length);ed.set(m)});
};

/* ================= Vandermonde ================= */
W.vander=function(el){
  var body=frame(el);
  body.innerHTML='<div class="ctrl"><label>'+K('x_1,\\dots,x_n')+'（2–6 个，逗号分隔）<input class="txt xs" value="1, 2, 4, 5"></label></div><div class="out"></div>';
  function run(){
    var o=$('.out',body),xs=$('.xs',body).value.split(/[,，\s]+/).filter(Boolean).map(D.parseFr);
    if(xs.length<2||xs.length>6||xs.some(function(x){return !x})){o.innerHTML='<p class="no small">请输入 2–6 个数。</p>';return}
    var n=xs.length,M=xs.map(function(x){var r=[],p=F(1);for(var j=0;j<n;j++){r.push(p);p=p.mul(x)}return r});
    var fac=[],prod=F(1),j,i;for(j=1;j<n;j++)for(i=0;i<j;i++){fac.push('('+xs[j].tex()+'-'+D.pt(xs[i])+')');prod=prod.mul(xs[j].sub(xs[i]))}
    var chain='',V=F(1);for(var k=2;k<=n;k++){var f=F(1),parts=[];for(i=0;i<k-1;i++){f=f.mul(xs[k-1].sub(xs[i]));parts.push('('+xs[k-1].tex()+'-'+D.pt(xs[i])+')')}V=V.mul(f);chain+='<tr><td>'+K('V_{'+k+'}')+'</td><td>'+K(parts.join('')+(k>2?'\\,V_{'+(k-1)+'}':''))+'</td><td class="mono">'+fmt(V)+'</td></tr>'}
    var Dv=D.det(M);
    o.innerHTML='<div class="row scroll-x">'+D.matHTML(M,{cls:'sm'})+'<span>按消元直接计算 = <b>'+fmt(Dv)+'</b></span></div><div class="scroll-x">'+K('\\prod_{i\\lt j}(x_j-x_i)='+fac.join('')+'='+prod.tex(),true)+'</div><p class="small">递推 '+K('V_k=(x_k-x_1)\\cdots(x_k-x_{k-1})V_{k-1}')+'：</p><div class="tw"><table class="t"><tr><th>k</th><th>递推式</th><th>值</th></tr>'+chain+'</table></div>'+(Dv.isZero()?'<p class="small no">有两个 x 相同 ⇒ 两行相同 ⇒ 值为 0。</p>':'');
  }
  $('.xs',body).addEventListener('input',run);run();
};

/* ================= 对角为 x、其余为 a ================= */
W.xa=function(el){
  var body=frame(el);
  body.innerHTML='<div class="ctrl"><label>n <input class="num n" value="5"></label><label>x <input class="num x" value="3"></label><label>a <input class="num a" value="1"></label></div><div class="out"></div>';
  function run(){
    var o=$('.out',body),n=parseInt($('.n',body).value,10),x=D.parseFr($('.x',body).value),a=D.parseFr($('.a',body).value);
    if(!(n>=2&&n<=8)||!x||!a){o.innerHTML='<p class="no small">n 取 2–8，x、a 为数。</p>';return}
    var M=[];for(var i=0;i<n;i++){M.push([]);for(var j=0;j<n;j++) M[i].push(i===j?x:a)}
    var f=x.add(a.mul(n-1)),g=x.sub(a),val=f;for(i=0;i<n-1;i++) val=val.mul(g);
    o.innerHTML='<div class="row scroll-x">'+D.matHTML(M,{cls:n>5?'xs':'sm'})+'<span>直接计算 = <b>'+fmt(D.det(M))+'</b></span></div>'+K('\\bigl(x+(n-1)a\\bigr)(x-a)^{n-1}=('+x.tex()+'+'+(n-1)+'\\cdot'+D.pt(a)+')('+x.tex()+'-'+D.pt(a)+')^{'+(n-1)+'}='+val.tex(),true);
  }
  $$('input',body).forEach(function(i){i.addEventListener('input',run)});run();
};

/* ================= 等相关矩阵 ================= */
W.equicorr=function(el){
  var body=frame(el);
  body.innerHTML='<div class="ctrl"><label>变量个数 n = <b class="nv">4</b> <input type="range" class="n" min="2" max="10" value="4" aria-label="n"></label><label>ρ = <b class="rv">−0.30</b> <input type="range" class="r" min="-1" max="1" step="0.01" value="-0.3" aria-label="rho"></label></div><svg class="plot" viewBox="0 0 440 240" role="img" aria-label="|R| 随 ρ 的变化"></svg><div class="out small"></div>';
  function run(){
    var n=+$('.n',body).value,r=+$('.r',body).value;
    $('.nv',body).textContent=n;$('.rv',body).textContent=r.toFixed(2).replace('-','−');
    var f=function(t){return (1+(n-1)*t)*Math.pow(1-t,n-1)},R=[];for(var i=0;i<n;i++){R.push([]);for(var j=0;j<n;j++)R[i].push(i===j?1:r)}
    var val=f(r),num=D.detF(R),lower=-1/(n-1),ok=r>=lower-1e-9;
    var x0=46,x1=424,y0=14,y1=200,lo=-1,hi=1.1,X=function(t){return x0+(t+1)/2*(x1-x0)},Y=function(v){return y1-(Math.max(lo,Math.min(hi,v))-lo)/(hi-lo)*(y1-y0)};
    var g='<rect class="bad" x="'+X(-1)+'" y="'+y0+'" width="'+(X(lower)-X(-1))+'" height="'+(y1-y0)+'"/>';
    [-1,-.5,0,.5,1].forEach(function(t){g+='<line class="grid" x1="'+X(t)+'" y1="'+y0+'" x2="'+X(t)+'" y2="'+y1+'"/><text class="tk" x="'+X(t)+'" y="'+(y1+16)+'" text-anchor="middle">'+String(t).replace('-','−')+'</text>'});
    [-1,0,.5,1].forEach(function(v){g+='<line class="'+(v===0?'axis':'grid')+'" x1="'+x0+'" y1="'+Y(v)+'" x2="'+x1+'" y2="'+Y(v)+'"/><text class="tk" x="'+(x0-6)+'" y="'+(Y(v)+4)+'" text-anchor="end">'+String(v).replace('-','−')+'</text>'});
    var d='';for(var k=0;k<=200;k++){var t=-1+k/100;d+=(k?'L':'M')+X(t).toFixed(1)+','+Y(f(t)).toFixed(1)}
    g+='<path class="l1" d="'+d+'"/><line class="dash" x1="'+X(lower)+'" y1="'+y0+'" x2="'+X(lower)+'" y2="'+y1+'"/><circle class="dot" cx="'+X(r)+'" cy="'+Y(val)+'" r="6"/>';
    g+='<text class="tk" x="'+(x0+4)+'" y="'+(y0+12)+'">|R|</text><text class="tk" x="'+x1+'" y="'+(y1+30)+'" text-anchor="end">ρ</text>';
    $('svg',body).innerHTML=g;
    function f4(v){return Math.abs(v)<5e-5?'0':v.toFixed(4).replace('-','−')}
    $('.out',body).innerHTML='公式 '+K('(1+'+(n-1)+'\\rho)(1-\\rho)^{'+(n-1)+'}')+' = <b>'+f4(val)+'</b>　数值消元：'+f4(num)+'<br>'+(ok?'<span class="ok">|R| ≥ 0，可以是相关系数矩阵</span>':'<span class="no">|R| &lt; 0：不存在 '+n+' 个两两相关系数都是 '+r.toFixed(2).replace('-','−')+' 的随机变量</span>')+'<br><span class="muted">红色区域 '+K('\\rho\\lt -\\tfrac{1}{n-1}')+'。变量越多，“彼此都负相关”越不可能。</span>';
  }
  $('.n',body).addEventListener('input',run);$('.r',body).addEventListener('input',run);run();
};

/* ================= 三对角递推 ================= */
W.recur=function(el){
  var body=frame(el);
  body.innerHTML='<div class="ctrl"><label>主对角 a <input class="num a" value="2"></label><label>上对角 b <input class="num b" value="1"></label><label>下对角 c <input class="num c" value="1"></label><label>n ≤ <input class="num n" value="8"></label></div><div class="btns"><button class="btn sm" data-p="2,1,1">a=2, b=c=1</button><button class="btn sm" data-p="1,1,-1">a=1, b=1, c=−1（Fibonacci）</button><button class="btn sm" data-p="2,-1,-1">a=2, b=c=−1（差分矩阵）</button><button class="btn sm" data-p="3,1,2">a=3, b=1, c=2</button></div><div class="out"></div>';
  function run(){
    var o=$('.out',body),a=D.parseFr($('.a',body).value),b=D.parseFr($('.b',body).value),c=D.parseFr($('.c',body).value),n=parseInt($('.n',body).value,10);
    if(!a||!b||!c||!(n>=1&&n<=12)){o.innerHTML='<p class="no small">请输入合法的数，n 取 1–12。</p>';return}
    var Dk=[F(1),a],rows='',bc=b.mul(c);
    for(var k=2;k<=n;k++) Dk.push(a.mul(Dk[k-1]).sub(bc.mul(Dk[k-2])));
    for(k=1;k<=n;k++){var M=[];for(var i=0;i<k;i++){M.push([]);for(var j=0;j<k;j++) M[i].push(i===j?a:(j===i+1?b:(i===j+1?c:F(0))))}var dv=D.det(M);
      rows+='<tr><td>'+k+'</td><td class="mono">'+(k>=2?fmt(a)+'·'+fmt(Dk[k-1])+' − '+fmt(bc)+'·'+fmt(Dk[k-2]):'—')+'</td><td class="mono"><b>'+fmt(Dk[k])+'</b></td><td class="mono">'+fmt(dv)+' '+(dv.eq(Dk[k])?'<span class="ok">✓</span>':'')+'</td></tr>'}
    var show=[];for(i=0;i<Math.min(n,5);i++){show.push([]);for(j=0;j<Math.min(n,5);j++) show[i].push(i===j?a:(j===i+1?b:(i===j+1?c:F(0))))}
    o.innerHTML='<div class="row"><span>'+K('D_'+Math.min(n,5)+'=')+'</span>'+D.matHTML(show,{cls:'sm',cell:function(i,j){return Math.abs(i-j)>1?'off':''}})+'<span class="small muted">按第一行展开 ⇒ '+K('D_n=aD_{n-1}-bc\\,D_{n-2}')+'</span></div><div class="tw"><table class="t"><tr><th>n</th><th>递推计算</th><th>'+K('D_n')+'</th><th>直接计算</th></tr>'+rows+'</table></div>';
  }
  $$('input',body).forEach(function(i){i.addEventListener('input',run)});
  body.addEventListener('click',function(e){var p=e.target.closest('[data-p]');if(!p) return;var v=p.dataset.p.split(',');$('.a',body).value=v[0];$('.b',body).value=v[1];$('.c',body).value=v[2];run()});
  run();
};

/* ================= AR(1) 相关矩阵 ================= */
W.ar1=function(el){
  var body=frame(el);
  body.innerHTML='<div class="ctrl"><label>n = <b class="nv">5</b> <input type="range" class="n" min="2" max="10" value="5" aria-label="n"></label><label>ρ = <b class="rv">0.60</b> <input type="range" class="r" min="-0.99" max="0.99" step="0.01" value="0.6" aria-label="rho"></label></div><div class="out"></div>';
  function run(){
    var n=+$('.n',body).value,r=+$('.r',body).value,R=[],S=[];$('.nv',body).textContent=n;$('.rv',body).textContent=r.toFixed(2).replace('-','−');
    for(var i=0;i<n;i++){R.push([]);S.push([]);for(var j=0;j<n;j++){var v=Math.pow(r,Math.abs(i-j));R[i].push(v);S[i].push(v.toFixed(2).replace('-','−'))}}
    var num=D.detF(R),fo=Math.pow(1-r*r,n-1);
    $('.out',body).innerHTML='<div class="scroll-x">'+D.matHTML(S,{cls:n>6?'xs':'sm',show:function(v){return v}})+'</div><p class="small">'+K('|R|=(1-\\rho^2)^{n-1}')+' = <b>'+fo.toPrecision(5)+'</b>　数值消元：'+num.toPrecision(5)+'</p><p class="small muted">|ρ| 越接近 1，相邻时刻越“同步”，|R| 越接近 0；数据在 n 维空间里被压成越来越扁的一片。</p>';
  }
  $('.n',body).addEventListener('input',run);$('.r',body).addEventListener('input',run);run();
};

/* ================= §1.6 拆列：27 项只剩 6 项 ================= */
W.colsplit=function(el){
  var body=frame(el);
  body.innerHTML='<div class="w-grid"><div><div class="ed"></div><label class="small" style="display:flex;gap:.4rem;align-items:center;margin-top:.4rem"><input type="checkbox" class="only"> 只显示非零项</label></div><div class="sum small"></div></div><div class="cards3" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(6.6rem,1fr));gap:.35rem;margin-top:.6rem"></div>';
  var M=null;
  function run(){
    var box=$('.cards3',body);if(!M){box.innerHTML=D.BAD;return}
    var only=$('.only',body).checked,h='',s=F(0),cnt=0;
    for(var a=0;a<3;a++)for(var b=0;b<3;b++)for(var c=0;c<3;c++){
      var k=[a,b,c],rep=a===b||b===c||a===c,p=M[a][0].mul(M[b][1]).mul(M[c][2]),N=D.inv(k),sg=rep?0:(N%2?-1:1),v=rep?F(0):(sg>0?p:p.neg());
      if(!rep){s=s.add(v);cnt++}
      if(only&&rep) continue;
      h+='<div class="panel" style="padding:.35rem .45rem;'+(rep?'opacity:.38':'')+'"><div class="mono tiny">('+(a+1)+','+(b+1)+','+(c+1)+')</div><div class="small">'+K('|e_{'+(a+1)+'},e_{'+(b+1)+'},e_{'+(c+1)+'}|')+'</div><div class="mono small">= '+(rep?'0':(sg>0?'+1':'−1'))+'</div>'+(rep?'':'<div class="mono tiny">项 '+fmt(v)+'</div>')+'</div>';
    }
    box.innerHTML=h;
    $('.sum',body).innerHTML='<p>27 个行列式中有 <b>21</b> 个出现重复的 '+K('e_i')+'（两列相同，值为 0），只剩 <b>'+cnt+'</b> = 3! 个排列项。</p><p>它们的和 = <b>'+fmt(s)+'</b>，直接计算 = '+fmt(D.det(M))+' '+(s.eq(D.det(M))?'<span class="ok">✓</span>':'')+'</p>';
  }
  new D.MatEd($('.ed',body),[[1,-1,2],[2,0,3],[-1,-3,2]],function(m){M=m;run()});
  $('.only',body).addEventListener('change',run);
};

/* ================= §1.6 逆序数与相邻对换 ================= */
W.perm=function(el){
  var body=frame(el);
  body.innerHTML='<div class="ctrl"><label>排列 <input class="txt pin" value="4, 1, 3, 2"></label><button class="btn sm pri go">计算</button><button class="btn sm rnd">随机</button></div><div class="view"></div><div class="btns"><button class="btn sm step">相邻对换一步</button><button class="btn sm any">任意对换前两数</button><button class="btn sm reset">还原</button></div><div class="msg"></div>';
  var p=[4,1,3,2],orig=p.slice(),N0=4,sw=0,last=null,msg=$('.msg',body);
  function parse(){
    var a=$('.pin',body).value.split(/[,，\s]+/).filter(Boolean).map(Number),n=a.length;
    var ok=n>=2&&n<=9&&a.slice().sort(function(x,y){return x-y}).every(function(x,i){return x===i+1});
    if(!ok){msg.innerHTML='<span class="no">请输入 1, 2, …, n 的一个排列（2 ≤ n ≤ 9）。</span>';return}
    p=a;orig=a.slice();N0=D.inv(a);sw=0;last=null;msg.innerHTML='';render();
  }
  function render(){
    var n=p.length,ms=p.map(function(x,i){return p.slice(i+1).filter(function(y){return y<x}).length}),N=D.inv(p),pairs=[];
    for(var i=0;i<n;i++)for(var j=i+1;j<n;j++) if(p[i]>p[j]) pairs.push([i,j]);
    $('.view',body).innerHTML='<div class="permrow">'+p.map(function(x,i){return '<div class="pcol"><div class="pbox '+(last&&last.indexOf(i)>=0?'sw':'')+'" data-pi="'+i+'">'+x+'</div><div class="pm">m='+ms[i]+'</div></div>'}).join('')+'</div>'+
      '<p class="small">'+K('m_i')+' = 排在 '+K('k_i')+' 后面且比它小的数的个数。'+K('N=')+' '+ms.slice(0,-1).join(' + ')+' = <b>'+N+'</b>　<span class="chip '+(N%2?'neg':'pos')+'">'+(N%2?'奇排列':'偶排列')+'</span></p><div>'+
      (pairs.length?pairs.map(function(q){return '<button type="button" class="chip btnlike" data-a="'+q[0]+'" data-b="'+q[1]+'">('+p[q[0]]+', '+p[q[1]]+')</button>'}).join(''):'<span class="small muted">没有逆序对：这是常序排列。</span>')+'</div><p class="tiny muted">点逆序对，可以看到是哪两个数。</p>';
  }
  $('.view',body).addEventListener('click',function(e){var c=e.target.closest('[data-a]');$$('.pbox',body).forEach(function(b){b.classList.toggle('hv',!!c&&(b.dataset.pi===c.dataset.a||b.dataset.pi===c.dataset.b))})});
  $('.go',body).addEventListener('click',parse);$('.pin',body).addEventListener('keydown',function(e){if(e.key==='Enter') parse()});
  $('.rnd',body).addEventListener('click',function(){var n=D.randInt(4,7),a=[];for(var i=1;i<=n;i++)a.push(i);for(i=n-1;i>0;i--){var j=D.randInt(0,i),t=a[i];a[i]=a[j];a[j]=t}$('.pin',body).value=a.join(', ');parse()});
  $('.step',body).addEventListener('click',function(){
    var i=-1;for(var k=0;k<p.length-1;k++) if(p[k]>p[k+1]){i=k;break}
    if(i<0){msg.innerHTML='已是常序排列。共用了 <b>'+sw+'</b> 次相邻对换，恰好等于原排列的逆序数 '+N0+'（引理 1.6.3）。';return}
    var t=p[i];p[i]=p[i+1];p[i+1]=t;sw++;last=[i,i+1];render();var N=D.inv(p);
    msg.innerHTML='第 '+sw+' 次：交换相邻的 '+p[i+1]+' 和 '+p[i]+'，逆序数减 1，变为 '+N+'，奇偶性改变。'+(N===0?'<br><b>完成：</b>共 '+sw+' 次，等于原逆序数 '+N0+'。':'');
  });
  $('.any',body).addEventListener('click',function(){var before=D.inv(p),t=p[0];p[0]=p[1];p[1]=t;last=[0,1];render();msg.innerHTML='交换前两个数：逆序数 '+before+' → '+D.inv(p)+'，奇偶性改变（引理 1.6.1）。这正是引理 1.6.2 证明里“奇偶配对”的那个映射。'});
  $('.reset',body).addEventListener('click',function(){p=orig.slice();sw=0;last=null;msg.innerHTML='';render()});
  render();
};

/* ================= §1.6 放车：每行每列各取一个 ================= */
W.rook=function(el){
  var body=frame(el);
  var PR={3:[[1,-1,2],[2,0,3],[-1,-3,2]],4:[[1,0,2,1],[2,-1,1,0],[1,0,0,3],[-1,0,2,1]],5:[[1,0,-1,3,1],[0,2,-5,4,1],[3,-2,-1,1,0],[0,0,2,1,3],[1,3,-1,5,1]]};
  body.innerHTML='<div class="ctrl"><label>阶数 <select class="n">'+opt(['3','4','5'],'4')+'</select></label><button class="btn sm rnd">随机一项</button><button class="btn sm clr">清空</button></div><div class="w-grid"><div><div class="board rook"></div><p class="tiny muted">在每一列点一个格子；同一行只能选一次。</p></div><div class="out"></div></div>';
  var n=4,M,pick;
  function reset(){n=+$('.n',body).value;M=D.toM(PR[n]);pick=[];for(var j=0;j<n;j++) pick.push(-1);draw()}
  function draw(){
    var used={};pick.forEach(function(r){if(r>=0)used[r]=1});
    var b=$('.board',body);b.style.gridTemplateColumns='repeat('+n+',auto)';
    var h='';for(var i=0;i<n;i++)for(var j=0;j<n;j++){var on=pick[j]===i,blk=!on&&(pick[j]>=0||used[i]);h+='<button type="button" class="'+(on?'pick':blk?'blk':'')+'" data-i="'+i+'" data-j="'+j+'" aria-label="a'+(i+1)+(j+1)+'">'+fmt(M[i][j])+'</button>'}
    b.innerHTML=h;
    var o=$('.out',body),done=pick.every(function(r){return r>=0});
    if(!done){o.innerHTML='<p class="small">已选 '+pick.filter(function(r){return r>=0}).length+' / '+n+' 列。</p><p class="small muted">选满后，这 n 个元素就是完全展开式里的一项：每行每列恰好一个。一共有 '+n+'! = '+[1,1,2,6,24,120][n]+' 种选法。</p>';return}
    var N=D.inv(pick),prod=F(1);pick.forEach(function(r,j){prod=prod.mul(M[r][j])});var v=N%2?prod.neg():prod;
    o.innerHTML='<p>行号排列 '+K('(k_1,\\dots,k_'+n+')=('+pick.map(function(r){return r+1}).join(',')+')')+'</p><p>逆序数 '+K('N='+N)+'　<span class="chip '+(N%2?'neg':'pos')+'">'+(N%2?'奇排列，取负号':'偶排列，取正号')+'</span></p><p>'+K('(-1)^{'+N+'}'+pick.map(function(r,j){return 'a_{'+(r+1)+(j+1)+'}'}).join(''))+' = <b>'+fmt(v)+'</b></p>'+(prod.isZero()?'<p class="small muted">含有 0 元素，这一项为 0。</p>':'');
  }
  $('.board',body).addEventListener('click',function(e){var b=e.target.closest('button');if(!b) return;var i=+b.dataset.i,j=+b.dataset.j;
    if(pick[j]===i){pick[j]=-1}else{for(var c=0;c<n;c++) if(pick[c]===i) pick[c]=-1;pick[j]=i}draw()});
  $('.n',body).addEventListener('change',reset);$('.clr',body).addEventListener('click',function(){pick=pick.map(function(){return -1});draw()});
  $('.rnd',body).addEventListener('click',function(){var a=[];for(var i=0;i<n;i++)a.push(i);for(i=n-1;i>0;i--){var j=D.randInt(0,i),t=a[i];a[i]=a[j];a[j]=t}pick=a;draw()});
  reset();
};

/* ================= §1.6 完全展开 ================= */
W.fullexp=function(el){
  var body=frame(el);
  var FE={3:[[1,-1,2],[2,0,3],[-1,-3,2]],4:[[1,0,2,1],[2,-1,1,0],[1,0,0,3],[-1,0,2,1]]};
  body.innerHTML='<div class="ctrl"><label>阶数 <select class="n">'+opt(['3','4'],'3')+'</select></label></div><div class="w-grid"><div class="ed"></div><div class="sum"></div></div><div class="tw tab" style="max-height:22rem;overflow-y:auto"></div>';
  var M=null;
  function run(){
    if(!M){$('.tab',body).innerHTML=D.BAD;return}
    var n=M.length,sum=F(0),rows='',ev=0,od=0;
    D.perms(n).forEach(function(q){var N=D.inv(q),t=F(1);q.forEach(function(k,j){t=t.mul(M[k][j])});var v=N%2?t.neg():t;sum=sum.add(v);if(N%2)od++;else ev++;
      rows+='<tr class="'+(t.isZero()?'z':'')+'"><td class="mono">('+q.map(function(x){return x+1}).join(',')+')</td><td>'+N+'</td><td>'+(N%2?'<span class="chip neg">−</span>':'<span class="chip pos">+</span>')+'</td><td>'+K(q.map(function(k,j){return 'a_{'+(k+1)+(j+1)+'}'}).join(''))+'</td><td class="mono">'+fmt(v)+'</td></tr>'});
    $('.tab',body).innerHTML='<table class="t"><tr><th>排列</th><th>N</th><th>号</th><th>项</th><th>带号值</th></tr>'+rows+'</table>';
    $('.sum',body).innerHTML='<p>'+n+'! = '+(n===3?6:24)+' 项之和 = <b class="big">'+fmt(sum)+'</b></p><p class="small">直接计算 = '+fmt(D.det(M))+' '+(sum.eq(D.det(M))?'<span class="ok">✓</span>':'')+'</p><p class="small">偶排列 '+ev+' 个，奇排列 '+od+' 个，各占一半（引理 1.6.2）。灰色行含 0 因子。</p>';
  }
  function load(){new D.MatEd($('.ed',body),FE[$('.n',body).value],function(m){M=m;run()})}
  $('.n',body).addEventListener('change',load);load();
};

/* ================= §1.6 计算量对比 ================= */
W.complexity=function(el){
  var body=frame(el),rows='';
  function fact(n){var f=1;for(var i=2;i<=n;i++)f*=i;return f}
  function sci(x){if(x<1e9) return Math.round(x).toLocaleString('en-US');var e=Math.floor(Math.log10(x));return (x/Math.pow(10,e)).toFixed(2)+'×10<sup>'+e+'</sup>'}
  function human(s){if(s<1e-3) return '不到 1 毫秒';if(s<1) return Math.round(s*1000)+' 毫秒';if(s<60) return s.toFixed(1)+' 秒';if(s<3600) return (s/60).toFixed(1)+' 分钟';if(s<86400) return (s/3600).toFixed(1)+' 小时';if(s<86400*365) return Math.round(s/86400)+' 天';var y=s/86400/365;return y<1e6?Math.round(y).toLocaleString('en-US')+' 年':sci(y)+' 年'}
  [3,5,8,10,12,15,20,25].forEach(function(n){var f=fact(n),ops=f*(n-1);rows+='<tr><td>'+n+'</td><td class="mono">'+sci(f)+'</td><td>'+human(ops/1e9)+'</td><td class="mono">'+Math.round(2*n*n*n/3).toLocaleString('en-US')+'</td></tr>'});
  body.innerHTML='<div class="tw"><table class="t"><tr><th>n</th><th>完全展开的项数 n!</th><th>逐项计算（每秒 10⁹ 次乘法）</th><th>消元法乘法次数 ≈ 2n³/3</th></tr>'+rows+'</table></div><p class="tiny muted">完全展开每项要做 n−1 次乘法。统计软件计算行列式、解正规方程都用消元（LU / Cholesky 分解）。</p>';
};

/* ================= §1.7 Laplace 定理 ================= */
W.laplace=function(el){
  var body=frame(el);
  var PR={t:['教材 4 阶例（第 2、3 行）',[[1,2,-1,3],[7,0,5,2],[-2,4,6,1],[2,3,1,4]],'row',[1,2]],e171:['例 1.7.1（第 1、3 列）',[[-1,1,1,2,-1],[0,-1,0,1,2],[2,1,1,3,-1],[1,2,2,1,0],[0,3,0,1,3]],'col',[0,2]],
    x1:['习题 1.7 第 1(1) 题（第 1、3 行）',[[1,2,0,1],[-1,0,2,1],[3,1,-1,-1],[1,-1,1,-1]],'row',[0,2]],x2:['习题 1.7 第 1(2) 题（第 1、3 行）',[[3,-1,0,-3],[0,2,7,-2],[5,0,2,1],[1,-1,2,3]],'row',[0,2]],blk:['分块三角（例 1.7.2 型）',[[2,1,0,0],[1,3,0,0],[4,-1,1,2],[5,2,3,-1]],'row',[0,1]]};
  body.innerHTML='<div class="ctrl"><select class="pre">'+opt(Object.keys(PR).map(function(k){return [k,PR[k][0]]}),'t')+'</select><select class="mode">'+opt([['row','取定行'],['col','取定列']],'row')+'</select><span class="chk"></span></div><div class="w-grid"><div class="ed"></div><div class="sum"></div></div><div class="tw tab"></div>';
  var M=null,sel=[1,2],lastN=0;
  function checks(n){$('.chk',body).innerHTML=Array.from({length:n},function(_,i){return '<label class="small"><input type="checkbox" value="'+i+'"'+(sel.indexOf(i)>=0?' checked':'')+'> '+(i+1)+'</label>'}).join(' ')}
  $('.chk',body).addEventListener('change',function(e){var v=+e.target.value;if(e.target.checked){if(sel.indexOf(v)<0)sel.push(v)}else sel=sel.filter(function(x){return x!==v});run()});
  function run(){
    if(!M){$('.tab',body).innerHTML=D.BAD;return}
    var n=M.length;if(n!==lastN){sel=sel.filter(function(i){return i<n});checks(n);lastN=n}
    var I=sel.slice().sort(),k=I.length,mode=$('.mode',body).value,Wd=mode==='row'?'行':'列';
    if(k<1||k>=n){$('.tab',body).innerHTML='<p class="small muted" style="padding:.6rem">请勾选 1 到 '+(n-1)+' 个'+Wd+'。</p>';$('.sum',body).innerHTML='';return}
    var all=Array.from({length:n},function(_,i){return i}),rows='',sum=F(0),nz=0,cs=D.combos(all,k);
    cs.forEach(function(C){
      var R=mode==='row'?I:C,Cs=mode==='row'?C:I,rR=all.filter(function(i){return R.indexOf(i)<0}),rC=all.filter(function(j){return Cs.indexOf(j)<0});
      var sub=R.map(function(i){return Cs.map(function(j){return M[i][j]})}),comp=rR.map(function(i){return rC.map(function(j){return M[i][j]})});
      var d1=D.det(sub),d2=D.det(comp),p=R.reduce(function(a,i){return a+i+1},0)+Cs.reduce(function(a,j){return a+j+1},0),t=(p%2?d2.neg():d2).mul(d1);sum=sum.add(t);if(!d1.isZero())nz++;
      rows+='<tr class="'+(d1.isZero()?'z':'')+'"><td class="mono">'+(mode==='row'?'列 ':'行 ')+C.map(function(x){return x+1}).join(',')+'</td><td>'+D.matHTML(sub,{cls:'xs'})+'</td><td class="mono">'+fmt(d1)+'</td><td>(−1)<sup>'+p+'</sup></td><td>'+D.matHTML(comp,{cls:'xs'})+'</td><td class="mono">'+fmt(d2)+'</td><td class="mono">'+fmt(t)+'</td></tr>';
    });
    $('.tab',body).innerHTML='<table class="t"><tr><th>另一组</th><th>k 阶子式</th><th>值</th><th>符号</th><th>余子式</th><th>值</th><th>乘积</th></tr>'+rows+'<tr class="sum"><td colspan="6">C('+n+','+k+') = '+cs.length+' 项，非零子式 '+nz+' 个</td><td class="mono">'+fmt(sum)+'</td></tr></table>';
    $('.sum',body).innerHTML='<p>取定第 '+I.map(function(i){return i+1}).join('、')+' '+Wd+'</p><p>Laplace 展开 = <span class="big">'+fmt(sum)+'</span></p><p class="small">直接计算 = '+fmt(D.det(M))+' '+(sum.eq(D.det(M))?'<span class="ok">✓</span>':'')+'</p>';
  }
  function load(key){var p=PR[key];$('.mode',body).value=p[2];sel=p[3].slice();lastN=0;new D.MatEd($('.ed',body),p[1],function(m){M=m;run()})}
  $('.pre',body).addEventListener('change',function(){load(this.value)});$('.mode',body).addEventListener('change',run);
  load('t');
};

/* ================= 练习：随机出题 ================= */
W.drill=function(el){
  var body=frame(el);
  body.innerHTML='<div class="ctrl"><label>阶数 <select class="n">'+opt([['3','3 阶'],['4','4 阶']],'3')+'</select></label><label>难度 <select class="lv">'+opt([['1','基础（有较多 0）'],['2','标准']],'1')+'</select></label><button class="btn sm pri new">出一道题</button></div><div class="q"></div><div class="frow row"><input class="txt ans" placeholder="你的答案" autocomplete="off" aria-label="答案"><button class="btn sm pri chk">检查</button><button class="btn sm sol">看解答</button><span class="fmsg small"></span></div><div class="steps"></div><p class="small muted stat"></p>';
  var M=null,tries=0,right=0;
  function gen(){
    var n=+$('.n',body).value,lv=+$('.lv',body).value,A;
    do{A=[];for(var i=0;i<n;i++){A.push([]);for(var j=0;j<n;j++){var z=lv===1&&Math.random()<.35;A[i].push(z?0:D.randInt(-3,4))}}}while(D.det(D.toM(A)).isZero()&&Math.random()<.85);
    M=D.toM(A);$('.q',body).innerHTML='<div class="row">'+K('|A|=')+D.matHTML(M)+'</div>';$('.steps',body).innerHTML='';$('.fmsg',body).innerHTML='';$('.ans',body).value='';
  }
  $('.new',body).addEventListener('click',gen);
  function check(){var v=D.parseFr($('.ans',body).value),m=$('.fmsg',body);if(!v){m.innerHTML='<span class="muted">请输入一个数</span>';return}tries++;var ok=v.eq(D.det(M));if(ok)right++;m.innerHTML=ok?'<span class="ok">正确</span>':'<span class="no">不对，再算一遍或看解答</span>';$('.stat',body).textContent='本次已检查 '+tries+' 次，答对 '+right+' 次。'}
  $('.chk',body).addEventListener('click',check);$('.ans',body).addEventListener('keydown',function(e){if(e.key==='Enter')check()});
  $('.sol',body).addEventListener('click',function(){
    var st=elimSteps(M,true);
    $('.steps',body).innerHTML='<ol style="padding-left:1.2rem">'+st.map(function(s){return '<li style="margin:.5rem 0"><div class="small">'+s.text+'</div><div class="scroll-x">'+D.matHTML(s.M,{cls:'sm',cell:stepCell(s)})+'</div></li>'}).join('')+'</ol><p>答案：<b class="big">'+fmt(D.det(M))+'</b></p>';
  });
  gen();
};

/* ================= 清单（本机记忆勾选） ================= */
W.checklist=function(el){
  var key='ck-'+(el.dataset.key||'x'),st=D.store.get(key,{});
  $$('input[type=checkbox]',el).forEach(function(c,i){c.checked=!!st[i];c.addEventListener('change',function(){st[i]=c.checked;D.store.set(key,st);upd()})});
  var bar=document.createElement('p');bar.className='small muted';el.parentNode.insertBefore(bar,el);
  function upd(){var a=$$('input[type=checkbox]',el),d=a.filter(function(c){return c.checked}).length;bar.innerHTML='已掌握 <b>'+d+'</b> / '+a.length+'（勾选记录只保存在这台设备的浏览器里）'}
  upd();
};
})();
;(function(){
'use strict';
var D=window.D,W=window.WIDGETS,esc=D.esc;
/* ================= 课程主页：章节卡片 ================= */
W.chapters=function(el){
  var chs=D.chapters||[],v=D.store.get('visited',{});
  var pages=Array.prototype.slice.call(document.querySelectorAll('template[data-route]'));
  el.innerHTML=chs.map(function(ch){
    var cp=pages.filter(function(t){return +t.dataset.chapter===ch.no}),seen=cp.filter(function(t){return v[t.dataset.route]}).length;
    var first=cp.filter(function(t){return /^s/.test(t.dataset.route)})[0];
    return '<div class="chap'+(ch.ready?'':' soon')+'"><div class="chap-no"><span>第</span><b>'+ch.cn+'</b><span>章</span></div><div class="chap-main"><div class="chap-t">'+esc(ch.title)+(ch.ready?'<span class="chip pos">已上线 · '+cp.length+' 页</span>':'<span class="chip">筹备中</span>')+'</div><p class="chap-d">'+esc(ch.topics)+'</p><p class="chap-s"><span class="tiny">统计联系</span> '+esc(ch.stat)+'</p>'+
      (ch.ready?'<div class="chap-p"><div class="bar"><i style="width:'+Math.round(seen/Math.max(1,cp.length)*100)+'%"></i></div><span class="tiny muted">已浏览 '+seen+' / '+cp.length+'</span></div><div class="btns"><a class="btn sm pri" href="#'+ch.route+'">阅读</a>'+(first?'<button class="btn sm" type="button" data-slides-go="'+first.dataset.route+'">放映</button>':'')+'</div>':'')+'</div></div>';
  }).join('');
};
})();
;(function(){
'use strict';
var D=window.D,W=window.WIDGETS,K=D.K;
/* ================= 课程主页：线性变换示意图 ================= */
W.lintrans=function(el){
  var A=[[1.6,0.6],[0.4,1.1]],E=[[2,1],[3,-4]],L=[1.9,0.8];
  var VW=400,VH=320,O=[196,178],S=48;
  el.innerHTML='<div class="fig-stage"><svg class="plot lt" viewBox="0 0 '+VW+' '+VH+'" role="img" aria-label="方格网在矩阵 A 作用下变成平行四边形网格"><defs><clipPath id="ltClip"><rect x="0" y="0" width="'+VW+'" height="'+VH+'" rx="14"/></clipPath>'+
    '<marker id="ltA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--accent)"/></marker>'+
    '<marker id="ltB" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--stat)"/></marker></defs><g clip-path="url(#ltClip)"><g class="lt-dyn"></g></g></svg>'+
    '<div class="fig-mat">'+K('A=\\begin{pmatrix}1.6&0.6\\\\0.4&1.1\\end{pmatrix}')+'</div>'+
    '<button type="button" class="fig-play" aria-label="暂停动画">❚❚</button></div>'+
    '<figcaption><span><i class="sw a"></i>线性映射 \u2002'+K('\\boldsymbol x\\mapsto A\\boldsymbol x')+' 把方格网变成平行四边形网</span><span><i class="sw s"></i>单位正方形的面积变为 '+K('\\det A=1.52')+'</span><span><i class="sw w"></i>虚线方向只伸缩不转向：特征向量，'+K('\\lambda_1=1.9,\\ \\lambda_2=0.8')+'</span></figcaption>';
  var g=el.querySelector('.lt-dyn'),btn=el.querySelector('.fig-play');
  function P(x,y){return (O[0]+x*S).toFixed(1)+','+(O[1]-y*S).toFixed(1)}
  function draw(t){
    var M=[[1+t*(A[0][0]-1),t*A[0][1]],[t*A[1][0],1+t*(A[1][1]-1)]];
    function T(x,y){return [M[0][0]*x+M[0][1]*y,M[1][0]*x+M[1][1]*y]}
    var h='',k,a,b;
    for(k=-8;k<=8;k++){
      a=T(k,-8);b=T(k,8);h+='<line class="lt-g'+(k===0?' ax':'')+'" points="" x1="'+P(a[0],a[1]).split(',')[0]+'" y1="'+P(a[0],a[1]).split(',')[1]+'" x2="'+P(b[0],b[1]).split(',')[0]+'" y2="'+P(b[0],b[1]).split(',')[1]+'"/>';
      a=T(-8,k);b=T(8,k);h+='<line class="lt-g'+(k===0?' ax':'')+'" x1="'+P(a[0],a[1]).split(',')[0]+'" y1="'+P(a[0],a[1]).split(',')[1]+'" x2="'+P(b[0],b[1]).split(',')[0]+'" y2="'+P(b[0],b[1]).split(',')[1]+'"/>';
    }
    E.forEach(function(v){var n=Math.hypot(v[0],v[1]),u=[v[0]/n*9,v[1]/n*9];h+='<line class="lt-eig" x1="'+P(-u[0],-u[1]).split(',')[0]+'" y1="'+P(-u[0],-u[1]).split(',')[1]+'" x2="'+P(u[0],u[1]).split(',')[0]+'" y2="'+P(u[0],u[1]).split(',')[1]+'"/>'});
    var c=[T(0,0),T(1,0),T(1,1),T(0,1)];
    h+='<polygon class="lt-sq" points="'+c.map(function(p){return P(p[0],p[1])}).join(' ')+'"/>';
    var e1=T(1,0),e2=T(0,1),o=P(0,0).split(',');
    h+='<line class="lt-v1" x1="'+o[0]+'" y1="'+o[1]+'" x2="'+P(e1[0],e1[1]).split(',')[0]+'" y2="'+P(e1[0],e1[1]).split(',')[1]+'" marker-end="url(#ltA)"/>';
    h+='<line class="lt-v2" x1="'+o[0]+'" y1="'+o[1]+'" x2="'+P(e2[0],e2[1]).split(',')[0]+'" y2="'+P(e2[0],e2[1]).split(',')[1]+'" marker-end="url(#ltB)"/>';
    E.forEach(function(v,i){var n=Math.hypot(v[0],v[1]),s=1+t*(L[i]-1),p=[v[0]/n*s*1.6,v[1]/n*s*1.6],q=P(p[0],p[1]).split(',');h+='<circle class="lt-dot" cx="'+q[0]+'" cy="'+q[1]+'" r="5"/>'});
    var l1=P(e1[0]+.15,e1[1]-.2).split(','),l2=P(e2[0]-.15,e2[1]+.35).split(',');
    h+='<text class="lt-t a" x="'+l1[0]+'" y="'+l1[1]+'">'+(t>.5?'Ae₁':'e₁')+'</text><text class="lt-t s" x="'+l2[0]+'" y="'+l2[1]+'" text-anchor="end">'+(t>.5?'Ae₂':'e₂')+'</text>';
    g.innerHTML=h.replace(/ points=""/g,'');
  }
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,playing=!reduce,visible=true,t0=null,raf=0,CYC=7000;
  function ease(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}
  function phase(ms){var p=(ms%CYC)/CYC;if(p<.3) return ease(p/.3);if(p<.55) return 1;if(p<.85) return 1-ease((p-.55)/.3);return 0}
  var last=1;
  function loop(now){if(t0===null)t0=now-CYC*.3;last=phase(now-t0);draw(last);if(playing&&visible&&!document.hidden) raf=requestAnimationFrame(loop);else raf=0}
  function start(){if(!raf&&playing&&visible){t0=null;raf=requestAnimationFrame(loop)}}
  btn.addEventListener('click',function(){playing=!playing;btn.textContent=playing?'❚❚':'▶';btn.setAttribute('aria-label',playing?'暂停动画':'播放动画');if(playing)start()});
  if('IntersectionObserver' in window) new IntersectionObserver(function(es){visible=es[0].isIntersecting;start()}).observe(el);
  document.addEventListener('visibilitychange',start);
  draw(1);if(reduce){btn.textContent='▶';btn.setAttribute('aria-label','播放动画')}else start();
};
})();
