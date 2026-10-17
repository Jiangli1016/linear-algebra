/* 行列式课程网站 · 核心：有理数、行列式计算、渲染工具、页面组件与路由 */
(function(){
'use strict';

/* ================= 有理数（精确计算） ================= */
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=a%b;a=b;b=t}return a}
function Fr(n,d){
  if(d===undefined) d=1;
  if(d===0) throw new Error('除数为 0');
  if(d<0){n=-n;d=-d}
  var g=gcd(n,d)||1;
  this.n=(n/g)||0; this.d=this.n===0?1:d/g;
}
function F(x){return x instanceof Fr?x:new Fr(x)}
Fr.prototype.add=function(o){o=F(o);return new Fr(this.n*o.d+o.n*this.d,this.d*o.d)};
Fr.prototype.sub=function(o){o=F(o);return new Fr(this.n*o.d-o.n*this.d,this.d*o.d)};
Fr.prototype.mul=function(o){o=F(o);return new Fr(this.n*o.n,this.d*o.d)};
Fr.prototype.div=function(o){o=F(o);return new Fr(this.n*o.d,this.d*o.n)};
Fr.prototype.neg=function(){return new Fr(-this.n,this.d)};
Fr.prototype.isZero=function(){return this.n===0};
Fr.prototype.eq=function(o){o=F(o);return this.n===o.n&&this.d===o.d};
Fr.prototype.val=function(){return this.n/this.d};
Fr.prototype.isInt=function(){return this.d===1};
Fr.prototype.toString=function(){return this.d===1?String(this.n):this.n+'/'+this.d};
Fr.prototype.tex=function(){return this.d===1?String(this.n):(this.n<0?'-':'')+'\\frac{'+Math.abs(this.n)+'}{'+this.d+'}'};
function toM(a){return a.map(function(r){return r.map(F)})}
function parseFr(s){
  s=String(s).trim().replace(/[−–—]/g,'-').replace(/／/g,'/').replace(/\s+/g,'');
  if(s==='') return null;
  var m=s.match(/^([+-]?\d+)\/(\d+)$/);
  if(m){var d=+m[2];return d===0?null:new Fr(+m[1],d)}
  if(!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
  var x=parseFloat(s);
  if(Number.isInteger(x)) return new Fr(x);
  var k=Math.min((s.split('.')[1]||'').length,6),p=Math.pow(10,k);
  return new Fr(Math.round(x*p),p);
}
function fmt(f){
  if(!(f instanceof Fr)) return String(f).replace(/^-/,'−');
  if(f.d===1) return String(f.n).replace('-','−');
  return (f.n<0?'−':'')+'<span class="fr"><span>'+Math.abs(f.n)+'</span><span>'+f.d+'</span></span>';
}
function pt(f){return f.n<0?'\\left('+f.tex()+'\\right)':f.tex()}
function fnum(x,dp){if(dp===undefined)dp=2;var p=Math.pow(10,dp),r=Math.round(x*p)/p;if(Object.is(r,-0))r=0;return String(r).replace('-','−')}

/* ================= 行列式工具 ================= */
function minorOf(M,i,j){return M.filter(function(_,r){return r!==i}).map(function(row){return row.filter(function(_,c){return c!==j})})}
function det(M){
  var n=M.length;
  if(n===0) return F(1);
  if(n===1) return M[0][0];
  if(n===2) return M[0][0].mul(M[1][1]).sub(M[0][1].mul(M[1][0]));
  // 精确消元（分数），比递归展开快
  var A=M.map(function(r){return r.slice()}),s=F(1);
  for(var k=0;k<n;k++){
    var p=-1;for(var i=k;i<n;i++){if(!A[i][k].isZero()){p=i;break}}
    if(p<0) return F(0);
    if(p!==k){var t=A[p];A[p]=A[k];A[k]=t;s=s.neg()}
    s=s.mul(A[k][k]);
    for(var r=k+1;r<n;r++){
      if(A[r][k].isZero()) continue;
      var f=A[r][k].div(A[k][k]);
      for(var c=k;c<n;c++) A[r][c]=A[r][c].sub(f.mul(A[k][c]));
    }
  }
  return s;
}
function cof(M,i,j){var d=det(minorOf(M,i,j));return (i+j)%2?d.neg():d}
function transpose(M){return M[0].map(function(_,j){return M.map(function(r){return r[j]})})}
function cloneM(M){return M.map(function(r){return r.slice()})}
function detF(A){
  var n=A.length,M=A.map(function(r){return r.slice()}),d=1;
  for(var k=0;k<n;k++){
    var p=k;for(var i=k+1;i<n;i++) if(Math.abs(M[i][k])>Math.abs(M[p][k])) p=i;
    if(Math.abs(M[p][k])<1e-14) return 0;
    if(p!==k){var t=M[p];M[p]=M[k];M[k]=t;d=-d}
    d*=M[k][k];
    for(var r=k+1;r<n;r++){var f=M[r][k]/M[k][k];for(var j=k;j<n;j++) M[r][j]-=f*M[k][j]}
  }
  return d;
}
function combos(arr,k){var res=[];(function rec(s,c){if(c.length===k){res.push(c.slice());return}for(var i=s;i<arr.length;i++){c.push(arr[i]);rec(i+1,c);c.pop()}})(0,[]);return res}
function perms(n){
  var res=[];(function rec(pre,rest){if(!rest.length){res.push(pre);return}for(var i=0;i<rest.length;i++) rec(pre.concat([rest[i]]),rest.slice(0,i).concat(rest.slice(i+1)))})([],Array.from({length:n},function(_,i){return i}));
  return res;
}
function inv(p){var c=0;for(var i=0;i<p.length;i++)for(var j=i+1;j<p.length;j++) if(p[i]>p[j]) c++;return c}
function randInt(a,b){return a+Math.floor(Math.random()*(b-a+1))}
function randM(n,lo,hi){if(lo===undefined)lo=-4;if(hi===undefined)hi=4;var a=[];for(var i=0;i<n;i++){a.push([]);for(var j=0;j<n;j++) a[i].push(randInt(lo,hi))}return toM(a)}

/* ================= DOM / 公式 ================= */
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}
function K(t,disp){
  try{return window.katex.renderToString(t,{displayMode:!!disp,throwOnError:false,output:'html',strict:false})}
  catch(e){return '<code>'+esc(t)+'</code>'}
}
/* 把字符串里的 \( \) 与 \[ \] 换成公式 HTML（仅用于页面脚本自己拼出的字符串） */
function T(s){
  return String(s).replace(/\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)/g,function(_,d,i){return d!==undefined?K(d,true):K(i,false)});
}
function vm(M,env){ // 生成 LaTeX 行列式
  env=env||'vmatrix';
  return '\\begin{'+env+'}'+M.map(function(r){return r.map(function(x){return x instanceof Fr?x.tex():String(x)}).join(' & ')}).join(' \\\\ ')+'\\end{'+env+'}';
}
function matHTML(M,o){
  o=o||{};
  var m=M[0].length,s='<div class="dm '+(o.cls||'')+'" style="grid-template-columns:repeat('+m+',auto)">';
  for(var i=0;i<M.length;i++)for(var j=0;j<m;j++){
    var v=M[i][j];
    s+='<div class="c '+(o.cell?o.cell(i,j):'')+'" data-i="'+i+'" data-j="'+j+'">'+(o.show?o.show(v,i,j):fmt(v))+(o.extra?o.extra(i,j):'')+'</div>';
  }
  return s+'</div>';
}
var BAD='<p class="no small">有格子的输入不合法：只支持整数、小数或 a/b 形式的分数。</p>';

