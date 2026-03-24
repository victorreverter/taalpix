import { supabase } from './supabase';

const seedWords = [
  { dutch: 'ik', spanish: 'yo', frequency_rank: 1, level: 'A1', category: 'pronoun' },
  { dutch: 'jij', spanish: 'tú', frequency_rank: 2, level: 'A1', category: 'pronoun' },
  { dutch: 'zijn', spanish: 'ser/estar', frequency_rank: 3, level: 'A1', category: 'verb' },
  { dutch: 'hebben', spanish: 'tener', frequency_rank: 4, level: 'A1', category: 'verb' },
  { dutch: 'niet', spanish: 'no', frequency_rank: 5, level: 'A1', category: 'adverb' }
];

export const seedDatabase = async () => {
  console.log("Checking if database needs seeding...");
  
  // First, check if there are already words in the database
  const { data: existingWords, error: checkError } = await supabase
    .from('words')
    .select('id')
    .limit(1);

  if (checkError) {
    console.error("Error checking existing words:", checkError);
    return { success: false, error: checkError };
  }

  // If words exist, abort seeding
  if (existingWords && existingWords.length > 0) {
    const message = "Database is already manually seeded with words. Aborting seed.";
    console.log(message);
    return { success: true, message: message };
  }

  console.log("Database is empty. Inserting basic Dutch words...");

  // If empty, insert the hardcoded seed words
  const { data, error } = await supabase
    .from('words')
    .insert(seedWords)
    .select();

  if (error) {
    console.error("Error inserting seed words:", error);
    return { success: false, error: error };
  }

  const successMessage = `Successfully inserted ${data?.length} seed words!`;
  console.log(successMessage, data);
  return { success: true, message: successMessage, data };
};
