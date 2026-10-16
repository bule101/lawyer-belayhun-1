// Browser-free smoke tests: runs each page's script against a tiny fake DOM in demo mode.
// Usage: node tests/smoke.js      (from the site folder)
const fs=require("fs"),path=require("path");const root=path.join(__dirname,"..");
let pass=0,fail=0;const ok=(c,m)=>{if(c){pass++}else{fail++;console.log("  FAIL:",m)}};
const tick=()=>new Promise(r=>setTimeout(r,5));
function mkEl(id){return{id,_html:"",value:"",checked:false,hidden:false,disabled:false,textContent:"",className:"",style:{},dataset:{},files:[],min:"",
 classList:{add(){},remove(){},toggle(){},contains(){return false}},
 get innerHTML(){return this._html},set innerHTML(v){this._html=String(v)},insertAdjacentHTML(p,h){this._html+=h},
 addEventListener(){},querySelector(){return mkEl("q")},querySelectorAll(){return[]},closest(){return null},setAttribute(){},getAttribute(){return null},
 remove(){},click(){},focus(){},scrollIntoView(){},appendChild(){},append(){},get parentElement(){return mkEl("p")}}}
function loadApi(){const store={};const ls={getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=v,removeItem:k=>delete store[k]};
 const code=fs.readFileSync(path.join(root,"js/api.js"),"utf8");return new Function("CFG","localStorage","sessionStorage",code+";return API")({name:"Adv. Belayhun",phone:"+251 911 000 000",wa:"251911000000",email:"x@y.z",address:"Bole"},ls,ls)}
function runPage(file,API,extra=""){const html=fs.readFileSync(path.join(root,file),"utf8"),js=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].pop()[1];
 const ids=new Set([...html.matchAll(/id=\\?"([A-Za-z0-9_]+)\\?"/g)].map(m=>m[1])),EL={},alerts=[],hook={};
 const getEl=id=>EL[id]||(EL[id]=mkEl(id));ids.forEach(getEl);
 const shims={document:{getElementById:getEl,createElement:()=>mkEl("n"),querySelectorAll:()=>[],querySelector:()=>mkEl("q"),addEventListener(){},body:mkEl("body"),documentElement:{classList:{add(){}},dataset:{}}},
  window:{scrollTo(){}},location:{hash:"",pathname:"/"+file,search:""},history:{replaceState(){}},URL:Object.assign(function(){},{createObjectURL:()=>"blob:x",revokeObjectURL(){}}),URLSearchParams,Blob:function(){},
  confirm:()=>true,prompt:()=>"Value text here",alert:m=>alerts.push(m),CFG:{name:"Adv. Belayhun",phone:"+251 911 000 000",wa:"251911000000",email:"x@y.z",address:"Bole"},API,lang:"en",__hook:o=>Object.assign(hook,o),$:s=>getEl(s.replace("#","")),$$:()=>[]};
 const g=new Proxy({},{has:(t,k)=>typeof k==="string"&&(ids.has(k)||k in shims),get:(t,k)=>ids.has(k)?getEl(k):shims[k],set:(t,k,v)=>{shims[k]=v;return true}});
 new Function("g","with(g){"+js+"\n;"+extra+"}")(g);return{EL,hook,alerts}}
const spy=(API,names)=>{const calls=[];for(const n of names){const o=API[n];API[n]=async(...a)=>{calls.push([n,...a]);return o.apply(API,a)}}return calls};
const btn=(d,cls=[])=>({target:{closest:()=>({dataset:d,classList:{contains:c=>cls.includes(c)}}),classList:{contains:c=>cls.includes(c)},dataset:d,value:d.value}});

