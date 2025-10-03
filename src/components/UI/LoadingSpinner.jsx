// components/UI/LoadingSpinner.jsx
const LoadingSpinner = ({
  size = 'medium',
  text = '',
  centered = true,
  style = {}
}) => {
  const getSizeStyles = () => {
    const sizes = {
      small: {
        width: '20px',
        height: '20px',
        borderWidth: '2px'
      },
      medium: {
        width: '40px',
        height: '40px',
        borderWidth: '3px'
      },
      large: {
        width: '60px',
        height: '60px',
        borderWidth: '4px'
      }
    };
    return sizes[size] || sizes.medium;
  };

  const sizeStyles = getSizeStyles();

  const spinnerStyle = {
    width: sizeStyles.width,
    height: sizeStyles.height,
    border: `${sizeStyles.borderWidth} solid var(--surface-dim)`,
    borderTop: `${sizeStyles.borderWidth} solid var(--primary)`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: text ? '0 auto 12px' : '0 auto'
  };

  const containerStyle = centered ? {
    padding: '60px 20px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    ...style
  } : style;

  if (text) {
    return (
      <div style={containerStyle}>
        <div style={spinnerStyle} />
        {text}
      </div>
    );
  }

  return <div style={spinnerStyle} />;
};

export default LoadingSpinner;
