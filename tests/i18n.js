// Checks that every English text on the public pages has an Amharic translation in js/i18n-am.js.
// Usage: node tests/i18n.js
const fs=require("fs"),path=require("path"),root=path.join(__dirname,"..");
global.window={};eval(fs.readFileSync(path.join(root,"js/i18n-am.js"),"utf8"));const AM=window.AM;
const dec=s=>s.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g," ").replace(/&middot;/g,"·");
const nk=s=>dec(s).replace(/\s+/g," ").trim();
const KEEP=new Set(["B","LL.B.","WhatsApp","Telegram","Facebook","LinkedIn","YouTube","EN","BL-AB12C","PDF, JPG, PNG, DOCX"]);
const pages=["index","about","services","insights","contact","book","manage","terms","404"];
const textsOf=h=>h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g,"").split(/<[^>]*>/).map(nk).filter(t=>/[A-Za-z]/.test(t));
const attrsOf=h=>[...h.replace(/<script[\s\S]*?<\/script>/g,"").matchAll(/(?:placeholder|aria-label|alt|title)="([^"]+)"/g)].map(m=>nk(m[1]));
let missing=[],total=0;
const check=(t,where)=>{if(!/[A-Za-z]/.test(t)||/[<]|="|\\u|\$\{|\)\.join|^">/.test(t))return;total++;if(!KEEP.has(t)&&AM[t]===undefined)missing.push(where+": "+t)};
for(const p of pages){const h=fs.readFileSync(path.join(root,p+".html"),"utf8");textsOf(h).forEach(t=>check(t,p));attrsOf(h).forEach(t=>check(t,p+" attr"));
 const title=(h.match(/<title>([\s\S]*?)<\/title>/)||[])[1];if(title)check(nk(title),p+" title");
 for(const sc of h.matchAll(/<script>([\s\S]*?)<\/script>/g))for(const m of sc[1].matchAll(/"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'/g)){const s=m[1]||m[2]||"";
  if(s.includes("<"))textsOf(s.replace(/\$\{[^}]*\}/g,"")).forEach(t=>check(t,p+" js-html"));
  else if(/^[A-Z][a-z]+[^<>{}=;]*[a-z.!?]$/.test(s)&&/\s/.test(s)&&!/https?:|\.html|\\n/.test(s))check(nk(s),p+" js")}}
const app=fs.readFileSync(path.join(root,"js/app.js"),"utf8");for(const m of app.matchAll(/`([^`]*)`/g))textsOf(m[1].replace(/\$\{[^}]*\}/g,"")).forEach(t=>check(t,"app"));
for(const n of ["Home","About","Practice areas","Insights","Contact"])check(n,"nav");
const miss=[...new Set(missing)];
console.log(total+" texts checked; "+miss.length+" without Amharic");miss.forEach(m=>console.log("  MISSING "+m));
process.exit(miss.length?1:0);