(async()=>{
const staff=[{user_id:"ua",full_name:"Ada Admin",email:"ada@x.com",role:"admin",active:true},{user_id:"u1",full_name:"Lawyer One",role:"lawyer",active:true,title:"Senior Advocate"},{user_id:"u2",full_name:"Lawyer Two",role:"lawyer",active:true},{user_id:"ur",full_name:"Rita Reception",role:"reception",active:true}];
async function admin(role,uid){const API=loadApi(),t=API.today(),d1=API.addDays(t,1);
 const bks=[{id:"b1",ref:"BL-AAAAA",date:d1,time:"09:00",name:"Alem <script>alert(1)</script>",phone:"0911000001",email:"a@x.com",note:"hello",status:"pending",mode:"office",service:"Initial consultation",lawyerId:"u1",lawyer:"Lawyer One",source:"online"},
  {id:"b2",ref:"BL-BBBBB",date:d1,time:"10:00",name:"Bekele",phone:"0911000002",status:"confirmed",mode:"phone",service:"Case review",lawyerId:null,source:"reception"},
  {id:"b3",ref:"BL-CCCCC",date:API.addDays(t,-3),time:"11:00",name:"Chaltu",phone:"0911000003",status:"completed",mode:"video",service:"Contract review",lawyerId:"u1"}];
 API.bookings=async()=>role==="lawyer"?bks.filter(b=>b.lawyerId===uid):bks;API.staffList=async()=>staff;API.invites=async()=>[{email:"new@x.com",full_name:"New Person",role:"lawyer"}];
 API.adminReviews=async()=>[{id:5,rating:4,name:"Client",body:"Good service overall.",status:"pending"}];
 API.blocks=async()=>[{id:1,date:API.addDays(t,5),start_time:null,end_time:null,lawyer_id:null,reason:"Holiday"},{id:2,date:API.addDays(t,6),start_time:"09:00",end_time:"11:00",lawyer_id:"u1",reason:"Court"}];
 API.docs=async()=>role==="reception"?[]:[{id:1,booking_id:"b1",filename:"contract.pdf",mime:"application/pdf",size:2048,created_at:""}];
 API.docData=async()=>({data:"JVBERi0x",filename:"contract.pdf",mime:"application/pdf"});
 Object.defineProperty(API,"me",{get:()=>({uid,role,name:"Tester"})});Object.defineProperty(API,"authed",{get:()=>true});
 const calls=spy(API,["setStatus","assign","reschedule","addBlocks","saveRules","rules","staffBook","updateStaff","setReview","saveSettings"]);
 const P=runPage("admin.html",API,"__hook({card,rBk})");await tick();await tick();return{API,calls,...P,t,d1}}

console.log("admin role");{const{API,calls,EL,alerts,t,d1}=await admin("admin","ua");
 ok(!alerts.length,"no alerts: "+alerts);
 for(const n of ["Bookings","New booking","Opening hours","Block dates","Articles","Reviews","Staff"])ok(EL.tabs.innerHTML.includes(n),"tab "+n);
 ok(EL.bl1.innerHTML.includes("Alem &lt;script&gt;")&&!EL.bl1.innerHTML.includes("<script>alert"),"XSS escaped in booking card");
 ok(EL.bl1.innerHTML.includes("Documents:")&&EL.bl1.innerHTML.includes("contract.pdf"),"documents shown");ok(EL.bl1.innerHTML.includes("Lawyer: Lawyer One")&&EL.bl1.innerHTML.includes('class="in as"'),"lawyer + assign select");
 ok(EL.bl1.innerHTML.includes("Delete"),"admin can delete");ok(EL.bl1.innerHTML.includes('<h3 class="dh">Today')||EL.bl1.innerHTML.includes('class="dh"'),"day headings");
 ok(EL.cal.innerHTML.includes("Lawyer Two"),"calendar selector lists lawyers");ok(EL.calrow.style.display==="","calendar row visible");ok(EL.dr.innerHTML.split('class="dr"').length===8,"7 weekday rows");
 ok(EL.bll.innerHTML.includes("Firm-wide")&&EL.bll.innerHTML.includes("Lawyer One"),"blocks show scope");ok(EL.sflist.innerHTML.includes('data-pf="1"'),"lawyer Profile button");ok(EL.ivlist.innerHTML.includes("new@x.com"),"invites listed");ok(EL.rvl.innerHTML.includes("Approve"),"review approve");
 await EL.bl1.onclick(btn({i:"b1",a:"confirmed"}));ok(calls.some(c=>c[0]==="setStatus"&&c[1]==="b1"&&c[2]==="confirmed"),"confirm calls setStatus");
 await EL.bl1.onchange(btn({i:"b2",value:"u2"},["as"]));ok(calls.some(c=>c[0]==="assign"&&c[2]==="u2"),"assign lawyer");
 await EL.bl1.onclick(btn({dl:"1"}));ok(!alerts.length,"document download runs: "+alerts);
 EL.cal.value="u1";await EL.cal.onchange();ok(calls.some(c=>c[0]==="rules"&&c[1]==="u1"),"calendar switch loads lawyer rules");
 EL.sl.value="60";await EL.sv1.onclick();ok(/Tick at least one day/.test(EL.avm.textContent),"lawyer calendar cannot be saved empty: "+EL.avm.textContent);
 EL.b1.value=API.addDays(t,3);EL.b2.value="";EL.ball.checked=true;EL.bcal.value="u1";EL.br.value="Court";await EL.ab.onclick();ok(calls.some(c=>c[0]==="addBlocks"&&c[1][0].lawyer_id==="u1"),"block saved for chosen lawyer");
 EL.nn.value="Walk In";EL.np.value="0911222333";EL.nd.value=API.addDays(t,2);EL.ntm.value="09:00";EL.nl.value="";await EL.nbk.onclick();ok(calls.some(c=>c[0]==="staffBook"&&!c[1].lawyer),"reception booking via any-available lawyer");
 await EL.sflist.onclick(btn({u:"u1",pf:"1"}));ok(calls.some(c=>c[0]==="updateStaff"&&c[1]==="u1"&&c[2].title),"profile edit");
 await EL.rvl.onclick(btn({i:"5",s:"approved"}));ok(calls.some(c=>c[0]==="setReview"&&c[2]==="approved"),"review approval")}
console.log("lawyer role");{const{EL,alerts}=await admin("lawyer","u1");
 ok(!alerts.length,"no alerts: "+alerts);ok(EL.tabs.innerHTML.includes("My hours")&&EL.tabs.innerHTML.includes("My time off")&&EL.tabs.innerHTML.includes("Articles"),"lawyer tabs");
 ok(!EL.tabs.innerHTML.includes("Staff")&&!EL.tabs.innerHTML.includes("Reviews")&&!EL.tabs.innerHTML.includes("New booking"),"no admin/reception tabs");
 ok(EL.calrow.style.display==="none"&&EL.setrow.style.display==="none","calendar chooser and booking rules hidden");ok(EL.bcrow.style.display==="none","block scope hidden");
 ok(!EL.bl1.innerHTML.includes("Bekele"),"sees only own bookings");ok(!EL.bl1.innerHTML.includes("Delete")&&!EL.bl1.innerHTML.includes("Reschedule"),"no delete/reschedule");ok(EL.bl1.innerHTML.includes("Confirm"),"can confirm");
 ok(EL.bll.innerHTML.split("Remove").length===2,"can remove only own block (1 button)")}
console.log("reception role");{const{EL,alerts}=await admin("reception","ur");
 ok(!alerts.length,"no alerts: "+alerts);ok(EL.tabs.innerHTML.includes("New booking")&&EL.tabs.innerHTML.includes("Block dates"),"reception tabs");
 ok(!EL.tabs.innerHTML.includes("Opening hours")&&!EL.tabs.innerHTML.includes("Staff")&&!EL.tabs.innerHTML.includes("Articles"),"no admin tabs");ok(!EL.bl1.innerHTML.includes("Delete")&&EL.bl1.innerHTML.includes("Reschedule")&&!EL.bl1.innerHTML.includes("Documents:"),"reception actions, no documents")}

console.log("booking page");{const API=loadApi(),t=API.today(),d=API.addDays(t,2),w=new Date(d+"T12:00:00").getDay();await API.saveRules([{weekday:w,start_time:"09:00",end_time:"12:00",slot_min:60}]);
 API.lawyers=async()=>[{id:"u1",name:"Lawyer One",title:"Senior"},{id:"u2",name:"Lawyer Two"}];API.readFile=async f=>({name:f.name,mime:"application/pdf",size:10,data:"JVBERi0x"});
 const calls=spy(API,["slots","book","uploadDoc","openDays"]);const{EL,hook,alerts}=runPage("book.html",API,"__hook({get st(){return st},renderSlots,loadOpen})");await tick();
 ok(EL.lwrow.hidden===false&&EL.lw.innerHTML.includes("Lawyer Two"),"lawyer picker shown with 2 lawyers");
 EL.lw.value="u2";hook.st.s=0;hook.st.m=0;hook.st.d=d;await hook.loadOpen();await hook.renderSlots();ok(calls.some(c=>c[0]==="openDays"&&c[3]==="u2")&&calls.some(c=>c[0]==="slots"&&c[2]==="u2"),"slots and open days use the chosen lawyer");
 hook.st.t="09:00";EL.fn.value="Test User";EL.ph.value="+251911000000";EL.ag.checked=true;await EL.n2.onclick();
 ok(calls.some(c=>c[0]==="book"&&c[1].lawyer==="u2"),"booking sends the chosen lawyer: "+EL.err.textContent);ok(/^BL-/.test(EL.ref_.textContent),"reference shown");
 EL.docf.files=[{name:"a.pdf",type:"application/pdf",size:10}];await EL.docu.onclick();ok(calls.some(c=>c[0]==="uploadDoc")&&EL.docl.innerHTML.includes("Uploaded"),"document upload on confirmation");ok(!alerts.length,"no alerts")}
console.log("manage page");{const API=loadApi(),t=API.today(),d=API.addDays(t,2),w=new Date(d+"T12:00:00").getDay();await API.saveRules([{weekday:w,start_time:"09:00",end_time:"12:00",slot_min:60}]);
 const ref=(await API.staffBook({svc:0,mode:"office",date:d,time:"09:00",name:"M C",phone:"0911777777"}))[0].ref;
 const{EL}=runPage("manage.html",API);EL.mref.value=ref;EL.mph.value="0911777777";await EL.mgo.onclick();await tick();
 ok(EL.mout.innerHTML.includes(ref)&&EL.mout.innerHTML.includes("Cancel this booking"),"booking details and cancel button");ok(EL.mout.innerHTML.includes("Documents")&&EL.mout.innerHTML.includes("mupl"),"document section for open booking");
 await API.setStatus(ref,"completed");EL.mout.innerHTML="";await EL.mgo.onclick();await tick();ok(EL.mout.innerHTML.includes("How was your consultation?"),"review form after completion");ok(!EL.mout.innerHTML.includes("Cancel this booking"),"no cancel for completed")}
console.log("\n"+pass+" passed, "+fail+" failed");process.exit(fail?1:0)})().catch(e=>{console.log("CRASH",e);process.exit(1)});
