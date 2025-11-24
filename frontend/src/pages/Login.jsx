import { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login({ setToken }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const res = await API.post('/auth/login', form);
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
      <div className="bg-white p-12 rounded-3xl shadow-2xl w-96">
        <h2 className="text-4xl font-bold text-center mb-10">Login</h2>
        <form onSubmit={submit} className="space-y-6">
          <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="w-full p-4 border-2 rounded-xl" />
          <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required className="w-full p-4 border-2 rounded-xl" />
          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-xl">Login</button>
        </form>
        <p className="text-center mt-6">
          <button onClick={() => navigate('/register')} className="text-indigo-600 underline">Register Company</button>
        </p>
      </div>
    </div>
  );
}