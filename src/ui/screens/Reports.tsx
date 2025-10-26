import { useState } from 'react';
import dayjs from 'dayjs';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card } from '../components/Card';
import { exportShiftsToCsv } from '../../services/exportCsv';
import { exportShiftsToJson } from '../../services/exportJson';
import { exportShiftsToPdf } from '../../services/exportPdf';
import { Shift } from '../../domain/models';

const demoShifts: Shift[] = [
  {
    id: 's1',
    date: dayjs().format('YYYY-MM-DD'),
    siteId: 'site-1',
    employeeId: 'emp-1',
    start: '09:00',
    end: '18:00',
    breaks: [{ start: '13:00', end: '13:30', type: 'lunch' }],
    status: 'approved'
  }
];

const saveBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
};

const ReportsScreen = () => {
  const { t, i18n } = useTranslation();
  const [period, setPeriod] = useState({ from: dayjs().startOf('month').format('YYYY-MM-DD'), to: dayjs().endOf('month').format('YYYY-MM-DD') });

  const handleCsv = () => {
    const blob = exportShiftsToCsv({ shifts: demoShifts, locale: i18n.language.startsWith('ru') ? 'ru' : 'en' });
    saveBlob(blob, `timesheet-${period.from}-${period.to}.csv`);
  };

  const handleJson = () => {
    const blob = exportShiftsToJson({ shifts: demoShifts, period });
    saveBlob(blob, `timesheet-${period.from}-${period.to}.json`);
  };

  const handlePdf = async () => {
    const blob = await exportShiftsToPdf({ shifts: demoShifts, period, title: 'Timesheet PDF' });
    saveBlob(blob, `timesheet-${period.from}-${period.to}.pdf`);
  };

  return (
    <div className="space-y-4 p-4">
      <Card title={t('nav.reports')}>
        <div className="space-y-3 text-xs text-slate-300">
          <label className="flex flex-col gap-1">
            <span className="text-slate-400">Период с</span>
            <input
              type="date"
              value={period.from}
              onChange={(event) => setPeriod((prev) => ({ ...prev, from: event.target.value }))}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-slate-400">по</span>
            <input
              type="date"
              value={period.to}
              onChange={(event) => setPeriod((prev) => ({ ...prev, to: event.target.value }))}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            />
          </label>
        </div>
      </Card>

      <Card title="Экспорт">
        <div className="space-y-2 text-sm">
          <button
            onClick={handleCsv}
            className="flex w-full items-center justify-between rounded-xl bg-slate-800/80 px-4 py-3"
          >
            <span>CSV</span>
            <Download className="h-4 w-4" />
          </button>
          <button onClick={handleJson} className="flex w-full items-center justify-between rounded-xl bg-slate-800/80 px-4 py-3">
            <span>JSON</span>
            <Download className="h-4 w-4" />
          </button>
          <button onClick={handlePdf} className="flex w-full items-center justify-between rounded-xl bg-slate-800/80 px-4 py-3">
            <span>PDF</span>
            <Download className="h-4 w-4" />
          </button>
        </div>
      </Card>
    </div>
  );
};

export default ReportsScreen;
