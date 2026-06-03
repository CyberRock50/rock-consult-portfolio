import { useState, useMemo, useEffect } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  ink:      "#1a1a14",
  muted:    "#6b6b5e",
  white:    "#ffffff",
  cream:    "#e8e2d4",
  border:   "rgba(26,26,20,0.2)",
  borderLt: "rgba(26,26,20,0.1)",
  font:     "system-ui,-apple-system,'Segoe UI',Arial,sans-serif",
  green:    "#1b2d1b",
  greenLt:  "#2d4a2d",
  blue:     "#93c5fd",
  danger:   "#dc2626",
  dangerLt: "#fecaca",
};

// ─── Static data ──────────────────────────────────────────────────────────────
const LIKELIHOOD = ["Rare","Unlikely","Possible","Likely","Almost Certain"];
const IMPACT     = ["Negligible","Minor","Moderate","Major","Catastrophic"];
const CATEGORIES = ["Patient Safety","Medication","Infection Control","Staffing","Equipment","Documentation","Compliance","Financial"];

const SEVERITY = [
  { label:"Critical", min:15, bg:"#fecaca", border:"#ef4444", text:"#7f1d1d", badge:"#dc2626" },
  { label:"High",     min:10, bg:"#fed7aa", border:"#f97316", text:"#7c2d12", badge:"#ea580c" },
  { label:"Medium",   min: 5, bg:"#fef08a", border:"#ca8a04", text:"#713f12", badge:"#ca8a04" },
  { label:"Low",      min: 1, bg:"#bbf7d0", border:"#22c55e", text:"#14532d", badge:"#16a34a" },
];

const getSev   = (l,i) => SEVERITY.find(s => (l+1)*(i+1) >= s.min) || SEVERITY[3];
const getScore = (l,i) => (l+1)*(i+1);
const cellKey  = (l,i) => `${l},${i}`;

// localStorage key — unique per tool
const STORAGE_KEY = "rocklin_riskMatrix_risks";

const SEED = {
  "4,4": [{ text:"Surgical site infection due to lapses in sterile field protocol",     category:"Infection Control" }],
  "4,3": [{ text:"Critical medication error during high-acuity patient handoff",        category:"Medication"        }],
  "3,4": [{ text:"Understaffing on night shifts leading to delayed emergency response", category:"Staffing"          }],
  "3,3": [{ text:"Patient fall resulting in serious injury on general ward",            category:"Patient Safety"    },
           { text:"EHR system outage causing incomplete clinical documentation",        category:"Documentation"     }],
  "3,2": [{ text:"Outdated ventilator firmware creating equipment reliability risk",    category:"Equipment"         }],
  "2,3": [{ text:"HIPAA breach from unencrypted device containing patient records",    category:"Compliance"        }],
  "2,2": [{ text:"Supply chain disruption affecting PPE availability",                 category:"Financial"         }],
  "1,1": [{ text:"Minor scheduling conflict causing brief appointment delays",         category:"Staffing"          }],
};

// ─── Guide content ────────────────────────────────────────────────────────────
const GUIDE = {
  title: "Healthcare Risk Matrix",
  whatIsIt: `The Healthcare Risk Matrix is a visual risk assessment tool designed for clinical and compliance teams. It maps identified risks across two dimensions — Likelihood (how probable the risk is) and Impact (how severe the consequences would be if it occurred) — and automatically calculates a risk score for each entry.

Each cell on the 5×5 grid is color-coded by severity: Critical, High, Medium, or Low. This gives your team an at-a-glance view of where the greatest threats to patient safety, compliance, and operations are concentrated — the same structured approach used in Joint Commission readiness reviews and HIPAA risk assessments.`,
  howTo: [
    {
      step: "1",
      title: "Add a Risk",
      detail: "Click any cell on the matrix grid. A panel will appear on the right where you can describe the risk and assign it a category (e.g., Patient Safety, Medication, Compliance). The cell's position determines the score — higher row = higher likelihood, further right = higher impact.",
    },
    {
      step: "2",
      title: "Review the Score",
      detail: "Each risk is automatically scored by multiplying its Likelihood (1–5) and Impact (1–5) values. Scores of 15–25 are Critical, 10–14 are High, 5–9 are Medium, and 1–4 are Low. These thresholds align with standard healthcare risk management frameworks.",
    },
    {
      step: "3",
      title: "Edit or Remove Risks",
      detail: "In the Risk Log panel, use the pencil (✎) icon to edit an existing entry or the (✕) icon to delete it. Clicking a matrix cell that already has risks will let you add additional entries to that same score position.",
    },
    {
      step: "4",
      title: "Filter the Risk Log",
      detail: "Use the Severity and Category dropdowns in the Risk Log section to filter your view. This is especially useful during audits or department-level reviews when you need to isolate specific risk types — for example, all Critical Compliance risks.",
    },
    {
      step: "5",
      title: "Review the Summary",
      detail: "The Risk Summary panel shows a live count of risks at each severity level and a total. Use this as your executive snapshot — it gives leadership and compliance officers a quick read on the current risk posture without drilling into individual entries.",
    },
  ],
};

