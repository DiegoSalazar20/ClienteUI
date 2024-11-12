import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

interface ItemCarrito {
  idCliente: number;
  idProducto: number;
  cantidad: number;
  producto: {
    idProducto: number;
    nombre_Producto: string;
    descripcion: string;
    imagen: string;
    precio: number;
    cantidad_Stock: number;
    estado: boolean;
  };
}

interface ProductoPedido {
  idProducto: number;
  cantidad: number;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  mostrarCarrito: boolean = false;
  detallesCarrito: ItemCarrito[] = [];
  estaAutenticado: boolean = false;
  mostrarModalEliminar: boolean = false;
  productoEliminar: ItemCarrito | null = null;
  mostrarMensaje: boolean = false;
  mensaje: string = '';
  mostrarModalConfirmacion: boolean = false;
  mostrarErrorModal: boolean = false;
  mensajeError: string = '';

  mensajeCancelado: String = '';


  constructor(private router: Router, private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) { 
    this.verificarSesion(); 
  }

  mostrarError(mensaje: string): void {
    this.mensajeError = mensaje;
    this.mostrarErrorModal = true;
  }

  cerrarModalError(): void {
    this.mostrarErrorModal = false;
  }
  cerrarModalConfirmacion(): void {
    this.mostrarModalConfirmacion = false; 
  }

  eliminarDelCarrito(item: ItemCarrito): void {
    this.productoEliminar = item;
    this.mostrarModalEliminar = true;
  }
  
  cerrarModalEliminar(): void {
    this.mostrarModalEliminar = false;
    this.productoEliminar = null;
  }

  abrirCarrito(): void {
    this.mostrarCarrito = true;
    this.cargarCarrito();
  }

  cerrarCarrito(): void {
    this.mostrarCarrito = false;
  }

  cerrarModalExito(): void {
    this.mostrarMensaje= false;
  }


