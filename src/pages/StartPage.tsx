import { useState } from 'react';
import { Compass, ListChecks, Mouse, Rocket, Send, UserCheck, Users } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { RoleTimer } from '../components/RoleTimer';
import { Button, Card, TextField, Tooltip } from '../components/Ui';
import { Mascot } from '../components/Illustrations';
import { TeacherCard } from '../components/TeacherCard';
import { DeviceModePicker } from '../components/DeviceModePicker';

interface FieldErrors {
  classroom?: string;
  pairCode?: string;
  driverName?: string;
  navigatorName?: string;
}

/**
 * ขั้นตอนการทำกิจกรรม 6 ขั้น พร้อมชุดสีประจำข้อ
 *
 * เดิมเก็บสีไว้เป็นอาร์เรย์ 5 ค่าแต่มีขั้นตอน 6 ข้อ ข้อสุดท้ายจึงไม่ได้สีพื้น
 * กลายเป็นเลขขาวบนวงกลมขาว มองไม่เห็นเลข จับคู่ข้อความกับสีไว้ด้วยกันแบบนี้
 * ทำให้เพิ่มหรือลดขั้นตอนแล้วสีไม่มีทางขาดอีก
 */
const ACTIVITY_STEPS = [
  {
    text: 'กรอกข้อมูลผู้เรียนและกดปุ่ม "เริ่มกิจกรรม"',
    tone: 'from-brand-400 to-brand-600',
    border: 'border-brand-200',
    edge: 'rgba(99,102,241,0.35)',
  },
  {
    text: 'อ่านหน้า "คลังความรู้" ให้เข้าใจ Array และ Function ก่อน',
    tone: 'from-think-400 to-think-600',
    border: 'border-think-200',
    edge: 'rgba(139,92,246,0.35)',
  },
  {
    text: 'เรียงบล็อกคำสั่งในหน้า "จำลองตรรกะ" แล้ว Run เพื่อดูผล',
    tone: 'from-bubble-400 to-bubble-600',
    border: 'border-bubble-200',
    edge: 'rgba(236,72,153,0.32)',
  },
  {
    text: 'แก้ Bug ทั้ง 2 ภารกิจให้ผ่าน',
    tone: 'from-lemon-400 to-peach-500',
    border: 'border-lemon-200',
    edge: 'rgba(245,158,11,0.35)',
  },
  {
    text: 'บันทึกคำตอบในหน้า "ใบงานดิจิทัล"',
    tone: 'from-mint-400 to-mint-600',
    border: 'border-mint-200',
    edge: 'rgba(16,185,129,0.32)',
  },
  {
    text: 'ดาวน์โหลด PDF และส่งงานพร้อมไฟล์ .capx',
    tone: 'from-peach-400 to-peach-600',
    border: 'border-peach-200',
    edge: 'rgba(249,115,22,0.35)',
  },
] as const;

