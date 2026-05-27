// Desktop Exam Readiness Logbook — full-bleed, modern minimal

const { useState, useMemo, useEffect } = React;

function Icon({ name, size = 14, stroke = 1.6, color = "currentColor" }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "check":   return <svg {...p}><polyline points="20 6 9 17 4 12"/></svg>;
    case "search":  return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case "alert":   return <svg {...p}><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>;
    case "log":     return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>;
    case "download":return <svg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
    case "x":       return <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case "user":    return <svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case "calendar":return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case "send":    return <svg {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
    case "filter":  return <svg {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
    case "shield":  return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    default: return null;
  }
}

function StaffBadge({ value, onChange, staffList }) {
  const ready = value !== staffList[0];
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
      <span style={{
        width: 7, height: 7, borderRadius: 99,
        background: ready ? "var(--ok)" : "var(--ink-40)",
      }}/>
      <span style={{ color: "var(--ink-60)" }}>ผู้ปฏิบัติ</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: "none", border: "1px solid var(--line)",
          borderRadius: 6, padding: "5px 26px 5px 10px",
          fontFamily: "inherit", fontSize: 12.5, fontWeight: 500,
          color: ready ? "var(--ink)" : "var(--ink-60)",
          background: `var(--bg-card) url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/></svg>") no-repeat right 8px center`,
          cursor: "pointer", outline: "none", maxWidth: 200,
        }}>
        {staffList.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </label>
  );
}

function Countdown() {
  const days = daysUntilExam();
  const tone = days <= 7 ? "var(--alert)" : days <= 28 ? "var(--warn)" : "var(--ok)";
  const label = days > 0 ? `T-${days}` : days === 0 ? "Day 0" : `T+${Math.abs(days)}`;
  const sub = days > 0 ? `${days} วันก่อนสอบ` : days === 0 ? "วันสอบ" : `หลังสอบ ${Math.abs(days)} วัน`;
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
      <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 22, fontWeight: 600, letterSpacing: -0.5, color: tone, lineHeight: 1 }}>{label}</div>
      <div style={{ fontSize: 11.5, color: "var(--ink-60)" }}>{sub} · 1 ส.ค. 2569</div>
    </div>
  );
}

