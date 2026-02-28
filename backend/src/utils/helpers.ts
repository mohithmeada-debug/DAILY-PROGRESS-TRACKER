import jwt from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

export const getTodayDateString = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
};

export const getDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getStartOfDay = (dateStr?: string): Date => {
  const date = dateStr ? new Date(dateStr) : new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getEndOfDay = (dateStr?: string): Date => {
  const date = dateStr ? new Date(dateStr) : new Date();
  date.setHours(23, 59, 59, 999);
  return date;
};

export const getWeekDates = (): { start: string; end: string; dates: string[] } => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const start = new Date(today);
  start.setDate(today.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(getDateString(d));
  }

  return {
    start: getDateString(start),
    end: getDateString(new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000)),
    dates,
  };
};
