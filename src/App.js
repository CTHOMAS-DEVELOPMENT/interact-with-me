import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RegistrationForm from './RegistrationProfileCreation/RegistrationForm';
import LoginForm from './Login/LoginForm';
import FeedScreen from './FeedScreen/FeedScreen'
import PhotoUploadAndEdit from './PhotoUploadAndEdit/PhotoUploadAndEdit'
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
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
