import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable button component with consistent styling
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} props.variant - Button style variant
 * @param {string} props.size - Button size
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.className - Additional CSS classes
 */
const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-md hover:shadow-lg',
    success: 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-gray-900 shadow-lg hover:shadow-xl',
    ghost: 'bg-transparent hover:bg-gray-700/50 text-gray-200 border-2 border-gray-600 hover:border-gray-500'
  };

  const sizes = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };

  const buttonClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'ghost']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  className: PropTypes.string
};

export default Button;
