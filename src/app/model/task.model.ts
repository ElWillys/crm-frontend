import { AppUser } from "./appUser.model";
import { Brand } from "./brand.model";
import { Customer } from "./customer.model";

export type TaskStatus = 'PENDIENTE' | 'EN_CURSO' | 'COMPLETADA';

export interface Task {
  id?: number;
  title: string;
  description?: string;
  initialDate?: string; // formato yyyy-MM-dd
  endDate?: string;
  status: TaskStatus;
  user: AppUser;
  customer: Customer;
  brand: Brand;
}