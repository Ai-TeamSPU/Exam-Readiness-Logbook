// AdminPanel — staff management + task CRUD
// Admin-only UI. Modifies store.staffList and store.tasks.

const { useState: useStateA } = React;

function AdminIcon({ name, size = 14, stroke = 1.8 }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "x":      return <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case "plus":   return <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case "edit":   return <svg {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
    case "trash":  return <svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>;
    case "users":  return <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case "list":   return <svg {...p}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
    case "save":   return <svg {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
    case "shield": return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    default: return null;
  }
}

// ─── Staff Manager ────────────────────────────────────────────────
function StaffManager({ staffList, setStore }) {
  const [name, setName] = useStateA("");
  const placeholder = staffList[0];
  const names = staffList.slice(1);

  const addName = () => {
    const n = name.trim();
    if (!n) return;
    if (staffList.includes(n)) { alert("ชื่อนี้มีอยู่แล้ว"); return; }
    setStore((p) => ({ ...p, staffList: [...p.staffList, n] }));
    setName("");
  };

  const removeName = (n) => {
    if (!window.confirm(`ลบ "${n}" ออกจากรายชื่อ?`)) return;
    setStore((p) => ({
      ...p,
      staffList: p.staffList.filter((s) => s !== n),
      staff: p.staff === n ? placeholder : p.staff,
    }));
  };

  const renameName = (oldN, newN) => {
    const n = newN.trim();
    if (!n || n === oldN) return;
    if (staffList.includes(n)) { alert("ชื่อนี้มีอยู่แล้ว"); return; }
    setStore((p) => ({
      ...p,
      staffList: p.staffList.map((s) => s === oldN ? n : s),
      staff: p.staff === oldN ? n : p.staff,
      // also rename within logs/issues attribution? keep as historical record
    }));
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={name} onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addName()}
          placeholder="พิมพ์ชื่อ-นามสกุลผู้ปฏิบัติใหม่..."
          style={adminInput}/>
        <button onClick={addName} disabled={!name.trim()} style={{ ...adminBtnPrimary, opacity: name.trim() ? 1 : 0.4 }}>
          <AdminIcon name="plus" size={13}/> เพิ่ม
        </button>
      </div>
      <div style={{ fontSize: 11, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 500, marginBottom: 8 }}>
        รายชื่อปัจจุบัน · {names.length} คน
      </div>
      {names.length === 0 ? (
        <div style={emptyBox}>ยังไม่มีรายชื่อผู้ปฏิบัติ</div>
      ) : (
        <div style={{ display: "grid", gap: 6 }}>
          {names.map((n) => (
            <StaffRow key={n} name={n} onRename={(v) => renameName(n, v)} onRemove={() => removeName(n)}/>
          ))}
        </div>
      )}
    </div>
  );
}

function StaffRow({ name, onRename, onRemove }) {
  const [editing, setEditing] = useStateA(false);
  const [val, setVal] = useStateA(name);
  const save = () => { onRename(val); setEditing(false); };
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "8px 10px", background: "var(--bg-card)",
      border: "1px solid var(--line)", borderRadius: 6,
    }}>
      <div style={{ width: 24, height: 24, borderRadius: 99, background: "var(--bg)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-60)" }}>
        <AdminIcon name="users" size={12}/>
      </div>
      {editing ? (
        <input value={val} onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" ? save() : e.key === "Escape" ? (setVal(name), setEditing(false)) : null}
          autoFocus
          style={{ ...adminInput, flex: 1, padding: "4px 8px" }}/>
      ) : (
        <span style={{ flex: 1, fontSize: 13, color: "var(--ink)" }}>{name}</span>
      )}
      {editing ? (
        <button onClick={save} style={adminBtnGhost}><AdminIcon name="save" size={12}/></button>
      ) : (
        <button onClick={() => setEditing(true)} style={adminBtnGhost}><AdminIcon name="edit" size={12}/></button>
      )}
      <button onClick={onRemove} style={{ ...adminBtnGhost, color: "var(--alert)" }}><AdminIcon name="trash" size={12}/></button>
    </div>
  );
}

