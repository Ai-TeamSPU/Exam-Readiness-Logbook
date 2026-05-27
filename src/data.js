import { useState, useEffect } from 'react';

export const PHASES = [
  { id: "pre-exam", label: "Pre-Exam", labelTh: "เตรียมการ", range: "T-28 → T-7", dot: "var(--phase-pre)" },
  { id: "exam-ready", label: "Exam-Ready", labelTh: "พร้อมสอบ", range: "T-7 → T-1", dot: "var(--phase-ready)" },
  { id: "during-exam", label: "During Exam", labelTh: "ระหว่างสอบ", range: "Day 0", dot: "var(--phase-live)" },
  { id: "post-exam", label: "Post-Exam", labelTh: "หลังสอบ", range: "T+1 → T+21", dot: "var(--phase-post)" },
];

export const STAFF = ["เลือกผู้ปฏิบัติ", "คุณ ณัฐา", "คุณ พิชัย", "คุณ สุรีย์", "หัวหน้างาน", "ผช.ผอ. สำนักวิชาการ"];

export const OWNER_FILTERS = [
  { key: "all", label: "ทุกหน่วยงาน" },
  { key: "svk", label: "สวก." },
  { key: "ict", label: "ศูนย์ ICT" },
  { key: "fac", label: "คณะ/วิชา" },
  { key: "reg", label: "สำนักทะเบียน" },
  { key: "ctr", label: "กรรมการกลาง" },
];

export const EXAM_DATE = new Date("2026-08-01T08:00:00");

export function thaiNowString(d = new Date()) {
  return d.toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" });
}

