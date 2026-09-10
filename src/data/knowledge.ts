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
      'ในกิจกรรมนี้เรียกเงื่อนไขนั้นสั้น ๆ ว่า "Array is empty" แต่เวลาเขียนจริงใน Construct 2 ใช้เงื่อนไข Array > Compare size แล้วตรวจว่า Width = 0',
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
    command: 'Array > Compare size (Width = 0)',
    meaning: 'ตรวจว่าไม่มีข้อมูลเหลือแล้ว',
    note: 'คือเงื่อนไขที่ใบงานเรียกว่า Array is empty',
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
