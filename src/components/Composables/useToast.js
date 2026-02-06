import { useToast as useBootstrapToast } from 'bootstrap-vue-next';
import i18n from '@/i18n';

export function useToast() {
  const toast = useBootstrapToast();

  const normalizeBody = (message) =>
    Array.isArray(message)
      ? message
          .map((m) => (typeof m === 'string' ? m : m?.children ?? ''))
          .join('\n')
      : String(message ?? '');

  const successToast = (message) => {
    toast.create({
      body: normalizeBody(message),
      props: {
        title: i18n.global.t('global.status.success'),
        variant: 'success',
        isStatus: true,
        modelValue: 10000,
        solid: false,
      },
    });
  };

  const errorToast = (message) => {
    toast.create({
      body: normalizeBody(message),
      props: {
        title: i18n.global.t('global.status.error'),
        variant: 'danger',
        isStatus: true,
        modelValue: false,
        solid: false,
      },
    });
  };

  return { successToast, errorToast };
}
