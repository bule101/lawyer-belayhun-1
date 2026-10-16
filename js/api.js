const API=(()=>{
const live=!!(CFG.supabaseUrl&&CFG.supabaseKey);
const lg=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},ls=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const ss=(k,v)=>{try{v==null?sessionStorage.removeItem(k):sessionStorage.setItem(k,v)}catch(e){}},sg=k=>{try{return sessionStorage.getItem(k)}catch(e){return null}};
let tok=sg("tok"),me=null;try{me=JSON.parse(sg("me"))}catch(e){}
async function auth(path,body,method,t){const r=await fetch(CFG.supabaseUrl+"/auth/v1/"+path,{method:method||"POST",headers:{apikey:CFG.supabaseKey,"Content-Type":"application/json",...(t?{Authorization:"Bearer "+t}:{})},body:JSON.stringify(body)});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error_description||j.msg||j.message||"Request failed");return j}
async function rest(p,o={}){const h={apikey:CFG.supabaseKey,"Content-Type":"application/json",Authorization:"Bearer "+(o.auth&&tok?tok:CFG.supabaseKey)};const m=o.method||"GET";if(m==="POST"||m==="PATCH")h.Prefer="return=representation";
 const r=await fetch(CFG.supabaseUrl+"/rest/v1/"+p,{method:m,headers:h,body:o.body===undefined?undefined:JSON.stringify(o.body)});const t=await r.text();let j=null;try{j=t?JSON.parse(t):null}catch(e){}
 if(!r.ok)throw new Error((j&&(j.message||j.msg))||"Request failed ("+r.status+")");return j}
const pad=n=>String(n).padStart(2,"0"),tm=m=>pad(Math.floor(m/60))+":"+pad(m%60),mn=t=>+t.slice(0,2)*60+ +t.slice(3,5),hm=t=>t?String(t).slice(0,5):null;
const today=()=>new Date().toLocaleDateString("en-CA"),addDays=(d,n)=>{const x=new Date(d+"T12:00:00");x.setDate(x.getDate()+n);return x.toLocaleDateString("en-CA")};
const SET=()=>({window_days:14,notice_hours:2,...lg("settings",{})});
const DEF=[1,2,3,4,5].flatMap(w=>[{weekday:w,start_time:"09:00",end_time:"12:00",slot_min:60},{weekday:w,start_time:"14:00",end_time:"17:00",slot_min:60}]).concat([{weekday:6,start_time:"09:00",end_time:"12:00",slot_min:60}]);
function localSlots(d){const w=new Date(d+"T12:00:00").getDay(),bl=lg("blocks",[]).filter(b=>b.date===d),bk=lg("bk",[]).filter(b=>b.date===d&&b.status!=="cancelled").map(b=>b.time),now=new Date(),nm=now.getHours()*60+now.getMinutes(),out=[];
 lg("rules",DEF).filter(r=>r.weekday===w).forEach(r=>{for(let m=mn(r.start_time);m+r.slot_min<=mn(r.end_time);m+=r.slot_min){const s=tm(m),blocked=bl.some(b=>!b.start_time||(m>=mn(b.start_time)&&m<mn(b.end_time))),past=new Date(d+"T"+s+":00").getTime()<=Date.now()+SET().notice_hours*3600000;out.push({slot:s,available:!blocked&&!past&&!bk.includes(s)})}});return out.sort((a,b)=>a.slot<b.slot?-1:1)}
