import { ITableHeaderProps } from '@/interfaces/ui/table';
import { useTableContext } from '../context';
import { cn } from '@/lib/cn';

import styles from './styles.module.scss';

export const TableHeader = <T,>({ className }: ITableHeaderProps) => {
  const { columns, actions } = useTableContext<T>();

  return (
    <thead className={className}>
      <tr>
        {columns.map((col) => (
          <th
            key={col.key}
            style={{ width: col.width }}
            className={cn(
              styles['table-header-row'],
              col.align && styles[`align-${col.align}`],
            )}
          >
            {col.title}
          </th>
        ))}
        {actions?.length ? (
          <th
            className={styles['table-header-row']}
            style={{ width: actions.length * 32 + 8 }}
          />
        ) : null}
      </tr>
    </thead>
  );
};
