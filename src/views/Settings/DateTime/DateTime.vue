<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <b-col md="8" xl="6">
        <alert variant="info" class="mb-4">
          <span>
            {{ $t('pageDateTime.alert.message') }}
            <b-link to="/profile-settings">
              {{ $t('pageDateTime.alert.link') }}</b-link
            >
          </span>
        </alert>
      </b-col>
    </b-row>
    <page-section>
      <b-row>
        <b-col lg="3">
          <dl>
            <dt>{{ $t('pageDateTime.form.date') }}</dt>
            <dd v-if="bmcTime">{{ bmcTime | formatDate }}</dd>
            <dd v-else>--</dd>
          </dl>
        </b-col>
        <b-col lg="3">
          <dl>
            <dt>{{ $t('pageDateTime.form.time.label') }}</dt>
            <dd v-if="bmcTime">{{ bmcTime | formatTime }}</dd>
            <dd v-else>--</dd>
          </dl>
        </b-col>
      </b-row>
    </page-section>
    <page-section :section-title="$t('pageDateTime.configureSettings')">
      <b-form novalidate @submit.prevent="submitForm">
        <b-form-group
          label="Configure date and time"
          :disabled="loading"
          label-sr-only
        >
          <b-form-radio
            v-model="form.configurationSelected"
            value="manual"
            data-test-id="dateTime-radio-configureManual"
          >
            {{ $t('pageDateTime.form.manual') }}
          </b-form-radio>
          <b-row class="mt-3 ml-3">
            <b-col sm="6" lg="4" xl="3">
              <b-form-group
                :label="$t('pageDateTime.form.date')"
                label-for="input-manual-date"
              >
                <b-form-text id="date-format-help">YYYY-MM-DD</b-form-text>
                <b-input-group>
                  <b-form-input
                    id="input-manual-date"
                    v-model="form.manual.date"
                    :state="getValidationState($v.form.manual.date)"
                    :disabled="ntpOptionSelected"
                    data-test-id="dateTime-input-manualDate"
                    class="form-control-with-button"
                    @blur="$v.form.manual.date.$touch()"
                  />
                  <b-form-invalid-feedback role="alert">
                    <div v-if="!$v.form.manual.date.pattern">
                      {{ $t('global.form.invalidFormat') }}
                    </div>
                    <div v-if="!$v.form.manual.date.required">
                      {{ $t('global.form.fieldRequired') }}
                    </div>
                  </b-form-invalid-feedback>
                  <b-form-datepicker
                    v-model="form.manual.date"
                    class="btn-datepicker btn-icon-only"
                    button-only
                    right
                    :hide-header="true"
                    :locale="locale"
                    :label-help="
                      $t('global.calendar.useCursorKeysToNavigateCalendarDates')
                    "
                    :title="$t('global.calendar.selectDate')"
                    :disabled="ntpOptionSelected"
                    button-variant="link"
                    aria-controls="input-manual-date"
                  >
                    <template #button-content>
                      <icon-calendar />
                      <span class="sr-only">
                        {{ $t('global.calendar.selectDate') }}
                      </span>
                    </template>
                  </b-form-datepicker>
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col sm="6" lg="4" xl="3">
              <b-form-group
                :label="$t('pageDateTime.form.time.timezone', { timezone })"
                label-for="input-manual-time"
              >
                <b-form-text id="time-format-help">HH:MM</b-form-text>
                <b-input-group>
                  <b-form-input
                    id="input-manual-time"
                    v-model="form.manual.time"
                    :state="getValidationState($v.form.manual.time)"
                    :disabled="ntpOptionSelected"
                    data-test-id="dateTime-input-manualTime"
                    @blur="$v.form.manual.time.$touch()"
                  />
                  <b-form-invalid-feedback role="alert">
                    <div v-if="!$v.form.manual.time.pattern">
                      {{ $t('global.form.invalidFormat') }}
                    </div>
                    <div v-if="!$v.form.manual.time.required">
                      {{ $t('global.form.fieldRequired') }}
                    </div>
                  </b-form-invalid-feedback>
                </b-input-group>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row class="mt-3 ml-3">
            <b-col xl="6">
              <b-form-group
                :label="$t('pageDateTime.form.timezone')"
                label-for="timeZone"
              >
                <b-form-select
                  id="timeZone"
                  v-model="form.manual.dateTimeLocalOffset"
                  :options="timeZoneOptions"
                >
                </b-form-select>
              </b-form-group>
            </b-col>
          </b-row>
          <b-form-radio
            v-model="form.configurationSelected"
            value="ntp"
            data-test-id="dateTime-radio-configureNTP"
          >
            NTP
          </b-form-radio>
          <b-row class="mt-3 ml-3">
            <b-col sm="6" lg="4" xl="3">
              <b-form-group
                :label="$t('pageDateTime.form.ntpServers.server1')"
                label-for="input-ntp-1"
              >
                <b-input-group>
                  <b-form-input
                    id="input-ntp-1"
                    v-model="form.ntp.firstAddress"
                    :state="getValidationState($v.form.ntp.firstAddress)"
                    :disabled="manualOptionSelected"
                    data-test-id="dateTime-input-ntpServer1"
                    @blur="$v.form.ntp.firstAddress.$touch()"
                  />
                  <b-form-invalid-feedback role="alert">
                    <div v-if="!$v.form.ntp.firstAddress.required">
                      {{ $t('global.form.fieldRequired') }}
                    </div>
                  </b-form-invalid-feedback>
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col sm="6" lg="4" xl="3">
              <b-form-group
                :label="$t('pageDateTime.form.ntpServers.server2')"
                label-for="input-ntp-2"
              >
                <b-input-group>
                  <b-form-input
                    id="input-ntp-2"
                    v-model="form.ntp.secondAddress"
                    :disabled="manualOptionSelected"
                    data-test-id="dateTime-input-ntpServer2"
                  />
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col sm="6" lg="4" xl="3">
              <b-form-group
                :label="$t('pageDateTime.form.ntpServers.server3')"
                label-for="input-ntp-3"
              >
                <b-input-group>
                  <b-form-input
                    id="input-ntp-3"
                    v-model="form.ntp.thirdAddress"
                    :disabled="manualOptionSelected"
                    data-test-id="dateTime-input-ntpServer3"
                  />
                </b-input-group>
              </b-form-group>
            </b-col>
          </b-row>
          <b-button
            variant="primary"
            type="submit"
            data-test-id="dateTime-button-saveSettings"
          >
            {{ $t('global.action.saveSettings') }}
          </b-button>
        </b-form-group>
      </b-form>
    </page-section>
  </b-container>
