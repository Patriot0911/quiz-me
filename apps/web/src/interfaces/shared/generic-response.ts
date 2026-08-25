import { AxiosResponse } from 'axios';

export interface IGenericResponse<T> {
  data: T;
  status: boolean;
};
export type IGenericAxiosResponse<T> = AxiosResponse<IGenericResponse<T>>;
export type IBooleanResponse = IGenericResponse<boolean>;

export interface IGenericListResponse<T> {
  items: T[];
  meta: IListMeta;
};

export interface IListMeta {
  count: number;
};
