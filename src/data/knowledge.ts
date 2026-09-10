/**
 * เนื้อหาคลังความรู้ เรื่อง Array และ Function สำหรับ Construct 2
 * อ้างอิงชื่อคำสั่งจริงที่ปรากฏใน Construct 2 เพื่อให้นักเรียนนำไปใช้ต่อได้ทันที
 */

export interface ConceptSection {
  id: string;
  title: string;
  /** คำอธิบายแบบภาษาชาวบ้าน ให้เห็นภาพก่อน */
  plain: string;
  /** คำอธิบายเชิงเทคนิคที่ตรงกับ Construct 2 */
  technical: string[];
}

export const ARRAY_CONCEPTS: ConceptSection[] = [
  {
    id: 'what-is-array',
    title: 'Array คืออะไร',
    plain:
      'ลองนึกถึงตู้ล็อกเกอร์เรียงกันเป็นแถว แต่ละช่องเก็บของได้ 1 อย่าง และมีเลขกำกับช่องไว้ Array ก็คือตัวแปรที่มีหลายช่องแบบนั้น ต่างจากตัวแปรธรรมดาที่เก็บค่าได้เพียงค่าเดียว',
    technical: [
      'Array เป็นออบเจ็กต์ใน Construct 2 ที่เก็บข้อมูลได้หลายค่าในชื่อเดียว',
      'เพิ่มเข้าโปรเจกต์ได้จาก Insert new object แล้วเลือก Array',
      'ในระบบแบบทดสอบของเรา ใช้ Array เก็บข้อสอบทั้งหมด 1 ข้อต่อ 1 ช่อง',
      'Array มี 3 แกนคือ X, Y, Z แต่กิจกรรมนี้ใช้เพียงแกน X แกนเดียว จึงเป็นเหมือนแถวยาว 1 แถว',
    ],
  },
  {
    id: 'index',
    title: 'Index เริ่มนับที่ 0 ไม่ใช่ 1',
    plain:
      'เรื่องนี้ทำให้นักเรียนพลาดบ่อยที่สุด ถ้า Array มีข้อสอบ 4 ข้อ เลขช่องคือ 0, 1, 2, 3 ไม่ใช่ 1, 2, 3, 4 ช่องสุดท้ายจึงเป็นเลข 3 ซึ่งเท่ากับ จำนวนข้อ ลบ 1 เสมอ',
    technical: [
      'Index คือเลขตำแหน่งของช่องใน Array นับจาก 0',
      'ถ้า Array.Width = 4 ช่องที่ใช้ได้คือ Index 0 ถึง 3',
      'การอ้างถึง Index 4 ในกรณีนี้จะได้ค่าว่าง เพราะเกินขอบเขตของ Array',
      'สูตรจำง่าย: Index สูงสุด = Array.Width - 1',
    ],
  },
  {
    id: 'width',
    title: 'Array.Width คือจำนวนช่องที่มีอยู่',
    plain:
      'Array.Width บอกว่าตอนนี้มีของกี่ช่อง ค่านี้ไม่ได้คงที่ ถ้าลบช่องออก 1 ช่อง Array.Width จะลดลงทันที นี่คือหัวใจของการทำระบบสุ่มไม่ซ้ำ',
    technical: [
      'Array.Width คือจำนวนช่องบนแกน X ณ ขณะนั้น',
      'เมื่อใช้คำสั่ง Delete index ค่า Array.Width จะลดลง 1 และช่องที่อยู่ข้างหลังจะเลื่อนมาแทนที่',
      'เมื่อ Array.Width = 0 แปลว่าไม่มีข้อมูลเหลือแล้ว ใช้เป็นเงื่อนไขจบเกมได้',
      'Construct 2 มีเงื่อนไข Array > Is empty ให้ใช้ได้โดยตรง ไม่ต้องเขียนเทียบ Width = 0 เอง',
      'เงื่อนไขนี้กลับด้าน (Invert) ได้ด้วยการคลิกขวาแล้วเลือก Invert จะกลายเป็น "ยังไม่ว่าง" ซึ่งใช้บ่อยกว่า',
    ],
  },
  {
    id: 'read-write',
    title: 'การอ่านค่าและการสุ่มตำแหน่ง',
    plain:
      'การหยิบของออกจากช่องใช้ Array.At(เลขช่อง) ส่วนการสุ่มว่าจะหยิบช่องไหน ใช้สูตร floor(random(Array.Width)) ซึ่งจะได้เลขช่องที่ใช้ได้จริงเสมอ',
    technical: [
      'Array.At(0, 0, 0) คือการอ่านค่าจากช่อง X=0, Y=0, Z=0',
      'random(4) ให้ตัวเลขทศนิยมตั้งแต่ 0 ถึงเกือบ 4 เช่น 2.7183 แต่ไม่ถึง 4',
      'floor() ปัดเศษลงเป็นจำนวนเต็ม เช่น floor(2.7183) = 2',
      'floor(random(Array.Width)) จึงได้เลข 0 ถึง Width-1 ซึ่งเป็นช่วง Index ที่ถูกต้องพอดี',
      'ถ้าลืมใส่ floor() จะได้ทศนิยม ทำให้อ้างช่องผิดหรือได้ค่าว่าง',
    ],
  },
];

