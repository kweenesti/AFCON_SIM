export function Logo() {
  return (
    <div className="flex items-center gap-2 font-headline text-lg font-bold text-sidebar-foreground">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 text-primary"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 22a10 10 0 0 0 8.66-5" />
        <path d="M12 2a10 10 0 0 1 8.66 5" />
        <path d="M12 12l5.19 9" />
        <path d="M12 12l5.19-9" />
        <path d="M12 12l-10.38 0" />
        <path d="M12 12l-5.19 9" />
        <path d="M12 12l-5.19-9" />
      </svg>
      <span>
        African Nations<span className="text-primary">.</span>
      </span>
    </div>
  );
}
