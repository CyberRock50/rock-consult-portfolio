import { useState, useMemo, useEffect } from "react";

const FONTS = { sans:"system-ui,-apple-system,'Segoe UI',Arial,sans-serif", serif:"Georgia,'Times New Roman',serif" };

const C = {
  cream:"#f4f0e6", creamDk:"#e8e2d4", forest:"#1b2d1b",
  sage:"#3b82f6", sageLt:"#93c5fd", sagePl:"#dbeafe",
  ink:"#1a1a14", muted:"#6b6b5e", border:"rgba(26,26,20,0.1)",
};

const SEVERITIES = ["Critical","High","Medium","Low"];
const SEV_META = {
  Critical:{ bg:"#fecaca", border:"#ef4444", text:"#7f1d1d", dot:"#dc2626" },
  High:    { bg:"#fed7aa", border:"#f97316", text:"#7c2d12", dot:"#ea580c" },
  Medium:  { bg:"#fef08a", border:"#ca8a04", text:"#713f12", dot:"#ca8a04" },
  Low:     { bg:"#bbf7d0", border:"#22c55e", text:"#14532d", dot:"#16a34a" },
};

const CATEGORIES = ["PHI Breach","Ransomware","Unauthorized Access","System Outage","Policy Violation","Phishing","Equipment Loss","Insider Threat"];
const CAT_COLOR = {
  "PHI Breach":"#ffe4e6","Ransomware":"#fecaca","Unauthorized Access":"#fed7aa",
  "System Outage":"#fef3c7","Policy Violation":"#e8e2d4","Phishing":"#fce7f3",
  "Equipment Loss":"#dbeafe","Insider Threat":"#ede9fe",
};
const CAT_TEXT = {
  "PHI Breach":"#9f1239","Ransomware":"#7f1d1d","Unauthorized Access":"#7c2d12",
  "System Outage":"#92400e","Policy Violation":"#6b6b5e","Phishing":"#9d174d",
  "Equipment Loss":"#1e40af","Insider Threat":"#5b21b6",
};

const PHASES = ["Open","Investigating","Contained","Eradication","Recovery","Closed"];
const PHASE_LABELS = ["Detection","Analysis","Containment","Eradication","Recovery","Closed"];
const STATUS_META = {
  Open:         { bg:"#fecaca", border:"#ef4444", text:"#7f1d1d" },
  Investigating:{ bg:"#fed7aa", border:"#f97316", text:"#7c2d12" },
  Contained:    { bg:"#fef08a", border:"#ca8a04", text:"#713f12" },
  Eradication:  { bg:"#dbeafe", border:"#93c5fd", text:"#1e40af" },
  Recovery:     { bg:"#ede9fe", border:"#a78bfa", text:"#5b21b6" },
  Closed:       { bg:"#bbf7d0", border:"#22c55e", text:"#14532d" },
};
const HIPAA_CATS = ["PHI Breach","Ransomware","Equipment Loss","Insider Threat","Unauthorized Access"];

let nextId = 9;
const today = new Date().toISOString().split("T")[0];
const daysAgo = n => { const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().split("T")[0]; };

const SEED = [
  { id:1, title:"Ransomware Attack on EHR System",       description:"Crypto-ransomware detected on three clinical workstations accessing the primary EHR. Systems encrypted and isolated. Clinical staff reverted to paper-based workflows.",                                                          severity:"Critical", category:"Ransomware",           status:"Investigating", assignedTo:"James Okoye",   affectedSystems:"EHR Platform, Clinical Workstations x3",    dateDetected:daysAgo(2),  dateResolved:"",        hipaa:true,  playbook:null },
  { id:2, title:"PHI Exposed via Unsecured Email",        description:"Employee sent a spreadsheet containing 340 patient records including names, DOB, and diagnoses to an external vendor using personal email without encryption.",                                                                severity:"High",     category:"PHI Breach",           status:"Contained",    assignedTo:"Sandra Reyes",  affectedSystems:"Email Server, Patient Records Database",     dateDetected:daysAgo(5),  dateResolved:"",        hipaa:true,  playbook:null },
  { id:3, title:"Unauthorized Access to Patient Records", description:"Audit log review revealed a contractor account accessed 87 patient records outside their authorized scope over a 3-week period. No exfiltration confirmed.",                                                                  severity:"High",     category:"Unauthorized Access",  status:"Eradication",  assignedTo:"Marcus Lin",    affectedSystems:"Patient Records Portal",                     dateDetected:daysAgo(10), dateResolved:"",        hipaa:true,  playbook:null },
  { id:4, title:"Phishing Campaign Targeting Clinical Staff", description:"Mass phishing email impersonating IT department sent to 200+ staff. 12 employees clicked the link; 3 entered credentials. MFA blocked account takeover in all cases.",                                               severity:"Medium",   category:"Phishing",             status:"Recovery",     assignedTo:"Priya Nair",    affectedSystems:"Email, Staff Accounts",                      dateDetected:daysAgo(14), dateResolved:"",        hipaa:false, playbook:null },
  { id:5, title:"Encrypted Laptop Lost in Transit",       description:"Clinical coordinator reported a work laptop containing cached patient appointment data lost during travel. Device was encrypted with BitLocker; remote wipe initiated.",                                                      severity:"Medium",   category:"Equipment Loss",       status:"Closed",       assignedTo:"Sandra Reyes",  affectedSystems:"Endpoint — Laptop (Asset #4421)",            dateDetected:daysAgo(21), dateResolved:daysAgo(18), hipaa:true,  playbook:null },
  { id:6, title:"Billing System Outage — 6 Hours",        description:"Unplanned outage of the billing platform due to a failed patch deployment. Revenue cycle operations suspended for 6 hours. No data loss confirmed.",                                                                       severity:"Medium",   category:"System Outage",        status:"Closed",       assignedTo:"James Okoye",   affectedSystems:"Billing Platform, Payment Gateway",          dateDetected:daysAgo(30), dateResolved:daysAgo(29), hipaa:false, playbook:null },
  { id:7, title:"Policy Violation — Unauthorized Device", description:"Employee connected a personal USB drive to a clinical workstation in violation of acceptable use policy. Device scanned; no malware or data transfer detected.",                                                            severity:"Low",      category:"Policy Violation",     status:"Closed",       assignedTo:"Marcus Lin",    affectedSystems:"Clinical Workstation #07",                   dateDetected:daysAgo(45), dateResolved:daysAgo(44), hipaa:false, playbook:null },
  { id:8, title:"Suspicious Insider Data Access Pattern", description:"DLP system flagged a privileged user downloading an unusually large volume of patient records outside business hours over 4 consecutive nights. Investigation ongoing.",                                                    severity:"High",     category:"Insider Threat",       status:"Investigating", assignedTo:"Priya Nair",    affectedSystems:"Patient Records DB, DLP System",             dateDetected:daysAgo(3),  dateResolved:"",        hipaa:true,  playbook:null },
];

