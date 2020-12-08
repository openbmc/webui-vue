<template>
  <b-modal id="modal-reset-settings" ref="modal" centered @hidden="resetForm">
    <template #modal-title>
      <template v-if="isShowHypervisor">
        {{ $t('pageFactoryReset.resetHypervisorSettings') }}
      </template>
      <template v-else>
        {{ $t('pageFactoryReset.resetBmcHypervisorSettings') }}
      </template>
    </template>
    <p class="font-weight-bold mb-1">
      {{ $t('pageFactoryReset.modal.subTitle') }}
    </p>
    <ul class="dashed pl-3">
      <li>{{ $t('pageFactoryReset.modal.message2') }}</li>
      <li>{{ $t('pageFactoryReset.modal.message3') }}</li>
      <template v-if="!isShowHypervisor">
        <li>{{ $t('pageFactoryReset.modal.message4') }}</li>
        <li>{{ $t('pageFactoryReset.modal.message5') }}</li>
        <li>{{ $t('pageFactoryReset.modal.message6') }}</li>
      </template>
    </ul>
    <div v-if="hostStatus === 'on'">
      <p class="d-flex">
        <span class="text-danger pr-1"><icon-close /></span>
        {{ $t('pageFactoryReset.modal.message1') }}
      </p>
      <div class="mb-3">
        <b-form-checkbox
          v-model="resetConfirmation"
          @input="$v.resetConfirmation.$touch()"
        >
          {{ $t('pageFactoryReset.modal.condition') }}
        </b-form-checkbox>
        <b-form-invalid-feedback
          :state="getValidationState($v.resetConfirmation)"
          role="alert"
        >
          {{ $t('global.form.confirmField') }}
        </b-form-invalid-feedback>
      </div>
    </div>

    <template #modal-footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">
        {{ $t('global.action.cancel') }}
      </b-button>

      <template v-if="hostStatus === 'on'">
        <template v-if="isShowHypervisor">
          <b-button
            type="submit"
            variant="danger"
            @click="resetHypervisorSettings"
          >
            {{ $t('pageFactoryReset.resetHypervisorSettings') }}
          </b-button>
        </template>
        <template v-else>
          <b-button
            type="submit"
            variant="danger"
            @click="resetBmcHostFirmwareSettings"
          >
            {{ $t('pageFactoryReset.resetBmcHypervisorSettings') }}
          </b-button>
        </template>
      </template>
      <template v-else>
        <template v-if="isShowHypervisor">
          <b-button
            type="submit"
            variant="primary"
            @click="resetHypervisorSettings"
          >
            {{ $t('pageFactoryReset.resetHypervisorSettings') }}
          </b-button>
        </template>
        <template v-else>
          <b-button
            type="submit"
            variant="primary"
            @click="resetBmcHostFirmwareSettings"
          >
            {{ $t('pageFactoryReset.resetBmcHypervisorSettings') }}
          </b-button>
        </template>
      </template>
    </template>
  </b-modal>
</template>
<script>
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import BVToastMixin from '@/components/Mixins/BVToastMixin';

import IconClose from '@carbon/icons-vue/es/close--filled/20';

export default {
  components: { IconClose },
  mixins: [VuelidateMixin, BVToastMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      resetConfirmation: false,
      isShowHypervisor: false,
    };
  },
  validations: {
    resetConfirmation: {
      mustBeTrue: (value) => value === true,
    },
  },
  computed: {
    hostStatus() {
      return this.$store.getters['global/hostStatus'];
    },
  },
  methods: {
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    hideBtn(value) {
      this.isShowHypervisor = value;
    },
    resetHypervisorSettings() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.closeModal();
      return this.$store
        .dispatch('factoryReset/resetHostFirmwareSettings')
        .then((message) =>
          this.successToast(this.message != message, (this.title = message))
        )
        .catch(({ message }) => {
          this.errorToast(message);
        });
    },
    resetBmcHostFirmwareSettings() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.closeModal();
      return this.$store
        .dispatch('factoryReset/resetBmcHostFirmwareSettings')
        .then((message) =>
          this.successToast(
            message,
            (this.title = this.$t(
              'pageFactoryReset.toast.successBmcHostFirmwareSettings'
            ))
          )
        )
        .catch(({ message }) => {
          this.errorToast(message);
        });
    },
    resetForm() {
      this.resetConfirmation = false;
      this.$v.$reset();
    },
  },
};
</script>

<style lang="scss" scoped>
ul.dashed {
  list-style-type: none;

  > li:before {
    content: '-';
    margin-left: -14px;
    padding-right: 7px;
  }
}
</style>
