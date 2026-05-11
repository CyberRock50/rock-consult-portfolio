import { useState, useMemo, useEffect, useRef } from "react";

const FONTS={sans:"system-ui,-apple-system,'Segoe UI',Arial,sans-serif",serif:"Georgia,'Times New Roman',serif"};
const C={cream:"#f4f0e6",creamDk:"#e8e2d4",forest:"#1b2d1b",sage:"#3b82f6",sageLt:"#93c5fd",sagePl:"#dbeafe",ink:"#1a1a14",muted:"#6b6b5e",border:"rgba(26,26,20,0.1)"};
const SITES=["Main Campus","North Clinic","South Clinic","East Wing","West Wing","Telehealth Hub"];
const DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const SHIFTS=["Morning","Afternoon","Night"];
const DEPTS=["Clinical","Administrative","IT","Executive","HR"];
const SH_BG  ={Morning:"#dbeafe",Afternoon:"#fefce8",Night:"#0f172a"};
const SH_TXT ={Morning:"#1e40af",Afternoon:"#713f12",Night:"#93c5fd"};
const SH_BRD ={Morning:"#bfdbfe",Afternoon:"#fde68a",Night:"#1e293b"};
const DEPT_CLR={Clinical:"#3b82f6",Administrative:"#ec4899",IT:"#10b981",Executive:"#8b5cf6",HR:"#f59e0b"};
const DEPT_BG ={Clinical:"#dbeafe",Administrative:"#fce7f3",IT:"#d1fae5",Executive:"#ede9fe",HR:"#fef3c7"};
const ST_STATUS_COLOR={"Active":{bg:"#dcfce7",color:"#15803d",border:"#86efac"},"On Leave":{bg:"#fef3c7",color:"#92400e",border:"#fde68a"},"Inactive":{bg:"#e8e2d4",color:"#6b6b5e",border:"#a8a89a"},"NLE":{bg:"#fecaca",color:"#7f1d1d",border:"#fca5a5"}};
const TARGET=7;
const ck=(si,di,shi)=>`${si}|${di}|${shi}`;
const pk=k=>k.split("|").map(Number);
const dayTotal=(s,si,di)=>SHIFTS.reduce((n,_,shi)=>n+(s[ck(si,di,shi)]?.length||0),0);
const covColor=n=>n>=TARGET?"#15803d":n>=5?"#ca8a04":"#dc2626";
const covBg   =n=>n>=TARGET?"#dcfce7":n>=5?"#fef3c7":"#fecaca";
const initials=n=>n.split(" ").map(w=>w[0]).join("").slice(0,2);
const nowStr  =()=>new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"});
const blankForm={name:"",dept:"Clinical",role:"",site:0,shift:0,type:"FT",days:[0,1,2,3,4]};

const STAFF_SEED=[
  {id:1, name:"Sarah Chen",      dept:"Clinical",      role:"RN",             site:0,shift:0,type:"FT", days:[0,1,2,3,4]},
  {id:2, name:"Michael Park",    dept:"Clinical",      role:"Physician",      site:0,shift:0,type:"FT", days:[0,1,2,3,4]},
  {id:3, name:"Emma Davis",      dept:"Clinical",      role:"Med Asst",       site:0,shift:0,type:"FT", days:[0,1,2,3,4]},
  {id:4, name:"David Kim",       dept:"Executive",     role:"CISO",           site:0,shift:0,type:"FT", days:[0,1,2,3,4]},
  {id:5, name:"Sandra Lee",      dept:"Administrative",role:"Billing Spec",   site:0,shift:1,type:"FT", days:[0,1,2,3,4]},
  {id:6, name:"Marcus Williams", dept:"HR",            role:"HR Manager",     site:0,shift:1,type:"FT", days:[0,1,2,3,4]},
  {id:7, name:"Ana Flores",      dept:"HR",            role:"Training Coord", site:0,shift:1,type:"FT", days:[0,1,2,3,4]},
  {id:8, name:"James Okoye",     dept:"IT",            role:"Security",       site:0,shift:2,type:"FT", days:[0,1,2,3,4]},
  {id:9, name:"Priya Patel",     dept:"IT",            role:"Sys Admin",      site:0,shift:2,type:"FT", days:[0,1,2,3,4]},
  {id:10,name:"Kevin Murphy",    dept:"Executive",     role:"CEO",            site:0,shift:2,type:"FT", days:[0,1,2,3]},
  {id:11,name:"Lisa Thompson",   dept:"Clinical",      role:"Physician",      site:1,shift:0,type:"FT", days:[0,1,2,3,4]},
  {id:12,name:"Carlos Vega",     dept:"Clinical",      role:"LPN",            site:1,shift:0,type:"FT", days:[0,1,2,3,4]},
  {id:13,name:"Aisha Johnson",   dept:"Clinical",      role:"RN",             site:1,shift:0,type:"FT", days:[0,1,2,3,4]},
  {id:14,name:"Maria Rodriguez", dept:"Administrative",role:"Med Secretary",  site:1,shift:1,type:"FT", days:[0,1,2,3,4]},
  {id:15,name:"Brian White",     dept:"Administrative",role:"Receptionist",   site:1,shift:1,type:"FT", days:[0,1,2,3,4]},
  {id:16,name:"Clara James",     dept:"Administrative",role:"Med Secretary",  site:1,shift:1,type:"FT", days:[0,1,2,3,4]},
  {id:17,name:"Derek Hughes",    dept:"Administrative",role:"Billing Spec",   site:1,shift:2,type:"FT", days:[0,1,2,3,4]},
  {id:18,name:"Elena Fox",       dept:"Administrative",role:"Coordinator",    site:1,shift:2,type:"PT", days:[0,1,2]},
  {id:19,name:"Grace Kim",       dept:"Clinical",      role:"RN",             site:2,shift:0,type:"FT", days:[0,1,2,3,4]},
  {id:20,name:"Henry Brown",     dept:"Clinical",      role:"Med Asst",       site:2,shift:0,type:"FT", days:[0,1,2,3,4]},
  {id:21,name:"Iris Wong",       dept:"Clinical",      role:"Phys Therapist", site:2,shift:0,type:"FT", days:[0,1,2,3,4]},
  {id:22,name:"Jason Miller",    dept:"Clinical",      role:"LPN",            site:2,shift:1,type:"FT", days:[0,1,2,3,4]},
  {id:23,name:"Kate Nelson",     dept:"Clinical",      role:"RN",             site:2,shift:1,type:"FT", days:[0,1,2,3,4]},
  {id:24,name:"Leo Martinez",    dept:"Clinical",      role:"Physician",      site:2,shift:2,type:"FT", days:[0,1,2,3,4]},
  {id:25,name:"Maya Patel",      dept:"Clinical",      role:"Med Asst",       site:2,shift:2,type:"PRN",days:[0,2,4]},
  {id:26,name:"Nathan Scott",    dept:"Clinical",      role:"Radiologist",    site:3,shift:0,type:"FT", days:[0,1,2,3,4]},
  {id:27,name:"Olivia Chen",     dept:"Clinical",      role:"RN",             site:3,shift:0,type:"FT", days:[0,1,2,3,4]},
  {id:28,name:"Paul Davis",      dept:"Clinical",      role:"LPN",            site:3,shift:0,type:"FT", days:[0,1,2,3,4]},
  {id:29,name:"Quinn Ross",      dept:"HR",            role:"Training Coord", site:3,shift:1,type:"FT", days:[0,1,2,3,4]},
  {id:30,name:"Rosa Silva",      dept:"HR",            role:"HR Specialist",  site:3,shift:1,type:"FT", days:[0,1,2,3,4]},
  {id:31,name:"Sam Torres",      dept:"Clinical",      role:"Phlebotomist",   site:3,shift:2,type:"FT", days:[0,1,2,3,4]},
  {id:32,name:"Tina Morris",     dept:"Administrative",role:"Receptionist",   site:3,shift:2,type:"PT", days:[1,2,3,4]},
  {id:33,name:"Uma Patel",       dept:"Clinical",      role:"RN",             site:4,shift:0,type:"FT", days:[0,1,2,3,4]},
  {id:34,name:"Victor Cruz",     dept:"Clinical",      role:"Med Asst",       site:4,shift:0,type:"FT", days:[0,1,2,3,4]},
  {id:35,name:"Wendy Hall",      dept:"Clinical",      role:"Phys Therapist", site:4,shift:0,type:"FT", days:[0,1,2,3,4]},
  {id:36,name:"Xander Lee",      dept:"Administrative",role:"Coordinator",    site:4,shift:1,type:"FT", days:[0,1,2,3,4]},
  {id:37,name:"Yara Ahmed",      dept:"Clinical",      role:"LPN",            site:4,shift:1,type:"FT", days:[0,1,2,3,4]},
  {id:38,name:"Zoe Turner",      dept:"Clinical",      role:"RN",             site:4,shift:2,type:"FT", days:[0,1,2,3,4]},
  {id:39,name:"Adam Brooks",     dept:"IT",            role:"IT Support",     site:4,shift:2,type:"FT", days:[0,1,2,3,4]},
  {id:40,name:"Beth Carson",     dept:"Clinical",      role:"Telehealth RN",  site:5,shift:0,type:"FT", days:[0,1,2,3,4]},
  {id:41,name:"Carl Dixon",      dept:"Clinical",      role:"Telehealth MD",  site:5,shift:0,type:"FT", days:[0,1,2,3,4]},
  {id:42,name:"Dana Ellis",      dept:"Administrative",role:"Coordinator",    site:5,shift:0,type:"FT", days:[0,1,2,3,4]},
  {id:43,name:"Eric Ford",       dept:"IT",            role:"IT Support",     site:5,shift:0,type:"FT", days:[0,1,2,3,4]},
  {id:44,name:"Fay Green",       dept:"Clinical",      role:"Telehealth RN",  site:5,shift:1,type:"FT", days:[0,1,2,3,4]},
  {id:45,name:"Gil Harris",      dept:"Clinical",      role:"Telehealth MD",  site:5,shift:1,type:"FT", days:[0,1,2,3,4]},
  {id:46,name:"Hana Ingram",     dept:"Administrative",role:"Med Secretary",  site:5,shift:1,type:"PT", days:[0,1,2,3]},
  {id:47,name:"Ivan James",      dept:"Clinical",      role:"LPN",            site:5,shift:2,type:"FT", days:[0,1,2,3,4]},
  {id:48,name:"Jade King",       dept:"IT",            role:"Network Tech",   site:5,shift:2,type:"FT", days:[0,1,2,3,4]},
  {id:49,name:"Karl Long",       dept:"Clinical",      role:"Telehealth RN",  site:5,shift:2,type:"PRN",days:[0,2]},
  {id:50,name:"Lana Moon",       dept:"Administrative",role:"Receptionist",   site:5,shift:2,type:"PRN",days:[1,3]},
];

