<template>
  <div class="table-filter d-inline-block">
    <p class="d-inline-block mb-0">
      <b-badge v-for="(tag, index) in tags" :key="index" pill>
        {{ tag }}
        <b-button-close
          :disabled="dropdownVisible"
          :aria-hidden="true"
          @click="removeTag(tag)"
        />
      </b-badge>
    </p>
    <b-dropdown
      variant="link"
      no-caret
      right
      data-test-id="tableFilter-dropdown-options"
      @hide="dropdownVisible = false"
      @show="dropdownVisible = true"
    >
      <template #button-content>
        <icon-filter />
        {{ $t('global.action.filter') }}
      </template>
      <b-dropdown-form>
        <b-form-group
          v-for="(filter, index) of filters"
          :key="index"
          :label="filter.label"
        >
          <b-form-checkbox-group v-model="tags">
            <b-form-checkbox
              v-for="value in filter.values"
              :key="value"
              :value="value"
              :data-test-id="`tableFilter-checkbox-${value}`"
            >
              <b-dropdown-item>
                {{ value }}
              </b-dropdown-item>
            </b-form-checkbox>
          </b-form-checkbox-group>
        </b-form-group>
      </b-dropdown-form>
      <b-dropdown-item-button
        variant="primary"
        data-test-id="tableFilter-button-clearAll"
        @click="clearAllTags"
      >
        {{ $t('global.action.clearAll') }}
      </b-dropdown-item-button>
    </b-dropdown>
  </div>
</template>

<script>
import IconFilter from '@carbon/icons-vue/es/settings--adjust/20';

export default {
  name: 'TableFilter',
  components: { IconFilter },
  props: {
    filters: {
      type: Array,
      default: () => [],
      validator: (prop) => {
        return prop.every(
          (filter) => 'label' in filter && 'values' in filter && 'key' in filter
        );
      },
    },
  },
  data() {
    return {
      dropdownVisible: false,
      tags: [],
    };
  },
  watch: {
    tags: {
      handler() {
        this.emitChange();
      },
      deep: true,
    },
  },
  methods: {
    removeTag(removedTag) {
      this.tags = this.tags.filter((tag) => tag !== removedTag);
    },
    clearAllTags() {
      this.tags = [];
    },
    emitChange() {
      const activeFilters = this.filters.map(({ key, values }) => {
        const activeValues = values.filter(
          (value) => this.tags.indexOf(value) !== -1
        );
        return {
          key,
          values: activeValues,
        };
      });
      this.$emit('filter-change', { activeFilters });
    },
  },
};
</script>

<style lang="scss" scoped>
.badge {
  margin-right: $spacer / 2;
}
</style>
