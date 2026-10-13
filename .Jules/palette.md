## 2026-10-12 - Icon and Unlabeled Form Inputs Accessibility Pattern
**Learning:** Table and filter form inputs without visual `<label>` elements hinder screen reader navigation and accessibility compliance. Adding explicit `aria-label` attributes to search and calculation inputs allows assistive technologies to announce the input purpose clearly without altering visual design.
**Action:** Always check input elements and icon-only buttons across components for missing `aria-label` attributes and include unit tests using `@testing-library/react` (`getByLabelText`) to ensure compliance.