// ─── Task Manager ────────────────────────────────────────────────
function emptyTask() {
  return {
    id: `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    phase: "pre-exam",
    task: "",
    owner: "สวก.",
    ownerKey: "svk",
    deadline: "T-7 วัน",
    dayOffset: -7,
    priority: "medium",
    done: false, doneBy: null, doneAt: null,
  };
}

function TaskManager({ tasks, setStore }) {
  const [filter, setFilter] = useStateA("all");
  const [editingId, setEditingId] = useStateA(null);
  const [draft, setDraft] = useStateA(null);

  const startNew = () => {
    setDraft(emptyTask());
    setEditingId("__new");
  };
  const startEdit = (t) => {
    setDraft({ ...t });
    setEditingId(t.id);
  };
  const cancel = () => { setDraft(null); setEditingId(null); };

  const save = () => {
    if (!draft || !draft.task.trim()) { alert("กรุณาระบุชื่อรายการงาน"); return; }
    if (editingId === "__new") {
      setStore((p) => ({ ...p, tasks: [...p.tasks, draft] }));
    } else {
      setStore((p) => ({ ...p, tasks: p.tasks.map((t) => t.id === editingId ? draft : t) }));
    }
    cancel();
  };

  const remove = (id) => {
    const t = tasks.find((x) => x.id === id);
    if (!window.confirm(`ลบรายการ "${t.task}" ?`)) return;
    setStore((p) => ({ ...p, tasks: p.tasks.filter((x) => x.id !== id) }));
  };

  const visible = filter === "all" ? tasks : tasks.filter((t) => t.phase === filter);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={startNew} style={adminBtnPrimary}>
          <AdminIcon name="plus" size={13}/> เพิ่มรายการงานใหม่
        </button>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4, fontSize: 11.5, color: "var(--ink-60)" }}>
          <button onClick={() => setFilter("all")} style={filterBtn(filter === "all")}>ทั้งหมด ({tasks.length})</button>
          {PHASES.map((p) => {
            const c = tasks.filter((t) => t.phase === p.id).length;
            return (
              <button key={p.id} onClick={() => setFilter(p.id)} style={filterBtn(filter === p.id)}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: p.dot, display: "inline-block", marginRight: 5, verticalAlign: "middle" }}/>
                {p.labelTh} ({c})
              </button>
            );
          })}
        </div>
      </div>

      {editingId === "__new" && (
        <TaskEditor draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} isNew/>
      )}

      <div style={{ display: "grid", gap: 6 }}>
        {visible.length === 0 ? (
          <div style={emptyBox}>ไม่มีรายการงานในเฟสนี้</div>
        ) : visible.map((t) => (
          editingId === t.id ? (
            <TaskEditor key={t.id} draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel}/>
          ) : (
            <TaskAdminRow key={t.id} t={t} onEdit={() => startEdit(t)} onRemove={() => remove(t.id)}/>
          )
        ))}
      </div>
    </div>
  );
}

function TaskAdminRow({ t, onEdit, onRemove }) {
  const phase = PHASES.find((p) => p.id === t.phase) || PHASES[0];
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "auto 1fr auto auto auto",
      gap: 12, alignItems: "center",
      padding: "10px 12px", background: "var(--bg-card)",
      border: "1px solid var(--line)", borderRadius: 6,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 7, height: 7, borderRadius: 99, background: phase.dot }}/>
        <span style={{ fontSize: 10.5, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 500 }}>{phase.label}</span>
      </div>
      <div style={{ fontSize: 13, color: "var(--ink)" }}>{t.task}</div>
      <div style={{ fontSize: 11.5, color: "var(--ink-60)" }}>{t.owner}</div>
      <div style={{ fontSize: 11, color: "var(--ink-60)", fontFamily: "'JetBrains Mono', ui-monospace, monospace", minWidth: 80, textAlign: "right" }}>
        {t.deadline}
        {t.priority === "high" && <span style={{ marginLeft: 6, color: "var(--alert)", fontWeight: 600 }}>★</span>}
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        <button onClick={onEdit} style={adminBtnGhost}><AdminIcon name="edit" size={12}/></button>
        <button onClick={onRemove} style={{ ...adminBtnGhost, color: "var(--alert)" }}><AdminIcon name="trash" size={12}/></button>
      </div>
    </div>
  );
}

function TaskEditor({ draft, setDraft, onSave, onCancel, isNew }) {
  if (!draft) return null;
  const set = (k, v) => setDraft({ ...draft, [k]: v });
  const ownerOptions = [
    { key: "svk", label: "สวก." },
    { key: "ict", label: "ศูนย์ ICT" },
    { key: "fac", label: "คณะ/เจ้าของวิชา" },
    { key: "reg", label: "สำนักทะเบียน" },
    { key: "ctr", label: "กรรมการกลาง" },
  ];
  return (
    <div style={{
      padding: 14, background: "var(--ok-bg)",
      border: "1px solid var(--ok-line)", borderRadius: 8,
      marginBottom: 6,
    }}>
      <div style={{ fontSize: 11, color: "var(--ok)", textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600, marginBottom: 8 }}>
        {isNew ? "เพิ่มรายการงานใหม่" : "แก้ไขรายการงาน"}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="รายการงาน" full>
          <textarea value={draft.task} onChange={(e) => set("task", e.target.value)}
            rows={2} style={{ ...adminInput, width: "100%", resize: "vertical" }}
            placeholder="เช่น กำหนดปฏิทินสอบ..."/>
        </Field>
        <Field label="เฟส">
          <select value={draft.phase} onChange={(e) => set("phase", e.target.value)} style={adminInput}>
            {PHASES.map((p) => <option key={p.id} value={p.id}>{p.labelTh}</option>)}
          </select>
        </Field>
        <Field label="หน่วยงาน">
          <select value={draft.ownerKey}
            onChange={(e) => {
              const o = ownerOptions.find((x) => x.key === e.target.value);
              setDraft({ ...draft, ownerKey: e.target.value, owner: o ? o.label : draft.owner });
            }} style={adminInput}>
            {ownerOptions.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="ชื่อผู้รับผิดชอบ (แสดงผล)">
          <input value={draft.owner} onChange={(e) => set("owner", e.target.value)} style={adminInput}
            placeholder="เช่น สวก. + ศูนย์ ICT"/>
        </Field>
        <Field label="ระยะเวลา (deadline)">
          <input value={draft.deadline} onChange={(e) => set("deadline", e.target.value)} style={adminInput}
            placeholder="เช่น T-7 วัน"/>
        </Field>
        <Field label="วันที่อ้างอิง (จากวันสอบ)">
          <input type="number" value={draft.dayOffset}
            onChange={(e) => set("dayOffset", parseInt(e.target.value || "0", 10))} style={adminInput}
            placeholder="ลบ = ก่อนสอบ, บวก = หลังสอบ"/>
        </Field>
        <Field label="ความสำคัญ">
          <select value={draft.priority} onChange={(e) => set("priority", e.target.value)} style={adminInput}>
            <option value="medium">Normal</option>
            <option value="high">High (สำคัญ)</option>
          </select>
        </Field>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={adminBtnGhost}>ยกเลิก</button>
        <button onClick={onSave} style={adminBtnPrimary}>
          <AdminIcon name="save" size={12}/> บันทึก
        </button>
      </div>
    </div>
  );
}

function Field({ label, full, children }) {
  return (
    <label style={{ gridColumn: full ? "1 / -1" : "auto", display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 10.5, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 500 }}>{label}</span>
      {children}
    </label>
  );
}

// ─── Main Admin Panel ────────────────────────────────────────────
function AdminPanel({ store, setStore, onClose }) {
  const [tab, setTab] = useStateA("staff");
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, fontFamily: "'Sarabun', system-ui, sans-serif",
    }}
    onClick={onClose}>
      <div style={{
        width: "min(960px, 100%)", maxHeight: "92vh",
        background: "var(--bg)", borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1), 0 24px 60px rgba(15,23,42,0.25)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }} onClick={(e) => e.stopPropagation()}>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: "1px solid var(--line)",
          background: "var(--bg-card)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 7,
              background: "var(--ink)", color: "var(--bg-card)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <AdminIcon name="shield" size={16}/>
            </div>
            <div>
              <div style={{ fontSize: 10.5, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 500 }}>Admin Mode</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>จัดการระบบ</div>
            </div>
          </div>
          <button onClick={onClose} style={{ ...adminBtnGhost, padding: "6px 10px" }}>
            <AdminIcon name="x" size={14}/>
          </button>
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid var(--line)", background: "var(--bg-card)" }}>
          {[
            { id: "staff", label: "ผู้ปฏิบัติ", icon: "users", count: store.staffList.length - 1 },
            { id: "tasks", label: "รายการงาน", icon: "list", count: store.tasks.length },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "12px 18px", border: "none", background: "transparent",
              borderBottom: `2px solid ${tab === t.id ? "var(--ink)" : "transparent"}`,
              fontFamily: "inherit", fontSize: 13, cursor: "pointer",
              color: tab === t.id ? "var(--ink)" : "var(--ink-60)",
              fontWeight: tab === t.id ? 600 : 500,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <AdminIcon name={t.icon} size={13}/>
              {t.label}
              <span style={{ fontSize: 11, color: "var(--ink-60)" }}>· {t.count}</span>
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {tab === "staff" && <StaffManager staffList={store.staffList} setStore={setStore}/>}
          {tab === "tasks" && <TaskManager tasks={store.tasks} setStore={setStore}/>}
        </div>

        <div style={{
          padding: "10px 20px", borderTop: "1px solid var(--line)",
          background: "var(--bg-card)", display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ fontSize: 11, color: "var(--ink-60)" }}>
            การเปลี่ยนแปลงจะถูกบันทึกอัตโนมัติ
          </div>
          <button onClick={() => {
            if (!window.confirm("คืนค่าเริ่มต้น (รายการงาน + รายชื่อผู้ปฏิบัติ) ทั้งหมด?\nสถานะการเช็คงาน, Log, และปัญหาจะไม่ถูกล้าง")) return;
            setStore((p) => ({
              ...p,
              staffList: STAFF.slice(),
              tasks: TASKS_SEED.map((t) => {
                const old = p.tasks.find((x) => x.id === t.id);
                return { ...t, ...(old ? { done: old.done, doneBy: old.doneBy, doneAt: old.doneAt } : { done: false, doneBy: null, doneAt: null }) };
              }),
            }));
          }} style={{ ...adminBtnGhost, color: "var(--ink-60)" }}>
            คืนค่าเริ่มต้น
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Shared admin styles ────────────────────────────────────────
const adminInput = {
  padding: "7px 10px", borderRadius: 5,
  border: "1px solid var(--line)", background: "var(--bg-card)",
  fontSize: 13, fontFamily: "inherit", color: "var(--ink)",
  outline: "none", boxSizing: "border-box",
};
const adminBtnPrimary = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "7px 12px", borderRadius: 5, border: "1px solid var(--ink)",
  background: "var(--ink)", color: "var(--bg-card)",
  fontSize: 12.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
};
const adminBtnGhost = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "6px 10px", borderRadius: 5, border: "1px solid var(--line)",
  background: "var(--bg-card)", color: "var(--ink-60)",
  fontSize: 12, fontWeight: 500, fontFamily: "inherit", cursor: "pointer",
};
const filterBtn = (active) => ({
  padding: "5px 10px", borderRadius: 5, border: "1px solid var(--line)",
  background: active ? "var(--ink)" : "var(--bg-card)",
  color: active ? "var(--bg-card)" : "var(--ink-60)",
  fontSize: 11, fontFamily: "inherit", cursor: "pointer", fontWeight: 500,
});
const emptyBox = {
  padding: "32px 16px", textAlign: "center", fontSize: 12.5, color: "var(--ink-60)",
  border: "1px dashed var(--line)", borderRadius: 6,
};

window.AdminPanel = AdminPanel;