function StatTile({ label, value, sub, tone = "var(--ink)" }) {
  return (
    <div style={{ padding: "16px 18px", borderRight: "1px solid var(--line)" }}>
      <div style={{ fontSize: 11, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 500 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
        <span style={{ fontSize: 28, fontWeight: 600, lineHeight: 1, color: tone, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>{value}</span>
        {sub && <span style={{ fontSize: 11.5, color: "var(--ink-60)" }}>{sub}</span>}
      </div>
    </div>
  );
}

// Timeline — horizontal T-28 → T+21 spine
function Timeline({ tasks, activePhase, setActivePhase }) {
  const min = -28, max = 21, span = max - min;
  const today = daysUntilExam(); // positive = before
  const todayOffset = -today;    // map onto the same axis as dayOffset
  const todayPct = ((todayOffset - min) / span) * 100;

  // Group tasks by dayOffset
  const groups = useMemo(() => {
    const m = new Map();
    tasks.forEach((t) => {
      const arr = m.get(t.dayOffset) || [];
      arr.push(t);
      m.set(t.dayOffset, arr);
    });
    return Array.from(m.entries()).sort((a, b) => a[0] - b[0]);
  }, [tasks]);

  const phaseSpans = [
    { id: "pre-exam",    from: -28, to: -7,  bg: "var(--phase-pre-bg)"   },
    { id: "exam-ready",  from: -7,  to: -1,  bg: "var(--phase-ready-bg)" },
    { id: "during-exam", from: -1,  to: 1,   bg: "var(--phase-live-bg)"  },
    { id: "post-exam",   from: 1,   to: 21,  bg: "var(--phase-post-bg)"  },
  ];

  return (
    <div style={{ padding: "20px 24px 14px", borderBottom: "1px solid var(--line)", background: "var(--bg-card)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 500 }}>Timeline</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>T-28 → T+21 · เส้นทางเตรียมความพร้อม</div>
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: 11.5, color: "var(--ink-60)" }}>
          {PHASES.map((p) => (
            <button key={p.id} onClick={() => setActivePhase(activePhase === p.id ? "all" : p.id)}
              style={{
                display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
                padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 11.5,
                color: activePhase === p.id ? "var(--ink)" : "var(--ink-60)",
                fontWeight: activePhase === p.id ? 600 : 400,
              }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: p.dot }}/>
              {p.labelTh} <span style={{ opacity: 0.6 }}>{p.range}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Track */}
      <div style={{ position: "relative", height: 88, padding: "0 4px" }}>
        {/* Phase bands */}
        <div style={{ position: "absolute", inset: "32px 4px auto", height: 4, display: "flex", borderRadius: 2, overflow: "hidden" }}>
          {phaseSpans.map((s) => (
            <div key={s.id} style={{
              flex: s.to - s.from,
              background: activePhase === "all" || activePhase === s.id ? s.bg : "var(--line)",
              transition: "background 0.2s",
            }}/>
          ))}
        </div>

        {/* Day axis labels */}
        {[-28, -21, -14, -7, 0, 7, 14, 21].map((d) => {
          const left = ((d - min) / span) * 100;
          const label = d === 0 ? "0" : d > 0 ? `+${d}` : `${d}`;
          return (
            <div key={d} style={{
              position: "absolute", left: `${left}%`, top: 46, transform: "translateX(-50%)",
              fontSize: 10, color: "var(--ink-60)", fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            }}>{label}</div>
          );
        })}

        {/* Today marker */}
        {todayPct >= 0 && todayPct <= 100 && (
          <div style={{ position: "absolute", left: `${todayPct}%`, top: 0, bottom: 0, transform: "translateX(-50%)" }}>
            <div style={{ width: 1, height: 38, background: "var(--alert)", margin: "0 auto" }}/>
            <div style={{
              position: "absolute", top: -2, left: "50%", transform: "translateX(-50%)",
              padding: "1px 6px", fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4,
              background: "var(--alert)", color: "white", borderRadius: 3,
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            }}>NOW</div>
          </div>
        )}

        {/* Task dots */}
        {groups.map(([day, items]) => {
          const left = ((day - min) / span) * 100;
          const allDone = items.every((t) => t.done);
          const anyHigh = items.some((t) => t.priority === "high");
          const phase = PHASES.find((p) => p.id === items[0].phase);
          const dim = activePhase !== "all" && activePhase !== items[0].phase;
          return (
            <div key={day} title={`${items[0].deadline} · ${items.length} งาน`} style={{
              position: "absolute", left: `${left}%`, top: 26, transform: "translateX(-50%)",
              opacity: dim ? 0.25 : 1, transition: "opacity 0.2s",
            }}>
              <div style={{
                width: 16, height: 16, borderRadius: 99,
                background: allDone ? "var(--ok)" : "var(--bg-card)",
                border: `2px solid ${allDone ? "var(--ok)" : phase.dot}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}>
                {allDone && <Icon name="check" size={9} stroke={3} color="white"/>}
                {!allDone && anyHigh && <span style={{ width: 5, height: 5, borderRadius: 99, background: phase.dot }}/>}
                {items.length > 1 && (
                  <span style={{
                    position: "absolute", top: -6, right: -8,
                    fontSize: 9, fontWeight: 700, color: "var(--ink-60)",
                    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                  }}>{items.length}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskRow({ t, phase, onToggle, canCheck, cardStyle, showPhase }) {
  const tone = t.done ? "var(--ok)" : t.priority === "high" ? "var(--alert)" : "var(--ink-60)";
  const baseBg = t.done ? "var(--bg-done)" : "var(--bg-card)";
  const border = cardStyle === "outlined"
    ? `1px solid ${t.done ? "var(--ok-line)" : t.priority === "high" ? "var(--alert-line)" : "var(--line)"}`
    : `1px solid var(--line)`;
  const shadow = cardStyle === "shadowed" ? "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.04)" : "none";
  const radius = cardStyle === "flat" ? 0 : 8;

  return (
    <div onClick={() => canCheck && onToggle(t.id)}
      style={{
        display: "grid",
        gridTemplateColumns: "20px 1fr auto",
        gap: 14, padding: "13px 16px", alignItems: "flex-start",
        background: baseBg, border, borderRadius: radius, boxShadow: shadow,
        cursor: canCheck ? "pointer" : "not-allowed",
        opacity: canCheck ? 1 : 0.7,
        transition: "background 0.15s, border-color 0.15s",
      }}>
      <div style={{
        width: 18, height: 18, borderRadius: 5, marginTop: 1,
        border: t.done ? "none" : `1.5px solid ${t.priority === "high" ? "var(--alert)" : "var(--ink-40)"}`,
        background: t.done ? "var(--ok)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        {t.done && <Icon name="check" size={11} stroke={3} color="white"/>}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 13.5, lineHeight: 1.5, fontWeight: 500,
          color: t.done ? "var(--ink-60)" : "var(--ink)",
          textDecoration: t.done ? "line-through" : "none",
        }}>{t.task}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 7, alignItems: "center" }}>
          {showPhase && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--ink-60)" }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: phase.dot }}/>
              {phase.labelTh}
            </span>
          )}
          <span style={{ fontSize: 11, color: "var(--ink-60)" }}>· {t.owner}</span>
          <span style={{ fontSize: 11, color: "var(--ink-60)", fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>· {t.deadline}</span>
          {t.done && t.doneBy && (
            <span style={{ fontSize: 11, color: "var(--ok)", fontWeight: 500 }}>
              · ✓ {t.doneBy} · {t.doneAt}
            </span>
          )}
        </div>
      </div>
      <div style={{
        fontSize: 10.5, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase",
        color: tone, paddingTop: 4, whiteSpace: "nowrap",
      }}>
        {t.done ? "Done" : t.priority === "high" ? "High" : "Normal"}
      </div>
    </div>
  );
}

function IssuePanel({ issues, addIssue, canSubmit, onClose }) {
  const [text, setText] = useState("");
  const [sev, setSev] = useState("medium");
  const submit = () => {
    if (!text.trim() || !canSubmit) return;
    addIssue(text.trim(), sev);
    setText("");
    setSev("medium");
  };
  const sevTone = { low: "var(--ink-60)", medium: "var(--warn)", high: "var(--alert)" };

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 8, marginBottom: 12, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="alert" size={13} color="var(--warn)"/>
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>รายงานปัญหาระหว่างสอบ</span>
          <span style={{ fontSize: 11, color: "var(--ink-60)" }}>· {issues.length} รายการ</span>
        </div>
        <button onClick={onClose} style={btnGhost}><Icon name="x" size={13}/></button>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
          <div style={{ display: "flex", border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden" }}>
            {["low","medium","high"].map((s) => (
              <button key={s} onClick={() => setSev(s)} style={{
                padding: "0 12px", border: "none", cursor: "pointer", fontFamily: "inherit",
                background: sev === s ? sevTone[s] : "transparent",
                color: sev === s ? "white" : "var(--ink-60)",
                fontSize: 11.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5,
              }}>{s}</button>
            ))}
          </div>
          <input value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="ระบุปัญหาที่พบ เช่น ตึก 11 ห้อง 11-1201 ข้อสอบไม่พอ 5 ชุด..."
            style={{
              flex: 1, padding: "9px 12px", borderRadius: 6, border: "1px solid var(--line)",
              fontSize: 13, fontFamily: "inherit", outline: "none", background: "var(--bg)",
            }}/>
          <button onClick={submit} disabled={!canSubmit || !text.trim()} style={{
            ...btnPrimary,
            opacity: !canSubmit || !text.trim() ? 0.4 : 1,
            cursor: !canSubmit || !text.trim() ? "not-allowed" : "pointer",
          }}>
            <Icon name="send" size={12}/> ส่ง
          </button>
        </div>
        {issues.length > 0 && (
          <div style={{ marginTop: 12, maxHeight: 160, overflowY: "auto" }}>
            {issues.map((iss, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < issues.length - 1 ? "1px solid var(--line)" : "none" }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: sevTone[iss.severity], marginTop: 7, flexShrink: 0 }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, color: "var(--ink)" }}>{iss.text}</div>
                  <div style={{ fontSize: 10.5, color: "var(--ink-60)", marginTop: 2, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>
                    {iss.by} · {iss.at} · severity:{iss.severity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AuditPanel({ logs, onClose, onExport }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 8, marginBottom: 12, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="log" size={13}/>
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>Audit Trail</span>
          <span style={{ fontSize: 11, color: "var(--ink-60)" }}>· {logs.length} entries</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={onExport} style={btnGhost}><Icon name="download" size={12}/> CSV</button>
          <button onClick={onClose} style={btnGhost}><Icon name="x" size={13}/></button>
        </div>
      </div>
      <div style={{ maxHeight: 220, overflowY: "auto", padding: "4px 14px 8px" }}>
        {logs.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--ink-60)", padding: "16px 0" }}>ยังไม่มี Log</div>
        ) : (
          logs.map((l, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "120px 120px 1fr", gap: 12, fontSize: 12, padding: "7px 0", borderBottom: i < logs.length - 1 ? "1px solid var(--line)" : "none" }}>
              <span style={{ color: "var(--ink-60)", fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>{l.time}</span>
              <span style={{ fontWeight: 600 }}>{l.staff}</span>
              <span style={{ color: "var(--ink)" }}>{l.action}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const btnGhost = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "5px 9px", borderRadius: 5, border: "1px solid var(--line)",
  background: "var(--bg-card)", color: "var(--ink-60)", fontSize: 11.5,
  cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
};
const btnPrimary = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "9px 14px", borderRadius: 6, border: "1px solid var(--ink)",
  background: "var(--ink)", color: "var(--bg-card)", fontSize: 12.5,
  cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
};

function Logbook({ tweaks, adminMode, openAdmin }) {
  const [store, setStore] = usePersistedState(INITIAL_STORE);
  const tasks = store.tasks;
  const { logs, issues, staff, staffList } = store;
  const setStaff = (s) => setStore((p) => ({ ...p, staff: s }));
  const [activePhase, setActivePhase] = useState("all");
  const [activeOwner, setActiveOwner] = useState("all");
  const [search, setSearch] = useState("");
  const [showLog, setShowLog] = useState(false);
  const [showIssues, setShowIssues] = useState(false);

  const ready = staff !== staffList[0];

  const toggleTask = (id) => {
    if (!ready) return;
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    const now = thaiNowString();
    const newDone = !target.done;
    setStore((p) => ({
      ...p,
      tasks: p.tasks.map((t) => t.id === id
        ? { ...t, done: newDone, doneBy: newDone ? staff : null, doneAt: newDone ? now : null }
        : t),
      logs: [{ time: now, staff, action: `${newDone ? "เสร็จ" : "ยกเลิก"}: ${target.task}` }, ...p.logs],
    }));
  };

  const addIssue = (text, severity) => {
    const now = thaiNowString();
    setStore((p) => ({
      ...p,
      issues: [{ text, by: staff, at: now, severity }, ...p.issues],
      logs: [{ time: now, staff, action: `แจ้งปัญหา [${severity}]: ${text}` }, ...p.logs],
    }));
  };

  const resetAll = () => {
    if (!window.confirm("ต้องการล้างข้อมูลทั้งหมด (สถานะการเช็คงาน, Log, ปัญหา) หรือไม่?\nรายการงานและรายชื่อผู้ปฏิบัติจะยังคงอยู่")) return;
    setStore((p) => ({
      ...p,
      tasks: p.tasks.map((t) => ({ ...t, done: false, doneBy: null, doneAt: null })),
      logs: [],
      issues: [],
      staff: p.staffList[0],
    }));
  };

  const exportCSV = () => {
    const rows = [["Time","Staff","Action"], ...logs.map((l) => [l.time, l.staff, l.action])];
    downloadCSV(`audit-log-${Date.now()}.csv`, rows);
  };

  const exportTasks = () => {
    const rows = [["#","Phase","Task","Owner","Deadline","Priority","Done","DoneBy","DoneAt"]];
    tasks.forEach((t) => {
      const p = PHASES.find((x) => x.id === t.phase);
      rows.push([t.id, p ? p.labelTh : t.phase, t.task, t.owner, t.deadline, t.priority, t.done ? "Y" : "N", t.doneBy || "", t.doneAt || ""]);
    });
    downloadCSV(`tasks-${Date.now()}.csv`, rows);
  };

  const exportIssues = () => {
    const rows = [["Time","By","Severity","Issue"], ...issues.map((i) => [i.at, i.by, i.severity, i.text])];
    downloadCSV(`issues-${Date.now()}.csv`, rows);
  };

  const filtered = tasks.filter((t) => {
    if (activePhase !== "all" && t.phase !== activePhase) return false;
    if (activeOwner !== "all" && t.ownerKey !== activeOwner) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!t.task.toLowerCase().includes(q) && !t.owner.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const high = tasks.filter((t) => !t.done && t.priority === "high").length;
  const phaseStats = PHASES.map((p) => {
    const ts = tasks.filter((t) => t.phase === p.id);
    const d = ts.filter((t) => t.done).length;
    return { ...p, total: ts.length, done: d, pct: ts.length ? Math.round((d / ts.length) * 100) : 0 };
  });

  const cardStyle = tweaks.cardStyle || "outlined";

  return (
    <div className="logbook" style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100%", fontFamily: "'Sarabun', system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid var(--line)", background: "var(--bg-card)" }}>
        <div style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 7,
              border: "1.5px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 13, fontWeight: 700, letterSpacing: -0.5,
            }}>EX</div>
            <div>
              <div style={{ fontSize: 10.5, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 500 }}>สำนักวิชาการ · Academic Affairs</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 1 }}>Exam Readiness Logbook <span style={{ color: "var(--ink-60)", fontWeight: 400 }}>· ภาคการศึกษา S/2568</span></div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Countdown/>
            <div style={{ width: 1, height: 28, background: "var(--line)" }}/>
            <StaffBadge value={staff} onChange={setStaff} staffList={staffList}/>
            {adminMode && (
              <button onClick={openAdmin} title="จัดการระบบ (Admin)" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 6,
                border: "1px solid var(--ink)", background: "var(--ink)",
                color: "var(--bg-card)", cursor: "pointer", fontFamily: "inherit",
                fontSize: 12, fontWeight: 600,
              }}>
                <Icon name="shield" size={12}/> Admin
              </button>
            )}
          </div>
        </div>

        {/* Stat strip */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr", borderTop: "1px solid var(--line)" }}>
          <div style={{ padding: "16px 18px", borderRight: "1px solid var(--line)" }}>
            <div style={{ fontSize: 11, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 500 }}>ความพร้อมรวม · Overall</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 600, lineHeight: 1, color: pct >= 80 ? "var(--ok)" : pct >= 50 ? "var(--warn)" : pct === 0 ? "var(--ink)" : "var(--alert)", fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>{pct}%</span>
              <span style={{ fontSize: 11.5, color: "var(--ink-60)" }}>{done}/{total} รายการ</span>
            </div>
            <div style={{ height: 4, background: "var(--line)", borderRadius: 99, marginTop: 10, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: pct >= 80 ? "var(--ok)" : pct >= 50 ? "var(--warn)" : "var(--alert)", transition: "width 0.4s" }}/>
            </div>
          </div>
          {phaseStats.map((p, i) => (
            <div key={p.id} style={{ padding: "16px 18px", borderRight: i < phaseStats.length - 1 ? "1px solid var(--line)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: p.dot }}/>
                <span style={{ fontSize: 11, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 500 }}>{p.label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 600, lineHeight: 1, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>{p.pct}%</span>
                <span style={{ fontSize: 11, color: "var(--ink-60)" }}>{p.done}/{p.total}</span>
              </div>
              <div style={{ fontSize: 10.5, color: "var(--ink-60)", marginTop: 4, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>{p.range}</div>
            </div>
          ))}
        </div>
      </header>

      <Timeline tasks={tasks} activePhase={activePhase} setActivePhase={setActivePhase}/>

      {/* Filter bar */}
      <div style={{ padding: "12px 24px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", borderBottom: "1px solid var(--line)", background: "var(--bg-card)" }}>
        <div style={{ position: "relative", flex: "0 1 320px", minWidth: 220 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ink-60)" }}><Icon name="search" size={13}/></span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหารายการงาน หรือผู้รับผิดชอบ..."
            style={{
              width: "100%", padding: "8px 12px 8px 32px", borderRadius: 6,
              border: "1px solid var(--line)", background: "var(--bg)", fontSize: 13,
              fontFamily: "inherit", outline: "none", color: "var(--ink)",
            }}/>
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center", fontSize: 11.5, color: "var(--ink-60)" }}>
          <Icon name="filter" size={12}/>
          <span style={{ marginRight: 4 }}>หน่วยงาน</span>
          {OWNER_FILTERS.map((o) => (
            <button key={o.key} onClick={() => setActiveOwner(o.key)} style={{
              padding: "5px 10px", borderRadius: 5, border: "1px solid var(--line)",
              background: activeOwner === o.key ? "var(--ink)" : "var(--bg-card)",
              color: activeOwner === o.key ? "var(--bg-card)" : "var(--ink-60)",
              fontFamily: "inherit", fontSize: 11.5, cursor: "pointer", fontWeight: 500,
            }}>{o.label}</button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <div style={{ display: "flex", gap: 4, marginRight: 4 }}>
            <button onClick={exportTasks} style={btnGhost} title="ดาวน์โหลดสถานะงานทั้งหมดเป็น CSV">
              <Icon name="download" size={12}/> งาน
            </button>
            <button onClick={exportIssues} style={btnGhost} title="ดาวน์โหลดปัญหาเป็น CSV" disabled={issues.length === 0}>
              <Icon name="download" size={12}/> ปัญหา
            </button>
            <button onClick={exportCSV} style={btnGhost} title="ดาวน์โหลด Audit Log เป็น CSV" disabled={logs.length === 0}>
              <Icon name="download" size={12}/> Log
            </button>
          </div>
          {(logs.length > 0 || issues.length > 0 || tasks.some((t) => t.done)) && (
            <button onClick={resetAll} style={{ ...btnGhost, color: "var(--alert)", borderColor: "var(--alert-line)" }}>
              รีเซ็ต
            </button>
          )}
          <button onClick={() => setShowIssues(!showIssues)} style={{ ...btnGhost, color: showIssues ? "var(--warn)" : "var(--ink-60)", borderColor: showIssues ? "var(--warn)" : "var(--line)" }}>
            <Icon name="alert" size={12}/> ปัญหา ({issues.length})
          </button>
          <button onClick={() => setShowLog(!showLog)} style={{
            ...btnGhost,
            color: showLog ? "var(--ink)" : logs.length > 0 ? "var(--ok)" : "var(--ink-60)",
            borderColor: logs.length > 0 && !showLog ? "var(--ok-line)" : "var(--line)",
            background: logs.length > 0 && !showLog ? "var(--ok-bg)" : "var(--bg-card)",
            fontWeight: logs.length > 0 ? 600 : 500,
          }}>
            <Icon name="log" size={12}/> Audit ({logs.length})
          </button>
        </div>
      </div>

      {/* Body */}
      <main style={{ padding: "16px 24px 32px" }}>
        {!ready && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px", marginBottom: 12,
            background: "var(--warn-bg)", border: "1px solid var(--warn-line)",
            borderRadius: 6, color: "var(--warn-ink)", fontSize: 12.5,
          }}>
            <Icon name="user" size={14}/>
            <span>กรุณาเลือกชื่อผู้ปฏิบัติงานด้านบนก่อน เพื่อเริ่มกดเช็คงานและรายงานปัญหา</span>
          </div>
        )}
        {showIssues && <IssuePanel issues={issues} addIssue={addIssue} canSubmit={ready} onClose={() => setShowIssues(false)}/>}
        {showLog && <AuditPanel logs={logs} onClose={() => setShowLog(false)} onExport={exportCSV}/>}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 2px 14px" }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 500 }}>Tasks</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>
              {activePhase === "all" ? "รายการเตรียมความพร้อมทั้งหมด" : PHASES.find((p) => p.id === activePhase).labelTh}
              <span style={{ color: "var(--ink-60)", fontWeight: 400, marginLeft: 8 }}>· {filtered.length} จาก {total}</span>
            </div>
          </div>
          {(activePhase !== "all" || activeOwner !== "all" || search) && (
            <button onClick={() => { setActivePhase("all"); setActiveOwner("all"); setSearch(""); }} style={btnGhost}>
              ล้างตัวกรอง
            </button>
          )}
        </div>

        <div style={{ display: "grid", gap: cardStyle === "flat" ? 0 : 8 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--ink-60)", fontSize: 13, border: "1px dashed var(--line)", borderRadius: 8 }}>
              ไม่พบรายการที่ตรงกับตัวกรอง
            </div>
          ) : filtered.map((t) => (
            <TaskRow key={t.id} t={t} phase={PHASES.find((p) => p.id === t.phase)}
              onToggle={toggleTask} canCheck={ready} cardStyle={cardStyle}
              showPhase={activePhase === "all"}/>
          ))}
        </div>
      </main>

      <footer style={{ padding: "14px 24px", borderTop: "1px solid var(--line)", background: "var(--bg-card)", textAlign: "center" }}>
        <div style={{ fontSize: 10.5, color: "var(--ink-60)", letterSpacing: 0.4, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>
          EXAM READINESS LOGBOOK · สำนักงานวิชาการ · PROTOTYPE v1.0
        </div>
      </footer>
    </div>
  );
}

window.Logbook = Logbook;
