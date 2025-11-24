import { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function RegisterOrg({ setToken }) {
  const [form, setForm] = useState({ orgName: '', adminName: '', email: '', password: '' });
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/register', form);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      
      toast.success('Organisation created successfully! Welcome to HRMS Pro');
      navigate('/dashboard');
      
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Registration failed';
      
      if (errorMsg.includes('Email already exists')) {
        toast.error('This email is already registered! Try logging in.');
      } else {
       // toast.error('');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-12 rounded-3xl  w-full max-w-md">
        <h2 className="text-4xl font-bold text-center mb-10">Create Company</h2>
        <form onSubmit={submit} className="space-y-6">
          <input placeholder="Company Name" value={form.orgName} onChange={e => setForm({ ...form, orgName: e.target.value })} required className="w-full p-4 border-1 rounded-sm" />
          <input placeholder="Your Name" value={form.adminName} onChange={e => setForm({ ...form, adminName: e.target.value })} required className="w-full p-4 border-1 rounded-sm" />
          <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="w-full p-4 border-1 rounded-sm" />
          <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required className="w-full p-4 border-1 rounded-sm" />
          <button type="submit" className="w-full bg-black text-white py-4 rounded-sm font-semibold text-xl">Create & Login</button>
       <p className="text-center mt-3">
          <button onClick={() => navigate('/login')} className="text-indigo-600 underline">Login</button>
        </p>
        </form>
      </div>
    </div>
  );
}