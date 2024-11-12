import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MenuPrincipalComponent } from './menuprincipal.component';
import { Producto } from './menuprincipal.component';

describe('MenuPrincipalComponent', () => {
  let component: MenuPrincipalComponent;
  let fixture: ComponentFixture<MenuPrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MenuPrincipalComponent,
        HttpClientTestingModule, 
        RouterTestingModule 
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on initialization', () => {
    spyOn(component, 'cargarProductos').and.callThrough(); 
    component.ngOnInit(); 
    expect(component.cargarProductos).toHaveBeenCalled(); 
  });

  it('should add product to cart', () => {

    const producto: Producto = { 
      idProducto: 1, 
      nombre_Producto: 'Test Product', 
      precio: 100, 
      imagen: 'test-image.png',
      estado: true, 
      cantidad_Stock: 10 
    };
    
    component.agregarAlCarrito(producto);
  
    expect(console.log).toHaveBeenCalledWith('Producto agregado al carrito:', producto);
  });

});
