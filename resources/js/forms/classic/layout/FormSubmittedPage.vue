<template>
  <div>
    <div class="form-message-prose conversation-theme">
      <h1>
        {{ store.form?.eoc_headline || t("form_submitted") }}
      </h1>
      <div
        v-if="store.form?.eoc_text"
        class="mt-2"
        v-html="store.form?.eoc_text"
      ></div>
    </div>
    <div>
      <CallToActionButton
        v-if="store.form?.show_cta_link && store.callToActionUrl"
        :href="store.callToActionUrl"
        :label="store.form?.cta_label ?? t('close')"
      />
      <SocialLinks v-if="store.form?.show_social_links" class="mt-8" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import CallToActionButton from "./CallToActionButton.vue";
import { useConversation } from "@/stores/conversation";
import SocialLinks from "@/forms/classic/layout/SocialLinks.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const store = useConversation();
</script>
