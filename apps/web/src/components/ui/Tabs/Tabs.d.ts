
export interface TabItem<T extends string = string> {
  key: T;
  label: string;
  count?: number;
};

export interface TabsProps<T extends string = string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
};
