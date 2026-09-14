import { useEffect, useState } from 'react';
import { Loader2, RotateCcw, Save, Settings, TriangleAlert } from 'lucide-react';
import { Button, Card, Pill, TextField } from '../Ui';
import { useToast } from '../Toast';
import { useSettings } from '../../context/SettingsContext';
import { LIVE_ACTIVITIES, STEP_LABELS } from '../../data/liveActivities';
import { QUIZ_PRETEST_FALLBACK } from '../../data/liveActivities';
import { defaultSettings, saveSettings } from '../../utils/settings';
import { TOGGLEABLE_TABS, type AppSettings } from '../../types/settings';
import { formatThaiDateTime } from '../../utils/format';

/**
 * หน้าหลังบ้านของครู แก้สิ่งที่นักเรียนเห็นได้โดยไม่ต้องแก้โค้ดแล้วเผยแพร่ใหม่
 *
 * ค่าที่บันทึกจะถูกเก็บฝั่ง Apps Script เครื่องนักเรียนดึงไปใช้ตอนเปิดแอป
 * เครื่องที่เปิดค้างอยู่แล้วต้องรีเฟรชหนึ่งครั้งจึงจะเห็นค่าใหม่
 */
export const AdminPanel = ({ teacherKey }: { teacherKey: string }) => {
  const { notify } = useToast();
  const { settings, reload, applyLocal } = useSettings();
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ค่าจากเซิร์ฟเวอร์มาถึงทีหลัง จึงต้องอัปเดตฟอร์มตามเมื่อเลขรุ่นเปลี่ยน
  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const dirty = JSON.stringify({ ...draft, version: 0, updatedAt: '' })
    !== JSON.stringify({ ...settings, version: 0, updatedAt: '' });

  const save = async () => {
    setSaving(true);
    setError('');
    const res = await saveSettings(teacherKey, draft);
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? 'บันทึกไม่สำเร็จ');
      notify(res.error ?? 'บันทึกไม่สำเร็จ', 'error');
      return;
    }
    if (res.settings) applyLocal(res.settings);
    notify('บันทึกค่าตั้งแล้ว เครื่องนักเรียนจะเห็นค่าใหม่เมื่อเปิดหรือรีเฟรชหน้า', 'success');
  };

  const quiz = draft.pretestQuestions ?? QUIZ_PRETEST_FALLBACK;

  return (
    <div className="space-y-4">
      {/* ---------- แถบบันทึก ---------- */}
      <Card
        title="ตั้งค่าระบบ"
        subtitle={
          settings.updatedAt
            ? `แก้ไขล่าสุดเมื่อ ${formatThaiDateTime(settings.updatedAt)} (รุ่นที่ ${settings.version})`
            : 'ยังไม่เคยตั้งค่า ระบบใช้ค่าตั้งต้นในโค้ดอยู่'
        }
        icon={<Settings className="h-5 w-5 text-think-600" aria-hidden="true" />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {dirty && <Pill tone="peach">ยังไม่ได้บันทึก</Pill>}
            <Button variant="secondary" onClick={() => void reload()}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              ยกเลิกการแก้ไข
            </Button>
            <Button variant="primary" disabled={saving || !dirty} onClick={() => void save()}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="h-4 w-4" aria-hidden="true" />
              )}
              บันทึกค่าตั้ง
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
        <p className="rounded-2xl border-2 border-dashed border-think-200 bg-think-50/70 px-3.5 py-2.5 text-xs leading-relaxed text-think-900">
          ค่าที่บันทึกที่นี่จะไปแทนค่าตั้งต้นในโค้ดสำหรับ<strong>ทุกเครื่อง</strong>
          เครื่องที่เปิดค้างอยู่ต้องรีเฟรชหนึ่งครั้งจึงจะเห็นค่าใหม่
          ถ้าเครื่องไหนต่อเน็ตไม่ได้จะใช้ค่าตั้งต้นในโค้ดแทน บทเรียนจึงเดินต่อได้เสมอ
        </p>
      </Card>

      {/* ---------- ข้อมูลครูและรายวิชา ---------- */}
      <Card title="ข้อมูลครูและรายวิชา" subtitle="แสดงบนหัวเว็บ หน้าเริ่มต้น คู่มือครู และไฟล์ PDF">
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="ชื่อครูผู้สอน" value={draft.teacherName} onChange={(v) => set('teacherName', v)} />
          <TextField
            label="ชื่อในเอกสารราชการ"
            value={draft.teacherFormalName}
            onChange={(v) => set('teacherFormalName', v)}
            hint="ใช้ในไฟล์ PDF เช่น นางสาวทัศนีย์ ศรีทน"
          />
          <TextField label="ตำแหน่ง" value={draft.teacherPosition} onChange={(v) => set('teacherPosition', v)} />
          <TextField label="โรงเรียน" value={draft.school} onChange={(v) => set('school', v)} />
          <TextField
            label="ป้ายรายวิชา (บนหัวเว็บ)"
            value={draft.courseLabel}
            onChange={(v) => set('courseLabel', v)}
            hint="เช่น คอมพิวเตอร์ 4 ว32281 | ม.5"
          />
          <TextField label="ชื่อรายวิชาเต็ม" value={draft.courseName} onChange={(v) => set('courseName', v)} />
          <TextField label="ระดับชั้น" value={draft.gradeLevel} onChange={(v) => set('gradeLevel', v)} />
          <TextField label="ภาคเรียน" value={draft.semester} onChange={(v) => set('semester', v)} />
          <div className="sm:col-span-2">
            <TextField label="ชื่อหน่วยการเรียนรู้" value={draft.unitName} onChange={(v) => set('unitName', v)} />
          </div>
        </div>
      </Card>

      {/* ---------- การจัดกิจกรรม ---------- */}
      <Card title="การจัดกิจกรรม" subtitle="เวลาสลับบทบาท และแท็บที่นักเรียนมองเห็น">
        <div className="mb-4 max-w-xs">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            เวลาสลับบทบาท Driver และ Navigator
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={60}
              value={draft.roleSwitchMinutes}
              onChange={(e) => set('roleSwitchMinutes', Math.max(1, Math.min(60, Number(e.target.value) || 1)))}
              className="w-24 rounded-2xl border-2 border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-think-400 focus:ring-4 focus:ring-think-100"
            />
            <span className="text-sm text-slate-600">นาที</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">แผนกำหนดไว้ 10 นาที ตั้งได้ตั้งแต่ 1 ถึง 60 นาที</p>
        </div>

        <p className="mb-2 text-sm font-semibold text-slate-700">แท็บที่นักเรียนมองเห็น</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {TOGGLEABLE_TABS.map((t) => {
            const on = draft.visibleTabs.includes(t.id);
            return (
              <label
                key={t.id}
                className={`flex cursor-pointer items-start gap-2.5 rounded-2xl border-2 px-3.5 py-2.5 transition ${
                  on ? 'border-mint-300 bg-mint-50/70' : 'border-slate-200 bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() =>
                    set(
                      'visibleTabs',
                      on
                        ? draft.visibleTabs.filter((x) => x !== t.id)
                        : [...draft.visibleTabs, t.id],
                    )
                  }
                  className="mt-0.5 h-5 w-5 shrink-0 accent-mint-600"
                />
                <span className="min-w-0">
                  <span className="block font-display text-sm font-bold text-slate-800">{t.label}</span>
                  <span className="block text-xs text-slate-500">{t.note}</span>
                </span>
              </label>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          แท็บ &quot;เริ่มต้นใช้งาน&quot; เปิดไว้เสมอ เพราะเป็นจุดกรอกข้อมูลและเลือกโหมดเครื่อง
        </p>
      </Card>

      {/* ---------- ชื่อและโจทย์กิจกรรมสด ---------- */}
      <Card
        title="ชื่อและโจทย์กิจกรรมสด"
        subtitle="เว้นว่างไว้เพื่อใช้ข้อความตั้งต้น แก้เมื่ออยากปรับถ้อยคำให้เข้ากับห้องของตัวเอง"
      >
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((step) => {
            const items = LIVE_ACTIVITIES.filter((a) => a.step === step);
            if (!items.length) return null;
            return (
              <section key={step}>
                <h3 className="mb-2 font-display text-sm font-bold text-slate-600">
                  {STEP_LABELS[step]}
                </h3>
                <div className="space-y-2.5">
                  {items.map((a) => {
                    const ov = draft.activityOverrides[a.id] ?? {};
                    const put = (patch: { title?: string; prompt?: string }) =>
                      set('activityOverrides', {
                        ...draft.activityOverrides,
                        [a.id]: { ...ov, ...patch },
                      });
                    return (
                      <div key={a.id} className="rounded-2xl border-2 border-slate-200 bg-white p-3">
                        <TextField
                          label="ชื่อกิจกรรม"
                          value={ov.title ?? ''}
                          onChange={(v) => put({ title: v })}
                          placeholder={a.title}
                        />
                        <div className="mt-2">
                          <TextField
                            label="โจทย์ที่นักเรียนเห็น"
                            value={ov.prompt ?? ''}
                            onChange={(v) => put({ prompt: v })}
                            placeholder={a.prompt}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </Card>

      {/* ---------- ข้อสอบก่อนเรียน ---------- */}
      <Card
        title="แบบทดสอบก่อนเรียน 5 ข้อ"
        subtitle="แก้โจทย์ ตัวเลือก เฉลย และคำอธิบายได้ทั้งชุด"
        actions={
          draft.pretestQuestions && (
            <Button variant="secondary" onClick={() => set('pretestQuestions', null)}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              คืนค่าชุดตั้งต้น
            </Button>
          )
        }
      >
        <div className="space-y-3">
          {quiz.map((q, qi) => (
            <fieldset key={q.id} className="rounded-2xl border-2 border-slate-200 bg-white p-3">
              <legend className="px-1 font-display text-sm font-bold text-slate-700">ข้อ {qi + 1}</legend>
              <TextField
                label="โจทย์"
                value={q.text}
                onChange={(v) =>
                  set('pretestQuestions', quiz.map((x, i) => (i === qi ? { ...x, text: v } : x)))
                }
              />
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {q.choices.map((c, ci) => (
                  <label key={ci} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`ans-${q.id}`}
                      checked={q.answerIndex === ci}
                      onChange={() =>
                        set(
                          'pretestQuestions',
                          quiz.map((x, i) => (i === qi ? { ...x, answerIndex: ci } : x)),
                        )
                      }
                      aria-label={`ตั้งตัวเลือก ${'กขคง'[ci]} เป็นคำตอบที่ถูก`}
                      className="h-5 w-5 shrink-0 accent-mint-600"
                    />
                    <span className="w-5 shrink-0 text-center text-sm font-bold text-slate-400">
                      {'กขคง'[ci]}
                    </span>
                    <input
                      value={c}
                      onChange={(e) =>
                        set(
                          'pretestQuestions',
                          quiz.map((x, i) =>
                            i === qi
                              ? { ...x, choices: x.choices.map((y, k) => (k === ci ? e.target.value : y)) }
                              : x,
                          ),
                        )
                      }
                      className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-think-400 focus:ring-4 focus:ring-think-100"
                    />
                  </label>
                ))}
              </div>
              <div className="mt-2">
                <TextField
                  label="คำอธิบายเฉลย (แสดงบนจอครูหลังปิดรับคำตอบ)"
                  value={q.explain}
                  onChange={(v) =>
                    set('pretestQuestions', quiz.map((x, i) => (i === qi ? { ...x, explain: v } : x)))
                  }
                />
              </div>
            </fieldset>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          ปุ่มวงกลมหน้าตัวเลือกคือการกำหนดว่าข้อไหนเป็นคำตอบที่ถูก ระบบใช้ตรวจให้อัตโนมัติ
        </p>
      </Card>

      {/* ---------- คืนค่าทั้งหมด ---------- */}
      <Card title="คืนค่าตั้งต้นทั้งหมด" subtitle="ยกเลิกทุกอย่างที่แก้ไว้ กลับไปใช้ค่าที่มากับโค้ด">
        <Button
          variant="danger"
          onClick={() => {
            setDraft({ ...defaultSettings(), version: settings.version, updatedAt: settings.updatedAt });
            notify('เตรียมคืนค่าตั้งต้นแล้ว กดปุ่มบันทึกค่าตั้งด้านบนเพื่อยืนยัน', 'warn');
          }}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          คืนค่าตั้งต้นทั้งหมด
        </Button>
      </Card>
    </div>
  );
};
