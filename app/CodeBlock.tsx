import React, { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript'; // Import language support (you can import other languages as needed)
import 'prismjs/themes/prism-tomorrow.css'; // Load the theme

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'javascript' }) => {
  useEffect(() => {
    Prism.highlightAll(); // Automatically highlight the code on load
  }, []);

  return (
    <div className="rounded-md">
      <pre className="overflow-auto">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
};


