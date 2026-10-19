// Unit-tests the Amharic translator functions from js/app.js with fake text nodes. Usage: node tests/translator.js
const fs=require("fs"),path=require("path"),root=path.join(__dirname,"..");
global.window={};eval(fs.readFileSync(path.join(root,"js/i18n-am.js"),"utf8"));global.AM=window.AM;
const app=fs.readFileSync(path.join(root,"js/app.js"),"utf8"),src=app.slice(app.indexOf("const ORIG=new WeakMap()"),app.indexOf("new MutationObserver("));
const S={lang:"en"},{trText,trAttr}=new Function("window","S","NOI","document","NodeFilter",src.replace(/\blang\b/g,"S.lang")+";return{trText,trAttr}")(window,S,false,{},{});
let ok=0,bad=0;const t=(c,m)=>{c?ok++:(bad++,console.log("FAIL",m))};
const n={nodeValue:"  Book a consultation \n"};trText(n);t(n.nodeValue==="  Book a consultation \n","English untouched");
S.lang="am";trText(n);t(n.nodeValue==="  ቀጠሮ ያስይዙ \n","Amharic, whitespace kept");S.lang="en";trText(n);t(n.nodeValue==="  Book a consultation \n","back to English");
const m={nodeValue:"Commercial   &\n contracts"};S.lang="am";trText(m);t(m.nodeValue==="ንግድና ውሎች","whitespace-normalised key");
const u={nodeValue:"Some unknown text"};trText(u);t(u.nodeValue==="Some unknown text","unknown text unchanged");
const d={nodeValue:" 09:00–12:00 "};trText(d);t(d.nodeValue===" 09:00–12:00 ","text without letters ignored");
const attrs={placeholder:"Search articles"},e={hasAttribute:a=>a in attrs,getAttribute:a=>attrs[a],setAttribute:(a,v)=>attrs[a]=v};
trAttr(e);t(attrs.placeholder==="ጽሑፎችን ይፈልጉ","attribute translated");S.lang="en";trAttr(e);t(attrs.placeholder==="Search articles","attribute restored");
console.log(ok+" translator checks passed, "+bad+" failed");process.exit(bad?1:0);
