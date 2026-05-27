'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface AddPatientModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface FormErrors {
  full_name?: string;
  birth_date?: string;
  schedule?: string;
}

export default function AddPatientModal({ onClose, onSuccess }: AddPatientModalProps) {
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!fullName.trim()) newErrors.full_name = 'Full name is required.';
    if (!birthDate) newErrors.birth_date = 'Date of birth is required.';
    if (selectedDays.length === 0)
      newErrors.schedule = 'Select at least one dialysis day.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const { error } = await supabase.from('patients').insert([
      {
        full_name: fullName.trim(),
        birth_date: birthDate,
        schedule: selectedDays,
      },
    ]);

    setLoading(false);

    if (error) {
      alert(`Error adding patient: ${error.message}`);
      return;
    }
    onSuccess();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <div>
            <h2 id="modal-title" style={{ fontSize: '1.125rem', marginBottom: 2 }}>
              Add New Patient
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Enter patient demographics and dialysis schedule. Dry weight is recorded per session.
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M13.5 4.5L4.5 13.5M4.5 4.5l9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="patient-name">Full Name</label>
              <input
                id="patient-name"
                type="text"
                placeholder="e.g. Juan dela Cruz"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={errors.full_name ? 'input-error' : ''}
                autoFocus
              />
              {errors.full_name && <span className="error-msg">{errors.full_name}</span>}
            </div>

            {/* Birthday */}
            <div className="form-group">
              <label htmlFor="patient-dob">Date of Birth</label>
              <input
                id="patient-dob"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className={errors.birth_date ? 'input-error' : ''}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.birth_date && <span className="error-msg">{errors.birth_date}</span>}
            </div>


            {/* Schedule */}
            <div className="form-group">
              <label>Dialysis Schedule</label>
              <div className="checkbox-group">
                {ALL_DAYS.map((day) => (
                  <div key={day}>
                    <input
                      type="checkbox"
                      id={`day-${day}`}
                      className="checkbox-day"
                      checked={selectedDays.includes(day)}
                      onChange={() => toggleDay(day)}
                    />
                    <label htmlFor={`day-${day}`} className="checkbox-day-label">
                      {day}
                    </label>
                  </div>
                ))}
              </div>
              {errors.schedule && <span className="error-msg">{errors.schedule}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="submit-add-patient">
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  Saving...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  Add Patient
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
