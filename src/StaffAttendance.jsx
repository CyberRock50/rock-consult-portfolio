import { useState, useMemo, useEffect, useRef } from "react";

const FONTS = { sans:"system-ui,-apple-system,'Segoe UI',Arial,sans-serif", serif:"Georgia,'Times New Roman',serif" };
const C = {
  cream:"#f4f0e6", creamDk:"#e8e2d4", forest:"#1b2d1b",
  sage:"#3b82f6", sageLt:"#93c5fd", sagePl:"#dbeafe",
  ink:"#1a1a14", muted:"#6b6b5e", border:"rgba(26,26,20,0.1)", white:"#ffffff",
  danger:"#dc2626", dangerLt:"#fecaca",
};

const SHIFT_META = {
  Morning:   { start:"07:00", end:"15:00", bg:"#dbeafe", text:"#1e40af", brd:"#bfdbfe" },
  Afternoon: { start:"15:00", end:"23:00", bg:"#fefce8", text:"#713f12", brd:"#fde68a" },
  Night:     { start:"23:00", end:"07:00", bg:"#0f172a", text:"#93c5fd", brd:"#1e293b" },
};
const DEPT_CLR  = { Clinical:"#3b82f6", Administrative:"#ec4899", IT:"#10b981", Executive:"#8b5cf6", HR:"#f59e0b" };
const DEPT_BG   = { Clinical:"#dbeafe", Administrative:"#fce7f3", IT:"#d1fae5", Executive:"#ede9fe", HR:"#fef3c7" };
const DEPT_TEXT = { Clinical:"#1e40af", Administrative:"#9d174d", IT:"#065f46", Executive:"#5b21b6", HR:"#92400e" };
const ST_META   = {
  Active:        { bg:"#dcfce7", brd:"#86efac", txt:"#15803d", dot:"#16a34a" },
  "On Break":    { bg:"#fef08a", brd:"#ca8a04", txt:"#713f12", dot:"#ca8a04" },
  Late:          { bg:"#fed7aa", brd:"#f97316", txt:"#7c2d12", dot:"#ea580c" },
  "On Time":     { bg:"#dcfce7", brd:"#86efac", txt:"#15803d", dot:"#16a34a" },
  "Early Out":   { bg:"#fef08a", brd:"#ca8a04", txt:"#713f12", dot:"#ca8a04" },
  Absent:        { bg:"#fecaca", brd:"#ef4444", txt:"#7f1d1d", dot:"#dc2626" },
  "Not In":      { bg:"#f1f5f9", brd:"#94a3b8", txt:"#475569", dot:"#94a3b8" },
  Completed:     { bg:"#dbeafe", brd:"#93c5fd", txt:"#1e40af", dot:"#3b82f6" },
};

// localStorage key — unique per tool
const STORAGE_KEY = "rocklin_staffAttendance_records";

