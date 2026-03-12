# Release Readiness QA Checklist

Date: 2026-03-11
Status: PASS

## Validation Sources
This release sign-off consolidates:
- Manual click-through QA (`_qa_manual_clickthrough.md`)
- Live local walkthrough QA (`_qa_live_walkthrough.md`)
- Latest full site QA script output (`_qa_summary.md`, `_qa_summary.json`)

## Scope Covered
- Learning Hub routing
- Course page routing
- Guided start-learning flows
- Completion-to-certificate request routing
- Completion-to-certificate template downloads
- Link/hash integrity across the site

## Release Checklist
- [x] Learning Hub Start Learning links point to expected destinations
- [x] Course Start Learning links point to matching guided flows
- [x] All guided flow completion blocks include:
  - [x] Certificate request link (`certificate-request.html`)
  - [x] Course-specific certificate template download link
- [x] All expected pages and template files exist on disk
- [x] Full site QA clean (`HTML scanned: 131`, `Broken refs: 0`, `Missing hashes: 0`)
- [x] Live local walkthrough clean (`26/26` routes returned HTTP 200)
- [x] Guided lesson pages include certificate markers (`12/12` for request + download)

## Courses Included (12)
1. IELTS Preparation
2. TOEFL Preparation
3. Scholarship Application Training
4. Website Development
5. Computer Basics
6. Digital Marketing Essentials
7. Leadership Development
8. Agriculture Fundamentals
9. Construction Safety & Basics
10. Hospitality Service Skills
11. Business Startup Training
12. Study Abroad Readiness

## Final Sign-Off
No routing regressions or certificate-flow issues were detected in static or live verification passes. The learning and certification journey is release-ready.

## Deployment Notes

### Local run command
- `python -m http.server 5500`

### Smoke-test URLs
- `http://127.0.0.1:5500/learning/`
- `http://127.0.0.1:5500/courses/ielts-preparation/`
- `http://127.0.0.1:5500/courses/toefl-preparation/`
- `http://127.0.0.1:5500/courses/scholarship-application-training/`
- `http://127.0.0.1:5500/courses/website-development/`
- `http://127.0.0.1:5500/courses/computer-basics/`
- `http://127.0.0.1:5500/courses/digital-marketing-essentials/`
- `http://127.0.0.1:5500/courses/leadership-development/`
- `http://127.0.0.1:5500/courses/agriculture-fundamentals/`
- `http://127.0.0.1:5500/courses/construction-safety-basics/`
- `http://127.0.0.1:5500/courses/hospitality-service-skills/`
- `http://127.0.0.1:5500/courses/business-startup-training/`
- `http://127.0.0.1:5500/courses/study-abroad-readiness/`
- `http://127.0.0.1:5500/certificate-request.html`

### Rollback checklist
- Revert changed files to the last known-good commit.
- Re-run `./run-site-qa.ps1` (or `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; ./run-site-qa.ps1` if needed).
- Confirm `_qa_summary.md` reports `Broken refs: 0` and `Missing hashes: 0`.
- Re-validate the smoke-test URLs above return HTTP 200.

## Go/No-Go Approval

Release Decision: GO / NO-GO

- Release Owner: Tolbert Innovation Hub - Program Lead (Name)
- QA Owner: Tolbert Innovation Hub - QA Lead (Name)
- Engineering Owner: Tolbert Innovation Hub - Engineering Lead (Name)
- Approval Date: 2026-03-11
- Notes: Final approver to mark GO or NO-GO and add release-specific remarks.

Sign-Off:
- Release Owner Signature: ____________________
- QA Owner Signature: ____________________
- Engineering Owner Signature: ____________________
