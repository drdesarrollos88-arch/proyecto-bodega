import { Product, CostCenter, UserProfile, WarehouseRequest, DeliveryRecord, PurchaseOrder } from '../types';
import { getSupabase } from './supabase';

const STORAGE_KEYS = {
  PRODUCTS: 'bodega_products_v1',
  COST_CENTERS: 'bodega_cost_centers_v1',
  PROFILES: 'bodega_profiles_v1',
  REQUESTS: 'bodega_requests_v1',
  DELIVERIES: 'bodega_deliveries_v1',
  PURCHASES: 'bodega_purchases_v1',
};

// ============================================================================
// DATOS SEMILLA INICIALES
// ============================================================================

const INITIAL_COST_CENTERS: CostCenter[] = [
  {
    id: 'CC-101',
    code: 'CC-101',
    name: 'Operaciones de Terreno',
    area: 'Área de Telecomunicaciones y Redes',
    assigned_budget: 15000000,
    executed_budget: 3420000,
  },
  {
    id: 'CC-102',
    code: 'CC-102',
    name: 'Mantenimiento e Infraestructura',
    area: 'Área de Telecomunicaciones y Redes',
    assigned_budget: 12500000,
    executed_budget: 1890000,
  },
  {
    id: 'CC-103',
    code: 'CC-103',
    name: 'Fibra Óptica y Enlaces',
    area: 'Área de Telecomunicaciones y Redes',
    assigned_budget: 18000000,
    executed_budget: 4150000,
  },
  {
    id: 'CC-104',
    code: 'CC-104',
    name: 'Administración y Logística',
    area: 'Área de Telecomunicaciones y Redes',
    assigned_budget: 8000000,
    executed_budget: 920000,
  },
];

const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'USR-01',
    name: 'Carlos Muñoz Alarcón',
    rut: '16.894.221-5',
    role: 'tecnico',
    cost_center_id: 'CC-101',
    phone: '+56 9 8452 1190',
    email: 'carlos.munoz@empresa.cl',
  },
  {
    id: 'USR-02',
    name: 'Roberto Valenzuela Tapia',
    rut: '14.238.995-2',
    role: 'supervisor',
    cost_center_id: 'CC-101',
    phone: '+56 9 9123 4455',
    email: 'roberto.valenzuela@empresa.cl',
  },
  {
    id: 'USR-03',
    name: 'Marisol Soto Cárdenas',
    rut: '15.671.304-K',
    role: 'bodeguero_admin',
    cost_center_id: 'CC-104',
    phone: '+56 9 7344 8812',
    email: 'bodega@empresa.cl',
  },
  {
    id: 'USR-04',
    name: 'Ing. Patricio Lagos M.',
    rut: '11.450.812-3',
    role: 'jefe_seccion',
    cost_center_id: 'CC-104',
    phone: '+56 9 9888 1234',
    email: 'patricio.lagos@empresa.cl',
  },
];