// ── Time helpers ──────────────────────────────────────────────────────────────
const toMin   = t => { if(!t) return null; const[h,m]=t.split(":").map(Number); return h*60+m; };
const diffMin = (a,b) => { let d=(toMin(b)||0)-(toMin(a)||0); if(d>720)d-=1440; if(d<-720)d+=1440; return d; };
const padHHMM = d => `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
const padHHMMSS = d => `${padHHMM(d)}:${String(d.getSeconds()).padStart(2,"0")}`;
const todayStr  = () => new Date().toISOString().split("T")[0];
const yestStr   = () => { const d=new Date(); d.setDate(d.getDate()-1); return d.toISOString().split("T")[0]; };
const initials  = n => n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
const nowStr    = () => new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"});
const fmtHrs    = h => h==null?"—":`${Math.floor(h)}h ${Math.round((h%1)*60)}m`;

const hoursWorked = rec => {
  if(!rec?.clockIn||!rec?.clockOut) return null;
  let total=diffMin(rec.clockIn,rec.clockOut); if(total<0)total+=1440;
  const brk=rec.breaks.reduce((s,b)=>{ if(b.start&&b.end){let d=diffMin(b.start,b.end);if(d<0)d+=1440;return s+d;}return s; },0);
  return Math.max(0,(total-brk)/60);
};

const getStatus = (rec, staff, late=15, early=15) => {
  if(!rec?.clockIn) return "Absent";
  const sm=SHIFT_META[staff.shift];
  const isLate=diffMin(sm.start,rec.clockIn)>late;
  const isOnBreak=rec.breaks.some(b=>b.start&&!b.end);
  if(isOnBreak) return "On Break";
  if(!rec.clockOut) return isLate?"Late":"Active";
  const isEarly=diffMin(rec.clockOut,sm.end)>early;
  if(isEarly) return "Early Out";
  return isLate?"Late":"On Time";
};

// ── Staff seed ────────────────────────────────────────────────────────────────
const STAFF_SEED = [
  {id:1, name:"Sarah Chen",      dept:"Clinical",       role:"RN",              site:"Main Campus",    shift:"Morning",   pin:"1111"},
  {id:2, name:"Michael Park",    dept:"Clinical",       role:"Physician",       site:"Main Campus",    shift:"Morning",   pin:"2222"},
  {id:3, name:"Emma Davis",      dept:"Clinical",       role:"Med Asst",        site:"Main Campus",    shift:"Morning",   pin:"3333"},
  {id:4, name:"David Kim",       dept:"Executive",      role:"CISO",            site:"Main Campus",    shift:"Morning",   pin:"4444"},
  {id:5, name:"Sandra Lee",      dept:"Administrative", role:"Billing Spec",    site:"Main Campus",    shift:"Afternoon", pin:"5555"},
  {id:6, name:"Marcus Williams", dept:"HR",             role:"HR Manager",      site:"Main Campus",    shift:"Afternoon", pin:"6666"},
  {id:7, name:"Ana Flores",      dept:"HR",             role:"Training Coord",  site:"Main Campus",    shift:"Afternoon", pin:"7777"},
  {id:8, name:"James Okoye",     dept:"IT",             role:"Security",        site:"Main Campus",    shift:"Night",     pin:"8888"},
  {id:9, name:"Priya Patel",     dept:"IT",             role:"Sys Admin",       site:"Main Campus",    shift:"Night",     pin:"9999"},
  {id:10,name:"Kevin Murphy",    dept:"Executive",      role:"CEO",             site:"Main Campus",    shift:"Morning",   pin:"1234"},
  {id:11,name:"Lisa Thompson",   dept:"Clinical",       role:"Physician",       site:"North Clinic",   shift:"Morning",   pin:"2345"},
  {id:12,name:"Carlos Vega",     dept:"Clinical",       role:"LPN",             site:"North Clinic",   shift:"Morning",   pin:"3456"},
  {id:13,name:"Aisha Johnson",   dept:"Clinical",       role:"RN",              site:"North Clinic",   shift:"Morning",   pin:"4567"},
  {id:14,name:"Maria Rodriguez", dept:"Administrative", role:"Med Secretary",   site:"North Clinic",   shift:"Afternoon", pin:"5678"},
  {id:15,name:"Grace Kim",       dept:"Clinical",       role:"RN",              site:"South Clinic",   shift:"Morning",   pin:"6789"},
  {id:16,name:"Henry Brown",     dept:"Clinical",       role:"Med Asst",        site:"South Clinic",   shift:"Morning",   pin:"7890"},
  {id:17,name:"Jason Miller",    dept:"Clinical",       role:"LPN",             site:"South Clinic",   shift:"Afternoon", pin:"8901"},
  {id:18,name:"Kate Nelson",     dept:"Clinical",       role:"RN",              site:"South Clinic",   shift:"Afternoon", pin:"9012"},
  {id:19,name:"Zoe Turner",      dept:"Clinical",       role:"RN",              site:"West Wing",      shift:"Night",     pin:"0123"},
  {id:20,name:"Beth Carson",     dept:"Clinical",       role:"Telehealth RN",   site:"Telehealth Hub", shift:"Morning",   pin:"1357"},
];

const buildSeedRecords = () => {
  const t=todayStr(), y=yestStr(); let id=1;
  return [
    {id:id++,staffId:1, date:t,clockIn:"07:03",clockOut:null,   breaks:[],                           notes:""},
    {id:id++,staffId:2, date:t,clockIn:"07:48",clockOut:null,   breaks:[],                           notes:""},
    {id:id++,staffId:3, date:t,clockIn:"07:01",clockOut:null,   breaks:[{start:"10:00",end:null}],    notes:""},
    {id:id++,staffId:4, date:t,clockIn:"07:05",clockOut:null,   breaks:[],                           notes:""},
    {id:id++,staffId:10,date:t,clockIn:"08:45",clockOut:null,   breaks:[],                           notes:""},
    {id:id++,staffId:11,date:t,clockIn:"07:02",clockOut:null,   breaks:[{start:"09:30",end:"09:45"}],notes:""},
    {id:id++,staffId:12,date:t,clockIn:"07:25",clockOut:null,   breaks:[],                           notes:""},
    {id:id++,staffId:15,date:t,clockIn:"07:00",clockOut:null,   breaks:[],                           notes:""},
    {id:id++,staffId:16,date:t,clockIn:"07:12",clockOut:null,   breaks:[],                           notes:""},
    {id:id++,staffId:20,date:t,clockIn:"07:08",clockOut:null,   breaks:[],                           notes:""},
    {id:id++,staffId:8, date:t,clockIn:"23:05",clockOut:"07:15",breaks:[{start:"02:00",end:"02:30"}], notes:""},
    {id:id++,staffId:9, date:t,clockIn:"22:58",clockOut:"07:02",breaks:[{start:"03:00",end:"03:25"}], notes:""},
    {id:id++,staffId:19,date:t,clockIn:"23:10",clockOut:"07:30",breaks:[{start:"01:30",end:"02:00"}], notes:""},
    {id:id++,staffId:1, date:y,clockIn:"07:01",clockOut:"15:05",breaks:[{start:"11:00",end:"11:30"}], notes:""},
    {id:id++,staffId:2, date:y,clockIn:"07:55",clockOut:"15:10",breaks:[{start:"12:00",end:"12:30"}], notes:""},
    {id:id++,staffId:3, date:y,clockIn:"07:00",clockOut:"15:00",breaks:[{start:"10:30",end:"11:00"}], notes:""},
    {id:id++,staffId:4, date:y,clockIn:"07:02",clockOut:"15:30",breaks:[],                            notes:""},
    {id:id++,staffId:10,date:y,clockIn:"09:00",clockOut:"14:30",breaks:[],                            notes:""},
    {id:id++,staffId:5, date:y,clockIn:"15:05",clockOut:"23:10",breaks:[{start:"19:00",end:"19:30"}], notes:""},
    {id:id++,staffId:6, date:y,clockIn:"15:30",clockOut:"23:05",breaks:[],                            notes:""},
    {id:id++,staffId:8, date:y,clockIn:"23:08",clockOut:"07:05",breaks:[{start:"02:00",end:"02:30"}], notes:""},
    {id:id++,staffId:11,date:y,clockIn:"07:00",clockOut:"15:02",breaks:[{start:"11:00",end:"11:20"}], notes:""},
    {id:id++,staffId:15,date:y,clockIn:"07:03",clockOut:"15:00",breaks:[{start:"10:00",end:"10:15"}], notes:""},
  ];
};

async function callAI(prompt, system) {
  const res=await fetch("/.netlify/functions/ai-proxy",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:1200,
      system:system||"You are a healthcare workforce analyst. Return only valid JSON, no markdown.",
      messages:[{role:"user",content:prompt}]})
  });
  if(!res.ok){const e=await res.json().catch(()=>{});throw new Error(e?.error?.message||`HTTP ${res.status}`);}
  const data=await res.json();
  const raw=(data.content?.[0]?.text||"").trim().replace(/^```[a-z]*\n?/i,"").replace(/```$/,"").trim();
  const s=raw.indexOf("{"),e=raw.lastIndexOf("}");
  if(s===-1||e===-1)throw new Error("No JSON in response");
  return JSON.parse(raw.slice(s,e+1));
}

const StBadge = ({s}) => { const m=ST_META[s]||ST_META["Not In"]; return <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:20,background:m.bg,color:m.txt,border:`0.5px solid ${m.brd}`,whiteSpace:"nowrap"}}>{s}</span>; };

// ── Guide content ─────────────────────────────────────────────────────────────
const GUIDE = {
  title: "Staff Attendance",
  whatIsIt: `The Staff Attendance tool is a real-time clock-in / clock-out and break tracking system for multi-site healthcare teams. It supports 20 staff members across 5 departments and 3 shift types (Morning 07:00–15:00, Afternoon 15:00–23:00, Night 23:00–07:00) and automatically calculates hours worked, late arrivals, early departures, and break durations.

The live clock at the top of the screen reflects actual time, and attendance statuses (Active, On Break, Late, Early Out, Completed, Absent) update in real time. The Dashboard shows department-level coverage and a recent activity feed, while the AI Insights tab analyzes the day's attendance patterns and surfaces actionable workforce recommendations.`,
  howTo: [
    {
      step: "1",
      title: "Clock In a Staff Member",
      detail: "In the Clock In / Out tab, select a staff member from the Browse list, use the Search bar to find them by name or role, or switch to PIN mode for self-service entry (each staff member has a unique 4-digit PIN). Once selected, their scheduled shift appears alongside the current time. Click 'Clock In' to record their entry.",
    },
    {
      step: "2",
      title: "Track Breaks and Clock Out",
      detail: "After a staff member is clocked in, the action panel shows 'Start Break' and 'Clock Out.' Click 'Start Break' to begin a break timer; click 'End Break' to return them to active status. Clock Out records the exact departure time and calculates total hours worked minus break time.",
    },
    {
      step: "3",
      title: "Review the Attendance Log",
      detail: "The Attendance Log tab shows all records for a selected date. Filter by department, status, or date range. Each row shows clock-in and clock-out times, number of breaks, hours worked, and status badge. This is your audit trail — use it to verify timekeeping accuracy or investigate discrepancies.",
    },
    {
      step: "4",
      title: "Monitor the Dashboard",
      detail: "The Dashboard tab shows live KPI cards (hover to flip for definitions): Total Staff, Clocked In, On Break, Late Today, Absent, and Completed. Department coverage bars show the percentage of each department currently on the floor. The Recent Activity feed shows the last 10 clock events in reverse chronological order.",
    },
    {
      step: "5",
      title: "Run AI Insights",
      detail: "In the AI Insights tab, click 'Run Analysis.' Claude reviews today's attendance data and returns an overall attendance score, specific concerns (e.g., a department below coverage threshold), positive trends, and actionable recommendations for supervisors. Results are session-only — re-run at any time for updated analysis.",
    },
  ],
};

