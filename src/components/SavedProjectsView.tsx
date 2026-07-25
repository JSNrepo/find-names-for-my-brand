import React, { useEffect, useState } from 'react';
import { NamingProject, ValidatedName } from '../types';
import { FolderKanban, Star, Calendar, ArrowRight, Trash2, Edit3, Save, CheckCircle2 } from 'lucide-react';

interface SavedProjectsViewProps {
  onOpenProject: (proj: NamingProject) => void;
  onNewProject: () => void;
}

export const SavedProjectsView: React.FC<SavedProjectsViewProps> = ({ onOpenProject, onNewProject }) => {
  const [projects, setProjects] = useState<NamingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<NamingProject | null>(null);
  const [projectNotes, setProjectNotes] = useState('');

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then((data: NamingProject[]) => {
        setProjects(data);
        if (data.length > 0) {
          setSelectedProject(data[0]);
          setProjectNotes(data[0].notes || '');
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      const filtered = projects.filter(p => p.id !== projectId);
      setProjects(filtered);
      if (selectedProject?.id === projectId) {
        setSelectedProject(filtered[0] || null);
        setProjectNotes(filtered[0]?.notes || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNotes = () => {
    if (!selectedProject) return;
    const updated = { ...selectedProject, notes: projectNotes };
    setSelectedProject(updated);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    fetch(`/api/projects/${selectedProject.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: projectNotes })
    }).catch(console.error);
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-emerald-400" />
            <span>Saved Naming Projects</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Access your saved brand names and business naming brief history.
          </p>
        </div>

        <button
          id="btn-saved-new-proj"
          onClick={onNewProject}
          className="px-5 py-2.5 rounded-xl bg-zinc-100 text-zinc-950 font-extrabold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-sm"
        >
          + Create New Project
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-zinc-500 italic text-xs">Loading saved projects...</div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900/40 border border-zinc-800/80 rounded-3xl space-y-4">
          <p className="text-zinc-400 text-sm">No saved projects found yet.</p>
          <button
            onClick={onNewProject}
            className="px-6 py-3 rounded-xl bg-zinc-100 text-zinc-950 font-bold text-xs uppercase tracking-wider hover:bg-white"
          >
            Start Your First Naming Brief
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Projects List Sidebar */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Projects ({projects.length})</h3>
            <div className="space-y-2">
              {projects.map(p => (
                <div
                  key={p.id}
                  className={`w-full p-4 rounded-2xl border transition-all ${
                    selectedProject?.id === p.id 
                      ? 'bg-zinc-900 border-zinc-700 text-white shadow-sm' 
                      : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700 text-zinc-400'
                  }`}
                >
                  <button
                    onClick={() => { setSelectedProject(p); setProjectNotes(p.notes || ''); }}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white truncate max-w-[180px]">{p.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 uppercase font-medium border border-zinc-800">
                        {p.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{p.brief?.description}</p>
                  </button>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-3 pt-2 border-t border-zinc-800/80">
                    <span>{p.savedCandidates?.length || 0} Saved Names</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteProject(p.id); }}
                      className="text-red-400 hover:text-red-300 p-1 flex items-center gap-1 font-bold"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Project Detailed View */}
          {selectedProject && (
            <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedProject.title}</h2>
                  <p className="text-xs text-zinc-400 mt-1">{selectedProject.brief?.productType}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteProject(selectedProject.id)}
                    className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-bold text-xs transition-all flex items-center gap-1.5 min-h-[38px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>

                  <button
                    onClick={() => onOpenProject(selectedProject)}
                    className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-950 font-extrabold text-xs uppercase tracking-wider hover:bg-white transition-all flex items-center gap-1.5 shadow-sm min-h-[38px]"
                  >
                    <span>Reopen & Run</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Brief Summary */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs space-y-2">
                <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px] block">Brief Description</span>
                <p className="text-zinc-300 leading-relaxed">{selectedProject.brief?.description}</p>
              </div>

              {/* Saved Names */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Saved Brand Names ({selectedProject.savedCandidates?.length || 0})
                </h3>

                {selectedProject.savedCandidates?.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">No brand names saved in this project yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedProject.savedCandidates?.map((vn: ValidatedName) => (
                      <div key={vn.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-white text-lg">{vn.candidate.name}</span>
                          <span className="text-xs font-bold text-emerald-400">Score: {vn.finalScore}</span>
                        </div>
                        <p className="text-xs text-zinc-400">{vn.candidate.pronunciation} • {vn.candidate.category}</p>
                        <p className="text-[11px] text-zinc-500 line-clamp-2">{vn.candidate.semanticConnection}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Project Notes Section */}
              <div className="space-y-2 pt-4 border-t border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Project Notes & Feedback</label>
                  <button
                    onClick={handleSaveNotes}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Notes</span>
                  </button>
                </div>
                <textarea
                  value={projectNotes}
                  onChange={e => setProjectNotes(e.target.value)}
                  rows={3}
                  placeholder="Record client notes, favorite brand name shortlists, or notes..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-xs text-white focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