function buildSchedule(staff){
  const s={};
  for(let si=0;si<6;si++)for(let di=0;di<7;di++)for(let shi=0;shi<3;shi++)s[ck(si,di,shi)]=[];
  staff.forEach(st=>st.days.forEach(di=>{s[ck(st.site,di,st.shift)].push(st.id);}));
  return s;
}

function detectConflict(id,sch){
  return DAYS.some((_,di)=>{
    let n=0;
    SHIFTS.forEach((_,shi)=>SITES.forEach((_,si)=>{if((sch[ck(si,di,shi)]||[]).includes(id))n++;}));
    return n>1;
  });
}

// Routes through Netlify function — API key lives server-side only
async function callAI(prompt,system){
  const res=await fetch("/.netlify/functions/ai-proxy",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:1800,system:system||"Return only valid JSON, no markdown.",messages:[{role:"user",content:prompt}]})
  });
  if(!res.ok){const e=await res.json().catch(()=>{});throw new Error(e?.error?.message||`HTTP ${res.status}`);}
  const data=await res.json();
  const raw=(data.content?.[0]?.text||"").trim().replace(/^```[a-z]*\n?/i,"").replace(/```$/,"").trim();
  const s=raw.indexOf("{"),e=raw.lastIndexOf("}");
  if(s===-1||e===-1)throw new Error("No JSON in response");
  return JSON.parse(raw.slice(s,e+1));
}