</template>

<script>
import Alert from '@/components/Global/Alert';
import IconCalendar from '@carbon/icons-vue/es/calendar/20';
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';

import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';
import LocalTimezoneLabelMixin from '@/components/Mixins/LocalTimezoneLabelMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';

import { mapState } from 'vuex';
import { requiredIf, helpers } from 'vuelidate/lib/validators';

const isoDateRegex = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
const isoTimeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

export default {
  name: 'DateTime',
  components: { Alert, IconCalendar, PageTitle, PageSection },
  mixins: [
    BVToastMixin,
    LoadingBarMixin,
    LocalTimezoneLabelMixin,
    VuelidateMixin,
  ],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      locale: this.$store.getters['global/languagePreference'],
      form: {
        configurationSelected: 'manual',
        manual: {
          date: '',
          time: '',
          dateTimeLocalOffset: this.$store.getters['global/timeZone'],
        },
        ntp: { firstAddress: '', secondAddress: '', thirdAddress: '' },
      },
      loading,
      timeZoneOptions: [
        {
          value: '-11:00',
          text: this.$t('pageDateTime.timeZone.MIDWAY'),
        },
        {
          value: '-10:00',
          text: this.$t('pageDateTime.timeZone.HONOLULU'),
        },
        {
          value: '-09:00',
          text: this.$t('pageDateTime.timeZone.ANCHORAGE'),
        },
        {
          value: '-08:00',
          text: this.$t('pageDateTime.timeZone.LOSANGELES_TIJUANA'),
        },
        {
          value: '-07:00',
          text: this.$t('pageDateTime.timeZone.PHOENIX_CHIHUAHUA_DENVER'),
        },
        {
          value: '-06:00',
          text: this.$t(
            'pageDateTime.timeZone.COSTARICA_CHICAGO_MEXICOCITY_REGINA'
          ),
        },
        {
          value: '-05:00',
          text: this.$t('pageDateTime.timeZone.BOGOTA'),
        },
        {
          value: '-04:30',
          text: this.$t('pageDateTime.timeZone.CARACAS'),
        },
        {
          value: '-04:00',
          text: this.$t('pageDateTime.timeZone.BARBADOS_HALIFAX_MANAUS'),
        },
        {
          value: '-03:30',
          text: this.$t('pageDateTime.timeZone.STJOHNS'),
        },
        {
          value: '-03:00',
          text: this.$t(
            'pageDateTime.timeZone.SANTIAGO_RECIFE_BUENOSAIRES_NUUK_MONTEVIDEO'
          ),
        },
        {
          value: '-02:00',
          text: this.$t('pageDateTime.timeZone.SAOPAULO'),
        },
        {
          value: '-01:00',
          text: this.$t('pageDateTime.timeZone.AZORES_CAPEVERDE'),
        },
        {
          value: '+00:00',
          text: this.$t('pageDateTime.timeZone.CASABLANCA_LONDON'),
        },
        {
          value: '+01:00',
          text: this.$t(
            'pageDateTime.timeZone.AMSTERDAM_BELGRADE_BRUSSELS_MADRID_SARAJEVO_BRAZZAVILLE'
          ),
        },
        {
          value: '+02:00',
          text: this.$t(
            'pageDateTime.timeZone.WINDHOEK_AMMAN_ATHENS_ISTANBUL_BEIRUT_CAIRO_HELSINKI_JERUSALEM_HARARE'
          ),
        },
        {
          value: '+03:00',
          text: this.$t(
            'pageDateTime.timeZone.MINSK_BAGHDAD_MOSCOW_KUWAIT_NAIROBI'
          ),
        },
        {
          value: '+03:30',
          text: this.$t('pageDateTime.timeZone.TEHRAN'),
        },
        {
          value: '+04:00',
          text: this.$t('pageDateTime.timeZone.BAKU_TBILISI_YEREVAN_DUBAI'),
        },
        {
          value: '+04:30',
          text: this.$t('pageDateTime.timeZone.KABUL'),
        },
        {
          value: '+05:00',
          text: this.$t('pageDateTime.timeZone.KARACHI_ORAL_YEKATERINBURG'),
        },
        {
          value: '+05:30',
          text: this.$t('pageDateTime.timeZone.KOLKATA_COLOMBO'),
        },
        {
          value: '+05:45',
          text: this.$t('pageDateTime.timeZone.KATHMANDU'),
        },
        {
          value: '+06:00',
          text: this.$t('pageDateTime.timeZone.ALMATY'),
        },
        {
          value: '+06:30',
          text: this.$t('pageDateTime.timeZone.RANGOON'),
        },
        {
          value: '+07:00',
          text: this.$t('pageDateTime.timeZone.KRASNOYARSK_BANGKOK_JAKARTA'),
        },
        {
          value: '+08:00',
          text: this.$t(
            'pageDateTime.timeZone.SHANGHAI_HONGKONG_IRKUTSK_KUALALUMPUR_PERTH_TAIPEI'
          ),
        },
        {
          value: '+09:00',
          text: this.$t('pageDateTime.timeZone.SEOUL_TOKYO_YAKUTSK'),
        },
        {
          value: '+09:30',
          text: this.$t('pageDateTime.timeZone.DARWIN'),
        },
        {
          value: '+10:00',
          text: this.$t(
            'pageDateTime.timeZone.BRISBANE_VLADIVOSTOK_GUAM_MAGADAN'
          ),
        },
        {
          value: '+10:30',
          text: this.$t('pageDateTime.timeZone.ADELAIDE'),
        },
        {
          value: '+11:00',
          text: this.$t('pageDateTime.timeZone.HOBART_SYDNEY_NOUMEA'),
        },
        {
          value: '+12:00',
          text: this.$t('pageDateTime.timeZone.MAJURO'),
        },
        {
          value: '+13:00',
          text: this.$t('pageDateTime.timeZone.AUCKLAND'),
        },
      ],
    };
  },
  validations() {
    return {
      form: {
        manual: {
          date: {
            required: requiredIf(function () {
              return this.form.configurationSelected === 'manual';
            }),
            pattern: helpers.regex('pattern', isoDateRegex),
          },
          time: {
            required: requiredIf(function () {
              return this.form.configurationSelected === 'manual';
            }),
            pattern: helpers.regex('pattern', isoTimeRegex),
          },
        },
        ntp: {
          firstAddress: {
            required: requiredIf(function () {
              return this.form.configurationSelected === 'ntp';
            }),
          },
        },
      },
    };
  },
  computed: {
    ...mapState('dateTime', ['ntpServers', 'isNtpProtocolEnabled']),
    bmcTime() {
      return this.$store.getters['global/bmcTime'];
    },
    dateTimeLocalOffset() {
      return this.$store.getters['global/timeZone'];
    },
    ntpOptionSelected() {
      return this.form.configurationSelected === 'ntp';
    },
    manualOptionSelected() {
      return this.form.configurationSelected === 'manual';
    },
    isUtcDisplay() {
      return this.$store.getters['global/isUtcDisplay'];
    },
    timezone() {
      if (this.isUtcDisplay) {
        return 'UTC';
      }
      return this.localOffset();
    },
  },
  watch: {
    ntpServers() {
      this.setNtpValues();
    },
    manualDate() {
      this.emitChange();
    },
    bmcTime() {
      this.form.manual.date = this.$options.filters.formatDate(
        this.$store.getters['global/bmcTime']
      );
      this.form.manual.time = this.$options.filters
        .formatTime(this.$store.getters['global/bmcTime'])
        .slice(0, 5);
    },
    dateTimeLocalOffset() {
      this.form.manual.dateTimeLocalOffset = this.$store.getters[
        'global/timeZone'
      ];
    },
  },
  created() {
    this.startLoader();
    this.setNtpValues();
    Promise.all([
      this.$store.dispatch('global/getBmcTime'),
      this.$store.dispatch('dateTime/getNtpData'),
    ]).finally(() => this.endLoader());
  },
  methods: {
    emitChange() {
      if (this.$v.$invalid) return;
      this.$v.$reset(); //reset to re-validate on blur
      this.$emit('change', {
        manualDate: this.manualDate ? new Date(this.manualDate) : null,
      });
    },
    setNtpValues() {
      this.form.configurationSelected = this.isNtpProtocolEnabled
        ? 'ntp'
        : 'manual';
      [
        this.form.ntp.firstAddress = '',
        this.form.ntp.secondAddress = '',
        this.form.ntp.thirdAddress = '',
      ] = [this.ntpServers[0], this.ntpServers[1], this.ntpServers[2]];
    },
    submitForm() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.startLoader();

      let dateTimeForm = {};
      let isNTPEnabled = this.form.configurationSelected === 'ntp';
      dateTimeForm.dateTimeLocalOffset = this.form.manual.dateTimeLocalOffset;

      if (!isNTPEnabled) {
        const isUtcDisplay = this.$store.getters['global/isUtcDisplay'];
        let date;

        dateTimeForm.ntpProtocolEnabled = false;

        if (isUtcDisplay) {
          // Create UTC Date
          date = this.getUtcDate(this.form.manual.date, this.form.manual.time);
        } else {
          // Create local Date
          date = new Date(`${this.form.manual.date} ${this.form.manual.time}`);
        }

        dateTimeForm.updatedDateTime = date.toISOString();
      } else {
        dateTimeForm.ntpProtocolEnabled = true;

        const ntpArray = [
          this.form.ntp.firstAddress,
          this.form.ntp.secondAddress,
          this.form.ntp.thirdAddress,
        ];

        // Filter the ntpArray to remove empty strings,
        // per Redfish spec there should be no empty strings or null on the ntp array.
        const ntpArrayFiltered = ntpArray.filter((x) => x);

        dateTimeForm.ntpServersArray = [...ntpArrayFiltered];

        [this.ntpServers[0], this.ntpServers[1], this.ntpServers[2]] = [
          ...dateTimeForm.ntpServersArray,
        ];

        this.setNtpValues();
      }

      this.$store
        .dispatch('dateTime/updateDateTime', dateTimeForm)
        .then((success) => {
          this.successToast(success);
          if (!isNTPEnabled) return;
          // Shift address up if second address is empty
          // to avoid refreshing after delay when updating NTP
          if (!this.form.ntp.secondAddress && this.form.ntp.thirdAddres) {
            this.form.ntp.secondAddress = this.form.ntp.thirdAddres;
            this.form.ntp.thirdAddress = '';
          }
        })
        .then(() => {
          this.$store.dispatch('global/getBmcTime');
        })
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.$v.form.$reset();
          this.endLoader();
        });
    },
    getUtcDate(date, time) {
      // Split user input string values to create
      // a UTC Date object
      const datesArray = date.split('-');
      const timeArray = time.split(':');
      let utcDate = Date.UTC(
        datesArray[0], // User input year
        //UTC expects zero-index month value 0-11 (January-December)
        //for reference https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/UTC#Parameters
        parseInt(datesArray[1]) - 1, // User input month
        datesArray[2], // User input day
        timeArray[0], // User input hour
        timeArray[1] // User input minute
      );
      return new Date(utcDate);
    },
  },
};
</script>