const INITIAL_PRODUCTS: Product[] = [
  // EPP
  {
    id: 'p-epp-1',
    sku: 'EPP-001',
    name: 'Casco de Seguridad Blanco con Barbiquejo Dieléctrico',
    category: 'EPP',
    unit: 'unidad',
    current_stock: 28,
    min_stock: 10,
    unit_price: 14500,
    location: 'Pasillo 1 - Estante A1',
  },
  {
    id: 'p-epp-2',
    sku: 'EPP-002',
    name: 'Guantes de Cabritilla Reforzados para Faena',
    category: 'EPP',
    unit: 'par',
    current_stock: 65,
    min_stock: 20,
    unit_price: 4200,
    location: 'Pasillo 1 - Estante A2',
  },
  {
    id: 'p-epp-3',
    sku: 'EPP-003',
    name: 'Lentes de Seguridad Oscuros Anti-Empañante UV',
    category: 'EPP',
    unit: 'unidad',
    current_stock: 42,
    min_stock: 15,
    unit_price: 3800,
    location: 'Pasillo 1 - Estante A3',
  },
  {
    id: 'p-epp-4',
    sku: 'EPP-004',
    name: 'Zapatos de Seguridad Dieléctricos Talla 42',
    category: 'EPP',
    unit: 'par',
    current_stock: 4, // Stock crítico
    min_stock: 8,
    unit_price: 48900,
    location: 'Pasillo 1 - Estante B1',
  },
  {
    id: 'p-epp-5',
    sku: 'EPP-005',
    name: 'Chaleco Geólogo Reflectante Alta Visibilidad Naranjo',
    category: 'EPP',
    unit: 'unidad',
    current_stock: 18,
    min_stock: 10,
    unit_price: 8900,
    location: 'Pasillo 1 - Estante B2',
  },
  {
    id: 'p-epp-6',
    sku: 'EPP-006',
    name: 'Protector Auditivo Tipo Copa para Casco SNR 28dB',
    category: 'EPP',
    unit: 'unidad',
    current_stock: 14,
    min_stock: 10,
    unit_price: 12500,
    location: 'Pasillo 1 - Estante B3',
  },
  {
    id: 'p-epp-7',
    sku: 'EPP-007',
    name: 'Arnés de Seguridad 4 Argollas con Cabo de Vida',
    category: 'EPP',
    unit: 'unidad',
    current_stock: 3, // Stock crítico
    min_stock: 6,
    unit_price: 65000,
    location: 'Pasillo 1 - Estante C1',
  },

  // Herramientas Menores
  {
    id: 'p-her-1',
    sku: 'HER-001',
    name: 'Multitéster Digital Profesional con True RMS Cat III',
    category: 'Herramientas Menores',
    unit: 'unidad',
    current_stock: 8,
    min_stock: 5,
    unit_price: 38500,
    location: 'Pasillo 2 - Estante A1',
  },
  {
    id: 'p-her-2',
    sku: 'HER-002',
    name: 'Pelacables Automático Frontal 0.2 a 6mm²',
    category: 'Herramientas Menores',
    unit: 'unidad',
    current_stock: 12,
    min_stock: 6,
    unit_price: 16900,
    location: 'Pasillo 2 - Estante A2',
  },
  {
    id: 'p-her-3',
    sku: 'HER-003',
    name: 'Alicate Universal Aislado 1000V 8 Pulgadas',
    category: 'Herramientas Menores',
    unit: 'unidad',
    current_stock: 15,
    min_stock: 8,
    unit_price: 14200,
    location: 'Pasillo 2 - Estante A3',
  },
  {
    id: 'p-her-4',
    sku: 'HER-004',
    name: 'Juego de Destornilladores Dieléctricos 1000V (6 piezas)',
    category: 'Herramientas Menores',
    unit: 'set',
    current_stock: 9,
    min_stock: 6,
    unit_price: 22500,
    location: 'Pasillo 2 - Estante B1',
  },
  {
    id: 'p-her-5',
    sku: 'HER-005',
    name: 'Crimpadora de Conectores RJ45 / RJ11 con Testeador',
    category: 'Herramientas Menores',
    unit: 'unidad',
    current_stock: 4, // Stock crítico
    min_stock: 6,
    unit_price: 28900,
    location: 'Pasillo 2 - Estante B2',
  },
  {
    id: 'p-her-6',
    sku: 'HER-006',
    name: 'Huincha de Medir 8 Metros Anti-Impacto Auto-Lock',
    category: 'Herramientas Menores',
    unit: 'unidad',
    current_stock: 22,
    min_stock: 10,
    unit_price: 6900,
    location: 'Pasillo 2 - Estante B3',
  },
  {
    id: 'p-her-7',
    sku: 'HER-007',
    name: 'Linterna Frontal LED Recargable 800 Lúmenes IP65',
    category: 'Herramientas Menores',
    unit: 'unidad',
    current_stock: 11,
    min_stock: 8,
    unit_price: 18500,
    location: 'Pasillo 2 - Estante C1',
  },

  // Artículos de Oficina
  {
    id: 'p-ofi-1',
    sku: 'OFI-001',
    name: 'Cuaderno de Cargo Cuadriculado Empastado 100 Hojas',
    category: 'Artículos de Oficina',
    unit: 'unidad',
    current_stock: 45,
    min_stock: 15,
    unit_price: 3200,
    location: 'Pasillo 3 - Estante A1',
  },
  {
    id: 'p-ofi-2',
    sku: 'OFI-002',
    name: 'Archivador Palanca Oficio Lomo Ancho Plastificado',
    category: 'Artículos de Oficina',
    unit: 'unidad',
    current_stock: 35,
    min_stock: 15,
    unit_price: 2950,
    location: 'Pasillo 3 - Estante A2',
  },
  {
    id: 'p-ofi-3',
    sku: 'OFI-003',
    name: 'Resma Papel Carta 75g (500 Hojas) Alta Blancura',
    category: 'Artículos de Oficina',
    unit: 'resma',
    current_stock: 12, // Stock crítico
    min_stock: 20,
    unit_price: 4800,
    location: 'Pasillo 3 - Estante A3',
  },
  {
    id: 'p-ofi-4',
    sku: 'OFI-004',
    name: 'Set Marcadores Permanentes Punta Biselada (Pack 4)',
    category: 'Artículos de Oficina',
    unit: 'pack',
    current_stock: 25,
    min_stock: 12,
    unit_price: 3400,
    location: 'Pasillo 3 - Estante B1',
  },
  {
    id: 'p-ofi-5',
    sku: 'OFI-005',
    name: 'Cinta Embalaje Transparente 48mm x 100m Industrial',
    category: 'Artículos de Oficina',
    unit: 'unidad',
    current_stock: 50,
    min_stock: 20,
    unit_price: 1850,
    location: 'Pasillo 3 - Estante B2',
  },
  {
    id: 'p-ofi-6',
    sku: 'OFI-006',
    name: 'Tóner Negro Compatible HP LaserJet Enterprise',
    category: 'Artículos de Oficina',
    unit: 'unidad',
    current_stock: 2, // Stock crítico
    min_stock: 4,
    unit_price: 45000,
    location: 'Pasillo 3 - Estante B3',
  },

  // Otros
  {
    id: 'p-otr-1',
    sku: 'OTR-001',
    name: 'Alcohol Isopropílico 99.8% Botella 1 Litro',
    category: 'Otros',
    unit: 'litro',
    current_stock: 14,
    min_stock: 8,
    unit_price: 7200,
    location: 'Pasillo 4 - Estante A1',
  },
  {
    id: 'p-otr-2',
    sku: 'OTR-002',
    name: 'Paño Microfibra Antiestático para Fibra Óptica (Pack 10)',
    category: 'Otros',
    unit: 'pack',
    current_stock: 20,
    min_stock: 10,
    unit_price: 5900,
    location: 'Pasillo 4 - Estante A2',
  },
  {
    id: 'p-otr-3',
    sku: 'OTR-003',
    name: 'Amarres Plásticos Negros 300mm x 4.8mm (Bolsa 100 un)',
    category: 'Otros',
    unit: 'bolsa',
    current_stock: 40,
    min_stock: 15,
    unit_price: 4500,
    location: 'Pasillo 4 - Estante B1',
  },
  {
    id: 'p-otr-4',
    sku: 'OTR-004',
    name: 'Cinta Autofundente de Goma para Aislamiento 19mm x 9m',
    category: 'Otros',
    unit: 'rollo',
    current_stock: 16,
    min_stock: 10,
    unit_price: 6800,
    location: 'Pasillo 4 - Estante B2',
  },
];

