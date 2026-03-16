import { useState } from 'react'
import { motion } from 'framer-motion'
import { GripVertical, Plus, MoreHorizontal } from 'lucide-react'
import { Badge } from './Badge'

interface KanbanItem {
  id: string
  title: string
  subtitle?: string
  badge?: { label: string; variant: 'gold' | 'green' | 'red' | 'blue' | 'orange' | 'muted' | 'purple' }
  priority?: number
  assignee?: string
  onClick?: () => void
}

interface KanbanColumn {
  id: string
  title: string
  color: string
  items: KanbanItem[]
}

interface KanbanBoardProps {
  columns: KanbanColumn[]
  onMoveItem?: (itemId: string, fromColumn: string, toColumn: string) => void
  onAddItem?: (columnId: string) => void
  className?: string
}

export function KanbanBoard({ columns, onMoveItem, onAddItem, className = '' }: KanbanBoardProps) {
  const [draggedItem, setDraggedItem] = useState<{ itemId: string; columnId: string } | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  const handleDragStart = (itemId: string, columnId: string) => {
    setDraggedItem({ itemId, columnId })
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  const handleDrop = (targetColumnId: string) => {
    if (draggedItem && draggedItem.columnId !== targetColumnId) {
      onMoveItem?.(draggedItem.itemId, draggedItem.columnId, targetColumnId)
    }
    setDraggedItem(null)
    setDragOverColumn(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverColumn(null)
  }

  return (
    <div className={`flex gap-4 overflow-x-auto pb-4 ${className}`}>
      {columns.map(column => (
        <div
          key={column.id}
          onDragOver={e => handleDragOver(e, column.id)}
          onDrop={() => handleDrop(column.id)}
          className={`
            flex-shrink-0 w-80 bg-bg-secondary rounded-xl border transition-all
            ${dragOverColumn === column.id ? 'border-gold-400 bg-gold-400/5' : 'border-border-subtle'}
          `}
        >
          {/* Column header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: column.color }} />
              <h3 className="text-sm font-semibold text-text-primary">{column.title}</h3>
              <span className="text-[10px] text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded-full">{column.items.length}</span>
            </div>
            <div className="flex items-center gap-1">
              {onAddItem && (
                <button onClick={() => onAddItem(column.id)} className="p-1 rounded text-text-muted hover:text-gold-400 transition-colors">
                  <Plus size={14} />
                </button>
              )}
              <button className="p-1 rounded text-text-muted hover:text-text-primary transition-colors">
                <MoreHorizontal size={14} />
              </button>
            </div>
          </div>

          {/* Items */}
          <div className="p-2 space-y-2 min-h-[200px]">
            {column.items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                draggable
                onDragStart={() => handleDragStart(item.id, column.id)}
                onDragEnd={handleDragEnd}
                onClick={item.onClick}
                className={`
                  group p-3 bg-bg-tertiary rounded-lg border border-border-subtle cursor-grab active:cursor-grabbing
                  hover:border-border-medium hover:shadow-card transition-all
                  ${draggedItem?.itemId === item.id ? 'opacity-50' : ''}
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.badge && <Badge variant={item.badge.variant} size="sm">{item.badge.label}</Badge>}
                    {item.priority && item.priority >= 4 && <Badge variant="red" size="sm">P{item.priority}</Badge>}
                  </div>
                  <GripVertical size={12} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
                <h4 className="text-sm text-text-primary font-medium leading-snug">{item.title}</h4>
                {item.subtitle && <p className="text-xs text-text-muted mt-1 truncate">{item.subtitle}</p>}
                {item.assignee && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border-subtle">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-[8px] font-bold text-bg-primary">
                      {item.assignee.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-[10px] text-text-muted">{item.assignee}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
