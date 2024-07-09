import { Routes, Route } from "react-router-dom";

//Pages
import RegisterPage from "./pages/Register";
import LoginPage from "./pages/Login";
import ListingPage from "./pages/List";
import HomePage from "./pages/Home";
//Components
import MyNavbar from "./components/Navbar";
//CSS
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <>
      <div>
        <MyNavbar />

        <Routes>
          <Route path="/" element={<RegisterPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/addtodo" element={<ListingPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
