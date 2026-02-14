import React, { useState } from 'react';
import { Form, Button, Container, InputGroup, Card, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import APICallService from '../api/apiCallService';
import { SIGNUP } from '../api/apiEndPoints';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useStaticText } from '../utils/staticJSON';
import { success } from '../utils/toast';
import { useAuth } from '../app/modules/auth';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const staticText = useStaticText();
    const { saveAuth, saveCurrentUser } = useAuth();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .required(staticText.auth.validation.usernameRequired)
            .min(3, staticText.auth.validation.usernameMinLength),
        email: Yup.string()
            .email(staticText.auth.validation.emailInvalid)
            .required(staticText.auth.validation.emailRequired),
        password: Yup.string()
            .required(staticText.auth.validation.passwordRequired)
            .min(8, staticText.auth.validation.passwordMinLength)
            .matches(/[a-z]/, staticText.auth.validation.passwordLowercase)
            .matches(/[A-Z]/, staticText.auth.validation.passwordUppercase)
            .matches(/[0-9]/, staticText.auth.validation.passwordNumber)
            .matches(/[^\w]/, staticText.auth.validation.passwordSpecialChar)
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            password: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const payload = {
                    username: values.name,
                    email: values.email,
                    password: values.password
                };

                const apiService = new APICallService(
                    SIGNUP,
                    payload
                );

                const response = await apiService.callAPI();

                if (response) {
                    saveAuth(response.token);
                    saveCurrentUser({ _id: response.user._id });
                    success(staticText.toast.auth.registerSuccess);
                    navigate('/dashboard');
                }
            } catch (err: any) {
                console.error("Register Error:", err);
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <Container fluid className="vh-100 d-flex align-items-center justify-content-center bg-light">
            <Row className="w-100 justify-content-center">
                <Col md={8} lg={6} xl={4}>
                    <Card className="border-0 shadow-lg rounded-4">
                        <Card.Body className="p-5">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold text-primary">Create Account</h2>
                                <p className="text-secondary">Start scheduling your meetings efficiently</p>
                            </div>

                            <Form onSubmit={formik.handleSubmit}>
                                {/* Name Field */}
                                <Form.Group className="mb-3">
                                    <Form.Label>{staticText.auth.usernameLabel} <span className="text-danger">*</span></Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className={`bg-light border-end-0 text-secondary ${formik.touched.name && formik.errors.name ? 'border-danger' : ''}`}>
                                            <FiUser size={18} />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter your name"
                                            className={`border-start-0 ps-0 ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''}`}
                                            {...formik.getFieldProps('name')}
                                        />
                                    </InputGroup>
                                    {formik.touched.name && formik.errors.name && (
                                        <div className="text-danger small mt-1">{formik.errors.name}</div>
                                    )}
                                </Form.Group>

                                {/* Email Field */}
                                <Form.Group className="mb-3">
                                    <Form.Label>{staticText.auth.emailLabel} <span className="text-danger">*</span></Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className={`bg-light border-end-0 text-secondary ${formik.touched.email && formik.errors.email ? 'border-danger' : ''}`}>
                                            <FiMail size={18} />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="email"
                                            placeholder={staticText.auth.emailPlaceholder}
                                            className={`border-start-0 ps-0 ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
                                            {...formik.getFieldProps('email')}
                                        />
                                    </InputGroup>
                                    {formik.touched.email && formik.errors.email && (
                                        <div className="text-danger small mt-1">{formik.errors.email}</div>
                                    )}
                                </Form.Group>

                                {/* Password Field */}
                                <Form.Group className="mb-4">
                                    <Form.Label>{staticText.auth.passwordLabel} <span className="text-danger">*</span></Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className={`bg-light border-end-0 text-secondary ${formik.touched.password && formik.errors.password ? 'border-danger' : ''}`}>
                                            <FiLock size={18} />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type={passwordVisible ? 'text' : 'password'}
                                            placeholder={staticText.auth.passwordPlaceholder}
                                            className={`border-start-0 ps-0 ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
                                            {...formik.getFieldProps('password')}
                                        />
                                        <InputGroup.Text
                                            className={`bg-light border-start-0 cursor-pointer ${formik.touched.password && formik.errors.password ? 'border-danger' : ''}`}
                                            onClick={() => setPasswordVisible(!passwordVisible)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {passwordVisible ? <FiEyeOff /> : <FiEye />}
                                        </InputGroup.Text>
                                    </InputGroup>
                                    {formik.touched.password && formik.errors.password && (
                                        <div className="text-danger small mt-1">{formik.errors.password}</div>
                                    )}
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="w-100 py-2 fw-bold text-uppercase d-flex align-items-center justify-content-center gap-2"
                                    disabled={loading || !formik.isValid}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            Creating Account...
                                        </>
                                    ) : (
                                        'Sign Up'
                                    )}
                                </Button>
                            </Form>

                            <div className="text-center mt-4">
                                <span className="text-secondary">{staticText.auth.alreadyAccountQuestion} </span>
                                <Link to="/login" className="fw-bold text-decoration-none text-primary">
                                    Log In
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Register;
