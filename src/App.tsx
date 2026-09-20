import { useState } from 'react';
import {
  BookOpenCheck,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Library,
  Radio,
  Lock,
  PlayCircle,
  Rocket,
} from 'lucide-react';
import { Header } from './components/Header';
import { useApp } from './context/AppContext';
import { useToast } from './components/Toast';
import { FloatingShapes } from './components/Illustrations';
import { FloatingRoleTimer } from './components/FloatingRoleTimer';
import { RoleSwapOverlay } from './components/RoleSwapOverlay';
import { StartPage } from './pages/StartPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { WorksheetPage } from './pages/WorksheetPage';
import { SummaryPage } from './pages/SummaryPage';
import { StudentGuidePage } from './pages/StudentGuidePage';
import { DashboardPage } from './pages/DashboardPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { LivePage } from './pages/LivePage';
import { useSettings } from './context/SettingsContext';
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
  // คู่มือนักเรียนอยู่ต้นแถวเพราะเป็นหน้าที่ผู้เรียนกลับมาเปิดตอนไม่แน่ใจว่าต้องทำอะไรต่อ
  { id: 'guide', label: 'คู่มือนักเรียน', icon: BookOpenCheck, requiresStart: false },
  // คลังความรู้มาก่อนจำลองตรรกะ ให้ผู้เรียนอ่านทำความเข้าใจก่อนลงมือทำ
  { id: 'knowledge', label: 'คลังความรู้', icon: Library, requiresStart: false },
  { id: 'simulator', label: 'จำลองตรรกะ', icon: PlayCircle, requiresStart: true },
  // กิจกรรมสดเป็นการตอบรายบุคคล ไอแพดเครื่อง Navigator จึงเข้าร่วมได้ด้วย ไม่ต้องกดเริ่มกิจกรรมก่อน
  { id: 'live', label: 'กิจกรรมสด', icon: Radio, requiresStart: false },
  { id: 'worksheet', label: 'ใบงานดิจิทัล', icon: FileText, requiresStart: true },
  { id: 'summary', label: 'สรุปและส่งงาน', icon: ClipboardList, requiresStart: true },
  { id: 'dashboard', label: 'แดชบอร์ดครู', icon: LayoutDashboard, requiresStart: false },
];

const App = () => {
  const { state, resetAll } = useApp();
  const { notify } = useToast();
  const { settings } = useSettings();
  // ครูซ่อนแท็บบางอันได้จากหน้าตั้งค่าระบบ แท็บเริ่มต้นใช้งานเปิดไว้เสมอ
  const tabs = TABS.filter((t) => t.id === 'start' || settings.visibleTabs.includes(t.id));
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
    /* เลขรุ่นไม่แสดงบนหน้าจอแล้ว แต่ยังติดมากับหน้าเว็บในรูปแอตทริบิวต์
       ไว้ตรวจว่าเครื่องนั้นโหลดไฟล์ชุดใหม่แล้วหรือยัง เวลาแคชค้างบนไอแพด */
    <div className="min-h-screen" data-build={__BUILD_ID__}>
      <FloatingShapes />
      <Header onReset={handleReset} isAssistant={state.session.deviceMode === 'assistant'} />

      <nav
        className="sticky top-[64px] z-20 border-b-2 border-white bg-white sm:top-[72px]"
        aria-label="เมนูหลัก"
      >
        {/* ตัดขึ้นบรรทัดใหม่แทนการเลื่อนแนวนอน เพราะบนไอแพดแนวตั้งแถบเมนูยาวเกินจอ
            แล้วไม่มีอะไรบอกว่าปัดต่อได้ ทำให้แท็บท้าย ๆ เหมือนหายไปทั้งที่มีอยู่ */}
        <div className="mx-auto flex max-w-[1400px] flex-wrap gap-1.5 px-2 py-2 sm:px-5">
          {tabs.map((t) => {
            const Icon = t.icon;
            const locked = t.requiresStart && !started;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => goTo(t.id)}
                aria-current={active ? 'page' : undefined}
                className={`relative flex shrink-0 items-center gap-1.5 rounded-2xl px-2.5 py-1.5 font-display text-xs font-semibold transition-all duration-150 active:translate-y-[2px] sm:gap-2 sm:px-4 sm:py-2 sm:text-sm ${
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
                <Icon className="hidden h-4 w-4 sm:block" aria-hidden="true" />
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

      <main className="mx-auto max-w-[1400px] px-3 pb-24 pt-5 sm:px-5 sm:pb-28 sm:pt-6">
        {tab === 'start' && <StartPage onStarted={() => setTab('simulator')} />}
        {tab === 'simulator' && <SimulatorPage />}
        {tab === 'knowledge' && <KnowledgePage />}
        {tab === 'live' && <LivePage />}
        {tab === 'worksheet' && <WorksheetPage />}
        {tab === 'summary' && <SummaryPage onNavigate={goTo} />}
        {tab === 'guide' && <StudentGuidePage />}
        {tab === 'dashboard' && <DashboardPage />}
      </main>

      {/* ตัวจับเวลาและคำสั่งสลับบทบาทแสดงเฉพาะเครื่อง Driver
          เพื่อให้ทั้งคู่ดูเวลาจากจอเดียวกัน ไม่เดินคนละนาฬิกา */}
      {state.session.deviceMode === 'primary' && (
        <>
          <FloatingRoleTimer />
          <RoleSwapOverlay />
        </>
      )}

      <footer className="mt-4 border-t-2 border-white bg-white/80 py-5">
        <div className="mx-auto max-w-[1400px] px-4 text-center text-xs leading-relaxed text-slate-500">
          <p>
            Interactive Logic Simulator | สื่อนวัตกรรมประกอบการเรียนรู้ รายวิชาเพิ่มเติม คอมพิวเตอร์ 4 (ว32281)
            ชั้นมัธยมศึกษาปีที่ 5
          </p>
          <p className="mt-1 font-semibold text-slate-600">
            ผู้สอน: {settings.teacherName} | {settings.school}
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
