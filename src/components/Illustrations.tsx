/**
 * ภาพประกอบ 3 มิติทั้งหมดของระบบ วาดด้วย SVG ล้วน
 * เหตุผลที่ไม่ใช้ไลบรารี 3D (เช่น three.js): เว็บนี้ต้องเปิดได้ลื่นบนคอมพิวเตอร์โรงเรียน
 * และบนมือถือของนักเรียน SVG + CSS จึงเหมาะกว่าทั้งเรื่องขนาดไฟล์และความเข้ากันได้
 */

/* ---------- มาสคอตประจำระบบ: หุ่นยนต์นักดีบัก ---------- */

export const Mascot = ({
  size = 96,
  className = '',
  mood = 'happy',
}: {
  size?: number;
  className?: string;
  mood?: 'happy' | 'think' | 'cheer';
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    className={className}
    role="img"
    aria-label="มาสคอตหุ่นยนต์นักดีบักประจำระบบ"
  >
    <defs>
      <linearGradient id="m-body" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0%" stopColor="#8ea3ff" />
        <stop offset="55%" stopColor="#5b73f8" />
        <stop offset="100%" stopColor="#3641c7" />
      </linearGradient>
      <linearGradient id="m-face" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
      <radialGradient id="m-cheek" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#ff9dc3" />
        <stop offset="100%" stopColor="#ff6ea5" stopOpacity="0.15" />
      </radialGradient>
      <linearGradient id="m-ant" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffe888" />
        <stop offset="100%" stopColor="#f99d07" />
      </linearGradient>
    </defs>

    {/* เงาใต้ตัว ทำให้ดูลอยอยู่เหนือพื้น */}
    <ellipse cx="60" cy="110" rx="30" ry="6" fill="#4453ea" opacity="0.16" />

    {/* เสาอากาศ */}
    <path d="M60 20 L60 30" stroke="#3641c7" strokeWidth="4" strokeLinecap="round" />
    <circle cx="60" cy="15" r="7" fill="url(#m-ant)" />
    <circle cx="57.5" cy="12.5" r="2.2" fill="#fffbea" opacity="0.9" />

    {/* หูข้าง */}
    <rect x="10" y="56" width="12" height="24" rx="6" fill="#3641c7" />
    <rect x="98" y="56" width="12" height="24" rx="6" fill="#3641c7" />

    {/* ตัวหุ่น */}
    <rect x="18" y="30" width="84" height="72" rx="26" fill="url(#m-body)" />
    {/* แสงสะท้อนด้านบน ให้ความรู้สึกเป็นวัตถุ 3 มิติ */}
    <rect x="27" y="36" width="66" height="20" rx="10" fill="#ffffff" opacity="0.22" />
    {/* เงาด้านล่างภายในตัว */}
    <path
      d="M18 82 Q60 104 102 82 L102 76 Q60 96 18 76 Z"
      fill="#2b357f"
      opacity="0.25"
    />

    {/* หน้าจอ */}
    <rect x="30" y="48" width="60" height="40" rx="16" fill="url(#m-face)" />
    <rect x="34" y="52" width="52" height="12" rx="6" fill="#ffffff" opacity="0.08" />

    {/* ตา */}
    <g className="origin-center animate-blink">
      {mood === 'think' ? (
        <>
          <rect x="42" y="64" width="12" height="4" rx="2" fill="#7ee7ff" />
          <rect x="66" y="64" width="12" height="4" rx="2" fill="#7ee7ff" />
        </>
      ) : (
        <>
          <circle cx="48" cy="66" r="6.5" fill="#7ee7ff" />
          <circle cx="72" cy="66" r="6.5" fill="#7ee7ff" />
          <circle cx="46" cy="63.5" r="2.2" fill="#ffffff" />
          <circle cx="70" cy="63.5" r="2.2" fill="#ffffff" />
        </>
      )}
    </g>

    {/* แก้ม */}
    <circle cx="37" cy="76" r="6" fill="url(#m-cheek)" />
    <circle cx="83" cy="76" r="6" fill="url(#m-cheek)" />

    {/* ปาก */}
    {mood === 'cheer' ? (
      <path d="M52 76 Q60 86 68 76 Q60 82 52 76 Z" fill="#ff9dc3" />
    ) : (
      <path
        d="M53 76 Q60 82 67 76"
        stroke="#7ee7ff"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    )}
  </svg>
);

/* ---------- ตัวแมลง Bug สำหรับภารกิจแก้ปัญหา ---------- */

export const BugBuddy = ({ size = 64, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={className}
    role="img"
    aria-label="ภาพประกอบตัว Bug"
  >
    <defs>
      <linearGradient id="b-body" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stopColor="#ff9dc3" />
        <stop offset="60%" stopColor="#fb4587" />
        <stop offset="100%" stopColor="#c31356" />
      </linearGradient>
    </defs>
    <ellipse cx="50" cy="90" rx="24" ry="5" fill="#c31356" opacity="0.18" />
    {/* ขา */}
    <g stroke="#a11349" strokeWidth="5" strokeLinecap="round">
      <path d="M26 46 L12 38" />
      <path d="M26 58 L11 58" />
      <path d="M26 70 L13 79" />
      <path d="M74 46 L88 38" />
      <path d="M74 58 L89 58" />
      <path d="M74 70 L87 79" />
    </g>
    {/* หนวด */}
    <path d="M40 26 L32 14" stroke="#a11349" strokeWidth="4" strokeLinecap="round" />
    <path d="M60 26 L68 14" stroke="#a11349" strokeWidth="4" strokeLinecap="round" />
    <circle cx="31" cy="12" r="4" fill="#ffc020" />
    <circle cx="69" cy="12" r="4" fill="#ffc020" />
    {/* ลำตัว */}
    <ellipse cx="50" cy="56" rx="26" ry="30" fill="url(#b-body)" />
    <ellipse cx="42" cy="42" rx="9" ry="7" fill="#ffffff" opacity="0.3" />
    <path d="M50 30 L50 84" stroke="#a11349" strokeWidth="2.5" opacity="0.5" />
    <circle cx="37" cy="60" r="4" fill="#a11349" opacity="0.45" />
    <circle cx="63" cy="66" r="3.5" fill="#a11349" opacity="0.45" />
    {/* ตา */}
    <circle cx="42" cy="46" r="5.5" fill="#ffffff" />
    <circle cx="58" cy="46" r="5.5" fill="#ffffff" />
    <circle cx="43" cy="47" r="2.6" fill="#1e293b" />
    <circle cx="59" cy="47" r="2.6" fill="#1e293b" />
  </svg>
);

/* ---------- ลูกบาศก์ไอโซเมตริก แทนข้อสอบ 1 ข้อใน Array ---------- */

type CubeTone = 'brand' | 'think' | 'mint' | 'peach' | 'bubble' | 'lemon' | 'ghost';

const CUBE_COLORS: Record<CubeTone, { top: string; left: string; right: string; text: string }> = {
  brand: { top: '#9db4ff', left: '#5b73f8', right: '#3641c7', text: '#ffffff' },
  think: { top: '#d6adff', left: '#a855f7', right: '#7c28c4', text: '#ffffff' },
  mint: { top: '#78e7b6', left: '#1abb79', right: '#0e7851', text: '#ffffff' },
  peach: { top: '#ffb782', left: '#fb7c25', right: '#c4520c', text: '#ffffff' },
  bubble: { top: '#ff9ec4', left: '#f2497f', right: '#bb1c56', text: '#ffffff' },
  lemon: { top: '#ffd75e', left: '#f0ab08', right: '#b87706', text: '#5a3a01' },
  ghost: { top: '#e2e8f0', left: '#cbd5e1', right: '#94a3b8', text: '#64748b' },
};

export const IsoCube = ({
  label,
  index,
  tone = 'brand',
  highlighted = false,
}: {
  label: string;
  index: number;
  tone?: CubeTone;
  highlighted?: boolean;
}) => {
  const c = CUBE_COLORS[tone];
  return (
    <div
      className={`flex animate-pop flex-col items-center ${highlighted ? 'scale-110' : ''} transition-transform`}
      title={`ข้อสอบ ${label} อยู่ที่ตำแหน่ง Index ${index}`}
    >
      <svg width="46" height="52" viewBox="0 0 60 68" aria-hidden="true">
        {highlighted && (
          <ellipse cx="30" cy="62" rx="22" ry="5" fill="#a855f7" opacity="0.35" />
        )}
        {/* หน้าบน */}
        <path d="M30 2 L58 17 L30 32 L2 17 Z" fill={c.top} />
        {/* หน้าซ้าย */}
        <path d="M2 17 L30 32 L30 62 L2 47 Z" fill={c.left} />
        {/* หน้าขวา */}
        <path d="M58 17 L30 32 L30 62 L58 47 Z" fill={c.right} />
        {/* แสงสะท้อนขอบบน */}
        <path d="M30 2 L58 17 L30 32 L2 17 Z" fill="#ffffff" opacity="0.18" />
        <text
          x="30"
          y="49"
          textAnchor="middle"
          fontSize="13"
          fontWeight="700"
          fill={c.text}
          fontFamily="JetBrains Mono, monospace"
        >
          {label}
        </text>
      </svg>
      <span className="-mt-1 rounded-full bg-white/80 px-1.5 font-mono text-[10px] font-semibold text-slate-500">
        [{index}]
      </span>
    </div>
  );
};

/* ---------- เหรียญตรา 3 มิติ ---------- */

export const Medal3D = ({
  tone,
  earned,
  children,
}: {
  tone: 'brand' | 'bubble' | 'think';
  earned: boolean;
  children: React.ReactNode;
}) => {
  const rings: Record<string, string> = {
    brand: 'from-brand-300 via-brand-500 to-brand-700',
    bubble: 'from-bubble-300 via-bubble-500 to-bubble-700',
    think: 'from-think-300 via-think-500 to-think-700',
  };
  return (
    <span className="relative inline-flex flex-col items-center">
      <span
        className={`relative flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gradient-to-br text-white ${
          earned ? `${rings[tone]} shine-wrap animate-float` : 'from-slate-200 to-slate-400'
        }`}
        style={{
          boxShadow: earned
            ? '0 8px 0 -1px rgba(15,23,42,0.18), 0 16px 26px -14px rgba(15,23,42,0.6), inset 0 3px 6px rgba(255,255,255,0.6)'
            : '0 5px 0 -1px rgba(148,163,184,0.5), inset 0 3px 6px rgba(255,255,255,0.4)',
        }}
      >
        <span className="absolute inset-[7px] rounded-full border-2 border-white/40" />
        <span className="relative z-10">{children}</span>
      </span>
      {/* ริบบิ้นใต้เหรียญ */}
      <span
        className={`-mt-1.5 h-3 w-8 rounded-b-md ${
          earned ? 'bg-lemon-400' : 'bg-slate-300'
        }`}
        aria-hidden="true"
      />
    </span>
  );
};

/* ---------- ก้อนกลมตกแต่งพื้นหลัง ---------- */

export const FloatingShapes = () => (
  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
    <svg className="absolute -left-16 top-24 h-56 w-56 animate-float-slow opacity-50" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="s1" cx="0.35" cy="0.3">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#c3d3ff" />
          <stop offset="100%" stopColor="#5b73f8" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="34" fill="url(#s1)" />
    </svg>

    <svg
      className="absolute right-4 top-[38%] h-40 w-40 animate-float opacity-40"
      viewBox="0 0 100 100"
      style={{ animationDelay: '1.2s' }}
    >
      <defs>
        <radialGradient id="s2" cx="0.35" cy="0.3">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#e8d0ff" />
          <stop offset="100%" stopColor="#a855f7" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="30" fill="url(#s2)" />
    </svg>

    <svg
      className="absolute -right-10 bottom-16 h-48 w-48 animate-float-slow opacity-40"
      viewBox="0 0 100 100"
      style={{ animationDelay: '0.6s' }}
    >
      <defs>
        <radialGradient id="s3" cx="0.35" cy="0.3">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#ffc8de" />
          <stop offset="100%" stopColor="#fb4587" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="32" fill="url(#s3)" />
    </svg>

    <svg
      className="absolute left-[18%] bottom-6 h-28 w-28 animate-float opacity-35"
      viewBox="0 0 100 100"
      style={{ animationDelay: '2s' }}
    >
      <defs>
        <radialGradient id="s4" cx="0.35" cy="0.3">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#b0f3d2" />
          <stop offset="100%" stopColor="#1abb79" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="28" fill="url(#s4)" />
    </svg>
  </div>
);
