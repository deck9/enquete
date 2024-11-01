<template>
  <div class="relative pb-6 text-sm">
    <InsertAfterButton v-bind="{ block }" />
    <div
      class="relative block w-full rounded-md border-dotted px-4 py-3 text-left"
      :class="[cardStyle, { 'opacity-50': block.is_disabled }]"
      @click.stop="workbench.putOnWorkbench(block)"
    >
      <button
        class="rounded pl-2 pr-5 py-1 font-bold text-grey-400 hover:bg-grey-100 block text-left"
        :class="[{ 'mb-3': !isCollapsed }]"
        @click.prevent="toggleGroup"
      >
        <D9Icon
          class="transition-transform duration-150 mr-2"
          :class="[{ '-rotate-90': isCollapsed }]"
          name="chevron-down"
        />
        <D9Icon name="layer-group" size="sm" />
        {{ block.title ?? "Group" }}
        <span class="font-light italic" v-show="isCollapsed"
          >({{ t("admin.blocks", groupCount) }})</span
        >
      </button>
      <div
        v-if="showBlockMenus"
        class="absolute right-3 top-2 hover:opacity-100"
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
      <BlockContainer
        v-show="!isCollapsed"
        :groupId="block.uuid"
        class="transition duration-200"
      />

      <!-- Block Status -->
      <BlockFooter class="mt-2" :block="block" />

      <!-- Block Logic -->
      <BlockLogicVisualizer v-if="store.showLogicInStoryboard" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import BlockContainer from "@/components/Factory/Sidebar/BlockContainer.vue";
import InsertAfterButton from "./InsertAfterButton.vue";
import BlockFooter from "./BlockFooter.vue";
import BlockLogicVisualizer from "./BlockLogicVisualizer.vue";
import copy from "copy-text-to-clipboard";
import { D9Menu, D9MenuLink, D9Icon } from "@deck9/ui";
import { useActiveCard } from "@/utils/useActiveCard";
import { useWorkbench, useForm } from "@/stores";
import { computed, provide, ref } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";

const props = defineProps<{
  block: FormBlockModel;
}>();

provide("block", props.block);

const { t } = useI18n();

const workbench = useWorkbench();
const store = useForm();

const { showBlockMenus } = storeToRefs(store);

const isCollapsed = ref(props.block.is_disabled ?? false);

const isActive = computed((): boolean => {
  return workbench.block && workbench.block.id === props.block.id
    ? true
    : false;
});
const { cardStyle } = useActiveCard(isActive);

const groupCount = computed(() => {
  return store.countGroups[props.block.uuid];
});

const deleteBlock = () => {
  let result = window.confirm(
    "Do you really want to delete this group? All blocks inside this group will be deleted as well.",
  );

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

const toggleGroup = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>
