import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Plus, Briefcase, RefreshCcw, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// Helper to format deadline nicely
const formatDeadline = (deadline) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) +
        ' at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

// Helper to get relative time label
const getDeadlineLabel = (deadline) => {
    if (!deadline) return null;
    const now = new Date();
    const dl = new Date(deadline);
    const diffMs = dl - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
        const pastDays = Math.abs(diffDays);
        if (pastDays === 0) return { text: 'Missed today', color: '#ef4444' };
        if (pastDays === 1) return { text: 'Missed yesterday', color: '#ef4444' };
        return { text: `Missed ${pastDays} days ago`, color: '#ef4444' };
    }

    if (diffDays === 0) return { text: 'Today', color: '#f59e0b' };
    if (diffDays === 1) return { text: 'Tomorrow', color: '#f59e0b' };
    if (diffDays <= 3) return { text: `In ${diffDays} days`, color: '#10b981' };
    if (diffDays <= 7) return { text: `In ${diffDays} days`, color: '#10b981' };
    return { text: `In ${diffDays} days`, color: 'var(--text-secondary)' };
};

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({ company: '', position: '', status: 'pending', deadline: '' });
    const [editingId, setEditingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchJobs = async () => {
        setIsLoading(true);
        setIsError(false);
        try {
            const { data } = await api.get('/jobs');
            setJobs(data.job || []);
        } catch (error) {
            console.error(error);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = { ...formData };
            // Convert empty deadline to null
            if (!payload.deadline) {
                payload.deadline = null;
            }
            if (editingId) {
                await api.patch(`/jobs/${editingId}`, payload);
            } else {
                await api.post('/jobs', payload);
            }
            setIsModalOpen(false);
            fetchJobs();
            resetForm();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/jobs/${id}`);
            fetchJobs();
        } catch (error) {
            console.error(error);
        }
    };

    const openEdit = (job) => {
        const deadlineValue = job.deadline
            ? new Date(job.deadline).toISOString().slice(0, 16)
            : '';
        setFormData({ company: job.company, position: job.position, status: job.status, deadline: deadlineValue });
        setEditingId(job._id);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({ company: '', position: '', status: 'pending', deadline: '' });
        setEditingId(null);
    };

    const openAdd = () => {
        resetForm();
        setIsModalOpen(true);
    };

    // Smart Grouping Logic
    const now = new Date();
    const upcomingInterviews = jobs.filter(j => j.status === 'interview' && j.deadline && new Date(j.deadline) >= now)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    const pending = jobs.filter(j => j.status === 'pending');
    const missed = jobs.filter(j => j.status === 'interview' && j.deadline && new Date(j.deadline) < now)
        .sort((a, b) => new Date(b.deadline) - new Date(a.deadline));
    const interviewsNoDeadline = jobs.filter(j => j.status === 'interview' && !j.deadline);
    const declined = jobs.filter(j => j.status === 'declined');

    const sections = [
        { title: '🔔 Upcoming Interviews', jobs: upcomingInterviews, icon: <Clock size={20} />, color: '#10b981' },
        { title: '📋 Interviews (No Deadline)', jobs: interviewsNoDeadline, icon: <CheckCircle size={20} />, color: '#8b5cf6' },
        { title: '⏳ Pending Applications', jobs: pending, icon: <RefreshCcw size={20} />, color: '#f59e0b' },
        { title: '⚠️ Missed Deadlines', jobs: missed, icon: <AlertTriangle size={20} />, color: '#ef4444' },
        { title: '🚫 Declined', jobs: declined, icon: <XCircle size={20} />, color: '#6b7280' },
    ].filter(s => s.jobs.length > 0);

    const JobCard = ({ job }) => {
        const deadlineLabel = getDeadlineLabel(job.deadline);

        return (
            <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="glass-card"
                style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{job.position}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{job.company}</p>
                    </div>
                    <span className={`status-badge status-${job.status}`}>
                        {job.status}
                    </span>
                </div>

                {/* Deadline display */}
                {job.deadline && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255,255,255,0.03)', marginBottom: '0.5rem',
                        fontSize: '0.8rem'
                    }}>
                        <Clock size={14} style={{ color: deadlineLabel?.color || 'var(--text-secondary)' }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{formatDeadline(job.deadline)}</span>
                        {deadlineLabel && (
                            <span style={{
                                marginLeft: 'auto', fontWeight: 600, fontSize: '0.75rem',
                                color: deadlineLabel.color,
                                background: `${deadlineLabel.color}15`, padding: '0.2rem 0.5rem',
                                borderRadius: '999px'
                            }}>
                                {deadlineLabel.text}
                            </span>
                        )}
                    </div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--glass-border)' }}>
                    <button onClick={() => openEdit(job)} className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem' }}>Edit</button>
                    <button onClick={() => handleDelete(job._id)} className="btn btn-danger" style={{ flex: 1, padding: '0.5rem' }}>Delete</button>
                </div>
            </motion.div>
        );
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Navbar */}
            <nav className="glass-panel" style={{ padding: '1rem', borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, display: 'flex', justifyContent: 'center' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Briefcase className="gradient-text" style={{ color: 'var(--accent-primary)' }} />
                        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Job Tracker</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            Welcome, <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong>
                        </span>
                        <button onClick={logout} className="btn" style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-md)' }}>
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container" style={{ flex: 1, padding: '3rem 1.5rem' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Your Applications</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Track and manage your career opportunities.</p>
                    </div>
                    <button onClick={openAdd} className="btn btn-primary">
                        <Plus size={18} /> Add Job
                    </button>
                </header>

                {/* Status Loading/Error */}
                {isLoading && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <RefreshCcw className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} size={32} />
                    </div>
                )}

                {isError && (
                    <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                        <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Failed to load jobs.</p>
                        <button onClick={fetchJobs} className="btn btn-secondary">Try Again</button>
                    </div>
                )}

                {/* Jobs - Smart Grouped Sections */}
                {!isLoading && !isError && jobs.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                        <Briefcase size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1.5rem', opacity: 0.5 }} />
                        <h3 style={{ marginBottom: '0.5rem' }}>No applications yet</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Your journey starts here. Add your first job application to get started.</p>
                        <button onClick={openAdd} className="btn btn-primary">Add Your First Job</button>
                    </motion.div>
                ) : (
                    <div>
                        {sections.map((section) => (
                            <div key={section.title} style={{ marginBottom: '2.5rem' }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    marginBottom: '1.25rem', paddingBottom: '0.75rem',
                                    borderBottom: `2px solid ${section.color}22`
                                }}>
                                    <span style={{ color: section.color }}>{section.icon}</span>
                                    <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{section.title}</h2>
                                    <span style={{
                                        fontSize: '0.8rem', background: `${section.color}20`, color: section.color,
                                        padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 600
                                    }}>
                                        {section.jobs.length}
                                    </span>
                                </div>
                                <div className="grid-3">
                                    <AnimatePresence>
                                        {section.jobs.map((job) => (
                                            <JobCard key={job._id} job={job} />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        background: 'rgba(15, 17, 26, 0.8)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass-card"
                            style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: 'var(--bg-secondary)' }}
                        >
                            <h2 style={{ marginBottom: '1.5rem' }}>{editingId ? 'Edit Job' : 'Add New Job'}</h2>

                            <form onSubmit={handleSubmit}>
                                <div className="input-group">
                                    <label className="input-label" htmlFor="company">Company</label>
                                    <input type="text" id="company" className="input-field" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} required />
                                </div>

                                <div className="input-group">
                                    <label className="input-label" htmlFor="position">Position</label>
                                    <input type="text" id="position" className="input-field" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} required />
                                </div>

                                <div className="input-group">
                                    <label className="input-label" htmlFor="status">Status</label>
                                    <select
                                        id="status"
                                        className="input-field"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        style={{ appearance: 'none', background: 'var(--bg-tertiary)' }}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="interview">Interview</option>
                                        <option value="declined">Declined</option>
                                    </select>
                                </div>

                                <div className="input-group" style={{ marginBottom: '2rem' }}>
                                    <label className="input-label" htmlFor="deadline">Deadline / Interview Date (optional)</label>
                                    <input
                                        type="datetime-local"
                                        id="deadline"
                                        className="input-field"
                                        value={formData.deadline}
                                        onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : 'Save Job'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
