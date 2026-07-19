export type Role = 'depot' | 'achat' | 'direction' | 'admin'
export type Page = 'dashboard' | 'stocks' | 'commandes' | 'incidents' | 'previsions' | 'fournisseurs' | 'ventes' | 'administration'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
  depotId?: string
  avatar: string
}

export interface Depot {
  id: string
  name: string
  city: string
  region: string
  capacity: number
}

export interface Product {
  id: string
  name: string
  unit: string
  category: string
}

export interface StockEntry {
  depotId: string
  productId: string
  current: number
  capacity: number
  alertThreshold: number
  lastUpdate: string
  daysToStockout: number | null
}

export interface Order {
  id: string
  ref: string
  productId: string
  depotId: string
  supplierId: string
  quantity: number
  status: 'brouillon' | 'envoyee' | 'approuvee' | 'en_transit' | 'livree' | 'annulee'
  createdAt: string
  expectedAt: string
  createdBy: string
  amountFCFA: number
  note?: string
}

export interface Incident {
  id: string
  ref: string
  depotId: string
  type: string
  severity: 'faible' | 'modere' | 'eleve' | 'critique'
  description: string
  date: string
  costFCFA: number
  status: 'ouvert' | 'en_cours' | 'resolu'
}

export interface Supplier {
  id: string
  name: string
  country: string
  products: string[]
  reliabilityScore: number
  contact: string
  email: string
  deliveries: number
  onTimeRate: number
}

export interface SaleRecord {
  id: string
  ref: string
  client: string
  clientType: 'industrie' | 'distribution' | 'transport' | 'agriculture' | 'aviation'
  productId: string
  depotId: string
  quantity: number
  amountFCFA: number
  date: string
  status: 'payee' | 'en_attente' | 'retard'
}

export interface SystemUser {
  id: string
  name: string
  email: string
  role: Role
  depotId?: string
  active: boolean
  lastLogin: string
  avatar: string
}

// ─── REFERENCE DATA ───────────────────────────────────────────────────────────

export const DEPOTS: Depot[] = [
  { id: 'D1', name: 'Dépôt Lomé', city: 'Lomé', region: 'Maritime', capacity: 5_000_000 },
  { id: 'D2', name: 'Dépôt Kara', city: 'Kara', region: 'Kara', capacity: 1_500_000 },
  { id: 'D3', name: 'Dépôt Sokodé', city: 'Sokodé', region: 'Centrale', capacity: 1_200_000 },
  { id: 'D4', name: 'Dépôt Atakpamé', city: 'Atakpamé', region: 'Plateaux', capacity: 1_000_000 },
  { id: 'D5', name: 'Dépôt Kpalimé', city: 'Kpalimé', region: 'Plateaux', capacity: 800_000 },
  { id: 'D6', name: 'Dépôt Tsévié', city: 'Tsévié', region: 'Maritime', capacity: 600_000 },
  { id: 'D7', name: 'Dépôt Dapaong', city: 'Dapaong', region: 'Savanes', capacity: 700_000 },
  { id: 'D8', name: 'Dépôt Notsé', city: 'Notsé', region: 'Plateaux', capacity: 500_000 },
]

export const PRODUCTS: Product[] = [
  { id: 'P1', name: 'Gasoil', unit: 'L', category: 'Carburant' },
  { id: 'P2', name: 'Essence Super', unit: 'L', category: 'Carburant' },
  { id: 'P3', name: 'Essence Ordinaire', unit: 'L', category: 'Carburant' },
  { id: 'P4', name: 'Kérosène', unit: 'L', category: 'Carburant' },
  { id: 'P5', name: 'Fuel Lourd', unit: 'L', category: 'Combustible' },
  { id: 'P6', name: 'GPL', unit: 'kg', category: 'Gaz' },
  { id: 'P7', name: 'Jet A-1', unit: 'L', category: 'Aviation' },
  { id: 'P8', name: 'Lubrifiant', unit: 'L', category: 'Lubrifiant' },
  { id: 'P9', name: 'Bitume', unit: 'T', category: 'Bitume' },
  { id: 'P10', name: 'Fioul Domestique', unit: 'L', category: 'Combustible' },
  { id: 'P11', name: 'Naphta', unit: 'L', category: 'Chimique' },
]

