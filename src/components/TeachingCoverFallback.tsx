type TeachingCoverFallbackProps = {
  title: string;
  className?: string;
};

const TeachingCoverFallback = ({ title, className = "" }: TeachingCoverFallbackProps) => (
  <div className={`bg-[#F8F8F8] text-slate-950 border border-border/70 ${className}`}>
    <div className="flex flex-col sm:flex-row sm:items-center gap-5 h-full px-5 py-6 sm:px-8 sm:py-8">
      <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl bg-white border border-gold/20 shadow-sm p-3 shrink-0">
        <img
          src="/android-chrome-512x512.png"
          alt="Logo Le Règne Millénaire"
          className="h-full w-full object-contain"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-[0.36em] text-slate-500">ENSEIGNEMENT DU RM</p>
        <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-tight text-slate-950 mt-2">
          {title}
        </h2>
      </div>
    </div>
  </div>
);

export default TeachingCoverFallback;
