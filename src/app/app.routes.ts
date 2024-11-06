import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { RegistroComponent } from './registro/registro.component';
import { MenuPrincipalComponent } from './menuprincipal/menuprincipal.component';
import { ActualizarDatosComponent } from './actualizardatos/actualizardatos.component';
import { MispedidosComponent } from './mispedidos/mispedidos.component';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' }, 
  { path: 'inicio', component: InicioComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'menuprincipal', component: MenuPrincipalComponent },
  { path: 'actualizardatos', component: ActualizarDatosComponent },
  { path: 'mispedidos', component: MispedidosComponent },
  { path: 'menuprincipal', component: MenuPrincipalComponent }
];
