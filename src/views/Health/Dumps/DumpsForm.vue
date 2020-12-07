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
      <b-button variant="primary" type="submit" form="form-new-dump">
        {{ $t('pageDumps.form.createNewDump') }}
      </b-button>
    </b-form>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';

import BVToastMixin from '@/components/Mixins/BVToastMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';

export default {
  mixins: [BVToastMixin, VuelidateMixin],
  data() {
    return {
      selectedDumpType: null,
      dumpTypeOptions: [
        { value: 'bmc', text: this.$t('pageDumps.form.bmcDump') },
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
      if (this.selectedDumpType === 'system') {
        this.createSystemDump();
      } else {
        this.$store
          .dispatch('dumps/createBmcDump')
          .then((success) => this.successToast(success))
          .catch(({ message }) => this.errorToast(message));
      }
    },
    createSystemDump() {
      this.$bvModal
        .msgBoxConfirm(this.$t('pageDumps.modal.startSystemDumpConfirmation'), {
          title: this.$t('pageDumps.modal.startSystemDump'),
          okTitle: this.$t('pageDumps.modal.startSystemDump'),
          okVariant: 'danger',
        })
        .then((startConfirm) => {
          if (startConfirm) {
            this.$store
              .dispatch('dumps/createSystemDump')
              .then((success) => this.successToast(success))
              .catch(({ message }) => this.errorToast(message));
          }
        });
    },
  },
};
</script>
