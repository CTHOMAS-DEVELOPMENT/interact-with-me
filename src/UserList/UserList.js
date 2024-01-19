import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState(new Set());
    const navigate = useNavigate();
    const location = useLocation();
    const loggedInUserId = location.state ? location.state.userId : null;

    useEffect(() => {
        fetch('/api/users')
            .then(response => response.json())
            .then(data => setUsers(data.filter(user => user.id !== loggedInUserId)))
            .catch(error => console.error('Error fetching users:', error));
    }, [loggedInUserId]);

    const handleCheckboxChange = (userId) => {
        setSelectedUserIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });
    };

    const handleProfileClick = (selectedUserId, selectedUsername) => {
        navigate(`/userprofile/${selectedUserId}`, {
          state: { selectedUser: selectedUserId, loggedInUserId: loggedInUserId, selectedUsername: selectedUsername },
        });
    };


    const handleGroupChatClick = () => {
      console.log("1.Selected User IDs:", Array.from(selectedUserIds));
      navigate("/feed", {
          state: { 
              selectedUserIds: Array.from(selectedUserIds), 
              userId: loggedInUserId 
          },
      });
  };
    return (
        <div>
            <h2>All Users</h2>
            <ul>
                {users.map(user => (
                    <li key={user.id}>
                        {user.username}
                        <input
                            type="checkbox"
                            onChange={() => handleCheckboxChange(user.id)}
                        />
                        <button onClick={() => handleProfileClick(user.id, user.username)}>
                            View Profile
                        </button>
                    </li>
                ))}
            </ul>
            {selectedUserIds.size > 0 && (
                <button onClick={handleGroupChatClick}>
                    {selectedUserIds.size === 1 ? `Interact with ${users.find(user => selectedUserIds.has(user.id)).username}` : "Interact with group members"}
                </button>
            )}
        </div>
    );
};

export default UsersList;
