import i18n from '@/i18n';
import StatusIcon from '../Global/StatusIcon';

const BVToastMixin = {
  components: {
    StatusIcon,
  },
  methods: {
    _createTitle(title, status) {
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
    _createBody(messageBody) {
      if (Array.isArray(messageBody)) {
        return messageBody.map((message, i) => {
          if (i === messageBody.length - 1) {
            return this.$createElement('p', { class: 'mb-0' }, message);
          }
          return this.$createElement('p', message);
        });
      } else {
        return [this.$createElement('p', { class: 'mb-0' }, messageBody)];
      }
    },
    _createTimestamp() {
      const timestamp = this.$options.filters.formatTime(new Date());
      return this.$createElement('p', { class: 'mt-3 mb-0' }, timestamp);
    },
    _createRefreshAction() {
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
    _initToast(body, title, variant) {
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
        title: t = i18n.t('global.status.success'),
        timestamp,
        refreshAction,
      } = {}
    ) {
      const body = this._createBody(message);
      const title = this._createTitle(t, 'success');
      if (refreshAction) body.push(this._createRefreshAction());
      if (timestamp) body.push(this._createTimestamp());
      this._initToast(body, title, 'success');
    },
    errorToast(
      message,
      {
        title: t = i18n.t('global.status.error'),
        timestamp,
        refreshAction,
      } = {}
    ) {
      const body = this._createBody(message);
      const title = this._createTitle(t, 'danger');
      if (refreshAction) body.push(this._createRefreshAction());
      if (timestamp) body.push(this._createTimestamp());
      this._initToast(body, title, 'danger');
    },
    warningToast(
      message,
      {
        title: t = i18n.t('global.status.warning'),
        timestamp,
        refreshAction,
      } = {}
    ) {
      const body = this._createBody(message);
      const title = this._createTitle(t, 'warning');
      if (refreshAction) body.push(this._createRefreshAction());
      if (timestamp) body.push(this._createTimestamp());
      this._initToast(body, title, 'warning');
    },
    infoToast(
      message,
      {
        title: t = i18n.t('global.status.informational'),
        timestamp,
        refreshAction,
      } = {}
    ) {
      const body = this._createBody(message);
      const title = this._createTitle(t, 'info');
      if (refreshAction) body.push(this._createRefreshAction());
      if (timestamp) body.push(this._createTimestamp());
      this._initToast(body, title, 'info');
    },
  },
};

export default BVToastMixin;