// ─── Guide Modal ──────────────────────────────────────────────────────────────
function GuideModal({ onClose, onClearData }) {
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClear = () => {
    if (!confirmClear) {
      // First click — ask for confirmation
      setConfirmClear(true);
    } else {
      // Second click — execute clear
      onClearData();
      setConfirmClear(false);
      onClose();
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position:"fixed", inset:0, zIndex:1000,
        background:"rgba(10,16,10,0.55)",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"1rem",
        backdropFilter:"blur(2px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:T.white,
          borderRadius:14,
          width:"100%",
          maxWidth:580,
          maxHeight:"88vh",
          overflowY:"auto",
          boxShadow:"0 8px 40px rgba(0,0,0,0.22)",
          fontFamily:T.font,
        }}
      >
        {/* Header */}
        <div style={{
          background:T.green,
          borderRadius:"14px 14px 0 0",
          padding:"1.1rem 1.4rem",
          display:"flex", justifyContent:"space-between", alignItems:"center",
        }}>
          <div>
            <p style={{margin:0, fontSize:11, fontWeight:600, color:T.blue, letterSpacing:1, textTransform:"uppercase"}}>Tool Guide</p>
            <h2 style={{margin:"3px 0 0", fontSize:17, fontWeight:700, color:T.white}}>{GUIDE.title}</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background:"rgba(255,255,255,0.12)", border:"none", cursor:"pointer",
              color:T.white, fontSize:18, borderRadius:8,
              width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center",
              lineHeight:1, flexShrink:0,
            }}
          >✕</button>
        </div>

        {/* Body */}
        <div style={{padding:"1.4rem"}}>

          {/* What Is It For */}
          <div style={{marginBottom:"1.4rem"}}>
            <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:"0.6rem"}}>
              <div style={{width:4, height:18, background:T.green, borderRadius:2}}/>
              <h3 style={{margin:0, fontSize:13, fontWeight:700, color:T.green, textTransform:"uppercase", letterSpacing:0.7}}>What Is It For</h3>
            </div>
            {GUIDE.whatIsIt.split("\n\n").map((para, idx) => (
              <p key={idx} style={{margin:"0 0 0.7rem", fontSize:13, color:T.ink, lineHeight:1.65}}>{para}</p>
            ))}
          </div>

          {/* Divider */}
          <div style={{borderTop:`1px solid ${T.border}`, margin:"0 0 1.4rem"}}/>

          {/* How To Use It */}
          <div>
            <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:"0.9rem"}}>
              <div style={{width:4, height:18, background:T.blue, borderRadius:2}}/>
              <h3 style={{margin:0, fontSize:13, fontWeight:700, color:T.green, textTransform:"uppercase", letterSpacing:0.7}}>How To Use It</h3>
            </div>
            <div style={{display:"flex", flexDirection:"column", gap:"0.85rem"}}>
              {GUIDE.howTo.map((item) => (
                <div key={item.step} style={{display:"flex", gap:"0.9rem", alignItems:"flex-start"}}>
                  <div style={{
                    width:26, height:26, borderRadius:"50%",
                    background:T.green, color:T.white,
                    fontSize:12, fontWeight:700,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    flexShrink:0, marginTop:1,
                  }}>{item.step}</div>
                  <div>
                    <p style={{margin:"0 0 3px", fontSize:13, fontWeight:600, color:T.ink}}>{item.title}</p>
                    <p style={{margin:0, fontSize:12, color:T.muted, lineHeight:1.6}}>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div style={{
            marginTop:"1.4rem", padding:"0.75rem 1rem",
            background:T.cream, borderRadius:8,
            borderLeft:`3px solid ${T.blue}`,
          }}>
            <p style={{margin:0, fontSize:11, color:T.muted, lineHeight:1.6}}>
              <strong style={{color:T.ink}}>Tip:</strong> Your risk data is automatically saved to this browser. For audit-ready documentation, export or record finalized entries in your organization's formal risk register.
            </p>
          </div>

          {/* Divider */}
          <div style={{borderTop:`1px solid ${T.border}`, margin:"1.4rem 0 1.1rem"}}/>

          {/* Clear All Data */}
          <div style={{
            padding:"0.9rem 1rem",
            background: confirmClear ? T.dangerLt : "#fafaf8",
            borderRadius:8,
            border:`1px solid ${confirmClear ? T.danger : T.border}`,
            transition:"all 0.2s",
          }}>
            <p style={{margin:"0 0 6px", fontSize:12, fontWeight:600, color: confirmClear ? T.danger : T.ink}}>
              {confirmClear ? "⚠️ Are you sure? This cannot be undone." : "Reset Tool Data"}
            </p>
            <p style={{margin:"0 0 10px", fontSize:11, color:T.muted, lineHeight:1.5}}>
              Clears all saved risk entries and restores the original demo data. Use this to reset for a new client or clean demo.
            </p>
            <div style={{display:"flex", gap:8}}>
              <button
                onClick={handleClear}
                style={{
                  fontSize:12, fontWeight:600,
                  padding:"6px 14px", borderRadius:7,
                  background: confirmClear ? T.danger : "none",
                  color: confirmClear ? T.white : T.danger,
                  border:`1px solid ${T.danger}`,
                  cursor:"pointer",
                }}
              >
                {confirmClear ? "Yes, clear all data" : "Clear All Data"}
              </button>
              {confirmClear && (
                <button
                  onClick={() => setConfirmClear(false)}
                  style={{
                    fontSize:12, padding:"6px 14px", borderRadius:7,
                    background:"none", color:T.muted,
                    border:`1px solid ${T.border}`, cursor:"pointer",
                  }}
                >
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
export default function RiskMatrix() {

  // ── State: load from localStorage on first render, fall back to SEED ──
  const [risks, setRisks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : SEED;
    } catch {
      return SEED;
    }
  });

  const [form,       setForm]       = useState(null);
  const [draft,      setDraft]      = useState("");
  const [draftCat,   setDraftCat]   = useState(CATEGORIES[0]);
  const [sevFilter,  setSevFilter]  = useState("All");
  const [catFilter,  setCatFilter]  = useState("All");
  const [showGuide,  setShowGuide]  = useState(false);

  // ── Persist risks to localStorage whenever they change ──
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(risks));
    } catch {
      // localStorage unavailable — fail silently
    }
  }, [risks]);

  // ── Clear all data: wipe localStorage, restore SEED ──
  const handleClearData = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setRisks(SEED);
    setForm(null);
  };

  const openAdd  = (l,i) => { setForm({l,i}); setDraft(""); setDraftCat(CATEGORIES[0]); };
  const openEdit = (l,i,idx) => {
    const r = risks[cellKey(l,i)][idx];
    setForm({l,i,editIdx:idx}); setDraft(r.text); setDraftCat(r.category);
  };
  const closeForm = () => setForm(null);

  const saveRisk = () => {
    if (!draft.trim()) return;
    const k = cellKey(form.l, form.i);
    const entry = { text:draft.trim(), category:draftCat };
    const cur = risks[k] || [];
    const upd = form.editIdx != null
      ? cur.map((x,j) => j===form.editIdx ? entry : x)
      : [...cur, entry];
    setRisks({...risks,[k]:upd});
    setForm(null);
  };

  const deleteRisk = (l,i,idx) => {
    const k = cellKey(l,i);
    const upd = (risks[k]||[]).filter((_,j)=>j!==idx);
    const next = {...risks};
    if (!upd.length) delete next[k]; else next[k]=upd;
    setRisks(next);
    if (form?.l===l && form?.i===i && form?.editIdx===idx) setForm(null);
  };

  const allRisks = useMemo(() =>
    Object.entries(risks).flatMap(([k,arr]) => {
      const [l,i] = k.split(",").map(Number);
      const sev = getSev(l,i);
      return arr.map((r,idx) => ({l,i,idx,sev,score:getScore(l,i),...r}));
    }).sort((a,b) => b.score-a.score)
  ,[risks]);

  const filteredRisks = useMemo(() =>
    allRisks.filter(r =>
      (sevFilter==="All" || r.sev.label===sevFilter) &&
      (catFilter==="All" || r.category===catFilter)
    )
  ,[allRisks,sevFilter,catFilter]);

  const counts = useMemo(() => {
    const c={Critical:0,High:0,Medium:0,Low:0};
    allRisks.forEach(r=>c[r.sev.label]++);
    return c;
  },[allRisks]);

  const activeCats = useMemo(() => {
    const s=new Set(allRisks.map(r=>r.category));
    return CATEGORIES.filter(c=>s.has(c));
  },[allRisks]);

  const formSev = form ? getSev(form.l, form.i) : null;

  return (
    <div style={{padding:"1.5rem 2rem", fontFamily:T.font, color:T.ink}}>

      {/* ── Guide button ── */}
      <div style={{display:"flex", justifyContent:"flex-end", marginBottom:"0.85rem"}}>
        <button
          onClick={() => setShowGuide(true)}
          style={{
            display:"flex", alignItems:"center", gap:6,
            padding:"6px 14px", borderRadius:8,
            background:T.green, color:T.white,
            border:"none", cursor:"pointer",
            fontSize:12, fontWeight:600, letterSpacing:0.4,
          }}
          onMouseEnter={e => e.currentTarget.style.background = T.greenLt}
          onMouseLeave={e => e.currentTarget.style.background = T.green}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          Guide
        </button>
      </div>

      {/* ── Guide Modal ── */}
      {showGuide && (
        <GuideModal
          onClose={() => setShowGuide(false)}
          onClearData={handleClearData}
        />
      )}

      {/* ── Existing layout (100% unchanged) ── */}
      <div style={{display:"flex",gap:"1.5rem",alignItems:"flex-start",flexWrap:"wrap"}}>

        {/* Matrix */}
        <div style={{flex:"1 1 400px"}}>
          <div style={{display:"flex",gap:6}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",width:18}}>
              <span style={{fontSize:11,color:T.muted,writingMode:"vertical-rl",transform:"rotate(180deg)",letterSpacing:1}}>LIKELIHOOD →</span>
            </div>
            <div>
              {[4,3,2,1,0].map(l=>(
                <div key={l} style={{display:"flex",gap:4,marginBottom:4}}>
                  <div style={{width:96,display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:10}}>
                    <span style={{fontSize:12,fontWeight:500,color:T.ink,textAlign:"right",lineHeight:1.3}}>{LIKELIHOOD[l]}</span>
                  </div>
                  {[0,1,2,3,4].map(i=>{
                    const sev=getSev(l,i);
                    const n=(risks[cellKey(l,i)]||[]).length;
                    const isActive=form?.l===l&&form?.i===i;
                    return (
                      <div key={i} onClick={()=>openAdd(l,i)}
                        style={{width:70,height:58,background:sev.bg,
                          border:`${isActive?"2.5px":"1.5px"} solid ${isActive?sev.badge:sev.border}`,
                          borderRadius:6,cursor:"pointer",display:"flex",flexDirection:"column",
                          alignItems:"center",justifyContent:"center",gap:3,transition:"opacity 0.15s"}}
                        onMouseEnter={e=>e.currentTarget.style.opacity="0.75"}
                        onMouseLeave={e=>e.currentTarget.style.opacity="1"}
                      >
                        <span style={{fontSize:13,fontWeight:600,color:sev.text}}>{getScore(l,i)}</span>
                        {n>0&&<span style={{background:sev.badge,color:"#fff",borderRadius:10,fontSize:11,fontWeight:600,padding:"1px 8px",lineHeight:1.6}}>{n}</span>}
                      </div>
                    );
                  })}
                </div>
              ))}
              <div style={{display:"flex",gap:4,marginTop:6}}>
                <div style={{width:96}}/>
                {[0,1,2,3,4].map(i=>(
                  <div key={i} style={{width:70,textAlign:"center"}}>
                    <span style={{fontSize:11,fontWeight:500,color:T.ink,lineHeight:1.3}}>{IMPACT[i]}</span>
                  </div>
                ))}
              </div>
              <div style={{textAlign:"center",marginLeft:96,marginTop:5}}>
                <span style={{fontSize:11,color:T.muted,letterSpacing:1}}>IMPACT →</span>
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:10,marginTop:14,flexWrap:"wrap",marginLeft:110}}>
            {SEVERITY.map(s=>(
              <div key={s.label} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:13,height:13,borderRadius:3,background:s.bg,border:`1.5px solid ${s.border}`}}/>
                <span style={{fontSize:12,fontWeight:600,color:s.text}}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{flex:"0 0 215px",display:"flex",flexDirection:"column",gap:12}}>

          {/* Entry form */}
          {form && formSev && (
            <div style={{background:T.white,borderRadius:12,border:`1.5px solid ${formSev.border}`,padding:"1rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div>
                  <p style={{margin:0,fontWeight:500,fontSize:14,color:T.ink}}>{form.editIdx!=null?"Edit risk":"New risk"}</p>
                  <p style={{margin:"2px 0 0",fontSize:11,color:T.muted,lineHeight:1.4}}>
                    {LIKELIHOOD[form.l]} × {IMPACT[form.i]}<br/>
                    Score {getScore(form.l,form.i)} — <span style={{fontWeight:600,color:formSev.text}}>{formSev.label}</span>
                  </p>
                </div>
                <button onClick={closeForm} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:T.muted,padding:"0 2px",lineHeight:1}}>✕</button>
              </div>

              <label style={{fontSize:11,fontWeight:500,color:T.muted,display:"block",marginBottom:4}}>Category</label>
              <select value={draftCat} onChange={e=>setDraftCat(e.target.value)}
                style={{width:"100%",marginBottom:10,fontSize:12,padding:"6px 8px",borderRadius:6,
                  border:`0.5px solid ${T.border}`,background:T.cream,color:T.ink}}>
                {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>

              <label style={{fontSize:11,fontWeight:500,color:T.muted,display:"block",marginBottom:4}}>Description</label>
              <textarea autoFocus value={draft} onChange={e=>setDraft(e.target.value)}
                placeholder="Describe the risk…" rows={4}
                onKeyDown={e=>{if(e.key==="Enter"&&e.metaKey)saveRisk();}}
                style={{width:"100%",boxSizing:"border-box",resize:"vertical",fontSize:12,
                  padding:"7px 9px",borderRadius:6,border:`0.5px solid ${T.border}`,
                  background:T.cream,color:T.ink,fontFamily:T.font,lineHeight:1.5}}/>

              <div style={{display:"flex",gap:7,marginTop:9,justifyContent:"flex-end"}}>
                <button onClick={closeForm}
                  style={{fontSize:12,padding:"6px 13px",background:"none",border:`1px solid ${T.border}`,borderRadius:6,cursor:"pointer",color:T.muted}}>
                  Cancel
                </button>
                <button onClick={saveRisk} disabled={!draft.trim()}
                  style={{fontSize:12,padding:"6px 13px",background:formSev.badge,color:"#fff",
                    border:"none",borderRadius:6,cursor:draft.trim()?"pointer":"not-allowed",
                    opacity:draft.trim()?1:0.5}}>
                  {form.editIdx!=null?"Save":"Add risk"}
                </button>
              </div>
            </div>
          )}

          {/* Summary */}
          <div style={{background:T.cream,borderRadius:12,padding:"1rem"}}>
            <p style={{fontSize:11,fontWeight:600,color:T.muted,margin:"0 0 12px",letterSpacing:0.6}}>RISK SUMMARY</p>
            {SEVERITY.map(s=>(
              <div key={s.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <div style={{width:11,height:11,borderRadius:2,background:s.bg,border:`1.5px solid ${s.border}`}}/>
                  <span style={{fontSize:13,fontWeight:500,color:T.ink}}>{s.label}</span>
                </div>
                <span style={{fontSize:15,fontWeight:600,color:counts[s.label]?s.text:T.muted}}>{counts[s.label]}</span>
              </div>
            ))}
            <div style={{borderTop:`0.5px solid ${T.borderLt}`,paddingTop:9,marginTop:2,display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:13,color:T.muted}}>Total</span>
              <span style={{fontSize:15,fontWeight:600,color:T.ink}}>{allRisks.length}</span>
            </div>
          </div>

          {/* Risk log */}
          {allRisks.length>0&&(
            <div style={{background:T.cream,borderRadius:12,padding:"1rem"}}>
              <p style={{fontSize:11,fontWeight:600,color:T.muted,margin:"0 0 10px",letterSpacing:0.6}}>RISK LOG</p>
              <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:11}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <label style={{fontSize:11,fontWeight:500,color:T.muted,width:58,flexShrink:0}}>Severity</label>
                  <select value={sevFilter} onChange={e=>setSevFilter(e.target.value)}
                    style={{flex:1,fontSize:12,padding:"5px 8px",borderRadius:6,
                      border:`0.5px solid ${T.border}`,background:T.white,color:T.ink}}>
                    {["All","Critical","High","Medium","Low"].map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {activeCats.length>0&&(
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <label style={{fontSize:11,fontWeight:500,color:T.muted,width:58,flexShrink:0}}>Category</label>
                    <select value={catFilter} onChange={e=>setCatFilter(e.target.value)}
                      style={{flex:1,fontSize:12,padding:"5px 8px",borderRadius:6,
                        border:`0.5px solid ${T.border}`,background:T.white,color:T.ink}}>
                      <option value="All">All</option>
                      {activeCats.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div style={{maxHeight:280,overflowY:"auto",display:"flex",flexDirection:"column",gap:6}}>
                {filteredRisks.length===0
                  ? <p style={{fontSize:12,color:T.muted,margin:0}}>No risks match filters.</p>
                  : filteredRisks.map(r=>(
                    <div key={`${r.l},${r.i}-${r.idx}`}
                      style={{padding:"7px 9px",borderRadius:6,background:r.sev.bg,border:`0.5px solid ${r.sev.border}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",gap:4}}>
                        <p style={{fontSize:12,fontWeight:500,color:r.sev.text,margin:0,lineHeight:1.4,flex:1}}>{r.text}</p>
                        <div style={{display:"flex",gap:4,flexShrink:0}}>
                          <button onClick={()=>openEdit(r.l,r.i,r.idx)} style={{background:"none",border:"none",cursor:"pointer",padding:0,fontSize:13,color:r.sev.text}}>✎</button>
                          <button onClick={()=>deleteRisk(r.l,r.i,r.idx)} style={{background:"none",border:"none",cursor:"pointer",padding:0,fontSize:13,color:r.sev.text}}>✕</button>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:5,marginTop:5,flexWrap:"wrap"}}>
                        <span style={{fontSize:10,fontWeight:600,color:r.sev.text,background:"rgba(0,0,0,0.07)",borderRadius:4,padding:"1px 6px"}}>{r.category}</span>
                        <span style={{fontSize:10,color:r.sev.text,opacity:0.75}}>{LIKELIHOOD[r.l]} × {IMPACT[r.i]} = {r.score}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}