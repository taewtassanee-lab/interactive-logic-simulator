import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Download, FlaskConical, Lightbulb, Play } from 'lucide-react';
import { Button, Card, EmptyState, Pill } from '../Ui';
import { rowsToCsv, type ProgressRow } from '../../utils/sync';

/**
 * รายงานการทำกิจกรรมจำลอง
 *
 * แดชบอร์ดหน้าสรุปผลบอกแค่ผ่านหรือไม่ผ่าน ซึ่งไม่พอสำหรับประเมินทักษะการแก้ปัญหา
 * หน้านี้แสดงกระบวนการด้วย คือกด Run ไปกี่ครั้ง เปิดคำใบ้กี่ครั้ง ใช้เวลานานแค่ไหน
 * และเปิดดู Debug Log ของแต่ละคู่ย้อนหลังได้ เป็นหลักฐานว่าลงมือแก้จริง
 */
const shortTime = (iso: string) =>
  iso ? new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-';

/** ระดับการพึ่งพาคำใบ้ ใช้ชี้ว่าคู่ไหนควรได้รับการสอนซ่อมเสริม */
const hintTone = (n: number): 'mint' | 'brand' | 'peach' =>
  n === 0 ? 'mint' : n <= 2 ? 'brand' : 'peach';

export const SimulatorReport = ({ rows }: { rows: ProgressRow[] }) => {
  const [keyword, setKeyword] = useState('');
  const [openKey, setOpenKey] = useState('');

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    const base = k
      ? rows.filter((r) =>
          [r.classroom, r.pairCode, r.driverName, r.navigatorName]
            .join(' ')
            .toLowerCase()
            .includes(k),
        )
      : rows;
    // เรียงให้คู่ที่ยังไม่ผ่านขึ้นก่อน ครูจะได้เห็นคนที่ต้องช่วยทันที
    return [...base].sort((a, b) => {
      const pa = (a.mission1Passed ? 1 : 0) + (a.mission2Passed ? 1 : 0);
      const pb = (b.mission1Passed ? 1 : 0) + (b.mission2Passed ? 1 : 0);
      return pa - pb || b.hintsUsed - a.hintsUsed;
    });
  }, [rows, keyword]);

  const stats = useMemo(() => {
    const active = rows.filter((r) => r.runCount > 0);
    const avg = (pick: (r: ProgressRow) => number) =>
      active.length ? active.reduce((s, r) => s + pick(r), 0) / active.length : 0;
    return {
      active: active.length,
      avgRuns: avg((r) => r.runCount),
      avgHints: avg((r) => r.hintsUsed),
      noHint: active.filter((r) => r.hintsUsed === 0 && r.mission1Passed).length,
    };
  }, [rows]);

  const download = () => {
    const csv = rowsToCsv(filtered);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'รายงานกิจกรรมจำลอง.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card
        title="รายงานการทำกิจกรรมจำลอง"
        subtitle="เห็นกระบวนการแก้ Bug ไม่ใช่แค่ผลผ่านหรือไม่ผ่าน"
        icon={<FlaskConical className="h-5 w-5 text-brand-600" aria-hidden="true" />}
        actions={
          <Button variant="secondary" disabled={filtered.length === 0} onClick={download}>
            <Download className="h-4 w-4" aria-hidden="true" />
            ดาวน์โหลด CSV
          </Button>
        }
      >
        <div className="grid gap-2.5 sm:grid-cols-4">
          <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/70 px-3.5 py-3 text-center">
            <p className="font-display text-3xl font-bold text-brand-700">{stats.active}</p>
            <p className="text-xs font-semibold text-slate-600">คู่ที่ลงมือจำลองแล้ว</p>
          </div>
          <div className="rounded-2xl border-2 border-think-200 bg-think-50/70 px-3.5 py-3 text-center">
            <p className="font-display text-3xl font-bold text-think-700">
              {stats.avgRuns.toFixed(1)}
            </p>
            <p className="text-xs font-semibold text-slate-600">กด Run เฉลี่ย (ครั้ง/คู่)</p>
          </div>
          <div className="rounded-2xl border-2 border-lemon-200 bg-lemon-50/70 px-3.5 py-3 text-center">
            <p className="font-display text-3xl font-bold text-peach-600">
              {stats.avgHints.toFixed(1)}
            </p>
            <p className="text-xs font-semibold text-slate-600">เปิดคำใบ้เฉลี่ย (ครั้ง/คู่)</p>
          </div>
          <div className="rounded-2xl border-2 border-mint-200 bg-mint-50/70 px-3.5 py-3 text-center">
            <p className="font-display text-3xl font-bold text-mint-700">{stats.noHint}</p>
            <p className="text-xs font-semibold text-slate-600">ผ่านได้เองโดยไม่เปิดคำใบ้</p>
          </div>
        </div>

        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="ค้นหา ห้องเรียน รหัสคู่ หรือชื่อนักเรียน"
          className="mt-3 w-full rounded-2xl border-2 border-slate-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        />
      </Card>

      <Card
        title={`รายละเอียดรายคู่ (${filtered.length} คู่)`}
        subtitle="เรียงคู่ที่ยังไม่ผ่านขึ้นก่อน กดที่แถวเพื่อดู Debug Log"
        icon={<Play className="h-5 w-5 text-think-600" aria-hidden="true" />}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={null}
            title={rows.length === 0 ? 'ยังไม่มีคู่ใดเริ่มกิจกรรม' : 'ไม่พบคู่ที่ค้นหา'}
            description="รายงานจะขึ้นเองเมื่อนักเรียนกด Run ในหน้าจำลองตรรกะ"
          />
        ) : (
          <div className="space-y-2.5">
            {filtered.map((r) => {
              const key = `${r.classroom}|${r.pairCode}`;
              const expanded = openKey === key;
              const passed = (r.mission1Passed ? 1 : 0) + (r.mission2Passed ? 1 : 0);
              return (
                <article
                  key={key}
                  className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white"
                >
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setOpenKey(expanded ? '' : key)}
                    className="flex w-full flex-wrap items-center gap-x-3 gap-y-1.5 px-3.5 py-3 text-left transition hover:bg-slate-50"
                  >
                    {expanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-sm font-bold text-slate-800">
                        {r.pairCode || '(ไม่มีรหัสคู่)'} · {r.driverName || '-'}
                        {r.navigatorName ? ` และ ${r.navigatorName}` : ''}
                      </span>
                      <span className="block text-xs text-slate-500">
                        ห้อง {r.classroom || '-'} · วางบล็อก {r.blockCount} ชิ้น · ผ่านภารกิจ 1 เมื่อ{' '}
                        {shortTime(r.mission1At)} · ภารกิจ 2 เมื่อ {shortTime(r.mission2At)}
                      </span>
                    </span>
                    <Pill tone={passed === 2 ? 'mint' : passed === 1 ? 'peach' : 'bubble'}>
                      ผ่าน {passed}/2 ภารกิจ
                    </Pill>
                    <Pill tone="think">Run {r.runCount} ครั้ง</Pill>
                    <Pill tone={hintTone(r.hintsUsed)}>
                      <Lightbulb className="h-3 w-3" aria-hidden="true" />
                      คำใบ้ {r.hintsUsed}
                    </Pill>
                  </button>

                  {expanded && (
                    <div className="border-t-2 border-dashed border-slate-100 px-3.5 py-3.5">
                      <h4 className="mb-2 font-display text-sm font-bold text-slate-600">
                        Debug Log รอบล่าสุด
                      </h4>
                      {r.debugLog ? (
                        <ol className="max-h-72 space-y-1 overflow-auto rounded-2xl bg-slate-50 p-3">
                          {r.debugLog.split(' | ').map((line, i) => (
                            <li
                              key={i}
                              className="font-mono text-xs leading-relaxed text-slate-700"
                            >
                              {line}
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="rounded-2xl bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
                          ยังไม่มี Debug Log — คู่นี้อาจยังไม่ได้กด Run หลังอัปเดตระบบ
                          หรือใช้ระบบรุ่นก่อนที่จะเริ่มเก็บข้อมูลนี้
                        </p>
                      )}

                      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50 px-3 py-2">
                          <dt className="text-xs text-slate-500">คะแนนจากการจำลอง</dt>
                          <dd className="font-display font-bold text-slate-800">{r.bestScore}</dd>
                        </div>
                        <div className="rounded-2xl bg-slate-50 px-3 py-2">
                          <dt className="text-xs text-slate-500">สลับบทบาท</dt>
                          <dd className="font-display font-bold text-slate-800">
                            {r.roleSwitchCount} ครั้ง
                          </dd>
                        </div>
                        <div className="rounded-2xl bg-slate-50 px-3 py-2">
                          <dt className="text-xs text-slate-500">ใบงาน</dt>
                          <dd className="font-display font-bold text-slate-800">
                            {r.worksheetPercent}%
                          </dd>
                        </div>
                      </dl>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          ระบบเริ่มเก็บจำนวนครั้งที่กด Run จำนวนคำใบ้ และ Debug Log ตั้งแต่รุ่นนี้เป็นต้นไป
          ข้อมูลของคู่ที่ทำกิจกรรมไปก่อนหน้านี้จะแสดงเป็น 0 · Debug Log เก็บ 40 บรรทัดท้ายสุดของรอบล่าสุด
        </p>
      </Card>
    </div>
  );
};
