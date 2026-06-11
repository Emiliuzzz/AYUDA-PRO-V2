import React, { useState } from 'react';
import api from '../api/axios';
import { X, Star, MessageSquare, Send } from 'lucide-react';

interface ReviewModalProps {
  sessionId: number;
  subjectName: string;
  tutorName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ sessionId, subjectName, tutorName, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/reviews/', {
        session: sessionId,
        rating,
        comment,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al enviar la calificación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 text-center bg-gradient-to-b from-yellow-50 to-white">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-20 h-20 bg-yellow-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-yellow-600 shadow-inner">
            <Star className="w-10 h-10 fill-current" />
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 mb-2">¡Califica tu sesión!</h2>
          <p className="text-gray-500 mb-8">
            ¿Qué te pareció la clase de <span className="font-bold text-gray-700">{subjectName}</span> con <span className="font-bold text-blue-600">{tutorName}</span>?
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">{error}</div>}

            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-transform active:scale-90"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                >
                  <Star 
                    className={`w-10 h-10 transition-colors ${
                      star <= (hover || rating) ? 'text-yellow-400 fill-current' : 'text-gray-200'
                    }`} 
                  />
                </button>
              ))}
            </div>

            <div className="text-left">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-500" /> Tu comentario (Opcional)
              </label>
              <textarea
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[100px] text-gray-700"
                placeholder="Ej: Explica muy bien los conceptos difíciles..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-4 text-gray-500 font-bold hover:text-gray-700 transition-colors"
              >
                Omitir
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] bg-blue-600 text-white py-4 px-6 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:bg-blue-400 flex items-center justify-center gap-2"
              >
                {loading ? 'Enviando...' : (
                  <>
                    <Send className="w-5 h-5" /> Enviar Evaluación
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
