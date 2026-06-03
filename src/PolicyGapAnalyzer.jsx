import { useState, useMemo, useEffect } from "react";

const FONTS = { sans:"system-ui,-apple-system,'Segoe UI',Arial,sans-serif", serif:"Georgia,'Times New Roman',serif" };

const C = {
  cream:"#f4f0e6", creamDk:"#e8e2d4", forest:"#1b2d1b",
  sage:"#3b82f6", sageLt:"#93c5fd", sagePl:"#dbeafe",
  ink:"#1a1a14", muted:"#6b6b5e", border:"rgba(26,26,20,0.1)",
  danger:"#dc2626", dangerLt:"#fecaca",
};

const FRAMEWORKS = ["HIPAA","NIST CSF","ISO 27001","SOC 2","HITRUST"];
const CATEGORIES = ["Access Control","Data Privacy","Incident Response","Business Continuity","Workforce Security","Information Security","System Security","Physical Security","Audit & Accountability","Risk Management","Third-Party Risk"];
const STATUSES   = ["Exists","Partial","Under Review","Missing"];

const STATUS_META = {
  "Exists":       { bg:"#dcfce7", border:"#86efac", text:"#15803d", dot:"#16a34a", score:1.00 },
  "Under Review": { bg:"#dbeafe", border:"#93c5fd", text:"#1e40af", dot:"#3b82f6", score:0.75 },
  "Partial":      { bg:"#fef08a", border:"#ca8a04", text:"#713f12", dot:"#ca8a04", score:0.50 },
  "Missing":      { bg:"#fecaca", border:"#ef4444", text:"#7f1d1d", dot:"#dc2626", score:0.00 },
};

const FW_COLOR = { "HIPAA":"#ffe4e6","NIST CSF":"#dbeafe","ISO 27001":"#d1fae5","SOC 2":"#fef3c7","HITRUST":"#ede9fe" };
const FW_TEXT  = { "HIPAA":"#9f1239","NIST CSF":"#1e40af","ISO 27001":"#065f46","SOC 2":"#92400e","HITRUST":"#5b21b6" };
const CAT_COLOR = { "Access Control":"#dbeafe","Data Privacy":"#ffe4e6","Incident Response":"#fecaca","Business Continuity":"#fef3c7","Workforce Security":"#d1fae5","Information Security":"#ede9fe","System Security":"#fce7f3","Physical Security":"#e8e2d4","Audit & Accountability":"#fef08a","Risk Management":"#fed7aa","Third-Party Risk":"#f0fdf4" };
const CAT_TEXT  = { "Access Control":"#1e40af","Data Privacy":"#9f1239","Incident Response":"#7f1d1d","Business Continuity":"#92400e","Workforce Security":"#065f46","Information Security":"#5b21b6","System Security":"#9d174d","Physical Security":"#6b6b5e","Audit & Accountability":"#713f12","Risk Management":"#7c2d12","Third-Party Risk":"#14532d" };

// localStorage key — unique per tool
const STORAGE_KEY = "rocklin_policyGapAnalyzer_policies";

const today  = new Date().toISOString().split("T")[0];
const nowStr = () => new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"});
let nextId = 21;

