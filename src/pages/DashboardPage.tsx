import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CircleCheck,
  Circle,
  Download,
  KeyRound,
  LayoutDashboard,
  Loader2,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  TriangleAlert,
  Users,
  X,
} from 'lucide-react';
import { useToast } from '../components/Toast';
import { Button, Card, EmptyState, Pill, ProgressBar } from '../components/Ui';
import { formatThaiDateTime } from '../utils/format';
import {
  deletePairRow,
  fetchDashboard,
  isSyncEnabled,
  rowsToCsv,
  type ProgressRow,
} from '../utils/sync';

const TEACHER_KEY_STORAGE = 'ils_teacher_key';
const AUTO_REFRESH_MS = 30000;

/** ตัวเลขสรุปหนึ่งช่อง */
const StatTile = ({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone: 'brand' | 'mint' | 'bubble' | 'think';
}) => {
  const tones: Record<string, string> = {
    brand: 'from-brand-50 to-white border-brand-200 text-brand-700',
    mint: 'from-mint-50 to-white border-mint-200 text-mint-700',
    bubble: 'from-bubble-50 to-white border-bubble-200 text-bubble-700',
    think: 'from-think-50 to-white border-think-200 text-think-700',
  };
  return (
    <div className={`rounded-[1.25rem] border-2 bg-gradient-to-b p-3.5 shadow-clay-sm ${tones[tone]}`}>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="font-display text-3xl font-bold leading-tight">{value}</p>
      {sub && <p className="text-[11.5px] text-slate-500">{sub}</p>}
    </div>
  );
};

const YesNo = ({ ok, yes, no }: { ok: boolean; yes: string; no: string }) => (
  <span
    className={`inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold ${
      ok ? 'text-mint-700' : 'text-slate-400'
    }`}
  >
    {ok ? (
      <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" />
    ) : (
      <Circle className="h-3.5 w-3.5" aria-hidden="true" />
    )}
    {ok ? yes : no}
  </span>
);

