// Mobile companion view — checklist-first, designed for staff on-floor

const { useState: useStateM } = React;

function MIcon({ name, size = 16, stroke = 1.8 }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "check": return <svg {...p}><polyline points="20 6 9 17 4 12"/></svg>;
    case "alert": return <svg {...p}><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>;
    case "search": return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case "chev": return <svg {...p}><polyline points="9 18 15 12 9 6"/></svg>;
    default: return null;
  }
}

function LogbookMobile() {
  const [store, setStore] = usePersistedState(INITIAL_STORE);
  const tasks = store.tasks;
  const { issues, staff, staffList } = store;
  const setStaff = (s) => setStore((p) => ({ ...p, staff: s }));
  const [activePhase, setActivePhase] = useStateM("pre-exam");
  const [tab, setTab] = useStateM("tasks"); // tasks | issues
  const [issueText, setIssueText] = useStateM("");
  const [issueSev, setIssueSev] = useStateM("medium");

  const ready = staff !== staffList[0];
  const days = daysUntilExam();
  const tDay = days > 0 ? `T-${days}` : days === 0 ? "Day 0" : `T+${Math.abs(days)}`;

  const toggle = (id) => {
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

  const submitIssue = () => {
    if (!ready || !issueText.trim()) return;
    const now = thaiNowString();
    const text = issueText.trim();
    setStore((p) => ({
      ...p,
      issues: [{ text, by: staff, at: now, severity: issueSev }, ...p.issues],
      logs: [{ time: now, staff, action: `แจ้งปัญหา [${issueSev}]: ${text}` }, ...p.logs],
    }));
    setIssueText("");
  };

  const phaseTasks = tasks.filter((t) => t.phase === activePhase);
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const sevTone = { low: "var(--ink-60)", medium: "var(--warn)", high: "var(--alert)" };

  return (
    <div style={{ background: "var(--bg)", color: "var(--ink)", height: "100%", display: "flex", flexDirection: "column", fontFamily: "'Sarabun', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "8px 16px 12px", background: "var(--bg-card)", borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 9.5, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 500 }}>Exam Logbook</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 1 }}>S/2568 · 1 ส.ค. 2569</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: days <= 7 ? "var(--alert)" : "var(--warn)", fontFamily: "'JetBrains Mono', ui-monospace, monospace", lineHeight: 1 }}>{tDay}</div>
            <div style={{ fontSize: 9.5, color: "var(--ink-60)", marginTop: 2 }}>{days > 0 ? `${days} วัน` : "วันสอบ"}</div>
          </div>
        </div>
        <select value={staff} onChange={(e) => setStaff(e.target.value)} style={{
          width: "100%", padding: "9px 12px", borderRadius: 6,
          border: `1px solid ${ready ? "var(--ok-line)" : "var(--line)"}`,
          background: ready ? "var(--ok-bg)" : "var(--bg)", fontFamily: "inherit", fontSize: 13,
          color: ready ? "var(--ink)" : "var(--ink-60)", fontWeight: 500, outline: "none",
        }}>
          {staffList.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 10.5, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 500 }}>ความพร้อม</span>
              <span style={{ fontSize: 11, color: "var(--ink-60)", fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>{done}/{total} · {pct}%</span>
            </div>
            <div style={{ height: 4, background: "var(--line)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: pct >= 80 ? "var(--ok)" : pct >= 50 ? "var(--warn)" : "var(--alert)", transition: "width 0.4s" }}/>
            </div>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--line)", background: "var(--bg-card)" }}>
        {[
          { id: "tasks", label: "งาน", count: total - done },
          { id: "issues", label: "ปัญหา", count: issues.length },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "11px 10px", border: "none", background: "transparent",
            borderBottom: `2px solid ${tab === t.id ? "var(--ink)" : "transparent"}`,
            color: tab === t.id ? "var(--ink)" : "var(--ink-60)",
            fontFamily: "inherit", fontSize: 13, fontWeight: tab === t.id ? 600 : 500, cursor: "pointer",
          }}>
            {t.label} <span style={{ fontSize: 11, color: "var(--ink-60)", marginLeft: 4 }}>· {t.count}</span>
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", background: "var(--bg)" }}>
        {tab === "tasks" && (
          <>
            {/* Phase tabs */}
            <div style={{ display: "flex", gap: 6, padding: "10px 12px", overflowX: "auto", borderBottom: "1px solid var(--line)", background: "var(--bg-card)" }}>
              {PHASES.map((p) => {
                const ts = tasks.filter((t) => t.phase === p.id);
                const d = ts.filter((t) => t.done).length;
                const active = activePhase === p.id;
                return (
                  <button key={p.id} onClick={() => setActivePhase(p.id)} style={{
                    flex: "0 0 auto", padding: "8px 12px", borderRadius: 6,
                    border: `1px solid ${active ? "var(--ink)" : "var(--line)"}`,
                    background: active ? "var(--ink)" : "var(--bg-card)",
                    color: active ? "var(--bg-card)" : "var(--ink)",
                    fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: 99, background: p.dot }}/>
                    {p.labelTh}
                    <span style={{ fontSize: 10.5, opacity: 0.7, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>{d}/{ts.length}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ padding: 12, display: "grid", gap: 8 }}>
              {phaseTasks.map((t) => (
                <div key={t.id} onClick={() => toggle(t.id)} style={{
                  padding: "12px 14px", background: t.done ? "var(--bg-done)" : "var(--bg-card)",
                  border: `1px solid ${t.done ? "var(--ok-line)" : t.priority === "high" ? "var(--alert-line)" : "var(--line)"}`,
                  borderRadius: 8, cursor: ready ? "pointer" : "not-allowed",
                  opacity: ready ? 1 : 0.7,
                  display: "grid", gridTemplateColumns: "20px 1fr", gap: 12, alignItems: "flex-start",
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 5, marginTop: 1,
                    border: t.done ? "none" : `1.5px solid ${t.priority === "high" ? "var(--alert)" : "var(--ink-40)"}`,
                    background: t.done ? "var(--ok)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    {t.done && <span style={{ color: "white" }}><MIcon name="check" size={12} stroke={3}/></span>}
                  </div>
                  <div>
                    <div style={{
                      fontSize: 13, lineHeight: 1.5, fontWeight: 500,
                      color: t.done ? "var(--ink-60)" : "var(--ink)",
                      textDecoration: t.done ? "line-through" : "none",
                    }}>{t.task}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 6, fontSize: 11, color: "var(--ink-60)", flexWrap: "wrap" }}>
                      <span>{t.owner}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>· {t.deadline}</span>
                      {t.priority === "high" && !t.done && (
                        <span style={{ color: "var(--alert)", fontWeight: 600 }}>· สำคัญ</span>
                      )}
                    </div>
                    {t.done && t.doneBy && (
                      <div style={{ fontSize: 10.5, color: "var(--ok)", marginTop: 4, fontWeight: 500 }}>
                        ✓ {t.doneBy} · {t.doneAt}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "issues" && (
          <div style={{ padding: 12 }}>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 8, color: "var(--warn-ink)" }}>แจ้งปัญหาใหม่</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                {["low","medium","high"].map((s) => (
                  <button key={s} onClick={() => setIssueSev(s)} style={{
                    flex: 1, padding: "7px 0", borderRadius: 5, border: "1px solid var(--line)",
                    background: issueSev === s ? sevTone[s] : "transparent",
                    color: issueSev === s ? "white" : "var(--ink-60)",
                    fontFamily: "inherit", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, cursor: "pointer",
                  }}>{s}</button>
                ))}
              </div>
              <textarea value={issueText} onChange={(e) => setIssueText(e.target.value)}
                placeholder="ระบุปัญหา..." rows={3}
                style={{
                  width: "100%", padding: "9px 11px", borderRadius: 6,
                  border: "1px solid var(--line)", fontSize: 13, fontFamily: "inherit",
                  outline: "none", resize: "none", background: "var(--bg)", color: "var(--ink)",
                  boxSizing: "border-box",
                }}/>
              <button onClick={submitIssue} disabled={!ready || !issueText.trim()} style={{
                width: "100%", marginTop: 8, padding: "10px", borderRadius: 6,
                border: "1px solid var(--ink)", background: "var(--ink)", color: "var(--bg-card)",
                fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                cursor: !ready || !issueText.trim() ? "not-allowed" : "pointer",
                opacity: !ready || !issueText.trim() ? 0.4 : 1,
              }}>ส่งรายงาน</button>
            </div>
            {issues.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", fontSize: 12, color: "var(--ink-60)", border: "1px dashed var(--line)", borderRadius: 8 }}>
                ยังไม่มีปัญหารายงาน
              </div>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {issues.map((iss, i) => (
                  <div key={i} style={{ padding: "10px 12px", background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 7 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: 99, background: sevTone[iss.severity] }}/>
                      <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: sevTone[iss.severity] }}>{iss.severity}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--ink)" }}>{iss.text}</div>
                    <div style={{ fontSize: 10.5, color: "var(--ink-60)", marginTop: 4, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>
                      {iss.by} · {iss.at}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

window.LogbookMobile = LogbookMobile;
