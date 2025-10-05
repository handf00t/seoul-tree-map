// components/UI/ActionButton.tsx
import React, { CSSProperties, ReactNode } from 'react';

type ActionButtonVariant = 'primary' | 'secondary' | 'error' | 'ghost';
type ActionButtonSize = 'small' | 'medium' | 'large';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: ActionButtonVariant;
  size?: ActionButtonSize;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: string | ReactNode;
  style?: CSSProperties;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  onClick,
  variant = 'secondary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  icon,
  style = {},
  ...props
}) => {
  const getVariantStyles = (): CSSProperties => {
    const variants: Record<ActionButtonVariant, CSSProperties> = {
      primary: {
        background: 'var(--primary)',
        color: 'var(--surface)',
        border: 'none'
      },
      secondary: {
        background: 'var(--surface-variant)',
        color: 'var(--text-secondary)',
        border: '1px solid var(--outline)'
      },
      error: {
        background: 'var(--error)',
        color: 'var(--surface)',
        border: 'none'
      },
      ghost: {
        background: 'transparent',
        color: 'var(--text-primary)',
        border: '1px solid var(--outline)'
      }
    };
    return variants[variant];
  };

  const getSizeStyles = (): CSSProperties => {
    const sizes: Record<ActionButtonSize, CSSProperties> = {
      small: {
        height: '36px',
        fontSize: '12px',
        padding: '0 12px'
      },
      medium: {
        height: '44px',
        fontSize: '13px',
        padding: '0 16px'
      },
      large: {
        height: '52px',
        fontSize: '15px',
        padding: '0 20px'
      }
    };
    return sizes[size];
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variantStyles,
        ...sizeStyles,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        borderRadius: '8px',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        width: fullWidth ? '100%' : 'auto',
        flex: fullWidth ? 1 : 'none',
        ...style
      }}
      {...props}
    >
      {icon && (
        typeof icon === 'string' ? (
          <span className="material-icons" style={{ fontSize: 'inherit' }}>{icon}</span>
        ) : (
          icon
        )
      )}
      {children}
    </button>
  );
};

export default ActionButton;
