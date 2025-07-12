/**
 * Interfaccia per rappresentare un cliente
 *
 * Questa interfaccia definisce la struttura dati per i clienti dell'azienda.
 * Include identificativo univoco, informazioni anagrafiche e fiscali.
 *
 * @interface Customer
 * @property {string} id - GUID univoco per identificare il cliente
 * @property {string} name - Nome/Ragione sociale del cliente
 * @property {string} vatNumber - Partita IVA del cliente
 * @property {string} email - Email di contatto (opzionale)
 * @property {string} phone - Telefono di contatto (opzionale)
 * @property {string} address - Indirizzo del cliente (opzionale)
 * @property {Date} createdAt - Data di creazione del cliente
 * @property {Date} updatedAt - Data ultimo aggiornamento
 */
export interface Customer {
  id: string;
  name: string;
  vatNumber: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interfaccia per la creazione di un nuovo cliente
 * Omette i campi auto-generati come ID e timestamp
 *
 * @interface CreateCustomerRequest
 */
export interface CreateCustomerRequest {
  name: string;
  vatNumber: string;
  email?: string;
  phone?: string;
  address?: string;
}

/**
 * Interfaccia per l'aggiornamento di un cliente esistente
 * Tutti i campi sono opzionali tranne l'ID
 *
 * @interface UpdateCustomerRequest
 */
export interface UpdateCustomerRequest {
  id: string;
  name?: string;
  vatNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
}
