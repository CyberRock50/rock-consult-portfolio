import { useState, useMemo, useEffect } from "react";

const FONTS = { sans:"system-ui,-apple-system,'Segoe UI',Arial,sans-serif", serif:"Georgia,'Times New Roman',serif" };

const C = {
  cream:"#f4f0e6", creamDk:"#e8e2d4", forest:"#1b2d1b",
  sage:"#3b82f6", sageLt:"#93c5fd", sagePl:"#dbeafe",
  ink:"#1a1a14", muted:"#6b6b5e", border:"rgba(26,26,20,0.1)",
  danger:"#dc2626", dangerLt:"#fecaca",
};

const DOMAINS = [
  { key:"security",    label:"Security Controls",         weight:0.30, desc:"MFA, encryption, vulnerability mgmt, access controls" },
  { key:"privacy",     label:"Data Privacy & Compliance", weight:0.25, desc:"HIPAA compliance, data handling, privacy policies" },
  { key:"continuity",  label:"Business Continuity",       weight:0.20, desc:"DR plans, uptime SLAs, backup procedures" },
  { key:"financial",   label:"Financial Stability",       weight:0.10, desc:"Financial health, insurance, longevity" },
  { key:"contractual", label:"Contractual & Legal",       weight:0.10, desc:"BAA, SLAs, liability, incident notification clauses" },
  { key:"operational", label:"Operational Performance",   weight:0.05, desc:"Service quality, support responsiveness, track record" },
];

const CATEGORIES = ["EHR / EMR","Cloud Services","Medical Devices","Billing & Revenue Cycle","Pharmacy","Telehealth","IT Services","Lab Services","HR & Staffing","Legal & Compliance"];

const TIERS = [
  { label:"Low Risk",      min:75, bg:"#dcfce7", border:"#86efac", text:"#15803d", dot:"#16a34a" },
  { label:"Medium Risk",   min:50, bg:"#fef08a", border:"#ca8a04", text:"#713f12", dot:"#ca8a04" },
  { label:"High Risk",     min:25, bg:"#fed7aa", border:"#f97316", text:"#7c2d12", dot:"#ea580c" },
  { label:"Critical Risk", min:0,  bg:"#fecaca", border:"#ef4444", text:"#7f1d1d", dot:"#dc2626" },
];

const getTier   = s => TIERS.find(t => s >= t.min) || TIERS[3];
const calcScore = scores => Math.round(((DOMAINS.reduce((sum,d) => sum+(scores[d.key]||1)*d.weight, 0)-1)/4)*100);
const SCORE_LABELS = {1:"Poor",2:"Fair",3:"Adequate",4:"Good",5:"Excellent"};
const today   = new Date().toISOString().split("T")[0];
const daysAgo = n => { const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().split("T")[0]; };
const nowStr  = () => new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"});

// localStorage key — unique per tool
const STORAGE_KEY = "rocklin_vendorScorecard_vendors";

let nextId = 8;

const SEED = [
  { id:1, name:"Epic Systems",         category:"EHR / EMR",              contact:"vendor@epic.com",        assessedDate:daysAgo(30), notes:"Fully HIPAA-compliant EHR with SOC 2 Type II. Excellent uptime record and dedicated BAA in place.",                                          scores:{security:5,privacy:5,continuity:5,financial:5,contractual:5,operational:5} },
  { id:2, name:"AWS GovCloud",          category:"Cloud Services",          contact:"govcloud@aws.com",       assessedDate:daysAgo(45), notes:"FedRAMP authorized. HIPAA-eligible services with comprehensive BAA and 99.99% SLA.",                                                       scores:{security:5,privacy:4,continuity:5,financial:5,contractual:4,operational:5} },
  { id:3, name:"Meditech Expanse",      category:"EHR / EMR",              contact:"support@meditech.com",   assessedDate:daysAgo(60), notes:"HIPAA-compliant EHR with solid security posture. DR plan needs review; support response times are variable.",                              scores:{security:4,privacy:4,continuity:3,financial:4,contractual:4,operational:3} },
  { id:4, name:"McKesson Pharmacy",     category:"Pharmacy",                contact:"compliance@mckesson.com",assessedDate:daysAgo(20), notes:"Established vendor. Recent security audit findings partially remediated. BAA is current.",                                                 scores:{security:3,privacy:4,continuity:3,financial:5,contractual:3,operational:4} },
  { id:5, name:"BrightPath Telehealth", category:"Telehealth",              contact:"info@brightpath.io",     assessedDate:daysAgo(10), notes:"Early-stage startup. Limited security documentation. No formal DR plan. BAA under negotiation. Requires reassessment.",                    scores:{security:2,privacy:2,continuity:2,financial:2,contractual:2,operational:3} },
  { id:6, name:"MedBill Offshore",      category:"Billing & Revenue Cycle", contact:"ops@medbill.co",         assessedDate:daysAgo(15), notes:"Offshore billing vendor. Significant HIPAA compliance gaps. No signed BAA. Immediate remediation required.",                              scores:{security:2,privacy:1,continuity:2,financial:2,contractual:1,operational:2} },
  { id:7, name:"LegacyDevCo",           category:"Medical Devices",         contact:"support@legacydev.com",  assessedDate:daysAgo(90), notes:"Legacy medical device maker. Devices run unsupported OS. No encryption at rest. No patch management program in place.",                   scores:{security:1,privacy:2,continuity:1,financial:2,contractual:2,operational:2} },
];

