import { useState } from 'react';
import { Plus } from 'lucide-react';
import { BLOCK_LIBRARY, CATEGORY_META } from '../data/blocks';
import type { BlockCategory, BlockId } from '../types';

const ORDER: BlockCategory[] = ['start', 'answer', 'end'];

/**
 * ตัวเลือกบล็อกแบบย่อ วางไว้ในการ์ดเดียวกับพื้นที่เรียงตรรกะ
 *
 * บนจอกว้างระบบวางคลังบล็อกไว้เป็นคอลัมน์ซ้าย มองเห็นพร้อมพื้นที่เรียงตรรกะอยู่แล้ว
 * แต่บนไอแพดคอลัมน์ถูกจับเรียงลงมาเป็นแถว คลังบล็อกจึงยาวอยู่เหนือพื้นที่เรียงตรรกะ
 * ผู้เรียนต้องเลื่อนจอขึ้นลงไปมาทุกครั้งที่เพิ่มบล็อกหนึ่งชิ้น แล้วเลื่อนกลับมาดูว่าเข้าไหม
 *
 * ตัวนี้จึงย่อคลังบล็อกให้เหลือแถบหมวดกับรายการสั้น ๆ อยู่ในกรอบเดียวกับที่วางบล็อก
 * เลือกหมวดทีละหมวดเพื่อไม่ให้รายการยาวจนดันพื้นที่เรียงตรรกะตกจอ
 */
export const InlineBlockPicker = ({
  onAdd,
  focusCategory,
}: {
  onAdd: (id: BlockId) => void;
  /**
   * หมวดที่ภารกิจปัจจุบันต้องใช้ ถ้าเป็น null แปลว่าเปิดทุกหมวด
   *
   * ภารกิจหนึ่งข้อใช้บล็อกจากหมวดเดียว การโชว์ทั้ง 18 บล็อกพร้อมกันตั้งแต่ต้น
   * ทำให้ผู้เรียนต้องคัดกรองของที่ยังไม่เกี่ยวข้องออกเองก่อนทุกครั้ง
   */
  focusCategory: BlockCategory | null;
}) => {
  const [showAll, setShowAll] = useState(false);
  const visible = focusCategory && !showAll ? [focusCategory] : ORDER;
  const [cat, setCat] = useState<BlockCategory>(focusCategory ?? 'start');
  // หมวดที่เลือกไว้อาจถูกซ่อนเมื่อเปลี่ยนภารกิจ จึงถอยมาใช้หมวดแรกที่ยังเห็นอยู่
  const current = visible.includes(cat) ? cat : visible[0];
  const hidden = ORDER.length - visible.length;
  const blocks = BLOCK_LIBRARY.filter((b) => b.category === current);
  const meta = CATEGORY_META[current];

  return (
    <div className={`mb-3 rounded-[1.25rem] border-2 ${meta.accent}`}>
      <div className="flex flex-wrap items-center gap-1.5 px-3 pt-3">
        {visible.map((c) => {
          const m = CATEGORY_META[c];
          const active = c === current;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={active}
              onClick={() => setCat(c)}
              className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-2.5 py-1.5 font-display text-xs font-bold transition ${
                active
                  ? 'border-slate-700 bg-slate-800 text-white'
                  : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              {m.title}
              <span
                className={`rounded-full px-1.5 text-[10px] font-medium ${
                  active ? 'bg-white/20 text-white' : m.chip
                }`}
              >
                {BLOCK_LIBRARY.filter((b) => b.category === c).length}
              </span>
            </button>
          );
        })}
        {hidden > 0 && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="ml-auto rounded-xl border-2 border-dashed border-slate-300 bg-white px-2.5 py-1.5 font-display text-xs font-semibold text-slate-500 transition hover:text-slate-700"
          >
            แสดงอีก {hidden} หมวด
          </button>
        )}
      </div>

      <p className="px-3 pt-2 text-xs leading-relaxed text-slate-600">{meta.description}</p>

      {/* จำกัดความสูงแล้วให้เลื่อนในกรอบ พื้นที่เรียงตรรกะจะได้ไม่ถูกดันตกจอ */}
      <ul className="max-h-64 space-y-1.5 overflow-y-auto px-3 pb-3 pt-2">
        {blocks.map((b) => (
          <li key={b.id}>
            <button
              type="button"
              onClick={() => onAdd(b.id)}
              className="flex w-full items-center gap-2.5 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-left transition hover:-translate-y-px hover:border-brand-300"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-b from-brand-400 to-brand-600 text-white shadow-clay-sm">
                <Plus className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-mono text-[13px] font-semibold text-slate-800">
                  {b.label}
                </span>
                <span className="block truncate text-[11px] text-slate-500">{b.hint}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
