import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dices, Maximize2, Pause, Play, RotateCcw, Timer } from 'lucide-react';
import { Button, Card, EmptyState, Pill } from '../Ui';
import { FullscreenStage } from './FullscreenStage';
import { formatClock } from '../../utils/format';
import type { ProgressRow } from '../../utils/sync';

/**
 * เครื่องมือหน้าชั้นเรียนที่ทำงานบนเครื่องครูอย่างเดียว
 * ไม่ต้องต่ออินเทอร์เน็ตและไม่ใช้โควตา Apps Script จึงใช้ได้แม้เน็ตโรงเรียนล่ม
 */

/* ==================== วงล้อสุ่มชื่อ ==================== */

type PickMode = 'pair' | 'person';

const buildCandidates = (rows: ProgressRow[], mode: PickMode): string[] => {
  if (mode === 'pair') {
    return rows
      .map((r) => {
        const names = [r.driverName, r.navigatorName].filter(Boolean).join(' และ ');
        return r.pairCode ? `${r.pairCode} — ${names || 'ยังไม่กรอกชื่อ'}` : names;
      })
      .filter(Boolean);
  }
  const people: string[] = [];
  rows.forEach((r) => {
    if (r.driverName) people.push(`${r.driverName}${r.pairCode ? ` (${r.pairCode})` : ''}`);
    if (r.navigatorName) people.push(`${r.navigatorName}${r.pairCode ? ` (${r.pairCode})` : ''}`);
  });
  return people;
};