const TierBadge = ({score}) => { const t=getTier(score); return <span style={{fontSize:11,fontWeight:700,padding:"2px 10px",borderRadius:20,background:t.bg,color:t.text,border:`0.5px solid ${t.border}`,whiteSpace:"nowrap"}}>{t.label}</span>; };

const ScoreCircle = ({score,size=48}) => {
  const t=getTier(score), r=14, circ=2*Math.PI*r, dash=(score/100)*circ;
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg viewBox="0 0 36 36" width={size} height={size}>
        <circle cx="18" cy="18" r={r} fill="none" stroke={C.creamDk} strokeWidth="3"/>
        <circle cx="18" cy="18" r={r} fill="none" stroke={t.dot} strokeWidth="3"
          strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={circ*0.25} strokeLinecap="round"/>
      </svg>
      <span style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size>44?12:10,fontWeight:700,color:t.text}}>{score}</span>
    </div>
  );
};

async function callAI(prompt, system) {
  const res = await fetch("/.netlify/functions/ai-proxy",{
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:1200,
      system: system||"You are a healthcare vendor risk analyst. Return only valid JSON, no markdown fences.",
      messages:[{role:"user",content:prompt}]
    })
  });
  if(!res.ok){ const e=await res.json().catch(()=>{}); throw new Error(e?.error?.message||`HTTP ${res.status}`); }
  const data=await res.json();
  const raw=(data.content?.[0]?.text||"").trim().replace(/^```[a-z]*\n?/i,"").replace(/```$/,"").trim();
  const s=raw.indexOf("{"),e=raw.lastIndexOf("}");
  if(s===-1||e===-1) throw new Error("No JSON in response");
  return JSON.parse(raw.slice(s,e+1));
}

