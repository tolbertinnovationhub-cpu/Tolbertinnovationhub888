# Manual Click-Through QA Note

Date: 2026-03-11
Status: PASS

## Scope
Validated the end-to-end learning journey for all guided courses:
- Learning Hub → Course page → Start Learning page
- Start Learning completion block → Certificate Request page
- Start Learning completion block → Course certificate template download

## Method
This pass used route/link verification and on-disk path existence checks (static QA method) plus the latest full site QA script result.

## Result
Status: PASS

- Learning Hub Start Learning buttons route to expected course/start-learning destinations.
- Course page Start Learning buttons route to matching guided flow pages.
- Guided flow completion block includes both:
  - Request Certificate - $5 (certificate-request.html)
  - Download Certificate (course-specific template in materials/)
- All expected pages and certificate templates exist on disk.
- Latest full QA remains clean:
  - HTML scanned: 131
  - Broken refs: 0
  - Missing hashes: 0

## Courses Covered (12)
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

## Notes
- No broken flow links detected in this pass.
- No edits were required to production pages.
