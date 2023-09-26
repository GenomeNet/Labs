import React, { useState } from 'react';

export const TestComponent: React.FC = () => {
    const [modelData, setModelData] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchModel = async () => {
        setLoading(true);

        try {
            const response = await fetch(`/public/model-cards/VirusNet-gpu.json`);
            if (response.ok) {
                const data = await response.json();
                setModelData(data);
            } else {
                console.error('Failed to fetch');
            }
        } catch (error) {
            console.error('Error fetching:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={fetchModel}>Fetch Model</button>

            {loading && <p>Loading...</p>}
            {modelData ? <p>{modelData.name}</p> : <p>No model selected</p>}
        </div>
    );
};
