import { useEffect, useState } from 'react';
import API from '../services/api';
import { FiShield, FiTrendingUp, FiUserCheck, FiUsers } from 'react-icons/fi';

export default function Dashboard() {
  const [stats, setStats] = useState({ employees: 0, teams: 0, logs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [empRes, teamRes, logRes] = await Promise.all([
          API.get('/employees'),
          API.get('/teams'),
          API.get('/logs')
        ]);
        setStats({
          employees: empRes.data.length,
          teams: teamRes.data.length,
          logs: logRes.data.length
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const avgTeamSize = stats.teams > 0 ? Math.round(stats.employees / stats.teams) : 0;

  return (
    <div className="min-h-screen  ">

      <div className="text-center py-16 px-6">
        <h1 className="text-5xl md:text-4xl font-semibold tracking-wide  bg-clip-text  text-black">
          HRMS 
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mt-4 font-medium">
          Manage your workforce with elegance
        </p>
      </div>


      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">

        <div className="group relative overflow-hidden rounded-3xl bg-white shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3">
          <div className="absolute inset-0 bg-gradient-to-br from-black to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-10 text-center">
            <div className="text-6xl md:text-4xl font-black text-indigo-600 group-hover:text-white transition-colors duration-500">
              {loading ? '...' : stats.employees}
            </div>
            <p className="text-xl md:text-2xl font-semibold text-gray-700 group-hover:text-white mt-4 transition-colors">
              Total Employees
            </p>
            <div className="mt-4 flex justify-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <FiUsers className="w-12 h-12 text-indigo-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        </div>


        <div className="group relative overflow-hidden rounded-3xl bg-white shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-10 text-center">
            <div className="text-6xl md:text-4xl font-black text-purple-600 group-hover:text-white transition-colors">
              {loading ? '...' : stats.teams}
            </div>
            <p className="text-xl md:text-2xl font-semibold text-gray-700 group-hover:text-white mt-4 transition-colors">
              Active Teams
            </p>
            <div className="mt-4 flex justify-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-white/20">
                  <FiUserCheck className="w-12 h-12 text-purple-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        </div>

       
        <div className="group relative overflow-hidden rounded-3xl bg-white shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-10 text-center">
            <div className="text-6xl md:text-4xl font-black text-emerald-600 group-hover:text-white transition-colors">
              {loading ? '...' : avgTeamSize}
            </div>
            <p className="text-xl md:text-2xl font-semibold text-gray-700 group-hover:text-white mt-4 transition-colors">
              Avg Team Size
            </p>
            <div className="mt-4 flex justify-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-white/20">
                    <FiTrendingUp className="w-12 h-12 text-emerald-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        </div>

       
        <div className="group relative overflow-hidden rounded-3xl bg-white shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-10 text-center">
            <div className="text-6xl md:text-4xl font-black text-orange-600 group-hover:text-white transition-colors">
              {loading ? '...' : stats.logs}
            </div>
            <p className="text-xl md:text-2xl font-semibold text-gray-700 group-hover:text-white mt-4 transition-colors">
              Audit Logs
            </p>
            <div className="mt-4 flex justify-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-white/20">
               <FiShield className="w-12 h-12 text-orange-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="text-center py-12 px-6 bg-white/50 backdrop-blur-sm shadow-xl rounded-3xl max-w-4xl mx-auto">
        <p className="text-2xl md:text-2xl font-light text-gray-700">
          You're managing{' '}
          <span className="font-bold text-green-600 text-4xl">{stats.employees}</span> amazing employees
          {' '}across{' '}
          <span className="font-bold text-red-600 text-4xl">{stats.teams}</span> high-performing teams
        </p>
        <div className="mt-6 text-lg text-gray-600">
          System is running smoothly • Last updated just now
        </div>
      </div>

   
      <div className="text-center py-10 text-gray-500 text-sm">
        © 2025 HRMS Pro • Built with love and Tailwind
      </div>
    </div>
  );
}