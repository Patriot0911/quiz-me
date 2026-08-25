import { TableActionCellProps } from '@/interfaces/ui/table';
import { cn } from '@/lib/cn';

import styles from './styles.module.scss';

const TableActionCell = <T,>({ actions, row }: TableActionCellProps<T>) => {
  return (
    <td className={styles.td}>
      <div className={styles.cell}>
        {actions.map((action) => {
          const isDisabled =
            typeof action.disabled === 'function'
              ? action.disabled(row)
              : (action.disabled ?? false);

          return (
            <button
              key={action.key}
              type="button"
              aria-label={action.label}
              disabled={isDisabled}
              className={cn(
                styles.btn,
                action.variant === 'danger'  && styles['btn-danger'],
                action.variant === 'primary' && styles['btn-primary'],
              )}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick(row);
              }}
            >
              {action.icon}
            </button>
          );
        })}
      </div>
    </td>
  );
}

export default TableActionCell;
