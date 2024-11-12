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
  mostrarModalConfirmacion = false;
  mostrarMensajeExito = false;
  mostrarErrorModal = false;
  mensajeExito: string = '';
  mensajeError: string = '';
  
  pedidoParaCancelar: number | null = null;

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
            this.pedidos = data.sort((a, b) => b.IdPedido - a.IdPedido);
          },
          (error: any) => {
            this.mensajeError = 'Error al cargar los pedidos';
            console.error('Error al cargar los pedidos:', error);
          }
        );
      } else {
        this.mensajeError = 'Ocurrió un error,  intentalo de nuevo';
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

  confirmarCancelacion(idPedido: number): void {
    this.pedidoParaCancelar = idPedido;
    this.mostrarModalConfirmacion = true;
  }

  cancelarEliminacion(): void {
    this.mensajeExito = 'No se canceló el pedido';
    this.mostrarMensajeExito= true;
  
    this.cerrarModalConfirmacion();
    setTimeout(() => {
      this.cerrarModalExito();
    }, 2000);
  }

  cancelarPedido(): void {
    if (this.pedidoParaCancelar) {
      const url = `https://sgfeapi-djdheubvcef3bha2.eastus-01.azurewebsites.net/api/Pedido/Cancelar/${this.pedidoParaCancelar}`;          
      this.http.put(url, {}).subscribe(
        (response) => {
          this.mensajeExito = 'Pedido cancelado con éxito';
          this.mostrarMensajeExito = true;
          if (this.pedidoParaCancelar !== null) {
            this.regresarStockDeProductos(this.pedidoParaCancelar);
          }
          this.cargarPedidos();
          this.cerrarModalConfirmacion();
        },
        (error) => {
          this.mensajeError = 'Error al cancelar el pedido';
          this.mostrarErrorModal = true;
          this.cerrarModalConfirmacion();
        }
      );
    }
  }

  cerrarModalExito(): void {
    this.mostrarMensajeExito = false;
  }

  cerrarModalError(): void {
    this.mostrarErrorModal = false;
  }

  cerrarModalConfirmacion(): void {
    this.mostrarModalConfirmacion = false;
    this.pedidoParaCancelar = null;
  }

  regresarStockDeProductos(idPedido: number): void {
    const urlPedido = `https://sgfeapi-djdheubvcef3bha2.eastus-01.azurewebsites.net/api/Pedido/BuscarDetalle?id=${idPedido}`;
    

    this.http.get<any>(urlPedido).subscribe(
      (pedido: any) => {

        const promesas = pedido.Productos.map((producto: any) => {
          const urlRegresarStock = `https://sgfeapi-djdheubvcef3bha2.eastus-01.azurewebsites.net/api/Producto/restarstock?idProducto=${producto.IdProducto}&cantidad=${-producto.Cantidad}`;
          return this.http.put(urlRegresarStock, {}).toPromise();
        });

        Promise.all(promesas).then(() => {
          console.log('Stock regresado correctamente para todos los productos.');
        }).catch((error) => {
          console.error('Error al regresar el stock de los productos:', error);
        });
      },
      (error) => {
        console.error('Error al obtener los detalles del pedido:', error);
      }
    );
  }
}
