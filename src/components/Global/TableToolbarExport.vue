<template>
  <b-button
    class="d-flex align-items-center"
    variant="primary"
    :download="download"
    :href="href"
  >
    {{ $t('global.action.export') }}
  </b-button>
</template>

<script>
import { useI18n } from 'vue-i18n';
export default {
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    fileName: {
      type: String,
      default: 'data',
    },
  },
  data() {
    return {
      $t: useI18n().t,
    };
  },
  computed: {
    dataForExport() {
      return JSON.stringify(this.data);
    },
    download() {
      return `${this.fileName}.json`;
    },
    href() {
      return `data:text/json;charset=utf-8,${this.dataForExport}`;
    },
  },
};
</script>
