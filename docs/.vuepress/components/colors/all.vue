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
          <dt>Color variable:</dt>
          <dd>${{ item.name }}</dd>
        </dl>
        <dl class="color-tile-desc">
          <dt>Hex:</dt>
          <dd>{{ item.hex }}</dd>
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
          hex: '#2d60e5'
        },
        {
          name: 'green',
          hex: '#0a7d06'
        },
        {
          name: 'red',
          hex: '#da1416'
        },
        {
          name: 'yellow',
          hex: '#efc100'
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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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
