import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'STUDENT',
    first_name: '',
    last_name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/users/register/', formData);
      navigate('/login', { state: { message: '¡Cuenta creada con éxito! Por favor inicia sesión.' } });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear la cuenta. Intenta con otro usuario o email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-blue-600">Únete a Ayuda Pro</h2>
          <p className="text-gray-500 mt-2">Comienza tu camino al éxito académico</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Nombre</label>
              <input
                type="text"
                name="first_name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Apellido</label>
              <input
                type="text"
                name="last_name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Nombre de Usuario</label>
            <input
              type="text"
              name="username"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Email Académico</label>
            <input
              type="email"
              name="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Contraseña</label>
            <input
              type="password"
              name="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">¿Qué buscas?</label>
            <select
              name="role"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="STUDENT">Busco un tutor (Estudiante)</option>
              <option value="TUTOR">Quiero enseñar (Tutor)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-bold transition-all ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
            }`}
          >
            {loading ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-blue-600 font-bold hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
