import React, { useState } from 'react';
import api from '../api/axios';
import { X, Calendar, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Tutor {
  id: number;
  user: {
    first_name: string;
    last_name: string;
    username: string;
  };
  subjects: { id: number; name: string }[];
}

interface BookingModalProps {
  tutor: Tutor;
  onClose: () => void;
  onSuccess: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ tutor, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    subject_id: tutor.subjects[0]?.id || '',
    date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '10:00',
    end_time: '11:00',
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const start = new Date(`${formData.date}T${formData.start_time}`);
      const end = new Date(`${formData.date}T${formData.end_time}`);

      await api.post('/sessions/', {
        tutor_id: tutor.id,
        subject_id: formData.subject_id,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        notes: formData.notes,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al agendar la sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200 my-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-blue-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Reservar Ayudantía</h2>
            <p className="text-xs text-blue-600 font-medium">Con {tutor.user.first_name} {tutor.user.last_name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs flex gap-2 border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Materia
              </label>
              <select
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                required
              >
                {tutor.subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" /> Fecha
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.date}
                min={format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" /> Inicio
                </label>
                <input
                  type="time"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" /> Fin
                </label>
                <input
                  type="time"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Notas (Opcional)</label>
              <textarea
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[60px]"
                placeholder="¿Qué quieres repasar?"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[1.5] px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-100 disabled:bg-blue-400"
            >
              {loading ? '...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
