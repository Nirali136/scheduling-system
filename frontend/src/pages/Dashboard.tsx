import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, ListGroup, Card, Table, Alert } from 'react-bootstrap';
import APICallService from '../api/apiCallService';
import { SAVE_AVAILABILITY, GET_BOOKINGS } from '../api/apiEndPoints';
import { format } from 'date-fns';
import { useAuth } from '../app/modules/auth';

interface Availability {
    date: string;
    startTime: string;
    endTime: string;
}

interface Booking {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    guestName: string;
    guestEmail: string;
}

const Dashboard: React.FC = () => {
    const { getUserId } = useAuth();
    const [date, setDate] = useState<string>('');
    const [startTime, setStartTime] = useState<string>('');
    const [endTime, setEndTime] = useState<string>('');
    const [availabilities, setAvailabilities] = useState<Availability[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [bookingLink, setBookingLink] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    const userId = getUserId();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const apiService = new APICallService(GET_BOOKINGS);
            const response = await apiService.callAPI();
            setBookings(response);
        } catch (err) {
            console.error('Error fetching bookings', err);
        }
    };

    const handleSaveAvailability = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !startTime || !endTime) {
            setError('Please fill in all fields');
            return;
        }

        try {
            const apiService = new APICallService(
                SAVE_AVAILABILITY,
                {
                    date,
                    startTime,
                    endTime
                }
            );
            const response = await apiService.callAPI();

            setAvailabilities([...availabilities, response]);
            setMessage('Availability saved successfully!');
            setError('');

        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save availability');
            setMessage('');
        }
    };

    const generateLink = () => {
        if (userId) {
            const link = `${window.location.origin}/book/${userId}`;
            setBookingLink(link);
        }
    };

    return (
        <Container className="mt-5">
            <h2 className="mb-4">Dashboard</h2>

            <Row>
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Header>Set Availability</Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}
                            {message && <Alert variant="success">{message}</Alert>}

                            <Form onSubmit={handleSaveAvailability}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </Form.Group>
                                <Row>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Start Time</Form.Label>
                                            <Form.Control type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>End Time</Form.Label>
                                            <Form.Control type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Button variant="primary" type="submit">
                                    Save
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>

                    {availabilities.length > 0 && (
                        <Card className="mb-4">
                            <Card.Header>Recently Added (Session Only)</Card.Header>
                            <ListGroup variant="flush">
                                {availabilities.map((avail, index) => (
                                    <ListGroup.Item key={index}>
                                        {format(new Date(avail.date), 'yyyy-MM-dd')} | {avail.startTime} - {avail.endTime}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card>
                    )}

                    <Card className="mb-4">
                        <Card.Header>Share Booking Link</Card.Header>
                        <Card.Body>
                            <Button variant="outline-primary" onClick={generateLink} className="mb-2">
                                Generate Link
                            </Button>
                            {bookingLink && (
                                <Alert variant="info">
                                    <a href={bookingLink} target="_blank" rel="noopener noreferrer">{bookingLink}</a>
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card>
                        <Card.Header>My Bookings</Card.Header>
                        <Card.Body>
                            {bookings.length === 0 ? (
                                <p>No bookings yet.</p>
                            ) : (
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Guest</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map((booking) => (
                                            <tr key={booking._id}>
                                                <td>{format(new Date(booking.date), 'yyyy-MM-dd')}</td>
                                                <td>{booking.startTime} - {booking.endTime}</td>
                                                <td>{booking.guestName} <br /><small className="text-muted">{booking.guestEmail}</small></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Dashboard;
