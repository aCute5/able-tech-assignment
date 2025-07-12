import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { delay, map } from "rxjs/operators";
import {
  Machine,
  MachineDetails,
  MachineStatus,
} from "../models/machine.model";

/**
 * Servizio per la gestione delle macchine agricole
 *
 * Questo servizio gestisce tutte le operazioni CRUD per le macchine e fornisce
 * dati mock per simulare un backend. Utilizza BehaviorSubject per mantenere
 * lo stato reattivo e permettere aggiornamenti in tempo reale dell'UI.
 *
 * Pattern utilizzati:
 * - Dependency Injection di Angular
 * - Reactive Programming con RxJS
 * - Observable pattern per la gestione dello stato
 * - Simulazione di chiamate asincrone con delay
 *
 * @injectable
 */
@Injectable({
  providedIn: "root",
})
export class MachineService {
  private machinesSubject = new BehaviorSubject<Machine[]>(
    this.getMockMachines()
  );
  public machines$ = this.machinesSubject.asObservable();

  constructor() {
    // Simulazione di aggiornamenti periodici dello stato macchine
    this.simulateRealTimeUpdates();
  }

  /**
   * Ottiene tutte le macchine
   * @returns Observable<Machine[]>
   */
  getMachines(): Observable<Machine[]> {
    return this.machines$.pipe(delay(300)); // Simula latenza di rete
  }

  /**
   * Ottiene una macchina specifica per ID
   * @param id - ID della macchina
   * @returns Observable<Machine | undefined>
   */
  getMachineById(id: string): Observable<Machine | undefined> {
    return this.machines$.pipe(
      map((machines) => machines.find((m) => m.id === id)),
      delay(200)
    );
  }

