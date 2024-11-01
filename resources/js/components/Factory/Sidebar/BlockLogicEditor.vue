<template>
  <TransitionRoot as="template" :show="isShowingLogicEditor">
    <Dialog as="div" class="relative z-10" @close="close">
      <div class="fixed inset-0 bg-grey-900/25" />

      <div class="fixed inset-0 overflow-hidden">
        <div
          class="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10"
        >
          <TransitionChild
            as="template"
            enter="transform transition ease-out duration-200 sm:duration-400 will-change-transform"
            enter-from="-translate-x-full"
            enter-to="translate-x-0"
            leave="transform transition ease-in duration-200 sm:duration-300 will-change-transform"
            leave-from="translate-x-0"
            leave-to="-translate-x-full"
          >
            <DialogPanel class="pointer-events-auto w-screen max-w-xl">
              <div
                class="flex h-full flex-col divide-y divide-grey-200 bg-white shadow-xl"
              >
                <div
                  class="flex min-h-0 flex-1 flex-col overflow-y-scroll py-6"
                >
                  <div class="px-4 sm:px-6">
                    <div class="flex items-start justify-between">
                      <DialogTitle
                        class="text-base font-semibold leading-6 text-grey-900"
                      >
                        Block Logic
                      </DialogTitle>

                      <div class="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          class="rounded-md bg-white px-2 text-grey-400 hover:text-grey-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          @click="close"
                        >
                          <span class="sr-only">Close panel</span>
                          <D9Icon name="close" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="relative mt-6 flex-1 px-4 sm:px-6" v-if="block">
                    <BlockLogicRule
                      class="mb-2"
                      v-for="(rule, index) in block.logics"
                      v-bind="{ rule, index }"
                      :key="index"
                    />

                    <EmptyState
                      v-if="!block.logics?.length"
                      class="mb-4"
                      title="No rules setup"
                      description="Add a rule to get started"
                    />

                    <D9Button
                      type="button"
                      label="Rule"
                      @click="store.addRule()"
                      icon="plus"
                      color="dark"
                      icon-position="left"
                    />
                  </div>
                </div>
                <div
                  class="flex flex-shrink-0 justify-end px-4 py-4"
                  :class="{ 'pointer-events-none opacity-50': isSaving }"
                >
                  <D9Button
                    label="Cancel"
                    type="button"
                    @click="close"
                    color="light"
                  />
                  <D9Button
                    label="Save"
                    type="button"
                    @click="save"
                    class="ml-4"
                    :is-loading="isSaving"
                  />
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import BlockLogicRule from "./BlockLogicRule.vue";
import EmptyState from "@/components/EmptyState.vue";
import { D9Button, D9Icon } from "@deck9/ui";

import { useLogic } from "@/stores";
import { storeToRefs } from "pinia";

const store = useLogic();
const isSaving = ref(false);

const { isShowingLogicEditor, block } = storeToRefs(store);

const save = async () => {
  isSaving.value = true;

  const result = await store.saveBlockLogic();

  if (result && result.failed > 0) {
    isSaving.value = false;
    return;
  }

  setTimeout(() => {
    isSaving.value = false;
    store.backupLogic();
    store.hideLogicEditor();
  }, 250);
};

const close = () => {
  store.restoreLogic();
  store.hideLogicEditor();
};
</script>
