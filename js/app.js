const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const NAV=[["index.html","Home"],["about.html","About"],["services.html","Practice areas"],["insights.html","Insights"],["contact.html","Contact"]];
const here=(location.pathname.split("/").pop()||"index.html");
let lang=(()=>{try{return localStorage.getItem("lang")||"en"}catch(e){return"en"}})();
if(lang!=="am")lang="en";const NOI=document.body.hasAttribute("data-noi18n");
window.T=s=>lang==="am"&&window.AM&&AM[s]!==undefined?AM[s]:s;
const TG=(()=>{const t=String(CFG.telegram||"").replace(/^@/,"");return t&&t!=="your_username"?t:(CFG.wa?"+"+CFG.wa:"")})();
const links=cls=>NAV.map(n=>`<a ${cls?'class="l"':""} href="${n[0]}" ${n[0]===here?'aria-current="page"':""}>${n[1]}</a>`).join("");
const lg=`<div class="lang" role="group" aria-label="Language"><button data-l="en">EN</button><button data-l="am">አማ</button></div>`;
$("#hdr").innerHTML=`<a class="skip" href="#main">Skip to content</a><header><div class="wrap nav"><a class="brand" href="index.html"><span class="mark"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 7v17M11 24h10M7 11h18M7 11l-4 8a4 4 0 0 0 8 0l-4-8zM25 11l-4 8a4 4 0 0 0 8 0l-4-8z"/></svg></span><span class="bn">${CFG.short}<small>Advocate &amp; Legal Counsel</small></span></a>
<nav class="d" aria-label="Main">${links(0)}</nav><div class="tools">${lg}<a class="btn sm" href="book.html">Book a consultation</a>
<button class="tbtn" id="th" aria-label="Toggle dark mode">\u25d0</button><button class="burger" id="bg" aria-expanded="false" aria-controls="dp" aria-label="Menu"><span><i></i><i></i><i></i></span></button></div></div>
<div class="drop" id="dp" inert><div><nav aria-label="Mobile">${links(1)}</nav>${lg}<a class="btn" href="book.html">Book a consultation</a><button class="tbtn" id="th2" aria-label="Toggle dark mode">\u25d0 <span>Dark / light</span></button></div></div></header>`;
const bg=$("#bg"),dp=$("#dp");
function tog(o){bg.setAttribute("aria-expanded",o);dp.classList.toggle("open",o);dp.inert=!o}
bg.onclick=()=>tog(bg.getAttribute("aria-expanded")!=="true");
document.addEventListener("keydown",e=>{if(e.key==="Escape")tog(false)});
document.addEventListener("click",e=>{if(!e.target.closest("header"))tog(false)});
dp.addEventListener("click",e=>{if(e.target.closest("a"))tog(false)});
$("#ftr").innerHTML=`<footer><div class="wrap g"><div><h3>${CFG.name}</h3><p style="opacity:.85;margin:0">Advocate &amp; Legal Counsel<br>${CFG.address}</p></div>
<div><h3>Pages</h3>${NAV.map(n=>`<a href="${n[0]}">${n[1]}</a>`).join("")}<a href="book.html">Book a consultation</a><a href="manage.html">Manage my booking</a><a href="terms.html">Terms &amp; privacy</a><a href="admin.html">Staff login</a></div>
<div><h3>Contact</h3><a href="tel:${CFG.phone.replace(/\s/g,"")}">${CFG.phone}</a><a href="mailto:${CFG.email}">${CFG.email}</a><a href="https://wa.me/${CFG.wa}" target="_blank" rel="noopener">WhatsApp</a>${TG?`<a href="https://t.me/${TG}" target="_blank" rel="noopener">Telegram</a>`:""}<div class="soc"><a href="${CFG.facebook}">Facebook</a><a href="${CFG.linkedin}">LinkedIn</a><a href="${CFG.youtube}">YouTube</a></div></div>
<div><h3>Hours</h3><span style="opacity:.85" data-hours>Loading…</span></div></div>
<div class="wrap fine"><a href="terms.html#terms">Terms of use</a><a href="terms.html#privacy">Privacy notice</a><br><br>${CFG.license?"<span>Licensed advocate, licence no.</span> "+CFG.license+"<br>":""}Information on this site is general and is not legal advice. Contacting the office does not by itself create an advocate–client relationship.</div></footer>`;
/* ---- Amharic translation: English text is the source; js/i18n-am.js maps it to Amharic ---- */
const ORIG=new WeakMap(),nk=s=>s.replace(/\s+/g," ").trim(),SKIP=/^(SCRIPT|STYLE|TEXTAREA)$/;let ORIGT=null;
function trText(n){const raw=n.nodeValue;let o=ORIG.get(n);if(o===undefined){if(!/[A-Za-z]/.test(raw))return;o=raw;ORIG.set(n,raw)}
 let out=o;if(lang==="am"&&window.AM){const k=nk(o),v=AM[k];if(v!==undefined)out=/^\s*/.exec(o)[0]+v+/\s*$/.exec(o)[0]}
 if(n.nodeValue!==out)n.nodeValue=out}