export const SUPPLIERS: Supplier[] = [
  { id: 'S1', name: 'PetroCI', country: "Côte d'Ivoire", products: ['P1','P2','P3'], reliabilityScore: 94, contact: '+225 07 01 23 45', email: 'orders@petroci.ci', deliveries: 142, onTimeRate: 91 },
  { id: 'S2', name: 'TotalEnergies Togo', country: 'Togo', products: ['P1','P2','P3','P7'], reliabilityScore: 97, contact: '+228 22 21 61 71', email: 'supply@totalenergies.tg', deliveries: 198, onTimeRate: 96 },
  { id: 'S3', name: 'SOCO International', country: 'Congo', products: ['P5','P10','P11'], reliabilityScore: 82, contact: '+242 06 123 4567', email: 'trade@soco-intl.com', deliveries: 67, onTimeRate: 79 },
  { id: 'S4', name: 'SONABHY', country: 'Burkina Faso', products: ['P1','P4','P6'], reliabilityScore: 89, contact: '+226 25 30 62 01', email: 'approvisionnement@sonabhy.bf', deliveries: 88, onTimeRate: 85 },
  { id: 'S5', name: 'OiLibya Togo', country: 'Togo', products: ['P2','P3','P8'], reliabilityScore: 91, contact: '+228 22 20 52 13', email: 'supply@oilibya.tg', deliveries: 115, onTimeRate: 90 },
  { id: 'S6', name: 'Oryx Energy', country: 'Suisse', products: ['P7','P9','P11'], reliabilityScore: 93, contact: '+41 22 312 45 67', email: 'logistics@oryxenergy.com', deliveries: 34, onTimeRate: 94 },
]

export const DEMO_USERS: Record<Role, AuthUser> = {
  depot: { id: 'U1', name: 'Kwame Asante', email: 'k.asante@petrostock.tg', role: 'depot', depotId: 'D1', avatar: 'KA' },
  achat: { id: 'U4', name: 'Yawa Dossou', email: 'y.dossou@petrostock.tg', role: 'achat', avatar: 'YD' },
  direction: { id: 'U6', name: 'Dr. Sena Koffi', email: 's.koffi@petrostock.tg', role: 'direction', avatar: 'SK' },
  admin: { id: 'U8', name: 'Admin Système', email: 'admin@petrostock.tg', role: 'admin', avatar: 'AS' },
}

export const DEMO_CREDS: Record<Role, { email: string; pass: string }> = {
  depot:     { email: 'k.asante@petrostock.tg', pass: 'depot2024' },
  achat:     { email: 'y.dossou@petrostock.tg', pass: 'achat2024' },
  direction: { email: 's.koffi@petrostock.tg',  pass: 'dir2024' },
  admin:     { email: 'admin@petrostock.tg',     pass: 'admin2024' },
}

export const SYSTEM_USERS: SystemUser[] = [
  { id: 'U1', name: 'Kwame Asante', email: 'k.asante@petrostock.tg', role: 'depot', depotId: 'D1', active: true, lastLogin: '2024-07-19 08:12', avatar: 'KA' },
  { id: 'U2', name: 'Afi Mensah', email: 'a.mensah@petrostock.tg', role: 'depot', depotId: 'D2', active: true, lastLogin: '2024-07-19 07:45', avatar: 'AM' },
  { id: 'U3', name: 'Kofi Agbeko', email: 'k.agbeko@petrostock.tg', role: 'depot', depotId: 'D3', active: true, lastLogin: '2024-07-18 16:30', avatar: 'KA' },
  { id: 'U9', name: 'Essi Lawson', email: 'e.lawson@petrostock.tg', role: 'depot', depotId: 'D4', active: true, lastLogin: '2024-07-18 14:55', avatar: 'EL' },
  { id: 'U10', name: 'Brice Amoussou', email: 'b.amoussou@petrostock.tg', role: 'depot', depotId: 'D5', active: false, lastLogin: '2024-07-12 09:00', avatar: 'BA' },
  { id: 'U4', name: 'Yawa Dossou', email: 'y.dossou@petrostock.tg', role: 'achat', active: true, lastLogin: '2024-07-19 09:05', avatar: 'YD' },
  { id: 'U5', name: 'Mawuli Tagba', email: 'm.tagba@petrostock.tg', role: 'achat', active: true, lastLogin: '2024-07-19 08:50', avatar: 'MT' },
  { id: 'U6', name: 'Dr. Sena Koffi', email: 's.koffi@petrostock.tg', role: 'direction', active: true, lastLogin: '2024-07-19 10:00', avatar: 'SK' },
  { id: 'U7', name: 'Ama Bediako', email: 'a.bediako@petrostock.tg', role: 'direction', active: true, lastLogin: '2024-07-18 14:20', avatar: 'AB' },
  { id: 'U8', name: 'Admin Système', email: 'admin@petrostock.tg', role: 'admin', active: true, lastLogin: '2024-07-19 06:00', avatar: 'AS' },
]

