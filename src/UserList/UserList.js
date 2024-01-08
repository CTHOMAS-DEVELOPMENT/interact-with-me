import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
const UsersList = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const userId = location.state ? location.state.userId : null;
    const loggedInUserId = location.state ? location.state.userId : null;
    //console.log("IMAGE_HOST", process.env.REACT_APP_IMAGE_HOST);
    const handleProfileClick = (selectedUserId) => {
        navigate(`/userprofile/${selectedUserId}`, {
          state: { selectedUser: selectedUserId, loggedInUserId: loggedInUserId },
        });
      };
  useEffect(() => {
    console.log("userId", userId)
    fetch('/api/users')
      .then(response => response.json())
      .then(data => setUsers(data.filter(user => user.id !== userId)))
      .catch(error => console.error('Error fetching users:', error));
  }, [userId]);

  return (
    <div>
      <h2>All Users</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
          {user.username}
          <button onClick={() => handleProfileClick(user.id)}>View Profile</button>
        </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersList;
