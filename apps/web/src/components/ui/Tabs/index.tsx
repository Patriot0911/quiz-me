import styles from './styles.module.scss';
import { TabsProps } from './Tabs';

const Tabs = <T extends string>({ items, value, onChange }: TabsProps<T>) => (
  <div className={styles.tabs}>
    {items.map(({ key, label, count }) => (
      <button
        key={key}
        type="button"
        className={`${styles.tab} ${value === key ? styles.tabActive : ''}`}
        onClick={() => onChange(key)}
      >
        {label}
        {count !== undefined && (
          <span className={styles.tabCount}>{count}</span>
        )}
      </button>
    ))}
  </div>
);

export default Tabs;
