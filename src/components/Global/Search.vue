<template>
  <div class="search-global">
    <b-form-group
      label="Search"
      label-cols-sm="12"
      label-align-sm="left"
      label-size="sm"
      label-for="searchInput"
      label-sr-only
      class="mb-3"
    >
      <b-input-group size="sm" class="align-items-center">
        <b-input-group-prepend>
          <icon-search class="search-icon" />
        </b-input-group-prepend>
        <b-form-input
          id="searchInput"
          v-model="filter"
          type="search"
          placeholder="Search for sensors"
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
#searchInput:not(:focus) {
  padding-left: 36px;
}
.search-icon {
  position: absolute;
  left: 10px;
  top: 8px;
  z-index: 1;
  stroke: #c3c2c2;
}
</style>
