<template>
  <div class="search-global">
    <b-form-group
      :label="$t('global.form.search')"
      :label-for="`searchInput-${uid}`"
      label-class="invisible"
      class="mb-2"
    >
      <b-input-group size="md" class="align-items-center">
        <template #prepend>
          <b-input-group-text>
            <icon-search class="search-icon" />
          </b-input-group-text>
        </template>
        <b-form-input
          :id="`searchInput-${uid}`"
          ref="searchInput"
          v-model="filter"
          class="search-input"
          type="text"
          :aria-label="$t('global.form.search')"
          :placeholder="placeholder"
          @input="onChangeInput"
        >
        </b-form-input>
        <b-button
          v-if="filter"
          variant="link"
          class="btn-icon-only input-action-btn"
          :title="$t('global.ariaLabel.clearSearch')"
          @click="onClearSearch"
        >
          <icon-close />
          <span class="visually-hidden">
            {{ $t('global.ariaLabel.clearSearch') }}
          </span>
        </b-button>
      </b-input-group>
    </b-form-group>
  </div>
</template>

<script>
import IconSearch from '@carbon/icons-vue/es/search/16';
import IconClose from '@carbon/icons-vue/es/close/20';
import { useI18n } from 'vue-i18n';
import i18n from '@/i18n';

export default {
  name: 'Search',
  components: { IconSearch, IconClose },
  props: {
    placeholder: {
      type: String,
      default: function () {
        return i18n.global.t('global.form.search');
      },
    },
  },
  emits: ['change-search', 'clear-search'],
  data() {
    return {
      $t: useI18n().t,
      filter: null,
      uid: Math.random().toString(36).slice(2),
    };
  },
  methods: {
    onChangeInput() {
      this.$emit('change-search', this.filter);
    },
    onClearSearch() {
      this.filter = '';
      this.$emit('clear-search');
      const input = this.$refs.searchInput;
      if (input && typeof input.focus === 'function') input.focus();
    },
  },
};
</script>

<style lang="scss" scoped>
.search-icon {
  stroke: $gray-400;
}
</style>
