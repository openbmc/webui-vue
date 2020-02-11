<template>
  <b-list-group>
    <!-- TODO: add event log priority events count -->
    <b-list-group-item>
      <dl>
        <dt>{{ $t('overview.quicklinks.bmcTime') }}</dt>
        <dd>{{ bmcTime | date('MMM, DD YYYY HH:MM:SS A ZZ') }}</dd>
      </dl>
    </b-list-group-item>
    <b-list-group-item>
      <!-- TODO: add toggle LED on/off funtionality -->
      <b-form-checkbox v-model="serverLedChecked" name="check-button" switch>
        {{ $t('overview.quicklinks.serverLed') }}
        <span v-if="!serverLedChecked"> {{ $t('global.on') }}</span>
        <span v-else> {{ $t('global.off') }}</span>
      </b-form-checkbox>
    </b-list-group-item>
    <b-list-group-item
      href="#"
      class="d-flex justify-content-between align-items-center"
    >
      <!-- TODO: link to SOL -->
      <span> {{ $t('overview.quicklinks.solConsole') }}</span>
      <chevron-right16 />
    </b-list-group-item>
    <b-list-group-item
      href="#"
      class="d-flex justify-content-between align-items-center"
    >
      <!-- TODO: link to network settings -->
      <span> {{ $t('overview.quicklinks.editNetworkSettings') }}</span>
      <chevron-right16 />
    </b-list-group-item>
  </b-list-group>
</template>

<script>
import ChevronRight16 from '@carbon/icons-vue/es/chevron--right/16';
export default {
  name: 'QuickLinks',
  components: {
    ChevronRight16
  },
  data() {
    return {
      serverLedChecked: false
    };
  },
  computed: {
    bmcTime() {
      return this.$store.getters['global/bmcTime'];
    }
  },
  created() {
    this.getBmcTime();
  },
  methods: {
    getBmcTime() {
      this.$store.dispatch('global/getBmcTime');
    }
  }
};
</script>
