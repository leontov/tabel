import { useTranslation } from 'react-i18next';

export const LoadingScreen = () => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-sm text-slate-400">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-sky-400" />
      {t('common.loading')}
    </div>
  );
};
