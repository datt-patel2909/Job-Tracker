import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, RefreshCcw } from 'lucide-react';
import api from '../api/axios';

const ForgotPassword = () => {
    // Steps: 1 (Email), 2 (OTP), 3 (New Password)
    const [step, setStep] = useState(1);

    // Form States
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMessage(res.data.msg || 'OTP sent to your email');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const res = await api.post('/auth/verify-otp', { email, otp });
            setMessage(res.data.msg || 'OTP verified successfully');
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.msg || 'Invalid or expired OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setIsLoading(true);

        try {
            const res = await api.post('/auth/reset-password', { email, otp, password });
            setMessage(res.data.msg || 'Password reset successful');

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to reset password');
            setIsLoading(false);
        }
    };

    return (
        <main className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glass-card"
                style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 className="gradient-text" style={{ marginBottom: '0.5rem' }}>
                        Password Reset
                    </h2>
                    <p>
                        {step === 1 && "Enter your email to receive an OTP"}
                        {step === 2 && "Enter the 6-digit OTP sent to your email"}
                        {step === 3 && "Create a new strong password"}
                    </p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            backgroundColor: 'var(--danger-bg)',
                            color: 'var(--danger)',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '1.5rem',
                            fontSize: '0.875rem',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                        }}
                    >
                        {error}
                    </motion.div>
                )}

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            color: '#10b981',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '1.5rem',
                            fontSize: '0.875rem',
                            border: '1px solid rgba(16, 185, 129, 0.2)'
                        }}
                    >
                        {message}
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {/* STEP 1: EMAIL */}
                    {step === 1 && (
                        <motion.form
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleSendOtp}
                        >
                            <div className="input-group" style={{ marginBottom: '2rem' }}>
                                <label className="input-label" htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="input-field"
                                    placeholder="Enter your registered email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '0.875rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCcw size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                                        Sending OTP...
                                    </>
                                ) : 'Send OTP'}
                            </button>
                        </motion.form>
                    )}

                    {/* STEP 2: OTP */}
                    {step === 2 && (
                        <motion.form
                            key="step2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleVerifyOtp}
                        >
                            <div className="input-group" style={{ marginBottom: '2rem' }}>
                                <label className="input-label" htmlFor="otp">6-Digit OTP</label>
                                <input
                                    type="text"
                                    id="otp"
                                    className="input-field"
                                    placeholder="e.g. 123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    maxLength="6"
                                    style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '1.25rem' }}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '0.875rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCcw size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                                        Verifying...
                                    </>
                                ) : 'Verify OTP'}
                            </button>
                        </motion.form>
                    )}

                    {/* STEP 3: NEW PASSWORD */}
                    {step === 3 && (
                        <motion.form
                            key="step3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleResetPassword}
                        >
                            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                                <label className="input-label" htmlFor="password">New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        className="input-field"
                                        placeholder="Min. 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength="6"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', color: 'var(--text-secondary)',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="input-group" style={{ marginBottom: '2rem' }}>
                                <label className="input-label" htmlFor="confirmPassword">Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        className="input-field"
                                        placeholder="Re-enter password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength="6"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{
                                            position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', color: 'var(--text-secondary)',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                                        }}
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '0.875rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCcw size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                                        Resetting...
                                    </>
                                ) : 'Reset Password'}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem' }}>
                    <Link to="/login" style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </div>
            </motion.div>
        </main>
    );
};

export default ForgotPassword;
