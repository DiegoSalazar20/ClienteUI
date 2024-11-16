import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuComponent } from "../menu/menu.component";
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuComponent, HttpClientModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {
  cedula: string = '';
  nombre: string = '';
  apellidos: string = '';
  direccion: string = '';
  telefono: string = '';
  correo: string = '';
  contrasena: string = '';
  contrasena2: string = '';
  mensajeError: string | null = null;

  mostrarMensaje: boolean = false;
  mensaje: string = '';

  constructor(private http: HttpClient, private router: Router) { }

  async registrarCliente() {

    if (!this.validarCampos()) {
      return;
    }

    if (this.contrasena !== this.contrasena2) {
      var mensaje = 'Las contraseñas no coinciden';
      this.mensajeError = mensaje;
      return;
    }

    const cifrada = await this.hashContrasena(this.contrasena);
    const cliente = {
      idCliente: 0,
      cedula: this.cedula,
      nombre: this.nombre,
      apellido: this.apellidos,
      direccion: this.direccion,
      telefono: this.telefono,
      correo_Electronico: this.correo,
      contrasenia: cifrada,
      estado: true
    };

    this.http.post<boolean>('https://sgfeapi-djdheubvcef3bha2.eastus-01.azurewebsites.net/api/Cliente/Registrar', cliente)
      .subscribe({
        next: (response) => {
          if (response) {
            localStorage.setItem('cedula', this.cedula);
            localStorage.setItem('nombre', this.nombre);
            localStorage.setItem('correo', this.correo);

            this.mensaje = 'Cliente registrado correctamente';
            this.mostrarMensaje = true;
            setTimeout(() => {
              this.router.navigate(['/inicio'])
            }, 2000);
          } else {
            this.mensajeError='Error al registrar el cliente';
          }
        },
        error: (err) => {
          console.error('Error en la solicitud:', err);
          this.mensajeError='Ocurrió un error al registrar el cliente';
        }
      });
  }

  formatearCedula(): void {
    let valor = this.cedula.replace(/\D/g, '');

    if (valor.length > 2 && valor.length <= 6) {
      valor = valor.slice(0, 2) + '-' + valor.slice(2);
    } else if (valor.length > 6) {
      valor = valor.slice(0, 2) + '-' + valor.slice(2, 6) + '-' + valor.slice(6, 10);
    }
    this.cedula = valor.slice(0, 12);
  }

  validarCampos(): boolean {
    var resultado = true;
    const camposFaltantes: string[] = [];
    const camposInvalidos: string[] = [];

    if (this.cedula.trim() === '') camposFaltantes.push('Cédula');
    if (this.nombre.trim() === '') camposFaltantes.push('Nombre');
    if (this.apellidos.trim() === '') camposFaltantes.push('Apellidos');
    if (this.direccion.trim() === '') camposFaltantes.push('Direccion');
    if (this.telefono.trim() === '') camposFaltantes.push('Teléfono');
    if (this.correo.trim() === '') camposFaltantes.push('Correo electrónico');
    if (this.contrasena.trim() === '') camposFaltantes.push('Contraseña');
    if (this.contrasena2.trim() === '') camposFaltantes.push('Contraseña 2');

    if (this.tieneNumerosOCaracteresEspeciales(this.nombre.trim())) camposInvalidos.push('Nombre');
    if (this.tieneNumerosOCaracteresEspeciales(this.apellidos.trim())) camposInvalidos.push('Apellido');

    if (!(this.validarCaracteresEspeciales(this.direccion.trim()))) camposInvalidos.push('Dirección');

    if (!(this.validarTelefono(this.telefono))) camposInvalidos.push('Teléfono');
    if (!(this.validarCorreo(this.correo))) camposInvalidos.push('Correo electrónico');


    if (camposFaltantes.length > 0) {
      var mensaje = ('Faltan los siguientes datos por llenar: ' + camposFaltantes.join(', '));
      this.mensajeError = mensaje;
      resultado = false;
    }

    if (camposInvalidos.length > 0) {
      var mensaje = ('Los siguientes campos tienen datos inválidos: ' + camposInvalidos.join(', '));
      this.mensajeError = mensaje;
      resultado = false;
    }

    return resultado;
  }

  validarCaracteresEspeciales(entrada: string): boolean {
    const regex = /[!@#$%|^&*_()[\]{};:"<>¿?\/]/;
    return !regex.test(entrada);
  }

  validarTelefono(telefono: string): boolean {
    const telefonoRegex = /^\d{4}-\d{4}$/;
    return telefonoRegex.test(telefono);
  }

  validarCorreo(correo: string): boolean {
    const correoRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return correoRegex.test(correo);
  }

  permitirSoloNumeros(event: KeyboardEvent): boolean {
    const tecla = event.key;
  
    if (/^[0-9]$/.test(tecla) || ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(tecla)) {
      return true;
    }

    event.preventDefault();
    return false;
  }

  tieneNumerosOCaracteresEspeciales(input: string): boolean {
    const regex = /[^a-zA-Z\s]/;
    return regex.test(input);
  }

  formatearTelefono(): void {
    let valor = this.telefono.replace(/\D/g, '');
    if (valor.length > 4) {
      valor = valor.slice(0, 4) + '-' + valor.slice(4, 8);
    }
    this.telefono = valor.slice(0, 9);
  }

  async hashContrasena(contrasena: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(contrasena);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return this.bufferToHex(hashBuffer);
  }

  bufferToHex(buffer: ArrayBuffer): string {
    return [...new Uint8Array(buffer)]
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  redirigir(ruta: string) {
    console.log('Redirigiendo a:', ruta);
    this.router.navigate([ruta]);
  }

  cerrarModalExito(): void {
    this.mostrarMensaje = false;
  }


}
