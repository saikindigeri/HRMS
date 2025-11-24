// src/components/EmployeeForm.jsx
import { useState } from 'react';
import API from '../services/api';

export default function EmployeeForm({ onSuccess }) {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post('/employees', form);
    setForm({ first_name: '', last_name: '', email: '', phone: '' });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl mb-10 grid md:grid-cols-5 gap-6">
      <input placeholder="First Name" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required className="p-4 border-2 rounded-xl" />
      <input placeholder="Last Name" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} required className="p-4 border-2 rounded-xl" />
      <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="p-4 border-2 rounded-xl" />
      <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="p-4 border-2 rounded-xl" />
      <button type="submit" className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-xl">
        Add Employee
      </button>
    </form>
  );
}