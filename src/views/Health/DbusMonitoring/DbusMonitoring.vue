<template>
  <div id="wrapper">
    <b-row>
      <b-col xl="9">
        <b-table
          ref="capture-status-table"
          responsive="md"
          show-empty
          :fields="fields"
          :items="tableItems"
          :empty-text="$t('global.table.emptyMessage')"
        >
        </b-table>
      </b-col>
    </b-row>
    <b-row class="mb-3">
      <b-col xl="9">
        <div>
          <b-card header="Filters">
            <b-col xl="12">
              <b-form-group label="Group by:">
                <b-form-checkbox-group id="checkboxes" v-model="form.checked">
                  <b-form-checkbox value="cookie">{{
                    this.$t('pageDbusMonitoring.form.cookie')
                  }}</b-form-checkbox>
                  <b-form-checkbox value="path">{{
                    this.$t('pageDbusMonitoring.form.path')
                  }}</b-form-checkbox>
                  <b-form-checkbox value="sender">{{
                    this.$t('pageDbusMonitoring.form.sender')
                  }}</b-form-checkbox>
                  <b-form-checkbox value="destination">{{
                    this.$t('pageDbusMonitoring.form.destination')
                  }}</b-form-checkbox>
                  <b-form-checkbox value="interface">{{
                    this.$t('pageDbusMonitoring.form.interface')
                  }}</b-form-checkbox>
                </b-form-checkbox-group>
              </b-form-group>
            </b-col>
            <b-col xl="9">
              <b-form-group label="Time stamps:">
                <b-form-checkbox-group>
                  <b-row>
                    <b-col>
                      <b-form-input
                        v-model="form.begin"
                        placeholder="From (ms)"
                      ></b-form-input>
                    </b-col>
                    <b-col>
                      <b-form-input
                        v-model="form.end"
                        placeholder="To (ms)"
                      ></b-form-input>
                    </b-col>
                  </b-row>
                </b-form-checkbox-group>
              </b-form-group>
            </b-col>
            <b-row class="mb-3">
              <b-col xl="12">
                <div calls="btn-toolbar" class="btn-group">
                  <div class="mr-3">
                    <b-button
                      ref="startStopButton"
                      variant="primary"
                      @click="startStopCapture()"
                    >
                      {{ startStopTextContent }}
                    </b-button>
                  </div>
                  <div class="mr-3">
                    <b-button
                      ref="displayButton"
                      variant="primary"
                      @click="clearCaptureDump()"
                    >
                      {{ $t('pageDbusMonitoring.reset') }}
                    </b-button>
                  </div>
                  <div class="mr-3">
                    <b-button
                      ref="displayButton"
                      variant="primary"
                      @click="getCaptureDump()"
                    >
                      {{ $t('pageDbusMonitoring.displayCapture') }}
                    </b-button>
                  </div>
                </div>
              </b-col>
            </b-row>
          </b-card>
        </div>
      </b-col>
    </b-row>

    <b-row>
      <b-col xl="12">
        <div id="chart">
          <apexchart
            :type="chartOptions.chart.type"
            :height="chartOptions.chart.height"
            :options="chartOptions"
            :series="chartSeries"
          >
          </apexchart>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { has } from 'lodash';

export default {
  data: function() {
    return {
      form: {
        begin: '',
        end: '',
        checked: ['cookie', 'sender', 'destination', 'interface']
      },
      fields: [
        {
          key: 'captureStatus',
          label: this.$t('pageDbusMonitoring.table.captureStatus')
        },
        {
          key: 'captureStartTime',
          label: this.$t('pageDbusMonitoring.table.captureStartTime')
        },
        {
          key: 'captureStopTime',
          label: this.$t('pageDbusMonitoring.table.captureStopTime')
        }
      ],
      chartOptions: {
        chart: {
          height: 750,
          type: 'rangeBar'
        },
        plotOptions: {
          bar: {
            horizontal: true,
            barHeight: '80%'
          }
        },
        xaxis: {
          type: 'datetime'
        },
        stroke: {
          width: 1
        },
        fill: {
          type: 'solid',
          opacity: 0.6
        },
        legend: {
          position: 'top',
          horizontalAlign: 'left'
        }
      }
    };
  },
  computed: {
    chartSeries() {
      return [this.chartDataByType('4'), this.chartDataByType('1')];
    },
    tableItems() {
      return [
        {
          captureStatus: this.$store.getters['dbusCapture/isCapturing'],
          captureStartTime: this.$store.getters['dbusCapture/captureStartTime'],
          captureStopTime: this.$store.getters['dbusCapture/captureStopTime']
        }
      ];
    },
    startStopTextContent() {
      if (this.$store.getters['dbusCapture/isCapturing']) {
        return this.$t('pageDbusMonitoring.stop');
      }
      return this.$t('pageDbusMonitoring.start');
    },
    upperChartData() {
      return this.$store.getters['dbusCapture/pairedEvents'].map(event =>
        this.pairedEventToDataPoint(event)
      );
    }
  },
  created() {
    this.$store.dispatch('dbusCapture/getDbusCaptureStatus');
  },
  methods: {
    clearCaptureDump() {
      this.$store.dispatch('dbusCapture/clearCaptureDump');
    },
    getCaptureDump() {
      this.$store.dispatch('dbusCapture/getDbusCaptureDump');
      this.$store.commit('dbusCapture/setFilterCriteria', this.form.checked);
      this.$store.commit('dbusCapture/setBeginTimeStamp', this.form.begin);
      this.$store.commit('dbusCapture/setEndTimeStamp', this.form.end);
    },
    startStopCapture() {
      if (this.$store.getters['dbusCapture/isCapturing']) {
        this.$store.dispatch('dbusCapture/stopDbusCapture');
      } else {
        this.$store.dispatch('dbusCapture/startDbusCapture');
      }
    },
    chartDataByType(type) {
      const TYPES = {
        '0': 'Invalid',
        '1': 'Method Call',
        '2': 'Method Return',
        '3': 'Error',
        '4': 'Signal'
      };
      let allEvents = this.$store.getters['dbusCapture/allEvents'];
      let filters = this.$store.getters['dbusCapture/filterCriteria'];
      let beginTimeStamp = this.$store.getters['dbusCapture/beginTimeStamp'];
      let endTimeStamp = this.$store.getters['dbusCapture/endTimeStamp'];

      let filteredEvents = allEvents.filter(event => event.type == type);
      if (!isNaN(beginTimeStamp) && !isNaN(parseFloat(beginTimeStamp))) {
        filteredEvents = filteredEvents.filter(
          event => parseFloat(event.time) > parseFloat(beginTimeStamp)
        );
      }
      if (!isNaN(endTimeStamp) && !isNaN(parseFloat(endTimeStamp))) {
        filteredEvents = filteredEvents.filter(
          event => parseFloat(event.time) < parseFloat(endTimeStamp)
        );
      }

      filteredEvents.forEach(event => {
        filters.forEach(filter => {
          event[filter] = '';
        });
      });

      const data = filteredEvents.map(event => {
        let start = parseFloat(event.time);
        let end = parseFloat(event.time);
        if (has(event, 'reply_event')) {
          end = parseFloat(event.reply_event.time);
        }
        return {
          x:
            event.cookie +
              event.path +
              event.sender +
              event.destination +
              event.interface || '',
          y: [start, end]
        };
      });

      return {
        name: TYPES[type],
        data
      };
    }
  }
};
</script>
