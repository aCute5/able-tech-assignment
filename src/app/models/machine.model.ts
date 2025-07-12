/**
 * Interfaccia per rappresentare una macchina agricola automatizzata
 *
 * Questa interfaccia definisce la struttura dati per le macchine del parco aziendale.
 * Include identificativi univoci, informazioni operative e stato di funzionamento.
 *
 * @interface Machine
 * @property {string} id - GUID univoco per identificare la macchina
 * @property {string} name - Nome descrittivo della macchina
 * @property {string} customerId - ID del cliente proprietario della macchina
 * @property {string} customerName - Nome del cliente per visualizzazione rapida
 * @property {Date} operationalStartDate - Data di inizio operatività
 * @property {number} totalOperationHours - Ore totali di operatività
 * @property {MachineStatus} status - Stato corrente della macchina
 * @property {boolean} hasAnomalies - Flag per anomalie attive
 * @property {string} icon - Icona Material per la visualizzazione
 */
export interface Machine {
  id: string;
  name: string;
  customerId: string;
  customerName: string;
  operationalStartDate: Date;
  totalOperationHours: number;
  status: MachineStatus;
  hasAnomalies: boolean;
  icon?: string;
}

/**
 * Enum per gli stati possibili di una macchina
 *
 * @enum {string}
 */
export enum MachineStatus {
  RUNNING = "running",
  STOPPED = "stopped",
  MAINTENANCE = "maintenance",
  ERROR = "error",
}

/**
 * Interfaccia per i dettagli estesi di una macchina
 * Utilizzata nel modal/sezione dettagli
 *
 * @interface MachineDetails
 * @extends Machine
 */
export interface MachineDetails extends Machine {
  serialNumber: string;
  model: string;
  lastMaintenanceDate: Date;
  nextMaintenanceDate: Date;
  efficiency: number; // Percentuale di efficienza
}
