import { CanDeactivateFn } from '@angular/router';

/**
 * Interface that components must implement to participate in the canDeactivate guard.
 * The guard will call hasUnsavedChanges() to decide whether to block navigation.
 */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/**
 * Functional canDeactivate guard — blocks navigation when the component
 * reports unsaved changes, prompting the user to confirm before leaving.
 *
 * Usage in app.routes.ts:
 *   { path: 'some-route', canDeactivate: [unsavedChangesGuard], loadComponent: ... }
 */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (component.hasUnsavedChanges()) {
    return confirm('You have unsaved changes. Are you sure you want to leave this page?');
  }
  return true;
};
