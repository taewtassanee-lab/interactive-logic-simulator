import { useState } from 'react';
import {
  CircleCheck,
  ClipboardPaste,
  Download,
  FileText,
  ListChecks,
  Loader2,
  Star,
  Wrench,
} from 'lucide-react';
import { APP_CONFIG } from '../config';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { useWorksheetPdf } from '../hooks/useWorksheetPdf';
import { Button, Card, ProgressBar, TextArea, Tooltip } from '../components/Ui';
import { getMissingWorksheetFields, getWorksheetProgress } from '../utils/format';
import type { DebugRow, WorksheetData } from '../types';

const Q3_CHOICES = [
  'เปลี่ยนไปหน้า Summary',
  'สุ่มข้อสอบใหม่อีกครั้ง',
  'รีเซ็ตคะแนนเป็น 0',
  'ปิดโปรแกรมทันที',
];

const CORRECT_Q2 = 'Num';
const CORRECT_Q3 = 'เปลี่ยนไปหน้า Summary';

export const WorksheetPage = () => {
  const { state, update, lastSavedAt } = useApp();
  const { notify } = useToast();
  const { exportPdf, printNode, busy } = useWorksheetPdf();
  const [showMissing, setShowMissing] = useState(false);

  const w = state.worksheet;
  const progress = getWorksheetProgress(w);
  const missing = getMissingWorksheetFields(w);

  const setW = (patch: Partial<WorksheetData>) => {
    update((prev) => ({ worksheet: { ...prev.worksheet, ...patch } }));
  };

  const setRow = (index: number, patch: Partial<DebugRow>) => {
    update((prev) => ({
      worksheet: {
        ...prev.worksheet,
        debugRows: prev.worksheet.debugRows.map((row, i) =>
          i === index ? { ...row, ...patch } : row,
        ),
      },
    }));
  };

  /** ดึง Debug Log ล่าสุดจากการจำลองมาเป็นหลักฐานในตาราง */
  const pullDebugLog = (index: number) => {
    if (state.lastDebugLog.length === 0) {
      notify('ยังไม่มี Debug Log กรุณาไปที่หน้า "จำลองตรรกะ" แล้วกด Run Simulation ก่อน', 'warn');
      return;
    }
    const text = state.lastDebugLog
      .slice(-10)
      .map((l) => `[${l.time}] ${l.message}`)
      .join('\n');
    setRow(index, { evidence: text });
    notify('ดึง Debug Log ล่าสุด 10 บรรทัดมาใส่ในช่องหลักฐานแล้ว', 'success');
  };

  const handleDownload = async () => {
    if (missing.length > 0) {
      setShowMissing(true);
      await exportPdf();
      return;
    }
    await exportPdf();
  };

  const q2Correct = w.q2FillIn.trim().toLowerCase() === CORRECT_Q2.toLowerCase();
  const q3Correct = w.q3Choice === CORRECT_Q3;

  return (
    <div className="space-y-4">
      {printNode}

      {/* ---------- หัวใบงาน ---------- */}
      <Card
        title={APP_CONFIG.worksheetTitle}
        subtitle={`${APP_CONFIG.courseName} ${APP_CONFIG.gradeLevel} ${APP_CONFIG.semester}`}
        icon={<FileText className="h-5 w-5 text-brand-600" aria-hidden="true" />}
        actions={
          lastSavedAt ? (
            <span className="rounded-full bg-mint-50 px-3 py-1 text-xs font-medium text-mint-700">
              บันทึกอัตโนมัติแล้ว
            </span>
          ) : null
        }
      >
        <p className="mb-3 text-sm text-slate-600">{APP_CONFIG.unitName}</p>
        <div className="grid gap-2 rounded-xl bg-slate-50 p-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <p>
            <span className="text-slate-500">ห้องเรียน: </span>
            <span className="font-semibold text-slate-800">{state.pair.classroom || '-'}</span>
          </p>
          <p>
            <span className="text-slate-500">รหัสคู่: </span>
            <span className="font-semibold text-slate-800">{state.pair.pairCode || '-'}</span>
          </p>
          <p>
            <span className="text-slate-500">สลับบทบาท: </span>
            <span className="font-semibold text-slate-800">
              {state.session.roleSwitchCount} ครั้ง
            </span>
          </p>
          <p>
            <span className="text-slate-500">Driver: </span>
            <span className="font-semibold text-slate-800">
              {state.pair.driverName || '-'}
              {state.pair.driverNumber && ` (เลขที่ ${state.pair.driverNumber})`}
            </span>
          </p>
          <p>
            <span className="text-slate-500">Navigator: </span>
            <span className="font-semibold text-slate-800">
              {state.pair.navigatorName || '-'}
              {state.pair.navigatorNumber && ` (เลขที่ ${state.pair.navigatorNumber})`}
            </span>
          </p>
        </div>

        <div className="mt-4">
          <ProgressBar percent={progress} label="ความครบถ้วนของใบงาน" />
        </div>

        {showMissing && missing.length > 0 && (
          <div className="mt-3 rounded-xl border border-lemon-300 bg-lemon-50 p-3.5" role="alert">
            <p className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-peach-900">
              <ListChecks className="h-4 w-4" aria-hidden="true" />
              ยังเหลืออีก {missing.length} รายการที่ยังไม่ได้กรอก
            </p>
            <ul className="space-y-1 text-xs leading-relaxed text-peach-900">
              {missing.map((f) => (
                <li key={f.key}>• {f.label}</li>
              ))}
            </ul>
          </div>
        )}

        {progress === 100 && (
          <p className="mt-3 flex items-center gap-2 rounded-xl border border-mint-300 bg-mint-50 px-3 py-2.5 text-sm font-medium text-mint-900">
            <CircleCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            กรอกใบงานครบถ้วนแล้ว พร้อมสร้างไฟล์ PDF เพื่อนำไปแนบส่งใน Google Classroom
          </p>
        )}
      </Card>

      {/* ---------- ส่วนที่ 1 ---------- */}
      <Card
        title="ส่วนที่ 1: การวิเคราะห์ตรรกะแบบทดสอบบน Interactive Web App"
        icon={<span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-100 text-xs font-bold text-brand-800">1</span>}
      >
        <div className="space-y-5">
          <TextArea
            label="1. เมื่อทดลอง Run Simulation นักเรียนสังเกตเห็นการเปลี่ยนแปลงของค่าใน State Monitor อย่างไร"
            value={w.q1Observation}
            onChange={(v) => setW({ q1Observation: v })}
            placeholder="เช่น เมื่อกด Run ค่า Num เปลี่ยนไปทุกครั้ง ข้อสอบใน Array ลดลงจาก 4 เหลือ 3 และ Score เพิ่มขึ้นเมื่อตอบถูก"
            rows={4}
            required
            hint="เขียนอย่างน้อย 10 ตัวอักษร ระบุชื่อค่าที่เปลี่ยน เช่น Array Size, Num, Score"
          />

          <div>
            <p className="mb-1 text-sm font-medium text-slate-700">
              2. คำสั่งใดต้องใส่ไว้ใน Function &quot;Random&quot; เพื่อตัดข้อสอบที่ทำไปแล้วออกจาก{' '}
              <Tooltip term="Array">
                ตัวแปรชุดที่เก็บข้อสอบทั้งหมด การลบสมาชิกออกจะทำให้ Array.Width ลดลง
              </Tooltip>
              <span className="ml-1 text-bubble-600" aria-hidden="true">
                *
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="font-mono text-sm text-slate-700">Array -&gt; Delete index</span>
              <label htmlFor="q2-fill" className="sr-only">
                เติมคำตอบชื่อตัวแปรที่ใช้ระบุตำแหน่งที่จะลบ
              </label>
              <input
                id="q2-fill"
                value={w.q2FillIn}
                onChange={(e) => setW({ q2FillIn: e.target.value })}
                placeholder="เติมคำตอบ"
                className={`w-32 rounded-lg border px-3 py-1.5 text-center font-mono text-sm outline-none focus:ring-2 ${
                  w.q2FillIn.trim() === ''
                    ? 'border-slate-300 focus:border-brand-500 focus:ring-brand-200'
                    : q2Correct
                      ? 'border-mint-400 bg-mint-50 text-mint-800 focus:ring-mint-200'
                      : 'border-bubble-400 bg-bubble-50 text-bubble-800 focus:ring-bubble-200'
                }`}
              />
              <span className="font-mono text-sm text-slate-700">from X axis</span>
            </div>
            {w.q2FillIn.trim() !== '' && (
              <p
                className={`mt-1.5 text-xs font-medium ${q2Correct ? 'text-mint-700' : 'text-bubble-700'}`}
                role="status"
              >
                {q2Correct
                  ? '✓ ถูกต้อง: ตัวแปร Num คือเลขตำแหน่งที่สุ่มได้ จึงใช้ระบุช่องที่ต้องลบ'
                  : '✕ ยังไม่ถูกต้อง: ลองดูใน State Monitor ว่าตัวแปรใดเก็บเลขตำแหน่งที่สุ่มได้'}
              </p>
            )}
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-700">
              3. เมื่อ Array เป็นค่าว่าง [ ] ระบบควรทำงานอย่างไร
              <span className="ml-1 text-bubble-600" aria-hidden="true">
                *
              </span>
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {Q3_CHOICES.map((choice) => {
                const selected = w.q3Choice === choice;
                return (
                  <label
                    key={choice}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition ${
                      selected
                        ? 'border-brand-500 bg-brand-50 font-medium text-brand-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="q3-choice"
                      value={choice}
                      checked={selected}
                      onChange={() => setW({ q3Choice: choice })}
                      className="h-4 w-4 accent-brand-600"
                    />
                    {choice}
                  </label>
                );
              })}
            </div>
            {w.q3Choice && (
              <p
                className={`mt-1.5 text-xs font-medium ${q3Correct ? 'text-mint-700' : 'text-bubble-700'}`}
                role="status"
              >
                {q3Correct
                  ? '✓ ถูกต้อง: เมื่อไม่มีข้อสอบเหลือ ระบบต้องเปลี่ยน Layout ไปหน้า Summary เพื่อสรุปคะแนน'
                  : '✕ ยังไม่ถูกต้อง: ลองสังเกตค่า Current Layout ใน State Monitor เมื่อ Array ว่าง'}
              </p>
            )}
          </fieldset>
        </div>
      </Card>

      {/* ---------- ส่วนที่ 2 ---------- */}
      <Card
        title="ส่วนที่ 2: บันทึกรายการซ่อมข้อผิดพลาดระบบแบบทดสอบ"
        subtitle="บันทึกสาเหตุและวิธีแก้ของ Bug ทั้ง 2 จุด พร้อมแนบหลักฐานจาก State Monitor"
        icon={<Wrench className="h-5 w-5 text-bubble-600" aria-hidden="true" />}
      >
        <div className="space-y-4">
          {w.debugRows.map((row, index) => (
            <div key={row.point} className="rounded-xl border border-slate-200 p-3.5">
              <div className="mb-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg bg-bubble-50 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-bubble-700">
                    จุดที่พบ Bug
                  </p>
                  <p className="text-sm font-semibold text-slate-800">{row.point}</p>
                </div>
                <div className="rounded-lg bg-lemon-50 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-peach-700">
                    สภาพปัญหา
                  </p>
                  <p className="text-sm text-slate-800">{row.symptom}</p>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <TextArea
                  label="สาเหตุที่พบจากการดู Web App / Event Sheet"
                  value={row.cause}
                  onChange={(v) => setRow(index, { cause: v })}
                  placeholder={
                    index === 0
                      ? 'เช่น ใน Function Random ไม่มีคำสั่ง Array -> Delete index ทำให้ Array.Width ไม่ลดลง'
                      : 'เช่น ไม่มีเงื่อนไข If Array is empty ระบบจึงไม่รู้ว่าข้อสอบหมดแล้ว'
                  }
                  rows={3}
                  required
                />
                <TextArea
                  label="แนวทางการแก้ไขข้อผิดพลาด"
                  value={row.fix}
                  onChange={(v) => setRow(index, { fix: v })}
                  placeholder={
                    index === 0
                      ? 'เช่น เพิ่มบล็อก Array -> Delete index Num from X axis ต่อจาก Set CurrentQuestion'
                      : 'เช่น เพิ่ม If Array is empty แล้วตามด้วย Go to Layout "Summary" และ Display Score'
                  }
                  rows={3}
                  required
                />
              </div>

              <div className="mt-3">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    หลักฐานจาก State Monitor
                    <span className="ml-1 text-bubble-600" aria-hidden="true">
                      *
                    </span>
                  </span>
                  <Button variant="secondary" onClick={() => pullDebugLog(index)}>
                    <ClipboardPaste className="h-4 w-4" aria-hidden="true" />
                    ดึง Debug Log ล่าสุด
                  </Button>
                </div>
                <label htmlFor={`evidence-${index}`} className="sr-only">
                  หลักฐานจาก State Monitor ของ {row.point}
                </label>
                <textarea
                  id={`evidence-${index}`}
                  value={row.evidence}
                  onChange={(e) => setRow(index, { evidence: e.target.value })}
                  rows={4}
                  placeholder="กดปุ่ม ดึง Debug Log ล่าสุด หรือพิมพ์สิ่งที่สังเกตเห็นจาก State Monitor ด้วยตนเอง"
                  className="w-full resize-y rounded-lg border border-slate-300 bg-slate-900 px-3 py-2 font-mono text-[12px] leading-relaxed text-mint-200 outline-none placeholder:text-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ---------- ส่วนที่ 3 ---------- */}
      <Card
        title="ส่วนที่ 3: สรุปประเมินตนเอง (Metacognition)"
        icon={<span className="flex h-6 w-6 items-center justify-center rounded-md bg-think-100 text-xs font-bold text-think-800">3</span>}
      >
        <div className="space-y-5">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-700">
              1. ฉันได้ปฏิบัติหน้าที่ใดบ้าง
              <span className="ml-1 text-bubble-600" aria-hidden="true">
                *
              </span>
            </legend>
            <div className="flex flex-wrap gap-3">
              {(
                [
                  { key: 'driver' as const, label: 'Driver (ควบคุมเมาส์และคีย์บอร์ด)' },
                  { key: 'navigator' as const, label: 'Navigator (ตรวจตรรกะและให้คำแนะนำ)' },
                ]
              ).map((role) => (
                <label
                  key={role.key}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition ${
                    w.rolesPlayed[role.key]
                      ? 'border-think-500 bg-think-50 font-medium text-think-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={w.rolesPlayed[role.key]}
                    onChange={(e) =>
                      setW({ rolesPlayed: { ...w.rolesPlayed, [role.key]: e.target.checked } })
                    }
                    className="h-4 w-4 accent-think-600"
                  />
                  {role.label}
                </label>
              ))}
            </div>
          </fieldset>

          <TextArea
            label="2. Web App ช่วยให้เข้าใจ Array และ Function อย่างไร"
            value={w.q3AppHelp}
            onChange={(v) => setW({ q3AppHelp: v })}
            placeholder="เช่น เห็นภาพว่า Array คือกล่องเก็บข้อสอบที่ลดลงทีละช่อง และ Function คือชุดคำสั่งที่เรียกซ้ำได้"
            rows={3}
            required
          />
          <TextArea
            label="3. สิ่งที่คู่ของฉันทำได้ดีในการทำงานร่วมกันคืออะไร"
            value={w.q3PartnerGood}
            onChange={(v) => setW({ q3PartnerGood: v })}
            placeholder="เช่น อธิบายเงื่อนไขได้ชัดเจน คอยเตือนเมื่อวางบล็อกผิดลำดับ"
            rows={3}
            required
          />
          <TextArea
            label="4. สิ่งที่ต้องพัฒนาต่อไปในการแก้ปัญหา Bug คืออะไร"
            value={w.q3ToImprove}
            onChange={(v) => setW({ q3ToImprove: v })}
            placeholder="เช่น ต้องอ่าน Debug Log ให้ละเอียดขึ้นก่อนเดาสาเหตุ"
            rows={3}
            required
          />

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-700">
              5. ประเมินความร่วมมือในการทำงานคู่
              <span className="ml-1 text-bubble-600" aria-hidden="true">
                *
              </span>
            </legend>
            <div className="flex flex-wrap items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => {
                const active = w.collaborationRating >= n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setW({ collaborationRating: n })}
                    aria-pressed={w.collaborationRating === n}
                    aria-label={`ให้คะแนน ${n} ดาว`}
                    className="rounded-md p-1 transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-lemon-400"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        active ? 'fill-lemon-400 text-lemon-500' : 'text-slate-300'
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
              <span className="ml-2 text-sm font-medium text-slate-600">
                {w.collaborationRating > 0
                  ? `${w.collaborationRating} จาก 5 คะแนน`
                  : 'ยังไม่ได้ให้คะแนน'}
              </span>
            </div>
          </fieldset>
        </div>
      </Card>

      {/* ---------- ปุ่มสร้าง PDF ---------- */}
      <Card
        title="ดาวน์โหลดใบงาน"
        subtitle="ไฟล์ PDF จะถูกตั้งชื่ออัตโนมัติตามห้องเรียนและรหัสคู่"
        icon={<Download className="h-5 w-5 text-mint-600" aria-hidden="true" />}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="success" onClick={handleDownload} disabled={busy}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-4 w-4" aria-hidden="true" />
            )}
            {busy ? 'กำลังสร้าง PDF...' : 'สร้างและดาวน์โหลดใบงาน PDF'}
          </Button>
          <Button variant="secondary" onClick={() => setShowMissing((v) => !v)}>
            <ListChecks className="h-4 w-4" aria-hidden="true" />
            {showMissing ? 'ซ่อนรายการที่ยังไม่ครบ' : 'ตรวจรายการที่ยังไม่ครบ'}
          </Button>
          <span className="text-xs text-slate-500">
            กรอกครบแล้ว {progress}% ({14 - missing.length} จาก 14 รายการ)
          </span>
        </div>
      </Card>
    </div>
  );
};