// ─── STOCKS ──────────────────────────────────────────────────────────────────

export const STOCKS: StockEntry[] = [
  // Lomé
  { depotId:'D1', productId:'P1', current:1_840_000, capacity:2_000_000, alertThreshold:400_000, lastUpdate:'2024-07-19 06:00', daysToStockout:29 },
  { depotId:'D1', productId:'P2', current:620_000, capacity:800_000, alertThreshold:160_000, lastUpdate:'2024-07-19 06:00', daysToStockout:21 },
  { depotId:'D1', productId:'P3', current:95_000, capacity:400_000, alertThreshold:80_000, lastUpdate:'2024-07-19 06:00', daysToStockout:4 },
  { depotId:'D1', productId:'P7', current:210_000, capacity:300_000, alertThreshold:60_000, lastUpdate:'2024-07-19 06:00', daysToStockout:18 },
  // Kara — stock bas sur gasoil
  { depotId:'D2', productId:'P1', current:87_000, capacity:500_000, alertThreshold:100_000, lastUpdate:'2024-07-19 06:00', daysToStockout:5 },
  { depotId:'D2', productId:'P2', current:215_000, capacity:300_000, alertThreshold:60_000, lastUpdate:'2024-07-19 06:00', daysToStockout:14 },
  { depotId:'D2', productId:'P3', current:58_000, capacity:150_000, alertThreshold:30_000, lastUpdate:'2024-07-19 06:00', daysToStockout:9 },
  { depotId:'D2', productId:'P6', current:18_500, capacity:80_000, alertThreshold:16_000, lastUpdate:'2024-07-19 06:00', daysToStockout:7 },
  // Sokodé
  { depotId:'D3', productId:'P1', current:320_000, capacity:500_000, alertThreshold:100_000, lastUpdate:'2024-07-19 06:00', daysToStockout:16 },
  { depotId:'D3', productId:'P2', current:105_000, capacity:200_000, alertThreshold:40_000, lastUpdate:'2024-07-19 06:00', daysToStockout:11 },
  { depotId:'D3', productId:'P4', current:42_000, capacity:100_000, alertThreshold:20_000, lastUpdate:'2024-07-19 06:00', daysToStockout:13 },
  // Atakpamé
  { depotId:'D4', productId:'P1', current:210_000, capacity:400_000, alertThreshold:80_000, lastUpdate:'2024-07-19 06:00', daysToStockout:12 },
  { depotId:'D4', productId:'P2', current:28_000, capacity:150_000, alertThreshold:30_000, lastUpdate:'2024-07-19 06:00', daysToStockout:3 },
  { depotId:'D4', productId:'P5', current:65_000, capacity:200_000, alertThreshold:40_000, lastUpdate:'2024-07-19 06:00', daysToStockout:10 },
  // Kpalimé
  { depotId:'D5', productId:'P1', current:180_000, capacity:300_000, alertThreshold:60_000, lastUpdate:'2024-07-19 06:00', daysToStockout:15 },
  { depotId:'D5', productId:'P3', current:22_000, capacity:100_000, alertThreshold:20_000, lastUpdate:'2024-07-19 06:00', daysToStockout:2 },
  // Tsévié
  { depotId:'D6', productId:'P1', current:230_000, capacity:300_000, alertThreshold:60_000, lastUpdate:'2024-07-19 06:00', daysToStockout:19 },
  { depotId:'D6', productId:'P2', current:92_000, capacity:150_000, alertThreshold:30_000, lastUpdate:'2024-07-19 06:00', daysToStockout:13 },
  // Dapaong
  { depotId:'D7', productId:'P1', current:62_000, capacity:300_000, alertThreshold:60_000, lastUpdate:'2024-07-19 06:00', daysToStockout:6 },
  { depotId:'D7', productId:'P4', current:14_000, capacity:100_000, alertThreshold:20_000, lastUpdate:'2024-07-19 06:00', daysToStockout:4 },
  // Notsé
  { depotId:'D8', productId:'P1', current:195_000, capacity:250_000, alertThreshold:50_000, lastUpdate:'2024-07-19 06:00', daysToStockout:17 },
  { depotId:'D8', productId:'P2', current:78_000, capacity:100_000, alertThreshold:20_000, lastUpdate:'2024-07-19 06:00', daysToStockout:12 },
]

