import { useState } from 'react';
import { Plus, UserPlus2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card } from '../components/Card';
import { createId } from '../../utils/uuid';

type Employee = {
  id: string;
  fullName: string;
  role?: string;
  rate: number;
  active: boolean;
};

const initialEmployees: Employee[] = [
  { id: 'emp-1', fullName: 'Иван Петров', role: 'Бригадир', rate: 550, active: true },
  { id: 'emp-2', fullName: 'Мария Иванова', role: 'Монтажник', rate: 480, active: true }
];

const EmployeesScreen = () => {
  const { t } = useTranslation();
  const [employees, setEmployees] = useState(initialEmployees);

  const addEmployee = () => {
    const name = window.prompt('ФИО сотрудника');
    if (!name) return;
    setEmployees((prev) => [
      ...prev,
      {
        id: createId(),
        fullName: name,
        role: 'Монтажник',
        rate: 450,
        active: true
      }
    ]);
  };

  return (
    <div className="space-y-4 p-4">
      <Card
        title={t('nav.employees')}
        actions={
          <button
            onClick={addEmployee}
            className="inline-flex items-center gap-1 rounded-lg bg-sky-500 px-3 py-2 text-xs font-semibold text-white"
          >
            <Plus className="h-4 w-4" /> {t('actions.addEmployee')}
          </button>
        }
      >
        <ul className="space-y-3 text-sm">
          {employees.map((employee) => (
            <li key={employee.id} className="flex items-center justify-between rounded-xl bg-slate-800/80 px-3 py-3">
              <div>
                <p className="font-semibold text-slate-100">{employee.fullName}</p>
                <p className="text-xs text-slate-400">{employee.role}</p>
              </div>
              <div className="text-right text-xs text-slate-400">
                <p>{employee.rate} ₽/ч</p>
                <p>{employee.active ? 'Активен' : 'Не активен'}</p>
              </div>
            </li>
          ))}
          {employees.length === 0 && (
            <li className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-700 p-6 text-center text-xs text-slate-400">
              <UserPlus2 className="h-8 w-8" />
              <p>Добавьте первого сотрудника</p>
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
};

export default EmployeesScreen;
