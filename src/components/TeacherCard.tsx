import { useState } from 'react';
import { GraduationCap, School } from 'lucide-react';
import { TEACHER_INFO } from '../config';

/**
 * รูปครูผู้สอนแบบวงกลมพร้อมขอบไล่เฉดสี 3 มิติ
 * ถ้าโหลดไฟล์ public/teacher.jpg ไม่สำเร็จ จะสลับไปแสดงอักษรย่อแทนทันที
 * (ออกแบบไว้แบบนี้เพื่อให้ระบบใช้งานได้ทันทีแม้ครูยังไม่ได้ใส่ไฟล์รูป)
 */
export const TeacherAvatar = ({ size = 96 }: { size?: number }) => {
  const [failed, setFailed] = useState(false);

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-300 via-think-400 to-bubble-400 p-[3px]"
      style={{
        width: size,
        height: size,
        boxShadow:
          '0 7px 0 -1px rgba(86,30,128,0.35), 0 16px 26px -14px rgba(15,23,42,0.6), inset 0 2px 4px rgba(255,255,255,0.6)',
      }}
    >
      {failed ? (
        <span
          className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-think-600 font-display font-bold text-white"
          style={{ fontSize: size * 0.34 }}
          aria-hidden="true"
        >
          {TEACHER_INFO.initials}
        </span>
      ) : (
        // ครอบด้วยวงกลมที่ตัดส่วนเกิน เพื่อให้ซูมเข้าหาใบหน้าได้โดยรูปไม่ล้นกรอบ
        <span className="h-full w-full overflow-hidden rounded-full bg-white">
          <img
            src={TEACHER_INFO.photo}
            alt={`รูปของ${TEACHER_INFO.name}`}
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
            style={{
              transform: `scale(${TEACHER_INFO.photoZoom})`,
              transformOrigin: TEACHER_INFO.photoPosition,
            }}
            loading="lazy"
          />
        </span>
      )}
    </span>
  );
};

/** การ์ดแนะนำครูผู้สอน ใช้ได้ทั้งหน้าเริ่มต้นใช้งานและหน้าคู่มือครู */
export const TeacherCard = ({
  size = 84,
  className = '',
}: {
  size?: number;
  className?: string;
}) => (
  <div
    className={`flex flex-wrap items-center gap-4 rounded-[1.5rem] border-2 border-brand-100 bg-gradient-to-br from-brand-50 via-white to-bubble-50 p-4 ${className}`}
  >
    <TeacherAvatar size={size} />
    <div className="min-w-0">
      <p className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-brand-700 shadow-clay-sm">
        <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
        ครูผู้สอน
      </p>
      <p className="mt-1 font-display text-lg font-bold leading-snug text-slate-800">
        {TEACHER_INFO.name}
      </p>
      <p className="text-sm text-slate-600">{TEACHER_INFO.position}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-think-700">
        <School className="h-4 w-4 shrink-0" aria-hidden="true" />
        {TEACHER_INFO.school}
      </p>
    </div>
  </div>
);

/**
 * แบนเนอร์ภาพแนวนอนของครูผู้สอน (public/teacher-banner.jpg)
 * ถ้าไม่มีไฟล์ ระบบจะไม่แสดงอะไรเลย ไม่ทิ้งช่องว่างหรือรูปแตกไว้ในหน้า
 */
export const TeacherBanner = ({ className = '' }: { className?: string }) => {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <figure
      className={`overflow-hidden rounded-[1.5rem] border-4 border-white bg-slate-100 shadow-clay ${className}`}
    >
      {/* บังคับสัดส่วนคงที่ ไม่ว่าครูจะใส่รูปขนาดใดก็แสดงผลสวยเท่ากัน */}
      <div className="aspect-[16/7] w-full overflow-hidden">
        <img
          src={TEACHER_INFO.banner}
          alt={`ภาพประกอบการสอนของ${TEACHER_INFO.name} ${TEACHER_INFO.school}`}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <figcaption className="bg-gradient-to-r from-brand-600 via-think-600 to-bubble-500 px-4 py-2 text-center font-display text-xs font-bold text-white sm:text-sm">
        {TEACHER_INFO.name} | {TEACHER_INFO.school}
      </figcaption>
    </figure>
  );
};