export const ADVANCED_CONCEPTS: ConceptSection[] = [
  {
    id: 'invert',
    title: 'การกลับเงื่อนไข (Invert) ทำให้เขียนสั้นลง',
    plain:
      'บางครั้งเราอยากสั่งว่า "ถ้ายังไม่ว่าง ให้สุ่มต่อ" แทนที่จะเขียนเงื่อนไขใหม่ ใช้วิธีกลับเงื่อนไขเดิมได้เลย เงื่อนไขที่ถูกกลับด้านจะมีเครื่องหมายกากบาทสีแดงนำหน้า',
    technical: [
      'คลิกขวาที่เงื่อนไขแล้วเลือก Invert เพื่อกลับความหมายเป็นตรงกันข้าม',
      'Array > Is empty เมื่อ Invert แล้วจะหมายถึง "Array ยังไม่ว่าง"',
      'รูปแบบที่ใช้บ่อยคือ ถ้ายังไม่ว่าง ให้สุ่มข้อถัดไป ส่วน Else คือจบเกม',
      'สังเกตในหน้า Event Sheet จะเห็นกากบาทสีแดงหน้าเงื่อนไขที่ถูก Invert',
    ],
  },
  {
    id: 'tokenat',
    title: 'เก็บหลายค่าไว้ในช่องเดียวด้วย tokenat',
    plain:
      'ข้อสอบ 1 ข้อมีทั้งหมายเลขข้อและเฉลย ถ้าเก็บแยกกันต้องใช้ Array สองชุด วิธีที่ง่ายกว่าคือเก็บรวมไว้ช่องเดียวคั่นด้วยจุลภาค เช่น "0,ก" แล้วค่อยแยกออกมาตอนใช้งาน',
    technical: [
      'tokenat(ข้อความ, ลำดับ, ตัวคั่น) ใช้ดึงข้อความแต่ละส่วนออกมา ลำดับนับจาก 0 เหมือน Index',
      'tokenat("0,ก", 0, ",") ได้ "0" ซึ่งคือหมายเลขข้อ',
      'tokenat("0,ก", 1, ",") ได้ "ก" ซึ่งคือตัวเลือกที่เป็นคำตอบถูก',
      'trim() ใช้ตัดช่องว่างหน้าหลังออก กันปัญหาเวลาพิมพ์ข้อมูลแล้วเผลอเคาะเว้นวรรค',
      'int() แปลงข้อความให้เป็นตัวเลข เพื่อนำไปใช้กับ Set animation frame ได้',
    ],
  },
  {
    id: 'load-json',
    title: 'ใส่ข้อสอบเข้า Array ทีเดียวด้วย Load from JSON',
    plain:
      'แทนที่จะสั่ง Set value ทีละช่อง 10 ครั้ง เราเขียนข้อมูลทั้งหมดเป็นข้อความ JSON แล้วโหลดเข้า Array ครั้งเดียวจบ',
    technical: [
      'ใช้แอ็กชัน Array > Load from JSON string ในเหตุการณ์ On start of layout',
      'ค่า size ใน JSON เช่น [10,1,1] หมายถึง Width = 10, Height = 1, Depth = 1',
      'เพิ่มหรือลดจำนวนข้อสอบทำได้โดยแก้ข้อความ JSON และตัวเลข size ให้ตรงกัน',
      'ถ้าจำนวนข้อมูลกับ size ไม่ตรงกัน Array จะโหลดไม่ครบหรือมีช่องว่างปนมา',
    ],
  },
];

