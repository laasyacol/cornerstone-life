# L-EDGER — Build Plan for Cornerstone Life

## Scope
This plan covers only the L-EDGER module for Laasya's personal lending tracker and personal accounting tracker. It does not include, reference, or scaffold anything outside L-EDGER.

## 1. App placement
- Add L-EDGER as a top-level Cornerstone section with its own navigation entry and route at `/l-edger`.
- Keep L-EDGER visually and functionally separate from the existing Lego-palette Cornerstone screens.
- Add `/l-edger` (lending dashboard) and `/l-edger/accounting` (Expenses, Incomes, Accounts, Monthly Summary).

## 2. Data model
Use Lovable Cloud for relational data, foreign keys, row-level access, and computed rollups.

### Borrowers
`borrowers`: `display_id` (manually editable integer), `name`, nullable `notes`, nullable `phone_number`, timestamps.

Seed, in order: Abhishek (1), Gayatri (2), Sasank (3).

### Lending
`loans_disbursed`: description, borrower relation, amount, category (`Personal Loan`, `Friend Loan`, `Family Loan`, `Emergency Loan`, `Business Loan`), disbursement date.

Seed: Abhishek – Dec 2024 Loan (₹2000, Personal Loan, 04/12/2024); Sasank – Feb 2025 Loan (₹500, Friend Loan, 08/02/2025); Gayatri – Jul 2025 Loan (₹2000, Personal Loan, 30/07/2025); Unnamed – Dec 2025 Loan (unassigned, ₹1500, Personal Loan, 15/12/2025).

`repayments_received`: description, borrower relation, amount, category (`Full Settlement`, `Partial Payment`, `Interest Payment`, `Penalty Fee Collected`, `Late Payment`, `Early Repayment`, `Other Payment`), date.

Seed: Sasank – Full Return (₹500, Full Settlement, 28/07/2025); Abhishek – Partial Rcvd (₹2500, Partial Payment, 26/08/2025).

`cash_log`: description, amount, nullable purpose, shared accounting expense category, date. This is manual-entry only.

### Accounting
`monthly_summary`: month, income, spent, savings goal, generated saved amount, generated savings percent, nullable status and notes.

`accounting_expenses`: description, amount, shared category list (`Food`, `Transportation`, `Subscription`, `Shopping`, `Bank Fees`, `Entertainment`, `Other/P2P`, `Mom`, `Gift`, `Exam/Course`, `Friends`, `Friend`), account relation, month relation, date.

`accounting_incomes`: description, amount, account relation, month relation, date.

`accounting_accounts`: name. Totals and current balance are computed from accounting income/expense relations rather than manually entered.

## 3. Rollups
- Add `borrower_balances` view: total lent, total repaid, and outstanding per borrower.
- Add account balance rollups from linked accounting rows.
- Compute monthly saved amount and savings percentage from monthly income and spending.
- Compute Cash Log total as a sum, never as a stored duplicate.

## 4. Pages and layout
### `/l-edger`
- Red-themed L-EDGER dashboard with actions for New Disbursed and New Repayment.
- Left rail links: Cold Hard Cash, Cash-to-UPI Conversions (optional and excluded until explicitly requested), Monthly Summary, Accounting, Rules and Boundaries, Borrower IDs.
- All-in-one combined lending table sorted newest first.
- Borrowers & Active Loans cards from `borrower_balances`.
- Money Given, Repayments, and manual Cash Log panels.

### `/l-edger/accounting`
- Red Navigation Radar with link to Accounts.
- Expenses, Incomes, Accounts panels.
- Monthly Summary table.

### Borrower IDs
- Sortable display of Name, Phone Number, and display ID, ascending by display ID.

## 5. Visual system
- L-EDGER uses a red accent theme only inside `/l-edger/**`.
- Headings, callouts, and borders use the red theme.
- Category colors follow the mappings in the source brief, with no green category badges.
- Cash Log may use a purple highlight to distinguish manual entries.
- Existing Cornerstone pages retain their Lego palette.

## 6. Explicit exclusions
- Do not create or reference Bread n Butter.
- Do not create a second-person expense tracker.
- Do not invent categories, borrowers, or accounts beyond the listed model unless requested.
- Do not build Cash-to-UPI Conversions until explicitly requested.

## 7. Ongoing transaction workflow
- Monthly transaction PDFs should eventually be parsed into accounting expenses/incomes tagged to the matching month and used to update the monthly summary.
- If chat-to-database ingestion is not available, provide an in-app UI or CSV import instead and flag that limitation.
- Cash Log entries always remain manual UI entries and are never auto-populated.
