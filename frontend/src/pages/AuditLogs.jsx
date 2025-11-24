// src/pages/AuditLogs.jsx
import { useEffect, useState } from 'react';
import API from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// React Icons Import
import {
  FiActivity, FiLock, FiPlus, FiEdit3, FiTrash2,
  FiUserPlus, FiUserMinus, FiSearch, FiClock,
  FiShield, FiDatabase, FiGlobe, FiUser
} from 'react-icons/fi';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await API.get('/logs');
        setLogs(res.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      } catch (err) {
        toast.error('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.meta && JSON.stringify(log.meta).toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.user_id && log.user_id.toString().includes(searchTerm))
  );

  const getActionStyle = (action) => {
    if (action.includes('login')) return 'bg-green-900/30 text-green-400 border-green-800/50';
    if (action.includes('created') || action.includes('assign')) return 'bg-blue-900/30 text-blue-400 border-blue-800/50';
    if (action.includes('updated') || action.includes('edit')) return 'bg-amber-900/30 text-amber-400 border-amber-800/50';
    if (action.includes('deleted') || action.includes('remove') || action.includes('unassign')) return 'bg-red-900/30 text-red-400 border-red-800/50';
    return 'bg-gray-800/70 text-gray-400 border-gray-700/50';
  };

  const getActionIcon = (action) => {
    if (action.includes('login')) return <FiLock className="w-6 h-6" />;
    if (action.includes('created') && action.includes('org')) return <FiGlobe className="w-6 h-6" />;
    if (action.includes('created')) return <FiPlus className="w-6 h-6" />;
    if (action.includes('updated') || action.includes('edit')) return <FiEdit3 className="w-6 h-6" />;
    if (action.includes('deleted') || action.includes('remove')) return <FiTrash2 className="w-6 h-6" />;
    if (action.includes('assign')) return <FiUserPlus className="w-6 h-6" />;
    if (action.includes('unassign')) return <FiUserMinus className="w-6 h-6" />;
    return <FiActivity className="w-6 h-6" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FiShield className="w-24 h-24 mx-auto text-gray-700 animate-pulse mb-6" />
          <p className="text-xl text-gray-400">Loading secure audit trail...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-100">
     
     

      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <FiSearch className="absolute left-6 top-6 w-6 h-6 text-gray-500" />
            <input
              type="text"
              placeholder="Search by action, user ID, employee, team..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-5 text-lg bg-white border border-gray-700 rounded-2xl focus:border-gray-500 focus:outline-none text-gray-100 placeholder-gray-500 transition"
            />
          </div>
          <p className="text-center mt-4 text-gray-500 flex items-center justify-center gap-2">
            <FiActivity className="w-5 h-5" />
            {filteredLogs.length} of {logs.length} events recorded
          </p>
        </div>

     
        <div className="space-y-6">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-32 bg-white backdrop-blur-sm rounded-3xl border border-gray-700">
              <FiSearch className="w-24 h-24 mx-auto text-gray-600 mb-8" />
              <p className="text-3xl text-gray-400">No logs match your search</p>
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div
                key={log.id}
                className="relative bg-gray-800 backdrop-blur-sm rounded-2xl border  "
              >
              
                {index < filteredLogs.length - 1 && (
                  <div className="absolute left-12 top-20 bottom-0 w-px bg-gray-700"></div>
                )}

                <div className="flex items-start gap-8 p-8">
                 
                  <div className="relative z-10 flex-shrink-0">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl ${getActionStyle(log.action)}`}>
                      {getActionIcon(log.action)}
                    </div>
                  </div>

                 
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
                          {log.action.replace(/_/g, ' ')}
                          {log.user_id && <FiUser className="w-5 h-5 text-gray-500" />}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                          <span className="font-mono text-gray-400">User #{log.user_id || 'System'}</span>
                        </p>

                        {/* Meta Data */}
                        {log.meta && Object.keys(log.meta).length > 0 && (
                          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(log.meta).map(([key, value]) => (
                              <div key={key} className="flex items-center gap-3">
                                <span className="text-gray-400 font-medium text-sm uppercase tracking-wider">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>
                                <code className="bg-gray-900/70 px-3 py-1.5 rounded-lg text-sm font-mono text-gray-300 border border-gray-700">
                                  {typeof value === 'object' ? JSON.stringify(value) : value}
                                </code>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Timestamp */}
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2 text-gray-400">
                          <FiClock className="w-5 h-5" />
                          <p className="text-lg font-semibold text-gray-300">
                            {format(new Date(log.timestamp), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <p className="text-3xl font-bold text-gray-500 mt-1">
                          {format(new Date(log.timestamp), 'HH:mm')}
                        </p>
                        <p className="text-xs text-gray-600">
                          .{format(new Date(log.timestamp), 'sss')}s
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

       
    
      </div>
    </div>
  );
}