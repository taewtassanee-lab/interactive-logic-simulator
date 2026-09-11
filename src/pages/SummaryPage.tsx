import { useRef, useState } from 'react';
import {
  CircleCheck,
  Circle,
  ClipboardCopy,
  Download,
  FileArchive,
  Loader2,
  Send,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { useWorksheetPdf } from '../hooks/useWorksheetPdf';
import { Button, Card } from '../components/Ui';
import { AssistantNotice } from '../components/DeviceModePicker';
import {
  buildPdfFileName,
  buildSubmissionText,
  formatBytes,
  formatThaiDateTime,
  getWorksheetProgress,
} from '../utils/format';
import type { TabId } from '../types';

interface CheckItem {
  id: string;
  label: string;
  done: boolean;
  fixHint: string;
  goTo?: TabId;
}

export const SummaryPage = ({ onNavigate }: { onNavigate: (tab: TabId) => void }) => {
  const { state, update } = useApp();
  const { notify } = useToast();
  const { exportPdf, printNode, busy } = useWorksheetPdf();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [checked, setChecked] = useState(false);

  const { pair, missions, session, worksheet, capxFile } = state;
  const worksheetProgress = getWorksheetProgress(worksheet);

  const groups: { title: string; items: CheckItem[] }[] = [
    {
      title: 'ข้อมูลผู้เรียน',
      items: [
        {
          id: 'names',
          label: 'กรอกชื่อ Driver และ Navigator ครบ',
          done: Boolean(pair.driverName.trim() && pair.navigatorName.trim()),
          fixHint: 'ไปที่หน้า "เริ่มต้นใช้งาน" แล้วกรอกชื่อ-สกุลของทั้งสองคน',
          goTo: 'start',
        },
        {
          id: 'pair',
          label: 'ระบุรหัสคู่และห้องเรียนแล้ว',
          done: Boolean(pair.pairCode.trim() && pair.classroom.trim()),
          fixHint: 'ไปที่หน้า "เริ่มต้นใช้งาน" แล้วกรอกห้องเรียนและรหัสคู่ตามที่ครูกำหนด',
          goTo: 'start',
        },
      ],
    },
    {
      title: 'ผลการจำลอง',
      items: [
        {
          id: 'm1',
          label: 'ผ่านภารกิจแก้ Bug ระบบสุ่มข้อสอบ',
          done: missions.mission1Passed,
          fixHint: 'กลับไปหน้า "จำลองตรรกะ" เลือกภารกิจที่ 1 อ่านอาการและกดขอคำใบ้ทีละขั้น',
          goTo: 'simulator',
        },
        {
          id: 'm2',
          label: 'ผ่านภารกิจแก้ Bug เงื่อนไขจบเกม',
          done: missions.mission2Passed,
          fixHint: 'กลับไปหน้า "จำลองตรรกะ" เลือกภารกิจที่ 2 อ่านอาการและกดขอคำใบ้ทีละขั้น',
          goTo: 'simulator',
        },
        {
          id: 'switch',
          label: 'มีการสลับบทบาท Driver / Navigator',
          done: session.roleSwitchCount > 0,
          fixHint: 'ใช้ Role Switch Timer ในหน้าเริ่มต้น เมื่อสลับแล้วให้กดปุ่ม "สลับบทบาทแล้ว"',
          goTo: 'start',
        },
      ],
    },
    {
      title: 'ใบงาน',
      items: [
        {
          id: 'worksheet',
          label: `กรอกใบงานครบถ้วน (ขณะนี้ ${worksheetProgress}%)`,
          done: worksheetProgress === 100,
          fixHint: 'ไปที่หน้า "ใบงานดิจิทัล" แล้วกรอกรายการที่ระบบแจ้งว่ายังไม่ครบ',
          goTo: 'worksheet',
        },
        {
          id: 'pdf',
          label: 'สร้างไฟล์ PDF แล้ว',
          done: Boolean(state.pdfGeneratedAt),
          fixHint: 'กดปุ่ม "สร้างและดาวน์โหลดใบงาน PDF" ด้านล่าง',
        },
      ],
    },
    {
      title: 'ผลงาน Construct 2',
      items: [
        {
          id: 'capx',
          label: 'แนบ/ตรวจสอบไฟล์ .capx แล้ว',
          done: Boolean(capxFile),
          fixHint: 'เลือกไฟล์ .capx ของกลุ่มในส่วน "ไฟล์ผลงาน Construct 2" ด้านล่าง',
        },
      ],
    },
  ];

  const allItems = groups.flatMap((g) => g.items);
  const doneCount = allItems.filter((i) => i.done).length;
  const notDone = allItems.filter((i) => !i.done);

  /* ---------- ไฟล์ .capx ---------- */

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.capx')) {
      notify('รับเฉพาะไฟล์นามสกุล .capx เท่านั้น กรุณาเลือกไฟล์ผลงานจาก Construct 2', 'error');
      return;
    }
    update({
      capxFile: {
        name: file.name,
        sizeBytes: file.size,
        attachedAt: new Date().toISOString(),
      },
    });
    notify(`บันทึกข้อมูลไฟล์ ${file.name} แล้ว อย่าลืมนำไฟล์จริงไปแนบใน Google Classroom`, 'success');
  };

  const removeFile = () => {
    update({ capxFile: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
    notify('ลบข้อมูลไฟล์ .capx ออกจากรายการแล้ว', 'info');
  };

  /* ---------- ปุ่มหลัก ---------- */

  const handleCheckReadiness = () => {
    setChecked(true);
    if (notDone.length === 0) {
      notify('ตรวจสอบครบทุกรายการแล้ว พร้อมส่งงานใน Google Classroom', 'success');
    } else {
      notify(`ยังไม่พร้อมส่ง เหลืออีก ${notDone.length} รายการที่ต้องดำเนินการ`, 'warn');
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(buildSubmissionText(state));
      notify('คัดลอกข้อความสำหรับส่งงานแล้ว นำไปวางในช่องความคิดเห็นส่วนตัวของ Classroom ได้เลย', 'success');
    } catch {
      notify('เบราว์เซอร์ไม่อนุญาตให้คัดลอกอัตโนมัติ กรุณาเลือกข้อความในกรอบแล้วกด Ctrl+C', 'warn');
    }
  };

  const submissionText = buildSubmissionText(state);

  if (state.session.deviceMode === 'assistant') {
    return <AssistantNotice page="หน้าสรุปและส่งงาน" />;
  }

  return (
    <div className="space-y-4">
      {printNode}

      {/* ---------- Checklist ---------- */}
      <Card
        title="ตรวจสอบความพร้อมก่อนส่งงาน"
        subtitle={`ดำเนินการแล้ว ${doneCount} จาก ${allItems.length} รายการ`}
        icon={<ShieldCheck className="h-5 w-5 text-mint-600" aria-hidden="true" />}
        actions={
          <Button variant="primary" onClick={handleCheckReadiness}>
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            ตรวจสอบความพร้อมก่อนส่ง
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <div key={group.title} className="rounded-xl border border-slate-200 p-3.5">
              <h3 className="mb-2 text-sm font-bold text-slate-800">{group.title}</h3>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <p
                      className={`flex items-start gap-2 text-sm leading-relaxed ${
                        item.done ? 'text-mint-800' : 'text-slate-600'
                      }`}
                    >
                      {item.done ? (
                        <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-mint-600" aria-hidden="true" />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" aria-hidden="true" />
                      )}
                      <span>
                        <span className="sr-only">{item.done ? 'ผ่านแล้ว: ' : 'ยังไม่ผ่าน: '}</span>
                        {item.label}
                      </span>
                    </p>
                    {checked && !item.done && (
                      <p className="ml-6 mt-1 text-xs leading-relaxed text-peach-800">
                        แนวทาง: {item.fixHint}
                        {item.goTo && (
                          <button
                            type="button"
                            onClick={() => onNavigate(item.goTo as TabId)}
                            className="ml-1 font-semibold text-brand-700 underline"
                          >
                            ไปที่หน้านั้น
                          </button>
                        )}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {checked && notDone.length === 0 && (
          <p className="mt-4 flex items-center gap-2 rounded-xl border border-mint-300 bg-mint-50 px-4 py-3 text-sm font-semibold text-mint-900">
            <CircleCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
            พร้อมส่งงานแล้ว อย่าลืมแนบทั้งไฟล์ PDF และไฟล์ .capx ใน Google Classroom
          </p>
        )}
      </Card>

      {/* ---------- ไฟล์ .capx ---------- */}
      <Card
        title="ไฟล์ผลงาน Construct 2 (.capx)"
        subtitle="ระบบเก็บเฉพาะรายละเอียดไฟล์ไว้ตรวจสอบ ไม่ได้อัปโหลดไฟล์ขึ้นเซิร์ฟเวอร์"
        icon={<FileArchive className="h-5 w-5 text-think-600" aria-hidden="true" />}
      >
        <div className="rounded-xl border border-lemon-300 bg-lemon-50 px-3.5 py-3 text-sm leading-relaxed text-peach-900">
          <strong>สำคัญ:</strong> ระบบนี้ไม่ได้ส่งไฟล์ให้ครูโดยตรง นักเรียนต้องเก็บไฟล์ .capx ไว้ในเครื่องของตนเอง
          แล้วนำไปแนบใน Google Classroom ด้วยตนเองพร้อมกับไฟล์ใบงาน PDF
        </div>

        <div className="mt-3">
          <label htmlFor="capx-input" className="mb-1.5 block text-sm font-medium text-slate-700">
            เลือกไฟล์ผลงาน (รับเฉพาะนามสกุล .capx)
          </label>
          <input
            id="capx-input"
            ref={fileInputRef}
            type="file"
            accept=".capx"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="block w-full cursor-pointer rounded-lg border border-slate-300 bg-white text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-l-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-700"
          />
        </div>

        {capxFile ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-mint-300 bg-mint-50 px-3.5 py-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-mint-900">
                <Upload className="h-4 w-4 shrink-0" aria-hidden="true" />
                {capxFile.name}
              </p>
              <p className="mt-0.5 text-xs text-mint-800">
                ขนาด {formatBytes(capxFile.sizeBytes)} | แนบเมื่อ {formatThaiDateTime(capxFile.attachedAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="inline-flex items-center gap-1 rounded-lg border border-mint-300 bg-white px-2.5 py-1.5 text-xs font-medium text-mint-800 hover:bg-mint-100"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              ลบรายการนี้
            </button>
          </div>
        ) : (
          <p className="mt-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-3.5 py-4 text-center text-xs text-slate-500">
            ยังไม่ได้เลือกไฟล์ .capx เมื่อบันทึกงานจาก Construct 2 แล้วให้กลับมาเลือกไฟล์ที่นี่
          </p>
        )}
      </Card>

      {/* ---------- ปุ่มส่งงาน ---------- */}
      <Card
        title="ส่งงานใน Google Classroom"
        subtitle="ดาวน์โหลดใบงานและคัดลอกข้อความ แล้วนำไปส่งใน Classroom ด้วยตนเอง"
        icon={<Send className="h-5 w-5 text-brand-600" aria-hidden="true" />}
      >
        <div className="flex flex-wrap gap-2.5">
          <Button variant="success" onClick={() => exportPdf()} disabled={busy}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-4 w-4" aria-hidden="true" />
            )}
            {busy ? 'กำลังสร้าง PDF...' : 'สร้างและดาวน์โหลดใบงาน PDF'}
          </Button>
          <Button variant="purple" onClick={handleCopyText}>
            <ClipboardCopy className="h-4 w-4" aria-hidden="true" />
            คัดลอกข้อความสำหรับส่งงาน
          </Button>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          ชื่อไฟล์ PDF ที่ระบบจะสร้าง:{' '}
          <span className="code-chip">{buildPdfFileName(pair.classroom, pair.pairCode)}</span>
          {state.pdfGeneratedAt && (
            <> | สร้างครั้งล่าสุดเมื่อ {formatThaiDateTime(state.pdfGeneratedAt)}</>
          )}
        </p>

        <div className="mt-4">
          <p className="mb-1.5 text-sm font-medium text-slate-700">ข้อความสำหรับส่งงาน (สร้างอัตโนมัติ)</p>
          <pre className="scroll-thin max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-[12.5px] leading-relaxed text-slate-700">
            {submissionText}
          </pre>
        </div>

        <div className="mt-4 rounded-2xl border-2 border-brand-200 bg-gradient-to-b from-brand-50 to-white p-4">
          <p className="mb-2 font-display text-sm font-bold text-brand-900">
            ขั้นตอนการส่งงานใน Google Classroom
          </p>
          <ol className="space-y-2">
            {[
              'กดปุ่มดาวน์โหลด PDF ด้านบน แล้วเก็บไฟล์ไว้ในเครื่อง',
              'เตรียมไฟล์ผลงาน .capx จาก Construct 2 ไว้ในโฟลเดอร์เดียวกัน',
              'เปิดแอปหรือเว็บ Google Classroom ของชั้นเรียนด้วยตนเอง แล้วเลือกงานที่ครูมอบหมาย',
              'กด "เพิ่มหรือสร้าง" แล้วแนบทั้งไฟล์ PDF และไฟล์ .capx',
              'วางข้อความสำหรับส่งงานในช่องความคิดเห็นส่วนตัว แล้วกด "ส่ง"',
            ].map((step, i) => (
              <li key={step} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-brand-400 to-brand-600 font-display text-xs font-bold text-white shadow-clay-sm">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </Card>
    </div>
  );
};
