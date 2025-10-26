import { db } from '../dexie';
import { Employee, EmployeeSchema } from '../../domain/models';

export const listEmployees = () => db.employees.toArray();

export const upsertEmployee = async (employee: Employee) => {
  const parsed = EmployeeSchema.parse(employee);
  await db.employees.put(parsed);
};

export const deleteEmployee = (id: string) => db.employees.delete(id);
