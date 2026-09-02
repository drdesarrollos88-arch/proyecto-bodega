export type ProductCategory = 
  | 'Artículos de Oficina' 
  | 'EPP' 
  | 'Herramientas Menores' 
  | 'Otros';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  unit: string;
  current_stock: number;
  min_stock: number;
  unit_price: number;
  location: string;
  image_url?: string;
  created_at?: string;
}

export type UserRole = 
  | 'tecnico' 
  | 'supervisor' 
  | 'bodeguero_admin' 
  | 'jefe_seccion'
  | 'superadmin';

export interface UserProfile {
  id: string;
  name: string;
  rut: string;
  role: UserRole;
  cost_center_id: string;
  password?: string;
  phone?: string;
  email?: string;
}

export interface CostCenter {
  id: string;
  code: string;
  name: string;
  area: string;
  assigned_budget: number;
  executed_budget: number;
}

export type RequestPriority = 'Normal' | 'Urgente';
export type RequestStatus = 'pendiente' | 'aprobada' | 'rechazada' | 'entregada';

export interface RequestItem {
  id: string;
  request_id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  delivered_quantity?: number;
  unit_price: number;
  total_price: number;
}

export interface WarehouseRequest {
  id: string;
  technician_id: string;
  technician_name: string;
  technician_rut: string;
  cost_center_id: string;
  work_order?: string;
  reason: string;
  priority: RequestPriority;
  status: RequestStatus;
  supervisor_id?: string;
  supervisor_name?: string;
  supervisor_notes?: string;
  approved_at?: string;
  created_at: string;
  items: RequestItem[];
}

export type ItemReturnStatus = 'devuelto_danado' | 'extraviado' | 'sin_retorno_nuevo';

export interface DeliveryRecord {
  id: string;
  request_id: string;
  technician_name: string;
  technician_rut: string;
  warehouse_staff_name: string;
  cost_center_id: string;
  total_amount: number;
  signature_data: string;
  photo_data: string;
  return_status?: ItemReturnStatus;
  damaged_photo_data?: string;
  loss_reason?: string;
  observations?: string;
  delivered_at: string;
  items: RequestItem[];
}

export type PurchaseOrderStatus = 'solicitada' | 'en_camino' | 'recibida';

export interface PurchaseOrder {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  estimated_unit_cost: number;
  total_cost: number;
  supplier: string;
  status: PurchaseOrderStatus;
  requested_by: string;
  created_at: string;
  received_at?: string;
}
