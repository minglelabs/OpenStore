# OpenStore KFTC Complaint Pack

This document is the English-source working packet for a Korea Fair Trade Commission complaint concerning Apple and OpenStore. It is not legal advice. The final filing and key exhibits should be translated into Korean before submission.

## Filing Goal

Prepare a complaint record that can be turned into a Korean filing quickly if Apple rejects, delays, or selectively burdens OpenStore in a way that plausibly harms competition, developer choice, or user choice in Korea.

## Current Safe Theory

The safest current theory, based on the repository alone, is not that Apple has already committed a proven violation. The safer theory is:

- OpenStore is a nascent competitive marketplace project.
- Apple controls critical distribution access points for iOS app distribution.
- If Apple uses opaque, shifting, selectively enforced, or pretextual review conduct to block OpenStore, that conduct may support a Korean competition complaint.
- The Korean complaint should focus on harm to competition, innovation, developer choice, and user choice, not merely harm to one company.

## Official KFTC Workflow Re-Checked on 2026-03-20

The KFTC online case system pages currently show:

- Main page: <https://case.ftc.go.kr/main.do>
- Filing-method page: <https://case.ftc.go.kr/ocp/co/rcenoMth.do>
- Process-overview page: <https://case.ftc.go.kr/ocp/co/caseProcss.do>

The filing-method page states that, after logging in, the user goes to `사건신고/진행`, clicks the `사건신고하기` button from the case list, selects the case type, enters complainant and case information, and then submits the filing after completing all required items.

The process-overview page lists the case flow as:

1. Recognition stage
2. Investigation and review stage
3. Deliberation and decision stage
4. Result notice and appeal stage

The official KFTC consultation line shown on the current site is `1670-0007`.

## Filing Choice

For an OpenStore dispute where the complainant directly experienced Apple's conduct, the packet should be prepared for `사건신고`, not `사건제보`.

Do not file until:

- `templates/legal-intake.yaml` is complete for complainant, respondent, and Korea nexus fields
- `templates/evidence-index.csv` assigns exhibit IDs to each cited document
- `send-readiness-checklist.md` is complete for the KFTC section
- the final complaint and key exhibits have been translated into Korean

## Complaint Draft Structure

Use the following as the working English source, then translate and adapt with Korean counsel.

### 1. Parties

- Complainant: `[Korean complainant entity or foreign entity with Korean nexus]`
- Respondent: `[Confirm whether to name Apple Inc., Apple Korea, or both]`

### 2. Product Description

OpenStore is an open source alternative app marketplace project. The current repository contains an initial storefront prototype with discovery, app detail, search, library, account, review, and reporting surfaces. The project direction is to evolve into a fuller marketplace product over time.

### 3. Market and Control Points

Draft only from provable facts:

- Apple controls access to iOS app distribution through its developer program, review process, contractual terms, and technical gatekeeping.
- For Korean developers and Korean users who depend on iOS distribution, those control points can materially affect competition in app distribution and app discovery.
- OpenStore is a potential competitive constraint on Apple's storefront and distribution position.

### 4. Conduct at Issue

Insert only dated source-backed facts:

- Submission date(s): `[date]`
- Build number(s): `[build]`
- Bundle ID(s): `[bundle id]`
- Apple review or delay events: `[dated event list]`
- Apple rationale quoted or summarized from source documents: `[exact text]`

### 5. Why the Conduct Is Competition-Relevant

Use points that can be supported by evidence:

- The conduct blocked or burdened the launch of a competing marketplace project.
- The conduct reduced potential user choice and developer choice.
- The conduct increased delay, engineering cost, and market-entry risk.
- If Apple gave shifting, inconsistent, or pretextual reasons, that pattern supports the inference that the conduct was not a neutral safety or technical measure.

### 6. Korea Nexus

Add concrete facts such as:

- Korean complainant entity or Korean operations
- Korean developer targets, Korean user targets, or Korean language support
- Korean launch plan, partnerships, investors, or business pipeline
- Harm to Korean developers or Korean users caused by Apple-related delay

### 7. Requested Relief

Keep the relief request practical:

- Accept and investigate the complaint promptly
- Require Apple to explain the precise basis for the challenged conduct
- Examine whether Apple applied its review rules consistently
- Preserve relevant evidence
- Take any corrective action the KFTC finds appropriate under Korean law

## Exhibit Set To Prepare

- Corporate records for the complainant
- OpenStore product record
- App submission timeline
- App Store Connect screenshots
- Resolution Center or review messages
- Apple guideline excerpts cited by Apple
- Comparable-product examples, if any
- Harm log
- Korean chronology with exact dates

## Translation and Filing Readiness Checklist

- Translate the complaint itself into Korean
- Translate all Apple review messages that matter to the theory
- Translate the OpenStore product description used in the filing
- Translate any key Apple guideline excerpt cited in the dispute
- Confirm the named respondent and Korean address details
- Confirm the complainant's signer authority
- Confirm that the online filing will be made as `사건신고`

## Required Companion Files

- `templates/legal-intake.yaml`
- `templates/evidence-index.csv`
- `templates/submission-timeline.csv`
- `templates/harm-log.csv`
- `send-readiness-checklist.md`

## Practical Notes

- Do not file until the chronology, exhibit IDs, and cited facts all line up.
- Do not rely on broad conclusions without dated supporting records.
- If Apple's conduct is still unfolding, keep the complaint draft live and update it after each Apple communication rather than rewriting from scratch.
