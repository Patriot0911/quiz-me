
import { ITablePaginationProps } from '@/interfaces/ui/table';

import styles from './styles.module.scss';

const TablePagination = ({ page, pageSize, total, onChange }: ITablePaginationProps) => {
  const totalPages = Math.ceil(total / pageSize);
  const from = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(page * pageSize, total);

  return (
    <div className={styles['pagination']}>
      {total === 0 ? (
        <span className={styles['info']}>
          0<span className={styles['info-total']}> / 0</span>
        </span>
      ) : (
        <span className={styles['info']}>
          {from}–{to}
          <span className={styles['info-total']}> / {total}</span>
        </span>
      )}

      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Prev
      </button>

      <span className={styles['page-indicator']}>
        {page} / {totalPages || 1}
      </span>

      <button
        disabled={page >= totalPages || totalPages === 0}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}

export default TablePagination;
