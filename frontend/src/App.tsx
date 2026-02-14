import React, { type ReactNode } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookingPage from './pages/BookingPage';
import { Container } from 'react-bootstrap';

// Protected Route Component
interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

// Public Route wrapper (optional, for layout)
const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <div className="d-flex flex-column min-vh-100">
            <Navigation />
            <main className="flex-grow-1">
                {children}
            </main>
            <footer className="bg-light text-center py-3 mt-auto">
                <Container>
                    <small className="text-muted">© 2024 Scheduling System</small>
                </Container>
            </footer>
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

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/book/:userId" element={<BookingPage />} />

                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </Layout>
        </Router>
    )
}

export default App
