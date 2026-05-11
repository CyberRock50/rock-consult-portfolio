import { useState, useMemo, useEffect } from "react";

const FONTS = { sans:"system-ui,-apple-system,'Segoe UI',Arial,sans-serif", serif:"Georgia,'Times New Roman',serif" };

const C = {
  cream:"#f4f0e6", creamDk:"#e8e2d4", forest:"#1b2d1b",
  sage:"#3b82f6", sageLt:"#93c5fd", sagePl:"#dbeafe",
  ink:"#1a1a14", muted:"#6b6b5e", border:"rgba(26,26,20,0.1)",
};

const FRAMEWORKS = ["NIST CSF","ISO 27001","SOC 2","HIPAA","HITRUST","HITECH"];
const DOMAINS    = ["Identify","Protect","Detect","Respond","Recover"];
const STATUSES   = ["Not Started","In Progress","Implemented","Not Applicable"];

const STATUS_META = {
  "Implemented":    { bg:"#dcfce7", border:"#86efac", text:"#15803d", dot:"#16a34a" },
  "In Progress":    { bg:"#fef08a", border:"#ca8a04", text:"#713f12", dot:"#ca8a04" },
  "Not Started":    { bg:"#fecaca", border:"#ef4444", text:"#7f1d1d", dot:"#dc2626" },
  "Not Applicable": { bg:"#e8e2d4", border:"#a8a89a", text:"#6b6b5e", dot:"#9ca3af" },
};
const DOMAIN_COLOR = { Identify:"#dbeafe", Protect:"#d1fae5", Detect:"#fef3c7", Respond:"#ffe4e6", Recover:"#ede9fe" };
const DOMAIN_TEXT  = { Identify:"#1e40af", Protect:"#065f46", Detect:"#92400e", Respond:"#9f1239", Recover:"#5b21b6" };
const FW_COLOR = { "NIST CSF":"#dbeafe","ISO 27001":"#d1fae5","SOC 2":"#fef3c7","HIPAA":"#ffe4e6","HITRUST":"#ede9fe","HITECH":"#fce7f3" };
const FW_TEXT  = { "NIST CSF":"#1e40af","ISO 27001":"#065f46","SOC 2":"#92400e","HIPAA":"#9f1239","HITRUST":"#5b21b6","HITECH":"#9d174d" };

const SEED = [
  { id:1,  name:"Asset Inventory Management",         description:"Maintain an up-to-date inventory of all hardware and software assets.",                            domain:"Identify", frameworks:["NIST CSF","ISO 27001","HITRUST"],               status:"Implemented"    },
  { id:2,  name:"Risk Assessment Process",            description:"Conduct periodic risk assessments to identify threats and vulnerabilities.",                      domain:"Identify", frameworks:["NIST CSF","ISO 27001","HIPAA","HITRUST","HITECH"],status:"Implemented"    },
  { id:3,  name:"Data Classification Policy",         description:"Classify data by sensitivity and apply handling requirements.",                                  domain:"Identify", frameworks:["NIST CSF","ISO 27001","HIPAA","HITECH"],          status:"In Progress"    },
  { id:4,  name:"Access Control Policy",              description:"Restrict system access to authorized users based on least-privilege principles.",                domain:"Protect",  frameworks:["NIST CSF","ISO 27001","SOC 2","HIPAA","HITRUST"], status:"Implemented"    },
  { id:5,  name:"Multi-Factor Authentication",        description:"Require MFA for all remote access and privileged account logins.",                              domain:"Protect",  frameworks:["NIST CSF","SOC 2","HIPAA","HITRUST","HITECH"],    status:"Implemented"    },
  { id:6,  name:"Encryption of PHI at Rest",          description:"Encrypt all protected health information stored on servers and endpoints.",                     domain:"Protect",  frameworks:["HIPAA","HITRUST","HITECH"],                        status:"Implemented"    },
  { id:7,  name:"Security Awareness Training",        description:"Deliver annual security and privacy awareness training to all workforce members.",              domain:"Protect",  frameworks:["NIST CSF","ISO 27001","HIPAA","HITRUST","HITECH"], status:"In Progress"    },
  { id:8,  name:"Patch Management Program",           description:"Apply security patches to systems and applications within defined SLAs.",                      domain:"Protect",  frameworks:["NIST CSF","ISO 27001","SOC 2","HITRUST"],          status:"In Progress"    },
  { id:9,  name:"Security Monitoring & Logging",      description:"Continuously monitor systems for suspicious activity and retain audit logs.",                  domain:"Detect",   frameworks:["NIST CSF","ISO 27001","SOC 2","HIPAA","HITRUST"],  status:"Not Started"    },
  { id:10, name:"Intrusion Detection System",         description:"Deploy IDS/IPS to detect unauthorized network access attempts.",                               domain:"Detect",   frameworks:["NIST CSF","ISO 27001","HITRUST"],                  status:"Not Started"    },
  { id:11, name:"Vulnerability Scanning",             description:"Run automated vulnerability scans on all in-scope systems quarterly.",                         domain:"Detect",   frameworks:["NIST CSF","SOC 2","HITRUST","HITECH"],             status:"In Progress"    },
  { id:12, name:"Incident Response Plan",             description:"Document and test a formal incident response plan covering detection through recovery.",       domain:"Respond",  frameworks:["NIST CSF","ISO 27001","HIPAA","HITRUST","HITECH"], status:"In Progress"    },
  { id:13, name:"Breach Notification Procedure",      description:"Notify affected individuals and regulators within required timeframes.",                       domain:"Respond",  frameworks:["HIPAA","HITECH"],                                  status:"Implemented"    },
  { id:14, name:"Forensic Investigation Capability",  description:"Preserve evidence and conduct forensic analysis after incidents.",                             domain:"Respond",  frameworks:["NIST CSF","ISO 27001","HITRUST"],                  status:"Not Started"    },
  { id:15, name:"Business Continuity Plan",           description:"Define and test continuity procedures to maintain operations during disruptions.",             domain:"Recover",  frameworks:["NIST CSF","ISO 27001","SOC 2","HITRUST"],          status:"Not Started"    },
  { id:16, name:"Backup & Recovery Testing",          description:"Perform regular backups and validate restoration procedures at least annually.",               domain:"Recover",  frameworks:["NIST CSF","ISO 27001","SOC 2","HIPAA","HITRUST"],  status:"In Progress"    },
  { id:17, name:"Third-Party Vendor Risk Management", description:"Assess and monitor security posture of business associates and third-party vendors.",          domain:"Identify", frameworks:["NIST CSF","ISO 27001","HIPAA","HITRUST","HITECH"], status:"Not Started"    },
  { id:18, name:"PHI Transmission Encryption",        description:"Ensure all electronic PHI transmitted across networks is encrypted.",                         domain:"Protect",  frameworks:["HIPAA","HITECH","HITRUST"],                        status:"Implemented"    },
  { id:19, name:"Audit Controls & Log Review",        description:"Implement mechanisms to record and examine access to PHI.",                                    domain:"Detect",   frameworks:["HIPAA","HITECH","HITRUST"],                        status:"Not Applicable" },
  { id:20, name:"Disaster Recovery Plan",             description:"Establish and test a disaster recovery plan covering critical healthcare systems.",            domain:"Recover",  frameworks:["NIST CSF","HIPAA","HITRUST","HITECH"],             status:"Not Started"    },
];
let nextId = 21;

