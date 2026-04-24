<script setup lang="ts">
import { computed, watch } from 'vue';
import { usePersonForm } from '../composables/usePersonForm';
import type { CreatePersonPayload, Person, UpdatePersonPayload } from '../types/person.types';

const props = defineProps<{
  personToEdit: Person | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: CreatePersonPayload | UpdatePersonPayload];
  cancel: [];
}>();

const isEdit = computed(() => props.personToEdit !== null);
const { fields, errors, fill, reset, validateField, validate, toCreatePayload, toUpdatePayload } =
  usePersonForm(() => isEdit.value);

watch(
  () => props.personToEdit,
  (person) => {
    if (person) {
      fill(person);
      return;
    }
    reset();
  },
  { immediate: true },
);

function handleSubmit(): void {
  if (!validate()) return;
  const payload = isEdit.value ? toUpdatePayload() : toCreatePayload();
  emit('submit', payload);
}

function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function maskTelefone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 2) {
    return digits.length === 0 ? '' : `(${digits}`;
  }

  const ddd = digits.slice(0, 2);
  const restante = digits.slice(2);

  if (restante.length <= 4) {
    return `(${ddd}) ${restante}`;
  }

  if (restante.length <= 8) {
    return `(${ddd}) ${restante.slice(0, 4)}-${restante.slice(4)}`;
  }

  return `(${ddd}) ${restante.slice(0, 5)}-${restante.slice(5, 9)}`;
}

function onCpfInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  fields.cpf = maskCpf(target.value);
}

function onTelefoneInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  fields.telefone = maskTelefone(target.value);
}
</script>

<template>
  <form novalidate class="space-y-6" @submit.prevent="handleSubmit">
    <div class="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
      <p class="text-sm font-semibold text-slate-800">
        {{ isEdit ? 'Atualize os dados com segurança' : 'Preencha os dados do novo cadastro' }}
      </p>
      <p class="mt-1 text-sm leading-6 text-slate-500">
        Os campos seguem a mesma regra de validação aplicada no backend para manter consistência entre interface e API.
      </p>
    </div>

    <div>
      <label for="nome" class="form-label">
        Nome <span class="text-red-400">*</span>
      </label>
      <input
        id="nome"
        v-model="fields.nome"
        type="text"
        autocomplete="name"
        placeholder="Ex.: Maria da Silva"
        class="form-field"
        :class="{ 'form-field-error': errors.nome }"
        @blur="validateField('nome')"
      />
      <p v-if="errors.nome" class="form-error">
        <svg class="h-3.5 w-3.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
        </svg>
        {{ errors.nome }}
      </p>
    </div>

    <div>
      <label for="email" class="form-label">
        E-mail <span class="text-red-400">*</span>
      </label>
      <input
        id="email"
        v-model="fields.email"
        type="email"
        autocomplete="email"
        placeholder="Ex.: maria@exemplo.com"
        class="form-field"
        :class="{ 'form-field-error': errors.email }"
        @blur="validateField('email')"
      />
      <p v-if="errors.email" class="form-error">
        <svg class="h-3.5 w-3.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
        </svg>
        {{ errors.email }}
      </p>
    </div>

    <div>
      <div class="flex items-center justify-between gap-3">
        <label for="cpf" class="form-label">
          CPF <span class="text-red-400">*</span>
        </label>
        <span
          v-if="isEdit"
          class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200"
        >
          <svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" />
          </svg>
          CPF bloqueado na edição
        </span>
      </div>
      <input
        id="cpf"
        v-model="fields.cpf"
        type="text"
        inputmode="numeric"
        maxlength="14"
        placeholder="Ex.: 123.456.789-09"
        class="form-field"
        :class="{
          'form-field-error': errors.cpf,
          'cursor-not-allowed !bg-slate-50 text-slate-400': isEdit,
        }"
        :readonly="isEdit"
        @input="onCpfInput"
        @blur="validateField('cpf')"
      />
      <p v-if="errors.cpf" class="form-error">
        <svg class="h-3.5 w-3.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
        </svg>
        {{ errors.cpf }}
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div>
        <label for="dataNascimento" class="form-label">
          Data de Nascimento <span class="text-red-400">*</span>
        </label>
        <input
          id="dataNascimento"
          v-model="fields.dataNascimento"
          type="date"
          :max="new Date().toISOString().split('T')[0]"
          class="form-field"
          :class="{ 'form-field-error': errors.dataNascimento }"
          @blur="validateField('dataNascimento')"
        />
        <p v-if="errors.dataNascimento" class="form-error">
          <svg class="h-3.5 w-3.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
          </svg>
          {{ errors.dataNascimento }}
        </p>
      </div>

      <div>
        <label for="telefone" class="form-label">
          Telefone <span class="text-red-400">*</span>
        </label>
        <input
          id="telefone"
          v-model="fields.telefone"
          type="tel"
          inputmode="numeric"
          maxlength="15"
          placeholder="(11) 91234-5678"
          class="form-field"
          :class="{ 'form-field-error': errors.telefone }"
          @input="onTelefoneInput"
          @blur="validateField('telefone')"
        />
        <p v-if="errors.telefone" class="form-error">
          <svg class="h-3.5 w-3.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
          </svg>
          {{ errors.telefone }}
        </p>
      </div>
    </div>

    <div class="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
      <button type="button" class="btn-secondary" :disabled="loading" @click="emit('cancel')">
        Cancelar
      </button>
      <button type="submit" class="btn-primary" :disabled="loading">
        <svg v-if="loading" class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <svg v-else class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        {{ isEdit ? 'Salvar alterações' : 'Cadastrar pessoa' }}
      </button>
    </div>
  </form>
</template>