// ── Guide Modal ───────────────────────────────────────────────────────────────
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
          background:C.white, borderRadius:14, width:"100%",
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
              <strong style={{color:C.ink}}>Tip:</strong> Attendance records are automatically saved to this browser as you clock staff in and out. Data persists across sessions — no manual save required.
            </p>
          </div>
          <div style={{borderTop:`1px solid ${C.border}`, margin:"1.4rem 0 1.1rem"}}/>
          <div style={{padding:"0.9rem 1rem", background: confirmClear ? C.dangerLt : "#fafaf8", borderRadius:8, border:`1px solid ${confirmClear ? C.danger : C.border}`, transition:"all 0.2s"}}>
            <p style={{margin:"0 0 6px", fontSize:12, fontWeight:600, color: confirmClear ? C.danger : C.ink}}>
              {confirmClear ? "⚠️ Are you sure? This cannot be undone." : "Reset Tool Data"}
            </p>
            <p style={{margin:"0 0 10px", fontSize:11, color:C.muted, lineHeight:1.5}}>
              Clears all saved attendance records and restores the original demo data. Use this to reset for a new client or a clean demo.
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

// ── PIN Pad ───────────────────────────────────────────────────────────────────
function PinPad({ staff, onSelect }) {
  const [pin, setPin]   = useState("");
  const [err, setErr]   = useState(false);
  const add = d => {
    if(pin.length>=4) return;
    const np=pin+d;
    setPin(np);
    if(np.length===4){
      const found=staff.find(s=>s.pin===np);
      if(found){ setPin(""); onSelect(found); }
      else { setErr(true); setTimeout(()=>{ setPin(""); setErr(false); },700); }
    }
  };
  const clear = ()=>{ setPin(""); setErr(false); };
  const btnSt = (bg=C.white) => ({height:52,borderRadius:10,border:`0.5px solid ${C.border}`,background:bg,fontSize:20,fontWeight:500,color:C.ink,cursor:"pointer",fontFamily:FONTS.sans});
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:18}}>
      <div style={{display:"flex",gap:12}}>
        {[0,1,2,3].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:i<pin.length?(err?"#ef4444":C.forest):C.creamDk,border:`2px solid ${i<pin.length?(err?"#ef4444":C.forest):C.border}`,transition:"background 0.15s"}}/>)}
      </div>
      {err&&<p style={{fontSize:12,color:"#dc2626",margin:"-8px 0",fontFamily:FONTS.sans}}>PIN not found</p>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,width:190}}>
        {[1,2,3,4,5,6,7,8,9].map(d=><button key={d} onClick={()=>add(String(d))} style={btnSt()}>{d}</button>)}
        <button onClick={clear} style={{...btnSt(C.creamDk),fontSize:13,fontWeight:600,color:C.muted}}>C</button>
        <button onClick={()=>add("0")} style={btnSt()}>0</button>
        <div/>
      </div>
      <p style={{fontSize:11,color:C.muted,margin:0,fontFamily:FONTS.sans}}>Enter your 4-digit PIN</p>
    </div>
  );
}

