import { forwardRef } from 'react';
import { APP_CONFIG, TEACHER_INFO } from '../config';
import type { AppState } from '../types';
import { formatThaiDateTime } from '../utils/format';

/**
 * เอกสารใบงานสำหรับแปลงเป็น PDF
 * ใช้ inline style ล้วน ไม่พึ่ง Tailwind เพื่อให้ html2canvas จับภาพได้ตรงทุกเบราว์เซอร์
 */
const S = {
  page: {
    width: '794px',
    padding: '36px 40px',
    background: '#ffffff',
    color: '#1e293b',
    fontFamily: '"IBM Plex Sans Thai", "Noto Sans Thai", Tahoma, sans-serif',
    fontSize: '13px',
    lineHeight: 1.75,
    boxSizing: 'border-box' as const,
  },
  h1: { fontSize: '19px', fontWeight: 700, margin: '0 0 4px', textAlign: 'center' as const },
  sub: { fontSize: '12.5px', textAlign: 'center' as const, margin: 0, color: '#475569' },
  sectionTitle: {
    fontSize: '14.5px',
    fontWeight: 700,
    background: '#eef4ff',
    borderLeft: '4px solid #1f45e4',
    padding: '6px 10px',
    margin: '20px 0 10px',
  },
  qLabel: { fontWeight: 600, margin: '10px 0 4px' },
  answer: {
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '8px 10px',
    background: '#f8fafc',
    whiteSpace: 'pre-wrap' as const,
    minHeight: '22px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '12px',
    tableLayout: 'fixed' as const,
  },
  th: {
    border: '1px solid #94a3b8',
    background: '#e2e8f0',
    padding: '6px 8px',
    fontWeight: 700,
    textAlign: 'left' as const,
    verticalAlign: 'top' as const,
  },
  td: {
    border: '1px solid #94a3b8',
    padding: '6px 8px',
    verticalAlign: 'top' as const,
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
  },
  infoCell: { padding: '3px 0', fontSize: '13px' },
};

const EMPTY = '(ไม่ได้กรอกข้อมูล)';
const show = (v: string) => (v.trim() ? v.trim() : EMPTY);

