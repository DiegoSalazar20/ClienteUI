import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common'; // Asegúrate de tener esto
import { MenuComponent } from "../menu/menu.component";

@Component({
  selector: 'app-actualizar-datos',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuComponent, HttpClientModule], // Asegúrate de que CommonModule esté aquí
  templateUrl: './actualizardatos.component.html',
  styleUrls: ['./actualizardatos.component.scss']
})
export class ActualizarDatosComponent implements OnInit {
  mostrarModal: boolean = false; 
  nombre: string = '';
  apellidos: string = '';
  direccion: string = '';
  telefono: string = '';
  correo: string = '';
  contrasena: string = '';
  cedula: string = ''; 
  idCliente: number = 0;
  estado: boolean = true;

  private apiUrlBuscar = 'https://sgfeapi-djdheubvcef3bha2.eastus-01.azurewebsites.net/api/Cliente/Buscar';
  private apiUrlActualizar = 'https://sgfeapi-djdheubvcef3bha2.eastus-01.azurewebsites.net/api/Cliente/Actualizar';

  constructor(private router: Router, private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    
    if (isPlatformBrowser(this.platformId)) {
    const cedula = localStorage.getItem('Cedula');
   
    if (cedula) {
      this.cargarDatos(cedula);
    }
  }
  
  }

  cargarDatos(cedula: string): void {
    this.http.get<any[]>(`${this.apiUrlBuscar}?cedula=${cedula}`).subscribe(
      response => {
        if (response.length > 0) {
          const cliente = response[0];
          this.idCliente = cliente.idCliente; 
          this.cedula = cliente.cedula; 
          this.nombre = cliente.nombre;
          this.apellidos = cliente.apellido;
          this.direccion = cliente.direccion;
          this.telefono = cliente.telefono;
          this.correo = cliente.correo_Electronico;
          this.contrasena = cliente.contrasenia;
          this.estado = cliente.estado; 
        }
      },
      error => {
        console.error('Error al cargar los datos del cliente:', error);
      }
    );
  }

  actualizarDatos(): void {
    const cliente = {
      idCliente: this.idCliente,
      cedula: this.cedula,
      nombre: this.nombre,
      apellido: this.apellidos,
      direccion: this.direccion,
      telefono: this.telefono,
      correo_Electronico: this.correo,
      contrasenia: this.contrasena,
      estado: this.estado
    };

    this.http.put(this.apiUrlActualizar, cliente).subscribe(
      response => {
        console.log('Datos actualizados exitosamente:', response);
        localStorage.setItem('Nombre', this.nombre); 
        this.mostrarModal = true;
        setTimeout(() => {
          location.reload();
        }, 2000);
      },
      error => {
        console.error('Error al actualizar los datos:', error);
      }
    );
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }


  redirigir(ruta: string) {
    this.router.navigate([ruta]);
  }
}
