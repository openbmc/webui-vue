<template>
  <div class="search-global">
    <b-form-group
      :label="$t('global.form.search')"
      :label-for="`searchInput-${_uid}`"
      label-class="invisible"
      class="mb-2"
    >
      <b-input-group size="md" class="align-items-center">
        <b-input-group-prepend>
          <icon-search class="search-icon" />
        </b-input-group-prepend>
        <b-form-input
          :id="`searchInput-${_uid}`"
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
          <span class="sr-only">{{ $t('global.ariaLabel.clearSearch') }}</span>
        </b-button>
      </b-input-group>
    </b-form-group>
  </div>
</template>

<script>
import IconSearch from '@carbon/icons-vue/es/search/16';
import IconClose from '@carbon/icons-vue/es/close/20';

export default {
  name: 'Search',
  components: { IconSearch, IconClose },
  props: {
    placeholder: {
      type: String,
      default: function () {
        return this.$t('global.form.search');
      },
    },
  },
  data() {
    return {
      filter: null,
    };
  },
  methods: {
    onChangeInput() {
      this.$emit('change-search', this.filter);
    },
    onClearSearch() {
      this.filter = '';
      this.$emit('clear-search');
      this.$refs.searchInput.focus();
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
  top: 12px;
  z-index: 4;
  stroke: gray('400');
}
</style>
