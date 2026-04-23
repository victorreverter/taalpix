-- ============================================
-- TAALPIX MVP SEED DATA
-- Level A1: 3 Scenes, 21 Words
-- ============================================
-- This script is idempotent - safe to run multiple times
-- ============================================

-- Clear existing seed data (in correct order due to FK constraints)
DELETE FROM dialogues;
DELETE FROM sentences;
DELETE FROM exercise_words;
DELETE FROM exercises;
DELETE FROM scene_words;
DELETE FROM user_word_states;
DELETE FROM user_scene_progress;
DELETE FROM user_level_progress;
DELETE FROM user_profiles;
DELETE FROM words;
DELETE FROM scenes;

-- ============================================
-- SCENES (8 total: 3 active, 5 coming soon)
-- ============================================

INSERT INTO scenes (id, name, slug, description, level, scene_order, word_count, status) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Het Kantoor', 'het-kantoor', 'Office introductions and workplace basics', 'A1', 1, 7, 'active'),
  ('a1000000-0000-0000-0000-000000000002', 'De Jumbo', 'de-jumbo', 'Grocery shopping essentials', 'A1', 2, 7, 'active'),
  ('a1000000-0000-0000-0000-000000000003', 'Het Park', 'het-park', 'Outdoor activities and leisure', 'A1', 3, 7, 'active'),
  ('a1000000-0000-0000-0000-000000000004', 'De Huisarts', 'de-huisarts', 'Doctor visit and health', 'A1', 1, 7, 'coming_soon'),
  ('a1000000-0000-0000-0000-000000000005', 'Het Café', 'het-cafe', 'Café conversations', 'A1', 2, 7, 'coming_soon'),
  ('a1000000-0000-0000-0000-000000000006', 'De Fietswinkel', 'de-fietswinkel', 'Bike shop and cycling', 'A1', 3, 7, 'coming_soon'),
  ('a1000000-0000-0000-0000-000000000007', 'Het Station', 'het-station', 'Train station and travel', 'A1', 1, 7, 'coming_soon'),
  ('a1000000-0000-0000-0000-000000000008', 'De Gemeente', 'de-gemeente', 'Municipality and official business', 'A1', 2, 7, 'coming_soon');

-- ============================================
-- WORDS: Het Kantoor (Frequency 1-50)
-- ============================================

INSERT INTO words (id, dutch, spanish, category, frequency_rank, level, pixel_art_placeholder) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'ik', 'yo', 'pronoun', 1, 'A1', 'KANTOOR_IK'),
  ('b1000000-0000-0000-0000-000000000002', 'jij', 'tú', 'pronoun', 2, 'A1', 'KANTOOR_JIJ'),
  ('b1000000-0000-0000-0000-000000000003', 'wij', 'nosotros', 'pronoun', 6, 'A1', 'KANTOOR_WIJ'),
  ('b1000000-0000-0000-0000-000000000004', 'werk', 'trabajo', 'noun', 34, 'A1', 'KANTOOR_WERK'),
  ('b1000000-0000-0000-0000-000000000005', 'bureau', 'oficina/escritorio', 'noun', 40, 'A1', 'KANTOOR_BUREAU'),
  ('b1000000-0000-0000-0000-000000000006', 'collega', 'colega', 'noun', 45, 'A1', 'KANTOOR_COLLEGA'),
  ('b1000000-0000-0000-0000-000000000007', 'computer', 'computadora', 'noun', 48, 'A1', 'KANTOOR_COMPUTER');

-- ============================================
-- WORDS: De Jumbo (Frequency 50-150)
-- ============================================

