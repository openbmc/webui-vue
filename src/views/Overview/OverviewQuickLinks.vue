<template>
  <b-list-group>
    <b-list-group-item
      href="#"
      variant="danger"
      v-show="logging.entry.Severity === 'Error'"
      >View 1 high priority event</b-list-group-item
    >
    <b-list-group-item>
      <dl>
        <dt>BMC time</dt>
        <dd>{{ bmc.Elapsed | date("MMM, DD YYYY HH:MM:SS A ZZ") }}</dd>
      </dl>
    </b-list-group-item>
    <b-list-group-item>
      <!-- TODO: add toggle LED on/off funtionality -->
      <b-form-checkbox v-model="checked" name="check-button" switch>
        Turn
        <span v-if="!checked">on</span>
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
  data() {
    return {
      bmc: {
        Elapsed: 1574782085071
      },
      logging: {
        entry: {
          Severity: "Error"
        }
      },
      checked: false
    };
  }
};
</script>
