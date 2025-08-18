<template>
  <span>
    <b-button
      v-if="value === 'export'"
      variant="link"
      class="align-bottom btn-icon-only py-0"
      :download="download"
      :href="href"
      :title="title"
    >
      <slot name="icon">
        {{ $t('global.action.export') }}
      </slot>
      <span v-if="btnIconOnly" class="visually-hidden">{{ title }}</span>
    </b-button>
    <b-button
      v-else-if="
        value === 'download' && downloadInNewTab && downloadLocation !== ''
      "
      variant="link"
      class="align-bottom btn-icon-only py-0"
      target="_blank"
      :href="downloadLocation"
      :title="title"
    >
      <slot name="icon" />
      <span class="visually-hidden">
        {{ $t('global.action.download') }}
      </span>
    </b-button>
    <b-button
      v-else-if="value === 'download' && downloadLocation !== ''"
      variant="link"
      class="align-bottom btn-icon-only py-0"
      :download="exportName"
      :href="downloadLocation"
      :title="title"
    >
      <slot name="icon" />
      <span class="visually-hidden">
        {{ $t('global.action.download') }}
      </span>
    </b-button>
    <b-button
      v-else-if="showButton"
      variant="link"
      :class="{ 'btn-icon-only': btnIconOnly }"
      :disabled="!enabled"
      :title="title"
      @click="$emit('click-table-action', value)"
    >
      <slot name="icon">
        {{ title }}
      </slot>
      <span v-if="btnIconOnly" class="visually-hidden">{{ title }}</span>
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
    downloadLocation: {
      type: String,
      default: '',
    },
    btnIconOnly: {
      type: Boolean,
      default: true,
    },
    downloadInNewTab: {
      type: Boolean,
      default: false,
    },
    showButton: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['click-table-action'],
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
