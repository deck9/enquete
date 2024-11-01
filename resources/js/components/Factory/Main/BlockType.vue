<template>
  <div class="z-20">
    <h2 class="mb-2 text-base font-bold">Type</h2>
    <D9Select
      class="mb-2"
      v-model="selected"
      placeholder="Please select a type"
      size="large"
      :options="types"
      icon="chevron-right"
    />

    <AdvancedSettings title="More Settings">
      <div>
        <D9Label
          label="Identifier"
          description="This name is used when submitting your form through webhooks and in the export."
        />
        <D9Input v-model="title" block />
      </div>
    </AdvancedSettings>
  </div>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import { D9Select, D9Label, D9Input } from "@deck9/ui";
import { ref, Ref, watch } from "vue";
import { useBlockTypes } from "../utils/useBlockTypes";
import AdvancedSettings from "@/components/AdvancedSettings.vue";

const workbench = useWorkbench();

const { types } = useBlockTypes();

const matched = types.value.find((type) => {
  return type.value === workbench.block?.type;
});

const selected: Ref<InteractionOption | undefined> = matched
  ? ref(matched)
  : ref(undefined);

watch(selected, (newValue) => {
  if (newValue?.value) {
    workbench.updateBlock({
      type: newValue.value,
    });
  }
});

const title = ref(workbench.block?.title || "");

watch([title], (newValue) => {
  if (newValue) {
    workbench.updateBlock({
      title: newValue[0],
    });
  }
});
</script>
