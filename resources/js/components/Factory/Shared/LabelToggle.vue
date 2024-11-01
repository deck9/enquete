<template>
  <RadioGroup
    v-model="value"
    class="flex w-fit justify-start rounded-md -space-x-px"
  >
    <RadioGroupOption
      as="template"
      v-for="(option, index) in options"
      :key="option.value"
      :value="option.value"
      v-slot="{ active, checked }"
    >
      <div
        :class="[
          'cursor-pointer focus:outline-none',
          checked
            ? 'bg-white text-blue-700 ring-blue-600'
            : 'bg-white text-grey-500 hover:text-grey-900 hover:ring-blue-600',
          !active && !checked ? 'ring-inset' : '',
          index === 0 ? 'rounded-l-md' : 'last:rounded-r-md',
          'group flex items-center justify-center px-3 py-2 leading-none text-sm border border-grey-300',
        ]"
      >
        <span
          class="h-2 w-2 rounded-full ring-1 ring-offset-2 mr-2"
          :class="[
            checked
              ? 'bg-blue-600 ring-blue-600'
              : 'bg-white group-hover:ring-blue-300',
            active ? 'ring-2 ring-blue-600 ring-offset-2' : '',
            active && checked ? 'ring-2 ring-blue-600' : '',
          ]"
        ></span>
        {{ option.label }}
      </div>
    </RadioGroupOption>
  </RadioGroup>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { RadioGroup, RadioGroupOption } from "@headlessui/vue";

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();

interface ToggleOption {
  label: string;
  value: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: string;
    options: ToggleOption[];
  }>(),
  {
    options: () => [
      { label: "True", value: "1" },
      { label: "False", value: "0" },
    ],
  },
);

const value = ref(props.modelValue);

watch(props, () => {
  if (props.modelValue !== value.value) {
    value.value = props.modelValue;
  }
});

watch(value, (value) => {
  emit("update:modelValue", value);
});
</script>
