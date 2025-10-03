// components/UI/EmptyState.jsx
const EmptyState = ({
  icon,
  title,
  description,
  action,
  variant = 'default',
  style = {}
}) => {
  const getVariantStyles = () => {
    const variants = {
      default: {
        background: 'var(--surface-variant)',
        border: '1px solid var(--outline)',
        borderRadius: '12px'
      },
      dashed: {
        background: 'var(--surface-variant)',
        border: '1px dashed var(--outline)',
        borderRadius: '12px'
      },
      plain: {
        background: 'transparent',
        border: 'none'
      }
    };
    return variants[variant] || variants.default;
  };

  const variantStyles = getVariantStyles();

  return (
    <div style={{
      padding: variant === 'plain' ? '60px 20px' : '24px',
      textAlign: 'center',
      ...variantStyles,
      ...style
    }}>
      {icon && (
        <div style={{
          fontSize: variant === 'plain' ? '48px' : '32px',
          marginBottom: variant === 'plain' ? '12px' : '8px'
        }}>
          {typeof icon === 'string' ? (
            <span className="material-icons" style={{ fontSize: 'inherit' }}>{icon}</span>
          ) : (
            icon
          )}
        </div>
      )}

      {title && (
        <div style={{
          fontSize: '16px',
          marginBottom: '8px',
          fontWeight: '600',
          color: 'var(--text-primary)'
        }}>
          {title}
        </div>
      )}

      {description && (
        <div style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          marginBottom: action ? '16px' : '0',
          lineHeight: '1.4'
        }}>
          {description}
        </div>
      )}

      {action}
    </div>
  );
};

export default EmptyState;
