import { useState, useCallback, useEffect } from 'react';
import { resourceService, Resource } from '../services/resourcesService';

export function useResources() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchResources = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await resourceService.getAll();
            setResources(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const createResource = async (resource: Omit<Resource, 'id' | 'created_at'>) => {
        setLoading(true);
        try {
            const data = await resourceService.create(resource);
            await fetchResources();
            return { success: true, data };
        } catch (err: any) {
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    const updateResource = async (id: string, resource: Partial<Resource>) => {
        setLoading(true);
        try {
            const data = await resourceService.update(id, resource);
            await fetchResources();
            return { success: true, data };
        } catch (err: any) {
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    const deleteResource = async (id: string) => {
        setLoading(true);
        try {
            await resourceService.delete(id);
            await fetchResources();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err };
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
