// src/components/TeamMemberManager.jsx
import API from '../services/api';

export default function TeamMemberManager({ team, employees, onUpdate }) {
  const toggleMember = async (employeeId, isMember) => {
    if (isMember) {
      await API.delete(`/teams/${team.id}/unassign`, { data: { employeeId } });
    } else {
      await API.post(`/teams/${team.id}/assign`, { employeeId });
    }
    onUpdate();
  };

  return (
    <div className="mt-8 space-y-4 max-h-96 overflow-y-auto border-t pt-6">
      {employees.map(emp => {
        const isMember = emp.teams.includes(team.name);
        return (
          <div key={emp.id} className="flex justify-between items-center py-3 border-b">
            <span className={isMember ? 'font-bold text-green-700' : ''}>
              {emp.first_name} {emp.last_name} {isMember && 'Check'}
            </span>
            <button
              onClick={() => toggleMember(emp.id, isMember)}
              className={isMember ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}
            >
              {isMember ? 'Remove' : 'Add'}
            </button>
          </div>
        );
      })}
    </div>
  );
}