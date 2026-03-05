import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        setError('');
        const result = await googleLogin(credentialResponse.credential);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google Sign-In failed');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(formData.email, formData.password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
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
                    <h2 className="gradient-text" style={{ marginBottom: '0.5rem' }}>Welcome Back</h2>
                    <p>Login to your Job Tracker account</p>
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

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="filled_black"
                        shape="pill"
                        text="signin_with"
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                    <hr style={{ flex: 1, border: 'none', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                    <span style={{ padding: '0 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>or continue with email</span>
                    <hr style={{ flex: 1, border: 'none', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label" htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className="input-field"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group" style={{ marginBottom: '2rem' }}>
                        <label className="input-label" htmlFor="password">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 0
                                }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                            <Link to="/forgot-password" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 500 }}>
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.875rem' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
                    <Link to="/register" style={{ fontWeight: 600 }}>Create one</Link>
                </div>
            </motion.div>
        </main>
    );
};

export default Login;
