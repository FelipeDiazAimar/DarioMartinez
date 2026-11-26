import * as React from 'react';
import { cn } from '@/lib/utils';

type SvgProps = {
  className?: string;
};

/**
 * Geometric schematic for Hardware Diagnostics & Technical Workshop
 */
export function HardwareDiagnosticSvg({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 420 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-full h-auto', className)}
      aria-hidden="true"
    >
      <rect x="1" y="1" width="418" height="258" rx="14" fill="#F4F7FC" stroke="#D8E3F4" strokeWidth="1.2" />
      {/* Precision grid lines */}
      <path d="M0 65H420M0 130H420M0 195H420M105 0V260M210 0V260M315 0V260" stroke="#00308F" strokeOpacity="0.06" strokeWidth="1" />

      {/* Mainboard PCB outline */}
      <rect x="44" y="34" width="212" height="192" rx="10" fill="#FFFFFF" stroke="#00308F" strokeWidth="1.5" />
      <circle cx="58" cy="48" r="3" fill="#D8E3F4" stroke="#00308F" strokeWidth="1" />
      <circle cx="242" cy="48" r="3" fill="#D8E3F4" stroke="#00308F" strokeWidth="1" />
      <circle cx="58" cy="212" r="3" fill="#D8E3F4" stroke="#00308F" strokeWidth="1" />
      <circle cx="242" cy="212" r="3" fill="#D8E3F4" stroke="#00308F" strokeWidth="1" />

      {/* CPU Socket */}
      <rect x="86" y="72" width="76" height="76" rx="8" fill="#EEF3FC" stroke="#00308F" strokeWidth="1.5" />
      <rect x="102" y="88" width="44" height="44" rx="4" fill="#00308F" />
      <rect x="114" y="100" width="20" height="20" rx="2" fill="#FFFFFF" fillOpacity="0.92" />
      {/* CPU pins */}
      <path
        d="M98 64V72M110 64V72M124 64V72M138 64V72M150 64V72M98 148V156M110 148V156M124 148V156M138 148V156M150 148V156M78 84H86M78 98H86M78 110H86M78 124H86M78 136H86M162 84H170M162 98H170M162 110H170M162 124H170M162 136H170"
        stroke="#2D4CB0"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* RAM DIMM slots */}
      <rect x="190" y="64" width="14" height="92" rx="3" fill="#FFFFFF" stroke="#2D4CB0" strokeWidth="1.4" />
      <rect x="212" y="64" width="14" height="92" rx="3" fill="#00308F" fillOpacity="0.14" stroke="#00308F" strokeWidth="1.4" />
      <line x1="197" y1="74" x2="197" y2="146" stroke="#2D4CB0" strokeWidth="1.5" strokeDasharray="4 4" />
      <line x1="219" y1="74" x2="219" y2="146" stroke="#00308F" strokeWidth="1.5" strokeDasharray="4 4" />

      {/* NVMe SSD slot */}
      <rect x="86" y="176" width="140" height="24" rx="4" fill="#FFFFFF" stroke="#00308F" strokeWidth="1.4" />
      <rect x="96" y="182" width="34" height="12" rx="2" fill="#00308F" fillOpacity="0.16" />
      <rect x="138" y="182" width="34" height="12" rx="2" fill="#00308F" fillOpacity="0.16" />
      <circle cx="214" cy="188" r="3.5" fill="#15803D" />

      {/* Diagnostic signal traces to right panel */}
      <path
        d="M256 96H284L296 84H314"
        stroke="#00308F"
        strokeWidth="1.6"
        strokeDasharray="6 6"
        className="animate-svg-dash-flow"
      />
      <path
        d="M256 140H314"
        stroke="#2D4CB0"
        strokeWidth="1.6"
        strokeDasharray="6 6"
        className="animate-svg-dash-flow"
      />
      <path
        d="M256 188H284L296 196H314"
        stroke="#15803D"
        strokeWidth="1.6"
        strokeDasharray="6 6"
        className="animate-svg-dash-flow"
      />

      {/* Diagnostic Telemetry Panel */}
      <rect x="314" y="54" width="76" height="156" rx="8" fill="#00308F" />
      <rect x="324" y="68" width="56" height="24" rx="4" fill="#FFFFFF" fillOpacity="0.12" />
      <circle cx="334" cy="80" r="3.5" fill="#4ADE80" />
      <rect x="344" y="77" width="28" height="6" rx="3" fill="#FFFFFF" fillOpacity="0.88" />

      <rect x="324" y="106" width="56" height="36" rx="4" fill="#FFFFFF" fillOpacity="0.1" />
      <path d="M330 130L338 122L346 126L356 114L366 120L374 112" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

      <rect x="324" y="154" width="56" height="44" rx="4" fill="#FFFFFF" fillOpacity="0.12" />
      <rect x="332" y="164" width="40" height="5" rx="2.5" fill="#FFFFFF" fillOpacity="0.7" />
      <rect x="332" y="174" width="30" height="5" rx="2.5" fill="#FFFFFF" fillOpacity="0.45" />
      <rect x="332" y="184" width="36" height="5" rx="2.5" fill="#4ADE80" />
    </svg>
  );
}

