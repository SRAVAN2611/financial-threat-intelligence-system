import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { EmptyState } from './EmptyState';
import { LoadingSkeleton } from './LoadingSkeleton';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  emptyTitle?: string;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  loading = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onRowClick,
  pageSize = 10,
  emptyTitle = 'No records found',
  emptyMessage = 'Try adjusting your search query or filter parameters.',
  className = '',
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Sorting logic
  let sortedData = [...data];
  if (sortKey) {
    sortedData.sort((a: any, b: any) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === undefined || valB === undefined) return 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      const allCurrentIds = paginatedData.map(keyExtractor);
      onSelectionChange(Array.from(new Set([...selectedIds, ...allCurrentIds])));
    } else {
      const currentIds = paginatedData.map(keyExtractor);
      onSelectionChange(selectedIds.filter((id) => !currentIds.includes(id)));
    }
  };

  const handleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((item) => item !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const isAllCurrentSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row) => selectedIds.includes(keyExtractor(row)));

  if (loading) {
    return (
      <div className="enterprise-card p-4">
        <LoadingSkeleton rows={5} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="enterprise-card p-8">
        <EmptyState title={emptyTitle} message={emptyMessage} />
      </div>
    );
  }

  return (
    <div className={`enterprise-card overflow-hidden flex flex-col ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isAllCurrentSelected}
                    onChange={handleSelectAll}
                    className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500/20"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={`px-4 py-3 ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  } ${col.sortable ? 'cursor-pointer select-none hover:text-slate-200' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div
                    className={`inline-flex items-center gap-1.5 ${
                      col.align === 'right' ? 'justify-end' : ''
                    }`}
                  >
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-slate-500">
                        {sortKey === col.key ? (
                          sortOrder === 'asc' ? (
                            <ArrowUp className="w-3 h-3 text-sky-400" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-sky-400" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
            {paginatedData.map((row) => {
              const id = keyExtractor(row);
              const isSelected = selectedIds.includes(id);

              return (
                <tr
                  key={id}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors hover:bg-slate-800/40 ${
                    isSelected ? 'bg-sky-500/5' : ''
                  } ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onClick={(e) => handleSelectRow(id, e)}
                        onChange={() => {}}
                        className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500/20"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-slate-300 ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      }`}
                    >
                      {col.render ? col.render(row) : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
        <div>
          Showing{' '}
          <span className="font-medium text-slate-200">
            {Math.min(data.length, (currentPage - 1) * pageSize + 1)}
          </span>{' '}
          to{' '}
          <span className="font-medium text-slate-200">
            {Math.min(data.length, currentPage * pageSize)}
          </span>{' '}
          of <span className="font-medium text-slate-200">{data.length}</span> entries
          {selectedIds.length > 0 && (
            <span className="ml-2 text-sky-400 font-medium">
              ({selectedIds.length} selected)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono text-slate-200">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
