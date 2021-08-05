<template>
  <span>
    <b-link
      v-if="value === 'export'"
      class="align-bottom btn-icon-only py-0 btn-link"
      :download="download"
      :href="href"
      :title="title"
    >
      <slot name="icon">
        {{ $t('global.action.export') }}
      </slot>
      <span v-if="btnIconOnly" class="sr-only">{{ title }}</span>
    </b-link>
    <b-link
      v-else-if="
        value === 'download' && downloadInNewTab && downloadLocation !== ''
      "
      class="align-bottom btn-icon-only py-0 btn-link"
      target="_blank"
      :href="downloadLocation"
      :title="title"
    >
      <slot name="icon" />
      <span class="sr-only">
        {{ $t('global.action.download') }}
      </span>
    </b-link>
    <b-link
      v-else-if="value === 'download' && downloadLocation !== ''"
      class="align-bottom btn-icon-only py-0 btn-link"
      :download="exportName"
      :href="downloadLocation"
      :title="title"
    >
      <slot name="icon" />
      <span class="sr-only">
        {{ $t('global.action.download') }}
      </span>
    </b-link>
    <b-button
      v-else-if="showButton"
      variant="link"
      :class="{ 'btn-icon-only': btnIconOnly }"
      :disabled="!enabled"
      :title="btnIconOnly ? title : !title"
      @click="$emit('click-table-action', value)"
    >
      <slot name="icon">
        {{ title }}
      </slot>
      <span v-if="btnIconOnly" class="sr-only">{{ title }}</span>
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