// ── AutoScheduler sub-component ──
function AutoScheduler({staffList,onApply}){
  const [phase,   setPhase]   = useState("idle");
  const [aiSched, setAiSched] = useState(null);
  const [report,  setReport]  = useState(null);
  const [error,   setError]   = useState(null);
  const [progress,setProgress]= useState("");

  const run = async () => {
    setPhase("loading"); setError(null); setAiSched(null); setReport(null);
    try {
      setProgress("Reviewing staff roster and site requirements…");
      const manifest = staffList.map(s=>`${s.id}:${s.site}|${s.shift}|${s.type[0]}|${s.days.join("")}`).join(";");
      setProgress("Generating conflict-free weekly schedule…");
      const prompt = `Healthcare scheduler. 6 sites(0-5), 3 shifts(0=Morning,1=Afternoon,2=Night), 7 days(0=Mon). Target 7 staff/site/day. No double-bookings (staff in >1 site same day). Staff format id:defaultSite|defaultShift|F/P/R|workDays:\n${manifest}\nReturn ONLY compact JSON — per-staff assignments:\n{"assignments":[[id,site,shift,[days]]...],"coverage_score":0-100,"narrative":"2 sentences","gaps":["issue"],"optimizations":["win"]}\nMax 3 gaps and 3 optimizations. Each staff id appears once. Days must be subset of their workDays. Redistribute staff from default site/shift only when needed to fill gaps.`;
      const r = await callAI(prompt,"You are a healthcare workforce scheduler. Return only valid compact JSON, no markdown, no explanation.");
      setProgress("Validating for conflicts…");
      const full={};
      for(let si=0;si<6;si++)for(let di=0;di<7;di++)for(let shi=0;shi<3;shi++)full[ck(si,di,shi)]=[];
      (r.assignments||[]).forEach(([id,si,shi,days])=>{
        if(!staffList.some(s=>s.id===id))return;
        (days||[]).forEach(di=>{const k=ck(si,di,shi);if(!full[k].includes(id))full[k].push(id);});
      });
      const detectedConflicts=[];
      staffList.forEach(s=>{
        DAYS.forEach((_,di)=>{
          let n=0;
          SHIFTS.forEach((_,shi)=>SITES.forEach((_,si)=>{if((full[ck(si,di,shi)]||[]).includes(s.id))n++;}));
          if(n>1)detectedConflicts.push(`${s.name} double-booked on ${DAYS[di]}`);
        });
      });
      const coverage={};
      SITES.forEach((_,si)=>{coverage[si]={};DAYS.forEach((d,di)=>{coverage[si][d]=dayTotal(full,si,di);});});
      setAiSched(full);
      setReport({...r,detectedConflicts,coverage});
      setPhase("review");
    }catch(e){setError(`Scheduling failed: ${e.message}`);setPhase("idle");}
  };

  const apply=()=>{onApply(aiSched);setPhase("applied");};
  const reset=()=>{setPhase("idle");setAiSched(null);setReport(null);setError(null);};
  const sc=p=>p>=80?"#15803d":p>=60?"#92400e":"#9f1239";
  const sb=p=>p>=80?"#dcfce7":p>=60?"#fef3c7":"#fecaca";

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
          <div>
            <p style={{fontSize:14,fontWeight:500,color:C.ink,margin:"0 0 5px"}}>✦ Autonomous AI Scheduler</p>
            <p style={{fontSize:12,color:C.muted,margin:0,lineHeight:1.7,maxWidth:500}}>Claude autonomously generates a complete, conflict-free weekly schedule for all {staffList.length} staff across 6 sites and 3 shifts — targeting 7 staff per site per day with zero double-bookings. Review the proposed schedule before applying it.</p>
          </div>
          <div style={{display:"flex",gap:8,flexShrink:0}}>
            {(phase==="idle"||phase==="applied")&&<button onClick={run} style={{fontSize:13,fontWeight:500,padding:"9px 22px",borderRadius:7,background:C.sage,color:"#fff",border:"none",cursor:"pointer"}}>Generate Schedule</button>}
            {phase==="review"&&<><button onClick={reset} style={{fontSize:12,padding:"7px 14px",borderRadius:7,border:`0.5px solid ${C.border}`,background:"none",color:C.muted,cursor:"pointer"}}>Regenerate</button><button onClick={apply} style={{fontSize:13,fontWeight:500,padding:"9px 20px",borderRadius:7,background:C.forest,color:C.cream,border:"none",cursor:"pointer"}}>Apply to Schedule ✓</button></>}
          </div>
        </div>
      </div>

      {phase==="loading"&&(
        <div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"2.5rem",textAlign:"center"}}>
          <div style={{width:44,height:44,border:`3px solid ${C.sagePl}`,borderTopColor:C.sage,borderRadius:"50%",margin:"0 auto 16px",animation:"spin 0.8s linear infinite"}}/>
          <p style={{fontSize:14,fontWeight:500,color:C.ink,margin:"0 0 5px"}}>Scheduling in progress…</p>
          <p style={{fontSize:12,color:C.muted,margin:0}}>{progress}</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {error&&<div style={{background:"#fecaca",border:"0.5px solid #ef4444",borderRadius:10,padding:"1rem"}}><p style={{fontSize:13,color:"#7f1d1d",margin:0}}>{error}</p></div>}

      {phase==="applied"&&(
        <div style={{background:"#dcfce7",border:"0.5px solid #86efac",borderRadius:10,padding:"1.25rem",display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:44,height:44,borderRadius:"50%",background:"#16a34a",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:20,color:"#fff"}}>✓</span></div>
          <div>
            <p style={{fontSize:14,fontWeight:500,color:"#15803d",margin:"0 0 3px"}}>Schedule Applied Successfully</p>
            <p style={{fontSize:12,color:"#166534",margin:0}}>Switch to the Schedule tab to view and make manual adjustments. Use Undo to revert.</p>
          </div>
        </div>
      )}

      {report&&(phase==="review"||phase==="applied")&&(
        <>
          <div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              <div style={{width:64,height:64,borderRadius:"50%",background:sb(report.coverage_score||0),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:18,fontWeight:700,color:sc(report.coverage_score||0)}}>{report.coverage_score||"—"}</span>
              </div>
              <div><p style={{fontSize:13,fontWeight:500,color:C.ink,margin:"0 0 4px"}}>AI Coverage Score</p><p style={{fontSize:13,color:C.muted,margin:0,lineHeight:1.6}}>{report.narrative}</p></div>
            </div>
          </div>
          <div style={{background:report.detectedConflicts?.length?"#fecaca":"#dcfce7",border:`0.5px solid ${report.detectedConflicts?.length?"#ef4444":"#86efac"}`,borderRadius:10,padding:"1.25rem"}}>
            <p style={{fontSize:11,fontWeight:600,color:report.detectedConflicts?.length?"#7f1d1d":"#15803d",letterSpacing:0.8,margin:"0 0 8px"}}>{report.detectedConflicts?.length?"⚠ CONFLICTS DETECTED":"✓ NO CONFLICTS DETECTED"}</p>
            {report.detectedConflicts?.length
              ? <ul style={{margin:0,paddingLeft:16}}>{report.detectedConflicts.map((c,i)=><li key={i} style={{fontSize:12,color:"#991b1b",marginBottom:3}}>{c}</li>)}</ul>
              : <p style={{fontSize:13,color:"#166534",margin:0}}>All staff validated — no double-bookings detected across any site, day, or shift.</p>}
          </div>
          {[{title:"COVERAGE OPTIMIZATIONS",items:report.optimizations,bg:"#fff",border:`1.5px solid ${C.sage}`,tc:C.sage,lc:C.ink},{title:"REMAINING COVERAGE GAPS",items:report.gaps,bg:"#fecaca",border:"0.5px solid #ef4444",tc:"#7f1d1d",lc:"#991b1b"}].map(sec=>sec.items?.length?(
            <div key={sec.title} style={{background:sec.bg,border:sec.border,borderRadius:10,padding:"1.25rem"}}>
              <p style={{fontSize:11,fontWeight:600,color:sec.tc,letterSpacing:0.8,margin:"0 0 10px"}}>{sec.title}</p>
              <ul style={{margin:0,paddingLeft:16}}>{sec.items.map((x,i)=><li key={i} style={{fontSize:13,color:sec.lc,marginBottom:5,lineHeight:1.5}}>{x}</li>)}</ul>
            </div>
          ):null)}
          {report.coverage&&(
            <div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
              <p style={{fontSize:11,fontWeight:600,color:C.muted,letterSpacing:0.8,margin:"0 0 12px"}}>PROPOSED DAILY COVERAGE PREVIEW</p>
              <div style={{overflowX:"auto"}}>
                <table style={{borderCollapse:"separate",borderSpacing:0,fontSize:11,width:"100%"}}>
                  <thead><tr><th style={{padding:"4px 10px",textAlign:"left",color:C.muted,fontWeight:500}}>Site</th>{DAYS.map(d=><th key={d} style={{padding:"4px 8px",textAlign:"center",color:C.muted,fontWeight:500}}>{d}</th>)}</tr></thead>
                  <tbody>{SITES.map((site,si)=>(
                    <tr key={si}><td style={{padding:"4px 10px",fontWeight:500,fontSize:11,color:C.ink,whiteSpace:"nowrap"}}>{site}</td>
                    {DAYS.map((d,di)=>{const n=report.coverage[si]?.[d]??0;return(<td key={di} style={{padding:3,textAlign:"center"}}><div style={{background:covBg(n),borderRadius:5,padding:"4px 0",minWidth:34}}><span style={{fontSize:13,fontWeight:700,color:covColor(n)}}>{n}</span></div></td>);})}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              {phase==="review"&&<div style={{marginTop:12,padding:"10px 14px",background:C.sagePl,borderRadius:8,border:`0.5px solid ${C.sageLt}`}}><p style={{fontSize:12,color:C.sage,margin:0,fontWeight:500}}>Click <strong>"Apply to Schedule ✓"</strong> to activate. You can undo at any time.</p></div>}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Main component ──
export default function StaffScheduler(){
  const [staffList,  setStaffList]  = useState(STAFF_SEED);
  const [schedule,   setSchedule]   = useState(()=>buildSchedule(STAFF_SEED));
  const [staffStatus,setStaffStatus]= useState(()=>Object.fromEntries(STAFF_SEED.map(s=>[s.id,"Active"])));
  const [multiShift, setMultiShift] = useState(true);
  const [clickMode,  setClickMode]  = useState(false);
  const [dragging,   setDragging]   = useState(null);
  const [dragOver,   setDragOver]   = useState(null);
  const [activeTab,  setActiveTab]  = useState("schedule");
  const [assignCell, setAssignCell] = useState(null);
  const [deptFilter, setDeptFilter] = useState("All");
  const [conflictToast,setConflictToast]=useState(null);
  const [histLen,    setHistLen]    = useState(0);
  const [savedAt,    setSavedAt]    = useState(null);
  const [saveFlash,  setSaveFlash]  = useState(false);
  const [addModal,   setAddModal]   = useState(false);
  const [newForm,    setNewForm]    = useState(blankForm);
  const [nleConfirm, setNleConfirm] = useState(null);
  const [aiReport,   setAiReport]   = useState(null);
  const [aiLoading,  setAiLoading]  = useState(false);
  const [aiError,    setAiError]    = useState(null);

  const dragRef   = useRef({d:null,t:null});
  const schedRef  = useRef(schedule);
  const staffRef  = useRef(staffList);
  const histRef   = useRef([]);
  const nextIdRef = useRef(51);

  useEffect(()=>{schedRef.current=schedule;},[schedule]);
  useEffect(()=>{staffRef.current=staffList;},[staffList]);

  // localStorage persistence (replaces window.storage artifact API)
  useEffect(()=>{
    try{const v=localStorage.getItem("ss_staff");if(v){const l=JSON.parse(v);setStaffList(l);staffRef.current=l;nextIdRef.current=Math.max(...l.map(s=>s.id),50)+1;}}catch(e){}
    try{const v=localStorage.getItem("ss_schedule");if(v){const l=JSON.parse(v);setSchedule(l);schedRef.current=l;}}catch(e){}
    try{const v=localStorage.getItem("ss_saved_at");if(v)setSavedAt(v);}catch(e){}
  },[]);

  useEffect(()=>{
    const onMove=e=>{
      if(!dragRef.current.d)return;
      dragRef.current.d={...dragRef.current.d,x:e.clientX,y:e.clientY};
      setDragging({...dragRef.current.d});
      let el=document.elementFromPoint(e.clientX,e.clientY);
      while(el&&!el.getAttribute("data-ck"))el=el.parentElement;
      const t=el?.getAttribute("data-ck")||null;
      dragRef.current.t=t; setDragOver(t);
    };
    const onUp=()=>{
      const{d,t}=dragRef.current;
      if(d&&t){
        const prev=schedRef.current;
        const next={...prev};
        if(d.src)next[d.src]=(next[d.src]||[]).filter(id=>id!==d.staffId);
        if(!(next[t]||[]).includes(d.staffId))next[t]=[...(next[t]||[]),d.staffId];
        histRef.current=[...histRef.current.slice(-9),prev]; setHistLen(histRef.current.length);
        const wasConflict=detectConflict(d.staffId,prev);
        const isConflict =detectConflict(d.staffId,next);
        if(isConflict&&!wasConflict){const st=staffRef.current.find(s=>s.id===d.staffId);setConflictToast({staffId:d.staffId,name:st?.name||"Staff",prevSchedule:prev});}
        setSchedule(next); schedRef.current=next;
      }
      dragRef.current={d:null,t:null}; setDragging(null); setDragOver(null);
    };
    window.addEventListener("pointermove",onMove,{passive:true});
    window.addEventListener("pointerup",onUp);
    return()=>{window.removeEventListener("pointermove",onMove);window.removeEventListener("pointerup",onUp);};
  },[]);

  const startDrag=(id,src,e)=>{e.preventDefault();const d={staffId:id,src,x:e.clientX,y:e.clientY};dragRef.current.d=d;setDragging(d);};

  const undo=()=>{
    if(!histRef.current.length)return;
    const prev=histRef.current[histRef.current.length-1];
    histRef.current=histRef.current.slice(0,-1); setHistLen(histRef.current.length);
    setSchedule(prev); schedRef.current=prev; setConflictToast(null);
  };

  const saveAll=()=>{
    const ts=nowStr();
    try{localStorage.setItem("ss_schedule",JSON.stringify(schedRef.current));}catch(e){}
    try{localStorage.setItem("ss_staff",JSON.stringify(staffRef.current));}catch(e){}
    try{localStorage.setItem("ss_saved_at",ts);}catch(e){}
    setSavedAt(ts); setSaveFlash(true); setTimeout(()=>setSaveFlash(false),2000);
  };

  const removeFromCell=(id,key)=>setSchedule(s=>({...s,[key]:(s[key]||[]).filter(i=>i!==id)}));
  const clickAssign=id=>{if(!assignCell)return;setSchedule(s=>{const c=s[assignCell]||[];if(c.includes(id))return s;return{...s,[assignCell]:[...c,id]};});setAssignCell(null);};
  const handleStatusChange=(id,val)=>{if(val==="NLE"){setNleConfirm(id);return;}setStaffStatus(s=>({...s,[id]:val}));};

  const confirmNLE=id=>{
    const nl=staffRef.current.filter(s=>s.id!==id); staffRef.current=nl; setStaffList(nl);
    const ns={}; Object.keys(schedRef.current).forEach(k=>{ns[k]=(schedRef.current[k]||[]).filter(sid=>sid!==id);});
    schedRef.current=ns; setSchedule(ns); setNleConfirm(null);
  };

  const addStaff=()=>{
    if(!newForm.name.trim())return;
    const id=nextIdRef.current++;
    const m={...newForm,id,name:newForm.name.trim()};
    const nl=[...staffRef.current,m]; staffRef.current=nl; setStaffList(nl);
    const ns={...schedRef.current};
    m.days.forEach(di=>{const k=ck(m.site,di,m.shift);if(!(ns[k]||[]).includes(id))ns[k]=[...(ns[k]||[]),id];});
    schedRef.current=ns; setSchedule(ns);
    setStaffStatus(s=>({...s,[id]:"Active"}));
    setNewForm(blankForm); setAddModal(false);
  };

  const toggleDay=di=>setNewForm(f=>({...f,days:f.days.includes(di)?f.days.filter(d=>d!==di):[...f.days,di].sort()}));
  const applyAISchedule=s=>{histRef.current=[...histRef.current.slice(-9),schedRef.current];setHistLen(histRef.current.length);schedRef.current=s;setSchedule(s);};

  const conflicts=useMemo(()=>{
    const c=new Set();
    DAYS.forEach((_,di)=>{const seen={};SHIFTS.forEach((_,shi)=>SITES.forEach((_,si)=>{(schedule[ck(si,di,shi)]||[]).forEach(id=>{if(seen[id])c.add(id);seen[id]=true;});}));});
    return c;
  },[schedule]);

  const staffHours=useMemo(()=>{const h={};staffList.forEach(s=>h[s.id]=0);Object.values(schedule).forEach(ids=>ids.forEach(id=>h[id]=(h[id]||0)+8));return h;},[schedule,staffList]);
  const totalAssigned=useMemo(()=>Object.values(schedule).reduce((s,a)=>s+a.length,0),[schedule]);
  const coveredCells =useMemo(()=>{let c=0;SITES.forEach((_,si)=>DAYS.forEach((_,di)=>{if(dayTotal(schedule,si,di)>=TARGET)c++;}));return c;},[schedule]);
  const filteredStaff=useMemo(()=>staffList.filter(s=>deptFilter==="All"||s.dept===deptFilter),[staffList,deptFilter]);
  const stn=id=>staffList.find(s=>s.id===id);

  const handleAI=async()=>{
    setAiLoading(true);setAiReport(null);setAiError(null);
    const ss=SITES.map((s,si)=>`${s}:${DAYS.map((_,di)=>`${DAYS[di]}=${dayTotal(schedule,si,di)}`).join(",")}`).join(";");
    const cl=[...conflicts].map(id=>staffList.find(s=>s.id===id)?.name).filter(Boolean).join(",");
    try{
      const r=await callAI(`Healthcare schedule. Target:7/site/day. Staff:${staffList.length},sites:6.\nCoverage:${ss}\nConflicts:${cl||"none"}\nReturn ONLY JSON(max 3 items/array,20 words each):\n{"coverage_score":0-100,"summary":"2 sentences","understaffed_sites":["site:issue"],"conflicts":["name:conflict"],"recommendations":["action"],"highlights":["strength"]}`,
        "You are a healthcare workforce scheduling analyst. Return only valid JSON, no markdown.");
      setAiReport({...r,generatedAt:nowStr()});
    }catch(e){setAiError(`Failed: ${e.message}`);}
    setAiLoading(false);
  };

  const inputSt={width:"100%",boxSizing:"border-box",fontSize:13,padding:"7px 9px",borderRadius:6,border:`0.5px solid ${C.border}`,background:C.creamDk,color:C.ink,outline:"none",fontFamily:FONTS.sans};

  const renderCell=(si,di,shi,single=false)=>{
    const key=ck(si,di,single?0:shi);
    const isOver=dragOver===key&&!!dragging;
    if(single){
      const tot=dayTotal(schedule,si,di);
      return(<td key={`${si}-${di}`} data-ck={key} onClick={()=>{if(clickMode)setAssignCell(key);}}
        style={{padding:3,border:`0.5px solid ${isOver?"#818cf8":C.border}`,background:isOver?"#e0e7ff":covBg(tot),textAlign:"center",cursor:clickMode?"pointer":"default",minWidth:50,outline:isOver?"2px solid #818cf8":"none"}}>
        <span style={{fontSize:14,fontWeight:700,color:covColor(tot)}}>{tot}</span>
        <span style={{fontSize:9,color:covColor(tot),display:"block"}}>/{TARGET}</span>
      </td>);
    }
    const ids=schedule[key]||[];
    return(<td key={`${si}-${di}-${shi}`} data-ck={key} onClick={()=>{if(clickMode)setAssignCell(key);}}
      style={{padding:3,border:`0.5px solid ${isOver?"#818cf8":SH_BRD[SHIFTS[shi]]}`,background:isOver?"rgba(129,140,248,0.18)":SH_BG[SHIFTS[shi]],
        verticalAlign:"top",minWidth:64,outline:isOver?"2px solid #818cf8":"none",cursor:clickMode?"pointer":"default"}}>
      <div style={{display:"flex",flexWrap:"wrap",gap:2,minHeight:24,padding:1}}>
        {ids.slice(0,4).map(id=>{
          const st=stn(id);if(!st)return null;
          return(<div key={id} onPointerDown={e=>{if(!clickMode)startDrag(id,key,e);}} title={`${st.name} · ${st.role}`}
            style={{width:21,height:21,borderRadius:"50%",background:DEPT_CLR[st.dept],color:"#fff",fontSize:7,fontWeight:700,
              display:"flex",alignItems:"center",justifyContent:"center",cursor:clickMode?"default":"grab",flexShrink:0,
              opacity:dragging?.staffId===id&&dragging?.src===key?0.2:1,
              border:conflicts.has(id)?"2px solid #ef4444":"1.5px solid rgba(255,255,255,0.35)",userSelect:"none",touchAction:"none"}}>
            {initials(st.name)}
          </div>);
        })}
        {ids.length>4&&<span style={{fontSize:9,color:SH_TXT[SHIFTS[shi]],alignSelf:"center",fontWeight:600}}>+{ids.length-4}</span>}
        {ids.length===0&&<span style={{fontSize:9,color:SH_TXT[SHIFTS[shi]],opacity:0.3}}>—</span>}
      </div>
    </td>);
  };

  return(
    <div style={{fontFamily:FONTS.sans,background:C.cream,color:C.ink,display:"flex",flexDirection:"column",minHeight:"80vh"}}>
      <div style={{flexShrink:0}}>
        <div style={{background:C.forest,padding:"0.9rem 1.5rem"}}>
          <h2 style={{fontFamily:FONTS.serif,fontSize:20,fontWeight:400,color:C.cream,margin:"0 0 2px"}}>Staff Scheduler</h2>
          <p style={{fontSize:11,color:C.sageLt,margin:0}}>{staffList.length} Staff · 6 Sites · 3-Shift Weekly Coverage · Allied Healthcare</p>
        </div>
        <div style={{height:3,background:`linear-gradient(90deg,${C.sage},${C.cream})`}}/>
        <div style={{background:C.cream,borderBottom:`0.5px solid ${C.border}`,padding:"8px 1.5rem",display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          {[["schedule","Schedule"],["roster","Roster"],["dashboard","Dashboard"],["ai","✦ AI Optimizer"],["autoai","✦ AI Scheduler"]].map(([t,l])=>(
            <button key={t} onClick={()=>setActiveTab(t)}
              style={{fontSize:12,padding:"5px 13px",borderRadius:7,border:"none",cursor:"pointer",fontWeight:500,
                background:activeTab===t?(t==="ai"||t==="autoai"?C.sage:C.forest):C.creamDk,
                color:activeTab===t?C.cream:C.muted}}>
              {l}
            </button>
          ))}
          <div style={{marginLeft:"auto",display:"flex",gap:6,alignItems:"center"}}>
            <button onClick={undo} disabled={histLen===0}
              style={{fontSize:11,padding:"4px 10px",borderRadius:6,cursor:histLen?"pointer":"not-allowed",
                border:`0.5px solid ${C.border}`,background:histLen?C.creamDk:"transparent",color:histLen?C.ink:C.muted,fontWeight:500}}>
              ↩ Undo{histLen>0?` (${histLen})`:""}
            </button>
            <button onClick={saveAll}
              style={{fontSize:11,padding:"4px 10px",borderRadius:6,cursor:"pointer",fontWeight:500,
                border:`1px solid ${C.sage}`,background:saveFlash?"#dcfce7":C.sagePl,color:saveFlash?"#15803d":C.sage}}>
              {saveFlash?"✓ Saved!":"Save Schedule"}
            </button>
            {savedAt&&<span style={{fontSize:10,color:C.muted}}>{savedAt}</span>}
          </div>
        </div>
        {activeTab==="schedule"&&(
          <div style={{background:C.cream,borderBottom:`0.5px solid ${C.border}`,padding:"5px 1.5rem",display:"flex",gap:6}}>
            <button onClick={()=>setMultiShift(m=>!m)}
              style={{fontSize:11,padding:"3px 10px",borderRadius:6,cursor:"pointer",fontWeight:500,
                border:`0.5px solid ${C.border}`,background:multiShift?C.forest:C.creamDk,color:multiShift?C.cream:C.muted}}>
              {multiShift?"3-Shift View":"Single-Shift View"}
            </button>
            <button onClick={()=>setClickMode(m=>!m)}
              style={{fontSize:11,padding:"3px 10px",borderRadius:6,cursor:"pointer",fontWeight:500,
                border:`1px solid ${C.sage}`,background:clickMode?C.sagePl:"transparent",color:clickMode?C.sage:C.muted}}>
              {clickMode?"Click Mode ✓":"Drag Mode"}
            </button>
          </div>
        )}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"1rem 1.5rem"}}>

        {activeTab==="schedule"&&(
          <div style={{display:"flex",gap:12}}>
            <div style={{width:158,flexShrink:0,display:"flex",flexDirection:"column",gap:8}}>
              <p style={{fontSize:11,fontWeight:600,color:C.muted,letterSpacing:0.8,margin:0}}>STAFF PANEL</p>
              <select value={deptFilter} onChange={e=>setDeptFilter(e.target.value)}
                style={{fontSize:11,padding:"4px 6px",borderRadius:5,border:`0.5px solid ${C.border}`,background:"#fff",color:C.ink}}>
                <option value="All">All Departments</option>
                {DEPTS.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
              <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:"60vh",overflowY:"auto"}}>
                {filteredStaff.map(s=>{
                  const hrs=staffHours[s.id]||0,conf=conflicts.has(s.id);
                  return(<div key={s.id} onPointerDown={e=>{if(!clickMode)startDrag(s.id,null,e);}} title={`${s.name} · ${s.role} · ${SITES[s.site]} · ${hrs}h/wk`}
                    style={{display:"flex",alignItems:"center",gap:6,padding:"4px 7px",borderRadius:6,background:conf?"#fecaca":"#fff",border:`0.5px solid ${conf?"#ef4444":C.border}`,cursor:clickMode?"default":"grab",userSelect:"none",touchAction:"none"}}>
                    <div style={{width:20,height:20,borderRadius:"50%",background:DEPT_CLR[s.dept],color:"#fff",fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{initials(s.name)}</div>
                    <div style={{minWidth:0,flex:1}}>
                      <p style={{fontSize:10,fontWeight:500,color:C.ink,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</p>
                      <p style={{fontSize:9,color:C.muted,margin:0}}>{hrs}h · {s.type}{conf?" ⚠":""}</p>
                    </div>
                  </div>);
                })}
              </div>
              <p style={{fontSize:9,color:C.muted,lineHeight:1.4,margin:0}}>{clickMode?"Click a cell then tap staff to assign.":"Drag staff onto cells."}</p>
            </div>
            <div style={{flex:1,overflowX:"auto"}}>
              <table style={{borderCollapse:"collapse",fontSize:11,width:"100%"}}>
                <thead style={{position:"sticky",top:0,zIndex:10}}>
                  <tr style={{background:C.forest}}>
                    <th style={{padding:"5px 10px",color:C.cream,fontWeight:500,fontSize:11,textAlign:"left",whiteSpace:"nowrap",minWidth:90}}>Site</th>
                    {multiShift&&<th style={{padding:"5px 4px",color:C.sageLt,fontWeight:400,fontSize:10}}>Shift</th>}
                    {DAYS.map(d=><th key={d} style={{padding:"5px 3px",color:C.cream,fontWeight:500,fontSize:11,textAlign:"center",minWidth:64}}>{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {SITES.map((site,si)=>(
                    multiShift
                      ? SHIFTS.map((shift,shi)=>(
                        <tr key={`${si}-${shi}`} style={{borderBottom:shi===2?`2px solid ${C.border}`:"none"}}>
                          {shi===0&&<td rowSpan={3} style={{padding:"5px 10px",fontWeight:500,fontSize:11,color:C.ink,background:"#fff",borderRight:`0.5px solid ${C.border}`,verticalAlign:"middle",whiteSpace:"nowrap",borderBottom:`2px solid ${C.border}`}}>{site}</td>}
                          <td style={{padding:"2px 4px",fontSize:9,fontWeight:600,color:SH_TXT[shift],background:SH_BG[shift],whiteSpace:"nowrap",border:`0.5px solid ${SH_BRD[shift]}`,minWidth:42}}>{shift.slice(0,4)}</td>
                          {DAYS.map((_,di)=>renderCell(si,di,shi))}
                        </tr>
                      ))
                      : <tr key={si} style={{borderBottom:`2px solid ${C.border}`}}>
                          <td style={{padding:"7px 10px",fontWeight:500,fontSize:11,color:C.ink,background:"#fff",borderRight:`0.5px solid ${C.border}`,whiteSpace:"nowrap"}}>{site}</td>
                          {DAYS.map((_,di)=>renderCell(si,di,0,true))}
                        </tr>
                  ))}
                </tbody>
              </table>
              <div style={{display:"flex",gap:10,marginTop:8,flexWrap:"wrap",alignItems:"center"}}>
                <div style={{display:"flex",gap:5}}>
                  {[["≥7 Full","#dcfce7","#15803d"],["5–6 Low","#fef3c7","#92400e"],["<5 Crit","#fecaca","#7f1d1d"]].map(([l,bg,c])=>(
                    <span key={l} style={{fontSize:10,background:bg,color:c,padding:"2px 7px",borderRadius:5,fontWeight:600}}>{l}</span>
                  ))}
                </div>
                {Object.entries(DEPT_CLR).map(([d,c])=>(
                  <div key={d} style={{display:"flex",alignItems:"center",gap:3}}>
                    <div style={{width:9,height:9,borderRadius:"50%",background:c}}/>
                    <span style={{fontSize:9,color:C.muted}}>{d.slice(0,5)}</span>
                  </div>
                ))}
                {conflicts.size>0&&<span style={{fontSize:10,fontWeight:600,background:"#fecaca",color:"#7f1d1d",padding:"2px 7px",borderRadius:5}}>⚠ Red ring = conflict</span>}
              </div>
            </div>
          </div>
        )}

        {activeTab==="roster"&&(
          <>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
              <button onClick={()=>setAddModal(true)} style={{fontSize:13,fontWeight:500,padding:"7px 18px",borderRadius:7,background:C.sage,color:"#fff",border:"none",cursor:"pointer"}}>+ Add New Staff</button>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,background:"#fff",borderRadius:10,overflow:"hidden",border:`0.5px solid ${C.border}`}}>
                <thead>
                  <tr style={{background:C.forest}}>
                    {["Name","Dept","Role","Primary Site","Shift","Type","Hrs/Wk","Hours Status","Employment Status"].map(h=>(
                      <th key={h} style={{padding:"8px 10px",textAlign:"left",color:h==="Name"?C.cream:C.sageLt,fontWeight:h==="Name"?500:400,fontSize:h==="Name"?11:10,whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((s,i)=>{
                    const hrs=staffHours[s.id]||0,conf=conflicts.has(s.id),under=hrs<32&&s.type==="FT";
                    const st=staffStatus[s.id]||"Active",sc=ST_STATUS_COLOR[st];
                    return(
                      <tr key={s.id} style={{borderBottom:`0.5px solid ${C.border}`,background:i%2===0?"#fff":"rgba(244,240,230,0.4)"}}>
                        <td style={{padding:"7px 10px",fontWeight:500,color:C.ink,whiteSpace:"nowrap"}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <div style={{width:22,height:22,borderRadius:"50%",background:DEPT_CLR[s.dept],color:"#fff",fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{initials(s.name)}</div>
                            {s.name}
                          </div>
                        </td>
                        <td style={{padding:"7px 8px"}}><span style={{fontSize:10,fontWeight:600,padding:"1px 6px",borderRadius:4,background:DEPT_BG[s.dept],color:DEPT_CLR[s.dept]}}>{s.dept.slice(0,5)}</span></td>
                        <td style={{padding:"7px 8px",color:C.muted,fontSize:11,whiteSpace:"nowrap"}}>{s.role}</td>
                        <td style={{padding:"7px 8px",color:C.muted,fontSize:11,whiteSpace:"nowrap"}}>{SITES[s.site]}</td>
                        <td style={{padding:"7px 8px"}}><span style={{fontSize:10,padding:"1px 6px",borderRadius:4,background:SH_BG[SHIFTS[s.shift]],color:SH_TXT[SHIFTS[s.shift]]}}>{SHIFTS[s.shift]}</span></td>
                        <td style={{padding:"7px 8px",textAlign:"center",fontSize:10,color:C.muted}}>{s.type}</td>
                        <td style={{padding:"7px 8px",textAlign:"center",fontWeight:600,color:under?"#dc2626":"#15803d"}}>{hrs}h</td>
                        <td style={{padding:"7px 8px",textAlign:"center"}}>
                          {conf&&<span style={{fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:10,background:"#fecaca",color:"#7f1d1d"}}>⚠ Conflict</span>}
                          {!conf&&under&&<span style={{fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:10,background:"#fef3c7",color:"#713f12"}}>Low Hrs</span>}
                          {!conf&&!under&&<span style={{fontSize:13,color:"#15803d"}}>✓</span>}
                        </td>
                        <td style={{padding:"7px 8px",textAlign:"center"}}>
                          <select value={st} onChange={e=>handleStatusChange(s.id,e.target.value)}
                            style={{fontSize:11,fontWeight:600,padding:"3px 6px",borderRadius:6,border:`0.5px solid ${sc.border}`,background:sc.bg,color:sc.color,cursor:"pointer"}}>
                            {["Active","On Leave","Inactive","NLE"].map(v=><option key={v} value={v}>{v}</option>)}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab==="dashboard"&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <style>{`.skpi{perspective:600px;cursor:pointer}.skpi-inner{position:relative;width:100%;height:86px;transform-style:preserve-3d;transition:transform 0.55s cubic-bezier(.4,0,.2,1)}.skpi:hover .skpi-inner{transform:rotateY(180deg)}.skpi-f,.skpi-b{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px;text-align:center}.skpi-b{transform:rotateY(180deg)}`}</style>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(108px,1fr))",gap:10}}>
              {[
                {l:"Total Staff",    v:staffList.length, c:C.ink,   bg:"#fff",   bb:"#ece8dc",desc:"Total active workforce across all 6 sites and 3 shifts."},
                {l:"Assigned Shifts",v:totalAssigned,    c:"#15803d",bg:"#dcfce7",bb:"#86efac",desc:"Total shift slots filled across the full weekly schedule."},
                {l:"Full Coverage",  v:`${coveredCells}/42`,c:covColor(coveredCells*TARGET/42),bg:covBg(coveredCells*TARGET/42),bb:"#fde047",desc:"Site-days meeting the 7-staff daily target (6 sites × 7 days = 42)."},
                {l:"Conflicts",      v:conflicts.size,   c:conflicts.size?"#7f1d1d":"#15803d",bg:conflicts.size?"#fecaca":"#dcfce7",bb:conflicts.size?"#f87171":"#86efac",desc:"Staff with double-bookings or over-scheduling issues."},
                {l:"Total Hours",    v:`${totalAssigned*8}h`,c:C.sage,bg:C.sagePl,bb:"#93c5fd",desc:"Total scheduled work hours across all staff this week."},
              ].map(k=>(
                <div key={k.l} className="skpi">
                  <div className="skpi-inner">
                    <div className="skpi-f" style={{background:k.bg,border:`0.5px solid ${C.border}`}}>
                      <p style={{fontSize:21,fontWeight:700,color:k.c,margin:"0 0 3px",lineHeight:1}}>{k.v}</p>
                      <p style={{fontSize:10,color:C.muted,margin:0,lineHeight:1.3}}>{k.l}</p>
                    </div>
                    <div className="skpi-b" style={{background:k.bb,border:`0.5px solid ${C.border}`}}>
                      <p style={{fontSize:11,color:k.c,margin:0,lineHeight:1.5,fontWeight:500}}>{k.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
              <p style={{fontSize:11,fontWeight:600,color:C.muted,letterSpacing:0.8,margin:"0 0 12px"}}>DAILY COVERAGE HEATMAP</p>
              <div style={{overflowX:"auto"}}>
                <table style={{borderCollapse:"separate",borderSpacing:0,fontSize:11,width:"100%"}}>
                  <thead><tr><th style={{padding:"4px 10px",textAlign:"left",color:C.muted,fontWeight:500}}>Site</th>{DAYS.map(d=><th key={d} style={{padding:"4px 8px",textAlign:"center",color:C.muted,fontWeight:500}}>{d}</th>)}</tr></thead>
                  <tbody>{SITES.map((site,si)=>(
                    <tr key={si}><td style={{padding:"4px 10px",fontWeight:500,fontSize:11,color:C.ink,whiteSpace:"nowrap"}}>{site}</td>
                    {DAYS.map((_,di)=>{const n=dayTotal(schedule,si,di);return(<td key={di} style={{padding:3,textAlign:"center"}}><div style={{background:covBg(n),borderRadius:5,padding:"4px 0",minWidth:36}}><span style={{fontSize:13,fontWeight:700,color:covColor(n)}}>{n}</span></div></td>);})}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
            <div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
              <p style={{fontSize:11,fontWeight:600,color:C.muted,letterSpacing:0.8,margin:"0 0 14px"}}>AVERAGE DAILY COVERAGE BY SITE</p>
              {SITES.map((site,si)=>{const avg=Math.round(DAYS.reduce((s,_,di)=>s+dayTotal(schedule,si,di),0)/7);const p=Math.min(Math.round((avg/TARGET)*100),100);return(
                <div key={si} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:12,fontWeight:500,color:C.ink}}>{site}</span>
                    <span style={{fontSize:12,color:C.muted}}>avg {avg}/{TARGET} · <strong style={{color:covColor(avg)}}>{p}%</strong></span>
                  </div>
                  <div style={{height:7,background:C.creamDk,borderRadius:10,overflow:"hidden"}}><div style={{height:"100%",width:`${p}%`,background:covColor(avg),borderRadius:10}}/></div>
                </div>
              );})}
            </div>
          </div>
        )}

        {activeTab==="ai"&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                <div>
                  <p style={{fontSize:14,fontWeight:500,color:C.ink,margin:"0 0 5px"}}>✦ AI Schedule Optimizer</p>
                  <p style={{fontSize:12,color:C.muted,margin:0,lineHeight:1.6,maxWidth:460}}>Analyzes the current schedule — identifying coverage gaps, conflicts, rebalancing opportunities, and generating actionable recommendations.</p>
                </div>
                <button onClick={handleAI} disabled={aiLoading} style={{fontSize:13,fontWeight:500,padding:"8px 20px",borderRadius:7,background:aiLoading?C.creamDk:C.sage,color:aiLoading?C.muted:"#fff",border:"none",cursor:aiLoading?"not-allowed":"pointer",flexShrink:0}}>
                  {aiLoading?"Analyzing…":"Run Optimization"}
                </button>
              </div>
            </div>
            {aiLoading&&<div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"2rem",textAlign:"center"}}><div style={{width:36,height:36,border:`3px solid ${C.sagePl}`,borderTopColor:C.sage,borderRadius:"50%",margin:"0 auto 14px",animation:"spin 0.8s linear infinite"}}/><p style={{fontSize:13,color:C.muted,margin:0}}>Analyzing {staffList.length} staff…</p><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>}
            {aiError&&<div style={{background:"#fecaca",border:"0.5px solid #ef4444",borderRadius:10,padding:"1rem"}}><p style={{fontSize:13,color:"#7f1d1d",margin:0}}>{aiError}</p></div>}
            {aiReport&&!aiLoading&&(
              <>
                <div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
                  <div style={{display:"flex",alignItems:"center",gap:16}}>
                    <div style={{width:64,height:64,borderRadius:"50%",background:aiReport.coverage_score>=80?"#dcfce7":aiReport.coverage_score>=60?"#fef3c7":"#fecaca",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <span style={{fontSize:18,fontWeight:700,color:aiReport.coverage_score>=80?"#15803d":aiReport.coverage_score>=60?"#92400e":"#9f1239"}}>{aiReport.coverage_score}</span>
                    </div>
                    <div><p style={{fontSize:13,fontWeight:500,color:C.ink,margin:"0 0 4px"}}>Coverage Score · {aiReport.generatedAt}</p><p style={{fontSize:13,color:C.muted,margin:0,lineHeight:1.6}}>{aiReport.summary}</p></div>
                  </div>
                </div>
                {[
                  {title:"RECOMMENDATIONS",     items:aiReport.recommendations,    bg:"#fff",   border:`1.5px solid ${C.sage}`,tc:C.sage,  lc:C.ink},
                  {title:"UNDERSTAFFED SITES",  items:aiReport.understaffed_sites, bg:"#fecaca",border:"0.5px solid #ef4444",  tc:"#7f1d1d",lc:"#991b1b"},
                  {title:"SCHEDULING CONFLICTS",items:aiReport.conflicts,           bg:"#fed7aa",border:"0.5px solid #f97316",  tc:"#7c2d12",lc:"#9a3412"},
                  {title:"WHAT'S WORKING WELL", items:aiReport.highlights,          bg:"#dcfce7",border:"0.5px solid #86efac",  tc:"#15803d",lc:"#065f46"},
                ].map(sec=>sec.items?.length?(
                  <div key={sec.title} style={{background:sec.bg,border:sec.border,borderRadius:10,padding:"1.25rem"}}>
                    <p style={{fontSize:11,fontWeight:600,color:sec.tc,letterSpacing:0.8,margin:"0 0 10px"}}>{sec.title}</p>
                    <ul style={{margin:0,paddingLeft:16}}>{sec.items.map((x,i)=><li key={i} style={{fontSize:13,color:sec.lc,marginBottom:5,lineHeight:1.5}}>{x}</li>)}</ul>
                  </div>
                ):null)}
              </>
            )}
          </div>
        )}

        {activeTab==="autoai"&&<AutoScheduler staffList={staffList} onApply={applyAISchedule}/>}
      </div>

      {conflictToast&&(
        <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:1000,background:"#7c2d12",color:"#fff",borderRadius:10,padding:"12px 18px",boxShadow:"0 6px 24px rgba(0,0,0,0.25)",display:"flex",alignItems:"center",gap:12,whiteSpace:"nowrap",maxWidth:"90vw"}}>
          <span style={{fontSize:13}}>⚠ <strong>{conflictToast.name}</strong> is now double-booked</span>
          <button onClick={undo} style={{fontSize:12,fontWeight:600,padding:"4px 12px",borderRadius:6,background:"#fff",color:"#7c2d12",border:"none",cursor:"pointer"}}>↩ Undo</button>
          <button onClick={()=>setConflictToast(null)} style={{fontSize:12,padding:"4px 10px",borderRadius:6,background:"rgba(255,255,255,0.15)",color:"#fff",border:"0.5px solid rgba(255,255,255,0.3)",cursor:"pointer"}}>Keep</button>
        </div>
      )}

      {dragging&&(()=>{const st=stn(dragging.staffId);if(!st)return null;return(
        <div style={{position:"fixed",left:dragging.x+14,top:dragging.y-12,zIndex:9999,pointerEvents:"none",background:DEPT_CLR[st.dept],color:"#fff",fontSize:11,fontWeight:600,padding:"5px 11px",borderRadius:8,boxShadow:"0 4px 18px rgba(0,0,0,0.3)",display:"flex",alignItems:"center",gap:7,whiteSpace:"nowrap"}}>
          <div style={{width:20,height:20,borderRadius:"50%",background:"rgba(255,255,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700}}>{initials(st.name)}</div>
          {st.name}
        </div>
      );})()} 

      {assignCell&&clickMode&&(
        <div onClick={e=>{if(e.target===e.currentTarget)setAssignCell(null);}}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:998,padding:20}}>
          <div style={{background:C.cream,borderRadius:12,border:`0.5px solid ${C.border}`,padding:"1.5rem",width:"100%",maxWidth:360,maxHeight:"82vh",overflowY:"auto"}}>
            {(()=>{const[si,di,shi]=pk(assignCell);const already=schedule[assignCell]||[];return(<>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div><p style={{margin:0,fontWeight:500,fontSize:15,color:C.ink}}>Assign Staff</p><p style={{margin:"2px 0 0",fontSize:11,color:C.muted}}>{SITES[si]} · {DAYS[di]} · {SHIFTS[shi]}</p></div>
                <button onClick={()=>setAssignCell(null)} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:C.muted,padding:0}}>✕</button>
              </div>
              {already.length>0&&<div style={{marginBottom:14}}>
                <p style={{fontSize:11,fontWeight:600,color:C.muted,margin:"0 0 7px"}}>ASSIGNED ({already.length})</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {already.map(id=>{const st=stn(id);if(!st)return null;return(
                    <div key={id} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:6,background:DEPT_BG[st.dept],border:`0.5px solid ${DEPT_CLR[st.dept]}`}}>
                      <span style={{fontSize:11,color:DEPT_CLR[st.dept],fontWeight:500}}>{st.name}</span>
                      <button onClick={()=>removeFromCell(id,assignCell)} style={{background:"none",border:"none",cursor:"pointer",padding:0,color:DEPT_CLR[st.dept],fontSize:14,lineHeight:1}}>×</button>
                    </div>
                  );})}
                </div>
              </div>}
              <p style={{fontSize:11,fontWeight:600,color:C.muted,margin:"0 0 8px"}}>ADD STAFF</p>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {staffList.filter(s=>!already.includes(s.id)).map(s=>(
                  <button key={s.id} onClick={()=>clickAssign(s.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:7,border:`0.5px solid ${C.border}`,background:"#fff",cursor:"pointer",textAlign:"left"}}>
                    <div style={{width:22,height:22,borderRadius:"50%",background:DEPT_CLR[s.dept],color:"#fff",fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{initials(s.name)}</div>
                    <div style={{flex:1,minWidth:0}}><p style={{fontSize:12,fontWeight:500,color:C.ink,margin:0}}>{s.name}</p><p style={{fontSize:10,color:C.muted,margin:0}}>{s.role} · {SITES[s.site]} · {SHIFTS[s.shift]}</p></div>
                    {conflicts.has(s.id)&&<span style={{fontSize:10,color:"#dc2626",fontWeight:700}}>⚠</span>}
                  </button>
                ))}
              </div>
            </>);})()} 
          </div>
        </div>
      )}

      {nleConfirm&&(()=>{const st=staffList.find(s=>s.id===nleConfirm);if(!st)return null;return(
        <div onClick={e=>{if(e.target===e.currentTarget)setNleConfirm(null);}}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:20}}>
          <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #fca5a5",padding:"1.5rem",maxWidth:380,width:"100%"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
              <div style={{width:44,height:44,borderRadius:"50%",background:DEPT_CLR[st.dept],color:"#fff",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{initials(st.name)}</div>
              <div><p style={{margin:0,fontWeight:500,fontSize:15,color:C.ink}}>Remove Staff — NLE</p><p style={{margin:"2px 0 0",fontSize:12,color:C.muted}}>{st.name} · {st.role}</p></div>
            </div>
            <div style={{background:"#fecaca",border:"0.5px solid #ef4444",borderRadius:8,padding:"10px 13px",marginBottom:16}}>
              <p style={{fontSize:13,color:"#7f1d1d",margin:0,lineHeight:1.5}}>This will permanently remove <strong>{st.name}</strong> from the roster and all scheduled shifts. This action cannot be undone.</p>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>setNleConfirm(null)} style={{fontSize:13,padding:"7px 16px",borderRadius:7}}>Cancel</button>
              <button onClick={()=>confirmNLE(nleConfirm)} style={{fontSize:13,fontWeight:500,padding:"7px 18px",borderRadius:7,background:"#dc2626",color:"#fff",border:"none",cursor:"pointer"}}>Confirm NLE</button>
            </div>
          </div>
        </div>
      );})()} 

      {addModal&&(
        <div onClick={e=>{if(e.target===e.currentTarget)setAddModal(false);}}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:20}}>
          <div style={{background:C.cream,borderRadius:12,border:`0.5px solid ${C.border}`,padding:"1.5rem",maxWidth:440,width:"100%",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <p style={{margin:0,fontWeight:500,fontSize:16,color:C.ink}}>Add New Staff Member</p>
              <button onClick={()=>setAddModal(false)} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:C.muted,padding:0}}>✕</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div style={{gridColumn:"1/-1"}}><label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Full Name *</label><input value={newForm.name} onChange={e=>setNewForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Jordan Blake" style={inputSt}/></div>
              <div><label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Department</label><select value={newForm.dept} onChange={e=>setNewForm(f=>({...f,dept:e.target.value}))} style={inputSt}>{DEPTS.map(d=><option key={d} value={d}>{d}</option>)}</select></div>
              <div><label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Role / Title</label><input value={newForm.role} onChange={e=>setNewForm(f=>({...f,role:e.target.value}))} placeholder="e.g. RN" style={inputSt}/></div>
              <div><label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Primary Site</label><select value={newForm.site} onChange={e=>setNewForm(f=>({...f,site:Number(e.target.value)}))} style={inputSt}>{SITES.map((s,i)=><option key={i} value={i}>{s}</option>)}</select></div>
              <div><label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Default Shift</label><select value={newForm.shift} onChange={e=>setNewForm(f=>({...f,shift:Number(e.target.value)}))} style={inputSt}>{SHIFTS.map((s,i)=><option key={i} value={i}>{s}</option>)}</select></div>
              <div style={{gridColumn:"1/-1"}}><label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Employment Type</label><select value={newForm.type} onChange={e=>setNewForm(f=>({...f,type:e.target.value}))} style={inputSt}>{["FT","PT","PRN"].map(t=><option key={t} value={t}>{t==="FT"?"Full-Time":t==="PT"?"Part-Time":"PRN"}</option>)}</select></div>
            </div>
            <label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:8}}>Work Days</label>
            <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
              {DAYS.map((d,i)=>(
                <button key={i} onClick={()=>toggleDay(i)} style={{fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:6,cursor:"pointer",background:newForm.days.includes(i)?C.forest:C.creamDk,color:newForm.days.includes(i)?C.cream:C.muted,border:`0.5px solid ${newForm.days.includes(i)?C.forest:C.border}`}}>{d}</button>
              ))}
            </div>
            <div style={{background:C.creamDk,borderRadius:8,padding:"8px 12px",marginBottom:14,fontSize:12,color:C.muted}}>
              Will be placed at <strong style={{color:C.ink}}>{SITES[newForm.site]}</strong> on <strong style={{color:C.ink}}>{newForm.days.map(d=>DAYS[d]).join(", ")||"no days"}</strong> · <strong style={{color:C.ink}}>{SHIFTS[newForm.shift]}</strong> shift
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>setAddModal(false)} style={{fontSize:12,padding:"7px 16px",borderRadius:7}}>Cancel</button>
              <button onClick={addStaff} disabled={!newForm.name.trim()} style={{fontSize:12,fontWeight:500,padding:"7px 18px",borderRadius:7,background:newForm.name.trim()?C.forest:C.creamDk,color:newForm.name.trim()?C.cream:C.muted,border:"none",cursor:newForm.name.trim()?"pointer":"not-allowed"}}>Add to Roster</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}