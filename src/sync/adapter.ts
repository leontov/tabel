export type SyncResult = {
  success: boolean;
  message?: string;
};

export interface SyncAdapter {
  push(): Promise<SyncResult>;
  pull(): Promise<SyncResult>;
}

export class NoopSyncAdapter implements SyncAdapter {
  async push(): Promise<SyncResult> {
    return { success: false, message: 'Sync disabled' };
  }

  async pull(): Promise<SyncResult> {
    return { success: false, message: 'Sync disabled' };
  }
}

export const syncAdapter: SyncAdapter = new NoopSyncAdapter();
