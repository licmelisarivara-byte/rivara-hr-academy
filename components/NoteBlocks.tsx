import Link from "next/link";
import type { NoteBlock } from "@/lib/notes";

function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-bone">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function NoteBlocks({ blocks }: { blocks: NoteBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={i} className="font-display text-2xl text-bone mt-10 mb-2">
                {block.text}
              </h2>
            );
          case "p":
            return (
              <p key={i} className="text-bone/70 leading-relaxed">
                {renderInlineBold(block.text)}
              </p>
            );
          case "ol":
            return (
              <ol key={i} className="list-decimal list-inside space-y-2 text-bone/70">
                {block.items.map((item, j) => (
                  <li key={j}>{renderInlineBold(item)}</li>
                ))}
              </ol>
            );
          case "hr":
            return <div key={i} className="hairline my-8" />;
          case "source":
            return (
              <p key={i} className="detail-text !text-magenta">
                Fuente: {block.text}
              </p>
            );
          case "links":
            return (
              <p key={i} className="text-sm">
                🔗{" "}
                {block.items.map((l, j) => (
                  <span key={j}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-magenta hover:underline"
                    >
                      {l.text}
                    </a>
                    {j < block.items.length - 1 ? " · " : ""}
                  </span>
                ))}
              </p>
            );
          case "cta":
            return (
              <p key={i} className="card-alt rounded-xl p-6 text-bone/70 leading-relaxed">
                {block.before}
                <Link
                  href={block.linkHref}
                  className="font-semibold text-magenta hover:underline"
                >
                  {block.linkText}
                </Link>
                {block.after}
              </p>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
