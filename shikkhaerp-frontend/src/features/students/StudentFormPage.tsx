/**
 * Add / edit student — the sectioned form.
 *
 * One component serves both routes: /students/new and /students/:id/edit. The
 * only difference is whether it seeds from an existing record. Teachers and
 * Guardians reuse this shape, which is why the blocks and the footer come from
 * FormKit rather than being written here.
 *
 * Data: MOCK. Saving shows a toast and returns to the list; nothing persists.
 * Wire to POST /students and PUT /students/{id} when they exist.
 */
import React, { useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, User, GraduationCap, Users2, MapPin, HeartPulse, AlertCircle,
} from 'lucide-react';
import {
  PageHeader, FormSection, Field, TextInput, TextArea, SelectInput,
  SegmentedInput, PhotoField, FormFooter, Toast, useToast, DemoChip,
} from '../../shared/ui';
import {
  findStudent, CLASSES, SECTIONS, GROUPS, BLOOD_GROUPS, RELIGIONS,
  RELATIONS, DISTRICTS, HOUSES, TRANSPORT_ROUTES, STATUS_LABEL,
} from './data/mockStudents';

interface FormState {
  name: string; nameBn: string; dob: string; gender: string;
  bloodGroup: string; religion: string; photo: string | null;
  className: string; section: string; roll: string; group: string;
  shift: string; house: string; admissionDate: string; status: string;
  guardianName: string; guardianRelation: string; guardianPhone: string;
  guardianEmail: string; guardianOccupation: string; guardianNid: string;
  phone: string; email: string; address: string; district: string; transport: string;
  medical: string; notes: string;
}

const EMPTY: FormState = {
  name: '', nameBn: '', dob: '', gender: 'Male',
  bloodGroup: '', religion: 'Islam', photo: null,
  className: '', section: '', roll: '', group: 'General',
  shift: 'Morning', house: HOUSES[0], admissionDate: new Date().toISOString().slice(0, 10), status: 'ACTIVE',
  guardianName: '', guardianRelation: 'Father', guardianPhone: '',
  guardianEmail: '', guardianOccupation: '', guardianNid: '',
  phone: '', email: '', address: '', district: 'Dhaka', transport: TRANSPORT_ROUTES[0],
  medical: '', notes: '',
};

const isPhone = (v: string) => /^01[3-9]\d{8}$/.test(v.trim());
const isEmail = (v: string) => v.trim() === '' || /^\S+@\S+\.\S+$/.test(v.trim());

