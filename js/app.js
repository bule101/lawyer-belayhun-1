const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const NAV=[["index.html","Home","መነሻ","Fuula Duraa"],["about.html","About","ስለ እኔ","Waa'ee Keenya"],["services.html","Practice areas","አገልግሎቶች","Gamtaawwan Hojii"],["insights.html","Insights","ጽሑፎች","Barruulee"],["contact.html","Contact","ያግኙን","Nu Qunnamaa"]];
const here=(location.pathname.split("/").pop()||"index.html");
let lang=(()=>{try{return localStorage.getItem("lang")||"en"}catch(e){return"en"}})();
const links=cls=>NAV.map(n=>`<a ${cls?'class="l"':""} href="${n[0]}" ${n[0]===here?'aria-current="page"':""} data-en="${n[1]}" data-am="${n[2]}" data-om="${n[3]}">${n[1]}</a>`).join("");
const lg=`<div class="lang" role="group" aria-label="Language"><button data-l="en">EN</button><button data-l="am">አማ</button><button data-l="om">OM</button></div>`;
$("#hdr").innerHTML=`<a class="skip" href="#main">Skip to content</a><header><div class="wrap nav"><a class="brand" href="index.html"><span class="mark"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 7v17M11 24h10M7 11h18M7 11l-4 8a4 4 0 0 0 8 0l-4-8zM25 11l-4 8a4 4 0 0 0 8 0l-4-8z"/></svg></span><span class="bn">${CFG.short}<small>Advocate &amp; Legal Counsel</small></span></a>
<nav class="d" aria-label="Main">${links(0)}</nav><div class="tools">${lg}<a class="btn sm" href="book.html" data-en="Book a consultation" data-am="ቀጠሮ ያስይዙ" data-om="Beellama Qabadhu">Book a consultation</a>
<button class="tbtn" id="th" aria-label="Toggle dark mode">\u25d0</button><button class="burger" id="bg" aria-expanded="false" aria-controls="dp" aria-label="Menu"><span><i></i><i></i><i></i></span></button></div></div>
<div class="drop" id="dp" inert><div><nav aria-label="Mobile">${links(1)}</nav>${lg}<a class="btn" href="book.html" data-en="Book a consultation" data-am="ቀጠሮ ያስይዙ" data-om="Beellama Qabadhu">Book a consultation</a><button class="tbtn" id="th2" aria-label="Toggle dark mode">\u25d0 Dark / light</button></div></div></header>`;
const bg=$("#bg"),dp=$("#dp");
function tog(o){bg.setAttribute("aria-expanded",o);dp.classList.toggle("open",o);dp.inert=!o}
bg.onclick=()=>tog(bg.getAttribute("aria-expanded")!=="true");
document.addEventListener("keydown",e=>{if(e.key==="Escape")tog(false)});
document.addEventListener("click",e=>{if(!e.target.closest("header"))tog(false)});
dp.addEventListener("click",e=>{if(e.target.closest("a"))tog(false)});
$("#ftr").innerHTML=`<footer><div class="wrap g"><div><h3>${CFG.name}</h3><p style="opacity:.85;margin:0">Advocate &amp; Legal Counsel<br>${CFG.address}</p></div>
<div><h3>Pages</h3>${NAV.map(n=>`<a href="${n[0]}">${n[1]}</a>`).join("")}<a href="book.html">Book a consultation</a><a href="manage.html">Manage my booking</a><a href="terms.html">Terms &amp; privacy</a><a href="admin.html">Staff login</a></div>
<div><h3>Contact</h3><a href="tel:${CFG.phone.replace(/\s/g,"")}">${CFG.phone}</a><a href="mailto:${CFG.email}">${CFG.email}</a><a href="https://wa.me/${CFG.wa}" target="_blank" rel="noopener">WhatsApp</a><a href="https://t.me/${CFG.telegram}" target="_blank" rel="noopener">Telegram</a><div class="soc"><a href="${CFG.facebook}">Facebook</a><a href="${CFG.linkedin}">LinkedIn</a><a href="${CFG.youtube}">YouTube</a></div></div>
<div><h3>Hours</h3><span style="opacity:.85" data-hours>Loading…</span></div></div>
<div class="wrap fine"><a href="terms.html#terms">Terms of use</a><a href="terms.html#privacy">Privacy notice</a><br><br>${CFG.license?"Licensed advocate, licence no. "+CFG.license+"<br>":""}Information on this site is general and is not legal advice. Contacting the office does not by itself create an advocate–client relationship.</div></footer>`;
function setLang(l){lang=l;try{localStorage.setItem("lang",l)}catch(e){}document.documentElement.lang=l;
 $$("[data-am]").forEach(e=>{if(!e.dataset.en)e.dataset.en=e.textContent;e.textContent=l==="en"?e.dataset.en:(e.dataset[l]||e.dataset.en)});$$(".lang button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.l===l))}
document.addEventListener("click",e=>{const b=e.target.closest(".lang button");if(b)setLang(b.dataset.l)});setLang(lang);
// photo lightbox: click any figure whose image loaded
const dl=document.createElement("dialog");dl.innerHTML='<img alt=""><p></p>';document.body.append(dl);dl.onclick=()=>dl.close();
$$(".gal figure").forEach(f=>f.onclick=()=>{const i=f.querySelector("img");if(!i)return;dl.querySelector("img").src=i.src;dl.querySelector("p").textContent=f.querySelector("figcaption").textContent;dl.showModal()});

document.documentElement.classList.add("js");
const sb=document.createElement("div");sb.className="sbar";sb.innerHTML=`<a href="tel:${CFG.phone.replace(/\s/g,"")}">Call</a><a href="https://wa.me/${CFG.wa}" target="_blank" rel="noopener">WhatsApp</a><a href="book.html">Book now</a>`;document.body.append(sb);
function theme(t){document.documentElement.dataset.theme=t;try{localStorage.setItem("theme",t)}catch(e){}}
try{const t=localStorage.getItem("theme");if(t)theme(t)}catch(e){}
document.addEventListener("click",e=>{if(e.target.closest("#th,#th2"))theme((document.documentElement.dataset.theme||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"))==="dark"?"light":"dark")});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add("in");io.unobserve(e.target);const n=e.target.dataset.count;if(n){const t=+n,s=e.target.dataset.suf||"",t0=performance.now();(function f(now){const p=Math.min((now-t0)/1200,1);e.target.textContent=Math.round(t*(1-Math.pow(1-p,3)))+s;if(p<1)requestAnimationFrame(f)})(t0)}}),{threshold:.2});
$$(".reveal,[data-count]").forEach(e=>io.observe(e));

function hoursRows(r){const N=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],o=[1,2,3,4,5,6,0],by={};r.forEach(x=>(by[x.weekday]=by[x.weekday]||[]).push(String(x.start_time).slice(0,5)+"–"+String(x.end_time).slice(0,5)));
 const v=o.map(d=>[d,(by[d]||[]).join(", ")||"Closed"]),out=[];for(let i=0;i<v.length;){let j=i;while(j+1<v.length&&v[j+1][1]===v[i][1])j++;out.push([i===j?N[v[i][0]]:N[v[i][0]]+"–"+N[v[j][0]],v[i][1]]);i=j+1}return out}
API.hours().then(r=>{const h=hoursRows(r);$$("[data-hours]").forEach(e=>{e.innerHTML=e.dataset.hours==="table"?h.map(x=>`<tr><td>${x[0]}</td><td>${x[1]}</td></tr>`).join(""):h.map(x=>x[0]+" "+x[1]).join("<br>")})}).catch(()=>{$$("[data-hours]:not([data-hours=table])").forEach(e=>e.textContent="Contact the office for hours")});
