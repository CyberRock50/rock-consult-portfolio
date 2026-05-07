import { useState, useRef } from "react";
import RiskMatrix from './RiskMatrix';
import StaffScheduler from './StaffScheduler';

const C = {
  cream:    "#f4f0e6",
  creamDk:  "#e8e2d4",
  forest:   "#1b2d1b",
  forestMd: "#2e4a2e",
  sage:     "#3b82f6",
  sageLt:   "#93c5fd",
  sagePl:   "#dbeafe",
  ink:      "#1a1a14",
  muted:    "#6b6b5e",
  white:    "#ffffff",
};
const F = { serif: "Georgia,'Times New Roman',serif", sans: "system-ui,-apple-system,'Segoe UI',Arial,sans-serif" };

const PROJECTS = [
  { id:"staff-scheduler",   title:"Staff Scheduler",              icon:"sched",  featured:true,  live:true,  status:"live",   year:"2025", tags:["React","Scheduling","AI","Operations","Healthcare"],   description:"Autonomous AI-powered weekly scheduling for 50 staff across 6 sites and 3 shifts. Drag-and-drop interface, conflict detection with undo, and Claude-generated conflict-free schedules." },
  { id:"risk-matrix",       title:"Risk Matrix",                  icon:"risk",   featured:false, live:true,  status:"live",   year:"2025", tags:["React","GRC","Risk Management","Healthcare"],          description:"Interactive 5×5 risk matrix for healthcare GRC. Add, edit, and categorize risks with severity scoring and visual heat-map display." },
  { id:"compliance-tracker",title:"Compliance Control Tracker",   icon:"check",  featured:false, live:false, status:"coming", year:"2025", tags:["React","HIPAA","NIST","Compliance"],                   description:"Track controls across HIPAA, NIST, and SOC 2 frameworks with real-time status dashboards." },
  { id:"incident-log",      title:"Incident Log",                 icon:"alert",  featured:false, live:false, status:"coming", year:"2025", tags:["React","Incident Response","Healthcare"],              description:"Structured incident reporting and tracking with severity classification and trend analysis." },
  { id:"vendor-scorecard",  title:"Vendor Scorecard",             icon:"score",  featured:false, live:false, status:"coming", year:"2025", tags:["React","Third-Party Risk","GRC"],                     description:"Third-party risk assessment tool for evaluating healthcare vendors against compliance and security criteria." },
  { id:"policy-gap",        title:"Policy Gap Analyzer",          icon:"gap",    featured:false, live:false, status:"coming", year:"2025", tags:["React","Policy","Gap Analysis","Healthcare"],          description:"Compare policies against regulatory frameworks and identify gaps with prioritized remediation recommendations." },
  { id:"training-tracker",  title:"Training Compliance Tracker",  icon:"train",  featured:false, live:false, status:"coming", year:"2025", tags:["React","Training","Compliance","Healthcare"],          description:"Monitor staff training completion, certifications, and compliance deadlines across departments." },
];

// ── Icon components ──────────────────────────────────────────────────────────
function LogoIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="7" fill={C.forest}/>
      <rect x="7"  y="7"  width="7" height="7" rx="1.5" fill={C.cream}/>
      <rect x="18" y="7"  width="7" height="7" rx="1.5" fill={C.cream}/>
      <rect x="7"  y="18" width="7" height="7" rx="1.5" fill={C.cream}/>
      <rect x="18" y="18" width="7" height="7" rx="1.5" fill={C.cream}/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );
}

