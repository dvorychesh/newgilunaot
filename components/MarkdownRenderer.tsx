import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Components } from 'react-markdown';
import { InterventionBank, InterventionTool } from '../types';

interface MarkdownRendererProps {
  markdown: string;
  interventionBank: InterventionBank | null; // New prop for intervention bank
}

interface FlattenedToolMap {
  [toolName: string]: string; // toolName -> description
}

const flattenInterventionBank = (bank: InterventionBank | null): FlattenedToolMap => {
  if (!bank) return {};
  const flattened: FlattenedToolMap = {};
  Object.values(bank).forEach(category => {
    category.tools.forEach(tool => {
      // Clean up tool name for matching (e.g., remove descriptions in parentheses)
      const cleanToolName = tool.name.split('(')[0].trim();
      flattened[cleanToolName] = tool.description;
    });
  });
  // Add common research models that might appear but are not in the bank
  flattened['WOOP'] = 'מודל WOOP: מודל לתכנון יעדים הכולל משאלות, תוצאות, מכשולים ותוכנית (Wish, Outcome, Obstacle, Plan).';
  flattened['SEL'] = 'למידה רגשית-חברתית (Social-Emotional Learning): תהליך פיתוח מיומנויות לניהול רגשות, הצבת יעדים, אמפתיה וקבלת החלטות אחראיות.';
  flattened['NVR'] = 'התנגדות לא אלימה (Non-Violent Resistance): גישה הורית וחינוכית לטיפול בהתנהגויות מתנגדות ואלימות, תוך התמקדות בהתעצמות המבוגר.';
  flattened['הסמכות החדשה'] = 'גישת הסמכות החדשה: מודל המשלב סמכות הורית עם תמיכה ביחסים וחיבור עם הילד.';
  return flattened;
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown, interventionBank }) => {
  const toolMap = useMemo(() => flattenInterventionBank(interventionBank), [interventionBank]);

  const components: Components = {
    h1: ({ node, ...props }) => <h1 className="markdown-h1" {...props} />,
    h3: ({ node, children, ...props }) => {
      const textContent = Array.isArray(children) ? children.map(child => typeof child === 'string' ? child : '').join('') : String(children);
      let className = 'markdown-h3'; // Default, will be overridden
      if (textContent.includes('💎 משפט פתיחה')) {
        className = 'markdown-h3-summary';
      } else if (textContent.includes('💪 מנועי כוח')) { // New: Strengths section
        className = 'markdown-h3-strengths';
      } else if (textContent.includes('🚧 חסמים מרכזיים')) { // New: Challenges section
        className = 'markdown-h3-challenges';
      } else if (textContent.includes('📊 תוכנית למימוש הפוטנציאל')) {
        className = 'markdown-h3-analysis';
      } else if (textContent.includes('🛠️ המלצות אופרטיביות לצוות')) {
        className = 'markdown-h3-action-plan';
      }
      // New H3 styles for Class Profile
      else if (textContent.includes('🌟 סקירה כללית')) {
        className = 'markdown-h3-class-overview';
      } else if (textContent.includes('💪 חוזקות דומיננטיות בכיתה')) {
        className = 'markdown-h3-class-strengths';
      } else if (textContent.includes('🚧 חסמים מרכזיים בכיתה')) {
        className = 'markdown-h3-class-challenges';
      } else if (textContent.includes('📊 מגמות כלל כיתתיות ותובנות')) {
        className = 'markdown-h3-class-trends';
      } else if (textContent.includes('💡 המלצות אסטרטגיות מערכתיות לצוות ולכיתה')) {
        className = 'markdown-h3-class-recommendations';
      }
      else { // Default styling for other H3s not covered by specific categories
        className = 'markdown-h3-other';
      }
      return <h3 className={className} {...props}>{children}</h3>;
    },
    p: ({ node, ...props }) => <p className="markdown-paragraph" {...props} />,
    ul: ({ node, ...props }) => <ul className="markdown-list" {...props} />,
    ol: ({ node, ...props }) => <ol className="markdown-list-numbered" {...props} />,
    li: ({ node, ...props }) => <li className="markdown-list-item" {...props} />,
    strong: ({ node, children, ...props }) => {
      const toolName = String(children).trim();
      const toolDescription = toolMap[toolName];
      if (toolDescription) {
        return (
          <span {...props} className="relative group inline-flex items-center text-purple-700 font-bold">
            {children}
            <span
              className="ml-1 text-blue-500 cursor-help text-base align-middle"
              title={toolDescription}
              aria-label={`תיאור הכלי: ${toolDescription}`}
            >
              &#9432; {/* Info circle icon */}
            </span>
          </span>
        );
      }
      return <strong className="markdown-strong" {...props}>{children}</strong>;
    },
    hr: ({ node, ...props }) => <hr className="border-gray-300 my-6" {...props} />,
  };

  return (
    <div className="prose max-w-none text-right">
      <ReactMarkdown components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;