/**
 * Geometric schematic for AFIP / ARCA Fiscal Controllers
 */
export function FiscalComplianceSvg({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 420 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-full h-auto', className)}
      aria-hidden="true"
    >
      <rect x="1" y="1" width="418" height="258" rx="14" fill="#F4F7FC" stroke="#D8E3F4" strokeWidth="1.2" />
      <path d="M0 65H420M0 130H420M0 195H420M105 0V260M210 0V260M315 0V260" stroke="#00308F" strokeOpacity="0.06" strokeWidth="1" />

      {/* Thermal Fiscal Receipt emerging */}
      <path
        d="M116 32H224V116H116V32Z"
        fill="#FFFFFF"
        stroke="#00308F"
        strokeWidth="1.5"
      />
      <rect x="132" y="46" width="56" height="6" rx="2" fill="#00308F" />
      <rect x="132" y="60" width="76" height="4" rx="2" fill="#CBD5E1" />
      <rect x="132" y="70" width="64" height="4" rx="2" fill="#CBD5E1" />
      <line x1="132" y1="84" x2="208" y2="84" stroke="#D8E3F4" strokeWidth="1.2" strokeDasharray="3 3" />
      <rect x="132" y="92" width="36" height="6" rx="2" fill="#2D4CB0" />
      <rect x="184" y="92" width="24" height="6" rx="2" fill="#00308F" />

      {/* Fiscal Printer Chassis */}
      <rect x="76" y="114" width="188" height="106" rx="12" fill="#00308F" />
      <rect x="94" y="128" width="152" height="12" rx="4" fill="#0E1A33" />
      <rect x="94" y="156" width="84" height="44" rx="6" fill="#FFFFFF" fillOpacity="0.12" />
      <rect x="104" y="168" width="46" height="6" rx="2" fill="#FFFFFF" fillOpacity="0.9" />
      <rect x="104" y="180" width="62" height="5" rx="2" fill="#FFFFFF" fillOpacity="0.45" />
      <circle cx="204" cy="176" r="6" fill="#4ADE80" />
      <circle cx="226" cy="176" r="6" fill="#FFFFFF" fillOpacity="0.35" />

      {/* Data Sync Trace to ARCA / AFIP Shield */}
      <path
        d="M264 168H306"
        stroke="#00308F"
        strokeWidth="1.8"
        strokeDasharray="6 6"
        className="animate-svg-dash-flow"
      />

      {/* Homologation Verification Shield */}
      <rect x="306" y="78" width="82" height="118" rx="10" fill="#FFFFFF" stroke="#00308F" strokeWidth="1.5" />
      <path
        d="M347 98L371 108V128C371 144 360.5 157.5 347 162C333.5 157.5 323 144 323 128V108L347 98Z"
        fill="#EEF3FC"
        stroke="#00308F"
        strokeWidth="1.6"
      />
      <path
        d="M337 129L344 136L358 121"
        stroke="#15803D"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="325" y="174" width="44" height="6" rx="3" fill="#00308F" />
    </svg>
  );
}

/**
 * Geometric schematic for POSBerry Multi-Node Architecture
 */
