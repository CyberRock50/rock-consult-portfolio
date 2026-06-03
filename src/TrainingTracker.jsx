import { useState, useMemo, useEffect } from "react";

const FONTS = { sans:"system-ui,-apple-system,'Segoe UI',Arial,sans-serif", serif:"Georgia,'Times New Roman',serif" };

const C = {
  cream:"#f4f0e6", creamDk:"#e8e2d4", forest:"#1b2d1b",
  sage:"#3b82f6", sageLt:"#93c5fd", sagePl:"#dbeafe",
  ink:"#1a1a14", muted:"#6b6b5e", border:"rgba(26,26,20,0.1)",
  danger:"#dc2626", dangerLt:"#fecaca",
};

const MODULES = [
  { key:"hipaa_privacy",  label:"HIPAA Privacy",          short:"Privacy"  },
  { key:"hipaa_security", label:"HIPAA Security",         short:"Security" },
  { key:"cyber_aware",    label:"Cybersecurity Awareness",short:"Cyber"    },
  { key:"phishing",       label:"Phishing Simulation",    short:"Phishing" },
  { key:"incident_resp",  label:"Incident Response",      short:"IR"       },
  { key:"rbac",           label:"Role-Based Access",      short:"RBAC"     },
  { key:"new_hire",       label:"New Hire Orientation",   short:"New Hire" },
];

const DEPARTMENTS = ["Clinical","Administrative","IT","Executive","HR"];

const STATUS_META = {
  "Completed":    {bg:"#dcfce7",border:"#86efac",text:"#15803d",dot:"#16a34a"},
  "In Progress":  {bg:"#fef08a",border:"#ca8a04",text:"#713f12",dot:"#ca8a04"},
  "Overdue":      {bg:"#fecaca",border:"#ef4444",text:"#7f1d1d",dot:"#dc2626"},
  "Not Started":  {bg:"#f1f5f9",border:"#94a3b8",text:"#475569",dot:"#94a3b8"},
  "Not Required": {bg:"#e8e2d4",border:"#a8a89a",text:"#6b6b5e",dot:"#d1d5db"},
};

const DEPT_COLOR = {Clinical:"#dbeafe",Administrative:"#fce7f3",IT:"#d1fae5",Executive:"#ede9fe",HR:"#fef3c7"};
const DEPT_TEXT  = {Clinical:"#1e40af",Administrative:"#9d174d",IT:"#065f46",Executive:"#5b21b6",HR:"#92400e"};

// localStorage key — unique per tool
const STORAGE_KEY = "rocklin_trainingTracker_staff";

const today   = new Date().toISOString().split("T")[0];
const addDays = n => { const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().split("T")[0]; };
const subDays = n => { const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().split("T")[0]; };
const nowStr  = () => new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"});

const mkT = arr => Object.fromEntries(MODULES.map((m,i) => [m.key, arr[i]||{status:"Not Required",dueDate:"",completedDate:""}]));
const requiredMods  = t => MODULES.filter(m => t[m.key]?.status !== "Not Required");
const completedMods = t => requiredMods(t).filter(m => t[m.key]?.status === "Completed");
const overdueMods   = t => MODULES.filter(m => t[m.key]?.status === "Overdue");
const pct           = t => { const r=requiredMods(t); return r.length ? Math.round((completedMods(t).length/r.length)*100) : 100; };

let nextId = 13;

