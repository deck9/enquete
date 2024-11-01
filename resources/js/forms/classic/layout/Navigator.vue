<template>
  <div class="flex items-center text-center">
    <div
      v-show="!hideNavigation"
      class="grid w-24 grid-cols-4 rounded border border-content/20 text-content"
      :class="{ 'pointer-events-none opacity-50': store.isSubmitted }"
    >
      <button
        type="button"
        class="inline-flex items-center justify-center border-r border-content/10 py-1 hover:bg-content/10"
        :class="[{ 'pointer-events-none opacity-25': store.isFirstBlock }]"
        :aria-label="t('page_previous')"
        :aria-disabled="store.isFirstBlock"
        :disabled="store.isFirstBlock"
        @click="store.back()"
      >
        <D9Icon icon="chevron-left" />
      </button>
      <span class="col-span-2 inline-block whitespace-nowrap py-1 font-medium">
        <span>{{ currentPage }}</span>
      </span>
      <button
        type="button"
        class="inline-flex items-center justify-center border-l border-content/10 py-1 hover:bg-content/10"
        :class="[
          {
            'pointer-events-none opacity-25':
              !validator.valid || store.isLastBlock,
          },
        ]"
        :disabled="!validator.valid || store.isLastBlock"
        :aria-label="t('page_next')"
        @click="!store.isLastBlock ? store.next() : false"
      >
        <D9Icon icon="chevron-right" />
      </button>
    </div>
    <ProgressIndicator
      v-if="store.form?.show_form_progress"
      class="ml-2"
      :progress="progress"
    />
  </div>
</template>

<script lang="ts" setup>
import { D9Icon } from "@deck9/ui";
import { useConversation } from "@/stores/conversation";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useActions } from "@/forms/classic/useActions";
import ProgressIndicator from "@/forms/classic/layout/ProgressIndicator.vue";

const store = useConversation();

const { t } = useI18n();

defineProps<{
  hideNavigation?: boolean;
}>();

const { actionValidator } = store.currentBlock
  ? useActions(store.currentBlock)
  : {
      actionValidator: () => {
        return { valid: true };
      },
    };

const validator = computed(() => {
  return actionValidator
    ? actionValidator(store.currentPayload)
    : { valid: true };
});

const totalPages = computed(() => {
  return store.processedQueue?.length ?? 0;
});

const currentPage = computed(() => {
  return store.currentBlockIndex + 1;
});

const progress = computed(() => {
  if (store.currentBlockIndex <= 0) {
    return 0;
  }

  return Math.round(((store.currentBlockIndex + 1) / totalPages.value) * 100);
});
</script>
