import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CircleDollarSign,
  ClipboardList,
  HandCoins,
  LayoutDashboard,
  Plus,
  RefreshCw,
  Settings2,
  Users,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

type Borrower = {
  id: string;
  display_id: number;
  name: string;
  phone_number: string | null;
  notes: string | null;
};

type BorrowerBalance = Borrower & {
  total_lent: number | null;
  total_repaid: number | null;
  outstanding: number | null;
};

type Loan = {
  id: string;
  description: string;
  borrower_id: string | null;
  amount: number;
  category: string;
  disbursement_date: string;
};

type Repayment = {
  id: string;
  description: string;
  borrower_id: string | null;
  amount: number;
  category: string;
  repayment_date: string;
};

type CashEntry = {
  id: string;
  description: string;
  amount: number;
  purpose: string | null;
  category: string;
  cash_date: string;
};

type AccountBalance = {
  id: string;
  name: string;
  total_income: number | null;
  total_expense: number | null;
  current_balance: number | null;
};

type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  account_id: string | null;
  month_id: string | null;
  expense_date: string;
};

type Income = {
  id: string;
  description: string;
  amount: number;
  account_id: string | null;
  month_id: string | null;
  income_date: string;
};

type MonthSummary = {
  id: string;
  month: string;
  income: number;
  spent: number;
  savings_goal: number | null;
  saved: number | null;
  savings_percent: number | null;
  status: string | null;
  notes: string | null;
};

const LOAN_CATEGORIES = ['Personal Loan', 'Friend Loan', 'Family Loan', 'Emergency Loan', 'Business Loan'];
const REPAYMENT_CATEGORIES = ['Full Settlement', 'Partial Payment', 'Interest Payment', 'Penalty Fee Collected', 'Late Payment', 'Early Repayment', 'Other Payment'];
const ACCOUNTING_CATEGORIES = ['Food', 'Transportation', 'Subscription', 'Shopping', 'Bank Fees', 'Entertainment', 'Other/P2P', 'Mom', 'Gift', 'Exam/Course', 'Friends', 'Friend'];

