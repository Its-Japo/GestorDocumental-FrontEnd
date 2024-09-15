import { Component, OnInit } from '@angular/core';
import { IRole } from '../../interfaces/role.interface';
import { RolesCrudService } from '../../services/roles-crud.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RolesModalComponent } from '../roles-modal/roles-modal.component';
import { ConfirmModalComponent } from '../../../../../../../../shared/confirm-modal/confirm-modal.component';
import { LoaderService } from '../../../../../../../../services/loader.service';




@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {
  roles: IRole[] = [];
  searchTerm: string = '';

  // Alert properties
  alertVisible: boolean = false;
  alertTitle: string = '';
  alertMessage: string = '';
  alertType: string = 'alert-info';
  alertIcon: string = 'icon-info';

  constructor(
    private rolesCrudService: RolesCrudService,
    private modalService: NgbModal,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.loaderService.showLoader();
    this.loadRoles();
    setTimeout(() => {
      this.loaderService.hideLoader();
    }, 2000);
  }

  loadRoles(): void {
    this.rolesCrudService.listRoles().subscribe(
      (response) => {
        if (response && response.body.result) {
          this.roles = response.body.result;
          console.log('Roles:', this.roles);
        }
      },
      (error) => {
        this.showAlert('Error', 'Error al obtener los roles.', 'danger');
        console.error('Error al obtener los roles:', error);
      }
    );
  }

  openRoleModal(role: IRole | null = null): void {
    const modalRef = this.modalService.open(RolesModalComponent);
    modalRef.componentInstance.roleData = role || {};
    modalRef.componentInstance.isEditMode = !!role;

    modalRef.result.then((result) => {
      if (result) {
        this.loadRoles();
        if (result === 'created') {
          this.loaderService.showLoader();
          this.showAlert('Agregación', 'Rol creado con éxito.', 'success');
          setTimeout(() => {
            this.loaderService.hideLoader();
          }, 1000);
        } else if (result === 'updated') {
          this.loaderService.showLoader();
          this.showAlert('Actualización', 'Rol actualizado con éxito.', 'warning');
          setTimeout(() => {
            this.loaderService.hideLoader();
          }, 1000);
        }
      }
    }).catch((error) => {
      console.log('Modal dismissed', error);
    });
  }

  addRole(): void {
    this.openRoleModal();
  }

  editRole(role: IRole): void {
    this.openRoleModal(role);
  }

  deleteRole(role: IRole): void {
    const modalRef = this.modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.message = `¿Está seguro de querer eliminar el rol "${role.role_name}"?`;
    modalRef.result.then((result) => {
      if (result === 'confirm') {
        this.rolesCrudService.deleteRole(role.id).subscribe(
          () => {
            this.loaderService.showLoader();
            this.showAlert('Eliminación', 'Rol eliminado con éxito.', 'info');
            this.loadRoles();
            setTimeout(() => {
              this.loaderService.hideLoader();
            }, 1000);
          },
          (error) => {
            this.loaderService.showLoader();
            this.showAlert('Error', 'El Rol no se puede eliminar porque esta asignado a un Usuario.', 'danger');
            console.error('Error al eliminar el rol:', error);
            setTimeout(() => {
              this.loaderService.hideLoader();
            }, 1000);
          }
        );
      }
    }).catch((error) => {
      console.log('Modal dismissed', error);
    });
  }

  filteredRoles(): IRole[] {
    if (!this.searchTerm) {
      return this.roles;
    }
    return this.roles.filter(role =>
      role.role_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      role.description?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  showAlert(title: string, message: string, type: 'success' | 'warning' | 'danger' | 'info'): void {
    this.alertTitle = title;
    this.alertMessage = message;
    this.alertType = `alert-${type}`;
    this.alertIcon = `fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'times-circle' : type === 'warning' ? 'exclamation-circle' : 'info-circle'}`;
    this.alertVisible = true;

    setTimeout(() => {
      this.alertVisible = false;
    }, 7000);
  }

  handleAlertClosed(): void {
    this.alertVisible = false;
  }
}
