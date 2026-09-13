/** ค่าตั้งต้นของระบบ */

/**
 * ข้อมูลครูผู้สอน แสดงในหน้าเริ่มต้นใช้งาน คู่มือครู ท้ายเว็บ และในใบงาน PDF
 * วิธีใส่รูปครู: บันทึกไฟล์รูปเป็น public/teacher.jpg (แนะนำสัดส่วนจัตุรัส เช่น 600x600)
 * หากยังไม่มีไฟล์ ระบบจะแสดงวงกลมอักษรย่อแทนโดยอัตโนมัติ ไม่ขึ้นรูปแตก
 */
export const TEACHER_INFO = {
  name: 'ครูทัศนีย์ ศรีทน',
  /** ชื่อที่ใช้ในเอกสารราชการ ตัดคำนำหน้า "ครู" ออก */
  formalName: 'นางสาวทัศนีย์ ศรีทน',
  position: 'ครูผู้สอนรายวิชาคอมพิวเตอร์ 4 (ว32281)',
  school: 'โรงเรียนหนองหงส์พิทยาคม',
  /** อักษรย่อที่ใช้แสดงเมื่อยังไม่มีไฟล์รูป */
  initials: 'ทศ',
  /** รูปวงกลม ใช้รูปจัตุรัสจะสวยที่สุด (public/teacher.jpg) */
  photo: './teacher.jpg',
  /**
   * จุดกึ่งกลางที่ใช้ซูมเข้าหาใบหน้าในรูปวงกลม (แนวนอน แนวตั้ง)
   * ถ้าใบหน้าเบี้ยวไปด้านใดให้ปรับตัวเลขนี้ เช่น 'center 15%' = เลื่อนขึ้นอีก
   */
  photoPosition: 'center 20%',
  /**
   * ระดับการซูมรูปวงกลม ใช้เมื่อรูปต้นฉบับเป็นภาพเต็มตัวทำให้ใบหน้าเล็กเกินไป
   * 1 = ไม่ซูม (เหมาะกับรูปหน้าตรงที่ครอปมาแล้ว), 2 = ซูมเข้า 2 เท่า
   */
  photoZoom: 2.45,
  /** รูปแนวนอนสำหรับแสดงเป็นแบนเนอร์ (public/teacher-banner.jpg) ไม่ใส่ก็ได้ */
  banner: './teacher-banner.jpg',
} as const;

/**
 * การเชื่อมต่อกับ Google Sheets เพื่อทำแดชบอร์ดสรุปผลของครู
 *
 * ถ้า endpoint เว้นว่างไว้ ระบบจะทำงานแบบเดิมทุกประการ คือเก็บข้อมูลในเบราว์เซอร์อย่างเดียว
 * ไม่ส่งข้อมูลออกไปไหน และแท็บแดชบอร์ดจะแสดงวิธีติดตั้งแทน
 *
 * วิธีตั้งค่าอ่านที่ docs/คู่มือติดตั้งแดชบอร์ด.md
 */
export const SYNC_CONFIG = {
  /** URL ของ Apps Script Web App เช่น https://script.google.com/macros/s/AKfycb.../exec */
  endpoint: 'https://script.google.com/macros/s/AKfycbz9GQMxBUlThsTYQsHAQG_uihjuOj51i76Hm6KCzxX-ZiREsM4BZ_60dahxlDxtMg980Q/exec',
  /** ต้องตรงกับค่า CLASS_SECRET ในไฟล์ Code.gs */
  classSecret: 'nhpk-w32281-z0fyrkal5z',
  /** ระยะเวลาหน่วงก่อนส่งข้อมูล (มิลลิวินาที) กันการยิงถี่ขณะนักเรียนพิมพ์ */
  debounceMs: 4000,
} as const;

export const APP_CONFIG = {
  appName: 'Interactive Logic Simulator',
  appTagline:
    'เรียนรู้ Array และ Function ผ่านการทดลอง แก้ Bug และเห็นสถานะข้อมูลแบบ Real-time',
  courseLabel: import.meta.env.VITE_COURSE_LABEL || 'คอมพิวเตอร์ 4 ว32281 | ม.5',
  courseCode: 'ว32281',
  courseName: 'รายวิชาเพิ่มเติม คอมพิวเตอร์ 4 (ว32281)',
  gradeLevel: 'ชั้นมัธยมศึกษาปีที่ 5',
  semester: 'ภาคเรียนที่ 1 ปีการศึกษา 2569',
  unitName: 'หน่วยการเรียนรู้ที่ 2: การสร้างสื่อปฏิสัมพันธ์ด้วย Construct 2',
  worksheetTitle: 'ใบกิจกรรมถอดรหัสตรรกะและบันทึกการแก้ Bug',
  /** เวลาเริ่มต้นของ Role Switch Timer (วินาที) */
  roleSwitchSeconds: 10 * 60,
  /** จำนวนรอบสูงสุดที่ตัวจำลองจะทำงาน กันลูปไม่รู้จบเมื่อผู้เรียนวางตรรกะผิด */
  maxSimulationRounds: 10,
  storageKey: 'ils_v32281_state_v1',
} as const;