function trAttr(e){for(const a of ["placeholder","aria-label","alt","title"]){if(!e.hasAttribute(a))continue;const key="__o_"+a;if(e[key]===undefined)e[key]=e.getAttribute(a);const v=lang==="am"&&window.AM?AM[nk(e[key])]:undefined;e.setAttribute(a,v!==undefined?v:e[key])}}
function trTree(root){if(NOI)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>SKIP.test(n.parentNode.nodeName)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});let n;while(n=w.nextNode())trText(n);
 if(root.nodeType===1){trAttr(root);root.querySelectorAll("[placeholder],[aria-label],[alt],[title]").forEach(trAttr)}}
function trTitle(){if(ORIGT===null)ORIGT=document.title;document.title=lang==="am"&&window.AM&&AM[ORIGT]!==undefined?AM[ORIGT]:ORIGT}
new MutationObserver(ms=>{if(NOI||lang!=="am"||!window.AM)return;ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===3){if(!SKIP.test(n.parentNode.nodeName))trText(n)}else if(n.nodeType===1)trTree(n)}))}).observe(document.body,{childList:true,subtree:true});
function withDict(cb){if(window.AM)return cb();const s=document.createElement("script");s.src="js/i18n-am.js";s.onload=cb;document.head.append(s)}
function setLang(l){lang=l;try{localStorage.setItem("lang",l)}catch(e){}document.documentElement.lang=l;$$(".lang button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.l===l));
 if(NOI)return;const go=()=>{trTree(document.body);trTitle();drawHours()};if(l==="am")withDict(go);else go()}
document.addEventListener("click",e=>{const b=e.target.closest(".lang button");if(b)setLang(b.dataset.l)});setLang(lang);
// photo lightbox: click any figure whose image loaded
const dl=document.createElement("dialog");dl.innerHTML='<img alt=""><p></p>';document.body.append(dl);dl.onclick=()=>dl.close();
$$(".gal figure").forEach(f=>f.onclick=()=>{const i=f.querySelector("img");if(!i)return;dl.querySelector("img").src=i.src;dl.querySelector("p").textContent=f.querySelector("figcaption").textContent;dl.showModal()});

document.documentElement.classList.add("js");
const sb=document.createElement("div");sb.className="sbar";sb.innerHTML=`<a href="tel:${CFG.phone.replace(/\s/g,"")}">Call</a><a href="https://wa.me/${CFG.wa}" target="_blank" rel="noopener">WhatsApp</a><a href="book.html">Book now</a>`;document.body.append(sb);
/* ---- contact widget: floating message button on every public page ---- */
if(!NOI){const S='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" ',ST='fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">',I={
 chat:S+ST+'<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/><circle cx="8.5" cy="11.5" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="11.5" r="1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="11.5" r="1" fill="currentColor" stroke="none"/></svg>',
 x:S+ST+'<path d="M6 6l12 12M18 6L6 18"/></svg>',
 wa:S+'fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>',
 tg:S+'fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
 ph:S+ST+'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
 ml:S+ST+'<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6 12 13 2 6"/></svg>'};
 const rows=[];
 if(CFG.wa)rows.push(["wa","WhatsApp",CFG.phone,"https://wa.me/"+CFG.wa,1]);
 if(TG)rows.push(["tg","Telegram",TG[0]==="+"?CFG.phone:"@"+TG,"https://t.me/"+TG,1]);
 if(CFG.phone)rows.push(["ph","Call",CFG.phone,"tel:"+CFG.phone.replace(/\s/g,"")]);
 if(CFG.email&&!/example\./.test(CFG.email))rows.push(["ml","Email",CFG.email,"mailto:"+CFG.email]);
 const cw=document.createElement("div");cw.className="cw";
 cw.innerHTML=`<div class="cw-panel" id="cwp" role="group" aria-label="Contact options"><div class="cw-head"><b>Message us</b><span>Reply within 24 hours</span></div>${rows.map(r=>`<a class="cw-row" href="${r[3]}"${r[4]?' target="_blank" rel="noopener"':""}><span class="cw-ic cw-${r[0]}">${I[r[0]]}</span><span class="cw-t"><b>${r[1]}</b><small>${r[2]}</small></span></a>`).join("")}</div><button type="button" class="cw-btn" id="cwb" aria-expanded="false" aria-controls="cwp" aria-label="Chat with the office"><span class="cw-a">${I.chat}</span><span class="cw-b">${I.x}</span></button>`;
 document.body.append(cw);
 const cb=cw.querySelector("#cwb"),cp=cw.querySelector("#cwp"),cset=o=>{cw.classList.toggle("open",o);cb.setAttribute("aria-expanded",o);cp.inert=!o;if(o){const a=cp.querySelector("a");if(a)a.focus()}};
 cb.addEventListener("click",()=>cset(!cw.classList.contains("open")));
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&cw.classList.contains("open")){cset(false);cb.focus()}});
 document.addEventListener("click",e=>{if(!e.target.closest(".cw"))cset(false)});
 cp.addEventListener("click",e=>{if(e.target.closest("a"))cset(false)});cset(false)}
