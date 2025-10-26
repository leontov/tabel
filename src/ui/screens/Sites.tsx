import { useState } from 'react';
import { Building2, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card } from '../components/Card';
import { createId } from '../../utils/uuid';

type Site = {
  id: string;
  name: string;
  address?: string;
  timezone: string;
  notes?: string;
};

const initialSites: Site[] = [
  { id: 'site-1', name: 'ЖК “Лесной”', address: 'Москва, Лесная 15', timezone: 'Europe/Moscow' },
  { id: 'site-2', name: 'Офис “Альфа”', address: 'Химки, Заводская 7', timezone: 'Europe/Moscow' }
];

const SitesScreen = () => {
  const { t } = useTranslation();
  const [sites, setSites] = useState(initialSites);

  const addSite = () => {
    const name = window.prompt('Название объекта');
    if (!name) return;
    setSites((prev) => [
      ...prev,
      {
        id: createId(),
        name,
        timezone: 'Europe/Moscow'
      }
    ]);
  };

  return (
    <div className="space-y-4 p-4">
      <Card
        title={t('nav.sites')}
        actions={
          <button
            onClick={addSite}
            className="inline-flex items-center gap-1 rounded-lg bg-sky-500 px-3 py-2 text-xs font-semibold text-white"
          >
            <Plus className="h-4 w-4" /> {t('actions.addSite')}
          </button>
        }
      >
        <ul className="space-y-3 text-sm">
          {sites.map((site) => (
            <li key={site.id} className="flex items-start justify-between rounded-xl bg-slate-800/80 px-3 py-3">
              <div>
                <p className="font-semibold text-slate-100">{site.name}</p>
                <p className="text-xs text-slate-400">{site.address ?? '—'}</p>
              </div>
              <span className="text-xs text-slate-500">{site.timezone}</span>
            </li>
          ))}
          {sites.length === 0 && (
            <li className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-700 p-6 text-center text-xs text-slate-400">
              <Building2 className="h-8 w-8" />
              <p>Добавьте первый объект</p>
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
};

export default SitesScreen;
