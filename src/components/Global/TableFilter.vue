<template>
  <div class="table-filter d-inline-block">
    <p class="d-inline-block mb-0">
      <b-badge v-for="(tag, index) in tags" :key="index" pill>
        {{ tag }}
        <b-close-button
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
      <div class="px-3 py-2 filter-dropdown-content">
        <b-form-group
          v-for="(filter, index) of filters"
          :key="index"
          :label="filter.label"
          class="filter-section"
        >
          <b-form-checkbox-group v-model="tags" class="filter-checkbox-group">
            <b-form-checkbox
              v-for="value in filter.values"
              :key="value"
              :value="value"
              :data-test-id="`tableFilter-checkbox-${value}`"
              class="filter-checkbox"
            >
              {{ value }}
            </b-form-checkbox>
          </b-form-checkbox-group>
        </b-form-group>
      </div>
      <div class="px-3 pb-2">
        <b-button
          size="sm"
          variant="primary"
          data-test-id="tableFilter-button-clearAll"
          @click="clearAllTags"
        >
          {{ $t('global.action.clearAll') }}
        </b-button>
      </div>
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
          (filter) =>
            'label' in filter && 'values' in filter && 'key' in filter,
        );
      },
    },
  },
  emits: ['filter-change'],
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
          (value) => this.tags.indexOf(value) !== -1,
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
  margin-inline-end: calc(#{$spacer} / 2);
}

.filter-dropdown-content {
  min-width: 200px;
}

.filter-section {
  margin-bottom: 1rem;
  &:last-child {
    margin-bottom: 0;
  }

  ::v-deep legend {
    font-size: 0.875rem;
    font-weight: 400;
    margin-bottom: 0.75rem;
  }
}

.filter-checkbox-group {
  display: flex;
  flex-direction: column;
}

.filter-checkbox {
  margin-bottom: 0.5rem;

  &:last-child {
    margin-bottom: 0;
  }

  ::v-deep .custom-control-label {
    font-size: 0.875rem;
    line-height: 1.5;
    cursor: pointer;
  }
}
</style>
