import type { AppState } from '../types';
import { createInitialState } from '../utils/storage';

/**
 * ข้อมูลตัวอย่างสำหรับทดสอบระบบ
 * ครูใช้ปุ่ม "โหลดข้อมูลตัวอย่าง" ในหน้าเริ่มต้นใช้งาน เพื่อดูหน้าตาใบงานและไฟล์ PDF
 * ได้ทันทีโดยไม่ต้องพิมพ์ข้อมูลเองทั้งหมด (ไม่ได้ตั้งค่าให้ผ่านภารกิจแทนนักเรียน)
 */
export const createSampleState = (): AppState => {
  const base = createInitialState();
  return {
    ...base,
    pair: {
      ...base.pair,
      classroom: 'ม.5/1',
      pairCode: 'Pair01',
      driverName: 'ธนวัฒน์ ศรีสุข',
      driverNumber: '12',
      navigatorName: 'พิมพ์ชนก เรียนดี',
      navigatorNumber: '15',
    },
    session: { ...base.session, activityStarted: true, roleSwitchCount: 1 },
    worksheet: {
      ...base.worksheet,
      q1Observation:
        'เมื่อกด Run ค่า Num เปลี่ยนทุกครั้งที่สุ่ม จำนวนข้อใน Array ลดลงจาก 4 เหลือ 3, 2, 1 และ 0 ส่วน Score เพิ่มขึ้นเฉพาะตอนที่ตอบถูก สุดท้าย Current Layout เปลี่ยนจาก Quiz เป็น Summary',
      q2FillIn: 'Num',
      q3Choice: 'เปลี่ยนไปหน้า Summary',
      debugRows: base.worksheet.debugRows.map((row, i) => ({
        ...row,
        cause:
          i === 0
            ? 'ใน Function "Random" ไม่มีคำสั่ง Array -> Delete index ทำให้ Array.Width ยังเท่าเดิม ข้อสอบที่ทำแล้วจึงถูกสุ่มขึ้นมาอีก'
            : 'ไม่มีเงื่อนไข If Array is empty ระบบจึงไม่ทราบว่าข้อสอบหมดแล้ว และค้างอยู่ที่ Layout Quiz',
        fix:
          i === 0
            ? 'เพิ่มบล็อก Array -> Delete index Num from X axis ต่อจาก Set CurrentQuestion'
            : 'เพิ่ม If Array is empty แล้วตามด้วย Go to Layout "Summary" และ Display Score',
        evidence:
          i === 0
            ? '[10:20:03] ลบข้อมูลตำแหน่ง Index 2\n[10:20:03] Array คงเหลือ 3 ข้อ'
            : '[10:20:15] ตรวจเงื่อนไข: Array is empty เป็นจริง\n[10:20:16] เปลี่ยน Layout เป็น "Summary"',
      })),
      rolesPlayed: { driver: true, navigator: true },
      q3AppHelp:
        'ทำให้เห็นภาพว่า Array คือกล่องเก็บข้อสอบที่ลดลงทีละช่องเมื่อถูกลบ ส่วน Function คือชุดคำสั่งที่เรียกใช้ซ้ำได้ทุกครั้งที่ต้องการข้อถัดไป',
      q3PartnerGood: 'อ่านเงื่อนไขให้ฟังอย่างชัดเจน และคอยเตือนเมื่อวางบล็อกผิดลำดับ',
      q3ToImprove: 'ต้องอ่าน Debug Log ให้ละเอียดก่อนสรุปสาเหตุ ไม่ควรเดาแล้วแก้ทันที',
      collaborationRating: 4,
    },
  };
};
