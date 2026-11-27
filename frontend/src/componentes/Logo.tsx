interface LogoProps {
  tamanho?: number;
}

const POSICOES = [4.5, 13, 21.5];

export function Logo({ tamanho = 32 }: LogoProps) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 32 32"
      role="img"
      aria-label="Logo do Organização Pessoal"
    >
      <rect width="32" height="32" rx="9" style={{ fill: 'var(--mantine-primary-color-filled)' }} />
      {POSICOES.flatMap((y, linha) =>
        POSICOES.map((x, coluna) => (
          <rect
            key={`${linha}-${coluna}`}
            x={x}
            y={y}
            width="6"
            height="6"
            rx="1.8"
            fill="#ffffff"
            fillOpacity={linha === coluna ? 1 : 0.4}
          />
        )),
      )}
    </svg>
  );
}