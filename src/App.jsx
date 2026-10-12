import { NavLink, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Departments from "./pages/Departments.jsx";
import Teachers from "./pages/Teachers.jsx";
import Courses from "./pages/Courses.jsx";
import ResponsePanel from "./components/ResponsePanel.jsx";

export default function App() {
  return (
    <div className="app">
      <header className="site-header">
        <div className="container header-inner">
          <NavLink to="/" className="brand">
            <span className="brand-mark">ФПрН</span>
            <span className="brand-text">
              Факультет природничих наук
              <small>НаУКМА</small>
            </span>
          </NavLink>
          <nav className="nav">
            <NavLink to="/" end>Головна</NavLink>
            <NavLink to="/departments">Кафедри</NavLink>
            <NavLink to="/teachers">Викладачі</NavLink>
            <NavLink to="/courses">Курси</NavLink>
          </nav>
        </div>
      </header>

      <main className="container main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="*" element={<p className="empty">Сторінку не знайдено.</p>} />
        </Routes>
      </main>

      <ResponsePanel />
    </div>
  );
}
