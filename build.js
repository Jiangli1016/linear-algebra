// 构建：预渲染页面中的静态公式，内联 KaTeX（含字体）与全部样式脚本，输出两个版本
const fs=require('fs'),path=require('path');
let KROOT;try{KROOT=path.dirname(require.resolve('katex/package.json'))}catch(e){KROOT='/opt/npm-tools/node_modules/katex'}
const katex=require(KROOT);
const SRC=path.join(__dirname,'src'),OUT=path.join(__dirname,'dist');
const order=['home','ch1','s11','s12','s13','s14','s15','s16','s17','summary','practice','ch2','s21','s22','s23','s24','s25','s26','s27','summary2','practice2'];
const errors=[];
function decode(s){return s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&')}
function renderMath(html,file){
  return html.split(/(<[^>]+>)/).map(seg=>{
    if(seg.startsWith('<')) return seg;
    const out=seg.replace(/\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)/g,(m,d,i)=>{
      const tex=decode(d!==undefined?d:i);
      try{return katex.renderToString(tex,{displayMode:d!==undefined,throwOnError:true,output:'html',strict:'ignore'})}
      catch(e){errors.push(file+': '+e.message.slice(0,140)+'  ::  '+tex.slice(0,90));return m}
    });
    if(/\\\(|\\\[/.test(out)) errors.push(file+': 未闭合的公式定界符 :: '+out.slice(out.search(/\\\(|\\\[/),out.search(/\\\(|\\\[/)+60));
    return out;
  }).join('');
}
// KaTeX CSS：字体换成 woff2 data URI
let kcss=fs.readFileSync(path.join(KROOT,'dist/katex.min.css'),'utf8');
kcss=kcss.replace(/src:url\(fonts\/([^)]+?)\.woff2\) format\("woff2"\)[^;}]*/g,(m,name)=>{
  const b=fs.readFileSync(path.join(KROOT,'dist/fonts',name+'.woff2')).toString('base64');
  return 'src:url(data:font/woff2;base64,'+b+') format("woff2")';
});
if(/url\(fonts\//.test(kcss)) errors.push('KaTeX CSS 仍有外部字体引用');
const css=fs.readFileSync(path.join(SRC,'style.css'),'utf8');
const shell=fs.readFileSync(path.join(SRC,'shell.html'),'utf8');
const pages=order.filter(n=>fs.existsSync(path.join(SRC,'pages',n+'.html'))).map(n=>{
  const f=path.join(SRC,'pages',n+'.html');
  return renderMath(fs.readFileSync(f,'utf8'),n);
}).join('\n');
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
const js=['core.js','widgets-a.js','widgets-b.js','widgets-c.js','widgets-d.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n;\n');
const kjs=fs.readFileSync(path.join(KROOT,'dist/katex.min.js'),'utf8');
const title='<title>高等代数交互课件</title>';
const mk=(print)=>shell+'\n'+pages+'\n<script>'+kjs+'</script>\n<script>window.SITE={print:'+print+'};'+js+'\ndocument.documentElement.lang="zh-CN";D._initShell();</script>\n';
const head=title+'\n<style>'+css+'\n'+kcss+'</style>\n';
const full=(b)=>'<!doctype html>\n<html lang="zh-CN">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<meta name="description" content="高等代数交互课件：讲义阅读、PPT 放映、打印讲义三种模式">\n'+head+'</head>\n<body>\n'+b+'</body>\n</html>\n';
fs.mkdirSync(path.join(OUT,'site'),{recursive:true});
fs.writeFileSync(path.join(OUT,'index.html'),head+mk(false));
const standalone=full(mk(true));
fs.writeFileSync(path.join(OUT,'site','index.html'),standalone);
fs.writeFileSync(path.join(OUT,'高等代数课件-离线版.html'),standalone);
fs.writeFileSync(path.join(__dirname,'index.html'),standalone); // 网站首页（GitHub Pages 发布的就是它）
const bodyHtml=mk(false);
const kb=x=>(Buffer.byteLength(x)/1024).toFixed(0)+' KB';
console.log('pages',kb(pages),'css',kb(css+kcss),'js',kb(js+kjs),'total',kb(head+bodyHtml));
