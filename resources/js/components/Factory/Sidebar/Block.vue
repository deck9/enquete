<template>
  <div class="relative pb-6 text-sm">
    <InsertAfterButton v-bind="{ block }" />

    <div
      class="group relative block w-full overflow-visible rounded-md p-4 text-left"
      :class="[cardStyle, { 'opacity-50': block.is_disabled }]"
      @click.stop="workbench.putOnWorkbench(block)"
    >
      <div
        v-if="showBlockMenus"
        class="absolute right-3 top-3 hover:opacity-100 z-10"
        :class="isActive ? 'opacity-100' : 'opacity-25'"
      >
        <D9Menu
          class="text-grey-400"
          position="right"
          :use-portal="true"
          :key="`${block.sequence}-position-menu`"
        >
          <D9MenuLink
            as="button"
            class="block w-full text-left"
            :meta="block.uuid"
            label="Copy ID"
            @click="copyId"
          />
          <D9MenuLink
            as="button"
            class="block w-full text-left"
            label="Delete"
            @click.stop="deleteBlock"
          />
        </D9Menu>
      </div>

      <div class="relative flex items-start">
        <div class="pr-4">
          <div
            class="bg-grey-700 text-grey-100 inline-block px-2 text-xxs leading-5 rounded mb-1"
          >
            {{ block.title && block.title.length ? block.title : block.uuid }}
          </div>

          <ConsentBlockMessage v-if="block.type === 'consent'" />

          <DefaultBlockMessage v-if="block.message" :content="block.message" />
          <div v-else class="mb-2 font-light text-grey-400">--empty--</div>
        </div>
      </div>

      <BlockInteraction
        v-for="(interaction, index) in editableInteractions"
        v-bind="{ interaction, index }"
        :key="interaction.id"
      />

      <!-- Block Status -->
      <BlockFooter class="mt-4" :block="block" />

      <!-- Block Logic -->
      <BlockLogicVisualizer v-if="store.showLogicInStoryboard" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, provide } from "vue";
import ConsentBlockMessage from "./ConsentBlockMessage.vue";
import DefaultBlockMessage from "./DefaultBlockMessage.vue";
import BlockInteraction from "./BlockInteraction.vue";
import BlockFooter from "./BlockFooter.vue";
import BlockLogicVisualizer from "./BlockLogicVisualizer.vue";
import InsertAfterButton from "./InsertAfterButton.vue";
import { useWorkbench, useForm } from "@/stores";
import { D9Menu, D9MenuLink } from "@deck9/ui";
import copy from "copy-text-to-clipboard";
import useActiveInteractions from "../Shared/useActiveInteractions";
import { useActiveCard } from "@/utils/useActiveCard";
import { storeToRefs } from "pinia";

const workbench = useWorkbench();
const store = useForm();

const { showBlockMenus } = storeToRefs(store);

const props = defineProps<{
  block: FormBlockModel;
}>();

provide("block", props.block);

const { editableInteractions } = useActiveInteractions(props.block);

const isActive = computed((): boolean => {
  return workbench.block && workbench.block.id === props.block.id
    ? true
    : false;
});

const { cardStyle } = useActiveCard(isActive);

const deleteBlock = () => {
  const result = window.confirm("Do you really want to delete this block?");

  if (result) {
    store.deleteFormBlock(props.block);

    if (workbench.block?.id === props.block.id) {
      workbench.clearWorkbench();
    }
  }
};

const copyId = () => {
  copy(props.block.uuid);
};
</script>