const SEED = [
  { id:1,  name:"Information Security Policy",        category:"Information Security",   frameworks:["HIPAA","NIST CSF","ISO 27001","SOC 2","HITRUST"], status:"Exists",       owner:"CISO",           lastReviewed:"2024-11-15", description:"Master policy governing the organization's overall approach to information security." },
  { id:2,  name:"Access Control Policy",              category:"Access Control",         frameworks:["HIPAA","NIST CSF","ISO 27001","SOC 2","HITRUST"], status:"Exists",       owner:"IT Security",    lastReviewed:"2024-10-20", description:"Defines rules for granting, managing, and revoking access to systems and data." },
  { id:3,  name:"Data Classification Policy",         category:"Data Privacy",           frameworks:["HIPAA","NIST CSF","ISO 27001","HITRUST"],          status:"Partial",      owner:"Privacy Officer",lastReviewed:"2024-08-01", description:"Establishes categories for data sensitivity and required handling procedures." },
  { id:4,  name:"Incident Response Policy",           category:"Incident Response",      frameworks:["HIPAA","NIST CSF","ISO 27001","SOC 2","HITRUST"],  status:"Partial",      owner:"Security Team",  lastReviewed:"2024-09-15", description:"Defines procedures for detecting, responding to, and recovering from security incidents." },
  { id:5,  name:"Business Continuity Plan",           category:"Business Continuity",    frameworks:["NIST CSF","ISO 27001","SOC 2","HITRUST"],           status:"Missing",      owner:"Operations",     lastReviewed:"",           description:"Ensures critical operations can continue during and after a disruptive event." },
  { id:6,  name:"Vendor Management Policy",           category:"Third-Party Risk",       frameworks:["HIPAA","NIST CSF","ISO 27001","HITRUST"],           status:"Missing",      owner:"Procurement",    lastReviewed:"",           description:"Governs selection, onboarding, and ongoing monitoring of third-party vendors and business associates." },
  { id:7,  name:"HIPAA Privacy Policy",               category:"Data Privacy",           frameworks:["HIPAA","HITRUST"],                                  status:"Exists",       owner:"Privacy Officer",lastReviewed:"2024-12-01", description:"Governs the use and disclosure of Protected Health Information (PHI)." },
  { id:8,  name:"HIPAA Security Policy",              category:"Information Security",   frameworks:["HIPAA","HITRUST"],                                  status:"Exists",       owner:"CISO",           lastReviewed:"2024-12-01", description:"Addresses administrative, physical, and technical safeguards for ePHI." },
  { id:9,  name:"Acceptable Use Policy",              category:"Workforce Security",     frameworks:["NIST CSF","ISO 27001","SOC 2","HITRUST"],           status:"Exists",       owner:"HR",             lastReviewed:"2024-07-10", description:"Defines acceptable use of organizational IT resources by employees and contractors." },
  { id:10, name:"Password & Authentication Policy",   category:"Access Control",         frameworks:["HIPAA","NIST CSF","ISO 27001","SOC 2","HITRUST"],  status:"Exists",       owner:"IT Security",    lastReviewed:"2024-11-01", description:"Establishes requirements for password complexity, MFA, and authentication standards." },
  { id:11, name:"Encryption Policy",                  category:"Data Privacy",           frameworks:["HIPAA","NIST CSF","ISO 27001","HITRUST"],           status:"Partial",      owner:"IT Security",    lastReviewed:"2024-06-15", description:"Mandates encryption standards for data at rest and in transit." },
  { id:12, name:"Audit Logging & Monitoring Policy",  category:"Audit & Accountability", frameworks:["HIPAA","NIST CSF","ISO 27001","SOC 2","HITRUST"],  status:"Missing",      owner:"IT Security",    lastReviewed:"",           description:"Defines requirements for audit log collection, retention, and review." },
  { id:13, name:"Physical Security Policy",           category:"Physical Security",      frameworks:["HIPAA","ISO 27001","HITRUST"],                      status:"Partial",      owner:"Facilities",     lastReviewed:"2024-05-20", description:"Controls physical access to facilities, equipment, and sensitive areas." },
  { id:14, name:"Remote Work & BYOD Policy",          category:"Workforce Security",     frameworks:["NIST CSF","ISO 27001","SOC 2","HITRUST"],           status:"Under Review", owner:"IT Security",    lastReviewed:"2024-10-01", description:"Governs secure remote access and use of personal devices for work purposes." },
  { id:15, name:"Data Retention & Disposal Policy",   category:"Data Privacy",           frameworks:["HIPAA","NIST CSF","ISO 27001","SOC 2","HITRUST"],  status:"Missing",      owner:"Privacy Officer",lastReviewed:"",           description:"Defines how long data must be retained and procedures for secure disposal." },
  { id:16, name:"Patch Management Policy",            category:"System Security",        frameworks:["NIST CSF","ISO 27001","SOC 2","HITRUST"],           status:"Partial",      owner:"IT Operations",  lastReviewed:"2024-09-01", description:"Establishes timelines and procedures for applying security patches and updates." },
  { id:17, name:"Change Management Policy",           category:"System Security",        frameworks:["NIST CSF","ISO 27001","SOC 2","HITRUST"],           status:"Missing",      owner:"IT Operations",  lastReviewed:"",           description:"Controls changes to IT systems to prevent unauthorized or disruptive modifications." },
  { id:18, name:"Security Awareness Training Policy", category:"Workforce Security",     frameworks:["HIPAA","NIST CSF","ISO 27001","HITRUST"],           status:"Exists",       owner:"HR",             lastReviewed:"2024-11-15", description:"Mandates security and privacy training for all workforce members." },
  { id:19, name:"Risk Assessment Policy",             category:"Risk Management",        frameworks:["HIPAA","NIST CSF","ISO 27001","HITRUST"],           status:"Partial",      owner:"CISO",           lastReviewed:"2024-08-30", description:"Defines the process for identifying, analyzing, and treating information security risks." },
  { id:20, name:"Disaster Recovery Policy",           category:"Business Continuity",    frameworks:["HIPAA","NIST CSF","ISO 27001","SOC 2","HITRUST"],  status:"Missing",      owner:"IT Operations",  lastReviewed:"",           description:"Defines procedures to recover IT systems and data following a major disruption." },
];

const scoreOf    = p => STATUS_META[p.status]?.score ?? 0;
const covPct     = policies => policies.length ? Math.round((policies.reduce((s,p)=>s+scoreOf(p),0)/policies.length)*100) : 100;
const scoreColor = s => s>=80?"#15803d":s>=50?"#92400e":"#9f1239";
const scoreBg    = s => s>=80?"#dcfce7":s>=50?"#fef3c7":"#fecaca";

async function callAI(prompt, system) {
  const res = await fetch("/.netlify/functions/ai-proxy",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:1500,
      system:system||"You are a senior healthcare GRC policy analyst. Return only valid JSON, no markdown.",
      messages:[{role:"user",content:prompt}]})
  });
  if(!res.ok){const e=await res.json().catch(()=>{});throw new Error(e?.error?.message||`HTTP ${res.status}`);}
  const data=await res.json();
  const raw=(data.content?.[0]?.text||"").trim().replace(/^```[a-z]*\n?/i,"").replace(/```$/,"").trim();
  const s=raw.indexOf("{"),e=raw.lastIndexOf("}");
  if(s===-1||e===-1)throw new Error("No JSON in response");
  return JSON.parse(raw.slice(s,e+1));
}

