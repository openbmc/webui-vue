<template>
  <ul class="progress-indicator">
    <li
      v-for="(step, index) in _steps"
      :key="index"
      :class="{ complete: step.complete }"
    >
      <status-icon v-if="step.complete" status="success" class="mr-3" />
      <span
        v-else
        class="icon-indicator mr-3"
        :class="{ 'current-step': index === currentStep }"
      ></span>
      {{ step.label }}
    </li>
  </ul>
</template>

<script>
import StatusIcon from '@/components/Global/StatusIcon';

export default {
  name: 'ProgressIndicator',
  components: { StatusIcon },
  props: {
    start: {
      type: Number,
      default: 0,
    },
    steps: {
      type: Array,
      default: () => [],
      validator: (prop) => {
        return prop.every((step) =>
          Object.prototype.hasOwnProperty.call(step, 'label')
        );
      },
    },
  },
  data() {
    return {
      currentStep: this.start,
    };
  },
  computed: {
    _steps() {
      return this.steps.map((step, index) => {
        const { complete } = step;
        if (!complete && index >= this.start) {
          step.complete = false;
        } else {
          step.complete = true;
        }
        return step;
      });
    },
  },
  methods: {
    next() {
      if (this.currentStep === this.steps.length) return;
      this._steps[this.currentStep].complete = true;
      this.currentStep += 1;
    },
  },
};
</script>

<style lang="scss" scoped>
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
li {
  line-height: 3;
  position: relative;

  &:not(:last-child) {
    &::before {
      background-color: $border-color;
      content: '';
      height: 2rem;
      left: 9px;
      position: absolute;
      top: 35px;
      width: 2px;
    }
  }
}
.status-icon {
  vertical-align: baseline;
  z-index: 1;
}
.icon-indicator {
  background-color: $white;
  border-color: theme-color('primary');
  border-radius: 50%;
  border-style: dashed;
  border-width: 2px;
  display: inline-block;
  height: 20px;
  position: relative;
  vertical-align: middle;
  width: 20px;
  z-index: 1;

  &.current-step {
    border-style: solid;
    &::after {
      background-color: theme-color('primary');
      border-radius: 50%;
      content: '';
      display: inline-block;
      height: 14px;
      left: 1px;
      position: absolute;
      top: 1px;
      width: 14px;
    }
  }
}
</style>
