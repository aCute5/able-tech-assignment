import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/dashboard",
    pathMatch: "full",
  },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./components/dashboard/dashboard").then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: "machines",
    loadComponent: () =>
      import("./components/machines/machines").then((m) => m.MachinesComponent),
  },
  {
    path: "customers",
    loadComponent: () =>
      import("./components/customers/customers").then(
        (m) => m.CustomersComponent
      ),
  },
  {
    path: "**",
    redirectTo: "/dashboard",
  },
];
