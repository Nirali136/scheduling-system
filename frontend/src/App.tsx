import React, { type ReactNode } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookingPage from './pages/BookingPage';
import { getAuth } from './app/modules/auth';

// Protected Route Component
interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const token = getAuth();
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
    const token = getAuth();
    const hideNav = !token;

    return (
        <div className="d-flex flex-column min-vh-100">
            {!hideNav && <Navigation />}
            <main className="flex-grow-1">
                {children}
            </main>
        </div>
    )
}

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/book/:userId" element={<BookingPage />} />

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </Layout>
        </Router>
    )
}

export default App
