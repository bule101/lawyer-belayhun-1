// Tests the floating contact widget code from js/app.js with a fake DOM. Usage: node tests/widget.js
const fs=require("fs"),path=require("path"),app=fs.readFileSync(path.join(__dirname,"../js/app.js"),"utf8");
const src=app.slice(app.indexOf("/* ---- contact widget"),app.indexOf("/* ---- end contact widget"));
let ok=0,bad=0;const t=(c,m)=>{c?ok++:(bad++,console.log("FAIL",m))};
function run(CFG,NOI=false){const listeners={},made=[];
 const el=()=>{const e={className:"",_h:"",classes:new Set(),attrs:{},inert:false,focused:false,children:{},
  classList:{toggle:(c,o)=>o?e.classes.add(c):e.classes.delete(c),contains:c=>e.classes.has(c)},
  set innerHTML(v){e._h=v},get innerHTML(){return e._h},setAttribute:(k,v)=>e.attrs[k]=String(v),addEventListener:(n,f)=>(e.ev=e.ev||{})[n]=f,focus(){e.focused=true},
  querySelector:s=>e.children[s]||(e.children[s]=Object.assign(el(),{}))};return e};
 const doc={createElement:()=>{const e=el();made.push(e);return e},body:{append:x=>made.push(x)},addEventListener:(n,f)=>listeners[n]=f};
 new Function("NOI","CFG","document",src)(NOI,CFG,doc);return{made,listeners,w:made[0]}}
const base={phone:"+251 913 377 702",wa:"251913377702",telegram:"+251913377702",email:"contact@example.com"};
let r=run(base),h=r.w.innerHTML;
t(h.includes('href="https://wa.me/251913377702"'),"WhatsApp link");t(h.includes('href="https://t.me/+251913377702"'),"Telegram link from phone");t(h.includes('href="tel:+251913377702"'),"call link");
t(!h.includes("mailto:"),"placeholder email hidden");t((h.match(/class="cw-row"/g)||[]).length===3,"three channels");t(h.includes("Message us")&&h.includes('aria-label="Chat with the office"')&&h.includes("aria-expanded=\"false\""),"labels and aria");
t(h.includes('target="_blank" rel="noopener"'),"external links open safely");t(h.split("<svg").length-1===5,"icons present (3 channels + open and close icons)");
r=run({...base,email:"office@belayhun.et",telegram:"belayhun_law"});h=r.w.innerHTML;t(h.includes("mailto:office@belayhun.et"),"real email shown");t(h.includes("https://t.me/belayhun_law")&&h.includes("@belayhun_law"),"Telegram username link");
r=run({...base,telegram:"your_username"});t(!r.w.innerHTML.includes("t.me"),"placeholder Telegram hidden");
r=run(base,true);t(r.made.length===0,"not created on staff pages");
r=run(base);const cb=r.w.querySelector("#cwb"),cp=r.w.querySelector("#cwp");
cb.ev.click();t(r.w.classes.has("open")&&cb.attrs["aria-expanded"]==="true"&&cp.inert===false,"opens on click");
r.listeners.keydown({key:"Escape"});t(!r.w.classes.has("open")&&cp.inert===true&&cb.focused,"Escape closes and returns focus");
cb.ev.click();r.listeners.click({target:{closest:()=>null}});t(!r.w.classes.has("open"),"closes on outside click");
console.log(ok+" widget checks passed, "+bad+" failed");process.exit(bad?1:0);
