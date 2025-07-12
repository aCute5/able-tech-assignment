import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { delay, map } from "rxjs/operators";
import {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "../models/customer.model";

/**
 * Servizio per la gestione dei clienti
 *
 * Questo servizio gestisce tutte le operazioni CRUD per i clienti e fornisce
 * dati mock per simulare un backend. Utilizza BehaviorSubject per mantenere
 * lo stato reattivo e sincronizzato con l'interfaccia utente.
 *
 * Pattern utilizzati:
 * - Dependency Injection di Angular
 * - Reactive Programming con RxJS
 * - Observable pattern per aggiornamenti reattivi
 * - Validazione dei dati in ingresso
 * - Gestione degli errori con observable
 *
 * @injectable
 */
@Injectable({
  providedIn: "root",
})
export class CustomerService {
  private customersSubject = new BehaviorSubject<Customer[]>(
    this.getMockCustomers()
  );
  public customers$ = this.customersSubject.asObservable();

  constructor() {}

  /**
   * Ottiene tutti i clienti
   * @returns Observable<Customer[]>
   */
  getCustomers(): Observable<Customer[]> {
    return this.customers$.pipe(delay(300));
  }

  /**
   * Ottiene un cliente specifico per ID
   * @param id - ID del cliente
   * @returns Observable<Customer | undefined>
   */
  getCustomerById(id: string): Observable<Customer | undefined> {
    return this.customers$.pipe(
      map((customers) => customers.find((c) => c.id === id)),
      delay(200)
    );
  }

  /**
   * Cerca clienti per nome o partita IVA
   * @param searchTerm - Termine di ricerca
   * @returns Observable<Customer[]>
   */
  searchCustomers(searchTerm: string): Observable<Customer[]> {
    return this.customers$.pipe(
      map((customers) =>
        customers.filter(
          (customer) =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.vatNumber.includes(searchTerm)
        )
      ),
      delay(200)
    );
  }

  /**
   * Aggiunge un nuovo cliente
   * @param customerData - Dati del cliente
   * @returns Observable<Customer>
   */
  addCustomer(customerData: CreateCustomerRequest): Observable<Customer> {
    const newCustomer: Customer = {
      ...customerData,
      id: this.generateGuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const currentCustomers = this.customersSubject.value;
    this.customersSubject.next([...currentCustomers, newCustomer]);

    return of(newCustomer).pipe(delay(500));
  }

  /**
   * Aggiorna un cliente esistente
   * @param updateData - Dati di aggiornamento
   * @returns Observable<Customer | null>
   */
  updateCustomer(
    updateData: UpdateCustomerRequest
  ): Observable<Customer | null> {
    const currentCustomers = this.customersSubject.value;
    const index = currentCustomers.findIndex((c) => c.id === updateData.id);

    if (index === -1) {
      return of(null).pipe(delay(200));
    }

    const updatedCustomer: Customer = {
      ...currentCustomers[index],
      ...updateData,
      updatedAt: new Date(),
    };

    const newCustomers = [...currentCustomers];
    newCustomers[index] = updatedCustomer;

    this.customersSubject.next(newCustomers);

    return of(updatedCustomer).pipe(delay(500));
  }

  /**
   * Elimina un cliente
   * @param id - ID del cliente
   * @returns Observable<boolean>
   */
  deleteCustomer(id: string): Observable<boolean> {
    const currentCustomers = this.customersSubject.value;
    const filteredCustomers = currentCustomers.filter((c) => c.id !== id);

    if (filteredCustomers.length === currentCustomers.length) {
      return of(false).pipe(delay(200));
    }

    this.customersSubject.next(filteredCustomers);
    return of(true).pipe(delay(500));
  }

  /**
   * Verifica se una partita IVA è già utilizzata
   * @param vatNumber - Partita IVA da verificare
   * @param excludeId - ID cliente da escludere dal controllo (per aggiornamenti)
   * @returns Observable<boolean>
   */
  isVatNumberTaken(vatNumber: string, excludeId?: string): Observable<boolean> {
    return this.customers$.pipe(
      map((customers) =>
        customers.some(
          (customer) =>
            customer.vatNumber === vatNumber && customer.id !== excludeId
        )
      ),
      delay(200)
    );
  }

  /**
   * Ottiene statistiche sui clienti
   * @returns Observable<{totalCustomers: number, activeCustomers: number}>
   */
  getCustomerStats(): Observable<{
    totalCustomers: number;
    activeCustomers: number;
  }> {
    return this.customers$.pipe(
      map((customers) => ({
        totalCustomers: customers.length,
        activeCustomers: customers.length, // Tutti i clienti sono considerati attivi nei mock
      })),
      delay(100)
    );
  }

  /**
   * Genera dati mock per i clienti
   * @private
   */
  private getMockCustomers(): Customer[] {
    const now = new Date();
    return [
      {
        id: "c1",
        name: "Azienda Agricola Rossi",
        vatNumber: "12345678901",
        email: "info@agricolarossi.it",
        phone: "+39 0123 456789",
        address: "Via dei Campi, 123, 12345 Campagna (CN)",
        createdAt: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        id: "c2",
        name: "Cooperativa Verde",
        vatNumber: "09876543210",
        email: "admin@cooperativaverde.it",
        phone: "+39 0987 654321",
        address: "Piazza della Cooperazione, 5, 54321 Verdonia (TO)",
        createdAt: new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        id: "c3",
        name: "Fattoria Moderna SRL",
        vatNumber: "11223344556",
        email: "contact@fattoriamoderna.it",
        phone: "+39 0111 222333",
        address: "Strada Provinciale 45, 67890 Modernopoli (MI)",
        createdAt: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: "c4",
        name: "Agritech Solutions",
        vatNumber: "99887766554",
        email: "hello@agritech.it",
        phone: "+39 0444 555666",
        address: "Via dell'Innovazione, 10, 13579 Techville (BO)",
        createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: "c5",
        name: "Agricoltura Biologica Bianchi",
        vatNumber: "55443322110",
        email: "bio@bianchi.it",
        phone: "+39 0555 777888",
        address: "Via Naturale, 77, 24680 Biolandia (FI)",
        createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
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
}
