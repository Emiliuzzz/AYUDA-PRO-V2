import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { 
  Users, UserCheck, BarChart3, CheckCircle, XCircle, 
  LayoutDashboard, ClipboardList, Settings, Search, Filter 
} from 'lucide-react';

interface Stats {
  total_users: number;
  users_by_role: { role: string; count: number }[];
  users_per_month: { month: string; count: number }[];
}

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
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

type Tab = 'overview' | 'users' | 'requests' | 'approvals';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [allUsers, setUsers] = useState<User[]>([]);
  const [pendingTutors, setPendingTutors] = useState<Tutor[]>([]);
  const [subjectRequests, setSubjectRequests] = useState<SubjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      const [statsRes, tutorsRes, requestsRes, usersRes] = await Promise.all([
        api.get('/users/admin/stats/'),
        api.get('/users/admin/tutors/'),
        api.get('/subjects/requests/'),
        api.get('/users/admin/users/')
      ]);
      setStats(statsRes.data);
      setPendingTutors(tutorsRes.data);
      setSubjectRequests(requestsRes.data);
      setUsers(usersRes.data);
    } catch (error: any) {
      console.error('Error fetching admin data', error);
      setError(error.response?.data?.error || 'Error al cargar los datos.');
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

  const navigateToUsers = (role?: string) => {
    setUserFilter(role || '');
    setActiveTab('users');
  };

  if (loading) return <div className="p-8 text-center">Cargando sistema de administración...</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] -m-4">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-100 p-6 space-y-2">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-3">Navegación</p>
        
        <button 
          onClick={() => setActiveTab('overview')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <LayoutDashboard className="w-5 h-5" /> Métricas Globales
        </button>

        <button 
          onClick={() => setActiveTab('users')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Users className="w-5 h-5" /> Gestión de Usuarios
        </button>

        <button 
          onClick={() => setActiveTab('requests')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'requests' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <ClipboardList className="w-5 h-5" /> Solicitudes
        </button>

        <button 
          onClick={() => setActiveTab('approvals')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'approvals' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <UserCheck className="w-5 h-5" /> Altas de Tutores
          {pendingTutors.length > 0 && (
            <span className="ml-auto bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingTutors.length}</span>
          )}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8 bg-gray-50/50">
        {error && (
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex items-center gap-3">
            <XCircle className="w-6 h-6" />
            <p className="font-bold">{error}</p>
          </div>
        )}

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <>
            <header>
              <h1 className="text-3xl font-black text-gray-900">Métricas Globales</h1>
              <p className="text-gray-500">Resumen del crecimiento y distribución de la plataforma.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                onClick={() => navigateToUsers()}
                className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6 cursor-pointer hover:border-blue-500 transition-all"
              >
                <div className="bg-blue-100 p-4 rounded-2xl text-blue-600"><Users className="w-8 h-8" /></div>
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Usuarios</p>
                  <h3 className="text-3xl font-black text-gray-900">{stats?.total_users || 0}</h3>
                </div>
              </div>
              
              {stats?.users_by_role?.map((roleStat) => (
                <div 
                  key={roleStat.role}
                  onClick={() => navigateToUsers(roleStat.role)}
                  className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6 cursor-pointer hover:border-blue-500 transition-all"
                >
                  <div className="bg-purple-100 p-4 rounded-2xl text-purple-600"><UserCheck className="w-8 h-8" /></div>
                  <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{roleStat.role}</p>
                    <h3 className="text-3xl font-black text-gray-900">{roleStat.count}</h3>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Tab: Users */}
        {activeTab === 'users' && (
          <>
            <header className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black text-gray-900">Gestión de Usuarios</h1>
                <p className="text-gray-500">Lista completa de estudiantes, tutores y administradores.</p>
              </div>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar por nombre o email..."
                    className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                  />
                </div>
              </div>
            </header>

            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                    <th className="px-6 py-4 text-center">ID</th>
                    <th className="px-6 py-4">Usuario</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4 text-center">Rol</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allUsers
                    .filter(u => 
                      u.username.toLowerCase().includes(userFilter.toLowerCase()) || 
                      u.email.toLowerCase().includes(userFilter.toLowerCase()) ||
                      u.role.toLowerCase().includes(userFilter.toLowerCase())
                    )
                    .map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors text-sm">
                      <td className="px-6 py-4 text-gray-400 font-mono text-center">#{user.id}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">{user.first_name} {user.last_name} <br/><span className="text-xs text-gray-400 font-normal">@{user.username}</span></td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${user.role === 'TUTOR' ? 'bg-blue-100 text-blue-700' : user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-blue-600 cursor-pointer hover:underline">Ver Detalle</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Tab: Approvals */}
        {activeTab === 'approvals' && (
          <>
            <header>
              <h1 className="text-3xl font-black text-gray-900">Altas de Tutores</h1>
              <p className="text-gray-500">Revisa y aprueba nuevos profesionales para la plataforma.</p>
            </header>

            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
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
                <div className="p-20 text-center text-gray-500 flex flex-col items-center gap-4">
                  <div className="bg-gray-50 p-4 rounded-full"><UserCheck className="w-10 h-10 text-gray-200" /></div>
                  <p className="font-bold">No hay tutores pendientes en este momento.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Tab: Requests */}
        {activeTab === 'requests' && (
          <>
            <header>
              <h1 className="text-3xl font-black text-gray-900">Solicitudes de Estudiantes</h1>
              <p className="text-gray-500">Materias y tutores que la comunidad está pidiendo.</p>
            </header>

            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              {subjectRequests.length > 0 ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                      <th className="px-6 py-4">Materia Solicitada</th>
                      <th className="px-6 py-4">Estudiante</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {subjectRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{req.subject_name}</div>
                          <div className="text-xs text-gray-400 line-clamp-1">{req.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{req.student.user.first_name}</div>
                          <div className="text-xs text-gray-400">@{req.student.user.username}</div>
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
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => resolveRequest(req.id, 'REJECTED')}
                                className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-all"
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
                <div className="p-20 text-center text-gray-500">No hay solicitudes pendientes.</div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
