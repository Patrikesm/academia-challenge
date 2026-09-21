'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ACTIVITIES, ActivityType } from '@/lib/activities';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/activities'; 

type Status = {
    participant: { id: string; name: string; email: string };
    todayActivity: {
        type: ActivityType;
        points: number;
        photoUrl: string;
    } | null;
    totalPoints: number;
    activityCount: number;
};

export default function Dashboard() {
    const router = useRouter();
    const [status, setStatus] = useState<Status | null>(null);
    const [selected, setSelected] = useState<ActivityType | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const participantId =
        typeof window !== 'undefined'
            ? localStorage.getItem('participantId')
            : null;

    async function load() {
        if (!participantId) {
            router.push('/');
            return;
        }

        const response = await fetch(
            `/api/participant?participantId=${participantId}`,
        );
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
        if (!participantId || !selected || !file) {
            setError('Escolha uma atividade e envie uma foto.');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            // ==========================================
            // 1. PEDIR AO BACKEND PARA PREPARAR O UPLOAD
            // ==========================================

            const prepareUpload = await fetch('/api/photo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    participantId,
                    fileName: file.name,
                    contentType: file.type,
                }),
            });

            // const uploadInfo = await prepareUpload.json();

            const uploadText = await prepareUpload.text();

            console.log("STATUS:", prepareUpload.status);
            console.log("RESPOSTA:", uploadText);

            const uploadInfo = JSON.parse(uploadText);

            if (!prepareUpload.ok) {
                throw new Error(
                    uploadInfo.error ?? 'Não foi possível preparar o upload.',
                );
            }

            // ==========================================
            // 2. UPLOAD DIRETO PARA O SUPABASE STORAGE
            // ==========================================

            const { error: uploadError } = await supabase.storage
                .from('activity-photos')
                .uploadToSignedUrl(uploadInfo.path, uploadInfo.token, file);

            if (uploadError) {
                throw new Error(`Erro ao enviar foto: ${uploadError.message}`);
            }

            // ==========================================
            // 3. REGISTRAR A ATIVIDADE NO BACKEND
            // ==========================================

            const response = await fetch('/api/activities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    participantId,
                    type: selected,
                    photoPath: uploadInfo.path,
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
            setSelected(null);
            setFile(null);

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

        // if (!participantId || !selected || !file) {
        //   setError("Escolha uma atividade e envie uma foto.");
        //   return;
        // }

        // setLoading(true);
        // setError("");
        // setMessage("");

        // const form = new FormData();
        // form.append("participantId", participantId);
        // form.append("type", selected);
        // form.append("photo", file);

        // const response = await fetch("/api/activities", {
        //   method: "POST",
        //   body: form,
        // });

        // const data = await response.json();

        // if (!response.ok) {
        //   setError(data.error ?? "Não foi possível registrar.");
        //   setLoading(false);
        //   return;
        // }

        // setMessage("Atividade registrada com sucesso! 🎉");
        // setSelected(null);
        // setFile(null);
        // await load();
        // setLoading(false);
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

            {status.todayActivity ? (
                <div className="card">
                    <h2>Atividade de hoje ✅</h2>
                    <p>
                        <strong>
                            {ACTIVITIES[status.todayActivity.type].name}
                        </strong>{' '}
                        — +{status.todayActivity.points} pontos
                    </p>
                    <img
                        className="photo"
                        src={status.todayActivity.photoUrl}
                        alt="Comprovante da atividade"
                    />
                    <div className="notice">
                        Você já registrou sua atividade hoje.
                    </div>
                </div>
            ) : (
                <div className="card">
                    <h2>Escolha sua atividade</h2>

                    <div className="activity-grid">
                        {(
                            Object.entries(ACTIVITIES) as [
                                ActivityType,
                                (typeof ACTIVITIES)[ActivityType],
                            ][]
                        ).map(([type, activity]) => (
                            <button
                                type="button"
                                key={type}
                                className={`activity-option ${selected === type ? 'selected' : ''}`}
                                onClick={() => setSelected(type)}
                            >
                                <span style={{ fontSize: 28 }}>
                                    {activity.emoji}
                                </span>
                                <strong>{activity.name}</strong>
                                <span className="points">
                                    +{activity.points} pontos
                                </span>
                            </button>
                        ))}
                    </div>

                    <label htmlFor="photo">Foto da atividade</label>
                    <input
                        id="photo"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />

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
            )}
        </>
    );
}
