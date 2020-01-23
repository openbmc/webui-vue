<template>
  <b-list-group>
    <!-- TODO: add event log priority events count -->
    <b-list-group-item>
      <dl>
        <dt>BMC time</dt>
        <dd>{{ bmcTime | date("MMM, DD YYYY HH:MM:SS A ZZ") }}</dd>
      </dl>
    </b-list-group-item>
    <b-list-group-item>
      <!-- TODO: add toggle LED on/off funtionality -->
      <b-form-checkbox v-model="serverLedChecked" name="check-button" switch>
        Turn
        <span v-if="!serverLedChecked">on</span>
        <span v-else>off</span> server LED
      </b-form-checkbox>
    </b-list-group-item>
    <b-list-group-item
      href="#"
      class="d-flex justify-content-between align-items-center"
    >
      <!-- TODO: link to SOL -->
      <span>Serial over LAN console</span>
      <ChevronRight16 />
    </b-list-group-item>
    <b-list-group-item
      href="#"
      class="d-flex justify-content-between align-items-center"
    >
      <!-- TODO: link to network settings -->
      <span>Edit network settings</span>
      <ChevronRight16 />
    </b-list-group-item>
  </b-list-group>
</template>

<script>
import ChevronRight16 from "@carbon/icons-vue/es/chevron--right/16";
export default {
  name: "quickLinks",
  components: {
    ChevronRight16
  },
  created() {
    this.getBmcTime();
  },
  computed: {
    bmcTime() {
      return this.$store.getters["global/bmcTime"];
    }
  },
  methods: {
    getBmcTime() {
      this.$store.dispatch("global/getBmcTime");
    }
  },
  data() {
    return {
      serverLedChecked: false
    };
  }
};
</script>
