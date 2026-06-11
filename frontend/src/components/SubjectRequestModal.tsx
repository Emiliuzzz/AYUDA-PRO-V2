import React, { useState } from 'react';
import api from '../api/axios';
import { X, Send, BookOpen, MessageSquare, CheckCircle } from 'lucide-react';

interface SubjectRequestModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const SubjectRequestModal: React.FC<SubjectRequestModalProps> = ({ onClose, onSuccess }) => {
  const [subjectName, setSubjectName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/subjects/requests/', {
        subject_name: subjectName,
        description: description
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Solicitar Tutoría</h2>
              <p className="text-blue-100 text-xs">¿No encuentras la materia que buscas?</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-100">
              <X className="w-4 h-4" /> {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block ml-1">¿Qué materia necesitas?</label>
            <input 
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900"
              placeholder="Ej: Cálculo Avanzado, Historia Universal..."
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block ml-1">Más detalles</label>
            <textarea 
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 resize-none"
              placeholder="Explícanos brevemente qué temas necesitas tratar..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all border border-gray-100"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Enviar Solicitud
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubjectRequestModal;
