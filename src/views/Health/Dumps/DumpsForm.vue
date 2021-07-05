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
          :state="getValidationState($v.selectedDumpType)"
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
      <template v-if="selectedDumpType === 'resource'">
        <b-form-group label-for="resourceSelector">
          <template #label>
            {{ $t('pageDumps.form.resourceSelector') }}
            <info-tooltip
              :title="$t('pageDumps.form.resourceSelectorTooltip')"
            />
          </template>

          <b-form-input id="resourceSelector" v-model="resourceSelectorValue">
          </b-form-input>
        </b-form-group>

        <template v-if="isServiceLoginEnabled">
          <b-form-group label-for="password">
            <template #label>
              {{ $t('pageDumps.form.password') }}
              <info-tooltip :title="$t('pageDumps.form.passwordTooltip')" />
            </template>
            <input-password-toggle>
              <b-form-input
                id="password"
                v-model="resourcePassword"
                type="password"
              >
              </b-form-input>
            </input-password-toggle>
          </b-form-group>
        </template>
      </template>

      <alert variant="info" class="mb-3" :show="selectedDumpType === 'system'">
        {{ $t('pageDumps.form.systemDumpInfo') }}
      </alert>
      <b-button variant="primary" type="submit" form="form-new-dump">
        {{ $t('pageDumps.form.initiateDump') }}
      </b-button>
    </b-form>
    <modal-confirmation @ok="createSystemDump" />
  </div>
</template>

<script>
// TODO: Resource selector and resource password will be updated with backend changes

import { required } from 'vuelidate/lib/validators';
import ModalConfirmation from './DumpsModalConfirmation';
import InfoTooltip from '@/components/Global/InfoTooltip';
import Alert from '@/components/Global/Alert';
import InputPasswordToggle from '@/components/Global/InputPasswordToggle';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';

export default {
  components: { Alert, InfoTooltip, InputPasswordToggle, ModalConfirmation },
  mixins: [BVToastMixin, VuelidateMixin],
  data() {
    return {
      selectedDumpType: null,
      resourceSelectorValue: null,
      resourcePassword: null,
      isServiceLoginEnabled: true,
      dumpTypeOptions: [
        { value: 'bmc', text: this.$t('pageDumps.form.bmcDump') },
        { value: 'resource', text: this.$t('pageDumps.form.resourceDump') },
        { value: 'system', text: this.$t('pageDumps.form.systemDump') },
      ],
    };
  },
  validations() {
    return {
      selectedDumpType: { required },
    };
  },
  methods: {
    handleSubmit() {
      this.$v.$touch();
      if (this.$v.$invalid) return;

      // Dumps intitiation

      // System dump initiation
      if (this.selectedDumpType === 'system') {
        this.showConfirmationModal();
      }
      // Resource dump initiation
      else if (this.selectedDumpType === 'resource') {
        this.$store
          .dispatch('dumps/createResourceDump')
          .then(() =>
            this.infoToast(
              this.$t('pageDumps.toast.successStartResourceDump'),
              {
                title: this.$t('pageDumps.toast.successStartResourceDumpTitle'),
                timestamp: true,
              }
            )
          )
          .catch(({ message }) => this.errorToast(message));
      }
      // BMC dump initiation
      else if (this.selectedDumpType === 'bmc') {
        this.$store
          .dispatch('dumps/createBmcDump')
          .then(() =>
            this.infoToast(this.$t('pageDumps.toast.successStartBmcDump'), {
              title: this.$t('pageDumps.toast.successStartBmcDumpTitle'),
              timestamp: true,
            })
          )
          .catch(({ message }) => this.errorToast(message));
      }
    },
    showConfirmationModal() {
      this.$bvModal.show('modal-confirmation');
    },
    createSystemDump() {
      this.$store
        .dispatch('dumps/createSystemDump')
        .then(() =>
          this.infoToast(this.$t('pageDumps.toast.successStartSystemDump'), {
            title: this.$t('pageDumps.toast.successStartSystemDumpTitle'),
            timestamp: true,
          })
        )
        .catch(({ message }) => this.errorToast(message));
    },
  },
};
</script>
