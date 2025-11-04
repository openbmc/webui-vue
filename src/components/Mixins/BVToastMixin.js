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
      // Use global toast plugin (works with Options API)
      // Extract text content from VNodes for display

      // Extract title text from VNode
      const titleText =
        typeof title === 'string'
          ? title
          : title?.children?.[1] || title?.children || '';

      // Extract body text from VNode array
      // Each VNode (paragraph) should be on its own line
      const bodyLines = Array.isArray(body)
        ? body.map((node) => {
            if (typeof node === 'string') return node;
            // Extract text from VNode children
            const text = node?.children || node?.props?.children || '';
            // Ensure timestamps and other paragraphs are on separate lines
            return text;
          })
        : [typeof body === 'string' ? body : body?.children || ''];

      // Join with newlines to ensure timestamps appear on their own line
      const bodyText = bodyLines.filter(Boolean).join('\n');

      // Show toast via global plugin
      if (this.$toast) {
        this.$toast.show({
          body: bodyText,
          props: {
            title: titleText,
            variant,
            isStatus: true,
            solid: false, // Use light backgrounds with dark text (not solid colors)
            // Success toasts auto-dismiss after 10s, others stay until closed
            modelValue: variant === 'success' ? 10000 : true,
          },
        });
      } else {
        // Fallback: log to console
        /* eslint-disable no-console */
        console[variant === 'danger' ? 'error' : 'log'](
          `[toast:${variant}]`,
          bodyText,
        );
        /* eslint-enable no-console */
      }
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
      if (timestamp) {
        body.push(' '); // Extra newline for spacing above timestamp
        body.push(this.$_BVToastMixin_createTimestamp());
      }
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
      if (timestamp) {
        body.push(' '); // Extra newline for spacing above timestamp
        body.push(this.$_BVToastMixin_createTimestamp());
      }
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
      if (timestamp) {
        body.push(' '); // Extra newline for spacing above timestamp
        body.push(this.$_BVToastMixin_createTimestamp());
      }
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
      if (timestamp) {
        body.push(' '); // Extra newline for spacing above timestamp
        body.push(this.$_BVToastMixin_createTimestamp());
      }
      this.$_BVToastMixin_initToast(body, title, 'info');
    },
  },
};

export default BVToastMixin;
