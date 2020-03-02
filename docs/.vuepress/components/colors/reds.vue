<template>
  <div>
    <div class="color-tile-container">
      <div v-for="color in colors">
        <div
          :style="{ backgroundColor: color.hex }"
          :class="{ 'color-tile--border': color.border }"
          class="color-tile"
        ></div>
        <dl class="color-tile-desc">
          <dt>Color variable:</dt>
          <dd>${{ color.variable }}</dd>
        </dl>
        <dl class="color-tile-desc">
          <dt>Hex:</dt>
          <dd>{{ color.hex }}</dd>
        </dl>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      colors: [
        {
          variable: 'red-100',
          hex: '#feeeed',
        },
        {
          variable: 'red-500',
          hex: '#da1416'
        }
      ]
    };
  }
};
</script>

<style scoped lang="scss">
.color-tile-container {
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  margin: 1rem 0;
}

.color-tile {
  display: block;
  width: 220px;
  height: 140px;

  &--border {
    border: 1px dashed #ccc;
  }
}

.color-tile-desc {
  margin: 0.5rem 0;
}

.color-tile-desc dt {
  display: inline;
  font-weight: bold;
}

.color-tile-desc dd {
  display: inline;
  margin: 0;
}
</style>
