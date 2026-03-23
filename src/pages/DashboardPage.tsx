import { useEffect, useState } from 'react';
import { Users, PhoneOutgoing, Clock, CheckCircle2 } from 'lucide-react';
import { getCalls, getAssistants } from '../api';

const DashboardPage = () => {
    const [calls, setCalls] = useState<any[]>([]);
    const [assistants, setAssistants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedAgentId, setSelectedAgentId] = useState<string>('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [callsData, assistantsData] = await Promise.all([
                getCalls(),
                getAssistants()
            ]);
            setCalls(callsData);
            setAssistants(assistantsData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filteredCalls = selectedAgentId === 'all'
        ? calls
        : calls.filter(c => c.assistantId === selectedAgentId);

    const totalCalls = filteredCalls.length;
    const avgDuration = filteredCalls.reduce((acc, curr) => {
        const start = new Date(curr.createdAt).getTime();
        const end = curr.endedAt ? new Date(curr.endedAt).getTime() : start;
        return acc + (end - start) / 1000;
    }, 0) / (totalCalls || 1);

    const formatDuration = (sec: number) => {
        const mins = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${mins}m ${s}s`;
    };

    return (
        <div>
            <div className="flex-between" style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Overview</h2>
                <div className="form-group" style={{ marginBottom: 0, minWidth: 200 }}>
                    <select
                        className="form-control"
                        value={selectedAgentId}
                        onChange={(e) => setSelectedAgentId(e.target.value)}
                        style={{ height: '40px', padding: '0 16px' }}
                    >
                        <option value="all">All Agents</option>
                        {assistants.map((agent) => (
                            <option key={agent.id} value={agent.id}>
                                {agent.name || `Agent (${agent.id.slice(0, 8)})`}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Syncing secure data...</div>
            ) : (
                <>
                    <div className="stats-grid">
                        <div className="card stat-card">
                            <div className="stat-icon"><PhoneOutgoing /></div>
                            <div className="stat-details">
                                <h3>Total Calls</h3>
                                <p>{totalCalls}</p>
                            </div>
                        </div>
                        <div className="card stat-card">
                            <div className="stat-icon" style={{ color: 'var(--success)', background: 'rgba(16,185,129,0.1)' }}>
                                <CheckCircle2 />
                            </div>
                            <div className="stat-details">
                                <h3>Completed</h3>
                                <p>{filteredCalls.filter(c => c.status === 'ended').length}</p>
                            </div>
                        </div>
                        <div className="card stat-card">
                            <div className="stat-icon" style={{ color: 'var(--accent)', background: 'rgba(139,92,246,0.1)' }}>
                                <Clock />
                            </div>
                            <div className="stat-details">
                                <h3>Avg. Duration</h3>
                                <p>{formatDuration(avgDuration)}</p>
                            </div>
                        </div>
                        <div className="card stat-card">
                            <div className="stat-icon" style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)' }}>
                                <Users />
                            </div>
                            <div className="stat-details">
                                <h3>Cost</h3>
                                <p>${filteredCalls.reduce((acc, c) => acc + (c.cost || 0), 0).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: 24 }}>
                        <h3 style={{ marginBottom: 16 }}>Recent Call Activity</h3>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>Agent</th>
                                        <th>Status</th>
                                        <th>Cost</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCalls.slice(0, 5).map((call) => (
                                        <tr key={call.id}>
                                            <td>{call.customer?.number || 'Unknown Caller'}</td>
                                            <td style={{ color: 'var(--text-muted)' }}>
                                                {assistants.find(a => a.id === call.assistantId)?.name || 'Unknown'}
                                            </td>
                                            <td>
                                                <span className={`badge ${call.status === 'ended' ? 'success' : 'primary'}`}>
                                                    {call.status}
                                                </span>
                                            </td>
                                            <td>${call.cost?.toFixed(3) || '0.000'}</td>
                                            <td>{new Date(call.createdAt).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {filteredCalls.length === 0 && (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: 'center', padding: 32 }}>No calls found for this agent.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardPage;
