import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { Router } from "@angular/router";

import { DashboardService } from "../../services/dashboard.service";
import { MachineService } from "../../services/machine.service";
import { CustomerService } from "../../services/customer.service";
import { DashboardStats } from "../../models/dashboard.model";
import { Machine } from "../../models/machine.model";
import { Customer } from "../../models/customer.model";

/**
 * Componente Dashboard - Semplificato
 */
@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: "./dashboard.html",
  styleUrls: ["./dashboard.scss"],
})
export class DashboardComponent implements OnInit {
  // Dati della dashboard
  dashboardStats: DashboardStats | null = null;
  machines: Machine[] = [];
  customers: Customer[] = [];
  lastUpdateTime = "";

  constructor(
    private dashboardService: DashboardService,
    private machineService: MachineService,
    private customerService: CustomerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.updateLastUpdateTime();
  }

  /**
   * Carica tutti i dati della dashboard
   */
  async loadDashboardData(): Promise<void> {
    try {
      // Carica statistiche dashboard
      this.dashboardService.getDashboardStats().subscribe({
        next: (stats) => {
          this.dashboardStats = stats;
        },
        error: (error) => {
          console.error("Errore caricamento statistiche:", error);
        },
      });

      // Carica macchine
      this.machineService.getMachines().subscribe({
        next: (machines) => {
          this.machines = machines;
        },
        error: (error) => {
          console.error("Errore caricamento macchine:", error);
        },
      });

      // Carica clienti
      this.customerService.getCustomers().subscribe({
        next: (customers) => {
          this.customers = customers;
        },
        error: (error) => {
          console.error("Errore caricamento clienti:", error);
        },
      });

      this.updateLastUpdateTime();
    } catch (error) {
      console.error("Errore nel caricamento dei dati dashboard:", error);
    }
  }

  /**
   * Chiude la dashboard e naviga verso un'altra pagina
   */
  closeDashboard(): void {
    this.router.navigate(["/machines"]);
  }

  /**
   * Aggiorna timestamp ultimo aggiornamento
   */
  private updateLastUpdateTime(): void {
    const now = new Date();
    this.lastUpdateTime = now.toLocaleString("it-IT");
  }
}
