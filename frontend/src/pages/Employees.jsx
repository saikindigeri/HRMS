// src/pages/Employees.jsx
import { useEffect, useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadEmployees = async () => {
    try {
      const res = await API.get('/employees');
      setEmployees(res.data);
    } catch (err) {
      toast.error('Failed to load employees');
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await API.put(`/employees/${editingId}`, form);
        toast.success('Employee updated successfully!');
        setEditingId(null);
      } else {
        await API.post('/employees', form);
        toast.success('Employee added successfully!');
      }
      setForm({ first_name: '', last_name: '', email: '', phone: '' });
      loadEmployees();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (emp) => {
    setEditingId(emp.id);
    setForm({
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email || '',
      phone: emp.phone || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ first_name: '', last_name: '', email: '', phone: '' });
    toast.info('Edit cancelled');
  };

  const deleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      await API.delete(`/employees/${id}`);
      toast.success('Employee deleted successfully');
      loadEmployees();
    } catch (err) {
      toast.error('Failed to delete employee');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 py-12 px-6">
      <div className="max-w-7xl mx-auto">

       
        


        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 mb-12 border border-white/20">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            {editingId ? 'Update Employee' : 'Add New Employee'}
          </h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <input
              placeholder="First Name"
              value={form.first_name}
              onChange={e => setForm({ ...form, first_name: e.target.value })}
              required
              className="px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-black focus:outline-none text-lg transition"
            />
            <input
              placeholder="Last Name"
              value={form.last_name}
              onChange={e => setForm({ ...form, last_name: e.target.value })}
              required
              className="px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-black focus:outline-none text-lg transition"
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-black focus:outline-none text-lg transition"
            />
            <input
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-black focus:outline-none text-lg transition"
            />

            <div className="md:col-span-2 lg:col-span-4 flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-black text-white tracking-wide text-md py-5 rounded-xl "
              >
                {loading ? 'Saving...' : editingId ? 'Update Employee' : 'Add Employee'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-10 py-5 bg-gray-500 text-white font-bold rounded-2xl hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

     
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
            >
           
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative p-8">
              
                <div className="w-24 h-24 bg-gradient-to-br bg-black rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl mx-auto mb-6">
                  {emp.first_name[0]}{emp.last_name[0]}
                </div>

                <h3 className="text-2xl font-bold text-center text-gray-800">
                  {emp.first_name} {emp.last_name}
                </h3>
                <p className="text-center text-gray-600 mt-2 text-sm">{emp.email || 'No email'}</p>
                <p className="text-center text-gray-500 text-xs mt-1">{emp.phone || 'No phone'}</p>

                {/* Teams */}
                <div className="mt-6 text-center">
                  <p className="text-sm font-semibold text-gray-600">Teams</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {emp.teams.length > 0 ? (
                      emp.teams.map((team, i) => (
                        <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                          {team}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">Not assigned</span>
                    )}
                  </div>
                </div>

              
                <div className="mt-8 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                  <button
                    onClick={() => navigate(`/employee/${emp.id}`)}
                    className="bg-gradient-to-r bg-gray-800 text-white px-6 py-3 rounded-md  hover:shadow-lg transform hover:scale-105 transition"
                  >
                    View
                  </button>
                  <button
                    onClick={() => startEdit(emp)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md  hover:shadow-lg transform hover:scale-105 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteEmployee(emp.id)}
                    className="bg-red-600 text-white px-6 py-3 rounded-md  hover:shadow-lg transform hover:scale-105 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      
        {employees.length === 0 && !loading && (
          <div className="text-center py-20">
          
            <p className="text-3xl text-gray-500">No employees yet. Add your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}