import { useState } from 'react';
import {
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Lock,
  PlayCircle,
  Rocket,
} from 'lucide-react';
import { Header } from './components/Header';
import { useApp } from './context/AppContext';
import { useToast } from './components/Toast';
import { FloatingShapes } from './components/Illustrations';
import { StartPage } from './pages/StartPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { WorksheetPage } from './pages/WorksheetPage';
import { SummaryPage } from './pages/SummaryPage';
import { TeacherGuidePage } from './pages/TeacherGuidePage';
import { DashboardPage } from './pages/DashboardPage';
import { TEACHER_INFO } from './config';
import type { TabId } from './types';

interface TabDef {
  id: TabId;
  label: string;
  icon: typeof Rocket;
  /** แท็บที่ต้องกด "เริ่มกิจกรรม" ก่อนจึงเข้าได้ */
  requiresStart: boolean;
}

const TABS: TabDef[] = [
  { id: 'start', label: 'เริ่มต้นใช้งาน', icon: Rocket, requiresStart: false },
  { id: 'simulator', label: 'จำลองตรรกะ', icon: PlayCircle, requiresStart: true },
  { id: 'worksheet', label: 'ใบงานดิจิทัล', icon: FileText, requiresStart: true },
  { id: 'summary', label: 'สรุปและส่งงาน', icon: ClipboardList, requiresStart: true },
  { id: 'teacher', label: 'คู่มือครู', icon: GraduationCap, requiresStart: false },
  { id: 'dashboard', label: 'แดชบอร์ดครู', icon: LayoutDashboard, requiresStart: false },
];

const App = () => {
  const { state, resetAll } = useApp();
  const { notify } = useToast();
  const [tab, setTab] = useState<TabId>('start');

  const started = state.session.activityStarted;

  const goTo = (next: TabId) => {
    const target = TABS.find((t) => t.id === next);
    if (target?.requiresStart && !started) {
      notify(
        'กรุณากรอกข้อมูล Driver, Navigator และรหัสคู่ให้ครบ แล้วกดปุ่ม "เริ่มกิจกรรม" ก่อนเข้าใช้งานส่วนนี้',
        'warn',
      );
      setTab('start');
      return;
    }
    setTab(next);
  };

  const handleReset = () => {
    resetAll();
    setTab('start');
    notify('ล้างข้อมูลทั้งหมดเรียบร้อยแล้ว เริ่มกิจกรรมใหม่ได้เลย', 'success');
  };

  return (
    <div className="min-h-screen">
      <FloatingShapes />
      <Header onReset={handleReset} />

      <nav
        className="sticky top-[64px] z-20 border-b-2 border-white bg-white/95 sm:top-[72px]"
        aria-label="เมนูหลัก"
      >
        <div className="scroll-thin mx-auto flex max-w-[1400px] gap-1.5 overflow-x-auto px-2 py-2 sm:px-5">
          {TABS.map((t) => {
            const Icon = t.icon;
            const locked = t.requiresStart && !started;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => goTo(t.id)}
                aria-current={active ? 'page' : undefined}
                className={`relative flex shrink-0 items-center gap-2 rounded-2xl px-3.5 py-2 font-display text-sm font-semibold transition-all duration-150 active:translate-y-[2px] sm:px-4 ${
                  active
                    ? 'bg-gradient-to-b from-brand-400 to-brand-600 text-white'
                    : 'bg-white text-slate-500 hover:-translate-y-0.5 hover:text-brand-600'
                }`}
                style={{
                  boxShadow: active
                    ? '0 4px 0 0 #2f3aa1, 0 8px 16px -8px rgba(15,23,42,0.45)'
                    : '0 3px 0 0 #e2e8f0',
                }}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{t.label}</span>
                {locked && (
                  <>
                    <Lock className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                    <span className="sr-only">(ยังไม่เปิดใช้งาน ต้องเริ่มกิจกรรมก่อน)</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-[1400px] px-3 py-5 sm:px-5 sm:py-6">
        {tab === 'start' && <StartPage onStarted={() => setTab('simulator')} />}
        {tab === 'simulator' && <SimulatorPage />}
        {tab === 'worksheet' && <WorksheetPage />}
        {tab === 'summary' && <SummaryPage onNavigate={goTo} />}
        {tab === 'teacher' && <TeacherGuidePage />}
        {tab === 'dashboard' && <DashboardPage />}
      </main>

      <footer className="mt-4 border-t-2 border-white bg-white/80 py-5">
        <div className="mx-auto max-w-[1400px] px-4 text-center text-xs leading-relaxed text-slate-500">
          <p>
            Interactive Logic Simulator | สื่อนวัตกรรมประกอบการเรียนรู้ รายวิชาเพิ่มเติม คอมพิวเตอร์ 4 (ว32281)
            ชั้นมัธยมศึกษาปีที่ 5
          </p>
          <p className="mt-1 font-semibold text-slate-600">
            ผู้สอน: {TEACHER_INFO.name} | {TEACHER_INFO.school}
          </p>
          <p className="mt-1">
            ข้อมูลทั้งหมดถูกบันทึกไว้ในเบราว์เซอร์ของเครื่องนี้เท่านั้น ไม่ได้ส่งขึ้นเซิร์ฟเวอร์
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
