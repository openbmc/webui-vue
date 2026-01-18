<template>
  <b-modal
    id="global-confirm-modal"
    ref="modal"
    v-model="show"
    :title="titleToShow"
    :focus="focusTarget"
    no-close-on-backdrop
    no-close-on-esc
    no-header-close
    @shown="onShown"
    @hidden="onHidden"
  >
    <!-- Processing view (optional) -->
    <div v-if="processing" class="text-center" aria-live="polite" role="status">
      <div class="mb-3">{{ processingText }}</div>
      <b-progress
        :min="1"
        :max="processingMax"
        :value="processingCounter"
        variant="success"
        height="3px"
        :aria-label="processingText"
      />
    </div>

    <!-- Confirmation content -->
    <template v-else>
      <!-- Support for multiple message lines -->
      <template v-if="messageLines && messageLines.length > 0">
        <p
          v-for="(line, index) in messageLines"
          :key="index"
          class="mb-2"
          :class="{ 'fw-bold': index === 0 }"
        >
          {{ line }}
        </p>
      </template>
      <p v-else class="mb-3">{{ message }}</p>

      <!-- Optional checkbox confirmation -->
      <b-form-checkbox
        v-if="confirmationText"
        v-model="confirmed"
        aria-describedby="confirm-checkbox-help"
      >
        {{ confirmationText }}
      </b-form-checkbox>
      <span
        v-if="confirmationText"
        id="confirm-checkbox-help"
        class="visually-hidden"
      >
        {{ $t('global.ariaLabel.checkboxToEnableButton') }}
      </span>
    </template>

    <template #footer>
      <b-button
        :variant="cancelVariant"
        :disabled="processing"
        @click="onCancel"
      >
        {{ cancelTitleToShow }}
      </b-button>
      <b-button
        :variant="okVariant"
        :disabled="isOkDisabled"
        :aria-describedby="
          isOkDisabled && confirmationText ? 'ok-disabled-reason' : undefined
        "
        @click="onOk"
      >
        {{ okTitleToShow }}
      </b-button>
      <span
        v-if="confirmationText && !confirmed"
        id="ok-disabled-reason"
        class="visually-hidden"
      >
        {{ $t('global.ariaLabel.buttonDisabledUntilChecked') }}
      </span>
    </template>
  </b-modal>
</template>

<script>
import i18n from '@/i18n';

