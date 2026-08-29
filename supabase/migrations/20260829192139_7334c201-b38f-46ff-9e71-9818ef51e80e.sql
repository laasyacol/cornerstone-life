CREATE TABLE public.borrowers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_id integer NOT NULL,
  name text NOT NULL,
  notes text,
  phone_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT borrowers_display_id_positive CHECK (display_id > 0),
  CONSTRAINT borrowers_name_unique UNIQUE (name),
  CONSTRAINT borrowers_display_id_unique UNIQUE (display_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.borrowers TO authenticated;
GRANT ALL ON public.borrowers TO service_role;
ALTER TABLE public.borrowers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage borrowers" ON public.borrowers FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.accounting_categories (
  name text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.accounting_categories TO authenticated;
GRANT ALL ON public.accounting_categories TO service_role;
ALTER TABLE public.accounting_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read accounting categories" ON public.accounting_categories FOR SELECT TO authenticated USING (true);

CREATE TABLE public.loans_disbursed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  borrower_id uuid REFERENCES public.borrowers(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL,
  category text NOT NULL,
  disbursement_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT loans_disbursed_amount_positive CHECK (amount >= 0),
  CONSTRAINT loans_disbursed_category_valid CHECK (category IN ('Personal Loan', 'Friend Loan', 'Family Loan', 'Emergency Loan', 'Business Loan'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.loans_disbursed TO authenticated;
GRANT ALL ON public.loans_disbursed TO service_role;
ALTER TABLE public.loans_disbursed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage disbursed loans" ON public.loans_disbursed FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.repayments_received (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  borrower_id uuid REFERENCES public.borrowers(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL,
  category text NOT NULL,
  repayment_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT repayments_received_amount_positive CHECK (amount >= 0),
  CONSTRAINT repayments_received_category_valid CHECK (category IN ('Full Settlement', 'Partial Payment', 'Interest Payment', 'Penalty Fee Collected', 'Late Payment', 'Early Repayment', 'Other Payment'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repayments_received TO authenticated;
GRANT ALL ON public.repayments_received TO service_role;
ALTER TABLE public.repayments_received ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage repayments" ON public.repayments_received FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.monthly_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month text NOT NULL,
  income numeric(12,2) NOT NULL DEFAULT 0,
  spent numeric(12,2) NOT NULL DEFAULT 0,
  savings_goal numeric(12,2),
  saved numeric(12,2) GENERATED ALWAYS AS (income - spent) STORED,
  savings_percent numeric(7,2) GENERATED ALWAYS AS (CASE WHEN income = 0 THEN 0 ELSE ((income - spent) / income) * 100 END) STORED,
  status text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT monthly_summary_month_unique UNIQUE (month),
  CONSTRAINT monthly_summary_income_nonnegative CHECK (income >= 0),
  CONSTRAINT monthly_summary_spent_nonnegative CHECK (spent >= 0),
  CONSTRAINT monthly_summary_goal_nonnegative CHECK (savings_goal IS NULL OR savings_goal >= 0)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.monthly_summary TO authenticated;
GRANT ALL ON public.monthly_summary TO service_role;
ALTER TABLE public.monthly_summary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage monthly summaries" ON public.monthly_summary FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.accounting_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounting_accounts TO authenticated;
GRANT ALL ON public.accounting_accounts TO service_role;
ALTER TABLE public.accounting_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage accounting accounts" ON public.accounting_accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.accounting_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  amount numeric(12,2) NOT NULL,
  category text NOT NULL REFERENCES public.accounting_categories(name) ON UPDATE CASCADE,
  account_id uuid REFERENCES public.accounting_accounts(id) ON DELETE SET NULL,
  month_id uuid REFERENCES public.monthly_summary(id) ON DELETE SET NULL,
  expense_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT accounting_expenses_amount_positive CHECK (amount >= 0)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounting_expenses TO authenticated;
GRANT ALL ON public.accounting_expenses TO service_role;
ALTER TABLE public.accounting_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage accounting expenses" ON public.accounting_expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.accounting_incomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  amount numeric(12,2) NOT NULL,
  account_id uuid REFERENCES public.accounting_accounts(id) ON DELETE SET NULL,
  month_id uuid REFERENCES public.monthly_summary(id) ON DELETE SET NULL,
  income_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT accounting_incomes_amount_positive CHECK (amount >= 0)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounting_incomes TO authenticated;
GRANT ALL ON public.accounting_incomes TO service_role;
ALTER TABLE public.accounting_incomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage accounting incomes" ON public.accounting_incomes FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.cash_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  amount numeric(12,2) NOT NULL,
  purpose text,
  category text NOT NULL REFERENCES public.accounting_categories(name) ON UPDATE CASCADE,
  cash_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cash_log_amount_positive CHECK (amount >= 0)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cash_log TO authenticated;
GRANT ALL ON public.cash_log TO service_role;
ALTER TABLE public.cash_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage cash log" ON public.cash_log FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_l_edger_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER borrowers_updated_at BEFORE UPDATE ON public.borrowers FOR EACH ROW EXECUTE FUNCTION public.set_l_edger_updated_at();
CREATE TRIGGER loans_disbursed_updated_at BEFORE UPDATE ON public.loans_disbursed FOR EACH ROW EXECUTE FUNCTION public.set_l_edger_updated_at();
CREATE TRIGGER repayments_received_updated_at BEFORE UPDATE ON public.repayments_received FOR EACH ROW EXECUTE FUNCTION public.set_l_edger_updated_at();
CREATE TRIGGER monthly_summary_updated_at BEFORE UPDATE ON public.monthly_summary FOR EACH ROW EXECUTE FUNCTION public.set_l_edger_updated_at();
CREATE TRIGGER accounting_accounts_updated_at BEFORE UPDATE ON public.accounting_accounts FOR EACH ROW EXECUTE FUNCTION public.set_l_edger_updated_at();
CREATE TRIGGER accounting_expenses_updated_at BEFORE UPDATE ON public.accounting_expenses FOR EACH ROW EXECUTE FUNCTION public.set_l_edger_updated_at();
CREATE TRIGGER accounting_incomes_updated_at BEFORE UPDATE ON public.accounting_incomes FOR EACH ROW EXECUTE FUNCTION public.set_l_edger_updated_at();
CREATE TRIGGER cash_log_updated_at BEFORE UPDATE ON public.cash_log FOR EACH ROW EXECUTE FUNCTION public.set_l_edger_updated_at();

INSERT INTO public.accounting_categories (name) VALUES
  ('Food'), ('Transportation'), ('Subscription'), ('Shopping'), ('Bank Fees'), ('Entertainment'), ('Other/P2P'), ('Mom'), ('Gift'), ('Exam/Course'), ('Friends'), ('Friend')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.borrowers (display_id, name) VALUES
  (1, 'Abhishek'), (2, 'Gayatri'), (3, 'Sasank')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.loans_disbursed (description, borrower_id, amount, category, disbursement_date) VALUES
  ('Abhishek – Dec 2024 Loan', (SELECT id FROM public.borrowers WHERE name = 'Abhishek'), 2000, 'Personal Loan', '2024-12-04'),
  ('Sasank – Feb 2025 Loan', (SELECT id FROM public.borrowers WHERE name = 'Sasank'), 500, 'Friend Loan', '2025-02-08'),
  ('Gayatri – Jul 2025 Loan', (SELECT id FROM public.borrowers WHERE name = 'Gayatri'), 2000, 'Personal Loan', '2025-07-30'),
  ('Unnamed – Dec 2025 Loan', NULL, 1500, 'Personal Loan', '2025-12-15');

INSERT INTO public.repayments_received (description, borrower_id, amount, category, repayment_date) VALUES
  ('Sasank – Full Return', (SELECT id FROM public.borrowers WHERE name = 'Sasank'), 500, 'Full Settlement', '2025-07-28'),
  ('Abhishek – Partial Rcvd', (SELECT id FROM public.borrowers WHERE name = 'Abhishek'), 2500, 'Partial Payment', '2025-08-26');

CREATE OR REPLACE VIEW public.borrower_balances AS
SELECT
  b.id,
  b.display_id,
  b.name,
  b.phone_number,
  COALESCE(l.total_lent, 0)::numeric AS total_lent,
  COALESCE(r.total_repaid, 0)::numeric AS total_repaid,
  (COALESCE(l.total_lent, 0) - COALESCE(r.total_repaid, 0))::numeric AS outstanding
FROM public.borrowers b
LEFT JOIN (
  SELECT borrower_id, SUM(amount) AS total_lent
  FROM public.loans_disbursed
  WHERE borrower_id IS NOT NULL
  GROUP BY borrower_id
) l ON l.borrower_id = b.id
LEFT JOIN (
  SELECT borrower_id, SUM(amount) AS total_repaid
  FROM public.repayments_received
  WHERE borrower_id IS NOT NULL
  GROUP BY borrower_id
) r ON r.borrower_id = b.id;
GRANT SELECT ON public.borrower_balances TO authenticated;
GRANT SELECT ON public.borrower_balances TO service_role;

CREATE OR REPLACE VIEW public.account_balances AS
SELECT
  a.id,
  a.name,
  COALESCE(i.total_income, 0)::numeric AS total_income,
  COALESCE(e.total_expense, 0)::numeric AS total_expense,
  (COALESCE(i.total_income, 0) - COALESCE(e.total_expense, 0))::numeric AS current_balance
FROM public.accounting_accounts a
LEFT JOIN (
  SELECT account_id, SUM(amount) AS total_income
  FROM public.accounting_incomes
  WHERE account_id IS NOT NULL
  GROUP BY account_id
) i ON i.account_id = a.id
LEFT JOIN (
  SELECT account_id, SUM(amount) AS total_expense
  FROM public.accounting_expenses
  WHERE account_id IS NOT NULL
  GROUP BY account_id
) e ON e.account_id = a.id;
GRANT SELECT ON public.account_balances TO authenticated;
GRANT SELECT ON public.account_balances TO service_role;