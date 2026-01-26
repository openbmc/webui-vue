<template>
  <b-button
    class="d-flex align-items-center"
    variant="primary"
    @click="exportData"
  >
    {{ $t('global.action.export') }}
  </b-button>
</template>

<script>
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
  methods: {
    exportData() {
      const json = JSON.stringify(this.data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Create a temporary link element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${this.fileName}.json`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
  },
};
</script>