const SEED = [
  {id:1,  name:"Sarah Chen",      department:"Clinical",       role:"Registered Nurse",       training:mkT([{status:"Completed",completedDate:subDays(30),dueDate:addDays(335)},{status:"Completed",completedDate:subDays(25),dueDate:addDays(340)},{status:"Completed",completedDate:subDays(20),dueDate:addDays(345)},{status:"Overdue",completedDate:"",dueDate:subDays(5)},{status:"In Progress",completedDate:"",dueDate:addDays(14)},{status:"Completed",completedDate:subDays(60),dueDate:addDays(305)},{status:"Completed",completedDate:subDays(90),dueDate:addDays(275)}])},
  {id:2,  name:"James Okoye",     department:"IT",             role:"Security Analyst",        training:mkT([{status:"Completed",completedDate:subDays(10),dueDate:addDays(355)},{status:"Completed",completedDate:subDays(8),dueDate:addDays(357)},{status:"Completed",completedDate:subDays(12),dueDate:addDays(353)},{status:"Completed",completedDate:subDays(15),dueDate:addDays(350)},{status:"Completed",completedDate:subDays(9),dueDate:addDays(356)},{status:"Completed",completedDate:subDays(11),dueDate:addDays(354)},{status:"Not Required",completedDate:"",dueDate:""}])},
  {id:3,  name:"Maria Rodriguez", department:"Administrative", role:"Medical Secretary",       training:mkT([{status:"Completed",completedDate:subDays(45),dueDate:addDays(320)},{status:"Overdue",completedDate:"",dueDate:subDays(10)},{status:"In Progress",completedDate:"",dueDate:addDays(7)},{status:"Not Required",completedDate:"",dueDate:""},{status:"Not Required",completedDate:"",dueDate:""},{status:"Completed",completedDate:subDays(50),dueDate:addDays(315)},{status:"Completed",completedDate:subDays(180),dueDate:addDays(185)}])},
  {id:4,  name:"David Kim",       department:"Executive",      role:"CISO",                    training:mkT([{status:"Completed",completedDate:subDays(5),dueDate:addDays(360)},{status:"Completed",completedDate:subDays(5),dueDate:addDays(360)},{status:"Completed",completedDate:subDays(6),dueDate:addDays(359)},{status:"Completed",completedDate:subDays(7),dueDate:addDays(358)},{status:"Completed",completedDate:subDays(8),dueDate:addDays(357)},{status:"Completed",completedDate:subDays(5),dueDate:addDays(360)},{status:"Not Required",completedDate:"",dueDate:""}])},
  {id:5,  name:"Lisa Thompson",   department:"Clinical",       role:"Physician",               training:mkT([{status:"Completed",completedDate:subDays(60),dueDate:addDays(305)},{status:"Overdue",completedDate:"",dueDate:subDays(15)},{status:"Overdue",completedDate:"",dueDate:subDays(7)},{status:"Not Required",completedDate:"",dueDate:""},{status:"Overdue",completedDate:"",dueDate:subDays(3)},{status:"Completed",completedDate:subDays(70),dueDate:addDays(295)},{status:"Not Required",completedDate:"",dueDate:""}])},
  {id:6,  name:"Marcus Williams", department:"HR",             role:"HR Manager",              training:mkT([{status:"Completed",completedDate:subDays(40),dueDate:addDays(325)},{status:"In Progress",completedDate:"",dueDate:addDays(21)},{status:"In Progress",completedDate:"",dueDate:addDays(14)},{status:"Not Required",completedDate:"",dueDate:""},{status:"Not Required",completedDate:"",dueDate:""},{status:"Completed",completedDate:subDays(35),dueDate:addDays(330)},{status:"Completed",completedDate:subDays(200),dueDate:addDays(165)}])},
  {id:7,  name:"Priya Patel",     department:"IT",             role:"Systems Administrator",   training:mkT([{status:"Completed",completedDate:subDays(20),dueDate:addDays(345)},{status:"Completed",completedDate:subDays(18),dueDate:addDays(347)},{status:"Completed",completedDate:subDays(22),dueDate:addDays(343)},{status:"In Progress",completedDate:"",dueDate:addDays(5)},{status:"Completed",completedDate:subDays(25),dueDate:addDays(340)},{status:"Completed",completedDate:subDays(19),dueDate:addDays(346)},{status:"Not Required",completedDate:"",dueDate:""}])},
  {id:8,  name:"Robert Foster",   department:"Clinical",       role:"Medical Assistant",       training:mkT([{status:"Overdue",completedDate:"",dueDate:subDays(20)},{status:"Overdue",completedDate:"",dueDate:subDays(18)},{status:"Overdue",completedDate:"",dueDate:subDays(12)},{status:"Not Required",completedDate:"",dueDate:""},{status:"Not Required",completedDate:"",dueDate:""},{status:"In Progress",completedDate:"",dueDate:addDays(3)},{status:"Completed",completedDate:subDays(150),dueDate:addDays(215)}])},
  {id:9,  name:"Sandra Lee",      department:"Administrative", role:"Billing Specialist",      training:mkT([{status:"Completed",completedDate:subDays(55),dueDate:addDays(310)},{status:"Completed",completedDate:subDays(52),dueDate:addDays(313)},{status:"In Progress",completedDate:"",dueDate:addDays(10)},{status:"Not Required",completedDate:"",dueDate:""},{status:"Not Required",completedDate:"",dueDate:""},{status:"Completed",completedDate:subDays(55),dueDate:addDays(310)},{status:"Completed",completedDate:subDays(250),dueDate:addDays(115)}])},
  {id:10, name:"Kevin Murphy",    department:"Executive",      role:"CEO",                     training:mkT([{status:"Completed",completedDate:subDays(15),dueDate:addDays(350)},{status:"Completed",completedDate:subDays(15),dueDate:addDays(350)},{status:"In Progress",completedDate:"",dueDate:addDays(30)},{status:"Not Required",completedDate:"",dueDate:""},{status:"Not Required",completedDate:"",dueDate:""},{status:"Not Required",completedDate:"",dueDate:""},{status:"Not Required",completedDate:"",dueDate:""}])},
  {id:11, name:"Ana Flores",      department:"HR",             role:"Training Coordinator",    training:mkT([{status:"Completed",completedDate:subDays(3),dueDate:addDays(362)},{status:"Completed",completedDate:subDays(3),dueDate:addDays(362)},{status:"Completed",completedDate:subDays(4),dueDate:addDays(361)},{status:"Completed",completedDate:subDays(5),dueDate:addDays(360)},{status:"Completed",completedDate:subDays(4),dueDate:addDays(361)},{status:"Completed",completedDate:subDays(3),dueDate:addDays(362)},{status:"Not Required",completedDate:"",dueDate:""}])},
  {id:12, name:"Tom Bradley",     department:"Clinical",       role:"Radiologist",             training:mkT([{status:"Overdue",completedDate:"",dueDate:subDays(8)},{status:"Overdue",completedDate:"",dueDate:subDays(6)},{status:"In Progress",completedDate:"",dueDate:addDays(2)},{status:"Not Required",completedDate:"",dueDate:""},{status:"Not Required",completedDate:"",dueDate:""},{status:"Completed",completedDate:subDays(30),dueDate:addDays(335)},{status:"Not Required",completedDate:"",dueDate:""}])},
];

async function callAI(prompt, system) {
  const res = await fetch("/.netlify/functions/ai-proxy",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:1400,system:system||"You are a healthcare training compliance analyst. Return only valid JSON, no markdown.",messages:[{role:"user",content:prompt}]})
  });
  if(!res.ok){const e=await res.json().catch(()=>{});throw new Error(e?.error?.message||`HTTP ${res.status}`);}
  const data=await res.json();
  const raw=(data.content?.[0]?.text||"").trim().replace(/^```[a-z]*\n?/i,"").replace(/```$/,"").trim();
  const s=raw.indexOf("{"),e=raw.lastIndexOf("}");
  if(s===-1||e===-1)throw new Error("No JSON in response");
  return JSON.parse(raw.slice(s,e+1));
}

