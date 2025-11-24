import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await API.get(`/employees/${id}`);
        setEmployee(res.data);
      } catch (err) {
        alert('Employee not found or error');
        navigate('/employees');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-3xl font-bold text-indigo-600">Loading...</div>
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/employees')}
          className="mb-8 text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-2 hover:underline"
        >
          ← Back to Employees
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-12 text-center">
            <div className="w-32 h-32 bg-white rounded-full mx-auto mb-6 flex items-center justify-center text-6xl font-bold text-indigo-600 shadow-xl">
              {employee.first_name[0]}{employee.last_name[0]}
            </div>
            <h1 className="text-5xl font-bold">
              {employee.first_name} {employee.last_name}
            </h1>
            <p className="text-xl mt-4 opacity-90">Employee Profile</p>
          </div>

          <div className="p-12">
            <div className="grid md:grid-cols-2 gap-10">
              {/* Left Column */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Information</h2>
                <div className="space-y-6 text-lg">
                  <div>
                    <span className="font-semibold text-gray-600">Email:</span>
                    <p className="text-gray-800">{employee.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Phone:</span>
                    <p className="text-gray-800">{employee.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Employee ID:</span>
                    <p className="text-gray-800 font-mono bg-gray-100 px-3 py-1 rounded inline-block mt-2">
                      #{employee.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Teams */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Team Membership</h2>
                {employee.teams && employee.teams.length > 0 ? (
                  <div className="space-y-4">
                    {employee.teams.map((teamName, i) => (
                      <div
                        key={i}
                        className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl border-2 border-purple-300 flex items-center justify-between shadow-md"
                      >
                        <div>
                          <div className="text-2xl font-bold text-purple-700">{teamName}</div>
                          <p className="text-purple-600">Active Member</p>
                        </div>
                        <div className="text-5xl">Check</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <p className="text-2xl text-gray-500">Not assigned to any team yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-12 text-center">
              <button
                onClick={() => navigate(`/employees`)} // You can make edit page later
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-12 rounded-xl text-xl transition transform hover:scale-105"
              >
                Edit Employee
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}