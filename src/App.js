import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RegistrationForm from "./RegistrationProfileCreation/RegistrationForm";
import LoginForm from "./Login/LoginForm";
import FeedScreen from "./FeedScreen/FeedScreen";
import UserList from "./UserList/UserList";
import UserProfile from "./UserProfile/UserProfile";
import PhotoUploadAndEdit from "./PhotoUploadAndEdit/PhotoUploadAndEdit";
import NewSubmission from "./NewSubmission/NewSubmission"
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/userprofile/:userId" element={<UserProfile />} />
          <Route path="/newsubmission" element={<NewSubmission />} />
          <Route path="/userlist" element={<UserList />} />
          <Route path="/feed" element={<FeedScreen />} />
          <Route path="/photos" element={<PhotoUploadAndEdit />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/" element={<LoginForm />} />
          {/* Add more routes for other parts of your application */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
