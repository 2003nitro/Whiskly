export interface Category {
    slug: string;
    label: string;
    emoji: string;
}

export const CATEGORIES: Category[] = [
    { slug: 'breakfast', label: 'Breakfast', emoji: '🍳' },
    { slug: 'lunch', label: 'Lunch', emoji: '🥪' },
    { slug: 'dinner', label: 'Dinner', emoji: '🍲' },
    { slug: 'dessert', label: 'Dessert', emoji: '🍰' },
    { slug: 'snack', label: 'Snack', emoji: '🍿' },
    { slug: 'drink', label: 'Drink', emoji: '🍺' },
    { slug: 'all', label: 'All', emoji: '📖' }
];