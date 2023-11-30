<template>
  <span>
    <BLink
      v-if="value === 'export'"
      class="align-bottom btn-icon-only py-0 btn-link"
      :download="download"
      :href="href"
      :title="title"
    >
      <slot name="icon">
        {{ t('global.action.export') }}
      </slot>
      <span v-if="btnIconOnly" class="sr-only">{{ title }}</span>
    </BLink>
    <BLink
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
        {{ t('global.action.download') }}
      </span>
    </BLink>
    <BLink
      v-else-if="value === 'download' && downloadLocation !== ''"
      class="align-bottom btn-icon-only py-0 btn-link"
      :download="exportName"
      :href="downloadLocation"
      :title="title"
    >
      <slot name="icon" />
      <span class="sr-only">
        {{ t('global.action.download') }}
      </span>
    </BLink>
    <BButton
      v-else-if="showButton"
      variant="link"
      :class="{ 'btn-icon-only': btnIconOnly }"
      :disabled="!enabled"
      :title="btnIconOnly ? title : !title"
      @click="emit('click-table-action', value)"
    >
      <slot name="icon">
        {{ title }}
      </slot>
      <span v-if="btnIconOnly" class="sr-only">{{ title }}</span>
    </BButton>
  </span>
</template>

<script setup>
import { omit } from 'lodash';
import { computed, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import event from '../../eventBus';

const emit = defineEmits();
const { t } = useI18n();
const {
  value,
  enabled,
  title,
  rowData,
  exportName,
  downloadLocation,
  btnIconOnly,
  downloadInNewTab,
  showButton,
} = defineProps({
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
});
const dataForExport = computed(() => JSON.stringify(omit(rowData, 'actions')));
const download = computed(() => `${exportName}.json`);
const href = computed(() => `data:text/json;charset=utf-8,${dataForExport}`);
</script>
