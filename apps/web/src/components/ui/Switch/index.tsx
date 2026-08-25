'use client';

import { ISwitchProps } from '@/interfaces/ui/switch';

import styles from './styles.module.scss';

const Switch = ({ checked, onChange, label, hint, disabled }: ISwitchProps) => {
  return (
    <label className={`${styles.switchRow} ${disabled ? styles.switchRowDisabled : ''}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={`${styles.switchTrack} ${checked ? styles.switchTrackChecked : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.switchThumb} />
      </button>
      {(label || hint) && (
        <span className={styles.switchText}>
          {label && <span className={styles.switchLabel}>{label}</span>}
          {hint && <span className={styles.switchHint}>{hint}</span>}
        </span>
      )}
    </label>
  );
};

export default Switch;
