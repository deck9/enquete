<template>
  <div
    class="mt-4 space-y-4"
    v-if="showBlockLogic && block && block.logics && block.logics.length > 0"
  >
    <div
      class="grid grid-cols-6 text-xs leading-none items-center gap-1 border-l-2 border-blue-200"
      v-for="rule in block.logics"
      :key="rule.id"
    >
      <!-- Rule Conditions -->
      <template
        v-for="(condition, index) in rule.conditions"
        :key="`${rule.id}-condition-${index}`"
      >
        <!-- Operator -->
        <div class="text-right pr-3">
          <span v-if="index !== 0">{{ condition.chainOperator }}</span>
          <span v-else>If</span>
        </div>

        <!-- Condition -->
        <div class="flex col-span-5 -space-x-px">
          <div
            class="text-grey-700 font-base border border-grey-400 bg-white px-2 py-1 text-center rounded-l"
          >
            {{ condition.source }}
          </div>
          <div
            class="border border-grey-400 border-l-grey-300 bg-white px-2 py-1 text-center font-semibold text-grey-500"
          >
            {{ condition.operator }}
          </div>
          <div
            class="text-grey-700 font-base border border-grey-400 border-l-grey-300 bg-white px-2 py-1 text-center rounded-r"
            :class="[index === 0 ? 'rounded-tr-md' : '']"
          >
            {{ condition.value }}
          </div>
        </div>
      </template>

      <!-- Rule Action -->

      <div class="text-right pr-3">
        <span>then</span>
      </div>

      <div class="col-span-5">
        <div
          class="inline-block text-grey-700 font-base border border-grey-400 bg-white px-2 py-1 rounded"
        >
          <template v-if="rule.action === 'show'">
            <D9Icon name="eye" size="sm" />
            show this block
          </template>
          <template v-else-if="rule.action === 'hide'">
            <D9Icon name="eye-slash" size="sm" />
            hide this block
          </template>
          <template v-else-if="rule.action === 'goto'">
            <D9Icon name="eye-slash" size="sm" />
            to to block
            <span class="font-bold font-mono">{{ rule.action_payload }}</span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { D9Icon } from "@deck9/ui";
import { inject, ref } from "vue";

const block: FormBlockModel | null = inject("block") ?? null;

const showBlockLogic = ref(true);
</script>
