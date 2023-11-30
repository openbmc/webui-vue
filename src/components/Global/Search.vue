<template>
  <div class="search-global">
    <BFormGroup
      :label="t('global.form.search')"
      :label-for="`searchInput-${_uid}`"
      label-class="invisible"
      class="mb-2"
    >
      <BInputGroup size="md" class="align-items-center">
        <BInputGroupPrepend>
          <icon-search class="search-icon" />
        </BInputGroupPrepend>
        <BFormInput
          :id="`searchInput-${_uid}`"
          ref="searchInput"
          v-model="filter"
          class="search-input"
          type="text"
          :aria-label="t('global.form.search')"
          :placeholder="placeholder"
          @input="onChangeInput($event)"
        >
        </BFormInput>
        <BButton
          v-if="filter"
          variant="link"
          class="btn-icon-only input-action-btn"
          :title="t('global.ariaLabel.clearSearch')"
          @click="onClearSearch"
        >
          <icon-close />
          <span class="sr-only">{{ t('global.ariaLabel.clearSearch') }}</span>
        </BButton>
      </BInputGroup>
    </BFormGroup>
  </div>
</template>

<script setup>
import IconSearch from '@carbon/icons-vue/es/search/16';
import IconClose from '@carbon/icons-vue/es/close/20';
import { useI18n } from 'vue-i18n';
import { ref, watch, defineEmits } from 'vue';
import eventBus from '@/eventBus';

const emit = defineEmits();
const { t } = useI18n();

const { placeholder } = defineProps({
  placeholder: {
    type: String,
    default: function () {
      return this.t('global.form.search');
    },
  },
});
const filter = ref('');
const onChangeInput = (event) => {
  var filterValue = filter.value;
  if (event.data != null) filterValue = filterValue.concat(event.data);
  else filterValue = filterValue.slice(0, -1);
  emit('change-search', filterValue);
};
const onClearSearch = () => {
  filter.value = '';
  emit('clear-search');
  // this.$refs.searchInput.focus();
};
</script>

<style lang="scss" scoped>
.search-input {
  padding-left: ($spacer * 2);
}
.search-icon {
  position: absolute;
  left: 10px;
  top: 12px;
  z-index: 4;
  stroke: gray('400');
}
</style>