const daysBetween = (d1,d2) => {
  if (!d1||!d2) return null;
  return Math.round((new Date(d2)-new Date(d1))/(1000*60*60*24));
};
const nowStr = () => new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"});

// Routes through Netlify function — API key lives server-side only
async function callAI(prompt, system) {
  const res = await fetch("/.netlify/functions/ai-proxy",{
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"claude-haiku-4-5-20251001", max_tokens:1800,
      system: system||"You are a senior healthcare cybersecurity incident responder. Return only valid JSON, no markdown fences.",
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

const SevBadge = ({s}) => { const m=SEV_META[s]; return <span style={{fontSize:11,fontWeight:700,padding:"2px 10px",borderRadius:20,background:m.bg,color:m.text,border:`0.5px solid ${m.border}`,whiteSpace:"nowrap"}}>{s}</span>; };
const CatPill  = ({c}) => <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:5,background:CAT_COLOR[c]||C.creamDk,color:CAT_TEXT[c]||C.muted,whiteSpace:"nowrap"}}>{c}</span>;
const StBadge  = ({s}) => { const m=STATUS_META[s]; return <span style={{fontSize:11,fontWeight:600,padding:"2px 10px",borderRadius:20,background:m.bg,color:m.text,border:`0.5px solid ${m.border}`,whiteSpace:"nowrap"}}>{s}</span>; };

function PhaseBar({status}) {
  const idx = PHASES.indexOf(status);
  return (
    <div style={{marginTop:8}}>
      <div style={{display:"flex",gap:2}}>
        {PHASES.map((p,i)=>(
          <div key={p} style={{flex:1,height:5,borderRadius:3,
            background:i<=idx?(i===5?"#16a34a":i===0?"#dc2626":i===1?"#ea580c":i===2?"#ca8a04":i===3?"#3b82f6":"#a78bfa"):C.creamDk,
            transition:"background 0.3s"}}/>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
        <span style={{fontSize:9,color:C.muted}}>{PHASE_LABELS[0]}</span>
        <span style={{fontSize:9,fontWeight:idx===5?600:400,color:idx===5?"#16a34a":C.muted}}>{PHASE_LABELS[5]}</span>
      </div>
    </div>
  );
}

export default function IncidentLog() {
  const [incidents, setIncidents] = useState(SEED);
  const [activeTab, setActiveTab] = useState("log");
  const [sevFilter, setSevFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");
  const [stFilter,  setStFilter]  = useState("All");
  const [modal,     setModal]     = useState(null);
  const [playbook,  setPlaybook]  = useState(null);
  const [pbLoading, setPbLoading] = useState(null);

  const blank = { title:"", description:"", severity:SEVERITIES[0], category:CATEGORIES[0], status:PHASES[0], assignedTo:"", affectedSystems:"", dateDetected:today, dateResolved:"", hipaa:false };
  const [form,       setForm]       = useState(blank);
  const [triage,     setTriage]     = useState(null);
  const [triageLoad, setTriageLoad] = useState(false);

  const setF = k => v => setForm(f=>({...f,[k]:v}));

  useEffect(()=>{
    if(HIPAA_CATS.includes(form.category)) setF("hipaa")(true);
  },[form.category]);

  const openAdd  = () => { setForm(blank); setTriage(null); setModal("add"); };
  const openEdit = inc => { setForm({title:inc.title,description:inc.description,severity:inc.severity,category:inc.category,status:inc.status,assignedTo:inc.assignedTo,affectedSystems:inc.affectedSystems,dateDetected:inc.dateDetected,dateResolved:inc.dateResolved,hipaa:inc.hipaa}); setTriage(null); setModal(inc); };
  const closeModal = () => { setModal(null); setTriage(null); };

  const saveIncident = () => {
    if(!form.title.trim()) return;
    if(modal==="add") setIncidents(is=>[{...form,id:nextId++,playbook:null},...is]);
    else setIncidents(is=>is.map(i=>i.id===modal.id?{...i,...form}:i));
    closeModal();
  };
  const deleteIncident = id => { setIncidents(is=>is.filter(i=>i.id!==id)); closeModal(); setPlaybook(null); };
  const updateStatus   = (id,st) => setIncidents(is=>is.map(i=>i.id===id?{...i,status:st,dateResolved:st==="Closed"?today:i.dateResolved}:i));

  const handleTriage = async () => {
    if(!form.description.trim()) return;
    setTriageLoad(true); setTriage(null);
    try {
      const r = await callAI(
        `Incident title: "${form.title}"\nDescription: "${form.description}"\nClassify this healthcare security incident.\nReturn ONLY JSON: {"severity":"Critical|High|Medium|Low","category":"${CATEGORIES.join("|")}","hipaa":true|false,"rationale":"2 sentences explaining severity and category choice"}`,
        "You are a healthcare cybersecurity triage analyst. Return only valid JSON, no markdown."
      );
      setTriage(r);
    } catch(e){ setTriage({error:"Triage failed. Please try again."}); }
    setTriageLoad(false);
  };

  const applyTriage = () => {
    if(!triage||triage.error) return;
    setForm(f=>({...f, severity:triage.severity||f.severity, category:triage.category||f.category, hipaa:triage.hipaa??f.hipaa}));
    setTriage(null);
  };

  const handlePlaybook = async (inc) => {
    setPbLoading(inc.id); setPlaybook(null);
    try {
      const r = await callAI(
        `Healthcare incident: "${inc.title}" | Category: ${inc.category} | Severity: ${inc.severity} | HIPAA: ${inc.hipaa} | Systems: ${inc.affectedSystems}\nSummary: ${inc.description.slice(0,200)}\n\nGenerate a concise IR playbook. STRICT LIMITS: max 4 phases, max 4 steps each, max 3 items per other array. Keep each item under 20 words.\nReturn ONLY this JSON shape:\n{"title":"short title","phases":[{"phase":"name","steps":["step"]}],"hipaa_actions":["action"],"communication_tips":["tip"],"lessons_learned_prompts":["question"]}`,
        "You are a healthcare incident responder. Be concise. Return only valid JSON, no markdown, no extra text."
      );
      setPlaybook({incident:inc, content:r, generatedAt:nowStr()});
    } catch(e){ setPlaybook({error:`Playbook generation failed: ${e.message}`}); }
    setPbLoading(null);
  };

  const downloadPlaybook = (pb) => {
    const inc=pb.incident, c=pb.content;
    const phasesHtml=(c.phases||[]).map(p=>`<div class="phase"><h3>${p.phase}</h3><ol>${(p.steps||[]).map(s=>`<li>${s}</li>`).join("")}</ol></div>`).join("");
    const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>IR Playbook — ${inc.title}</title><style>
      *{box-sizing:border-box;margin:0;padding:0}body{font-family:Georgia,serif;background:#f4f0e6;color:#1a1a14;padding:40px;max-width:760px;margin:0 auto;font-size:14px;line-height:1.7}
      h1{font-size:24px;font-weight:normal;color:#1b2d1b;margin-bottom:4px}.meta{font-size:12px;color:#6b6b5e;margin-bottom:20px;font-family:Arial,sans-serif}
      .divider{height:3px;background:linear-gradient(90deg,#3b82f6,#f4f0e6);margin-bottom:28px}
      .badges{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}.badge{font-size:11px;font-weight:700;padding:3px 12px;border-radius:20px;font-family:Arial,sans-serif}
      .desc{background:#fff;border-radius:8px;padding:14px;font-size:13px;color:#6b6b5e;margin-bottom:24px;line-height:1.6}
      h2{font-size:15px;font-weight:600;color:#1a1a14;margin:20px 0 10px;font-family:Arial,sans-serif;letter-spacing:0.5px;text-transform:uppercase}
      .phase{background:#fff;border-radius:8px;padding:14px 18px;margin-bottom:10px;border-left:4px solid #3b82f6}.phase h3{font-size:13px;font-weight:600;color:#1b2d1b;margin-bottom:8px;font-family:Arial,sans-serif}
      ol,ul{padding-left:18px}li{font-size:13px;color:#1a1a14;margin-bottom:5px}
      .hipaa{background:#ffe4e6;border:1px solid #fca5a5;border-radius:8px;padding:14px 18px;margin-bottom:16px}.hipaa h3{color:#9f1239;font-size:13px;font-family:Arial,sans-serif;margin-bottom:8px}
      .tips{background:#dbeafe;border-radius:8px;padding:14px 18px;margin-bottom:16px}.tips h3{color:#1e40af;font-size:13px;font-family:Arial,sans-serif;margin-bottom:8px}
      .lessons{background:#d1fae5;border-radius:8px;padding:14px 18px}.lessons h3{color:#065f46;font-size:13px;font-family:Arial,sans-serif;margin-bottom:8px}
      .footer{margin-top:40px;font-size:11px;color:#9ca3af;font-family:Arial,sans-serif;text-align:center}
    </style></head><body>
      <h1>${c.title||"Incident Response Playbook"}</h1>
      <p class="meta">Incident: ${inc.title} &nbsp;·&nbsp; Generated: ${pb.generatedAt}</p>
      <div class="divider"></div>
      <div class="badges">
        <span class="badge" style="background:${SEV_META[inc.severity].bg};color:${SEV_META[inc.severity].text}">${inc.severity}</span>
        <span class="badge" style="background:${CAT_COLOR[inc.category]};color:${CAT_TEXT[inc.category]}">${inc.category}</span>
        <span class="badge" style="background:${STATUS_META[inc.status].bg};color:${STATUS_META[inc.status].text}">${inc.status}</span>
        ${inc.hipaa?'<span class="badge" style="background:#fecaca;color:#7f1d1d">⚠ HIPAA Reportable</span>':""}
      </div>
      <div class="desc">${inc.description}</div>
      ${inc.hipaa&&c.hipaa_actions?.length?`<div class="hipaa"><h3>⚠ HIPAA Notification Requirements</h3><ul>${c.hipaa_actions.map(a=>`<li>${a}</li>`).join("")}</ul></div>`:""}
      <h2>Response Phases</h2>${phasesHtml}
      ${c.communication_tips?.length?`<div class="tips"><h3>Communication Tips</h3><ul>${c.communication_tips.map(t=>`<li>${t}</li>`).join("")}</ul></div>`:""}
      ${c.lessons_learned_prompts?.length?`<div class="lessons"><h3>Lessons Learned Prompts</h3><ul>${c.lessons_learned_prompts.map(q=>`<li>${q}</li>`).join("")}</ul></div>`:""}
      <p class="footer">Generated by Incident Response Log · Allied Healthcare GRC Portfolio</p>
    </body></html>`;
    const blob=new Blob([html],{type:"text/html"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url; a.download=`ir-playbook-${inc.title.replace(/[^a-z0-9]/gi,"-").toLowerCase()}.html`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  };

  const filtered = useMemo(()=>incidents.filter(i=>
    (sevFilter==="All"||i.severity===sevFilter)&&
    (catFilter==="All"||i.category===catFilter)&&
    (stFilter==="All"||i.status===stFilter)
  ).sort((a,b)=>["Critical","High","Medium","Low"].indexOf(a.severity)-["Critical","High","Medium","Low"].indexOf(b.severity))
  ,[incidents,sevFilter,catFilter,stFilter]);

  const stats = useMemo(()=>{
    const open=incidents.filter(i=>i.status!=="Closed");
    const closed=incidents.filter(i=>i.status==="Closed");
    const withTime=closed.filter(i=>i.dateDetected&&i.dateResolved);
    const avgDays=withTime.length?Math.round(withTime.reduce((s,i)=>s+daysBetween(i.dateDetected,i.dateResolved),0)/withTime.length):null;
    const bySev=Object.fromEntries(SEVERITIES.map(s=>[s,incidents.filter(i=>i.severity===s).length]));
    const bySt=Object.fromEntries(PHASES.map(p=>[p,incidents.filter(i=>i.status===p).length]));
    const hipaa=incidents.filter(i=>i.hipaa).length;
    return {open:open.length,closed:closed.length,total:incidents.length,avgDays,bySev,bySt,hipaa};
  },[incidents]);

  const inputStyle={width:"100%",boxSizing:"border-box",fontSize:13,padding:"7px 10px",borderRadius:6,border:`0.5px solid ${C.border}`,background:C.creamDk,color:C.ink,fontFamily:FONTS.sans,outline:"none"};

  return (
    <div style={{fontFamily:FONTS.sans,background:C.cream,minHeight:400,color:C.ink}}>
      <div style={{background:C.forest,padding:"1.5rem 1.75rem"}}>
        <h2 style={{fontFamily:FONTS.serif,fontSize:22,fontWeight:400,color:C.cream,margin:"0 0 4px"}}>Incident Response Log</h2>
        <p style={{fontSize:12,color:C.sageLt,margin:0}}>NIST IR · HIPAA Breach Notification · Healthcare Security Incidents</p>
      </div>
      <div style={{height:3,background:`linear-gradient(90deg,${C.sage},${C.cream})`}}/>

      <div style={{padding:"1.25rem 1.5rem"}}>
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          {[["log","Incident Log"],["dashboard","Dashboard"],["playbook","✦ AI Playbook"]].map(([t,label])=>(
            <button key={t} onClick={()=>setActiveTab(t)}
              style={{fontSize:13,padding:"6px 18px",borderRadius:7,border:"none",cursor:"pointer",fontWeight:500,
                background:activeTab===t?(t==="playbook"?C.sage:C.forest):C.creamDk,
                color:activeTab===t?C.cream:C.muted}}>
              {label}
            </button>
          ))}
          <button onClick={openAdd} style={{marginLeft:"auto",fontSize:13,fontWeight:500,padding:"6px 16px",borderRadius:7,background:C.sage,color:"#fff",border:"none",cursor:"pointer"}}>
            + Log Incident
          </button>
        </div>

        {/* INCIDENT LOG TAB */}
        {activeTab==="log" && (
          <>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
              {[["Severity",SEVERITIES,sevFilter,setSevFilter],["Category",CATEGORIES,catFilter,setCatFilter],["Status",PHASES,stFilter,setStFilter]].map(([label,opts,val,set])=>(
                <div key={label} style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:11,fontWeight:500,color:C.muted}}>{label}</span>
                  <select value={val} onChange={e=>set(e.target.value)} style={{fontSize:12,padding:"5px 8px",borderRadius:6,border:`0.5px solid ${C.border}`,background:"#fff",color:C.ink}}>
                    <option value="All">All</option>
                    {opts.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <span style={{fontSize:12,color:C.muted,marginLeft:"auto"}}>{filtered.length} of {incidents.length}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {filtered.length===0 && <p style={{fontSize:13,color:C.muted}}>No incidents match current filters.</p>}
              {filtered.map(inc=>{
                const m=SEV_META[inc.severity];
                const days=inc.dateResolved?daysBetween(inc.dateDetected,inc.dateResolved):daysBetween(inc.dateDetected,today);
                return (
                  <div key={inc.id} style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"12px 14px",display:"flex",gap:12,alignItems:"flex-start"}}>
                    <div style={{width:4,flexShrink:0,alignSelf:"stretch",borderRadius:4,background:m.dot}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,flexWrap:"wrap",marginBottom:6}}>
                        <div>
                          <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:4}}>
                            <span style={{fontSize:13,fontWeight:500,color:C.ink}}>{inc.title}</span>
                            {inc.hipaa && <span style={{fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:10,background:"#fecaca",color:"#7f1d1d",border:"0.5px solid #ef4444"}}>⚠ HIPAA</span>}
                          </div>
                          <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                            <SevBadge s={inc.severity}/>
                            <CatPill c={inc.category}/>
                            <span style={{fontSize:11,color:C.muted}}>· {inc.assignedTo||"Unassigned"}</span>
                            <span style={{fontSize:11,color:C.muted}}>· {days} day{days!==1?"s":""} {inc.dateResolved?"to resolve":"open"}</span>
                          </div>
                        </div>
                        <StBadge s={inc.status}/>
                      </div>
                      <p style={{fontSize:12,color:C.muted,margin:"0 0 8px",lineHeight:1.5}}>{inc.description}</p>
                      <PhaseBar status={inc.status}/>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:5,flexShrink:0}}>
                      <select value={inc.status} onChange={e=>updateStatus(inc.id,e.target.value)}
                        style={{fontSize:11,padding:"4px 6px",borderRadius:5,border:`0.5px solid ${STATUS_META[inc.status].border}`,background:STATUS_META[inc.status].bg,color:STATUS_META[inc.status].text,cursor:"pointer"}}>
                        {PHASES.map(p=><option key={p} value={p}>{p}</option>)}
                      </select>
                      <button onClick={()=>openEdit(inc)} style={{fontSize:11,padding:"3px 8px",borderRadius:5,border:`0.5px solid ${C.border}`,background:"none",cursor:"pointer",color:C.muted}}>✎ Edit</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* DASHBOARD TAB */}
        {activeTab==="dashboard" && (
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <style>{`.kpi-card{perspective:600px;cursor:pointer}.kpi-inner{position:relative;width:100%;height:90px;transform-style:preserve-3d;transition:transform 0.55s cubic-bezier(.4,0,.2,1)}.kpi-card:hover .kpi-inner{transform:rotateY(180deg)}.kpi-front,.kpi-back{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px;text-align:center}.kpi-back{transform:rotateY(180deg)}`}</style>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10}}>
              {[
                {label:"Total",            val:stats.total,   color:C.ink,    bg:"#fff",    backBg:"#f0f0e8", desc:"All incidents logged across every severity level and lifecycle stage."},
                {label:"Open",             val:stats.open,    color:"#dc2626",bg:"#fecaca", backBg:"#fda4af", desc:"Active incidents not yet resolved — requiring immediate attention."},
                {label:"Closed",           val:stats.closed,  color:"#15803d",bg:"#dcfce7", backBg:"#86efac", desc:"Fully resolved incidents that have completed the response lifecycle."},
                {label:"HIPAA Reportable", val:stats.hipaa,   color:"#9f1239",bg:"#ffe4e6", backBg:"#fecdd3", desc:"Incidents flagged as potential HIPAA breaches requiring notification review."},
                {label:"Avg. Days to Resolve",val:stats.avgDays!==null?`${stats.avgDays}d`:"—",color:"#1e40af",bg:C.sagePl,backBg:"#93c5fd",desc:"Mean time from detection to closure across all resolved incidents."},
              ].map(k=>(
                <div key={k.label} className="kpi-card">
                  <div className="kpi-inner">
                    <div className="kpi-front" style={{background:k.bg,border:`0.5px solid ${C.border}`}}>
                      <p style={{fontSize:26,fontWeight:700,color:k.color,margin:"0 0 4px",lineHeight:1}}>{k.val}</p>
                      <p style={{fontSize:11,color:C.muted,margin:0,lineHeight:1.3}}>{k.label}</p>
                    </div>
                    <div className="kpi-back" style={{background:k.backBg,border:`0.5px solid ${C.border}`}}>
                      <p style={{fontSize:11,color:k.color,margin:0,lineHeight:1.5,fontWeight:500}}>{k.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
              <p style={{fontSize:11,fontWeight:600,color:C.muted,letterSpacing:0.8,margin:"0 0 14px"}}>BY SEVERITY</p>
              {SEVERITIES.map(s=>{
                const m=SEV_META[s],n=stats.bySev[s],p=Math.round((n/stats.total)*100)||0;
                return (
                  <div key={s} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:12,fontWeight:600,color:m.text,background:m.bg,padding:"1px 9px",borderRadius:5,border:`0.5px solid ${m.border}`}}>{s}</span>
                      <span style={{fontSize:12,color:C.muted}}>{n} incident{n!==1?"s":""} · <strong style={{color:C.ink}}>{p}%</strong></span>
                    </div>
                    <div style={{height:7,background:C.creamDk,borderRadius:10,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${p}%`,background:m.dot,borderRadius:10}}/>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
              <p style={{fontSize:11,fontWeight:600,color:C.muted,letterSpacing:0.8,margin:"0 0 14px"}}>BY LIFECYCLE PHASE</p>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {PHASES.map(p=>{
                  const m=STATUS_META[p],n=stats.bySt[p];
                  return (
                    <div key={p} style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:11,fontWeight:600,color:m.text,background:m.bg,padding:"2px 10px",borderRadius:20,border:`0.5px solid ${m.border}`,minWidth:100,textAlign:"center"}}>{p}</span>
                      <div style={{flex:1,height:7,background:C.creamDk,borderRadius:10,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${Math.round((n/stats.total)*100)||0}%`,background:m.border,borderRadius:10}}/>
                      </div>
                      <span style={{fontSize:13,fontWeight:600,color:C.ink,minWidth:20,textAlign:"right"}}>{n}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
              <p style={{fontSize:11,fontWeight:600,color:C.muted,letterSpacing:0.8,margin:"0 0 14px"}}>RECENT INCIDENTS</p>
              <div style={{display:"flex",flexDirection:"column",gap:0}}>
                {[...incidents].sort((a,b)=>new Date(b.dateDetected)-new Date(a.dateDetected)).slice(0,6).map((inc,i,arr)=>{
                  const m=SEV_META[inc.severity];
                  return (
                    <div key={inc.id} style={{display:"flex",gap:12,paddingBottom:i<arr.length-1?12:0,marginBottom:i<arr.length-1?12:0,borderBottom:i<arr.length-1?`0.5px solid ${C.border}`:"none"}}>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                        <div style={{width:10,height:10,borderRadius:"50%",background:m.dot,flexShrink:0,marginTop:4}}/>
                        {i<arr.length-1&&<div style={{width:1,flex:1,background:C.border,marginTop:4}}/>}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontSize:13,fontWeight:500,color:C.ink,margin:"0 0 2px"}}>{inc.title}</p>
                        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                          <SevBadge s={inc.severity}/><StBadge s={inc.status}/>
                          <span style={{fontSize:11,color:C.muted}}>{inc.dateDetected}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* AI PLAYBOOK TAB */}
        {activeTab==="playbook" && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1.25rem"}}>
              <p style={{fontSize:14,fontWeight:500,color:C.ink,margin:"0 0 5px"}}>✦ AI Incident Response Playbook</p>
              <p style={{fontSize:12,color:C.muted,margin:0,lineHeight:1.6}}>Select an incident below to generate a tailored step-by-step response playbook using Claude. Includes HIPAA notification guidance for reportable incidents.</p>
            </div>
            {playbook?.error && <div style={{background:"#fecaca",border:"0.5px solid #ef4444",borderRadius:10,padding:"1rem"}}><p style={{fontSize:13,color:"#7f1d1d",margin:0}}>{playbook.error}</p></div>}
            {playbook?.content && (
              <div style={{background:"#fff",border:`1.5px solid ${C.sage}`,borderRadius:10,padding:"1.25rem"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:12,flexWrap:"wrap"}}>
                  <div>
                    <p style={{fontSize:14,fontWeight:500,color:C.ink,margin:"0 0 3px"}}>{playbook.content.title}</p>
                    <p style={{fontSize:11,color:C.muted,margin:0}}>For: {playbook.incident.title} · Generated {playbook.generatedAt}</p>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>setPlaybook(null)} style={{fontSize:11,padding:"5px 11px",borderRadius:6,border:`0.5px solid ${C.border}`,background:"none",cursor:"pointer",color:C.muted}}>✕ Close</button>
                    <button onClick={()=>downloadPlaybook(playbook)} style={{fontSize:11,fontWeight:500,padding:"5px 13px",borderRadius:6,background:C.sagePl,color:C.sage,border:`1px solid ${C.sageLt}`,cursor:"pointer"}}>↓ Download HTML</button>
                  </div>
                </div>
                {playbook.incident.hipaa && playbook.content.hipaa_actions?.length>0 && (
                  <div style={{background:"#fecaca",border:"0.5px solid #ef4444",borderRadius:8,padding:"10px 14px",marginBottom:12}}>
                    <p style={{fontSize:11,fontWeight:700,color:"#7f1d1d",margin:"0 0 6px",letterSpacing:0.5}}>⚠ HIPAA NOTIFICATION REQUIREMENTS</p>
                    <ul style={{margin:0,paddingLeft:16}}>{playbook.content.hipaa_actions.map((a,i)=><li key={i} style={{fontSize:12,color:"#7f1d1d",marginBottom:3,lineHeight:1.5}}>{a}</li>)}</ul>
                  </div>
                )}
                {(playbook.content.phases||[]).map(ph=>(
                  <div key={ph.phase} style={{marginBottom:10,padding:"10px 14px",background:C.creamDk,borderRadius:8,borderLeft:`3px solid ${C.sage}`}}>
                    <p style={{fontSize:12,fontWeight:600,color:C.ink,margin:"0 0 6px"}}>{ph.phase}</p>
                    <ol style={{margin:0,paddingLeft:16}}>{(ph.steps||[]).map((s,i)=><li key={i} style={{fontSize:12,color:C.muted,marginBottom:3,lineHeight:1.5}}>{s}</li>)}</ol>
                  </div>
                ))}
                {playbook.content.communication_tips?.length>0 && (
                  <div style={{background:C.sagePl,border:`0.5px solid ${C.sageLt}`,borderRadius:8,padding:"10px 14px",marginBottom:8}}>
                    <p style={{fontSize:11,fontWeight:700,color:C.sage,margin:"0 0 6px",letterSpacing:0.5}}>COMMUNICATION TIPS</p>
                    <ul style={{margin:0,paddingLeft:16}}>{playbook.content.communication_tips.map((t,i)=><li key={i} style={{fontSize:12,color:C.ink,marginBottom:3,lineHeight:1.5}}>{t}</li>)}</ul>
                  </div>
                )}
                {playbook.content.lessons_learned_prompts?.length>0 && (
                  <div style={{background:"#d1fae5",border:"0.5px solid #6ee7b7",borderRadius:8,padding:"10px 14px"}}>
                    <p style={{fontSize:11,fontWeight:700,color:"#065f46",margin:"0 0 6px",letterSpacing:0.5}}>LESSONS LEARNED PROMPTS</p>
                    <ul style={{margin:0,paddingLeft:16}}>{playbook.content.lessons_learned_prompts.map((q,i)=><li key={i} style={{fontSize:12,color:"#065f46",marginBottom:3,lineHeight:1.5}}>{q}</li>)}</ul>
                  </div>
                )}
              </div>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {incidents.filter(i=>i.status!=="Closed").concat(incidents.filter(i=>i.status==="Closed")).map(inc=>{
                const m=SEV_META[inc.severity],loading=pbLoading===inc.id;
                return (
                  <div key={inc.id} style={{background:"#fff",border:`0.5px solid ${C.border}`,borderRadius:10,padding:"12px 14px",display:"flex",gap:12,alignItems:"center"}}>
                    <div style={{width:4,flexShrink:0,alignSelf:"stretch",borderRadius:4,background:m.dot}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                        <span style={{fontSize:13,fontWeight:500,color:C.ink}}>{inc.title}</span>
                        {inc.hipaa&&<span style={{fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:10,background:"#fecaca",color:"#7f1d1d"}}>⚠ HIPAA</span>}
                      </div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                        <SevBadge s={inc.severity}/><CatPill c={inc.category}/><StBadge s={inc.status}/>
                      </div>
                    </div>
                    <button onClick={()=>handlePlaybook(inc)} disabled={loading||pbLoading!==null}
                      style={{fontSize:12,fontWeight:500,padding:"6px 14px",borderRadius:7,background:loading?C.creamDk:C.forest,color:loading?C.muted:C.cream,border:"none",cursor:loading||pbLoading!==null?"not-allowed":"pointer",whiteSpace:"nowrap",flexShrink:0}}>
                      {loading?"Generating…":"✦ Generate"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div onClick={e=>{if(e.target===e.currentTarget)closeModal();}}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:20}}>
          <div style={{background:C.cream,borderRadius:12,border:`0.5px solid ${C.border}`,padding:"1.5rem",width:"100%",maxWidth:500,maxHeight:"92vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <p style={{margin:0,fontWeight:500,fontSize:16,color:C.ink}}>{modal==="add"?"Log Incident":"Edit Incident"}</p>
              <button onClick={closeModal} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:C.muted,padding:0}}>✕</button>
            </div>
            <label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Title *</label>
            <input value={form.title} onChange={e=>setF("title")(e.target.value)} placeholder="e.g. Ransomware on EHR System" style={{...inputStyle,marginBottom:12}}/>
            <label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Description</label>
            <textarea value={form.description} onChange={e=>setF("description")(e.target.value)} rows={3} placeholder="Describe what happened…" style={{...inputStyle,resize:"vertical",lineHeight:1.5,marginBottom:12}}/>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:12,fontWeight:500,color:C.muted}}>Classification</span>
              <button onClick={handleTriage} disabled={!form.description.trim()||triageLoad}
                style={{fontSize:11,padding:"3px 10px",borderRadius:6,border:`1px solid ${C.sage}`,background:C.sagePl,color:C.sage,cursor:form.description.trim()?"pointer":"not-allowed",fontWeight:500,opacity:form.description.trim()?1:0.5}}>
                {triageLoad?"Analyzing…":"✦ AI Triage"}
              </button>
            </div>
            {triage&&!triage.error&&(
              <div style={{background:C.sagePl,border:`1px solid ${C.sageLt}`,borderRadius:8,padding:"10px 12px",marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                  <span style={{fontSize:11,fontWeight:600,color:C.sage}}>AI TRIAGE RECOMMENDATION</span>
                  <button onClick={applyTriage} style={{fontSize:11,padding:"3px 10px",borderRadius:5,background:C.sage,color:"#fff",border:"none",cursor:"pointer",fontWeight:500}}>Apply</button>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
                  <SevBadge s={triage.severity}/><CatPill c={triage.category}/>
                  {triage.hipaa&&<span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10,background:"#fecaca",color:"#7f1d1d"}}>⚠ HIPAA</span>}
                </div>
                <p style={{fontSize:11,color:"#1e40af",margin:0,lineHeight:1.4}}>{triage.rationale}</p>
              </div>
            )}
            {triage?.error&&<div style={{background:"#fecaca",borderRadius:7,padding:"8px 12px",marginBottom:12}}><p style={{fontSize:12,color:"#7f1d1d",margin:0}}>{triage.error}</p></div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div><label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Severity</label><select value={form.severity} onChange={e=>setF("severity")(e.target.value)} style={inputStyle}>{SEVERITIES.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
              <div><label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Category</label><select value={form.category} onChange={e=>setF("category")(e.target.value)} style={inputStyle}>{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
              <div><label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Status</label><select value={form.status} onChange={e=>setF("status")(e.target.value)} style={inputStyle}>{PHASES.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
              <div><label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Assigned To</label><input value={form.assignedTo} onChange={e=>setF("assignedTo")(e.target.value)} placeholder="Responder name" style={inputStyle}/></div>
              <div><label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Date Detected</label><input type="date" value={form.dateDetected} onChange={e=>setF("dateDetected")(e.target.value)} style={inputStyle}/></div>
              <div><label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Date Resolved</label><input type="date" value={form.dateResolved} onChange={e=>setF("dateResolved")(e.target.value)} style={inputStyle}/></div>
            </div>
            <label style={{fontSize:12,fontWeight:500,color:C.muted,display:"block",marginBottom:5}}>Affected Systems</label>
            <input value={form.affectedSystems} onChange={e=>setF("affectedSystems")(e.target.value)} placeholder="e.g. EHR Platform, Workstation #3" style={{...inputStyle,marginBottom:12}}/>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:form.hipaa?"#fecaca":C.creamDk,border:`0.5px solid ${form.hipaa?"#ef4444":C.border}`,borderRadius:8,marginBottom:18,cursor:"pointer"}} onClick={()=>setF("hipaa")(!form.hipaa)}>
              <div style={{width:16,height:16,borderRadius:4,border:`1.5px solid ${form.hipaa?"#dc2626":C.muted}`,background:form.hipaa?"#dc2626":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {form.hipaa&&<span style={{fontSize:11,color:"#fff",fontWeight:700}}>✓</span>}
              </div>
              <span style={{fontSize:13,color:form.hipaa?"#7f1d1d":C.muted,fontWeight:form.hipaa?500:400}}>⚠ HIPAA Reportable Incident — breach notification may be required</span>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"space-between"}}>
              {modal!=="add"&&<button onClick={()=>deleteIncident(modal.id)} style={{fontSize:12,padding:"7px 14px",borderRadius:7,border:"0.5px solid #fca5a5",background:"none",color:"#dc2626",cursor:"pointer"}}>Delete</button>}
              <div style={{display:"flex",gap:8,marginLeft:"auto"}}>
                <button onClick={closeModal} style={{fontSize:12,padding:"7px 14px",borderRadius:7}}>Cancel</button>
                <button onClick={saveIncident} disabled={!form.title.trim()}
                  style={{fontSize:12,fontWeight:500,padding:"7px 18px",borderRadius:7,background:form.title.trim()?C.forest:C.creamDk,color:form.title.trim()?C.cream:C.muted,border:"none",cursor:form.title.trim()?"pointer":"not-allowed",opacity:form.title.trim()?1:0.45}}>
                  {modal==="add"?"Log Incident":"Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}