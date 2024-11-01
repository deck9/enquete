<template>
  <transition
    appear
    appear-from-class="opacity-0"
    appear-active-class="transition duration-500 ease-out"
    appear-to-class="opacity-100"
  >
    <div
      v-if="store.form"
      class="conversation-theme flex min-h-full max-w-screen-sm flex-col justify-between text-content"
      :class="{
        'mx-auto': !flags.alignLeft,
      }"
    >
      <div>
        <Header v-if="!flags.hideTitle" :form="store.form" />

        <div class="h-full w-full max-w-screen-sm py-10">
          <transition
            mode="out-in"
            enter-from-class="opacity-0 translate-y-4"
            enter-active-class="transition duration-300 ease-out"
            enter-to-class="opacity-100 translate-y-0"
            leave-from-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-to-class="opacity-0 -translate-y-10"
          >
            <Block
              v-if="store.currentBlock && !store.isSubmitted"
              :block="store.currentBlock"
              :key="store.currentBlock.id"
            />
            <FormSubmittedPage v-else-if="store.isSubmitted" />
          </transition>
        </div>
      </div>

      <footer
        aria-label="Navigation for form and progress indicator"
        class="items-center justify-between text-xs sm:flex sm:text-center"
      >
        <Navigator
          v-bind="{
            hideNavigation: flags.hideNavigation,
            key: store.currentBlock?.id,
          }"
          :class="{
            'pointer-events-none opacity-0': store.isSubmitted,
          }"
        />

        <FooterNavigation class="mt-5 sm:mt-0" :form="store.form" />
      </footer>
    </div>
    <div
      v-else
      class="flex min-h-full w-full mx-auto max-w-screen-sm flex-col justify-center items-center bg-grey-50"
    >
      <div class="font-medium text-lg">Form not found</div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import Header from "@/forms/classic/layout/Header.vue";
import Block from "@/forms/classic/layout/Block.vue";
import FormSubmittedPage from "@/forms/classic/layout/FormSubmittedPage.vue";
import Navigator from "@/forms/classic/layout/Navigator.vue";
import FooterNavigation from "@/forms/classic/layout/FooterNavigation.vue";
import { useConversation } from "@/stores/conversation";
import { useThemableColor } from "@/utils/useThemableColor";
import { useBeforeUnload } from "@/utils/useBeforeUnload";
import { computed, onMounted, provide, ref } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { useRouteParams } from "@/utils/useRouteParams";

const props = defineProps<{
  settings: PublicFormModel;
  flags: EmbedFlags;
}>();

const isLoading = ref(true);
const focusDisabled = computed(() => {
  return isLoading.value && !props.flags.autofocus;
});
provide("disableFocus", focusDisabled);

const store = useConversation();
await store.initForm(
  props.settings,
  useRouteParams([
    "iframe",
    "hideTitle",
    "hideNavigation",
    "focusOnMount",
    "alignLeft",
  ]),
);

const { locale } = useI18n({ useScope: "global" });
locale.value = store.form?.language ?? "en";

const { hasUnsavedPayload } = storeToRefs(store);

onMounted(() => {
  isLoading.value = false;

  useBeforeUnload(hasUnsavedPayload);
});

const primaryColor = useThemableColor(store.form?.brand_color ?? "#1f2937");
const contrastColor = useThemableColor(store.form?.contrast_color ?? "#f9fafb");
const backgroundColor = useThemableColor(
  store.form?.background_color ?? "#ffffff",
);
const textColor = useThemableColor(store.form?.text_color ?? "#000000");
const brightness = store.form?.use_brighter_inputs ? 1.5 : 1;
</script>

<style>
.conversation-theme {
  --color-primary: v-bind(primaryColor);
  --color-contrast: v-bind(contrastColor);
  --color-background: v-bind(backgroundColor);
  --color-content: v-bind(textColor);
  --brightness-user: v-bind(brightness);
}
</style>