export default {
  name: 'ConfirmModal',
  data() {
    return {
      show: false,
      message: '',
      messageLines: [], // Array of strings for multi-paragraph messages
      title: '',
      okTitle: '',
      cancelTitle: '',
      okVariant: 'primary',
      cancelVariant: 'secondary',
      resolver: null,
      requestQueue: [],
      // Processing state (optional)
      processing: false,
      processingCounter: 1,
      processingMax: 20,
      processingIntervalId: null,
      processingText: 'Processing...',
      currentRequestProcessing: false,
      autoFocusButton: 'cancel', // 'ok' or 'cancel'
      // Checkbox confirmation (optional)
      confirmationText: '',
      confirmed: false,
    };
  },
  computed: {
    titleToShow() {
      return this.title || i18n.global.t('global.action.confirm') || 'Confirm';
    },
    okTitleToShow() {
      return this.okTitle || i18n.global.t('global.action.confirm') || 'OK';
    },
    cancelTitleToShow() {
      return (
        this.cancelTitle || i18n.global.t('global.action.cancel') || 'Cancel'
      );
    },
    isOkDisabled() {
      if (this.processing) return true;
      // Only require checkbox confirmation if confirmationText is set
      if (this.confirmationText && this.confirmationText.length > 0) {
        return !this.confirmed;
      }
      return false;
    },
    focusTarget() {
      // If there's a checkbox, focus it; otherwise use the autoFocusButton setting
      if (this.confirmationText && this.confirmationText.length > 0) {
        return '#global-confirm-modal .form-check-input';
      }
      return this.autoFocusButton === 'ok' ? 'ok' : 'cancel';
    },
  },
  created() {
    const bus = require('@/eventBus').default;
    bus.$on('confirm:open', this.enqueue);
  },
  beforeUnmount() {
    require('@/eventBus').default.$off('confirm:open', this.enqueue);
    // Clean up keydown listener if still attached
    if (this._onKeydown) {
      document.removeEventListener('keydown', this._onKeydown, {
        capture: true,
      });
      this._onKeydown = null;
    }
  },
  methods: {
    enqueue(payload) {
      const request =
        typeof payload === 'string' ? { message: payload } : payload;
      this.requestQueue.push(request);
      if (!this.show) this.next();
    },
    next() {
      const req = this.requestQueue.shift();
      if (!req) return;
      this.message = req.message || '';
      this.messageLines = req.messageLines || [];
      this.title = req.title || '';
      this.okTitle = req.okTitle || '';
      this.cancelTitle = req.cancelTitle || '';
      this.okVariant = req.okVariant || 'primary';
      this.cancelVariant = req.cancelVariant || 'secondary';
      this.resolver = req.resolve || null;
      this.processing = false;
      this.processingCounter = 1;
      this.processingMax = req.processingMax || 20;
      this.processingText = req.processingText || 'Processing...';
      this.currentRequestProcessing = !!req.processing;
      this.autoFocusButton = req.autoFocusButton || 'cancel';
      // Checkbox confirmation
      this.confirmationText = req.confirmationText || '';
      this.confirmed = false;
      this.show = true;
    },
    onOk() {
      // Don't allow OK during processing
      if (this.processing) return;

      // If processing is requested, show progress before resolving
      if (this.requestWantsProcessing()) {
        this.startProcessing(() => {
          if (this.resolver) this.resolver(true);
          this.resolver = null;
          this.show = false;
        });
        return;
      }
      if (this.resolver) this.resolver(true);
      this.resolver = null;
      this.show = false;
    },
    onCancel() {
      // Don't allow cancel during processing
      if (this.processing) return;

      if (this.resolver) this.resolver(false);
      this.resolver = null;
      this.show = false;
    },
    onShown() {
      // Focus is now handled by the modal's focus prop via focusTarget computed
      // Bind ESC to cancel (we disabled built-in ESC handling for control)
      this._onKeydown = (e) => {
        // Don't handle keys during processing
        if (this.processing) return;

        if (e.key === 'Escape' || e.key === 'Esc') {
          e.preventDefault();
          e.stopPropagation();
          this.onCancel();
        }
      };
      document.addEventListener('keydown', this._onKeydown, { capture: true });
    },
    onHidden() {
      // If user closed without OK, resolve false
      if (this.resolver) this.resolver(false);
      this.resolver = null;
      this.stopProcessing();
      // Reset state
      this.confirmationText = '';
      this.confirmed = false;
      this.messageLines = [];
      // Unbind ESC handler
      if (this._onKeydown) {
        document.removeEventListener('keydown', this._onKeydown, {
          capture: true,
        });
        this._onKeydown = null;
      }
      // Process next in queue after a brief delay to allow modal to fully close
      this.$nextTick(() => {
        this.next();
      });
    },
    requestWantsProcessing() {
      // Enable processing only if explicitly requested via payload.processing === true
      return this.currentRequestProcessing === true;
    },
    startProcessing(done) {
      this.processing = true;
      this.stopProcessing();
      this.processingIntervalId = setInterval(() => {
        if (this.processingCounter < this.processingMax) {
          this.processingCounter += 1;
        } else {
          this.stopProcessing();
          this.processing = false;
          if (typeof done === 'function') done();
        }
      }, 150);
    },
    stopProcessing() {
      if (this.processingIntervalId) {
        clearInterval(this.processingIntervalId);
        this.processingIntervalId = null;
      }
    },
  },
};
</script>