INSERT INTO words (id, dutch, spanish, category, frequency_rank, level, pixel_art_placeholder) VALUES
  ('b1000000-0000-0000-0000-000000000008', 'boodschappen', 'compras', 'noun', 60, 'A1', 'JUMBO_BOODSCHAPPEN'),
  ('b1000000-0000-0000-0000-000000000009', 'winkel', 'tienda', 'noun', 75, 'A1', 'JUMBO_WINKEL'),
  ('b1000000-0000-0000-0000-000000000010', 'winkelwagen', 'carrito', 'noun', 90, 'A1', 'JUMBO_WINKELWAGEN'),
  ('b1000000-0000-0000-0000-000000000011', 'kassa', 'caja', 'noun', 100, 'A1', 'JUMBO_KASSA'),
  ('b1000000-0000-0000-0000-000000000012', 'betalen', 'pagar', 'verb', 110, 'A1', 'JUMBO_BETALEN'),
  ('b1000000-0000-0000-0000-000000000013', 'euro', 'euro', 'noun', 120, 'A1', 'JUMBO_EURO'),
  ('b1000000-0000-0000-0000-000000000014', 'duur', 'caro', 'adjective', 140, 'A1', 'JUMBO_DUUR');

-- ============================================
-- WORDS: Het Park (Frequency 150-300)
-- ============================================

INSERT INTO words (id, dutch, spanish, category, frequency_rank, level, pixel_art_placeholder) VALUES
  ('b1000000-0000-0000-0000-000000000015', 'wandelen', 'caminar', 'verb', 160, 'A1', 'PARK_WANDELEN'),
  ('b1000000-0000-0000-0000-000000000016', 'hond', 'perro', 'noun', 29, 'A1', 'PARK_HOND'),
  ('b1000000-0000-0000-0000-000000000017', 'bankje', 'banco', 'noun', 180, 'A1', 'PARK_BANKJE'),
  ('b1000000-0000-0000-0000-000000000018', 'zon', 'sol', 'noun', 200, 'A1', 'PARK_ZON'),
  ('b1000000-0000-0000-0000-000000000019', 'picknick', 'picnic', 'noun', 220, 'A1', 'PARK_PICKNICK'),
  ('b1000000-0000-0000-0000-000000000020', 'mooi', 'bonito', 'adjective', 250, 'A1', 'PARK_MOOI'),
  ('b1000000-0000-0000-0000-000000000021', 'rustig', 'tranquilo', 'adjective', 280, 'A1', 'PARK_RUSTIG');

-- ============================================
-- SCENE WORDS (join table)
-- ============================================

INSERT INTO scene_words (scene_id, word_id, word_order) VALUES
  -- Het Kantoor
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 1),
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 2),
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 3),
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 4),
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 5),
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000006', 6),
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000007', 7),

  -- De Jumbo
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000008', 1),
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000009', 2),
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000010', 3),
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000011', 4),
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000012', 5),
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000013', 6),
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000014', 7),

  -- Het Park
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000015', 1),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000016', 2),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000017', 3),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000018', 4),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000019', 5),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000020', 6),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000021', 7);

-- ============================================
-- SENTENCES
-- ============================================

INSERT INTO sentences (scene_id, dutch, spanish, difficulty) VALUES
  -- Het Kantoor
  ('a1000000-0000-0000-0000-000000000001', 'Ik werk op een bureau.', 'Yo trabajo en una oficina.', 1),
  ('a1000000-0000-0000-0000-000000000001', 'Jij bent mijn collega.', 'Tú eres mi colega.', 1),
  ('a1000000-0000-0000-0000-000000000001', 'Wij hebben een computer.', 'Nosotros tenemos una computadora.', 2),
  
  -- De Jumbo
  ('a1000000-0000-0000-0000-000000000002', 'Ik doe boodschappen in de winkel.', 'Yo hago compras en la tienda.', 2),
  ('a1000000-0000-0000-0000-000000000002', 'De winkelwagen is vol.', 'El carrito está lleno.', 1),
  ('a1000000-0000-0000-0000-000000000002', 'Betalen aan de kassa.', 'Pagar en la caja.', 1),
  
  -- Het Park
  ('a1000000-0000-0000-0000-000000000003', 'Wij wandelen in het park.', 'Nosotros caminamos en el parque.', 1),
  ('a1000000-0000-0000-0000-000000000003', 'De hond speelt in de zon.', 'El perro juega en el sol.', 2),
  ('a1000000-0000-0000-0000-000000000003', 'Een mooie picknick op het bankje.', 'Un picnic bonito en el banco.', 2);