const INITIAL_REQUESTS: WarehouseRequest[] = [
  {
    id: 'SOL-2026-0001',
    technician_id: 'USR-01',
    technician_name: 'Carlos Muñoz Alarcón',
    technician_rut: '16.894.221-5',
    cost_center_id: 'CC-101',
    work_order: 'OT-4892',
    reason: 'Mantención enlace repetidor Cerro La Campana',
    priority: 'Normal',
    status: 'aprobada',
    supervisor_id: 'USR-02',
    supervisor_name: 'Roberto Valenzuela Tapia',
    supervisor_notes: 'Autorizado para retiro de turno matutino. Materiales indispensables para faena.',
    approved_at: new Date(Date.now() - 7200000).toISOString(),
    created_at: new Date(Date.now() - 14400000).toISOString(),
    items: [
      {
        id: 'ri-1',
        request_id: 'SOL-2026-0001',
        product_id: 'p-epp-2',
        product_name: 'Guantes de Cabritilla Reforzados para Faena',
        product_sku: 'EPP-002',
        quantity: 2,
        unit_price: 4200,
        total_price: 8400,
      },
      {
        id: 'ri-2',
        request_id: 'SOL-2026-0001',
        product_id: 'p-her-2',
        product_name: 'Pelacables Automático Frontal 0.2 a 6mm²',
        product_sku: 'HER-002',
        quantity: 1,
        unit_price: 16900,
        total_price: 16900,
      },
    ],
  },
  {
    id: 'SOL-2026-0002',
    technician_id: 'USR-01',
    technician_name: 'Carlos Muñoz Alarcón',
    technician_rut: '16.894.221-5',
    cost_center_id: 'CC-102',
    work_order: 'OT-4901',
    reason: 'Reparación de tramo secundario fibra poste 42',
    priority: 'Urgente',
    status: 'pendiente',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    items: [
      {
        id: 'ri-3',
        request_id: 'SOL-2026-0002',
        product_id: 'p-her-5',
        product_name: 'Crimpadora de Conectores RJ45 / RJ11 con Testeador',
        product_sku: 'HER-005',
        quantity: 1,
        unit_price: 28900,
        total_price: 28900,
      },
      {
        id: 'ri-4',
        request_id: 'SOL-2026-0002',
        product_id: 'p-otr-4',
        product_name: 'Cinta Autofundente de Goma para Aislamiento 19mm x 9m',
        product_sku: 'OTR-004',
        quantity: 2,
        unit_price: 6800,
        total_price: 13600,
      },
    ],
  },
];

