import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';
import QRCode from 'qrcode';
import { Shift } from '../domain/models';

export type PdfExportOptions = {
  shifts: Shift[];
  period: { from: string; to: string };
  title?: string;
};

const drawTable = async (pdfDoc: PDFDocument, pageIndex: number, shifts: Shift[]) => {
  const page = pdfDoc.getPage(pageIndex);
  const { width } = page.getSize();
  const margin = 40;
  const tableWidth = width - margin * 2;
  const rowHeight = 20;
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const headers = ['Date', 'Employee', 'Site', 'Start', 'End', 'Status'];
  const columnWidth = tableWidth / headers.length;
  headers.forEach((header, index) => {
    page.drawText(header, {
      x: margin + index * columnWidth,
      y: page.getHeight() - margin - 100,
      size: 10,
      font,
      color: rgb(0.8, 0.8, 0.8)
    });
  });

  shifts.forEach((shift, rowIndex) => {
    const values = [shift.date, shift.employeeId, shift.siteId, shift.start, shift.end, shift.status];
    values.forEach((value, columnIndex) => {
      page.drawText(String(value), {
        x: margin + columnIndex * columnWidth,
        y: page.getHeight() - margin - 120 - rowIndex * rowHeight,
        size: 9,
        font,
        color: rgb(0.9, 0.9, 0.9)
      });
    });
  });
};

export const exportShiftsToPdf = async ({ shifts, period, title = 'Timesheet' }: PdfExportOptions) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage(PageSizes.A4);
  const { width, height } = page.getSize();
  const margin = 40;
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  page.drawText(title, { x: margin, y: height - margin, size: 20, font, color: rgb(0.2, 0.8, 0.9) });
  page.drawText(`Period: ${period.from} – ${period.to}`, { x: margin, y: height - margin - 24, size: 12 });
  page.drawText(`Generated at: ${new Date().toISOString()}`, { x: margin, y: height - margin - 40, size: 10 });

  await drawTable(pdfDoc, pdfDoc.getPageCount() - 1, shifts);

  const jsonPayload = JSON.stringify({ shifts, period });
  const qr = await QRCode.toDataURL(jsonPayload, { margin: 1, scale: 4 });
  const qrImage = await pdfDoc.embedPng(qr);
  page.drawImage(qrImage, {
    x: width - margin - 80,
    y: height - margin - 120,
    width: 80,
    height: 80
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};