const today = () => new Date().toISOString().slice(0, 10);
const money = (value: number | null | undefined) => `₹${Number(value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const dateLabel = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const loanTag: Record<string, string> = {
  'Personal Loan': 'ledger-tag ledger-tag-purple',
  'Friend Loan': 'ledger-tag ledger-tag-blue',
  'Family Loan': 'ledger-tag ledger-tag-red',
  'Emergency Loan': 'ledger-tag ledger-tag-red',
  'Business Loan': 'ledger-tag ledger-tag-orange',
};

const repaymentTag: Record<string, string> = {
  'Full Settlement': 'ledger-tag ledger-tag-yellow',
  'Partial Payment': 'ledger-tag ledger-tag-purple',
  'Interest Payment': 'ledger-tag ledger-tag-blue',
  'Penalty Fee Collected': 'ledger-tag ledger-tag-red',
  'Late Payment': 'ledger-tag ledger-tag-red',
  'Early Repayment': 'ledger-tag ledger-tag-pink',
  'Other Payment': 'ledger-tag ledger-tag-gray',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="space-y-1.5 text-sm"><span className="ledger-muted">{label}</span>{children}</label>;
}

function LedgerInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`ledger-input ${props.className ?? ''}`} />;
}

function LedgerSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`ledger-input ${props.className ?? ''}`} />;
}

function LedgerHeader({ title, eyebrow, action }: { title: string; eyebrow: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="ledger-eyebrow">{eyebrow}</p>
        <h1 className="ledger-title">{title}</h1>
      </div>
      {action}
    </div>
  );
}

function Metric({ label, value, detail, tone = 'default' }: { label: string; value: string; detail?: string; tone?: 'default' | 'positive' | 'purple' }) {
  return (
    <div className={`ledger-metric ledger-metric-${tone}`}>
      <p className="ledger-muted text-xs uppercase tracking-[0.16em]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {detail && <p className="ledger-muted mt-1 text-xs">{detail}</p>}
    </div>
  );
}

function EntryForm({
  borrowers,
  onSaved,
  kind,
}: {
  borrowers: Borrower[];
  onSaved: () => void;
  kind: 'loan' | 'repayment' | 'cash';
}) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [borrowerId, setBorrowerId] = useState('');
  const [category, setCategory] = useState(kind === 'loan' ? LOAN_CATEGORIES[0] : kind === 'repayment' ? REPAYMENT_CATEGORIES[0] : ACCOUNTING_CATEGORIES[0]);
  const [date, setDate] = useState(today());
  const [purpose, setPurpose] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = kind === 'loan' ? 'New disbursed' : kind === 'repayment' ? 'New repayment' : 'New cash entry';

  const reset = () => {
    setDescription(''); setAmount(''); setBorrowerId(''); setDate(today()); setPurpose('');
    setCategory(kind === 'loan' ? LOAN_CATEGORIES[0] : kind === 'repayment' ? REPAYMENT_CATEGORIES[0] : ACCOUNTING_CATEGORIES[0]);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true); setError(null);
    const numericAmount = Number(amount);
    if (!description.trim() || !numericAmount || numericAmount < 0 || !date) {
      setError('Add a description, a positive amount, and a date.'); setSaving(false); return;
    }
    const table = kind === 'loan' ? 'loans_disbursed' : kind === 'repayment' ? 'repayments_received' : 'cash_log';
    const payload = kind === 'loan'
      ? { description: description.trim(), amount: numericAmount, category, disbursement_date: date, borrower_id: borrowerId || null }
      : kind === 'repayment'
        ? { description: description.trim(), amount: numericAmount, category, repayment_date: date, borrower_id: borrowerId || null }
        : { description: description.trim(), amount: numericAmount, category, cash_date: date, purpose: purpose.trim() || null };
    const { error: insertError } = await supabase.from(table).insert(payload as never);
    if (insertError) setError(insertError.message);
    else { reset(); setOpen(false); onSaved(); }
    setSaving(false);
  };

  if (!open) return <Button size="sm" className="ledger-button" onClick={() => setOpen(true)}><Plus />{title}</Button>;

  return (
    <form onSubmit={submit} className="ledger-form ledger-panel mt-4">
      <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-semibold">{title}</h3><Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button></div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Description"><LedgerInput value={description} onChange={e => setDescription(e.target.value)} placeholder="What happened?" autoFocus /></Field>
        <Field label="Amount"><LedgerInput type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" /></Field>
        {kind !== 'cash' && <Field label="Borrower"><LedgerSelect value={borrowerId} onChange={e => setBorrowerId(e.target.value)}><option value="">Unassigned</option>{borrowers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</LedgerSelect></Field>}
        {kind === 'cash' && <Field label="Purpose"><LedgerInput value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Optional context" /></Field>}
        <Field label="Category"><LedgerSelect value={category} onChange={e => setCategory(e.target.value)}>{(kind === 'loan' ? LOAN_CATEGORIES : kind === 'repayment' ? REPAYMENT_CATEGORIES : ACCOUNTING_CATEGORIES).map(item => <option key={item}>{item}</option>)}</LedgerSelect></Field>
        <Field label="Date"><LedgerInput type="date" value={date} onChange={e => setDate(e.target.value)} /></Field>
      </div>
      {error && <p className="ledger-error">{error}</p>}
      <div className="flex justify-end"><Button disabled={saving} className="ledger-button">{saving ? 'Saving…' : 'Save entry'}</Button></div>
    </form>
  );
}

function LedgerSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const links = [
    { to: '/l-edger', label: 'Cold Hard Cash', icon: CircleDollarSign, exact: true },
    { to: '/l-edger/accounting', label: 'Accounting', icon: Wallet },
    { to: '/l-edger/borrowers', label: 'Borrower IDs', icon: Users },
  ];
  return (
    <aside className="ledger-sidebar">
      <Button variant="ghost" size="sm" className="mb-8 justify-start gap-2 px-0 text-inherit hover:bg-transparent" onClick={() => navigate('/')}><ArrowLeft /> Back to CORNER</Button>
      <div className="mb-10"><p className="ledger-mark">L—EDGER</p><p className="ledger-muted mt-2 text-xs">Personal lending & accounting</p></div>
      <nav className="space-y-1">
        {links.map(({ to, label, icon: Icon, exact }) => <NavLink key={to} to={to} end={exact} className={({ isActive }) => `ledger-nav-link ${isActive ? 'ledger-nav-link-active' : ''}`}><Icon />{label}</NavLink>)}
      </nav>
      <div className="mt-auto border-t border-[hsl(var(--ledger-border))] pt-5"><p className="ledger-muted text-xs uppercase tracking-[0.16em]">Ledger desk</p><p className="mt-2 text-sm">Keep every rupee accountable.</p></div>
      <span className="sr-only">Current route: {location.pathname}</span>
    </aside>
  );
}

function Dashboard({ onRefresh }: { onRefresh: () => void }) {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [balances, setBalances] = useState<BorrowerBalance[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [cash, setCash] = useState<CashEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    const [borrowerResult, balanceResult, loanResult, repaymentResult, cashResult] = await Promise.all([
      supabase.from('borrowers').select('id, display_id, name, phone_number, notes').order('display_id'),
      supabase.from('borrower_balances').select('*').order('display_id'),
      supabase.from('loans_disbursed').select('*').order('disbursement_date', { ascending: false }),
      supabase.from('repayments_received').select('*').order('repayment_date', { ascending: false }),
      supabase.from('cash_log').select('*').order('cash_date', { ascending: false }),
    ]);
    const firstError = [borrowerResult, balanceResult, loanResult, repaymentResult, cashResult].find(result => result.error)?.error;
    if (firstError) setError(firstError.message);
    setBorrowers((borrowerResult.data ?? []) as Borrower[]);
    setBalances((balanceResult.data ?? []) as BorrowerBalance[]);
    setLoans((loanResult.data ?? []) as Loan[]);
    setRepayments((repaymentResult.data ?? []) as Repayment[]);
    setCash((cashResult.data ?? []) as CashEntry[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);
  const borrowerName = useMemo(() => new Map(borrowers.map(b => [b.id, b.name])), [borrowers]);
  const totalLent = loans.reduce((sum, row) => sum + Number(row.amount), 0);
  const totalRepaid = repayments.reduce((sum, row) => sum + Number(row.amount), 0);
  const cashTotal = cash.reduce((sum, row) => sum + Number(row.amount), 0);
  const transactions = [
    ...loans.map(row => ({ id: row.id, date: row.disbursement_date, description: row.description, borrower: row.borrower_id ? borrowerName.get(row.borrower_id) : 'Unassigned', amount: row.amount, type: 'Given' })),
    ...repayments.map(row => ({ id: row.id, date: row.repayment_date, description: row.description, borrower: row.borrower_id ? borrowerName.get(row.borrower_id) : 'Unassigned', amount: row.amount, type: 'Received' })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const refresh = () => { void load(); onRefresh(); };

  return <div className="space-y-7">
    <LedgerHeader eyebrow="Cold hard cash" title="The lending desk" action={<div className="flex gap-2"><Button variant="outline" size="sm" className="ledger-outline" onClick={refresh} disabled={loading}><RefreshCw className={loading ? 'animate-spin' : ''} />Refresh</Button><EntryForm borrowers={borrowers} onSaved={refresh} kind="loan" /><EntryForm borrowers={borrowers} onSaved={refresh} kind="repayment" /></div>} />
    {error && <div className="ledger-error-banner"><p>{error}</p><p className="mt-1 text-xs opacity-75">The workspace needs an active signed-in Cloud session to read and write the protected ledger.</p></div>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Money given" value={money(totalLent)} detail={`${loans.length} disbursed entries`} /><Metric label="Repayments" value={money(totalRepaid)} detail={`${repayments.length} received entries`} tone="positive" /><Metric label="Outstanding" value={money(totalLent - totalRepaid)} detail="Given minus received" tone="purple" /><Metric label="Manual cash log" value={money(cashTotal)} detail={`${cash.length} manual entries`} /></div>
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <section className="ledger-panel"><div className="flex items-center justify-between gap-3"><div><p className="ledger-eyebrow">All-in-one</p><h2 className="ledger-section-title">Recent movement</h2></div><ClipboardList className="ledger-icon-muted" /></div>{loading ? <p className="ledger-muted py-10 text-center">Loading ledger…</p> : transactions.length === 0 ? <EmptyState text="No lending movement yet." /> : <div className="ledger-table-wrap mt-5"><table className="ledger-table"><thead><tr><th>Date</th><th>Entry</th><th>Borrower</th><th>Type</th><th className="text-right">Amount</th></tr></thead><tbody>{transactions.map(row => <tr key={`${row.type}-${row.id}`}><td>{dateLabel(row.date)}</td><td className="font-medium">{row.description}</td><td>{row.borrower}</td><td><span className={row.type === 'Given' ? 'ledger-type-given' : 'ledger-type-received'}>{row.type}</span></td><td className="text-right font-semibold">{money(row.amount)}</td></tr>)}</tbody></table></div>}</section>
      <section className="ledger-panel"><p className="ledger-eyebrow">Borrower registry</p><h2 className="ledger-section-title">Active loans</h2><div className="mt-5 space-y-3">{balances.map(row => <div key={row.id} className="ledger-balance-row"><div><p className="font-medium">{row.name}</p><p className="ledger-muted text-xs">ID {row.display_id} · repaid {money(row.total_repaid)}</p></div><p className="font-semibold">{money(row.outstanding)}</p></div>)}{balances.length === 0 && <EmptyState text="No borrowers available." />}</div><NavLink to="/l-edger/borrowers" className="ledger-text-link mt-5 inline-flex items-center gap-1">Open borrower IDs <ArrowUpRight className="h-3.5 w-3.5" /></NavLink></section>
    </div>
    <div className="grid gap-6 lg:grid-cols-2"><section className="ledger-panel"><div className="flex items-center justify-between"><div><p className="ledger-eyebrow">Money given</p><h2 className="ledger-section-title">Disbursed loans</h2></div><HandCoins className="ledger-icon-muted" /></div><MiniRows rows={loans.slice(0, 5).map(row => ({ description: row.description, meta: `${row.borrower_id ? borrowerName.get(row.borrower_id) : 'Unassigned'} · ${dateLabel(row.disbursement_date)}`, amount: money(row.amount), tag: row.category, tagClass: loanTag[row.category] }))} empty="Nothing disbursed yet." /></section><section className="ledger-panel"><div className="flex items-center justify-between"><div><p className="ledger-eyebrow">Repayments</p><h2 className="ledger-section-title">Money received</h2></div><CircleDollarSign className="ledger-icon-muted" /></div><MiniRows rows={repayments.slice(0, 5).map(row => ({ description: row.description, meta: `${row.borrower_id ? borrowerName.get(row.borrower_id) : 'Unassigned'} · ${dateLabel(row.repayment_date)}`, amount: money(row.amount), tag: row.category, tagClass: repaymentTag[row.category] }))} empty="Nothing received yet." /></section></div>
    <section className="ledger-panel ledger-cash-panel"><div className="flex items-center justify-between gap-3"><div><p className="ledger-eyebrow">Manual only</p><h2 className="ledger-section-title">Cash log</h2><p className="ledger-muted mt-1 text-sm">Cash entries stay separate from lending and are never auto-populated.</p></div><EntryForm borrowers={borrowers} onSaved={refresh} kind="cash" /></div><MiniRows rows={cash.slice(0, 5).map(row => ({ description: row.description, meta: `${row.purpose || 'No purpose'} · ${dateLabel(row.cash_date)}`, amount: money(row.amount), tag: row.category, tagClass: 'ledger-tag ledger-tag-purple' }))} empty="No manual cash entries yet." /></section>
  </div>;
}

function MiniRows({ rows, empty }: { rows: Array<{ description: string; meta: string; amount: string; tag: string; tagClass: string }>; empty: string }) {
  if (!rows.length) return <EmptyState text={empty} />;
  return <div className="mt-5 divide-y divide-[hsl(var(--ledger-border))]">{rows.map(row => <div key={`${row.description}-${row.meta}`} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0"><div><p className="font-medium">{row.description}</p><p className="ledger-muted mt-1 text-xs">{row.meta}</p></div><div className="flex items-center gap-3"><span className={row.tagClass}>{row.tag}</span><span className="font-semibold">{row.amount}</span></div></div>)}</div>;
}

function EmptyState({ text }: { text: string }) { return <div className="ledger-empty"><BookOpen className="mx-auto mb-2 h-5 w-5" /><p>{text}</p></div>; }

function BorrowersPage() {
  const [rows, setRows] = useState<BorrowerBalance[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { const { data, error: loadError } = await supabase.from('borrower_balances').select('*').order('display_id'); if (loadError) setError(loadError.message); setRows((data ?? []) as BorrowerBalance[]); }, []);
  useEffect(() => { void load(); }, [load]);
  const updateDisplayId = async (id: string, value: string) => { const displayId = Number(value); if (!displayId) return; setSavingId(id); const { error: updateError } = await supabase.from('borrowers').update({ display_id: displayId }).eq('id', id); if (updateError) setError(updateError.message); else void load(); setSavingId(null); };
  return <div className="space-y-7"><LedgerHeader eyebrow="Borrower registry" title="Borrower IDs" action={<Button variant="outline" className="ledger-outline" onClick={() => void load()}><RefreshCw />Refresh</Button>} />{error && <div className="ledger-error-banner">{error}</div>}<section className="ledger-panel"><p className="ledger-muted mb-5 max-w-2xl text-sm">A sortable registry for names, phone numbers, and the manually assigned IDs that keep the lending desk legible.</p><div className="ledger-table-wrap"><table className="ledger-table"><thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Total lent</th><th>Outstanding</th><th>Reassign</th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td><LedgerInput className="w-20" type="number" min="1" defaultValue={row.display_id} onBlur={e => void updateDisplayId(row.id, e.target.value)} disabled={savingId === row.id} /></td><td className="font-medium">{row.name}</td><td>{row.phone_number || '—'}</td><td>{money(row.total_lent)}</td><td className="font-semibold">{money(row.outstanding)}</td><td className="ledger-muted text-xs">{savingId === row.id ? 'Saving…' : 'Edit ID'}</td></tr>)}</tbody></table></div></section></div>;
}

function AccountingPage() {
  const [accounts, setAccounts] = useState<AccountBalance[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [months, setMonths] = useState<MonthSummary[]>([]);
  const [categories, setCategories] = useState<string[]>(ACCOUNTING_CATEGORIES);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async () => { setRefreshing(true); setError(null); const [a, e, i, m, c] = await Promise.all([supabase.from('account_balances').select('*').order('name'), supabase.from('accounting_expenses').select('*').order('expense_date', { ascending: false }), supabase.from('accounting_incomes').select('*').order('income_date', { ascending: false }), supabase.from('monthly_summary').select('*').order('month', { ascending: false }), supabase.from('accounting_categories').select('name').order('name')]); const firstError = [a, e, i, m, c].find(result => result.error)?.error; if (firstError) setError(firstError.message); setAccounts((a.data ?? []) as AccountBalance[]); setExpenses((e.data ?? []) as Expense[]); setIncomes((i.data ?? []) as Income[]); setMonths((m.data ?? []) as MonthSummary[]); if (c.data?.length) setCategories(c.data.map(row => row.name)); setRefreshing(false); }, []);
  useEffect(() => { void load(); }, [load]);
  const addAccount = async (event: FormEvent) => { event.preventDefault(); if (!name.trim()) return; const { error: insertError } = await supabase.from('accounting_accounts').insert({ name: name.trim() }); if (insertError) setError(insertError.message); else { setName(''); void load(); } };
  return <div className="space-y-7"><LedgerHeader eyebrow="Navigation radar" title="Personal accounting" action={<div className="flex gap-2"><Button variant="outline" className="ledger-outline" onClick={() => void load()} disabled={refreshing}><RefreshCw className={refreshing ? 'animate-spin' : ''} />Refresh</Button><NavLink to="/l-edger"><Button className="ledger-button"><LayoutDashboard />Lending desk</Button></NavLink></div>} />{error && <div className="ledger-error-banner">{error}</div>}<div className="grid gap-3 sm:grid-cols-3"><Metric label="Income entries" value={String(incomes.length)} detail={money(incomes.reduce((sum, row) => sum + Number(row.amount), 0))} tone="positive" /><Metric label="Expense entries" value={String(expenses.length)} detail={money(expenses.reduce((sum, row) => sum + Number(row.amount), 0))} /><Metric label="Accounts" value={String(accounts.length)} detail="Balances computed from linked rows" tone="purple" /></div><div className="grid gap-6 xl:grid-cols-2"><section className="ledger-panel"><div className="flex items-center justify-between"><div><p className="ledger-eyebrow">Accounts</p><h2 className="ledger-section-title">Where money lives</h2></div><Wallet className="ledger-icon-muted" /></div><form onSubmit={addAccount} className="mt-5 flex gap-2"><LedgerInput value={name} onChange={e => setName(e.target.value)} placeholder="Account name" /><Button className="ledger-button" aria-label="Add account"><Plus /></Button></form><div className="mt-5 space-y-2">{accounts.map(account => <div className="ledger-balance-row" key={account.id}><div><p className="font-medium">{account.name}</p><p className="ledger-muted text-xs">In {money(account.total_income)} · Out {money(account.total_expense)}</p></div><p className="font-semibold">{money(account.current_balance)}</p></div>)}{!accounts.length && <EmptyState text="Create your first account." />}</div></section><section className="ledger-panel"><div className="flex items-center justify-between"><div><p className="ledger-eyebrow">Monthly summary</p><h2 className="ledger-section-title">Savings pulse</h2></div><Settings2 className="ledger-icon-muted" /></div><div className="ledger-table-wrap mt-5"><table className="ledger-table"><thead><tr><th>Month</th><th>Income</th><th>Spent</th><th>Saved</th><th>%</th></tr></thead><tbody>{months.map(month => <tr key={month.id}><td className="font-medium">{month.month}</td><td>{money(month.income)}</td><td>{money(month.spent)}</td><td>{money(month.saved)}</td><td>{Number(month.savings_percent ?? 0).toFixed(1)}%</td></tr>)}</tbody></table>{!months.length && <EmptyState text="No monthly summaries yet." />}</div></section></div><div className="grid gap-6 xl:grid-cols-2"><AccountingRows title="Expenses" icon={<ArrowUpRight />} rows={expenses.slice(0, 8).map(row => ({ description: row.description, meta: `${row.category} · ${dateLabel(row.expense_date)}`, amount: money(row.amount), tag: row.category }))} categories={categories} /><AccountingRows title="Incomes" icon={<ArrowUpRight />} rows={incomes.slice(0, 8).map(row => ({ description: row.description, meta: dateLabel(row.income_date), amount: money(row.amount), tag: 'Income' }))} categories={categories} /></div><p className="ledger-muted text-xs">Monthly PDF ingestion is not automatic in this desktop build yet. Use these entry panels as the reliable manual/CSV-ready fallback; cash log stays manual-only.</p></div>;
}

function AccountingRows({ title, icon, rows, categories }: { title: string; icon: React.ReactNode; rows: Array<{ description: string; meta: string; amount: string; tag: string }>; categories: string[] }) {
  return <section className="ledger-panel"><div className="flex items-center justify-between"><div><p className="ledger-eyebrow">{title}</p><h2 className="ledger-section-title">{title === 'Expenses' ? 'Everyday outflow' : 'Money in'}</h2></div><span className="ledger-icon-muted">{icon}</span></div><div className="mt-5 space-y-3">{rows.map(row => <div className="flex items-center justify-between gap-3 border-b border-[hsl(var(--ledger-border))] pb-3" key={`${row.description}-${row.meta}`}><div><p className="font-medium">{row.description}</p><p className="ledger-muted mt-1 text-xs">{row.meta}</p></div><div className="text-right"><p className="font-semibold">{row.amount}</p><span className="ledger-tag ledger-tag-gray mt-1">{row.tag}</span></div></div>)}{!rows.length && <EmptyState text={`No ${title.toLowerCase()} yet.`} />}</div><p className="ledger-muted mt-4 text-xs">Categories available: {categories.join(' · ')}</p></section>;
}

export default function LEdger() {
  const location = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);
  const section = location.pathname.endsWith('/accounting') ? 'accounting' : location.pathname.endsWith('/borrowers') ? 'borrowers' : 'dashboard';
  return <div className="ledger-shell"><LedgerSidebar /><main className="ledger-main"><div className="mx-auto max-w-7xl">{section === 'dashboard' && <Dashboard key={refreshKey} onRefresh={() => setRefreshKey(value => value + 1)} />}{section === 'accounting' && <AccountingPage key={refreshKey} />}{section === 'borrowers' && <BorrowersPage key={refreshKey} />}</div></main></div>;
}