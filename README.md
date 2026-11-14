# Beit Gedy – AI-assisted exam assessment (Grades 1–5)

CSEN 909 Human Computer Interaction (GUC, Winter 2026) · Team **Beit Gedy** · Milestone 3 optional coded front end.

A working HTML/CSS/JavaScript version of our Figma prototype. A student photographs a handwritten exam. The (mock) AI reads it and suggests grades, learning gaps and red flags. The **teacher checks and decides every step** before anything is released to the student or parent.

> Mock OCR and AI, as the project brief allows: the extracted text, suggested marks, feedback and flags are hard-coded in `js/data.js`. The **photo quality check is real**: it runs in the browser on the photo you take.

## Run it locally

No build step and no dependencies.

**Option A – open the file:** download or clone the repository and open `index.html` in Chrome, Edge, Firefox or Safari.

**Option B – local server (recommended, for the camera on phones):**

```bash
git clone <this-repo-url>
cd <repo-folder>
python3 -m http.server 8000        # or: npx serve .
```

Then open <http://localhost:8000>.

Fonts (Lexend, Patrick Hand) load from Google Fonts. Without internet the page falls back to system fonts and still works.

## Test the whole story (about 5 minutes)

All three views share one state in the browser's `localStorage`. Open the student and teacher views in **two tabs** and they update each other live. Use **“Reset the demo”** on the start page to begin again.

1. **Student (tablet)** – *Student* → **Omar** → secret pictures **🐱 ☀️ 🍎 🚗** → **Send**.
   - Tick the three checks, then take a photo of each page. Use the camera/file picker, or **“Use a sample page (demo)”**.
   - Try **“Try a blurry photo (demo)”**: the quality check rejects blurry or dark photos and asks for a retake.
   - Confirm **“Is this page 1?”**, reorder, delete or add pages, then **Submit**. The status tracker shows *Sent → Teacher is checking*.
2. **Teacher (desktop)** – *Teacher* → **Sign in** (pre-filled) → **Animals quiz**.
   - **Spotlight check** (riskiest answers first). Q6 is hard to read. Q1 “looks too perfect”: the AI read *plants*, but Omar wrote *meat*. Q7 is written on two lines. For each one: edit the text, ask Omar, or request a new photo of one page.
   - **Approve text for grading** → the AI suggests marks.
   - **Keep and add to mark scheme** (Q3). **Change mark** on Q7 (a reason is required).
   - **Approve feedback** → **Why this flag?** (evidence from two exams, evidence strength, extra-help log) → **Confirm red flag** (emails the parent and supervisor).
   - **Practice and comment** → **Release results**. This is the only checkpoint before anything reaches Omar or his parent.
3. **Student** – Omar now sees **8 / 10**, his skills, the confirmed flag, **My mistakes** (with 🔊 read-aloud) and **Practice** (right/wrong feedback with hints).
4. **Parent (phone)** – *Parent* → **Sign in**. You see only teacher-released results, the red flag with Ms. Sara’s note and the evidence, and whether practice is done.
   - Switch between children (Omar, Grade 4 / Lina, Grade 2).
   - Choose the app language (English / Deutsch) separately from the exam language.
5. **Grade 1–2 child** – *Student* → **Lina** → **⭐ 🍎 🐱 🌳**. She gets stars instead of marks, big picture tiles, read-aloud and a picture game. Uploads go through a grown-up.

Every screen has an **EN/DE** interface switch.

## What is implemented

| Area | Features |
|---|---|
| Student (tablet) | Picture-password sign-in; guided upload (checklist, camera frame, **real blur/darkness check**, “Is this page N?”, reorder/delete/add pages, confirm); status tracker; results only after release; mark and progress (Grades 3–5) or stars (Grades 1–2); mistakes with read-aloud; practice with hints; messages; “Ask teacher” |
| Teacher (desktop) | Dashboard with per-child status and reminders; editable mark scheme; spotlight verification (scan next to the extracted text, edit, ask the student, request a new photo of one page); approve for grading; AI grade review with required override reasons; feedback editing; learning gaps per child and per class; “Why this flag?” evidence; confirm/dismiss red flags; log extra help; practice and comment; release checklist; student history |
| Parent (phone, bonus) | Linked children with a switcher; display language (EN/DE); released results in Science and Math, progress, red flags and “needs more practice: yes / no” only; teacher note and evidence; home practice status |
| Across the system | Role-based sign-in; EN/DE interface; Science and Math; responsive layouts (tablet, desktop, phone); keyboard focus styles; reduced-motion support |

## Project structure

```
index.html          entry point
css/styles.css      design tokens and layouts (same colours and fonts as the Figma prototype)
js/data.js          mock exam, OCR output, AI suggestions, history
js/i18n.js          EN/DE (and parent Arabic) strings
js/store.js         shared state in localStorage, live sync between tabs
js/quality.js       photo checks (brightness, Laplacian-variance sharpness) and demo pages
js/ui.js            helpers: modal, toast, read-aloud, status tracker
js/student.js       student view
js/teacher.js       teacher view
js/parent.js        parent view
js/app.js           hash router and event wiring
```

## Links

- Figma prototype (all views): see our Milestone 3 submission
- HTA / HTD board: see our Milestone 3 submission

## AI use

Built with help from Claude (Anthropic), based on our proposal, interview, HTAs/HTDs and Figma prototype. The team reviewed and tested the result. The chat history is submitted with the milestone, as the course requires.
