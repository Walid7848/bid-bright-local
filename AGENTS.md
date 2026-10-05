<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Account deletion runs only in the protected server function `deleteMyAccount` (src/lib/account.functions.ts → account.server.ts): user id from the verified token, Storage cleanup before auth deletion, blocked while awarded/in_progress work exists — keeps deletion safe, retryable and free of orphaned files.