const INITIAL_PURCHASES: PurchaseOrder[] = [
  {
    id: 'OC-2026-0001',
    product_id: 'p-epp-4',
    product_name: 'Zapatos de Seguridad Dieléctricos Talla 42',
    product_sku: 'EPP-004',
    quantity: 10,
    estimated_unit_cost: 45000,
    total_cost: 450000,
    supplier: 'Distribuidora Industrial Calzados SpA',
    status: 'en_camino',
    requested_by: 'Marisol Soto Cárdenas',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'OC-2026-0002',
    product_id: 'p-ofi-6',
    product_name: 'Tóner Negro Compatible HP LaserJet Enterprise',
    product_sku: 'OFI-006',
    quantity: 6,
    estimated_unit_cost: 41000,
    total_cost: 246000,
    supplier: 'Suministros Ofimática Chile',
    status: 'solicitada',
    requested_by: 'Marisol Soto Cárdenas',
    created_at: new Date(Date.now() - 28800000).toISOString(),
  },
];

// Placeholder de firma SVG en Base64 para registro semilla
const SAMPLE_SIGNATURE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100"><path d="M 20 60 Q 60 20 100 50 T 180 40 T 260 70" fill="none" stroke="%230284c7" stroke-width="3"/></svg>';
const SAMPLE_PHOTO = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" style="background:%230f172a"><text x="50%" y="45%" fill="%2338bdf8" font-size="16" text-anchor="middle" font-family="Calibri">ENTREGA DE MATERIALES EN BODEGA</text><text x="50%" y="60%" fill="%2394a3b8" font-size="13" text-anchor="middle" font-family="Calibri">Evidencia Fotográfica Verificada #ACTA-2026-0001</text></svg>';

const INITIAL_DELIVERIES: DeliveryRecord[] = [
  {
    id: 'ACTA-2026-0001',
    request_id: 'SOL-2026-0000',
    technician_name: 'Carlos Muñoz Alarcón',
    technician_rut: '16.894.221-5',
    warehouse_staff_name: 'Marisol Soto Cárdenas',
    cost_center_id: 'CC-101',
    total_amount: 57400,
    signature_data: SAMPLE_SIGNATURE,
    photo_data: SAMPLE_PHOTO,
    observations: 'Entrega conforme de EPP y linterna para turno nocturno.',
    delivered_at: new Date(Date.now() - 172800000).toISOString(),
    items: [
      {
        id: 'ri-demo-1',
        request_id: 'SOL-2026-0000',
        product_id: 'p-epp-1',
        product_name: 'Casco de Seguridad Blanco con Barbiquejo Dieléctrico',
        product_sku: 'EPP-001',
        quantity: 1,
        unit_price: 14500,
        total_price: 14500,
      },
      {
        id: 'ri-demo-2',
        request_id: 'SOL-2026-0000',
        product_id: 'p-epp-4',
        product_name: 'Zapatos de Seguridad Dieléctricos Talla 42',
        product_sku: 'EPP-004',
        quantity: 1,
        unit_price: 48900,
        total_price: 48900,
      },
    ],
  },
];

// ============================================================================
// HELPER DE PERSISTENCIA REACTIVA
// ============================================================================

class WarehouseStore {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COST_CENTERS)) {
      localStorage.setItem(STORAGE_KEYS.COST_CENTERS, JSON.stringify(INITIAL_COST_CENTERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_PROFILES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DELIVERIES)) {
      localStorage.setItem(STORAGE_KEYS.DELIVERIES, JSON.stringify(INITIAL_DELIVERIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PURCHASES)) {
      localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(INITIAL_PURCHASES));
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // --- PRODUCTOS ---
  public getProducts(): Product[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return raw ? JSON.parse(raw) : INITIAL_PRODUCTS;
  }

  public addProduct(product: Omit<Product, 'id'>): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...product,
      id: 'p-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    products.unshift(newProduct);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.notify();

    // Sincronizar con Supabase si está disponible
    const client = getSupabase();
    if (client) {
      client.from('products').insert([newProduct]).then();
    }

    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): void {
    const products = this.getProducts().map((p) => (p.id === id ? { ...p, ...updates } : p));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.notify();

    const client = getSupabase();
    if (client) {
      client.from('products').update(updates).eq('id', id).then();
    }
  }

