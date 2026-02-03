<template>
  <div class="search-global">
    <b-form-group
      :label="$t('global.form.search')"
      :label-for="`searchInput-${uid}`"
      label-class="invisible"
      class="mb-2"
    >
      <b-input-group size="md" class="align-items-center">
        <b-input-group-text class="group-text">
          <icon-search class="search-icon" />
        </b-input-group-text>
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
          class="btn-icon-only input-action-btn clear-button"
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
.search-input {
  padding-left: ($spacer * 2);
}
.search-icon {
  position: absolute;
  left: 10px;
  top: 0.5px;
  z-index: 400;
  stroke: $gray-400;
}
.group-text {
  position: absolute;
  background: none;
  border: none;
}
.clear-button {
  z-index: 400;
  position: absolute;
}
</style>
