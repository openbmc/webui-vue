<template>
  <b-overlay
    :show="show"
    no-wrap
    fixed
    :z-index="2000"
    @shown="onShown"
    @hidden="onHidden"
  >
    <template #overlay>
      <!-- Processing view (optional) -->
      <div
        v-if="processing"
        class="text-center p-4 bg-primary text-light rounded"
      >
        <div class="mb-3">{{ processingText }}</div>
        <b-progress
          :min="1"
          :max="processingMax"
          :value="processingCounter"
          variant="success"
          height="3px"
          class="mx-n4 rounded-0"
        />
      </div>

      <!-- Confirmation prompt -->
      <div
        v-else
        ref="dialog"
        tabindex="-1"
        role="dialog"
        aria-modal="false"
        aria-labelledby="global-confirm-label"
        class="modal-content text-center p-4"
      >
        <p class="mb-2">
          <strong id="global-confirm-label">{{ titleToShow }}</strong>
        </p>
        <p class="mb-3">{{ message }}</p>
        <div class="d-flex justify-content-center" style="column-gap: 5%">
          <b-button :variant="cancelVariant" class="me-3" @click="onCancel">
            {{ cancelTitleToShow }}
          </b-button>
          <b-button :variant="okVariant" @click="onOk">
            {{ okTitleToShow }}
          </b-button>
        </div>
      </div>
    </template>
  </b-overlay>
</template>

<script>
import { useI18n } from 'vue-i18n';
import i18n from '@/i18n';

export default {
  name: 'ConfirmModal',
  data() {
    const $t = useI18n().t;
    return {
      $t,
      show: false,
      message: '',
      title: '',
      okTitle: '',
      cancelTitle: '',
      okVariant: 'danger',
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
  },
  created() {
    const bus = require('@/eventBus').default;
    bus.$on('confirm:open', this.enqueue);
  },
  beforeUnmount() {
    require('@/eventBus').default.$off('confirm:open', this.enqueue);
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
      this.title = req.title || '';
      this.okTitle = req.okTitle || '';
      this.cancelTitle = req.cancelTitle || '';
      this.okVariant = req.okVariant || 'danger';
      this.cancelVariant = req.cancelVariant || 'secondary';
      this.resolver = req.resolve || null;
      this.processing = false;
      this.processingCounter = 1;
      this.processingMax = req.processingMax || 20;
      this.processingText = req.processingText || 'Processing...';
      this.currentRequestProcessing = !!req.processing;
      this.show = true;
    },
    onOk() {
      // If processing is requested, show progress before resolving
      if (this.requestWantsProcessing()) {
        this.startProcessing(() => {
          if (this.resolver) this.resolver(true);
          this.resolver = null;
          // Hide overlay after processing
          this.show = false;
        });
        return;
      }
      if (this.resolver) this.resolver(true);
      this.resolver = null;
      this.show = false;
    },
    onCancel() {
      if (this.resolver) this.resolver(false);
      this.resolver = null;
      this.show = false;
    },
    onShown() {
      // Bind ESC to cancel while overlay is visible
      this._onKeydown = (e) => {
        if (e.key === 'Escape' || e.key === 'Esc') {
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
      // Process next in queue
      this.show = false;
      this.stopProcessing();
      // Unbind ESC handler
      if (this._onKeydown) {
        document.removeEventListener('keydown', this._onKeydown, {
          capture: true,
        });
        this._onKeydown = null;
      }
      this.next();
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
