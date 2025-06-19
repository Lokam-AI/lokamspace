import Link from 'next/link';
import React from 'react';

// A simple classname helper function
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
}

// Mimics class-variance-authority
const buttonVariants = (variant: 'primary' | 'secondary', size: 'default') => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  const variantClasses = {
    primary: 'bg-autopulse-orange text-white hover:bg-autopulse-orange-dark focus-visible:ring-autopulse-orange',
    secondary: 'bg-autopulse-black-light text-white hover:bg-autopulse-black-dark focus-visible:ring-autopulse-black-light',
  };

  const sizeClasses = {
    default: 'px-8 py-3',
  };

  return cn(baseClasses, variantClasses[variant], sizeClasses[size]);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'default';
  href?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', href, ...props }, ref) => {
    
    const classes = cn(buttonVariants(variant, size), className);

    if (href) {
      return (
        <Link href={href} className={classes}>
          {props.children}
        </Link>
      );
    }

    return (
      <button
        className={classes}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants }; 