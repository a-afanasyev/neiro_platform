# Tasks List

## Active Tasks (Sprint 1: Critical Fixes)

- [ ] **Infrastructure: Setup API Gateway** <!-- id: 0 -->
  - [ ] Configure Nginx to proxy requests to services (4001-4008) <!-- id: 1 -->
  - [ ] Update docker-compose to include Gateway <!-- id: 2 -->
  - [ ] Update Frontend API URL configuration <!-- id: 3 -->

- [ ] **Backend: Fix Diagnostics 403 Error** <!-- id: 4 -->
  - [ ] Allow ADMIN role to create sessions without ChildSpecialist relation <!-- id: 5 -->
  - [ ] Fix `services/diagnostics/src/controllers/diagnostics.controller.ts` <!-- id: 6 -->

- [ ] **Frontend: Fix Date Formatting** <!-- id: 7 -->
  - [ ] Add validation in `formatDate` utility <!-- id: 8 -->
  - [ ] Fix `Invalid Date` display in Diagnostics list <!-- id: 9 -->

- [ ] **QA: Fix E2E Tests** <!-- id: 10 -->
  - [ ] Fix localStorage SecurityError in `auth.spec.ts` <!-- id: 11 -->
  - [ ] Fix Duplicate navigation elements issue <!-- id: 12 -->
  - [ ] Stabilize Dialog interactions <!-- id: 13 -->

## Backlog (From Tech Debt Plan)

- [ ] Frontend: Implement missing UI for Assignments <!-- id: 14 -->
- [ ] Frontend: Implement missing UI for Route editing <!-- id: 15 -->
- [ ] Backend: Standardize `/auth/v1/invite` API response <!-- id: 16 -->
- [ ] CJM: Implement full "Parent Execution" flow <!-- id: 17 -->
- [ ] CJM: Implement full "Specialist Cycle" flow <!-- id: 18 -->

