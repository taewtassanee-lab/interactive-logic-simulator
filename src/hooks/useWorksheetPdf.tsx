import { useCallback, useRef, useState } from 'react';
import { PrintableWorksheet } from '../components/PrintableWorksheet';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { buildPdfFileName, getMissingWorksheetFields } from '../utils/format';
import { exportElementToPdf } from '../utils/pdf';

/**
 * รวมขั้นตอนการสร้าง PDF ไว้ที่เดียว ใช้ได้ทั้งหน้าใบงานและหน้าสรุปงาน
 * คืน node ที่ต้องวางไว้ในหน้า (ซ่อนออกนอกจอ) เพื่อให้ html2canvas จับภาพได้
 */
export const useWorksheetPdf = () => {
  const { state, update } = useApp();
  const { notify } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const exportPdf = useCallback(
    async (options?: { force?: boolean }) => {
      const missing = getMissingWorksheetFields(state.worksheet);

      if (missing.length > 0 && !options?.force) {
        notify(
          `ใบงานยังไม่ครบอีก ${missing.length} รายการ เช่น ${missing[0].label} กรุณากรอกให้ครบก่อนสร้าง PDF`,
          'warn',
        );
        return false;
      }

      if (!printRef.current) {
        notify('ยังเตรียมเอกสารไม่เสร็จ กรุณาลองใหม่อีกครั้ง', 'error');
        return false;
      }

      setBusy(true);
      try {
        const fileName = buildPdfFileName(state.pair.classroom, state.pair.pairCode);
        await exportElementToPdf(printRef.current, fileName);
        update({ pdfGeneratedAt: new Date().toISOString() });
        notify(`ดาวน์โหลดไฟล์ ${fileName} เรียบร้อยแล้ว`, 'success');
        return true;
      } catch (error) {
        const detail = error instanceof Error ? error.message : 'ไม่ทราบสาเหตุ';
        notify(`สร้าง PDF ไม่สำเร็จ: ${detail} กรุณาลองใหม่ หรือใช้เมนู Print ของเบราว์เซอร์แทน`, 'error');
        return false;
      } finally {
        setBusy(false);
      }
    },
    [notify, state.pair.classroom, state.pair.pairCode, state.worksheet, update],
  );

  /** วางไว้นอกจอ ไม่ใช่ display:none เพราะ html2canvas ต้องการ layout จริง */
  const printNode = (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', left: '-10000px', top: 0, zIndex: -1, pointerEvents: 'none' }}
    >
      <PrintableWorksheet ref={printRef} state={state} />
    </div>
  );

  return { exportPdf, printNode, busy };
};
