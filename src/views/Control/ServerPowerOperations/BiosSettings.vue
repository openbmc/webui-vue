<template>
  <div class="bios-form-background">
    <template v-for="(value, key) of attributeKeys">
      <b-form-group
        :key="key"
        :label="$t(`${'pageServerPowerOperations.biosSettings'}.${key}`)"
        class="mb-4"
      >
        <b-form-select
          v-if="attributeValues[key].length > 2"
          id="bios-option-sysOp-mode"
          :value="value"
          :options="attributeValues[key]"
          @change="updateAttributeKeys(key, $event)"
        >
        </b-form-select>
        <template v-for="(values, keys) of attributeValues[key]">
          <b-form-radio
            v-if="attributeValues[key].length <= 2"
            :key="keys"
            v-model="attributeKeys[key]"
            :value="values.value"
          >
            {{ values.text }}
          </b-form-radio>
        </template>
      </b-form-group>
    </template>
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
      console.log('value', value);
      this.attributeKeys[key] = value;
      console.log('attributeKeys', this.attributeKeys);
      this.$emit('updated-attributes', this.attributeKeys);
    },
  },
};
</script>