  verificarSesion(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.estaAutenticado = !!localStorage.getItem('idCliente');
    }
  }

  redirigir(ruta: string) {
    this.router.navigate([ruta]);
  }

  cerrarSesion(ruta: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('idCliente');
      localStorage.removeItem('Cedula');
      localStorage.removeItem('Nombre');
    }
    this.estaAutenticado = false;
    if (this.router.url === ruta) {
      window.location.reload();
    } else {
      this.router.navigate(['/menuprincipal']);
    }
  }

  
  cargarCarrito(): void {
    const idCliente = localStorage.getItem('idCliente');

    if (idCliente) {
      const urlCarrito = `https://sgfeapi-djdheubvcef3bha2.eastus-01.azurewebsites.net/api/Carrito/cargar/${idCliente}`;
      this.http.get<{ idCliente: number; idProducto: number; cantidad: number }[]>(urlCarrito).subscribe({
        next: (data) => {
          this.detallesCarrito = [];
          const requests = data.map(item => {
            return this.buscarProducto(item.idProducto).then(producto => {
              if (producto && producto.length > 0) {
                this.detallesCarrito.push({
                  idCliente: Number(idCliente),
                  idProducto: item.idProducto,
                  cantidad: item.cantidad,
                  producto: producto[0]
                } as ItemCarrito);
              }
            });
          });

          Promise.all(requests).then(() => {
            console.log('Detalles del carrito cargados:', this.detallesCarrito);
          });
        },
        error: (err) => {
          console.error('Error al cargar el carrito:', err);
          this.mostrarError('Hubo un problema al cargar el carrito.'); 
        }
      });
    } else {
      this.detallesCarrito = [];
    }
  }

  buscarProducto(idProducto: number): Promise<any> {
    const urlProducto = `https://sgfeapi-djdheubvcef3bha2.eastus-01.azurewebsites.net/api/Producto/buscarId/${idProducto}`;
    return this.http.get<any[]>(urlProducto).toPromise();
  }

  aumentarCantidad(item: ItemCarrito): void {
    item.cantidad++;
    this.actualizarCantidad(item.idCliente, item.idProducto, 1);
  }

  disminuirCantidad(item: ItemCarrito): void {
    if (item.cantidad > 1) {
      item.cantidad--;
      this.actualizarCantidad(item.idCliente, item.idProducto, -1);
    } else {
      item.cantidad--;
      this.actualizarCantidad(item.idCliente, item.idProducto, -1);
      this.quitarDelCarrito(item);
    }
  }

  private actualizarCantidad(idCliente: number, idProducto: number, cantidad: number): void {
    const urlActualizar = 'https://sgfeapi-djdheubvcef3bha2.eastus-01.azurewebsites.net/api/Carrito/agregar';
    const body = {
      idCliente: idCliente,
      idProducto: idProducto,
      cantidad: cantidad
    };

    this.http.post(urlActualizar, body).subscribe({
      next: (response) => {
        console.log('Cantidad actualizada:', response);
      },
      error: (err) => {
        console.error('Error al actualizar la cantidad:', err);
        this.mostrarError('Hubo un problema al actualizar la cantidad.');  
      }
    });
  }

  eliminarProducto(): void {
    if (this.productoEliminar) {
      const item = this.productoEliminar;
      const urlEliminar = `https://sgfeapi-djdheubvcef3bha2.eastus-01.azurewebsites.net/api/Carrito/eliminar/${item.idCliente}/${item.idProducto}`;

      this.http.delete(urlEliminar).subscribe({
        next: (response) => {
          console.log('Producto eliminado:', response);
          this.quitarDelCarrito(item);

          this.mensaje = '¡Producto eliminado con éxito!';  
          this.mostrarMensaje = true;
          setTimeout(() => {
            this.cerrarModalExito();
          }, 2000);
        },
        error: (err) => {
          console.error('Error al eliminar el producto', err);
          this.mostrarError('Hubo un problema al eliminar el producto del carrito.'); 
        }
      });
    }
    this.cerrarModalEliminar();
  }

  cancelarEliminacion(): void {
    this.mensaje = 'No se eliminó el producto. Acción cancelada.';
    this.mostrarMensaje= true;
  
    this.cerrarModalEliminar();
    setTimeout(() => {
      this.cerrarModalExito();
    }, 2000);
  }

  cancelarPedido(): void {
    this.cerrarModalConfirmacion();
    this.mensaje = 'No se realizó el pedido. Acción cancelada.';
    this.mostrarMensaje= true;
  
    this.cerrarModalEliminar();
    setTimeout(() => {
      this.cerrarModalExito();
    }, 2000);
  }

  quitarDelCarrito(item: ItemCarrito): void {
    const index = this.detallesCarrito.findIndex(p => p.idProducto === item.idProducto);
    if (index > -1) {
      this.detallesCarrito.splice(index, 1);
    }
  }

  calcularTotal(): number {
    return this.detallesCarrito.reduce((total, item) => total + (item.producto?.precio || 0) * item.cantidad, 0);
  }

  confirmarPedido(): void {
    const idCliente = localStorage.getItem('idCliente');
    if (!idCliente) {
      this.mostrarError('Error, necesita iniciar sesión.'); 
      return;
    }

    if (this.detallesCarrito.length === 0) {
      this.mostrarError('No hay productos agregados');  
      return;
    }

    const stockValido = this.detallesCarrito.every(item => {
      if (item.cantidad > item.producto.cantidad_Stock) {
        this.mostrarError('No hay suficiente stock para el producto '+ item.producto.nombre_Producto); 
        return false;
      }
      return true;
    });

    if (!stockValido) {
      return;
    }

    this.mostrarModalConfirmacion = true;
  }

  confirmarPedidoDesdeModal(): void {
    const idCliente = localStorage.getItem('idCliente');
    const fechaActual = new Date();
    const fechaPedido = `${fechaActual.getDate().toString().padStart(2, '0')}/${(fechaActual.getMonth() + 1).toString().padStart(2, '0')}/${fechaActual.getFullYear()}`;

    const productos = this.detallesCarrito.map(item => ({
      idProducto: item.idProducto,
      cantidad: item.cantidad
    }));

    const pedido = {
      idPedido: 0,
      idCliente: Number(idCliente),
      fecha_Pedido: fechaPedido,
      estado_Pedido: 'Pendiente',
      totalPedido: this.calcularTotal(),
      productos: productos
    };

    const urlPedido = 'https://sgfeapi-djdheubvcef3bha2.eastus-01.azurewebsites.net/api/Pedido/Registrar';

    this.http.post(urlPedido, pedido).subscribe({
      next: (response: any) => {
        this.mensaje = '¡Pedido confirmado con éxito!';  
        this.mostrarMensaje = true;
        this.restarStockDeProductos(pedido);
        setTimeout(() => {
          this.cerrarModalExito();
        }, 2000);

        const requests = this.detallesCarrito.map(item => {
          const urlEliminar = `https://sgfeapi-djdheubvcef3bha2.eastus-01.azurewebsites.net/api/Carrito/eliminar/${item.idCliente}/${item.idProducto}`;
          return this.http.delete(urlEliminar).toPromise();
        });

        Promise.all(requests).then(() => {
          this.detallesCarrito = [];
        }).catch((err) => {
          console.error('Error al vaciar el carrito:', err);
          this.mostrarError('Ocurrió un error, vuelva a intentarlo'); 
        });

        this.mostrarModalConfirmacion = false;
      },
      error: (err) => {
        this.mostrarModalConfirmacion = false;
        console.error('Error al realizar el pedido:', err);
        this.mostrarError('Hubo un problema al realizar el pedido'); 
      }
    });
  }

  restarStockDeProductos(pedido: any): Promise<void> {
    const promesas: Promise<any>[] = [];
  
    for (let producto of pedido.productos) {
      const urlRestarStock = `https://sgfeapi-djdheubvcef3bha2.eastus-01.azurewebsites.net/api/Producto/restarstock?idProducto=${producto.idProducto}&cantidad=${producto.cantidad}`;
      
      promesas.push(this.http.put(urlRestarStock, {}).toPromise());
    }
    return Promise.all(promesas).then(() => {
      console.log('Stock actualizado correctamente para todos los productos.');
    }).catch((error) => {
      console.error('Error al actualizar el stock:', error);
      alert('Ocurrió un error al actualizar el stock. Inténtalo nuevamente.');
    });
  }

  cancelarPedidoDesdeModal(): void {
    this.mostrarModalConfirmacion = false;
  }
}
