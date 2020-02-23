<template>
  <div class="quicklinks">
    <div>
      <dl>
        <dt>{{ $t('overview.quicklinks.bmcTime') }}</dt>
        <dd>{{ bmcTime }}</dd>
      </dl>
    </div>
    <div>
      <!-- TODO: add toggle LED on/off funtionality -->
      <dl>
        <dt>{{ $t('overview.quicklinks.serverLed') }}</dt>
        <dd>
          <b-form-checkbox
            v-model="serverLedChecked"
            name="check-button"
            switch
          >
            <span v-if="!serverLedChecked">{{ $t('global.on') }}</span>
            <span v-else>{{ $t('global.off') }}</span>
          </b-form-checkbox>
        </dd>
      </dl>
    </div>
    <div>
      <!-- TODO: link to network settings -->
      <b-button
        href="#"
        variant="secondary"
        class="d-flex justify-content-between align-items-center"
      >
        <span>{{ $t('overview.quicklinks.editNetworkSettings') }}</span>
        <icon-arrow-right />
      </b-button>
    </div>
    <div>
      <!-- TODO: link to SOL -->
      <b-button
        href="#"
        variant="secondary"
        class="d-flex justify-content-between align-items-center"
      >
        <span>{{ $t('overview.quicklinks.solConsole') }}</span>
        <icon-arrow-right />
      </b-button>
    </div>
  </div>
</template>

<script>
import ArrowRight16 from '@carbon/icons-vue/es/arrow--right/16';

export default {
  name: 'QuickLinks',
  components: {
    IconArrowRight: ArrowRight16
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

<style lang="scss" scoped>
dd,
dl {
  margin: 0;
}

.quicklinks {
  background: $gray-200;
  display: grid;
  grid-gap: 1rem;
  padding: 1rem;
  white-space: nowrap;
  align-items: center;
}

@include media-breakpoint-up(sm) {
  .quicklinks {
    grid-template-columns: repeat(2, 1fr);
  }
}

@include media-breakpoint-up(xl) {
  .quicklinks {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
