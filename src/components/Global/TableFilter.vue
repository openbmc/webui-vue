<template>
  <div class="table-filter d-inline-block">
    <p class="d-inline-block mb-0">
      <b-badge v-for="(tag, index) in tags" :key="index" pill>
        {{ tag }}
        <b-button-close
          :disabled="dropdownVisible"
          :aria-hidden="true"
          @click="removeTag(index)"
        />
      </b-badge>
    </p>
    <b-dropdown
      variant="link"
      no-caret
      right
      @hide="dropdownVisible = false"
      @show="dropdownVisible = true"
    >
      <template v-slot:button-content>
        <icon-filter />
        {{ $t('global.action.filter') }}
      </template>
      <b-dropdown-form @change="onChange">
        <b-form-group
          v-for="(filter, index) of filters"
          :key="index"
          :label="filter.label"
        >
          <b-form-checkbox-group v-model="tags" :options="filter.values">
          </b-form-checkbox-group>
        </b-form-group>
      </b-dropdown-form>
      <b-dropdown-item-button variant="primary" @click="clearAllTags">
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
      validator: prop => {
        return prop.every(
          filter =>
            filter.hasOwnProperty('label') && filter.hasOwnProperty('values')
        );
      }
    }
  },
  data() {
    return {
      tags: [],
      dropdownVisible: false
    };
  },
  methods: {
    removeTag(index) {
      this.tags = this.tags.filter((_, i) => i !== index);
      this.emitChange();
    },
    clearAllTags() {
      this.tags = [];
      this.emitChange();
    },
    emitChange() {
      this.$emit('filterChange', {
        activeFilters: this.tags
      });
    },
    onChange() {
      this.emitChange();
    }
  }
};
</script>

<style lang="scss" scoped>
p {
  font-size: 1.2rem;
}
.badge {
  margin-right: $spacer / 2;
}
</style>
