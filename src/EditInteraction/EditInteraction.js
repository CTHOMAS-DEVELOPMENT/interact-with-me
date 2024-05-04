import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AlertMessage from "../system/AlertMessage";
import { Button } from "react-bootstrap";
import { extractFilename } from "../system/utils";
import { checkAuthorization } from "../system/authService";
import "bootstrap/dist/css/bootstrap.min.css";

const EditInteraction = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { submissionId, loggedInUserId } = location.state;
  const [authError, setAuthError] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [title, setTitle] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [initialSelectedUserIds, setInitialSelectedUserIds] = useState(
    new Set()
  );
  const [isChanged, setIsChanged] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [usernameFilter, setUsernameFilter] = useState("");
  const [filterSex, setFilterSex] = useState("");
  const [filterHobbies, setFilterHobbies] = useState("");
  const [filterOrientation, setFilterOrientation] = useState("");
  const [filterFloatsMyBoat, setFilterFloatsMyBoat] = useState("");
  useEffect(() => {
    if (loggedInUserId) {
      checkAuthorization(loggedInUserId).then((isAuthorized) => {
        if (!isAuthorized) {
          setAuthError(true);
        } else {
          fetchInteractionDetails();
          fetchAllUsers();
        }
      });
    }
  }, [loggedInUserId, navigate]);
  useEffect(() => {
    // Filter based on username and selection status.
    let filteredUsers = users.filter((user) =>
      user.username.toLowerCase().includes(usernameFilter.toLowerCase())
    );

    if (showSelectedOnly) {
      filteredUsers = filteredUsers.filter((user) =>
        selectedUserIds.has(user.id)
      );
    }

    setTotalPages(Math.ceil(filteredUsers.length / usersPerPage));

    // Handle pagination edge case.
    if (currentPage > totalPages || currentPage < 1) {
      setCurrentPage(1);
    }
  }, [
    users,
    usernameFilter,
    showSelectedOnly,
    selectedUserIds,
    usersPerPage,
    currentPage,
    totalPages,
  ]);

  useEffect(() => {
    // Assuming `users` is always up-to-date with the fetched user list
    const filteredUsers = showSelectedOnly
      ? users.filter((user) => selectedUserIds.has(user.id))
      : users;
    setTotalPages(Math.ceil(filteredUsers.length / usersPerPage));
    setCurrentPage(1); // Reset to page 1 whenever the filter changes
  }, [users, showSelectedOnly, selectedUserIds, usersPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1); // Reset to the first page if the current page is out of bounds
    }
  }, [totalPages, currentPage]);
  const handleShowSelectedChange = (event) => {
    const isChecked = event.target.checked;
    setShowSelectedOnly(isChecked);
    if (isChecked) {
      setUsernameFilter(""); // Clear username filter
      // No need to set currentPage or totalPages as they will be recalculated in the useEffect.
    }
  };
  const fetchInteractionDetails = () => {
    fetch(`/api/interaction_user_list?submission_id=${submissionId}`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTitle(data[0].title);
          const userIds = data.map((user) => user.id);
          setSelectedUserIds(new Set(userIds));
          setInitialSelectedUserIds(new Set(userIds));
        }
      })
      .catch((error) => {
        console.error("Error fetching interaction details:", error);
        setMessage("Error fetching interaction details");
        setType("error");
      });
  };