export function PosberrySystemSvg({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 420 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-full h-auto', className)}
      aria-hidden="true"
    >
      <rect x="1" y="1" width="418" height="258" rx="14" fill="#F4F7FC" stroke="#D8E3F4" strokeWidth="1.2" />
      <path d="M0 65H420M0 130H420M0 195H420M105 0V260M210 0V260M315 0V260" stroke="#00308F" strokeOpacity="0.06" strokeWidth="1" />

      {/* Central POS Terminal */}
      <rect x="148" y="64" width="124" height="92" rx="10" fill="#00308F" />
      <rect x="158" y="74" width="104" height="64" rx="5" fill="#FFFFFF" />
      <rect x="166" y="82" width="54" height="8" rx="2" fill="#00308F" />
      <rect x="166" y="96" width="42" height="5" rx="2" fill="#CBD5E1" />
      <rect x="166" y="106" width="48" height="5" rx="2" fill="#CBD5E1" />
      <rect x="166" y="116" width="36" height="5" rx="2" fill="#CBD5E1" />
      <rect x="228" y="82" width="26" height="44" rx="4" fill="#EEF3FC" stroke="#2D4CB0" strokeWidth="1.2" />
      <path d="M196 156L186 176H234L224 156" fill="#2D4CB0" />

      {/* Connection paths */}
      <path d="M98 78H148" stroke="#00308F" strokeWidth="1.6" strokeDasharray="6 6" className="animate-svg-dash-flow" />
      <path d="M98 182H132V132H148" stroke="#2D4CB0" strokeWidth="1.6" strokeDasharray="6 6" className="animate-svg-dash-flow" />
      <path d="M272 78H322" stroke="#15803D" strokeWidth="1.6" strokeDasharray="6 6" className="animate-svg-dash-flow" />
      <path d="M272 132H288V182H322" stroke="#00308F" strokeWidth="1.6" strokeDasharray="6 6" className="animate-svg-dash-flow" />

      {/* 4 Satellite Nodes */}
      {/* Top Left: Offline local DB */}
      <rect x="28" y="54" width="70" height="48" rx="8" fill="#FFFFFF" stroke="#00308F" strokeWidth="1.4" />
      <ellipse cx="63" cy="70" rx="14" ry="5" fill="#EEF3FC" stroke="#00308F" strokeWidth="1.3" />
      <path d="M49 70V84C49 86.8 55.3 89 63 89C70.7 89 77 86.8 77 84V70" stroke="#00308F" strokeWidth="1.3" />

      {/* Bottom Left: Barcode & Stock */}
      <rect x="28" y="158" width="70" height="48" rx="8" fill="#FFFFFF" stroke="#2D4CB0" strokeWidth="1.4" />
      <path d="M44 172V192M50 172V192M54 172V192M61 172V192M66 172V192M73 172V192M81 172V192" stroke="#00308F" strokeWidth="2" />

      {/* Top Right: Cloud Backup */}
      <rect x="322" y="54" width="70" height="48" rx="8" fill="#FFFFFF" stroke="#15803D" strokeWidth="1.4" />
      <path d="M345 86H371C375.4 86 379 82.6 379 78.5C379 74.6 375.8 71.4 371.8 71C370.4 66.4 366.1 63 361 63C354.9 63 350 67.8 350 73.7C345.9 74.3 343 77.7 343 81.5C343 84 343.9 86 345 86Z" fill="#DCFCE7" stroke="#15803D" strokeWidth="1.4" />

      {/* Bottom Right: QR / Card Payments */}
      <rect x="322" y="158" width="70" height="48" rx="8" fill="#FFFFFF" stroke="#00308F" strokeWidth="1.4" />
      <rect x="339" y="170" width="36" height="24" rx="4" fill="#EEF3FC" stroke="#00308F" strokeWidth="1.3" />
      <line x1="339" y1="178" x2="375" y2="178" stroke="#00308F" strokeWidth="2" />
      <rect x="345" y="184" width="10" height="4" rx="1" fill="#2D4CB0" />
    </svg>
  );
}

/**
 * Clean geometric technical icon for Home product cards (no stock photo clutter)
 */
