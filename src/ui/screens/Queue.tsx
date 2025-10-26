import { useState } from 'react';
import { History } from 'lucide-react';

import { Card } from '../components/Card';

const QueueScreen = () => {
  const [jobs] = useState([
    { id: 'job-1', type: 'sync', status: 'pending', createdAt: new Date().toISOString() }
  ]);

  return (
    <div className="space-y-4 p-4">
      <Card title="Очередь задач">
        <ul className="space-y-2 text-xs text-slate-300">
          {jobs.map((job) => (
            <li key={job.id} className="flex items-center justify-between rounded-xl bg-slate-800/80 px-4 py-3">
              <span className="flex items-center gap-2">
                <History className="h-4 w-4" />
                {job.type}
              </span>
              <span className="text-slate-400">{job.status}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default QueueScreen;
