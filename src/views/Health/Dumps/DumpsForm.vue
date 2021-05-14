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

      <div
        v-if="selectedDumpType === 'resource'"
        class="login-form__section mb-3"
      >
        <label for="resource">Resource selector - optional</label><br />
        <label for="resource">Cannot exceed 80 characters</label>

        <b-form-input
          id="resource"
          v-model="resoucemodel"
          type="text"
          :formatter="charterset"
        >
        </b-form-input>
      </div>
      <div
        v-if="selectedDumpType === 'resource'"
        class="login-form__section mb-3"
      >
        <div v-if="passwordshow">
          <label for="resource">Password - optional</label><br />
          <label for="resource"
            >Required for resource selectors that need service
            authorization</label
          >

          <b-form-input id="resource" v-model="passwordresouce" type="password">
          </b-form-input>
        </div>
      </div>

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
import { required } from 'vuelidate/lib/validators';

import ModalConfirmation from './DumpsModalConfirmation';
import Alert from '@/components/Global/Alert';

import BVToastMixin from '@/components/Mixins/BVToastMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';

export default {
  components: { Alert, ModalConfirmation },
  mixins: [BVToastMixin, VuelidateMixin],
  data() {
    return {
      selectedDumpType: null,
      resoucemodel: null,
      passwordresouce: null,
      passwordshow: false,
      dumpTypeOptions: [
        { value: 'bmc', text: this.$t('pageDumps.form.bmcDump') },
        { value: 'system', text: this.$t('pageDumps.form.systemDump') },
        { value: 'resource', text: this.$t('pageDumps.form.resourceDump') },
      ],
    };
  },
  validations() {
    return {
      selectedDumpType: { required },
    };
  },
  methods: {
    charterset(e) {
      return String(e).substring(0, 80);
    },
    handleSubmit() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      if (this.selectedDumpType === 'system') {
        this.showConfirmationModal();
      } else if (this.selectedDumpType === 'resource') {
        //if (this.resoucemodel) {
        this.$store
          .dispatch('dumps/createResourceDump')
          .then(() =>
            this.infoToast(
              this.$t('pageDumps.toast.successStartResourceDump'),
              {
                title: this.$t('pageDumps.toast.successStartResourceTitle'),
                timestamp: true,
              }
            )
          )
          .catch(({ message }) => this.errorToast(message));
        // if (this.resoucemodel === "waiters") {
        //   this.infoToast(
        //     this.$t("pageDumps.toast.successStartResourceDump"),
        //     {
        //       title: this.$t("pageDumps.toast.successStartResourceTitle"),
        //       timestamp: true,
        //     }
        //   );
        // } else {
        //   this.errorToast("Invalid resource selector. Try again");
        // }
        // }
      } else {
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
