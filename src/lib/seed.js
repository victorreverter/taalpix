import { supabase } from './supabase';

const seedWords = [
  // Original 5
  { dutch: 'ik', spanish: 'yo', frequency_rank: 1, level: 'A1', category: 'pronoun' },
  { dutch: 'jij', spanish: 'tú', frequency_rank: 2, level: 'A1', category: 'pronoun' },
  { dutch: 'zijn', spanish: 'ser/estar', frequency_rank: 3, level: 'A1', category: 'verb' },
  { dutch: 'hebben', spanish: 'tener', frequency_rank: 4, level: 'A1', category: 'verb' },
  { dutch: 'niet', spanish: 'no', frequency_rank: 5, level: 'A1', category: 'adverb' },
  
  // 30 More common words
  { dutch: 'wij', spanish: 'nosotros', frequency_rank: 6, level: 'A1', category: 'pronoun' },
  { dutch: 'jullie', spanish: 'vosotros', frequency_rank: 7, level: 'A1', category: 'pronoun' },
  { dutch: 'zij', spanish: 'ellos/ellas', frequency_rank: 8, level: 'A1', category: 'pronoun' },
  { dutch: 'eten', spanish: 'comer', frequency_rank: 9, level: 'A1', category: 'verb' },
  { dutch: 'drinken', spanish: 'beber', frequency_rank: 10, level: 'A1', category: 'verb' },
  { dutch: 'water', spanish: 'agua', frequency_rank: 11, level: 'A1', category: 'noun' },
  { dutch: 'brood', spanish: 'pan', frequency_rank: 12, level: 'A1', category: 'noun' },
  { dutch: 'appel', spanish: 'manzana', frequency_rank: 13, level: 'A1', category: 'noun' },
  { dutch: 'boek', spanish: 'libro', frequency_rank: 14, level: 'A1', category: 'noun' },
  { dutch: 'lezen', spanish: 'leer', frequency_rank: 15, level: 'A1', category: 'verb' },
  { dutch: 'spreken', spanish: 'hablar', frequency_rank: 16, level: 'A1', category: 'verb' },
  { dutch: 'gaan', spanish: 'ir', frequency_rank: 17, level: 'A1', category: 'verb' },
  { dutch: 'komen', spanish: 'venir', frequency_rank: 18, level: 'A1', category: 'verb' },
  { dutch: 'zien', spanish: 'ver', frequency_rank: 19, level: 'A1', category: 'verb' },
  { dutch: 'dag', spanish: 'día', frequency_rank: 20, level: 'A1', category: 'noun' },
  { dutch: 'nacht', spanish: 'noche', frequency_rank: 21, level: 'A1', category: 'noun' },
  { dutch: 'goed', spanish: 'bueno', frequency_rank: 22, level: 'A1', category: 'adjective' },
  { dutch: 'klein', spanish: 'pequeño', frequency_rank: 23, level: 'A1', category: 'adjective' },
  { dutch: 'groot', spanish: 'grande', frequency_rank: 24, level: 'A1', category: 'adjective' },
  { dutch: 'man', spanish: 'hombre', frequency_rank: 25, level: 'A1', category: 'noun' },
  { dutch: 'vrouw', spanish: 'mujer', frequency_rank: 26, level: 'A1', category: 'noun' },
  { dutch: 'jongen', spanish: 'niño', frequency_rank: 27, level: 'A1', category: 'noun' },
  { dutch: 'meisje', spanish: 'niña', frequency_rank: 28, level: 'A1', category: 'noun' },
  { dutch: 'hond', spanish: 'perro', frequency_rank: 29, level: 'A1', category: 'noun' },
  { dutch: 'kat', spanish: 'gato', frequency_rank: 30, level: 'A1', category: 'noun' },
  { dutch: 'huis', spanish: 'casa', frequency_rank: 31, level: 'A1', category: 'noun' },
  { dutch: 'auto', spanish: 'coche', frequency_rank: 32, level: 'A1', category: 'noun' },
  { dutch: 'fiets', spanish: 'bicicleta', frequency_rank: 33, level: 'A1', category: 'noun' },
  { dutch: 'werk', spanish: 'trabajo', frequency_rank: 34, level: 'A1', category: 'noun' },
  { dutch: 'vandaag', spanish: 'hoy', frequency_rank: 35, level: 'A1', category: 'adverb' }
];

export const seedDatabase = async () => {
  console.log("Checking database for missing seed words...");
  
  // Fetch all existing words
  const { data: existingWords, error: checkError } = await supabase
    .from('words')
    .select('dutch');

  if (checkError) {
    console.error("Error checking existing words:", checkError);
    return { success: false, error: checkError };
  }

  // Create a map/set of existing dutch words to avoid duplicates
  const existingSet = new Set((existingWords || []).map(w => w.dutch.toLowerCase()));
  
  // Filter for words we don't already have
  const wordsToInsert = seedWords.filter(word => !existingSet.has(word.dutch.toLowerCase()));

  if (wordsToInsert.length === 0) {
    const message = "All seed words are already in the database. Nothing new to add!";
    console.log(message);
    return { success: true, message: message };
  }

  console.log(`Inserting ${wordsToInsert.length} new basic Dutch words...`);

  // Insert only the missing words
  const { data, error } = await supabase
    .from('words')
    .insert(wordsToInsert)
    .select();

  if (error) {
    console.error("Error inserting seed words:", error);
    return { success: false, error: error };
  }

  const successMessage = `Successfully added ${data?.length} new words! Checkout your Study Session.`;
  console.log(successMessage, data);
  return { success: true, message: successMessage, data };
};
