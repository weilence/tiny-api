<template>
  <div
    v-if="spinning"
    :class="[
      'u-spin',
      {
        'u-spin-fullscreen': fullscreen,
        'u-spin-nested': $slots.default,
      },
      $attrs.class,
    ]"
  >
    <div v-if="$slots.default" class="u-spin-container" :class="{ 'u-spin-blur': spinning }">
      <slot />
    </div>
    <div class="u-spin-wrapper">
      <div class="u-spin-content">
        <div :class="['u-spin-dot', `u-spin-${size}`]">
          <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <div v-if="tip" class="u-spin-tip">{{ tip }}</div>
      </div>
    </div>
  </div>
  <div v-else v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  /** 是否为加载中状态 */
  spinning?: boolean;
  /** 尺寸 */
  size?: 'small' | 'default' | 'large';
  /** 提示文字 */
  tip?: string;
  /** 是否全屏显示 */
  fullscreen?: boolean;
}

withDefaults(defineProps<Props>(), {
  spinning: true,
  size: 'default',
  tip: '',
  fullscreen: false,
});
</script>

<style scoped>
.u-spin {
  position: relative;
  display: inline-block;
}

.u-spin-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.45);
}

.u-spin-nested {
  display: block;
}

.u-spin-container {
  position: relative;
  transition: opacity 0.3s;
}

.u-spin-blur {
  pointer-events: none;
  user-select: none;
  opacity: 0.5;
  filter: blur(0.5px);
}

.u-spin-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.u-spin-fullscreen .u-spin-wrapper {
  position: static;
}

.u-spin-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.u-spin-dot {
  display: inline-block;
  color: rgb(var(--color-primary-500));
}

.u-spin-small {
  width: 1rem;
  height: 1rem;
}

.u-spin-default {
  width: 1.5rem;
  height: 1.5rem;
}

.u-spin-large {
  width: 2rem;
  height: 2rem;
}

.u-spin-tip {
  color: rgb(var(--color-primary-500));
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.u-spin-fullscreen .u-spin-tip {
  color: white;
}

.u-spin-fullscreen .u-spin-dot {
  color: white;
}
</style>