/* 可编辑矩阵 */
function MatEd(el,vals,onchange,opts){
  this.el=el;this.onchange=onchange;this.opts=opts||{};this.set(vals);
}
MatEd.prototype.set=function(vals){
  this.vals=vals.map(function(r){return r.map(function(x){return String(x)})});this.render();this.fire();
};
MatEd.prototype.setFr=function(M){this.set(M.map(function(r){return r.map(function(x){return x.toString()})}))};
MatEd.prototype.render=function(){
  var self=this,m=this.vals[0].length,s='<div class="dm ed'+(this.opts.pm?' pm':'')+'" style="grid-template-columns:repeat('+m+',auto)">';
  this.vals.forEach(function(r,i){r.forEach(function(v,j){
    s+='<input data-i="'+i+'" data-j="'+j+'" value="'+esc(v)+'" aria-label="第'+(i+1)+'行第'+(j+1)+'列" autocomplete="off" autocapitalize="off" spellcheck="false" inputmode="text">';
  })});
  this.el.innerHTML=s+'</div>';
  $$('input',this.el).forEach(function(inp){
    inp.addEventListener('input',function(){
      self.vals[+inp.dataset.i][+inp.dataset.j]=inp.value;
      inp.classList.toggle('bad',parseFr(inp.value)===null);
      inp.classList.remove('mk');
      self.fire();
    });
    inp.addEventListener('focus',function(){try{inp.select()}catch(e){}});
  });
};
MatEd.prototype.get=function(){
  var M=this.vals.map(function(r){return r.map(parseFr)});
  return M.some(function(r){return r.some(function(x){return x===null})})?null:M;
};
MatEd.prototype.mark=function(fn){$$('input',this.el).forEach(function(inp){inp.classList.toggle('mk',!!fn(+inp.dataset.i,+inp.dataset.j))})};
MatEd.prototype.fire=function(){if(this.onchange) this.onchange(this.get())};

/* ================= 存储（容错） ================= */
var store={
  get:function(k,d){try{var v=localStorage.getItem('det1-'+k);return v===null?d:JSON.parse(v)}catch(e){return d}},
  set:function(k,v){try{localStorage.setItem('det1-'+k,JSON.stringify(v))}catch(e){}}
};

