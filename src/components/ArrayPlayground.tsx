import { useState } from 'react';
import { Dices, Eraser, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { Button, Card, Pill } from './Ui';
import { IsoCube } from './Illustrations';

const INITIAL = ['Q1', 'Q2', 'Q3', 'Q4'];
const MAX_ITEMS = 9;

/** หาชื่อข้อสอบถัดไปที่ยังไม่ถูกใช้ กันไม่ให้เกิดชื่อซ้ำซึ่งทำให้ผู้เรียนสับสน */
const nextLabel = (items: string[]): string => {
  for (let n = 1; n <= 99; n += 1) {
    const candidate = `Q${n}`;
    if (!items.includes(candidate)) return candidate;
  }
  return `Q${items.length + 1}`;
};

interface LogLine {
  text: string;
  tone: 'info' | 'ok' | 'warn';
}

/**
 * พื้นที่ทดลองเล่น Array แบบโต้ตอบ
 * จุดประสงค์: ให้ผู้เรียนเห็นด้วยตาว่า Index เริ่มที่ 0 และ Array.Width เปลี่ยนจริงเมื่อลบช่อง
 * ไม่เกี่ยวข้องกับคะแนนหรือภารกิจใด ๆ เล่นผิดได้ไม่มีผลเสีย
 */
export const ArrayPlayground = () => {
  const [items, setItems] = useState<string[]>(INITIAL);
  const [picked, setPicked] = useState<number | null>(null);
  const [log, setLog] = useState<LogLine[]>([
    { text: 'เริ่มต้นด้วยข้อสอบ 4 ข้อ Array.Width = 4', tone: 'info' },
  ]);

  const addLog = (text: string, tone: LogLine['tone'] = 'info') =>
    setLog((prev) => [...prev.slice(-7), { text, tone }]);

  const handleDelete = (index: number) => {
    const removed = items[index];
    const next = items.filter((_, i) => i !== index);
    setItems(next);
    setPicked(null);
    addLog(
      `ลบ Index ${index} (${removed}) แล้ว → Array.Width ลดจาก ${items.length} เหลือ ${next.length}`,
      'ok',
    );
  };

  const handleRandom = () => {
    if (items.length === 0) {
      addLog('Array ว่างแล้ว สุ่มไม่ได้ เพราะ random(0) ไม่มีช่องให้เลือก', 'warn');
      return;
    }
    const num = Math.floor(Math.random() * items.length);
    setPicked(num);
    addLog(
      `floor(random(${items.length})) = ${num} → Array.At(${num}) ได้ค่า "${items[num]}"`,
      'info',
    );
  };

  const handlePush = () => {
    if (items.length >= MAX_ITEMS) {
      addLog(`พื้นที่ทดลองรองรับสูงสุด ${MAX_ITEMS} ช่อง`, 'warn');
      return;
    }
    const value = nextLabel(items);
    setItems([...items, value]);
    addLog(`Push back "${value}" → ได้ Index ${items.length} และ Array.Width = ${items.length + 1}`, 'ok');
  };

  const handleClear = () => {
    setItems([]);
    setPicked(null);
    addLog('Clear ทั้งหมด → Array.Width = 0 ซึ่งคือเงื่อนไข "Array is empty"', 'warn');
  };

  const handleReset = () => {
    setItems(INITIAL);
    setPicked(null);
    setLog([{ text: 'รีเซ็ตกลับสู่ข้อสอบ 4 ข้อ Array.Width = 4', tone: 'info' }]);
  };

  return (
    <Card
      title="ลองเล่น Array ด้วยตัวเอง"
      subtitle="กดปุ่มแล้วสังเกตว่าเลข Index และ Array.Width เปลี่ยนอย่างไร เล่นผิดได้ ไม่มีผลต่อคะแนน"
      icon={<Dices className="h-5 w-5 text-think-600" aria-hidden="true" />}
    >
      {/* ---------- ค่าปัจจุบัน ---------- */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Pill tone="brand">Array.Width = {items.length}</Pill>
        <Pill tone={items.length ? 'think' : 'slate'}>
          Index ที่ใช้ได้: {items.length ? `0 ถึง ${items.length - 1}` : 'ไม่มี'}
        </Pill>
        {picked !== null && items[picked] !== undefined && (
          <Pill tone="mint">
            Array.At({picked}) = {items[picked]}
          </Pill>
        )}
      </div>

      {/* ---------- ช่องข้อมูล ---------- */}
      <div className="mb-3 rounded-[1.25rem] border-2 border-brand-200 bg-gradient-to-b from-brand-50 to-white p-3">
        {items.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-mint-300 bg-mint-50 px-3 py-4 text-center font-mono text-sm font-semibold text-mint-800">
            [ ] Array ว่าง — Array.Width = 0
          </p>
        ) : (
          <div className="flex flex-wrap items-end gap-2">
            {items.map((code, i) => (
              <div key={`${code}-${i}`} className="flex flex-col items-center gap-1">
                <IsoCube
                  label={code}
                  index={i}
                  tone={picked === i ? 'think' : 'brand'}
                  highlighted={picked === i}
                />
                <button
                  type="button"
                  onClick={() => handleDelete(i)}
                  className="flex items-center gap-1 rounded-lg border-2 border-bubble-200 bg-white px-2 py-0.5 text-[10.5px] font-semibold text-bubble-700 transition hover:-translate-y-0.5 hover:bg-bubble-50"
                  aria-label={`ลบช่อง Index ${i} ซึ่งเก็บค่า ${code}`}
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                  ลบ
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------- ปุ่มควบคุม ---------- */}
      <div className="mb-3 flex flex-wrap gap-2">
        <Button variant="purple" onClick={handleRandom}>
          <Dices className="h-4 w-4" aria-hidden="true" />
          สุ่มด้วย floor(random(Array.Width))
        </Button>
        <Button variant="secondary" onClick={handlePush}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Push back
        </Button>
        <Button variant="secondary" onClick={handleClear}>
          <Eraser className="h-4 w-4" aria-hidden="true" />
          Clear
        </Button>
        <Button variant="ghost" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          เริ่มใหม่
        </Button>
      </div>

      {/* ---------- บันทึกสิ่งที่เกิดขึ้น ---------- */}
      <div
        className="scroll-thin max-h-48 overflow-y-auto rounded-[1.25rem] border-4 border-slate-700 bg-slate-900 p-3 font-mono text-[12px] leading-relaxed"
        role="log"
        aria-label="บันทึกผลการทดลองกับ Array"
      >
        {log.map((line, i) => (
          <p
            key={`${line.text}-${i}`}
            className={
              line.tone === 'ok'
                ? 'text-mint-300'
                : line.tone === 'warn'
                  ? 'text-lemon-200'
                  : 'text-slate-300'
            }
          >
            <span className="text-slate-500">›</span> {line.text}
          </p>
        ))}
      </div>

      <p className="mt-3 rounded-2xl border-2 border-dashed border-think-200 bg-think-50/70 px-3.5 py-2.5 text-xs leading-relaxed text-think-900">
        <strong>ลองสังเกต:</strong> กด &quot;ลบ&quot; ที่ช่องแรกดู แล้วดูว่าเลข Index ของช่องที่เหลือ
        เปลี่ยนไปอย่างไร ช่องที่อยู่ข้างหลังจะเลื่อนขึ้นมาแทนที่เสมอ นี่คือเหตุผลที่ต้องอ่านค่าออกมาก่อนแล้วจึงลบ
      </p>
    </Card>
  );
};