export const ORDERS: Order[] = [
  { id:'O1', ref:'BC-2024-0741', productId:'P1', depotId:'D2', supplierId:'S1', quantity:300_000, status:'approuvee', createdAt:'2024-07-17', expectedAt:'2024-07-22', createdBy:'U2', amountFCFA:159_000_000 },
  { id:'O2', ref:'BC-2024-0742', productId:'P3', depotId:'D1', supplierId:'S5', quantity:200_000, status:'en_transit', createdAt:'2024-07-15', expectedAt:'2024-07-20', createdBy:'U1', amountFCFA:88_000_000 },
  { id:'O3', ref:'BC-2024-0743', productId:'P2', depotId:'D4', supplierId:'S2', quantity:100_000, status:'envoyee', createdAt:'2024-07-18', expectedAt:'2024-07-25', createdBy:'U9', amountFCFA:67_000_000 },
  { id:'O4', ref:'BC-2024-0744', productId:'P1', depotId:'D7', supplierId:'S4', quantity:200_000, status:'envoyee', createdAt:'2024-07-18', expectedAt:'2024-07-24', createdBy:'U4', amountFCFA:106_000_000 },
  { id:'O5', ref:'BC-2024-0745', productId:'P6', depotId:'D2', supplierId:'S4', quantity:20_000, status:'brouillon', createdAt:'2024-07-19', expectedAt:'2024-07-26', createdBy:'U2', amountFCFA:14_000_000 },
  { id:'O6', ref:'BC-2024-0746', productId:'P3', depotId:'D5', supplierId:'S5', quantity:80_000, status:'brouillon', createdAt:'2024-07-19', expectedAt:'2024-07-27', createdBy:'U1', amountFCFA:35_200_000 },
  { id:'O7', ref:'BC-2024-0737', productId:'P1', depotId:'D1', supplierId:'S2', quantity:500_000, status:'livree', createdAt:'2024-07-10', expectedAt:'2024-07-16', createdBy:'U1', amountFCFA:265_000_000 },
  { id:'O8', ref:'BC-2024-0738', productId:'P7', depotId:'D1', supplierId:'S6', quantity:50_000, status:'livree', createdAt:'2024-07-08', expectedAt:'2024-07-14', createdBy:'U4', amountFCFA:82_500_000 },
  { id:'O9', ref:'BC-2024-0739', productId:'P4', depotId:'D7', supplierId:'S4', quantity:60_000, status:'annulee', createdAt:'2024-07-12', expectedAt:'2024-07-19', createdBy:'U4', amountFCFA:30_000_000 },
]

export const INCIDENTS: Incident[] = [
  { id:'I1', ref:'INC-2024-0158', depotId:'D2', type:'Fuite de canalisation', severity:'eleve', description:'Fuite détectée sur la conduite principale de Gasoil — section nord. Arrêt de pompage immédiat.', date:'2024-07-17 14:32', costFCFA:4_200_000, status:'en_cours' },
  { id:'I2', ref:'INC-2024-0157', depotId:'D4', type:'Erreur de saisie', severity:'modere', description:'Écart de 12 000 L entre stock physique et système pour Essence Super. Audit en cours.', date:'2024-07-16 09:10', costFCFA:0, status:'en_cours' },
  { id:'I3', ref:'INC-2024-0156', depotId:'D7', type:'Panne équipement', severity:'critique', description:'Défaillance de la pompe principale n°2. Dépôt en fonctionnement dégradé sur pompe de secours.', date:'2024-07-15 06:45', costFCFA:8_750_000, status:'ouvert' },
  { id:'I4', ref:'INC-2024-0155', depotId:'D1', type:'Incident sécurité', severity:'faible', description:'Déversement mineur lors du remplissage citerne camion C-42. Nettoyage effectué.', date:'2024-07-14 11:20', costFCFA:150_000, status:'resolu' },
  { id:'I5', ref:'INC-2024-0154', depotId:'D3', type:'Accès non autorisé', severity:'modere', description:'Tentative d\'accès zone restreinte enregistrée à 03h12. Rapport sécurité transmis.', date:'2024-07-13 03:12', costFCFA:0, status:'resolu' },
  { id:'I6', ref:'INC-2024-0153', depotId:'D5', type:'Fuite de canalisation', severity:'eleve', description:'Microfuite sur joint vanne V-07. Remplacement préventif programmé.', date:'2024-07-12 16:00', costFCFA:1_800_000, status:'resolu' },
  { id:'I7', ref:'INC-2024-0152', depotId:'D2', type:'Panne équipement', severity:'faible', description:'Capteur de niveau citerne 3 hors service. Relevé manuel en attendant remplacement.', date:'2024-07-11 08:30', costFCFA:420_000, status:'resolu' },
  { id:'I8', ref:'INC-2024-0151', depotId:'D1', type:'Anomalie stock IA', severity:'modere', description:'Modèle Isolation Forest détecte z-score de 3.8 sur sortie nocturne de 80 000 L Gasoil.', date:'2024-07-10 02:15', costFCFA:0, status:'en_cours' },
]

