import { Injectable } from "@angular/core";
import { Observable, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { DashboardStats, MachineStatusStats } from "../models/dashboard.model";
import { MachineStatus } from "../models/machine.model";
import { MachineService } from "./machine.service";
import { CustomerService } from "./customer.service";

/**
 * Servizio per la gestione della dashboard
 *
 * Questo servizio aggrega i dati provenienti da MachineService e CustomerService
 * per fornire statistiche e overview del parco macchine. Utilizza combineLatest
 * per combinare i dati da più fonti e mantenerli sincronizzati.
 *
 * Pattern utilizzati:
 * - Dependency Injection con servizi dipendenti
 * - Reactive Programming con combinazione di Observable
 * - Aggregazione di dati da fonti multiple
 * - Calcolo di statistiche in tempo reale
 * - Trasformazione dei dati per la visualizzazione
 *
 * @injectable
 */
@Injectable({
  providedIn: "root",
})
export class DashboardService {
  constructor(
    private machineService: MachineService,
    private customerService: CustomerService
  ) {}

  /**
   * Ottiene le statistiche aggregate della dashboard
   * @returns Observable<DashboardStats>
   */
  getDashboardStats(): Observable<DashboardStats> {
    return combineLatest([
      this.machineService.getMachines(),
      this.customerService.getCustomers(),
    ]).pipe(
      map(([machines, customers]) => {
        const runningMachines = machines.filter(
          (m) => m.status === MachineStatus.RUNNING
        ).length;
        const machinesWithAnomalies = machines.filter(
          (m) => m.hasAnomalies
        ).length;
        const stoppedMachines = machines.filter(
          (m) => m.status === MachineStatus.STOPPED
        ).length;
        const maintenanceMachines = machines.filter(
          (m) => m.status === MachineStatus.MAINTENANCE
        ).length;

        const totalOperationHours = machines.reduce(
          (sum, machine) => sum + machine.totalOperationHours,
          0
        );

        // Calcolo efficienza media (simulata)
        const averageEfficiency =
          machines.length > 0
            ? Math.round(
                machines.reduce((sum, machine) => {
                  // Simula efficienza basata su stato e anomalie
                  let efficiency = 85; // Base
                  if (machine.status === MachineStatus.RUNNING)
                    efficiency += 10;
                  if (machine.hasAnomalies) efficiency -= 20;
                  if (machine.status === MachineStatus.ERROR) efficiency -= 30;
                  return sum + Math.max(0, Math.min(100, efficiency));
                }, 0) / machines.length
              )
            : 0;

        const stats: DashboardStats = {
          totalMachines: machines.length,
          runningMachines,
          machinesWithAnomalies,
          stoppedMachines,
          maintenanceMachines,
          totalCustomers: customers.length,
          totalOperationHours,
          averageEfficiency,
          lastUpdated: new Date(),
        };

        return stats;
      })
    );
  }

  /**
   * Ottiene le statistiche per stato delle macchine
   * @returns Observable<MachineStatusStats[]>
   */
  getMachineStatusStats(): Observable<MachineStatusStats[]> {
    return this.machineService.getMachines().pipe(
      map((machines) => {
        const statusCounts = machines.reduce((acc, machine) => {
          acc[machine.status] = (acc[machine.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const total = machines.length;
        const statusColors = {
          [MachineStatus.RUNNING]: "#4CAF50",
          [MachineStatus.STOPPED]: "#FF9800",
          [MachineStatus.MAINTENANCE]: "#2196F3",
          [MachineStatus.ERROR]: "#F44336",
        };

        const statusLabels = {
          [MachineStatus.RUNNING]: "In Funzione",
          [MachineStatus.STOPPED]: "Ferme",
          [MachineStatus.MAINTENANCE]: "Manutenzione",
          [MachineStatus.ERROR]: "Errore",
        };

        return Object.entries(statusCounts).map(([status, count]) => ({
          status: statusLabels[status as MachineStatus] || status,
          count: count as number,
          percentage:
            total > 0 ? Math.round(((count as number) / total) * 100) : 0,
          color: statusColors[status as MachineStatus] || "#666666",
        }));
      })
    );
  }

  /**
   * Ottiene le macchine più critiche (con anomalie o errori)
   * @returns Observable<any[]>
   */
  getCriticalMachines(): Observable<any[]> {
    return this.machineService.getMachines().pipe(
      map((machines) =>
        machines
          .filter(
            (machine) =>
              machine.hasAnomalies || machine.status === MachineStatus.ERROR
          )
          .sort((a, b) => {
            // Ordina per criticità: ERROR > anomalie > altri
            if (
              a.status === MachineStatus.ERROR &&
              b.status !== MachineStatus.ERROR
            )
              return -1;
            if (
              b.status === MachineStatus.ERROR &&
              a.status !== MachineStatus.ERROR
            )
              return 1;
            if (a.hasAnomalies && !b.hasAnomalies) return -1;
            if (b.hasAnomalies && !a.hasAnomalies) return 1;
            return 0;
          })
          .slice(0, 5) // Prendi solo le prime 5
          .map((machine) => ({
            id: machine.id,
            name: machine.name,
            customer: machine.customerName,
            status: machine.status,
            hasAnomalies: machine.hasAnomalies,
            criticality:
              machine.status === MachineStatus.ERROR
                ? "Alta"
                : machine.hasAnomalies
                ? "Media"
                : "Bassa",
          }))
      )
    );
  }

  /**
   * Ottiene le macchine con più ore di operatività
   * @returns Observable<any[]>
   */
  getTopPerformingMachines(): Observable<any[]> {
    return this.machineService.getMachines().pipe(
      map((machines) =>
        machines
          .sort((a, b) => b.totalOperationHours - a.totalOperationHours)
          .slice(0, 5)
          .map((machine) => ({
            id: machine.id,
            name: machine.name,
            customer: machine.customerName,
            totalHours: machine.totalOperationHours,
            status: machine.status,
            efficiency: this.calculateMachineEfficiency(machine),
          }))
      )
    );
  }

  /**
   * Ottiene statistiche per cliente
   * @returns Observable<any[]>
   */
  getCustomerStats(): Observable<any[]> {
    return combineLatest([
      this.machineService.getMachines(),
      this.customerService.getCustomers(),
    ]).pipe(
      map(([machines, customers]) => {
        return customers
          .map((customer) => {
            const customerMachines = machines.filter(
              (m) => m.customerId === customer.id
            );
            const runningMachines = customerMachines.filter(
              (m) => m.status === MachineStatus.RUNNING
            ).length;
            const totalHours = customerMachines.reduce(
              (sum, m) => sum + m.totalOperationHours,
              0
            );

            return {
              id: customer.id,
              name: customer.name,
              totalMachines: customerMachines.length,
              runningMachines,
              totalHours,
              hasAnomalies: customerMachines.some((m) => m.hasAnomalies),
            };
          })
          .sort((a, b) => b.totalMachines - a.totalMachines);
      })
    );
  }

  /**
   * Calcola l'efficienza simulata di una macchina
   * @private
   */
  private calculateMachineEfficiency(machine: any): number {
    let efficiency = 85; // Base

    if (machine.status === MachineStatus.RUNNING) efficiency += 10;
    if (machine.hasAnomalies) efficiency -= 20;
    if (machine.status === MachineStatus.ERROR) efficiency -= 30;
    if (machine.status === MachineStatus.MAINTENANCE) efficiency -= 5;

    // Bonus per macchine con molte ore (esperienza)
    if (machine.totalOperationHours > 2000) efficiency += 5;
    if (machine.totalOperationHours > 1000) efficiency += 3;

    return Math.max(0, Math.min(100, efficiency));
  }
}
