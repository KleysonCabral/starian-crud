<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { ApiError } from '../../../core/types/api-response.type';
import PersonDeleteDialog from '../components/PersonDeleteDialog.vue';
import PersonForm from '../components/PersonForm.vue';
import PersonList from '../components/PersonList.vue';
import { personService } from '../services/person.service';
import type { CreatePersonPayload, Person, UpdatePersonPayload } from '../types/person.types';

type PanelMode = 'create' | 'edit';

const panelOpen = ref(false);
const panelMode = ref<PanelMode>('create');
const persons = ref<Person[]>([]);
const personToEdit = ref<Person | null>(null);
const personToDelete = ref<Person | null>(null);

const loadingList = ref(false);
const loadingForm = ref(false);
const loadingDelete = ref(false);

const toast = ref<{ type: 'success' | 'error'; message: string } | null>(null);
let toastTimer: ReturnType<typeof setTimeout> | null = null;

const sortedPersons = computed(() =>
  [...persons.value].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
);

const totalLabel = computed(() =>
  `${persons.value.length} ${persons.value.length === 1 ? 'registro' : 'registros'}`,
);

const panelTitle = computed(() =>
  panelMode.value === 'edit' ? 'Editar pessoa' : 'Nova pessoa',
);

const panelSubtitle = computed(() =>
  panelMode.value === 'edit'
    ? 'Atualize os dados com segurança, mantendo o contexto da listagem.'
    : 'Registre novas pessoas com validação consistente e fluxo padronizado.',
);

function showToast(type: 'success' | 'error', message: string): void {
  if (toastTimer) clearTimeout(toastTimer);
  toast.value = { type, message };
  toastTimer = setTimeout(() => {
    toast.value = null;
  }, 4000);
}

function handleEscape(event: KeyboardEvent): void {
  if (event.key === 'Escape' && panelOpen.value) {
    closePanel();
  }
}

onBeforeUnmount(() => {
  if (toastTimer) clearTimeout(toastTimer);
  window.removeEventListener('keydown', handleEscape);
});

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'error' in err) {
    const apiErr = err as ApiError;
    switch (apiErr.error.code) {
      case 'CPF_ALREADY_EXISTS':
        return 'Este CPF já está cadastrado no sistema.';
      case 'EMAIL_ALREADY_EXISTS':
        return 'Este e-mail já está cadastrado no sistema.';
      case 'PERSON_NOT_FOUND':
        return 'Pessoa não encontrada.';
      case 'VALIDATION_ERROR': {
        const details = Array.isArray(apiErr.error.details) ? apiErr.error.details : [];
        return details.length > 0
          ? details[0]
          : 'Dados inválidos. Verifique os campos.';
      }
      default:
        return apiErr.error.message ?? 'Ocorreu um erro inesperado. Tente novamente.';
    }
  }

  return 'Ocorreu um erro inesperado. Tente novamente.';
}

async function loadPersons(): Promise<void> {
  loadingList.value = true;

  try {
    persons.value = await personService.getAll();
  } catch (err) {
    showToast('error', extractErrorMessage(err));
  } finally {
    loadingList.value = false;
  }
}

onMounted(loadPersons);
onMounted(() => {
  window.addEventListener('keydown', handleEscape);
});

function openCreate(): void {
  personToEdit.value = null;
  panelMode.value = 'create';
  panelOpen.value = true;
}

function openEdit(person: Person): void {
  personToEdit.value = person;
  panelMode.value = 'edit';
  panelOpen.value = true;
}

function closePanel(): void {
  if (loadingForm.value) return;
  panelOpen.value = false;
  personToEdit.value = null;
}

function openDelete(person: Person): void {
  personToDelete.value = person;
}

function cancelDelete(): void {
  personToDelete.value = null;
}

async function handleCreate(payload: CreatePersonPayload | UpdatePersonPayload): Promise<void> {
  loadingForm.value = true;

  try {
    await personService.create(payload as CreatePersonPayload);
    await loadPersons();
    closePanel();
    showToast('success', 'Pessoa cadastrada com sucesso!');
  } catch (err) {
    showToast('error', extractErrorMessage(err));
  } finally {
    loadingForm.value = false;
  }
}

async function handleUpdate(payload: CreatePersonPayload | UpdatePersonPayload): Promise<void> {
  if (!personToEdit.value) return;
  loadingForm.value = true;

  try {
    await personService.update(personToEdit.value.id, payload as UpdatePersonPayload);
    await loadPersons();
    closePanel();
    showToast('success', 'Pessoa atualizada com sucesso!');
  } catch (err) {
    showToast('error', extractErrorMessage(err));
  } finally {
    loadingForm.value = false;
  }
}