// ── Action Panel ──────────────────────────────────────────────────────────────
function ActionPanel({ staff, record, now, settings, onAction, onClose }) {
  const sm=SHIFT_META[staff.shift];
  const curTime=padHHMM(now);
  const lateDiff=diffMin(sm.start,curTime);
  const wouldBeLate=!record?.clockIn&&lateDiff>settings.lateThreshold;
  const isOnBreak=record?.breaks?.some(b=>b.start&&!b.end);
  const isClockedIn=record?.clockIn&&!record?.clockOut;
  const status=getStatus(record,staff,settings.lateThreshold,settings.earlyThreshold);

  return (
    <div style={{background:C.white,borderRadius:12,border:`1.5px solid ${C.sage}`,padding:"1.25rem"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:44,height:44,borderRadius:"50%",background:DEPT_CLR[staff.dept]||C.sage,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,flexShrink:0}}>
            {initials(staff.name)}
          </div>
          <div>
            <p style={{fontSize:15,fontWeight:500,color:C.ink,margin:"0 0 2px"}}>{staff.name}</p>
            <p style={{fontSize:11,color:C.muted,margin:0}}>{staff.role} · {staff.site}</p>
          </div>
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:C.muted,padding:0}}>✕</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <div style={{background:C.creamDk,borderRadius:8,padding:"8px 12px"}}>
          <p style={{fontSize:10,color:C.muted,margin:"0 0 3px",fontWeight:600,letterSpacing:0.5}}>SCHEDULED</p>
          <p style={{fontSize:13,fontWeight:500,color:C.ink,margin:"0 0 4px"}}>{sm.start} – {sm.end}</p>
          <span style={{fontSize:10,padding:"1px 6px",borderRadius:4,background:sm.bg,color:sm.text,fontWeight:600}}>{staff.shift}</span>
        </div>
        <div style={{background:C.creamDk,borderRadius:8,padding:"8px 12px"}}>
          <p style={{fontSize:10,color:C.muted,margin:"0 0 3px",fontWeight:600,letterSpacing:0.5}}>NOW</p>
          <p style={{fontSize:13,fontWeight:500,color:C.ink,margin:"0 0 4px"}}>{curTime}</p>
          {wouldBeLate&&<span style={{fontSize:10,padding:"1px 6px",borderRadius:4,background:"#fed7aa",color:"#7c2d12",fontWeight:600}}>⚠ Late +{lateDiff}m</span>}
          {record?.clockIn&&<StBadge s={status}/>}
        </div>
      </div>
      {record?.clockIn&&(
        <div style={{display:"flex",gap:10,fontSize:11,color:C.muted,marginBottom:12,flexWrap:"wrap"}}>
          <span>In: <strong style={{color:C.ink}}>{record.clockIn}</strong></span>
          {record.clockOut&&<span>Out: <strong style={{color:C.ink}}>{record.clockOut}</strong></span>}
          {record.breaks.filter(b=>b.start&&b.end).length>0&&<span>Breaks: <strong style={{color:C.ink}}>{record.breaks.filter(b=>b.start&&b.end).length}</strong></span>}
          {hoursWorked(record)!=null&&<span>Hours: <strong style={{color:C.ink}}>{fmtHrs(hoursWorked(record))}</strong></span>}
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {!record?.clockIn&&(
          <button onClick={()=>onAction("clockIn")} style={{padding:"13px",borderRadius:9,background:C.forest,color:C.cream,border:"none",cursor:"pointer",fontFamily:FONTS.sans,fontWeight:600,fontSize:14}}>
            Clock In {wouldBeLate?"⚠":"✓"}
          </button>
        )}
        {isClockedIn&&!isOnBreak&&(
          <>
            <button onClick={()=>onAction("startBreak")} style={{padding:"10px",borderRadius:9,background:"#fef08a",color:"#713f12",border:"0.5px solid #ca8a04",cursor:"pointer",fontFamily:FONTS.sans,fontWeight:600,fontSize:13}}>
              Start Break
            </button>
            <button onClick={()=>onAction("clockOut")} style={{padding:"13px",borderRadius:9,background:"#dc2626",color:"#fff",border:"none",cursor:"pointer",fontFamily:FONTS.sans,fontWeight:600,fontSize:14}}>
              Clock Out
            </button>
          </>
        )}
        {isClockedIn&&isOnBreak&&(
          <button onClick={()=>onAction("endBreak")} style={{padding:"13px",borderRadius:9,background:"#ca8a04",color:"#fff",border:"none",cursor:"pointer",fontFamily:FONTS.sans,fontWeight:600,fontSize:14}}>
            End Break ↩
          </button>
        )}
        {record?.clockOut&&(
          <div style={{padding:"12px",borderRadius:9,background:"#dbeafe",border:"0.5px solid #93c5fd",textAlign:"center"}}>
            <p style={{fontSize:13,color:"#1e40af",margin:0,fontWeight:500}}>✓ Shift Complete</p>
            <p style={{fontSize:11,color:"#1e40af",margin:"3px 0 0"}}>Hours worked: {fmtHrs(hoursWorked(record))}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function StaffAttendance() {
  const [staff]               = useState(STAFF_SEED);

  // ── Load records from localStorage, fall back to SEED ──
  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : buildSeedRecords();
    } catch { return buildSeedRecords(); }
  });

  const [now, setNow]             = useState(new Date());
  const [activeTab, setActiveTab] = useState("clockin");
  const [method, setMethod]       = useState("browse");
  const [selected, setSelected]   = useState(null);
  const [search, setSearch]       = useState("");
  const [logDate, setLogDate]     = useState(todayStr);
  const [deptFilter, setDeptFilter] = useState("All");
  const [stFilter, setStFilter]   = useState("All");
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings]   = useState({lateThreshold:15, earlyThreshold:15});
  const [aiReport, setAiReport]   = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError]     = useState(null);
  const [showGuide, setShowGuide] = useState(false); // ← Guide modal state
  const nextId = useRef(100);

  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),1000); return()=>clearInterval(t); },[]);

  // ── Persist records to localStorage whenever they change ──
  const saveRecords = rs => {
    setRecords(rs);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rs)); } catch {}
  };

  // ── Clear all data: wipe localStorage, restore SEED ──
  const handleClearData = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    const seed = buildSeedRecords();
    setRecords(seed);
    nextId.current = seed.length + 100;
    setSelected(null);
    setAiReport(null);
  };

  const getRec = (staffId, date=todayStr()) => records.find(r=>r.staffId===staffId&&r.date===date);

  const handleAction = action => {
    if(!selected) return;
    const t=todayStr(), cur=padHHMM(now);
    const existing=getRec(selected.id, t);
    let updated;
    if(action==="clockIn") {
      const rec={id:nextId.current++,staffId:selected.id,date:t,clockIn:cur,clockOut:null,breaks:[],notes:""};
      updated=existing?records.map(r=>r.staffId===selected.id&&r.date===t?{...r,clockIn:cur}:r):[...records,rec];
    } else if(action==="clockOut") {
      updated=records.map(r=>r.staffId===selected.id&&r.date===t?{...r,clockOut:cur}:r);
    } else if(action==="startBreak") {
      updated=records.map(r=>r.staffId===selected.id&&r.date===t?{...r,breaks:[...r.breaks,{start:cur,end:null}]}:r);
    } else if(action==="endBreak") {
      updated=records.map(r=>r.staffId===selected.id&&r.date===t?{...r,breaks:r.breaks.map(b=>b.start&&!b.end?{...b,end:cur}:b)}:r);
    }
    if(updated){saveRecords(updated);}
    setSelected(null);
  };

  const filteredStaff = useMemo(()=>staff.filter(s=>
    s.name.toLowerCase().includes(search.toLowerCase())||s.role.toLowerCase().includes(search.toLowerCase())
  ),[staff,search]);

  const logRecords = useMemo(()=>records
    .filter(r=>r.date===logDate)
    .map(r=>({...r,staff:staff.find(m=>m.id===r.staffId)}))
    .filter(r=>r.staff&&(deptFilter==="All"||r.staff.dept===deptFilter))
    .map(r=>({...r,status:getStatus(r,r.staff,settings.lateThreshold,settings.earlyThreshold),hours:hoursWorked(r)}))
    .filter(r=>stFilter==="All"||r.status===stFilter)
    .sort((a,b)=>a.staff.name.localeCompare(b.staff.name))
  ,[records,logDate,staff,deptFilter,stFilter,settings]);

  const dash = useMemo(()=>{
    const t=todayStr();
    const todayRecs=records.filter(r=>r.date===t);
    const getR=id=>todayRecs.find(r=>r.staffId===id);
    const active   = staff.filter(s=>{ const r=getR(s.id); return r?.clockIn&&!r?.clockOut&&!r?.breaks?.some(b=>b.start&&!b.end); });
    const onBreak  = staff.filter(s=>{ const r=getR(s.id); return r?.breaks?.some(b=>b.start&&!b.end); });
    const completed= staff.filter(s=>{ const r=getR(s.id); return r?.clockIn&&r?.clockOut; });
    const lateArr  = staff.filter(s=>{ const r=getR(s.id); const st=getStatus(r,s,settings.lateThreshold,settings.earlyThreshold); return st==="Late"; });
    const nowMin   = now.getHours()*60+now.getMinutes();
    const absent   = staff.filter(s=>{ const r=getR(s.id); const sm=SHIFT_META[s.shift]; return !r?.clockIn&&nowMin>(toMin(sm.start)+settings.lateThreshold); });
    const byDept=["Clinical","Administrative","IT","Executive","HR"].map(d=>{
      const ds=staff.filter(s=>s.dept===d);
      const din=ds.filter(s=>{ const r=getR(s.id); return r?.clockIn&&!r?.clockOut; });
      return {dept:d,total:ds.length,in:din.length,pct:ds.length?Math.round((din.length/ds.length)*100):0};
    });
    const recent=[...todayRecs].map(r=>{
      const s=staff.find(m=>m.id===r.staffId);
      const evs=[];
      if(r.clockIn) evs.push({time:r.clockIn,type:"Clock In",name:s?.name||"?",dept:s?.dept});
      r.breaks.forEach(b=>{
        if(b.start) evs.push({time:b.start,type:"Break Start",name:s?.name||"?",dept:s?.dept});
        if(b.end)   evs.push({time:b.end,  type:"Break End",  name:s?.name||"?",dept:s?.dept});
      });
      if(r.clockOut) evs.push({time:r.clockOut,type:"Clock Out",name:s?.name||"?",dept:s?.dept});
      return evs;
    }).flat().sort((a,b)=>b.time.localeCompare(a.time)).slice(0,10);
    return {active:active.length,onBreak:onBreak.length,completed:completed.length,late:lateArr.length,absent:absent.length,byDept,recent};
  },[records,staff,now,settings]);

  const handleAI=async()=>{
    setAiLoading(true);setAiReport(null);setAiError(null);
    const t=todayStr();
    const todayDetail=records.filter(r=>r.date===t).map(r=>{
      const s=staff.find(m=>m.id===r.staffId);
      const st=getStatus(r,s,settings.lateThreshold,settings.earlyThreshold);
      return `${s?.name}(${s?.dept}): ${st}, in=${r.clockIn||"—"}, out=${r.clockOut||"—"}, breaks=${r.breaks.filter(b=>b.start&&b.end).length}`;
    }).join("\n");
    const deptSummary=dash.byDept.map(d=>`${d.dept}:${d.in}/${d.total}(${d.pct}%)`).join(", ");
    try{
      const r=await callAI(
        `Healthcare staff attendance — today:\nTotal staff:${staff.length}|Active:${dash.active}|On Break:${dash.onBreak}|Late:${dash.late}|Absent:${dash.absent}|Completed:${dash.completed}\nDept coverage:${deptSummary}\nRecords:\n${todayDetail}\n\nAnalyze attendance patterns. Max 3 items per array, 20 words max each.\nReturn ONLY JSON:{"attendance_score":0-100,"summary":"2 sentences","concerns":["concern"],"positive_trends":["trend"],"recommendations":["action"],"department_alerts":["dept: issue"]}`,
        "You are a healthcare workforce analyst. Be specific. Return only valid JSON, no markdown."
      );
      setAiReport({...r,generatedAt:nowStr()});
    }catch(e){setAiError(`Analysis failed: ${e.message}`);}
    setAiLoading(false);
  };

  const scoreColor=p=>p>=80?"#15803d":p>=60?"#92400e":"#9f1239";
  const scoreBg   =p=>p>=80?"#dcfce7":p>=60?"#fef3c7":"#fecaca";
  const curDate   =now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});

  return (
    <div style={{fontFamily:FONTS.sans,background:C.cream,minHeight:400,color:C.ink}}>

      {/* ── Guide Modal ── */}
      {showGuide && (
        <GuideModal
          onClose={() => setShowGuide(false)}
          onClearData={handleClearData}
        />
      )}

      {/* Header with live clock */}
      <div style={{background:C.forest,padding:"0.9rem 1.5rem",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <div>
          <h2 style={{fontFamily:FONTS.serif,fontSize:20,fontWeight:400,color:C.cream,margin:"0 0 2px"}}>Staff Attendance</h2>
          <p style={{fontSize:11,color:C.sageLt,margin:0}}>Clock In · Clock Out · Break Tracking · Allied Healthcare</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          {/* ── Guide button ── */}
          <button
            onClick={() => setShowGuide(true)}
            style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:8,background:"rgba(255,255,255,0.12)",color:C.cream,border:"1px solid rgba(255,255,255,0.2)",cursor:"pointer",fontSize:11,fontWeight:600,letterSpacing:0.4,flexShrink:0}}
            onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.2)"}
            onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.12)"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            Guide
          </button>
          {/* Live clock */}
          <div style={{textAlign:"right"}}>
            <p style={{fontSize:20,fontWeight:700,color:C.cream,margin:"0 0 2px",fontFamily:"monospace,monospace"}}>{padHHMMSS(now)}</p>
            <p style={{fontSize:10,color:"rgba(244,240,230,0.6)",margin:0}}>{curDate}</p>
          </div>
        </div>
      </div>
      <div style={{height:3,background:`linear-gradient(90deg,${C.sage},${C.cream})`}}/>

      {/* Tab bar */}
      <div style={{background:C.cream,borderBottom:`0.5px solid ${C.border}`,padding:"8px 1.5rem",display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
        {[["clockin","Clock In / Out"],["log","Attendance Log"],["dashboard","Dashboard"],["ai","✦ AI Insights"]].map(([t,label])=>(
          <button key={t} onClick={()=>setActiveTab(t)}
            style={{fontSize:13,padding:"5px 14px",borderRadius:7,border:"none",cursor:"pointer",fontWeight:500,
              background:activeTab===t?(t==="ai"?C.sage:C.forest):C.creamDk,color:activeTab===t?C.cream:C.muted}}>
            {label}
          </button>
        ))}
        <button onClick={()=>setShowSettings(s=>!s)}
          style={{marginLeft:"auto",fontSize:12,padding:"5px 12px",borderRadius:7,border:`0.5px solid ${C.border}`,background:showSettings?C.forest:C.creamDk,color:showSettings?C.cream:C.muted,cursor:"pointer"}}>
          ⚙ Settings
        </button>
      </div>

      {/* Settings panel */}
      {showSettings&&(
        <div style={{background:C.white,borderBottom:`0.5px solid ${C.border}`,padding:"0.9rem 1.5rem",display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:12,fontWeight:500,color:C.muted}}>Clock-in Method</span>
            {[["browse","Browse"],["search","Search"],["pin","PIN"]].map(([m,l])=>(
              <button key={m} onClick={()=>setMethod(m)}
                style={{fontSize:11,padding:"4px 11px",borderRadius:6,border:`0.5px solid ${C.border}`,cursor:"pointer",background:method===m?C.forest:C.creamDk,color:method===m?C.cream:C.muted,fontWeight:method===m?500:400}}>
                {l}
              </button>
            ))}
          </div>
          {[["Late after","lateThreshold"],["Early out","earlyThreshold"]].map(([label,key])=>(
            <div key={key} style={{display:"flex",alignItems:"center",gap:7}}>
              <span style={{fontSize:12,fontWeight:500,color:C.muted}}>{label}</span>
              <select value={settings[key]} onChange={e=>setSettings(s=>({...s,[key]:Number(e.target.value)}))}
                style={{fontSize:12,padding:"4px 8px",borderRadius:6,border:`0.5px solid ${C.border}`,background:C.creamDk,color:C.ink}}>
                {[5,10,15,20,30].map(n=><option key={n} value={n}>{n} min</option>)}
              </select>
            </div>
          ))}
        </div>
      )}

      <div style={{padding:"1rem 1.5rem"}}>

        {/* ── CLOCK IN / OUT ── */}
        {activeTab==="clockin"&&(
          <div style={{display:"flex",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>
            <div style={{flex:"1 1 260px"}}>
              <div style={{display:"flex",gap:6,marginBottom:12}}>
                {[["browse","Browse"],["search","Search"],["pin","PIN"]].map(([m,l])=>(
                  <button key={m} onClick={()=>{setMethod(m);setSelected(null);setSearch("");}}
                    style={{flex:1,fontSize:12,padding:"6px",borderRadius:7,border:`0.5px solid ${C.border}`,cursor:"pointer",fontWeight:500,background:method===m?C.forest:C.creamDk,color:method===m?C.cream:C.muted}}>
                    {l}
                  </button>
                ))}
              </div>
              {method==="search"&&(
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or role…" autoFocus
                  style={{width:"100%",boxSizing:"border-box",fontSize:13,padding:"8px 12px",borderRadius:8,border:`0.5px solid ${C.border}`,background:C.white,color:C.ink,outline:"none",marginBottom:10,fontFamily:FONTS.sans}}/>
              )}
              {method==="pin"&&(
                <div style={{display:"flex",justifyContent:"center",padding:"1rem 0"}}>
                  <PinPad staff={staff} onSelect={s=>{setSelected(s);setMethod("browse");}}/>
                </div>
              )}
              {method!=="pin"&&(
                <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:440,overflowY:"auto"}}>
                  {(method==="browse"?staff:filteredStaff).length===0&&<p style={{fontSize:13,color:C.muted}}>No staff found.</p>}
                  {(method==="browse"?staff:filteredStaff).map(s=>{
                    const rec=getRec(s.id);
                    const st=getStatus(rec,s,settings.lateThreshold,settings.earlyThreshold);
                    const m=ST_META[st]||ST_META["Not In"];
                    const isSel=selected?.id===s.id;
                    return (
                      <div key={s.id} onClick={()=>setSelected(isSel?null:s)}
                        style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:9,background:isSel?C.sagePl:C.white,border:`0.5px solid ${isSel?C.sage:C.border}`,cursor:"pointer",userSelect:"none"}}>
                        <div style={{width:32,height:32,borderRadius:"50%",background:DEPT_CLR[s.dept]||C.sage,color:"#fff",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          {initials(s.name)}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{fontSize:13,fontWeight:500,color:C.ink,margin:"0 0 2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</p>
                          <p style={{fontSize:10,color:C.muted,margin:0}}>{s.role} · {s.shift}</p>
                        </div>
                        <div style={{width:10,height:10,borderRadius:"50%",background:m.dot,flexShrink:0}}/>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div style={{flex:"1 1 260px"}}>
              {selected?(
                <ActionPanel staff={selected} record={getRec(selected.id)} now={now} settings={settings} onAction={handleAction} onClose={()=>setSelected(null)}/>
              ):(
                <div style={{background:C.white,borderRadius:12,border:`0.5px solid ${C.border}`,padding:"2rem",textAlign:"center"}}>
                  <p style={{fontSize:36,margin:"0 0 12px"}}>🕐</p>
                  <p style={{fontSize:14,fontWeight:500,color:C.ink,margin:"0 0 8px"}}>Select a Staff Member</p>
                  <p style={{fontSize:12,color:C.muted,margin:0}}>Browse the roster, search by name, or enter a PIN to clock in or out.</p>
                </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:14}}>
                {[{label:"Clocked In",val:dash.active,color:"#15803d",bg:"#dcfce7"},{label:"On Break",val:dash.onBreak,color:"#713f12",bg:"#fef08a"},{label:"Late",val:dash.late,color:"#7c2d12",bg:"#fed7aa"}].map(k=>(
                  <div key={k.label} style={{background:k.bg,borderRadius:8,padding:"8px",textAlign:"center"}}>
                    <p style={{fontSize:20,fontWeight:700,color:k.color,margin:"0 0 2px"}}>{k.val}</p>
                    <p style={{fontSize:10,color:k.color,margin:0,opacity:0.8}}>{k.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ATTENDANCE LOG ── */}
        {activeTab==="log"&&(
          <>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
              <input type="date" value={logDate} onChange={e=>setLogDate(e.target.value)}
                style={{fontSize:12,padding:"5px 8px",borderRadius:6,border:`0.5px solid ${C.border}`,background:C.white,color:C.ink,outline:"none"}}/>
              {[["Dept",["Clinical","Administrative","IT","Executive","HR"],deptFilter,setDeptFilter],
                ["Status",["Active","On Break","Late","On Time","Early Out","Completed","Absent"],stFilter,setStFilter]].map(([label,opts,val,set])=>(
                <div key={label} style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:11,fontWeight:500,color:C.muted}}>{label}</span>
                  <select value={val} onChange={e=>set(e.target.value)} style={{fontSize:12,padding:"5px 8px",borderRadius:6,border:`0.5px solid ${C.border}`,background:C.white,color:C.ink}}>
                    <option value="All">All</option>
                    {opts.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <span style={{fontSize:12,color:C.muted,marginLeft:"auto"}}>{logRecords.length} records</span>
            </div>
            {logRecords.length===0?(
              <div style={{background:C.white,borderRadius:10,border:`0.5px solid ${C.border}`,padding:"2rem",textAlign:"center"}}>
                <p style={{fontSize:13,color:C.muted,margin:0}}>No attendance records for {logDate}.</p>
              </div>
            ):(
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,background:C.white,borderRadius:10,overflow:"hidden",border:`0.5px solid ${C.border}`}}>
                  <thead>
                    <tr style={{background:C.forest}}>
                      {["Name","Dept","Shift","Clock In","Clock Out","Breaks","Hours","Status"].map(h=>(
                        <th key={h} style={{padding:"8px 10px",textAlign:"left",color:h==="Name"?C.cream:C.sageLt,fontWeight:h==="Name"?500:400,fontSize:h==="Name"?11:10,whiteSpace:"nowrap"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logRecords.map((rec,i)=>{
                      const sm=SHIFT_META[rec.staff?.shift]||{};
                      return (
                        <tr key={rec.id} style={{borderBottom:`0.5px solid ${C.border}`,background:i%2===0?C.white:"rgba(244,240,230,0.4)"}}>
                          <td style={{padding:"8px 10px",fontWeight:500,color:C.ink,whiteSpace:"nowrap"}}>
                            <div style={{display:"flex",alignItems:"center",gap:7}}>
                              <div style={{width:22,height:22,borderRadius:"50%",background:DEPT_CLR[rec.staff?.dept]||C.sage,color:"#fff",fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{initials(rec.staff?.name||"?")}</div>
                              {rec.staff?.name}
                            </div>
                          </td>
                          <td style={{padding:"8px 8px"}}><span style={{fontSize:10,fontWeight:600,padding:"1px 6px",borderRadius:4,background:DEPT_BG[rec.staff?.dept],color:DEPT_TEXT[rec.staff?.dept]}}>{rec.staff?.dept?.slice(0,5)}</span></td>
                          <td style={{padding:"8px 8px"}}><span style={{fontSize:10,padding:"1px 6px",borderRadius:4,background:sm.bg,color:sm.text}}>{rec.staff?.shift}</span></td>
                          <td style={{padding:"8px 8px",color:C.ink,fontFamily:"monospace,monospace"}}>{rec.clockIn||"—"}</td>
                          <td style={{padding:"8px 8px",color:C.ink,fontFamily:"monospace,monospace"}}>{rec.clockOut||"—"}</td>
                          <td style={{padding:"8px 8px",textAlign:"center",color:C.muted}}>{rec.breaks.filter(b=>b.start&&b.end).length||"—"}</td>
                          <td style={{padding:"8px 8px",fontWeight:600,color:rec.hours!=null?"#1e40af":C.muted}}>{fmtHrs(rec.hours)}</td>
                          <td style={{padding:"8px 8px"}}><StBadge s={rec.status}/></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── DASHBOARD ── */}
        {activeTab==="dashboard"&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <style>{`.akpi{perspective:600px;cursor:pointer}.akpi-inner{position:relative;width:100%;height:86px;transform-style:preserve-3d;transition:transform 0.55s cubic-bezier(.4,0,.2,1)}.akpi:hover .akpi-inner{transform:rotateY(180deg)}.akpi-f,.akpi-b{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px;text-align:center}.akpi-b{transform:rotateY(180deg)}`}</style>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))",gap:10}}>
              {[
                {label:"Total Staff", val:staff.length,    color:C.ink,    bg:C.white,   backBg:"#ece8dc", desc:"All registered staff members in the system."},
                {label:"Clocked In",  val:dash.active,     color:"#15803d",bg:"#dcfce7", backBg:"#86efac", desc:"Staff currently on the floor and actively working."},
                {label:"On Break",    val:dash.onBreak,    color:"#713f12",bg:"#fef08a", backBg:"#fde047", desc:"Staff on an active break who haven't returned yet."},
                {label:"Late Today",  val:dash.late,       color:"#7c2d12",bg:"#fed7aa", backBg:"#fb923c", desc:"Staff who clocked in past the late threshold."},
                {label:"Absent",      val:dash.absent,     color:"#7f1d1d",bg:"#fecaca", backBg:"#f87171", desc:"Expected staff who have not clocked in yet today."},
                {label:"Completed",   val:dash.completed,  color:"#1e40af",bg:C.sagePl,  backBg:"#93c5fd", desc:"Staff who fully completed their shift today."},
              ].map(k=>(
                <div key={k.label} className="akpi">
                  <div className="akpi-inner">
                    <div className="akpi-f" style={{background:k.bg,border:`0.5px solid ${C.border}`}}>
                      <p style={{fontSize:22,fontWeight:700,color:k.color,margin:"0 0 4px",lineHeight:1}}>{k.val}</p>
                      <p style={{fontSize:10,color:C.muted,margin:0,lineHeight:1.3}}>{k.label}</p>
                    </div>
                    <div className="akpi-b" style={{background:k.backBg,border:`0.5px solid ${C.border}`}}>
                      <p style={{fontSize:11,color:k.color,margin:0,lineHeight:1.5,fontWeight:500}}>{k.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:C.white,border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
              <p style={{fontSize:11,fontWeight:600,color:C.muted,letterSpacing:0.8,margin:"0 0 14px"}}>COVERAGE BY DEPARTMENT</p>
              {dash.byDept.filter(d=>d.total>0).map(d=>(
                <div key={d.dept} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <span style={{fontSize:11,fontWeight:600,padding:"1px 8px",borderRadius:5,background:DEPT_BG[d.dept],color:DEPT_TEXT[d.dept]}}>{d.dept}</span>
                      <span style={{fontSize:11,color:C.muted}}>{d.in}/{d.total} in</span>
                    </div>
                    <span style={{fontSize:13,fontWeight:700,color:d.pct>=80?"#15803d":d.pct>=50?"#92400e":"#9f1239"}}>{d.pct}%</span>
                  </div>
                  <div style={{height:7,background:C.creamDk,borderRadius:10,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${d.pct}%`,background:DEPT_CLR[d.dept]||C.sage,borderRadius:10}}/>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:C.white,border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
              <p style={{fontSize:11,fontWeight:600,color:C.muted,letterSpacing:0.8,margin:"0 0 14px"}}>RECENT ACTIVITY</p>
              {dash.recent.length===0?(
                <p style={{fontSize:13,color:C.muted,margin:0}}>No activity recorded today yet.</p>
              ):(
                <div style={{display:"flex",flexDirection:"column"}}>
                  {dash.recent.map((ev,i)=>{
                    const clr=ev.type==="Clock In"?"#16a34a":ev.type==="Clock Out"?"#dc2626":"#ca8a04";
                    return (
                      <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"7px 0",borderBottom:i<dash.recent.length-1?`0.5px solid ${C.border}`:"none"}}>
                        <span style={{fontSize:11,fontFamily:"monospace,monospace",color:C.muted,width:40,flexShrink:0}}>{ev.time}</span>
                        <div style={{width:8,height:8,borderRadius:"50%",background:clr,flexShrink:0}}/>
                        <span style={{fontSize:12,color:C.ink,flex:1}}><strong>{ev.name}</strong> · {ev.type}</span>
                        <span style={{fontSize:10,padding:"1px 6px",borderRadius:4,background:DEPT_BG[ev.dept],color:DEPT_TEXT[ev.dept],fontWeight:600,flexShrink:0}}>{ev.dept?.slice(0,5)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── AI INSIGHTS ── */}
        {activeTab==="ai"&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{background:C.white,border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                <div>
                  <p style={{fontSize:14,fontWeight:500,color:C.ink,margin:"0 0 5px"}}>✦ AI Attendance Insights</p>
                  <p style={{fontSize:12,color:C.muted,margin:0,lineHeight:1.6,maxWidth:460}}>Analyzes today's attendance patterns — identifying coverage gaps, flagging concerns, and generating actionable workforce recommendations.</p>
                </div>
                <button onClick={handleAI} disabled={aiLoading}
                  style={{fontSize:13,fontWeight:500,padding:"8px 20px",borderRadius:7,background:aiLoading?C.creamDk:C.sage,color:aiLoading?C.muted:"#fff",border:"none",cursor:aiLoading?"not-allowed":"pointer",flexShrink:0,whiteSpace:"nowrap"}}>
                  {aiLoading?"Analyzing…":"Run Analysis"}
                </button>
              </div>
            </div>
            {aiLoading&&(
              <div style={{background:C.white,border:`0.5px solid ${C.border}`,borderRadius:10,padding:"2rem",textAlign:"center"}}>
                <div style={{width:36,height:36,border:`3px solid ${C.sagePl}`,borderTopColor:C.sage,borderRadius:"50%",margin:"0 auto 14px",animation:"spin 0.8s linear infinite"}}/>
                <p style={{fontSize:13,color:C.muted,margin:0}}>Analyzing attendance for {staff.length} staff members…</p>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            )}
            {aiError&&<div style={{background:"#fecaca",border:"0.5px solid #ef4444",borderRadius:10,padding:"1rem"}}><p style={{fontSize:13,color:"#7f1d1d",margin:0}}>{aiError}</p></div>}
            {aiReport&&!aiLoading&&(
              <>
                <div style={{background:C.white,border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
                  <div style={{display:"flex",alignItems:"center",gap:16}}>
                    <div style={{width:64,height:64,borderRadius:"50%",background:scoreBg(aiReport.attendance_score),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <span style={{fontSize:18,fontWeight:700,color:scoreColor(aiReport.attendance_score)}}>{aiReport.attendance_score}</span>
                    </div>
                    <div>
                      <p style={{fontSize:13,fontWeight:500,color:C.ink,margin:"0 0 4px"}}>Attendance Score · {aiReport.generatedAt}</p>
                      <p style={{fontSize:13,color:C.muted,margin:0,lineHeight:1.6}}>{aiReport.summary}</p>
                    </div>
                  </div>
                </div>
                {[
                  {title:"RECOMMENDATIONS",    items:aiReport.recommendations,    bg:C.white, border:`1.5px solid ${C.sage}`, tc:C.sage,   lc:C.ink},
                  {title:"CONCERNS",           items:aiReport.concerns,            bg:"#fecaca",border:"0.5px solid #ef4444",  tc:"#7f1d1d",lc:"#991b1b"},
                  {title:"DEPARTMENT ALERTS",  items:aiReport.department_alerts,   bg:"#fed7aa",border:"0.5px solid #f97316",  tc:"#7c2d12",lc:"#9a3412"},
                  {title:"POSITIVE TRENDS",    items:aiReport.positive_trends,     bg:"#dcfce7",border:"0.5px solid #86efac",  tc:"#15803d",lc:"#065f46"},
                ].map(sec=>sec.items?.length?(
                  <div key={sec.title} style={{background:sec.bg,border:sec.border,borderRadius:10,padding:"1.25rem"}}>
                    <p style={{fontSize:11,fontWeight:600,color:sec.tc,letterSpacing:0.8,margin:"0 0 10px"}}>{sec.title}</p>
                    <ul style={{margin:0,paddingLeft:16}}>
                      {sec.items.map((item,i)=><li key={i} style={{fontSize:13,color:sec.lc,marginBottom:5,lineHeight:1.5}}>{item}</li>)}
                    </ul>
                  </div>
                ):null)}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}