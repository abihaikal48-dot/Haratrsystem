# Independent Offline Storage Persistence Plan

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your feedback, we are implementing a completely independent, isolated offline storage engine that persists all participant additions, deletions, and evaluations reliably in the browser's local storage without any automatic re-seeding, resets, or remote cloud overwrite triggers.

- **Confirmed Decision 1**: Use independent offline storage for all tables (participants, batches, evaluations, master data).
- **Confirmed Decision 2**: Keep data stored automatically without requiring manual export buttons.

---

## 1. Overview & Core Concept

- **What It Does**: Establishes a dedicated offline storage repository layer (`storage.ts` / localStorage isolation) that guarantees any changes (adding/deleting participants, updating batches, saving evaluations) remain immediately and permanently saved on the user's device.
- **Target Audience / Persona**: Trainers and system administrators working offline or requiring absolute reliability without data loss.
- **Key Value**: Zero data loss, robust offline-first architecture, and prevention of any accidental resets.

---

## 2. User Experience & Visual Design

- **Key User Flows**: 
  1. User adds or deletes participants in Onboarding Training or Batch management.
  2. State updates instantly and writes to independent offline storage keys (`hara_pd_...`).
  3. Page refreshes or component re-renders preserve exact state without reverting to factory defaults.
- **Visual Identity & Theme**: Clean, utilitarian professional training dashboard with smooth feedback toasts.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1**: Isolated Offline Storage Keys
  - *Chosen Approach*: Maintain standalone localStorage keys for participants, batches, and evaluations with strict fallback checks (`ensureSeed` only on `null`).
  - *Why*: Eliminates any accidental overrides from cohort seeding logic.
- **Decision 2**: Automatic Persistence
  - *Chosen Approach*: Immediate write-through on every CRUD action.
  - *Why*: Satisfies user requirement to keep data stored automatically without manual export steps.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│ OnboardingProductPracticeView / UI Components         │
└───────────────────────────┬────────────────────────────┘
                            │ Read / Write CRUD
┌───────────────────────────▼────────────────────────────┐
│ StorageDatabase (`src/lib/storage.ts`)                 │
│ - getTable() / setTable()                              │
│ - Standalone ensureSeed() (Null-check only)            │
└───────────────────────────┬────────────────────────────┘
                            │ Persistent LocalStorage
┌───────────────────────────▼────────────────────────────┐
│ Independent Browser LocalStorage                         │
└────────────────────────────────────────────────────────┘
```

- **Data Model & State**: Standalone JSON serialization in localStorage for `kru`, `onboarding_batches`, `penilaian_praktik_onboarding_produk`, `peserta_matrix_tc`, etc.
- **Interactive Component Mapping**: Ensure all participant deletion, batch updating, and evaluation saving actions update the state and commit to localStorage immediately.
