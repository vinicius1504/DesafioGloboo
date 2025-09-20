import { useParams } from '@tanstack/react-router';

export default function TaskDetail() {
  const { taskId } = useParams({ strict: false });

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
          Task Detail
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Detalhes da tarefa ID: {taskId}
        </p>
      </div>
    </div>
  );
}