function ProjectIcon({ type, size = 48, bg = C.sagePl }) {
  const s = size * 0.45;
  const icons = {
    sched: <><rect x={(size-s)/2} y={(size-s*1.1)/2} width={s} height={s*1.1} rx="3" fill={C.sage} opacity=".25"/><rect x={(size-s)/2} y={(size-s*1.1)/2} width={s} height={s*1.1} rx="3" stroke={C.sage} strokeWidth="1.5" fill="none"/><line x1={(size-s)/2+3} y1={(size-s*1.1)/2+s*0.3} x2={(size-s)/2+s-3} y2={(size-s*1.1)/2+s*0.3} stroke={C.sage} strokeWidth="1.2"/>{[0.5,0.65,0.8].map((r,i)=><line key={i} x1={(size-s)/2+3} y1={(size-s*1.1)/2+s*r} x2={(size-s)/2+s*0.6} y2={(size-s*1.1)/2+s*r} stroke={C.sage} strokeWidth="1"/>)}</>,
    risk:  <><rect x={(size-s)/2} y={(size-s)/2} width={s} height={s} rx="2" fill={C.sage} opacity=".15"/>{[[0,0,"#bbf7d0"],[1,0,"#fef08a"],[0,1,"#fed7aa"],[1,1,"#fecaca"]].map(([cx,cy,f],i)=><rect key={i} x={(size-s)/2+cx*(s/2+1)} y={(size-s)/2+cy*(s/2+1)} width={s/2-1} height={s/2-1} rx="1.5" fill={f}/>)}</>,
    check: <><circle cx={size/2} cy={size/2} r={s/2} fill={C.sage} opacity=".15" stroke={C.sage} strokeWidth="1.5"/><polyline points={`${size/2-s/5},${size/2} ${size/2-s/12},${size/2+s/7} ${size/2+s/5},${size/2-s/8}`} fill="none" stroke={C.sage} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    alert: <><polygon points={`${size/2},${(size-s)/2} ${(size-s)/2+s},${(size-s)/2+s} ${(size-s)/2},${(size-s)/2+s}`} fill="#fed7aa" stroke="#f97316" strokeWidth="1.5"/><text x={size/2} y={(size-s)/2+s*0.72} textAnchor="middle" fontSize={s*0.45} fontWeight="bold" fill="#c2410c">!</text></>,
    score: <><rect x={(size-s)/2} y={(size-s)/2+s*0.2} width={s*0.25} height={s*0.8} rx="2" fill={C.sage} opacity=".4"/><rect x={(size-s)/2+s*0.37} y={(size-s)/2+s*0.05} width={s*0.25} height={s*0.95} rx="2" fill={C.sage} opacity=".65"/><rect x={(size-s)/2+s*0.74} y={(size-s)/2} width={s*0.25} height={s} rx="2" fill={C.sage}/></>,
    gap:   <><rect x={(size-s)/2} y={(size-s)/2} width={s} height={s*0.18} rx="2" fill={C.sage} opacity=".5"/><rect x={(size-s)/2} y={(size-s)/2+s*0.28} width={s*0.65} height={s*0.18} rx="2" fill={C.sage} opacity=".7"/><rect x={(size-s)/2} y={(size-s)/2+s*0.56} width={s*0.8} height={s*0.18} rx="2" fill={C.sage} opacity=".5"/><rect x={(size-s)/2} y={(size-s)/2+s*0.82} width={s*0.45} height={s*0.18} rx="2" fill="#f97316" opacity=".8"/></>,
    train: <><rect x={(size-s)/2} y={(size-s)/2} width={s} height={s*0.75} rx="3" fill={C.sage} opacity=".15" stroke={C.sage} strokeWidth="1.5"/><line x1={(size-s)/2+s*0.2} y1={(size-s)/2+s*0.28} x2={(size-s)/2+s*0.8} y2={(size-s)/2+s*0.28} stroke={C.sage} strokeWidth="1.2"/><line x1={(size-s)/2+s*0.2} y1={(size-s)/2+s*0.48} x2={(size-s)/2+s*0.8} y2={(size-s)/2+s*0.48} stroke={C.sage} strokeWidth="1.2"/><circle cx={(size-s)/2+s*0.5} cy={(size-s)/2+s*0.95} r={s*0.1} fill={C.sage}/></>,
  };
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: 10, background: bg, flexShrink: 0 }}>
      {icons[type] || null}
    </svg>
  );
}

// ── Shared atoms ─────────────────────────────────────────────────────────────
const Tag = ({ label, onRemove }) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:C.creamDk, color:C.ink, border:`0.5px solid rgba(26,26,20,0.15)`, borderRadius:6, padding:"3px 10px", fontSize:12, fontFamily:F.sans }}>
    {label}
    {onRemove && <button onClick={onRemove} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:0, lineHeight:1, fontSize:14 }}>×</button>}
  </span>
);

