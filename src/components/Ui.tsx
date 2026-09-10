import { useId, useState, type ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';
import { Mascot } from './Illustrations';

/* ---------- การ์ดพื้นฐานแบบ 3 มิติ ---------- */

export const Card = ({
  title,
  subtitle,
  icon,
  actions,
  children,
  className = '',
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <section className={`clay-card overflow-hidden ${className}`}>
    {(title || actions) && (
      <header className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-dashed border-slate-100 px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          {icon && (
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-slate-100 shadow-clay-sm">
              {icon}
            </span>
          )}
          <div className="min-w-0">
            {title && (
              <h2 className="font-display text-[17px] font-bold leading-snug text-slate-800">
                {title}
              </h2>
            )}
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </header>
    )}
    <div className="px-4 py-4 sm:px-5">{children}</div>
  </section>
);

/* ---------- Tooltip อธิบายคำศัพท์ ---------- */

export const Tooltip = ({ term, children }: { term: string; children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-lg bg-think-50 px-1.5 py-0.5 font-semibold text-think-700 underline decoration-think-300 decoration-wavy underline-offset-4 transition hover:bg-think-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-think-400"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        aria-describedby={open ? id : undefined}
        aria-label={`คำอธิบายของ ${term}`}
      >
        {term}
        <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-40 mb-2 w-64 -translate-x-1/2 animate-pop rounded-2xl bg-slate-800 px-3.5 py-2.5 text-xs font-normal leading-relaxed text-white shadow-lg"
        >
          {children}
          <span
            className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1.5 rotate-45 bg-slate-800"
            aria-hidden="true"
          />
        </span>
      )}
    </span>
  );
};

/* ---------- ปุ่มกดแบบ 3 มิติ ---------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger' | 'purple';

/** สีตัวปุ่ม + สีขอบล่างที่ทำให้ปุ่มดูหนาเป็น 3 มิติ */
const BUTTON_STYLES: Record<ButtonVariant, { base: string; edge: string }> = {
  primary: {
    base: 'bg-gradient-to-b from-brand-400 to-brand-600 text-white focus-visible:ring-brand-400',
    edge: '#2f3aa1',
  },
  secondary: {
    base: 'bg-gradient-to-b from-white to-slate-50 text-slate-700 focus-visible:ring-slate-300',
    edge: '#cbd5e1',
  },
  ghost: {
    base: 'bg-white/60 text-slate-600 focus-visible:ring-slate-300',
    edge: '#e2e8f0',
  },
  success: {
    base: 'bg-gradient-to-b from-mint-400 to-mint-600 text-white focus-visible:ring-mint-400',
    edge: '#0e7851',
  },
  danger: {
    base: 'bg-gradient-to-b from-bubble-400 to-bubble-600 text-white focus-visible:ring-bubble-400',
    edge: '#a11349',
  },
  purple: {
    base: 'bg-gradient-to-b from-think-400 to-think-600 text-white focus-visible:ring-think-400',
    edge: '#68239f',
  },
};

export const Button = ({
  variant = 'primary',
  className = '',
  children,
  style,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) => {
  const v = BUTTON_STYLES[variant];
  return (
    <button
      className={`btn-3d inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 font-display text-sm font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-45 ${v.base} ${className}`}
      style={
        {
          boxShadow: `0 4px 0 0 ${v.edge}, 0 8px 16px -8px rgba(15,23,42,0.45)`,
          '--btn-edge': v.edge,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      {children}
    </button>
  );
};

/* ---------- ฟิลด์กรอกข้อมูล ---------- */

export const TextField = ({
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  hint,
  type = 'text',
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  type?: string;
  inputMode?: 'text' | 'numeric' | 'url';
}) => {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-bubble-500" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only"> (จำเป็นต้องกรอก)</span>}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        placeholder={placeholder}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-2xl border-2 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
          error
            ? 'border-bubble-300 bg-bubble-50 focus:border-bubble-400 focus:ring-bubble-100'
            : 'border-slate-200 bg-white focus:border-brand-400 focus:ring-brand-100'
        }`}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-bubble-700"
        >
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};

export const TextArea = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required,
  hint,
}: {
  label: ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  hint?: string;
}) => {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-bubble-500" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only"> (จำเป็นต้องกรอก)</span>}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        aria-required={required}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-2xl border-2 border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
};

/* ---------- Empty State พร้อมมาสคอต ---------- */

export const EmptyState = ({
  icon,
  title,
  description,
  showMascot = true,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  showMascot?: boolean;
}) => (
  <div className="flex flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-think-200 bg-gradient-to-b from-white to-think-50/60 px-6 py-8 text-center">
    {showMascot ? (
      <Mascot size={84} mood="think" className="animate-float" />
    ) : (
      <span className="mb-3 text-think-300">{icon}</span>
    )}
    <p className="mt-2 font-display text-sm font-bold text-slate-700">{title}</p>
    <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">{description}</p>
  </div>
);

/* ---------- แถบความคืบหน้าแบบ 3 มิติ ---------- */

export const ProgressBar = ({ percent, label }: { percent: number; label: string }) => (
  <div>
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <span
        className={`font-display text-base font-bold ${
          percent === 100 ? 'text-mint-600' : 'text-brand-600'
        }`}
      >
        {percent}%
      </span>
    </div>
    <div
      className="h-4 w-full overflow-hidden rounded-full bg-slate-200/80 shadow-inner3d"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={`relative h-full rounded-full transition-all duration-700 ${
          percent === 100
            ? 'bg-gradient-to-r from-mint-300 to-mint-500'
            : percent >= 50
              ? 'bg-gradient-to-r from-brand-300 to-brand-500'
              : 'bg-gradient-to-r from-lemon-300 to-peach-400'
        }`}
        style={{ width: `${Math.max(percent, 3)}%` }}
      >
        <span
          className="absolute inset-x-1 top-0.5 h-1 rounded-full bg-white/50"
          aria-hidden="true"
        />
      </div>
    </div>
  </div>
);

/* ---------- ป้ายสถานะกลม ๆ ---------- */

export const Pill = ({
  tone = 'brand',
  children,
}: {
  tone?: 'brand' | 'think' | 'mint' | 'peach' | 'bubble' | 'slate';
  children: ReactNode;
}) => {
  const tones: Record<string, string> = {
    brand: 'bg-brand-100 text-brand-800 border-brand-200',
    think: 'bg-think-100 text-think-800 border-think-200',
    mint: 'bg-mint-100 text-mint-800 border-mint-200',
    peach: 'bg-peach-100 text-peach-800 border-peach-200',
    bubble: 'bg-bubble-100 text-bubble-800 border-bubble-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
};
