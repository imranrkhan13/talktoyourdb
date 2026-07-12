interface Props {
  onSelect: (q: string) => void;
}

const EXAMPLES = [
  'Who are our VIP customers?',
  'What products should we restock first?',
  'Which product category makes the most money?',
  'Which customers are becoming inactive?',
  'Show our biggest revenue opportunities',
  'Which products are selling the fastest?',
  'Where are most of our customers located?',
  'What were our best sales days this month?',
  'Which products are overstocked?',
  'Show our top performing customers'
];

export default function ExamplePrompts({ onSelect }: Props) {
  return (
    <div className="examples-section">
      <p className="examples-label">Try an example</p>
      <div className="examples-grid">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            className="example-chip"
            onClick={() => onSelect(ex)}
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
