import { cn } from '@/lib/cn';
import { TableContext } from './context';
import { TableHeader } from './TableHeader';
import { TableBody } from './TableBody';
import { ITableProps } from '@/interfaces/ui/table';

import styles from './styles.module.scss';

const Table = <T,>({
  columns,
  actions,
  data,
  rowKey,
  isLoading = false,
  skeletonRows = 5,
  emptyText,
  emptyComponent,
  loadingComponent,
  onRowClick,
  className,
  children,
}: ITableProps<T>) => {
  return (
    <TableContext.Provider
      value={{
        columns,
        actions,
        data,
        rowKey,
        isLoading,
        skeletonRows,
        emptyText,
        emptyComponent,
        loadingComponent,
        onRowClick,
      }}
    >
      <div className={cn(styles['table-wrapper'], className)}>
        <table className={styles.table}>
          {children}
        </table>
      </div>
    </TableContext.Provider>
  );
}

Table.Header = TableHeader;
Table.Body = TableBody;

export default Table;
