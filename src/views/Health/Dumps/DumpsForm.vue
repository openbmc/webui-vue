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
          class="show tick"
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

      <div v-if="selectedDumpType === 'resource'" class="mb-3">
        <label for="resource"
          >{{ $t('pageDumps.form.resourceSelector') }}
        </label>
        <label for="resource">
          {{ $t('pageDumps.form.resourceSelectorCharactersLimit') }}
        </label>
        <b-form-input id="input-resource" v-model="resourcemodel" type="text">
        </b-form-input>
      </div>

      <div v-if="selectedDumpType === 'resource'" class="mb-3">
        <div v-if="passwordshow">
          <label for="input-resource">
            {{ $t('pageDumps.form.resourcePassword') }} </label
          ><br />
          <label for="resource">{{
            $t('pageDumps.form.resourceAuthorization')
          }}</label>

          <b-form-input
            id="resource"
            v-model="passwordresource"
            type="password"
          >
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
      resourcemodel: null,
      passwordresource: null,
      passwordshow: false,
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
      if (this.selectedDumpType === 'system') {
        this.showConfirmationModal();
      } else if (this.selectedDumpType === 'resource') {
        this.$store
          .dispatch('dumps/getAllDumps')
          .then(() => {
            this.infoToast(
              this.$t('pageDumps.toast.successStartResourceDump'),
              {
                title: this.$t('pageDumps.toast.successStartResourceTitle'),
                timestamp: true,
              }
            );
          })
          .catch(() => {
            this.errorToast(
              this.$t('pageDumps.toast.successStartResourceDump'),
              {
                title: this.$t('pageDumps.toast.successStartResourceTitle'),
                timestamp: true,
              }
            );
          });
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
