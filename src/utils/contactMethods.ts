// Универсальный блок способов связи: ключи и валидация

export const CONTACT_METHOD_IDS = [
  'telegram',
  'whatsapp',
  'vk',
  'max',
  'instagram',
  'facebook',
  'email',
  'phone'
] as const;

export type ContactMethodId = (typeof CONTACT_METHOD_IDS)[number];

export const CONTACT_METHODS_FIELD_ID = 'contact_methods';
export const CONTACT_SELECTED_KEY = 'contact_methods_selected';
export const CONTACT_VALUES_KEY = 'contact_methods_values';

/** Поля старого формата — синхронизируются при загрузке/отправке */
export const LEGACY_CONTACT_TELEGRAM = 'contact_telegram';
export const LEGACY_CONTACT_INSTAGRAM = 'contact_instagram';
export const LEGACY_CONTACT_PHONE = 'contact_phone';

export function isContactMethodId(v: string): v is ContactMethodId {
  return (CONTACT_METHOD_IDS as readonly string[]).includes(v);
}

export function normalizeContactValues(
  raw: unknown
): Partial<Record<ContactMethodId, string>> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Partial<Record<ContactMethodId, string>> = {};
  for (const id of CONTACT_METHOD_IDS) {
    const v = (raw as Record<string, unknown>)[id];
    if (typeof v === 'string') out[id] = v;
  }
  return out;
}

export function normalizeContactSelected(raw: unknown): ContactMethodId[] {
  if (!Array.isArray(raw)) return [];
  const out: ContactMethodId[] = [];
  for (const v of raw) {
    if (typeof v === 'string' && isContactMethodId(v) && !out.includes(v)) out.push(v);
  }
  return out;
}

/** Подмешать старые contact_telegram / contact_instagram / contact_phone в новую структуру */
export function mergeLegacyContactsIntoFormData(
  data: Record<string, unknown>
): Record<string, unknown> {
  const next = { ...data };
  let selected = normalizeContactSelected(next[CONTACT_SELECTED_KEY]);
  let values = normalizeContactValues(next[CONTACT_VALUES_KEY]);

  const legacyTg = typeof next[LEGACY_CONTACT_TELEGRAM] === 'string' ? next[LEGACY_CONTACT_TELEGRAM] : '';
  const legacyIg =
    typeof next[LEGACY_CONTACT_INSTAGRAM] === 'string' ? next[LEGACY_CONTACT_INSTAGRAM] : '';
  const legacyPhone =
    typeof next[LEGACY_CONTACT_PHONE] === 'string' ? next[LEGACY_CONTACT_PHONE] : '';

  if (legacyTg.trim() && !selected.includes('telegram')) {
    selected = [...selected, 'telegram'];
    values = { ...values, telegram: legacyTg };
  }
  if (legacyIg.trim() && !selected.includes('instagram')) {
    selected = [...selected, 'instagram'];
    values = { ...values, instagram: legacyIg };
  }
  if (legacyPhone.trim() && !selected.includes('phone')) {
    selected = [...selected, 'phone'];
    values = { ...values, phone: legacyPhone };
  }

  next[CONTACT_SELECTED_KEY] = selected;
  next[CONTACT_VALUES_KEY] = values;
  return next;
}

/** Дублируем в старые ключи для обратной совместимости в JSON / внешних интеграциях */
export function applyLegacyContactAliases(data: Record<string, any>): Record<string, any> {
  const values = normalizeContactValues(data[CONTACT_VALUES_KEY]);
  const out = { ...data };
  if (values.telegram) out[LEGACY_CONTACT_TELEGRAM] = values.telegram;
  if (values.instagram) out[LEGACY_CONTACT_INSTAGRAM] = values.instagram;
  if (values.phone) out[LEGACY_CONTACT_PHONE] = values.phone;
  return out;
}

