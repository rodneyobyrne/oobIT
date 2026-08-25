# Build and Launch Plan

## Launch target
`https://go.oobcreative.com/`

## Definition of the first reviewable release
A visitor can complete an interview, receive a deterministic recommendation class and useful next step, copy the result, restart, and use the experience on mobile or desktop without sending private data to a backend.

## Workstreams
### Product / PM
- Maintain prioritized backlog and decision log.
- Keep recommendation logic separate from monetization.
- Require explicit evidence for commercial product claims.

### UX / Conversation
- Test recognizable entry situations.
- Measure question usefulness and abandonment.
- Reduce questions that do not alter routing.

### Engineering
- Static front end first.
- Introduce APIs behind stable interfaces.
- n8n orchestrates; persistent datastore owns records.
- Add automated browser and adversarial agent tests before live voice.

### SEO / Marketing
- Build around customer-language decision queries.
- Treat interview completion as the primary conversion.
- Feed conversation patterns back into content planning.
- Do not become a tutorial directory.

### Research / Vendor intelligence
- Maintain current pricing/features/evidence separately from the interface.
- Record best-fit and poor-fit conditions.
- Commission never enters fit ranking.

### Governance
- No private Project conversation history in runtime.
- Use verified or restrained claims.
- Disclose compensation near affected recommendations.

## Infrastructure path
1. GitHub repository: `rodneyobyrne/oobIT`.
2. Default branch: `main`.
3. GitHub Pages workflow deploys repository root.
4. Custom domain file: `CNAME` -> `go.oobcreative.com`.
5. DNS: create CNAME `go` -> `rodneyobyrne.github.io` once Pages is enabled for the repository.
6. Enforce HTTPS after GitHub issues the certificate.

## Launch gates
- Main branch passes validation.
- Mobile/desktop smoke test passes.
- No secrets in repository.
- Canonical/robots/sitemap use go.oobcreative.com.
- Custom domain resolves and HTTPS works.
- Recommendation copy contains no unsupported vendor claims.
