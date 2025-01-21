type HighlightProps = {
  text: string;
  query: string;
  className?: string;
};

export function highlightText(text: string, query: string): string[] {
  if (!query.trim()) return [text];

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return text.split(regex);
}

export default function Highlight({ text, query, className = '' }: HighlightProps) {
  const parts = highlightText(text, query);

  return (
    <>
      {parts.map((part, i) => {
        const isMatch = part.toLowerCase() === query.toLowerCase();
        return isMatch ? (
          <mark
            key={i}
            className={`bg-yellow-200 px-0.5 rounded ${className}`}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
} 