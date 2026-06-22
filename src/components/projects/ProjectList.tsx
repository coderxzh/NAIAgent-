import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { projectService } from '@/services/projectService';
import { useAppState } from '@/context/AppStateContext';
import { useView } from '@/context/ViewContext';
import { useTheme } from '@/hooks/use-theme';
import ProjectForm from './ProjectForm';
import type { Project } from '@/types/domain';
import { Folder, Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProjectList() {
  const { cls, t } = useTheme();
  const { setCurrentProject } = useAppState();
  const { navigateTo } = useView();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (project: Project) => {
    if (!confirm(t.deleteProjectConfirm.replace('{name}', project.name))) return;
    await projectService.delete(project.id);
    load();
  };

  const handleSelect = (project: Project) => {
    setCurrentProject(project);
    navigateTo('kbList', { projectId: project.id });
  };

  const handleCreateKb = (project: Project) => {
    setCurrentProject(project);
    navigateTo('kbList', { projectId: project.id });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-6 flex-1 flex items-center justify-center">
        <EmptyState
          icon={<Folder className="w-10 h-10" />}
          title={t.noProjects}
          description={t.noProjectsDesc}
          action={
            <Button
              onClick={() => {
                setEditingProject(null);
                setFormOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t.createProject}
            </Button>
          }
        />
        <ProjectForm
          open={formOpen}
          onOpenChange={setFormOpen}
          onSuccess={load}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t.projectsTitle}</h2>
        <Button
          onClick={() => {
            setEditingProject(null);
            setFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t.createProject}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card
            key={project.id}
            className={cn(
              'p-5 transition-all hover:shadow-md',
              cls('bg-white', 'bg-[#1c1c1f]'),
            )}
          >
            <div className="flex items-start justify-between">
              <div
                className="flex items-center gap-3 cursor-pointer flex-1"
                onClick={() => handleSelect(project)}
              >
                <div className="w-10 h-10 rounded-xl bg-[#F37021]/10 flex items-center justify-center">
                  <Folder className="w-5 h-5 text-[#F37021]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{project.name}</h3>
                  <p
                    className={cn(
                      'text-xs mt-0.5',
                      cls('text-gray-500', 'text-zinc-400'),
                    )}
                  >
                    {project.description || '—'}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateKb(project);
                  }}
                  className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-500"
                  title="创建知识库"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingProject(project);
                    setFormOpen(true);
                  }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(project);
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <ProjectForm
        open={formOpen}
        onOpenChange={setFormOpen}
        project={editingProject}
        onSuccess={load}
      />
    </div>
  );
}