export const FUNCTION_CONCEPTS: ConceptSection[] = [
  {
    id: 'what-is-function',
    title: 'Function คืออะไร',
    plain:
      'Function คือชุดคำสั่งที่ตั้งชื่อไว้ แล้วเรียกใช้ซ้ำได้ทุกเมื่อ เหมือนเราตั้งชื่อขั้นตอนว่า "ล้างจาน" ไว้ พอบอกคำนี้ทีเดียว ทุกขั้นตอนย่อยก็ทำงานครบ ไม่ต้องพูดใหม่ทุกครั้ง',
    technical: [
      'ต้องเพิ่มออบเจ็กต์ Function เข้าโปรเจกต์ก่อนจาก Insert new object',
      'สร้างฟังก์ชันด้วยเงื่อนไข Function > On function แล้วตั้งชื่อ เช่น "Random"',
      'เรียกใช้ด้วยแอ็กชัน Function > Call function แล้วระบุชื่อเดียวกัน',
      'ชื่อฟังก์ชันต้องสะกดตรงกันทุกตัวอักษร ไม่งั้นจะไม่มีอะไรเกิดขึ้นและไม่มีข้อความแจ้งเตือน',
    ],
  },
  {
    id: 'why-function',
    title: 'ทำไมต้องใช้ Function',
    plain:
      'ในระบบแบบทดสอบ เราต้องสุ่มข้อสอบหลายจุด คือตอนเริ่มเกม และทุกครั้งที่ตอบคำถามเสร็จ ถ้าไม่ใช้ Function ต้องเขียนคำสั่งชุดเดิมซ้ำสองที่ พอต้องแก้ก็ต้องไล่แก้ทุกที่ และมักลืมแก้ที่ใดที่หนึ่ง',
    technical: [
      'ลดการเขียนคำสั่งซ้ำ ทำให้ Event Sheet สั้นและอ่านง่าย',
      'แก้ที่เดียวมีผลทุกจุดที่เรียกใช้ ลดโอกาสเกิด Bug จากการแก้ไม่ครบ',
      'ตั้งชื่อฟังก์ชันให้สื่อความหมาย ช่วยให้คนอื่นอ่าน Event Sheet เข้าใจได้เร็ว',
      'ในกิจกรรมนี้ Function "Random" ถูกเรียกจาก 2 จุดคือ On start of layout และหลังตรวจคำตอบเสร็จ',
    ],
  },
  {
    id: 'parameter',
    title: 'พารามิเตอร์ ส่งค่าเข้าไปในฟังก์ชัน',
    plain:
      'บางครั้งเราอยากให้ฟังก์ชันเดียวกันทำงานต่างกันเล็กน้อย เช่น ฟังก์ชันบวกคะแนน ที่บวกได้ทีละ 1 หรือ 5 แต้ม ก็ส่งตัวเลขเข้าไปบอกฟังก์ชันได้',
    technical: [
      'ตอนเรียกใช้ Call function สามารถใส่ค่าเพิ่มในช่อง Parameters ได้',
      'ภายในฟังก์ชันอ่านค่าที่ส่งมาด้วย Function.Param(0) สำหรับค่าแรก และ Function.Param(1) สำหรับค่าที่สอง',
      'กิจกรรมนี้ยังไม่ต้องใช้พารามิเตอร์ แต่รู้ไว้จะต่อยอดทำเกมที่ซับซ้อนขึ้นได้',
    ],
  },
];

