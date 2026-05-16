import useSWR from 'swr';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../utils/apiAuth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useUserStats() {
    const { user } = useAuth();
    const uid = user?.uid;

    const fetcher = async ([url, u]) => {
        if (!u) return null;
        const res = await fetchWithAuth(user, `${API_BASE_URL}${url}?uid=${u}`);
        if (!res.ok) {
            throw new Error(`An error occurred while fetching ${url}`);
        }
        return res.json();
    };

    const { data, error, mutate, isValidating } = useSWR(
        uid ? ['/api/stats', uid] : null,
        fetcher,
        {
            revalidateOnFocus: true,
            dedupingInterval: 60000, // 1 minute deduplication
        }
    );

    return {
        stats: data,
        isLoading: !error && !data,
        isError: error,
        mutate,
        isValidating
    };
}
