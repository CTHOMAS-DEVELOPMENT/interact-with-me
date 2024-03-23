// authService.js
const checkAuthorization = (userId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return Promise.resolve(false);
    }
  
    return fetch(`/api/authorised/${userId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok.');
    })
    .then((data) => {
      return data; // Assuming the endpoint returns true or false
    })
    .catch((error) => {
      console.error("Authorization error:", error);
      return false;
    });
  };
  
  export { checkAuthorization };
  