import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Send, MessageSquare, Clock, CheckCircle, AlertCircle, Phone, Mail } from 'lucide-react';

interface Ticket {
  id: number;
  username: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const Support: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/users/support/');
      if (Array.isArray(response.data)) {
        setTickets(response.data);
      }
    } catch (err) {
      console.error('Error fetching tickets', err);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    
    setLoading(true);
    try {
      await api.post('/users/support/', { subject, message });
      setSuccess(true);
      setSubject('');
      setMessage('');
      fetchTickets();
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      alert('Error al enviar el ticket de soporte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-10">
      <header>
        <h1 className="text-3xl font-black text-gray-900">Centro de Soporte</h1>
        <p className="text-gray-500">¿Necesitas ayuda? Envíanos un mensaje y un administrador se contactará contigo.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Form */}
        <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <MessageSquare className="w-5 h-5 text-blue-600" /> Nuevo Ticket de Ayuda
          </h2>

          {success && (
            <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2 border border-green-100">
              <CheckCircle className="w-5 h-5" /> ¡Mensaje enviado! Nos contactaremos pronto.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 block mb-1">Asunto</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900"
                placeholder="Ej: Problema con un pago, duda sobre una clase..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 block mb-1">Mensaje / Detalle</label>
              <textarea 
                required
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all text-gray-900"
                placeholder="Explícanos cómo podemos ayudarte..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
            </div>
            <button 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Enviando...' : <><Send className="w-5 h-5" /> Enviar a Administración</>}
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-100 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-4">Contacto Directo</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg"><Phone className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] opacity-70 font-bold uppercase">Teléfono</p>
                    <p className="font-bold">+56 9 1234 5678</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg"><Mail className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] opacity-70 font-bold uppercase">Email</p>
                    <p className="font-bold text-sm">soporte@ayudapro.cl</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" /> Mis Mensajes Recientes
            </h3>
            <div className="space-y-3">
              {tickets.length > 0 ? (
                tickets.slice(0, 3).map(t => (
                  <div key={t.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="font-bold text-xs text-gray-900 truncate">{t.subject}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[10px] text-gray-400">{new Date(t.created_at).toLocaleDateString()}</span>
                      <span className={`text-[10px] font-black uppercase ${t.status === 'OPEN' ? 'text-red-500' : 'text-green-600'}`}>{t.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">No has enviado mensajes aún.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
