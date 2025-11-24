// src/components/TeamForm.jsx
import { useState } from 'react';
import API from '../services/api';

export default function TeamForm({ onSuccess }) {
  const [form, setForm] = useState({ name: '', description: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post('/teams', form);
    setForm({ name: '', description: '' });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl mb-10 flex gap-6">
      <input placeholder="Team Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="flex-1 p-4 border-2 rounded-xl text-lg" />
      <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="flex-1 p-4 border-2 rounded-xl text-lg" />
      <button type="submit" className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold px-10 py-4 rounded-xl">
        Create Team
      </button>
    </form>
  );
}