export interface CommandRow {
  command: string;
  meaning: string;
  note: string;
}

export const ARRAY_COMMANDS: CommandRow[] = [
  {
    command: 'Array.Width',
    meaning: 'จำนวนช่องที่มีอยู่ตอนนี้',
    note: 'เป็นค่าที่เปลี่ยนได้ ไม่ใช่ค่าคงที่',
  },
  {
    command: 'Array.At(x, 0, 0)',
    meaning: 'อ่านค่าจากช่องตำแหน่ง x',
    note: 'x ต้องอยู่ระหว่าง 0 ถึง Width-1',
  },
  {
    command: 'Array -> Set value at X',
    meaning: 'เขียนค่าลงในช่องที่ระบุ',
    note: 'ใช้ตอนเตรียมข้อสอบเข้า Array',
  },
  {
    command: 'Array -> Push back value on X axis',
    meaning: 'เพิ่มช่องใหม่ต่อท้าย',
    note: 'Array.Width เพิ่มขึ้น 1',
  },
  {
    command: 'Array -> Delete index N from X axis',
    meaning: 'ลบช่องตำแหน่ง N ออก',
    note: 'Array.Width ลดลง 1 ช่องหลังเลื่อนมาแทน',
  },
  {
    command: 'Array -> Clear',
    meaning: 'ล้างข้อมูลทั้งหมด',
    note: 'Array.Width กลายเป็น 0',
  },
  {
    command: 'Array > Is empty',
    meaning: 'ตรวจว่าไม่มีข้อมูลเหลือใน Array แล้ว',
    note: 'คลิกขวาแล้วเลือก Invert เพื่อกลับเป็น "ยังไม่ว่าง"',
  },
  {
    command: 'Array > Compare size',
    meaning: 'เทียบขนาดของ Array เช่น Width = 0',
    note: 'ใช้แทน Is empty ได้ แต่ Is empty อ่านง่ายกว่า',
  },
];

export const FUNCTION_COMMANDS: CommandRow[] = [
  {
    command: 'Function > On function "ชื่อ"',
    meaning: 'ประกาศฟังก์ชัน จุดเริ่มของชุดคำสั่ง',
    note: 'เป็นเงื่อนไข ไม่ใช่แอ็กชัน',
  },
  {
    command: 'Function > Call function "ชื่อ"',
    meaning: 'สั่งให้ฟังก์ชันนั้นทำงาน',
    note: 'ชื่อต้องสะกดตรงกันเป๊ะ',
  },
  {
    command: 'Function.Param(0)',
    meaning: 'อ่านค่าพารามิเตอร์ตัวแรกที่ส่งเข้ามา',
    note: 'นับจาก 0 เหมือน Index ของ Array',
  },
];

export interface MappingRow {
  /** ชื่อบล็อกในเว็บจำลอง */
  block: string;
  /** สิ่งที่ต้องเขียนจริงใน Construct 2 */
  real: string;
  note: string;
}

/**
 * ตารางเทียบบล็อกในเว็บจำลอง กับคำสั่งจริงใน Event Sheet ของโปรเจกต์
 * อ้างอิงจากไฟล์ Construct 2 ที่ใช้สอนจริง เพื่อให้ผู้เรียนต่อยอดได้ทันทีโดยไม่สับสน
 */
