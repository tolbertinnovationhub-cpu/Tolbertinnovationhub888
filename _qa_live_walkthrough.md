# Live Walkthrough QA Note

Date: 2026-03-11
Local server: http://127.0.0.1:5500
Status: PASS

## Scope
Validated live route behavior for the learning journey:
- Learning Hub
- All course pages
- All guided start-learning pages
- Certificate request page

## Method
Started a local static server and executed live HTTP checks for route availability and expected content markers.

Checks Performed:
- HTTP status code = 200 for each target route
- Guided lessons include `Download Certificate`
- Guided lessons include `certificate-request.html` link target

## Result
Status: PASS

- Total URLs tested: 26
- HTTP 200 responses: 26/26
- Non-OK routes: none
- Guided lesson pages with `Download Certificate`: 12/12
- Guided lesson pages with certificate request link: 12/12

## Routes Covered
- Learning Hub: `/learning/`
- Courses: IELTS, TOEFL, Scholarship, Website Development, Computer Basics, Digital Marketing, Leadership Development, Agriculture, Construction, Hospitality, Business Startup, Study Abroad
- Guided flows: all 12 `lessons/*/start-learning/` pages
- Certificate request: `/certificate-request.html`

## Conclusion
Live local walkthrough checks are clean. No regressions detected in end-to-end learning and certificate routing.
