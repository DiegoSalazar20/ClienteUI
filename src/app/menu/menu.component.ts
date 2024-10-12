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
  estaAutenticado: boolean = false; // Nueva propiedad para determinar el estado de la sesión

  constructor(private router: Router, private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) { 
    this.verificarSesion(); // Verificamos si la sesión está activa al iniciar el componente
  }

  verificarSesion(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.estaAutenticado = !!localStorage.getItem('idCliente'); // Verifica si el cliente está autenticado solo en el navegador
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
    this.estaAutenticado = false; // Actualiza el estado de autenticación
    if (this.router.url===ruta){
      window.location.reload();
    }else{
    this.router.navigate(['/menuprincipal']); // Redirige al menú principal
    }
  }

  abrirCarrito(): void {
    this.mostrarCarrito = true;
    this.cargarCarrito();
  }

  cerrarCarrito(): void {
    this.mostrarCarrito = false;
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
          alert('Ocurrió un error al cargar el carrito.');
        }
      });
    } else {
      this.detallesCarrito = [];
    }
  }


  buscarProducto(idProducto: number): Promise<any> {
    const urlProducto = `https://sgfeapi-djdheubvcef3bha2.eastus-01.azurewebsites.net/api/Producto/buscarId/${idProducto}`;
    return this.http.get<any[]>(urlProducto).toPromise(); // Convierte el Observable a Promise
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
        alert('Ocurrió un error al actualizar la cantidad.');
      }
    });
  }


  eliminarDelCarrito(item: ItemCarrito): void {
    const urlEliminar = `https://sgfeapi-djdheubvcef3bha2.eastus-01.azurewebsites.net/api/Carrito/eliminar/${item.idCliente}/${item.idProducto}`;

    this.http.delete(urlEliminar).subscribe({
      next: (response) => {
        console.log('Producto eliminado:', response);
        this.quitarDelCarrito(item);
      },
      error: (err) => {
        console.error('Error al eliminar el producto:', err);
        alert('Ocurrió un error al eliminar el producto.');
      }
    });
  }


  quitarDelCarrito(item: ItemCarrito): void {
    const index = this.detallesCarrito.findIndex(p => p.idProducto === item.idProducto);
    if (index > -1) {
      this.detallesCarrito.splice(index, 1); // Eliminar el producto del carrito
    }
  }


  calcularTotal(): number {
    return this.detallesCarrito.reduce((total, item) => total + (item.producto?.precio || 0) * item.cantidad, 0);
  }


  confirmarPedido(): void {
    const idCliente = localStorage.getItem('idCliente');
    if (!idCliente) {
      alert('Error: No se encontró un idCliente');
      return;
    }

    if (this.detallesCarrito.length === 0) {
      alert('No tienes productos en el carrito.');
      return;
    }
  
    const confirmar = window.confirm('¿Estás seguro de que deseas confirmar el pedido?');
    if (!confirmar) {
      return; 
    }

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
      next: (response) => {
        alert('Pedido confirmado exitosamente!');


        const requests = this.detallesCarrito.map(item => {
          const urlEliminar = `https://sgfeapi-djdheubvcef3bha2.eastus-01.azurewebsites.net/api/Carrito/eliminar/${idCliente}/${item.idProducto}`;
          return this.http.delete(urlEliminar).toPromise();
        });


        Promise.all(requests).then(() => {
          console.log('Productos eliminados del carrito');
          this.detallesCarrito = [];
          this.cerrarCarrito();
        }).catch(err => {
          console.error('Error al eliminar productos del carrito:', err);
          alert('Ocurrió un error al eliminar los productos del carrito.');
        });
      },
      error: (err) => {
        console.error('Error al confirmar el pedido:', err);
        alert('Ocurrió un error al confirmar el pedido.');
      }
    });
  }


}
