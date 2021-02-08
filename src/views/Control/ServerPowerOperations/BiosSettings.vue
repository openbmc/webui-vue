<template>
  <div class="bios-form-background">
    <b-form-group
      v-for="(values, key) of attributeKeys"
      :key="key"
      :label="$t(`${'pageServerPowerOperations.biosSettings'}.${key}`)"
      class="mb-4"
    >
      <b-form-select
        id="bios-option-sysOp-mode"
        :value="values"
        :options="attributeValues[key]"
        @change="updateAttributeKeys(key, $event)"
      >
      </b-form-select>
    </b-form-group>
  </div>
</template>

<script>
export default {
  name: 'BiosSettings',
  props: {
    attributes: {
      type: Object,
      default: null,
    },
    attributeValues: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      attributeKeys: { ...this.attributes },
    };
  },
  methods: {
    updateAttributeKeys(key, value) {
      this.attributeKeys[key] = value;
      this.$emit('updated-attributes', this.attributeKeys);
    },
  },
};
</script>
