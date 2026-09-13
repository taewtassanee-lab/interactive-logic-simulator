import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Download,
  Loader2,
  RefreshCw,
  TriangleAlert,
  Users,
} from 'lucide-react';
import { Button, Card, EmptyState, Pill } from '../Ui';
import { LiveResultView, liveResponsesToCsv } from './TeacherViews';
import { STEP_LABELS, TYPE_LABELS } from '../../data/liveActivities';
import { fetchLiveResponses, normalizeRoom } from '../../utils/live';
import { attendanceToCsv, buildActivityRecords, buildStudentRecords } from '../../utils/liveRecords';
import { formatThaiDateTime } from '../../utils/format';
import type { LiveResponse } from '../../types/live';
import type { ProgressRow } from '../../utils/sync';

interface Props {
  teacherKey: string;
  rows: ProgressRow[];
}

const LAST_ROOM_KEY = 'ils_live_last_classroom';

const download = (text: string, name: string) => {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

const shortTime = (iso: string) =>
  iso ? new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-';

/**
 * บันทึกร่องรอยการทำกิจกรรมสด
 *
 * แยกออกจากห้องกิจกรรมสดโดยตั้งใจ เพราะคนละงานกันคนละเวลา
 * ห้องกิจกรรมสดใช้ตอนกำลังสอน ดูผลกิจกรรมที่เปิดอยู่ตอนนี้
 * ส่วนหน้านี้ใช้หลังสอนเสร็จ ย้อนดูทุกกิจกรรมที่จัดไปแล้ว
 * และดึงออกมาเป็นหลักฐานเชิงประจักษ์ประกอบการประเมิน
 */
export const ActivityRecords = ({ teacherKey, rows }: Props) => {
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
  const [responses, setResponses] = useState<LiveResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);
  const [openId, setOpenId] = useState('');

  useEffect(() => {
    if (!classroom && classrooms.length) setClassroom(classrooms[0]);
  }, [classroom, classrooms]);

  const reqSeq = useRef(0);

  const load = useCallback(async () => {
    if (!classroom.trim() || !teacherKey) return;
    setLoading(true);
    const mySeq = (reqSeq.current += 1);
    // ไม่ระบุรหัสกิจกรรม เซิร์ฟเวอร์จะส่งคำตอบของห้องนี้มาทั้งหมดทุกกิจกรรม
    const res = await fetchLiveResponses(teacherKey, classroom, '');
    if (mySeq !== reqSeq.current) return;
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? 'ดึงข้อมูลไม่สำเร็จ');
      return;
    }
    setError('');
    setResponses(res.data?.responses ?? []);
    setLoadedAt(new Date());
  }, [classroom, teacherKey]);

  const loadRef = useRef(load);
  loadRef.current = load;
  useEffect(() => {
    void loadRef.current();
  }, [classroom, teacherKey]);

  const records = useMemo(() => buildActivityRecords(responses), [responses]);
  const students = useMemo(() => buildStudentRecords(responses), [responses]);
  const roomToken = normalizeRoom(classroom).replace(/[\\/]/g, '-');

  return (
    <div className="space-y-4">
      <Card
        title="บันทึกร่องรอยการทำกิจกรรม"
        subtitle={
          loadedAt
            ? `ข้อมูลล่าสุดเมื่อ ${formatThaiDateTime(loadedAt)}`
            : 'ย้อนดูทุกกิจกรรมที่เคยจัด และดึงออกเป็นหลักฐานประกอบการประเมิน'
        }
        icon={<ClipboardCheck className="h-5 w-5 text-mint-600" aria-hidden="true" />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              ห้องเรียน
              <input
                list="ils-record-rooms"
                value={classroom}
                placeholder="เช่น ม.5/1"
                onChange={(e) => {
                  setClassroom(e.target.value);
                  setResponses([]);
                  setOpenId('');
                }}
                className="w-32 rounded-xl border-2 border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-700 outline-none focus:border-mint-400 focus:ring-4 focus:ring-mint-100"
              />
              <datalist id="ils-record-rooms">
                {classrooms.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
            <Button variant="secondary" disabled={loading} onClick={() => void load()}>
              {loading ? (
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

        {records.length === 0 ? (
          <EmptyState
            icon={null}
            title={loading ? 'กำลังโหลดข้อมูล' : 'ยังไม่มีบันทึกกิจกรรมของห้องนี้'}
            description="บันทึกจะขึ้นเองเมื่อจัดกิจกรรมสดและมีนักเรียนส่งคำตอบเข้ามาแล้ว"
          />
        ) : (
          <>
            <div className="grid gap-2.5 sm:grid-cols-3">
              <div className="rounded-2xl border-2 border-mint-200 bg-mint-50/70 px-3.5 py-3 text-center">
                <p className="font-display text-3xl font-bold text-mint-700">{records.length}</p>
                <p className="text-xs font-semibold text-slate-600">กิจกรรมที่จัดไปแล้ว</p>
              </div>
              <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/70 px-3.5 py-3 text-center">
                <p className="font-display text-3xl font-bold text-brand-700">{students.length}</p>
                <p className="text-xs font-semibold text-slate-600">ผู้เรียนที่เข้าร่วม (คน)</p>
              </div>
              <div className="rounded-2xl border-2 border-lemon-200 bg-lemon-50/70 px-3.5 py-3 text-center">
                <p className="font-display text-3xl font-bold text-peach-600">{responses.length}</p>
                <p className="text-xs font-semibold text-slate-600">คำตอบทั้งหมด (รายการ)</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() =>
                  download(
                    attendanceToCsv(records, students, normalizeRoom(classroom)),
                    `บันทึกการเข้าร่วมกิจกรรม_${roomToken}.csv`,
                  )
                }
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                ตารางการเข้าร่วมรายบุคคล (CSV)
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  download(liveResponsesToCsv(responses), `คำตอบกิจกรรมสดทั้งหมด_${roomToken}.csv`)
                }
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                คำตอบทุกกิจกรรม (CSV)
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* ---------- รายกิจกรรม ---------- */}
      {records.length > 0 && (
        <Card
          title={`รายกิจกรรม (${records.length} กิจกรรม)`}
          subtitle="กดที่ชื่อกิจกรรมเพื่อดูผลและคำตอบรายคน"
          icon={<ClipboardCheck className="h-5 w-5 text-brand-600" aria-hidden="true" />}
        >
          <div className="space-y-2.5">
            {records.map((rec) => {
              const expanded = openId === rec.activityId;
              return (
                <article
                  key={rec.activityId}
                  className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white"
                >
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setOpenId(expanded ? '' : rec.activityId)}
                    className="flex w-full flex-wrap items-center gap-x-3 gap-y-1.5 px-3.5 py-3 text-left transition hover:bg-slate-50"
                  >
                    {expanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-sm font-bold text-slate-800">
                        {rec.title}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {STEP_LABELS[rec.step] ?? 'ไม่ทราบขั้น'} · {shortTime(rec.firstAt)}–
                        {shortTime(rec.lastAt)} น.
                      </span>
                    </span>
                    {rec.preset && <Pill tone="think">{TYPE_LABELS[rec.preset.type]}</Pill>}
                    {rec.scored && (
                      <Pill tone="mint">
                        เฉลี่ย {rec.avgScore.toFixed(1)}/{rec.total}
                      </Pill>
                    )}
                    <Pill tone="brand">{rec.people} คน</Pill>
                  </button>

                  {expanded && (
                    <div className="border-t-2 border-dashed border-slate-100 px-3.5 py-3.5">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          onClick={() =>
                            download(
                              liveResponsesToCsv(rec.responses),
                              `กิจกรรม_${rec.presetId}_${roomToken}.csv`,
                            )
                          }
                        >
                          <Download className="h-4 w-4" aria-hidden="true" />
                          ดาวน์โหลดกิจกรรมนี้ (CSV)
                        </Button>
                      </div>

                      {rec.preset && (
                        <div className="mb-4">
                          <LiveResultView
                            preset={rec.preset}
                            responses={rec.responses}
                            teacherKey={teacherKey}
                            revealed
                          />
                        </div>
                      )}

                      <h4 className="mb-2 font-display text-sm font-bold text-slate-600">
                        คำตอบรายคน
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[520px] border-collapse text-sm">
                          <thead>
                            <tr className="bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
                              <th className="rounded-l-xl px-3 py-2">เวลา</th>
                              <th className="px-3 py-2">ชื่อ-สกุล</th>
                              <th className="px-3 py-2">เลขที่</th>
                              <th className="px-3 py-2">คำตอบ</th>
                              <th className="rounded-r-xl px-3 py-2 text-right">คะแนน</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rec.responses.map((r, i) => (
                              <tr key={`${r.studentName}-${i}`} className="border-b border-slate-100">
                                <td className="whitespace-nowrap px-3 py-2 text-slate-500">
                                  {shortTime(r.submittedAt)}
                                </td>
                                <td className="px-3 py-2 font-semibold text-slate-700">
                                  {r.studentName}
                                </td>
                                <td className="px-3 py-2 text-slate-500">{r.studentNumber || '-'}</td>
                                <td className="max-w-md whitespace-pre-line px-3 py-2 text-slate-600">
                                  {r.answer.startsWith('IMG:') ? 'ภาพหน้าจอ (ดูในผลด้านบน)' : r.answer}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 text-right text-slate-600">
                                  {r.total ? `${r.score}/${r.total}` : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </Card>
      )}

      {/* ---------- ตารางการเข้าร่วมรายบุคคล ---------- */}
      {students.length > 0 && (
        <Card
          title={`ตารางการเข้าร่วมรายบุคคล (${students.length} คน)`}
          subtitle="ใช้เป็นหลักฐานว่าผู้เรียนแต่ละคนมีส่วนร่วมในกิจกรรมใดบ้าง"
          icon={<Users className="h-5 w-5 text-think-600" aria-hidden="true" />}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-bold text-slate-500">
                  <th className="sticky left-0 z-10 rounded-l-xl bg-slate-50 px-3 py-2">เลขที่</th>
                  <th className="bg-slate-50 px-3 py-2">ชื่อ-สกุล</th>
                  {records.map((rec) => (
                    <th key={rec.activityId} className="px-2 py-2 text-center">
                      <span className="block max-w-[6.5rem] truncate" title={rec.title}>
                        {rec.title}
                      </span>
                    </th>
                  ))}
                  <th className="rounded-r-xl px-3 py-2 text-right">เข้าร่วม</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.key} className="border-b border-slate-100">
                    <td className="sticky left-0 z-10 bg-white px-3 py-2 text-slate-500">
                      {s.studentNumber || '-'}
                    </td>
                    <td className="whitespace-nowrap bg-white px-3 py-2 font-semibold text-slate-700">
                      {s.studentName}
                    </td>
                    {records.map((rec) => {
                      const mine = rec.responses.find(
                        (r) =>
                          r.studentName.trim() === s.studentName.trim() &&
                          r.studentNumber.trim() === s.studentNumber.trim(),
                      );
                      return (
                        <td key={rec.activityId} className="px-2 py-2 text-center">
                          {!mine ? (
                            <span className="text-slate-300" aria-label="ยังไม่ได้เข้าร่วม">
                              –
                            </span>
                          ) : rec.scored ? (
                            <span className="font-semibold text-mint-700">
                              {mine.score}/{mine.total}
                            </span>
                          ) : (
                            <span className="text-mint-600" aria-label="เข้าร่วมแล้ว">
                              ✓
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className="whitespace-nowrap px-3 py-2 text-right">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          s.joined.size === records.length
                            ? 'bg-mint-100 text-mint-800'
                            : 'bg-peach-100 text-peach-800'
                        }`}
                      >
                        {s.joined.size}/{records.length}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            ช่องที่เป็นเครื่องหมายถูกคือเข้าร่วมแล้ว ช่องที่เป็นตัวเลขคือคะแนนที่ทำได้
            ส่วนขีดคือยังไม่ได้ส่งคำตอบ · ระบบระบุตัวผู้เรียนจากชื่อและเลขที่ที่กรอกไว้ตอนเข้าร่วม
            ถ้ามีคนพิมพ์ชื่อไม่ตรงกันในแต่ละครั้งจะถูกนับเป็นคนละคน
          </p>
        </Card>
      )}
    </div>
  );
};
