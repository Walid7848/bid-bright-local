# Mobile language switcher visibility

## Change
- Update the public header only.
- Keep the existing desktop language switcher unchanged.
- Render the existing `LanguageSwitch` directly in the mobile header beside the current actions.
- Remove the now-redundant language row from the mobile menu so there is one clear mobile control.
- Keep the existing shared language state and local-storage persistence unchanged.

## Verification
- Run the TypeScript typecheck.
- Test the public homepage at 375px and 390px for switcher visibility and horizontal overflow.
- Switch among AR, NL, and EN, navigate to login, and confirm the selected language persists.
- Check the desktop header remains unchanged.

## Scope
Frontend presentation only. No changes to authentication, backend, database, RLS, RPCs, storage, or business logic.
