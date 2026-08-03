/**
 * Add a school — manual onboarding for tenants that never filled the demo form.
 *
 * Three steps and a review: school profile → admin account → plan and trial.
 * The tenant code and subdomain are suggested from the school name and stay
 * editable, and the admin is created as SCHOOL_ADMIN scoped to the new tenant —
 * never SUPER_ADMIN, which is the bug that shipped through DemoService.
 *
 * Data: MOCK. Wire to POST /schools when it exists.
 */
import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Building2, User, Layers, Check, Globe, ShieldCheck,
  Mail, Sparkles, AlertCircle,
} from 'lucide-react';
import {
  PageHeader, SectionCard, Badge, FormSection, Field, TextInput, TextArea,
  SelectInput, SegmentedInput, Toast, useToast, DemoChip,
} from '../../../shared/ui';
import { plans, schools } from '../../../platform/data/mock';
import { taka, toSubdomain, toCode } from '../format';

const DISTRICTS = [
  'Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet',
  'Rangpur', 'Mymensingh', 'Cumilla', 'Faridpur', 'Gazipur', 'Narayanganj',
];

const STEPS = [
  { key: 1, label: 'School profile', icon: Building2 },
  { key: 2, label: 'Admin account', icon: User },
  { key: 3, label: 'Plan & trial', icon: Layers },
  { key: 4, label: 'Review', icon: Check },
];

interface State {
  name: string; code: string; subdomain: string; district: string;
  address: string; phone: string; email: string; established: string;
  adminName: string; adminEmail: string; adminPhone: string;
  sendSetupEmail: boolean; mustChangePassword: boolean;
  plan: string; trialDays: string; billingStart: string; notes: string;
}

const EMPTY: State = {
  name: '', code: '', subdomain: '', district: 'Dhaka',
  address: '', phone: '', email: '', established: '',
  adminName: '', adminEmail: '', adminPhone: '',
  sendSetupEmail: true, mustChangePassword: true,
  plan: 'TRIAL', trialDays: '30', billingStart: '', notes: '',
};

const isPhone = (v: string) => /^(\+?880)?0?1[3-9]\d{8}$/.test(v.replace(/[\s-]/g, ''));
const isEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v.trim());

