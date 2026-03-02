# TODO – Expense & Health Intelligence System

#### Add loaders

- [x] Dashboard
- [x] Measurement Form
- [x] Expense Form
- [x] Data Table

#### Roadmap

#### Change password

- [ ] Re-authenticate user before password change
- [ ] Enforce password strength rules
- [ ] Invalidate all active sessions after change

- [ ] Delete account (danger zone)
  - [ ] Explicit confirmation + password check
  - [x] Soft delete user (recommended)
  - [ ] Cascade handling:
    - [ ] Expenses
    - [ ] Health metrics
  - [ ] Background cleanup job
  - [ ] Session invalidation
