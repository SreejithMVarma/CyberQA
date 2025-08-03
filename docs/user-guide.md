# CyberQA Admin Guide

## Login
- Visit `/login` and enter your admin email and password.
- Redirects to `/admin` on successful login.

## Manage Questions
- Navigate to `/admin` to access the Admin Dashboard.
- **Create Question**:
  - Fill in the form with:
    - **Question Text**: The question content (required).
    - **Type**: Select `multiple-choice`, `open-ended`, or `code` (required).
    - **Cipher Type**: Optional cipher type (e.g., AES, RSA).
    - **Difficulty**: Select `easy`, `medium`, or `hard` (required).
    - **Tags**: Enter comma-separated tags (e.g., `crypto,network,security`). Leave blank for no tags.
    - **Expected Answer**: The correct answer (required).
    - **Test Cases**: Optional input/output pairs for code questions.
    - **Source**: Optional source attribution.
    - **Image**: Upload a JPEG/PNG image via file picker, camera (on mobile), or drag-and-drop.
  - Click "Create Question" to save.
- **Edit Question**:
  - Click "Edit" on a question in the table.
  - Update fields and click "Update Question".
  - Click "Cancel" to discard changes.
- **Delete Question**:
  - Click "Delete" on a question in the table to remove it.

## Verify Answers
- In the "Pending Answers" table, view pending answers with username, question text, and answer content.
- Actions:
  - **Verify**: Mark as `verified` to approve and award XP.
  - **Suggest Changes**: Enter comments and mark as `rejected` for user resubmission.
  - **Reject**: Mark as `rejected` without comments.

## Logout
- Click "Logout" in the navbar to end your session.