export const REAL_EVENT_MAPPING: MappingRow[] = [
  {
    block: 'On start of layout',
    real: 'System > On start of layout',
    note: 'ในไฟล์จริงมี Array > Load from JSON string เพื่อใส่ข้อสอบเข้า Array ก่อน แล้วจึง Call Function "Random"',
  },
  {
    block: 'Function "Random"',
    real: 'Function > On "Random"',
    note: 'เป็นเงื่อนไข ไม่ใช่แอ็กชัน คำสั่งที่อยู่ใต้เหตุการณ์นี้คือเนื้อในของฟังก์ชัน',
  },
  {
    block: 'Set Num to floor(random(Array.Width))',
    real: 'System > Set Num to int(random(Array.Width))',
    note: 'ไฟล์จริงใช้ int() ซึ่งให้ผลเหมือน floor() เมื่อค่าไม่ติดลบ ใช้ตัวไหนก็ได้',
  },
  {
    block: 'Set CurrentQuestion to Array.At(Num, 0, 0)',
    real: 'quiz > Set animation frame to int(trim(tokenat(Array.At(Num), 0, ",")))',
    note: 'ไฟล์จริงเก็บข้อสอบเป็นภาพในเฟรมแอนิเมชัน จึงดึงหมายเลขข้อออกมาแล้วสั่งเปลี่ยนเฟรม',
  },
  {
    block: '(ไม่มีในเว็บจำลอง)',
    real: 'System > Set Answer to trim(tokenat(Array.At(Num), 1, ","))',
    note: 'ดึงตัวอักษรเฉลยจากช่องเดียวกันเก็บไว้ในตัวแปร Answer เพื่อใช้ตรวจคำตอบทีหลัง',
  },
  {
    block: 'Array -> Delete index Num from X axis',
    real: 'Array > Delete index Num from X axis',
    note: 'ตรงกันทุกตัวอักษร และต้องอยู่หลังการอ่านค่าเสมอ',
  },
  {
    block: 'If Array is empty',
    real: 'Array > Is empty (กลับด้านด้วย Invert)',
    note: 'ไฟล์จริงเขียนเป็น "ถ้ายังไม่ว่าง ให้สุ่มต่อ" แล้วใช้ Else เป็นทางจบเกม',
  },
  {
    block: 'On button answer clicked',
    real: 'Mouse > On Left button Clicked on bt_Select',
    note: 'ผูกกับปุ่มตัวเลือกโดยตรง',
  },
  {
    block: 'If Answer = bt_Select.Choice',
    real: 'System > Compare two values: Answer = bt_Select.Choice',
    note: 'เทียบเฉลยที่เก็บไว้กับตัวเลือกที่ผู้เล่นกด',
  },
  {
    block: 'Add 1 to Score',
    real: 'System > Add 1 to Score',
    note: 'ไฟล์จริงมี feedback แสดงผลถูกผิดและ Wait 0.4 seconds ก่อนไปข้อถัดไป',
  },
  {
    block: 'Call Function "Random"',
    real: 'Function > Call "Random" ()',
    note: 'เรียกทั้งกรณีตอบถูกและตอบผิด เพื่อให้เกมเดินหน้าต่อเสมอ',
  },
  {
    block: 'Go to Layout "Summary"',
    real: 'System > Go to เสียใจ หรือ Go to ดีใจ',
    note: 'ไฟล์จริงแยกหน้าจบเป็น 2 หน้า ตัดสินด้วยเงื่อนไข Score ≤ 5 และ Score > 5',
  },
  {
    block: 'Display Score',
    real: 'System > Every tick แล้ว txt_Score > Set text to Score',
    note: 'อัปเดตข้อความคะแนนทุกเฟรม จึงเห็นคะแนนเปลี่ยนทันที',
  },
];

export interface Mistake {
  id: string;
  title: string;
  symptom: string;
  cause: string;
  fix: string;
}

