import React from 'react';
import PixelCard from '../common/PixelCard';

const GrammarNotes = ({ scene }) => {
  // Grammar notes for each scene
  const grammarNotes = {
    'het-kantoor': {
      title: 'Dutch Pronouns & Basic Sentences',
      points: [
        {
          rule: 'Personal Pronouns',
          explanation: 'Dutch uses ik (I), jij (you), wij (we). Notice that "jij" is informal singular "you".',
          examples: [
            { dutch: 'Ik werk.', spanish: 'Yo trabajo.' },
            { dutch: 'Jij bent collega.', spanish: 'Tú eres colega.' }
          ]
        },
        {
          rule: 'Word Order',
          explanation: 'In simple sentences, Dutch follows Subject-Verb-Object order, like Spanish.',
          examples: [
            { dutch: 'Wij hebben een computer.', spanish: 'Nosotros tenemos una computadora.' }
          ]
        },
        {
          rule: 'Articles (de/het)',
          explanation: 'Dutch has two articles: "de" (common) and "het" (neuter). Each noun has a fixed gender.',
          examples: [
            { dutch: 'de collega', spanish: 'el/la colega' },
            { dutch: 'het bureau', spanish: 'la oficina' }
          ]
        }
      ]
    },
    'de-jumbo': {
      title: 'Shopping & Questions',
      points: [
        {
          rule: 'Compound Words',
          explanation: 'Dutch loves compound words! winkel (shop) + wagen (cart) = winkelwagen (shopping cart).',
          examples: [
            { dutch: 'de winkelwagen', spanish: 'el carrito de compras' }
          ]
        },
        {
          rule: 'Verb Conjugation',
          explanation: 'Regular verbs: betalen (to pay) → ik betaal, jij betaalt.',
          examples: [
            { dutch: 'Ik betaal.', spanish: 'Yo pago.' },
            { dutch: 'Jij betaalt.', spanish: 'Tú pagas.' }
          ]
        }
      ]
    },
    'het-park': {
      title: 'Outdoor Activities & Adjectives',
      points: [
        {
          rule: 'Adjective Endings',
          explanation: 'Adjectives after "een" usually get -e ending in plural or with de-words.',
          examples: [
            { dutch: 'een mooie picknick', spanish: 'un picnic bonito' }
          ]
        },
        {
          rule: 'Prepositions',
          explanation: '"in het park" (in the park), "op het bankje" (on the bench). Prepositions are fixed!',
          examples: [
            { dutch: 'in het park', spanish: 'en el parque' },
            { dutch: 'op het bankje', spanish: 'en el banco' }
          ]
        }
      ]
    }
  };

  const notes = grammarNotes[scene?.slug] || {
    title: 'Grammar Notes',
    points: []
  };

  if (!notes.points || notes.points.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-pixel text-lg text-tp-primary">
        📚 {notes.title}
      </h3>
      
      {notes.points.map((point, index) => (
        <PixelCard key={index} variant="default" className="p-4">
          <h4 className="font-pixel text-sm text-tp-text mb-2">
            {point.rule}
          </h4>
          <p className="text-tp-text2 text-sm mb-3">
            {point.explanation}
          </p>
          
          {point.examples && point.examples.length > 0 && (
            <div className="space-y-2">
              {point.examples.map((example, exIndex) => (
                <div key={exIndex} className="flex justify-between items-center p-2 bg-tp-surface2 border-2 border-solid border-tp-border">
                  <span className="font-body text-tp-text">{example.dutch}</span>
                  <span className="text-tp-text3 text-sm">{example.spanish}</span>
                </div>
              ))}
            </div>
          )}
        </PixelCard>
      ))}
    </div>
  );
};

export default GrammarNotes;
