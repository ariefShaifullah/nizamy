
import React from 'react';

export interface FAQData {
    question: string;
    answer: string;
}

interface FAQProps {
    title: string;
    subtitle: string;
    data: FAQData[];
}

const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
    return (
        <details className="group p-4 rounded-lg bg-white dark:bg-slate-800 shadow-sm transition-all duration-300 open:ring-2 open:ring-primary-500 open:shadow-lg border border-slate-100 dark:border-slate-700">
            <summary className="font-semibold text-lg cursor-pointer text-slate-800 dark:text-slate-100 list-none flex justify-between items-center">
                {q}
                <div className="ml-2 flex-shrink-0 text-slate-500 dark:text-slate-500">
                    <svg className="w-5 h-5 transform transition-transform duration-300 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
            </summary>
            <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {a}
            </p>
        </details>
    );
};

export const FAQ: React.FC<FAQProps> = React.memo(({ title, subtitle, data }) => {
    return (
        <section className="mt-16 mb-8" aria-labelledby="faq-title">
            <div className="text-center mb-8">
                <h2 id="faq-title" className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {title}
                </h2>
                <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400">
                    {subtitle}
                </p>
            </div>
            <div className="max-w-4xl mx-auto space-y-4">
                {data.map((item, index) => (
                    <FAQItem key={index} q={item.question} a={item.answer} />
                ))}
            </div>
        </section>
    );
});