export function ProductCategorySvg({ categoryKey, className }: { categoryKey: string; className?: string }) {
  const key = categoryKey.toLowerCase();

  if (key.includes('fiscal')) {
    return (
      <svg viewBox="0 0 120 88" fill="none" className={cn('h-20 w-28', className)} aria-hidden="true">
        <rect x="34" y="10" width="52" height="30" rx="3" fill="#FFFFFF" stroke="#00308F" strokeWidth="1.8" />
        <line x1="44" y1="20" x2="76" y2="20" stroke="#2D4CB0" strokeWidth="2" strokeLinecap="round" />
        <line x1="44" y1="28" x2="66" y2="28" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        <rect x="18" y="36" width="84" height="40" rx="8" fill="#00308F" />
        <rect x="30" y="46" width="36" height="14" rx="3" fill="#FFFFFF" fillOpacity="0.18" />
        <circle cx="84" cy="53" r="4" fill="#4ADE80" />
      </svg>
    );
  }

  if (key.includes('desktop') || key.includes('pc')) {
    return (
      <svg viewBox="0 0 120 88" fill="none" className={cn('h-20 w-28', className)} aria-hidden="true">
        <rect x="14" y="14" width="62" height="44" rx="5" fill="#FFFFFF" stroke="#00308F" strokeWidth="1.8" />
        <rect x="20" y="20" width="50" height="32" rx="2" fill="#EEF3FC" />
        <path d="M38 58L34 72H56L52 58" fill="#2D4CB0" />
        <rect x="84" y="14" width="22" height="58" rx="4" fill="#00308F" />
        <circle cx="95" cy="26" r="3" fill="#4ADE80" />
        <line x1="90" y1="38" x2="100" y2="38" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="90" y1="45" x2="100" y2="45" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (key.includes('notebook') || key.includes('laptop')) {
    return (
      <svg viewBox="0 0 120 88" fill="none" className={cn('h-20 w-28', className)} aria-hidden="true">
        <rect x="22" y="14" width="76" height="48" rx="5" fill="#FFFFFF" stroke="#00308F" strokeWidth="1.8" />
        <rect x="28" y="20" width="64" height="36" rx="2" fill="#EEF3FC" />
        <path d="M12 64H108L102 74H18L12 64Z" fill="#00308F" />
        <rect x="52" y="67" width="16" height="3" rx="1.5" fill="#FFFFFF" fillOpacity="0.6" />
      </svg>
    );
  }

  if (key.includes('ticket') || key.includes('comander')) {
    return (
      <svg viewBox="0 0 120 88" fill="none" className={cn('h-20 w-28', className)} aria-hidden="true">
        <rect x="38" y="10" width="44" height="32" rx="3" fill="#FFFFFF" stroke="#2D4CB0" strokeWidth="1.8" />
        <path d="M46 20H74M46 27H68M46 34H60" stroke="#00308F" strokeWidth="1.8" strokeLinecap="round" />
        <rect x="26" y="40" width="68" height="36" rx="7" fill="#00308F" />
        <rect x="36" y="48" width="48" height="6" rx="2" fill="#0E1A33" />
        <circle cx="80" cy="64" r="3.5" fill="#4ADE80" />
      </svg>
    );
  }

  if (key.includes('barcode') || key.includes('lector')) {
    return (
      <svg viewBox="0 0 120 88" fill="none" className={cn('h-20 w-28', className)} aria-hidden="true">
        <rect x="20" y="16" width="80" height="56" rx="8" fill="#FFFFFF" stroke="#00308F" strokeWidth="1.8" />
        <path d="M34 30V58M41 30V58M46 30V58M54 30V58M59 30V58M67 30V58M74 30V58M80 30V58M86 30V58" stroke="#00308F" strokeWidth="2.4" />
        <line x1="26" y1="44" x2="94" y2="44" stroke="#E11D48" strokeWidth="2" />
      </svg>
    );
  }

  // Calculator / default tech hardware
  return (
    <svg viewBox="0 0 120 88" fill="none" className={cn('h-20 w-28', className)} aria-hidden="true">
      <rect x="34" y="10" width="52" height="68" rx="8" fill="#00308F" />
      <rect x="42" y="18" width="36" height="14" rx="3" fill="#EEF3FC" />
      <rect x="42" y="40" width="9" height="8" rx="2" fill="#FFFFFF" fillOpacity="0.9" />
      <rect x="55.5" y="40" width="9" height="8" rx="2" fill="#FFFFFF" fillOpacity="0.9" />
      <rect x="69" y="40" width="9" height="8" rx="2" fill="#4ADE80" />
      <rect x="42" y="52" width="9" height="8" rx="2" fill="#FFFFFF" fillOpacity="0.7" />
      <rect x="55.5" y="52" width="9" height="8" rx="2" fill="#FFFFFF" fillOpacity="0.7" />
      <rect x="69" y="52" width="9" height="20" rx="2" fill="#FFFFFF" />
      <rect x="42" y="64" width="22.5" height="8" rx="2" fill="#FFFFFF" fillOpacity="0.7" />
    </svg>
  );
}
