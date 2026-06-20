import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Auth wrapper
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import CharacterEditor from './pages/CharacterEditor';
import GameSelect from './pages/GameSelect';
import GamePlay from './pages/GamePlay';
import VirtualPlayground from './pages/VirtualPlayground';
import Profile from './pages/Profile';
import CollectionBook from './pages/CollectionBook';
import FamilyDashboard from './pages/FamilyDashboard';
import Leaderboard from './pages/Leaderboard';
import ProvinceRankings from './pages/ProvinceRankings';
import BarangayClubs from './pages/BarangayClubs';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function TitleUpdater() {
  const location = useLocation();

  React.useEffect(() => {
    const path = location.pathname;
    let title = 'Palaro';
    
    if (path === '/login') title = 'Palaro | Login';
    else if (path === '/register') title = 'Palaro | Register';
    else if (path === '/forgot-password') title = 'Palaro | Forgot Password';
    else if (path === '/dashboard') title = 'Palaro | Dashboard';
    else if (path === '/character-editor') title = 'Palaro | Character Editor';
    else if (path === '/games') title = 'Palaro | Games';
    else if (path.startsWith('/games/')) {
      const slug = path.split('/')[2];
      title = `Palaro | Play ${slug.charAt(0).toUpperCase() + slug.slice(1)}`;
    }
    else if (path === '/playground') title = 'Palaro | Playground';
    else if (path === '/profile') title = 'Palaro | Profile';
    else if (path === '/collection-book') title = 'Palaro | Collection Book';
    else if (path === '/family-dashboard') title = 'Palaro | Family Link';
    else if (path === '/leaderboard') title = 'Palaro | Leaderboard';
    else if (path === '/province-rankings') title = 'Palaro | Province Rankings';
    else if (path === '/barangay-clubs') title = 'Palaro | Barangay Clubs';
    else if (path === '/settings') title = 'Palaro | Settings';
    
    document.title = title;
  }, [location]);

  return null;
}

function App() {
  return (
    <Router>
      <TitleUpdater />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Private Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/character-editor"
          element={
            <ProtectedRoute>
              <CharacterEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games"
          element={
            <ProtectedRoute>
              <GameSelect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/:gameSlug"
          element={
            <ProtectedRoute>
              <GamePlay />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playground"
          element={
            <ProtectedRoute>
              <VirtualPlayground />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collection-book"
          element={
            <ProtectedRoute>
              <CollectionBook />
            </ProtectedRoute>
          }
        />
        <Route
          path="/family-dashboard"
          element={
            <ProtectedRoute>
              <FamilyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/province-rankings"
          element={
            <ProtectedRoute>
              <ProvinceRankings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/barangay-clubs"
          element={
            <ProtectedRoute>
              <BarangayClubs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
