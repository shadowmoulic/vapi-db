import { useState } from 'react';
import { supabase } from '../supabase';
import { LogIn, UserPlus, Key } from 'lucide-react';

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('Check your email for confirmation!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message || 'Authentication error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-dark)',
            padding: '24px'
        }}>
            <div className="glass-panel" style={{ width: '400px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}>
                        <Key size={32} />
                    </div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>RealtyVoice</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Secure Agency Access Portal</p>
                </div>

                <form onSubmit={handleAuth}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            className="form-control"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            className="form-control"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div style={{
                            color: 'var(--danger)',
                            fontSize: '0.875rem',
                            marginBottom: '16px',
                            textAlign: 'center',
                            background: 'rgba(239, 68, 68, 0.1)',
                            padding: '12px',
                            borderRadius: '8px'
                        }}>
                            {error}
                        </div>
                    )}

                    <button className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1.1rem' }} disabled={loading}>
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                                Authenticating...
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                                {isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
                                {isSignUp ? 'Initialize Client Account' : 'Secure Login'}
                            </div>
                        )}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.875rem' }}
                        >
                            {isSignUp ? 'Already have an account? Login' : 'Need client registration? Sign up'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
