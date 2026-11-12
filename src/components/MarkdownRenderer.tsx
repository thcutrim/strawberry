import React from 'react';

interface MarkdownProps {
  content: string;
}

/**
 * Formatador de texto inline para negrito, código e ênfase
 */
function renderInlineFormatting(text: string): React.ReactNode[] {
  // Regex para capturar **negrito**, `código` e *itálico*
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          className="bg-blue-950/60 text-blue-300 border border-blue-800/40 px-1.5 py-0.5 rounded font-mono text-xs"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="text-gray-300 italic">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export const MarkdownRenderer: React.FC<MarkdownProps> = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Tabela Markdown (linhas começando e terminando com |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const headerRow = tableLines[0]
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim());
        const bodyRows = tableLines.slice(2).map((row) =>
          row
            .slice(1, -1)
            .split('|')
            .map((c) => c.trim())
        );

        elements.push(
          <div key={`table-${i}`} className="my-3 overflow-x-auto rounded-lg border border-[#272e42] shadow-sm">
            <table className="min-w-full divide-y divide-[#272e42] text-xs">
              <thead className="bg-[#171b28]">
                <tr>
                  {headerRow.map((h, colIdx) => (
                    <th
                      key={colIdx}
                      className="px-3 py-2 text-left font-semibold text-blue-300 font-mono tracking-wider"
                    >
                      {renderInlineFormatting(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202636] bg-[#111420]">
                {bodyRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-[#1a1f30] transition-colors">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-3 py-2 text-gray-200">
                        {renderInlineFormatting(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 2. Linha divisória
    if (trimmed === '---' || trimmed === '***') {
      elements.push(<hr key={`hr-${i}`} className="my-4 border-[#242b3d]" />);
      i++;
      continue;
    }

    // 3. Títulos (Headers)
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={`h3-${i}`} className="text-sm font-bold text-blue-300 mt-3 mb-1.5 flex items-center gap-1.5">
          {renderInlineFormatting(trimmed.slice(4))}
        </h4>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={`h2-${i}`} className="text-base font-bold text-white mt-4 mb-2 pb-1 border-b border-[#23293a]">
          {renderInlineFormatting(trimmed.slice(3))}
        </h3>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h2 key={`h1-${i}`} className="text-lg font-extrabold text-white mt-4 mb-2 pb-1 border-b border-blue-900/60">
          {renderInlineFormatting(trimmed.slice(2))}
        </h2>
      );
      i++;
      continue;
    }

    // 4. Blockquotes
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="border-l-2 border-amber-500/80 bg-amber-950/20 px-3 py-2 my-2 text-xs text-amber-200 rounded-r-lg"
        >
          {renderInlineFormatting(trimmed.slice(2))}
        </blockquote>
      );
      i++;
      continue;
    }

    // 5. Listas não ordenadas (- ou *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <li key={`li-${i}`} className="ml-4 list-disc text-gray-200 my-1 text-sm leading-relaxed">
          {renderInlineFormatting(trimmed.slice(2))}
        </li>
      );
      i++;
      continue;
    }

    // 6. Linha vazia
    if (!trimmed) {
      elements.push(<div key={`empty-${i}`} className="h-2" />);
      i++;
      continue;
    }

    // 7. Parágrafo padrão
    elements.push(
      <p key={`p-${i}`} className="my-1.5 leading-relaxed text-gray-200 text-sm">
        {renderInlineFormatting(trimmed)}
      </p>
    );
    i++;
  }

  return <div className="markdown-body space-y-1">{elements}</div>;
};

