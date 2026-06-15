import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { BookOpen, DollarSign, Send, ClipboardList, CheckCircle, Clock, User, Calendar, Shield } from 'lucide-react';
import SubjectRequestModal from '../components/SubjectRequestModal';
import UserProfileModal from '../components/UserProfileModal';
import { useAuth } from '../context/AuthContext';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Subject {
  id: number;
  name: string;
  category: string;
}

interface Proposal {
  id: number;
  student: {
    user: {
      id: number;
      first_name: string;
      last_name: string;
      username: string;
    }
  };
  subject: { name: string } | null;
  subject_name: string;
  description: string;
  proposed_price: string;
  preferred_datetime: string;
  status: string;
  created_at: string;
}

const Marketplace: React.FC = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewingProfileId, setViewingProfileId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjectsRes, proposalsRes] = await Promise.all([
        api.get('/subjects/'),
        api.get('/subjects/requests/')
      ]);
      if (Array.isArray(subjectsRes.data)) setSubjects(subjectsRes.data);
      if (Array.isArray(proposalsRes.data)) setProposals(proposalsRes.data);
    } catch (error) {
      console.error('Error fetching marketplace data', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptProposal = async (id: number) => {
    try {
      await api.post(`/subjects/requests/${id}/accept/`);
      setSuccessMessage('¡Clase aceptada! Se ha añadido a tus sesiones.');
      fetchData();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al aceptar la propuesta');
    }
  };

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-500 font-medium">Sincronizando el mercado de clases...</p>
    </div>
  );

  const isAdmin = user?.role === 'ADMIN' || user?.is_superuser;
  const isTutor = user?.role === 'TUTOR';
  const isStudent = user?.role === 'STUDENT';

  return (
    <div className="space-y-10 p-4">
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-right">
          <CheckCircle className="w-5 h-5" />
          <span className="font-bold text-sm">{successMessage}</span>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Mercado de Tutorías</h1>
          <p className="text-gray-500">
            {isStudent && 'Solicita una clase personalizada y define cuánto quieres pagar.'}
            {isTutor && 'Encuentra alumnos buscando ayuda y acepta sus ofertas.'}
            {isAdmin && 'Panel de control de propuestas y solicitudes de la comunidad.'}
          </p>
        </div>
        {isStudent && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
          >
            <Send className="w-5 h-5" /> Crear Nueva Propuesta
          </button>
        )}
      </header>

      {(isTutor || isAdmin) ? (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            {isAdmin ? <Shield className="w-6 h-6 text-red-600" /> : <ClipboardList className="w-6 h-6 text-blue-600" />}
            {isAdmin ? 'Todas las Propuestas del Mercado' : 'Propuestas Disponibles'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(proposals) && proposals
              .filter(p => isAdmin ? true : p.status === 'PENDING')
              .map((prop) => (
              <div key={prop.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:border-blue-500 transition-all flex flex-col">
                <div className="p-6 flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                      {prop.subject?.name || prop.subject_name}
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-green-600 font-black text-lg">
                        {formatCLP(Number(prop.proposed_price))}
                      </div>
                      {isAdmin && (
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${prop.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          {prop.status}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 
                      className="font-bold text-gray-900 mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => setViewingProfileId(prop.student.user.id)}
                    >
                      Propuesta de {prop.student.user.first_name || prop.student.user.username}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3 italic">"{prop.description}"</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="font-bold">Horario sugerido:</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl text-sm font-bold text-gray-700">
                      {prop.preferred_datetime 
                        ? format(parseISO(prop.preferred_datetime), "EEEE d 'de' MMMM, HH:mm", { locale: es })
                        : 'Cualquier horario'}
                    </div>
                  </div>
                </div>
                
                {isTutor && prop.status === 'PENDING' && (
                  <div className="p-4 bg-gray-50/50 border-t border-gray-50">
                    <button 
                      onClick={() => acceptProposal(prop.id)}
                      className="w-full bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all"
                    >
                      Aceptar y Agendar (1h)
                    </button>
                  </div>
                )}

                {isAdmin && (
                  <div className="p-4 bg-gray-50 border-t border-gray-50 text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Solo Vista de Administrador</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          {Array.isArray(proposals) && proposals.length === 0 && (
            <div className="py-20 text-center text-gray-400 font-bold bg-white rounded-3xl border-2 border-dashed border-gray-100">
              No hay propuestas en este momento.
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Available Subjects */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" /> Materias Disponibles para Proponer
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.isArray(subjects) && subjects.map((subject) => (
                <div key={subject.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-300 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <BookOpen className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{subject.name}</h3>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-4">{subject.category || 'General'}</p>
                  {isStudent && (
                    <button 
                      onClick={() => setShowModal(true)}
                      className="w-full py-2 bg-gray-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all"
                    >
                      Proponer esta clase
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-purple-600" /> Mis Propuestas
            </h2>
            <div className="space-y-4">
              {Array.isArray(proposals) && proposals.length > 0 ? (
                proposals.map((prop) => (
                  <div key={prop.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        prop.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                        prop.status === 'FULFILLED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {prop.status}
                      </span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(prop.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">{prop.subject?.name || prop.subject_name}</h4>
                    <div className="flex items-center gap-1 text-green-600 font-black text-sm mb-3">
                      <DollarSign className="w-4 h-4" /> {formatCLP(Number(prop.proposed_price))} <span className="text-[10px] text-gray-400 font-normal">/ hora</span>
                    </div>
                    {prop.status === 'PENDING' && (
                      <p className="text-xs text-gray-500 italic">Esperando que un tutor acepte tu oferta...</p>
                    )}
                    {prop.status === 'FULFILLED' && (
                      <p className="text-xs text-green-600 font-bold">¡Propuesta aceptada!</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <p className="text-sm text-gray-400">No has enviado propuestas aún.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <SubjectRequestModal 
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setSuccessMessage('¡Propuesta enviada con éxito!');
            fetchData();
            setTimeout(() => setSuccessMessage(''), 5000);
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

export default Marketplace;
