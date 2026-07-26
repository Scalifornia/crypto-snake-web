import type { ReactNode } from 'react';

interface ServiceIconProps {
  name: string;
}

const paths: Record<string, ReactNode> = {
  clean: (
    <>
      <path d="M7 21h10l-1-7H8l-1 7Z" />
      <path d="M9 14V5a3 3 0 1 1 6 0v9" />
      <path d="M6 21h12" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="12" r="4" />
      <path d="M12 12h9" />
      <path d="M18 12v3" />
      <path d="M15 12v2" />
    </>
  ),
  site: (
    <>
      <path d="M4 20h16" />
      <path d="M6 20V9l6-4 6 4v11" />
      <path d="M9 20v-6h6v6" />
    </>
  ),
  tools: (
    <>
      <path d="m14 7 3-3 3 3-3 3" />
      <path d="M5 19 16 8" />
      <path d="m7 5 12 12" />
      <path d="m4 8 4-4" />
    </>
  ),
  water: (
    <>
      <path d="M12 3s6 6 6 11a6 6 0 0 1-12 0c0-5 6-11 6-11Z" />
      <path d="M10 17c2 1 4 0 5-2" />
    </>
  ),
  power: (
    <>
      <path d="M13 2 4 14h7l-1 8 10-13h-7l1-7Z" />
    </>
  ),
  paint: (
    <>
      <path d="M4 6h12v6H4z" />
      <path d="M16 9h2a2 2 0 0 1 0 4h-6v3" />
      <path d="M12 16v5" />
    </>
  ),
  leaf: (
    <>
      <path d="M20 4C11 4 5 9 5 17c0 2 1 3 3 3 8 0 12-8 12-16Z" />
      <path d="M5 20c3-6 7-9 13-12" />
    </>
  ),
  move: (
    <>
      <path d="M3 7h11v10H3z" />
      <path d="M14 10h4l3 3v4h-7z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3 2 21h20L12 3Z" />
      <path d="M12 9v5" />
      <path d="M12 17h.01" />
    </>
  ),
  auto: (
    <>
      <path d="M5 16h14l-1.4-5.2A3 3 0 0 0 14.7 8H9.3a3 3 0 0 0-2.9 2.8L5 16Z" />
      <path d="M4 16v3" />
      <path d="M20 16v3" />
      <circle cx="8" cy="17" r="2" />
      <circle cx="16" cy="17" r="2" />
      <path d="M8 8 7 5" />
      <path d="M16 8l1-3" />
    </>
  ),
  care: (
    <>
      <path d="M12 21s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.4-7 10-7 10Z" />
      <path d="M12 8v7" />
      <path d="M8.5 11.5h7" />
    </>
  ),
  digital: (
    <>
      <rect x="4" y="5" width="16" height="11" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 16v5" />
      <path d="M8 9h8" />
      <path d="M8 12h5" />
    </>
  ),
  events: (
    <>
      <path d="M7 3v4" />
      <path d="M17 3v4" />
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16" />
      <path d="M9 14h.01" />
      <path d="M12 14h.01" />
      <path d="M15 14h.01" />
    </>
  ),
  business: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
      <path d="M12 12v3" />
    </>
  ),
  education: (
    <>
      <path d="M4 6.5 12 3l8 3.5-8 3.5-8-3.5Z" />
      <path d="M7 9v5c1.5 1.2 3.2 1.8 5 1.8s3.5-.6 5-1.8V9" />
      <path d="M20 7v6" />
    </>
  ),
  fitness: (
    <>
      <path d="M6 6v12" />
      <path d="M18 6v12" />
      <path d="M3 9v6" />
      <path d="M21 9v6" />
      <path d="M6 12h12" />
    </>
  ),
  beauty: (
    <>
      <path d="M9 3h6l1 7H8l1-7Z" />
      <path d="M8 10v9a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-9" />
      <path d="M10 14h4" />
    </>
  ),
  pets: (
    <>
      <circle cx="7" cy="8" r="2" />
      <circle cx="12" cy="6" r="2" />
      <circle cx="17" cy="8" r="2" />
      <circle cx="8.5" cy="14" r="2" />
      <circle cx="15.5" cy="14" r="2" />
      <path d="M8 19c1-3 2.4-4.5 4-4.5S15 16 16 19c.5 1.5-.5 2-2 1.2a4 4 0 0 0-4 0C8.5 21 7.5 20.5 8 19Z" />
    </>
  ),
  childcare: (
    <>
      <circle cx="12" cy="7" r="3" />
      <path d="M6 21v-3a6 6 0 0 1 12 0v3" />
      <path d="M8 13 5 10" />
      <path d="m16 13 3-3" />
    </>
  ),
  construction: (
    <>
      <path d="M4 20h16" />
      <path d="M6 20V9l6-5 6 5v11" />
      <path d="M9 20v-7h6v7" />
      <path d="M3 10h18" />
    </>
  ),
  electronics: (
    <>
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <path d="M9 8h6" />
      <path d="M9 12h6" />
      <path d="M12 17h.01" />
    </>
  ),
  creative: (
    <>
      <rect x="4" y="7" width="16" height="12" rx="2" />
      <path d="M8 7 9.5 4h5L16 7" />
      <circle cx="12" cy="13" r="3" />
    </>
  ),
  food: (
    <>
      <path d="M7 3v18" />
      <path d="M4 3v5a3 3 0 0 0 6 0V3" />
      <path d="M15 3v18" />
      <path d="M15 3c3 1 5 4 5 8h-5" />
    </>
  ),
  security: (
    <>
      <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" />
      <path d="M9.5 12.5 11 14l3.5-4" />
    </>
  ),
  textile: (
    <>
      <path d="M8 4h8l4 5-3 3-1.5-1.5V20h-7V10.5L7 12 4 9l4-5Z" />
      <path d="M9 4c.5 1.3 1.5 2 3 2s2.5-.7 3-2" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V6l10-2v12" />
      <circle cx="7" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
      <path d="M9 9 19 7" />
    </>
  )
};

export function ServiceIcon({ name }: ServiceIconProps) {
  return (
    <span className="icon-frame" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        {paths[name] ?? paths.tools}
      </svg>
    </span>
  );
}