export const NamePicker = ({ rows }: { rows: ProgressRow[] }) => {
  const [mode, setMode] = useState<PickMode>('pair');
  const [count, setCount] = useState(2);
  const [spinning, setSpinning] = useState(false);
  const [flash, setFlash] = useState('');
  const [winners, setWinners] = useState<string[]>([]);
  /** ชื่อที่ถูกสุ่มไปแล้ว จะไม่ถูกสุ่มซ้ำจนกว่าจะกดล้าง เพื่อให้ทุกคนได้มีโอกาสนำเสนอ */
  const [used, setUsed] = useState<string[]>([]);
  const [full, setFull] = useState(false);

  const candidates = useMemo(() => buildCandidates(rows, mode), [rows, mode]);
  const pool = candidates.filter((c) => !used.includes(c));

  const spin = useCallback(() => {
    if (spinning || pool.length === 0) return;
    setSpinning(true);
    setWinners([]);

    // หมุนไล่ชื่อให้เห็นบนจอ 1.8 วินาที แล้วค่อยหยุดที่ผลจริง
    let ticks = 0;
    const interval = window.setInterval(() => {
      setFlash(pool[Math.floor(Math.random() * pool.length)]);
      ticks += 1;
      if (ticks >= 24) {
        window.clearInterval(interval);
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        const picked = shuffled.slice(0, Math.min(count, pool.length));
        setWinners(picked);
        setUsed((prev) => [...prev, ...picked]);
        setFlash('');
        setSpinning(false);
      }
    }, 75);
  }, [spinning, pool, count]);

  /** ปุ่มสั่งงานชุดเดียวกัน ใช้ทั้งในการ์ดและบนจอฉาย */
  const controls = (big?: boolean) => (
    <>
      <Button variant="purple" disabled={spinning || pool.length === 0} onClick={spin}>
        <Dices className="h-4 w-4" aria-hidden="true" />
        {pool.length === 0 ? 'สุ่มครบทุกคนแล้ว' : 'สุ่มเลย'}
      </Button>
      {used.length > 0 && (
        <Button variant="secondary" onClick={() => setUsed([])}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          ล้างรายชื่อที่สุ่มไปแล้ว
        </Button>
      )}
      <Pill tone="slate">
        เหลือให้สุ่ม {pool.length} จาก {candidates.length}
      </Pill>
      {!big && candidates.length > 0 && (
        <Button variant="ghost" onClick={() => setFull(true)}>
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
          ฉายเต็มจอ
        </Button>
      )}
    </>
  );

  /** พื้นที่แสดงผลการสุ่ม ขนาดตัวอักษรต่างกันระหว่างในการ์ดกับบนจอฉาย */
  const stage = (big: boolean) => (
    <div
      className={
        big
          ? 'flex w-full flex-col items-center justify-center gap-4 text-center'
          : 'flex min-h-[132px] flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-peach-200 bg-gradient-to-b from-lemon-50 to-white px-4 py-6 text-center'
      }
      aria-live="polite"
    >
      {spinning ? (
        <p
          className={`font-display font-bold text-peach-600 ${big ? 'animate-pulse text-[6vw] leading-tight' : 'text-2xl'}`}
        >
          {flash}
        </p>
      ) : winners.length ? (
        winners.map((w, i) => (
          <p
            key={w}
            className={`font-display font-bold text-brand-700 ${big ? 'text-[5vw] leading-tight' : 'text-2xl'}`}
          >
            <span className={`mr-3 text-slate-400 ${big ? 'text-[3vw]' : 'text-base'}`}>
              {i + 1}.
            </span>
            {w}
          </p>
        ))
      ) : (
        <p className={big ? 'text-[2vw] text-slate-400' : 'text-sm text-slate-500'}>
          กดปุ่ม &quot;สุ่มเลย&quot; เพื่อเริ่ม
        </p>
      )}
    </div>
  );

  if (full) {
    return (
      <FullscreenStage
        title="สุ่มชื่อผู้นำเสนอ"
        headerRight={
          <Pill tone="peach">{mode === 'pair' ? 'สุ่มเป็นคู่' : 'สุ่มรายคน'} · ครั้งละ {count}</Pill>
        }
        footer={controls(true)}
        onExit={() => setFull(false)}
      >
        {stage(true)}
      </FullscreenStage>
    );
  }

  return (
    <Card
      title="วงล้อสุ่มชื่อ"
      subtitle="สุ่มตัวแทนออกมานำเสนออย่างเป็นกลาง ใช้ชื่อจริงที่ลงทะเบียนไว้ในระบบ"
      icon={<Dices className="h-5 w-5 text-peach-600" aria-hidden="true" />}
    >
      {candidates.length === 0 ? (
        <EmptyState
          icon={null}
          title="ยังไม่มีรายชื่อในระบบ"
          description="รายชื่อจะขึ้นเองเมื่อนักเรียนกรอกข้อมูลและกดเริ่มกิจกรรมที่เครื่อง Driver"
        />
      ) : (
        <div className="space-y-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1.5" role="group" aria-label="สุ่มแบบใด">
              {(['pair', 'person'] as PickMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={mode === m}
                  onClick={() => {
                    setMode(m);
                    setUsed([]);
                    setWinners([]);
                  }}
                  className={`rounded-xl border-2 px-3 py-1.5 text-sm font-semibold transition ${
                    mode === m
                      ? 'border-peach-400 bg-peach-50 text-peach-800'
                      : 'border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  {m === 'pair' ? 'สุ่มเป็นคู่' : 'สุ่มรายคน'}
                </button>
              ))}
            </div>
            <label className="ml-auto flex items-center gap-2 text-sm text-slate-600">
              จำนวนที่สุ่ม
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="rounded-xl border-2 border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-700"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {stage(false)}

          <div className="flex flex-wrap items-center gap-2">{controls(false)}</div>
        </div>
      )}
    </Card>
  );
};

/* ==================== นาฬิกาจับเวลาจอใหญ่ ==================== */

const PRESETS = [1, 3, 5, 10, 15, 20];

export const BigTimer = () => {
  const [total, setTotal] = useState(5 * 60);
  const [left, setLeft] = useState(5 * 60);
  const [running, setRunning] = useState(false);
  const [full, setFull] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  /** เสียงเตือนสั้น ๆ ตอนหมดเวลา สร้างด้วย Web Audio จึงไม่ต้องแนบไฟล์เสียง */
  useEffect(() => {
    if (left !== 0 || !audioRef.current) return;
    const ctx = audioRef.current;
    [0, 0.25, 0.5].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.18);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.2);
    });
  }, [left]);

  const start = () => {
    // สร้าง AudioContext ตอนผู้ใช้กดปุ่ม เบราว์เซอร์จึงยอมให้เล่นเสียงได้
    if (!audioRef.current) {
      const Ctor = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctor) audioRef.current = new Ctor();
    }
    setRunning(true);
  };

  const setMinutes = (m: number) => {
    setRunning(false);
    setTotal(m * 60);
    setLeft(m * 60);
  };

  const percent = total ? (left / total) * 100 : 0;
  const urgent = left <= 60 && left > 0;
  const done = left === 0;

  const clock = (
    <p
      className={`font-display font-bold tabular-nums leading-none transition-colors ${
        done ? 'text-bubble-600' : urgent ? 'text-peach-600' : 'text-brand-700'
      } ${full ? 'text-[22vw]' : 'text-[64px]'} ${urgent && running ? 'animate-pulse' : ''}`}
      aria-live="off"
    >
      {formatClock(left)}
    </p>
  );

  const controls = (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {!running ? (
        <Button variant="success" onClick={start} disabled={left === 0}>
          <Play className="h-4 w-4" aria-hidden="true" />
          เริ่มจับเวลา
        </Button>
      ) : (
        <Button variant="secondary" onClick={() => setRunning(false)}>
          <Pause className="h-4 w-4" aria-hidden="true" />
          หยุดชั่วคราว
        </Button>
      )}
      <Button variant="secondary" onClick={() => setMinutes(total / 60)}>
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        ตั้งใหม่
      </Button>
      {!full && (
        <Button variant="ghost" onClick={() => setFull(true)}>
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
          ฉายเต็มจอ
        </Button>
      )}
    </div>
  );

  if (full) {
    return (
      <FullscreenStage
        title={done ? 'หมดเวลาแล้ว' : 'เวลาที่เหลือของกิจกรรมนี้'}
        footer={controls}
        onExit={() => setFull(false)}
      >
        {clock}
        <div className="mt-6 h-4 w-full max-w-4xl overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              urgent || done
                ? 'bg-gradient-to-r from-peach-400 to-bubble-500'
                : 'bg-gradient-to-r from-brand-400 to-brand-600'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </FullscreenStage>
    );
  }

  return (
    <Card
      title="นาฬิกาจับเวลาจอใหญ่"
      subtitle="ฉายหน้าชั้นเพื่อกำกับเวลาภารกิจและการสลับบทบาท ใช้ได้แม้ไม่มีอินเทอร์เน็ต"
      icon={<Timer className="h-5 w-5 text-brand-600" aria-hidden="true" />}
    >
      <div className="space-y-3.5">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="ตั้งเวลา">
          {PRESETS.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={total === m * 60}
              onClick={() => setMinutes(m)}
              className={`rounded-xl border-2 px-3 py-1.5 text-sm font-semibold transition ${
                total === m * 60
                  ? 'border-brand-400 bg-brand-50 text-brand-800'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-brand-200'
              }`}
            >
              {m} นาที
            </button>
          ))}
        </div>

        <div className="rounded-3xl border-2 border-slate-100 bg-gradient-to-b from-white to-slate-50 px-4 py-6 text-center">
          {clock}
          <div className="mx-auto mt-4 h-3 max-w-md overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                urgent || done
                  ? 'bg-gradient-to-r from-peach-400 to-bubble-500'
                  : 'bg-gradient-to-r from-brand-400 to-brand-600'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {controls}

        <p className="rounded-2xl border-2 border-dashed border-think-200 bg-think-50/70 px-3.5 py-2.5 text-xs leading-relaxed text-think-900">
          นาฬิกานี้ใช้กำกับเวลาแต่ละภารกิจบนจอหน้าชั้น ส่วนการบังคับสลับบทบาท Driver และ Navigator
          ทุก 10 นาที ระบบจับเวลาที่เครื่องของนักเรียนทำงานแยกอยู่แล้ว ไม่ต้องตั้งซ้ำที่นี่
        </p>
      </div>
    </Card>
  );
};
