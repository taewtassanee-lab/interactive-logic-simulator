import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Download,
  Eye,
  Loader2,
  Play,
  RefreshCw,
  Radio,
  Square,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { Button, Card, Pill } from '../Ui';
import { useToast } from '../Toast';
import { LIVE_ACTIVITIES, STEP_LABELS, TYPE_LABELS } from '../../data/liveActivities';
import {
  TEACHER_POLL_MS,
  clearLiveResponses,
  closeLiveActivity,
  fetchLiveResponses,
  startLiveActivity,
} from '../../utils/live';
import { LiveResultView, ResponderCounter, liveResponsesToCsv } from './TeacherViews';
import type { LiveActivityPreset, LiveResponse, LiveSession } from '../../types/live';
import type { ProgressRow } from '../../utils/sync';

interface Props {
  teacherKey: string;
  rows: ProgressRow[];
}

/** จำห้องที่ครูใช้ล่าสุด จะได้ไม่ต้องพิมพ์ใหม่ทุกคาบ */
const LAST_ROOM_KEY = 'ils_live_last_classroom';

const downloadCsv = (csv: string, name: string) => {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

export const TeacherLivePanel = ({ teacherKey, rows }: Props) => {
  const { notify } = useToast();

  /** ห้องเรียนทั้งหมดที่มีข้อมูลในระบบ ใช้ให้ครูเลือกโดยไม่ต้องพิมพ์เอง */
  const classrooms = useMemo(
    () => [...new Set(rows.map((r) => r.classroom).filter(Boolean))].sort(),
    [rows],
  );

  const [classroom, setClassroom] = useState(() => {
    try {
      return localStorage.getItem(LAST_ROOM_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [session, setSession] = useState<LiveSession | null>(null);
  const [responses, setResponses] = useState<LiveResponse[]>([]);
  const [busy, setBusy] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  // เลือกห้องแรกให้อัตโนมัติเมื่อข้อมูลมาถึง ครูจะได้ไม่ต้องกดเอง
  useEffect(() => {
    if (!classroom && classrooms.length) setClassroom(classrooms[0]);
  }, [classroom, classrooms]);

  // จำห้องล่าสุดไว้ เพราะกิจกรรมแรกของคาบเปิดก่อนที่นักเรียนจะกรอกข้อมูลคู่
  useEffect(() => {
    if (!classroom.trim()) return;
    try {
      localStorage.setItem(LAST_ROOM_KEY, classroom.trim());
    } catch {
      /* เบราว์เซอร์บางเครื่องปิด localStorage ไว้ ไม่กระทบการใช้งาน */
    }
  }, [classroom]);

  const preset: LiveActivityPreset | undefined = useMemo(
    () => LIVE_ACTIVITIES.find((a) => a.id === session?.presetId),
    [session?.presetId],
  );

  const refresh = useCallback(
    async (silent = false) => {
      if (!classroom || !teacherKey) return;
      if (!silent) setPolling(true);
      const res = await fetchLiveResponses(teacherKey, classroom, session?.activityId ?? '');
      setPolling(false);
      if (!res.ok) {
        setError(res.error ?? 'ดึงข้อมูลไม่สำเร็จ');
        return;
      }
      setError('');
      setResponses(res.data?.responses ?? []);
      if (res.data?.session) setSession(res.data.session);
    },
    [classroom, teacherKey, session?.activityId],
  );

  /** จอครูมีเครื่องเดียว จึงถามหาคำตอบใหม่ถี่ได้โดยไม่กระทบโควตา */
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  useEffect(() => {
    if (!session?.open || !classroom) return;
    const id = window.setInterval(() => void refreshRef.current(true), TEACHER_POLL_MS);
    return () => window.clearInterval(id);
  }, [session?.open, session?.activityId, classroom]);

  const open = async (p: LiveActivityPreset) => {
    if (!classroom.trim()) {
      notify('พิมพ์ชื่อห้องเรียนก่อนเปิดกิจกรรม เช่น ม.5/1', 'warn');
      return;
    }
    setBusy(true);
    setRevealed(false);
    const activityId = `${p.id}-${Date.now().toString(36)}`;
    const res = await startLiveActivity(teacherKey, {
      classroom,
      activityId,
      presetId: p.id,
      type: p.type,
      title: p.title,
      prompt: p.prompt,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? 'เปิดกิจกรรมไม่สำเร็จ');
      notify(res.error ?? 'เปิดกิจกรรมไม่สำเร็จ', 'error');
      return;
    }
    setError('');
    setSession(res.data?.session ?? null);
    setResponses([]);
    notify(`เปิดกิจกรรม "${p.title}" แล้ว บอกนักเรียนให้เข้าแท็บกิจกรรมสด`, 'success');
  };

  const close = async () => {
    if (!session) return;
    setBusy(true);
    const res = await closeLiveActivity(teacherKey, classroom);
    setBusy(false);
    if (!res.ok) {
      notify(res.error ?? 'ปิดรับคำตอบไม่สำเร็จ', 'error');
      return;
    }
    setSession({ ...session, open: false });
    setRevealed(true);
    void refresh(true);
    notify('ปิดรับคำตอบแล้ว คำตอบที่ส่งมายังแสดงอยู่บนจอ', 'success');
  };

  const clear = async () => {
    if (!session) return;
    setBusy(true);
    const res = await clearLiveResponses(teacherKey, classroom, session.activityId);
    setBusy(false);
    setConfirmClear(false);
    if (!res.ok) {
      notify(res.error ?? 'ลบคำตอบไม่สำเร็จ', 'error');
      return;
    }
    setResponses([]);
    notify('ลบคำตอบของกิจกรรมนี้แล้ว', 'success');
  };

  const grouped = useMemo(() => {
    const map = new Map<number, LiveActivityPreset[]>();
    LIVE_ACTIVITIES.forEach((a) => {
      map.set(a.step, [...(map.get(a.step) ?? []), a]);
    });
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, []);

  return (
    <div className="space-y-4">
      {/* ---------- แถบควบคุม ---------- */}
      <Card
        title="ห้องกิจกรรมสด"
        subtitle="เปิดกิจกรรมให้ทั้งห้องทำพร้อมกัน คำตอบขึ้นจอนี้ทันทีและเก็บลงชีตให้เอง"
        icon={<Radio className="h-5 w-5 text-bubble-600" aria-hidden="true" />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* ใช้ช่องพิมพ์ ไม่ใช่ช่องเลือก เพราะกิจกรรมแรกของคาบ (คลาวด์คำ อุ่นเครื่อง)
                เปิดก่อนที่นักเรียนจะกรอกข้อมูลคู่ ตอนนั้นระบบจึงยังไม่รู้จักห้องใด ๆ เลย */}
            <label className="flex items-center gap-2 text-sm text-slate-600">
              ห้องเรียน
              <input
                list="ils-classroom-options"
                value={classroom}
                placeholder="เช่น ม.5/1"
                onChange={(e) => {
                  setClassroom(e.target.value);
                  setSession(null);
                  setResponses([]);
                }}
                className="w-32 rounded-xl border-2 border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-700 outline-none focus:border-think-400 focus:ring-4 focus:ring-think-100"
              />
              <datalist id="ils-classroom-options">
                {classrooms.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
            <Button variant="secondary" disabled={polling} onClick={() => void refresh()}>
              {polling ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
              )}
              โหลดใหม่
            </Button>
          </div>
        }
      >
        {error && (
          <p className="mb-3 flex items-start gap-2 rounded-2xl border-2 border-bubble-200 bg-bubble-50 px-3.5 py-2.5 text-sm leading-relaxed text-bubble-900">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        {session ? (
          <div className="rounded-2xl border-2 border-brand-200 bg-gradient-to-b from-brand-50 to-white px-4 py-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={session.open ? 'mint' : 'slate'}>
                {session.open ? 'กำลังเปิดรับคำตอบ' : 'ปิดรับคำตอบแล้ว'}
              </Pill>
              <Pill tone="brand">{TYPE_LABELS[session.type] ?? session.type}</Pill>
              <ResponderCounter count={responses.length} />
            </div>
            <h3 className="mt-2 font-display text-lg font-bold text-slate-800">{session.title}</h3>
            <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{session.prompt}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {session.open ? (
                <Button variant="danger" disabled={busy} onClick={() => void close()}>
                  <Square className="h-4 w-4" aria-hidden="true" />
                  ปิดรับคำตอบ
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => setRevealed((v) => !v)}>
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  {revealed ? 'ซ่อนเฉลย' : 'แสดงเฉลย'}
                </Button>
              )}
              <Button
                variant="secondary"
                disabled={responses.length === 0}
                onClick={() =>
                  downloadCsv(
                    liveResponsesToCsv(responses),
                    `กิจกรรมสด_${session.presetId}_${classroom}.csv`,
                  )
                }
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                ดาวน์โหลด CSV
              </Button>
              {confirmClear ? (
                <span className="flex items-center gap-2 rounded-2xl border-2 border-bubble-200 bg-bubble-50 px-3 py-1.5">
                  <span className="text-sm font-semibold text-bubble-900">
                    ลบคำตอบทั้งหมดของกิจกรรมนี้?
                  </span>
                  <Button variant="danger" disabled={busy} onClick={() => void clear()}>
                    ลบเลย
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirmClear(false)}>
                    ยกเลิก
                  </Button>
                </span>
              ) : (
                <Button
                  variant="ghost"
                  disabled={responses.length === 0}
                  onClick={() => setConfirmClear(true)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  ล้างคำตอบ
                </Button>
              )}
            </div>
          </div>
        ) : (
          <p className="rounded-2xl border-2 border-dashed border-think-200 bg-think-50/70 px-3.5 py-3 text-sm leading-relaxed text-think-900">
            ยังไม่ได้เปิดกิจกรรม เลือกกิจกรรมจากรายการด้านล่างแล้วกด &quot;เปิดกิจกรรม&quot;
            จากนั้นบอกนักเรียนให้เข้าแท็บ <strong>กิจกรรมสด</strong> บนไอแพดของตัวเอง
          </p>
        )}
      </Card>

      {/* ---------- ผลลัพธ์บนจอหน้าชั้น ---------- */}
      {session && preset && (
        <Card
          title="ผลลัพธ์บนจอหน้าชั้น"
          subtitle={
            session.open
              ? `อัปเดตอัตโนมัติทุก ${TEACHER_POLL_MS / 1000} วินาที`
              : 'ปิดรับคำตอบแล้ว ผลด้านล่างคือผลสุดท้าย'
          }
          icon={<Radio className="h-5 w-5 text-mint-600" aria-hidden="true" />}
        >
          <LiveResultView
            preset={preset}
            responses={responses}
            teacherKey={teacherKey}
            revealed={revealed}
          />
        </Card>
      )}

      {/* ---------- คลังกิจกรรม ---------- */}
      <Card
        title="คลังกิจกรรมตามขั้น GPAS 5 Steps"
        subtitle="กดเปิดได้ทันที ไม่ต้องพิมพ์โจทย์สดหน้าชั้น"
        icon={<Play className="h-5 w-5 text-brand-600" aria-hidden="true" />}
      >
        <div className="space-y-4">
          {grouped.map(([step, items]) => (
            <section key={step}>
              <h3 className="mb-2 font-display text-sm font-bold text-slate-600">
                {STEP_LABELS[step]}
              </h3>
              <div className="grid gap-2.5 md:grid-cols-2">
                {items.map((a) => {
                  const active = session?.presetId === a.id && session.open;
                  return (
                    <div
                      key={a.id}
                      className={`rounded-2xl border-2 px-3.5 py-3 ${
                        active
                          ? 'border-mint-300 bg-mint-50/70'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="mb-1 flex flex-wrap items-center gap-1.5">
                        <Pill tone="think">{TYPE_LABELS[a.type]}</Pill>
                        {active && <Pill tone="mint">กำลังเปิดอยู่</Pill>}
                      </div>
                      <h4 className="font-display text-sm font-bold text-slate-800">{a.title}</h4>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                        {a.teacherNote}
                      </p>
                      <Button
                        variant={active ? 'secondary' : 'primary'}
                        className="mt-2.5"
                        disabled={busy || !classroom.trim()}
                        onClick={() => void open(a)}
                      >
                        <Play className="h-4 w-4" aria-hidden="true" />
                        {active ? 'เปิดใหม่อีกครั้ง' : 'เปิดกิจกรรม'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </Card>
    </div>
  );
};
