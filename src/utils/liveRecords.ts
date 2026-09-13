import { LIVE_ACTIVITIES, getPreset } from '../data/liveActivities';
import type { LiveActivityPreset, LiveResponse } from '../types/live';

/**
 * รวบรวมคำตอบกิจกรรมสดให้กลายเป็นบันทึกร่องรอยการทำกิจกรรม
 * ใช้เป็นหลักฐานเชิงประจักษ์ประกอบการประเมิน ว.PA
 */

/** ถอดรหัสกิจกรรมกลับเป็นรหัสกิจกรรมในคลัง รองรับข้อมูลที่บันทึกด้วยรูปแบบเก่าด้วย */
export const presetIdFromActivityId = (activityId: string): string => {
  if (activityId.includes('::')) return activityId.split('::').pop() ?? activityId;
  // รูปแบบเก่าคือ รหัสกิจกรรม ตามด้วยขีดและเวลาที่กดเปิด
  const known = LIVE_ACTIVITIES.map((a) => a.id).sort((a, b) => b.length - a.length);
  return known.find((id) => activityId === id || activityId.startsWith(`${id}-`)) ?? activityId;
};

export interface ActivityRecord {
  activityId: string;
  presetId: string;
  preset?: LiveActivityPreset;
  /** ชื่อที่ใช้แสดง ใช้ชื่อจากคลังถ้าหาเจอ ไม่งั้นใช้รหัสกิจกรรม */
  title: string;
  step: number;
  responses: LiveResponse[];
  /** จำนวนผู้ตอบแบบไม่นับซ้ำ */
  people: number;
  /** คะแนนเฉลี่ยและคะแนนเต็ม ใช้เฉพาะกิจกรรมที่ตรวจคะแนนได้ */
  scored: boolean;
  avgScore: number;
  total: number;
  firstAt: string;
  lastAt: string;
}

const personKey = (r: LiveResponse) => `${r.studentName.trim()}|${r.studentNumber.trim()}`;

/** จัดกลุ่มคำตอบตามกิจกรรม เรียงตามขั้น GPAS แล้วตามเวลาที่เริ่มมีคำตอบ */
export const buildActivityRecords = (responses: LiveResponse[]): ActivityRecord[] => {
  const groups = new Map<string, LiveResponse[]>();
  responses.forEach((r) => {
    groups.set(r.activityId, [...(groups.get(r.activityId) ?? []), r]);
  });

  const records: ActivityRecord[] = [...groups.entries()].map(([activityId, list]) => {
    const presetId = presetIdFromActivityId(activityId);
    const preset = getPreset(presetId);
    const times = list.map((r) => r.submittedAt).filter(Boolean).sort();
    const scored = list.some((r) => r.total > 0);
    const withScore = list.filter((r) => r.total > 0);
    return {
      activityId,
      presetId,
      preset,
      title: preset?.title ?? presetId,
      step: preset?.step ?? 9,
      responses: [...list].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt)),
      people: new Set(list.map(personKey)).size,
      scored,
      avgScore: withScore.length
        ? withScore.reduce((s, r) => s + r.score, 0) / withScore.length
        : 0,
      total: withScore[0]?.total ?? 0,
      firstAt: times[0] ?? '',
      lastAt: times[times.length - 1] ?? '',
    };
  });

  return records.sort((a, b) => a.step - b.step || a.firstAt.localeCompare(b.firstAt));
};

export interface StudentRecord {
  key: string;
  studentName: string;
  studentNumber: string;
  pairCode: string;
  /** รหัสกิจกรรมที่คนนี้ตอบไปแล้ว */
  joined: Set<string>;
  /** คะแนนรวมและคะแนนเต็มรวม เฉพาะกิจกรรมที่ตรวจคะแนนได้ */
  score: number;
  total: number;
}

/** สรุปการเข้าร่วมรายบุคคล เรียงตามเลขที่ถ้ามี ไม่งั้นเรียงตามชื่อ */
export const buildStudentRecords = (responses: LiveResponse[]): StudentRecord[] => {
  const map = new Map<string, StudentRecord>();
  responses.forEach((r) => {
    const key = personKey(r);
    const found = map.get(key) ?? {
      key,
      studentName: r.studentName,
      studentNumber: r.studentNumber,
      pairCode: r.pairCode,
      joined: new Set<string>(),
      score: 0,
      total: 0,
    };
    found.joined.add(r.activityId);
    if (r.total > 0) {
      found.score += r.score;
      found.total += r.total;
    }
    if (!found.pairCode && r.pairCode) found.pairCode = r.pairCode;
    map.set(key, found);
  });

  return [...map.values()].sort((a, b) => {
    const na = Number(a.studentNumber);
    const nb = Number(b.studentNumber);
    if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) return na - nb;
    return a.studentName.localeCompare(b.studentName, 'th');
  });
};

const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

/**
 * ตารางการเข้าร่วมรายบุคคล หนึ่งแถวต่อหนึ่งคน หนึ่งคอลัมน์ต่อหนึ่งกิจกรรม
 * ช่องที่เข้าร่วมใส่คะแนนถ้ามี ไม่มีคะแนนใส่เครื่องหมายถูก ยังไม่ได้ทำเว้นว่าง
 */
export const attendanceToCsv = (
  records: ActivityRecord[],
  students: StudentRecord[],
  classroom: string,
): string => {
  const headers = ['ห้องเรียน', 'เลขที่', 'ชื่อ-สกุล', 'รหัสคู่', ...records.map((r) => r.title), 'เข้าร่วม (กิจกรรม)', 'คะแนนรวม'];

  const lines = students.map((s) => {
    const cells = records.map((rec) => {
      if (!s.joined.has(rec.activityId)) return '';
      const mine = rec.responses.find(
        (r) => r.studentName.trim() === s.studentName.trim() && r.studentNumber.trim() === s.studentNumber.trim(),
      );
      if (rec.scored && mine) return `${mine.score}/${mine.total}`;
      return '✓';
    });
    return [
      classroom,
      s.studentNumber,
      s.studentName,
      s.pairCode,
      ...cells,
      `${s.joined.size}/${records.length}`,
      s.total ? `${s.score}/${s.total}` : '',
    ]
      .map(esc)
      .join(',');
  });

  // BOM เพื่อให้ Excel เปิดไฟล์ภาษาไทยได้ถูกต้อง
  return '﻿' + [headers.map(esc).join(','), ...lines].join('\n');
};