export const SALES: SaleRecord[] = [
  { id:'V1', ref:'FAC-2024-3421', client:'CIMTOGO SA', clientType:'industrie', productId:'P1', depotId:'D1', quantity:120_000, amountFCFA:63_600_000, date:'2024-07-18', status:'payee' },
  { id:'V2', ref:'FAC-2024-3420', client:'TOGOTRANS SARL', clientType:'transport', productId:'P1', depotId:'D3', quantity:85_000, amountFCFA:45_050_000, date:'2024-07-18', status:'payee' },
  { id:'V3', ref:'FAC-2024-3419', client:'AGRI-TOGO', clientType:'agriculture', productId:'P3', depotId:'D4', quantity:42_000, amountFCFA:18_480_000, date:'2024-07-17', status:'en_attente' },
  { id:'V4', ref:'FAC-2024-3418', client:'AIR TOGO', clientType:'aviation', productId:'P7', depotId:'D1', quantity:30_000, amountFCFA:49_500_000, date:'2024-07-17', status:'payee' },
  { id:'V5', ref:'FAC-2024-3417', client:'TOTAL DIST.', clientType:'distribution', productId:'P2', depotId:'D1', quantity:65_000, amountFCFA:43_550_000, date:'2024-07-16', status:'retard' },
  { id:'V6', ref:'FAC-2024-3416', client:'LOMÉ PORT', clientType:'industrie', productId:'P5', depotId:'D1', quantity:200_000, amountFCFA:74_000_000, date:'2024-07-16', status:'payee' },
  { id:'V7', ref:'FAC-2024-3415', client:'BRASSERIE BB', clientType:'industrie', productId:'P10', depotId:'D1', quantity:18_000, amountFCFA:9_720_000, date:'2024-07-15', status:'payee' },
  { id:'V8', ref:'FAC-2024-3414', client:'KARA BTP', clientType:'industrie', productId:'P1', depotId:'D2', quantity:55_000, amountFCFA:29_150_000, date:'2024-07-15', status:'en_attente' },
  { id:'V9', ref:'FAC-2024-3413', client:'SONAPH', clientType:'industrie', productId:'P9', depotId:'D1', quantity:150, amountFCFA:22_500_000, date:'2024-07-14', status:'payee' },
  { id:'V10', ref:'FAC-2024-3412', client:'DAPAONG RURAL', clientType:'agriculture', productId:'P4', depotId:'D7', quantity:12_000, amountFCFA:7_200_000, date:'2024-07-13', status:'retard' },
]

// ─── CHART DATA ───────────────────────────────────────────────────────────────

export const STOCK_HISTORY_30D = Array.from({ length: 30 }, (_, i) => {
  const d = new Date('2024-06-20')
  d.setDate(d.getDate() + i)
  const label = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  const gasoil = 2_000_000 - i * 8_000 + Math.sin(i * 0.5) * 40_000
  const essence = 800_000 - i * 3_000 + Math.sin(i * 0.7) * 20_000
  const kerosene = 120_000 - i * 500 + Math.sin(i * 0.3) * 5_000
  return { label, gasoil: Math.round(gasoil), essence: Math.round(essence), kerosene: Math.round(kerosene) }
})

