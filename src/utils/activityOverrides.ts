import type { LiveActivityPreset } from '../types/live';
import type { AppSettings } from '../types/settings';

/**
 * รวมค่าที่ครูแก้ไว้ในหน้าตั้งค่าระบบเข้ากับกิจกรรมตั้งต้นในคลัง
 *
 * ครูแก้เฉพาะบางช่องได้ ช่องที่เว้นว่างไว้จะใช้ข้อความตั้งต้นเสมอ
 * ทำให้ค่าตั้งที่กรอกไม่ครบไม่ทำให้กิจกรรมกลายเป็นช่องว่าง
 */
export const applyOverrides = (
  preset: LiveActivityPreset,
  settings: AppSettings,
): LiveActivityPreset => {
  const ov = settings.activityOverrides[preset.id];
  const next: LiveActivityPreset = {
    ...preset,
    title: ov?.title?.trim() || preset.title,
    prompt: ov?.prompt?.trim() || preset.prompt,
  };
  // ข้อสอบก่อนเรียนแก้ได้ทั้งชุด ถ้าครูยังไม่เคยแก้จะใช้ชุดตั้งต้น
  if (preset.id === 'pretest_5' && settings.pretestQuestions?.length) {
    next.questions = settings.pretestQuestions;
  }
  return next;
};
