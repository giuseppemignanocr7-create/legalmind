import type { ReactNode } from 'react'

interface Column<T> {
  key: string
  header: string
  render?: (item: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (item: T) => void
  emptyMessage?: string
  loading?: boolean
}

export function DataTable<T extends { id?: string }>({ columns, data, onRowClick, emptyMessage = 'Nessun dato disponibile' }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-subtle">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left text-label uppercase text-text-muted tracking-widest py-3 px-4 font-medium ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-text-muted text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, idx) => (
              <tr
                key={(item as any).id || idx}
                onClick={() => onRowClick?.(item)}
                className={`
                  border-b border-border-subtle transition-colors duration-200
                  ${onRowClick ? 'cursor-pointer hover:bg-bg-tertiary' : ''}
                `}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`py-3 px-4 text-sm text-text-primary ${col.className || ''}`}>
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
