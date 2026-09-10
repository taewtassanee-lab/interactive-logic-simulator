/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* น้ำเงิน: เทคโนโลยีและความน่าเชื่อถือ */
        brand: {
          50: '#eef3ff',
          100: '#dee7ff',
          200: '#c3d3ff',
          300: '#9db4ff',
          400: '#7a92ff',
          500: '#5b73f8',
          600: '#4453ea',
          700: '#3641c7',
          800: '#2f3aa1',
          900: '#2b357f',
        },
        /* ม่วง: การคิดวิเคราะห์ */
        think: {
          50: '#faf3ff',
          100: '#f3e6ff',
          200: '#e8d0ff',
          300: '#d6adff',
          400: '#bf80fb',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c28c4',
          800: '#68239f',
          900: '#561e80',
        },
        /* ชมพู: จุดเน้นและความน่ารัก */
        bubble: {
          50: '#fff1f7',
          100: '#ffe3ef',
          200: '#ffc8de',
          300: '#ff9dc3',
          400: '#ff6ea5',
          500: '#fb4587',
          600: '#e91f6b',
          700: '#c31356',
          800: '#a11349',
          900: '#861440',
        },
        /* เขียว: ผ่านภารกิจ/สำเร็จ */
        mint: {
          50: '#eefdf5',
          100: '#d6fae7',
          200: '#b0f3d2',
          300: '#78e7b6',
          400: '#3fd394',
          500: '#1abb79',
          600: '#0f9762',
          700: '#0e7851',
          800: '#105f42',
          900: '#0e4e38',
        },
        /* ส้ม: คำเตือน */
        peach: {
          50: '#fff6ed',
          100: '#ffead4',
          200: '#ffd1a8',
          300: '#ffb171',
          400: '#ff8838',
          500: '#fd6912',
          600: '#ee4e08',
          700: '#c53809',
          800: '#9c2e10',
          900: '#7e2810',
        },
        /* เหลือง: เหรียญตราและคำใบ้ */
        lemon: {
          50: '#fffbea',
          100: '#fff4c6',
          200: '#ffe888',
          300: '#ffd54a',
          400: '#ffc020',
          500: '#f99d07',
          600: '#dd7502',
          700: '#b75206',
          800: '#943f0c',
          900: '#7a350d',
        },
      },
      fontFamily: {
        /* ฟอนต์หัวเรื่องแบบลายมือกลมมน ให้ความรู้สึกเป็นมิตรกับผู้เรียน */
        display: ['"Mali"', '"IBM Plex Sans Thai"', 'Tahoma', 'sans-serif'],
        /* ฟอนต์เนื้อหา เน้นอ่านง่ายเป็นหลัก */
        thai: ['"IBM Plex Sans Thai"', '"Noto Sans Thai"', 'Tahoma', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Consolas"', '"Courier New"', 'monospace'],
      },
      borderRadius: {
        blob: '2rem',
      },
      boxShadow: {
        /* เงาแบบ 3 มิติ: ขอบหนาด้านล่าง + เงาฟุ้งรอบนอก */
        clay: '0 10px 0 -2px rgba(148,163,184,0.22), 0 18px 32px -18px rgba(51,65,85,0.45)',
        'clay-sm': '0 5px 0 -1px rgba(148,163,184,0.2), 0 10px 18px -12px rgba(51,65,85,0.4)',
        pop: '0 14px 34px -16px rgba(68,83,234,0.55)',
        inner3d: 'inset 0 2px 6px rgba(255,255,255,0.7), inset 0 -6px 12px rgba(15,23,42,0.08)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-14px) rotate(4deg)' },
        },
        pop: {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '70%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        blink: {
          '0%, 92%, 100%': { transform: 'scaleY(1)' },
          '96%': { transform: 'scaleY(0.1)' },
        },
        shine: {
          '0%': { transform: 'translateX(-120%)' },
          '60%, 100%': { transform: 'translateX(220%)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'float-slow': 'float-slow 7s ease-in-out infinite',
        pop: 'pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        blink: 'blink 5s ease-in-out infinite',
        shine: 'shine 2.6s ease-in-out infinite',
        wiggle: 'wiggle 0.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
