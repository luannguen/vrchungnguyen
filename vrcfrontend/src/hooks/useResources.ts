import { useState, useCallback, useEffect } from 'react';
import { resourceAPI, Resource } from '../components/data/services/resourcesService';

export function useResources() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchResources = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await resourceAPI.getAll();
            if (result.success && result.data) {
                setResources(result.data);
            } else {
                setError(result.error?.message || 'Failed to fetch resources');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const createResource = async (resource: Omit<Resource, 'id' | 'created_at'>) => {
        setLoading(true);
        try {
            const result = await resourceAPI.create(resource);
            if (result.success && result.data) {
                await fetchResources();
                return { success: true, data: result.data };
            } else {
                return { success: false, error: result.error };
            }
        } catch (err: any) {
            return { success: false, error: { message: err.message } };
        } finally {
            setLoading(false);
        }
    };

    const updateResource = async (id: string, resource: Partial<Resource>) => {
        setLoading(true);
        try {
            const result = await resourceAPI.update(id, resource);
            if (result.success && result.data) {
                await fetchResources();
                return { success: true, data: result.data };
            } else {
                return { success: false, error: result.error };
            }
        } catch (err: any) {
            return { success: false, error: { message: err.message } };
        } finally {
            setLoading(false);
        }
    };

    const deleteResource = async (id: string) => {
        setLoading(true);
        try {
            const result = await resourceAPI.delete(id);
            if (result.success) {
                await fetchResources();
                return { success: true };
            } else {
                return { success: false, error: result.error };
            }
        } catch (err: any) {
            return { success: false, error: { message: err.message } };
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    return {
        resources,
        loading,
        error,
        fetchResources,
        createResource,
        updateResource,
        deleteResource
    };
}
