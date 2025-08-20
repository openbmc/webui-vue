import { useToastController } from 'bootstrap-vue-next';
import { h } from 'vue';
import StatusIcon from '../Global/StatusIcon';
import i18n from '@/i18n';

const BVToastMixin = {
  components: {
    StatusIcon,
  },
  methods: {
    $_BVToastMixin_createTitle(title, status) {
      const statusIcon = h(StatusIcon, { status });
      return h('strong', { class: 'toast-icon' }, [statusIcon, title]);
    },
    $_BVToastMixin_createBody(messageBody) {
      if (Array.isArray(messageBody)) {
        return messageBody.map((message) => h('p', { class: 'mb-0' }, message));
      } else {
        return [h('p', { class: 'mb-0' }, messageBody)];
      }
    },
    $_BVToastMixin_createTimestamp() {
      const timestamp = this.$filters.formatTime(new Date());
      return h('p', { class: 'mt-3 mb-0' }, timestamp);
    },
    $_BVToastMixin_createRefreshAction() {
      return h(
        'BLink',
        {
          class: 'd-inline-block mt-3',
          onClick: () => {
            require('@/eventBus').default.$emit('refresh-application');
          },
        },
        i18n.global.t('global.action.refresh'),
      );
    },
    $_BVToastMixin_initToast(body, title, variant) {
      // Prefer BootstrapVueNext controller API
      try {
        const { show } = useToastController();
        const asLines = Array.isArray(body)
          ? body.map((n) => (typeof n === 'string' ? n : n?.children || ''))
          : [body];
        const message = asLines.filter(Boolean).join('\n');
        // Success auto-dismiss, others stay until closed
        const value = variant === 'success' ? 10000 : undefined;
        show?.({
          props: {
            title: typeof title === 'string' ? title : '',
            variant,
            isStatus: true,
            value,
          },
          body: message,
        });
        return;
      } catch (e) {
        // no-op; will use console as a last resort
      }
      // Final fallback: log to console to avoid runtime errors
      /* eslint-disable no-console */
      console[variant === 'danger' ? 'error' : 'log'](
        `[toast:${variant}]`,
        ...(Array.isArray(body) ? body.map((n) => n.children || '') : [body]),
      );
      /* eslint-enable no-console */
    },
    successToast(
      message,
      {
        title: t = i18n.global.t('global.status.success'),
        timestamp,
        refreshAction,
      } = {},
    ) {
      const body = this.$_BVToastMixin_createBody(message);
      const title = this.$_BVToastMixin_createTitle(t, 'success');
      if (refreshAction) body.push(this.$_BVToastMixin_createRefreshAction());
      if (timestamp) body.push(this.$_BVToastMixin_createTimestamp());
      this.$_BVToastMixin_initToast(body, title, 'success');
    },
    errorToast(
      message,
      {
        title: t = i18n.global.t('global.status.error'),
        timestamp,
        refreshAction,
      } = {},
    ) {
      const body = this.$_BVToastMixin_createBody(message);
      const title = this.$_BVToastMixin_createTitle(t, 'danger');
      if (refreshAction) body.push(this.$_BVToastMixin_createRefreshAction());
      if (timestamp) body.push(this.$_BVToastMixin_createTimestamp());
      this.$_BVToastMixin_initToast(body, title, 'danger');
    },
    warningToast(
      message,
      {
        title: t = i18n.global.t('global.status.warning'),
        timestamp,
        refreshAction,
      } = {},
    ) {
      const body = this.$_BVToastMixin_createBody(message);
      const title = this.$_BVToastMixin_createTitle(t, 'warning');
      if (refreshAction) body.push(this.$_BVToastMixin_createRefreshAction());
      if (timestamp) body.push(this.$_BVToastMixin_createTimestamp());
      this.$_BVToastMixin_initToast(body, title, 'warning');
    },
    infoToast(
      message,
      {
        title: t = i18n.global.t('global.status.informational'),
        timestamp,
        refreshAction,
      } = {},
    ) {
      const body = this.$_BVToastMixin_createBody(message);
      const title = this.$_BVToastMixin_createTitle(t, 'info');
      if (refreshAction) body.push(this.$_BVToastMixin_createRefreshAction());
      if (timestamp) body.push(this.$_BVToastMixin_createTimestamp());
      this.$_BVToastMixin_initToast(body, title, 'info');
    },
  },
};

export default BVToastMixin;