export const COMMON_MISTAKES: Mistake[] = [
  {
    id: 'no-delete',
    title: 'สุ่มแล้วได้ข้อเดิมซ้ำ',
    symptom: 'ผู้เล่นเจอคำถามเดิมหลายครั้ง และเกมไม่จบสักที',
    cause: 'สุ่มข้อสอบแล้วแต่ไม่ได้ลบข้อที่ใช้แล้วออก Array.Width จึงเท่าเดิมตลอด',
    fix: 'เพิ่มคำสั่ง Array -> Delete index Num from X axis ต่อจากการอ่านค่าออกมาแล้ว',
  },
  {
    id: 'delete-before-read',
    title: 'ลบก่อนอ่าน ทำให้ได้คำถามผิดข้อ',
    symptom: 'คำถามที่แสดงไม่ตรงกับที่สุ่มได้ หรือขึ้นค่าว่าง',
    cause: 'สั่ง Delete index ก่อน Set CurrentQuestion ข้อมูลในช่องนั้นจึงหายไปก่อนถูกอ่าน',
    fix: 'ต้องอ่านค่าด้วย Array.At ให้เสร็จก่อน แล้วจึงค่อยลบ ลำดับสำคัญมาก',
  },
  {
    id: 'no-floor',
    title: 'ลืมใส่ floor()',
    symptom: 'บางครั้งคำถามไม่ขึ้น หรือขึ้นค่าว่าง',
    cause: 'random() ให้ค่าทศนิยม เมื่อนำไปใช้เป็น Index จึงอ้างตำแหน่งไม่ถูกต้อง',
    fix: 'เขียนเป็น floor(random(Array.Width)) เพื่อให้ได้จำนวนเต็มเสมอ',
  },
  {
    id: 'off-by-one',
    title: 'ใช้ Array.Width เป็น Index โดยตรง',
    symptom: 'ข้อสุดท้ายไม่เคยถูกสุ่ม หรือได้ค่าว่างเป็นบางครั้ง',
    cause: 'ลืมว่า Index สูงสุดคือ Width-1 ไม่ใช่ Width',
    fix: 'ใช้ floor(random(Array.Width)) ซึ่งให้ค่าไม่เกิน Width-1 อยู่แล้ว ไม่ต้องบวกลบเพิ่ม',
  },
  {
    id: 'score-before-check',
    title: 'คะแนนเพิ่มแม้ตอบผิด',
    symptom: 'ตอบผิดแต่คะแนนก็ยังขึ้น คะแนนสุดท้ายเท่ากับจำนวนข้อเสมอ',
    cause: 'วางคำสั่ง Add 1 to Score ไว้นอกเงื่อนไขตรวจคำตอบ หรือวางไว้ก่อนเงื่อนไข',
    fix: 'ย้าย Add 1 to Score ให้อยู่ภายใต้เงื่อนไข If Answer = bt_Select.Choice เท่านั้น',
  },
  {
    id: 'json-size',
    title: 'เพิ่มข้อสอบแล้วข้อสุดท้ายไม่ออก หรือมีข้อว่างโผล่มา',
    symptom: 'เพิ่มข้อสอบใน JSON แล้วบางข้อไม่ถูกสุ่ม หรือขึ้นหน้าจอว่าง',
    cause: 'แก้ข้อมูลใน JSON แล้วแต่ลืมแก้ตัวเลข size ให้ตรงกับจำนวนข้อจริง',
    fix: 'แก้ size ใน Load from JSON string ให้ตรงกับจำนวนข้อ เช่น มี 12 ข้อต้องเป็น [12,1,1]',
  },
  {
    id: 'forget-invert',
    title: 'เกมจบทันทีที่เริ่มเล่น หรือไม่จบเลย',
    symptom: 'พอเริ่มเกมก็เด้งไปหน้าสรุปทันที หรือทำครบทุกข้อแล้วก็ยังไม่จบ',
    cause: 'ลืมกลับเงื่อนไข Is empty ด้วย Invert ทำให้ความหมายกลับตรงข้ามกับที่ต้องการ',
    fix: 'คลิกขวาที่เงื่อนไข Is empty เลือก Invert แล้วสังเกตว่ามีกากบาทสีแดงนำหน้า',
  },
  {
    id: 'tokenat-index',
    title: 'คำถามขึ้นถูกแต่ตรวจคำตอบผิดตลอด',
    symptom: 'ภาพคำถามแสดงถูกข้อ แต่ตอบถูกก็ยังขึ้นว่าผิด',
    cause: 'สลับลำดับใน tokenat เช่น ใช้ 0 ทั้งสองที่ ทำให้ตัวแปร Answer ได้หมายเลขข้อแทนตัวเฉลย',
    fix: 'ตรวจว่าใช้ tokenat(..., 0, ",") สำหรับหมายเลขข้อ และ tokenat(..., 1, ",") สำหรับเฉลย',
  },
  {
    id: 'wrong-function-name',
    title: 'เรียกฟังก์ชันแล้วไม่มีอะไรเกิดขึ้น',
    symptom: 'ตอบคำถามเสร็จแล้วระบบค้าง ไม่ไปข้อถัดไป',
    cause: 'ชื่อใน Call function สะกดไม่ตรงกับ On function เช่น random กับ Random',
    fix: 'ตรวจชื่อให้ตรงกันทุกตัวอักษร รวมถึงตัวพิมพ์เล็กพิมพ์ใหญ่และช่องว่าง',
  },
];

