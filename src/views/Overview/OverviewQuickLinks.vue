<template>
  <div class="quicklinks">
    <div>
      <dl>
        <!-- TODO: display timezone -->
        <dt>BMC time</dt>
        <dd>{{ bmcTime | date('MMM, DD YYYY HH:MM:SS') }}</dd>
      </dl>
    </div>
    <div>
      <!-- TODO: add toggle LED on/off funtionality -->
      <dl>
        <dt>Server LED</dt>
        <dd>
          <b-form-checkbox
            v-model="serverLedChecked"
            name="check-button"
            switch
          >
            <span v-if="!serverLedChecked">On</span>
            <span v-else>Off</span>
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
        <span>Edit network settings</span>
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
        <span>Serial over LAN console</span>
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
      serverLEDChecked: false
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
  background: $white;
  display: grid;
  grid-gap: 1rem;
  padding: 1rem;
  white-space: nowrap;
}

@media screen and (min-width: 600px) {
  .quicklinks {
    grid-template-columns: 1fr 1fr;
  }
}

@media screen and (min-width: 1095px) {
  .quicklinks {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}
</style>
