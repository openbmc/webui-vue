<template>
  <ul class="progress-indicator">
    <li
      v-for="(step, index) in _steps"
      :key="index"
      :class="{
        complete: step.complete,
        'current-step': isCurrentStep(index),
      }"
    >
      <b-link :index="index">
        <status-icon v-if="step.complete" status="success" />
        <span v-else class="icon-indicator" aria-hidden="true"></span>
        <span v-if="step.complete" class="sr-only">
          {{ $t('global.status.complete') }}
        </span>
        <span v-if="isCurrentStep(index)" class="sr-only">
          {{ $t('global.status.currentStep') }}
        </span>
        <p>{{ step.label }}</p>
        <span class="progress-line"></span>
      </b-link>
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
    isCurrentStep(index) {
      return index === this.currentStep;
    },
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
  position: relative;

  p {
    max-width: 10rem;
    vertical-align: top;
    display: inline-block;
  }

  a {
    text-decoration: none;
    color: theme-color('dark');
    cursor: default;
  }
}

.progress-line {
  top: 0;
  left: 0;
  height: 100%;
  width: 1px;
  background-color: $border-color;
  border: 1px inset transparent;
  position: absolute;
}

.current-step,
.complete {
  .progress-line {
    background-color: theme-color('primary');
  }
}

.status-icon {
  vertical-align: baseline;
  margin-left: 1rem;
  margin-right: 1rem;
}

.icon-indicator {
  border-color: theme-color('primary');
  border-radius: 50%;
  border-style: dashed;
  border-width: 2px;
  display: inline-block;
  height: 20px;
  margin-left: 1rem;
  margin-right: 1rem;
  position: relative;
  vertical-align: middle;
  width: 20px;
}

.current-step {
  .icon-indicator {
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