  // --- CENTROS DE COSTO ---
  public getCostCenters(): CostCenter[] {
    const raw = localStorage.getItem(STORAGE_KEYS.COST_CENTERS);
    return raw ? JSON.parse(raw) : INITIAL_COST_CENTERS;
  }

  public getCostCenterById(id: string): CostCenter | undefined {
    return this.getCostCenters().find((c) => c.id === id);
  }

  // --- PERFILES ---
  public getProfiles(): UserProfile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
    return raw ? JSON.parse(raw) : INITIAL_PROFILES;
  }

  public getProfileById(id: string): UserProfile | undefined {
    return this.getProfiles().find((p) => p.id === id);
  }

  // --- SOLICITUDES ---
  public getRequests(): WarehouseRequest[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return raw ? JSON.parse(raw) : INITIAL_REQUESTS;
  }

  public createRequest(data: Omit<WarehouseRequest, 'id' | 'status' | 'created_at'>): WarehouseRequest {
    const requests = this.getRequests();
    const count = requests.length + 1;
    const newId = `SOL-2026-${String(count).padStart(4, '0')}`;

    const newRequest: WarehouseRequest = {
      ...data,
      id: newId,
      status: 'pendiente',
      created_at: new Date().toISOString(),
    };

    requests.unshift(newRequest);
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    this.notify();

    const client = getSupabase();
    if (client) {
      client.from('requests').insert([{
        id: newRequest.id,
        technician_id: newRequest.technician_id,
        technician_name: newRequest.technician_name,
        technician_rut: newRequest.technician_rut,
        cost_center_id: newRequest.cost_center_id,
        work_order: newRequest.work_order,
        reason: newRequest.reason,
        priority: newRequest.priority,
        status: newRequest.status,
      }]).then();
    }

    return newRequest;
  }

  public updateRequestStatus(
    requestId: string,
    status: 'aprobada' | 'rechazada',
    supervisorId: string,
    supervisorName: string,
    notes?: string
  ): void {
    const requests = this.getRequests().map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status,
          supervisor_id: supervisorId,
          supervisor_name: supervisorName,
          supervisor_notes: notes,
          approved_at: status === 'aprobada' ? new Date().toISOString() : undefined,
        };
      }
      return r;
    });

    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    this.notify();

    const client = getSupabase();
    if (client) {
      client.from('requests').update({
        status,
        supervisor_id: supervisorId,
        supervisor_name: supervisorName,
        supervisor_notes: notes,
        approved_at: status === 'aprobada' ? new Date().toISOString() : null,
      }).eq('id', requestId).then();
    }
  }

  // --- ENTREGA ATÓMICA CON FIRMA, FOTO Y DESCUENTO DE STOCK Y PRESUPUESTO ---
  public completeDelivery(params: {
    requestId: string;
    warehouseStaffName: string;
    signatureData: string;
    photoData: string;
    observations?: string;
  }): DeliveryRecord {
    const requests = this.getRequests();
    const req = requests.find((r) => r.id === params.requestId);
    if (!req) throw new Error('Solicitud no encontrada');

    const products = this.getProducts();
    const costCenters = this.getCostCenters();
    const deliveries = this.getDeliveries();

    // 1. Calcular monto total de la entrega
    let totalAmount = 0;
    req.items.forEach((item) => {
      totalAmount += item.total_price;
      // 2. Descontar stock de cada producto
      const prodIndex = products.findIndex((p) => p.id === item.product_id || p.sku === item.product_sku);
      if (prodIndex >= 0) {
        products[prodIndex].current_stock = Math.max(0, products[prodIndex].current_stock - item.quantity);
      }
    });

    // 3. Imputar gasto al presupuesto del Centro de Costo
    const ccIndex = costCenters.findIndex((c) => c.id === req.cost_center_id);
    if (ccIndex >= 0) {
      costCenters[ccIndex].executed_budget += totalAmount;
    }

    // 4. Marcar solicitud como 'entregada'
    req.status = 'entregada';

    // 5. Crear Acta de Entrega con código auditado
    const actaCount = deliveries.length + 1;
    const actaId = `ACTA-2026-${String(actaCount).padStart(4, '0')}`;

    const newDelivery: DeliveryRecord = {
      id: actaId,
      request_id: req.id,
      technician_name: req.technician_name,
      technician_rut: req.technician_rut,
      warehouse_staff_name: params.warehouseStaffName,
      cost_center_id: req.cost_center_id,
      total_amount: totalAmount,
      signature_data: params.signatureData,
      photo_data: params.photoData,
      observations: params.observations,
      delivered_at: new Date().toISOString(),
      items: req.items,
    };

    deliveries.unshift(newDelivery);

    // Guardar en Storage
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    localStorage.setItem(STORAGE_KEYS.COST_CENTERS, JSON.stringify(costCenters));
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    localStorage.setItem(STORAGE_KEYS.DELIVERIES, JSON.stringify(deliveries));

    this.notify();

    // Replicar en Supabase si está conectado
    const client = getSupabase();
    if (client) {
      client.from('deliveries').insert([{
        id: newDelivery.id,
        request_id: newDelivery.request_id,
        technician_name: newDelivery.technician_name,
        technician_rut: newDelivery.technician_rut,
        warehouse_staff_name: newDelivery.warehouse_staff_name,
        cost_center_id: newDelivery.cost_center_id,
        total_amount: newDelivery.total_amount,
        signature_data: newDelivery.signature_data,
        photo_data: newDelivery.photo_data,
        observations: newDelivery.observations,
      }]).then();

      client.from('requests').update({ status: 'entregada' }).eq('id', req.id).then();
    }

    return newDelivery;
  }

  public getDeliveries(): DeliveryRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DELIVERIES);
    return raw ? JSON.parse(raw) : INITIAL_DELIVERIES;
  }

  public getDeliveryById(id: string): DeliveryRecord | undefined {
    return this.getDeliveries().find((d) => d.id === id);
  }

  // --- ÓRDENES DE COMPRA (SOLICITUDES DE REABASTECIMIENTO) ---
  public getPurchaseOrders(): PurchaseOrder[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    return raw ? JSON.parse(raw) : INITIAL_PURCHASES;
  }

  public createPurchaseOrder(data: {
    productId: string;
    productName: string;
    productSku: string;
    quantity: number;
    estimatedUnitCost: number;
    supplier: string;
    requestedBy: string;
  }): PurchaseOrder {
    const purchases = this.getPurchaseOrders();
    const count = purchases.length + 1;
    const newId = `OC-2026-${String(count).padStart(4, '0')}`;

    const newOrder: PurchaseOrder = {
      id: newId,
      product_id: data.productId,
      product_name: data.productName,
      product_sku: data.productSku,
      quantity: data.quantity,
      estimated_unit_cost: data.estimatedUnitCost,
      total_cost: data.quantity * data.estimatedUnitCost,
      supplier: data.supplier,
      status: 'solicitada',
      requested_by: data.requestedBy,
      created_at: new Date().toISOString(),
    };

    purchases.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
    this.notify();

    const client = getSupabase();
    if (client) {
      client.from('purchase_orders').insert([newOrder]).then();
    }

    return newOrder;
  }

  public receivePurchaseOrder(orderId: string): void {
    const purchases = this.getPurchaseOrders();
    const order = purchases.find((o) => o.id === orderId);
    if (!order) return;

    order.status = 'recibida';
    order.received_at = new Date().toISOString();

    // Incrementar stock del producto
    const products = this.getProducts();
    const prod = products.find((p) => p.id === order.product_id || p.sku === order.product_sku);
    if (prod) {
      prod.current_stock += order.quantity;
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }

    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
    this.notify();

    const client = getSupabase();
    if (client) {
      client.from('purchase_orders').update({
        status: 'recibida',
        received_at: order.received_at,
      }).eq('id', orderId).then();

      if (prod) {
        client.from('products').update({ current_stock: prod.current_stock }).eq('id', prod.id).then();
      }
    }
  }

  // Reiniciar datos a fábrica si el usuario lo solicita
  public resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.COST_CENTERS, JSON.stringify(INITIAL_COST_CENTERS));
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_PROFILES));
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
    localStorage.setItem(STORAGE_KEYS.DELIVERIES, JSON.stringify(INITIAL_DELIVERIES));
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(INITIAL_PURCHASES));
    this.notify();
  }
}

export const store = new WarehouseStore();

