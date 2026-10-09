# Wasla roadmap

## Done
- Fix mobile navigation logo to navigate to `/`
- Fix mobile language switcher visibility on public homepage
- "Accept all" no longer grants Analytics/Marketing consent while those services don't exist
- Project ID reconciliation (read-only): verified — production uses yvuwqokmvuumvcscjvid
- Admin dashboard (`/admin` + "Beheer" menu item, platform_admins + is_platform_admin)
- Test accounts removed from the beta database (5 real accounts remain)
- App published; custom domain waslain.nl connected, verified, ACTIVE and serving the live site
  (root + www, primary = waslain.nl, SSL provisioned)

## Open
- Email sender domain: not started — waslain.nl is not yet configured for sending, so app mails
  (password reset etc.) still come from the default sender. Next step: email setup dialog.
- Live end-to-end tests after publishing: password reset link, account deletion, `/admin`
- Security hardening: close remaining warnings (public reviews read, image policy note)
- Payments provider for professional subscriptions
- Policy data still missing: legal entity, address, minimum age
- Backup: manual export + image download, restore test