const pct = (n,d) => d===0 ? 0 : Math.round((n/d)*100);
const scoreColor = s => s>=80?"#15803d":s>=50?"#92400e":"#9f1239";
const scoreBg    = s => s>=80?"#dcfce7":s>=50?"#fef3c7":"#fecaca";
const nowStr = () => new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"});

const Pill = ({ label, type }) => (
  <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:5, background:(type==="fw"?FW_COLOR:DOMAIN_COLOR)[label]||C.creamDk, color:(type==="fw"?FW_TEXT:DOMAIN_TEXT)[label]||C.muted, marginRight:3, marginBottom:3, display:"inline-block", whiteSpace:"nowrap" }}>{label}</span>
);
const StatusBadge = ({ s }) => {
  const m=STATUS_META[s];
  return <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, background:m.bg, color:m.text, border:`0.5px solid ${m.border}`, whiteSpace:"nowrap" }}>{s}</span>;
};

// Routes through Netlify function — API key lives server-side only
async function callAI(prompt) {
  const res = await fetch("/.netlify/functions/ai-proxy", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"claude-haiku-4-5-20251001", max_tokens:1500,
      system:"You are a senior GRC auditor for healthcare cybersecurity. Respond with a single valid JSON object only. No markdown, no explanation, no code fences.",
      messages:[{ role:"user", content:prompt }]
    })
  });
  if (!res.ok) { const e=await res.json().catch(()=>({})); throw new Error(e?.error?.message||`HTTP ${res.status}`); }
  const data = await res.json();
  const raw  = (data.content?.[0]?.text||"").trim().replace(/^```[a-z]*\n?/i,"").replace(/```$/,"").trim();
  const s=raw.indexOf("{"), e=raw.lastIndexOf("}");
  if (s===-1||e===-1) throw new Error("No JSON in response");
  return JSON.parse(raw.slice(s,e+1));
}

