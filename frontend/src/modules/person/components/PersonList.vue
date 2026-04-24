<script setup lang="ts">
import type { Person } from '../types/person.types';

defineProps<{
  persons: Person[];
  loading: boolean;
}>();

const emit = defineEmits<{
  edit: [person: Person];
  delete: [person: Person];
}>();

function maskCpf(cpf: string): string {
  return cpf.replace(/^(\d{3})\.(\d{3})\.(\d{3})-(\d{2})$/, '***.$2.$3-**');
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

function initials(nome: string): string {
  return nome
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

const avatarColors = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
];

function avatarColor(nome: string): string {
  const idx = nome.charCodeAt(0) % avatarColors.length;
  return avatarColors[idx];
}
</script>

<template>
  <!-- Loading skeleton -->
  <div v-if="loading" class="space-y-3">
    <div
      v-for="i in 4"
      :key="i"
      class="flex items-center gap-4 rounded-xl bg-white p-4 shadow-card animate-pulse"
    >
      <div class="h-10 w-10 rounded-full bg-slate-100" />
      <div class="flex-1 space-y-2">
        <div class="h-3.5 w-1/4 rounded bg-slate-100" />
        <div class="h-3 w-1/3 rounded bg-slate-100" />
      </div>
      <div class="h-3 w-28 rounded bg-slate-100" />
      <div class="h-3 w-24 rounded bg-slate-100" />
      <div class="h-7 w-16 rounded-lg bg-slate-100" />
    </div>
  </div>

  <!-- Empty state -->
  <div
    v-else-if="persons.length === 0"
    class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-20"
  >
    <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
      <svg class="h-8 w-8 text-brand-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    </div>
    <h3 class="mt-4 text-base font-semibold text-slate-700">Nenhuma pessoa cadastrada</h3>
    <p class="mt-1 text-sm text-slate-400">Clique em "Nova Pessoa" para adicionar o primeiro registro.</p>
  </div>

  <!-- Table -->
  <div v-else class="overflow-hidden rounded-xl bg-white shadow-card ring-1 ring-slate-100">
    <div class="overflow-x-auto">
      <table class="min-w-[760px] w-full">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50/70">
            <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Pessoa</th>
            <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">CPF</th>
            <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Telefone</th>
            <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Nascimento</th>
            <th class="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr
            v-for="person in persons"
            :key="person.id"
            class="group transition-colors duration-100 hover:bg-slate-50/60"
          >
          <!-- Nome + email -->
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div
                class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                :class="avatarColor(person.nome)"
              >
                {{ initials(person.nome) }}
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-800">{{ person.nome }}</p>
                <p class="text-xs text-slate-400">{{ person.email }}</p>
              </div>
            </div>
          </td>

          <!-- CPF -->
          <td class="px-6 py-4">
            <span class="font-mono text-sm text-slate-600">{{ maskCpf(person.cpf) }}</span>
          </td>

          <!-- Telefone -->
          <td class="px-6 py-4">
            <span class="text-sm text-slate-600">{{ person.telefone }}</span>
          </td>

          <!-- Nascimento -->
          <td class="px-6 py-4">
            <span class="text-sm text-slate-600">{{ formatDate(person.dataNascimento) }}</span>
          </td>

          <!-- Ações -->
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-1.5 opacity-100 transition-opacity duration-150 md:opacity-0 md:group-hover:opacity-100">
              <button
                type="button"
                title="Editar"
                class="icon-btn icon-btn-brand"
                @click="emit('edit', person)"
              >
                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13l6.5-6.5a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
                </svg>
              </button>
              <button
                type="button"
                title="Excluir"
                class="icon-btn icon-btn-danger"
                @click="emit('delete', person)"
              >
                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M4 7h16" />
                </svg>
              </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div class="border-t border-slate-100 bg-slate-50/50 px-6 py-3">
      <p class="text-xs text-slate-400">
        {{ persons.length }} {{ persons.length === 1 ? 'registro' : 'registros' }}
      </p>
    </div>
  </div>
</template>
