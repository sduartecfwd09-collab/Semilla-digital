import React from 'react';
import { getCategoryIcon } from '../../utils/categoryIcons';

interface CategoryIconProps {
  categoria: string;
  size?: number;
  showLabel?: boolean;
  className?: string;
}

/**
 * Componente que muestra el icono SVG correspondiente a una categoría de producto.
 * Reemplaza los emojis por iconos SVG profesionales y consistentes.
 */
const CategoryIcon: React.FC<CategoryIconProps> = ({
  categoria,
  size = 28,
  showLabel = false,
  className = ''
}) => {
  const iconData = getCategoryIcon(categoria);

  return (
    <span
      className={`category-icon-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size + 12,
        height: size + 12,
        borderRadius: '10px',
        backgroundColor: iconData.bgColor,
        color: iconData.color,
        flexShrink: 0,
      }}
      title={iconData.label}
    >
      {/*
        dangerouslySetInnerHTML: las cadenas SVG provienen de la constante interna
        `utils/categoryIcons.ts` (no son input del usuario). Si en el futuro la fuente
        de los SVG se hidrata desde backend o desde input externo, hay que sanitizarlas
        con DOMPurify o reemplazar este componente por SVGs como JSX nativo.
      */}
      <span
        dangerouslySetInnerHTML={{
          __html: typeof iconData.svg === 'string'
            ? iconData.svg
                .replace(/width="\d+"/, `width="${size}"`)
                .replace(/height="\d+"/, `height="${size}"`)
            : ''
        }}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      />
      {showLabel && (
        <span style={{ marginLeft: 6, fontSize: '0.85rem', fontWeight: 600, color: iconData.color }}>
          {iconData.label}
        </span>
      )}
    </span>
  );
};

export default CategoryIcon;
