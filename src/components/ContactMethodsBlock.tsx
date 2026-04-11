import React from 'react';
import { t, type Language } from '../utils/i18n';
import {
  CONTACT_METHOD_IDS,
  type ContactMethodId,
  CONTACT_SELECTED_KEY,
  CONTACT_VALUES_KEY,
  normalizeContactSelected,
  normalizeContactValues,
  validateTelegram,
  validateInstagram
} from '../utils/contactMethods';
import './ContactMethodsBlock.css';

interface ContactMethodsBlockProps {
  lang: Language;
  formData: Record<string, any>;
  onFieldChange: (fieldId: string, value: any) => void;
  errors?: Record<string, string>;
  /** Код ошибки уровня всего блока (например, нет ни одного валидного контакта) */
  summaryError?: string;
}

function methodLabelKey(method: ContactMethodId): string {
  const map: Record<ContactMethodId, string> = {
    telegram: 'common.contactMethodTelegram',
    whatsapp: 'common.contactMethodWhatsapp',
    vk: 'common.contactMethodVk',
    max: 'common.contactMethodMax',
    instagram: 'common.contactMethodInstagram',
    facebook: 'common.contactMethodFacebook',
    email: 'common.contactMethodEmail',
    phone: 'common.contactMethodPhone'
  };
  return map[method];
}

function placeholderKey(method: ContactMethodId): string {
  const map: Record<ContactMethodId, string> = {
    telegram: 'common.contactPlaceholderTelegram',
    whatsapp: 'common.contactPlaceholderWhatsapp',
    vk: 'common.contactPlaceholderVk',
    max: 'common.contactPlaceholderMax',
    instagram: 'common.contactPlaceholderInstagram',
    facebook: 'common.contactPlaceholderFacebook',
    email: 'common.contactPlaceholderEmail',
    phone: 'common.contactPlaceholderPhone'
  };
  return map[method];
}

export const ContactMethodsBlock: React.FC<ContactMethodsBlockProps> = ({
  lang,
  formData,
  onFieldChange,
  errors,
  summaryError
}) => {
  const selected = normalizeContactSelected(formData[CONTACT_SELECTED_KEY]);
  const values = normalizeContactValues(formData[CONTACT_VALUES_KEY]);

  const toggleMethod = (method: ContactMethodId, checked: boolean) => {
    let next = [...selected];
    const nextVals = { ...values };
    if (checked) {
      if (!next.includes(method)) next.push(method);
    } else {
      next = next.filter((m) => m !== method);
      delete nextVals[method];
    }
    onFieldChange(CONTACT_SELECTED_KEY, next);
    onFieldChange(CONTACT_VALUES_KEY, nextVals);
  };

  const setValue = (method: ContactMethodId, value: string) => {
    let v = value;
    if (method === 'telegram' && v && !v.startsWith('@')) {
      v = '@' + v.replace(/^@+/, '');
    }
    if (method === 'instagram') {
      v = v.replace(/^@+/, '');
    }
    onFieldChange(CONTACT_VALUES_KEY, { ...values, [method]: v });
  };

  return (
    <div className="contact-methods-block" data-field-id="contact_methods">
      {summaryError === 'contact_details_missing' && (
        <div className="contact-methods-summary-error" role="alert">
          {t('common.contactDetailsMissing', lang)}
        </div>
      )}
      <p className="contact-methods-hint">{t('common.contactMethodsHint', lang)}</p>
      <div className="contact-methods-grid">
        {CONTACT_METHOD_IDS.map((method) => {
          const checked = selected.includes(method);
          const val = values[method] ?? '';
          const errKey = `${CONTACT_VALUES_KEY}.${method}`;
          const err = errors?.[errKey];

          return (
            <div key={method} className={`contact-method-card ${checked ? 'is-active' : ''}`}>
              <label className="contact-method-check">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => toggleMethod(method, e.target.checked)}
                />
                <span>{t(methodLabelKey(method), lang)}</span>
              </label>
              {checked && (
                <div className="contact-method-input-wrap">
                  <input
                    type={method === 'email' ? 'email' : 'text'}
                    className={`form-input ${err ? 'error' : ''}`}
                    value={val}
                    onChange={(e) => setValue(method, e.target.value)}
                    placeholder={t(placeholderKey(method), lang)}
                    autoComplete="off"
                  />
                  {method === 'telegram' && val && (
                    <div
                      className={`field-hint ${validateTelegram(val) ? 'hint-success' : 'hint-error'}`}
                    >
                      {validateTelegram(val)
                        ? t('common.telegramHintOk', lang)
                        : t('common.telegramHintBad', lang)}
                    </div>
                  )}
                  {method === 'instagram' && val && (
                    <div
                      className={`field-hint ${validateInstagram(val) ? 'hint-success' : 'hint-error'}`}
                    >
                      {validateInstagram(val)
                        ? t('common.instagramHintOk', lang)
                        : t('common.instagramHintBad', lang)}
                    </div>
                  )}
                  {err && <div className="error-message">{mapErrorToText(err, lang)}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

function mapErrorToText(code: string, lang: Language): string {
  switch (code) {
    case 'required':
      return t('common.contactErrRequired', lang);
    case 'invalid_telegram':
      return t('common.invalidTelegram', lang);
    case 'invalid_instagram':
      return t('common.invalidInstagram', lang);
    case 'invalid_email':
      return t('common.contactErrInvalidEmail', lang);
    case 'invalid_phone':
      return t('common.contactErrInvalidPhone', lang);
    case 'invalid_generic':
      return t('common.contactErrInvalidGeneric', lang);
    default:
      return t('common.required', lang);
  }
}
