import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { X, Send, BookOpen, DollarSign, AlertCircle, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Subject {
  id: number;
  name: string;
}

interface SubjectRequestModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const SubjectRequestModal: React.FC<SubjectRequestModalProps> = ({ onClose, onSuccess }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [customSubjectName, setSubjectName] = useState('');
  const [description, setDescription] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState('10:00');
  const [loading, setLoading] = useState(false);
  const [fetchingSubjects, setFetchingSubjects] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await api.get('/subjects/');
        setSubjects(response.data);
      } catch (err) {
        console.error('Error fetching subjects', err);
      } finally {
        setFetchingSubjects(false);
      }
    };
    fetchSubjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const preferred_datetime = new Date(`${date}T${time}`).toISOString();

      await api.post('/subjects/requests/', {
        subject: selectedSubjectId || null,
        subject_name: customSubjectName || subjects.find(s => s.id.toString() === selectedSubjectId)?.name || '',
        description: description,
        proposed_price: proposedPrice,
        preferred_datetime: preferred_datetime
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al enviar la propuesta');
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
              <h2 className="text-xl font-bold">Propuesta de Clase</h2>
              <p className="text-blue-100 text-xs">Define qué quieres aprender y cuánto ofreces.</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block ml-1">Materia</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 bg-gray-50 text-sm"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                disabled={fetchingSubjects}
              >
                <option value="">-- Otra (Escribir) --</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block ml-1">Oferta por 1h (CLP)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input 
                  type="number"
                  required
                  min="1000"
                  step="500"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 font-bold text-sm"
                  placeholder="Ej: 5000"
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(e.target.value)}
                />
              </div>
            </div>
          </div>

          {!selectedSubjectId && (
            <div className="space-y-2 animate-in slide-in-from-top-2">
              <label className="text-sm font-bold text-gray-700 block ml-1">Nombre de la Materia Nueva</label>
              <input 
                type="text"
                required={!selectedSubjectId}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 text-sm"
                placeholder="Ej: Física Cuántica..."
                value={customSubjectName}
                onChange={(e) => setSubjectName(e.target.value)}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block ml-1 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Fecha</label>
              <input 
                type="date"
                required
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block ml-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Hora</label>
              <input 
                type="time"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block ml-1">Detalle del tema</label>
            <textarea 
              required
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 resize-none text-sm"
              placeholder="Explica qué necesitas aprender..."
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
              {loading ? '...' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubjectRequestModal;
