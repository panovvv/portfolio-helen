<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import NavBar from "~/components/NavBar.vue";

const { t } = useI18n();

useHead(() => ({
  title: t("home.name"),
}));

const showNotice = ref(false);

onMounted(() => {
  if (!localStorage.getItem("cookieNoticeDismissed")) {
    showNotice.value = true;
  }
});

function dismissNotice() {
  localStorage.setItem("cookieNoticeDismissed", "true");
  showNotice.value = false;
}
</script>

<template>
  <UApp>
    <NavBar />
    <main class="pt-16">
      <NuxtPage />
    </main>

    <transition name="fade">
      <div
        v-if="showNotice"
        class="fixed bottom-0 left-0 right-0 bg-gray-100 text-gray-700 text-sm p-3 flex justify-between items-center shadow z-[9999]"
      >
        <span>{{ t("cookie.notice") }}</span>
        <button
          class="ml-4 px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
          @click="dismissNotice"
        >
          {{ t("cookie.gotIt") }}
        </button>
      </div>
    </transition>
  </UApp>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
