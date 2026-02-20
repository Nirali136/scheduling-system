import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, selectCurrentToken } from '../store/slices/authSlice';

const Navigation: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const token = useAppSelector(selectCurrentToken);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    if (!token) return null; 

    return (
        <Navbar bg="light" expand="lg">
            <Container>
                <Navbar.Brand as={Link} to="/dashboard">Scheduling System</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                        <Button variant="outline-danger" size="sm" onClick={handleLogout} className="ms-2">Logout</Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Navigation;
