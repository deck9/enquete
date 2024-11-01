<template>
  <div class="flex space-x-1">
    <button
      class="flex items-center space-x-1 rounded-lg px-2 py-1 leading-none text-xs hover:text-black hover:outline text-grey-700"
      :class="[
        block.has_logic
          ? 'bg-blue-100 outline-blue-200'
          : 'bg-grey-100 outline-grey-200',
      ]"
      @click="showLogicEditor"
    >
      <D9Icon name="code-branch" size="sm" />
      <span>Block Logic</span>
      <span v-if="block?.logics && block.logics.length > 0"
        >(<strong>{{ block.logics?.length }}</strong
        >)</span
      >
    </button>
    <button
      v-if="block.type !== 'group'"
      class="flex items-center space-x-1 rounded-lg px-2 py-1 leading-none text-xs hover:text-black hover:outline text-grey-700"
      :class="[
        block.is_required
          ? 'bg-red-100 outline-red-200'
          : 'bg-grey-100 outline-grey-200',
      ]"
      @click="toggleRequired()"
    >
      <template v-if="block.is_required">
        <D9Icon name="asterisk" size="sm" />
        <span>Required</span>
      </template>
      <template v-else>
        <D9Icon name="question" size="sm" />
        <span>Optional</span>
      </template>
    </button>
    <button
      class="flex items-center space-x-1 rounded-lg px-2 py-1 leading-none text-xs hover:text-black hover:outline text-grey-700"
      :class="[
        block.is_disabled
          ? 'bg-grey-100 outline-grey-200'
          : 'bg-green-50 outline-green-100',
      ]"
      @click="disableBlock()"
    >
      <template v-if="block.is_disabled">
        <D9Icon name="circle-dot" size="sm" />
        <span>Disabled</span>
      </template>
      <template v-else>
        <D9Icon name="circle-check" size="sm" />
        <span>Enabled</span>
      </template>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { useForm, useLogic } from "@/stores";
import { D9Icon } from "@deck9/ui";

const store = useForm();
const logicStore = useLogic();

const props = defineProps<{
  block: FormBlockModel;
}>();

const toggleRequired = () => {
  store.updateFormBlockProperty(
    props.block,
    "is_required",
    !props.block.is_required,
  );
};

const showLogicEditor = () => {
  logicStore.showLogicEditor(props.block);
};

const disableBlock = () => {
  store.updateFormBlockProperty(
    props.block,
    "is_disabled",
    !props.block.is_disabled,
  );
};
</script>