/* ================= 页面组件：分步解答 / 选择题 / 填空题 ================= */
function initSteps(root){
  $$('.sol',root).forEach(function(sol){
    if(sol.dataset.ready) return; sol.dataset.ready='1';
    var steps=$$(':scope > .st',sol),n=steps.length,shown=0;
    var head=document.createElement('div');head.className='sol-h';
    head.innerHTML='<span class="sl">'+(sol.dataset.label||'解答')+'<span class="tiny muted">　共 '+n+' 步</span></span>'+
      '<button class="btn sm pri" data-a="next">下一步</button><button class="btn sm" data-a="all">全部显示</button><button class="btn sm" data-a="reset">收起</button>';
    sol.insertBefore(head,sol.firstChild);
    function upd(){steps.forEach(function(s,i){s.classList.toggle('shown',i<shown)});head.querySelector('[data-a=next]').disabled=shown>=n;head.querySelector('[data-a=reset]').disabled=shown===0}
    head.addEventListener('click',function(e){
      var b=e.target.closest('button');if(!b) return;
      if(b.dataset.a==='next'&&shown<n){shown++;upd();}
      else if(b.dataset.a==='all'){shown=n;upd()}
      else if(b.dataset.a==='reset'){shown=0;upd()}
    });
    if(sol.dataset.open==='1') shown=n;
    upd();
  });
}
function initQuiz(root){
  $$('.quiz',root).forEach(function(qz){
    if(qz.dataset.ready) return; qz.dataset.ready='1';
    var items=$$(':scope > .mcq, :scope > .fill',qz),sc=null;
    if(items.length>2){
      sc=document.createElement('div');sc.className='row';
      sc.innerHTML='<span class="score">已答 <b class="d">0</b> / '+items.length+'　答对 <b class="r">0</b></span><button class="btn sm" data-a="reset">重新作答</button>';
      qz.parentNode.insertBefore(sc,qz);
      sc.querySelector('[data-a=reset]').addEventListener('click',function(){
        items.forEach(function(it){it.classList.remove('answered','revealed');it.dataset.done='';it.dataset.right='';
          $$('.opt',it).forEach(function(o){o.classList.remove('right','wrong')});
          var inp=it.querySelector('input');if(inp){inp.value='';inp.classList.remove('bad')}
          var m=it.querySelector('.fmsg');if(m) m.innerHTML='';});
        tally();
      });
    }
    function tally(){if(!sc) return;var d=0,r=0;items.forEach(function(it){if(it.dataset.done==='1')d++;if(it.dataset.right==='1')r++});sc.querySelector('.d').textContent=d;sc.querySelector('.r').textContent=r}
    items.forEach(function(it,idx){
      var qt=it.querySelector('.qt');
      var h=document.createElement('div');h.className='qh';h.innerHTML='<span class="qn">'+(idx+1)+'</span>';
      it.insertBefore(h,qt);h.appendChild(qt);
      if(it.classList.contains('mcq')){
        var ans=+it.dataset.ans;
        $$('.opts > li',it).forEach(function(li,oi){
          var b=document.createElement('button');b.className='opt';b.type='button';
          b.innerHTML='<span class="ol">'+'ABCDEF'[oi]+'</span><span>'+li.innerHTML+'</span>';
          li.innerHTML='';li.appendChild(b);
          b.addEventListener('click',function(){
            if(it.classList.contains('answered')) return;
            it.classList.add('answered');
            var all=$$('.opt',it);all[ans].classList.add('right');
            if(oi!==ans) b.classList.add('wrong');
            it.dataset.done='1';it.dataset.right=oi===ans?'1':'';tally();
          });
        });
      }else{
        var row=document.createElement('div');row.className='frow';
        row.innerHTML='<input class="txt" type="text" placeholder="填写答案" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="btn sm pri" type="button" data-a="chk">检查</button><button class="btn sm" type="button" data-a="show">看答案</button><span class="fmsg small"></span>';
        it.insertBefore(row,it.querySelector('.explain'));
        var inp=row.querySelector('input'),msg=row.querySelector('.fmsg');
        var answers=String(it.dataset.ans).split('|');
        function check(){
          var v=inp.value.trim();if(!v){msg.innerHTML='<span class="muted">先填写答案</span>';return}
          var fv=parseFr(v),ok=answers.some(function(a){var fa=parseFr(a);if(fa&&fv) return fa.eq(fv);return a.replace(/\s+/g,'').toLowerCase()===v.replace(/\s+/g,'').toLowerCase()});
          msg.innerHTML=ok?'<span class="ok">正确</span>':'<span class="no">再想想</span>';
          if(it.dataset.done!=='1'){it.dataset.done='1';it.dataset.right=ok?'1':'';tally()}
          if(ok) it.classList.add('revealed');
        }
        row.querySelector('[data-a=chk]').addEventListener('click',check);
        inp.addEventListener('keydown',function(e){if(e.key==='Enter') check()});
        row.querySelector('[data-a=show]').addEventListener('click',function(){it.classList.add('revealed');if(it.dataset.done!=='1'){it.dataset.done='1';tally()}});
      }
    });
  });
}

