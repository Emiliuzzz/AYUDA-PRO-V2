import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, BookOpen, Calendar } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600 flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Ayuda Pro
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {(user?.role === 'ADMIN' || user?.is_superuser) && (
                <Link to="/admin" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium">
                  Panel Admin
                </Link>
              )}
              {user?.role === 'TUTOR' && (
                <Link to="/tutor" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium">
                  Mi Dashboard
                </Link>
              )}
              {(user?.role === 'STUDENT' || user?.role === 'ADMIN' || user?.is_superuser) && (
                <Link to="/" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-blue-500 text-sm font-medium">
                  Explorar Tutores
                </Link>
              )}
              {(user?.role === 'STUDENT' || user?.role === 'TUTOR') && (
                <Link to="/sessions" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium">
                  Mis Sesiones
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors">
              <UserIcon className="w-4 h-4" />
              <span className="font-medium">{user?.username}</span>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full capitalize">
                {user?.role?.toLowerCase()}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
