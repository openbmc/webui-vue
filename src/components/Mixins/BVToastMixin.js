import StatusIcon from '../Global/StatusIcon';

const BVToastMixin = {
  components: {
    StatusIcon,
  },
  methods: {
    $_BVToastMixin_createTitle(title, status) {
      const statusIcon = this.$createElement('StatusIcon', {
        props: { status },
      });
      const titleWithIcon = this.$createElement(
        'strong',
        { class: 'toast-icon' },
        [statusIcon, title]
      );
      return titleWithIcon;
    },
    $_BVToastMixin_createBody(messageBody) {
      if (Array.isArray(messageBody)) {
        return messageBody.map((message) =>
          this.$createElement('p', { class: 'mb-0' }, message)
        );
      } else {
        return [this.$createElement('p', { class: 'mb-0' }, messageBody)];
      }
    },
    $_BVToastMixin_createTimestamp() {
      const timestamp = this.$options.filters.formatTime(new Date());
      return this.$createElement('p', { class: 'mt-3 mb-0' }, timestamp);
    },
    $_BVToastMixin_createRefreshAction() {
      return this.$createElement(
        'BLink',
        {
          class: 'd-inline-block mt-3',
          on: {
            click: () => {
              this.$root.$emit('refresh-application');
            },
          },
        },
        this.$t('global.action.refresh')
      );
    },
    $_BVToastMixin_initToast(body, title, variant) {
      this.$root.$bvToast.toast(body, {
        title,
        variant,
        autoHideDelay: 10000, //auto hide in milliseconds
        noAutoHide: variant !== 'success',
        isStatus: true,
        solid: true,
      });
    },
    successToast(
      message,
      {
        title: t = this.$t('global.status.success'),
        timestamp,
        refreshAction,
      } = {}
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
        title: t = this.$t('global.status.error'),
        timestamp,
        refreshAction,
      } = {}
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
        title: t = this.$t('global.status.warning'),
        timestamp,
        refreshAction,
      } = {}
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
        title: t = this.$t('global.status.informational'),
        timestamp,
        refreshAction,
      } = {}
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
