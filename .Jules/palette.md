## 2026-10-12 - Icon and Unlabeled Form Inputs Accessibility Pattern
**Learning:** Table and filter form inputs without visual `<label>` elements hinder screen reader navigation and accessibility compliance. Adding explicit `aria-label` attributes to search and calculation inputs allows assistive technologies to announce the input purpose clearly without altering visual design.
**Action:** Always check input elements and icon-only buttons across components for missing `aria-label` attributes and include unit tests using `@testing-library/react` (`getByLabelText`) to ensure compliance.

## 2026-10-12 - Context Menu Copy Action Visual Feedback and Roles
**Learning:** Custom right-click context menus that copy table contents to the clipboard without visual status feedback leave users uncertain if the copy action succeeded. Providing temporary '✓ Copied!' status along with `role="menu"`, `role="menuitem"`, and `aria-label` ensures clear interaction feedback and screen reader accessibility.
**Action:** Always add state-driven visual feedback and explicit ARIA menu roles to custom context menus performing asynchronous or clipboard operations.
