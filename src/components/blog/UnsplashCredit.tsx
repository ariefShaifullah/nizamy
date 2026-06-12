interface UnsplashCreditProps {
  photographer: string;
  photographerUrl: string;
  compact?: boolean;
}

export default function UnsplashCredit({ photographer, photographerUrl, compact = false }: UnsplashCreditProps) {
  if (compact) {
    return (
      <span className="text-[9px] text-white/50 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
        📷{' '}
        <a
          href={`${photographerUrl}?utm_source=nizamy&utm_medium=referral`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white/80 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {photographer}
        </a>
        {' / '}
        <a
          href="https://unsplash.com?utm_source=nizamy&utm_medium=referral"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white/80 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Unsplash
        </a>
      </span>
    );
  }

  return (
    <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 italic break-words">
      Foto oleh{' '}
      <a
        href={`${photographerUrl}?utm_source=nizamy&utm_medium=referral`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-500/70 hover:text-indigo-500 dark:text-indigo-400/60 dark:hover:text-indigo-400 transition-colors underline underline-offset-2"
      >
        {photographer}
      </a>
      {' di '}
      <a
        href="https://unsplash.com?utm_source=nizamy&utm_medium=referral"
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-500/70 hover:text-indigo-500 dark:text-indigo-400/60 dark:hover:text-indigo-400 transition-colors underline underline-offset-2"
      >
        Unsplash
      </a>
    </p>
  );
}
