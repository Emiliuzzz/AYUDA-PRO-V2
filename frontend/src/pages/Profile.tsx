import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { User as UserIcon, Camera, Mail, Phone, Briefcase, DollarSign, Book, Save, CheckCircle } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, fetchUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Estados para datos básicos
  const [basicInfo, setBasicInfo] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
  });

  // Estados para datos de tutor
  const [tutorInfo, setTutorInfo] = useState({
    bio: '',
    experience_years: 0,
    hourly_rate: '0',
    subjects: [] as number[],
  });

  const [availableSubjects, setAvailableSubjects] = useState([] as any[]);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);

  // Sincronizar info básica cuando el usuario cargue o cambie
  useEffect(() => {
    if (user) {
      setBasicInfo({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        phone: user.phone || '',
      });
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'TUTOR') {
      fetchTutorData();
    }
    fetchSubjects();
  }, [user]);

  const fetchTutorData = async () => {
    try {
      const response = await api.get('/tutors/me/');
      setTutorInfo({
        bio: response.data.bio,
        experience_years: response.data.experience_years,
        hourly_rate: response.data.hourly_rate,
        subjects: response.data.subjects.map((s: any) => s.id),
      });
    } catch (err) {
      console.error("Error fetching tutor data", err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects/');
      setAvailableSubjects(response.data);
    } catch (err) {
      console.error("Error fetching subjects", err);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleBasicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('first_name', basicInfo.first_name);
    formData.append('last_name', basicInfo.last_name);
    formData.append('bio', basicInfo.bio);
    formData.append('phone', basicInfo.phone);
    if (avatar) {
      formData.append('avatar', avatar);
    }

    try {
      await api.put('/users/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchUser();
      setSuccess('Perfil actualizado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al actualizar la información básica');
    } finally {
      setLoading(false);
    }
  };

  const handleTutorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/tutors/me/', tutorInfo);
      setSuccess('Datos profesionales actualizados');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al actualizar datos de tutor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {success && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-right">
          <CheckCircle className="w-6 h-6" />
          <span className="font-bold">{success}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-400"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6 flex flex-col md:flex-row md:items-end gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl border-4 border-white bg-gray-100 overflow-hidden shadow-lg">
                {avatarPreview ? (
                  <img src={avatarPreview.startsWith('blob') ? avatarPreview : avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <UserIcon className="w-12 h-12" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>
            <div className="pb-2">
              <h1 className="text-2xl font-bold text-gray-900">{user?.first_name} {user?.last_name || user?.username}</h1>
              <p className="text-gray-500 flex items-center gap-2">
                <Mail className="w-4 h-4" /> {user?.email}
              </p>
            </div>
          </div>

          <form onSubmit={handleBasicSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={basicInfo.first_name}
                  onChange={(e) => setBasicInfo({...basicInfo, first_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Apellido</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={basicInfo.last_name}
                  onChange={(e) => setBasicInfo({...basicInfo, last_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" /> Teléfono
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={basicInfo.phone}
                  placeholder="+56 9 ..."
                  onChange={(e) => setBasicInfo({...basicInfo, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Biografía Personal</label>
                <textarea
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[160px]"
                  value={basicInfo.bio}
                  onChange={(e) => setBasicInfo({...basicInfo, bio: e.target.value})}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" /> Guardar Cambios Básicos
              </button>
            </div>
          </form>
        </div>
      </div>

      {user?.role === 'TUTOR' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-600" /> Perfil Profesional del Tutor
          </h2>
          <form onSubmit={handleTutorSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" /> Tarifa por Hora (CLP)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={tutorInfo.hourly_rate}
                    onChange={(e) => setTutorInfo({...tutorInfo, hourly_rate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400" /> Años de Experiencia
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={tutorInfo.experience_years}
                    onChange={(e) => setTutorInfo({...tutorInfo, experience_years: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Book className="w-4 h-4 text-gray-400" /> Materias que impartes
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-4 bg-gray-50 rounded-xl border border-gray-100">
                  {availableSubjects.map((subject) => (
                    <label key={subject.id} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={tutorInfo.subjects.includes(subject.id)}
                        onChange={(e) => {
                          const newSubjects = e.target.checked
                            ? [...tutorInfo.subjects, subject.id]
                            : tutorInfo.subjects.filter(id => id !== subject.id);
                          setTutorInfo({...tutorInfo, subjects: newSubjects});
                        }}
                      />
                      <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">{subject.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Resumen Profesional</label>
              <textarea
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                placeholder="Cuéntales a tus alumnos sobre tu metodología de enseñanza..."
                value={tutorInfo.bio}
                onChange={(e) => setTutorInfo({...tutorInfo, bio: e.target.value})}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-gray-200"
            >
              <Save className="w-6 h-6" /> Actualizar Perfil Profesional
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
