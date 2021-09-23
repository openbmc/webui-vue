import i18n from '@/i18n';
/**
 * Update led status error
 */
export default class UpdateLedStatusError extends Error {
  /**
   * status that should be set
   * @param {boolean} status
   */
  constructor(status) {
    const messageKey = status
      ? 'pageInventory.toast.errorEnableIdentifyLed'
      : 'pageInventory.toast.errorDisableIdentifyLed';

    super(i18n.t(messageKey));
    this.name = 'UpdateLedStatusError';
  }
}