//loggedInUserId
  const fetchAllUsers = () => {
    console.log("loggedInUserId",loggedInUserId)
    fetch(`/api/connected-users/${loggedInUserId}`)
    //fetch(`/api/users`)
      .then((response) => response.json())
      .then((data) => {
        const filteredUsers = data.filter(
          (user) =>
            !user.username.startsWith("Admin") && user.id !== loggedInUserId
        );
        setUsers(filteredUsers);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setMessage("Error fetching users");
        setType("error");
      });
  };

  // Make sure the 'selectedUserIds' is properly synchronized and in the correct format
  const handleCheckboxChange = (userId) => {
    setSelectedUserIds((prevSelectedUserIds) => {
      const newSelectedUserIds = new Set(prevSelectedUserIds);
      if (newSelectedUserIds.has(userId)) {
        newSelectedUserIds.delete(userId);
      } else {
        newSelectedUserIds.add(userId);
      }

      setIsChanged(
        [...newSelectedUserIds].sort().join(",") !==
          [...initialSelectedUserIds].sort().join(",")
      );
      return newSelectedUserIds;
    });
  };

  const handleBackToMessagesClick = () => {
    navigate("/userlist", { state: { userId: loggedInUserId } });
  };
  const grabUserPicture = (profilePicture, sex) => {
    const fileNeeded = profilePicture
      ? "thumb-" + extractFilename(profilePicture)
      : sex === "Male"
      ? "thumb-greyface-male.png"
      : "thumb-greyface-female.png";
    const pathToFile = `${process.env.REACT_APP_IMAGE_HOST}/${process.env.REACT_APP_IMAGE_FOLDER}/${fileNeeded}`;

    return pathToFile;
  };
  const handleUpdateGroupClick = () => {
    setMessage("");
    setType("info");
    const payload = {
      submissionId: submissionId,
      userIds: Array.from(selectedUserIds),
    };

    fetch("/api/update-the-group", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          setMessage("Failed to update the group");
          setType("error");
          throw new Error("Failed to update the group");
        }
      })
      .then((data) => {
        setMessage("Group updated successfully");
      })
      .catch((error) => {
        setMessage("Group updated successfully");
        setType("error");
      });
  };

  // Get current page of users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = useMemo(() => {
    let filteredUsers = users.filter(
      (user) =>
        (usernameFilter.length >= 3
          ? user.username.toLowerCase().includes(usernameFilter.toLowerCase())
          : true) &&
        (filterSex ? user.sex === filterSex : true) &&
        (filterHobbies
          ? user.hobbies.toLowerCase().includes(filterHobbies.toLowerCase())
          : true) &&
        (filterOrientation
          ? user.sexual_orientation
              .toLowerCase()
              .includes(filterOrientation.toLowerCase())
          : true) &&
        (filterFloatsMyBoat
          ? user.floats_my_boat
              .toLowerCase()
              .includes(filterFloatsMyBoat.toLowerCase())
          : true)
    );

    if (showSelectedOnly) {
      filteredUsers = filteredUsers.filter((user) =>
        selectedUserIds.has(user.id)
      );
    }

    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [
    users,
    usernameFilter,
    filterSex,
    filterHobbies,
    filterOrientation,
    filterFloatsMyBoat,
    showSelectedOnly,
    selectedUserIds,
    currentPage,
    usersPerPage,
  ]);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (authError) {
    return <div>Unauthorized. Please log in.</div>;
  }

  // Render the component
  // currentUsers = showSelectedOnly
  //   ? users.filter((user) => selectedUserIds.has(user.id))
  //   : users.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  return (
    <div>
      <Button
        variant="outline-info"
        className="btn-sm"
        onClick={handleBackToMessagesClick}
      >
        Back to messages
      </Button>{" "}
      <div className="centre-container">
        <div className="edit-interaction-container">
          <h2>{title}</h2>
          <div
            className="dropdown-container"
            style={{
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              marginBottom: "20px",
            }}
          >
            <div className="row mb-3">
              <div className="col">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  className="form-control"
                  placeholder="Enter username"
                  value={usernameFilter}
                  onChange={(e) => setUsernameFilter(e.target.value)}
                />
              </div>
              <div className="col">
                <label htmlFor="sex">Sex</label>
                <select
                  className="form-control"
                  id="sex"
                  value={filterSex}
                  onChange={(e) => setFilterSex(e.target.value)}
                >
                  <option value="">Select Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="hobbies">Hobbies</label>
              <select
                className="form-control"
                id="hobbies"
                value={filterHobbies}
                onChange={(e) => setFilterHobbies(e.target.value)} // Ensure this handler is set correctly
              >
                <option value="">Select Hobbies</option>
                {process.env.REACT_APP_HOBBY_TYPE.split(",").map((hobby) => (
                  <option key={hobby} value={hobby}>
                    {hobby}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="orientation">Sexual Orientation</label>
              <select
                className="form-control"
                id="orientation"
                value={filterOrientation}
                onChange={(e) => setFilterOrientation(e.target.value)} // Ensure this handler is set correctly
              >
                <option value="">Select Orientation</option>
                {process.env.REACT_APP_SEXUAL_ORIENTATION_TYPE.split(",").map(
                  (orientation) => (
                    <option key={orientation} value={orientation}>
                      {orientation}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="floats">Floats My Boat</label>
              <select
                className="form-control"
                id="floats"
                value={filterFloatsMyBoat}
                onChange={(e) => setFilterFloatsMyBoat(e.target.value)} // Ensure this handler is set correctly
              >
                <option value="">Select what floats your boat</option>
                {process.env.REACT_APP_FLOATS_MY_BOAT_TYPE.split("|").map(
                  (float) => (
                    <option key={float} value={float}>
                      {float}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="showSelectedCheckbox"
              checked={showSelectedOnly}
              onChange={handleShowSelectedChange}
            />
            <label className="form-check-label" htmlFor="showSelectedCheckbox">
              Show Selected Users
            </label>
          </div>
          <ul className="no-bullet">
            {currentUsers.map((user) => (
              <li key={user.id} className="user-edit-item">
                <div className="user-edit-info">
                  <img
                    src={grabUserPicture(user.profile_picture, user.sex)}
                    alt={user.username}
                    className="post-profile-image"
                  />
                  <span className="username">{user.username}</span>
                  <input
                    type="checkbox"
                    checked={selectedUserIds.has(user.id)}
                    onChange={() => handleCheckboxChange(user.id)}
                  />
                </div>
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  variant={
                    currentPage === i + 1 ? "primary" : "outline-primary"
                  }
                  className={`round-button ${
                    currentPage === i + 1 ? "selected" : ""
                  }`}
                  onClick={() => paginate(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          )}
          {message && <AlertMessage message={message} type={type} />}
          {isChanged && (
            <Button
              variant="outline-info"
              className="btn-sm"
              onClick={handleUpdateGroupClick}
            >
              Update Group
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditInteraction;
