# Tolbert Innovation Hub Website

Static website project for Tolbert Innovation Hub, including the public website, classroom pages, learning hub, and course/lesson flows.

## Run Site QA

Use the reusable PowerShell script to check:
- broken local `href` / `src` file references
- missing hash-anchor targets (for links like `page.html#section-id`)

From project root:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; .\run-site-qa.ps1
```

Outputs:
- `_qa_summary.md`
- `_qa_summary.json`

A non-zero exit code is returned when broken links or missing hash targets are found.
