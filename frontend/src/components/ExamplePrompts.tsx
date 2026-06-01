interface Props {
  onSelect: (q: string) => void;
}

const EXAMPLES = [
  'Show top 5 users by total order value last month',
  'Which products are low on stock (less than 30 units)?',
  'Count orders by status for the past 7 days',
  'List users who placed more than 3 orders',
  'What is the average order value per country?',
  'Show daily revenue for the past 30 days',
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
