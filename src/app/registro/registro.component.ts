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

  constructor(private http: HttpClient, private router: Router) {}

  async registrarCliente() {
    if (this.contrasena !== this.contrasena2) {
      alert('Las contraseñas no coinciden');
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
            this.router.navigate(['/menuprincipal']);
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