export interface GlossaryItem {
  term: string;
  meaning: string;
}

export const GLOSSARY: GlossaryItem[] = [
  { term: 'Array', meaning: 'ตัวแปรที่เก็บข้อมูลได้หลายค่าในชื่อเดียว แบ่งเป็นช่อง ๆ' },
  { term: 'Index', meaning: 'เลขตำแหน่งของช่องใน Array นับเริ่มจาก 0' },
  { term: 'Array.Width', meaning: 'จำนวนช่องบนแกน X ที่มีอยู่ในขณะนั้น' },
  { term: 'Array.At()', meaning: 'นิพจน์สำหรับอ่านค่าจากช่องที่ระบุตำแหน่ง' },
  { term: 'Delete index', meaning: 'คำสั่งลบช่องออกจาก Array ทำให้ Width ลดลง' },
  { term: 'Function', meaning: 'ชุดคำสั่งที่ตั้งชื่อไว้แล้วเรียกใช้ซ้ำได้' },
  { term: 'Call function', meaning: 'แอ็กชันสั่งให้ฟังก์ชันที่ตั้งชื่อไว้ทำงาน' },
  { term: 'Parameter', meaning: 'ค่าที่ส่งเข้าไปให้ฟังก์ชันใช้ทำงาน อ่านด้วย Function.Param()' },
  { term: 'random()', meaning: 'นิพจน์สุ่มตัวเลขทศนิยมตั้งแต่ 0 ถึงค่าที่กำหนด (ไม่ถึงค่านั้น)' },
  { term: 'floor()', meaning: 'นิพจน์ปัดเศษลงให้เป็นจำนวนเต็ม' },
  { term: 'tokenat()', meaning: 'นิพจน์แยกข้อความที่คั่นด้วยตัวคั่น ออกมาทีละส่วน นับจาก 0' },
  { term: 'trim()', meaning: 'นิพจน์ตัดช่องว่างหน้าและหลังข้อความออก' },
  { term: 'int()', meaning: 'นิพจน์แปลงค่าให้เป็นจำนวนเต็ม ให้ผลเหมือน floor() เมื่อค่าไม่ติดลบ' },
  { term: 'Invert', meaning: 'การกลับความหมายของเงื่อนไขให้เป็นตรงกันข้าม แสดงด้วยกากบาทสีแดง' },
  { term: 'Load from JSON', meaning: 'แอ็กชันใส่ข้อมูลทั้งชุดเข้า Array ในคำสั่งเดียว' },
  { term: 'Event Sheet', meaning: 'หน้าเขียนเงื่อนไขและคำสั่งของ Construct 2' },
  { term: 'Layout', meaning: 'ฉากหรือหน้าจอหนึ่งหน้าในเกม เช่น Quiz และ Summary' },
];

export interface ReviewQuestion {
  id: string;
  question: string;
  choices: string[];
  answerIndex: number;
  explain: string;
}

