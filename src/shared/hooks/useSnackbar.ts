import { useCallback } from 'react';
import { create } from 'zustand';

interface SnackbarState {
  visible: boolean;
  message: string;
  variant: 'info' | 'success' | 'warning' | 'error';
  show: (message: string, variant?: SnackbarState['variant']) => void;
  hide: () => void;
}

const useSnackbarStore = create<SnackbarState>((set) => ({
  visible: false,
  message: '',
  variant: 'info',
  show: (message, variant = 'info') => set({ visible: true, message, variant }),
  hide: () => set({ visible: false })
}));

export function useSnackbar() {
  const visible = useSnackbarStore((state) => state.visible);
  const message = useSnackbarStore((state) => state.message);
  const variant = useSnackbarStore((state) => state.variant);
  const show = useSnackbarStore((state) => state.show);
  const hide = useSnackbarStore((state) => state.hide);

  const notify = useCallback(
    (text: string, tone: SnackbarState['variant'] = 'info') => {
      show(text, tone);
      window.setTimeout(() => {
        hide();
      }, 3500);
    },
    [hide, show]
  );

  return { visible, message, variant, show: notify, hide };
}
