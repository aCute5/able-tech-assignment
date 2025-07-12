import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { RouterModule } from "@angular/router";

/**
 * Componente principale dell'applicazione
 *
 * Questo componente definisce la struttura base dell'applicazione con:
 * - Header con toolbar Material Design
 * - Side navigation menu con le sezioni principali
 * - Area principale per il contenuto dinamico (router-outlet)
 * - Layout responsive che si adatta a desktop e mobile
 *
 * Design Pattern utilizzati:
 * - Container/Presentation pattern
 * - Material Design per consistenza UI
 * - Responsive layout con Angular Material
 * - Routing per navigazione tra sezioni
 *
 * Layout Structure:
 * - Header fisso in alto
 * - Sidenav a sinistra (collassabile su mobile)
 * - Main content area che occupa lo spazio rimanente
 * - Footer opzionale
 */
@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
  ],
  templateUrl: "./app.html",
  styleUrls: ["./app.scss"],
})
export class AppComponent {
  title = "AgraMachines - Gestione Parco Macchine";

  /**
   * Configurazione del menu di navigazione
   * Ogni item contiene icona, label e route per la navigazione
   */
  menuItems = [
    {
      icon: "dashboard",
      label: "Dashboard",
      route: "/dashboard",
      description: "Overview del parco macchine",
    },
    {
      icon: "settings",
      label: "Macchine",
      route: "/machines",
      description: "Gestione delle macchine",
    },
    {
      icon: "group",
      label: "Clienti",
      route: "/customers",
      description: "Gestione dei clienti",
    },
  ];

  /**
   * Stato della sidebar (aperta/chiusa)
   * Gestita automaticamente da Angular Material Sidenav
   */
  sidenavOpened = true;

  /**
   * Stato del dark mode
   */
  isDarkMode = false;

  constructor() {
    // Carica tema salvato dal localStorage
    const savedTheme = localStorage.getItem("darkMode");
    this.isDarkMode = savedTheme === "true";
    this.applyTheme();
  }

  /**
   * Togola lo stato della sidebar
   * Utilizzato per il pulsante hamburger su mobile
   */
  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  /**
   * Togola il dark mode
   */
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem("darkMode", this.isDarkMode.toString());
    this.applyTheme();
  }

  /**
   * Applica il tema dark/light al body
   */
  private applyTheme(): void {
    const body = document.body;
    if (this.isDarkMode) {
      body.classList.add("dark-theme");
      body.classList.remove("light-theme");
    } else {
      body.classList.add("light-theme");
      body.classList.remove("dark-theme");
    }
  }
}
