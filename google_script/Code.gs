// ==========================================
// Exam Readiness Logbook - Google Apps Script
// ==========================================
// คำแนะนำ:
// 1. นำโค้ดนี้ไปวางใน Google Apps Script
// 2. สร้างชีต (Tabs) ชื่อ: Tasks, Issues, Logs
// 3. กด Deploy > New Deployment > เลือกประเภท "Web app"
// 4. Who has access: "Anyone"
// ==========================================

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function getSheet(sheetName) {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
}

// ----------------------------------------------------------------------
// GET: ดึงข้อมูลทั้งหมด
// ----------------------------------------------------------------------
function doGet(e) {
  const result = {
    tasks: readData('Tasks'),
    issues: readData('Issues'),
    logs: readData('Logs'),
    staff: readData('Staff')
  };
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ----------------------------------------------------------------------
// POST: บันทึกข้อมูล
// ----------------------------------------------------------------------
function doPost(e) {
  let result = { success: false, error: 'No data' };
  
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action; // 'UPDATE_TASK', 'UPDATE_ISSUE', 'ADD_LOG'
    const data = payload.data;
    
    if (action === 'UPDATE_TASK') {
      updateOrCreateRow('Tasks', data, 'task_name');
    } else if (action === 'UPDATE_ISSUE') {
      updateOrCreateRow('Issues', data, 'id');
    } else if (action === 'ADD_LOG') {
      appendRow('Logs', data);
    }
    
    result = { success: true };
  } catch (error) {
    result = { success: false, error: error.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ----------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------
function readData(sheetName) {
  const sheet = getSheet(sheetName);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // ไม่มีข้อมูลนอกจาก Header (ถ้ามี)
  
  const headers = data[0];
  const rows = [];
  
  for (let i = 1; i < data.length; i++) {
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
      
      // Convert 'TRUE'/'FALSE' text back to boolean
      if (obj[headers[j]] === 'TRUE' || obj[headers[j]] === true) obj[headers[j]] = true;
      if (obj[headers[j]] === 'FALSE' || obj[headers[j]] === false) obj[headers[j]] = false;
    }
    rows.push(obj);
  }
  
  return rows;
}

function appendRow(sheetName, dataObj) {
  const sheet = getSheet(sheetName);
  if (!sheet) return;
  
  const headers = getOrCreateHeaders(sheet, dataObj);
  const row = headers.map(header => {
    let val = dataObj[header];
    if (typeof val === 'boolean') val = val ? 'TRUE' : 'FALSE';
    return val !== undefined ? val : '';
  });
  
  sheet.appendRow(row);
}

function updateOrCreateRow(sheetName, dataObj, keyField) {
  const sheet = getSheet(sheetName);
  if (!sheet) return;
  
  const headers = getOrCreateHeaders(sheet, dataObj);
  const data = sheet.getDataRange().getValues();
  const keyIndex = headers.indexOf(keyField);
  
  if (keyIndex === -1) {
    // If key field isn't even in headers, just append
    appendRow(sheetName, dataObj);
    return;
  }
  
  const keyValue = dataObj[keyField];
  let rowIndex = -1;
  
  // Find the row to update
  for (let i = 1; i < data.length; i++) {
    if (data[i][keyIndex] == keyValue) {
      rowIndex = i + 1; // +1 because array is 0-indexed and sheet is 1-indexed
      break;
    }
  }
  
  if (rowIndex !== -1) {
    // Update existing row
    const newRow = headers.map(header => {
      let val = dataObj[header];
      if (typeof val === 'boolean') val = val ? 'TRUE' : 'FALSE';
      return val !== undefined ? val : '';
    });
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([newRow]);
  } else {
    // Append new row
    appendRow(sheetName, dataObj);
  }
}

function getOrCreateHeaders(sheet, dataObj) {
  let headers = [];
  if (sheet.getLastRow() === 0) {
    // Sheet is empty, create headers from keys
    headers = Object.keys(dataObj);
    sheet.appendRow(headers);
  } else {
    headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Check if dataObj has new keys that are not in headers
    let added = false;
    Object.keys(dataObj).forEach(key => {
      if (headers.indexOf(key) === -1) {
        headers.push(key);
        added = true;
      }
    });
    
    if (added) {
      // Update header row
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }
  return headers;
}
