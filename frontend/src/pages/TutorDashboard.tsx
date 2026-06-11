import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Calendar, Clock, User, BookOpen, CheckCircle, Upload, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Session {
  id: number;
  subject: { name: string };
  student: {
    user: {
      first_name: string;
      last_name: string;
      username: string;
    }
  };
  start_time: string;
  end_time: string;
  status: string;
  notes: string;
}

const TutorDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFor, setUploadingFor] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/sessions/');
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/sessions/${id}/status/`, { status });
      fetchSessions();
    } catch (error) {
      alert('Error al actualizar estado');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !uploadingFor) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);

    try {
      await api.post(`/sessions/${uploadingFor}/materials/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Material subido con éxito');
      setUploadingFor(null);
      setFile(null);
      setTitle('');
    } catch (error) {
      alert('Error al subir material');
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando dashboard de tutor...</div>;

  return (
    <div className="space-y-8 p-4">
      <header>
        <h1 className="text-3xl font-black text-gray-900">Mi Panel de Tutor</h1>
        <p className="text-gray-500">Gestiona tus clases y comparte material con tus alumnos.</p>
      </header>

      <div className="grid gap-6">
        {sessions.map((session) => (
          <div key={session.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex gap-4">
                <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[80px]">
                  <span className="text-xs font-bold uppercase">{format(parseISO(session.start_time), 'MMM', { locale: es })}</span>
                  <span className="text-2xl font-black">{format(parseISO(session.start_time), 'dd')}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {session.status}
                    </span>
                    <h3 className="font-bold text-gray-900">{session.subject.name}</h3>
                  </div>
                  <div className="text-sm text-gray-500 flex flex-col gap-1">
                    <div className="flex items-center gap-2"><User className="w-3.5 h-3.5" /> Alumno: {session.student.user.first_name} {session.student.user.last_name}</div>
                    <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {format(parseISO(session.start_time), 'HH:mm')} - {format(parseISO(session.end_time), 'HH:mm')}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {session.status === 'SCHEDULED' && (
                  <button 
                    onClick={() => updateStatus(session.id, 'COMPLETED')}
                    className="flex-1 md:flex-none bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Finalizar
                  </button>
                )}
                <button 
                  onClick={() => setUploadingFor(session.id)}
                  className="flex-1 md:flex-none bg-blue-100 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-200 transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" /> Subir Material
                </button>
              </div>
            </div>

            {uploadingFor === session.id && (
              <div className="bg-blue-50/50 p-6 border-t border-blue-100">
                <form onSubmit={handleUpload} className="max-w-md space-y-4">
                  <h4 className="font-bold text-blue-900 text-sm">Compartir material para esta clase</h4>
                  <input 
                    type="text" 
                    placeholder="Título del material (ej: Guía de Ejercicios)"
                    className="w-full px-4 py-2 rounded-lg border border-blue-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                  <input 
                    type="file" 
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-xs font-bold">Subir</button>
                    <button type="button" onClick={() => setUploadingFor(null)} className="text-gray-500 text-xs font-bold">Cancelar</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TutorDashboard;
