import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TaskCard } from '@/components';
import type { Task } from '@/types';

interface KanbanViewProps {
  tasks: Task[];
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: string) => void;
}

interface DraggableTaskProps {
  task: Task;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDragStart: (task: Task) => void;
  onDragEnd: (task: Task, newStatus?: string) => void;
}

const DraggableTask: React.FC<DraggableTaskProps> = ({
  task,
  onView,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const taskRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!taskRef.current) return;

    const rect = taskRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    setIsDragging(true);
    onDragStart(task);

    const handleMouseMove = (e: MouseEvent) => {
      if (!taskRef.current) return;

      requestAnimationFrame(() => {
        if (!taskRef.current) return;

        taskRef.current.style.position = 'fixed';
        taskRef.current.style.left = `${e.clientX - dragOffsetRef.current.x}px`;
        taskRef.current.style.top = `${e.clientY - dragOffsetRef.current.y}px`;
        taskRef.current.style.zIndex = '1000';
        taskRef.current.style.transform = 'rotate(3deg) scale(1.03)';
        taskRef.current.style.pointerEvents = 'none';
        taskRef.current.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.3)';
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);

      // Detectar drop zone ANTES de resetar os estilos
      const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
      const dropZone = elementBelow?.closest('[data-drop-zone]');

      if (taskRef.current) {
        taskRef.current.style.position = '';
        taskRef.current.style.left = '';
        taskRef.current.style.top = '';
        taskRef.current.style.zIndex = '';
        taskRef.current.style.transform = '';
        taskRef.current.style.pointerEvents = '';
        taskRef.current.style.boxShadow = '';
      }

      let newStatus = undefined;
      if (dropZone) {
        newStatus = dropZone.getAttribute('data-drop-zone') || undefined;
      }

      onDragEnd(task, newStatus);

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [task, onDragStart, onDragEnd]);

  return (
    <div
      ref={taskRef}
      onMouseDown={handleMouseDown}
      className={`${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
      style={{
        opacity: isDragging ? 0.7 : 1,
        transition: isDragging ? 'none' : 'all 0.2s ease',
      }}
    >
      <TaskCard
        task={task}
        onView={() => onView(task)}
        onEdit={() => onEdit(task)}
        onDelete={() => onDelete(task.id)}
      />
    </div>
  );
};

const KanbanView: React.FC<KanbanViewProps> = ({
  tasks,
  onView,
  onEdit,
  onDelete,
  onUpdateTaskStatus
}) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusColumns = [
    { key: 'TODO', title: 'A Fazer', color: 'var(--status-todo)' },
    { key: 'IN_PROGRESS', title: 'Em Progresso', color: 'var(--status-progress)' },
    { key: 'REVIEW', title: 'Em Revisão', color: 'var(--status-review)' },
    { key: 'DONE', title: 'Concluído', color: 'var(--priority-low)' }
  ];

  const getTasksByStatus = useCallback((status: string) => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  const handleDragStart = useCallback((task: Task) => {
    setDraggedTask(task);
  }, []);

  const handleDragEnd = useCallback(async (task: Task, newStatus?: string) => {
    setDraggedTask(null);
    setHoveredColumn(null);

    if (task && newStatus && newStatus !== task.status && !isUpdating) {
      setIsUpdating(true);

      try {
        await onUpdateTaskStatus(task.id, newStatus);
      } catch (error) {
        // Error handling is done in the store
      } finally {
        setIsUpdating(false);
      }
    }
  }, [onUpdateTaskStatus, isUpdating]);

  const handleColumnEnter = useCallback((columnKey: string) => {
    if (draggedTask) {
      setHoveredColumn(columnKey);
    }
  }, [draggedTask]);

  const handleColumnLeave = useCallback(() => {
    setHoveredColumn(null);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
    >
      {statusColumns.map((column, index) => {
        const columnTasks = getTasksByStatus(column.key);
        const isHovered = draggedTask && hoveredColumn === column.key;

        return (
          <motion.div
            key={column.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="rounded-lg sm:rounded-xl p-3 sm:p-4"
            style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2 sm:pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <h3 className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>
                {column.title}
              </h3>
              <span
                className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium"
                style={{
                  backgroundColor: column.color + '20',
                  color: column.color
                }}
              >
                {columnTasks.length}
              </span>
            </div>

            {/* Droppable Area */}
            <div
              data-drop-zone={column.key}
              className={`space-y-2 sm:space-y-3 min-h-[300px] sm:min-h-[400px] p-2 sm:p-3 rounded-lg transition-all duration-200 relative ${
                isHovered ? 'ring-2 ring-opacity-50' : ''
              }`}
              style={{
                backgroundColor: isHovered ? column.color + '15' : 'transparent',
                borderColor: isHovered ? column.color : 'transparent',
                ringColor: isHovered ? column.color : 'transparent'
              }}
              onMouseEnter={() => handleColumnEnter(column.key)}
              onMouseLeave={handleColumnLeave}
            >
              {/* Overlay invisível para melhor detecção de drop */}
              <div
                className="absolute inset-0 pointer-events-none"
                data-drop-zone={column.key}
              />
              {columnTasks.map((task) => (
                <DraggableTask
                  key={task.id}
                  task={task}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}

              {/* Drop indicator quando hovering */}
              {isHovered && (
                <div
                  className="border-2 border-dashed rounded-lg p-4 mb-2 text-center"
                  style={{
                    borderColor: column.color,
                    backgroundColor: column.color + '10'
                  }}
                >
                  <p className="text-sm font-medium" style={{ color: column.color }}>
                    ✨ Solte aqui para mover para "{column.title}"
                  </p>
                </div>
              )}

              {/* Empty state */}
              {columnTasks.length === 0 && !isHovered && (
                <div className="text-center py-8 sm:py-12">
                  <div
                    className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: column.color + '15' }}
                  >
                    <div
                      className="w-4 h-4 sm:w-6 sm:h-6 rounded-full"
                      style={{ backgroundColor: column.color + '40' }}
                    />
                  </div>
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
                    Vazio
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default KanbanView;