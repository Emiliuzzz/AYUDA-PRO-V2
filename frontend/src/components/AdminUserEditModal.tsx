import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { X, User, Shield, Lock, Trash2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface AdminUserEditModalProps {
  userId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminUserEditModal: React.FC<AdminUserEditModalProps> = ({ userId, onClose, onSuccess }) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const response = await api.get(`/users/admin/users/${userId}/`);
      setUserData(response.data);
    } catch (err) {
      setError('No se pudo cargar la información del usuario.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (role: string) => {
    setUpdating(true);
    setError('');
    try {
      await api.patch(`/users/admin/users/${userId}/`, { role });
      setSuccess('Rol actualizado con éxito.');
      fetchUserDetails();
      onSuccess();
    } catch (err) {
      setError('Error al actualizar el rol.');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async () => {
    setUpdating(true);
    setError('');
    try {
      await api.patch(`/users/admin/users/${userId}/`, { is_active: !userData.is_active });
      setSuccess(`Cuenta ${userData.is_active ? 'desactivada' : 'activada'} con éxito.`);
      fetchUserDetails();
      onSuccess();
    } catch (err) {
      setError('Error al cambiar el estado de la cuenta.');
    } finally {
      setUpdating(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    setUpdating(true);
    setError('');
    try {
      await api.post(`/users/admin/users/${userId}/reset-password/`, { password: newPassword });
      setSuccess('Contraseña restablecida con éxito.');
      setNewPassword('');
    } catch (err) {
      setError('Error al restablecer la contraseña.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center">
      <div className="bg-white p-8 rounded-3xl animate-pulse">Cargando gestión de usuario...</div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-bold">Gestión de Usuario</h2>
              <p className="text-gray-400 text-xs">ID: #{userId} • @{userData.username}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2 border border-green-100">
              <CheckCircle className="w-4 h-4" /> {success}
            </div>
          )}

          {/* Basic Info */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Información Personal</h3>
              <div className="space-y-1">
                <p className="text-lg font-bold text-gray-900">{userData.first_name} {userData.last_name}</p>
                <p className="text-sm text-gray-500">{userData.email}</p>
                <p className="text-xs text-gray-400 mt-2 italic">{userData.bio || 'Sin biografía.'}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl flex flex-col justify-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Estado de Cuenta</p>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${userData.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="font-bold text-gray-900">{userData.is_active ? 'Activa' : 'Inactiva / Bloqueada'}</span>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Change Role & Status */}
            <div className="space-y-6">
              <section>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Cambiar Tipo de Usuario</h3>
                <div className="flex gap-2">
                  <button 
                    disabled={updating || userData.role === 'STUDENT'}
                    onClick={() => handleUpdateRole('STUDENT')}
                    className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${userData.role === 'STUDENT' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    Estudiante
                  </button>
                  <button 
                    disabled={updating || userData.role === 'TUTOR'}
                    onClick={() => handleUpdateRole('TUTOR')}
                    className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${userData.role === 'TUTOR' ? 'bg-purple-600 text-white shadow-lg shadow-purple-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    Tutor
                  </button>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Estado de Acceso</h3>
                <button 
                  disabled={updating}
                  onClick={handleToggleStatus}
                  className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${userData.is_active ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' : 'bg-green-50 text-green-600 border border-green-100 hover:bg-green-100'}`}
                >
                  {userData.is_active ? <><Trash2 className="w-4 h-4" /> Desactivar Cuenta</> : <><CheckCircle className="w-4 h-4" /> Activar Cuenta</>}
                </button>
              </section>
            </div>

            {/* Reset Password */}
            <section>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Restablecer Contraseña</h3>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Nueva clave temporal..."
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={updating || !newPassword}
                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-xs hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {updating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Actualizar Clave'}
                </button>
              </form>
            </section>
          </div>
        </div>

        <div className="bg-gray-50 p-6 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-2 rounded-xl font-bold text-gray-500 hover:text-gray-700 transition-all text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUserEditModal;
