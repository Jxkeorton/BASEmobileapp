import { useQuery } from '@tanstack/react-query';

export const locationKeys = {
    all: ['locations'],
    lists: () => [...locationKeys.all, 'list'],
    list: (filters) => [...locationKeys.lists(), { filters }],
    saved: (userId) => [...locationKeys.all, 'saved', userId],
};

const fetchLocations = async () => {
    const response = await fetch('https://raw.githubusercontent.com/Jxkeorton/APIs/main/worldlocations.json');
    if (!response.ok) {
        throw new Error('Failed to fetch locations');
    }
    const data = await response.json();
    return data.locations;
};

export const useLocationsQuery = () => {
    return useQuery({
        queryKey: locationKeys.lists(),
        queryFn: fetchLocations,
        staleTime: 10 * 60 * 1000, // 10 minutes - location data doesn't change often
        gcTime: 30 * 60 * 1000, // 30 minutes
    });
};

export const useSavedLocationsQuery = (userId, userLocationIds) => {
    const { data: allLocations } = useLocationsQuery();
    
    return useQuery({
        queryKey: locationKeys.saved(userId),
        queryFn: () => {
            if (!allLocations || !userLocationIds?.length) return [];
            return allLocations.filter(location => 
                userLocationIds.includes(location.id)
            );
        },
        enabled: !!allLocations && !!userLocationIds,
        select: (data) => data || [],
    });
};