export const REVIEW_QUESTIONS: ReviewQuestion[] = [
  {
    id: 'q1',
    question: 'ถ้า Array มีข้อสอบ 5 ข้อ Index ของช่องสุดท้ายคือเลขอะไร',
    choices: ['4', '5', '6', '1'],
    answerIndex: 0,
    explain: 'Index เริ่มนับที่ 0 ช่องสุดท้ายจึงเท่ากับ Array.Width - 1 = 5 - 1 = 4',
  },
  {
    id: 'q2',
    question: 'floor(random(Array.Width)) เมื่อ Array.Width = 3 จะได้ค่าใดบ้าง',
    choices: ['1, 2, 3', '0, 1, 2', '0, 1, 2, 3', 'ทศนิยมระหว่าง 0 ถึง 3'],
    answerIndex: 1,
    explain: 'random(3) ให้ค่าตั้งแต่ 0 ถึงเกือบ 3 เมื่อ floor() ปัดเศษลงจึงได้ 0, 1 หรือ 2 เท่านั้น',
  },
  {
    id: 'q3',
    question: 'หลังใช้คำสั่ง Delete index กับ Array ที่มี 4 ช่อง ค่า Array.Width จะเป็นเท่าใด',
    choices: ['4 เท่าเดิม', '0', '3', '5'],
    answerIndex: 2,
    explain: 'Delete index ลบช่องออกจริง Array.Width จึงลดลง 1 จาก 4 เหลือ 3',
  },
  {
    id: 'q4',
    question: 'ลำดับใดถูกต้องสำหรับการสุ่มข้อสอบไม่ให้ซ้ำ',
    choices: [
      'ลบช่อง แล้วค่อยอ่านค่าออกมา',
      'อ่านค่าออกมา แล้วค่อยลบช่องนั้น',
      'ลบช่องอย่างเดียว ไม่ต้องอ่าน',
      'อ่านค่าอย่างเดียว ไม่ต้องลบ',
    ],
    answerIndex: 1,
    explain: 'ต้องอ่านค่าด้วย Array.At ให้เสร็จก่อน ถ้าลบก่อนข้อมูลจะหายไปแล้วอ่านไม่ได้',
  },
  {
    id: 'q6',
    question: 'ในไฟล์จริง ข้อมูลช่องหนึ่งเก็บว่า "3,ก" คำสั่ง tokenat("3,ก", 1, ",") จะได้ค่าใด',
    choices: ['3', 'ก', '3,ก', 'ค่าว่าง'],
    answerIndex: 1,
    explain:
      'tokenat นับลำดับจาก 0 ดังนั้นลำดับ 0 คือ "3" ซึ่งเป็นหมายเลขข้อ ส่วนลำดับ 1 คือ "ก" ซึ่งเป็นตัวเฉลย',
  },
  {
    id: 'q7',
    question: 'เงื่อนไข Array > Is empty ที่มีกากบาทสีแดงนำหน้า มีความหมายว่าอย่างไร',
    choices: [
      'Array ว่างแล้ว',
      'Array ยังไม่ว่าง',
      'เงื่อนไขนี้ถูกปิดใช้งาน',
      'Array มีข้อผิดพลาด',
    ],
    answerIndex: 1,
    explain:
      'กากบาทสีแดงคือการ Invert หรือกลับความหมายเป็นตรงกันข้าม เงื่อนไขจึงอ่านว่า Array ยังไม่ว่าง ใช้สำหรับสั่งให้สุ่มข้อถัดไปต่อ',
  },
  {
    id: 'q5',
    question: 'เหตุใดจึงใช้ Function "Random" แทนการเขียนคำสั่งสุ่มซ้ำหลายที่',
    choices: [
      'ทำให้เกมทำงานเร็วขึ้นมาก',
      'เพราะ Construct 2 บังคับให้ใช้',
      'แก้ที่เดียวมีผลทุกจุด ลด Bug จากการแก้ไม่ครบ',
      'ทำให้ไฟล์ .capx มีขนาดเล็กลงครึ่งหนึ่ง',
    ],
    answerIndex: 2,
    explain:
      'ประโยชน์หลักของ Function คือลดการเขียนซ้ำ เมื่อต้องแก้ตรรกะก็แก้จุดเดียว ไม่ต้องไล่แก้หลายที่และไม่ลืมแก้',
  },
];