// ─── Guide content ────────────────────────────────────────────────────────────
const GUIDE = {
  title: "Vendor Risk Scorecard",
  whatIsIt: `The Vendor Risk Scorecard is a third-party risk management tool built for healthcare organizations managing HIPAA Business Associate relationships. It scores each vendor across six weighted domains — Security Controls (30%), Data Privacy & Compliance (25%), Business Continuity (20%), Financial Stability (10%), Contractual & Legal (10%), and Operational Performance (5%) — and assigns an overall risk tier: Low, Medium, High, or Critical.

This mirrors the kind of vendor due diligence your compliance or security team would conduct before signing a Business Associate Agreement (BAA), and supports ongoing monitoring across your vendor portfolio. The AI Report tab generates a narrative risk assessment for any vendor, with strengths, concerns, recommendations, and a suggested reassessment timeline — ready to download as an HTML report.`,
  howTo: [
    {
      step: "1",
      title: "Review the Vendor Registry",
      detail: "The Vendor Registry shows all assessed vendors sorted by risk score (lowest to highest). Each card shows the composite score circle, risk tier badge, a mini domain score bar, and assessment notes. Filter by Tier or Category to focus on specific segments — for example, all Critical Risk vendors.",
    },
    {
      step: "2",
      title: "Add or Edit a Vendor",
      detail: "Click '+ Add Vendor' to score a new vendor. Enter the name, category, contact, and assessment date, then use the six sliders to rate each domain from 1 (Poor) to 5 (Excellent). The projected score and tier update live as you adjust sliders. Use '✦ AI Suggest' to have Claude recommend scores based on the vendor name and your notes.",
    },
    {
      step: "3",
      title: "Understand the Scoring",
      detail: "Each domain score is weighted by its compliance importance. Security (30%) and Privacy (25%) carry the most weight because they directly affect HIPAA risk. The composite score (0–100) maps to tiers: Low Risk (75+), Medium Risk (50–74), High Risk (25–49), Critical Risk (0–24). Critical Risk vendors should be escalated immediately.",
    },
    {
      step: "4",
      title: "Review the Risk Analysis",
      detail: "The Risk Analysis tab shows KPI cards (hover to flip), tier distribution bars, portfolio-level domain averages, and a full vendor risk ranking. Use this view for leadership briefings, audit documentation, or to identify which domain has the weakest scores across your vendor portfolio.",
    },
    {
      step: "5",
      title: "Generate an AI Vendor Report",
      detail: "In the AI Report tab, click '✦ Generate' next to any vendor. Claude produces a tailored risk narrative including a headline assessment, strengths, risk concerns, specific recommendations, and a reassessment timeline. Download it as an HTML report to share with your legal, compliance, or procurement team.",
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
              <strong style={{color:C.ink}}>Tip:</strong> Your vendor data is automatically saved to this browser. AI-generated reports can be downloaded as standalone HTML files — ideal for including in vendor due diligence packages or audit records.
            </p>
          </div>

          <div style={{borderTop:`1px solid ${C.border}`, margin:"1.4rem 0 1.1rem"}}/>

          <div style={{padding:"0.9rem 1rem", background: confirmClear ? C.dangerLt : "#fafaf8", borderRadius:8, border:`1px solid ${confirmClear ? C.danger : C.border}`, transition:"all 0.2s"}}>
            <p style={{margin:"0 0 6px", fontSize:12, fontWeight:600, color: confirmClear ? C.danger : C.ink}}>
              {confirmClear ? "⚠️ Are you sure? This cannot be undone." : "Reset Tool Data"}
            </p>
            <p style={{margin:"0 0 10px", fontSize:11, color:C.muted, lineHeight:1.5}}>
              Clears all vendor records and restores the original 7 demo vendors. Use this to reset for a new client or a clean demo.
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
export default function VendorScorecard() {

  // ── State: load vendors from localStorage, fall back to SEED ──
  const [vendors, setVendors] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : SEED;
    } catch { return SEED; }
  });

  const [activeTab,  setActiveTab]  = useState("registry");
  const [tierFilter, setTierFilter] = useState("All");
  const [catFilter,  setCatFilter]  = useState("All");
  const [modal,      setModal]      = useState(null);
  const [aiReport,   setAiReport]   = useState(null);
  const [aiLoading,  setAiLoading]  = useState(null);
  const [aiSuggest,  setAiSuggest]  = useState(null);
  const [suggestLoad,setSuggestLoad]= useState(false);
  const [showGuide,  setShowGuide]  = useState(false);

  const blankScores = Object.fromEntries(DOMAINS.map(d=>[d.key,3]));
  const blank = {name:"",category:CATEGORIES[0],contact:"",assessedDate:today,scores:blankScores,notes:""};
  const [form, setForm] = useState(blank);

  // ── Persist vendors to localStorage whenever they change ──
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(vendors)); } catch {}
  }, [vendors]);

  // ── Clear all data: wipe localStorage, restore SEED ──
  const handleClearData = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setVendors(SEED);
    setAiReport(null);
    setModal(null);
  };

  const setF     = k => v => setForm(f=>({...f,[k]:v}));
  const setScore = (k,v) => setForm(f=>({...f,scores:{...f.scores,[k]:v}}));

  const openAdd  = () => { setForm(blank); setAiSuggest(null); setModal("add"); };
  const openEdit = v  => { setForm({name:v.name,category:v.category,contact:v.contact,assessedDate:v.assessedDate,scores:{...v.scores},notes:v.notes}); setAiSuggest(null); setModal(v); };
  const closeModal = () => { setModal(null); setAiSuggest(null); };

  const saveVendor = () => {
    if(!form.name.trim()) return;
    if(modal==="add") setVendors(vs=>[...vs,{...form,id:nextId++}]);
    else setVendors(vs=>vs.map(v=>v.id===modal.id?{...v,...form}:v));
    closeModal();
  };
  const deleteVendor = id => { setVendors(vs=>vs.filter(v=>v.id!==id)); closeModal(); setAiReport(null); };

  const handleSuggest = async () => {
    if(!form.name.trim()) return;
    setSuggestLoad(true); setAiSuggest(null);
    try {
      const r = await callAI(
        `Vendor: "${form.name}" | Category: ${form.category}\nNotes: "${form.notes}"\nSuggest realistic domain risk scores (1=Poor/High Risk, 5=Excellent/Low Risk).\nReturn ONLY JSON: {"scores":{"security":3,"privacy":3,"continuity":3,"financial":3,"contractual":3,"operational":3},"rationale":"2 sentences on overall risk posture"}`,
        "You are a healthcare vendor risk analyst. Score 1=Poor, 5=Excellent. Return only valid JSON, no markdown."
      );
      setAiSuggest(r);
    } catch(e){ setAiSuggest({error:"Suggestion failed. Please try again."}); }
    setSuggestLoad(false);
  };
  const applySuggest = () => { if(aiSuggest?.scores) setF("scores")(aiSuggest.scores); setAiSuggest(null); };

  const handleReport = async (vendor) => {
    setAiLoading(vendor.id); setAiReport(null);
    const score=calcScore(vendor.scores), tier=getTier(score);
    const domSummary=DOMAINS.map(d=>`${d.label}:${vendor.scores[d.key]}/5(wt:${Math.round(d.weight*100)}%)`).join(",");
    try {
      const r = await callAI(
        `Healthcare vendor: "${vendor.name}" | Category: ${vendor.category}\nScore: ${score}/100 | Tier: ${tier.label}\nDomains: ${domSummary}\nNotes: ${vendor.notes.slice(0,200)}\n\nGenerate a concise vendor risk report. Max 3 items per array, max 20 words per item.\nReturn ONLY JSON: {"headline":"one sentence risk summary","strengths":["s1"],"concerns":["c1"],"recommendations":["r1"],"overall_assessment":"2-3 sentence conclusion","reassessment_timeline":"e.g. 6 months"}`,
        "You are a senior healthcare vendor risk analyst. Be concise and specific. Return only valid JSON, no markdown."
      );
      setAiReport({vendor,content:r,score,tier,generatedAt:nowStr()});
    } catch(e){ setAiReport({error:`Report failed: ${e.message}`}); }
    setAiLoading(null);
  };

  const downloadReport = rep => {
    const {vendor:v,content:c,score,tier,generatedAt}=rep;
    const domRows=DOMAINS.map(d=>{ const s=v.scores[d.key],t=getTier(Math.round(((s-1)/4)*100)); return `<tr><td>${d.label}</td><td style="text-align:center;font-weight:700;color:${t.text}">${s}/5</td><td>${SCORE_LABELS[s]}</td><td style="color:#6b6b5e;font-size:11px">${Math.round(d.weight*100)}%</td></tr>`; }).join("");
    const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Vendor Risk — ${v.name}</title><style>
      *{box-sizing:border-box;margin:0;padding:0}body{font-family:Georgia,serif;background:#f4f0e6;color:#1a1a14;padding:40px;max-width:760px;margin:0 auto;font-size:14px;line-height:1.7}
      h1{font-size:24px;font-weight:normal;color:#1b2d1b;margin-bottom:4px}.meta{font-size:12px;color:#6b6b5e;font-family:Arial,sans-serif;margin-bottom:20px}
      .divider{height:3px;background:linear-gradient(90deg,#3b82f6,#f4f0e6);margin-bottom:28px}
      .score-row{display:flex;align-items:center;gap:16px;margin-bottom:20px}
      .sc{width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700}
      .headline{font-style:italic;color:#6b6b5e;line-height:1.6;margin-bottom:20px;font-size:14px}
      h2{font-size:13px;font-weight:600;font-family:Arial,sans-serif;letter-spacing:0.5px;text-transform:uppercase;margin:18px 0 8px}
      table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13px}
      th{background:#1b2d1b;color:#f4f0e6;padding:7px 10px;text-align:left;font-family:Arial,sans-serif;font-size:11px}
      td{padding:6px 10px;border-bottom:0.5px solid rgba(26,26,20,0.1)}tr:nth-child(even) td{background:rgba(255,255,255,0.5)}
      .sec{border-radius:8px;padding:12px 16px;margin-bottom:10px}ul{padding-left:18px}li{margin-bottom:4px;font-size:13px}
      .green{background:#dcfce7;border-left:4px solid #22c55e}.red{background:#fecaca;border-left:4px solid #ef4444}.blue{background:#dbeafe;border-left:4px solid #3b82f6}
      .footer{margin-top:40px;font-size:11px;color:#9ca3af;font-family:Arial,sans-serif;text-align:center}
    </style></head><body>
      <h1>Vendor Risk Report</h1>
      <p class="meta">${v.name} · ${v.category} · Generated ${generatedAt}</p>
      <div class="divider"></div>
      <div class="score-row">
        <div class="sc" style="background:${tier.bg};color:${tier.text}">${score}</div>
        <div><span style="font-size:13px;font-weight:700;padding:3px 12px;border-radius:20px;background:${tier.bg};color:${tier.text};border:0.5px solid ${tier.border}">${tier.label}</span>
        <p class="headline" style="margin-top:8px">"${c.headline||""}"</p></div>
      </div>
      <h2>Domain Scores</h2>
      <table><tr><th>Domain</th><th>Score</th><th>Rating</th><th>Weight</th></tr>${domRows}</table>
      ${c.strengths?.length?`<h2>Strengths</h2><div class="sec green"><ul>${c.strengths.map(s=>`<li>${s}</li>`).join("")}</ul></div>`:""}
      ${c.concerns?.length?`<h2>Risk Concerns</h2><div class="sec red"><ul>${c.concerns.map(s=>`<li>${s}</li>`).join("")}</ul></div>`:""}
      ${c.recommendations?.length?`<h2>Recommendations</h2><div class="sec blue"><ul>${c.recommendations.map(s=>`<li>${s}</li>`).join("")}</ul></div>`:""}
      ${c.overall_assessment?`<h2>Overall Assessment</h2><p style="color:#6b6b5e;line-height:1.7">${c.overall_assessment}</p>`:""}
      ${c.reassessment_timeline?`<p style="margin-top:10px;font-size:12px;color:#6b6b5e"><strong>Reassessment:</strong> ${c.reassessment_timeline}</p>`:""}
      <p class="footer">Generated by Vendor Risk Scorecard · Allied Healthcare GRC Portfolio</p>
    </body></html>`;
    const blob=new Blob([html],{type:"text/html"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download=`vendor-risk-${v.name.replace(/[^a-z0-9]/gi,"-").toLowerCase()}.html`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  };

  const vendorsScored = useMemo(()=>vendors.map(v=>({...v,score:calcScore(v.scores),tier:getTier(calcScore(v.scores))})).sort((a,b)=>a.score-b.score),[vendors]);
  const filtered = useMemo(()=>vendorsScored.filter(v=>(tierFilter==="All"||v.tier.label===tierFilter)&&(catFilter==="All"||v.category===catFilter)),[vendorsScored,tierFilter,catFilter]);
  const activeCats = useMemo(()=>{ const s=new Set(vendors.map(v=>v.category)); return CATEGORIES.filter(c=>s.has(c)); },[vendors]);

  const stats = useMemo(()=>{
    const byTier=TIERS.map(t=>({...t,n:vendorsScored.filter(v=>v.tier.label===t.label).length}));
    const avgScore=vendorsScored.length?Math.round(vendorsScored.reduce((s,v)=>s+v.score,0)/vendorsScored.length):0;
    const domAvgs=DOMAINS.map(d=>({...d,avg:vendors.length?Math.round((vendors.reduce((s,v)=>s+(v.scores[d.key]||1),0)/vendors.length)*10)/10:0}));
    return {byTier,avgScore,domAvgs,total:vendors.length};
  },[vendorsScored,vendors]);

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
          <h2 style={{fontFamily:FONTS.serif,fontSize:22,fontWeight:400,color:C.cream,margin:"0 0 4px"}}>Vendor Risk Scorecard</h2>
          <p style={{fontSize:12,color:C.sageLt,margin:0}}>Third-Party Risk · Weighted Scoring · HIPAA BAA · Allied Healthcare</p>
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
          {[["registry","Vendor Registry"],["analysis","Risk Analysis"],["ai","✦ AI Report"]].map(([t,label])=>(
            <button key={t} onClick={()=>setActiveTab(t)}
              style={{fontSize:13,padding:"6px 18px",borderRadius:7,border:"none",cursor:"pointer",fontWeight:500,
                background:activeTab===t?(t==="ai"?C.sage:C.forest):C.creamDk,color:activeTab===t?C.cream:C.muted}}>
              {label}
            </button>
          ))}
          <button onClick={openAdd} style={{marginLeft:"auto",fontSize:13,fontWeight:500,padding:"6px 16px",borderRadius:7,background:C.sage,color:"#fff",border:"none",cursor:"pointer"}}>
            + Add Vendor
          </button>
        </div>

        {/* VENDOR REGISTRY */}
        {activeTab==="registry" && (
          <>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
              {[["Tier",TIERS.map(t=>t.label),tierFilter,setTierFilter],["Category",activeCats,catFilter,setCatFilter]].map(([label,opts,val,set])=>(
                <div key={label} style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:11,fontWeight:500,color:C.muted}}>{label}</span>
                  <select value={val} onChange={e=>set(e.target.value)} style={{fontSize:12,padding:"5px 8px",borderRadius:6,border:`0.5px solid ${C.border}`,background:"#fff",color:C.ink}}>
                    <option value="All">All</option>
                    {opts.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <span style={{fontSize:12,color:C.muted,marginLeft:"auto"}}>{filtered.length} of {vendors.length} vendors</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {filtered.length===0&&<p style={{fontSize:13,color:C.muted}}>No vendors match current filters.</p>}
              {filtered.map(v=>(
                <div key={v.id} style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"12px 14px",display:"flex",gap:14,alignItems:"flex-start"}}>
                  <div style={{width:4,flexShrink:0,alignSelf:"stretch",borderRadius:4,background:v.tier.dot}}/>
                  <ScoreCircle score={v.score} size={52}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,flexWrap:"wrap",marginBottom:6}}>
                      <div>
                        <p style={{fontSize:14,fontWeight:500,color:C.ink,margin:"0 0 4px"}}>{v.name}</p>
                        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                          <span style={{fontSize:11,padding:"1px 8px",borderRadius:5,background:C.creamDk,color:C.muted,fontWeight:500}}>{v.category}</span>
                          <TierBadge score={v.score}/>
                          <span style={{fontSize:11,color:C.muted}}>· Assessed {v.assessedDate}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:2,marginBottom:6}}>
                      {DOMAINS.map(d=>{ const s=v.scores[d.key],t=getTier(Math.round(((s-1)/4)*100)); return (
                        <div key={d.key} style={{flex:d.weight,height:5,background:C.creamDk,borderRadius:3,overflow:"hidden"}} title={`${d.label}: ${s}/5`}>
                          <div style={{height:"100%",width:`${((s-1)/4)*100}%`,background:t.dot,borderRadius:3}}/>
                        </div>
                      ); })}
                    </div>
                    <p style={{fontSize:11,color:C.muted,margin:0,lineHeight:1.4}}>{v.notes.slice(0,130)}{v.notes.length>130?"…":""}</p>
                  </div>
                  <button onClick={()=>openEdit(v)} style={{fontSize:11,padding:"4px 10px",borderRadius:5,border:`0.5px solid ${C.border}`,background:"none",cursor:"pointer",color:C.muted,flexShrink:0}}>✎ Edit</button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* RISK ANALYSIS */}
        {activeTab==="analysis" && (
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <style>{`.vkpi{perspective:600px;cursor:pointer}.vkpi-inner{position:relative;width:100%;height:86px;transform-style:preserve-3d;transition:transform 0.55s cubic-bezier(.4,0,.2,1)}.vkpi:hover .vkpi-inner{transform:rotateY(180deg)}.vkpi-front,.vkpi-back{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px;text-align:center}.vkpi-back{transform:rotateY(180deg)}`}</style>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))",gap:10}}>
              {[
                {label:"Total Vendors", val:stats.total, color:C.ink, bg:"#fff", backBg:"#ece8dc", desc:"All vendors assessed across every risk tier."},
                ...stats.byTier.map(t=>({label:t.label,val:t.n,color:t.text,bg:t.bg,
                  backBg:t.label==="Low Risk"?"#86efac":t.label==="Medium Risk"?"#fde047":t.label==="High Risk"?"#fb923c":"#f87171",
                  desc:t.label==="Low Risk"?"Vendors meeting acceptable security and compliance standards."
                      :t.label==="Medium Risk"?"Vendors with notable gaps requiring monitoring and remediation."
                      :t.label==="High Risk"?"Vendors with significant deficiencies needing urgent attention."
                      :"Vendors posing immediate risk — escalation required."})),
                {label:"Portfolio Avg", val:stats.avgScore, color:C.sage, bg:C.sagePl, backBg:"#93c5fd", desc:"Mean weighted risk score across all assessed vendors."},
              ].map(k=>(
                <div key={k.label} className="vkpi">
                  <div className="vkpi-inner">
                    <div className="vkpi-front" style={{background:k.bg,border:`0.5px solid ${C.border}`}}>
                      <p style={{fontSize:22,fontWeight:700,color:k.color,margin:"0 0 4px",lineHeight:1}}>{k.val}</p>
                      <p style={{fontSize:10,color:C.muted,margin:0,lineHeight:1.3}}>{k.label}</p>
                    </div>
                    <div className="vkpi-back" style={{background:k.backBg,border:`0.5px solid ${C.border}`}}>
                      <p style={{fontSize:11,color:k.color,margin:0,lineHeight:1.5,fontWeight:500}}>{k.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
              <p style={{fontSize:11,fontWeight:600,color:C.muted,letterSpacing:0.8,margin:"0 0 14px"}}>RISK TIER DISTRIBUTION</p>
              {stats.byTier.map(t=>{ const p=stats.total?Math.round((t.n/stats.total)*100):0; return (
                <div key={t.label} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:12,fontWeight:600,color:t.text,background:t.bg,padding:"1px 9px",borderRadius:20,border:`0.5px solid ${t.border}`}}>{t.label}</span>
                    <span style={{fontSize:12,color:C.muted}}>{t.n} vendor{t.n!==1?"s":""} · <strong style={{color:C.ink}}>{p}%</strong></span>
                  </div>
                  <div style={{height:7,background:C.creamDk,borderRadius:10,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${p}%`,background:t.dot,borderRadius:10}}/>
                  </div>
                </div>
              ); })}
            </div>
            <div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
              <p style={{fontSize:11,fontWeight:600,color:C.muted,letterSpacing:0.8,margin:"0 0 14px"}}>AVERAGE DOMAIN SCORES — PORTFOLIO</p>
              {stats.domAvgs.map(d=>{ const pct=((d.avg-1)/4)*100,t=getTier(Math.round(pct)); return (
                <div key={d.key} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <div><span style={{fontSize:12,fontWeight:500,color:C.ink}}>{d.label}</span><span style={{fontSize:10,color:C.muted,marginLeft:6}}>{Math.round(d.weight*100)}% weight</span></div>
                    <span style={{fontSize:12,color:C.muted}}>{d.avg}/5 · <strong style={{color:t.text}}>{SCORE_LABELS[Math.round(d.avg)]||""}</strong></span>
                  </div>
                  <div style={{height:7,background:C.creamDk,borderRadius:10,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:t.dot,borderRadius:10}}/>
                  </div>
                </div>
              ); })}
            </div>
            <div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
              <p style={{fontSize:11,fontWeight:600,color:C.muted,letterSpacing:0.8,margin:"0 0 14px"}}>VENDOR RISK RANKING — LOWEST TO HIGHEST RISK</p>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {vendorsScored.map((v,i)=>(
                  <div key={v.id} style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:11,color:C.muted,width:22,textAlign:"right",flexShrink:0}}>#{i+1}</span>
                    <div style={{flex:1,height:7,background:C.creamDk,borderRadius:10,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${v.score}%`,background:v.tier.dot,borderRadius:10}}/>
                    </div>
                    <span style={{fontSize:12,fontWeight:500,color:C.ink,width:140,flexShrink:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{v.name}</span>
                    <span style={{fontSize:12,fontWeight:700,color:v.tier.text,width:30,textAlign:"right",flexShrink:0}}>{v.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI REPORT TAB */}
        {activeTab==="ai" && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
              <p style={{fontSize:14,fontWeight:500,color:C.ink,margin:"0 0 5px"}}>✦ AI Vendor Risk Report</p>
              <p style={{fontSize:12,color:C.muted,margin:0,lineHeight:1.6}}>Select a vendor to generate a tailored risk narrative — strengths, concerns, remediation recommendations, and a reassessment timeline.</p>
            </div>
            {aiReport?.error&&<div style={{background:"#fecaca",border:"0.5px solid #ef4444",borderRadius:10,padding:"1rem"}}><p style={{fontSize:13,color:"#7f1d1d",margin:0}}>{aiReport.error}</p></div>}
            {aiReport?.content&&(
              <div style={{background:"#fff",border:`1.5px solid ${C.sage}`,borderRadius:10,padding:"1.25rem"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:14,flexWrap:"wrap"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <ScoreCircle score={aiReport.score} size={52}/>
                    <div>
                      <p style={{fontSize:14,fontWeight:500,color:C.ink,margin:"0 0 3px"}}>{aiReport.vendor.name}</p>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}><TierBadge score={aiReport.score}/><span style={{fontSize:11,color:C.muted}}>· {aiReport.generatedAt}</span></div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>setAiReport(null)} style={{fontSize:11,padding:"5px 11px",borderRadius:6,border:`0.5px solid ${C.border}`,background:"none",cursor:"pointer",color:C.muted}}>✕</button>
                    <button onClick={()=>downloadReport(aiReport)} style={{fontSize:11,fontWeight:500,padding:"5px 13px",borderRadius:6,background:C.sagePl,color:C.sage,border:`1px solid ${C.sageLt}`,cursor:"pointer"}}>↓ Download HTML</button>
                  </div>
                </div>
                {aiReport.content.headline&&<p style={{fontSize:13,color:C.muted,margin:"0 0 12px",lineHeight:1.6,fontStyle:"italic"}}>"{aiReport.content.headline}"</p>}
                {[
                  {title:"Strengths",      items:aiReport.content.strengths,       bg:"#dcfce7",tc:"#15803d",lc:"#065f46"},
                  {title:"Risk Concerns",  items:aiReport.content.concerns,         bg:"#fecaca",tc:"#7f1d1d",lc:"#991b1b"},
                  {title:"Recommendations",items:aiReport.content.recommendations,  bg:C.sagePl, tc:C.sage,   lc:"#1e40af"},
                ].map(sec=>sec.items?.length?(
                  <div key={sec.title} style={{background:sec.bg,borderRadius:8,padding:"10px 14px",marginBottom:10}}>
                    <p style={{fontSize:11,fontWeight:700,color:sec.tc,margin:"0 0 6px",letterSpacing:0.5}}>{sec.title.toUpperCase()}</p>
                    <ul style={{margin:0,paddingLeft:16}}>{sec.items.map((item,i)=><li key={i} style={{fontSize:12,color:sec.lc,marginBottom:3,lineHeight:1.5}}>{item}</li>)}</ul>
                  </div>
                ):null)}
                {aiReport.content.overall_assessment&&<p style={{fontSize:13,color:C.muted,lineHeight:1.6,margin:"0 0 8px"}}>{aiReport.content.overall_assessment}</p>}
                {aiReport.content.reassessment_timeline&&<p style={{fontSize:12,color:C.muted}}><strong style={{color:C.ink}}>Reassessment:</strong> {aiReport.content.reassessment_timeline}</p>}
              </div>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {vendorsScored.map(v=>(
                <div key={v.id} style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"12px 14px",display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{width:4,flexShrink:0,alignSelf:"stretch",borderRadius:4,background:v.tier.dot}}/>
                  <ScoreCircle score={v.score} size={42}/>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:13,fontWeight:500,color:C.ink,margin:"0 0 3px"}}>{v.name}</p>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      <span style={{fontSize:10,padding:"1px 7px",borderRadius:5,background:C.creamDk,color:C.muted}}>{v.category}</span>
                      <TierBadge score={v.score}/>
                    </div>
                  </div>
                  <button onClick={()=>handleReport(v)} disabled={aiLoading!==null}
                    style={{fontSize:12,fontWeight:500,padding:"6px 14px",borderRadius:7,background:aiLoading===v.id?C.creamDk:C.forest,color:aiLoading===v.id?C.muted:C.cream,border:"none",cursor:aiLoading!==null?"not-allowed":"pointer",whiteSpace:"nowrap",flexShrink:0}}>
                    {aiLoading===v.id?"Generating…":"✦ Generate"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal&&(
        <div onClick={e=>{if(e.target===e.currentTarget)closeModal();}}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:20}}>
          <div style={{background:C.cream,borderRadius:12,border:`0.5px solid ${C.border}`,padding:"1.5rem",width:"100%",maxWidth:520,maxHeight:"92vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <p style={{margin:0,fontWeight:500,fontSize:16,color:C.ink}}>{modal==="add"?"Add Vendor":"Edit Vendor"}</p>
              <button onClick={closeModal} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:C.muted,padding:0}}>✕</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div style={{gridColumn:"1/-1"}}><label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Vendor Name *</label><input value={form.name} onChange={e=>setF("name")(e.target.value)} placeholder="e.g. Epic Systems" style={inputStyle}/></div>
              <div><label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Category</label><select value={form.category} onChange={e=>setF("category")(e.target.value)} style={inputStyle}>{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
              <div><label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Assessment Date</label><input type="date" value={form.assessedDate} onChange={e=>setF("assessedDate")(e.target.value)} style={inputStyle}/></div>
              <div style={{gridColumn:"1/-1"}}><label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Contact</label><input value={form.contact} onChange={e=>setF("contact")(e.target.value)} placeholder="vendor@email.com" style={inputStyle}/></div>
            </div>
            <label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Notes</label>
            <textarea value={form.notes} onChange={e=>setF("notes")(e.target.value)} rows={2} placeholder="Key observations about this vendor…" style={{...inputStyle,resize:"vertical",lineHeight:1.5,marginBottom:14}}/>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <label style={{fontSize:12,fontWeight:500,color:C.muted}}>Domain Scores <span style={{fontSize:11,fontWeight:400}}>(1 = Poor → 5 = Excellent)</span></label>
              <button onClick={handleSuggest} disabled={!form.name.trim()||suggestLoad}
                style={{fontSize:11,padding:"3px 10px",borderRadius:6,border:`1px solid ${C.sage}`,background:C.sagePl,color:C.sage,cursor:form.name.trim()?"pointer":"not-allowed",fontWeight:500,opacity:form.name.trim()?1:0.5}}>
                {suggestLoad?"Thinking…":"✦ AI Suggest"}
              </button>
            </div>
            {aiSuggest&&!aiSuggest.error&&(
              <div style={{background:C.sagePl,border:`1px solid ${C.sageLt}`,borderRadius:8,padding:"10px 12px",marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <span style={{fontSize:11,fontWeight:600,color:C.sage}}>AI SUGGESTED SCORES</span>
                  <button onClick={applySuggest} style={{fontSize:11,padding:"3px 10px",borderRadius:5,background:C.sage,color:"#fff",border:"none",cursor:"pointer",fontWeight:500}}>Apply All</button>
                </div>
                {aiSuggest.rationale&&<p style={{fontSize:11,color:"#1e40af",margin:"0 0 6px",lineHeight:1.4}}>{aiSuggest.rationale}</p>}
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {DOMAINS.map(d=><span key={d.key} style={{fontSize:11,padding:"2px 8px",borderRadius:5,background:"rgba(255,255,255,0.6)",color:"#1e40af",fontWeight:500}}>{d.label.split(" ")[0]}: {aiSuggest.scores?.[d.key]}/5</span>)}
                </div>
              </div>
            )}
            {aiSuggest?.error&&<div style={{background:"#fecaca",borderRadius:7,padding:"8px 12px",marginBottom:12}}><p style={{fontSize:12,color:"#7f1d1d",margin:0}}>{aiSuggest.error}</p></div>}
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
              {DOMAINS.map(d=>{ const val=form.scores[d.key]||3,t=getTier(Math.round(((val-1)/4)*100)); return (
                <div key={d.key}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <div><span style={{fontSize:12,fontWeight:500,color:C.ink}}>{d.label}</span><span style={{fontSize:10,color:C.muted,marginLeft:6}}>{Math.round(d.weight*100)}%</span></div>
                    <span style={{fontSize:11,fontWeight:600,color:t.text,background:t.bg,padding:"1px 8px",borderRadius:5,border:`0.5px solid ${t.border}`}}>{val} — {SCORE_LABELS[val]}</span>
                  </div>
                  <input type="range" min="1" max="5" step="1" value={val} onChange={e=>setScore(d.key,parseInt(e.target.value))} style={{width:"100%",accentColor:t.dot,cursor:"pointer"}}/>
                </div>
              ); })}
            </div>
            {(()=>{ const s=calcScore(form.scores),t=getTier(s); return (
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:t.bg,border:`0.5px solid ${t.border}`,borderRadius:8,marginBottom:18}}>
                <ScoreCircle score={s} size={44}/>
                <div>
                  <p style={{fontSize:13,fontWeight:500,color:t.text,margin:"0 0 2px"}}>Projected Score: {s}/100</p>
                  <p style={{fontSize:12,color:t.text,margin:0,opacity:0.8}}>{t.label}</p>
                </div>
              </div>
            ); })()}
            <div style={{display:"flex",gap:8,justifyContent:"space-between"}}>
              {modal!=="add"&&<button onClick={()=>deleteVendor(modal.id)} style={{fontSize:12,padding:"7px 14px",borderRadius:7,border:"0.5px solid #fca5a5",background:"none",color:"#dc2626",cursor:"pointer"}}>Delete</button>}
              <div style={{display:"flex",gap:8,marginLeft:"auto"}}>
                <button onClick={closeModal} style={{fontSize:12,padding:"7px 14px",borderRadius:7}}>Cancel</button>
                <button onClick={saveVendor} disabled={!form.name.trim()}
                  style={{fontSize:12,fontWeight:500,padding:"7px 18px",borderRadius:7,background:form.name.trim()?C.forest:C.creamDk,color:form.name.trim()?C.cream:C.muted,border:"none",cursor:form.name.trim()?"pointer":"not-allowed",opacity:form.name.trim()?1:0.45}}>
                  {modal==="add"?"Add Vendor":"Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}