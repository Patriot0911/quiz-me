export interface IFormSelectedOptionProps<O extends SelectOption<string, string>>  {
  children: (item: O) => ReactNode;
  className?: string;
};
