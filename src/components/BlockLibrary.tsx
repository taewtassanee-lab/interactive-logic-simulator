import { useState } from 'react';
import { Bug, ChevronDown, Plus, Library } from 'lucide-react';
import { BLOCK_LIBRARY, CATEGORY_META } from '../data/blocks';
import type { BlockCategory, BlockId } from '../types';
import { Card } from './Ui';

const ORDER: BlockCategory[] = ['start', 'answer', 'end', 'bug'];

export const BlockLibrary = ({ onAdd }: { onAdd: (id: BlockId) => void }) => {
  const [open, setOpen] = useState<Record<BlockCategory, boolean>>({
    start: true,
    answer: true,
    end: true,
    bug: false,
  });

  return (
    <Card
      title="คลังบล็อกคำสั่ง"
      subtitle="กดปุ่ม + เพื่อเพิ่มบล็อกลงในพื้นที่เรียงตรรกะ"
      icon={<Library className="h-5 w-5 text-brand-600" aria-hidden="true" />}
    >
      <div className="space-y-3">
        {ORDER.map((cat) => {
          const meta = CATEGORY_META[cat];
          const blocks = BLOCK_LIBRARY.filter((b) => b.category === cat);
          const isOpen = open[cat];
          return (
            <div key={cat} className={`rounded-[1.25rem] border-2 ${meta.accent}`}>
              <button
                type="button"
                onClick={() => setOpen((prev) => ({ ...prev, [cat]: !prev[cat] }))}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
              >
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 font-display text-sm font-bold text-slate-800">
                    {cat === 'bug' && <Bug className="h-4 w-4 text-bubble-600" aria-hidden="true" />}
                    {meta.title}
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.chip}`}>
                      {blocks.length}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">{meta.description}</span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {isOpen && (
                <ul className="space-y-1.5 border-t border-white/70 px-2.5 py-2.5">
                  {blocks.map((block) => (
                    <li key={block.id}>
                      <div
                        className="block-3d flex items-start gap-2 rounded-2xl border-2 border-slate-100 bg-white px-2.5 py-2 hover:border-brand-200"
                        style={{ boxShadow: '0 3px 0 0 rgba(203,213,225,0.6)' }}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="break-words font-mono text-[12.5px] font-semibold leading-snug text-slate-800">
                            {block.label}
                          </p>
                          <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">
                            {block.hint}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onAdd(block.id)}
                          className={`btn-3d mt-0.5 shrink-0 rounded-xl p-1.5 text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-1 ${
                            block.isBug
                              ? 'bg-gradient-to-b from-bubble-400 to-bubble-600 focus-visible:ring-bubble-200'
                              : 'bg-gradient-to-b from-brand-400 to-brand-600 focus-visible:ring-brand-200'
                          }`}
                          style={
                            {
                              boxShadow: block.isBug ? '0 3px 0 0 #a11349' : '0 3px 0 0 #2f3aa1',
                              '--btn-edge': block.isBug ? '#a11349' : '#2f3aa1',
                            } as React.CSSProperties
                          }
                          aria-label={`เพิ่มบล็อก ${block.label} ลงในพื้นที่เรียงตรรกะ`}
                          title={`เพิ่ม ${block.label}`}
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
