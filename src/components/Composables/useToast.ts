import { useToast as useBootstrapToast } from 'bootstrap-vue-next';
import i18n from '@/i18n';

/**
 * Toast message type - currently restricted to string for simplicity.
 * 
 * TODO: If the API ever needs to pass arrays of VNodes (like in BVToastMixin),
 * expand this type to: string | string[] | { children?: string }[]
 * and update normalizeBody to handle VNode extraction properly.
 */
type ToastMessage = string;

export function useToast() {
  const toast = useBootstrapToast();

  const normalizeBody = (message: ToastMessage): string => {
    // Currently only handles strings
    // If expanded to handle arrays/VNodes, add proper type guards and extraction logic
    return String(message ?? '');
  };

  const successToast = (message: ToastMessage): void => {
    toast.create({
      body: normalizeBody(message),
      props: {
        title: i18n.global.t('global.status.success'),
        variant: 'success',
        isStatus: true,
        // modelValue controls auto-hide delay in milliseconds (10 seconds for success)
        // In bootstrap-vue-next, modelValue can be a number (delay) or false (no auto-hide)
        modelValue: 10000,
        solid: false,
      },
    });
  };

  const errorToast = (message: ToastMessage): void => {
    toast.create({
      body: normalizeBody(message),
      props: {
        title: i18n.global.t('global.status.error'),
        variant: 'danger',
        isStatus: true,
        // modelValue: false disables auto-hide for error toasts (user must dismiss manually)
        modelValue: false,
        solid: false,
      },
    });
  };

  return { successToast, errorToast };
}