const Badge = ({ status }) => {
  const live = status === "live";
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:live?"#dcfce7":C.creamDk, color:live?"#166534":C.muted, border:`1px solid ${live?"#86efac":"rgba(26,26,20,0.15)"}`, borderRadius:20, padding:"3px 10px", fontSize:12, fontFamily:F.sans, fontWeight:500, whiteSpace:"nowrap" }}>
      {live && <span style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e", display:"inline-block" }}/>}
      {live ? "Live" : "Coming Soon"}
    </span>
  );
};

const GradientDivider = () => (
  <div style={{ height:3, background:`linear-gradient(90deg, ${C.sage}, transparent)`, borderRadius:2, marginTop:28 }}/>
);

const DarkHeader = ({ children }) => (
  <div style={{ background:C.forest, padding:"48px 32px 40px" }}>
    <div style={{ maxWidth:920, margin:"0 auto" }}>{children}</div>
    <div style={{ maxWidth:920, margin:"0 auto" }}><GradientDivider/></div>
  </div>
);

// ── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ page, setPage, name }) {
  const proj = PROJECTS.find(p => p.id === page);
  return (
    <nav style={{ position:"sticky", top:0, zIndex:100, background:C.cream, borderBottom:`1px solid rgba(26,26,20,0.1)`, padding:"0 28px", height:58, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <LogoIcon/>
        <button onClick={() => setPage("home")} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:F.sans, fontWeight:600, fontSize:15, color:C.ink }}>
          {name}
        </button>
        {proj && <>
          <span style={{ color:C.muted, fontSize:14 }}>/</span>
          <button onClick={() => setPage("projects")} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:F.sans, fontSize:14, color:C.muted }}>Projects</button>
          <span style={{ color:C.muted, fontSize:14 }}>/</span>
          <span style={{ fontFamily:F.sans, fontSize:14, color:C.ink }}>{proj.title}</span>
        </>}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:24 }}>
        {["projects","about","contact"].map(p => (
          <button key={p} onClick={() => setPage(p)} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:F.sans, fontSize:14, color:page===p?C.sage:C.ink, fontWeight:page===p?500:400 }}>
            {p[0].toUpperCase()+p.slice(1)}
          </button>
        ))}
        <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color:C.ink, display:"flex" }}>
          <GitHubIcon/>
        </a>
      </div>
    </nav>
  );
}

