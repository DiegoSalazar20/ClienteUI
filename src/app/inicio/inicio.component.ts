import { Component } from '@angular/core';
import { HttpClient, HttpClientModule  } from '@angular/common/http';
import { Router } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule], 
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss'] 
})
export class InicioComponent {
  correo: string = '';
  contrasenia: string = '';
  cifrada: string ='';
  mensajeError: string | null = null;

  constructor(private http: HttpClient, private router: Router) {} 

  async iniciarSesion() {
    this.mensajeError = null;
    if(!this.validarCampos()){
      return;
    }
    const cifrada = await this.hashContrasena(this.contrasenia);
    const url = `https://sgfeapi-djdheubvcef3bha2.eastus-01.azurewebsites.net/api/Cliente/IniciarSesion?correo=${this.correo}&contrasenia=${cifrada}`;
    this.http.get<any>(url).subscribe(
      response => {
        if (response && response.idCliente) {
          if (response.estado) {
            localStorage.setItem('idCliente', response.idCliente.toString());
            localStorage.setItem('Cedula', response.cedula.toString());
            localStorage.setItem('Nombre', response.nombre.toString());
            this.router.navigate(['/menuprincipal']);
          } else {
            alert('Cliente deshabilitado.');
          }
        }  else {
          this.mensajeError = 'Correo o contraseña incorrectas.';
        }
      },
      error => {
        console.error('Error al iniciar sesión', error);
        if (error.status === 401) {
          this.mensajeError = 'Correo o contraseña incorrectos' 
        } else {
          this.mensajeError = 'Ocurrió un error al iniciar sesión'; 
        }
      }
    );
  }

  validarCampos(): boolean {
    const camposFaltantes: string[] = [];
  
    if (this.correo.trim() === '') camposFaltantes.push('Correo electrónico');
    if (this.contrasenia.trim() === '') camposFaltantes.push('Contraseña');
    if (camposFaltantes.length > 0) {
      var mensaje=('Faltan los siguientes datos por llenar: ' + camposFaltantes.join(', '));
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

