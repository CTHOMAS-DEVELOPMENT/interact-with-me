import React, { createContext, useContext, useState } from "react";

// Create context
export const ActiveUsersContext = createContext();

// Provider component
export const ActiveUsersProvider = ({ children }) => {
  const [activeUsers, setActiveUsers] = useState([]);

  // Function to update active users
  const updateActiveUsers = (users) => {
    setActiveUsers(users);
  };

  return (
    <ActiveUsersContext.Provider value={{ activeUsers, updateActiveUsers }}>
      {children}
    </ActiveUsersContext.Provider>
  );


};
