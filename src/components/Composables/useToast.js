import { getCurrentInstance } from 'vue';
import i18n from '@/i18n';

export function useToast() {
  const instance = getCurrentInstance();
  const $toast = instance?.appContext.config.globalProperties.$toast;

  const successToast = (message) => {
    const title = i18n.global.t('global.status.success');
    const body = Array.isArray(message)
      ? message
          .map((m) => (typeof m === 'string' ? m : m?.children ?? ''))
          .join('\n')
      : String(message ?? '');
    $toast?.success?.(body, {
      props: { title, solid: false },
    });
  };

  const errorToast = (message) => {
    const title = i18n.global.t('global.status.error');
    const body = Array.isArray(message)
      ? message
          .map((m) => (typeof m === 'string' ? m : m?.children ?? ''))
          .join('\n')
      : String(message ?? '');
    $toast?.danger?.(body, {
      props: { title, solid: false },
    });
  };

  return { successToast, errorToast };
}