export const StartPage = ({ onStarted }: { onStarted: () => void }) => {
  const { state, update, lastSavedAt } = useApp();
  const { notify } = useToast();
  const [errors, setErrors] = useState<FieldErrors>({});

  const pair = state.pair;
  const { settings } = useSettings();
  const isAssistant = state.session.deviceMode === 'assistant';

  const setField = (key: keyof typeof pair, value: string) => {
    update((prev) => ({ pair: { ...prev.pair, [key]: value } }));
  };

  const handleStart = () => {
    const nextErrors: FieldErrors = {};
    if (!pair.classroom.trim()) nextErrors.classroom = 'กรุณาระบุห้องเรียน เช่น ม.5/1';
    if (!pair.pairCode.trim()) nextErrors.pairCode = 'กรุณาระบุรหัสคู่ เช่น Pair01';
    if (!pair.driverName.trim()) nextErrors.driverName = 'กรุณากรอกชื่อ-สกุลของ Driver';
    if (!pair.navigatorName.trim()) nextErrors.navigatorName = 'กรุณากรอกชื่อ-สกุลของ Navigator';

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      notify('ยังกรอกข้อมูลไม่ครบ กรุณาตรวจสอบช่องที่มีเครื่องหมายดอกจัน', 'error');
      return;
    }

    update((prev) => ({ session: { ...prev.session, activityStarted: true } }));
    notify('เริ่มกิจกรรมแล้ว เข้าสู่หน้าจำลองตรรกะได้เลย', 'success');
    onStarted();
  };

  return (
    <div className="space-y-5">
      {/* ---------- คำแนะนำกิจกรรม ---------- */}
      <Card className="overflow-hidden">
        <div className="mb-4 flex flex-col items-center gap-4 rounded-[1.5rem] bg-gradient-to-br from-brand-500 via-think-500 to-bubble-500 px-5 py-5 text-center sm:flex-row sm:text-left">
          <Mascot size={110} mood="cheer" className="shrink-0 animate-float drop-shadow-xl" />
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold leading-snug text-white drop-shadow sm:text-2xl">
              ยินดีต้อนรับสู่กิจกรรมถอดรหัสตรรกะระบบแบบทดสอบสุ่ม
            </h2>
            <p className="mt-1 text-sm text-white/90">
              {settings.courseName} {settings.gradeLevel} {settings.semester}
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border-2 border-white/40 bg-white/20 px-3 py-1 font-display text-xs font-bold text-white">
              <Rocket className="h-3.5 w-3.5" aria-hidden="true" />
              จับคู่กัน เรียงบล็อก แก้ Bug ให้ครบ 2 ภารกิจ
            </p>
          </div>
        </div>
        <p className="rounded-[1.25rem] border-2 border-brand-100 bg-gradient-to-br from-brand-50/80 via-white to-think-50/60 px-4 py-3.5 text-base leading-loose text-slate-700 sm:text-[17px]">
          กิจกรรมนี้ให้นักเรียนจับคู่กันแบบ <strong className="text-brand-800">Pair Programming</strong>{' '}
          เพื่อเรียนรู้การทำงานของ{' '}
          <Tooltip term="Array">
            ตัวแปรชุดที่เก็บข้อมูลหลายค่าไว้ในที่เดียว ในระบบนี้ใช้เก็บข้อสอบทั้ง 4 ข้อ อ้างถึงแต่ละช่องด้วยเลขตำแหน่ง
          </Tooltip>{' '}
          และ{' '}
          <Tooltip term="Function">
            ชุดคำสั่งที่ตั้งชื่อไว้แล้วเรียกใช้ซ้ำได้ เช่น Function &quot;Random&quot; ที่เรียกทุกครั้งเมื่อต้องการข้อสอบข้อถัดไป
          </Tooltip>{' '}
          ผ่านการทดลอง แก้ Bug และสังเกตค่าใน{' '}
          <Tooltip term="State Monitor">
            หน้าจอแสดงค่าตัวแปรทั้งหมดในระบบแบบทันที ใช้ตรวจสอบว่าคำสั่งที่เขียนทำงานตรงกับที่คิดไว้หรือไม่
          </Tooltip>{' '}
          แบบ Real-time
        </p>
        <TeacherCard className="mt-4" />

        <h3 className="mt-5 flex items-center gap-2 font-display text-base font-bold text-slate-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-b from-brand-400 to-brand-600 text-white shadow-clay-sm">
            <ListChecks className="h-4 w-4" aria-hidden="true" />
          </span>
          ขั้นตอนการทำกิจกรรม 6 ขั้น
        </h3>

        <ol className="mt-2.5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIVITY_STEPS.map((step, i) => (
            <li
              key={step.text}
              className={`flex items-start gap-3 rounded-2xl border-2 bg-white px-3.5 py-3 text-[15px] font-medium leading-relaxed text-slate-700 transition-transform duration-150 hover:-translate-y-0.5 ${step.border}`}
              style={{ boxShadow: `0 5px 0 0 ${step.edge}` }}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b font-display text-base font-bold text-white shadow-clay-sm ${step.tone}`}
              >
                {i + 1}
              </span>
              <span className="min-w-0 pt-0.5">{step.text}</span>
            </li>
          ))}
        </ol>
      </Card>

      <DeviceModePicker />

      {isAssistant ? (
        <Card
          title="เครื่อง Navigator พร้อมใช้งานแล้ว"
          subtitle="ไม่ต้องกรอกข้อมูลผู้เรียนที่เครื่องนี้"
          icon={<UserCheck className="h-5 w-5 text-think-600" aria-hidden="true" />}
        >
          <p className="text-sm leading-relaxed text-slate-600">
            เปิดแท็บ <strong>คลังความรู้</strong> เพื่ออ่านเรื่อง Array และ Function
            ระหว่างที่เพื่อนลงมือทำที่เครื่อง Driver และเปิดแท็บ <strong>จำลองตรรกะ</strong>
            ทดลองเรียงบล็อกเพื่อทำความเข้าใจได้ โดยผลจะไม่ถูกบันทึกเข้าระบบ
          </p>
          <p className="mt-3 rounded-2xl border-2 border-dashed border-think-200 bg-think-50/70 px-3.5 py-2.5 text-xs leading-relaxed text-think-900">
            บทบาท Navigator คือผู้อ่านเงื่อนไข ตรวจตรรกะ และให้คำแนะนำ
            การเปิดคลังความรู้ไว้บนเครื่องนี้จะช่วยให้ตรวจสอบคำสั่งได้ทันทีโดยไม่ต้องแย่งจอกับ Driver
          </p>
        </Card>
      ) : (
      <>
      {/* ---------- แบบฟอร์มระบุตัวตน ---------- */}
      <Card
        title="ข้อมูลผู้เรียนและคู่ Pair Programming"
        subtitle="ข้อมูลนี้จะถูกนำไปแสดงในใบงานและไฟล์ PDF โดยอัตโนมัติ"
        icon={<Users className="h-5 w-5 text-brand-600" aria-hidden="true" />}
        actions={
          lastSavedAt ? (
            <span className="rounded-full bg-mint-50 px-3 py-1 text-xs font-medium text-mint-700">
              บันทึกอัตโนมัติแล้ว
            </span>
          ) : null
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TextField
            label="ห้องเรียน"
            value={pair.classroom}
            onChange={(v) => setField('classroom', v)}
            placeholder="ม.5/1"
            required
            error={errors.classroom}
          />
          <TextField
            label="รหัสคู่"
            value={pair.pairCode}
            onChange={(v) => setField('pairCode', v)}
            placeholder="Pair01"
            required
            error={errors.pairCode}
            hint="ใช้รหัสตามที่ครูกำหนดให้ในคาบเรียน"
          />
          <div className="hidden lg:block" aria-hidden="true" />

          <TextField
            label="ชื่อ-สกุล Driver"
            value={pair.driverName}
            onChange={(v) => setField('driverName', v)}
            placeholder="เช่น เด็กชายกิตติภพ ใจดี"
            required
            error={errors.driverName}
          />
          <TextField
            label="เลขที่ Driver"
            value={pair.driverNumber}
            onChange={(v) => setField('driverNumber', v)}
            placeholder="12"
            inputMode="numeric"
          />
          <div className="hidden lg:block" aria-hidden="true" />

          <TextField
            label="ชื่อ-สกุล Navigator"
            value={pair.navigatorName}
            onChange={(v) => setField('navigatorName', v)}
            placeholder="เช่น เด็กหญิงพิมพ์ชนก เรียนดี"
            required
            error={errors.navigatorName}
          />
          <TextField
            label="เลขที่ Navigator"
            value={pair.navigatorNumber}
            onChange={(v) => setField('navigatorNumber', v)}
            placeholder="15"
            inputMode="numeric"
          />
          <div className="hidden lg:block" aria-hidden="true" />
        </div>

        <div className="mt-4 rounded-2xl border-2 border-lemon-200 bg-gradient-to-b from-lemon-50 to-white p-4">
          <p className="mb-1.5 flex items-center gap-2 font-display text-sm font-bold text-peach-900">
            <Send className="h-4 w-4" aria-hidden="true" />
            การส่งงานเมื่อทำกิจกรรมเสร็จ
          </p>
          <p className="text-sm leading-relaxed text-slate-600">
            เมื่อทำกิจกรรมครบแล้ว ให้ดาวน์โหลดใบงาน PDF จากหน้า &quot;สรุปและส่งงาน&quot;
            แล้ว<strong className="text-slate-800">เปิด Google Classroom ของชั้นเรียนด้วยตนเอง</strong>{' '}
            เพื่อแนบไฟล์ PDF พร้อมไฟล์ผลงาน .capx ในงานที่ครูมอบหมาย
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={handleStart} className="px-5 py-2.5">
            <Rocket className="h-4 w-4" aria-hidden="true" />
            เริ่มกิจกรรม
          </Button>
          {state.session.activityStarted && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-mint-700">
              <UserCheck className="h-4 w-4" aria-hidden="true" />
              เริ่มกิจกรรมแล้ว สามารถเข้าใช้งานทุกแท็บได้
            </span>
          )}
        </div>
      </Card>

      {/* ---------- บทบาท ---------- */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-brand-200">
          <div className="mb-3 flex items-center gap-3">
            <span
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-300 via-brand-500 to-brand-700 text-white"
              style={{
                boxShadow:
                  '0 7px 0 -1px #2b357f, 0 14px 22px -12px rgba(15,23,42,0.6), inset 0 3px 6px rgba(255,255,255,0.5)',
              }}
            >
              <Mouse className="h-8 w-8 drop-shadow" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-lg font-bold text-slate-800">บทบาท Driver</h2>
              <p className="truncate text-sm text-slate-500">
                {pair.driverName || 'ยังไม่ได้ระบุชื่อ'}
              </p>
            </div>
          </div>
          <ul className="space-y-2 text-sm leading-relaxed text-slate-600">
            <li className="flex gap-2">
              <span className="text-brand-600" aria-hidden="true">
                ●
              </span>
              ผู้ควบคุมเมาส์และคีย์บอร์ด
            </li>
            <li className="flex gap-2">
              <span className="text-brand-600" aria-hidden="true">
                ●
              </span>
              ลงมือแก้ Event Sheet ใน Construct 2 และเรียงบล็อกใน Workspace
            </li>
            <li className="flex gap-2">
              <span className="text-brand-600" aria-hidden="true">
                ●
              </span>
              อธิบายสิ่งที่กำลังทำออกมาดัง ๆ ให้ Navigator ฟังเสมอ
            </li>
          </ul>
        </Card>

        <Card className="border-think-200">
          <div className="mb-3 flex items-center gap-3">
            <span
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-think-300 via-think-500 to-think-700 text-white"
              style={{
                boxShadow:
                  '0 7px 0 -1px #561e80, 0 14px 22px -12px rgba(15,23,42,0.6), inset 0 3px 6px rgba(255,255,255,0.5)',
              }}
            >
              <Compass className="h-8 w-8 drop-shadow" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-lg font-bold text-slate-800">บทบาท Navigator</h2>
              <p className="truncate text-sm text-slate-500">
                {pair.navigatorName || 'ยังไม่ได้ระบุชื่อ'}
              </p>
            </div>
          </div>
          <ul className="space-y-2 text-sm leading-relaxed text-slate-600">
            <li className="flex gap-2">
              <span className="text-think-600" aria-hidden="true">
                ●
              </span>
              ผู้อ่านเงื่อนไขและตรวจสอบความถูกต้องของตรรกะ
            </li>
            <li className="flex gap-2">
              <span className="text-think-600" aria-hidden="true">
                ●
              </span>
              เฝ้าดู State Monitor และ Debug Log เพื่อจับความผิดปกติ
            </li>
            <li className="flex gap-2">
              <span className="text-think-600" aria-hidden="true">
                ●
              </span>
              ให้คำแนะนำและตั้งคำถามชวนคิด ไม่แย่งเมาส์จาก Driver
            </li>
          </ul>
        </Card>
      </div>

      <RoleTimer />
      </>
      )}
    </div>
  );
};
