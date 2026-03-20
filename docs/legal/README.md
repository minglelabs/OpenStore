# OpenStore Legal Packet

This directory contains working legal-preparation drafts for OpenStore. These documents are not legal advice. They are meant to shorten the time from an Apple review dispute to a clean filing-ready packet.

## Recommended Order

1. `openstore-product-record.md`
   Lock the product description and claim boundaries before anyone writes to Apple or a regulator.
2. `templates/submission-timeline.csv`
   Record every Apple submission, message, and deadline with source-file references.
3. `templates/evidence-index.csv`
   Assign exhibit IDs and keep a citation-ready inventory.
4. `templates/harm-log.csv`
   Track competition harm, business harm, and incremental compliance cost.
5. `openstore-apple-demand-letter.md`
   Use for a pre-dispute notice, post-rejection notice, or preservation demand to Apple.
6. `openstore-kftc-complaint-pack.md`
   Use as the English source packet for a Korea Fair Trade Commission filing, then translate the final complaint and exhibits into Korean before submission.

## Current Posture Locked by the Repository

- OpenStore is described in this repository as an open source alternative to the Apple App Store.
- The repository currently contains an initial storefront prototype, not a complete marketplace product.
- The current implementation is web-first and exposes storefront functionality through `/api/trpc`.
- The current repository does not establish that OpenStore already has a shipped iOS marketplace app, a submitted App Store build, or an approved Apple review history.

## Working Rule

Do not claim any of the following unless there is a source document in the evidence folder:

- A specific Apple rejection or delay
- A specific Apple guideline citation used against OpenStore
- A specific bundle ID, build number, or submission date
- A specific Korean complainant entity
- A quantified damages figure

## Verified Official References

These workflow references were re-checked on 2026-03-20:

- Apple App Review Guidelines: <https://developer.apple.com/app-store/review/guidelines/>
- Apple Web Distribution in the EU: <https://developer.apple.com/support/web-distribution-eu/>
- Apple Developer Program License Agreement: <https://developer.apple.com/support/terms/apple-developer-program-license-agreement/>
- KFTC online case system main page: <https://case.ftc.go.kr/main.do>
- KFTC filing-method page: <https://case.ftc.go.kr/ocp/co/rcenoMth.do>
- KFTC process-overview page: <https://case.ftc.go.kr/ocp/co/caseProcss.do>

## Missing Facts Before Any External Send

- Sender legal entity name, address, and signer
- Apple Developer account holder name and identifier
- Bundle ID, build number, submission date, and App Store Connect screenshots
- Actual Apple review messages or delay record
- Korean complainant entity and Korean-language exhibit set
