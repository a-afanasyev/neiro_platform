/**
 * Утилиты валидации
 */

/**
 * Валидация email по RFC 5322
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Валидация телефона E.164 формат
 * Пример: +998901234567
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

/**
 * Валидация пароля
 * Минимум 8 символов, хотя бы одна буква и одна цифра
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasLetter && hasNumber;
}

/**
 * Валидация UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Валидация даты (не в будущем)
 */
export function isValidPastDate(date: Date): boolean {
  return date <= new Date();
}

/**
 * Валидация возраста ребенка (2-15 лет для платформы)
 */
export function isValidChildAge(birthDate: Date): boolean {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  return age >= 2 && age <= 15;
}

