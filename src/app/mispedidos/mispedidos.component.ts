import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { MenuComponent } from '../menu/menu.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-mispedidos',
  standalone: true,
  imports: [MenuComponent, CommonModule, HttpClientModule],
  templateUrl: './mispedidos.component.html',
  styleUrls: ['./mispedidos.component.scss']
})
export class MispedidosComponent implements OnInit {
  pedidos: any[] = [];
  pedidoSeleccionado: any = null;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    if (isPlatformBrowser(this.platformId)) {
      const idCliente = localStorage.getItem('idCliente');
  
      if (idCliente) {
        const url = `https://sgfeapi-djdheubvcef3bha2.eastus-01.azurewebsites.net/api/Pedido?idCliente=${idCliente}`;
        this.http.get<any[]>(url).subscribe(
          (data: any[]) => {
            this.pedidos = data;
          },
          (error: any) => {
            console.error('Error al cargar los pedidos:', error);
          }
        );
      } else {
        console.error('No se encontró idCliente en localStorage');
      }
    }
  }
  

  verDetallesPedido(pedido: any): void {
    this.pedidoSeleccionado = pedido;
  }

  cerrarModal(): void {
    this.pedidoSeleccionado = null;
  }

  cancelarPedido(idPedido: number): void {
    const confirmacion = confirm('¿Está seguro de que desea cancelar el pedido?');
  
    if (confirmacion) {
      const url = `https://sgfeapi-djdheubvcef3bha2.eastus-01.azurewebsites.net/api/Pedido/Cancelar/${idPedido}`;          
      this.http.put(url, {}).subscribe(
        (response) => {
          console.log('Pedido cancelado:', response);
          this.cargarPedidos();
        },
        (error) => {
          console.error('Error al cancelar el pedido:', error);
        }
      );
    } else {
      console.log('Cancelación del pedido cancelada por el usuario.');
    }
  }
}