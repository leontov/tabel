import { create } from 'zustand';
import { isWeekend, parseISO } from 'date-fns';
import Fuse from 'fuse.js';
import { db, deleteItem, getAll, putItem, updateItem } from '../../entities/db';
import type { Holiday, Person, Project, Rate, Settings, Shift } from '../../entities/types';
import { DEFAULT_SETTINGS } from '../../shared/constants';
import { calcMoney, calcShiftMinutes } from '../../shared/lib/calc';
import { createId } from '../../shared/lib/id';
import { monthRange, todayRange, weekRange } from '../../shared/lib/date';

interface Filters {
  start?: string;
  end?: string;
  personId?: string;
  projectId?: string;
  search?: string;
  quick: 'today' | 'week' | 'month' | 'custom';
}

interface DataState {
  ready: boolean;
  persons: Person[];
  rates: Rate[];
  projects: Project[];
  shifts: Shift[];
  settings: Settings;
  holidays: Holiday[];
  filters: Filters;
  load: () => Promise<void>;
  addPerson: (payload: Omit<Person, 'id'> & { id?: string }) => Promise<void>;
  updatePerson: (id: string, payload: Partial<Person>) => Promise<void>;
  addRate: (payload: Omit<Rate, 'id'> & { id?: string }) => Promise<void>;
  updateRate: (id: string, payload: Partial<Rate>) => Promise<void>;
  deleteRate: (id: string) => Promise<void>;
  addProject: (payload: Omit<Project, 'id'> & { id?: string }) => Promise<void>;
  updateProject: (id: string, payload: Partial<Project>) => Promise<void>;
  startShift: (personId: string, projectId?: string) => Promise<Shift>;
  stopShift: (shiftId: string) => Promise<void>;
  updateShift: (shiftId: string, payload: Partial<Shift>) => Promise<void>;
  massUpdateBreaks: (minutes: number) => Promise<void>;
  setFilters: (filters: Partial<Filters>) => void;
  saveSettings: (payload: Partial<Settings>) => Promise<void>;
  addHoliday: (payload: Omit<Holiday, 'id'> & { id?: string }) => Promise<void>;
  deleteHoliday: (id: string) => Promise<void>;
  exportBackup: () => Promise<string>;
  importBackup: (raw: string) => Promise<void>;
}

function ensureSettings(settings?: Settings): Settings {
  if (!settings) {
    return { ...DEFAULT_SETTINGS };
  }
  return { ...DEFAULT_SETTINGS, ...settings };
}

function hydrateShift(shift: Shift, settings: Settings, rate?: Rate, holiday?: Holiday): Shift {
  if (!shift.end || !rate) {
    return shift;
  }
  const minutes = calcShiftMinutes(shift, settings);
  const amount = calcMoney(minutes.totalMin, rate, minutes, {
    isWeekend: isWeekend(parseISO(shift.start)),
    holidayMultiplier: holiday?.multiplier
  });
  return {
    ...shift,
    minutesTotal: minutes.totalMin,
    minutesOvertime: minutes.overtimeMin,
    minutesNight: minutes.nightMin,
    amount
  };
}

