/**
 * Interfaccia per rappresentare le statistiche della dashboard
 *
 * Questa interfaccia definisce la struttura dati per l'overview del parco macchine.
 * Include contatori e statistiche aggregate per fornire una visione d'insieme.
 *
 * @interface DashboardStats
 * @property {number} totalMachines - Numero totale di macchine nel parco
 * @property {number} runningMachines - Numero di macchine attualmente in funzione
 * @property {number} machinesWithAnomalies - Numero di macchine con anomalie attive
 * @property {number} stoppedMachines - Numero di macchine ferme
 * @property {number} maintenanceMachines - Numero di macchine in manutenzione
 * @property {number} totalCustomers - Numero totale di clienti
 * @property {number} totalOperationHours - Ore totali di operatività del parco
 * @property {number} averageEfficiency - Efficienza media del parco (0-100)
 * @property {Date} lastUpdated - Timestamp ultimo aggiornamento dati
 */
export interface DashboardStats {
  totalMachines: number;
  runningMachines: number;
  machinesWithAnomalies: number;
  stoppedMachines: number;
  maintenanceMachines: number;
  totalCustomers: number;
  totalOperationHours: number;
  averageEfficiency: number;
  lastUpdated: Date;
}

/**
 * Interfaccia per le statistiche per stato macchina
 * Utilizzata per i grafici e visualizzazioni
 *
 * @interface MachineStatusStats
 */
export interface MachineStatusStats {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

/**
 * Interfaccia per le statistiche temporali
 * Utilizzata per grafici di trend
 *
 * @interface TimeSeriesData
 */
export interface TimeSeriesData {
  date: Date;
  runningMachines: number;
  anomalies: number;
  totalHours: number;
}
