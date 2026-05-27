// Shared data + helpers for the Exam Readiness Logbook prototype

const PHASES = [
  { id: "pre-exam",    label: "Pre-Exam",    labelTh: "เตรียมการ",  range: "T-28 → T-7", dot: "var(--phase-pre)"  },
  { id: "exam-ready",  label: "Exam-Ready",  labelTh: "พร้อมสอบ",   range: "T-7 → T-1",  dot: "var(--phase-ready)" },
  { id: "during-exam", label: "During Exam", labelTh: "ระหว่างสอบ", range: "Day 0",      dot: "var(--phase-live)" },
  { id: "post-exam",   label: "Post-Exam",   labelTh: "หลังสอบ",    range: "T+1 → T+21", dot: "var(--phase-post)" },
];

// dayOffset: negative = before exam, 0 = exam day window, positive = after
const TASKS_SEED = [
  { id: 1,  phase: "pre-exam",    task: "กำหนดปฏิทินสอบ / กำหนดหลักเกณฑ์ออกข้อสอบ",       owner: "สวก.",            ownerKey: "svk", deadline: "T-28 วัน", dayOffset: -28, priority: "high"   },
  { id: 2,  phase: "pre-exam",    task: "เปิดรายวิชา + กำหนดวันสอบ + รูปแบบการจัดสอบ",      owner: "สำนักทะเบียน",    ownerKey: "reg", deadline: "T-21 วัน", dayOffset: -21, priority: "high"   },
  { id: 3,  phase: "pre-exam",    task: "ออกข้อสอบตามรายวิชาที่มีการจัดสอบออนไลน์",         owner: "คณะ/เจ้าของวิชา", ownerKey: "fac", deadline: "T-14 วัน", dayOffset: -14, priority: "high"   },
  { id: 4,  phase: "pre-exam",    task: "จัดทำคู่มือคลังข้อสอบ + คู่มือการคุมสอบออนไลน์",   owner: "สวก. + ศูนย์ ICT", ownerKey: "ict", deadline: "T-14 วัน", dayOffset: -14, priority: "medium" },
  { id: 5,  phase: "pre-exam",    task: "สำรวจห้องปฏิบัติ + ความจุของห้อง",                  owner: "สวก.",            ownerKey: "svk", deadline: "T-14 วัน", dayOffset: -14, priority: "medium" },
  { id: 6,  phase: "pre-exam",    task: "ประชาสัมพันธ์นักศึกษา (แบนเนอร์/SMS/LINE/จอ TV)",  owner: "สวก. + PR",       ownerKey: "svk", deadline: "T-10 วัน", dayOffset: -10, priority: "high"   },
  { id: 7,  phase: "pre-exam",    task: "วางแผนกำหนดกรรมการกลาง + กรรมการคุมสอบ",            owner: "สวก.",            ownerKey: "svk", deadline: "T-7 วัน",  dayOffset: -7,  priority: "high"   },

  { id: 8,  phase: "exam-ready",  task: "จัดห้องสอบ รายชื่อนักศึกษาเข้าห้องสอบ",              owner: "สวก.",            ownerKey: "svk", deadline: "T-5 วัน",  dayOffset: -5,  priority: "high"   },
  { id: 9,  phase: "exam-ready",  task: "นำรายชื่อนักศึกษาลงทะเบียนเข้าระบบ exam",          owner: "ศูนย์ ICT",       ownerKey: "ict", deadline: "T-3 วัน",  dayOffset: -3,  priority: "high"   },
  { id: 10, phase: "exam-ready",  task: "รับข้อสอบต้นฉบับจากคณะ + ส่งโรงพิมพ์ผลิตข้อสอบ",   owner: "สวก.",            ownerKey: "svk", deadline: "T-3 วัน",  dayOffset: -3,  priority: "high"   },
  { id: 11, phase: "exam-ready",  task: "Load Test ระบบคลังข้อสอบออนไลน์",                   owner: "ศูนย์ ICT",       ownerKey: "ict", deadline: "T-3 วัน",  dayOffset: -3,  priority: "high"   },
  { id: 12, phase: "exam-ready",  task: "จัดข้อสอบ + กระดาษ + สมุดคำตอบบรรจุเข้าซองแยกตามวัน", owner: "สวก.",         ownerKey: "svk", deadline: "T-1 วัน",  dayOffset: -1,  priority: "high"   },
  { id: 13, phase: "exam-ready",  task: "ส่ง E-mail แจ้งกรรมการคุมสอบ + ชี้แจงบทบาท",         owner: "สวก.",            ownerKey: "svk", deadline: "T-2 วัน",  dayOffset: -2,  priority: "medium" },
  { id: 14, phase: "exam-ready",  task: "ติด Infographic หน้าห้องสอบทุกห้อง",                 owner: "สวก.",            ownerKey: "svk", deadline: "T-1 วัน",  dayOffset: -1,  priority: "medium" },

  { id: 15, phase: "during-exam", task: "จัดเจ้าหน้าที่ส่ง-รับข้อสอบระหว่างตึก",              owner: "สวก.",            ownerKey: "svk", deadline: "ทุกวันสอบ", dayOffset: 0,   priority: "high"   },
  { id: 16, phase: "during-exam", task: "จัดกรรมการคุมสอบแบบออนไลน์",                          owner: "สวก.",            ownerKey: "svk", deadline: "ทุกวันสอบ", dayOffset: 0,   priority: "high"   },
  { id: 17, phase: "during-exam", task: "กำกับดูแลความเรียบร้อยตลอดช่วงการสอบ",                owner: "สวก.",            ownerKey: "svk", deadline: "ทุกวันสอบ", dayOffset: 0,   priority: "high"   },
  { id: 18, phase: "during-exam", task: "บันทึกปัญหาที่เกิดขึ้นในระบบรายงาน",                  owner: "กรรมการกลาง",     ownerKey: "ctr", deadline: "ทุกวันสอบ", dayOffset: 0,   priority: "medium" },

  { id: 19, phase: "post-exam",   task: "ตรวจสอบข้อมูลการสอบ + บันทึกคะแนน",                  owner: "คณะ/เจ้าของวิชา", ownerKey: "fac", deadline: "T+5 วัน",   dayOffset: 5,   priority: "high"   },
  { id: 20, phase: "post-exam",   task: "ประกาศผลสอบในระบบ SCMS",                              owner: "สวก.",            ownerKey: "svk", deadline: "T+12 วัน",  dayOffset: 12,  priority: "high"   },
  { id: 21, phase: "post-exam",   task: "รวบรวมปัญหา + จัดทำ After Action Review",            owner: "สวก.",            ownerKey: "svk", deadline: "T+14 วัน",  dayOffset: 14,  priority: "medium" },
  { id: 22, phase: "post-exam",   task: "จัดทำ Executive Report สรุปเสนอผู้บริหาร",            owner: "สวก.",            ownerKey: "svk", deadline: "T+21 วัน",  dayOffset: 21,  priority: "medium" },
];