/* ---- end contact widget ---- */

function theme(t){document.documentElement.dataset.theme=t;try{localStorage.setItem("theme",t)}catch(e){}}
try{const t=localStorage.getItem("theme");if(t)theme(t)}catch(e){}
document.addEventListener("click",e=>{if(e.target.closest("#th,#th2"))theme((document.documentElement.dataset.theme||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"))==="dark"?"light":"dark")});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add("in");io.unobserve(e.target);const n=e.target.dataset.count;if(n){const t=+n,s=e.target.dataset.suf||"",t0=performance.now();(function f(now){const p=Math.min((now-t0)/1200,1);e.target.textContent=Math.round(t*(1-Math.pow(1-p,3)))+s;if(p<1)requestAnimationFrame(f)})(t0)}}),{threshold:.2});
$$(".reveal,[data-count]").forEach(e=>io.observe(e));

function hoursRows(r){const N=lang==="am"?["እሑድ","ሰኞ","ማክሰኞ","ረቡዕ","ሐሙስ","ዓርብ","ቅዳሜ"]:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],o=[1,2,3,4,5,6,0],by={};r.forEach(x=>(by[x.weekday]=by[x.weekday]||[]).push(String(x.start_time).slice(0,5)+"–"+String(x.end_time).slice(0,5)));
 const v=o.map(d=>[d,(by[d]||[]).join(", ")||(lang==="am"?"ዝግ":"Closed")]),out=[];for(let i=0;i<v.length;){let j=i;while(j+1<v.length&&v[j+1][1]===v[i][1])j++;out.push([i===j?N[v[i][0]]:N[v[i][0]]+"–"+N[v[j][0]],v[i][1]]);i=j+1}return out}
var HR=null;function drawHours(){if(!HR)return;const h=hoursRows(HR);$$("[data-hours]").forEach(e=>{e.innerHTML=e.dataset.hours==="table"?h.map(x=>`<tr><td>${x[0]}</td><td>${x[1]}</td></tr>`).join(""):h.map(x=>x[0]+" "+x[1]).join("<br>")})}
API.hours().then(r=>{HR=r;drawHours()}).catch(()=>{$$("[data-hours]:not([data-hours=table])").forEach(e=>e.textContent="Contact the office for hours")});
