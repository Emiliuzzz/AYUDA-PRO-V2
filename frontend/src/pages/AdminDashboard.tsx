import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Users, UserCheck, BarChart3, CheckCircle, XCircle } from 'lucide-react';

interface Stats {
  total_users: number;
  users_by_role: { role: string; count: number }[];
  users_per_month: { month: string; count: number }[];
}

interface Tutor {
  id: number;
  user: {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  bio: string;
  hourly_rate: string;
}

interface SubjectRequest {
  id: number;
  student: {
    user: {
      first_name: string;
      last_name: string;
      username: string;
    }
  };
  subject_name: string;
  description: string;
  status: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingTutors, setPendingTutors] = useState<Tutor[]>([]);
  const [subjectRequests, setSubjectRequests] = useState<SubjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      const [statsRes, tutorsRes, requestsRes] = await Promise.all([
        api.get('/users/admin/stats/'),
        api.get('/users/admin/tutors/'),
        api.get('/subjects/requests/')
      ]);
      setStats(statsRes.data);
      setPendingTutors(tutorsRes.data);
      setSubjectRequests(requestsRes.data);
    } catch (error: any) {
      console.error('Error fetching admin data', error);
      setError(error.response?.data?.error || 'No se pudieron cargar los datos del administrador. Verifica tus permisos.');
    } finally {
      setLoading(false);
    }
  };

  const approveTutor = async (id: number) => {
    try {
      await api.post(`/users/admin/tutors/${id}/approve/`);
      fetchData();
    } catch (error) {
      alert('Error al aprobar tutor');
    }
  };

  const resolveRequest = async (id: number, status: string) => {
    try {
      await api.patch(`/subjects/requests/${id}/action/`, { status });
      fetchData();
    } catch (error) {
      alert('Error al actualizar solicitud');
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando panel de administración...</div>;

  return (
    <div className="space-y-8 p-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex items-center gap-3">
          <XCircle className="w-6 h-6" />
          <div>
            <p className="font-bold">Error de Acceso</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      )}

      <header>
        <h1 className="text-3xl font-black text-gray-900">Panel de Administración</h1>
        <p className="text-gray-500">Gestión global de la plataforma Ayuda Pro.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Users className="w-6 h-6" /></div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Usuarios</p>
            <h3 className="text-2xl font-black text-gray-900">{stats?.total_users || 0}</h3>
          </div>
        </div>
        
        {stats?.users_by_role?.map((roleStat) => (
          <div key={roleStat.role} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-xl text-purple-600"><UserCheck className="w-6 h-6" /></div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{roleStat.role}</p>
              <h3 className="text-2xl font-black text-gray-900">{roleStat.count}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Tutors */}
      <section className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" /> Tutores Pendientes de Aprobación
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          {pendingTutors.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                  <th className="px-6 py-4">Tutor</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Tarifa</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingTutors.map((tutor) => (
                  <tr key={tutor.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{tutor.user.first_name} {tutor.user.last_name}</div>
                      <div className="text-xs text-gray-400">@{tutor.user.username}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{tutor.user.email}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">${tutor.hourly_rate}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => approveTutor(tutor.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2 ml-auto"
                      >
                        <CheckCircle className="w-4 h-4" /> Aprobar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-10 text-center text-gray-500">
              No hay tutores pendientes en este momento.
            </div>
          )}
        </div>
      </section>

      {/* Subject Requests */}
      <section className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" /> Solicitudes de Materias/Tutores
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          {subjectRequests.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                  <th className="px-6 py-4">Materia Solicitada</th>
                  <th className="px-6 py-4">Estudiante</th>
                  <th className="px-6 py-4">Descripción</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subjectRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{req.subject_name}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{req.student.user.first_name}</div>
                      <div className="text-xs text-gray-400">@{req.student.user.username}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={req.description}>
                      {req.description}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                        req.status === 'FULFILLED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.status === 'PENDING' && (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => resolveRequest(req.id, 'FULFILLED')}
                            className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-all"
                            title="Marcar como Resuelta"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => resolveRequest(req.id, 'REJECTED')}
                            className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-all"
                            title="Rechazar"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-10 text-center text-gray-500">
              No hay solicitudes de materias pendientes.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