const StBadge = ({s}) => { const m=STATUS_META[s]; return <span style={{fontSize:11,fontWeight:600,padding:"2px 10px",borderRadius:20,background:m.bg,color:m.text,border:`0.5px solid ${m.border}`,whiteSpace:"nowrap"}}>{s}</span>; };
const FwPill  = ({fw}) => <span style={{fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:5,background:FW_COLOR[fw]||C.creamDk,color:FW_TEXT[fw]||C.muted,whiteSpace:"nowrap"}}>{fw}</span>;
const CatPill = ({cat}) => <span style={{fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:5,background:CAT_COLOR[cat]||C.creamDk,color:CAT_TEXT[cat]||C.muted,whiteSpace:"nowrap"}}>{cat}</span>;
const PctBar  = ({p,color}) => <div style={{height:7,background:C.creamDk,borderRadius:10,overflow:"hidden"}}><div style={{height:"100%",width:`${p}%`,background:color,borderRadius:10,transition:"width 0.4s"}}/></div>;

// ─── Guide content ────────────────────────────────────────────────────────────
const GUIDE = {
  title: "Policy Gap Analyzer",
  whatIsIt: `The Policy Gap Analyzer is a healthcare GRC tool for managing your organization's complete policy inventory and identifying coverage gaps across five major compliance frameworks: HIPAA, NIST CSF, ISO 27001, SOC 2, and HITRUST.

Think of it as your policy audit binder — every policy your organization should have is tracked here with its current status (Exists, Partial, Under Review, or Missing), the frameworks that require it, the policy owner, and the last review date. The Gap Analysis tab gives you a scored view of coverage by framework and category, and the AI Analysis tab sends your full inventory to Claude for a prioritized gap report with critical findings, quick wins, and a phased remediation roadmap.`,
  howTo: [
    {
      step: "1",
      title: "Review Your Policy Registry",
      detail: "The Policy Registry tab shows all 20 pre-loaded policies. Each card displays the policy name, category, status, owner, last review date, and applicable frameworks. Use the Framework, Status, and Category filters to focus your view — for example, all HIPAA policies that are Missing.",
    },
    {
      step: "2",
      title: "Update Policy Status",
      detail: "Use the status dropdown on each policy card to reflect current state: Exists (fully documented and current), Partial (incomplete or outdated), Under Review (in revision), or Missing (not yet created). The coverage score in Gap Analysis updates in real time.",
    },
    {
      step: "3",
      title: "Add or Edit Policies",
      detail: "Click '+ Add Policy' to create a new entry. Provide the name, description, category, status, owner, and last review date. Select applicable frameworks manually or use '✦ AI Suggest' to have Claude recommend which frameworks require the policy and explain why.",
    },
    {
      step: "4",
      title: "Review the Gap Analysis",
      detail: "The Gap Analysis tab shows KPI cards (hover to flip), framework coverage bars with missing/partial counts, category coverage bars, and a highlighted list of all Missing policies. Use this view before an audit or executive review to understand your current policy posture at a glance.",
    },
    {
      step: "5",
      title: "Run AI Analysis",
      detail: "In the AI Analysis tab, click 'Run Analysis.' Claude reviews your entire policy inventory and returns an overall compliance score, critical gaps, quick wins completable in 30 days, framework-by-framework risk scores, and a phased remediation roadmap. Use the results to build your policy remediation project plan.",
    },
  ],
};

