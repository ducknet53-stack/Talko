import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Timestamp } from 'firebase/firestore';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toJsDate(value: Timestamp | Date | null | undefined): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  return value.toDate();
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatRelativeDate(date: Date) {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return formatDate(date);
  } else if (diffInDays === 1) {
    return 'Dün';
  } else if (diffInDays < 7) {
    return new Intl.DateTimeFormat('tr-TR', { weekday: 'short' }).format(date);
  } else {
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'short'
    }).format(date);
  }
}
