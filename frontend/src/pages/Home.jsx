import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <main className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="glass-panel"
                style={{ padding: '4rem', textAlign: 'center', maxWidth: '800px' }}
            >
                <motion.h1
                    className="gradient-text"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    style={{ marginBottom: '1.5rem' }}
                >
                    Track Your Future
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    style={{ fontSize: '1.25rem', marginBottom: '3rem', color: 'var(--text-secondary)' }}
                >
                    The elegant, high-performance way to manage your job applications. Keep everything organized in one beautiful dashboard.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}
                >
                    <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                        Get Started
                    </Link>
                    <Link to="/login" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                        Login
                    </Link>
                </motion.div>
            </motion.div>
        </main>
    );
};

export default Home;