export default function ComplianceTracker() {
  const [controls,  setControls]  = useState(SEED);
  const [fwFilter,  setFwFilter]  = useState("All");
  const [domFilter, setDomFilter] = useState("All");
  const [stFilter,  setStFilter]  = useState("All");
  const [modal,     setModal]     = useState(null);
  const [activeTab, setActiveTab] = useState("controls");

  const blank = { name:"", description:"", domain:DOMAINS[0], frameworks:[], status:STATUSES[0] };
  const [form,          setForm]          = useState(blank);
  const [suggest,       setSuggest]       = useState(null);
  const [suggestLoading,setSuggestLoading]= useState(false);

  const [verifyScope,   setVerifyScope]   = useState("All");
  const [aiReport,      setAiReport]      = useState(null);
  const [aiLoading,     setAiLoading]     = useState(false);
  const [aiError,       setAiError]       = useState(null);
  const [savedReports,  setSavedReports]  = useState([]);
  const [viewingReport, setViewingReport] = useState(null);

  // localStorage persistence (replaces window.storage artifact API)
  useEffect(()=>{
    try { const v=localStorage.getItem("ct_saved_reports"); if(v) setSavedReports(JSON.parse(v)); } catch(e) {}
  },[]);

  const persistReports = (list) => {
    setSavedReports(list);
    try { localStorage.setItem("ct_saved_reports", JSON.stringify(list)); } catch(e) {}
  };

  const setF = k => v => setForm(f=>({...f,[k]:v}));
  const toggleFW = fw => setF("frameworks")(form.frameworks.includes(fw)?form.frameworks.filter(f=>f!==fw):[...form.frameworks,fw]);
  const openAdd  = () => { setForm(blank); setSuggest(null); setModal("add"); };
  const openEdit = c  => { setForm({name:c.name,description:c.description,domain:c.domain,frameworks:[...c.frameworks],status:c.status}); setSuggest(null); setModal(c); };
  const closeModal = () => { setModal(null); setSuggest(null); };
  const saveControl = () => {
    if (!form.name.trim()||form.frameworks.length===0) return;
    if (modal==="add") setControls(cs=>[...cs,{...form,id:nextId++}]);
    else setControls(cs=>cs.map(c=>c.id===modal.id?{...c,...form}:c));
    closeModal();
  };
  const deleteControl = id => { setControls(cs=>cs.filter(c=>c.id!==id)); closeModal(); };
  const updateStatus  = (id,st) => setControls(cs=>cs.map(c=>c.id===id?{...c,status:st}:c));

  const handleSuggest = async () => {
    if (!form.name.trim()) return;
    setSuggestLoading(true); setSuggest(null);
    try {
      const r = await callAI(`Control: "${form.name}"\nDescription: "${form.description}"\nWhich frameworks apply: NIST CSF, ISO 27001, SOC 2, HIPAA, HITRUST, HITECH?\nReturn ONLY JSON: {"frameworks":["..."],"rationale":{"FRAMEWORK":"one sentence"}}`);
      setSuggest(r);
    } catch(e) { setSuggest({error:"Could not generate suggestions. Please try again."}); }
    setSuggestLoading(false);
  };
  const applySuggestions = () => { if(suggest?.frameworks) setF("frameworks")(suggest.frameworks); setSuggest(null); };

  const handleVerify = async () => {
    setAiLoading(true); setAiReport(null); setAiError(null); setViewingReport(null);
    try {
      const scopedControls = verifyScope==="All" ? controls : controls.filter(c=>c.frameworks.includes(verifyScope));
      const fwScope = verifyScope==="All" ? FRAMEWORKS.join(", ") : verifyScope;
      const summary = scopedControls.map(c=>`${c.name}|${c.domain}|${c.frameworks.join("/")}|${c.status}`).join("\n");
      const prompt = `Healthcare compliance controls (name|domain|frameworks|status):\n${summary}\n\nAnalyze against: ${fwScope}.\nReturn ONLY JSON:\n{"overall_score":75,"summary":"Two sentences.","scope":"${verifyScope}","frameworks":[{"name":"...","score":80,"status":"On Track","gaps":["gap1"],"recommendations":["rec1"]}],"priority_actions":["action1"]}`;
      const parsed = await callAI(prompt);
      setAiReport(parsed);
    } catch(e) { setAiError(`Verification failed: ${e.message}`); }
    setAiLoading(false);
  };

  const saveReport = () => {
    if (!aiReport) return;
    const entry = { id: Date.now(), timestamp: nowStr(), scope: verifyScope, report: aiReport };
    persistReports([entry, ...savedReports].slice(0,10));
    const btn = document.getElementById("save-report-btn");
    if (btn) { btn.textContent="✓ Saved!"; setTimeout(()=>{ btn.textContent="Save Report"; },1800); }
  };

  const downloadReport = (rep, ts, scope) => {
    const fwRows = (rep.frameworks||[]).map(fw=>`
      <div class="fw-card">
        <div class="fw-header">
          <span class="fw-pill">${fw.name}</span>
          <span class="status-pill ${fw.status==="On Track"?"green":fw.status==="Needs Attention"?"yellow":"red"}">${fw.status}</span>
          <span class="score-pill" style="background:${scoreBg(fw.score)};color:${scoreColor(fw.score)}">${fw.score}/100</span>
        </div>
        ${fw.gaps?.length?`<p class="section-label red">GAPS</p><ul>${fw.gaps.map(g=>`<li>${g}</li>`).join("")}</ul>`:""}
        ${fw.recommendations?.length?`<p class="section-label green">RECOMMENDATIONS</p><ul>${fw.recommendations.map(r=>`<li>${r}</li>`).join("")}</ul>`:""}
      </div>`).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Compliance Report — ${ts}</title><style>
      *{box-sizing:border-box;margin:0;padding:0}body{font-family:Georgia,serif;background:#f4f0e6;color:#1a1a14;padding:40px;max-width:780px;margin:0 auto;font-size:14px;line-height:1.7}
      h1{font-size:26px;font-weight:normal;color:#1b2d1b;margin-bottom:4px}
      .meta{font-size:12px;color:#6b6b5e;margin-bottom:24px;font-family:Arial,sans-serif}
      .divider{height:3px;background:linear-gradient(90deg,#3b82f6,#f4f0e6);margin-bottom:28px}
      .score-circle{width:80px;height:80px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;margin-bottom:12px}
      .summary{font-size:14px;color:#6b6b5e;line-height:1.7;margin-bottom:24px}
      h2{font-size:15px;font-weight:600;color:#1a1a14;margin:20px 0 10px;font-family:Arial,sans-serif;letter-spacing:0.5px}
      .priority{background:#fff;border:1px solid #dbeafe;border-left:4px solid #3b82f6;border-radius:8px;padding:14px 18px;margin-bottom:24px}
      .priority ol{padding-left:18px}.priority li{font-size:13px;margin-bottom:5px;color:#1a1a14}
      .fw-card{background:#fff;border:0.5px solid rgba(26,26,20,0.1);border-radius:10px;padding:14px 18px;margin-bottom:12px}
      .fw-header{display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap}
      .fw-pill{font-size:11px;font-weight:600;padding:2px 10px;border-radius:5px;background:#dbeafe;color:#1e40af}
      .status-pill{font-size:11px;font-weight:600;padding:2px 10px;border-radius:20px}
      .green{background:#dcfce7;color:#15803d}.yellow{background:#fef3c7;color:#92400e}.red{background:#fecaca;color:#9f1239}
      .score-pill{font-size:12px;font-weight:700;padding:2px 10px;border-radius:10px;margin-left:auto}
      .section-label{font-size:10px;font-weight:700;letter-spacing:0.8px;margin:8px 0 4px;font-family:Arial,sans-serif}
      ul{padding-left:18px}li{font-size:12px;color:#6b6b5e;margin-bottom:3px}
      .footer{margin-top:40px;font-size:11px;color:#9ca3af;font-family:Arial,sans-serif;text-align:center}
    </style></head><body>
      <h1>Compliance Verification Report</h1>
      <p class="meta">Scope: <strong>${scope}</strong> &nbsp;·&nbsp; Generated: ${ts}</p>
      <div class="divider"></div>
      <div style="text-align:center">
        <div class="score-circle" style="background:${scoreBg(rep.overall_score)};color:${scoreColor(rep.overall_score)}">${rep.overall_score}</div>
        <p class="summary">${rep.summary}</p>
      </div>
      ${rep.priority_actions?.length?`<h2>PRIORITY ACTIONS</h2><div class="priority"><ol>${rep.priority_actions.map(a=>`<li>${a}</li>`).join("")}</ol></div>`:""}
      <h2>FRAMEWORK ANALYSIS</h2>${fwRows}
      <p class="footer">Generated by Compliance Control Tracker · Allied Healthcare GRC Portfolio</p>
    </body></html>`;

    const blob = new Blob([html],{type:"text/html"});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `compliance-report-${ts.replace(/[^a-z0-9]/gi,"-").toLowerCase()}.html`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); setTimeout(()=>URL.revokeObjectURL(url),1000);
  };

  const deleteReport = (id) => {
    const updated = savedReports.filter(r=>r.id!==id);
    persistReports(updated);
    if (viewingReport?.id===id) setViewingReport(null);
  };

  const filtered = useMemo(()=>controls.filter(c=>
    (fwFilter==="All"||c.frameworks.includes(fwFilter))&&
    (domFilter==="All"||c.domain===domFilter)&&
    (stFilter==="All"||c.status===stFilter)
  ),[controls,fwFilter,domFilter,stFilter]);

  const stats = useMemo(()=>{
    const total=controls.length, bySt=Object.fromEntries(STATUSES.map(s=>[s,controls.filter(c=>c.status===s).length]));
    return { total, bySt, implPct:pct(bySt["Implemented"],total),
      byFW:FRAMEWORKS.map(fw=>{ const m=controls.filter(c=>c.frameworks.includes(fw)),i=m.filter(c=>c.status==="Implemented").length; return{fw,total:m.length,impl:i,pct:pct(i,m.length)}; }),
      byDom:DOMAINS.map(d=>{ const m=controls.filter(c=>c.domain===d),i=m.filter(c=>c.status==="Implemented").length; return{d,total:m.length,impl:i,pct:pct(i,m.length)}; }),
    };
  },[controls]);

  const inputStyle = { width:"100%", boxSizing:"border-box", fontSize:13, padding:"7px 10px", borderRadius:6, border:`0.5px solid ${C.border}`, background:C.creamDk, color:C.ink, fontFamily:FONTS.sans, outline:"none" };

  const activeReport = viewingReport?.report || aiReport;
  const activeScope  = viewingReport?.scope  || verifyScope;
  const activeTs     = viewingReport?.timestamp || null;

  return (
    <div style={{ fontFamily:FONTS.sans, background:C.cream, minHeight:400, color:C.ink }}>
      <div style={{ background:C.forest, padding:"1.5rem 1.75rem" }}>
        <h2 style={{ fontFamily:FONTS.serif, fontSize:22, fontWeight:400, color:C.cream, margin:"0 0 4px" }}>Compliance Control Tracker</h2>
        <p style={{ fontSize:12, color:C.sageLt, margin:0 }}>NIST CSF · ISO 27001 · SOC 2 · HIPAA · HITRUST · HITECH</p>
      </div>
      <div style={{ height:3, background:`linear-gradient(90deg,${C.sage},${C.cream})` }}/>

      <div style={{ padding:"1.25rem 1.5rem" }}>
        <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
          {[["controls","Controls"],["summary","Gap Analysis"],["verify","✦ AI Verify"]].map(([t,label])=>(
            <button key={t} onClick={()=>{ setActiveTab(t); if(t!=="verify"){ setViewingReport(null); }}}
              style={{ fontSize:13, padding:"6px 18px", borderRadius:7, border:"none", cursor:"pointer", fontWeight:500,
                background:activeTab===t?(t==="verify"?C.sage:C.forest):C.creamDk, color:activeTab===t?C.cream:C.muted }}>
              {label}
            </button>
          ))}
          <button onClick={openAdd} style={{ marginLeft:"auto", fontSize:13, fontWeight:500, padding:"6px 16px", borderRadius:7, background:C.sage, color:"#fff", border:"none", cursor:"pointer" }}>
            + Add Control
          </button>
        </div>

        {/* CONTROLS TAB */}
        {activeTab==="controls" && (
          <>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:14 }}>
              {[["Framework",FRAMEWORKS,fwFilter,setFwFilter],["Domain",DOMAINS,domFilter,setDomFilter],["Status",STATUSES,stFilter,setStFilter]].map(([label,opts,val,set])=>(
                <div key={label} style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:11, fontWeight:500, color:C.muted }}>{label}</span>
                  <select value={val} onChange={e=>set(e.target.value)} style={{ fontSize:12, padding:"5px 8px", borderRadius:6, border:`0.5px solid ${C.border}`, background:"#fff", color:C.ink }}>
                    <option value="All">All</option>
                    {opts.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <span style={{ fontSize:12, color:C.muted, alignSelf:"center", marginLeft:"auto" }}>{filtered.length} of {controls.length}</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {filtered.length===0 && <p style={{ fontSize:13, color:C.muted }}>No controls match the current filters.</p>}
              {filtered.map(c=>{ const m=STATUS_META[c.status]; return (
                <div key={c.id} style={{ background:"#fff", border:`0.5px solid ${C.border}`, borderRadius:10, padding:"12px 14px", display:"flex", gap:14, alignItems:"flex-start" }}>
                  <div style={{ width:4, flexShrink:0, alignSelf:"stretch", borderRadius:4, background:DOMAIN_TEXT[c.domain]||C.sage }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10, flexWrap:"wrap", marginBottom:5 }}>
                      <span style={{ fontSize:13, fontWeight:500, color:C.ink }}>{c.name}</span>
                      <StatusBadge s={c.status}/>
                    </div>
                    <p style={{ fontSize:12, color:C.muted, margin:"0 0 8px", lineHeight:1.5 }}>{c.description}</p>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                      <Pill label={c.domain} type="dom"/>
                      {c.frameworks.map(fw=><Pill key={fw} label={fw} type="fw"/>)}
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:5, flexShrink:0 }}>
                    <select value={c.status} onChange={e=>updateStatus(c.id,e.target.value)} style={{ fontSize:11, padding:"4px 6px", borderRadius:5, border:`0.5px solid ${m.border}`, background:m.bg, color:m.text, cursor:"pointer" }}>
                      {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                    <div style={{ display:"flex", gap:5, justifyContent:"flex-end" }}>
                      <button onClick={()=>openEdit(c)} style={{ fontSize:11, padding:"3px 8px", borderRadius:5, border:`0.5px solid ${C.border}`, background:"none", cursor:"pointer", color:C.muted }}>✎ Edit</button>
                      <button onClick={()=>deleteControl(c.id)} style={{ fontSize:11, padding:"3px 8px", borderRadius:5, border:"0.5px solid #fca5a5", background:"none", cursor:"pointer", color:"#dc2626" }}>✕</button>
                    </div>
                  </div>
                </div>
              );})}
            </div>
          </>
        )}

        {/* GAP ANALYSIS TAB */}
        {activeTab==="summary" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ background:"#fff", border:`0.5px solid ${C.border}`, borderRadius:10, padding:"1.25rem" }}>
              <p style={{ fontSize:11, fontWeight:600, color:C.muted, letterSpacing:0.8, margin:"0 0 12px" }}>OVERALL IMPLEMENTATION</p>
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <div style={{ position:"relative", width:72, height:72, flexShrink:0 }}>
                  <svg viewBox="0 0 36 36" width="72" height="72">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke={C.creamDk} strokeWidth="3"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke={C.sage} strokeWidth="3" strokeDasharray={`${stats.implPct} ${100-stats.implPct}`} strokeDashoffset="25" strokeLinecap="round"/>
                  </svg>
                  <span style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:600, color:C.ink }}>{stats.implPct}%</span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
                    {STATUSES.map(s=>{ const m=STATUS_META[s]; return (
                      <div key={s} style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <div style={{ width:10, height:10, borderRadius:"50%", background:m.dot }}/>
                        <span style={{ fontSize:12, color:C.muted }}>{s}</span>
                        <span style={{ fontSize:13, fontWeight:600, color:C.ink }}>{stats.bySt[s]}</span>
                      </div>
                    );})}
                  </div>
                  <p style={{ fontSize:12, color:C.muted, margin:"8px 0 0" }}>{stats.bySt["Implemented"]} of {stats.total} controls implemented</p>
                </div>
              </div>
            </div>
            <div style={{ background:"#fff", border:`0.5px solid ${C.border}`, borderRadius:10, padding:"1.25rem" }}>
              <p style={{ fontSize:11, fontWeight:600, color:C.muted, letterSpacing:0.8, margin:"0 0 14px" }}>COVERAGE BY FRAMEWORK</p>
              {stats.byFW.map(({fw,total,impl,pct:p})=>(
                <div key={fw} style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:12, fontWeight:500, color:FW_TEXT[fw], background:FW_COLOR[fw], padding:"1px 8px", borderRadius:5 }}>{fw}</span>
                    <span style={{ fontSize:12, color:C.muted }}>{impl}/{total} · <strong style={{ color:C.ink }}>{p}%</strong></span>
                  </div>
                  <div style={{ height:7, background:C.creamDk, borderRadius:10, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${p}%`, background:C.sage, borderRadius:10 }}/>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background:"#fff", border:`0.5px solid ${C.border}`, borderRadius:10, padding:"1.25rem" }}>
              <p style={{ fontSize:11, fontWeight:600, color:C.muted, letterSpacing:0.8, margin:"0 0 14px" }}>COVERAGE BY NIST CSF DOMAIN</p>
              {stats.byDom.map(({d,total,impl,pct:p})=>(
                <div key={d} style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:12, fontWeight:500, color:DOMAIN_TEXT[d], background:DOMAIN_COLOR[d], padding:"1px 8px", borderRadius:5 }}>{d}</span>
                    <span style={{ fontSize:12, color:C.muted }}>{impl}/{total} · <strong style={{ color:C.ink }}>{p}%</strong></span>
                  </div>
                  <div style={{ height:7, background:C.creamDk, borderRadius:10, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${p}%`, background:DOMAIN_TEXT[d], borderRadius:10 }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI VERIFY TAB */}
        {activeTab==="verify" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ background:"#fff", border:`0.5px solid ${C.border}`, borderRadius:10, padding:"1.25rem" }}>
              <p style={{ fontSize:14, fontWeight:500, color:C.ink, margin:"0 0 5px" }}>✦ Live AI Compliance Verification</p>
              <p style={{ fontSize:12, color:C.muted, margin:"0 0 14px", lineHeight:1.6 }}>
                Sends your control inventory to Claude for analysis against current framework requirements. Select a specific framework or verify all at once.
              </p>
              <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <span style={{ fontSize:12, fontWeight:500, color:C.muted }}>Verify against</span>
                  <select value={verifyScope} onChange={e=>{ setVerifyScope(e.target.value); setAiReport(null); setViewingReport(null); }}
                    style={{ fontSize:13, padding:"6px 10px", borderRadius:7, border:`0.5px solid ${C.border}`, background:C.creamDk, color:C.ink, fontWeight:500 }}>
                    <option value="All">All Frameworks</option>
                    {FRAMEWORKS.map(fw=><option key={fw} value={fw}>{fw}</option>)}
                  </select>
                </div>
                <button onClick={handleVerify} disabled={aiLoading}
                  style={{ fontSize:13, fontWeight:500, padding:"7px 20px", borderRadius:7, background:aiLoading?C.creamDk:C.sage, color:aiLoading?C.muted:"#fff", border:"none", cursor:aiLoading?"not-allowed":"pointer", whiteSpace:"nowrap" }}>
                  {aiLoading ? "Analyzing…" : "Run Verification"}
                </button>
              </div>
            </div>

            {savedReports.length > 0 && !activeReport && (
              <div style={{ background:"#fff", border:`0.5px solid ${C.border}`, borderRadius:10, padding:"1.25rem" }}>
                <p style={{ fontSize:11, fontWeight:600, color:C.muted, letterSpacing:0.8, margin:"0 0 12px" }}>SAVED REPORTS ({savedReports.length})</p>
                <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                  {savedReports.map(r=>(
                    <div key={r.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:7, background:C.creamDk, flexWrap:"wrap" }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <span style={{ fontSize:13, fontWeight:500, color:C.ink }}>Score: </span>
                        <span style={{ fontSize:13, fontWeight:700, color:scoreColor(r.report.overall_score) }}>{r.report.overall_score}/100</span>
                        <span style={{ fontSize:12, color:C.muted, marginLeft:8 }}>· {r.scope} · {r.timestamp}</span>
                      </div>
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={()=>setViewingReport(r)} style={{ fontSize:11, padding:"3px 10px", borderRadius:5, border:`0.5px solid ${C.border}`, background:"#fff", cursor:"pointer", color:C.ink }}>View</button>
                        <button onClick={()=>downloadReport(r.report,r.timestamp,r.scope)} style={{ fontSize:11, padding:"3px 10px", borderRadius:5, border:`0.5px solid ${C.sage}`, background:C.sagePl, cursor:"pointer", color:C.sage, fontWeight:500 }}>↓ HTML</button>
                        <button onClick={()=>deleteReport(r.id)} style={{ fontSize:11, padding:"3px 8px", borderRadius:5, border:"0.5px solid #fca5a5", background:"none", cursor:"pointer", color:"#dc2626" }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiLoading && (
              <div style={{ background:"#fff", border:`0.5px solid ${C.border}`, borderRadius:10, padding:"2rem", textAlign:"center" }}>
                <div style={{ width:36, height:36, border:`3px solid ${C.sagePl}`, borderTopColor:C.sage, borderRadius:"50%", margin:"0 auto 14px", animation:"spin 0.8s linear infinite" }}/>
                <p style={{ fontSize:13, color:C.muted, margin:0 }}>Reviewing {verifyScope==="All"?controls.length:controls.filter(c=>c.frameworks.includes(verifyScope)).length} controls against {verifyScope==="All"?"all 6 frameworks":verifyScope}…</p>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            )}

            {aiError && <div style={{ background:"#fecaca", border:"0.5px solid #ef4444", borderRadius:10, padding:"1rem" }}><p style={{ fontSize:13, color:"#7f1d1d", margin:0 }}>{aiError}</p></div>}

            {activeReport && !aiLoading && (
              <>
                <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                  {viewingReport && (
                    <button onClick={()=>setViewingReport(null)} style={{ fontSize:12, padding:"5px 12px", borderRadius:6, border:`0.5px solid ${C.border}`, background:"none", cursor:"pointer", color:C.muted }}>← Back</button>
                  )}
                  {viewingReport && <span style={{ fontSize:12, color:C.muted }}>Viewing saved report · {activeTs}</span>}
                  <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
                    {!viewingReport && (
                      <button id="save-report-btn" onClick={saveReport}
                        style={{ fontSize:12, fontWeight:500, padding:"6px 14px", borderRadius:7, background:C.forest, color:C.cream, border:"none", cursor:"pointer" }}>
                        Save Report
                      </button>
                    )}
                    <button onClick={()=>downloadReport(activeReport, activeTs||nowStr(), activeScope)}
                      style={{ fontSize:12, fontWeight:500, padding:"6px 14px", borderRadius:7, background:C.sagePl, color:C.sage, border:`1px solid ${C.sageLt}`, cursor:"pointer" }}>
                      ↓ Download HTML
                    </button>
                  </div>
                </div>

                <div style={{ background:"#fff", border:`0.5px solid ${C.border}`, borderRadius:10, padding:"1.25rem" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                    <div style={{ width:64, height:64, borderRadius:"50%", background:scoreBg(activeReport.overall_score), display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:18, fontWeight:700, color:scoreColor(activeReport.overall_score) }}>{activeReport.overall_score}</span>
                    </div>
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <p style={{ fontSize:13, fontWeight:500, color:C.ink, margin:0 }}>Overall Compliance Score</p>
                        <span style={{ fontSize:11, padding:"2px 9px", borderRadius:10, background:FW_COLOR[activeScope]||C.creamDk, color:FW_TEXT[activeScope]||C.muted, fontWeight:600 }}>{activeScope}</span>
                      </div>
                      <p style={{ fontSize:13, color:C.muted, margin:0, lineHeight:1.6 }}>{activeReport.summary}</p>
                    </div>
                  </div>
                </div>

                {activeReport.priority_actions?.length>0 && (
                  <div style={{ background:"#fff", border:`1.5px solid ${C.sage}`, borderRadius:10, padding:"1.25rem" }}>
                    <p style={{ fontSize:11, fontWeight:600, color:C.sage, letterSpacing:0.8, margin:"0 0 12px" }}>PRIORITY ACTIONS</p>
                    <ol style={{ margin:0, paddingLeft:18 }}>
                      {activeReport.priority_actions.map((a,i)=><li key={i} style={{ fontSize:13, color:C.ink, marginBottom:7, lineHeight:1.5 }}>{a}</li>)}
                    </ol>
                  </div>
                )}

                {activeReport.frameworks?.map(fw=>(
                  <div key={fw.name} style={{ background:"#fff", border:`0.5px solid ${C.border}`, borderRadius:10, padding:"1.25rem" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10, flexWrap:"wrap" }}>
                      <Pill label={fw.name} type="fw"/>
                      <span style={{ fontSize:11, fontWeight:600, padding:"2px 10px", borderRadius:10,
                        background:fw.status==="On Track"?"#dcfce7":fw.status==="Needs Attention"?"#fef3c7":"#fecaca",
                        color:fw.status==="On Track"?"#15803d":fw.status==="Needs Attention"?"#92400e":"#9f1239",
                        border:`0.5px solid ${fw.status==="On Track"?"#86efac":fw.status==="Needs Attention"?"#ca8a04":"#ef4444"}` }}>
                        {fw.status}
                      </span>
                      <span style={{ fontSize:13, fontWeight:600, color:scoreColor(fw.score), background:scoreBg(fw.score), padding:"2px 10px", borderRadius:10, marginLeft:"auto" }}>{fw.score}/100</span>
                    </div>
                    {fw.gaps?.length>0&&(<><p style={{ fontSize:11, fontWeight:600, color:"#9f1239", margin:"0 0 6px", letterSpacing:0.5 }}>GAPS</p><ul style={{ margin:"0 0 10px", paddingLeft:16 }}>{fw.gaps.map((g,i)=><li key={i} style={{ fontSize:12, color:C.muted, marginBottom:4, lineHeight:1.5 }}>{g}</li>)}</ul></>)}
                    {fw.recommendations?.length>0&&(<><p style={{ fontSize:11, fontWeight:600, color:"#065f46", margin:"0 0 6px", letterSpacing:0.5 }}>RECOMMENDATIONS</p><ul style={{ margin:0, paddingLeft:16 }}>{fw.recommendations.map((r,i)=><li key={i} style={{ fontSize:12, color:C.muted, marginBottom:4, lineHeight:1.5 }}>{r}</li>)}</ul></>)}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div onClick={e=>{if(e.target===e.currentTarget)closeModal();}}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, padding:20 }}>
          <div style={{ background:C.cream, borderRadius:12, border:`0.5px solid ${C.border}`, padding:"1.5rem", width:"100%", maxWidth:480, maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <p style={{ margin:0, fontWeight:500, fontSize:16, color:C.ink }}>{modal==="add"?"Add Control":"Edit Control"}</p>
              <button onClick={closeModal} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:C.muted, padding:0 }}>✕</button>
            </div>
            <label style={{ fontSize:12, fontWeight:500, color:C.muted, display:"block", marginBottom:5 }}>Control Name *</label>
            <input value={form.name} onChange={e=>setF("name")(e.target.value)} placeholder="e.g. Access Control Policy" style={{ ...inputStyle, marginBottom:12 }}/>
            <label style={{ fontSize:12, fontWeight:500, color:C.muted, display:"block", marginBottom:5 }}>Description</label>
            <textarea value={form.description} onChange={e=>setF("description")(e.target.value)} rows={3} placeholder="Describe the control objective…" style={{ ...inputStyle, resize:"vertical", lineHeight:1.5, marginBottom:12 }}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:500, color:C.muted, display:"block", marginBottom:5 }}>Domain</label>
                <select value={form.domain} onChange={e=>setF("domain")(e.target.value)} style={inputStyle}>
                  {DOMAINS.map(d=><option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:500, color:C.muted, display:"block", marginBottom:5 }}>Status</label>
                <select value={form.status} onChange={e=>setF("status")(e.target.value)} style={inputStyle}>
                  {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
              <label style={{ fontSize:12, fontWeight:500, color:C.muted }}>Frameworks * (select all that apply)</label>
              <button onClick={handleSuggest} disabled={!form.name.trim()||suggestLoading}
                style={{ fontSize:11, padding:"3px 10px", borderRadius:6, border:`1px solid ${C.sage}`, background:C.sagePl, color:C.sage, cursor:form.name.trim()?"pointer":"not-allowed", fontWeight:500, opacity:form.name.trim()?1:0.5 }}>
                {suggestLoading?"Thinking…":"✦ AI Suggest"}
              </button>
            </div>
            {suggest&&!suggest.error&&(
              <div style={{ background:C.sagePl, border:`1px solid ${C.sageLt}`, borderRadius:8, padding:"10px 12px", marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
                  <span style={{ fontSize:11, fontWeight:600, color:C.sage }}>AI RECOMMENDATION</span>
                  <button onClick={applySuggestions} style={{ fontSize:11, padding:"3px 10px", borderRadius:5, background:C.sage, color:"#fff", border:"none", cursor:"pointer", fontWeight:500 }}>Apply All</button>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:8 }}>{suggest.frameworks.map(fw=><Pill key={fw} label={fw} type="fw"/>)}</div>
                {suggest.rationale&&<div style={{ display:"flex", flexDirection:"column", gap:3 }}>{Object.entries(suggest.rationale).map(([fw,r])=><p key={fw} style={{ fontSize:11, color:"#1e40af", margin:0, lineHeight:1.4 }}><strong>{fw}:</strong> {r}</p>)}</div>}
              </div>
            )}
            {suggest?.error&&<div style={{ background:"#fecaca", borderRadius:7, padding:"8px 12px", marginBottom:10 }}><p style={{ fontSize:12, color:"#7f1d1d", margin:0 }}>{suggest.error}</p></div>}
            <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:18 }}>
              {FRAMEWORKS.map(fw=>{ const sel=form.frameworks.includes(fw); return (
                <button key={fw} onClick={()=>toggleFW(fw)}
                  style={{ fontSize:12, padding:"4px 12px", borderRadius:6, cursor:"pointer", background:sel?FW_COLOR[fw]:C.creamDk, color:sel?FW_TEXT[fw]:C.muted, border:`1.5px solid ${sel?(FW_TEXT[fw]||C.sage):C.border}`, fontWeight:sel?600:400 }}>
                  {fw}
                </button>
              );})}
            </div>
            <div style={{ display:"flex", gap:8, justifyContent:"space-between" }}>
              {modal!=="add"&&<button onClick={()=>deleteControl(modal.id)} style={{ fontSize:12, padding:"7px 14px", borderRadius:7, border:"0.5px solid #fca5a5", background:"none", color:"#dc2626", cursor:"pointer" }}>Delete</button>}
              <div style={{ display:"flex", gap:8, marginLeft:"auto" }}>
                <button onClick={closeModal} style={{ fontSize:12, padding:"7px 14px", borderRadius:7 }}>Cancel</button>
                <button onClick={saveControl} disabled={!form.name.trim()||form.frameworks.length===0}
                  style={{ fontSize:12, fontWeight:500, padding:"7px 18px", borderRadius:7, background:C.forest, color:C.cream, border:"none", cursor:form.name.trim()&&form.frameworks.length>0?"pointer":"not-allowed", opacity:form.name.trim()&&form.frameworks.length>0?1:0.45 }}>
                  {modal==="add"?"Add Control":"Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}