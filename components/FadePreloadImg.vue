<script setup lang="ts">
import { ref, watch, computed } from "vue";

interface Props {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  sizes?: string;
  durationMs?: number;
}

const props = defineProps<Props>();

// Two persistent buffers. We never remove them; we just flip roles.
const buf0Src = ref<string>(props.src);
const buf1Src = ref<string>(props.src);

// 0 or 1: which buffer is currently visible (on top after transition completes)
const front = ref<0 | 1>(0);
const back = computed<0 | 1>(() => (front.value === 0 ? 1 : 0));

const isTransitioning = ref(false);
const sizerImgRef = ref<HTMLImageElement | null>(null);
const img0Ref = ref<HTMLImageElement | null>(null);
const img1Ref = ref<HTMLImageElement | null>(null);

const duration = () =>
  props.durationMs && props.durationMs > 0 ? props.durationMs : 1000;

function safeDecode(img: HTMLImageElement | null): Promise<void> {
  if (!img) return Promise.resolve();
  try {
    if ((img as any).decode) {
      return (img as any)
        .decode()
        .catch(() => void 0) as unknown as Promise<void>;
    }
  } catch (_) {
    // ignore
  }
  return Promise.resolve();
}

function setBackSrc(newSrc: string) {
  if (back.value === 0) {
    buf0Src.value = newSrc;
  } else {
    buf1Src.value = newSrc;
  }
}

function getBackImgRef(): HTMLImageElement | null {
  return back.value === 0 ? img0Ref.value : img1Ref.value;
}

// When prop src changes, preload it into the hidden back buffer
watch(
  () => props.src,
  async (newSrc) => {
    if (!newSrc) return;
    // If already showing or already queued in back, ignore
    if (newSrc === (front.value === 0 ? buf0Src.value : buf1Src.value)) return;
    if (newSrc === (back.value === 0 ? buf0Src.value : buf1Src.value)) return;

    setBackSrc(newSrc);

    // Wait for the back image to load+decode
    await new Promise<void>((resolve) => {
      const img = getBackImgRef();
      if (!img) return resolve();
      const done = async () => {
        img?.removeEventListener("load", onLoad);
        await safeDecode(img);
        // double RAF to ensure at least one paint at opacity 0
        await new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r)),
        );
        resolve();
      };
      const onLoad = () => void done();
      if (img.complete && img.naturalWidth > 0) {
        done();
      } else {
        img.addEventListener("load", onLoad, { once: true } as any);
      }
    });

    // Start crossfade: back 0->1, front 1->0
    isTransitioning.value = true;

    const target = getBackImgRef();
    if (!target) return;
    const onEnd = async (e: Event) => {
      const te = e as TransitionEvent;
      if (te.propertyName !== "opacity") return;
      target.removeEventListener("transitionend", onEnd as any);

      // Flip roles: the buffer we just faded in becomes the front
      front.value = back.value;

      // Sync sizer to the now-visible buffer
      const currentSrc = front.value === 0 ? buf0Src.value : buf1Src.value;
      if (sizerImgRef.value) sizerImgRef.value.src = currentSrc;

      // Ensure at least one paint with the new front fully visible
      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r)),
      );

      isTransitioning.value = false;
    };
    target.addEventListener(
      "transitionend",
      onEnd as any,
      { once: true } as any,
    );
  },
  { immediate: false },
);
</script>

<template>
  <!-- Wrapper maintains natural image height using a hidden sizer in normal flow -->
  <div class="relative w-full">
    <!-- Sizer: invisible but keeps layout height based on current image -->
    <img
      ref="sizerImgRef"
      :src="front === 0 ? buf0Src : buf1Src"
      :alt="alt || ''"
      :width="width"
      :height="height"
      :sizes="sizes"
      class="w-full h-auto object-contain object-center invisible select-none"
      decoding="async"
      loading="eager"
    />

    <!-- Buffer 0 -->
    <div class="absolute inset-0 z-0 pointer-events-none">
      <img
        ref="img0Ref"
        :src="buf0Src"
        :alt="alt || ''"
        :width="width"
        :height="height"
        :sizes="sizes"
        class="w-full h-full object-contain object-center block"
        decoding="async"
        loading="eager"
        :style="{
          opacity:
            front === 0 ? (isTransitioning ? 0 : 1) : isTransitioning ? 1 : 0,
          transition: `opacity ${duration()}ms ease`,
          willChange: 'opacity',
        }"
      />
    </div>

    <!-- Buffer 1 -->
    <div class="absolute inset-0 z-10 pointer-events-none">
      <img
        ref="img1Ref"
        :src="buf1Src"
        :alt="alt || ''"
        :width="width"
        :height="height"
        :sizes="sizes"
        class="w-full h-full object-contain object-center block"
        decoding="async"
        loading="eager"
        fetchpriority="high"
        :style="{
          opacity:
            front === 1 ? (isTransitioning ? 0 : 1) : isTransitioning ? 1 : 0,
          transition: `opacity ${duration()}ms ease`,
          willChange: 'opacity',
        }"
      />
    </div>
  </div>
</template>

<style scoped>
/* No additional CSS required; styles are inline for transition timing flexibility */
</style>
