/**
 * Утилиты форматирования
 */

/**
 * Форматирование даты в ISO 8601
 */
export function formatISODate(date: Date): string {
  return date.toISOString();
}

/**
 * Форматирование даты для отображения (DD.MM.YYYY)
 */
export function formatDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU').format(date);
}

/**
 * Форматирование даты и времени для отображения
 */
export function formatDisplayDateTime(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Форматирование имени пользователя
 */
export function formatUserName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

/**
 * Форматирование телефона
 */
export function formatPhone(phone: string): string {
  // +998901234567 -> +998 (90) 123-45-67
  if (phone.startsWith('+998')) {
    return phone.replace(/^\+(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})$/, '+$1 ($2) $3-$4-$5');
  }
  return phone;
}

/**
 * Truncate текст
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Вычисление возраста
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

