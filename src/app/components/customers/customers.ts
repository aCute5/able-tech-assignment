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
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { CustomerService } from "../../services/customer.service";
import {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "../../models/customer.model";

/**
 * Componente Customers - Gestione clienti
 *
 * Questo componente fornisce una completa gestione dei clienti con:
 * - Tabella con elenco clienti
 * - Operazioni CRUD (Create, Read, Update, Delete)
 * - Ricerca per nome o partita IVA
 * - Form di creazione/modifica
 * - Validazione partita IVA
 *
 * Pattern utilizzati:
 * - Reactive Forms per gestione form
 * - Material Table per visualizzazione dati
 * - Snackbar per feedback utente
 * - Reactive Programming con RxJS
 */
@Component({
  selector: "app-customers",
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
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: "./customers.html",
  styleUrl: "./customers.scss",
})
export class CustomersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Dati
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  selectedCustomer: Customer | null = null;

  // Stati
  isLoading = true;
  isLoadingDetails = false;
  searchTerm = "";

  // Form
  customerForm!: FormGroup;
  isEditMode = false;
  showForm = false;
  currentCustomerId: string | null = null;

  // Configurazione tabella
  displayedColumns: string[] = [
    "name",
    "vatNumber",
    "email",
    "phone",
    "createdAt",
    "actions",
  ];

  constructor(
    private customerService: CustomerService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inizializza il form per creazione/modifica clienti
   */
  private initializeForm(): void {
    this.customerForm = this.formBuilder.group({
      name: ["", [Validators.required, Validators.minLength(2)]],
      vatNumber: ["", [Validators.required, Validators.minLength(11)]],
      email: ["", [Validators.email]],
      phone: [""],
      address: [""],
    });
  }

  /**
   * Carica i dati dei clienti
   */
  private loadData(): void {
    this.isLoading = true;

    this.customerService
      .getCustomers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (customers) => {
          this.customers = customers;
          this.filteredCustomers = customers;
          this.isLoading = false;
        },
        error: (error) => {
          console.error("Errore caricamento clienti:", error);
          this.showMessage("Errore nel caricamento dei clienti");
          this.isLoading = false;
        },
      });
  }

  /**
   * Filtra i clienti in base al termine di ricerca
   */
  filterCustomers(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCustomers = this.customers;
      return;
    }

    this.customerService
      .searchCustomers(this.searchTerm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (customers) => {
          this.filteredCustomers = customers;
        },
        error: (error) => {
          console.error("Errore nella ricerca:", error);
        },
      });
  }

  /**
   * Mostra il form per nuovo cliente
   */
  showAddForm(): void {
    this.isEditMode = false;
    this.showForm = true;
    this.currentCustomerId = null;
    this.customerForm.reset();
  }

  /**
   * Mostra il form per modifica cliente
   */
  showEditForm(customer: Customer): void {
    this.isEditMode = true;
    this.showForm = true;
    this.currentCustomerId = customer.id;

    this.customerForm.patchValue({
      name: customer.name,
      vatNumber: customer.vatNumber,
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
    });
  }

  /**
   * Nasconde il form
   */
  hideForm(): void {
    this.showForm = false;
    this.customerForm.reset();
    this.currentCustomerId = null;
  }

  /**
   * Visualizza i dettagli del cliente selezionato
   */
  viewCustomerDetails(customerId: string): void {
    this.isLoadingDetails = true;
    this.selectedCustomer = null;

    this.customerService
      .getCustomerById(customerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (customer) => {
          this.selectedCustomer = customer || null;
          this.isLoadingDetails = false;
        },
        error: (error) => {
          console.error("Errore caricamento dettagli cliente:", error);
          this.showMessage("Errore nel caricamento dei dettagli");
          this.isLoadingDetails = false;
        },
      });
  }

  /**
   * Chiude il modal dei dettagli
   */
  closeDetails(): void {
    this.selectedCustomer = null;
    this.isLoadingDetails = false;
  }

  /**
   * Salva il cliente (nuovo o modificato)
   */
  saveCustomer(): void {
    if (this.customerForm.invalid) {
      this.showMessage("Compila tutti i campi obbligatori");
      return;
    }

    const formValue = this.customerForm.value;

    if (this.isEditMode && this.currentCustomerId) {
      // Modifica cliente esistente
      const updateData: UpdateCustomerRequest = {
        id: this.currentCustomerId,
        name: formValue.name,
        vatNumber: formValue.vatNumber,
        email: formValue.email || undefined,
        phone: formValue.phone || undefined,
        address: formValue.address || undefined,
      };

      this.customerService
        .updateCustomer(updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (customer) => {
            if (customer) {
              this.showMessage("Cliente aggiornato con successo");
              this.hideForm();
              this.loadData();
            } else {
              this.showMessage("Errore nell'aggiornamento del cliente");
            }
          },
          error: (error) => {
            console.error("Errore aggiornamento cliente:", error);
            this.showMessage("Errore nell'aggiornamento del cliente");
          },
        });
    } else {
      // Nuovo cliente
      const customerData: CreateCustomerRequest = {
        name: formValue.name,
        vatNumber: formValue.vatNumber,
        email: formValue.email || undefined,
        phone: formValue.phone || undefined,
        address: formValue.address || undefined,
      };

      this.customerService
        .addCustomer(customerData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (customer) => {
            this.showMessage("Cliente aggiunto con successo");
            this.hideForm();
            this.loadData();
          },
          error: (error) => {
            console.error("Errore salvataggio cliente:", error);
            this.showMessage("Errore nel salvataggio del cliente");
          },
        });
    }
  }

  /**
   * Elimina un cliente
   */
  deleteCustomer(customerId: string): void {
    if (confirm("Sei sicuro di voler eliminare questo cliente?")) {
      this.customerService
        .deleteCustomer(customerId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            if (success) {
              this.showMessage("Cliente eliminato con successo");
              this.loadData();
            } else {
              this.showMessage("Errore nell'eliminazione del cliente");
            }
          },
          error: (error) => {
            console.error("Errore eliminazione cliente:", error);
            this.showMessage("Errore nell'eliminazione del cliente");
          },
        });
    }
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