const StBadge  = ({s}) => { const m=STATUS_META[s]; return <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:20,background:m.bg,color:m.text,border:`0.5px solid ${m.border}`,whiteSpace:"nowrap"}}>{s}</span>; };
const PctBar   = ({p,color}) => <div style={{height:6,background:C.creamDk,borderRadius:10,overflow:"hidden"}}><div style={{height:"100%",width:`${p}%`,background:color||C.sage,borderRadius:10,transition:"width 0.4s"}}/></div>;
const PctCircle = ({p,size=56}) => {
  const r=14,circ=2*Math.PI*r,dash=(p/100)*circ;
  const color=p>=80?"#16a34a":p>=60?"#ca8a04":"#dc2626";
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg viewBox="0 0 36 36" width={size} height={size}>
        <circle cx="18" cy="18" r={r} fill="none" stroke={C.creamDk} strokeWidth="3"/>
        <circle cx="18" cy="18" r={r} fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={circ*0.25} strokeLinecap="round"/>
      </svg>
      <span style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color}}>{p}%</span>
    </div>
  );
};

// ─── Guide content ─────────────────────────────────────────────────────────
const GUIDE = {
  title: "Training Tracking Dashboard",
  whatIsIt: `The Training Tracking Dashboard is a workforce compliance tool for managing mandatory healthcare security and privacy training. It tracks 12 staff members across 5 departments against 7 required modules: HIPAA Privacy, HIPAA Security, Cybersecurity Awareness, Phishing Simulation, Incident Response, Role-Based Access, and New Hire Orientation.

Each staff member has a per-module status (Completed, In Progress, Overdue, Not Started, or Not Required), due dates, and completion dates. The Training Matrix gives you an at-a-glance grid view of who has completed what, the Dashboard shows department and module completion rates, and the AI Insights tab generates a compliance score with at-risk department alerts, critical gaps, and a targeted campaign recommendation — the kind of analysis a compliance officer would pull together for an audit or a board report.`,
  howTo: [
    {
      step: "1",
      title: "Review the Staff Roster",
      detail: "The Staff Roster tab shows all 12 staff members sorted by training completion percentage (lowest first). Each card shows the staff member's completion circle, overdue count badge, role, and a mini color-coded module status strip. Use the Department, Status, and Search filters to isolate specific groups — for example, all Clinical staff with overdue training.",
    },
    {
      step: "2",
      title: "Update Training Records",
      detail: "Click '✎ Edit' on any staff card to open the training record form. For each of the 7 modules, set the status (Not Required, Not Started, In Progress, Completed, or Overdue), assign a due date, and record a completion date when marked Completed. The completion percentage preview updates live at the bottom of the form.",
    },
    {
      step: "3",
      title: "Add New Staff",
      detail: "Click '+ Add Staff' to create a new member. Enter their name, department, and role, then configure each module's status and dates. All modules default to 'Not Required' — assign the ones relevant to their role. This is particularly important for new hires who need the New Hire Orientation module tracked separately.",
    },
    {
      step: "4",
      title: "Use the Training Matrix",
      detail: "The Training Matrix tab shows a full grid: every staff member vs. every module. ✓ = Completed, ! = Overdue, … = In Progress, — = Not Required/Not Started. Use this view for audit documentation or to quickly spot which modules have the most outstanding completions across the workforce.",
    },
    {
      step: "5",
      title: "Run AI Insights",
      detail: "In the AI Insights tab, click 'Run Analysis.' Claude reviews your training data and returns a compliance score, at-risk department flags, critical gaps (modules with the most overdue completions), priority actions, and a tailored training campaign recommendation. Use this output to brief leadership or build a remediation plan.",
    },
  ],
};