export const StudentFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast, notify, clear } = useToast();

  const existing = useMemo(() => (id ? findStudent(id) : undefined), [id]);
  const isEdit = Boolean(existing);

  const [form, setForm] = useState<FormState>(() =>
    existing
      ? {
          name: existing.name, nameBn: existing.nameBn, dob: existing.dob, gender: existing.gender,
          bloodGroup: existing.bloodGroup, religion: existing.religion, photo: null,
          className: existing.className, section: existing.section, roll: String(existing.roll),
          group: existing.group, shift: existing.shift, house: existing.house,
          admissionDate: existing.admissionDate, status: existing.status,
          guardianName: existing.guardian.name, guardianRelation: existing.guardian.relation,
          guardianPhone: existing.guardian.phone, guardianEmail: existing.guardian.email,
          guardianOccupation: existing.guardian.occupation, guardianNid: existing.guardian.nid,
          phone: existing.phone, email: existing.email, address: existing.address,
          district: existing.district, transport: existing.transport,
          medical: existing.medical, notes: '',
        }
      : EMPTY,
  );

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = 'A full name is required.';
    if (!form.dob) next.dob = 'Date of birth is required.';
    if (!form.className) next.className = 'Pick a class.';
    if (!form.section) next.section = 'Pick a section.';
    if (!form.roll.trim()) next.roll = 'A roll number is required.';
    else if (!/^\d{1,4}$/.test(form.roll.trim())) next.roll = 'Digits only.';
    if (!form.guardianName.trim()) next.guardianName = "The guardian's name is required.";
    if (!form.guardianPhone.trim()) next.guardianPhone = 'A contact number is required.';
    else if (!isPhone(form.guardianPhone)) next.guardianPhone = 'Use an 11-digit number, e.g. 01712345678.';
    if (form.phone && !isPhone(form.phone)) next.phone = 'Use an 11-digit number, e.g. 01712345678.';
    if (!isEmail(form.email)) next.email = 'That does not look like an email address.';
    if (!isEmail(form.guardianEmail)) next.guardianEmail = 'That does not look like an email address.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = () => {
    if (!validate()) {
      notify('Some fields need attention', 'danger');
      const first = document.querySelector('[data-error="true"]');
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSaving(true);
    // MOCK: replace with POST /students or PUT /students/{id}
    setTimeout(() => {
      setSaving(false);
      setDirty(false);
      notify(isEdit ? `${form.name} updated` : `${form.name} enrolled in Class ${form.className}`);
      setTimeout(() => navigate(isEdit && id ? `/school-admin/students/${id}` : '/school-admin/students'), 700);
    }, 700);
  };

  const cancel = () => navigate(isEdit && id ? `/school-admin/students/${id}` : '/school-admin/students');

  const errorProps = (key: keyof FormState) => ({
    error: Boolean(errors[key]),
    'data-error': errors[key] ? 'true' : undefined,
  });

  return (
    <>
      <Link
        to={isEdit && id ? `/school-admin/students/${id}` : '/school-admin/students'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-slatesoft transition hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" /> {isEdit ? 'Back to record' : 'All students'}
      </Link>

      <PageHeader
        title={isEdit ? `Edit ${existing?.name}` : 'Enrol a student'}
        subtitle={
          isEdit
            ? 'Update the record. Changes are logged against your account.'
            : 'Fill in the student, their academic placement and at least one guardian.'
        }
        icon={<GraduationCap className="h-5 w-5" />}
        actions={<DemoChip label="Saves locally" />}
      />

      <div className="space-y-5 pb-4">
        {/* ── student ── */}
        <FormSection
          title="Student information"
          description="Name as it should appear on certificates and the ID card."
          icon={<User className="h-4 w-4" />}
        >
          <Field label="Full name" required error={errors.name} span={2}>
            <TextInput
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Tanvir Ahmed"
              {...errorProps('name')}
            />
          </Field>

          <Field label="Name in Bangla" hint="Used on Bangla certificates." span={2}>
            <TextInput value={form.nameBn} onChange={(e) => set('nameBn', e.target.value)} placeholder="তানভীর আহমেদ" />
          </Field>

          <Field label="Date of birth" required error={errors.dob}>
            <TextInput type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} {...errorProps('dob')} />
          </Field>

          <Field label="Gender" required>
            <SegmentedInput value={form.gender} onChange={(v) => set('gender', v)} options={['Male', 'Female']} />
          </Field>

          <Field label="Blood group">
            <SelectInput
              value={form.bloodGroup}
              onChange={(e) => set('bloodGroup', e.target.value)}
              options={[{ value: '', label: 'Not recorded' }, ...BLOOD_GROUPS.map((b) => ({ value: b, label: b }))]}
            />
          </Field>

          <Field label="Religion">
            <SelectInput value={form.religion} onChange={(e) => set('religion', e.target.value)} options={RELIGIONS} />
          </Field>

          <Field label="Photo" span={4}>
            <PhotoField value={form.photo} onChange={(v) => set('photo', v)} label="" />
          </Field>
        </FormSection>

        {/* ── academic ── */}
        <FormSection
          title="Academic placement"
          description="Where this student sits in the school, and from when."
          icon={<GraduationCap className="h-4 w-4" />}
        >
          <Field label="Class" required error={errors.className}>
            <SelectInput
              value={form.className}
              onChange={(e) => set('className', e.target.value)}
              options={[{ value: '', label: 'Select a class' }, ...CLASSES.map((c) => ({ value: c, label: `Class ${c}` }))]}
              {...errorProps('className')}
            />
          </Field>

          <Field label="Section" required error={errors.section}>
            <SelectInput
              value={form.section}
              onChange={(e) => set('section', e.target.value)}
              options={[{ value: '', label: 'Select a section' }, ...SECTIONS.map((s) => ({ value: s, label: `Section ${s}` }))]}
              {...errorProps('section')}
            />
          </Field>

          <Field label="Roll number" required error={errors.roll}>
            <TextInput
              inputMode="numeric"
              value={form.roll}
              onChange={(e) => set('roll', e.target.value)}
              placeholder="12"
              {...errorProps('roll')}
            />
          </Field>

          <Field label="Group" hint="Applies from Class Nine.">
            <SelectInput value={form.group} onChange={(e) => set('group', e.target.value)} options={GROUPS} />
          </Field>

          <Field label="Shift">
            <SegmentedInput value={form.shift} onChange={(v) => set('shift', v)} options={['Morning', 'Day']} />
          </Field>

          <Field label="House">
            <SelectInput value={form.house} onChange={(e) => set('house', e.target.value)} options={HOUSES} />
          </Field>

          <Field label="Admission date">
            <TextInput type="date" value={form.admissionDate} onChange={(e) => set('admissionDate', e.target.value)} />
          </Field>

          <Field label="Status" hint={isEdit ? undefined : 'New enrolments start active.'}>
            <SelectInput
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
              options={Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))}
            />
          </Field>
        </FormSection>

        {/* ── guardian ── */}
        <FormSection
          title="Guardian"
          description="The contact the school calls first. Their phone becomes the guardian login when the parent app is enabled."
          icon={<Users2 className="h-4 w-4" />}
        >
          <Field label="Guardian name" required error={errors.guardianName} span={2}>
            <TextInput
              value={form.guardianName}
              onChange={(e) => set('guardianName', e.target.value)}
              placeholder="e.g. Md. Salim Ahmed"
              {...errorProps('guardianName')}
            />
          </Field>

          <Field label="Relation">
            <SelectInput value={form.guardianRelation} onChange={(e) => set('guardianRelation', e.target.value)} options={RELATIONS} />
          </Field>

          <Field label="Occupation">
            <TextInput value={form.guardianOccupation} onChange={(e) => set('guardianOccupation', e.target.value)} placeholder="e.g. Businessman" />
          </Field>

          <Field label="Mobile" required error={errors.guardianPhone} hint="11 digits, no country code.">
            <TextInput
              inputMode="tel"
              value={form.guardianPhone}
              onChange={(e) => set('guardianPhone', e.target.value)}
              placeholder="01712345678"
              {...errorProps('guardianPhone')}
            />
          </Field>

          <Field label="Email" error={errors.guardianEmail}>
            <TextInput
              type="email"
              value={form.guardianEmail}
              onChange={(e) => set('guardianEmail', e.target.value)}
              placeholder="guardian@example.com"
              {...errorProps('guardianEmail')}
            />
          </Field>

          <Field label="NID number" span={2}>
            <TextInput value={form.guardianNid} onChange={(e) => set('guardianNid', e.target.value)} placeholder="1234 567890" />
          </Field>
        </FormSection>

        {/* ── contact ── */}
        <FormSection
          title="Contact & address"
          description="Where the student lives and how they travel."
          icon={<MapPin className="h-4 w-4" />}
        >
          <Field label="Student mobile" error={errors.phone} hint="Optional for junior classes.">
            <TextInput
              inputMode="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="01712345678"
              {...errorProps('phone')}
            />
          </Field>

          <Field label="Student email" error={errors.email}>
            <TextInput
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="student@example.com"
              {...errorProps('email')}
            />
          </Field>

          <Field label="District">
            <SelectInput value={form.district} onChange={(e) => set('district', e.target.value)} options={DISTRICTS} />
          </Field>

          <Field label="Transport route">
            <SelectInput value={form.transport} onChange={(e) => set('transport', e.target.value)} options={TRANSPORT_ROUTES} />
          </Field>

          <Field label="Present address" span={4}>
            <TextArea
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="House, road, area"
              rows={2}
            />
          </Field>
        </FormSection>

        {/* ── medical ── */}
        <FormSection
          title="Medical & notes"
          description="Visible to the class teacher and the school office only."
          icon={<HeartPulse className="h-4 w-4" />}
        >
          <Field label="Medical conditions" span={2}>
            <TextArea
              value={form.medical}
              onChange={(e) => set('medical', e.target.value)}
              placeholder="Allergies, medication, anything staff should know"
              rows={3}
            />
          </Field>

          <Field label="Internal notes" span={2} hint="Never shown to the student or guardian.">
            <TextArea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Scholarship, sibling reference, previous school…"
              rows={3}
            />
          </Field>
        </FormSection>
      </div>

      <FormFooter
        onCancel={cancel}
        onSave={save}
        saving={saving}
        saveLabel={isEdit ? 'Save changes' : 'Enrol student'}
        note={
          dirty ? (
            <span className="inline-flex items-center gap-1.5 text-[#8A5A00]">
              <AlertCircle className="h-3.5 w-3.5" /> Unsaved changes
            </span>
          ) : null
        }
      />

      <Toast toast={toast} onClose={clear} />
    </>
  );
};

export default StudentFormPage;
