import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TodoList = () => {
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState('');
  const [timers, setTimers] = useState({});
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data } = await axios.get(`${window.location.origin}/api/activities`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActivities(data);
        initializeTimers(data);
      } catch (error) {
        console.error('Error fetching activities', error);
      }
    };

    fetchActivities();
  }, [token]);

  const initializeTimers = (activities) => {
    const timers = activities.reduce((acc, activity) => {
      acc[activity._id] = activity.duration;
      return acc;
    }, {});
    setTimers(timers);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActivities((prevActivities) =>
        prevActivities.map((activity) => {
          if (activity.status === 'Ongoing') {
            const newDuration = (timers[activity._id] || activity.duration) + 1;
            setTimers((prevTimers) => {
              const updatedTimers = { ...prevTimers, [activity._id]: newDuration };
              return updatedTimers;
            });

            updateActivityDuration(activity._id, newDuration);
            return { ...activity, duration: newDuration };
          }
          return activity;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [timers]);

  const updateActivityDuration = async (id, duration) => {
    try {
      await axios.put(
        `${window.location.origin}/api/activities/${id}`,
        { duration },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error updating activity duration', error);
    }
  };

  const handleAddActivity = async () => {
    try {
      const { data } = await axios.post(
        `${window.location.origin}/api/activities`,
        { name: newActivity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActivities([...activities, data]);
      setNewActivity('');
      setTimers((prevTimers) => ({ ...prevTimers, [data._id]: 0 }));
    } catch (error) {
      console.error('Error adding activity', error);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const { data } = await axios.put(
        `${window.location.origin}/api/activities/${id}`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActivities(activities.map(activity => (activity._id === id ? data : activity)));
    } catch (error) {
      console.error('Error updating activity', error);
    }
  };

  const handleDeleteActivity = async (id) => {
    try {
      await axios.delete(`${window.location.origin}/api/activities/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActivities(activities.filter(activity => activity._id !== id));
      setTimers((prevTimers) => {
        const newTimers = { ...prevTimers };
        delete newTimers[id];
        return newTimers;
      });
    } catch (error) {
      console.error('Error deleting activity', error);
    }
  };

  const handleShowDetails = (activity) => {
    const details = `
      Name: ${activity.name}
      Status: ${activity.status}
      Logs:
      ${activity.logs.map(log => `${log.action}: ${new Date(log.timestamp).toLocaleString()}`).join('\n')}
    `;
    window.alert(details);
  };

  const formatTime = (duration) => {
    const hours = String(Math.floor(duration / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((duration % 3600) / 60)).padStart(2, '0');
    const seconds = String(duration % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="mt-5">
      <h2>Todo List</h2>
      <button className="btn btn-danger mb-3" onClick={handleLogout}>Logout</button>
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="New Activity"
          value={newActivity}
          onChange={(e) => setNewActivity(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleAddActivity}>Add Activity</button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Serial Number</th>
            <th>Activity Name</th>
            <th>Activity Duration</th>
            <th>Actions</th>
            <th>Status</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity, index) => (
            <tr key={activity._id}>
              <td>{index + 1}</td>
              <td>{activity.name}</td>
              <td>{formatTime(activity.duration)}</td>
              <td>
                {activity.status !== 'Completed' ? (
                  <>
                    {activity.status === 'Pending' && (
                      <button className="btn btn-success" onClick={() => handleAction(activity._id, 'start')}>Start</button>
                    )}
                    {activity.status === 'Ongoing' && (
                      <>
                        <button className="btn btn-warning" onClick={() => handleAction(activity._id, 'pause')}>Pause</button>
                        <button className="btn btn-danger ms-2" onClick={() => handleAction(activity._id, 'end')}>End</button>
                      </>
                    )}
                    {activity.status === 'Paused' && (
                      <>
                        <button className="btn btn-success" onClick={() => handleAction(activity._id, 'resume')}>Resume</button>
                        <button className="btn btn-danger ms-2" onClick={() => handleAction(activity._id, 'end')}>End</button>
                      </>
                    )}
                  </>
                ) : (
                  <button className="btn btn-info" onClick={() => handleShowDetails(activity)}>Show Details</button>
                )}
              </td>
              <td>{activity.status}</td>
              <td>
                <button className="btn btn-danger" onClick={() => handleDeleteActivity(activity._id)}>Delete</button>
              </td>
            </tr>

          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TodoList;
