<template>
  <div>
    <div class="color-tile-container">
      <div v-for="item in baseColors">
        <div
          :style="{ backgroundColor: item.hex }"
          :class="{ 'color-tile--border': item.border }"
          class="color-tile"
        ></div>
        <dl class="color-tile-desc">
          <dt>Variable:</dt>
          <dd>${{ item.name }}</dd>
        </dl>
        <dl class="color-tile-desc">
          <dt>Color Variable:</dt>
          <dd>{{ item.variable }}</dd>
        </dl>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      baseColors: [
      {
          name: 'blue',
          variable: '$blue-500',
          hex: '#2d60e5'
        },
        {
          name: 'green',
          variable: '$green-500',
          hex: '#0a7d06'
        },
        {
          name: 'red',
          variable: '$red-500',
          hex: '#da1416'
        },
        {
          name: 'yellow',
          variable: '$yellow-500',
          hex: '#fedf39'
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
