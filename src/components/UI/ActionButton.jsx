// components/UI/ActionButton.jsx
const ActionButton = ({
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
  const getVariantStyles = () => {
    const variants = {
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
    return variants[variant] || variants.secondary;
  };

  const getSizeStyles = () => {
    const sizes = {
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
    return sizes[size] || sizes.medium;
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