export const DashboardPage = () => {
  const { notify } = useToast();
  const [teacherKey, setTeacherKey] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [rows, setRows] = useState<ProgressRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastLoadedAt, setLastLoadedAt] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [keyword, setKeyword] = useState('');
  /** แถวที่กำลังรอการยืนยันลบ null = ไม่มีหน้าต่างยืนยันเปิดอยู่ */
  const [pendingDelete, setPendingDelete] = useState<ProgressRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const timerRef = useRef<number | null>(null);

  const configured = isSyncEnabled();

  const load = useCallback(
    async (key: string, silent = false) => {
      if (!silent) setLoading(true);
      const res = await fetchDashboard(key);
      setLoading(false);
      if (!res.ok) {
        setError(res.error ?? 'โหลดข้อมูลไม่สำเร็จ');
        if (!silent) notify(res.error ?? 'โหลดข้อมูลไม่สำเร็จ', 'error');
        return false;
      }
      setError('');
      setRows(res.rows);
      setLastLoadedAt(new Date());
      return true;
    },
    [notify],
  );

  // จำรหัสครูไว้ในเครื่องของครูเอง เปิดแท็บครั้งต่อไปไม่ต้องพิมพ์ใหม่
  useEffect(() => {
    if (!configured) return;
    try {
      const saved = localStorage.getItem(TEACHER_KEY_STORAGE);
      if (saved) {
        setTeacherKey(saved);
        void load(saved, true).then((ok) => setUnlocked(ok));
      }
    } catch {
      /* เบราว์เซอร์ปิด localStorage ให้กรอกรหัสใหม่ทุกครั้ง */
    }
  }, [configured, load]);

  // รีเฟรชอัตโนมัติระหว่างสอน
  useEffect(() => {
    if (!unlocked || !autoRefresh) return;
    timerRef.current = window.setInterval(() => void load(teacherKey, true), AUTO_REFRESH_MS);
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, [unlocked, autoRefresh, teacherKey, load]);

  const handleUnlock = async () => {
    if (!teacherKey.trim()) {
      notify('กรุณากรอกรหัสครูก่อนเปิดแดชบอร์ด', 'warn');
      return;
    }
    const ok = await load(teacherKey.trim());
    if (ok) {
      setUnlocked(true);
      try {
        localStorage.setItem(TEACHER_KEY_STORAGE, teacherKey.trim());
      } catch {
        /* จำรหัสไม่ได้ก็ใช้งานต่อได้ */
      }
      notify('เปิดแดชบอร์ดเรียบร้อย', 'success');
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    const res = await deletePairRow(teacherKey, pendingDelete.classroom, pendingDelete.pairCode);
    setDeleting(false);

    if (!res.ok) {
      notify(res.error ?? 'ลบข้อมูลไม่สำเร็จ', 'error');
      return;
    }

    // ตัดแถวออกจากตารางทันที ไม่ต้องรอโหลดใหม่ แล้วค่อยดึงข้อมูลจริงมายืนยัน
    setRows((prev) =>
      prev.filter(
        (r) =>
          !(r.classroom === pendingDelete.classroom && r.pairCode === pendingDelete.pairCode),
      ),
    );
    notify(`ลบข้อมูลของคู่ ${pendingDelete.pairCode} เรียบร้อยแล้ว`, 'success');
    setPendingDelete(null);
    void load(teacherKey, true);
  };

  const handleExport = () => {
    const csv = rowsToCsv(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ผลกิจกรรม_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify('ดาวน์โหลดไฟล์ CSV เรียบร้อย เปิดด้วย Excel ได้เลย', 'success');
  };

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    const list = k
      ? rows.filter((r) =>
          [r.classroom, r.pairCode, r.driverName, r.navigatorName]
            .join(' ')
            .toLowerCase()
            .includes(k),
        )
      : rows;
    return [...list].sort(
      (a, b) =>
        a.classroom.localeCompare(b.classroom, 'th') ||
        a.pairCode.localeCompare(b.pairCode, 'th'),
    );
  }, [rows, keyword]);

  const stats = useMemo(() => {
    const total = rows.length;
    const m1 = rows.filter((r) => r.mission1Passed).length;
    const m2 = rows.filter((r) => r.mission2Passed).length;
    const both = rows.filter((r) => r.mission1Passed && r.mission2Passed).length;
    const done = rows.filter((r) => r.worksheetPercent === 100).length;
    const pdf = rows.filter((r) => r.pdfGenerated).length;
    const capx = rows.filter((r) => r.capxFileName).length;
    const avgWorksheet = total
      ? Math.round(rows.reduce((sum, r) => sum + r.worksheetPercent, 0) / total)
      : 0;
    return { total, m1, m2, both, done, pdf, capx, avgWorksheet };
  }, [rows]);

  const pct = (n: number) => (stats.total ? Math.round((n / stats.total) * 100) : 0);

  /* ---------- ยังไม่ได้ตั้งค่าที่เก็บข้อมูล ---------- */
  if (!configured) {
    return (
      <Card
        title="แดชบอร์ดสรุปผลของครู"
        subtitle="ยังไม่ได้ตั้งค่าที่เก็บข้อมูลกลาง"
        icon={<LayoutDashboard className="h-5 w-5 text-brand-600" aria-hidden="true" />}
      >
        <div className="rounded-2xl border-2 border-lemon-200 bg-gradient-to-b from-lemon-50 to-white p-4">
          <p className="mb-2 flex items-center gap-2 font-display text-sm font-bold text-peach-900">
            <Settings className="h-4 w-4" aria-hidden="true" />
            ต้องเชื่อมต่อ Google Sheets ก่อนจึงจะเห็นข้อมูลนักเรียน
          </p>
          <p className="text-sm leading-relaxed text-slate-600">
            ขณะนี้ระบบเก็บข้อมูลไว้ในเบราว์เซอร์ของนักเรียนแต่ละเครื่องเท่านั้น
            เครื่องของครูจึงยังมองไม่เห็นข้อมูลของคู่อื่น
            เมื่อเชื่อมต่อ Google Sheets แล้ว หน้านี้จะแสดงความก้าวหน้าของทุกคู่แบบอัตโนมัติ
          </p>
        </div>

        <ol className="mt-4 space-y-2">
          {[
            'สร้าง Google Sheet ใหม่ 1 ไฟล์ สำหรับเก็บผลกิจกรรม',
            'เปิดเมนู ส่วนขยาย > Apps Script แล้ววางโค้ดจากไฟล์ apps-script/Code.gs ทับทั้งหมด',
            'แก้รหัส CLASS_SECRET และ TEACHER_KEY ในโค้ดให้เป็นรหัสของคุณเอง',
            'กด Deploy > New deployment > เลือก Web app > Execute as: Me > Who has access: Anyone',
            'คัดลอก URL ที่ได้ ไปใส่ใน src/config.ts ที่ SYNC_CONFIG.endpoint และใส่ classSecret ให้ตรงกัน',
            'commit และ push โค้ด เว็บจะอัปเดตเอง แล้วกลับมาที่หน้านี้อีกครั้ง',
          ].map((step, i) => (
            <li
              key={step}
              className="flex items-start gap-2.5 rounded-2xl border-2 border-slate-100 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-700"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-brand-400 to-brand-600 font-display text-xs font-bold text-white">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          ขั้นตอนแบบละเอียดพร้อมภาพประกอบอยู่ในไฟล์{' '}
          <span className="code-chip">docs/คู่มือติดตั้งแดชบอร์ด.md</span> ของโปรเจกต์
        </p>
      </Card>
    );
  }

  /* ---------- ยังไม่ได้ปลดล็อกด้วยรหัสครู ---------- */
  if (!unlocked) {
    return (
      <Card
        title="แดชบอร์ดสรุปผลของครู"
        subtitle="กรอกรหัสครูเพื่อเปิดดูข้อมูลนักเรียนทั้งห้อง"
        icon={<KeyRound className="h-5 w-5 text-brand-600" aria-hidden="true" />}
      >
        <div className="mx-auto max-w-md">
          <label htmlFor="teacher-key" className="mb-1.5 block text-sm font-semibold text-slate-700">
            รหัสครู (ค่า TEACHER_KEY ที่ตั้งไว้ในไฟล์ Code.gs)
          </label>
          <div className="flex gap-2">
            <input
              id="teacher-key"
              type="password"
              value={teacherKey}
              onChange={(e) => setTeacherKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void handleUnlock()}
              placeholder="กรอกรหัสครู"
              className="w-full rounded-2xl border-2 border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            />
            <Button onClick={() => void handleUnlock()} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <KeyRound className="h-4 w-4" aria-hidden="true" />
              )}
              เปิดดู
            </Button>
          </div>
          {error && (
            <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-bubble-700">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            หน้านี้สำหรับครูผู้สอนเท่านั้น นักเรียนที่ไม่มีรหัสจะเปิดดูข้อมูลของคู่อื่นไม่ได้
            ระบบจะจำรหัสไว้ในเบราว์เซอร์ของเครื่องนี้ เพื่อไม่ต้องพิมพ์ใหม่ทุกครั้ง
          </p>
        </div>
      </Card>
    );
  }

  /* ---------- แดชบอร์ด ---------- */
  return (
    <div className="space-y-4">
      <Card
        title="แดชบอร์ดสรุปผลการทำกิจกรรม"
        subtitle={
          lastLoadedAt
            ? `ข้อมูลล่าสุดเมื่อ ${formatThaiDateTime(lastLoadedAt)}`
            : 'กำลังโหลดข้อมูล'
        }
        icon={<LayoutDashboard className="h-5 w-5 text-brand-600" aria-hidden="true" />}
        actions={
          <>
            <Button variant="secondary" onClick={() => void load(teacherKey)} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
              )}
              รีเฟรช
            </Button>
            <Button variant="success" onClick={handleExport} disabled={filtered.length === 0}>
              <Download className="h-4 w-4" aria-hidden="true" />
              ดาวน์โหลด CSV
            </Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="จำนวนคู่ที่เริ่มกิจกรรม" value={stats.total} tone="brand" sub="คู่" />
          <StatTile
            label="ผ่านภารกิจที่ 1 (สุ่มข้อสอบ)"
            value={`${pct(stats.m1)}%`}
            sub={`${stats.m1} จาก ${stats.total} คู่`}
            tone="mint"
          />
          <StatTile
            label="ผ่านภารกิจที่ 2 (เงื่อนไขจบเกม)"
            value={`${pct(stats.m2)}%`}
            sub={`${stats.m2} จาก ${stats.total} คู่`}
            tone="think"
          />
          <StatTile
            label="ได้เหรียญ Logic Master"
            value={`${pct(stats.both)}%`}
            sub={`${stats.both} จาก ${stats.total} คู่`}
            tone="bubble"
          />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border-2 border-slate-100 bg-white p-3.5">
            <ProgressBar percent={stats.avgWorksheet} label="ใบงานเฉลี่ยทั้งห้อง" />
          </div>
          <div className="rounded-2xl border-2 border-slate-100 bg-white p-3.5">
            <ProgressBar percent={pct(stats.pdf)} label="สร้างไฟล์ PDF แล้ว" />
          </div>
          <div className="rounded-2xl border-2 border-slate-100 bg-white p-3.5">
            <ProgressBar percent={pct(stats.capx)} label="แนบไฟล์ .capx แล้ว" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-4 w-4 accent-brand-600"
            />
            รีเฟรชอัตโนมัติทุก 30 วินาที
          </label>
          <div className="relative min-w-[220px] flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <label htmlFor="dash-search" className="sr-only">
              ค้นหาด้วยห้องเรียน รหัสคู่ หรือชื่อนักเรียน
            </label>
            <input
              id="dash-search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="ค้นหา ห้องเรียน รหัสคู่ หรือชื่อนักเรียน"
              className="w-full rounded-2xl border-2 border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            />
          </div>
        </div>
      </Card>

      <Card
        title={`รายละเอียดรายคู่ (${filtered.length} คู่)`}
        icon={<Users className="h-5 w-5 text-think-600" aria-hidden="true" />}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="h-9 w-9" aria-hidden="true" />}
            title={rows.length === 0 ? 'ยังไม่มีคู่ใดเริ่มกิจกรรม' : 'ไม่พบคู่ที่ค้นหา'}
            description={
              rows.length === 0
                ? 'เมื่อนักเรียนกรอกข้อมูลและกดเริ่มกิจกรรม ข้อมูลจะขึ้นที่นี่ภายในไม่กี่วินาที'
                : 'ลองพิมพ์คำค้นใหม่ หรือล้างช่องค้นหาเพื่อดูทุกคู่'
            }
          />
        ) : (
          <div className="scroll-thin -mx-1 overflow-x-auto px-1">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200 text-left">
                  {['ห้อง', 'รหัสคู่', 'Driver', 'Navigator', 'ภารกิจ 1', 'ภารกิจ 2', 'คะแนน', 'ใบงาน', 'PDF', '.capx', 'สลับบทบาท', 'อัปเดต', 'ลบ'].map(
                    (h) => (
                      <th key={h} className="whitespace-nowrap px-2.5 py-2 text-xs font-bold text-slate-600">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const complete = r.mission1Passed && r.mission2Passed;
                  return (
                    <tr
                      key={`${r.classroom}-${r.pairCode}`}
                      className={`border-b border-slate-100 transition hover:bg-brand-50/50 ${
                        complete ? 'bg-mint-50/40' : ''
                      }`}
                    >
                      <td className="whitespace-nowrap px-2.5 py-2 text-slate-600">{r.classroom}</td>
                      <td className="whitespace-nowrap px-2.5 py-2">
                        <Pill tone={complete ? 'mint' : 'slate'}>{r.pairCode}</Pill>
                      </td>
                      <td className="px-2.5 py-2 text-slate-700">
                        {r.driverName}
                        {r.driverNumber && (
                          <span className="text-xs text-slate-400"> (เลขที่ {r.driverNumber})</span>
                        )}
                      </td>
                      <td className="px-2.5 py-2 text-slate-700">
                        {r.navigatorName}
                        {r.navigatorNumber && (
                          <span className="text-xs text-slate-400"> (เลขที่ {r.navigatorNumber})</span>
                        )}
                      </td>
                      <td className="px-2.5 py-2">
                        <YesNo ok={r.mission1Passed} yes="ผ่าน" no="ยังไม่ผ่าน" />
                      </td>
                      <td className="px-2.5 py-2">
                        <YesNo ok={r.mission2Passed} yes="ผ่าน" no="ยังไม่ผ่าน" />
                      </td>
                      <td className="px-2.5 py-2 text-center font-mono font-semibold text-slate-700">
                        {r.bestScore}
                      </td>
                      <td className="px-2.5 py-2">
                        <span
                          className={`font-mono text-xs font-bold ${
                            r.worksheetPercent === 100 ? 'text-mint-700' : 'text-slate-500'
                          }`}
                        >
                          {r.worksheetPercent}%
                        </span>
                      </td>
                      <td className="px-2.5 py-2">
                        <YesNo ok={r.pdfGenerated} yes="แล้ว" no="ยัง" />
                      </td>
                      <td className="max-w-[160px] truncate px-2.5 py-2 text-xs text-slate-600">
                        {r.capxFileName || <span className="text-slate-400">ยังไม่แนบ</span>}
                      </td>
                      <td className="px-2.5 py-2 text-center text-slate-600">{r.roleSwitchCount}</td>
                      <td className="whitespace-nowrap px-2.5 py-2 text-xs text-slate-500">
                        {r.updatedAt
                          ? new Date(r.updatedAt).toLocaleTimeString('th-TH', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </td>
                      <td className="px-2.5 py-2">
                        <button
                          type="button"
                          onClick={() => setPendingDelete(r)}
                          className="rounded-xl border-2 border-bubble-200 bg-white p-1.5 text-bubble-500 transition hover:-translate-y-0.5 hover:bg-bubble-50 hover:text-bubble-700"
                          aria-label={`ลบข้อมูลของคู่ ${r.pairCode} ห้อง ${r.classroom}`}
                          title="ลบข้อมูลของคู่นี้"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ---------- หน้าต่างยืนยันก่อนลบ ---------- */}
      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
        >
          <div className="clay-card w-full max-w-md animate-pop p-5">
            <div className="mb-3 flex items-start justify-between gap-3">
              <h2 id="delete-title" className="font-display text-lg font-bold text-slate-800">
                ยืนยันการลบข้อมูล
              </h2>
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
                className="rounded-xl p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="ปิดหน้าต่างยืนยัน"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <p className="text-sm leading-relaxed text-slate-600">
              จะลบข้อมูลของคู่นี้ออกจาก Google Sheets อย่างถาวร
            </p>

            <dl className="mt-3 space-y-1 rounded-2xl border-2 border-slate-100 bg-slate-50 px-3.5 py-3 text-sm">
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-slate-500">ห้องเรียน</dt>
                <dd className="font-semibold text-slate-800">{pendingDelete.classroom}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-slate-500">รหัสคู่</dt>
                <dd className="font-semibold text-slate-800">{pendingDelete.pairCode}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-slate-500">Driver</dt>
                <dd className="text-slate-700">{pendingDelete.driverName || '-'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-slate-500">Navigator</dt>
                <dd className="text-slate-700">{pendingDelete.navigatorName || '-'}</dd>
              </div>
            </dl>

            <p className="mt-3 rounded-2xl border-2 border-lemon-200 bg-lemon-50 px-3.5 py-2.5 text-xs leading-relaxed text-peach-900">
              การลบนี้ย้อนกลับไม่ได้ และหากคู่นี้ยังเปิดเว็บทำกิจกรรมอยู่ ข้อมูลจะถูกส่งกลับเข้ามาใหม่
              เมื่อเขาทำอะไรต่อ
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
              >
                ยกเลิก
              </Button>
              <Button variant="danger" onClick={() => void handleConfirmDelete()} disabled={deleting}>
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                )}
                {deleting ? 'กำลังลบ...' : 'ยืนยันลบ'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
