<template>
  <div class="search-global">
    <b-form-group
      label="Search"
      label-for="searchInput"
      aria-label="Search"
      label-sr-only
    >
      <b-input-group size="md" class="align-items-center">
        <b-input-group-prepend>
          <icon-search class="search-icon" />
        </b-input-group-prepend>
        <b-form-input
          id="searchInput"
          v-model="filter"
          type="search"
          placeholder="Search for sensors"
          aria-describedby="Search for sensors"
          @input="onChangeInput"
        ></b-form-input>
      </b-input-group>
    </b-form-group>
  </div>
</template>

<script>
import IconSearch from '@carbon/icons-vue/es/search/16';
export default {
  name: 'Search',
  components: { IconSearch },
  data() {
    return {
      filter: null
    };
  },
  methods: {
    onChangeInput() {
      this.$emit('changeSearch', this.filter);
    }
  }
};
</script>

<style lang="scss" scoped>
@import 'src/assets/styles/helpers';

#searchInput {
  padding-left: ($spacer * 2);
}
.search-icon {
  position: absolute;
  left: 10px;
  top: 12px;
  z-index: 4;
  stroke: $gray-400;
}
</style>
