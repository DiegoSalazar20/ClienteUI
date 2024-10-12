import { Component } from '@angular/core';
import { HttpClient, HttpClientModule  } from '@angular/common/http';
import { Router } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [FormsModule, HttpClientModule], 
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss'] 
})
export class InicioComponent {
  correo: string = '';
  contrasenia: string = '';
  cifrada: string ='';

  constructor(private http: HttpClient, private router: Router) {} 

  async iniciarSesion() {

    const cifrada = await this.hashContrasena(this.contrasenia);
    const url = `https://sgfeapi-djdheubvcef3bha2.eastus-01.azurewebsites.net/api/Cliente/IniciarSesion?correo=${this.correo}&contrasenia=${cifrada}`;

    this.http.get<any>(url).subscribe(
      response => {
        if (response && response.idCliente) {
          localStorage.setItem('idCliente', response.idCliente.toString());
          localStorage.setItem('Cedula', response.cedula.toString());
          localStorage.setItem('Nombre', response.nombre.toString());
          alert('Inicio de sesión exitoso');
          this.router.navigate(['/menuprincipal']); 
        } else {
          alert('Credenciales inválidas'); 
        }
      },
      error => {
        console.error('Error al iniciar sesión', error);
        alert('Ocurrió un error al iniciar sesión');
      }
    );
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

