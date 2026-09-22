'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ACTIVITIES, ActivityType, MAX_DAILY_POINTS } from '@/lib/activities';
import { supabase } from '@/lib/activities'; 

type Status = {
    participant: { id: string; name: string; email: string };
    todayActivities: {
        id: string;
        type: ActivityType;
        points: number;
        photoUrl: string;
    }[];
    todayPoints: number;
    totalPoints: number;
    activityCount: number;
};

export default function Dashboard() {
    const router = useRouter();
    const [status, setStatus] = useState<Status | null>(null);
    const [selected, setSelected] = useState<ActivityType[]>([]);
    const [files, setFiles] = useState<Partial<Record<ActivityType, File>>>({});
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function load() {
        const response = await fetch('/api/participant');
        if (!response.ok) {
            router.push('/');
            return;
        }

        setStatus(await response.json());
    }

    useEffect(() => {
        load();
    }, []);

    async function submit() {
        if (selected.length === 0) {
            setError('Escolha pelo menos uma atividade.');
            return;
        }

        if (selected.some((type) => !files[type])) {
            setError('Envie uma foto para cada atividade selecionada.');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const uploadedPaths = await Promise.all(
                selected.map(async (type) => {
                    const file = files[type];
                    if (!file) {
                        throw new Error('Envie uma foto para cada atividade selecionada.');
                    }

                    const prepareUpload = await fetch('/api/photo', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            fileName: file.name,
                            contentType: file.type,
                        }),
                    });
                    const uploadInfo = await prepareUpload.json();

                    if (!prepareUpload.ok) {
                        throw new Error(
                            uploadInfo.error ?? 'Não foi possível preparar o upload.',
                        );
                    }

                    const { error: uploadError } = await supabase.storage
                        .from('activity-photos')
                        .uploadToSignedUrl(uploadInfo.path, uploadInfo.token, file);

                    if (uploadError) {
                        throw new Error(`Erro ao enviar foto: ${uploadError.message}`);
                    }

                    return [type, uploadInfo.path] as const;
                }),
            );

            const response = await fetch('/api/activities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    types: selected,
                    photoPaths: Object.fromEntries(uploadedPaths),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error ?? 'Não foi possível registrar.');
            }

            // ==========================================
            // SUCESSO
            // ==========================================

            setMessage('Atividade registrada com sucesso! 🎉');
            setSelected([]);
            setFiles({});

            await load();
        } catch (error) {
            console.error(error);

            setError(
                error instanceof Error
                    ? error.message
                    : 'Não foi possível registrar.',
            );
        } finally {
            setLoading(false);
        }

    }

    if (!status) {
        return <div className="card">Carregando...</div>;
    }

    return (
        <>
            <div className="card">
                <h1>Olá, {status.participant.name}!</h1>
                <p className="muted">Sua atividade de hoje</p>

                <div className="stat">{status.totalPoints} pontos</div>
                <p className="muted">
                    {status.activityCount} atividades registradas
                </p>
            </div>

            {status.todayActivities.length > 0 && (
                <div className="card">
                    <h2>Atividades de hoje ✅</h2>
                    {status.todayActivities.map((activity) => (
                        <div className="activity-summary" key={activity.id}>
                            <strong>{ACTIVITIES[activity.type].name}</strong>{' '}
                            <span>— +{activity.points} pontos</span>
                            <button
                                type="button"
                                className="button-danger"
                                onClick={async () => {
                                    const response = await fetch(`/api/activities/${activity.id}`, { method: 'DELETE' });
                                    if (response.ok) await load();
                                    else {
                                        const data = await response.json();
                                        setError(data.error ?? 'Não foi possível excluir.');
                                    }
                                }}
                            >
                                Excluir
                            </button>
                        </div>
                    ))}
                    <p className="muted">
                        Total de hoje: {status.todayPoints}/{MAX_DAILY_POINTS} pontos
                    </p>
                    <div className="notice">
                        Você pode registrar outras atividades até atingir o limite diário.
                    </div>
                </div>
            )}

            {status.todayPoints < MAX_DAILY_POINTS ? (
                <div className="card">
                    <h2>Escolha sua atividade</h2>

                    <div className="activity-grid">
                        {(
                            Object.entries(ACTIVITIES) as [
                                ActivityType,
                                (typeof ACTIVITIES)[ActivityType],
                            ][]
                        ).map(([type, activity]) => {
                            const isSelected = selected.includes(type);
                            const alreadyRegistered = status.todayActivities.some(
                                (item) => item.type === type,
                            );
                            const selectedPoints = selected.reduce(
                                (sum, selectedType) =>
                                    sum + ACTIVITIES[selectedType].points,
                                0,
                            );
                            const exceedsLimit =
                                !isSelected &&
                                status.todayPoints + selectedPoints + activity.points >
                                    MAX_DAILY_POINTS;

                            return <button
                                type="button"
                                key={type}
                                className={`activity-option ${isSelected ? 'selected' : ''}`}
                                disabled={alreadyRegistered || exceedsLimit}
                                onClick={() =>
                                    {
                                        setSelected((current) =>
                                            isSelected
                                                ? current.filter((item) => item !== type)
                                                : [...current, type],
                                        );
                                        if (isSelected) {
                                            setFiles((current) => {
                                                const next = { ...current };
                                                delete next[type];
                                                return next;
                                            });
                                        }
                                    }
                                }
                            >
                                <span style={{ fontSize: 28 }}>
                                    {activity.emoji}
                                </span>
                                <strong>{activity.name}</strong>
                                <span className="points">
                                    +{activity.points} pontos
                                </span>
                                {alreadyRegistered && (
                                    <span className="muted">Já registrada hoje</span>
                                )}
                            </button>;
                        })}
                    </div>

                    {selected.length > 0 && (
                        <div>
                            <h3>Envie uma foto para cada atividade</h3>
                            {selected.map((type) => (
                                <label key={type} htmlFor={`photo-${type}`}>
                                    {ACTIVITIES[type].emoji} {ACTIVITIES[type].name}
                                    <input
                                        id={`photo-${type}`}
                                        type="file"
                                        accept="image/*"
                                        onChange={(event) => {
                                            const file = event.target.files?.[0];
                                            if (file) {
                                                setFiles((current) => ({ ...current, [type]: file }));
                                            }
                                        }}
                                    />
                                </label>
                            ))}
                        </div>
                    )}

                    {error && <div className="error">{error}</div>}
                    {message && <div className="notice">{message}</div>}

                    <button
                        onClick={submit}
                        disabled={loading}
                        style={{ marginTop: 16 }}
                    >
                        {loading ? 'Enviando...' : 'Registrar atividade'}
                    </button>
                </div>
            ) : (
                <div className="card">
                    <div className="notice">
                        Você atingiu o limite diário de {MAX_DAILY_POINTS} pontos.
                    </div>
                </div>
            )}
        </>
    );
}
