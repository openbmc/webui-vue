<template>
  <div class="form-background p-3">
    <b-form id="form-new-dump" novalidate @submit.prevent="handleSubmit">
      <b-form-group
        :label="$t('pageDumps.form.selectDumpType')"
        label-for="selectDumpType"
      >
        <b-form-select
          id="selectDumpType"
          v-model="selectedDumpType"
          :options="dumpTypeOptions"
          :state="getValidationState(v$.selectedDumpType)"
        >
          <template #first>
            <b-form-select-option :value="null" disabled>
              {{ $t('global.form.selectAnOption') }}
            </b-form-select-option>
          </template>
        </b-form-select>
        <b-form-invalid-feedback role="alert">
          {{ $t('global.form.required') }}
        </b-form-invalid-feedback>
      </b-form-group>
      <alert variant="info" class="mb-3" :show="selectedDumpType === 'system'">
        {{ $t('pageDumps.form.systemDumpInfo') }}
      </alert>
      <b-button
        variant="primary"
        type="submit"
        form="form-new-dump"
        class="mt-3"
      >
        {{ $t('pageDumps.form.initiateDump') }}
      </b-button>
    </b-form>
  </div>
</template>

<script>
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import Alert from '@/components/Global/Alert';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import i18n from '@/i18n';

export default {
  components: { Alert },
  mixins: [BVToastMixin, VuelidateMixin],
  setup() {
    return {
      v$: useVuelidate(),
    };
  },
  data() {
    return {
      selectedDumpType: null,
      dumpTypeOptions: [
        { value: 'bmc', text: i18n.global.t('pageDumps.dumpTypes.bmcDump') },
        {
          value: 'system',
          text: i18n.global.t('pageDumps.dumpTypes.systemDump'),
        },
      ],
    };
  },
  validations() {
    return {
      selectedDumpType: { required },
    };
  },
  methods: {
    async handleSubmit() {
      this.v$.$touch();
      if (this.v$.$invalid) return;

      // System dump initiation
      if (this.selectedDumpType === 'system') {
        await this.confirmAndCreateSystemDump();
      }
      // BMC dump initiation
      else if (this.selectedDumpType === 'bmc') {
        this.$store
          .dispatch('dumps/createBmcDump')
          .then(() =>
            this.infoToast(
              i18n.global.t('pageDumps.toast.successStartBmcDump'),
              {
                title: i18n.global.t(
                  'pageDumps.toast.successStartBmcDumpTitle',
                ),
                timestamp: true,
              },
            ),
          )
          .catch(({ message }) => this.errorToast(message));
      }
    },
    async confirmAndCreateSystemDump() {
      const messageLines = [
        i18n.global.t('pageDumps.modal.initiateSystemDumpMessage1'),
        i18n.global.t('pageDumps.modal.initiateSystemDumpMessage2'),
        i18n.global.t('pageDumps.modal.initiateSystemDumpMessage3'),
      ];

      const ok = await this.$confirm({
        messageLines,
        title: i18n.global.t('pageDumps.modal.initiateSystemDump'),
        okTitle: i18n.global.t('pageDumps.form.initiateDump'),
        cancelTitle: i18n.global.t('global.action.cancel'),
        okVariant: 'danger',
        confirmationText: i18n.global.t(
          'pageDumps.modal.initiateSystemDumpMessage4',
        ),
      });

      if (ok) {
        this.$store
          .dispatch('dumps/createSystemDump')
          .then(() =>
            this.infoToast(
              i18n.global.t('pageDumps.toast.successStartSystemDump'),
              {
                title: i18n.global.t(
                  'pageDumps.toast.successStartSystemDumpTitle',
                ),
                timestamp: true,
              },
            ),
          )
          .catch(({ message }) => this.errorToast(message));
      }
    },
  },
};
</script>
