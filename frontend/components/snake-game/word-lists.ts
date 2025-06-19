export const wordLists = {
  easy: [
    'cat', 'dog', 'pig', 'bat', 'hat',
    'rat', 'cup', 'sun', 'box', 'map'
  ],
  medium: [
    'bird', 'cake', 'door', 'fish', 'lamp',
    'moon', 'star', 'tree', 'book', 'rain'
  ],  hard: [
    'apple', 'snake', 'house', 'bread', 'plant',
    'smile', 'beach', 'clock', 'phone', 'water'
  ],
  expert: [
    'monkey', 'planet', 'garden', 'castle', 'bridge', 
    'guitar', 'flower', 'jungle', 'market', 'rocket',
  ]
};

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