export function csvEscape(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function downloadCSV(filename, rows) {
  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
}

export function daysUntilExam() {
  const ms = EXAM_DATE - new Date();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

// 🛑 วาง URL ที่ได้จากขั้นตอน Deploy Google Apps Script (Web App) ลงที่นี่
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyBOvhjjn-4_gqcXBTZ31TQwpENTfo5kwg-KvdUqDhRnwqMTS7oMOhHe9tan1NydYrh/exec';

// ข้อมูลเริ่มต้นเผื่อ Google Sheet ว่างเปล่า
const INITIAL_TASKS = [
  { id: 1, phase: "pre-exam", task: "ทบทวนตารางสอบ", owner: "สวก.", ownerKey: "svk", done: false },
  { id: 2, phase: "pre-exam", task: "พิมพ์ข้อสอบและจัดเก็บในห้องมั่นคง", owner: "สวก.", ownerKey: "svk", done: false },
  { id: 3, phase: "exam-ready", task: "เตรียมอุปกรณ์/เอกสารผู้คุมสอบ", owner: "คณะ/วิชา", ownerKey: "fac", done: false },
  { id: 4, phase: "exam-ready", task: "ตั้งค่าระบบและเครือข่าย", owner: "ศูนย์ ICT", ownerKey: "ict", done: false },
  { id: 5, phase: "during-exam", task: "แจกข้อสอบ", owner: "กรรมการกลาง", ownerKey: "ctr", done: false },
  { id: 6, phase: "during-exam", task: "ตรวจสอบความเรียบร้อยระหว่างสอบ", owner: "ทุกหน่วยงาน", ownerKey: "all", done: false },
  { id: 7, phase: "post-exam", task: "รับข้อสอบคืนและตรวจนับ", owner: "สำนักทะเบียน", ownerKey: "reg", done: false },
  { id: 8, phase: "post-exam", task: "ประกาศผลสอบ", owner: "สำนักทะเบียน", ownerKey: "reg", done: false }
];

export function useBackendState() {
  const [store, setStore] = useState({
    staffList: STAFF,
    tasks: [],
    logs: [],
    issues: [],
    staff: STAFF[0],
    loading: true
  });

  const loadData = async () => {
    // ถ้ายังไม่ได้ใส่ URL ข้ามไปเลย
    if (!GAS_URL || GAS_URL.includes('_PUT_YOUR_URL_HERE_')) {
      setStore(prev => ({ ...prev, tasks: INITIAL_TASKS, loading: false }));
      return;
    }

    try {
      const response = await fetch(GAS_URL);
      const data = await response.json();

      const normalizedTasks = data.tasks?.length > 0 ? data.tasks.map(t => ({
        id: t.id,
        phase: t.phase,
        task: t.task_name || t.task,
        owner: t.owner,
        ownerKey: t.owner_key || t.ownerKey,
        done: t.done === true || t.done === 'TRUE' || t.done === 'true',
        doneBy: t.done_by || t.doneBy || null,
        doneAt: t.done_at || t.doneAt || null
      })) : INITIAL_TASKS;

      setStore(prev => ({
        ...prev,
        tasks: normalizedTasks,
        issues: data.issues || [],
        logs: data.logs || [],
        loading: false
      }));
    } catch (err) {
      console.error("Failed to load data from GAS", err);
      setStore(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // ดึงข้อมูลทุก 10 วินาที
    return () => clearInterval(interval);
  }, []);

  const sendToGAS = async (action, data) => {
    if (!GAS_URL || GAS_URL.includes('_PUT_YOUR_URL_HERE_')) return;
    try {
      await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, data })
      });
    } catch (error) {
      console.error('GAS Error:', error);
    }
  }

  const toggleTask = async (id, staff) => {
    const target = store.tasks.find(t => t.id === id);
    if (!target) return;
    const newDone = !target.done;
    const now = thaiNowString();

    const updatedTask = { ...target, done: newDone, doneBy: newDone ? staff : null, doneAt: newDone ? now : null };

    setStore(p => ({
      ...p,
      tasks: p.tasks.map(t => t.id === id ? updatedTask : t),
      logs: [{ time: now, staff, action: `${newDone ? "เสร็จ" : "ยกเลิก"}: ${target.task}` }, ...p.logs]
    }));

    // แปลงชื่อ field ให้ตรงกับ Sheet Header (ตอนอัปเดต)
    await sendToGAS('UPDATE_TASK', {
      id: updatedTask.id,
      phase: updatedTask.phase,
      task_name: updatedTask.task,
      owner: updatedTask.owner,
      owner_key: updatedTask.ownerKey,
      done: updatedTask.done,
      done_by: updatedTask.doneBy,
      done_at: updatedTask.doneAt
    });

    await sendToGAS('ADD_LOG', {
      time: now,
      staff,
      action: `${newDone ? "เสร็จ" : "ยกเลิก"}: ${target.task}`
    });
  };

  const addIssue = async (text, severity, staff) => {
    const now = thaiNowString();
    const newIssue = { id: Date.now(), text, by: staff, at: now, severity };

    setStore(p => ({
      ...p,
      issues: [newIssue, ...p.issues],
      logs: [{ time: now, staff, action: `แจ้งปัญหา [${severity}]: ${text}` }, ...p.logs]
    }));

    await sendToGAS('UPDATE_ISSUE', newIssue);
    await sendToGAS('ADD_LOG', {
      time: now,
      staff,
      action: `แจ้งปัญหา [${severity}]: ${text}`
    });
  };

  const resetAll = async () => {
    if (!window.confirm("ต้องการล้างข้อมูลทั้งหมดหรือไม่? (จะเคลียร์สถานะในหน้าเว็บปัจจุบัน)")) return;

    setStore(p => ({
      ...p,
      tasks: p.tasks.map(t => ({ ...t, done: false, doneBy: null, doneAt: null })),
      logs: [],
      issues: [],
      staff: p.staffList[0]
    }));

    // สำหรับ GAS เพื่อความง่าย ถ้าอยากล้างจริง แนะนำให้ผู้ใช้ไปลบใน Sheet ด้วยตัวเอง
    alert("ระบบล้างค่าในหน้าจอแล้ว (เพื่อลบข้อมูลใน Google Sheet กรุณาเปิด Sheet แล้วลบข้อมูลในบรรทัดทิ้งด้วยตัวเอง)");
  };

  const setStaff = (s) => setStore(p => ({ ...p, staff: s }));

  return { store, toggleTask, addIssue, resetAll, setStaff };
}