export const PrintableWorksheet = forwardRef<HTMLDivElement, { state: AppState }>(
  ({ state }, ref) => {
    const { pair, worksheet, missions, session, capxFile, lastDebugLog } = state;
    const stars = '★'.repeat(worksheet.collaborationRating) + '☆'.repeat(5 - worksheet.collaborationRating);

    return (
      <div ref={ref} style={S.page}>
        {/* ---------- หัวเอกสาร ---------- */}
        <div style={{ borderBottom: '3px double #1f45e4', paddingBottom: '10px' }}>
          <h1 style={S.h1}>{APP_CONFIG.worksheetTitle}</h1>
          <p style={S.sub}>{APP_CONFIG.courseName}</p>
          <p style={S.sub}>
            {APP_CONFIG.gradeLevel} {APP_CONFIG.semester}
          </p>
          <p style={S.sub}>{APP_CONFIG.unitName}</p>
          <p style={{ ...S.sub, marginTop: '4px', fontWeight: 600 }}>
            {TEACHER_INFO.school} | ครูผู้สอน: {TEACHER_INFO.name}
          </p>
        </div>

        {/* ---------- ข้อมูลผู้เรียน ---------- */}
        <table style={{ width: '100%', marginTop: '12px' }}>
          <tbody>
            <tr>
              <td style={S.infoCell}>
                <strong>ห้องเรียน:</strong> {show(pair.classroom)}
              </td>
              <td style={S.infoCell}>
                <strong>รหัสคู่:</strong> {show(pair.pairCode)}
              </td>
            </tr>
            <tr>
              <td style={S.infoCell}>
                <strong>Driver:</strong> {show(pair.driverName)}
              </td>
              <td style={S.infoCell}>
                <strong>เลขที่:</strong> {show(pair.driverNumber)}
              </td>
            </tr>
            <tr>
              <td style={S.infoCell}>
                <strong>Navigator:</strong> {show(pair.navigatorName)}
              </td>
              <td style={S.infoCell}>
                <strong>เลขที่:</strong> {show(pair.navigatorNumber)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ---------- ส่วนที่ 1 ---------- */}
        <p style={S.sectionTitle}>ส่วนที่ 1 การวิเคราะห์ตรรกะแบบทดสอบบน Interactive Web App</p>

        <p style={S.qLabel}>
          1. เมื่อทดลอง Run Simulation นักเรียนสังเกตเห็นการเปลี่ยนแปลงของค่าใน State Monitor อย่างไร
        </p>
        <div style={S.answer}>{show(worksheet.q1Observation)}</div>

        <p style={S.qLabel}>
          2. คำสั่งใดต้องใส่ไว้ใน Function &quot;Random&quot; เพื่อตัดข้อสอบที่ทำไปแล้วออกจาก Array
        </p>
        <div style={S.answer}>
          Array -&gt; Delete index{' '}
          <strong style={{ textDecoration: 'underline' }}>{show(worksheet.q2FillIn)}</strong> from X axis
        </div>

        <p style={S.qLabel}>3. เมื่อ Array เป็นค่าว่าง [ ] ระบบควรทำงานอย่างไร</p>
        <div style={S.answer}>{show(worksheet.q3Choice)}</div>

        <p style={S.qLabel}>
          4. การสุ่ม Index ด้วย int(random(Array.Width)) ทำงานอย่างไร และเหตุใดจึงต้องครอบด้วย int หรือ floor
        </p>
        <div style={S.answer}>{show(worksheet.q4RandomLogic)}</div>

        <p style={S.qLabel}>
          5. หากลืมสั่ง Delete index บนแกน X หลังสุ่มคำถามแล้ว จะส่งผลต่อ State Monitor และโปรแกรมอย่างไร
        </p>
        <div style={S.answer}>{show(worksheet.q5NoDeleteEffect)}</div>

        {/* ---------- ส่วนที่ 2 ---------- */}
        <p style={S.sectionTitle}>ส่วนที่ 2 บันทึกรายการซ่อมข้อผิดพลาดระบบแบบทดสอบ</p>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={{ ...S.th, width: '13%' }}>จุดที่พบ Bug</th>
              <th style={{ ...S.th, width: '20%' }}>สภาพปัญหา</th>
              <th style={{ ...S.th, width: '22%' }}>สาเหตุที่พบ</th>
              <th style={{ ...S.th, width: '22%' }}>แนวทางการแก้ไข</th>
              <th style={{ ...S.th, width: '23%' }}>หลักฐานจาก State Monitor</th>
            </tr>
          </thead>
          <tbody>
            {worksheet.debugRows.map((row) => (
              <tr key={row.point}>
                <td style={S.td}>{row.point}</td>
                <td style={S.td}>{row.symptom}</td>
                <td style={S.td}>{show(row.cause)}</td>
                <td style={S.td}>{show(row.fix)}</td>
                <td style={{ ...S.td, fontSize: '10.5px', lineHeight: 1.5 }}>
                  {show(row.evidence)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ---------- ส่วนที่ 3 ---------- */}
        <p style={S.sectionTitle}>ส่วนที่ 3 สรุปประเมินตนเอง (Metacognition)</p>

        <p style={S.qLabel}>1. ฉันได้ปฏิบัติหน้าที่ใดบ้าง</p>
        <div style={S.answer}>
          {worksheet.rolesPlayed.driver ? '[✓]' : '[  ]'} Driver &nbsp;&nbsp;&nbsp;
          {worksheet.rolesPlayed.navigator ? '[✓]' : '[  ]'} Navigator &nbsp;&nbsp;&nbsp;
          (สลับบทบาทระหว่างกิจกรรม {session.roleSwitchCount} ครั้ง)
          {session.roleSwitchLog.length > 0 && (
            <span style={{ display: 'block', marginTop: '4px', fontSize: '11.5px', color: '#475569' }}>
              เวลาที่สลับ:{' '}
              {session.roleSwitchLog
                .map((t) =>
                  new Date(t).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
                )
                .join(' น. / ')}{' '}
              น.
            </span>
          )}
        </div>

        <p style={S.qLabel}>2. Web App ช่วยให้เข้าใจ Array และ Function อย่างไร</p>
        <div style={S.answer}>{show(worksheet.q3AppHelp)}</div>

        <p style={S.qLabel}>3. สิ่งที่คู่ของฉันทำได้ดีในการทำงานร่วมกันคืออะไร</p>
        <div style={S.answer}>{show(worksheet.q3PartnerGood)}</div>

        <p style={S.qLabel}>4. สิ่งที่ต้องพัฒนาต่อไปในการแก้ปัญหา Bug คืออะไร</p>
        <div style={S.answer}>{show(worksheet.q3ToImprove)}</div>

        <p style={S.qLabel}>5. ประเมินความร่วมมือในการทำงานคู่</p>
        <div style={S.answer}>
          {stars} ({worksheet.collaborationRating} จาก 5 คะแนน)
        </div>

        {/* ---------- ผลการผ่านภารกิจ ---------- */}
        <p style={S.sectionTitle}>ผลการผ่านภารกิจจากระบบจำลอง</p>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={{ ...S.th, width: '55%' }}>รายการ</th>
              <th style={{ ...S.th, width: '45%' }}>ผลการดำเนินงาน</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={S.td}>ภารกิจที่ 1 แก้ปัญหาระบบสุ่มข้อสอบซ้ำ</td>
              <td style={S.td}>{missions.mission1Passed ? 'ผ่าน (สำเร็จ)' : 'ยังไม่ผ่าน'}</td>
            </tr>
            <tr>
              <td style={S.td}>ภารกิจที่ 2 แก้ปัญหาเงื่อนไขจบเกม</td>
              <td style={S.td}>{missions.mission2Passed ? 'ผ่าน (สำเร็จ)' : 'ยังไม่ผ่าน'}</td>
            </tr>
            <tr>
              <td style={S.td}>คะแนนสูงสุดจากการจำลอง</td>
              <td style={S.td}>{missions.bestScore} คะแนน</td>
            </tr>
            <tr>
              <td style={S.td}>ไฟล์ผลงาน Construct 2 (.capx)</td>
              <td style={S.td}>{capxFile ? capxFile.name : 'ยังไม่ได้แนบไฟล์'}</td>
            </tr>
          </tbody>
        </table>

        {/* ---------- Debug Log ---------- */}
        <p style={S.sectionTitle}>บันทึก Debugging Log จากการจำลองรอบล่าสุด</p>
        {lastDebugLog.length === 0 ? (
          <div style={S.answer}>{EMPTY} - ยังไม่ได้ Run Simulation</div>
        ) : (
          <table style={S.table}>
            <thead>
              <tr>
                <th style={{ ...S.th, width: '18%' }}>เวลา</th>
                <th style={{ ...S.th, width: '82%' }}>เหตุการณ์</th>
              </tr>
            </thead>
            <tbody>
              {lastDebugLog.slice(-24).map((entry, i) => (
                <tr key={`${entry.time}-${i}`}>
                  <td style={{ ...S.td, fontFamily: 'Consolas, monospace' }}>{entry.time}</td>
                  <td style={S.td}>{entry.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ---------- ท้ายเอกสาร ---------- */}
        <div
          style={{
            marginTop: '22px',
            paddingTop: '10px',
            borderTop: '1px solid #cbd5e1',
            fontSize: '11.5px',
            color: '#475569',
          }}
        >
          <p style={{ margin: 0 }}>สร้างเอกสารเมื่อ: {formatThaiDateTime(new Date())}</p>
          <p style={{ margin: '2px 0 0' }}>
            สร้างโดยระบบ {APP_CONFIG.appName} | นักเรียนต้องแนบไฟล์ PDF นี้พร้อมไฟล์ .capx ใน Google Classroom ด้วยตนเอง
          </p>
          <table style={{ width: '100%', marginTop: '20px' }}>
            <tbody>
              <tr>
                <td style={{ textAlign: 'center', width: '50%' }}>
                  ลงชื่อ .......................................... Driver
                </td>
                <td style={{ textAlign: 'center', width: '50%' }}>
                  ลงชื่อ .......................................... Navigator
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: 'center', paddingTop: '18px' }}>
                  ลงชื่อ .......................................... ครูผู้สอน
                  <br />
                  <span style={{ fontSize: '10.5px' }}>( {TEACHER_INFO.formalName} )</span>
                </td>
                <td style={{ textAlign: 'center', paddingTop: '18px' }}>
                  คะแนนที่ได้ ................ / ................
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  },
);

PrintableWorksheet.displayName = 'PrintableWorksheet';
