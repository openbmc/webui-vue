<template>
  <b-list-group>
    <b-list-group-item href="#" class="flex-column align-items-start">
      #{{ logging.entry.Id }}
      <b-badge variant="danger">{{ logging.entry.Severity }}</b-badge>
      <div class="d-flex w-100 justify-content-between">
        <small>{{
          logging.entry.Timestamp | date("MMM, DD YYYY HH:MM:SS A ZZ")
        }}</small>
        <ChevronRight16 />
      </div>
      <p class="mb-1">
        {{ logging.entry.EventID }}: {{ logging.entry.Description }}
      </p>
    </b-list-group-item>
  </b-list-group>
</template>

<script>
import ChevronRight16 from "@carbon/icons-vue/es/chevron--right/16";

export default {
  name: "events",
  components: {
    ChevronRight16
  },
  data() {
    return {
      logging: {
        entry: {
          Description:
            "An internal failure has occurred while performing an operation.",
          EventID: "FQPSPCR0021F",
          Id: 1,
          Resolved: false,
          Severity: "Error",
          Timestamp: 1574782085071
        }
      }
    };
  }
};
</script>
