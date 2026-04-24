<script setup lang="ts">
import type { Person } from '../types/person.types';

defineProps<{
  person: Person | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="person"
        class="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
          @click="!loading && emit('cancel')"
        />

        <!-- Painel -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="translate-y-4 opacity-0 sm:translate-y-0 sm:scale-95"
          enter-to-class="translate-y-0 opacity-100 sm:scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="translate-y-0 opacity-100 sm:scale-100"
          leave-to-class="translate-y-4 opacity-0 sm:translate-y-0 sm:scale-95"
        >
          <div
            v-if="person"
            class="relative w-full max-w-md rounded-2xl bg-white shadow-modal ring-1 ring-slate-900/5"
          >
            <!-- Faixa vermelha no topo -->
            <div class="h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-red-500 to-rose-500" />

            <div class="p-6">
              <div class="flex items-start gap-4">
                <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-red-50 ring-1 ring-red-100">
                  <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M4 7h16" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <h2 id="dialog-title" class="text-base font-semibold text-slate-900">
                    Excluir registro
                  </h2>
                  <p class="mt-1.5 text-sm leading-relaxed text-slate-500">
                    Você está prestes a excluir
                    <span class="font-semibold text-slate-800">{{ person.nome }}</span>.
                    Esta ação é permanente e não pode ser desfeita.
                  </p>
                </div>
              </div>

              <div class="mt-6 flex justify-end gap-3">
                <button type="button" class="btn-secondary" :disabled="loading" @click="emit('cancel')">
                  Cancelar
                </button>
                <button type="button" class="btn-danger" :disabled="loading" @click="emit('confirm')">
                  <svg v-if="loading" class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <svg v-else class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M4 7h16" />
                  </svg>
                  Excluir permanentemente
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
