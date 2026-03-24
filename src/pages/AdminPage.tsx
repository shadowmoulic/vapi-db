import { useState } from 'react';
import { supabase } from '../supabase';
import { ShieldCheck, UserPlus, Trash2, Search, Edit3 } from 'lucide-react';

const AdminPage = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminUser, setAdminUser] = useState('');
    const [adminPass, setAdminPass] = useState('');
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Form states
    const [targetUserId, setTargetUserId] = useState('');
    const [targetVapiKey, setTargetVapiKey] = useState('');
    const [targetClientName, setTargetClientName] = useState('');

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (adminUser === 'realtyvoice' && adminPass === 'Sayak@2007') {
            setIsAdmin(true);
            fetchProfiles();
        } else {
            alert('Unauthorized Access: Admin Credentials Invalid.');
        }
    };

    const fetchProfiles = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('client_profiles')
            .select('*')
            .order('updated_at', { ascending: false });

        if (data) setProfiles(data);
        if (error) console.error(error);
        setLoading(false);
    };

    const handleCreateUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase
            .from('client_profiles')
            .upsert({
                id: targetUserId,
                vapi_key: targetVapiKey,
                client_name: targetClientName
            });

        if (error) {
            alert('Sync Error: ' + error.message);
        } else {
            alert('Client Identity Provisioned Successfully.');
            setTargetUserId('');
            setTargetVapiKey('');
            setTargetClientName('');
            fetchProfiles();
        }
        setLoading(false);
    };

    const deleteProfile = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this client?')) return;
        const { error } = await supabase.from('client_profiles').delete().eq('id', id);
        if (!error) fetchProfiles();
    };

    if (!isAdmin) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px' }}>
                <div className="glass-panel" style={{ width: 400, padding: 40 }}>
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <ShieldCheck size={48} style={{ color: 'var(--primary)', margin: '0 auto 16px' }} />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Privileged Access</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>RealityVoice Super Admin Panel</p>
                    </div>
                    <form onSubmit={handleAdminLogin}>
                        <div className="form-group">
                            <label>Admin ID</label>
                            <input className="form-control" type="text" value={adminUser} onChange={e => setAdminUser(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Security Phrase</label>
                            <input className="form-control" type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} required />
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%' }}>Authenticate Admin</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 1200 }}>
            <div className="flex-between mb-4">
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Client Management Console</h2>
                <button className="btn btn-secondary" onClick={fetchProfiles}>Refresh Registry</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32 }}>
                {/* Provisioning Form */}
                <div className="glass-panel" style={{ padding: 24, height: 'fit-content' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <UserPlus size={18} /> Provision Client
                    </h3>
                    <form onSubmit={handleCreateUpdate}>
                        <div className="form-group">
                            <label>Client User ID (from Supabase Auth)</label>
                            <input
                                className="form-control"
                                value={targetUserId}
                                onChange={e => setTargetUserId(e.target.value)}
                                placeholder="UUID from Authentication tab..."
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Organization Name</label>
                            <input
                                className="form-control"
                                value={targetClientName}
                                onChange={e => setTargetClientName(e.target.value)}
                                placeholder="e.g. Skyline Realty"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Assigned Vapi API Key</label>
                            <input
                                className="form-control"
                                type="text"
                                value={targetVapiKey}
                                onChange={e => setTargetVapiKey(e.target.value)}
                                placeholder="Bearer token..."
                                required
                            />
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Processing...' : 'Provision/Update Identity'}
                        </button>
                    </form>
                </div>

                {/* Registry List */}
                <div className="glass-panel" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Search size={18} /> Licensed Organizations
                    </h3>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Client / ID</th>
                                    <th>Vapi Key (Partial)</th>
                                    <th>Last Updated</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profiles.map((p) => (
                                    <tr key={p.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{p.client_name}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.id.slice(0, 12)}...</div>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {p.vapi_key.slice(0, 8)}...{p.vapi_key.slice(-4)}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '0.8rem' }}>{new Date(p.updated_at).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{ padding: 6 }}
                                                    onClick={() => {
                                                        setTargetUserId(p.id);
                                                        setTargetClientName(p.client_name);
                                                        setTargetVapiKey(p.vapi_key);
                                                    }}
                                                >
                                                    <Edit3 size={14} />
                                                </button>
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{ padding: 6, color: 'var(--danger)' }}
                                                    onClick={() => deleteProfile(p.id)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {profiles.length === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                                            No licensed organizations found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
