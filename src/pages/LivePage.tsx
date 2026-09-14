import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CircleCheck,
  Hand,
  Loader2,
  PencilLine,
  RefreshCw,
  Radio,
  TriangleAlert,
  UserRound,
} from 'lucide-react';
import { Button, Card, Pill, TextField } from '../components/Ui';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { StudentAnswerForm, type AnswerDraft } from '../components/live/StudentForms';
import { getPreset, TYPE_LABELS } from '../data/liveActivities';
import { useSettings } from '../context/SettingsContext';
import { applyOverrides } from '../utils/activityOverrides';
import {
  STUDENT_IDLE_POLL_MS,
  STUDENT_POLL_MS,
  isLiveEnabled,
  normalizeRoom,
  loadIdentity,
  pollLiveSession,
  saveIdentity,
  submitLiveResponse,
} from '../utils/live';
import type { LiveIdentity, LiveSession } from '../types/live';

/**
 * หน้ากิจกรรมสดของนักเรียน
 *
 * ใช้ได้ทั้งบนเครื่อง Driver และไอแพดเครื่อง Navigator เพราะกิจกรรมสดเป็นการตอบรายบุคคล
 * ไม่ใช่ข้อมูลของคู่ จึงไม่ทำให้ข้อมูลในชีตของคู่เขียนทับกัน
 *
 * เครื่องนักเรียนจะถามหากิจกรรมใหม่เฉพาะตอนยังไม่ได้ตอบเท่านั้น
 * เพื่อประหยัดโควตาการประมวลผลของ Apps Script เมื่อเปิดพร้อมกันทั้งห้อง
 */