/* ================= 路由与外壳 ================= */
var pages=[],cache={},current=null,WID=window.WIDGETS||(window.WIDGETS={}),chapters=[];
var SITE=window.SITE||{print:false};
function initWidgets(root){
  $$('[data-widget]',root).forEach(function(el){
    if(el.dataset.ready) return; el.dataset.ready='1';
    var fn=WID[el.dataset.widget];
    if(!fn){el.innerHTML='<p class="muted small">组件加载失败。</p>';return}
    try{fn(el)}catch(e){console.error(el.dataset.widget,e);el.insertAdjacentHTML('beforeend','<p class="no small">组件出错：'+esc(e.message)+'</p>')}
  });
}
function pageOf(route){return pages.filter(function(x){return x.route===route})[0]}
function buildNav(){
  var nav=$('#navlist'),h='<ul class="nav-list"><li><a href="#home" data-route="home"><span class="no">⌂</span><span>课程主页</span><span class="seen"></span></a></li></ul>';
  chapters.forEach(function(ch){
    var cp=pages.filter(function(p){return p.chapter===ch.no});
    h+='<div class="nav-ch'+(ch.ready?'':' soon')+'" data-ch="'+ch.no+'">';
    h+=ch.ready?'<a class="nav-ch-link" href="#'+ch.route+'" data-route="'+ch.route+'">':'<span class="nav-ch-link" aria-disabled="true">';
    h+='<span class="cn">第'+ch.cn+'章</span><span class="ct">'+esc(ch.title)+'</span>'+(ch.ready?'<span class="cnt">'+cp.length+'</span>':'<span class="soon-tag">筹备中</span>');
    h+=ch.ready?'</a>':'</span>';
    if(cp.length){
      var group=null;h+='<div class="nav-sec" data-chapter-list="'+ch.no+'" hidden>';
      h+='<ul class="nav-list">';
      cp.forEach(function(p){
        if(p.group&&p.group!==group){group=p.group;h+='</ul><div class="nav-group">'+esc(group)+'</div><ul class="nav-list">'}
        h+='<li><a href="#'+p.route+'" data-route="'+p.route+'"><span class="no">'+esc(p.num)+'</span><span>'+esc(p.short)+'</span><span class="seen" aria-label="已读">✓</span></a><ul class="subtoc" data-for="'+p.route+'" hidden></ul></li>';
      });
      h+='</ul></div>';
    }
    h+='</div>';
  });
  nav.innerHTML=h.replace(/<ul class="nav-list"><\/ul>/g,'');
  markVisited();
}
function markVisited(){var v=store.get('visited',{});$$('#navlist a[data-route]').forEach(function(a){a.classList.toggle('visited',!!v[a.dataset.route])});$$('.card[data-route]').forEach(function(c){var s=c.querySelector('.seen');if(s) s.hidden=!v[c.dataset.route]})}
function ensurePage(route){
  if(cache[route]) return cache[route];
  var p=pageOf(route);if(!p) return null;
  var art=document.createElement('article');art.className='page';art.dataset.route=route;art.dataset.chapter=p.chapter;art.hidden=true;
  art.appendChild(p.tpl.content.cloneNode(true));
  var list=pages.filter(function(x){return x.chapter===p.chapter&&p.chapter>0}),idx=list.indexOf(p),pv=list[idx-1],nx=list[idx+1],pg='<nav class="pager" aria-label="翻页">';
  if(pv) pg+='<a href="#'+pv.route+'" class="pv"><span class="k">← 上一节</span><span class="v">'+esc(pv.num+' '+pv.short)+'</span></a>';
  if(nx) pg+='<a href="#'+nx.route+'" class="nx"><span class="k">下一节 →</span><span class="v">'+esc(nx.num+' '+nx.short)+'</span></a>';
  if(p.chapter>0) art.insertAdjacentHTML('beforeend',pg+'</nav>');
  $('#main').appendChild(art);
  var sub=$('.subtoc[data-for="'+route+'"]'),hs=$$('h2',art),s='';
  hs.forEach(function(h,i){h.id=route+'-h'+i;s+='<li><a href="#'+route+'" data-jump="'+h.id+'">'+esc(h.textContent.replace(/\s+/g,' ').trim())+'</a></li>'});
  if(sub) sub.innerHTML=s;
  initSteps(art);initQuiz(art);markNotes(art);
  cache[route]=art;
  return art;
}
var spy=null;
function show(route,jump){
  var p=pageOf(route);
  if(!p){route=pages[0].route;p=pages[0]}
  var art=ensurePage(route);
  if(current!==route){
    Object.keys(cache).forEach(function(r){cache[r].hidden=r!==route});
    current=route;
    initWidgets(art);
    $$('#navlist a[data-route]').forEach(function(a){a.classList.toggle('on',a.dataset.route===route)});
    $$('.subtoc').forEach(function(u){u.hidden=u.dataset.for!==route});
    $$('[data-chapter-list]').forEach(function(u){u.hidden=+u.dataset.chapterList!==p.chapter});
    $$('.nav-ch').forEach(function(c){c.classList.toggle('cur',+c.dataset.ch===p.chapter)});
    var ch=chapters.filter(function(c){return c.no===p.chapter})[0];
    $('#brandSub').textContent=ch?'第'+ch.cn+'章 · '+ch.title:'交互课件';
    document.title=(p.route==='home'?'':p.num+' '+p.short+' · ')+(ch?'第'+ch.cn+'章 '+ch.title+' · ':'')+'高等代数';
    if(!jump) window.scrollTo(0,0);
    var v=store.get('visited',{});v[route]=1;store.set('visited',v);markVisited();
    setupSpy(art);
  }
  if(jump){var t=document.getElementById(jump);if(t) t.scrollIntoView({behavior:'smooth',block:'start'})}
  document.body.classList.remove('nav-open');
}
function setupSpy(art){
  if(spy) spy.disconnect();
  if(!('IntersectionObserver' in window)) return;
  var links=$$('.subtoc[data-for="'+current+'"] a');
  spy=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(a){a.classList.toggle('cur',a.dataset.jump===e.target.id)})}})},{rootMargin:'-20% 0px -70% 0px'});
  $$('h2',art).forEach(function(h){spy.observe(h)});
}
function routeFromHash(){var h=(location.hash||'').replace(/^#/,'');var alias={summary:'c1-summary',practice:'c1-practice'};return alias[h]||h||'home'}
function seq(){var p=pageOf(current);return pages.filter(function(x){return x.chapter===p.chapter&&p.chapter>0})}

/* ================= 放映模式（PPT） ================= */
var deck={on:false,slides:[],i:0,order:[],route:null,zoom:store.get('deckZoom',1),quizzes:[]};
function deckGeom(){
  var st=$('#deckStage'),W=st.clientWidth,H=st.clientHeight,narrow=W<700;
  var base=(narrow?1:Math.max(1.05,Math.min(1.5,W/1000)))*deck.zoom;
  var pad=narrow?16:32;
  return {W:W,H:H,base:base,narrow:narrow,pad:pad,innerW:Math.min(1100,(W-pad*2)/base),availPx:H-pad};
}
function mkGen(cls,html){var d=document.createElement('div');d.className=cls;d.innerHTML=html;return d}
function markNotes(root){
  $$('p.small,p.muted,.st .small.muted,.st span.muted',root).forEach(function(el){
    if(el.closest('.widget,.tnote,.explain,.page-head,.hero,.stage,.chap,.goals,.ex-h,.sol-h,.menu,.w-head,.box.stat,.box.idea,.box.board,.chapters')) return;
    el.classList.add('note-red');
  });
  $$('p,li',root).forEach(function(el){
    if(el.closest('.widget,.tnote,.explain,.menu')) return;
    if(/^\s*(注[:：]|注意[:：，]|提示[:：])/.test(el.textContent)) el.classList.add('note-red');
  });
}
function buildSlides(art){
  var kids=Array.prototype.slice.call(art.children).filter(function(el){return !el.matches('nav.pager')});
  var notes=[],quizzes=[],head=null,sections=[],cur=null;
  var pageTitle=((art.querySelector('h1')||{}).textContent||'').replace(/\s+/g,' ').trim();
  kids.forEach(function(el){
    if(el.matches('details.tnote')){notes.push(el.cloneNode(true));return}
    if(el.matches('.page-head,.hero')&&!head){head=el;return}
    if(el.tagName==='H2'){cur={title:el.textContent.replace(/\s+/g,' ').trim(),h2:el,blocks:[]};sections.push(cur);return}
    if(!cur){cur={title:'',h2:null,blocks:[]};sections.push(cur)}
    if(el.matches('.quiz')){var items=Array.prototype.slice.call(el.children);quizzes.push({q:el,items:items});items.forEach(function(it){cur.blocks.push(it)});return}
    cur.blocks.push(el);
  });
  var g=deckGeom(),meas=$('#deckMeasure');meas.style.width=g.innerW+'px';
  var limit=g.availPx/g.base-80;
  function height(nodes){meas.innerHTML='';nodes.forEach(function(n){meas.appendChild(n)});return meas.scrollHeight}
  var slides=[],named=sections.filter(function(s){return s.h2});
  if(head) slides.push({nodes:[head],title:true,label:pageTitle,sec:''});
  // 标题之后、第一个小标题之前的“承上启下”放在目录页之前
  var pre=sections.length&&!sections[0].h2&&sections[0].blocks.every(function(x){return x.matches&&x.matches('.bridge')})?sections.shift():null;
  var preN=pre?pre.blocks.slice():[];
  if(named.length>=3&&pageOf(current).chapter>0){
    slides.push({nodes:preN.concat([mkGen('deck-agenda','<h2>本节内容</h2><ol>'+named.map(function(s){return '<li>'+esc(s.title)+'</li>'}).join('')+'</ol>')]),label:'本节内容',sec:'',agenda:true});
  }else if(preN.length) slides.push({nodes:preN,sec:'',label:'承上启下'});
  function sticky(n){return n.tagName==='H3'||(n.tagName==='P'&&/[：:则]\s*$/.test(n.textContent.trim()))}
  function lim(nodes){return nodes.some(function(n){return n.matches&&n.matches('.ex,.sol')})?limit*1.35:limit}
  function cont(t){return mkGen('deck-cont','<span>'+esc(t)+'</span><em>（续）</em>')}
  sections.forEach(function(s){
    var k=named.indexOf(s),groups=[],cur=[];
    s.blocks.forEach(function(b){
      var head=groups.length?(s.title?[cont(s.title)]:[]):(s.h2?[s.h2]:[]);
      if(!cur.length){cur=[b];return}
      var trial=head.concat(cur,[b]);
      if(height(trial)<=lim(trial)){cur.push(b);return}
      // 小标题、以冒号结尾的引导句不留在页尾，随后面的内容一起换页
      var carry=[];while(cur.length>1&&sticky(cur[cur.length-1]))carry.unshift(cur.pop());
      groups.push(cur);cur=carry.concat([b]);
    });
    if(cur.length||!groups.length) groups.push(cur);
    // 合并过短的相邻页，保证每页内容充实、前后连贯
    for(var gi=groups.length-1;gi>0;gi--){
      var a=groups[gi-1],bb=groups[gi],ha=height(a),hb=height(bb),both=a.concat(bb);
      if((ha<limit*.38||hb<limit*.38)&&height(both)<=lim(both)*1.12){groups.splice(gi-1,2,both)}
    }
    groups.forEach(function(gp,gi){
      var head=gi===0?(s.h2?[s.h2]:[]):(s.title?[cont(s.title)]:[]);
      slides.push({nodes:head.concat(gp),sec:s.title,secNo:k,cont:gi>0,label:(s.title||pageTitle)+(gi>0?'（续）':'')});
    });
  });
  meas.innerHTML='';
  return {slides:slides,order:kids,notes:notes,quizzes:quizzes,named:named.length,pageTitle:pageTitle};
}
function fitSlide(reset){
  var st=$('#deckStage'),sl=$('#deckSlide'),g=deckGeom(),minZ=g.narrow?.85:.5;
  function measure(z){sl.style.zoom='';sl.style.width=Math.min(1100,(g.W-g.pad*2)/z)+'px';return sl.scrollHeight}
  var h=measure(g.base),z=Math.min(g.base,g.availPx/h);
  if(z<g.base){h=measure(z);z=Math.min(g.base,g.availPx/h)}
  else if(h*g.base<g.availPx*.6&&!g.narrow){z=Math.min(g.base*1.3,g.availPx*.72/h);h=measure(z);z=Math.min(z,g.availPx/h)}
  z=Math.max(minZ,z);
  sl.style.width=Math.min(1100,(g.W-g.pad*2)/z)+'px';sl.style.zoom=z;
  if(reset===true) st.scrollTop=0;
  st.classList.toggle('tall',sl.getBoundingClientRect().height>g.availPx+4);
}
function showSlide(i){
  deck.i=Math.max(0,Math.min(deck.slides.length-1,i));
  var s=deck.slides[deck.i],body=$('#deckBody');
  while(body.firstChild) body.removeChild(body.firstChild);
  s.nodes.forEach(function(n){body.appendChild(n)});
  var p=pageOf(deck.route);
  $('#deckKicker').textContent=s.title?'':(p.num+' '+deck.pageTitle+(s.secNo>=0&&deck.named?' · 第 '+(s.secNo+1)+'/'+deck.named+' 部分':''));
  $('#deckSlide').classList.toggle('is-title',!!s.title);
  $('#deckSlide').classList.toggle('is-agenda',!!s.agenda);
  $$('.deck-agenda li',body).forEach(function(li,k){li.classList.toggle('done',false)});
  $('#deckWhere').textContent=(p.num+' '+p.short);
  $('#deckCount').textContent=(deck.i+1)+' / '+deck.slides.length;
  $('#deckProg').style.width=((deck.i+1)/deck.slides.length*100)+'%';
  var list=seq(),idx=list.indexOf(p),nx=deck.slides[deck.i+1],np=list[idx+1];
  $('#deckNextHint').textContent=nx?'下一页：'+nx.label:(np?'下一节：'+np.num+' '+np.short:'本章结束');
  $('#dkPrev').disabled=deck.i===0&&idx<=0;$('#dkNext').disabled=deck.i===deck.slides.length-1&&idx>=list.length-1;
  closeLens();
  requestAnimationFrame(function(){fitSlide(true)});
}
function restoreDeck(){
  if(!deck.route) return;
  var art=cache[deck.route],pager=art.querySelector('nav.pager');
  deck.order.forEach(function(n){art.insertBefore(n,pager)});
  (deck.quizzes||[]).forEach(function(z){z.items.forEach(function(it){z.q.appendChild(it)})});
  $('#deckBody').innerHTML='';$('#deckMeasure').innerHTML='';deck.route=null;
}
function enterSlides(at){
  if(!current) return;
  var art=cache[current];if(!art) return;
  if(deck.on) restoreDeck();
  document.body.classList.add('deck-on');$('#deck').hidden=false;
  var b=buildSlides(art);deck.slides=b.slides;deck.order=b.order;deck.quizzes=b.quizzes;deck.named=b.named;deck.pageTitle=b.pageTitle;deck.route=current;deck.on=true;
  var nb=$('#deckNotes');nb.innerHTML=b.notes.length?'<h4>教师备注</h4>':'<p class="small">本节没有教师备注。</p>';b.notes.forEach(function(n){n.open=true;nb.appendChild(n)});
  showSlide(at==='last'?deck.slides.length-1:0);
  closeMenu();
}
function exitSlides(){
  if(!deck.on) return;
  closeLens();restoreDeck();deck.on=false;$('#deck').hidden=true;document.body.classList.remove('deck-on');
  try{if(document.fullscreenElement) document.exitFullscreen()}catch(e){}
}
function deckStep(d){
  var ni=deck.i+d;
  if(ni>=0&&ni<deck.slides.length){showSlide(ni);return}
  var list=seq(),idx=list.indexOf(pageOf(deck.route)),np=list[idx+d];
  if(!np) return;
  restoreDeck();
  location.hash=np.route;show(np.route);
  setTimeout(function(){enterSlides(d<0?'last':0)},60);
}
function deckZoom(dz){deck.zoom=Math.max(.6,Math.min(1.8,Math.round((deck.zoom+dz)*10)/10));store.set('deckZoom',deck.zoom);fitSlide();toast('字号 '+Math.round(deck.zoom*100)+'%')}
function toast(t){var el=$('#deckToast');el.textContent=t;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){el.hidden=true},1100)}
/* 放大镜：点公式、矩阵、表格放大查看 */
var LENS='.katex-display,.boxed-eq,.dm:not(.ed),table.t';
function openLens(src){
  var box=$('#deckLens'),inner=box.querySelector('.lens-inner');
  inner.innerHTML='';var c=src.cloneNode(true);c.style.zoom='';inner.appendChild(c);
  box.hidden=false;inner.style.zoom=1;
  var r=inner.getBoundingClientRect(),z=Math.min(3.2,(window.innerWidth*.86)/r.width,(window.innerHeight*.72)/r.height);
  inner.style.zoom=Math.max(1,z);
}
function closeLens(){var b=$('#deckLens');if(b) b.hidden=true}

