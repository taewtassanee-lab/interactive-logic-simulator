import { useState } from 'react';
import {
  CircleCheck,
  ClipboardPaste,
  Download,
  FileText,
  ListChecks,
  Loader2,
  Target,
  Wrench,
} from 'lucide-react';
import { APP_CONFIG } from '../config';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../components/Toast';
import { useWorksheetPdf } from '../hooks/useWorksheetPdf';
import { Button, Card, ProgressBar, TextArea, Tooltip } from '../components/Ui';
import { AssistantNotice } from '../components/DeviceModePicker';
import {
  getMissingWorksheetFields,
  getWorksheetFields,
  getWorksheetProgress,
} from '../utils/format';
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
  const { settings } = useSettings();
  const { state, update, lastSavedAt } = useApp();
  const { notify } = useToast();
  const { exportPdf, printNode, busy } = useWorksheetPdf();
  const [showMissing, setShowMissing] = useState(false);

  const w = state.worksheet;
  const progress = getWorksheetProgress(w);
  const missing = getMissingWorksheetFields(w);
  const totalFields = getWorksheetFields(w).length;

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

  if (state.session.deviceMode === 'assistant') {
    return <AssistantNotice page="ใบงานดิจิทัล" />;
  }

  const q2Correct = w.q2FillIn.trim().toLowerCase() === CORRECT_Q2.toLowerCase();
  const q3Correct = w.q3Choice === CORRECT_Q3;

  return (
    <div className="space-y-4">
      {printNode}

      {/* ---------- หัวใบงาน ---------- */}
      <Card
        title={APP_CONFIG.worksheetTitle}
        subtitle={`${settings.courseName} ${settings.gradeLevel} ${settings.semester}`}
        icon={<FileText className="h-5 w-5 text-brand-600" aria-hidden="true" />}
        actions={
          lastSavedAt ? (
            <span className="rounded-full bg-mint-50 px-3 py-1 text-xs font-medium text-mint-700">
              บันทึกอัตโนมัติแล้ว
            </span>
          ) : null
        }
      >
        <p className="mb-3 text-sm text-slate-600">{settings.unitName}</p>
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

      {/* ---------- ก่อนลงมือ: เป้าหมายที่คู่ตั้งเอง ---------- */}
      {/* วางไว้ก่อนส่วนที่ 1 เพราะต้องเขียนก่อนเริ่มทำจริง ไม่ใช่ย้อนเขียนทีหลัง
          เป็นช่วงเดียวในใบงานที่ผู้เรียนเป็นคนกำหนดเป้าหมายเอง ไม่ใช่ครูกำหนดให้ */}
      <Card
        accent="lemon"
        title="ก่อนลงมือ: เป้าหมายของคู่เรา"
        subtitle="เขียนก่อนเริ่มทำภารกิจ แล้วกลับมาอ่านอีกครั้งตอนท้ายคาบ"
        icon={<Target className="h-5 w-5 text-peach-600" aria-hidden="true" />}
      >
        <p className="mb-3 rounded-2xl border-2 border-dashed border-lemon-300 bg-lemon-50/70 px-3.5 py-2.5 text-sm leading-relaxed text-slate-700">
          คุยกับคู่ของตัวเองสั้น ๆ แล้วตกลงกันว่าคาบนี้เราจะทำอะไรให้สำเร็จ
          เป้าหมายที่ตั้งเองจะทำให้รู้ว่าต้องโฟกัสตรงไหน และตอนจบคาบจะวัดได้ว่าทำได้ตามที่ตั้งใจหรือไม่
        </p>
        {/* รวมเป้าหมายกับข้อตกลงไว้ช่องเดียว เพราะเป็นหลักฐานของตัวชี้วัดเดียวกัน
            แยกสองช่องแล้วผู้เรียนต้องพิมพ์สองรอบโดยไม่ได้หลักฐานเพิ่ม */}
        <TextArea
          label="เป้าหมายของคู่เราในคาบนี้ และเราจะไปให้ถึงได้อย่างไร"
          value={w.goal}
          onChange={(v) => setW({ goal: v })}
          placeholder="เขียนเป้าหมายให้วัดได้ แล้วต่อด้วยข้อตกลงสั้น ๆ เช่น แก้ Bug ให้ผ่านทั้ง 2 ภารกิจโดยเปิดคำใบ้ไม่เกิน 1 ครั้ง โดยจะอ่านโจทย์ให้จบก่อนแตะเมาส์ และให้ Navigator อ่าน State Monitor ออกเสียงทุกครั้งที่ Run"
          rows={3}
          required
        />
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
            placeholder="เขียนสิ่งที่สังเกตเห็นด้วยตนเอง ระบุชื่อค่าที่เปลี่ยน และบอกว่าเปลี่ยนตอนคำสั่งใดทำงาน"
            rows={4}
            required
            hint="เขียนอย่างน้อย 10 ตัวอักษร ควรอ้างอิงค่าที่เห็นจริงใน State Monitor ไม่ใช่การเดา"
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

          <TextArea
            label="4. การสุ่ม Index ด้วย int(random(Array.Width)) ทำงานอย่างไร และเหตุใดจึงต้องครอบด้วย int หรือ floor"
            value={w.q4RandomLogic}
            onChange={(v) => setW({ q4RandomLogic: v })}
            placeholder="อธิบายเป็นขั้นตอนว่าได้ค่าอะไรออกมาก่อน แล้วถูกแปลงเป็นอะไร และถ้าไม่ครอบจะเกิดอะไรขึ้น"
            rows={3}
            required
            hint="ลองทดลองในหน้าคลังความรู้ ส่วนลองเล่น Array แล้วสังเกตเลข Index ที่สุ่มได้"
          />
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

              {/* ช่องนี้ต้องเขียนก่อนกด Run จึงแยกกรอบและวางไว้เหนือช่องสาเหตุ
                  ถ้าปล่อยให้อยู่แถวเดียวกัน ผู้เรียนจะย้อนมาเขียนทีหลังเมื่อรู้คำตอบแล้ว */}
              <div
                className="mb-3 rounded-2xl border-2 border-think-200 bg-think-50/60 px-3.5 py-3"
                style={{ boxShadow: '0 4px 0 0 rgba(139,92,246,0.2)' }}
              >
                <TextArea
                  label="แผนที่วางไว้ก่อนลงมือ (เขียนก่อนกด Run)"
                  value={row.plan}
                  onChange={(v) => setRow(index, { plan: v })}
                  placeholder="เดาไว้ก่อนว่าปัญหาน่าจะอยู่ตรงไหน และจะลองอะไรเป็นอย่างแรก เช่น คิดว่าคำสั่งลบข้อสอบยังไม่ได้อยู่ใน Function จะลองย้ายเข้าไปแล้ว Run ดู Array.Width"
                  rows={2}
                  required
                />
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <TextArea
                  label="สาเหตุที่พบจากการดู Web App / Event Sheet"
                  value={row.cause}
                  onChange={(v) => setRow(index, { cause: v })}
                  placeholder="เขียนด้วยคำของตัวเอง ว่าพบความผิดปกติอะไร และคิดว่าคำสั่งใดขาดหายหรือวางผิดตำแหน่ง"
                  rows={3}
                  required
                />
                <TextArea
                  label="แนวทางการแก้ไขข้อผิดพลาด"
                  value={row.fix}
                  onChange={(v) => setRow(index, { fix: v })}
                  placeholder="ระบุชื่อบล็อกที่ต้องเพิ่มหรือย้าย และบอกให้ชัดว่าต้องวางไว้ก่อนหรือหลังคำสั่งใด"
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
        title="ส่วนที่ 3: ต่อยอดระบบ"
        subtitle="การสะท้อนการทำงานเป็นคู่ย้ายไปตอบรายคนในกิจกรรมสดของครู"
        icon={<span className="flex h-6 w-6 items-center justify-center rounded-md bg-think-100 text-xs font-bold text-think-800">3</span>}
      >
        <div className="space-y-5">
          {/* ช่องเดียวในใบงานที่ไม่มีคำตอบถูกผิดตายตัว ทุกคู่จึงได้คิดต่อยอดเอง
              ไม่ใช่เฉพาะกลุ่มที่ทำเสร็จก่อนแล้วได้ภารกิจเสริม */}
          <div
            className="rounded-2xl border-2 border-bubble-200 bg-bubble-50/60 px-3.5 py-3"
            style={{ boxShadow: '0 4px 0 0 rgba(236,72,153,0.2)' }}
          >
            <TextArea
              label="ถ้าจะต่อยอดระบบแบบทดสอบนี้ให้ดีขึ้นอีก 1 อย่าง คู่เราจะเพิ่มอะไร และจะทำอย่างไร"
              value={w.q4Extend}
              onChange={(v) => setW({ q4Extend: v })}
              placeholder="คิดเองได้เต็มที่ ข้อนี้ไม่มีคำตอบตายตัว เขียนทั้งสิ่งที่จะเพิ่ม และบอกคร่าว ๆ ว่าจะใช้ Array ตัวแปร หรือเงื่อนไขอะไรทำให้เกิดขึ้นจริง"
              rows={3}
              required
            />
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              เช่น เพิ่มระบบจับเวลารายข้อ เพิ่มพลังชีวิตที่ลดลงเมื่อตอบผิด
              เก็บสถิติข้อที่ตอบผิดบ่อยไว้ถามซ้ำ หรือแยกระดับความยากของข้อสอบ
            </p>
          </div>

          {/* ข้อนี้ไม่ใช่การต่อยอดระบบเดิม แต่เป็นการย้ายตรรกะเดียวกันไปใช้กับโจทย์คนละบริบท
              จึงเป็นหลักฐานของตัวชี้วัดที่ 5 ข้อ 3 ประยุกต์ใช้ทักษะในสถานการณ์หรือการแก้ปัญหาใหม่
              และเชื่อมโยงกับชีวิตจริงในห้องเรียนตามตัวชี้วัดที่ 4 ข้อ 1 */}
          <div
            className="rounded-2xl border-2 border-think-200 bg-think-50/60 px-3.5 py-3"
            style={{ boxShadow: '0 4px 0 0 rgba(124,77,216,0.2)' }}
          >
            <TextArea
              label="ถ้าครูอยากได้ระบบสุ่มชื่อนักเรียนขึ้นมาตอบคำถามหน้าชั้น โดยไม่ให้ซ้ำคนเดิมจนกว่าจะครบทุกคน เราจะใช้ตรรกะเดียวกับที่เรียนวันนี้อย่างไร"
              value={w.q5Transfer}
              onChange={(v) => setW({ q5Transfer: v })}
              placeholder="บอกว่าจะเก็บอะไรไว้ใน Array แทนข้อสอบ แล้ว Function สุ่มกับเงื่อนไขจบต้องเปลี่ยนอย่างไร"
              rows={3}
              required
            />
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              เป็นโจทย์คนละเรื่องกับข้อบน ข้อบนคือต่อยอดระบบแบบทดสอบเดิม
              ส่วนข้อนี้คือย้ายตรรกะ Array และ Delete index ไปใช้กับระบบอื่นที่ไม่ใช่ข้อสอบ
            </p>
          </div>

          {/* ส่วนสะท้อนการทำงานเป็นคู่ย้ายออกจากใบงานไปเป็นกิจกรรมสด
              เพราะกิจกรรมสดบันทึกคำตอบเป็นรายบุคคลพร้อมชื่อและเวลาลงชีตให้เอง
              และผู้เรียนตอบจากเครื่องของตนเองพร้อมกันได้ ไม่ต้องผลัดกันพิมพ์ที่เครื่องนี้เครื่องเดียว */}
          <div className="rounded-2xl border-2 border-dashed border-think-300 bg-think-50/60 px-3.5 py-3">
            <p className="font-display text-sm font-bold text-think-900">
              การสะท้อนการทำงานเป็นคู่ ตอบในแท็บ &quot;กิจกรรมสด&quot;
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              ตอนท้ายคาบครูจะเปิดกิจกรรมให้ตอบเรื่องบทบาทที่ได้ลงมือทำ สิ่งที่คู่ทำได้ดี
              และสิ่งที่ตัวเองต้องพัฒนา <strong>ตอบจากเครื่องของตัวเองได้ทั้งสองคนพร้อมกัน</strong>
              รวมถึงเครื่อง Navigator ด้วย จึงไม่ต้องรอผลัดกันพิมพ์ที่เครื่องนี้
            </p>
          </div>
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
            กรอกครบแล้ว {progress}% ({totalFields - missing.length} จาก {totalFields} รายการ)
          </span>
        </div>
      </Card>
    </div>
  );
};
