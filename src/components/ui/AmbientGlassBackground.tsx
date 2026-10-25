import React from 'react';

export const AmbientGlassBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* Top Left Indigo & Violet Orb */}
      <div
        className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full blur-[110px] opacity-45 mix-blend-multiply"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.8) 0%, rgba(139, 92, 246, 0.4) 60%, transparent 80%)',
        }}
      />

      {/* Top Right Sky & Cyan Glow */}
      <div
        className="absolute -top-[10%] -right-[8%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full blur-[100px] opacity-40 mix-blend-multiply"
        style={{
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.7) 0%, rgba(99, 102, 241, 0.3) 60%, transparent 80%)',
        }}
      />

      {/* Center Subtle Fuchsia / Rose Specular */}
      <div
        className="absolute top-[35%] left-[25%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full blur-[120px] opacity-25 mix-blend-multiply"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.6) 0%, rgba(168, 85, 247, 0.3) 60%, transparent 80%)',
        }}
      />

      {/* Bottom Right Emerald & Teal Ambient Base */}
      <div
        className="absolute -bottom-[15%] -right-[10%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full blur-[110px] opacity-35 mix-blend-multiply"
        style={{
          background: 'radial-gradient(circle, rgba(45, 212, 191, 0.6) 0%, rgba(99, 102, 241, 0.3) 60%, transparent 80%)',
        }}
      />

      {/* Very subtle mesh grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(15, 23, 42, 0.7) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
};
