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
  mostrarModalExitoFlag: boolean = false;
  mostrarErrorModalFlag: boolean = false;
  mostrarConfirmacionFlag: boolean = false;

  nombre: string = '';
  apellidos: string = '';
  direccion: string = '';
  telefono: string = '';
  correo: string = '';
  contrasena: string = '';
  cedula: string = ''; 
  idCliente: number = 0;
  estado: boolean = true;

  mensajeExito: string = '';
  mensajeError: string = '';
  mensajeConfirmacion: string = '';
  confirmarAccion: () => void = () => {};

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

  validarCampos(): boolean {
    let resultado = true;
    const camposFaltantes: string[] = [];
    const camposInvalidos: string[] = [];

    if (this.nombre.trim() === '') camposFaltantes.push('Nombre');
    if (this.apellidos.trim() === '') camposFaltantes.push('Apellidos');
    if (this.direccion.trim() === '') camposFaltantes.push('Dirección');
    if (this.telefono.trim() === '') camposFaltantes.push('Teléfono');
    if (this.correo.trim() === '') camposFaltantes.push('Correo electrónico');

    if (this.tieneNumerosOCaracteresEspeciales(this.nombre.trim())) camposInvalidos.push('Nombre');
    if (this.tieneNumerosOCaracteresEspeciales(this.apellidos.trim())) camposInvalidos.push('Apellidos');

    if (camposFaltantes.length > 0) {
      this.mostrarErrorModal('Faltan los siguientes datos por llenar: ' + camposFaltantes.join(', '));
      resultado = false;
    }

    if (camposInvalidos.length > 0) {
      this.mostrarErrorModal('Los siguientes datos son inválidos: ' + camposInvalidos.join(', '));
      resultado = false;
    }

    return resultado;
  }

  tieneNumerosOCaracteresEspeciales(input: string): boolean {
    const regex = /[^a-zA-Z\s]/;
    return regex.test(input);
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
        this.mostrarErrorModal('Error al cargar los datos');
      }
    );
  }

  actualizarDatos(): void {
    if (!this.validarCampos()) {
      return;
    }

    const mensaje = `¿Está seguro que desea actualizar los datos?`;

    this.mostrarConfirmacionModal(mensaje, () => {
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
          localStorage.setItem('Nombre', this.nombre);
          this.mostrarModalExito('Datos actualizados exitosamente');
          setTimeout(() => {
            location.reload();
          }, 2000);
        },
        error => {
          this.mostrarErrorModal('Error al actualizar los datos');
        }
      );
    });
  }

  mostrarConfirmacionModal(mensaje: string, onConfirm: () => void): void {
    this.mensajeConfirmacion = mensaje;
    this.mostrarConfirmacionFlag = true;
    this.confirmarAccion = onConfirm;
  }

  confirmarAccionModal(): void {
    if (this.confirmarAccion) {
      this.confirmarAccion();
    }
    this.mostrarConfirmacionFlag = false;
  }

  mostrarModalExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    this.mostrarModalExitoFlag = true;
  }

  mostrarErrorModal(mensaje: string): void {
    this.mensajeError = mensaje;
    this.mostrarErrorModalFlag = true;
  }

  cerrarModalExito(): void {
    this.mostrarModalExitoFlag = false;
  }

  cerrarModalError(): void {
    this.mostrarErrorModalFlag = false;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  formatearTelefono(): void {
    let valor = this.telefono.replace(/\D/g, '');
    if (valor.length > 4) {
      valor = valor.slice(0, 4) + '-' + valor.slice(4, 8);
    }
    this.telefono = valor.slice(0, 9);
  }

  redirigir(ruta: string) {
    this.router.navigate([ruta]);
  }
}
