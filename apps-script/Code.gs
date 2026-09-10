/**
 * ===================================================================
 *  Interactive Logic Simulator - ตัวรับข้อมูลความก้าวหน้าของนักเรียน
 *  รายวิชาคอมพิวเตอร์ 4 (ว32281) โรงเรียนหนองหงส์พิทยาคม
 * ===================================================================
 *
 *  วิธีติดตั้งอ่านได้ที่ docs/คู่มือติดตั้งแดชบอร์ด.md
 *  สรุปสั้น ๆ: สร้าง Google Sheet > ส่วนขยาย > Apps Script > วางโค้ดนี้ทับทั้งหมด
 *  > แก้รหัส 2 ค่าด้านล่าง > Deploy เป็น Web App > คัดลอก URL ไปใส่ในเว็บแอป
 */

/* ====== แก้ไข 2 บรรทัดนี้ก่อนใช้งาน ======
 * ไฟล์นี้เป็นตัวอย่างสาธารณะ จึงไม่ใส่รหัสจริงไว้
 * ไฟล์ที่ใส่รหัสจริงให้แล้วอยู่ที่ apps-script/Code-พร้อมใช้-ห้ามอัปโหลด.gs (ไม่ถูก push ขึ้น GitHub)
 */

/** รหัสสำหรับให้เว็บแอปของนักเรียนส่งข้อมูลเข้ามา */
const CLASS_SECRET = 'CHANGE_ME_CLASS';

/** รหัสสำหรับให้ครูเปิดดูแดชบอร์ด (ต้องต่างจากรหัสด้านบน และห้ามบอกนักเรียน) */
const TEACHER_KEY = 'CHANGE_ME_TEACHER';

/* ============ ไม่ต้องแก้ส่วนด้านล่างนี้ ============ */

const SHEET_NAME = 'ผลกิจกรรม';

/** ลำดับคอลัมน์ในชีต ต้องตรงกับลำดับใน writeRow() */
const HEADERS = [
  'อัปเดตล่าสุด',
  'ห้องเรียน',
  'รหัสคู่',
  'ชื่อ Driver',
  'เลขที่ Driver',
  'ชื่อ Navigator',
  'เลขที่ Navigator',
  'ภารกิจ 1 สุ่มข้อสอบ',
  'ภารกิจ 2 เงื่อนไขจบเกม',
  'คะแนนจำลอง',
  'ใบงาน (%)',
  'สร้าง PDF แล้ว',
  'ไฟล์ .capx',
  'สลับบทบาท (ครั้ง)',
  'รหัสเครื่อง',
];

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  // เขียนหัวตารางถ้ายังไม่มี
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#dee7ff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** กุญแจระบุคู่ ใช้ห้องเรียน + รหัสคู่ เพื่อให้ข้อมูลของคู่เดิมถูกเขียนทับแทนการเพิ่มแถวใหม่ */
function rowKey(classroom, pairCode) {
  return String(classroom).trim() + '|' + String(pairCode).trim();
}

function buildRow(p) {
  return [
    new Date(),
    p.classroom || '',
    p.pairCode || '',
    p.driverName || '',
    p.driverNumber || '',
    p.navigatorName || '',
    p.navigatorNumber || '',
    p.mission1Passed ? 'ผ่าน' : 'ยังไม่ผ่าน',
    p.mission2Passed ? 'ผ่าน' : 'ยังไม่ผ่าน',
    Number(p.bestScore) || 0,
    Number(p.worksheetPercent) || 0,
    p.pdfGenerated ? 'แล้ว' : 'ยังไม่ได้สร้าง',
    p.capxFileName || '',
    Number(p.roleSwitchCount) || 0,
    p.deviceId || '',
  ];
}

/** รับข้อมูลจากเว็บแอปของนักเรียน */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // กันข้อมูลชนกันเมื่อหลายคู่ส่งพร้อมกัน
    lock.waitLock(20000);

    const body = JSON.parse(e.postData.contents);
    if (body.secret !== CLASS_SECRET) {
      return jsonOut({ ok: false, error: 'รหัสห้องเรียนไม่ถูกต้อง' });
    }

    const p = body.payload || {};
    if (!p.classroom || !p.pairCode) {
      return jsonOut({ ok: false, error: 'ไม่มีข้อมูลห้องเรียนหรือรหัสคู่' });
    }

    const sheet = getSheet();
    const key = rowKey(p.classroom, p.pairCode);
    const values = sheet.getDataRange().getValues();

    let targetRow = -1;
    for (let i = 1; i < values.length; i += 1) {
      if (rowKey(values[i][1], values[i][2]) === key) {
        targetRow = i + 1;
        break;
      }
    }

    const row = buildRow(p);
    if (targetRow > 0) {
      sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    return jsonOut({ ok: true, updated: targetRow > 0 ? 'แก้ไขแถวเดิม' : 'เพิ่มแถวใหม่' });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** ส่งข้อมูลทั้งหมดให้แดชบอร์ดของครู */
function doGet(e) {
  try {
    if (!e || !e.parameter || e.parameter.key !== TEACHER_KEY) {
      return jsonOut({ ok: false, error: 'รหัสครูไม่ถูกต้อง' });
    }

    const sheet = getSheet();
    const values = sheet.getDataRange().getValues();
    const rows = [];

    for (let i = 1; i < values.length; i += 1) {
      const v = values[i];
      if (!v[2]) continue; // ข้ามแถวว่าง
      rows.push({
        updatedAt: v[0] ? new Date(v[0]).toISOString() : '',
        classroom: String(v[1] || ''),
        pairCode: String(v[2] || ''),
        driverName: String(v[3] || ''),
        driverNumber: String(v[4] || ''),
        navigatorName: String(v[5] || ''),
        navigatorNumber: String(v[6] || ''),
        mission1Passed: v[7] === 'ผ่าน',
        mission2Passed: v[8] === 'ผ่าน',
        bestScore: Number(v[9]) || 0,
        worksheetPercent: Number(v[10]) || 0,
        pdfGenerated: v[11] === 'แล้ว',
        capxFileName: String(v[12] || ''),
        roleSwitchCount: Number(v[13]) || 0,
      });
    }

    return jsonOut({ ok: true, count: rows.length, rows: rows });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

/**
 * ฟังก์ชันทดสอบ กดปุ่ม Run ในหน้า Apps Script เพื่อสร้างหัวตารางและขอสิทธิ์เข้าถึงชีต
 * ควรรันครั้งเดียวหลังวางโค้ดเสร็จ ก่อน Deploy
 */
function ตั้งค่าเริ่มต้น() {
  const sheet = getSheet();
  Logger.log('สร้างชีต "%s" เรียบร้อย มีข้อมูลอยู่ %s แถว', SHEET_NAME, sheet.getLastRow() - 1);
  if (CLASS_SECRET === 'CHANGE_ME_CLASS' || TEACHER_KEY === 'CHANGE_ME_TEACHER') {
    Logger.log('เตือน: ยังไม่ได้เปลี่ยนรหัส CLASS_SECRET และ TEACHER_KEY');
  }
}
