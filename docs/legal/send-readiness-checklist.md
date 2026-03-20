# OpenStore External Send Readiness Checklist

Use this checklist before sending anything to Apple or filing anything with the Korea Fair Trade Commission. Nothing in this document is legal advice.

## Rule

Do not send an Apple notice letter and do not file a KFTC complaint until every required item below is marked `done` or explicitly waived by counsel.

## Intake Source of Truth

Fill `templates/legal-intake.yaml` first. All external-facing drafts in this directory should be completed from that intake file and from the evidence set referenced in `templates/evidence-index.csv`.

## Apple Notice Readiness

Mark each item:

- `[ ]` Sender legal entity, signer, address, and contact fields are complete in `templates/legal-intake.yaml`.
- `[ ]` Apple Developer account holder name and account identifier are complete in `templates/legal-intake.yaml`.
- `[ ]` Bundle ID, build number, submission date, and relevant review-message dates are complete in `templates/legal-intake.yaml`.
- `[ ]` The facts section in `openstore-apple-demand-letter.md` has been converted from placeholders to dated facts only.
- `[ ]` Every Apple statement quoted or paraphrased in the letter is backed by an exhibit ID in `templates/evidence-index.csv`.
- `[ ]` App Store Connect screenshots and submission history exports are saved and indexed.
- `[ ]` Resolution Center messages are saved and indexed.
- `[ ]` Counsel or internal approver has confirmed the final text and send method.
- `[ ]` The same final PDF is ready for all intended channels, including courier and App Store Connect if used.

## KFTC Filing Readiness

Mark each item:

- `[ ]` The complainant entity and respondent naming decision are complete in `templates/legal-intake.yaml`.
- `[ ]` Korea nexus facts are complete in `templates/legal-intake.yaml`.
- `[ ]` The conduct chronology is complete in `templates/submission-timeline.csv`.
- `[ ]` The harm record is complete enough to describe competition harm and business harm in `templates/harm-log.csv`.
- `[ ]` Every factual statement in `openstore-kftc-complaint-pack.md` is backed by an exhibit ID in `templates/evidence-index.csv`.
- `[ ]` The final complaint text has been translated into Korean.
- `[ ]` All key Apple messages and key Apple guideline excerpts cited in the complaint have been translated into Korean.
- `[ ]` Signer authority and filing responsibility are confirmed.
- `[ ]` The online filing path is confirmed as `사건신고` unless counsel directs otherwise.

## Blockers That Must Stay Explicit

If any item below is still missing, keep it explicitly marked as missing in the intake file and do not imply it elsewhere:

- Legal entity identity
- Apple Developer account identity
- Submission and rejection dates
- Bundle ID or build number
- Korean complainant entity
- Quantified damages or harm figures

## Minimum Review Trail

Before any external send, record:

- Final document filename
- Final date
- Approver name
- Evidence index version
- Timeline version
- Harm log version
