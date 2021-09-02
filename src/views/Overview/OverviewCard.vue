<template>
  <b-card bg-variant="light" border-variant="light" class="mb-4">
    <div class="justify-content-between align-items-center d-flex flex-wrap">
      <h3 class="h5 mb-0">{{ title }}</h3>
      <div class="card-buttons">
        <b-button
          v-if="exportButton || downloadButton"
          :disabled="disabled"
          :download="download"
          :href="href"
          class="p-0"
          variant="link"
        >
          <span v-if="downloadButton">{{ $t('global.action.download') }}</span>
          <span v-if="exportButton">{{ $t('global.action.exportAll') }}</span>
        </b-button>
        <span v-if="exportButton || downloadButton" class="pl-2 pr-2">|</span>
        <b-link :to="to">{{ $t('pageOverview.viewMore') }}</b-link>
      </div>
    </div>
    <slot></slot>
  </b-card>
</template>

<script>
export default {
  name: 'OverviewCard',
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: true,
    },
    downloadButton: {
      type: Boolean,
      default: false,
    },
    exportButton: {
      type: Boolean,
      default: false,
    },

    fileName: {
      type: String,
      default: 'data',
    },
    title: {
      type: String,
      default: '',
    },
    to: {
      type: String,
      default: '/',
    },
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

<style lang="scss" scoped>
a {
  vertical-align: middle;
  font-size: 14px;
}
.card {
  min-width: 310px;
}
</style>