export const LivePage = () => {
  const { state } = useApp();
  const { notify } = useToast();
  const { settings } = useSettings();

  const [identity, setIdentity] = useState<LiveIdentity | null>(() => loadIdentity());
  const [draftId, setDraftId] = useState<LiveIdentity>(() => ({
    classroom: loadIdentity()?.classroom || state.pair.classroom,
    studentName: loadIdentity()?.studentName || '',
    studentNumber: loadIdentity()?.studentNumber || '',
    pairCode: loadIdentity()?.pairCode || state.pair.pairCode,
  }));

  const [session, setSession] = useState<LiveSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  /** จำนวนครั้งที่ตรวจไม่ผ่านติดกัน ใช้กันไม่ให้เน็ตสะดุดครั้งเดียวขึ้นข้อความแดงทันที */
  const [misses, setMisses] = useState(0);
  /** รหัสกิจกรรมที่ตอบไปแล้วบนเครื่องนี้ ใช้ตัดสินว่าจะแสดงฟอร์มหรือหน้าขอบคุณ */
  const [answeredId, setAnsweredId] = useState('');
  const [editing, setEditing] = useState(false);

  /** เวลาที่เริ่มเห็นโจทย์ ใช้คำนวณเวลาที่ใช้ตอบเพื่อจัดอันดับ */
  const startedAt = useRef(Date.now());
  /** เวลาที่ตรวจหากิจกรรมล่าสุด แสดงบนหน้าจอให้นักเรียนเห็นว่าระบบยังทำงานอยู่ */
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  /** ลำดับคำขอ ใช้ทิ้งผลที่มาถึงช้ากว่าคำขอที่ใหม่กว่า กันกิจกรรมเก่าย้อนกลับมาทับ */
  const reqSeq = useRef(0);

  const basePreset = session ? getPreset(session.presetId) : undefined;
  // ใช้ชื่อและโจทย์ที่ครูแก้ไว้ในหน้าตั้งค่าระบบ ถ้าไม่ได้แก้จะได้ข้อความตั้งต้น
  const preset = basePreset ? applyOverrides(basePreset, settings) : undefined;
  const answered = Boolean(session && answeredId === session.activityId);
  const showForm = Boolean(session?.open && preset && (!answered || editing));

  const check = useCallback(
    async (manual = false) => {
      if (!identity?.classroom) return;
      // แสดงวงหมุนเฉพาะตอนนักเรียนกดเอง รอบอัตโนมัติทำเงียบ ๆ ไม่ให้จอกระพริบ
      if (manual) setLoading(true);
      const mySeq = (reqSeq.current += 1);
      const res = await pollLiveSession(identity.classroom);
      if (mySeq !== reqSeq.current) return;
      setLoading(false);
      if (!res.ok) {
        /**
         * รอบตรวจอัตโนมัติพลาดครั้งสองครั้งเป็นเรื่องปกติของเน็ตโรงเรียน
         * จึงขึ้นข้อความแดงเมื่อพลาดติดกันตั้งแต่ 3 ครั้ง (ราวครึ่งนาที) หรือเมื่อนักเรียนกดเอง
         * ไม่งั้นจะขึ้นเตือนทั้งที่รอบถัดไปก็ต่อติดแล้ว ทำให้เข้าใจผิดว่าระบบเสีย
         */
        setMisses((n) => {
          const next = n + 1;
          if (manual || next >= 3) setError(res.error ?? 'ตรวจสอบกิจกรรมไม่สำเร็จ');
          return next;
        });
        return;
      }
      setCheckedAt(new Date());
      setMisses(0);
      setError('');
      const next = res.data?.session ?? null;
      setSession((prev) => {
        if (next && next.activityId !== prev?.activityId) {
          // เจอกิจกรรมใหม่ เริ่มจับเวลาตอบใหม่
          startedAt.current = Date.now();
        }
        return next;
      });
    },
    [identity?.classroom],
  );

  const checkRef = useRef(check);
  checkRef.current = check;

  // ถามครั้งแรกทันทีที่รู้ว่าเป็นใคร
  useEffect(() => {
    if (identity?.classroom) void checkRef.current(true);
  }, [identity?.classroom]);

  /**
   * ตรวจหากิจกรรมใหม่ตลอดเวลาที่เปิดหน้านี้อยู่ ไม่มีการหยุดเองเงียบ ๆ
   * ตอนยังไม่ได้ตอบจะถามถี่เพราะนักเรียนกำลังรอโจทย์
   * ตอบแล้วยังถามต่อแต่ห่างขึ้น เพื่อให้กิจกรรมถัดไปที่ครูเปิดเด้งขึ้นเองโดยไม่ต้องกดปุ่ม
   */
  useEffect(() => {
    if (!identity?.classroom) return;
    // หยุดตรวจระหว่างกำลังส่งคำตอบ ไม่ให้สองคำขอแย่งช่องสัญญาณกันจนคำตอบส่งไม่ผ่าน
    if (sending) return;
    const every = answered ? STUDENT_IDLE_POLL_MS : STUDENT_POLL_MS;
    const id = window.setInterval(() => {
      // แท็บถูกซ่อนอยู่ไม่ต้องถาม แล้วค่อยไล่ให้ทันตอนกลับมา
      if (document.hidden) return;
      void checkRef.current();
    }, every);
    return () => window.clearInterval(id);
  }, [identity?.classroom, answered, sending]);

  // กลับมาที่แท็บนี้เมื่อไร ตรวจให้ทันทีโดยไม่ต้องรอรอบถัดไป
  useEffect(() => {
    if (!identity?.classroom) return;
    const onVisible = () => {
      if (!document.hidden) void checkRef.current();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [identity?.classroom]);

  const send = async (draft: AnswerDraft) => {
    if (!session || !identity) return;
    setSending(true);
    setError('');
    const res = await submitLiveResponse(
      {
        activityId: session.activityId,
        classroom: identity.classroom,
        studentName: identity.studentName,
        studentNumber: identity.studentNumber,
        pairCode: identity.pairCode,
        answer: draft.answer,
        score: draft.score,
        total: draft.total,
        seconds: Math.round((Date.now() - startedAt.current) / 1000),
      },
      draft.image,
    );
    setSending(false);
    if (!res.ok) {
      const why = res.error ?? 'ส่งคำตอบไม่สำเร็จ';
      setError(`ส่งคำตอบไม่สำเร็จ: ${why} คำตอบที่เลือกไว้ยังอยู่ กดปุ่มส่งซ้ำได้เลย`);
      notify('ส่งคำตอบไม่สำเร็จ กดส่งอีกครั้งได้เลย', 'error');
      return;
    }
    setError('');
    setAnsweredId(session.activityId);
    setEditing(false);
    notify('ส่งคำตอบเรียบร้อยแล้ว', 'success');
  };

  /* ---------- ยังไม่ได้ตั้งค่าที่เก็บข้อมูล ---------- */
  if (!isLiveEnabled()) {
    return (
      <Card
        title="กิจกรรมสดยังไม่พร้อมใช้งาน"
        subtitle="ต้องตั้งค่าที่เก็บข้อมูลก่อน"
        icon={<Radio className="h-5 w-5 text-slate-400" aria-hidden="true" />}
      >
        <p className="text-sm leading-relaxed text-slate-600">
          ระบบยังไม่ได้เชื่อมต่อกับที่เก็บข้อมูลของครู จึงยังรับคำตอบกิจกรรมสดไม่ได้
          ให้ครูตั้งค่าตามคู่มือติดตั้งแดชบอร์ดก่อน
        </p>
      </Card>
    );
  }

  /* ---------- ยังไม่รู้ว่าเป็นใคร ---------- */
  if (!identity) {
    const ready = draftId.classroom.trim() && draftId.studentName.trim();
    return (
      <Card
        title="เข้าร่วมกิจกรรมสด"
        subtitle="กรอกครั้งเดียว เครื่องนี้จะจำไว้ให้ตลอดคาบ"
        icon={<UserRound className="h-5 w-5 text-brand-600" aria-hidden="true" />}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            label="ห้องเรียน"
            required
            value={draftId.classroom}
            onChange={(v) => setDraftId({ ...draftId, classroom: v })}
            placeholder="เช่น ม.5/1"
            hint="ต้องตรงกับห้องที่ครูเลือกไว้บนจอหน้าชั้น"
          />
          <TextField
            label="ชื่อ-สกุลของฉัน"
            required
            value={draftId.studentName}
            onChange={(v) => setDraftId({ ...draftId, studentName: v })}
            placeholder="เช่น สมชาย ใจดี"
          />
          <TextField
            label="เลขที่"
            value={draftId.studentNumber}
            onChange={(v) => setDraftId({ ...draftId, studentNumber: v })}
            inputMode="numeric"
            placeholder="เช่น 12"
          />
          <TextField
            label="รหัสคู่ (ถ้ามี)"
            value={draftId.pairCode}
            onChange={(v) => setDraftId({ ...draftId, pairCode: v })}
            placeholder="เช่น Pair01"
          />
        </div>
        <Button
          variant="primary"
          className="mt-4"
          disabled={!ready}
          onClick={() => {
            const clean: LiveIdentity = {
              classroom: draftId.classroom.trim(),
              studentName: draftId.studentName.trim(),
              studentNumber: draftId.studentNumber.trim(),
              pairCode: draftId.pairCode.trim(),
            };
            saveIdentity(clean);
            setIdentity(clean);
          }}
        >
          <Hand className="h-4 w-4" aria-hidden="true" />
          เข้าร่วมกิจกรรม
        </Button>
      </Card>
    );
  }

  /* ---------- เข้าร่วมแล้ว ---------- */
  return (
    <div className="space-y-4">
      <Card
        title="กิจกรรมสด"
        subtitle={`${identity.studentName} · ห้อง ${identity.classroom}`}
        icon={<Radio className="h-5 w-5 text-bubble-600" aria-hidden="true" />}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" disabled={loading} onClick={() => void check(true)}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
              )}
              ดูกิจกรรมล่าสุด
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setIdentity(null);
                setSession(null);
                setAnsweredId('');
              }}
            >
              เปลี่ยนชื่อผู้ตอบ
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

        {/* บอกให้เห็นชัดว่าระบบยังตรวจหากิจกรรมอยู่ตลอด ไม่ได้ค้าง */}
        <p className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
          {sending ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-brand-700">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              กำลังส่งคำตอบ อาจใช้เวลาสักครู่
            </span>
          ) : misses > 0 ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-peach-700">
              <span className="h-2 w-2 animate-ping rounded-full bg-peach-500" aria-hidden="true" />
              สัญญาณสะดุด กำลังลองเชื่อมต่อใหม่
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-semibold text-mint-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-mint-500" aria-hidden="true" />
              เชื่อมต่ออยู่
            </span>
          )}
          <span>
            ตรวจหากิจกรรมใหม่อัตโนมัติทุก {(answered ? STUDENT_IDLE_POLL_MS : STUDENT_POLL_MS) / 1000} วินาที
          </span>
          {checkedAt && (
            <span>
              · ตรวจล่าสุด{' '}
              {checkedAt.toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}{' '}
              น.
            </span>
          )}
        </p>

        {!session && (
          <div className="rounded-2xl border-2 border-dashed border-think-200 bg-think-50/70 px-4 py-6 text-center">
            <span
              className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-think-100"
              aria-hidden="true"
            >
              <span className="h-3 w-3 animate-ping rounded-full bg-think-500" />
            </span>
            <p className="font-display text-sm font-bold text-think-900">
              กำลังรอครูเปิดกิจกรรม
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              ไม่ต้องปิดหน้านี้ พอครูเปิดแล้วโจทย์จะขึ้นเองภายในไม่กี่วินาที
            </p>
            <p className="mx-auto mt-3 max-w-sm rounded-2xl border-2 border-slate-200 bg-white px-3.5 py-2.5 text-xs leading-relaxed text-slate-600">
              เครื่องนี้ลงทะเบียนไว้ที่ห้อง{' '}
              <strong className="font-mono text-sm text-slate-800">
                {normalizeRoom(identity.classroom)}
              </strong>
              <br />
              ถ้าครูประกาศรหัสห้องไม่ตรงกับนี้ ให้กด &quot;เปลี่ยนชื่อผู้ตอบ&quot; แล้วกรอกใหม่
            </p>
          </div>
        )}

        {session && (
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Pill tone={session.open ? 'mint' : 'slate'}>
                {session.open ? 'กำลังเปิดรับคำตอบ' : 'ปิดรับคำตอบแล้ว'}
              </Pill>
              <Pill tone="think">{TYPE_LABELS[session.type] ?? session.type}</Pill>
            </div>
            <h2 className="font-display text-lg font-bold text-slate-800">{session.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{session.prompt}</p>
          </div>
        )}
      </Card>

      {showForm && preset && (
        <Card
          title={editing ? 'แก้ไขคำตอบของฉัน' : 'คำตอบของฉัน'}
          subtitle={sending ? 'กำลังส่ง...' : 'ส่งแล้วแก้ไขได้ ระบบจะเก็บคำตอบล่าสุดไว้'}
          icon={<PencilLine className="h-5 w-5 text-brand-600" aria-hidden="true" />}
        >
          <StudentAnswerForm preset={preset} disabled={sending} onSubmit={(d) => void send(d)} />
        </Card>
      )}

      {answered && !editing && session && (
        <Card
          title="ส่งคำตอบเรียบร้อยแล้ว"
          subtitle="ดูผลรวมของทั้งห้องได้จากจอหน้าชั้นเรียน"
          icon={<CircleCheck className="h-5 w-5 text-mint-600" aria-hidden="true" />}
        >
          <p className="text-sm leading-relaxed text-slate-600">
            คำตอบของ <strong>{identity.studentName}</strong> ถูกบันทึกแล้ว
            ถ้าต้องการเปลี่ยนคำตอบ กดปุ่มด้านล่างได้เลย ระบบจะเก็บคำตอบล่าสุดไว้แทนของเดิม
          </p>
          {session.open && (
            <Button variant="secondary" className="mt-3" onClick={() => setEditing(true)}>
              <PencilLine className="h-4 w-4" aria-hidden="true" />
              แก้ไขคำตอบ
            </Button>
          )}
        </Card>
      )}

      {session && !session.open && !answered && (
        <Card
          title="ครูปิดรับคำตอบของกิจกรรมนี้แล้ว"
          subtitle="รอกิจกรรมถัดไปได้เลย"
          icon={<TriangleAlert className="h-5 w-5 text-peach-600" aria-hidden="true" />}
        >
          <p className="text-sm leading-relaxed text-slate-600">
            กิจกรรมนี้ปิดรับคำตอบไปแล้ว เมื่อครูเปิดกิจกรรมถัดไป
            ให้กดปุ่ม &quot;ดูกิจกรรมล่าสุด&quot; ด้านบนเพื่อเข้าร่วม
          </p>
        </Card>
      )}
    </div>
  );
};
