import React from 'react';

/**
 * Formats poem content, converting *text* to italics
 */
export function formatPoemContent(content: string): React.ReactNode {
  const lines = content.split('\n');
  
  return lines.map((line, lineIndex) => {
    // Process each line for italic markers
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let partIndex = 0;
    
    while (remaining.length > 0) {
      const startMatch = remaining.indexOf('*');
      
      if (startMatch === -1) {
        // No more asterisks, add remaining text
        if (remaining) {
          parts.push(<span key={partIndex++}>{remaining}</span>);
        }
        break;
      }
      
      // Add text before the asterisk
      if (startMatch > 0) {
        parts.push(<span key={partIndex++}>{remaining.slice(0, startMatch)}</span>);
      }
      
      // Look for closing asterisk
      const afterFirst = remaining.slice(startMatch + 1);
      const endMatch = afterFirst.indexOf('*');
      
      if (endMatch === -1) {
        // No closing asterisk, treat as regular text
        parts.push(<span key={partIndex++}>{remaining.slice(startMatch)}</span>);
        break;
      }
      
      // Extract italic text
      const italicText = afterFirst.slice(0, endMatch);
      parts.push(<em key={partIndex++} className="italic">{italicText}</em>);
      
      // Continue with remaining text
      remaining = afterFirst.slice(endMatch + 1);
    }
    
    return (
      <React.Fragment key={lineIndex}>
        {parts.length > 0 ? parts : line}
        {lineIndex < lines.length - 1 && '\n'}
      </React.Fragment>
    );
  });
}
