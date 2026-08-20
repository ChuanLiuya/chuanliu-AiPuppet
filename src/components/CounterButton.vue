<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
</script>

<template>
  <div class="counter">
    <p class="counter__value">当前计数：{{ counter.count }}</p>
    <button class="counter__button" @click="counter.increment()">+1</button>
  </div>
</template>

<style scoped>
.counter {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
}

.counter__value {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
}

.counter__button {
  padding: 8px 40px;
  font-size: 18px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  background: #42b883;
  color: #fff;
  cursor: pointer;
  transition: opacity 0.2s;
}

.counter__button:hover {
  opacity: 0.85;
}
</style>
