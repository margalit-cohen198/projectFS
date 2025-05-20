import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import CompleteRegistration from './components/Auth/CompleteRegistration';
import Info from './pages/Info';
import Todos from './pages/Todos';
import Posts from './pages/Posts';
import HomePage from './pages/HomePage';

function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/users/login" element={<Login />} />
      <Route path="/users/:userId/complete-registration" element={<CompleteRegistration />} />
      <Route path="/users/:userId/home" element={<HomePage />} />
      <Route path="/users/:userId/info" element={<Info />} />
      <Route path="/users/:userId/todos" element={<Todos />} />
      <Route path="/users/:userId/posts" element={<Posts />} />
      <Route path="/" element={<div>ברוכים הבאים לאפליקציה!</div>} /> {/* דף ברירת מחדל */}
    </Routes>
  );
}

export default App;