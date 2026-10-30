# Implementation Plan - Integrasi Penilaian Sikap ke Analitik Onboarding Pusat

## User Request
- Pastikan hasil nilai sikap terintegrasi dengan Analitik Onboarding Pusat.

## Proposed Changes
1. **`src/components/trainer/OnboardingDataAnalystView.tsx`**:
   - Memasukkan data `db.getPenilaianSikapKebersihanKru()` ke dalam metrik komposit Analitik Onboarding Pusat (`dataList`), sehingga rekapitulasi nilai grooming, sanitasi, keaktifan, dan kerapian alat ikut terakumulasi dalam rata-rata skor nasional/cabang dan laporan PDF eksekutif.

## Verification Plan
- Run `lint_applet` and `compile_applet` to ensure zero compilation or type errors.
