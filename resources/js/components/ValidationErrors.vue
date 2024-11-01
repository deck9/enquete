<template>
  <div>
    <div class="font-medium text-red-400">{{ title }}</div>
    <ul class="mt-1 list-inside list-disc text-sm text-red-400">
      <li v-for="(error, index) in errors" :key="index">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    errors: string[];
  }>(),
  {
    title: "Whoops! Something went wrong.",
  },
);
</script>