// ─── Guide Modal ────────────────────────────────────────────────────────────
function GuideModal({ onClose, onClearData }) {
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
    } else {
      onClearData();
      setConfirmClear(false);
      onClose();
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position:"fixed", inset:0, zIndex:1100,
        background:"rgba(10,16,10,0.55)",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"1rem", backdropFilter:"blur(2px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:"#fff", borderRadius:14, width:"100%",
          maxWidth:580, maxHeight:"88vh", overflowY:"auto",
          boxShadow:"0 8px 40px rgba(0,0,0,0.22)",
          fontFamily:FONTS.sans,
        }}
      >
        <div style={{background:C.forest, borderRadius:"14px 14px 0 0", padding:"1.1rem 1.4rem", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div>
            <p style={{margin:0, fontSize:11, fontWeight:600, color:C.sageLt, letterSpacing:1, textTransform:"uppercase"}}>Tool Guide</p>
            <h2 style={{margin:"3px 0 0", fontSize:17, fontWeight:700, color:C.cream}}>{GUIDE.title}</h2>
          </div>
          <button onClick={onClose}
            style={{background:"rgba(255,255,255,0.12)", border:"none", cursor:"pointer", color:C.cream, fontSize:18, borderRadius:8, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1, flexShrink:0}}>✕</button>
        </div>
        <div style={{padding:"1.4rem"}}>
          <div style={{marginBottom:"1.4rem"}}>
            <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:"0.6rem"}}>
              <div style={{width:4, height:18, background:C.forest, borderRadius:2}}/>
              <h3 style={{margin:0, fontSize:13, fontWeight:700, color:C.forest, textTransform:"uppercase", letterSpacing:0.7}}>What Is It For</h3>
            </div>
            {GUIDE.whatIsIt.split("\n\n").map((para, idx) => (
              <p key={idx} style={{margin:"0 0 0.7rem", fontSize:13, color:C.ink, lineHeight:1.65}}>{para}</p>
            ))}
          </div>
          <div style={{borderTop:`1px solid ${C.border}`, margin:"0 0 1.4rem"}}/>
          <div>
            <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:"0.9rem"}}>
              <div style={{width:4, height:18, background:C.sageLt, borderRadius:2}}/>
              <h3 style={{margin:0, fontSize:13, fontWeight:700, color:C.forest, textTransform:"uppercase", letterSpacing:0.7}}>How To Use It</h3>
            </div>
            <div style={{display:"flex", flexDirection:"column", gap:"0.85rem"}}>
              {GUIDE.howTo.map((item) => (
                <div key={item.step} style={{display:"flex", gap:"0.9rem", alignItems:"flex-start"}}>
                  <div style={{width:26, height:26, borderRadius:"50%", background:C.forest, color:C.cream, fontSize:12, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1}}>{item.step}</div>
                  <div>
                    <p style={{margin:"0 0 3px", fontSize:13, fontWeight:600, color:C.ink}}>{item.title}</p>
                    <p style={{margin:0, fontSize:12, color:C.muted, lineHeight:1.6}}>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{marginTop:"1.4rem", padding:"0.75rem 1rem", background:C.creamDk, borderRadius:8, borderLeft:`3px solid ${C.sageLt}`}}>
            <p style={{margin:0, fontSize:11, color:C.muted, lineHeight:1.6}}>
              <strong style={{color:C.ink}}>Tip:</strong> Training records are automatically saved to this browser as you update them. For audit-ready compliance reports, use the AI Insights analysis and supplement it with your organization's LMS export.
            </p>
          </div>
          <div style={{borderTop:`1px solid ${C.border}`, margin:"1.4rem 0 1.1rem"}}/>
          <div style={{padding:"0.9rem 1rem", background: confirmClear ? C.dangerLt : "#fafaf8", borderRadius:8, border:`1px solid ${confirmClear ? C.danger : C.border}`, transition:"all 0.2s"}}>
            <p style={{margin:"0 0 6px", fontSize:12, fontWeight:600, color: confirmClear ? C.danger : C.ink}}>
              {confirmClear ? "⚠️ Are you sure? This cannot be undone." : "Reset Tool Data"}
            </p>
            <p style={{margin:"0 0 10px", fontSize:11, color:C.muted, lineHeight:1.5}}>
              Clears all saved training records and restores the original 12 demo staff members. Use this to reset for a new client or a clean demo.
            </p>
            <div style={{display:"flex", gap:8}}>
              <button onClick={handleClear}
                style={{fontSize:12, fontWeight:600, padding:"6px 14px", borderRadius:7, background: confirmClear ? C.danger : "none", color: confirmClear ? "#fff" : C.danger, border:`1px solid ${C.danger}`, cursor:"pointer"}}>
                {confirmClear ? "Yes, clear all data" : "Clear All Data"}
              </button>
              {confirmClear && (
                <button onClick={() => setConfirmClear(false)}
                  style={{fontSize:12, padding:"6px 14px", borderRadius:7, background:"none", color:C.muted, border:`1px solid ${C.border}`, cursor:"pointer"}}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function TrainingDashboard() {

  // ── State: load staff from localStorage, fall back to SEED ──
  const [staff, setStaff] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : SEED;
    } catch { return SEED; }
  });

  const [activeTab, setActiveTab] = useState("roster");
  const [deptFilter,setDeptFilter]= useState("All");
  const [stFilter,  setStFilter]  = useState("All");
  const [search,    setSearch]    = useState("");
  const [modal,     setModal]     = useState(null);
  const [aiReport,  setAiReport]  = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError,   setAiError]   = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  const blankTraining = Object.fromEntries(MODULES.map(m=>[m.key,{status:"Not Required",dueDate:"",completedDate:""}]));
  const blank = {name:"",department:DEPARTMENTS[0],role:"",training:blankTraining};
  const [form, setForm] = useState(blank);

  // ── Persist staff to localStorage whenever they change ──
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(staff)); } catch {}
  }, [staff]);

  // ── Clear all data: wipe localStorage, restore SEED ──
  const handleClearData = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setStaff(SEED);
    setAiReport(null);
    setModal(null);
  };

  const setF    = k => v => setForm(f=>({...f,[k]:v}));
  const setTRec = (mKey,field,val) => setForm(f=>({...f,training:{...f.training,[mKey]:{...f.training[mKey],[field]:val}}}));

  const openAdd  = () => { setForm(blank); setModal("add"); };
  const openEdit = s  => { setForm({name:s.name,department:s.department,role:s.role,training:JSON.parse(JSON.stringify(s.training))}); setModal(s); };
  const closeModal = () => setModal(null);

  const saveMember = () => {
    if(!form.name.trim()) return;
    if(modal==="add") setStaff(ss=>[...ss,{...form,id:nextId++}]);
    else setStaff(ss=>ss.map(s=>s.id===modal.id?{...s,...form}:s));
    closeModal();
  };
  const deleteMember = id => { setStaff(ss=>ss.filter(s=>s.id!==id)); closeModal(); };

  const stats = useMemo(()=>{
    const total=staff.length;
    const allOverdue=staff.filter(s=>overdueMods(s.training).length>0).length;
    const overallPct=Math.round(staff.reduce((sum,s)=>sum+pct(s.training),0)/total);
    const fullyCompliant=staff.filter(s=>pct(s.training)===100).length;
    const byDept=DEPARTMENTS.map(d=>{
      const ds=staff.filter(s=>s.department===d);
      const p=ds.length?Math.round(ds.reduce((sum,s)=>sum+pct(s.training),0)/ds.length):0;
      const od=ds.filter(s=>overdueMods(s.training).length>0).length;
      return {dept:d,count:ds.length,pct:p,overdue:od};
    });
    const byModule=MODULES.map(m=>{
      const required=staff.filter(s=>s.training[m.key]?.status!=="Not Required");
      const done=required.filter(s=>s.training[m.key]?.status==="Completed");
      const od=required.filter(s=>s.training[m.key]?.status==="Overdue");
      return {module:m,required:required.length,completed:done.length,overdue:od.length,pct:required.length?Math.round((done.length/required.length)*100):100};
    });
    return {total,allOverdue,overallPct,fullyCompliant,byDept,byModule};
  },[staff]);

  const filtered = useMemo(()=>staff.filter(s=>
    (deptFilter==="All"||s.department===deptFilter)&&
    (stFilter==="All"||(stFilter==="Overdue"&&overdueMods(s.training).length>0)||(stFilter==="Complete"&&pct(s.training)===100)||(stFilter==="Incomplete"&&pct(s.training)<100))&&
    (search===""||s.name.toLowerCase().includes(search.toLowerCase())||s.role.toLowerCase().includes(search.toLowerCase()))
  ).sort((a,b)=>pct(a.training)-pct(b.training)),[staff,deptFilter,stFilter,search]);

  const handleAI = async () => {
    setAiLoading(true); setAiReport(null); setAiError(null);
    const summary=`Total staff:${stats.total}|Overall compliance:${stats.overallPct}%|Overdue staff:${stats.allOverdue}|Fully compliant:${stats.fullyCompliant}\nDept:${stats.byDept.map(d=>`${d.dept}:${d.pct}%(${d.overdue} overdue)`).join(",")}\nModules:${stats.byModule.map(m=>`${m.module.short}:${m.pct}%(${m.overdue} overdue)`).join(",")}`;
    try {
      const r=await callAI(
        `Healthcare training compliance summary:\n${summary}\n\nAnalyze and generate insights. Max 3 items per array, max 20 words each.\nReturn ONLY JSON: {"compliance_score":0-100,"summary":"2 sentences","at_risk_departments":["dept: reason"],"critical_gaps":["gap"],"priority_actions":["action"],"campaign_recommendation":"1-2 sentence training campaign suggestion"}`,
        "You are a healthcare training compliance analyst. Be specific and actionable. Return only valid JSON, no markdown."
      );
      setAiReport({...r,generatedAt:nowStr()});
    }catch(e){setAiError(`Analysis failed: ${e.message}`);}
    setAiLoading(false);
  };

  const inputStyle={width:"100%",boxSizing:"border-box",fontSize:13,padding:"7px 10px",borderRadius:6,border:`0.5px solid ${C.border}`,background:C.creamDk,color:C.ink,fontFamily:FONTS.sans,outline:"none"};
  const scoreColor=p=>p>=80?"#15803d":p>=60?"#92400e":"#9f1239";
  const scoreBg   =p=>p>=80?"#dcfce7":p>=60?"#fef3c7":"#fecaca";

  return (
    <div style={{fontFamily:FONTS.sans,background:C.cream,minHeight:400,color:C.ink}}>

      {/* ── Guide Modal ── */}
      {showGuide && (
        <GuideModal
          onClose={() => setShowGuide(false)}
          onClearData={handleClearData}
        />
      )}

      {/* Header */}
      <div style={{background:C.forest,padding:"1.5rem 1.75rem",display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{fontFamily:FONTS.serif,fontSize:22,fontWeight:400,color:C.cream,margin:"0 0 4px"}}>Training Tracking Dashboard</h2>
          <p style={{fontSize:12,color:C.sageLt,margin:0}}>HIPAA · Cybersecurity · Workforce Compliance · Allied Healthcare</p>
        </div>
        {/* ── Guide button ── */}
        <button
          onClick={() => setShowGuide(true)}
          style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:8,background:"rgba(255,255,255,0.12)",color:C.cream,border:"1px solid rgba(255,255,255,0.2)",cursor:"pointer",fontSize:12,fontWeight:600,letterSpacing:0.4,flexShrink:0}}
          onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.2)"}
          onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.12)"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          Guide
        </button>
      </div>
      <div style={{height:3,background:`linear-gradient(90deg,${C.sage},${C.cream})`}}/>

      <div style={{padding:"1.25rem 1.5rem"}}>
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          {[["roster","Staff Roster"],["matrix","Training Matrix"],["dashboard","Dashboard"],["ai","✦ AI Insights"]].map(([t,label])=>(
            <button key={t} onClick={()=>setActiveTab(t)}
              style={{fontSize:13,padding:"6px 18px",borderRadius:7,border:"none",cursor:"pointer",fontWeight:500,
                background:activeTab===t?(t==="ai"?C.sage:C.forest):C.creamDk,color:activeTab===t?C.cream:C.muted}}>
              {label}
            </button>
          ))}
          <button onClick={openAdd} style={{marginLeft:"auto",fontSize:13,fontWeight:500,padding:"6px 16px",borderRadius:7,background:C.sage,color:"#fff",border:"none",cursor:"pointer"}}>
            + Add Staff
          </button>
        </div>

        {/* STAFF ROSTER */}
        {activeTab==="roster" && (
          <>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or role…"
                style={{fontSize:12,padding:"5px 10px",borderRadius:6,border:`0.5px solid ${C.border}`,background:"#fff",color:C.ink,width:170,outline:"none"}}/>
              {[["Dept",DEPARTMENTS,deptFilter,setDeptFilter],["Status",["Overdue","Incomplete","Complete"],stFilter,setStFilter]].map(([label,opts,val,set])=>(
                <div key={label} style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:11,fontWeight:500,color:C.muted}}>{label}</span>
                  <select value={val} onChange={e=>set(e.target.value)} style={{fontSize:12,padding:"5px 8px",borderRadius:6,border:`0.5px solid ${C.border}`,background:"#fff",color:C.ink}}>
                    <option value="All">All</option>
                    {opts.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <span style={{fontSize:12,color:C.muted,marginLeft:"auto"}}>{filtered.length} of {staff.length}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {filtered.length===0&&<p style={{fontSize:13,color:C.muted}}>No staff match current filters.</p>}
              {filtered.map(s=>{
                const p=pct(s.training),od=overdueMods(s.training).length;
                return (
                  <div key={s.id} style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"12px 14px",display:"flex",gap:14,alignItems:"center"}}>
                    <div style={{width:4,flexShrink:0,alignSelf:"stretch",borderRadius:4,background:DEPT_TEXT[s.department]||C.sage}}/>
                    <PctCircle p={p} size={50}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                        <span style={{fontSize:13,fontWeight:500,color:C.ink}}>{s.name}</span>
                        <span style={{fontSize:10,padding:"1px 7px",borderRadius:5,background:DEPT_COLOR[s.department],color:DEPT_TEXT[s.department],fontWeight:600}}>{s.department}</span>
                        {od>0&&<span style={{fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:10,background:"#fecaca",color:"#7f1d1d"}}>⚠ {od} overdue</span>}
                      </div>
                      <p style={{fontSize:11,color:C.muted,margin:"0 0 6px"}}>{s.role}</p>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                        {MODULES.map(m=>{
                          const rec=s.training[m.key],mt=STATUS_META[rec.status];
                          return <span key={m.key} title={`${m.label}: ${rec.status}`} style={{fontSize:9,fontWeight:600,padding:"2px 6px",borderRadius:4,background:mt.bg,color:mt.text,border:`0.5px solid ${mt.border}`}}>{m.short}</span>;
                        })}
                      </div>
                    </div>
                    <button onClick={()=>openEdit(s)} style={{fontSize:11,padding:"4px 10px",borderRadius:5,border:`0.5px solid ${C.border}`,background:"none",cursor:"pointer",color:C.muted,flexShrink:0}}>✎ Edit</button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* TRAINING MATRIX */}
        {activeTab==="matrix" && (
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,background:"#fff",borderRadius:10,overflow:"hidden",border:`0.5px solid ${C.border}`}}>
              <thead>
                <tr style={{background:C.forest}}>
                  <th style={{padding:"10px 12px",textAlign:"left",color:C.cream,fontWeight:500,fontSize:12,whiteSpace:"nowrap"}}>Staff Member</th>
                  <th style={{padding:"10px 8px",color:C.sageLt,fontWeight:500,fontSize:11,textAlign:"center"}}>Dept</th>
                  {MODULES.map(m=><th key={m.key} style={{padding:"10px 8px",color:C.sageLt,fontWeight:500,fontSize:11,whiteSpace:"nowrap",textAlign:"center"}}>{m.short}</th>)}
                  <th style={{padding:"10px 8px",color:C.sageLt,fontWeight:500,fontSize:11,textAlign:"center"}}>Pct</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s,i)=>{
                  const p=pct(s.training);
                  return (
                    <tr key={s.id} style={{borderBottom:`0.5px solid ${C.border}`,background:i%2===0?"#fff":"rgba(244,240,230,0.4)"}}>
                      <td style={{padding:"8px 12px",fontWeight:500,color:C.ink,whiteSpace:"nowrap"}}>{s.name}</td>
                      <td style={{padding:"8px",textAlign:"center"}}>
                        <span style={{fontSize:10,fontWeight:600,padding:"1px 6px",borderRadius:4,background:DEPT_COLOR[s.department],color:DEPT_TEXT[s.department]}}>{s.department.slice(0,5)}</span>
                      </td>
                      {MODULES.map(m=>{
                        const rec=s.training[m.key],mt=STATUS_META[rec.status];
                        return (
                          <td key={m.key} style={{padding:"8px",textAlign:"center"}}>
                            <span title={rec.status} style={{display:"inline-block",width:22,height:22,borderRadius:6,background:mt.bg,border:`0.5px solid ${mt.border}`,lineHeight:"22px",fontSize:11,color:mt.text,fontWeight:600}}>
                              {rec.status==="Completed"?"✓":rec.status==="Overdue"?"!":rec.status==="In Progress"?"…":"—"}
                            </span>
                          </td>
                        );
                      })}
                      <td style={{padding:"8px",textAlign:"center",fontWeight:700,color:scoreColor(p)}}>{p}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{display:"flex",gap:10,marginTop:10,flexWrap:"wrap"}}>
              {Object.entries(STATUS_META).map(([s,m])=>(
                <div key={s} style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{display:"inline-block",width:16,height:16,borderRadius:4,background:m.bg,border:`0.5px solid ${m.border}`,lineHeight:"16px",fontSize:10,color:m.text,fontWeight:700,textAlign:"center"}}>
                    {s==="Completed"?"✓":s==="Overdue"?"!":s==="In Progress"?"…":"—"}
                  </span>
                  <span style={{fontSize:11,color:C.muted}}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DASHBOARD */}
        {activeTab==="dashboard" && (
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <style>{`.tkpi{perspective:600px;cursor:pointer}.tkpi-inner{position:relative;width:100%;height:88px;transform-style:preserve-3d;transition:transform 0.55s cubic-bezier(.4,0,.2,1)}.tkpi:hover .tkpi-inner{transform:rotateY(180deg)}.tkpi-f,.tkpi-b{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px;text-align:center}.tkpi-b{transform:rotateY(180deg)}`}</style>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10}}>
              {[
                {label:"Total Staff",       val:stats.total,            color:C.ink,    bg:"#fff",    backBg:"#ece8dc", desc:"Total workforce members with active training records."},
                {label:"Overall Compliance",val:`${stats.overallPct}%`, color:scoreColor(stats.overallPct),bg:scoreBg(stats.overallPct),backBg:stats.overallPct>=80?"#86efac":stats.overallPct>=60?"#fde047":"#f87171",desc:"Average training completion rate across all required modules."},
                {label:"Fully Compliant",   val:stats.fullyCompliant,   color:"#15803d",bg:"#dcfce7", backBg:"#86efac", desc:"Staff members with 100% of required training completed."},
                {label:"Has Overdue",       val:stats.allOverdue,       color:"#7f1d1d",bg:"#fecaca", backBg:"#f87171", desc:"Staff with at least one overdue training module requiring immediate action."},
              ].map(k=>(
                <div key={k.label} className="tkpi">
                  <div className="tkpi-inner">
                    <div className="tkpi-f" style={{background:k.bg,border:`0.5px solid ${C.border}`}}>
                      <p style={{fontSize:24,fontWeight:700,color:k.color,margin:"0 0 4px",lineHeight:1}}>{k.val}</p>
                      <p style={{fontSize:10,color:C.muted,margin:0,lineHeight:1.3}}>{k.label}</p>
                    </div>
                    <div className="tkpi-b" style={{background:k.backBg,border:`0.5px solid ${C.border}`}}>
                      <p style={{fontSize:11,color:k.color,margin:0,lineHeight:1.5,fontWeight:500}}>{k.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
              <p style={{fontSize:11,fontWeight:600,color:C.muted,letterSpacing:0.8,margin:"0 0 14px"}}>COMPLETION BY DEPARTMENT</p>
              {stats.byDept.filter(d=>d.count>0).map(d=>(
                <div key={d.dept} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <span style={{fontSize:12,fontWeight:600,padding:"1px 9px",borderRadius:5,background:DEPT_COLOR[d.dept],color:DEPT_TEXT[d.dept]}}>{d.dept}</span>
                      <span style={{fontSize:11,color:C.muted}}>{d.count} staff</span>
                      {d.overdue>0&&<span style={{fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:10,background:"#fecaca",color:"#7f1d1d"}}>⚠ {d.overdue}</span>}
                    </div>
                    <span style={{fontSize:13,fontWeight:700,color:scoreColor(d.pct)}}>{d.pct}%</span>
                  </div>
                  <PctBar p={d.pct} color={DEPT_TEXT[d.dept]}/>
                </div>
              ))}
            </div>
            <div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
              <p style={{fontSize:11,fontWeight:600,color:C.muted,letterSpacing:0.8,margin:"0 0 14px"}}>COMPLETION BY MODULE</p>
              {stats.byModule.map(m=>(
                <div key={m.module.key} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <span style={{fontSize:12,fontWeight:500,color:C.ink}}>{m.module.label}</span>
                      {m.overdue>0&&<span style={{fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:10,background:"#fecaca",color:"#7f1d1d"}}>⚠ {m.overdue}</span>}
                    </div>
                    <span style={{fontSize:12,color:C.muted}}>{m.completed}/{m.required} · <strong style={{color:scoreColor(m.pct)}}>{m.pct}%</strong></span>
                  </div>
                  <PctBar p={m.pct} color={scoreColor(m.pct)==="#15803d"?"#16a34a":scoreColor(m.pct)==="#92400e"?"#ca8a04":"#dc2626"}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI INSIGHTS */}
        {activeTab==="ai" && (
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                <div>
                  <p style={{fontSize:14,fontWeight:500,color:C.ink,margin:"0 0 5px"}}>✦ AI Training Compliance Insights</p>
                  <p style={{fontSize:12,color:C.muted,margin:0,lineHeight:1.6,maxWidth:460}}>Analyzes training completion data to identify at-risk departments, critical gaps, priority remediation actions, and a targeted training campaign recommendation.</p>
                </div>
                <button onClick={handleAI} disabled={aiLoading}
                  style={{fontSize:13,fontWeight:500,padding:"8px 20px",borderRadius:7,background:aiLoading?C.creamDk:C.sage,color:aiLoading?C.muted:"#fff",border:"none",cursor:aiLoading?"not-allowed":"pointer",flexShrink:0,whiteSpace:"nowrap"}}>
                  {aiLoading?"Analyzing…":"Run Analysis"}
                </button>
              </div>
            </div>
            {aiLoading&&(
              <div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"2rem",textAlign:"center"}}>
                <div style={{width:36,height:36,border:`3px solid ${C.sagePl}`,borderTopColor:C.sage,borderRadius:"50%",margin:"0 auto 14px",animation:"spin 0.8s linear infinite"}}/>
                <p style={{fontSize:13,color:C.muted,margin:0}}>Reviewing training data for {staff.length} staff members…</p>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            )}
            {aiError&&<div style={{background:"#fecaca",border:"0.5px solid #ef4444",borderRadius:10,padding:"1rem"}}><p style={{fontSize:13,color:"#7f1d1d",margin:0}}>{aiError}</p></div>}
            {aiReport&&!aiLoading&&(
              <>
                <div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
                  <div style={{display:"flex",alignItems:"center",gap:16}}>
                    <div style={{width:64,height:64,borderRadius:"50%",background:scoreBg(aiReport.compliance_score),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <span style={{fontSize:18,fontWeight:700,color:scoreColor(aiReport.compliance_score)}}>{aiReport.compliance_score}</span>
                    </div>
                    <div>
                      <p style={{fontSize:13,fontWeight:500,color:C.ink,margin:"0 0 4px"}}>Compliance Score · {aiReport.generatedAt}</p>
                      <p style={{fontSize:13,color:C.muted,margin:0,lineHeight:1.6}}>{aiReport.summary}</p>
                    </div>
                  </div>
                </div>
                {aiReport.priority_actions?.length>0&&(
                  <div style={{background:"#fff",border:`1.5px solid ${C.sage}`,borderRadius:10,padding:"1.25rem"}}>
                    <p style={{fontSize:11,fontWeight:600,color:C.sage,letterSpacing:0.8,margin:"0 0 12px"}}>PRIORITY ACTIONS</p>
                    <ol style={{margin:0,paddingLeft:18}}>{aiReport.priority_actions.map((a,i)=><li key={i} style={{fontSize:13,color:C.ink,marginBottom:7,lineHeight:1.5}}>{a}</li>)}</ol>
                  </div>
                )}
                {[
                  {title:"AT-RISK DEPARTMENTS",items:aiReport.at_risk_departments,bg:"#fecaca",tc:"#7f1d1d",lc:"#991b1b"},
                  {title:"CRITICAL GAPS",       items:aiReport.critical_gaps,      bg:"#fed7aa",tc:"#7c2d12",lc:"#9a3412"},
                ].map(sec=>sec.items?.length?(
                  <div key={sec.title} style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
                    <p style={{fontSize:11,fontWeight:600,color:sec.tc,letterSpacing:0.8,margin:"0 0 10px"}}>{sec.title}</p>
                    <ul style={{margin:0,paddingLeft:16}}>{sec.items.map((item,i)=><li key={i} style={{fontSize:13,color:sec.lc,marginBottom:5,lineHeight:1.5}}>{item}</li>)}</ul>
                  </div>
                ):null)}
                {aiReport.campaign_recommendation&&(
                  <div style={{background:"#d1fae5",border:"0.5px solid #6ee7b7",borderRadius:10,padding:"1.25rem"}}>
                    <p style={{fontSize:11,fontWeight:600,color:"#065f46",letterSpacing:0.8,margin:"0 0 8px"}}>TRAINING CAMPAIGN RECOMMENDATION</p>
                    <p style={{fontSize:13,color:"#065f46",margin:0,lineHeight:1.6}}>{aiReport.campaign_recommendation}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal&&(
        <div onClick={e=>{if(e.target===e.currentTarget)closeModal();}}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:20}}>
          <div style={{background:C.cream,borderRadius:12,border:`0.5px solid ${C.border}`,padding:"1.5rem",width:"100%",maxWidth:520,maxHeight:"92vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <p style={{margin:0,fontWeight:500,fontSize:16,color:C.ink}}>{modal==="add"?"Add Staff Member":"Edit Staff Member"}</p>
              <button onClick={closeModal} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:C.muted,padding:0}}>✕</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              <div style={{gridColumn:"1/-1"}}><label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Full Name *</label><input value={form.name} onChange={e=>setF("name")(e.target.value)} placeholder="e.g. Sarah Chen" style={inputStyle}/></div>
              <div><label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Department</label><select value={form.department} onChange={e=>setF("department")(e.target.value)} style={inputStyle}>{DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}</select></div>
              <div><label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Role / Title</label><input value={form.role} onChange={e=>setF("role")(e.target.value)} placeholder="e.g. Registered Nurse" style={inputStyle}/></div>
            </div>
            <p style={{fontSize:12,fontWeight:500,color:C.muted,marginBottom:10}}>Training Records</p>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18}}>
              {MODULES.map(m=>{
                const rec=form.training[m.key]||{status:"Not Required",dueDate:"",completedDate:""};
                const mt=STATUS_META[rec.status];
                const isNR=rec.status==="Not Required", isDone=rec.status==="Completed";
                const disabledStyle=off=>({width:"100%",fontSize:11,padding:"4px 6px",borderRadius:5,outline:"none",boxSizing:"border-box",border:`0.5px solid ${C.border}`,background:off?"#ebebeb":C.creamDk,color:off?"#b0b0a8":C.ink,cursor:off?"not-allowed":"text",opacity:off?0.6:1});
                return (
                  <div key={m.key} style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:8,padding:"10px 12px"}}>
                    <p style={{fontSize:12,fontWeight:500,color:C.ink,margin:"0 0 8px"}}>{m.label}</p>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7}}>
                      <div>
                        <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:3}}>Status</label>
                        <select value={rec.status} onChange={e=>setTRec(m.key,"status",e.target.value)}
                          style={{width:"100%",fontSize:11,padding:"4px 6px",borderRadius:5,border:`0.5px solid ${mt.border}`,background:mt.bg,color:mt.text,cursor:"pointer"}}>
                          {["Not Required","Not Started","In Progress","Completed","Overdue"].map(s=><option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{fontSize:10,display:"block",marginBottom:3,color:isNR?C.border:C.muted}}>Due Date</label>
                        <input type="date" value={rec.dueDate||""} disabled={isNR} onChange={e=>setTRec(m.key,"dueDate",e.target.value)} style={disabledStyle(isNR)}/>
                      </div>
                      <div>
                        <label style={{fontSize:10,display:"block",marginBottom:3,color:!isDone?C.border:C.muted}}>Completed</label>
                        <input type="date" value={rec.completedDate||""} disabled={!isDone} onChange={e=>setTRec(m.key,"completedDate",e.target.value)} style={disabledStyle(!isDone)}/>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {(()=>{const p=pct(form.training),col=scoreColor(p);return(
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:scoreBg(p),borderRadius:8,marginBottom:18}}>
                <PctCircle p={p} size={44}/>
                <div>
                  <p style={{fontSize:13,fontWeight:500,color:col,margin:"0 0 2px"}}>Training Completion: {p}%</p>
                  <p style={{fontSize:12,color:col,margin:0,opacity:0.8}}>{completedMods(form.training).length} of {requiredMods(form.training).length} required modules complete</p>
                </div>
              </div>
            );})()}
            <div style={{display:"flex",gap:8,justifyContent:"space-between"}}>
              {modal!=="add"&&<button onClick={()=>deleteMember(modal.id)} style={{fontSize:12,padding:"7px 14px",borderRadius:7,border:"0.5px solid #fca5a5",background:"none",color:"#dc2626",cursor:"pointer"}}>Delete</button>}
              <div style={{display:"flex",gap:8,marginLeft:"auto"}}>
                <button onClick={closeModal} style={{fontSize:12,padding:"7px 14px",borderRadius:7}}>Cancel</button>
                <button onClick={saveMember} disabled={!form.name.trim()}
                  style={{fontSize:12,fontWeight:500,padding:"7px 18px",borderRadius:7,background:form.name.trim()?C.forest:C.creamDk,color:form.name.trim()?C.cream:C.muted,border:"none",cursor:form.name.trim()?"pointer":"not-allowed",opacity:form.name.trim()?1:0.45}}>
                  {modal==="add"?"Add Member":"Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}