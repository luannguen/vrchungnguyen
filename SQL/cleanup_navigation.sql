-- Delete duplicate navigation items, keeping the one with the lowest ID
DELETE FROM public.navigation
WHERE id IN (
    SELECT id FROM (
        SELECT id,
            ROW_NUMBER() OVER (partition BY label, path, position ORDER BY id) AS rnum
        FROM public.navigation
    ) t
    WHERE t.rnum > 1
);
