'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Patient } from '@/lib/types';

interface SessionFormProps {
  patient: Patient;
  onSuccess: () => void;
}

interface FormState {
  date: string;
  dry_weight: string;
  pre_weight: string;
  pre_bp: string;
  uv: string;
  post_weight: string;
  post_bp: string;
  notes: string;
}

interface FormErrors {
  date?: string;
  dry_weight?: string;
  pre_weight?: string;
  pre_bp?: string;
  uv?: string;
  post_weight?: string;
  post_bp?: string;
}

const BP_PATTERN = /^\d{2,3}\/\d{2,3}$/;
const today = new Date().toISOString().split('T')[0];

export default function SessionForm({ patient, onSuccess }: SessionFormProps) {
  const [form, setForm] = useState<FormState>({
    date: today,
    dry_weight: '',
    pre_weight: '',
    pre_bp: '',
    uv: '',
    post_weight: '',
    post_bp: '',
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.date) e.date = 'Date is required.';
    if (!form.dry_weight || isNaN(Number(form.dry_weight)) || Number(form.dry_weight) <= 0)
      e.dry_weight = 'Enter a valid dry weight (kg).';
    if (!form.pre_weight || isNaN(Number(form.pre_weight)) || Number(form.pre_weight) <= 0)
      e.pre_weight = 'Enter a valid weight.';
    if (!BP_PATTERN.test(form.pre_bp.trim()))
      e.pre_bp = 'Format must be SYS/DIA (e.g. 120/80).';
    if (!form.uv || isNaN(Number(form.uv)) || Number(form.uv) < 0)
      e.uv = 'Enter a valid UV value.';
    if (!form.post_weight || isNaN(Number(form.post_weight)) || Number(form.post_weight) <= 0)
      e.post_weight = 'Enter a valid weight.';
    if (!BP_PATTERN.test(form.post_bp.trim()))
      e.post_bp = 'Format must be SYS/DIA (e.g. 120/80).';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const { error } = await supabase.from('dialysis_records').insert([
      {
        patient_id: patient.id,
        date: form.date,
        dry_weight: Number(form.dry_weight),
        pre_weight: Number(form.pre_weight),
        pre_bp: form.pre_bp.trim(),
        uv: Number(form.uv),
        post_weight: Number(form.post_weight),
        post_bp: form.post_bp.trim(),
        notes: form.notes.trim() || null,
      },
    ]);
    setLoading(false);

    if (error) {
      alert(`Error logging session: ${error.message}`);
      return;
    }

    // Reset form
    setForm({ date: today, dry_weight: '', pre_weight: '', pre_bp: '', uv: '', post_weight: '', post_bp: '', notes: '' });
    setErrors({});
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
    onSuccess();
  };

  return (
    <div className="card" style={{ height: 'fit-content' }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>Log New Session</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
          Record a dialysis treatment for {patient.full_name}.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Date */}
        <div className="form-group">
          <label htmlFor="session-date">Date</label>
          <input
            id="session-date"
            type="date"
            value={form.date}
            onChange={set('date')}
            className={errors.date ? 'input-error' : ''}
            max={today}
          />
          {errors.date && <span className="error-msg">{errors.date}</span>}
        </div>

        {/* Dry Weight */}
        <div className="form-group">
          <label htmlFor="session-dry-weight">Dry Weight (kg)</label>
          <input
            id="session-dry-weight"
            type="number"
            placeholder="e.g. 58.5"
            value={form.dry_weight}
            onChange={set('dry_weight')}
            className={errors.dry_weight ? 'input-error' : ''}
            step="0.1"
            min="0"
          />
          {errors.dry_weight && <span className="error-msg">{errors.dry_weight}</span>}
        </div>

        {/* Pre-Treatment */}
        <div>
          <p className="section-label">Pre-Treatment</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label htmlFor="pre-weight">Weight (kg)</label>
              <input
                id="pre-weight"
                type="number"
                placeholder="e.g. 62.0"
                value={form.pre_weight}
                onChange={set('pre_weight')}
                className={errors.pre_weight ? 'input-error' : ''}
                step="0.1"
                min="0"
              />
              {errors.pre_weight && <span className="error-msg">{errors.pre_weight}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="pre-bp">BP (mmHg)</label>
              <input
                id="pre-bp"
                type="text"
                placeholder="e.g. 140/90"
                value={form.pre_bp}
                onChange={set('pre_bp')}
                className={errors.pre_bp ? 'input-error' : ''}
              />
              {errors.pre_bp && <span className="error-msg">{errors.pre_bp}</span>}
            </div>
          </div>
        </div>

        {/* Treatment */}
        <div>
          <p className="section-label">Treatment</p>
          <div className="form-group">
            <label htmlFor="uv">Ultrafiltration Volume — UV (L)</label>
            <input
              id="uv"
              type="number"
              placeholder="e.g. 2.5"
              value={form.uv}
              onChange={set('uv')}
              className={errors.uv ? 'input-error' : ''}
              step="0.1"
              min="0"
            />
            {errors.uv && <span className="error-msg">{errors.uv}</span>}
          </div>
        </div>

        {/* Post-Treatment */}
        <div>
          <p className="section-label">Post-Treatment</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label htmlFor="post-weight">Weight (kg)</label>
              <input
                id="post-weight"
                type="number"
                placeholder="e.g. 59.5"
                value={form.post_weight}
                onChange={set('post_weight')}
                className={errors.post_weight ? 'input-error' : ''}
                step="0.1"
                min="0"
              />
              {errors.post_weight && <span className="error-msg">{errors.post_weight}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="post-bp">BP (mmHg)</label>
              <input
                id="post-bp"
                type="text"
                placeholder="e.g. 120/80"
                value={form.post_bp}
                onChange={set('post_bp')}
                className={errors.post_bp ? 'input-error' : ''}
              />
              {errors.post_bp && <span className="error-msg">{errors.post_bp}</span>}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="form-group">
          <label htmlFor="session-notes">Notes (optional)</label>
          <textarea
            id="session-notes"
            placeholder="Observations, complications, medications…"
            value={form.notes}
            onChange={set('notes')}
            style={{ minHeight: 72 }}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          id="submit-log-session"
          style={{ marginTop: 4 }}
        >
          {loading ? (
            <>
              <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
              Saving…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Log Session
            </>
          )}
        </button>

        {successMsg && (
          <div
            style={{
              background: 'var(--color-success-light)',
              color: 'var(--color-success)',
              border: '1px solid var(--color-success)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              fontSize: '0.8125rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Session logged successfully.
          </div>
        )}
      </form>
    </div>
  );
}
