import { useState } from 'react';
import { Compass, FlaskConical, Mouse, Rocket, Send, UserCheck, Users } from 'lucide-react';
import { APP_CONFIG } from '../config';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { RoleTimer } from '../components/RoleTimer';
import { Button, Card, TextField, Tooltip } from '../components/Ui';
import { createSampleState } from '../data/sampleData';
import { Mascot } from '../components/Illustrations';
import { TeacherCard } from '../components/TeacherCard';

interface FieldErrors {
  classroom?: string;
  pairCode?: string;
  driverName?: string;
  navigatorName?: string;
}

export const StartPage = ({ onStarted }: { onStarted: () => void }) => {
  const { state, update, lastSavedAt } = useApp();
  const { notify } = useToast();
  const [errors, setErrors] = useState<FieldErrors>({});

  const pair = state.pair;

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

  /** โหลดข้อมูลตัวอย่างเพื่อให้ครูดูหน้าตาใบงานและ PDF ได้ทันที */
  const handleLoadSample = () => {
    const sample = createSampleState();
    update({ pair: sample.pair, session: sample.session, worksheet: sample.worksheet });
    setErrors({});
    notify('โหลดข้อมูลตัวอย่างแล้ว ใช้สำหรับทดสอบระบบเท่านั้น อย่าลืมแก้เป็นข้อมูลจริงก่อนส่งงาน', 'info');
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
              {APP_CONFIG.courseName} {APP_CONFIG.gradeLevel} {APP_CONFIG.semester}
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border-2 border-white/40 bg-white/20 px-3 py-1 font-display text-xs font-bold text-white">
              <Rocket className="h-3.5 w-3.5" aria-hidden="true" />
              จับคู่กัน เรียงบล็อก แก้ Bug ให้ครบ 2 ภารกิจ
            </p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">
          กิจกรรมนี้ให้นักเรียนจับคู่กันแบบ Pair Programming เพื่อเรียนรู้การทำงานของ{' '}
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

        <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[
            'กรอกข้อมูลผู้เรียนและกดปุ่ม "เริ่มกิจกรรม"',
            'เรียงบล็อกคำสั่งในหน้า "จำลองตรรกะ" แล้ว Run เพื่อดูผล',
            'แก้ Bug ทั้ง 2 ภารกิจให้ผ่าน',
            'บันทึกคำตอบในหน้า "ใบงานดิจิทัล"',
            'ดาวน์โหลด PDF และส่งงานพร้อมไฟล์ .capx',
          ].map((step, i) => (
            <li
              key={step}
              className="flex items-start gap-2.5 rounded-2xl border-2 border-slate-100 bg-white px-3 py-2.5 text-sm text-slate-600"
              style={{ boxShadow: '0 4px 0 0 rgba(203,213,225,0.5)' }}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold text-white shadow-clay-sm ${
                  ['bg-brand-500', 'bg-think-500', 'bg-bubble-500', 'bg-lemon-500', 'bg-mint-500'][i]
                }`}
              >
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </Card>

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
          <Button variant="secondary" onClick={handleLoadSample}>
            <FlaskConical className="h-4 w-4 text-think-500" aria-hidden="true" />
            โหลดข้อมูลตัวอย่าง (สำหรับทดสอบระบบ)
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
    </div>
  );
};