export const MONTHLY_REVENUE = [
  { month: 'Jan', revenue: 1_842, orders: 38 },
  { month: 'Fév', revenue: 1_620, orders: 32 },
  { month: 'Mar', revenue: 2_105, orders: 44 },
  { month: 'Avr', revenue: 1_980, orders: 41 },
  { month: 'Mai', revenue: 2_340, orders: 51 },
  { month: 'Jui', revenue: 2_180, orders: 47 },
  { month: 'Jul', revenue: 1_760, orders: 38 },
]

export const DEMAND_FORECAST = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  label: `J+${i + 1}`,
  predicted: Math.round(68_000 - i * 400 + Math.sin(i * 0.6) * 5_000),
  lower: Math.round(62_000 - i * 400 + Math.sin(i * 0.6) * 3_000),
  upper: Math.round(74_000 - i * 400 + Math.sin(i * 0.6) * 7_000),
}))

export const DEPOT_FILL_RATES = DEPOTS.map(depot => {
  const depotStocks = STOCKS.filter(s => s.depotId === depot.id)
  const totalCurrent = depotStocks.reduce((acc, s) => acc + s.current, 0)
  const totalCapacity = depotStocks.reduce((acc, s) => acc + s.capacity, 0)
  const rate = totalCapacity > 0 ? Math.round((totalCurrent / totalCapacity) * 100) : 0
  return { name: depot.city, rate, city: depot.city }
})

export const INCIDENT_BY_SEVERITY = [
  { name: 'Faible', count: 12, fill: '#38a169' },
  { name: 'Modéré', count: 18, fill: '#e8a020' },
  { name: 'Élevé', count: 7, fill: '#dd6b20' },
  { name: 'Critique', count: 3, fill: '#e53e3e' },
]

// ─── ROLE CONFIG ──────────────────────────────────────────────────────────────

export const ROLE_PAGES: Record<Role, Page[]> = {
  depot: ['dashboard', 'stocks', 'commandes', 'incidents', 'previsions'],
  achat: ['dashboard', 'commandes', 'fournisseurs', 'previsions'],
  direction: ['dashboard', 'stocks', 'ventes', 'previsions', 'incidents', 'fournisseurs'],
  admin: ['dashboard', 'administration'],
}

export const ROLE_LABELS: Record<Role, string> = {
  depot: 'Responsable Dépôt',
  achat: 'Responsable Achat',
  direction: 'Direction',
  admin: 'Administrateur',
}

export const ROLE_COLORS: Record<Role, string> = {
  depot: '#3b82f6',
  achat: '#8b5cf6',
  direction: '#e8a020',
  admin: '#e53e3e',
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export const fmt = {
  litres: (n: number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(2)} ML` : n >= 1_000 ? `${(n/1_000).toFixed(0)} kL` : `${n} L`,
  fcfa: (n: number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)} M FCFA` : `${(n/1_000).toFixed(0)} k FCFA`,
  pct: (n: number) => `${n}%`,
}

export function getStockAlert(entry: StockEntry): 'critical' | 'warning' | 'ok' {
  const rate = entry.current / entry.capacity
  if (entry.current <= entry.alertThreshold || (entry.daysToStockout !== null && entry.daysToStockout <= 5)) return 'critical'
  if (rate < 0.3 || (entry.daysToStockout !== null && entry.daysToStockout <= 10)) return 'warning'
  return 'ok'
}

export function getProductName(id: string): string {
  return PRODUCTS.find(p => p.id === id)?.name ?? id
}

export function getDepotName(id: string): string {
  return DEPOTS.find(d => d.id === id)?.name ?? id
}

export function getSupplierName(id: string): string {
  return SUPPLIERS.find(s => s.id === id)?.name ?? id
}

export function getProductUnitPrice(productId: string): number {
  const priceByProduct: Record<string, number> = {
    P1: 530,
    P2: 650,
    P3: 620,
    P4: 480,
    P5: 560,
    P6: 900,
    P7: 1500,
    P8: 800,
    P9: 1200,
    P10: 540,
    P11: 950,
  }
  return priceByProduct[productId] ?? 530
}

export function getSupplierRecommendationScore(supplier: Supplier, productId: string): number {
  const availabilityBonus = supplier.products.includes(productId) ? 100 : 60
  return Math.round(0.5 * supplier.reliabilityScore + 0.3 * supplier.onTimeRate + 0.2 * availabilityBonus)
}