/** Значения контактов с учётом нового блока и устаревших полей */
export function getEffectiveContactValues(data: Record<string, any>): Partial<Record<ContactMethodId, string>> {
  const merged = { ...normalizeContactValues(data[CONTACT_VALUES_KEY]) };
  const tg = typeof data[LEGACY_CONTACT_TELEGRAM] === 'string' ? data[LEGACY_CONTACT_TELEGRAM].trim() : '';
  const ig = typeof data[LEGACY_CONTACT_INSTAGRAM] === 'string' ? data[LEGACY_CONTACT_INSTAGRAM].trim() : '';
  const ph = typeof data[LEGACY_CONTACT_PHONE] === 'string' ? data[LEGACY_CONTACT_PHONE].trim() : '';
  if (tg && !merged.telegram) merged.telegram = tg;
  if (ig && !merged.instagram) merged.instagram = ig.replace(/^@+/, '');
  if (ph && !merged.phone) merged.phone = ph;
  return merged;
}

const CONTACT_LABEL_RU: Record<ContactMethodId, string> = {
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  vk: 'VK',
  max: 'Max',
  instagram: 'Instagram',
  facebook: 'Facebook',
  email: 'Email',
  phone: 'Телефон'
};

/** Строки для PDF / Telegram (подпись + значение) */
export function formatContactLinesPlain(data: Record<string, any>): string[] {
  const values = getEffectiveContactValues(data);
  const lines: string[] = [];
  for (const id of CONTACT_METHOD_IDS) {
    const raw = (values[id] ?? '').trim();
    if (!raw) continue;
    const display = id === 'instagram' ? `@${raw.replace(/^@+/, '')}` : raw;
    lines.push(`${CONTACT_LABEL_RU[id]}: ${display}`);
  }
  return lines;
}

export function validateTelegram(username: string): boolean {
  if (!username) return false;
  return /^@[a-zA-Z0-9_]{5,32}$/.test(username);
}

export function validateInstagram(username: string): boolean {
  if (!username) return false;
  if (!/^[a-zA-Z0-9._]{1,30}$/.test(username)) return false;
  if (username.startsWith('.') || username.endsWith('.')) return false;
  if (username.includes('..')) return false;
  return true;
}

export function validateEmail(email: string): boolean {
  const t = email.trim();
  if (t.length < 5) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

/** Базовая проверка телефона: цифры и длина */
export function validatePhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

export function validateGenericContact(value: string, minLen = 2): boolean {
  return value.trim().length >= minLen;
}

export type ContactValidationError =
  | 'required'
  | 'invalid_telegram'
  | 'invalid_instagram'
  | 'invalid_email'
  | 'invalid_phone'
  | 'invalid_generic';

export function validateContactMethodValue(
  method: ContactMethodId,
  value: string
): ContactValidationError | null {
  const v = typeof value === 'string' ? value : '';
  if (!v.trim()) return 'required';
  switch (method) {
    case 'telegram':
      return validateTelegram(v) ? null : 'invalid_telegram';
    case 'instagram':
      return validateInstagram(v.replace(/^@+/, '')) ? null : 'invalid_instagram';
    case 'email':
      return validateEmail(v) ? null : 'invalid_email';
    case 'phone':
      return validatePhone(v) ? null : 'invalid_phone';
    default:
      return validateGenericContact(v) ? null : 'invalid_generic';
  }
}

/** Хотя бы один способ связи выбран и заполнен корректно (с учётом устаревших полей). */
export function hasAtLeastOneValidContact(formData: Record<string, any>): boolean {
  const values = getEffectiveContactValues(formData);
  for (const id of CONTACT_METHOD_IDS) {
    const raw = values[id];
    if (raw === undefined || raw === null) continue;
    const v = String(raw);
    if (validateContactMethodValue(id, v) === null) return true;
  }
  return false;
}

export function validateContactMethodsBlock(formData: Record<string, any>): Record<string, string> {
  const errors: Record<string, string> = {};
  const selected = normalizeContactSelected(formData[CONTACT_SELECTED_KEY]);
  const values = normalizeContactValues(formData[CONTACT_VALUES_KEY]);

  for (const method of selected) {
    const val = values[method] ?? '';
    const err = validateContactMethodValue(method, val);
    if (err) {
      errors[`${CONTACT_VALUES_KEY}.${method}`] = err;
    }
  }

  if (!hasAtLeastOneValidContact(formData)) {
    errors[CONTACT_METHODS_FIELD_ID] = 'contact_details_missing';
  }

  return errors;
}
