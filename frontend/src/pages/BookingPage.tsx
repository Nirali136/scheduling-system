import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAvailableDates, fetchSlots, clearSlots } from '../store/slices/availabilitySlice';
import { createBooking, resetBookingSuccess } from '../store/slices/bookingSlice';


const BookingPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { userId } = useParams<{ userId: string }>();

    const { availableDates: rawAvailableDates, slots } = useAppSelector((state) => state.availability);
    const { bookingSuccess } = useAppSelector((state) => state.booking);

    const availableDates = rawAvailableDates.map((d: string) => parseISO(d));

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [guestName, setGuestName] = useState<string>('');
    const [guestEmail, setGuestEmail] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

    useEffect(() => {
        fetchAvailableDatesData();
    }, [userId]);

    const fetchAvailableDatesData = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const resultAction = await dispatch(fetchAvailableDates(userId));
            if (fetchAvailableDates.rejected.match(resultAction)) {
                setError('Invalid Booking Link or User not found');
            }
        } catch (err) {
            setError('Invalid Booking Link or User not found');
        } finally {
            setLoading(false);
        }
    };

    const fetchSlotsData = async (date: Date) => {
        if (!userId) return;
        const dateStr = format(date, 'yyyy-MM-dd');
        dispatch(fetchSlots({ userId, date: dateStr }));
    };

    const handleDateClick = (day: Date) => {
        const isAvailable = availableDates.some(d => isSameDay(d, day));
        if (isAvailable) {
            setSelectedDate(day);
            dispatch(clearSlots());
            setSelectedSlot(null);
            fetchSlotsData(day);
        }
    };

    const handleSlotClick = (slot: string) => {
        setSelectedSlot(slot);
    };

    const handleBook = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !selectedSlot || !guestName || !guestEmail || !userId) return;

        try {
            const resultAction = await dispatch(
                createBooking({
                    userId,
                    date: format(selectedDate, 'yyyy-MM-dd'),
                    startTime: selectedSlot,
                    guestName,
                    guestEmail
                })
            );
            if (createBooking.fulfilled.match(resultAction)) {
                fetchSlotsData(selectedDate);
            } else {
                setError(resultAction.payload as string || 'Booking failed');
            }
        } catch (err: any) {
            setError('Booking failed');
        }
    };

    const renderHeader = () => {
        const dateFormat = "MMMM yyyy";
        return (
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Button variant="outline-secondary" size="sm" onClick={() => setCurrentMonth(addDays(currentMonth, -30))}>{'<'}</Button>
                <span>{format(currentMonth, dateFormat)}</span>
                <Button variant="outline-secondary" size="sm" onClick={() => setCurrentMonth(addDays(currentMonth, 30))}>{'>'}</Button>
            </div>
        );
    };

    const renderDays = () => {
        const dateFormat = "EEE";
        const days = [];
        let startDate = startOfWeek(currentMonth);
        for (let i = 0; i < 7; i++) {
            days.push(
                <div className="col text-center text-muted small" key={i}>
                    {format(addDays(startDate, i), dateFormat)}
                </div>
            );
        }
        return <div className="row mb-2">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;

                const isAvailable = availableDates.some(d => isSameDay(d, cloneDay));
                const isSelected = selectedDate && isSameDay(cloneDay, selectedDate!);
                const isCurrentMonth = isSameMonth(day, monthStart);

                days.push(
                    <div
                        className={`col p-2 text-center border ${!isCurrentMonth ? "text-muted bg-light" : ""
                            } ${isSelected ? "bg-primary text-white" : ""} ${isAvailable && isCurrentMonth ? "cursor-pointer fw-bold" : ""
                            }`}
                        key={day.toString()}
                        onClick={() => isCurrentMonth && handleDateClick(cloneDay)}
                        style={{
                            cursor: (isAvailable && isCurrentMonth) ? 'pointer' : 'default',
                            backgroundColor: (isAvailable && isCurrentMonth && !isSelected) ? '#e9ecef' : undefined
                        }}
                    >
                        <span>{formattedDate}</span>
                        {isAvailable && isCurrentMonth && <div className="text-primary" style={{ fontSize: '0.6em' }}>●</div>}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="row" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div>{rows}</div>;
    };

    if (loading) return <Container className="mt-5 text-center">Loading...</Container>;
    if (error) return <Container className="mt-5 text-center"><Alert variant="danger">{error}</Alert></Container>;

    if (bookingSuccess) {
        return (
            <Container className="mt-5 text-center">
                <Card className="p-5">
                    <h2 className="text-success">Booking Confirmed!</h2>
                    <p>You have successfully booked {selectedSlot} on {selectedDate && format(selectedDate, 'MMMM d, yyyy')}.</p>
                    <Button onClick={() => {
                        dispatch(resetBookingSuccess());
                        setSelectedSlot(null);
                        setGuestName('');
                        setGuestEmail('');
                    }}>Book Another</Button>
                </Card>
            </Container>
        )
    }

    return (
        <Container className="mt-5 mb-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-white">
                            <h4>Select a Date & Time</h4>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6} className="border-end">
                                    <div className="calendar-container">
                                        {renderHeader()}
                                        {renderDays()}
                                        {renderCells()}
                                    </div>
                                </Col>
                                <Col md={6}>
                                    {selectedDate ? (
                                        <div>
                                            <h5 className="mb-3">{format(selectedDate, 'EEEE, MMMM d')}</h5>
                                            {slots.length > 0 ? (
                                                <div className="d-flex flex-wrap gap-2 mb-4">
                                                    {slots.map(slot => (
                                                        <Button
                                                            key={slot}
                                                            variant={selectedSlot === slot ? "primary" : "outline-primary"}
                                                            onClick={() => handleSlotClick(slot)}
                                                            className="rounded-pill px-3"
                                                        >
                                                            {slot}
                                                        </Button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-muted">No available slots for this date.</p>
                                            )}

                                            {selectedSlot && (
                                                <div className="animate-fade-in mt-4 border-top pt-3">
                                                    <h6>Confirm Booking Details</h6>
                                                    <Form onSubmit={handleBook}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Control
                                                                type="text"
                                                                placeholder="Your Name"
                                                                value={guestName}
                                                                onChange={e => setGuestName(e.target.value)}
                                                                required
                                                            />
                                                        </Form.Group>
                                                        <Form.Group className="mb-3">
                                                            <Form.Control
                                                                type="email"
                                                                placeholder="Your Email"
                                                                value={guestEmail}
                                                                onChange={e => setGuestEmail(e.target.value)}
                                                                required
                                                            />
                                                        </Form.Group>
                                                        <Button type="submit" variant="success" className="w-100">
                                                            Confirm Booking
                                                        </Button>
                                                    </Form>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                                            <p>Select a date to view available times</p>
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default BookingPage;