const STAFF = ["เลือกผู้ปฏิบัติ", "คุณ ณัฐา", "คุณ พิชัย", "คุณ สุรีย์", "หัวหน้างาน", "ผช.ผอ. สำนักวิชาการ"];

const OWNER_FILTERS = [
  { key: "all", label: "ทุกหน่วยงาน" },
  { key: "svk", label: "สวก." },
  { key: "ict", label: "ศูนย์ ICT" },
  { key: "fac", label: "คณะ/วิชา" },
  { key: "reg", label: "สำนักทะเบียน" },
  { key: "ctr", label: "กรรมการกลาง" },
];

// Exam day used for the demo countdown
const EXAM_DATE = new Date("2026-08-01T08:00:00");

function thaiNowString(d = new Date()) {
  return d.toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" });
}

function csvEscape(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCSV(filename, rows) {
  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
}

function daysUntilExam() {
  const ms = EXAM_DATE - new Date();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

// ─── Persistence ────────────────────────────────────────────────
const STORAGE_KEY = "exam-readiness-logbook-v2";
const ADMIN_KEY = "exam-readiness-logbook-admin";

// Initial store: seeded from constants above, fully editable at runtime.
const INITIAL_STORE = {
  schemaVersion: 2,
  staffList: STAFF.slice(),                                      // [placeholder, ...names]
  tasks: TASKS_SEED.map((t) => ({ ...t, done: false, doneBy: null, doneAt: null })),
  logs: [],
  issues: [],
  staff: STAFF[0],
};

function mergeStore(loaded) {
  if (!loaded || typeof loaded !== "object") return INITIAL_STORE;
  // Forward-compat: if older v1 shape (with taskState), upgrade to v2 shape
  if (loaded.taskState && !loaded.tasks) {
    const upgradedTasks = TASKS_SEED.map((t) => ({
      ...t,
      ...(loaded.taskState[t.id] || { done: false, doneBy: null, doneAt: null }),
    }));
    return { ...INITIAL_STORE, ...loaded, tasks: upgradedTasks, taskState: undefined, schemaVersion: 2 };
  }
  return { ...INITIAL_STORE, ...loaded };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return mergeStore(parsed);
  } catch (e) {
    console.warn("loadState failed:", e);
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("saveState failed:", e);
  }
}

function clearState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
}

// React hook: shared persisted state across tabs/views via storage events.
function usePersistedState(initial) {
  const [state, setState] = React.useState(() => {
    const loaded = loadState();
    return loaded || initial;
  });

  // Save on change
  React.useEffect(() => {
    saveState(state);
  }, [state]);

  // Listen for changes from other windows/iframes/tabs
  React.useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY) return;
      if (!e.newValue) { setState(initial); return; }
      try {
        const next = JSON.parse(e.newValue);
        setState(next);
      } catch (err) {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Also poll within same window for cross-iframe updates (storage events
  // only fire across windows, not same-window iframes). Lightweight: re-read
  // on focus and on a short interval, only if value actually changed.
  React.useEffect(() => {
    let lastRaw = localStorage.getItem(STORAGE_KEY);
    const check = () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === lastRaw) return;
      lastRaw = raw;
      if (!raw) { setState(initial); return; }
      try { setState(JSON.parse(raw)); } catch (e) {}
    };
    const id = setInterval(check, 800);
    window.addEventListener("focus", check);
    return () => { clearInterval(id); window.removeEventListener("focus", check); };
  }, []);

  return [state, setState];
}

Object.assign(window, {
  PHASES, TASKS_SEED, STAFF, OWNER_FILTERS, EXAM_DATE, INITIAL_STORE,
  thaiNowString, csvEscape, downloadCSV, daysUntilExam,
  STORAGE_KEY, ADMIN_KEY, loadState, saveState, clearState, usePersistedState, mergeStore,
});
