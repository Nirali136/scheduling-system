import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, ListGroup, Card, Table, Alert } from 'react-bootstrap';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectCurrentUser } from '../store/slices/authSlice';
import { saveAvailability } from '../store/slices/availabilitySlice';
import { fetchBookings } from '../store/slices/bookingSlice';

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
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectCurrentUser);
    const userId = user?._id;
    const [date, setDate] = useState<string>('');
    const [startTime, setStartTime] = useState<string>('');
    const [endTime, setEndTime] = useState<string>('');
    const [availabilities, setAvailabilities] = useState<Availability[]>([]);
    const bookings = useAppSelector((state) => state.booking.bookings) as Booking[];
    const [bookingLink, setBookingLink] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        if (userId) {
            dispatch(fetchBookings());
        }
    }, [userId, dispatch]);

    const handleSaveAvailability = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !startTime || !endTime) {
            setError('Please fill in all fields');
            return;
        }

        try {
            const resultAction = await dispatch(
                saveAvailability({
                    date,
                    startTime,
                    endTime
                })
            );
            if (saveAvailability.fulfilled.match(resultAction)) {
                setAvailabilities([...availabilities, resultAction.payload]);
                setMessage('Availability saved successfully!');
                setError('');
            } else {
                setError(resultAction.payload as string || 'Failed to save availability');
                setMessage('');
            }
        } catch (err: any) {
            setError('Failed to save availability');
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
