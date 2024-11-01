<template>
  <div class="bg-grey-50 rounded">
    <div
      class="flex justify-between mb-1 bg-grey-100 border-b border-grey-200 px-4 py-2 rounded-t"
    >
      <span class="font-medium">
        {{ rule.name }}
      </span>
      <button>
        <D9Icon
          name="trash"
          class="text-grey-500 hover:text-red-700 text-sm"
          @click="removeRule"
        />
      </button>
    </div>

    <div class="px-4 py-2">
      <div class="mb-3 hidden">
        <D9Label label="Rule Execution" />
        <LabelToggle
          v-bind="{
            options: [
              { label: 'Before', value: 'before' },
              { label: 'After', value: 'after' },
            ],
          }"
          v-model="evaluate"
        />
      </div>

      <div class="mb-1">
        <D9Label label="Conditions" />
        <div
          v-for="(condition, index) in conditions"
          :key="index"
          class="mt-2 relative"
        >
          <LabelToggle
            v-if="index !== 0"
            class="mb-2 w-0"
            v-bind="{
              options: [
                { label: 'And', value: 'and' },
                { label: 'Or', value: 'or' },
              ],
            }"
            v-model="condition.chainOperator"
          />
          <div class="relative">
            <D9Select
              placeholder="Select a block"
              v-model="condition.source"
              size="small"
              :options="availableSourceBlocks"
            />
            <div class="flex items-center space-x-2 mt-1">
              <D9Select
                class="w-64"
                placeholder="Select an operator"
                v-model="condition.operator"
                size="small"
                :options="operators"
              />
              <D9Input
                class="w-full"
                v-model="condition.value"
                placeholder="Enter a value"
                size="small"
                block
              />
            </div>

            <button
              type="button"
              class="text-xs tracking-normal text-red-500 absolute bottom-full right-0 mb-1"
              @click="removeCondition(index)"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      <div
        class="bg-grey-200 border border-grey-300 rounded-md px-4 py-4 text-sm"
        v-if="!hasConditions"
      >
        <p class="font-semibold">You have no conditions set for this rule.</p>
        <p class="text-grey-500">Click the button below to add a condition.</p>
      </div>

      <D9Button
        class="mt-3"
        label="Condition"
        icon="plus"
        size="small"
        color="dark"
        icon-position="left"
        @click="addCondition"
      />

      <div class="mt-3">
        <D9Label label="Action" />
        <LabelToggle
          class="w-0"
          v-bind="{
            options: [
              { label: 'Hide', value: 'hide' },
              { label: 'Show', value: 'show' },
              { label: 'Go to', value: 'goto' },
            ],
          }"
          v-model="action"
        />
      </div>

      <div v-if="action === 'goto'" class="mt-3">
        <D9Label label="Go to Block" />
        <D9Select
          placeholder="Select a block"
          v-model="target"
          size="small"
          :options="availableTargetBlocks"
        />
      </div>
    </div>

    <ValidationErrors
      v-if="validation.length > 0"
      v-bind="{ errors: validation, title: 'Your rule is invalid' }"
      class="my-2 px-4 pb-4 placeholder:text-grey-400"
    />
  </div>
</template>

<script lang="ts" setup>
import { D9Input, D9Select, D9Icon, D9Label, D9Button } from "@deck9/ui";
import { computed, Ref, ref, watch } from "vue";
import { useLogic } from "@/stores";
import { operators } from "@/stores/helpers/logic";
import { getTextFromHtml } from "@/utils";
import LabelToggle from "@/components/Factory/Shared/LabelToggle.vue";
import ValidationErrors from "@/components/ValidationErrors.vue";

const logicStore = useLogic();

const props = defineProps<{
  rule: FormBlockLogic;
  index: number;
}>();

const validation = computed(() => {
  if (!logicStore.validation[props.index]) {
    return [];
  }

  return Object.keys(logicStore.validation[props.index].errors).flatMap(
    (key) => {
      return [...logicStore.validation[props.index].errors[key]];
    },
  );
});

const evaluate = ref<FormBlockLogic["evaluate"]>(props.rule.evaluate);
const action = ref<FormBlockLogic["action"]>(props.rule.action);
const conditions: Ref<Array<EditableFormBlockBlockLogicCondition>> = ref([]);
const target = ref<Record<string, any> | null>(null);

const getBlockOption = (block: FormBlockModel) => {
  const text = getTextFromHtml(block.message ?? "");

  return {
    key: block.uuid,
    label: `<div class="inline-flex items-center text-xs"><span class="bg-grey-700 text-white rounded mr-2 px-1 py-px w-16 truncate inline-block text-center">${block.title && block.title.length ? block.title : block.uuid}</span><span class="inline-block truncate">${text}</span></div>`,
  };
};

if (props.rule.action_payload) {
  const found = logicStore.allBlocks?.find(
    (block) => block.uuid === props.rule.action_payload,
  );

  if (found) {
    target.value = getBlockOption(found);
  }
}

// if the loaded rule has already conditions, we should use those
if (props.rule.conditions) {
  const editableConditions = props.rule.conditions.map((condition) => {
    const operator = operators.find((op) => op.key === condition.operator);
    const source = logicStore.allBlocks?.find(
      (block) => block.uuid === condition.source,
    );

    return {
      ...condition,
      operator,
      source: source ? getBlockOption(source) : null,
    };
  });

  conditions.value = editableConditions;
}

const addCondition = () => {
  conditions.value.push({
    source: undefined,
    operator: operators[0],
    value: "",
    chainOperator: "and",
  });
};

const removeRule = () => {
  const result = window.confirm(
    "Are you sure you want to delete this rule? This action cannot be undone.",
  );

  if (!result) {
    return;
  }

  logicStore.removeRule(props.index);
};

const removeCondition = (index: number) => {
  conditions.value.splice(index, 1);
};

const hasConditions = computed(() => {
  return conditions.value.length > 0;
});

const availableSourceBlocks = computed(() => {
  const blocks =
    props.rule.action === "goto"
      ? logicStore.availableSourceBlocksWithTarget
      : logicStore.availableSourceBlocks;

  return blocks.map((block) => {
    return getBlockOption(block);
  });
});

const availableTargetBlocks = computed(() => {
  return logicStore.allBlocks
    ?.filter((block) => block.type !== "group")
    .map((block) => {
      return getBlockOption(block);
    });
});

watch(
  [conditions, evaluate, action, target],
  () => {
    if (action.value === "hide" || action.value === "show") {
      evaluate.value = "before";
    } else if (action.value === "goto") {
      evaluate.value = "after";
    }

    logicStore.updateBlockLogic(
      {
        ...props.rule,
        conditions: conditions.value,
        evaluate: evaluate.value,
        action: action.value,
        action_payload: target.value?.key ?? null,
      },
      props.index,
    );
  },
  { deep: true },
);
</script>