export const AddSchoolPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast, notify, clear } = useToast();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<State>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof State, string>>>({});
  const [creating, setCreating] = useState(false);

  const set = <K extends keyof State>(k: K, v: State[K]) => {
    setForm((f) => {
      const next = { ...f, [k]: v };
      // Suggest the code and subdomain from the name until they are touched.
      if (k === 'name') {
        if (!f.subdomain || f.subdomain === toSubdomain(f.name)) next.subdomain = toSubdomain(String(v));
        if (!f.code || f.code.startsWith(toCode(f.name))) next.code = toCode(String(v));
      }
      return next;
    });
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const subdomainTaken = useMemo(
    () => form.subdomain.length > 0 && schools.some((s) => s.subdomain === form.subdomain.toLowerCase()),
    [form.subdomain],
  );

  const validateStep = (s: number) => {
    const e: Partial<Record<keyof State, string>> = {};
    if (s === 1) {
      if (!form.name.trim()) e.name = 'The school name is required.';
      if (!form.code.trim()) e.code = 'A tenant code is required.';
      else if (!/^[A-Z]{2,4}$/.test(form.code.trim())) e.code = 'Two to four capital letters.';
      if (!form.subdomain.trim()) e.subdomain = 'A subdomain is required.';
      else if (!/^[a-z0-9-]{3,30}$/.test(form.subdomain)) e.subdomain = 'Lowercase letters, digits and hyphens only.';
      else if (subdomainTaken) e.subdomain = 'That subdomain is already in use.';
      if (form.email && !isEmail(form.email)) e.email = 'That does not look like an email address.';
      if (form.phone && !isPhone(form.phone)) e.phone = 'Use a Bangladeshi mobile number.';
    }
    if (s === 2) {
      if (!form.adminName.trim()) e.adminName = "The admin's name is required.";
      if (!form.adminEmail.trim()) e.adminEmail = 'An email is required — it becomes their login.';
      else if (!isEmail(form.adminEmail)) e.adminEmail = 'That does not look like an email address.';
      if (form.adminPhone && !isPhone(form.adminPhone)) e.adminPhone = 'Use a Bangladeshi mobile number.';
    }
    if (s === 3) {
      if (form.plan === 'TRIAL' && (!form.trialDays || Number(form.trialDays) < 1)) {
        e.trialDays = 'A trial needs at least one day.';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep(step)) { notify('Some fields need attention', 'danger'); return; }
    setStep((s) => Math.min(4, s + 1));
  };

  const create = () => {
    setCreating(true);
    // MOCK: replace with POST /schools
    setTimeout(() => {
      setCreating(false);
      notify(`${form.name} created — setup email sent to ${form.adminEmail}`);
      setTimeout(() => navigate('/platform/schools'), 900);
    }, 900);
  };

  const chosenPlan = plans.find((p) => p.key === form.plan);
  const errorProps = (k: keyof State) => ({ error: Boolean(errors[k]) });

  return (
    <>
      <Link to="/platform/schools"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-slatesoft transition hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> All schools
      </Link>

      <PageHeader
        title="Add a school"
        subtitle="Manual onboarding for a tenant that never went through the demo form."
        icon={<Building2 className="h-5 w-5" />}
        actions={<DemoChip label="Creates locally" />}
      />

      {/* ── stepper ── */}
      <SectionCard className="mb-5">
        <ol className="flex flex-wrap items-center gap-2">
          {STEPS.map((s, i) => {
            const done = step > s.key;
            const on = step === s.key;
            const Icon = s.icon;
            return (
              <li key={s.key} className="flex flex-1 items-center gap-2">
                <button
                  type="button"
                  onClick={() => s.key < step && setStep(s.key)}
                  disabled={s.key > step}
                  className={`flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition ${
                    on ? 'border-brand bg-brand/5'
                      : done ? 'border-line bg-white hover:border-ocean'
                        : 'border-dashed border-linestrong bg-surfaceinset/50'
                  }`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${
                    done ? 'bg-success/10 text-success' : on ? 'bg-brand text-white' : 'bg-line text-slatesoft'
                  }`}>
                    {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold uppercase tracking-wide text-slatesoft">Step {s.key}</span>
                    <span className={`block truncate text-sm font-bold ${on ? 'text-brand' : 'text-ink'}`}>{s.label}</span>
                  </span>
                </button>
                {i < STEPS.length - 1 && <span className="hidden h-px w-4 shrink-0 bg-linestrong lg:block" />}
              </li>
            );
          })}
        </ol>
      </SectionCard>

      {/* ── step 1 ── */}
      {step === 1 && (
        <FormSection title="School profile" description="Identity, address and the URL the school will use."
          icon={<Building2 className="h-4 w-4" />}>
          <Field label="School name" required error={errors.name} span={2}>
            <TextInput value={form.name} onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Comilla Victoria School" {...errorProps('name')} />
          </Field>

          <Field label="Tenant code" required error={errors.code} hint="Suggested from the name. Appears on invoices.">
            <TextInput value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())}
              className="font-mono" placeholder="CVS" {...errorProps('code')} />
          </Field>

          <Field label="District" required>
            <SelectInput value={form.district} onChange={(e) => set('district', e.target.value)} options={DISTRICTS} />
          </Field>

          <Field
            label="Subdomain"
            required
            error={errors.subdomain}
            hint={!errors.subdomain && form.subdomain ? `${form.subdomain}.shikkha.app${subdomainTaken ? '' : ' is available'}` : undefined}
            span={2}
          >
            <div className="flex items-center gap-2">
              <TextInput value={form.subdomain}
                onChange={(e) => set('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="font-mono" placeholder="comillavictoria" {...errorProps('subdomain')} />
              <span className="shrink-0 font-mono text-xs text-slatesoft">.shikkha.app</span>
            </div>
          </Field>

          <Field label="Established year">
            <TextInput inputMode="numeric" value={form.established}
              onChange={(e) => set('established', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="1968" />
          </Field>

          <Field label="Office phone" error={errors.phone}>
            <TextInput inputMode="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)}
              placeholder="01711204488" {...errorProps('phone')} />
          </Field>

          <Field label="Office email" error={errors.email} span={2}>
            <TextInput type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
              placeholder="office@school.edu.bd" {...errorProps('email')} />
          </Field>

          <Field label="Address" span={4}>
            <TextArea value={form.address} onChange={(e) => set('address', e.target.value)} rows={2}
              placeholder="Road, area, city, postcode" />
          </Field>
        </FormSection>
      )}

      {/* ── step 2 ── */}
      {step === 2 && (
        <>
          <FormSection title="School admin account"
            description="The first login for this tenant. Created as SCHOOL_ADMIN and scoped to this school only."
            icon={<User className="h-4 w-4" />}>
            <Field label="Full name" required error={errors.adminName} span={2}>
              <TextInput value={form.adminName} onChange={(e) => set('adminName', e.target.value)}
                placeholder="e.g. Imran Kabir" {...errorProps('adminName')} />
            </Field>

            <Field label="Email" required error={errors.adminEmail} hint="This is their username." span={2}>
              <TextInput type="email" value={form.adminEmail} onChange={(e) => set('adminEmail', e.target.value)}
                placeholder="principal@school.edu.bd" {...errorProps('adminEmail')} />
            </Field>

            <Field label="Mobile" error={errors.adminPhone}>
              <TextInput inputMode="tel" value={form.adminPhone} onChange={(e) => set('adminPhone', e.target.value)}
                placeholder="01711204488" {...errorProps('adminPhone')} />
            </Field>

            <Field label="Role">
              <div className="flex h-[42px] items-center rounded-xl border border-line bg-surfaceinset px-3.5">
                <Badge tone="info">SCHOOL_ADMIN</Badge>
                <span className="ml-2 text-xs text-slatesoft">fixed · tenant-scoped</span>
              </div>
            </Field>
          </FormSection>

          <SectionCard className="mt-5" title="How they get in"
            description="Token-based setup is the default and matches the existing PENDING_VERIFICATION flow.">
            {[
              {
                key: 'sendSetupEmail' as const,
                title: 'Send a setup email',
                body: 'The account is created as PENDING_VERIFICATION and they choose their own password from a one-time link. No password is ever typed by you or stored in a ticket.',
              },
              {
                key: 'mustChangePassword' as const,
                title: 'Force a password change on first login',
                body: 'Belt and braces if you ever hand over a temporary password out of band.',
              },
            ].map((o) => (
              <label key={o.key} className="flex cursor-pointer items-start gap-3 border-b border-line py-3.5 last:border-0">
                <input type="checkbox" checked={form[o.key]} onChange={() => set(o.key, !form[o.key])}
                  className="mt-0.5 h-4 w-4 rounded border-linestrong accent-[#034078]" />
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-ink">{o.title}</span>
                  <span className="block text-sm text-slatesoft">{o.body}</span>
                </span>
              </label>
            ))}
          </SectionCard>
        </>
      )}

      {/* ── step 3 ── */}
      {step === 3 && (
        <>
          <SectionCard title="Pick a plan" description="A trial can be converted to a paid plan at any time.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {plans.map((p) => (
                <button key={p.key} type="button" onClick={() => set('plan', p.key)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    form.plan === p.key ? 'border-brand bg-brand/5 shadow-card' : 'border-line bg-white hover:border-ocean'
                  }`}>
                  <div className="flex items-center justify-between">
                    <p className="font-display text-sm font-extrabold text-ink">{p.name}</p>
                    {p.highlight && <Badge tone="purple">Popular</Badge>}
                  </div>
                  <p className="mt-1 font-display text-2xl font-extrabold text-brand">{p.price ? taka(p.price) : 'Free'}</p>
                  <p className="text-[11px] text-slatesoft">per month · {taka(p.perStudent)}/student</p>
                  <ul className="mt-3 space-y-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-[11px] text-slatesoft">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-success" />{f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </SectionCard>

          <FormSection title="Trial and billing" description="Only the trial length is required for a trial tenant."
            icon={<Layers className="h-4 w-4" />}>
            <Field label="Trial length" required={form.plan === 'TRIAL'} error={errors.trialDays} hint="Days from today.">
              <SegmentedInput
                value={form.trialDays}
                onChange={(v) => set('trialDays', v)}
                options={['14', '30', '60', '90']}
              />
            </Field>

            <Field label="Billing starts" hint="Leave blank to start when the trial ends.">
              <TextInput type="date" value={form.billingStart} onChange={(e) => set('billingStart', e.target.value)} />
            </Field>

            <Field label="Internal notes" span={2} hint="Never shown to the school.">
              <TextArea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2}
                placeholder="Referral source, negotiated rate, contact history…" />
            </Field>
          </FormSection>
        </>
      )}

      {/* ── step 4 ── */}
      {step === 4 && (
        <div className="space-y-5">
          <SectionCard title="Review before creating"
            description="Nothing is created until you press the button at the bottom.">
            <div className="grid grid-cols-1 gap-x-8 gap-y-1 lg:grid-cols-2">
              {[
                ['School', form.name],
                ['Tenant code', form.code],
                ['Subdomain', `${form.subdomain}.shikkha.app`],
                ['District', form.district],
                ['Office phone', form.phone || '—'],
                ['Office email', form.email || '—'],
                ['Admin name', form.adminName],
                ['Admin email', form.adminEmail],
                ['Admin role', 'SCHOOL_ADMIN — scoped to this tenant'],
                ['Onboarding', form.sendSetupEmail ? 'Setup email with a one-time link' : 'No email — password handed over manually'],
                ['Plan', `${chosenPlan?.name} — ${chosenPlan?.price ? taka(chosenPlan.price) + '/month' : 'free'}`],
                ['Trial', form.plan === 'TRIAL' ? `${form.trialDays} days from today` : 'Not applicable'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start gap-3 border-b border-line py-2.5">
                  <dt className="w-40 shrink-0 text-[11px] font-bold uppercase tracking-wide text-slatesoft">{k}</dt>
                  <dd className="min-w-0 break-words text-sm font-medium text-ink">{v}</dd>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="rounded-2xl border border-ocean/30 bg-softblue/25 p-5">
            <p className="flex items-center gap-2 font-display text-sm font-extrabold text-brand">
              <Sparkles className="h-4 w-4" /> What happens when you press create
            </p>
            <ol className="mt-3 space-y-2 text-sm text-slatesoft">
              <li className="flex gap-2.5"><Globe className="mt-0.5 h-4 w-4 shrink-0 text-ocean" />
                The tenant is provisioned at <b className="font-mono text-ink">{form.subdomain || '…'}.shikkha.app</b> with code <b className="font-mono text-ink">{form.code || '…'}</b>.</li>
              <li className="flex gap-2.5"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-ocean" />
                A <b className="text-ink">SCHOOL_ADMIN</b> is created for {form.adminEmail || 'the admin'} — with a <code className="font-mono text-[11px]">school_id</code>, never a platform role.</li>
              <li className="flex gap-2.5"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-ocean" />
                {form.sendSetupEmail
                  ? 'A setup email goes out with a one-time link; the account sits at PENDING_VERIFICATION until it is used.'
                  : 'No email is sent — you will need to hand over credentials yourself.'}</li>
              <li className="flex gap-2.5"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-ocean" />
                The action is written to the audit log against your account.</li>
            </ol>
          </div>
        </div>
      )}

      {/* ── footer ── */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-line bg-white/95 px-4 py-4 backdrop-blur md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
        <p className="mr-auto text-xs font-medium text-slatesoft">Step {step} of 4</p>

        <button type="button"
          onClick={() => (step === 1 ? navigate('/platform/schools') : setStep((s) => s - 1))}
          className="rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-surfaceinset">
          {step === 1 ? 'Cancel' : 'Back'}
        </button>

        {step < 4 ? (
          <button type="button" onClick={next}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-deep">
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button type="button" onClick={create} disabled={creating}
            className="inline-flex items-center gap-2 rounded-xl bg-signal px-5 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-signal-deep disabled:opacity-60">
            <Check className="h-4 w-4" /> {creating ? 'Creating…' : 'Create school'}
          </button>
        )}
      </div>

      <Toast toast={toast} onClose={clear} />
    </>
  );
};

export default AddSchoolPage;
