<template>
  <b-row class="mb-2">
    <b-col class="d-sm-flex">
      <b-form-group
        :label="$t('global.table.fromDate')"
        label-for="input-from-date"
        class="me-3 my-0 w-100"
      >
        <date-picker
          id="input-from-date"
          v-model:value="fromDate"
          format="YYYY-MM-DD"
          value-type="format"
          placeholder="YYYY-MM-DD"
          :disabled-date="disabledFromDate"
          :lang="locale"
          :append-to-body="false"
          input-class="form-control mb-3 mb-md-0"
          @blur="v$.fromDate.$touch()"
        >
          <template #icon-calendar>
            <button type="button" class="btn btn-link text-primary p-0">
              <icon-calendar />
            </button>
          </template>
        </date-picker>
        <b-form-invalid-feedback
          v-if="v$.fromDate.$invalid && v$.fromDate.$dirty"
          role="alert"
          :state="false"
        >
          <template v-if="v$.fromDate.pattern.$invalid">
            {{ $t('global.form.invalidFormat') }}
          </template>
          <template v-if="v$.fromDate.maxDate.$invalid">
            {{
              $t('global.form.dateMustBeBefore', {
                date: toDate,
              })
            }}
          </template>
        </b-form-invalid-feedback>
      </b-form-group>
      <b-form-group
        :label="$t('global.table.toDate')"
        label-for="input-to-date"
        class="my-0 w-100"
      >
        <date-picker
          id="input-to-date"
          v-model:value="toDate"
          format="YYYY-MM-DD"
          value-type="format"
          placeholder="YYYY-MM-DD"
          :disabled-date="disabledToDate"
          :lang="locale"
          :append-to-body="false"
          input-class="form-control"
          @blur="v$.toDate.$touch()"
        >
          <template #icon-calendar>
            <button type="button" class="btn btn-link text-primary p-0">
              <icon-calendar />
            </button>
          </template>
        </date-picker>
        <b-form-invalid-feedback
          v-if="v$.toDate.$invalid && v$.toDate.$dirty"
          role="alert"
          :state="false"
        >
          <template v-if="v$.toDate.pattern.$invalid">
            {{ $t('global.form.invalidFormat') }}
          </template>
          <template v-if="v$.toDate.minDate.$invalid">
            {{
              $t('global.form.dateMustBeAfter', {
                date: fromDate,
              })
            }}
          </template>
        </b-form-invalid-feedback>
      </b-form-group>
    </b-col>
  </b-row>
</template>

<script>
import IconCalendar from '@carbon/icons-vue/es/calendar/20';
import { helpers } from '@vuelidate/validators';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import { useVuelidate } from '@vuelidate/core';
import DatePicker from 'vue-datepicker-next';
import 'vue-datepicker-next/index.css';

const isoDateRegex = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;

export default {
  components: {
    IconCalendar,
    DatePicker,
  },
  mixins: [VuelidateMixin],
  emits: ['change'],
  setup() {
    return {
      v$: useVuelidate(),
    };
  },
  data() {
    return {
      fromDate: '',
      toDate: '',
      offsetToDate: '',
      locale: this.$store.getters['global/languagePreference'],
    };
  },
  validations() {
    return {
      fromDate: {
        pattern: helpers.regex(isoDateRegex),
        maxDate: (value) => {
          if (!this.toDate) return true;
          const date = new Date(value);
          const maxDate = new Date(this.toDate);
          if (date.getTime() > maxDate.getTime()) return false;
          return true;
        },
      },
      toDate: {
        pattern: helpers.regex(isoDateRegex),
        minDate: (value) => {
          if (!this.fromDate) return true;
          const date = new Date(value);
          const minDate = new Date(this.fromDate);
          if (date.getTime() < minDate.getTime()) return false;
          return true;
        },
      },
    };
  },
  watch: {
    fromDate() {
      this.emitChange();
    },
    toDate(newVal) {
      // Offset the end date to end of day to make sure all
      // entries from selected end date are included in filter
      this.offsetToDate = new Date(newVal).setUTCHours(23, 59, 59, 999);
      this.emitChange();
    },
  },
  methods: {
    disabledFromDate(date) {
      if (!this.toDate) return false;
      return date > new Date(this.toDate);
    },
    disabledToDate(date) {
      if (!this.fromDate) return false;
      return date < new Date(this.fromDate);
    },
    emitChange() {
      if (this.v$.$invalid) return;
      this.v$.$reset(); //reset to re-validate on blur
      this.$emit('change', {
        fromDate: this.fromDate ? new Date(this.fromDate) : null,
        toDate: this.toDate ? new Date(this.offsetToDate) : null,
      });
    },
  },
};
</script>