// ── Home ─────────────────────────────────────────────────────────────────────
function Home({ setPage }) {
  const featured = PROJECTS.find(p => p.featured);
  const liveOthers = PROJECTS.filter(p => p.live && !p.featured);
  const coming = PROJECTS.filter(p => !p.live);

  return (
    <div>
      {/* Hero */}
      <div style={{ position:"relative", overflow:"hidden", minHeight:500, display:"flex", alignItems:"center", justifyContent:"center", padding:"80px 32px", background:"#0f172a" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 60% at 25% 45%, #1d4ed8 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 50% 50% at 75% 30%, #3b82f6 0%, transparent 55%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 40% 40% at 60% 80%, #1e40af 0%, transparent 60%)", pointerEvents:"none" }}/>
        <div style={{ textAlign:"center", maxWidth:700, position:"relative", zIndex:1 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, border:"1px solid rgba(147,197,253,0.35)", borderRadius:30, padding:"6px 18px", marginBottom:28, color:C.sageLt, fontSize:12, fontFamily:F.sans, letterSpacing:"1.4px", background:"rgba(255,255,255,0.04)" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:C.sageLt, display:"inline-block" }}/>
            GRC · ALLIED HEALTHCARE · REACT
          </div>
          <h1 style={{ fontFamily:F.serif, fontSize:54, fontWeight:400, color:"#fff", lineHeight:1.15, marginBottom:20 }}>
            Risk &amp; Compliance Tools<br/>Built for Healthcare
          </h1>
          <p style={{ fontFamily:F.sans, fontSize:17, color:"rgba(219,234,254,0.82)", marginBottom:40, lineHeight:1.65 }}>
            7 interactive GRC tools — grounded in Allied Healthcare<br/>frameworks, built with modern React and AI.
          </p>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={() => setPage("projects")} style={{ background:"rgba(255,255,255,0.95)", color:C.ink, border:"none", borderRadius:10, padding:"14px 28px", fontFamily:F.sans, fontWeight:600, fontSize:15, cursor:"pointer" }}>
              View All 7 Tools
            </button>
            <button onClick={() => setPage("about")} style={{ background:"transparent", color:"#fff", border:"1.5px solid rgba(255,255,255,0.45)", borderRadius:10, padding:"14px 28px", fontFamily:F.sans, fontWeight:500, fontSize:15, cursor:"pointer" }}>
              About Me
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:920, margin:"0 auto", padding:"0 28px" }}>
        {/* Featured project */}
        <div style={{ paddingTop:48, paddingBottom:8 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <span style={{ fontFamily:F.sans, fontSize:11, fontWeight:600, letterSpacing:"1.4px", color:C.muted, textTransform:"uppercase" }}>Featured Project</span>
            <button onClick={() => setPage("projects")} style={{ background:"none", border:"none", cursor:"pointer", color:C.sage, fontSize:13, fontFamily:F.sans }}>All 7 tools →</button>
          </div>
          <div style={{ background:C.white, border:`1px solid rgba(26,26,20,0.1)`, borderRadius:14, padding:"26px 26px 22px" }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:18 }}>
              <ProjectIcon type={featured.icon} size={56}/>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8, flexWrap:"wrap" }}>
                  <h3 style={{ fontFamily:F.sans, fontSize:20, fontWeight:600, color:C.ink, margin:0 }}>{featured.title}</h3>
                  <Badge status={featured.status}/>
                </div>
                <p style={{ fontFamily:F.sans, fontSize:14, color:C.muted, lineHeight:1.65, marginBottom:16 }}>{featured.description}</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:20 }}>
                  {featured.tags.map(t => <Tag key={t} label={t}/>)}
                </div>
                <button onClick={() => setPage(featured.id)} style={{ background:C.forest, color:C.cream, border:"none", borderRadius:9, padding:"12px 24px", fontFamily:F.sans, fontWeight:600, fontSize:14, cursor:"pointer" }}>
                  Launch Tool →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Also live */}
        {liveOthers.length > 0 && (
          <div style={{ paddingTop:36 }}>
            <p style={{ fontFamily:F.sans, fontSize:11, fontWeight:600, letterSpacing:"1.4px", color:C.muted, textTransform:"uppercase", marginBottom:14 }}>Also Live</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
              {liveOthers.map(p => (
                <div key={p.id} onClick={() => setPage(p.id)} style={{ background:C.white, border:`1px solid rgba(26,26,20,0.1)`, borderRadius:12, padding:"18px 18px 14px", cursor:"pointer" }}>
                  <ProjectIcon type={p.icon} size={40}/>
                  <div style={{ fontFamily:F.sans, fontWeight:600, fontSize:14, color:C.ink, margin:"10px 0 6px" }}>{p.title}</div>
                  <Badge status="live"/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coming soon */}
        <div style={{ paddingTop:36, paddingBottom:64 }}>
          <p style={{ fontFamily:F.sans, fontSize:11, fontWeight:600, letterSpacing:"1.4px", color:C.muted, textTransform:"uppercase", marginBottom:14 }}>Coming Soon</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
            {coming.map(p => (
              <div key={p.id} style={{ background:C.white, border:`1px solid rgba(26,26,20,0.07)`, borderRadius:12, padding:"18px 18px 14px", opacity:0.72 }}>
                <ProjectIcon type={p.icon} size={40} bg={C.creamDk}/>
                <div style={{ fontFamily:F.sans, fontWeight:600, fontSize:14, color:C.ink, margin:"10px 0 6px" }}>{p.title}</div>
                <Badge status="coming"/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Projects ─────────────────────────────────────────────────────────────────
function Projects({ setPage }) {
  return (
    <div>
      <DarkHeader>
        <p style={{ fontFamily:F.sans, fontSize:11, letterSpacing:"1.4px", color:C.sageLt, textTransform:"uppercase", marginBottom:10 }}>Portfolio</p>
        <h1 style={{ fontFamily:F.serif, fontSize:40, fontWeight:400, color:C.cream, marginBottom:8 }}>All Tools</h1>
        <p style={{ fontFamily:F.sans, color:"rgba(244,240,230,0.65)", fontSize:15 }}>7 interactive GRC &amp; healthcare compliance tools</p>
      </DarkHeader>
      <div style={{ maxWidth:920, margin:"0 auto", padding:"40px 28px 80px" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {PROJECTS.map(p => (
            <div key={p.id} style={{ background:C.white, border:`1px solid rgba(26,26,20,0.1)`, borderRadius:12, padding:"22px 24px", display:"flex", alignItems:"flex-start", gap:18 }}>
              <ProjectIcon type={p.icon} size={48} bg={p.live ? C.sagePl : C.creamDk}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6, flexWrap:"wrap" }}>
                  <h3 style={{ fontFamily:F.sans, fontSize:16, fontWeight:600, color:C.ink, margin:0 }}>{p.title}</h3>
                  <Badge status={p.status}/>
                  <span style={{ fontFamily:F.sans, fontSize:12, color:C.muted }}>{p.year}</span>
                </div>
                <p style={{ fontFamily:F.sans, fontSize:14, color:C.muted, lineHeight:1.65, marginBottom:12 }}>{p.description}</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {p.tags.map(t => <Tag key={t} label={t}/>)}
                </div>
              </div>
              {p.live && (
                <button onClick={() => setPage(p.id)} style={{ background:C.forest, color:C.cream, border:"none", borderRadius:8, padding:"10px 18px", fontFamily:F.sans, fontWeight:600, fontSize:13, cursor:"pointer", flexShrink:0, alignSelf:"center" }}>
                  Launch Tool →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── About ────────────────────────────────────────────────────────────────────
function About({ name, setName, skills, setSkills }) {
  const [editName, setEditName] = useState(false);
  const [draft, setDraft] = useState(name);
  const [editSkills, setEditSkills] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const initials = name.trim().split(/\s+/).map(w=>w[0]).filter(Boolean).slice(0,2).join("").toUpperCase();
  const saveName = () => { if (draft.trim()) setName(draft.trim()); setEditName(false); };
  const addSkill = () => { const s = newSkill.trim(); if (s && !skills.includes(s)) setSkills([...skills, s]); setNewSkill(""); };

  return (
    <div>
      <DarkHeader>
        <h1 style={{ fontFamily:F.serif, fontSize:40, fontWeight:400, color:C.cream, marginBottom:6 }}>About</h1>
        <p style={{ fontFamily:F.sans, color:"rgba(244,240,230,0.65)", fontSize:15 }}>Training Specialist → Cybersecurity GRC</p>
      </DarkHeader>
      <div style={{ maxWidth:760, margin:"0 auto", padding:"40px 28px 80px" }}>
        {/* Name card */}
        <div style={{ background:C.white, border:`1px solid rgba(26,26,20,0.1)`, borderRadius:14, padding:28, marginBottom:18 }}>
          <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:20 }}>
            <div style={{ width:62, height:62, borderRadius:"50%", background:C.forest, display:"flex", alignItems:"center", justifyContent:"center", color:C.cream, fontFamily:F.sans, fontSize:20, fontWeight:600, flexShrink:0 }}>
              {initials}
            </div>
            <div style={{ flex:1 }}>
              {editName ? (
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <input value={draft} onChange={e=>setDraft(e.target.value)}
                    onKeyDown={e=>{ if(e.key==="Enter") saveName(); if(e.key==="Escape"){setDraft(name);setEditName(false);} }}
                    style={{ fontFamily:F.sans, fontSize:18, fontWeight:600, border:`1.5px solid ${C.sage}`, borderRadius:7, padding:"7px 12px", outline:"none", color:C.ink, width:240 }}
                    autoFocus
                  />
                  <button onClick={saveName} style={{ background:C.sage, color:"#fff", border:"none", borderRadius:7, padding:"7px 16px", cursor:"pointer", fontFamily:F.sans, fontWeight:500 }}>Save</button>
                  <button onClick={()=>{setDraft(name);setEditName(false);}} style={{ background:"none", border:`1px solid ${C.creamDk}`, borderRadius:7, padding:"7px 12px", cursor:"pointer", fontFamily:F.sans, color:C.muted }}>Cancel</button>
                </div>
              ) : (
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <h2 style={{ fontFamily:F.sans, fontSize:20, fontWeight:600, color:C.ink, margin:0 }}>{name}</h2>
                  <button onClick={()=>{setEditName(true);setDraft(name);}} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:12, fontFamily:F.sans }}>✎ Edit name</button>
                </div>
              )}
              <p style={{ fontFamily:F.sans, fontSize:13, color:C.muted, marginTop:4 }}>Training Specialist transitioning into Cybersecurity GRC</p>
            </div>
          </div>
          <div style={{ borderTop:`1px solid ${C.creamDk}`, paddingTop:18 }}>
            <p style={{ fontFamily:F.sans, fontSize:14, color:C.ink, lineHeight:1.75, margin:0 }}>
              Building interactive GRC and healthcare compliance tools that bridge operational expertise with modern technology. Focused on HIPAA, NIST CSF, and allied health frameworks — translating compliance complexity into intuitive, practical interfaces.
            </p>
          </div>
        </div>

        {/* Skills card */}
        <div style={{ background:C.white, border:`1px solid rgba(26,26,20,0.1)`, borderRadius:14, padding:28 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <h3 style={{ fontFamily:F.sans, fontSize:15, fontWeight:600, color:C.ink, margin:0 }}>Skills &amp; Tools</h3>
            <button onClick={()=>setEditSkills(e=>!e)} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:12, fontFamily:F.sans }}>
              {editSkills ? "✓ Done" : "✎ Edit"}
            </button>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
            {skills.map(s => <Tag key={s} label={s} onRemove={editSkills ? ()=>setSkills(skills.filter(x=>x!==s)) : undefined}/>)}
          </div>
          {editSkills && (
            <div style={{ display:"flex", gap:8, marginTop:16 }}>
              <input value={newSkill} onChange={e=>setNewSkill(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter") addSkill(); }}
                placeholder="Add a skill…"
                style={{ flex:1, fontFamily:F.sans, fontSize:13, border:`1px solid ${C.creamDk}`, borderRadius:7, padding:"8px 12px", outline:"none", color:C.ink }}
              />
              <button onClick={addSkill} style={{ background:C.forest, color:C.cream, border:"none", borderRadius:7, padding:"8px 16px", cursor:"pointer", fontFamily:F.sans, fontWeight:500, fontSize:13 }}>Add</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Contact ───────────────────────────────────────────────────────────────────
function Contact() {
  const [form, setForm] = useState({ name:"", email:"", message:"" });
  const [sent, setSent] = useState(false);
  const valid = form.name.trim() && form.email.trim() && form.message.trim();

  if (sent) return (
    <div style={{ maxWidth:580, margin:"80px auto", padding:"0 28px", textAlign:"center" }}>
      <div style={{ width:64, height:64, borderRadius:"50%", background:"#dcfce7", border:"2px solid #86efac", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2 style={{ fontFamily:F.serif, fontSize:28, fontWeight:400, color:C.ink, marginBottom:8 }}>Message Sent</h2>
      <p style={{ fontFamily:F.sans, color:C.muted, lineHeight:1.6 }}>Thanks for reaching out — I'll be in touch soon.</p>
    </div>
  );

  const inp = { fontFamily:F.sans, fontSize:14, border:`1px solid ${C.creamDk}`, borderRadius:8, padding:"10px 14px", outline:"none", color:C.ink, width:"100%", boxSizing:"border-box", background:C.white };

  return (
    <div>
      <DarkHeader>
        <h1 style={{ fontFamily:F.serif, fontSize:40, fontWeight:400, color:C.cream, marginBottom:6 }}>Contact</h1>
        <p style={{ fontFamily:F.sans, color:"rgba(244,240,230,0.65)", fontSize:15 }}>Get in touch about GRC, collaboration, or projects</p>
      </DarkHeader>
      <div style={{ maxWidth:580, margin:"0 auto", padding:"40px 28px 80px" }}>
        <div style={{ background:C.white, border:`1px solid rgba(26,26,20,0.1)`, borderRadius:14, padding:32 }}>
          {["name","email","message"].map(field => (
            <div key={field} style={{ marginBottom:18 }}>
              <label style={{ display:"block", fontFamily:F.sans, fontSize:12, fontWeight:600, color:C.muted, letterSpacing:"0.5px", marginBottom:6, textTransform:"capitalize" }}>{field}</label>
              {field==="message"
                ? <textarea value={form[field]} onChange={e=>setForm({...form,[field]:e.target.value})} rows={5} style={{ ...inp, resize:"vertical" }}/>
                : <input value={form[field]} onChange={e=>setForm({...form,[field]:e.target.value})} type={field==="email"?"email":"text"} style={inp}/>
              }
            </div>
          ))}
          <button onClick={()=>setSent(true)} disabled={!valid} style={{ background:valid?C.forest:C.creamDk, color:valid?C.cream:C.muted, border:"none", borderRadius:9, padding:"13px 28px", fontFamily:F.sans, fontWeight:600, fontSize:14, cursor:valid?"pointer":"default", width:"100%", transition:"background 0.2s" }}>
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Project detail shell ──────────────────────────────────────────────────────
function ProjectDetail({ project, setPage }) {
  return (
    <div>
      <DarkHeader>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:4 }}>
          <ProjectIcon type={project.icon} size={48} bg="rgba(219,234,254,0.12)"/>
          <div>
            <h1 style={{ fontFamily:F.serif, fontSize:36, fontWeight:400, color:C.cream, marginBottom:8 }}>{project.title}</h1>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {project.tags.map(t => (
                <span key={t} style={{ fontFamily:F.sans, fontSize:11, color:C.sageLt, background:"rgba(147,197,253,0.12)", border:"1px solid rgba(147,197,253,0.22)", borderRadius:5, padding:"2px 8px" }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </DarkHeader>
      <div style={{ maxWidth:920, margin:"0 auto", padding:"48px 28px 80px", textAlign:"center" }}>
        <div style={{ background:C.white, border:`1px solid rgba(26,26,20,0.1)`, borderRadius:16, padding:"64px 40px" }}>
          <ProjectIcon type={project.icon} size={64} bg={C.sagePl}/>
          <h2 style={{ fontFamily:F.serif, fontSize:26, fontWeight:400, color:C.ink, margin:"20px 0 10px" }}>{project.title}</h2>
          <p style={{ fontFamily:F.sans, color:C.muted, maxWidth:460, margin:"0 auto 28px", lineHeight:1.65, fontSize:14 }}>{project.description}</p>
          <div style={{ background:C.sagePl, border:`1px solid rgba(59,130,246,0.2)`, borderRadius:10, padding:"14px 22px", display:"inline-block", marginBottom:28 }}>
            <p style={{ fontFamily:F.sans, fontSize:13, color:C.sage, margin:0 }}>Tool component mounts here — wire in the interactive component below this placeholder.</p>
          </div>
          <br/>
          <button onClick={()=>setPage("projects")} style={{ background:"none", border:`1px solid ${C.creamDk}`, borderRadius:8, padding:"10px 20px", fontFamily:F.sans, fontSize:13, color:C.muted, cursor:"pointer" }}>
            ← Back to Projects
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer({ name, setPage }) {
  return (
    <footer style={{ background:C.forest, padding:"36px 28px" }}>
      <div style={{ maxWidth:920, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:20 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
            <LogoIcon/>
            <span style={{ fontFamily:F.sans, fontWeight:600, fontSize:14, color:C.cream }}>{name}</span>
          </div>
          <p style={{ fontFamily:F.sans, fontSize:12, color:"rgba(244,240,230,0.45)", margin:0 }}>
            © {new Date().getFullYear()} {name}. GRC &amp; Healthcare Tools Portfolio.
          </p>
        </div>
        <div style={{ display:"flex", gap:24 }}>
          {["projects","about","contact"].map(p => (
            <button key={p} onClick={()=>setPage(p)} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:F.sans, fontSize:13, color:"rgba(244,240,230,0.55)", textTransform:"capitalize" }}>
              {p[0].toUpperCase()+p.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ── Risk Matrix Page ─────────────────────────────────────────────────────────
function RiskMatrixPage({ setPage }) {
  const project = PROJECTS.find(p => p.id === "risk-matrix");
  return (
    <div>
      <DarkHeader>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:4 }}>
          <ProjectIcon type="risk" size={48} bg="rgba(219,234,254,0.12)"/>
          <div>
            <h1 style={{ fontFamily:F.serif, fontSize:36, fontWeight:400, color:C.cream, marginBottom:8 }}>{project.title}</h1>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {project.tags.map(t => (
                <span key={t} style={{ fontFamily:F.sans, fontSize:11, color:C.sageLt, background:"rgba(147,197,253,0.12)", border:"1px solid rgba(147,197,253,0.22)", borderRadius:5, padding:"2px 8px" }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </DarkHeader>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"36px 28px 80px" }}>
        <div style={{ background:C.white, border:`1px solid rgba(26,26,20,0.1)`, borderRadius:14, overflow:"hidden" }}>
          <RiskMatrix />
        </div>
        <button onClick={() => setPage("projects")} style={{ marginTop:20, background:"none", border:`1px solid ${C.creamDk}`, borderRadius:8, padding:"10px 20px", fontFamily:F.sans, fontSize:13, color:C.muted, cursor:"pointer" }}>
          ← Back to Projects
        </button>
      </div>
    </div>
  );
}

// ── Staff Scheduler Page ──────────────────────────────────────────────────────
function StaffSchedulerPage({ setPage }) {
  const project = PROJECTS.find(p => p.id === "staff-scheduler");
  return (
    <div>
      <DarkHeader>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:4 }}>
          <ProjectIcon type="sched" size={48} bg="rgba(219,234,254,0.12)"/>
          <div>
            <h1 style={{ fontFamily:F.serif, fontSize:36, fontWeight:400, color:C.cream, marginBottom:8 }}>{project.title}</h1>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {project.tags.map(t => (
                <span key={t} style={{ fontFamily:F.sans, fontSize:11, color:C.sageLt, background:"rgba(147,197,253,0.12)", border:"1px solid rgba(147,197,253,0.22)", borderRadius:5, padding:"2px 8px" }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </DarkHeader>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"36px 28px 80px" }}>
        <div style={{ background:C.white, border:`1px solid rgba(26,26,20,0.1)`, borderRadius:14, overflow:"hidden" }}>
          <StaffScheduler />
        </div>
        <button onClick={() => setPage("projects")} style={{ marginTop:20, background:"none", border:`1px solid ${C.creamDk}`, borderRadius:8, padding:"10px 20px", fontFamily:F.sans, fontSize:13, color:C.muted, cursor:"pointer" }}>
          ← Back to Projects
        </button>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function Portfolio() {
  const [page, setPage] = useState("home");
  const [name, setName] = useState("The Rock Consult");
  const [skills, setSkills] = useState([
    "GRC","HIPAA","NIST CSF","Risk Management","React",
    "Healthcare Compliance","Training Design","Cybersecurity","Allied Health",
  ]);

  const activeTool = PROJECTS.find(p => p.live && p.id === page);

  return (
    <div style={{ fontFamily:F.sans, background:C.cream, minHeight:"100vh", color:C.ink, display:"flex", flexDirection:"column" }}>
      <Navbar page={page} setPage={setPage} name={name}/>
      <div style={{ flex:1 }}>
        {page==="home"     && <Home setPage={setPage}/>}
        {page==="projects" && <Projects setPage={setPage}/>}
        {page==="about"    && <About name={name} setName={setName} skills={skills} setSkills={setSkills}/>}
        {page==="contact"  && <Contact/>}
        {page==="risk-matrix"     && <RiskMatrixPage setPage={setPage}/>}
        {page==="staff-scheduler" && <StaffSchedulerPage setPage={setPage}/>}
        {activeTool && page!=="risk-matrix" && page!=="staff-scheduler" && <ProjectDetail project={activeTool} setPage={setPage}/>}
      </div>
      <Footer name={name} setPage={setPage}/>
    </div>
  );
}