/* ================= 打印讲义 ================= */
function printChapter(){
  var p=pageOf(current),list=p.chapter>0?pages.filter(function(x){return x.chapter===p.chapter}):[p];
  list.forEach(function(x){var a=ensurePage(x.route);initWidgets(a)});
  document.body.classList.add('printing');
  var arts=list.map(function(x){return cache[x.route]});
  Object.keys(cache).forEach(function(r){cache[r].hidden=arts.indexOf(cache[r])<0});
  $$('details.proof,details.more',$('#main')).forEach(function(d){d.dataset.wasOpen=d.open?'1':'';d.open=true});
  closeMenu();
  setTimeout(function(){
    try{window.print()}catch(e){}
    setTimeout(function(){
      document.body.classList.remove('printing');
      Object.keys(cache).forEach(function(r){cache[r].hidden=r!==current});
      $$('details.proof,details.more',$('#main')).forEach(function(d){d.open=d.dataset.wasOpen==='1'});
    },400);
  },120);
}

/* ================= 设置菜单 ================= */
function closeMenu(){var m=$('#menu');if(m){m.hidden=true;$('#menuBtn').setAttribute('aria-expanded','false')}}

function initShell(){
  try{chapters=JSON.parse($('#chapterData').textContent)}catch(e){chapters=[]}
  window.D.chapters=chapters;
  pages=$$('template[data-route]').map(function(t){return {route:t.dataset.route,chapter:+(t.dataset.chapter||0),num:t.dataset.num||'',short:t.dataset.short||'',group:t.dataset.group||'',tpl:t}});
  buildNav();
  if(!SITE.print) document.body.classList.add('no-print');
  window.addEventListener('hashchange',function(){var r=routeFromHash();if(deck.on&&r!==deck.route) exitSlides();show(r)});
  document.addEventListener('click',function(e){
    var j=e.target.closest('[data-jump]');
    if(j){e.preventDefault();show(current,j.dataset.jump);return}
    var g=e.target.closest('[data-go]');
    if(g){e.preventDefault();location.hash=g.dataset.go;return}
    var sg=e.target.closest('[data-slides-go]');
    if(sg){e.preventDefault();var r=sg.dataset.slidesGo;location.hash=r;show(r);setTimeout(function(){enterSlides(0)},60);return}
    var m=$('#menu');if(m&&!m.hidden&&!e.target.closest('.menu-wrap')) closeMenu();
  });
  $('#navToggle').addEventListener('click',function(){document.body.classList.toggle('nav-open')});
  $('#scrim').addEventListener('click',function(){document.body.classList.remove('nav-open')});
  $('#menuBtn').addEventListener('click',function(){var m=$('#menu');m.hidden=!m.hidden;this.setAttribute('aria-expanded',String(!m.hidden))});
  document.addEventListener('keydown',function(e){
    if(e.altKey||e.ctrlKey||e.metaKey) return;
    var typing=e.target.closest('input,select,textarea,[contenteditable]');
    if(deck.on){
      if(e.key==='Escape'){if(!$('#deckLens').hidden){closeLens();return}if(!document.fullscreenElement) exitSlides();return}
      if(typing) return;
      if(e.key==='ArrowRight'||e.key==='PageDown'||(e.key===' '&&!e.target.closest('button'))){e.preventDefault();deckStep(1)}
      else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();deckStep(-1)}
      else if(e.key==='Home') showSlide(0);
      else if(e.key==='End') showSlide(deck.slides.length-1);
      else if(e.key==='n'||e.key==='N') $('#deckNotes').hidden=!$('#deckNotes').hidden;
      else if(e.key==='+'||e.key==='=') deckZoom(.1);
      else if(e.key==='-'||e.key==='_') deckZoom(-.1);
      return;
    }
    if(e.key==='Escape'){document.body.classList.remove('nav-open');closeMenu()}
    if(typing||e.target.closest('button')) return;
    if(e.key==='p'||e.key==='P'){enterSlides(0);return}
    var list=seq(),idx=list.indexOf(pageOf(current));
    if(e.key==='ArrowRight'&&idx>=0&&idx<list.length-1) location.hash=list[idx+1].route;
    if(e.key==='ArrowLeft'&&idx>0) location.hash=list[idx-1].route;
  });
  // 放映控件
  $('#slidesBtn').addEventListener('click',function(){enterSlides(0)});
  $('#slidesBtn2').addEventListener('click',function(){enterSlides(0)});
  $('#deckBody').addEventListener('click',function(e){if(e.target.closest('button,summary,input,select')) setTimeout(fitSlide,60)});
  $('#deckBody').addEventListener('change',function(){setTimeout(fitSlide,60)});
  $('#dkPrev').addEventListener('click',function(){deckStep(-1)});
  $('#dkNext').addEventListener('click',function(){deckStep(1)});
  $('#dkExit').addEventListener('click',exitSlides);
  $('#dkNotes').addEventListener('click',function(){$('#deckNotes').hidden=!$('#deckNotes').hidden});
  $('#dkBigger').addEventListener('click',function(){deckZoom(.1)});
  $('#dkSmaller').addEventListener('click',function(){deckZoom(-.1)});
  $('#deckBody').addEventListener('click',function(e){var t=e.target.closest(LENS);if(!t||e.target.closest('.widget,button,input,select,a,summary,.mcq,.fill')) return;openLens(t)});
  $('#deckLens').addEventListener('click',closeLens);
  $('#dkFull').addEventListener('click',function(){
    try{if(document.fullscreenElement) document.exitFullscreen();else{var r=$('#deck').requestFullscreen();if(r&&r.catch) r.catch(function(){})}}catch(e){}
  });
  document.addEventListener('fullscreenchange',function(){if(deck.on) setTimeout(fitSlide,80)});
  window.addEventListener('resize',function(){if(deck.on) fitSlide()});
  var tx=0,ty=0,tOk=false,stage=$('#deckStage');
  stage.addEventListener('touchstart',function(e){var t=e.touches[0];tx=t.clientX;ty=t.clientY;tOk=!e.target.closest('input,select,svg,.rook,.scroll-x,.tw,.katex-display')},{passive:true});
  stage.addEventListener('touchend',function(e){if(!tOk) return;var t=e.changedTouches[0],dx=t.clientX-tx,dy=t.clientY-ty;if(Math.abs(dx)>60&&Math.abs(dy)<50) deckStep(dx<0?1:-1)},{passive:true});
  $('#printBtn').addEventListener('click',printChapter);
  // 字号
  var fs=store.get('fs',0);
  function applyFs(){if(fs) document.documentElement.style.setProperty('--fs',(17+fs)+'px');else document.documentElement.style.removeProperty('--fs');$('#fsVal').textContent=Math.round((17+fs)/17*100)+'%'}
  applyFs();
  $('#fsUp').addEventListener('click',function(){fs=Math.min(fs+1,8);store.set('fs',fs);applyFs()});
  $('#fsDown').addEventListener('click',function(){fs=Math.max(fs-1,-3);store.set('fs',fs);applyFs()});
  // 明暗
  var th=store.get('theme','');if(th) document.documentElement.setAttribute('data-theme',th);
  $('#themeBtn').addEventListener('click',function(){
    var r=document.documentElement,cur=r.getAttribute('data-theme');
    var dark=cur?cur==='dark':(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches);
    r.setAttribute('data-theme',dark?'light':'dark');store.set('theme',dark?'light':'dark');
  });
  // 侧栏
  var side=$('#sideView');side.checked=!store.get('focus',false);document.body.classList.toggle('focus',!side.checked);
  side.addEventListener('change',function(){document.body.classList.toggle('focus',!side.checked);store.set('focus',!side.checked)});
  // 学生视图
  var stu=$('#studentView');stu.checked=store.get('student',false);document.body.classList.toggle('student',stu.checked);
  stu.addEventListener('change',function(){document.body.classList.toggle('student',stu.checked);store.set('student',stu.checked)});
  // 阅读进度
  var bar=$('#readProg'),tick=false;
  window.addEventListener('scroll',function(){if(tick) return;tick=true;requestAnimationFrame(function(){var h=document.documentElement.scrollHeight-innerHeight;bar.style.width=(h>0?Math.min(100,scrollY/h*100):0)+'%';tick=false})},{passive:true});
  show(routeFromHash());
}

window.D={Fr:Fr,F:F,toM:toM,parseFr:parseFr,fmt:fmt,pt:pt,fnum:fnum,det:det,detF:detF,cof:cof,minorOf:minorOf,transpose:transpose,cloneM:cloneM,
  combos:combos,perms:perms,inv:inv,randInt:randInt,randM:randM,$:$,$$:$$,esc:esc,K:K,T:T,vm:vm,matHTML:matHTML,MatEd:MatEd,BAD:BAD,store:store,
  initSteps:initSteps,initQuiz:initQuiz,show:function(r){location.hash=r},enterSlides:enterSlides};
window.D._initShell=initShell;
})();
