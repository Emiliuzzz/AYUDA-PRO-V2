import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { X, User, Book, Star, Mail, Phone, Calendar, Briefcase } from 'lucide-react';

interface UserProfileModalProps {
  userId: number;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ userId, onClose }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/users/${userId}/profile/`);
        setProfile(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center">
      <div className="bg-white p-8 rounded-3xl animate-pulse">Cargando perfil...</div>
    </div>
  );

  if (!profile) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header/Cover */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
          <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="px-8 pb-8">
          <div className="relative -mt-12 mb-6 flex items-end gap-6">
            <div className="w-24 h-24 bg-white rounded-2xl p-1 shadow-xl">
              <div className="w-full h-full bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-3xl font-black">
                {profile.first_name ? profile.first_name[0] : profile.username[0].toUpperCase()}
              </div>
            </div>
            <div className="pb-2">
              <h2 className="text-2xl font-black text-gray-900">
                {profile.first_name ? `${profile.first_name} ${profile.last_name}` : profile.username}
              </h2>
              <p className="text-blue-600 font-bold text-sm uppercase tracking-wider">{profile.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <section>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Contacto</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">{profile.email}</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Phone className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">{profile.phone}</span>
                    </div>
                  )}
                </div>
              </section>

              {profile.bio && (
                <section>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Sobre mí</h3>
                  <p className="text-sm text-gray-600 leading-relaxed italic">"{profile.bio}"</p>
                </section>
              )}
            </div>

            <div className="space-y-6">
              {profile.tutor_profile && (
                <section className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                  <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">Información del Tutor</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-bold">Tarifa x Hora</span>
                      <span className="text-lg font-black text-gray-900">{formatCLP(Number(profile.tutor_profile.hourly_rate))}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-bold">Experiencia</span>
                      <span className="text-sm font-bold text-gray-900">{profile.tutor_profile.experience_years} años</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-bold">Rating</span>
                      <div className="flex items-center gap-1 text-yellow-500 font-black">
                        <Star className="w-4 h-4 fill-current" />
                        {profile.tutor_profile.average_rating}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 font-bold block mb-2">Materias</span>
                      <div className="flex flex-wrap gap-2">
                        {profile.tutor_profile.subjects.map((s: any) => (
                          <span key={s.id} className="bg-white px-2 py-1 rounded-lg text-[10px] font-bold text-blue-600 border border-blue-100">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {profile.student_profile && (
                <section className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100">
                  <h3 className="text-xs font-black text-purple-600 uppercase tracking-widest mb-4">Información Académica</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Briefcase className="w-4 h-4 text-purple-500" />
                      <div className="text-sm">
                        <p className="font-bold">{profile.student_profile.career || 'Carrera no definida'}</p>
                        <p className="text-xs text-gray-500">{profile.student_profile.university || 'Universidad no definida'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-bold">Semestre: {profile.student_profile.current_semester}</span>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