-- ============================================
-- DIALOGUES
-- ============================================

-- Het Kantoor Dialogue
INSERT INTO dialogues (scene_id, dialogue_order, speaker, line_dutch, line_spanish, is_user_line, response_type, correct_response, response_options) VALUES
  ('a1000000-0000-0000-0000-000000000001', 1, 'collega', 'Hallo, jij bent nieuw hier!', '¡Hola, tú eres nuevo aquí!', false, NULL, NULL, NULL),
  ('a1000000-0000-0000-0000-000000000001', 2, 'user', 'Ja, ik werk hier sinds vandaag.', 'Sí, trabajo aquí desde hoy.', true, 'free_text', 'Ja, ik werk hier sinds vandaag.', NULL),
  ('a1000000-0000-0000-0000-000000000001', 3, 'collega', 'Wat leuk! Ik ben je collega.', '¡Qué agradable! Soy tu colega.', false, NULL, NULL, NULL),
  ('a1000000-0000-0000-0000-000000000001', 4, 'user', 'Aangenaam.', 'Encantado.', true, 'multiple_choice', 'Aangenaam.', '["Aangenaam.", "Tot ziens.", "Dank je wel."]'),
  ('a1000000-0000-0000-0000-000000000001', 5, 'collega', 'Welkom op het kantoor!', '¡Bienvenido a la oficina!', false, NULL, NULL, NULL);

-- De Jumbo Dialogue
INSERT INTO dialogues (scene_id, dialogue_order, speaker, line_dutch, line_spanish, is_user_line, response_type, correct_response, response_options) VALUES
  ('a1000000-0000-0000-0000-000000000002', 1, 'caissière', 'Hallo, alles gevonden?', '¡Hola, ¿encontraste todo?', false, NULL, NULL, NULL),
  ('a1000000-0000-0000-0000-000000000002', 2, 'user', 'Ja, dank je wel.', 'Sí, gracias.', true, 'free_text', 'Ja, dank je wel.', NULL),
  ('a1000000-0000-0000-0000-000000000002', 3, 'caissière', 'Betaal je met pin of cash?', '¿Pagas con tarjeta o efectivo?', false, NULL, NULL, NULL),
  ('a1000000-0000-0000-0000-000000000002', 4, 'user', 'Met pin.', 'Con tarjeta.', true, 'multiple_choice', 'Met pin.', '["Met pin.", "Met cash.", "Met euro."]'),
  ('a1000000-0000-0000-0000-000000000002', 5, 'caissière', 'Dank je wel. Alstublieft.', 'Gracias. Aquí tienes.', false, NULL, NULL, NULL);

-- Het Park Dialogue
INSERT INTO dialogues (scene_id, dialogue_order, speaker, line_dutch, line_spanish, is_user_line, response_type, correct_response, response_options) VALUES
  ('a1000000-0000-0000-0000-000000000003', 1, 'wandelaar', 'Mooi weer vandaag, hè?', 'Hace buen tiempo hoy, ¿eh?', false, NULL, NULL, NULL),
  ('a1000000-0000-0000-0000-000000000003', 2, 'user', 'Ja, perfect voor een wandeling.', 'Sí, perfecto para un paseo.', true, 'free_text', 'Ja, perfect voor een wandeling.', NULL),
  ('a1000000-0000-0000-0000-000000000003', 3, 'wandelaar', 'Is dat jouw hond?', '¿Es ese tu perro?', false, NULL, NULL, NULL),
  ('a1000000-0000-0000-0000-000000000003', 4, 'user', 'Ja, hij speelt graag in het park.', 'Sí, le gusta jugar en el parque.', true, 'multiple_choice', 'Ja, hij speelt graag in het park.', '["Ja, hij speelt graag in het park.", "Nee, dat is niet mijn hond.", "Hij is thuis."]'),
  ('a1000000-0000-0000-0000-000000000003', 5, 'wandelaar', 'Wat rustig hier.', 'Qué tranquilo aquí.', false, NULL, NULL, NULL);
