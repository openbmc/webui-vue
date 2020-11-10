<template>
  <span>
    <b-link
      v-if="value === 'export'"
      class="align-bottom btn-icon-only py-0 btn-link"
      :download="download"
      :href="href"
      :title="title"
      :aria-label="title"
    >
      <slot name="icon">
        {{ $t('global.action.export') }}
      </slot>
    </b-link>
    <b-button
      v-else
      variant="link"
      class="btn-icon-only"
      :aria-label="title"
      :title="title"
      :disabled="!enabled"
      @click="$emit('click-table-action', value)"
    >
      <slot name="icon">
        {{ title }}
      </slot>
    </b-button>
  </span>
</template>

<script>
import { omit } from 'lodash';

export default {
  name: 'TableRowAction',
  props: {
    value: {
      type: String,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: null,
    },
    rowData: {
      type: Object,
      default: () => {},
    },
    exportName: {
      type: String,
      default: 'export',
    },
  },
  computed: {
    dataForExport() {
      return JSON.stringify(omit(this.rowData, 'actions'));
    },
    download() {
      return `${this.exportName}.json`;
    },
    href() {
      return `data:text/json;charset=utf-8,${this.dataForExport}`;
    },
  },
};
</script>
