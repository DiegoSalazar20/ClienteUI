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

  constructor(private http: HttpClient, private router: Router) {}

  async registrarCliente() {

    if(!this.validarCampos()){
      return;
    }

    if (this.contrasena !== this.contrasena2) {
      var mensaje='Las contraseñas no coinciden';
      this.mensajeError=mensaje;
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

            alert('Cliente registrado correctamente');
            this.router.navigate(['/inicio']);
          } else {
            alert('Error al registrar el cliente');
          }
        },
        error: (err) => {
          console.error('Error en la solicitud:', err);
          alert('Ocurrió un error al registrar el cliente');
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
    const camposFaltantes: string[] = [];
  
    if (this.cedula.trim() === '') camposFaltantes.push('Cédula');
    if (this.nombre.trim() === '') camposFaltantes.push('Nombre');
    if (this.apellidos.trim() === '') camposFaltantes.push('Apellidos');
    if (this.direccion.trim() === '') camposFaltantes.push('Direccion');
    if (this.telefono.trim() === '') camposFaltantes.push('Teléfono');
    if (this.correo.trim() === '') camposFaltantes.push('Correo electrónico');
    if (this.contrasena.trim() === '') camposFaltantes.push('Contraseña');
    if (this.contrasena2.trim() === '') camposFaltantes.push('Contraseña 2');
  
    if (camposFaltantes.length > 0) {
      var mensaje =('Faltan los siguientes datos por llenar: ' + camposFaltantes.join(', '));
      this.mensajeError=mensaje;
      return false;
    }
  
    return true;
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
}
