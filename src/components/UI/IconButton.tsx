// components/UI/IconButton.tsx
import React, { CSSProperties } from 'react';

type IconButtonVariant = 'default' | 'close' | 'primary' | 'danger' | 'ghost';
type IconButtonSize = 'small' | 'medium' | 'large' | 'xlarge';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  ariaLabel?: string;
  disabled?: boolean;
  style?: CSSProperties;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  variant = 'default',
  size = 'medium',
  ariaLabel,
  style = {},
  disabled = false,
  ...props
}) => {
  const getVariantStyles = (): CSSProperties => {
    const variants: Record<IconButtonVariant, CSSProperties> = {
      default: {
        background: 'var(--surface-variant)',
        color: 'var(--text-secondary)',
        border: 'none'
      },
      close: {
        background: 'var(--surface-variant)',
        color: 'var(--text-secondary)',
        border: 'none',
        borderRadius: '50%'
      },
      primary: {
        background: 'var(--primary)',
        color: 'white',
        border: 'none'
      },
      danger: {
        background: 'var(--surface)',
        color: 'var(--text-tertiary)',
        border: '1px solid var(--outline)',
        transition: 'all 0.2s ease'
      },
      ghost: {
        background: 'none',
        color: 'var(--text-secondary)',
        border: 'none'
      }
    };
    return variants[variant];
  };

  const getSizeStyles = (): CSSProperties => {
    const sizes: Record<IconButtonSize, CSSProperties> = {
      small: {
        width: '24px',
        height: '24px',
        fontSize: '16px'
      },
      medium: {
        width: '32px',
        height: '32px',
        fontSize: '18px'
      },
      large: {
        width: '40px',
        height: '40px',
        fontSize: '20px'
      },
      xlarge: {
        width: '44px',
        height: '44px',
        fontSize: '24px'
      }
    };
    return sizes[size];
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'danger') {
      e.currentTarget.style.background = 'var(--error)';
      e.currentTarget.style.color = 'white';
      e.currentTarget.style.borderColor = 'var(--error)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'danger') {
      e.currentTarget.style.background = 'var(--surface)';
      e.currentTarget.style.color = 'var(--text-tertiary)';
      e.currentTarget.style.borderColor = 'var(--outline)';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || icon}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...variantStyles,
        ...sizeStyles,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        borderRadius: variant === 'close' ? '50%' : '8px',
        ...style
      }}
      {...props}
    >
      <span className="material-icons" style={{ fontSize: sizeStyles.fontSize as string }}>
        {icon}
      </span>
    </button>
  );
};

export default IconButton;
