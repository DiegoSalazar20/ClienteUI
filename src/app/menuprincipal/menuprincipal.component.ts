import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MenuComponent } from '../menu/menu.component';

interface Producto {
  idProducto: number;
  nombre_Producto: string;
  precio: number;
  imagen: string;
}

@Component({
  selector: 'app-menu-principal',
  standalone: true,
  imports: [CommonModule, MenuComponent, HttpClientModule],
  templateUrl: './menuprincipal.component.html',
  styleUrls: ['./menuprincipal.component.scss']
})
export class MenuPrincipalComponent implements OnInit {
  mostrarCarrito: boolean = false;
  productos: Producto[] = [];
  nombreCliente: string | null = '';
  mostrarModal: boolean = false; 
  productoAgregado: Producto | null = null; 

  constructor(private http: HttpClient, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarNombreCliente();
  }

  cargarProductos(): void {
    this.http.get<Producto[]>('https://sgfeapi-djdheubvcef3bha2.eastus-01.azurewebsites.net/api/Producto')
      .subscribe({
        next: (data) => {
          this.productos = data;
        },
        error: (err) => {
          console.error('Error al cargar los productos:', err);
        }
      });
  }

  cargarNombreCliente(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.nombreCliente = localStorage.getItem('Nombre');
      console.log(localStorage.getItem('Nombre'));
    }
  }

  redirigir(ruta: string) {
    this.router.navigate([ruta]);
  }

  abrirCarrito(): void {
    this.mostrarCarrito = true;
  }

  cerrarCarrito(): void {
    this.mostrarCarrito = false;
  }

  agregarAlCarrito(producto: Producto): void {
    const idCliente = localStorage.getItem('idCliente');

    if (!idCliente) {
      alert('Por favor, inicia sesión para agregar productos al carrito.');
      this.router.navigate(['/inicio']);
      return;
    }

    const body = {
      idCliente: Number(idCliente),
      idProducto: Number(producto.idProducto),
      cantidad: 1
    };

    console.log('Cuerpo de la solicitud:', body);

    this.http.post('https://sgfeapi-djdheubvcef3bha2.eastus-01.azurewebsites.net/api/Carrito/agregar', body)
      .subscribe({
        next: (response) => {
          console.log('Producto agregado al carrito con éxito:', response);
          this.productoAgregado = producto; 
          this.mostrarModal = true; 

          
          setTimeout(() => {
            this.cerrarModal();
          }, 2000);
        },
        error: (err) => {
          console.error('Error al agregar el producto al carrito:', err);
          alert('Ocurrió un error al agregar el producto al carrito.');
        }
      });
  }

  cerrarModal(): void {
    this.mostrarModal = false; 
    this.productoAgregado = null; 
  }
}
