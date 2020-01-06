<template>
  <div class="quicklinks">
    <div>
      <dl>
        <!-- TODO: display timezone -->
        <dt>BMC time</dt>
        <dd>{{ bmcTime | date('DD MMM YYYY HH:MM:SS') }}</dd>
      </dl>
    </div>
    <div>
      <!-- TODO: add toggle LED on/off funtionality -->
      <dl>
        <dt>Server LED</dt>
        <dd>
          <b-form-checkbox
            v-model="serverLEDChecked"
            name="check-button"
            switch
          >
            <span v-if="!serverLEDChecked">On</span>
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
        <IconArrowRight />
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
        <IconArrowRight />
      </b-button>
    </div>
  </div>
</template>

<script>
import ArrowRight16 from '@carbon/icons-vue/es/arrow--right/16';

export default {
  name: 'quickLinks',
  components: {
    IconArrowRight: ArrowRight16
  },
  created() {
    this.getBmcTime();
  },
  computed: {
    bmcTime() {
      return this.$store.getters['global/bmcTime'];
    }
  },
  methods: {
    getBmcTime() {
      this.$store.dispatch('global/getBmcTime');
    }
  },
  data() {
    return {
      serverLEDChecked: false
    };
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
