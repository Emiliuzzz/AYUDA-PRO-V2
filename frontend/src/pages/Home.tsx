import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { User, Star, Book, CheckCircle, TrendingUp, Users, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';
import SubjectRequestModal from '../components/SubjectRequestModal';

interface Tutor {
  id: number;
  user: {
    username: string;
    first_name: string;
    last_name: string;
  };
  bio: string;
  hourly_rate: string;
  subjects: { id: number; name: string }[];
  average_rating: number;
  total_reviews: number;
}

const Home: React.FC = () => {
  const { user } = useAuth();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user?.role === 'STUDENT' || user?.role === 'ADMIN') {
      fetchTutors();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchTutors = async () => {
    try {
      const response = await api.get('/tutors/');
      setTutors(response.data);
    } catch (error) {
      console.error('Error fetching tutors', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = () => {
    setSuccessMessage('¡Sesión agendada con éxito!');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleRequestSuccess = () => {
    setSuccessMessage('¡Tu solicitud ha sido enviada al administrador!');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
      <p className="text-gray-500 text-sm">Cargando...</p>
    </div>
  );

  // VISTA PARA TUTORES
  if (user?.role === 'TUTOR') {
    return (
      <div className="px-4 py-6">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bienvenido de nuevo, Prof. {user.first_name}</h1>
          <p className="text-gray-500">Aquí tienes un resumen de tu actividad profesional.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Star className="w-6 h-6 fill-current" /></div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase">Calificación</p>
              <h3 className="text-xl font-black">4.9 / 5.0</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-xl text-green-600"><Users className="w-6 h-6" /></div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase">Alumnos</p>
              <h3 className="text-xl font-black">12 Activos</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-xl text-purple-600"><TrendingUp className="w-6 h-6" /></div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase">Ingresos Mes</p>
              <h3 className="text-xl font-black">$145.000</h3>
            </div>
          </div>
        </div>

        <div className="bg-blue-600 rounded-3xl p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl shadow-blue-100">
          <div>
            <h2 className="text-2xl font-bold mb-2">¿Quieres añadir más materias?</h2>
            <p className="text-blue-100 opacity-90">Mantén tu perfil actualizado para atraer a más estudiantes.</p>
          </div>
          <button 
            onClick={() => window.location.href = '/profile'}
            className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all whitespace-nowrap"
          >
            Gestionar mi Perfil
          </button>
        </div>
      </div>
    );
  }

  // VISTA PARA ESTUDIANTES / ADMIN
  return (
    <div className="px-4">
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-right">
          <CheckCircle className="w-5 h-5" />
          <span className="font-bold text-sm">{successMessage}</span>
        </div>
      )}

      <header className="mb-10 mt-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Explorar Tutores</h1>
          <p className="text-gray-500 text-lg">Encuentra al experto perfecto para tus necesidades.</p>
        </div>
        {user?.role === 'STUDENT' && (
          <button 
            onClick={() => setShowRequestModal(true)}
            className="bg-purple-100 text-purple-700 px-6 py-3 rounded-2xl font-bold hover:bg-purple-200 transition-all flex items-center gap-2"
          >
            <Book className="w-5 h-5" /> ¿No encuentras una materia?
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutors.map((tutor) => (
          <div key={tutor.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-50 p-3 rounded-xl text-blue-600 font-bold">
                  {tutor.user.first_name ? tutor.user.first_name[0] : tutor.user.username[0].toUpperCase()}
                  {tutor.user.last_name ? tutor.user.last_name[0] : ''}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {tutor.user.first_name || tutor.user.last_name 
                      ? `${tutor.user.first_name} ${tutor.user.last_name}`.trim()
                      : tutor.user.username}
                  </h3>
                  <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{tutor.average_rating || 'Nuevo'}</span>
                    <span className="text-gray-400 font-normal">({tutor.total_reviews} reseñas)</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 mb-4 h-8">
                {tutor.bio || 'Sin biografía.'}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {tutor.subjects.map((sub, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Book className="w-2.5 h-2.5" />
                    {sub.name}
                  </span>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <div>
                  <span className="text-lg font-black text-gray-900">${tutor.hourly_rate}</span>
                  <span className="text-gray-400 text-[10px] ml-1">/hora</span>
                </div>
                {user?.role === 'STUDENT' && (
                  <button 
                    onClick={() => setSelectedTutor(tutor)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all"
                  >
                    Reservar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedTutor && (
        <BookingModal 
          tutor={selectedTutor} 
          onClose={() => setSelectedTutor(null)} 
          onSuccess={handleBookingSuccess}
        />
      )}

      {showRequestModal && (
        <SubjectRequestModal 
          onClose={() => setShowRequestModal(false)}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  );
};

export default Home;
