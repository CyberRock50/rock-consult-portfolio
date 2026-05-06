import { useState, useMemo } from "react";

const T = {
  ink:      "#1a1a14",
  muted:    "#6b6b5e",
  white:    "#ffffff",
  cream:    "#e8e2d4",
  border:   "rgba(26,26,20,0.2)",
  borderLt: "rgba(26,26,20,0.1)",
  font:     "system-ui,-apple-system,'Segoe UI',Arial,sans-serif",
};

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

export default function RiskMatrix() {
  const [risks,     setRisks]     = useState(SEED);
  const [form,      setForm]      = useState(null);
  const [draft,     setDraft]     = useState("");
  const [draftCat,  setDraftCat]  = useState(CATEGORIES[0]);
  const [sevFilter, setSevFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");

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