return{live,today,addDays,
 async slots(d,l){if(live)return(await rest("rpc/get_day_slots",{method:"POST",body:l?{d,p_lawyer:l}:{d}})).map(x=>({slot:hm(x.slot),available:x.available}));return localSlots(d)},
 async openDays(from,n,l){if(live)return(await rest("rpc/get_open_days",{method:"POST",body:l?{p_from:from,p_days:n,p_lawyer:l}:{p_from:from,p_days:n}})).map(x=>String(x).slice(0,10));const o=[];for(let i=0;i<Math.min(n,SET().window_days);i++){const d=addDays(from,i);if(localSlots(d).some(s=>s.available))o.push(d)}return o},
 async book(b){if(live)return rest("rpc/create_booking",{method:"POST",body:{p_service:b.svc+1,p_mode:b.mode,p_date:b.date,p_time:b.time,p_name:b.name,p_phone:b.phone,p_email:b.email,p_note:b.note,...(b.lawyer?{p_lawyer:b.lawyer}:{})}});
  if(!localSlots(b.date).some(s=>s.slot===b.time&&s.available))throw new Error("That time is not available. Choose another slot.");
  const ref="BL-"+Math.random().toString(36).slice(2,7).toUpperCase();ls("bk",[...lg("bk",[]),{id:ref,ref,date:b.date,time:b.time,name:b.name,phone:b.phone,email:b.email,note:b.note,mode:b.mode,service:b.svcName,status:"pending"}]);return ref},
 async hours(){if(live)return(await rest("rpc/get_hours",{method:"POST",body:{}})).map(x=>({weekday:x.weekday,start_time:hm(x.start_time),end_time:hm(x.end_time)}));return lg("rules",DEF)},
 async lookup(ref,phone){if(live){const r=await rest("rpc/lookup_booking",{method:"POST",body:{p_ref:ref,p_phone:phone}});return r[0]?{ref:r[0].ref,date:r[0].date,time:hm(r[0].start_time),status:r[0].status,service:r[0].service,mode:r[0].mode,name:r[0].name,lawyer:r[0].lawyer}:null}
  const d=s=>String(s).replace(/\D/g,"").slice(-9);return lg("bk",[]).find(b=>b.ref===ref.trim().toUpperCase()&&d(b.phone)===d(phone))||null},
 async cancelMine(ref,phone){if(live)return rest("rpc/cancel_booking",{method:"POST",body:{p_ref:ref,p_phone:phone}});const b=await this.lookup(ref,phone);if(!b||b.status==="cancelled"||new Date(b.date+"T"+b.time+":00")-Date.now()<7200000)return false;ls("bk",lg("bk",[]).map(x=>x.ref===b.ref?{...x,status:"cancelled"}:x));return true},
 async settings(){if(live){const r=await rest("rpc/get_settings",{method:"POST",body:{}});return r[0]||SET()}return SET()},
 async saveSettings(v){if(live)return rest("settings?id=eq.1",{method:"PATCH",auth:1,body:v});ls("settings",{...SET(),...v})},
 async articles(){if(live)return rest("articles?select=id,category,title,body&published=eq.true&order=created_at.desc");return lg("articles",[]).filter(a=>a.published).sort((a,b)=>b.id-a.id)},
 async adminArticles(){if(live)return rest("articles?select=*&order=created_at.desc",{auth:1});return lg("articles",[]).sort((a,b)=>b.id-a.id)},
 async saveArticle(a){const{id,...v}=a;if(live)return id?rest("articles?id=eq."+id,{method:"PATCH",auth:1,body:v}):rest("articles",{method:"POST",auth:1,body:v});
  const all=lg("articles",[]);ls("articles",id?all.map(x=>x.id===id?{...x,...v}:x):[...all,{id:Date.now(),published:true,...v}])},
 async delArticle(id){if(live)return rest("articles?id=eq."+id,{method:"DELETE",auth:1});ls("articles",lg("articles",[]).filter(x=>x.id!==id))},
 get me(){return live?me:{uid:"demo",role:"admin",name:"Demo admin"}},
 get authed(){return live?!!(tok&&me):true},
 async login(email,password){const j=await auth("token?grant_type=password",{email,password});tok=j.access_token;let role;
  try{role=await rest("rpc/claim_staff",{method:"POST",auth:1,body:{}})}catch(e){tok=null;throw e}
  if(!role){tok=null;throw new Error("This account is not set up as staff. Ask the admin to add your email first.")}
  const r=await rest("staff?select=full_name&user_id=eq."+j.user.id,{auth:1});me={uid:j.user.id,role,name:(r[0]&&r[0].full_name)||email};ss("tok",tok);ss("me",JSON.stringify(me))},
 logout(){tok=null;me=null;ss("tok",null);ss("me",null)},
 signup(email,password){return auth("signup",{email,password})},
 recover(email){return auth("recover",{email})},
 setPassword(t,password){return auth("user",{password},"PUT",t)},
 async bookings(){if(live)return(await rest("bookings?select=*,services(name_en),staff(full_name)&order=date,start_time",{auth:1})).map(b=>({lawyerId:b.lawyer_id,lawyer:b.staff&&b.staff.full_name,source:b.source,id:b.id,ref:b.ref,date:b.date,time:hm(b.start_time),name:b.name,phone:b.phone,email:b.email,note:b.note,status:b.status,mode:b.mode,service:b.services&&b.services.name_en}));return lg("bk",[]).sort((a,b)=>(a.date+a.time)<(b.date+b.time)?-1:1)},
 async setStatus(id,status){if(live)return rest("bookings?id=eq."+encodeURIComponent(id),{method:"PATCH",auth:1,body:{status}});ls("bk",lg("bk",[]).map(b=>b.id===id?{...b,status}:b))},
 async rules(cal){if(live)return(await rest("availability_rules?select=*&"+(cal?"lawyer_id=eq."+cal:"lawyer_id=is.null")+"&order=weekday,start_time",{auth:1})).map(x=>({...x,start_time:hm(x.start_time),end_time:hm(x.end_time)}));return lg("rules",DEF)},
 async saveRules(a,cal){if(live){await rest("availability_rules?id=gt.0&"+(cal?"lawyer_id=eq."+cal:"lawyer_id=is.null"),{method:"DELETE",auth:1});if(a.length)await rest("availability_rules",{method:"POST",auth:1,body:a.map(x=>cal?{...x,lawyer_id:cal}:x)});return}ls("rules",a)},
 async blocks(){if(live)return(await rest("blocked?select=*&order=date,start_time",{auth:1})).map(x=>({...x,start_time:hm(x.start_time),end_time:hm(x.end_time)}));return lg("blocks",[]).sort((a,b)=>a.date<b.date?-1:1)},
 async addBlocks(a){if(live)return rest("blocked",{method:"POST",auth:1,body:a});ls("blocks",[...lg("blocks",[]),...a.map((x,i)=>({...x,id:Date.now()+i}))])},
 async delBlock(id){if(live)return rest("blocked?id=eq."+id,{method:"DELETE",auth:1});ls("blocks",lg("blocks",[]).filter(b=>b.id!==id))},
 async staffBook(b){if(live&&!b.lawyer){const ref=await rest("rpc/create_booking",{method:"POST",body:{p_service:b.svc+1,p_mode:b.mode,p_date:b.date,p_time:b.time,p_name:b.name,p_phone:b.phone,p_email:b.email||"",p_note:b.note||""}});await rest("bookings?ref=eq."+encodeURIComponent(ref),{method:"PATCH",auth:1,body:{status:"confirmed",source:"reception"}});return[{ref}]}
  if(live)return rest("bookings",{method:"POST",auth:1,body:{service_id:b.svc+1,mode:b.mode,date:b.date,start_time:b.time,name:b.name,phone:b.phone,email:b.email||null,note:b.note||null,status:"confirmed",source:"reception",lawyer_id:b.lawyer||null}});
  if(!localSlots(b.date).some(s=>s.slot===b.time&&s.available))throw new Error("That time is not available.");
  const ref="BL-"+Math.random().toString(36).slice(2,7).toUpperCase();ls("bk",[...lg("bk",[]),{id:ref,ref,date:b.date,time:b.time,name:b.name,phone:b.phone,email:b.email,note:b.note,mode:b.mode,service:["Initial consultation","Case review","Contract review"][b.svc],status:"confirmed",source:"reception"}]);return[{ref}]},
 async reschedule(id,date,time){if(live)return rest("bookings?id=eq."+encodeURIComponent(id),{method:"PATCH",auth:1,body:{date,start_time:time}});ls("bk",lg("bk",[]).map(b=>b.id===id?{...b,date,time}:b))},
 async assign(id,lawyer){if(live)return rest("bookings?id=eq."+encodeURIComponent(id),{method:"PATCH",auth:1,body:{lawyer_id:lawyer}})},
 async delBooking(id){if(live)return rest("bookings?id=eq."+encodeURIComponent(id),{method:"DELETE",auth:1});ls("bk",lg("bk",[]).filter(b=>b.id!==id))},
 async staffList(){return live?rest("staff?select=*&order=full_name",{auth:1}):[]},
 async invites(){return live?rest("staff_invites?select=*&order=invited_at",{auth:1}):[]},
 invite(v){return rest("staff_invites",{method:"POST",auth:1,body:{...v,email:v.email.toLowerCase()}})},
 delInvite(e){return rest("staff_invites?email=eq."+encodeURIComponent(e),{method:"DELETE",auth:1})},
 updateStaff(id,v){return rest("staff?user_id=eq."+id,{method:"PATCH",auth:1,body:v})},
 delStaff(id){return rest("staff?user_id=eq."+id,{method:"DELETE",auth:1})},
 async reviews(){if(live)return rest("reviews?select=name,rating,body&status=eq.approved&order=created_at.desc&limit=6");return lg("reviews",[]).filter(r=>r.status==="approved").reverse()},
 async adminReviews(){if(live)return rest("reviews?select=*&order=created_at.desc",{auth:1});return lg("reviews",[]).slice().reverse()},
 async submitReview(v){if(live)return rest("rpc/submit_review",{method:"POST",body:{p_ref:v.ref,p_phone:v.phone,p_rating:v.rating,p_name:v.name,p_body:v.body}});
  const b=await this.lookup(v.ref,v.phone);if(!b||b.status!=="completed")throw new Error("We could not find a completed consultation with these details.");
  const all=lg("reviews",[]);if(all.some(r=>r.ref===b.ref))throw new Error("A review has already been submitted for this consultation.");ls("reviews",[...all,{id:Date.now(),ref:b.ref,name:v.name,rating:v.rating,body:v.body,status:"pending"}]);return true},
 async setReview(id,status){if(live)return rest("reviews?id=eq."+encodeURIComponent(id),{method:"PATCH",auth:1,body:{status}});ls("reviews",lg("reviews",[]).map(r=>String(r.id)===String(id)?{...r,status}:r))},
 async delReview(id){if(live)return rest("reviews?id=eq."+encodeURIComponent(id),{method:"DELETE",auth:1});ls("reviews",lg("reviews",[]).filter(r=>String(r.id)!==String(id)))},
 async lawyers(){if(!live)return[];try{return(await rest("rpc/get_lawyers",{method:"POST",body:{}})).map(x=>({id:x.id,name:x.name,title:x.title,bio:x.bio}))}catch(e){return[]}},
 readFile(f){return new Promise((ok,no)=>{const T=["application/pdf","image/jpeg","image/png","application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  if(!T.includes(f.type))return no(new Error(f.name+": use a PDF, JPG, PNG or DOCX file."));if(f.size>2000000)return no(new Error(f.name+": the file is larger than 2 MB."));
  const r=new FileReader();r.onload=()=>ok({name:f.name,mime:f.type,size:f.size,data:String(r.result).split(",")[1]});r.onerror=()=>no(new Error("Could not read "+f.name));r.readAsDataURL(f)})},
 async uploadDoc(ref,phone,f){if(live)return rest("rpc/upload_document",{method:"POST",body:{p_ref:ref,p_phone:phone,p_name:f.name,p_mime:f.mime,p_size:f.size,p_data:f.data}});
  const b=await this.lookup(ref,phone);if(!b||!["pending","confirmed"].includes(b.status))throw new Error("We could not find an open booking with these details.");const all=lg("docs",[]);
  if(all.filter(d=>d.booking===b.ref).length>=5)throw new Error("You can attach up to 5 documents.");ls("docs",[...all,{id:Date.now()+Math.random(),booking:b.ref,filename:f.name,mime:f.mime,size:f.size,data:f.data,created_at:new Date().toISOString()}]);return 1},
 async myDocs(ref,phone){if(live)return rest("rpc/list_my_documents",{method:"POST",body:{p_ref:ref,p_phone:phone}});const b=await this.lookup(ref,phone);return b?lg("docs",[]).filter(d=>d.booking===b.ref).map(({data,...x})=>x):[]},
 async delMyDoc(ref,phone,id){if(live)return rest("rpc/delete_my_document",{method:"POST",body:{p_ref:ref,p_phone:phone,p_id:Number(id)}});ls("docs",lg("docs",[]).filter(d=>String(d.id)!==String(id)))},
 async docs(){if(live)return rest("documents?select=id,booking_id,filename,mime,size,created_at&order=created_at",{auth:1});return lg("docs",[]).map(({data,booking,...x})=>({...x,booking_id:booking}))},
 async docData(id){if(live)return(await rest("documents?select=data,filename,mime&id=eq."+id,{auth:1}))[0];return lg("docs",[]).find(d=>String(d.id)===String(id))}
}
})();