async function handleDelete(): Promise<void> {
  if (!personToDelete.value) return;
  loadingDelete.value = true;

  try {
    await personService.remove(personToDelete.value.id);
    persons.value = persons.value.filter((person) => person.id !== personToDelete.value?.id);
    personToDelete.value = null;
    showToast('success', 'Pessoa excluída com sucesso!');
  } catch (err) {
    showToast('error', extractErrorMessage(err));
    personToDelete.value = null;
  } finally {
    loadingDelete.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50/80">
    <header class="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-slate-900 shadow-card">
            <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <div>
            <h1 class="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">Cadastro de Pessoas</h1>
            <p class="text-sm text-slate-500">Gestão cadastral com confiabilidade, padronização e agilidade operacional.</p>
          </div>
        </div>

        <button type="button" class="btn-primary" @click="openCreate">
          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nova Pessoa
        </button>
      </div>
    </header>

    <main class="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8" :aria-busy="loadingList">
      <section class="fade-in-up overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-card">
        <div class="grid gap-6 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_34%),linear-gradient(135deg,_#ffffff,_#f8fafc)] px-6 py-7 lg:grid-cols-[1.6fr_0.9fr] lg:px-8">
          <div>
            <span class="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
              Governança de cadastro
            </span>
            <h2 class="mt-4 max-w-2xl text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Centralize o cadastro de pessoas com eficiência operacional.
            </h2>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Acompanhe a base em tempo real, execute inclusões e edições no painel lateral e conclua cada ação com feedback imediato e regras alinhadas ao backend.
            </p>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div class="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Total cadastrado</p>
              <p class="mt-2 text-3xl font-semibold text-slate-900">{{ persons.length }}</p>
              <p class="mt-1 text-sm text-slate-500">{{ totalLabel }}</p>
            </div>

            <div class="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Estado da interface</p>
              <p class="mt-2 text-lg font-semibold">{{ panelOpen ? panelTitle : 'Pronto para cadastro' }}</p>
              <p class="mt-1 text-sm text-slate-300">
                {{ panelOpen ? panelSubtitle : 'Utilize o painel lateral para criar ou editar registros.' }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="fade-in-up" style="animation-delay: 80ms">
        <PersonList
          :persons="sortedPersons"
          :loading="loadingList"
          @edit="openEdit"
          @delete="openDelete"
        />
      </section>
    </main>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="panelOpen"
          class="fixed inset-0 z-40 flex"
          role="dialog"
          aria-modal="true"
          :aria-label="panelTitle"
        >
          <button
            type="button"
            class="h-full flex-1 cursor-default bg-slate-950/35 backdrop-blur-[2px]"
            aria-label="Fechar painel"
            @click="closePanel"
          />

          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="translate-x-full"
            enter-to-class="translate-x-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="translate-x-0"
            leave-to-class="translate-x-full"
          >
            <aside
              v-if="panelOpen"
              class="relative flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl"
            >
              <div class="border-b border-slate-100 bg-[linear-gradient(135deg,_rgba(238,242,255,0.95),_rgba(255,255,255,1))] px-6 py-6">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <span class="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 ring-1 ring-brand-100">
                      {{ panelMode === 'edit' ? 'Modo edição' : 'Novo cadastro' }}
                    </span>
                    <h2 class="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{{ panelTitle }}</h2>
                    <p class="mt-2 max-w-xl text-sm leading-6 text-slate-600">{{ panelSubtitle }}</p>
                  </div>

                  <button
                    type="button"
                    class="icon-btn h-10 w-10 rounded-xl bg-white shadow-sm ring-1 ring-slate-200"
                    :disabled="loadingForm"
                    aria-label="Fechar painel"
                    @click="closePanel"
                  >
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="flex-1 overflow-y-auto px-6 py-6">
                <div class="mx-auto max-w-xl">
                  <PersonForm
                    :person-to-edit="personToEdit"
                    :loading="loadingForm"
                    @submit="panelMode === 'edit' ? handleUpdate($event) : handleCreate($event)"
                    @cancel="closePanel"
                  />
                </div>
              </div>
            </aside>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <PersonDeleteDialog
      :person="personToDelete"
      :loading="loadingDelete"
      @confirm="handleDelete"
      @cancel="cancelDelete"
    />

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="translate-y-4 opacity-0 sm:translate-x-4 sm:translate-y-0"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-to-class="translate-y-4 opacity-0 sm:translate-x-4 sm:translate-y-0"
      >
        <div
          v-if="toast"
          class="fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-elevated ring-1"
          :class="{
            'text-emerald-700 ring-emerald-100': toast.type === 'success',
            'text-red-700 ring-red-100': toast.type === 'error',
          }"
          role="status"
          aria-live="polite"
        >
          <div
            class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
            :class="toast.type === 'success' ? 'bg-emerald-50' : 'bg-red-50'"
          >
            <svg
              v-if="toast.type === 'success'"
              class="h-4 w-4 text-emerald-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <svg
              v-else
              class="h-4 w-4 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <span class="text-sm font-medium text-slate-800">{{ toast.message }}</span>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
