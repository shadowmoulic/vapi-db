import { useEffect, useState } from 'react';
import { Download, X, Search } from 'lucide-react';
import { getCalls, getAssistants } from '../api';

const CallsPage = () => {
    const [calls, setCalls] = useState<any[]>([]);
    const [assistants, setAssistants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCall, setSelectedCall] = useState<any | null>(null);

    // Filter states
    const [selectedAgentId, setSelectedAgentId] = useState<string>('all');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
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

    const getTranscript = (call: any) => {
        if (!call.transcript && !call.messages) return "No transcript available.";
        if (call.transcript) return call.transcript;
        return call.messages?.map((m: any) => `${m.role.toUpperCase()}: ${m.message}`).join('\n') || "No transcript.";
    };

    const filteredCalls = selectedAgentId === 'all'
        ? calls
        : calls.filter(c => c.assistantId === selectedAgentId);

    return (
        <div className="calls-container" style={{ display: 'flex', gap: 32, height: '100%', alignItems: 'flex-start' }}>
            <div className="glass-panel calls-list-pane" style={{ flex: 1, padding: 24, overflowY: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
                <div className="flex-between mb-4">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Call Logs</h2>
                    <div style={{ display: 'flex', gap: 12 }}>
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
                        <button className="btn btn-secondary" onClick={fetchInitialData}>Refresh</button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Retrieving calls...</div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Caller</th>
                                    <th>Agent</th>
                                    <th>Duration</th>
                                    <th>Recording / Transcript</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCalls.map((call) => (
                                    <tr key={call.id} onClick={() => setSelectedCall(call)} style={{ cursor: 'pointer' }}>
                                        <td>{call.customer?.number || 'Unknown Caller'}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>
                                            {assistants.find(a => a.id === call.assistantId)?.name || 'Unknown'}
                                        </td>
                                        <td>{call.endedAt ? Math.floor((new Date(call.endedAt).getTime() - new Date(call.createdAt).getTime()) / 1000) + 's' : 'Live'}</td>
                                        <td>
                                            {call.recordingUrl || call.transcript || call.messages?.length > 0 ? (
                                                <span className="badge success">Available</span>
                                            ) : (
                                                <span className="badge danger">None</span>
                                            )}
                                        </td>
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
                )}
            </div>

            {/* Detail View Pane */}
            <div className="glass-panel calls-detail-pane" style={{ width: 450, flexShrink: 0, padding: 24, display: selectedCall ? 'block' : 'none', overflowY: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
                {selectedCall && (
                    <div>
                        <div className="flex-between mb-4">
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Call Details</h3>
                            <button className="btn btn-secondary" onClick={() => setSelectedCall(null)} style={{ padding: '6px', borderRadius: '50%' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="form-group mb-4">
                            <label>Status & Reason</label>
                            <div>
                                <span className={`badge ${selectedCall.status === 'ended' ? 'success' : 'primary'}`}>
                                    {selectedCall.status}
                                </span>
                                {selectedCall.endedReason && (
                                    <span style={{ marginLeft: 8, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                        {selectedCall.endedReason}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Recording Section */}
                        <div className="form-group mb-4" style={{ background: 'var(--bg-panel-hover)', padding: 16, borderRadius: 12 }}>
                            <label style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Search size={16} /> Recording Options
                            </label>
                            <div style={{ marginTop: 12 }}>
                                {selectedCall.recordingUrl ? (
                                    <>
                                        <audio controls src={selectedCall.recordingUrl} style={{ background: 'transparent' }} />
                                        <a href={selectedCall.recordingUrl} target="_blank" rel="noreferrer" className="btn btn-secondary mt-3" style={{ width: '100%', justifyContent: 'center' }}>
                                            <Download size={16} /> Download Audio
                                        </a>
                                    </>
                                ) : (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No recording was generated for this call.</p>
                                )}
                            </div>
                        </div>

                        {/* Transcript Section */}
                        <div className="form-group mb-4">
                            <label style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Transcript Viewer</label>
                            <div className="form-control transcript-viewer" style={{ height: 350, overflowY: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.875rem', marginTop: 8, background: 'rgba(0,0,0,0.3)' }}>
                                {getTranscript(selectedCall)}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default CallsPage;
