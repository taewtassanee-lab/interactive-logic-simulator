import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * สร้าง PDF จาก DOM ที่แสดงผลภาษาไทยได้ถูกต้องอยู่แล้ว
 *
 * เหตุผลที่ใช้วิธี HTML -> Canvas -> PDF แทนการ addFont ภาษาไทยเข้า jsPDF โดยตรง
 * 1) jsPDF ใช้ฟอนต์มาตรฐาน (Helvetica) ที่ไม่มีสระและวรรณยุกต์ไทย ข้อความไทยจะกลายเป็นสี่เหลี่ยม
 * 2) การฝังฟอนต์ไทยแบบ TTF ต้องแปลงเป็น base64 และยังจัดตำแหน่งสระบน-ล่างไม่ถูกต้องในบางฟอนต์
 * 3) การ render ผ่านเบราว์เซอร์ก่อน ทำให้ได้ผลลัพธ์ตรงกับที่นักเรียนเห็นบนหน้าจอทุกตัวอักษร
 *    (วิธีฝังฟอนต์ไทยลง jsPDF โดยตรง อธิบายไว้ใน README หัวข้อ "ฟอนต์ไทยใน PDF")
 */
export const exportElementToPdf = async (
  element: HTMLElement,
  fileName: string,
): Promise<void> => {
  // รอให้ฟอนต์เว็บโหลดเสร็จก่อน ไม่เช่นนั้น canvas จะจับภาพด้วยฟอนต์สำรอง
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    windowWidth: element.scrollWidth,
  });

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const imgWidthMm = pageWidth - margin * 2;
  const pxPerMm = canvas.width / imgWidthMm;
  const pageHeightPx = Math.floor((pageHeight - margin * 2) * pxPerMm);

  let renderedPx = 0;
  let pageIndex = 0;

  while (renderedPx < canvas.height) {
    const sliceHeight = Math.min(pageHeightPx, canvas.height - renderedPx);
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeight;

    const ctx = pageCanvas.getContext('2d');
    if (!ctx) throw new Error('เบราว์เซอร์นี้ไม่รองรับการสร้างภาพสำหรับ PDF');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pageCanvas.width, sliceHeight);
    ctx.drawImage(
      canvas,
      0,
      renderedPx,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight,
    );

    if (pageIndex > 0) pdf.addPage();
    pdf.addImage(
      pageCanvas.toDataURL('image/jpeg', 0.92),
      'JPEG',
      margin,
      margin,
      imgWidthMm,
      sliceHeight / pxPerMm,
    );

    renderedPx += sliceHeight;
    pageIndex += 1;
  }

  pdf.save(fileName);
};