// ─── Guide Modal ──────────────────────────────────────────────────────────────
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
        {/* Header */}
        <div style={{background:C.forest, borderRadius:"14px 14px 0 0", padding:"1.1rem 1.4rem", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div>
            <p style={{margin:0, fontSize:11, fontWeight:600, color:C.sageLt, letterSpacing:1, textTransform:"uppercase"}}>Tool Guide</p>
            <h2 style={{margin:"3px 0 0", fontSize:17, fontWeight:700, color:C.cream}}>{GUIDE.title}</h2>
          </div>
          <button onClick={onClose}
            style={{background:"rgba(255,255,255,0.12)", border:"none", cursor:"pointer", color:C.cream, fontSize:18, borderRadius:8, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1, flexShrink:0}}>✕</button>
        </div>

        {/* Body */}
        <div style={{padding:"1.4rem"}}>

          {/* What Is It For */}
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

          {/* How To Use It */}
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

          {/* Tip */}
          <div style={{marginTop:"1.4rem", padding:"0.75rem 1rem", background:C.creamDk, borderRadius:8, borderLeft:`3px solid ${C.sageLt}`}}>
            <p style={{margin:0, fontSize:11, color:C.muted, lineHeight:1.6}}>
              <strong style={{color:C.ink}}>Tip:</strong> Your policy inventory is automatically saved to this browser. The AI Analysis results are session-only — run a fresh analysis each session or copy key findings before closing.
            </p>
          </div>

          <div style={{borderTop:`1px solid ${C.border}`, margin:"1.4rem 0 1.1rem"}}/>

          {/* Clear All Data */}
          <div style={{padding:"0.9rem 1rem", background: confirmClear ? C.dangerLt : "#fafaf8", borderRadius:8, border:`1px solid ${confirmClear ? C.danger : C.border}`, transition:"all 0.2s"}}>
            <p style={{margin:"0 0 6px", fontSize:12, fontWeight:600, color: confirmClear ? C.danger : C.ink}}>
              {confirmClear ? "⚠️ Are you sure? This cannot be undone." : "Reset Tool Data"}
            </p>
            <p style={{margin:"0 0 10px", fontSize:11, color:C.muted, lineHeight:1.5}}>
              Clears all saved policies and restores the original 20 demo policies. Use this to reset for a new client or a clean demo.
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PolicyGapAnalyzer() {

  // ── State: load policies from localStorage, fall back to SEED ──
  const [policies, setPolicies] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : SEED;
    } catch { return SEED; }
  });

  const [activeTab,   setActiveTab]   = useState("registry");
  const [fwFilter,    setFwFilter]    = useState("All");
  const [stFilter,    setStFilter]    = useState("All");
  const [catFilter,   setCatFilter]   = useState("All");
  const [modal,       setModal]       = useState(null);
  const [aiReport,    setAiReport]    = useState(null);
  const [aiLoading,   setAiLoading]   = useState(false);
  const [aiError,     setAiError]     = useState(null);
  const [aiSuggest,   setAiSuggest]   = useState(null);
  const [suggestLoad, setSuggestLoad] = useState(false);
  const [showGuide,   setShowGuide]   = useState(false);

  const blank = {name:"",category:CATEGORIES[0],frameworks:[],status:STATUSES[0],owner:"",lastReviewed:today,description:""};
  const [form, setForm] = useState(blank);

  // ── Persist policies to localStorage whenever they change ──
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(policies)); } catch {}
  }, [policies]);

  // ── Clear all data: wipe localStorage, restore SEED ──
  const handleClearData = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setPolicies(SEED);
    setAiReport(null);
    setModal(null);
  };

  const setF     = k => v => setForm(f=>({...f,[k]:v}));
  const toggleFW = fw => setF("frameworks")(form.frameworks.includes(fw)?form.frameworks.filter(f=>f!==fw):[...form.frameworks,fw]);

  const openAdd  = () => { setForm(blank); setAiSuggest(null); setModal("add"); };
  const openEdit = p  => { setForm({name:p.name,category:p.category,frameworks:[...p.frameworks],status:p.status,owner:p.owner,lastReviewed:p.lastReviewed,description:p.description}); setAiSuggest(null); setModal(p); };
  const closeModal = () => { setModal(null); setAiSuggest(null); };

  const savePolicy = () => {
    if(!form.name.trim()||form.frameworks.length===0) return;
    if(modal==="add") setPolicies(ps=>[...ps,{...form,id:nextId++}]);
    else setPolicies(ps=>ps.map(p=>p.id===modal.id?{...p,...form}:p));
    closeModal();
  };
  const deletePolicy = id => { setPolicies(ps=>ps.filter(p=>p.id!==id)); closeModal(); };

  const handleSuggest = async () => {
    if(!form.name.trim()) return;
    setSuggestLoad(true); setAiSuggest(null);
    try {
      const r = await callAI(
        `Healthcare policy: "${form.name}" | Category: ${form.category}\nDescription: "${form.description}"\nWhich frameworks require or recommend this policy: HIPAA, NIST CSF, ISO 27001, SOC 2, HITRUST?\nReturn ONLY JSON: {"frameworks":["..."],"rationale":{"FRAMEWORK":"one sentence why"}}`,
        "You are a healthcare GRC policy analyst. Return only valid JSON, no markdown."
      );
      setAiSuggest(r);
    } catch(e){ setAiSuggest({error:"Suggestion failed. Please try again."}); }
    setSuggestLoad(false);
  };
  const applySuggest = () => { if(aiSuggest?.frameworks) setF("frameworks")(aiSuggest.frameworks); setAiSuggest(null); };

  const handleAI = async () => {
    setAiLoading(true); setAiReport(null); setAiError(null);
    const summary = policies.map(p=>`${p.name}|${p.category}|${p.frameworks.join("/")}|${p.status}`).join("\n");
    const fwCov   = FRAMEWORKS.map(fw=>{ const fps=policies.filter(p=>p.frameworks.includes(fw)); return `${fw}:${covPct(fps)}%(${fps.filter(p=>p.status==="Missing").length} missing)`; }).join(",");
    try {
      const r = await callAI(
        `Healthcare organization policy inventory (name|category|frameworks|status):\n${summary}\n\nFramework coverage: ${fwCov}\n\nAnalyze policy gaps and provide remediation guidance. Max 4 items per array, max 20 words each.\nReturn ONLY JSON:\n{"overall_score":0-100,"summary":"2 sentences","critical_gaps":["policy: reason"],"priority_actions":["action"],"framework_risks":[{"framework":"name","score":0-100,"top_gap":"missing policy name"}],"quick_wins":["action completable in 30 days"],"remediation_roadmap":"2-3 sentence phased approach"}`,
        "You are a senior healthcare GRC policy analyst. Be specific and actionable. Return only valid JSON, no markdown."
      );
      setAiReport({...r,generatedAt:nowStr()});
    } catch(e){ setAiError(`Analysis failed: ${e.message}`); }
    setAiLoading(false);
  };

  const filtered = useMemo(()=>policies.filter(p=>
    (fwFilter==="All"||p.frameworks.includes(fwFilter))&&
    (stFilter==="All"||p.status===stFilter)&&
    (catFilter==="All"||p.category===catFilter)
  ),[policies,fwFilter,stFilter,catFilter]);

  const stats = useMemo(()=>{
    const overall = covPct(policies);
    const bySt    = Object.fromEntries(STATUSES.map(s=>[s,policies.filter(p=>p.status===s).length]));
    const byFW    = FRAMEWORKS.map(fw=>{ const fps=policies.filter(p=>p.frameworks.includes(fw)); return {fw,total:fps.length,pct:covPct(fps),missing:fps.filter(p=>p.status==="Missing").length,partial:fps.filter(p=>p.status==="Partial").length}; });
    const byCat   = CATEGORIES.map(cat=>{ const cps=policies.filter(p=>p.category===cat); return {cat,total:cps.length,pct:covPct(cps),missing:cps.filter(p=>p.status==="Missing").length}; }).filter(c=>c.total>0);
    return {overall,bySt,byFW,byCat,total:policies.length};
  },[policies]);

  const inputStyle={width:"100%",boxSizing:"border-box",fontSize:13,padding:"7px 10px",borderRadius:6,border:`0.5px solid ${C.border}`,background:C.creamDk,color:C.ink,fontFamily:FONTS.sans,outline:"none"};

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
          <h2 style={{fontFamily:FONTS.serif,fontSize:22,fontWeight:400,color:C.cream,margin:"0 0 4px"}}>Policy Gap Analyzer</h2>
          <p style={{fontSize:12,color:C.sageLt,margin:0}}>HIPAA · NIST CSF · ISO 27001 · SOC 2 · HITRUST · Allied Healthcare</p>
        </div>
        {/* ── Guide button in header ── */}
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
          {[["registry","Policy Registry"],["gap","Gap Analysis"],["ai","✦ AI Analysis"]].map(([t,label])=>(
            <button key={t} onClick={()=>setActiveTab(t)}
              style={{fontSize:13,padding:"6px 18px",borderRadius:7,border:"none",cursor:"pointer",fontWeight:500,
                background:activeTab===t?(t==="ai"?C.sage:C.forest):C.creamDk,color:activeTab===t?C.cream:C.muted}}>
              {label}
            </button>
          ))}
          <button onClick={openAdd} style={{marginLeft:"auto",fontSize:13,fontWeight:500,padding:"6px 16px",borderRadius:7,background:C.sage,color:"#fff",border:"none",cursor:"pointer"}}>
            + Add Policy
          </button>
        </div>

        {/* POLICY REGISTRY */}
        {activeTab==="registry" && (
          <>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
              {[["Framework",FRAMEWORKS,fwFilter,setFwFilter],["Status",STATUSES,stFilter,setStFilter],["Category",CATEGORIES,catFilter,setCatFilter]].map(([label,opts,val,set])=>(
                <div key={label} style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:11,fontWeight:500,color:C.muted}}>{label}</span>
                  <select value={val} onChange={e=>set(e.target.value)} style={{fontSize:12,padding:"5px 8px",borderRadius:6,border:`0.5px solid ${C.border}`,background:"#fff",color:C.ink}}>
                    <option value="All">All</option>
                    {opts.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <span style={{fontSize:12,color:C.muted,marginLeft:"auto"}}>{filtered.length} of {policies.length}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {filtered.length===0&&<p style={{fontSize:13,color:C.muted}}>No policies match current filters.</p>}
              {filtered.map(p=>{ const m=STATUS_META[p.status]; return (
                <div key={p.id} style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"12px 14px",display:"flex",gap:14,alignItems:"flex-start"}}>
                  <div style={{width:4,flexShrink:0,alignSelf:"stretch",borderRadius:4,background:m.dot}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,flexWrap:"wrap",marginBottom:5}}>
                      <div>
                        <span style={{fontSize:13,fontWeight:500,color:C.ink,display:"block",marginBottom:4}}>{p.name}</span>
                        <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                          <CatPill cat={p.category}/>
                          <StBadge s={p.status}/>
                          {p.owner&&<span style={{fontSize:11,color:C.muted}}>· {p.owner}</span>}
                          {p.lastReviewed&&<span style={{fontSize:11,color:C.muted}}>· Reviewed {p.lastReviewed}</span>}
                        </div>
                      </div>
                    </div>
                    <p style={{fontSize:12,color:C.muted,margin:"0 0 8px",lineHeight:1.5}}>{p.description}</p>
                    <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                      {p.frameworks.map(fw=><FwPill key={fw} fw={fw}/>)}
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:5,flexShrink:0}}>
                    <select value={p.status} onChange={e=>setPolicies(ps=>ps.map(pol=>pol.id===p.id?{...pol,status:e.target.value}:pol))}
                      style={{fontSize:11,padding:"4px 6px",borderRadius:5,border:`0.5px solid ${m.border}`,background:m.bg,color:m.text,cursor:"pointer"}}>
                      {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={()=>openEdit(p)} style={{fontSize:11,padding:"3px 8px",borderRadius:5,border:`0.5px solid ${C.border}`,background:"none",cursor:"pointer",color:C.muted}}>✎ Edit</button>
                  </div>
                </div>
              );})}
            </div>
          </>
        )}

        {/* GAP ANALYSIS */}
        {activeTab==="gap" && (
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <style>{`.gpkpi{perspective:600px;cursor:pointer}.gpkpi-inner{position:relative;width:100%;height:86px;transform-style:preserve-3d;transition:transform 0.55s cubic-bezier(.4,0,.2,1)}.gpkpi:hover .gpkpi-inner{transform:rotateY(180deg)}.gpkpi-f,.gpkpi-b{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px;text-align:center}.gpkpi-b{transform:rotateY(180deg)}`}</style>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:10}}>
              {[
                {label:"Total Policies", val:stats.total,                  color:C.ink,    bg:"#fff",    backBg:"#ece8dc", desc:"All policies in the registry across every framework and category."},
                {label:"Coverage Score", val:`${stats.overall}%`,          color:scoreColor(stats.overall),bg:scoreBg(stats.overall),backBg:stats.overall>=80?"#86efac":stats.overall>=50?"#fde047":"#f87171",desc:"Weighted coverage score across all policies and frameworks."},
                {label:"Exists",         val:stats.bySt["Exists"],         color:"#15803d",bg:"#dcfce7", backBg:"#86efac", desc:"Policies that are documented, current, and fully implemented."},
                {label:"Partial",        val:stats.bySt["Partial"],        color:"#713f12",bg:"#fef08a", backBg:"#fde047", desc:"Policies that exist but are incomplete or require updating."},
                {label:"Missing",        val:stats.bySt["Missing"],        color:"#7f1d1d",bg:"#fecaca", backBg:"#f87171", desc:"Required policies that have not yet been documented or created."},
              ].map(k=>(
                <div key={k.label} className="gpkpi">
                  <div className="gpkpi-inner">
                    <div className="gpkpi-f" style={{background:k.bg,border:`0.5px solid ${C.border}`}}>
                      <p style={{fontSize:22,fontWeight:700,color:k.color,margin:"0 0 4px",lineHeight:1}}>{k.val}</p>
                      <p style={{fontSize:10,color:C.muted,margin:0,lineHeight:1.3}}>{k.label}</p>
                    </div>
                    <div className="gpkpi-b" style={{background:k.backBg,border:`0.5px solid ${C.border}`}}>
                      <p style={{fontSize:11,color:k.color,margin:0,lineHeight:1.5,fontWeight:500}}>{k.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
              <p style={{fontSize:11,fontWeight:600,color:C.muted,letterSpacing:0.8,margin:"0 0 14px"}}>COVERAGE BY FRAMEWORK</p>
              {stats.byFW.map(({fw,total,pct,missing,partial})=>(
                <div key={fw} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <FwPill fw={fw}/>
                      <span style={{fontSize:11,color:C.muted}}>{total} policies</span>
                      {missing>0&&<span style={{fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:10,background:"#fecaca",color:"#7f1d1d"}}>⚠ {missing} missing</span>}
                      {partial>0&&<span style={{fontSize:10,fontWeight:600,padding:"1px 6px",borderRadius:10,background:"#fef08a",color:"#713f12"}}>{partial} partial</span>}
                    </div>
                    <span style={{fontSize:13,fontWeight:700,color:scoreColor(pct)}}>{pct}%</span>
                  </div>
                  <PctBar p={pct} color={scoreColor(pct)==="#15803d"?"#16a34a":scoreColor(pct)==="#92400e"?"#ca8a04":"#dc2626"}/>
                </div>
              ))}
            </div>

            <div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
              <p style={{fontSize:11,fontWeight:600,color:C.muted,letterSpacing:0.8,margin:"0 0 14px"}}>COVERAGE BY CATEGORY</p>
              {stats.byCat.map(({cat,total,pct,missing})=>(
                <div key={cat} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <CatPill cat={cat}/>
                      {missing>0&&<span style={{fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:10,background:"#fecaca",color:"#7f1d1d"}}>⚠ {missing}</span>}
                    </div>
                    <span style={{fontSize:12,color:C.muted}}>{total} · <strong style={{color:scoreColor(pct)}}>{pct}%</strong></span>
                  </div>
                  <PctBar p={pct} color={CAT_TEXT[cat]||C.sage}/>
                </div>
              ))}
            </div>

            {stats.bySt["Missing"]>0&&(
              <div style={{background:"#fff",border:"1.5px solid #ef4444",borderRadius:10,padding:"1.25rem"}}>
                <p style={{fontSize:11,fontWeight:600,color:"#7f1d1d",letterSpacing:0.8,margin:"0 0 12px"}}>⚠ MISSING POLICIES — IMMEDIATE ATTENTION REQUIRED</p>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {policies.filter(p=>p.status==="Missing").map(p=>(
                    <div key={p.id} style={{padding:"9px 12px",background:"#fef2f2",border:"0.5px solid #fecaca",borderRadius:8,display:"flex",alignItems:"flex-start",gap:10}}>
                      <div style={{flex:1}}>
                        <p style={{fontSize:13,fontWeight:500,color:"#7f1d1d",margin:"0 0 4px"}}>{p.name}</p>
                        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                          <CatPill cat={p.category}/>
                          {p.frameworks.map(fw=><FwPill key={fw} fw={fw}/>)}
                        </div>
                      </div>
                      {p.owner&&<span style={{fontSize:11,color:"#991b1b",flexShrink:0}}>Owner: {p.owner}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI ANALYSIS */}
        {activeTab==="ai" && (
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                <div>
                  <p style={{fontSize:14,fontWeight:500,color:C.ink,margin:"0 0 5px"}}>✦ AI Policy Gap Analysis</p>
                  <p style={{fontSize:12,color:C.muted,margin:0,lineHeight:1.6,maxWidth:460}}>
                    Analyzes your full policy inventory against HIPAA, NIST CSF, ISO 27001, SOC 2, and HITRUST — identifying critical gaps, quick wins, and a phased remediation roadmap.
                  </p>
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
                <p style={{fontSize:13,color:C.muted,margin:0}}>Analyzing {policies.length} policies across 5 frameworks…</p>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            )}

            {aiError&&<div style={{background:"#fecaca",border:"0.5px solid #ef4444",borderRadius:10,padding:"1rem"}}><p style={{fontSize:13,color:"#7f1d1d",margin:0}}>{aiError}</p></div>}

            {aiReport&&!aiLoading&&(
              <>
                <div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
                  <div style={{display:"flex",alignItems:"center",gap:16}}>
                    <div style={{width:64,height:64,borderRadius:"50%",background:scoreBg(aiReport.overall_score),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <span style={{fontSize:18,fontWeight:700,color:scoreColor(aiReport.overall_score)}}>{aiReport.overall_score}</span>
                    </div>
                    <div>
                      <p style={{fontSize:13,fontWeight:500,color:C.ink,margin:"0 0 4px"}}>Overall Policy Compliance Score · {aiReport.generatedAt}</p>
                      <p style={{fontSize:13,color:C.muted,margin:0,lineHeight:1.6}}>{aiReport.summary}</p>
                    </div>
                  </div>
                </div>

                {aiReport.priority_actions?.length>0&&(
                  <div style={{background:"#fff",border:`1.5px solid ${C.sage}`,borderRadius:10,padding:"1.25rem"}}>
                    <p style={{fontSize:11,fontWeight:600,color:C.sage,letterSpacing:0.8,margin:"0 0 12px"}}>PRIORITY ACTIONS</p>
                    <ol style={{margin:0,paddingLeft:18}}>
                      {aiReport.priority_actions.map((a,i)=><li key={i} style={{fontSize:13,color:C.ink,marginBottom:7,lineHeight:1.5}}>{a}</li>)}
                    </ol>
                  </div>
                )}

                {[
                  {title:"CRITICAL GAPS", items:aiReport.critical_gaps, bg:"#fecaca",tc:"#7f1d1d",lc:"#991b1b"},
                  {title:"QUICK WINS",    items:aiReport.quick_wins,    bg:"#dcfce7",tc:"#15803d",lc:"#065f46"},
                ].map(sec=>sec.items?.length?(
                  <div key={sec.title} style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
                    <p style={{fontSize:11,fontWeight:600,color:sec.tc,letterSpacing:0.8,margin:"0 0 10px"}}>{sec.title}</p>
                    <ul style={{margin:0,paddingLeft:16}}>
                      {sec.items.map((item,i)=><li key={i} style={{fontSize:13,color:sec.lc,marginBottom:5,lineHeight:1.5}}>{item}</li>)}
                    </ul>
                  </div>
                ):null)}

                {aiReport.framework_risks?.length>0&&(
                  <div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
                    <p style={{fontSize:11,fontWeight:600,color:C.muted,letterSpacing:0.8,margin:"0 0 12px"}}>FRAMEWORK RISK BREAKDOWN</p>
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      {aiReport.framework_risks.map(fr=>(
                        <div key={fr.framework} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 12px",background:scoreBg(fr.score),border:`0.5px solid ${scoreColor(fr.score)==="#15803d"?"#86efac":scoreColor(fr.score)==="#92400e"?"#ca8a04":"#ef4444"}`,borderRadius:8}}>
                          <FwPill fw={fr.framework}/>
                          <div style={{flex:1}}>
                            <span style={{fontSize:12,color:C.muted}}>Top gap: <strong style={{color:C.ink}}>{fr.top_gap}</strong></span>
                          </div>
                          <span style={{fontSize:14,fontWeight:700,color:scoreColor(fr.score),flexShrink:0}}>{fr.score}/100</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {aiReport.remediation_roadmap&&(
                  <div style={{background:"#d1fae5",border:"0.5px solid #6ee7b7",borderRadius:10,padding:"1.25rem"}}>
                    <p style={{fontSize:11,fontWeight:600,color:"#065f46",letterSpacing:0.8,margin:"0 0 8px"}}>REMEDIATION ROADMAP</p>
                    <p style={{fontSize:13,color:"#065f46",margin:0,lineHeight:1.6}}>{aiReport.remediation_roadmap}</p>
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
          <div style={{background:C.cream,borderRadius:12,border:`0.5px solid ${C.border}`,padding:"1.5rem",width:"100%",maxWidth:500,maxHeight:"92vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <p style={{margin:0,fontWeight:500,fontSize:16,color:C.ink}}>{modal==="add"?"Add Policy":"Edit Policy"}</p>
              <button onClick={closeModal} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:C.muted,padding:0}}>✕</button>
            </div>

            <label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Policy Name *</label>
            <input value={form.name} onChange={e=>setF("name")(e.target.value)} placeholder="e.g. Data Retention Policy" style={{...inputStyle,marginBottom:12}}/>

            <label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Description</label>
            <textarea value={form.description} onChange={e=>setF("description")(e.target.value)} rows={2} placeholder="Describe the policy objective…" style={{...inputStyle,resize:"vertical",lineHeight:1.5,marginBottom:12}}/>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div><label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Category</label><select value={form.category} onChange={e=>setF("category")(e.target.value)} style={inputStyle}>{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
              <div><label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Status</label><select value={form.status} onChange={e=>setF("status")(e.target.value)} style={inputStyle}>{STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
              <div><label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Policy Owner</label><input value={form.owner} onChange={e=>setF("owner")(e.target.value)} placeholder="e.g. CISO" style={inputStyle}/></div>
              <div><label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Last Reviewed</label><input type="date" value={form.lastReviewed} onChange={e=>setF("lastReviewed")(e.target.value)} style={inputStyle}/></div>
            </div>

            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <label style={{fontSize:12,fontWeight:500,color:C.muted}}>Frameworks * (select all that apply)</label>
              <button onClick={handleSuggest} disabled={!form.name.trim()||suggestLoad}
                style={{fontSize:11,padding:"3px 10px",borderRadius:6,border:`1px solid ${C.sage}`,background:C.sagePl,color:C.sage,cursor:form.name.trim()?"pointer":"not-allowed",fontWeight:500,opacity:form.name.trim()?1:0.5}}>
                {suggestLoad?"Thinking…":"✦ AI Suggest"}
              </button>
            </div>

            {aiSuggest&&!aiSuggest.error&&(
              <div style={{background:C.sagePl,border:`1px solid ${C.sageLt}`,borderRadius:8,padding:"10px 12px",marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                  <span style={{fontSize:11,fontWeight:600,color:C.sage}}>AI RECOMMENDATION</span>
                  <button onClick={applySuggest} style={{fontSize:11,padding:"3px 10px",borderRadius:5,background:C.sage,color:"#fff",border:"none",cursor:"pointer",fontWeight:500}}>Apply All</button>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:7}}>{aiSuggest.frameworks?.map(fw=><FwPill key={fw} fw={fw}/>)}</div>
                {aiSuggest.rationale&&<div style={{display:"flex",flexDirection:"column",gap:3}}>{Object.entries(aiSuggest.rationale).map(([fw,r])=><p key={fw} style={{fontSize:11,color:"#1e40af",margin:0,lineHeight:1.4}}><strong>{fw}:</strong> {r}</p>)}</div>}
              </div>
            )}
            {aiSuggest?.error&&<div style={{background:"#fecaca",borderRadius:7,padding:"8px 12px",marginBottom:10}}><p style={{fontSize:12,color:"#7f1d1d",margin:0}}>{aiSuggest.error}</p></div>}

            <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:18}}>
              {FRAMEWORKS.map(fw=>{ const sel=form.frameworks.includes(fw); return (
                <button key={fw} onClick={()=>toggleFW(fw)}
                  style={{fontSize:12,padding:"4px 12px",borderRadius:6,cursor:"pointer",background:sel?FW_COLOR[fw]:C.creamDk,color:sel?FW_TEXT[fw]:C.muted,border:`1.5px solid ${sel?(FW_TEXT[fw]||C.sage):C.border}`,fontWeight:sel?600:400}}>
                  {fw}
                </button>
              );})}
            </div>

            <div style={{display:"flex",gap:8,justifyContent:"space-between"}}>
              {modal!=="add"&&<button onClick={()=>deletePolicy(modal.id)} style={{fontSize:12,padding:"7px 14px",borderRadius:7,border:"0.5px solid #fca5a5",background:"none",color:"#dc2626",cursor:"pointer"}}>Delete</button>}
              <div style={{display:"flex",gap:8,marginLeft:"auto"}}>
                <button onClick={closeModal} style={{fontSize:12,padding:"7px 14px",borderRadius:7}}>Cancel</button>
                <button onClick={savePolicy} disabled={!form.name.trim()||form.frameworks.length===0}
                  style={{fontSize:12,fontWeight:500,padding:"7px 18px",borderRadius:7,background:form.name.trim()&&form.frameworks.length>0?C.forest:C.creamDk,color:form.name.trim()&&form.frameworks.length>0?C.cream:C.muted,border:"none",cursor:form.name.trim()&&form.frameworks.length>0?"pointer":"not-allowed",opacity:form.name.trim()&&form.frameworks.length>0?1:0.45}}>
                  {modal==="add"?"Add Policy":"Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}