
import { useEffect, useState } from 'react';
import API from '../services/api';
import { FaLongArrowAltDown } from "react-icons/fa";
import { FaLongArrowAltUp } from "react-icons/fa";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [openTeamId, setOpenTeamId] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const loadData = async () => {
    const [teamRes, empRes] = await Promise.all([
      API.get('/teams'),
      API.get('/employees')
    ]);
    setTeams(teamRes.data);
    setEmployees(empRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (editingTeam) {
      await API.put(`/teams/${editingTeam.id}`, form);
      setEditingTeam(null);
    } else {
      await API.post('/teams', form);
    }
    setForm({ name: '', description: '' });
    loadData();
  };

  const startEdit = (team) => {
    setEditingTeam(team);
    setForm({ name: team.name, description: team.description || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingTeam(null);
    setForm({ name: '', description: '' });
  };

  const deleteTeam = async (id) => {
    if (window.confirm('Delete this team permanently?')) {
      await API.delete(`/teams/${id}`);
      loadData();
    }
  };

  const toggleMember = async (teamId, employeeId, isMember) => {
    if (isMember) {
      await API.delete(`/teams/${teamId}/unassign`, { data: { employeeId } });
    } else {
      await API.post(`/teams/${teamId}/assign`, { employeeId });
    }
    loadData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900">
            Teams
          </h1>
          <p className="mt-4 text-lg text-gray-600">Manage and organize your workforce</p>
        </div>

        {/* Form - Responsive */}
        <form onSubmit={handleCreateOrUpdate} className="bg-white rounded-2xl shadow-xl p-6 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              placeholder="Team Name *"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              className="px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-black focus:outline-none text-lg"
            />
            <input
              placeholder="Description (optional)"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-black focus:outline-none text-lg"
            />
            <div className="flex flex-col sm:flex-row gap-3 lg:col-span-1">
              <button
                type="submit"
                className="bg-black text-white font-bold px-8 py-4 rounded-xl hover:bg-gray-800 transition"
              >
                {editingTeam ? 'Update Team' : 'Create Team'}
              </button>
              {editingTeam && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Teams Grid - Fully Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {teams.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <div className="text-9xl mb-6 text-gray-300">Groups</div>
              <p className="text-2xl text-gray-500">No teams created yet</p>
            </div>
          ) : (
            teams.map(team => {
              const teamMembers = employees.filter(emp => emp.teams?.includes(team.name));
              const nonMembers = employees.filter(emp => !emp.teams?.includes(team.name));

              return (
                <div
                  key={team.id}
                  className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  {/* Team Header */}
                  <div className="p-6 sm:p-8 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
                          {team.name}
                        </h3>
                        {team.description && (
                          <p className="text-gray-600 mt-2 text-sm sm:text-base">{team.description}</p>
                        )}
                        <p className="text-lg font-semibold text-gray-700 mt-3">
                          Members: {team.member_count || teamMembers.length}
                        </p>
                      </div>

                      {/* Action Buttons - Stack on mobile */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => startEdit(team)}
                          className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm sm:text-base"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTeam(team.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm sm:text-base"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Members Section */}
                  <div className="p-6 sm:p-8">
                    <button
                      onClick={() => setOpenTeamId(openTeamId === team.id ? null : team.id)}
                      className="w-full text-left text-lg font-semibold text-gray-800 hover:text-black transition flex items-center justify-between"
                    >
                      <span>Manage Members</span>
                      <span className="text-2xl">{openTeamId === team.id ? <FaLongArrowAltUp /> : <FaLongArrowAltDown />}</span>
                    </button>

                    {openTeamId === team.id && (
                      <div className="mt-6 space-y-4 max-h-96 overflow-y-auto">
                        {/* Current Members */}
                        {teamMembers.length > 0 && (
                          <div>
                            <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider">
                              Current Members
                            </h4>
                            {teamMembers.map(emp => (
                              <div
                                key={emp.id}
                                className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-gray-200 last:border-0"
                              >
                                <span className="font-medium text-gray-900">
                                  {emp.first_name} {emp.last_name}
                                </span>
                                <button
                                  onClick={() => toggleMember(team.id, emp.id, true)}
                                  className="text-red-600 font-semibold hover:underline mt-2 sm:mt-0 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Members */}
                        {nonMembers.length > 0 && (
                          <div className="mt-8">
                            <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider">
                              Add Members
                            </h4>
                            {nonMembers.map(emp => (
                              <div
                                key={emp.id}
                                className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 bg-gray-50 rounded-lg px-4"
                              >
                                <span className="font-medium text-gray-700">
                                  {emp.first_name} {emp.last_name}
                                </span>
                                <button
                                  onClick={() => toggleMember(team.id, emp.id, false)}
                                  className="text-green-600 font-semibold hover:underline mt-2 sm:mt-0 text-sm"
                                >
                                  Add
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}