export const useDataStore = create<DataState>((set, get) => ({
  ready: false,
  persons: [],
  rates: [],
  projects: [],
  shifts: [],
  settings: DEFAULT_SETTINGS,
  holidays: [],
  filters: { quick: 'week' },
  load: async () => {
    const [personsRaw, ratesRaw, projectsRaw, shiftsRaw, holidaysRaw] = await Promise.all([
      getAll(db.persons),
      getAll(db.rates),
      getAll(db.projects),
      getAll(db.shifts),
      getAll(db.holidays)
    ]);
    let settingsRecord = await db.settings.get('app');
    if (!settingsRecord) {
      settingsRecord = DEFAULT_SETTINGS;
      await putItem(db.settings, settingsRecord);
    }
    const persons = [...personsRaw];
    const rates = [...ratesRaw];
    const projects = [...projectsRaw];
    const holidays = [...holidaysRaw];

    const seeded = settingsRecord?.onboarded ?? false;
    if (seeded && rates.length === 0) {
      const defaultRate: Rate = {
        id: createId(),
        title: 'Стандарт / Standard',
        basePerHour: 800,
        overtimeX: 1.5,
        nightX: 1.4,
        weekendX: 2
      };
      await putItem(db.rates, defaultRate);
      rates.push(defaultRate);
    }
    if (seeded && persons.length === 0) {
      const defaultPerson: Person = {
        id: createId(),
        name: 'Бригадир / Foreman',
        rateId: rates[0]?.id,
        active: true
      };
      await putItem(db.persons, defaultPerson);
      persons.push(defaultPerson);
    }
    if (projects.length === 0) {
      const defaultProject: Project = {
        id: createId(),
        title: 'Объект А / Site A',
        active: true
      };
      await putItem(db.projects, defaultProject);
      projects.push(defaultProject);
    }

    const settings = ensureSettings(settingsRecord);
    const shifts = shiftsRaw.map((shift) => {
      const person = persons.find((p) => p.id === shift.personId);
      const rate = person ? rates.find((r) => r.id === person.rateId) : undefined;
      const holiday = holidays.find((h) => h.dateISO === shift.start.slice(0, 10));
      return hydrateShift(shift, settings, rate, holiday);
    });

    const quick = settings.quickFilter ?? 'week';
    let startFilter: string | undefined;
    let endFilter: string | undefined;
    if (quick === 'today') {
      const range = todayRange();
      startFilter = range.start;
      endFilter = range.end;
    } else if (quick === 'week') {
      const range = weekRange(settings.locale);
      startFilter = range.start;
      endFilter = range.end;
    } else if (quick === 'month') {
      const range = monthRange();
      startFilter = range.start;
      endFilter = range.end;
    }
    set({
      ready: true,
      persons,
      rates,
      projects,
      shifts,
      settings,
      holidays,
      filters: { ...get().filters, quick, start: startFilter, end: endFilter }
    });
  },
  addPerson: async (payload) => {
    const id = payload.id ?? createId();
    const person: Person = { ...payload, id };
    await putItem(db.persons, person);
    set({ persons: [...get().persons, person] });
  },
  updatePerson: async (id, payload) => {
    await updateItem(db.persons, id, payload);
    set({ persons: get().persons.map((person) => (person.id === id ? { ...person, ...payload } : person)) });
  },
  addRate: async (payload) => {
    const id = payload.id ?? createId();
    const rate: Rate = { ...payload, id };
    await putItem(db.rates, rate);
    set({ rates: [...get().rates, rate] });
  },
  updateRate: async (id, payload) => {
    await updateItem(db.rates, id, payload);
    set({ rates: get().rates.map((rate) => (rate.id === id ? { ...rate, ...payload } : rate)) });
  },
  deleteRate: async (id) => {
    await deleteItem(db.rates, id);
    set({ rates: get().rates.filter((rate) => rate.id !== id) });
  },
  addProject: async (payload) => {
    const id = payload.id ?? createId();
    const project: Project = { ...payload, id };
    await putItem(db.projects, project);
    set({ projects: [...get().projects, project] });
  },
  updateProject: async (id, payload) => {
    await updateItem(db.projects, id, payload);
    set({ projects: get().projects.map((project) => (project.id === id ? { ...project, ...payload } : project)) });
  },
  startShift: async (personId, projectId) => {
    const state = get();
    const activeShift = state.shifts.find((shift) => shift.personId === personId && !shift.end);
    if (activeShift) {
      await get().stopShift(activeShift.id);
    }
    const shift: Shift = {
      id: createId(),
      personId,
      projectId,
      start: new Date().toISOString(),
      breaksMin: 0,
      notes: ''
    };
    await putItem(db.shifts, shift);
    set({ shifts: [...get().shifts, shift] });
    return shift;
  },
  stopShift: async (shiftId) => {
    const state = get();
    const shift = state.shifts.find((item) => item.id === shiftId);
    if (!shift) {
      return;
    }
    const ended: Shift = { ...shift, end: new Date().toISOString() };
    const person = state.persons.find((p) => p.id === ended.personId);
    const rate = person ? state.rates.find((r) => r.id === person.rateId) : undefined;
    const holiday = state.holidays.find((h) => h.dateISO === ended.start.slice(0, 10));
    const enriched = rate ? hydrateShift(ended, state.settings, rate, holiday) : ended;
    await updateItem(db.shifts, shiftId, enriched);
    set({ shifts: state.shifts.map((item) => (item.id === shiftId ? enriched : item)) });
  },
  updateShift: async (shiftId, payload) => {
    await updateItem(db.shifts, shiftId, payload);
    const state = get();
    const updated = state.shifts.map((shift) => {
      if (shift.id !== shiftId) {
        return shift;
      }
      const merged = { ...shift, ...payload };
      const person = state.persons.find((p) => p.id === merged.personId);
      const rate = person ? state.rates.find((r) => r.id === person.rateId) : undefined;
      const holiday = state.holidays.find((h) => h.dateISO === merged.start.slice(0, 10));
      return rate ? hydrateShift(merged, state.settings, rate, holiday) : merged;
    });
    set({ shifts: updated });
  },
  massUpdateBreaks: async (minutes) => {
    const state = get();
    const targets = selectFilteredShifts(state);
    await Promise.all(targets.map((shift) => updateItem(db.shifts, shift.id, { breaksMin: minutes })));
    const updated = state.shifts.map((shift) => (targets.some((target) => target.id === shift.id) ? { ...shift, breaksMin: minutes } : shift));
    set({ shifts: updated });
  },
  setFilters: (filters) => {
    const nextFilters = { ...get().filters, ...filters };
    set({ filters: nextFilters });
    void get().saveSettings({ quickFilter: nextFilters.quick });
  },
  saveSettings: async (payload) => {
    const merged = { ...get().settings, ...payload };
    await updateItem(db.settings, 'app', merged);
    set({ settings: merged });
  },
  addHoliday: async (payload) => {
    const id = payload.id ?? createId();
    const holiday: Holiday = { ...payload, id };
    await putItem(db.holidays, holiday);
    set({ holidays: [...get().holidays, holiday] });
  },
  deleteHoliday: async (id) => {
    await deleteItem(db.holidays, id);
    set({ holidays: get().holidays.filter((holiday) => holiday.id !== id) });
  },
  exportBackup: async () => {
    const payload = {
      persons: await getAll(db.persons),
      rates: await getAll(db.rates),
      projects: await getAll(db.projects),
      shifts: await getAll(db.shifts),
      settings: await getAll(db.settings),
      holidays: await getAll(db.holidays)
    };
    return JSON.stringify(payload, null, 2);
  },
  importBackup: async (raw) => {
    const data = JSON.parse(raw) as {
      persons?: Person[];
      rates?: Rate[];
      projects?: Project[];
      shifts?: Shift[];
      settings?: Settings[];
      holidays?: Holiday[];
    };
    if (data.persons) {
      await db.persons.clear();
      await db.persons.bulkPut(data.persons);
    }
    if (data.rates) {
      await db.rates.clear();
      await db.rates.bulkPut(data.rates);
    }
    if (data.projects) {
      await db.projects.clear();
      await db.projects.bulkPut(data.projects);
    }
    if (data.shifts) {
      await db.shifts.clear();
      await db.shifts.bulkPut(data.shifts);
    }
    if (data.settings) {
      await db.settings.clear();
      await db.settings.bulkPut(data.settings);
    }
    if (data.holidays) {
      await db.holidays.clear();
      await db.holidays.bulkPut(data.holidays);
    }
    await get().load();
  }
}));

export function selectFilteredShifts(state: DataState): Shift[] {
  const { shifts, filters, persons, projects } = state;
  const base = shifts.filter((shift) => {
    if (filters.personId && shift.personId !== filters.personId) {
      return false;
    }
    if (filters.projectId && shift.projectId !== filters.projectId) {
      return false;
    }
    if (filters.start && shift.start < filters.start) {
      return false;
    }
    if (filters.end && shift.end && shift.end > filters.end) {
      return false;
    }
    return true;
  });
  if (!filters.search) {
    return base;
  }
  const fuse = new Fuse(
    base.map((shift) => ({
      ...shift,
      personName: persons.find((p) => p.id === shift.personId)?.name ?? '',
      projectTitle: projects.find((p) => p.id === shift.projectId)?.title ?? ''
    })),
    {
      keys: ['notes', 'personName', 'projectTitle'],
      threshold: 0.3,
      ignoreLocation: true
    }
  );
  return fuse.search(filters.search).map((result) => result.item);
}

export function selectActiveShift(state: DataState, personId: string): Shift | undefined {
  return state.shifts.find((shift) => shift.personId === personId && !shift.end);
}

