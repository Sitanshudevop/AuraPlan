export interface SelectOption {
  value: string;
  label: string;
  dotColor?: string;
  description?: string;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  variant?: 'input' | 'ghost' | 'compact';
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
}

