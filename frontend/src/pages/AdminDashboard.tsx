import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { 
  Users, UserCheck, BarChart3, CheckCircle, XCircle, 
  LayoutDashboard, ClipboardList, Settings, Search, Filter, MessageSquare, Phone, Mail, Eye, X
} from 'lucide-react';
import AdminUserEditModal from '../components/AdminUserEditModal';
import UserProfileModal from '../components/UserProfileModal';

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
  is_active: boolean;
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

interface SupportTicket {
  id: number;
  user_id: number;
  username: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

type Tab = 'overview' | 'users' | 'requests' | 'approvals' | 'support';

const roleLabels: { [key: string]: string } = {
  'STUDENT': 'Estudiante',
  'TUTOR': 'Tutor',
  'ADMIN': 'Administrador'
};

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [allUsers, setUsers] = useState<User[]>([]);
  const [pendingTutors, setPendingTutors] = useState<Tutor[]>([]);
  const [subjectRequests, setSubjectRequests] = useState<SubjectRequest[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState('');
  
  // Modal State
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [viewingProfileId, setViewingProfileId] = useState<number | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      const [statsRes, tutorsRes, requestsRes, usersRes, supportRes] = await Promise.all([
        api.get('/users/admin/stats/'),
        api.get('/users/admin/tutors/'),
        api.get('/subjects/requests/'),
        api.get('/users/admin/users/'),
        api.get('/users/support/')
      ]);
      
      setStats(statsRes.data);
      setPendingTutors(Array.isArray(tutorsRes.data) ? tutorsRes.data : []);
      setSubjectRequests(Array.isArray(requestsRes.data) ? requestsRes.data : []);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setSupportTickets(Array.isArray(supportRes.data) ? supportRes.data : []);
      
    } catch (error: any) {
      console.error('Error fetching admin data', error);
      setError(error.response?.data?.detail || error.response?.data?.error || 'Error al cargar los datos del administrador.');
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-500 font-medium">Iniciando sistema central de administración...</p>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] -m-4 overflow-hidden bg-gray-50/50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-100 p-6 space-y-2 shadow-sm z-10 overflow-y-auto flex-shrink-0">
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
            <span className="ml-auto bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">{pendingTutors.length}</span>
          )}
        </button>

        <button 
          onClick={() => setActiveTab('support')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'support' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <MessageSquare className="w-5 h-5" /> Mensajes Soporte
          {supportTickets.filter(t => t.status === 'OPEN').length > 0 && (
            <span className="ml-auto bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">{supportTickets.filter(t => t.status === 'OPEN').length}</span>
          )}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        {error && (
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex items-center gap-3">
            <XCircle className="w-6 h-6" />
            <p className="font-bold">{error}</p>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-8">
              <h1 className="text-3xl font-black text-gray-900">Métricas Globales</h1>
              <p className="text-gray-500">Resumen del crecimiento y distribución de la plataforma.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                onClick={() => navigateToUsers()}
                className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group"
              >
                <div className="bg-blue-100 p-4 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Users className="w-8 h-8" /></div>
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Usuarios</p>
                  <h3 className="text-3xl font-black text-gray-900">{stats?.total_users || 0}</h3>
                </div>
              </div>
              
              {stats?.users_by_role?.map((roleStat) => (
                <div 
                  key={roleStat.role}
                  onClick={() => navigateToUsers(roleStat.role)}
                  className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6 cursor-pointer hover:border-purple-500 hover:shadow-md transition-all group"
                >
                  <div className="bg-purple-100 p-4 rounded-2xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors"><UserCheck className="w-8 h-8" /></div>
                  <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{roleLabels[roleStat.role] || roleStat.role}</p>
                    <h3 className="text-3xl font-black text-gray-900">{roleStat.count}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-black text-gray-900">Gestión de Usuarios</h1>
                <p className="text-gray-500">Lista completa de estudiantes, tutores y administradores.</p>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre, email o rol..."
                  className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 shadow-sm"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                />
              </div>
            </header>

            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 bg-gray-50/50">
                      <th className="px-6 py-4 text-center">ID</th>
                      <th className="px-6 py-4">Usuario</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4 text-center">Rol</th>
                      <th className="px-6 py-4 text-center">Estado</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {allUsers
                      .filter(u => {
                        const searchLower = userFilter.toLowerCase();
                        const roleEs = roleLabels[u.role]?.toLowerCase() || '';
                        return (
                          u.username.toLowerCase().includes(searchLower) || 
                          u.email.toLowerCase().includes(searchLower) ||
                          roleEs.includes(searchLower) ||
                          (u.first_name + ' ' + u.last_name).toLowerCase().includes(searchLower)
                        );
                      })
                      .map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-gray-400 font-mono text-center">#{u.id}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{u.first_name} {u.last_name}</p>
                          <p className="text-xs text-gray-400 font-normal">@{u.username}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{u.email}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${u.role === 'TUTOR' ? 'bg-blue-100 text-blue-700' : u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                            {roleLabels[u.role] || u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`w-2.5 h-2.5 rounded-full inline-block ${u.is_active ? 'bg-green-500' : 'bg-red-500'} shadow-sm shadow-black/10`}></span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button 
                            onClick={() => setSelectedUserId(u.id)}
                            className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all"
                           >
                            Ver Detalle
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-8">
              <h1 className="text-3xl font-black text-gray-900">Mensajes de Soporte</h1>
              <p className="text-gray-500">Gestión de tickets y solicitudes de contacto.</p>
            </header>

            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              {supportTickets.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 bg-gray-50/50">
                        <th className="px-6 py-4">Usuario</th>
                        <th className="px-6 py-4">Asunto</th>
                        <th className="px-6 py-4">Mensaje</th>
                        <th className="px-6 py-4 text-center">Estado</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {supportTickets.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <button 
                              onClick={(e) => { e.preventDefault(); setViewingProfileId(t.user_id); }}
                              className="font-bold text-gray-900 hover:text-blue-600 transition-colors text-left group"
                            >
                              @{t.username}
                              <span className="block text-[10px] text-blue-500 font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">Ver Perfil</span>
                            </button>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">{t.subject}</td>
                          <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={t.message}>{t.message}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${t.status === 'OPEN' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={(e) => { e.preventDefault(); setSelectedTicket(t); }}
                                className="bg-blue-50 text-blue-600 p-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                title="Ver Mensaje Completo"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <a 
                                href={`mailto:${allUsers.find(u => u.id === t.user_id)?.email || ''}`} 
                                className="bg-gray-50 text-gray-600 p-2.5 rounded-xl hover:bg-gray-200 transition-all border border-gray-100 shadow-sm"
                              >
                                <Mail className="w-4 h-4" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-20 text-center text-gray-400 font-bold">No hay mensajes de soporte.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'approvals' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-8">
              <h1 className="text-3xl font-black text-gray-900">Altas de Tutores</h1>
              <p className="text-gray-500">Revisa y aprueba nuevos profesionales para la plataforma.</p>
            </header>
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm p-20 text-center text-gray-400">
              <p className="font-bold mb-2">Sección de Altas Integrada</p>
              <p className="text-sm">Por ahora, utiliza la Gestión de Usuarios para ver y activar perfiles.</p>
            </div>
          </div>
        )}
        
        {activeTab === 'requests' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-8">
              <h1 className="text-3xl font-black text-gray-900">Supervisión de Mercado</h1>
              <p className="text-gray-500">Control de propuestas enviadas por la comunidad.</p>
            </header>
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm p-20 text-center text-gray-400">
               Utiliza el menú superior "Mercado de Clases" para ver todas las propuestas.
            </div>
          </div>
        )}
      </main>

      {/* MODALES */}
      
      {/* 1. Modal Detalle Mensaje Soporte */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20 flex flex-col">
            <div className="bg-blue-600 p-8 text-white flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl"><MessageSquare className="w-5 h-5" /></div>
                <h3 className="font-bold text-xl">Detalle del Mensaje</h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="hover:bg-white/20 p-2 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto">
              <div className="flex justify-between items-start bg-gray-50 p-4 rounded-3xl border border-gray-100">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Remitente</p>
                  <p className="font-bold text-gray-900 text-lg">@{selectedTicket.username}</p>
                </div>
                <button 
                  onClick={() => { setViewingProfileId(selectedTicket.user_id); setSelectedTicket(null); }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  Ver Perfil
                </button>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Asunto</p>
                <p className="font-bold text-gray-900 text-xl px-1">{selectedTicket.subject}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mensaje completo</p>
                <div className="bg-blue-50/30 p-6 rounded-[2rem] text-sm text-gray-700 leading-relaxed border border-blue-50 max-h-60 overflow-y-auto whitespace-pre-wrap">
                  {selectedTicket.message}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-8 flex justify-end gap-3 border-t border-gray-100 flex-shrink-0">
               <button onClick={() => setSelectedTicket(null)} className="px-6 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Cerrar</button>
               <a 
                href={`mailto:${allUsers.find(u => u.id === selectedTicket.user_id)?.email || ''}`}
                className="bg-gray-900 text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-black transition-all flex items-center gap-2 shadow-xl shadow-gray-200"
               >
                 <Mail className="w-4 h-4" /> Responder ahora
               </a>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Gestión de Usuario */}
      {selectedUserId && (
        <AdminUserEditModal 
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onSuccess={() => fetchData()}
        />
      )}

      {/* 3. Modal Perfil Público */}
      {viewingProfileId && (
        <UserProfileModal 
          userId={viewingProfileId}
          onClose={() => setViewingProfileId(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
