import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import { MatTableModule } from "@angular/material/table";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatDialogModule, MatDialog } from "@angular/material/dialog";
import { MatChipsModule } from "@angular/material/chips";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { MachineService } from "../../services/machine.service";
import { CustomerService } from "../../services/customer.service";
import {
  Machine,
  MachineStatus,
  MachineDetails,
} from "../../models/machine.model";
import { Customer } from "../../models/customer.model";

/**
 * Componente Machines - Gestione del parco macchine
 *
 * Questo componente fornisce una completa gestione delle macchine con:
 * - Tabella paginata con filtri e ricerca
 * - Operazioni CRUD (Create, Read, Update, Delete)
 * - Modal per dettagli macchina con ore di operatività
 * - Filtri per nome e cliente
 * - Indicatori di stato visivi
 * - Integrazione con servizi reattivi
 *
 * Pattern utilizzati:
 * - Reactive Forms per gestione form
 * - Material Table per visualizzazione dati
 * - Dialog per modal e form
 * - Snackbar per feedback utente
 * - Reactive Programming con RxJS
 *
 * Architettura:
 * - Separazione tra logica e presentazione
 * - Gestione errori centralizzata
 * - Validazione form client-side
 * - Feedback utente consistente
 */
@Component({
  selector: "app-machines",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: "./machines.html",
  styleUrl: "./machines.scss",
})
export class MachinesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Dati
  machines: Machine[] = [];
  customers: Customer[] = [];
  filteredMachines: Machine[] = [];
  selectedMachine: MachineDetails | null = null;

  // Stati
  isLoading = true;
  isLoadingDetails = false;
  searchTerm = "";

  // Form
  machineForm!: FormGroup;
  isEditMode = false;
  showForm = false;

  // Configurazione tabella
  displayedColumns: string[] = [
    "name",
    "customer",
    "status",
    "operationalStartDate",
    "totalOperationHours",
    "hasAnomalies",
    "actions",
  ];

  // Enum per template
  MachineStatus = MachineStatus;

  // Gestione dropdown stato
  statusMenuOpen: { [key: string]: boolean } = {};
  availableStatuses = [
    { value: MachineStatus.RUNNING, label: "In Funzione", icon: "play_circle" },
    { value: MachineStatus.STOPPED, label: "Fermata", icon: "pause_circle" },
    { value: MachineStatus.MAINTENANCE, label: "Manutenzione", icon: "build" },
    { value: MachineStatus.ERROR, label: "Errore", icon: "error" },
  ];

  constructor(
    private machineService: MachineService,
    private customerService: CustomerService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadData();
    this.setupClickListener();
  }

  /**
   * Imposta il listener per chiudere i menu quando si clicca fuori
   */
  private setupClickListener(): void {
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".status-dropdown")) {
        // Chiudi tutti i menu se si clicca fuori
        Object.keys(this.statusMenuOpen).forEach((key) => {
          this.statusMenuOpen[key] = false;
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inizializza il form per creazione/modifica macchine
   */
  private initializeForm(): void {
    this.machineForm = this.formBuilder.group({
      name: ["", [Validators.required, Validators.minLength(3)]],
      customerId: ["", Validators.required],
      operationalStartDate: ["", Validators.required],
      totalOperationHours: [0, [Validators.required, Validators.min(0)]],
      status: [MachineStatus.STOPPED, Validators.required],
      hasAnomalies: [false],
      icon: ["precision_manufacturing", Validators.required],
    });
  }

  /**
   * Carica i dati di macchine e clienti
   */
  private loadData(): void {
    this.isLoading = true;

    // Carica macchine
    this.machineService
      .getMachines()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (machines) => {
          this.machines = machines;
          this.filteredMachines = machines;
          this.isLoading = false;
        },
        error: (error) => {
          console.error("Errore caricamento macchine:", error);
          this.showMessage("Errore nel caricamento delle macchine");
          this.isLoading = false;
        },
      });

    // Carica clienti per dropdown
    this.customerService
      .getCustomers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (customers) => {
          this.customers = customers;
        },
        error: (error) => {
          console.error("Errore caricamento clienti:", error);
        },
      });
  }

  /**
   * Filtra le macchine in base al termine di ricerca
   */
  filterMachines(): void {
    if (!this.searchTerm.trim()) {
      this.filteredMachines = this.machines;
      return;
    }

    this.machineService
      .searchMachines(this.searchTerm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (machines) => {
          this.filteredMachines = machines;
        },
        error: (error) => {
          console.error("Errore nella ricerca:", error);
        },
      });
  }

  /**
   * Mostra i dettagli di una macchina
   */
  viewMachineDetails(machineId: string): void {
    this.isLoadingDetails = true;
    this.selectedMachine = null; // Reset per evitare contenuto precedente

    this.machineService
      .getMachineDetails(machineId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (details) => {
          this.selectedMachine = details || null;
          this.isLoadingDetails = false;
        },
        error: (error) => {
          console.error("Errore caricamento dettagli:", error);
          this.showMessage("Errore nel caricamento dei dettagli");
          this.isLoadingDetails = false;
        },
      });
  }

  /**
   * Chiude il modal dei dettagli
   */
  closeDetails(): void {
    this.selectedMachine = null;
    this.isLoadingDetails = false;
  }

  /**
   * Mostra il form per nuova macchina
   */
  showAddForm(): void {
    this.isEditMode = false;
    this.showForm = true;
    this.machineForm.reset();
    this.machineForm.patchValue({
      status: MachineStatus.STOPPED,
      hasAnomalies: false,
      totalOperationHours: 0,
      operationalStartDate: new Date().toISOString().split("T")[0],
      icon: "precision_manufacturing",
    });
  }

  /**
   * Mostra il form per modifica macchina
   */
  showEditForm(machine: Machine): void {
    this.isEditMode = true;
    this.showForm = true;
    this.machineForm.patchValue({
      name: machine.name,
      customerId: machine.customerId,
      operationalStartDate: machine.operationalStartDate
        .toISOString()
        .split("T")[0],
      totalOperationHours: machine.totalOperationHours,
      status: machine.status,
      hasAnomalies: machine.hasAnomalies,
      icon: machine.icon || "precision_manufacturing",
    });
  }

  /**
   * Nasconde il form
   */
  hideForm(): void {
    this.showForm = false;
    this.machineForm.reset();
    // Reimposta l'icona di default
    this.machineForm.patchValue({ icon: "precision_manufacturing" });
  }

  /**
   * Seleziona un'icona per la macchina
   */
  selectIcon(iconName: string): void {
    this.machineForm.patchValue({ icon: iconName });
  }

  /**
   * Salva la macchina (nuova o modificata)
   */
  saveMachine(): void {
    if (this.machineForm.invalid) {
      this.showMessage("Compila tutti i campi richiesti");
      return;
    }

    const formValue = this.machineForm.value;
    const customer = this.customers.find((c) => c.id === formValue.customerId);

    if (!customer) {
      this.showMessage("Cliente non trovato");
      return;
    }

    const machineData = {
      name: formValue.name,
      customerId: formValue.customerId,
      customerName: customer.name,
      operationalStartDate: new Date(formValue.operationalStartDate),
      totalOperationHours: formValue.totalOperationHours,
      status: formValue.status,
      hasAnomalies: formValue.hasAnomalies,
      icon: formValue.icon,
    };

    if (this.isEditMode) {
      // Logica per aggiornamento (richiede ID)
      this.showMessage(
        "Funzionalità di modifica non implementata in questa demo"
      );
    } else {
      // Nuova macchina
      this.machineService
        .addMachine(machineData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (machine) => {
            this.showMessage("Macchina aggiunta con successo");
            this.hideForm();
            this.loadData();
          },
          error: (error) => {
            console.error("Errore salvataggio macchina:", error);
            this.showMessage("Errore nel salvataggio della macchina");
          },
        });
    }
  }

  /**
   * Elimina una macchina
   */
  deleteMachine(machineId: string): void {
    if (confirm("Sei sicuro di voler eliminare questa macchina?")) {
      this.machineService
        .deleteMachine(machineId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            if (success) {
              this.showMessage("Macchina eliminata con successo");
              this.loadData();
            } else {
              this.showMessage("Errore nell'eliminazione della macchina");
            }
          },
          error: (error) => {
            console.error("Errore eliminazione macchina:", error);
            this.showMessage("Errore nell'eliminazione della macchina");
          },
        });
    }
  }

  /**
   * Ottiene l'icona per lo stato della macchina
   */
  getStatusIcon(status: MachineStatus): string {
    const icons = {
      [MachineStatus.RUNNING]: "play_circle",
      [MachineStatus.STOPPED]: "pause_circle",
      [MachineStatus.MAINTENANCE]: "build",
      [MachineStatus.ERROR]: "error",
    };
    return icons[status] || "help";
  }

  /**
   * Ottiene la classe CSS per lo stato della macchina
   */
  getStatusClass(status: MachineStatus): string {
    const classes = {
      [MachineStatus.RUNNING]: "status-running",
      [MachineStatus.STOPPED]: "status-stopped",
      [MachineStatus.MAINTENANCE]: "status-maintenance",
      [MachineStatus.ERROR]: "status-error",
    };
    return classes[status] || "";
  }

  /**
   * Formatta le ore di operatività
   */
  formatHours(hours: number): string {
    if (hours < 1000) {
      return `${Math.round(hours)}h`;
    }
    return `${Math.round((hours / 1000) * 10) / 10}k ore`;
  }

  /**
   * Toggles il menu dropdown per cambiare stato
   */
  toggleStatusMenu(machineId: string): void {
    // Chiudi tutti gli altri menu
    Object.keys(this.statusMenuOpen).forEach((key) => {
      if (key !== machineId) {
        this.statusMenuOpen[key] = false;
      }
    });

    // Toggle il menu corrente
    this.statusMenuOpen[machineId] = !this.statusMenuOpen[machineId];
  }

  /**
   * Cambia lo stato di una macchina
   */
  changeStatus(machineId: string, newStatus: MachineStatus): void {
    // Aggiorna lo stato nell'array locale immediatamente per UX migliore
    const machine = this.machines.find((m) => m.id === machineId);
    if (machine) {
      machine.status = newStatus;
    }

    // Aggiorna anche nell'array filtrato
    const filteredMachine = this.filteredMachines.find(
      (m) => m.id === machineId
    );
    if (filteredMachine) {
      filteredMachine.status = newStatus;
    }

    // Chiudi il menu
    this.statusMenuOpen[machineId] = false;

    // Mostra messaggio di successo
    this.showMessage(
      `Stato macchina aggiornato a: ${this.getStatusLabel(newStatus)}`
    );

    // Nota: In un'applicazione reale, qui faresti una chiamata API
    // this.machineService.updateMachine(machineId, { status: newStatus })
  }

  /**
   * Ottiene la label tradotta per lo stato
   */
  getStatusLabel(status: MachineStatus): string {
    const statusItem = this.availableStatuses.find((s) => s.value === status);
    return statusItem ? statusItem.label : status;
  }

  /**
   * Conta le macchine per stato
   */
  getStatusCount(status: MachineStatus): number {
    return this.filteredMachines.filter((m) => m.status === status).length;
  }

  /**
   * Mostra messaggio all'utente
   */
  private showMessage(message: string): void {
    this.snackBar.open(message, "Chiudi", {
      duration: 3000,
      horizontalPosition: "end",
      verticalPosition: "top",
    });
  }
}
