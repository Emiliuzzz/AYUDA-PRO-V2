import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Calendar, Clock, BookOpen, User, Tag, AlertCircle, FileText, Download, Star } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import ReviewModal from '../components/ReviewModal';
import UserProfileModal from '../components/UserProfileModal';

interface Material {
  id: number;
  title: string;
  file: string;
  uploaded_at: string;
}

interface Session {
  id: number;
  subject: { name: string };
  tutor: {
    user: {
      id: number;
      first_name: string;
      last_name: string;
      username: string;
    }
  };
  student: {
    user: {
      id: number;
      first_name: string;
      last_name: string;
      username: string;
    }
  };
  start_time: string;
  end_time: string;
  status: string;
  meeting_link: string | null;
  notes: string;
  materials?: Material[];
}

const statusColors: { [key: string]: string } = {
  'SCHEDULED': 'bg-blue-100 text-blue-700 border-blue-200',
  'COMPLETED': 'bg-green-100 text-green-700 border-green-200',
  'CANCELED': 'bg-red-100 text-red-700 border-red-200',
  'IN_PROGRESS': 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

const statusLabels: { [key: string]: string } = {
  'SCHEDULED': 'Programada',
  'COMPLETED': 'Completada',
  'CANCELED': 'Cancelada',
  'IN_PROGRESS': 'En curso',
};

const Sessions: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionForReview, setSelectedSessionForReview] = useState<Session | null>(null);
  const [viewingProfileId, setViewingProfileId] = useState<number | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/sessions/');
      const sessionsData = response.data;
      
      if (Array.isArray(sessionsData)) {
        const sessionsWithMaterials = await Promise.all(
          sessionsData.map(async (s: Session) => {
            try {
              const mRes = await api.get(`/sessions/${s.id}/materials/`);
              return { ...s, materials: Array.isArray(mRes.data) ? mRes.data : [] };
            } catch {
              return { ...s, materials: [] };
            }
          })
        );
        setSessions(sessionsWithMaterials);
      }
    } catch (error) {
      console.error('Error fetching sessions', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-500 font-medium">Cargando tus sesiones académicas...</p>
    </div>
  );

  return (
    <div className="px-4">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Sesiones</h1>
        <p className="text-gray-600 text-lg">Gestiona tus próximas ayudantías y revisa tu historial académico.</p>
      </header>

      {Array.isArray(sessions) && sessions.length > 0 ? (
        <div className="grid gap-6">
          {sessions.map((session) => (
            <div key={session.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:border-blue-100 transition-colors">
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex gap-6">
                  <div className="hidden md:flex flex-col items-center justify-center bg-blue-50 text-blue-600 rounded-2xl px-6 min-w-[120px]">
                    <span className="text-sm font-bold uppercase tracking-tighter">
                      {format(parseISO(session.start_time), 'MMM', { locale: es })}
                    </span>
                    <span className="text-3xl font-black">
                      {format(parseISO(session.start_time), 'dd')}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[session.status] || 'bg-gray-100'}`}>
                        {statusLabels[session.status] || session.status}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      {session.subject?.name || 'Materia'}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-500">
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors group"
                        onClick={() => {
                          const id = user?.role === 'STUDENT' ? session.tutor?.user?.id : session.student?.user?.id;
                          if (id) setViewingProfileId(id);
                        }}
                      >
                        <User className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                        <span className="font-medium">{user?.role === 'STUDENT' ? 'Tutor:' : 'Alumno:'}</span> {
                          user?.role === 'STUDENT' 
                            ? (session.tutor?.user?.first_name || session.tutor?.user?.username || 'Tutor')
                            : (session.student?.user?.first_name || session.student?.user?.username || 'Alumno')
                        }
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {format(parseISO(session.start_time), 'HH:mm')} - {format(parseISO(session.end_time), 'HH:mm')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3">
                  {session.meeting_link && session.status === 'SCHEDULED' && (
                    <a 
                      href={session.meeting_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-center hover:bg-blue-700 transition-all"
                    >
                      Unirse a Clase
                    </a>
                  )}
                  {user?.role === 'STUDENT' && session.status === 'COMPLETED' && (
                    <button 
                      onClick={() => setSelectedSessionForReview(session)}
                      className="bg-yellow-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-yellow-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Star className="w-4 h-4" /> Calificar Clase
                    </button>
                  )}
                </div>
              </div>
              
              {session.materials && session.materials.length > 0 && (
                <div className="bg-blue-50/30 px-6 md:px-8 py-4 border-t border-blue-50">
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> Material compartido
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {session.materials.map((material) => (
                      <a 
                        key={material.id}
                        href={material.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white border border-blue-100 px-3 py-2 rounded-lg text-xs font-medium text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5" /> {material.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {session.notes && (
                <div className="bg-gray-50/50 px-6 md:px-8 py-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Tag className="w-3 h-3" /> Notas
                  </p>
                  <p className="text-sm text-gray-600 italic">"{session.notes}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 max-w-4xl mx-auto">
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-blue-200" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Aún no tienes sesiones agendadas</h3>
          <p className="text-gray-500 mb-8">Comienza explorando a nuestros tutores y agenda tu primera clase hoy mismo.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            Explorar Tutores
          </button>
        </div>
      )}

      {selectedSessionForReview && (
        <ReviewModal 
          sessionId={selectedSessionForReview.id}
          subjectName={selectedSessionForReview.subject?.name || 'Materia'}
          tutorName={selectedSessionForReview.tutor?.user?.first_name || selectedSessionForReview.tutor?.user?.username || 'Tutor'}
          onClose={() => setSelectedSessionForReview(null)}
          onSuccess={() => {
            setSelectedSessionForReview(null);
            fetchSessions();
          }}
        />
      )}

      {viewingProfileId && (
        <UserProfileModal 
          userId={viewingProfileId}
          onClose={() => setViewingProfileId(null)}
        />
      )}
    </div>
  );
};

export default Sessions;
