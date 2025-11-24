import { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Login({ setToken }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      
      toast.success('Login  successfully! Welcome to HRMS Pro');
      navigate('/dashboard');
      
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed';
      if (errorMsg){
        toast.error(errorMsg);
      }else{
        toast.error('Login failed');
      }
     
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="bg-white p-5 rounded-3xl w-96">
        <h2 className="text-4xl font-bold text-center mb-10">Login</h2>
        <form onSubmit={submit} className="space-y-6">
          <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="w-full p-4 border-2 rounded-sm" />
          <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required className="w-full p-4 border-2 rounded-sm" />
          <button type="submit" className="w-full bg-black text-white py-4 rounded-md font-semibold text-xl">Login</button>
        </form>
        <p className="text-center mt-6">
          <button onClick={() => navigate('/register')} className="text-indigo-600 underline">Register Company</button>
        </p>
      </div>
    </div>
  );
}