  /**
   * Ottiene i dettagli completi di una macchina
   * @param id - ID della macchina
   * @returns Observable<MachineDetails | undefined>
   */
  getMachineDetails(id: string): Observable<MachineDetails | undefined> {
    return this.getMachineById(id).pipe(
      map((machine) => {
        if (!machine) return undefined;

        // Simula dettagli aggiuntivi
        const details: MachineDetails = {
          ...machine,
          serialNumber: `SN-${machine.id.substring(0, 8)}`,
          model: this.getRandomModel(),
          lastMaintenanceDate: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ),
          nextMaintenanceDate: new Date(
            Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000
          ),
          efficiency: Math.round(75 + Math.random() * 25),
        };
        return details;
      })
    );
  }

  /**
   * Cerca macchine per nome o nome cliente
   * @param searchTerm - Termine di ricerca
   * @returns Observable<Machine[]>
   */
  searchMachines(searchTerm: string): Observable<Machine[]> {
    return this.machines$.pipe(
      map((machines) =>
        machines.filter(
          (machine) =>
            machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            machine.customerName
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        )
      ),
      delay(200)
    );
  }

  /**
   * Aggiunge una nuova macchina
   * @param machine - Dati della macchina (senza ID)
   * @returns Observable<Machine>
   */
  addMachine(machine: Omit<Machine, "id">): Observable<Machine> {
    const newMachine: Machine = {
      ...machine,
      id: this.generateGuid(),
    };

    const currentMachines = this.machinesSubject.value;
    this.machinesSubject.next([...currentMachines, newMachine]);

    return of(newMachine).pipe(delay(500));
  }

  /**
   * Aggiorna una macchina esistente
   * @param id - ID della macchina
   * @param updates - Aggiornamenti da applicare
   * @returns Observable<Machine | null>
   */
  updateMachine(
    id: string,
    updates: Partial<Machine>
  ): Observable<Machine | null> {
    const currentMachines = this.machinesSubject.value;
    const index = currentMachines.findIndex((m) => m.id === id);

    if (index === -1) {
      return of(null).pipe(delay(200));
    }

    const updatedMachine = { ...currentMachines[index], ...updates, id };
    const newMachines = [...currentMachines];
    newMachines[index] = updatedMachine;

    this.machinesSubject.next(newMachines);

    return of(updatedMachine).pipe(delay(500));
  }

  /**
   * Elimina una macchina
   * @param id - ID della macchina
   * @returns Observable<boolean>
   */
  deleteMachine(id: string): Observable<boolean> {
    const currentMachines = this.machinesSubject.value;
    const filteredMachines = currentMachines.filter((m) => m.id !== id);

    if (filteredMachines.length === currentMachines.length) {
      return of(false).pipe(delay(200));
    }

    this.machinesSubject.next(filteredMachines);
    return of(true).pipe(delay(500));
  }

  /**
   * Genera dati mock per le macchine
   * @private
   */
  private getMockMachines(): Machine[] {
    return [
      {
        id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        name: "Trattore Autonomo T-5000",
        customerId: "c1",
        customerName: "Azienda Agricola Rossi",
        operationalStartDate: new Date("2023-03-15"),
        totalOperationHours: 1250,
        status: MachineStatus.RUNNING,
        hasAnomalies: false,
      },
      {
        id: "f47ac10b-58cc-4372-a567-0e02b2c3d480",
        name: "Seminatrice Precision SP-200",
        customerId: "c2",
        customerName: "Cooperativa Verde",
        operationalStartDate: new Date("2023-04-20"),
        totalOperationHours: 890,
        status: MachineStatus.STOPPED,
        hasAnomalies: true,
      },
      {
        id: "f47ac10b-58cc-4372-a567-0e02b2c3d481",
        name: "Mietitrebbia Smart MZ-150",
        customerId: "c3",
        customerName: "Fattoria Moderna SRL",
        operationalStartDate: new Date("2023-02-10"),
        totalOperationHours: 1567,
        status: MachineStatus.MAINTENANCE,
        hasAnomalies: false,
      },
      {
        id: "f47ac10b-58cc-4372-a567-0e02b2c3d482",
        name: "Irrigatore Automatico IA-300",
        customerId: "c1",
        customerName: "Azienda Agricola Rossi",
        operationalStartDate: new Date("2023-05-01"),
        totalOperationHours: 2340,
        status: MachineStatus.RUNNING,
        hasAnomalies: false,
      },
      {
        id: "f47ac10b-58cc-4372-a567-0e02b2c3d483",
        name: "Drone Sorveglianza DS-100",
        customerId: "c4",
        customerName: "Agritech Solutions",
        operationalStartDate: new Date("2023-06-15"),
        totalOperationHours: 456,
        status: MachineStatus.ERROR,
        hasAnomalies: true,
      },
    ];
  }

  /**
   * Genera un GUID univoco
   * @private
   */
  private generateGuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  /**
   * Ottiene un modello casuale per i dettagli
   * @private
   */
  private getRandomModel(): string {
    const models = ["AGR-5000", "AGR-3000", "AGR-7000", "AGR-2000", "AGR-4000"];
    return models[Math.floor(Math.random() * models.length)];
  }

  /**
   * Simula aggiornamenti in tempo reale dello stato delle macchine
   * @private
   */
  private simulateRealTimeUpdates(): void {
    setInterval(() => {
      const machines = this.machinesSubject.value;
      const updatedMachines = machines.map((machine) => {
        // Simula cambiamenti casuali nello stato
        if (Math.random() < 0.1) {
          // 10% probabilità di cambiamento
          const newStatus = this.getRandomStatus();
          return {
            ...machine,
            status: newStatus,
            hasAnomalies:
              newStatus === MachineStatus.ERROR || Math.random() < 0.2,
            totalOperationHours:
              machine.status === MachineStatus.RUNNING
                ? machine.totalOperationHours + Math.random() * 2
                : machine.totalOperationHours,
          };
        }
        return machine;
      });

      this.machinesSubject.next(updatedMachines);
    }, 30000); // Aggiorna ogni 30 secondi
  }

  /**
   * Ottiene uno stato casuale per le simulazioni
   * @private
   */
  private getRandomStatus(): MachineStatus {
    const statuses = Object.values(MachineStatus);
    return statuses[Math.floor(Math.random() * statuses.length)];
  }
}
