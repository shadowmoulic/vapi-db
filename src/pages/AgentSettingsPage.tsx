import { useEffect, useState } from 'react';
import { RefreshCw, Volume2, Sparkles, MessageSquare, Zap } from 'lucide-react';
import { getAssistants, updateAssistant } from '../api';

const PRESET_VOICES = [
    { id: '21m00Tcm4llvDq8ikBAD', name: 'Rachel (Professional/Calm)', provider: 'ElevenLabs' },
    { id: 'AZnzlk1Xhk8AtfQgl8pY', name: 'Nicole (Sweet/Friendly)', provider: 'ElevenLabs' },
    { id: 'EXAVITQu4vr4xnNLMQer', name: 'Bella (Soft/Confident)', provider: 'ElevenLabs' },
    { id: 'ErXw7Rf8i3RwT6Ox8BsH', name: 'Antoni (Deep/Reassuring)', provider: 'ElevenLabs' },
    { id: 'Lcf7W5oM0QX8xqgSAt6N', name: 'Josh (Casual/Energetic)', provider: 'ElevenLabs' },
    { id: 'VR6AewrXVreH9W6Vm6m2', name: 'Arnold (Powerful/Narrative)', provider: 'ElevenLabs' },
];

const AgentSettingsPage = () => {
    const [assistants, setAssistants] = useState<any[]>([]);
    const [selectedAgentId, setSelectedAgentId] = useState<string>('');
    const [agentData, setAgentData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchAssistants();
    }, []);

    const fetchAssistants = async () => {
        try {
            setLoading(true);
            const data = await getAssistants();
            setAssistants(data);
            if (data.length > 0) {
                setSelectedAgentId(data[0].id);
                setAgentData(data[0]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAgentSelect = (id: string) => {
        setSelectedAgentId(id);
        setAgentData(assistants.find(a => a.id === id) || null);
    };

    const handleSystemPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setAgentData({
            ...agentData,
            model: {
                ...agentData.model,
                messages: [{ role: 'system', content: e.target.value }]
            }
        });
    };

    const handleVoiceChange = (voiceId: string) => {
        setAgentData({
            ...agentData,
            voice: { ...agentData.voice, voiceId: voiceId }
        });
    };

    const saveConfiguration = async () => {
        try {
            setSaving(true);

            const payload: any = {};
            if (agentData.model && agentData.model.messages && agentData.model.messages.length > 0) {
                payload.model = {
                    ...agentData.model,
                    messages: [{ role: 'system', content: agentData.model.messages[0].content }]
                };
            }
            if (agentData.voice && agentData.voice.voiceId) {
                payload.voice = {
                    ...agentData.voice,
                    voiceId: agentData.voice.voiceId
                };
            }

            await updateAssistant(selectedAgentId, payload);
            alert('RealtyVoice Identity Synced Successfully.');
        } catch (e) {
            console.error(e);
            alert('Sync failed. Please check Vapi credentials.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Synchronizing with RealtyVoice Neural Engine...</div>;
    }

    return (
        <div style={{ maxWidth: 1000 }}>
            <div className="flex-between mb-4">
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
                        Agent Intelligence <Sparkles size={20} style={{ color: 'var(--primary)', marginLeft: 8 }} />
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Configure the DNA of your RealtyVoice Inbound Representative.</p>
                </div>
                <button className="btn btn-secondary" onClick={fetchAssistants}>
                    <RefreshCw size={16} /> Refresh Agents
                </button>
            </div>

            <div className="glass-panel" style={{ padding: 32, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Zap size={16} style={{ color: 'var(--primary)' }} /> Deploying To
                    </label>
                    <select
                        className="form-control"
                        value={selectedAgentId}
                        onChange={(e) => handleAgentSelect(e.target.value)}
                        style={{ fontSize: '1.1rem', fontWeight: 500, background: 'rgba(0,0,0,0.4)' }}
                    >
                        {assistants.map((agent) => (
                            <option key={agent.id} value={agent.id}>
                                {agent.name || `Unnamed Agent (${agent.id.slice(0, 8)}...)`}
                            </option>
                        ))}
                    </select>
                </div>

                {agentData && (
                    <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>

                        <div style={{ flex: 1 }}>
                            <div className="flex-between mb-4">
                                <span className="badge primary" style={{ padding: '6px 14px', borderRadius: 8 }}>
                                    <MessageSquare size={14} style={{ marginRight: 6 }} /> Cognitive Model
                                </span>
                            </div>

                            <div className="form-group mb-4">
                                <label>Real-time Instructions (System Prompt)</label>
                                <textarea
                                    className="form-control"
                                    value={agentData.model?.messages?.[0]?.content || ''}
                                    onChange={handleSystemPromptChange}
                                    style={{ height: 350, fontSize: '0.95rem', lineHeight: 1.6, background: 'rgba(0,0,0,0.3)' }}
                                    placeholder="Example: You are a friendly RealtyVoice agent. Your goal is to qualify inbound property leads..."
                                />
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <div className="flex-between mb-4">
                                <span className="badge success" style={{ padding: '6px 14px', borderRadius: 8 }}>
                                    <Volume2 size={14} style={{ marginRight: 6 }} /> Vocal Synthesis
                                </span>
                            </div>

                            <div className="form-group mb-4">
                                <label>Voice Persona Selection</label>
                                <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
                                    {PRESET_VOICES.map((voice) => (
                                        <div
                                            key={voice.id}
                                            onClick={() => handleVoiceChange(voice.id)}
                                            style={{
                                                padding: '16px',
                                                borderRadius: 12,
                                                background: agentData.voice?.voiceId === voice.id ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                                                border: `1px solid ${agentData.voice?.voiceId === voice.id ? 'var(--primary)' : 'var(--border-color)'}`,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                justifyContent: 'between',
                                                alignItems: 'center'
                                            }}
                                            className="voice-card"
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, color: agentData.voice?.voiceId === voice.id ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                                    {voice.name}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{voice.provider} Optimized</div>
                                            </div>
                                            {agentData.voice?.voiceId === voice.id && <Sparkles size={16} style={{ color: 'var(--primary)' }} />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Custom Voice ID (Advanced)</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    value={agentData.voice?.voiceId || ''}
                                    onChange={(e) => handleVoiceChange(e.target.value)}
                                    placeholder="Enter UUID..."
                                    style={{ fontSize: '0.8rem' }}
                                />
                            </div>

                            <div style={{ marginTop: 32 }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={saveConfiguration}
                                    disabled={saving}
                                    style={{ width: '100%', padding: '16px', fontSize: '1.1rem', borderRadius: 12 }}
                                >
                                    {saving ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} />}
                                    <span style={{ marginLeft: 10 }}>{saving ? 'Syncing Neural Profile...' : 'Deploy Global Update'}</span>
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentSettingsPage;
