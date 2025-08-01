import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../../services/task.service';
import { isOkResponse, loadResponseData, loadResponseError } from '../../../../services/utils.service';
import { Task } from '../../../model/task.model';
import { TaskPopupComponent } from '../../task-popup/task-popup.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { NgChartsModule } from 'ng2-charts';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCalendar, MatDatepickerModule } from '@angular/material/datepicker';
import { TaskCalendarComponent } from '../task-calendar/task-calendar.component';
import { AuthService } from '../../../../services/auth.service';
import { AppUser } from '../../../model/appUser.model';
import { MatDialog } from '@angular/material/dialog';
import { TaskDetailsComponent } from '../../task-details/task-details.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgForOf,
    NgIf,
    MatDatepickerModule,
    MatNativeDateModule,
    TaskPopupComponent,
    NgChartsModule,
    TaskCalendarComponent,
    TaskCalendarComponent,
    MatCardModule,
    MatPaginatorModule,
  ],

  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent implements OnInit {
  @ViewChild(TaskCalendarComponent) calendarComp!: TaskCalendarComponent;
  inProgressTasksDates = new Set<string>();
  inProgressTasks: Task[] = [];
  error = '';
  selectedTask: Task | null = null;
  modoPopup: 'CREAR' | 'EDITAR' | 'CLOSED' = 'CLOSED';
  counts = { pendiente: 0, enCurso: 0, completada: 0, vencidas: 0 };
  today = new Date();
  isCheckingLogin = false;
  currentUser: AppUser | null = null;

  constructor(private taskService: TaskService, private authService: AuthService, private dialog: MatDialog) { }
  pageSize = 6;
  pageIndex = 0;
  pageSizeOptions = [6];

  async ngOnInit(): Promise<void> {
    try {
      this.currentUser = await this.authService.getLoggedUser();
    } catch (error) {
      this.currentUser = null;
    } finally {
      this.isCheckingLogin = false;
    }
    await this.loadCounts();
    await this.loadInProgressTasks();
  }


  private async loadCounts() {
    const resp = await this.taskService.getTasks();
    if (!isOkResponse(resp)) return;
    const tasks = loadResponseData(resp) as Task[];

    this.counts.pendiente = tasks.filter(t => t.status === 'PENDIENTE').length;
    this.counts.enCurso = tasks.filter(t => t.status === 'EN_CURSO').length;
    this.counts.completada = tasks.filter(t => t.status === 'COMPLETADA').length;
    this.counts.vencidas = tasks
      .filter(t => t.endDate && new Date(t.endDate) < this.today && t.status !== 'COMPLETADA')
      .length;
  }

  private async loadInProgressTasks(): Promise<Task[]> {
    this.error = '';
    const resp = await this.taskService.getTasks();
    if (!isOkResponse(resp)) {
      this.error = loadResponseError(resp);
      return [];
    }
    const all = loadResponseData(resp) as Task[];
    this.inProgressTasks = all.filter(t => t.status === 'EN_CURSO');
    this.inProgressTasksDates.clear();
    this.inProgressTasks.forEach(t => {
      if (t.endDate) {
        const date = new Date(t.endDate);
        const ymd = date.getFullYear() + '-' +
          String(date.getMonth() + 1).padStart(2, '0') + '-' +
          String(date.getDate()).padStart(2, '0');
        this.inProgressTasksDates.add(ymd);
      }
    });
    return this.inProgressTasks;
  }

  dateClass = (d: Date) => {
    const date = d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
    return this.inProgressTasksDates.has(date) ? 'highlight-date' : '';
  };

  get pagedTasks(): Task[] {
    const start = this.pageIndex * this.pageSize;
    return this.inProgressTasks.slice(start, start + this.pageSize);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  editarEnHome(task: Task) {
    this.selectedTask = task;
    this.modoPopup = 'EDITAR';
    this.calendarComp.loadTasksFromService();
  }

  async onPopupGuardado() {
    this.modoPopup = 'CLOSED';
    this.selectedTask = null;
    await this.loadCounts();
    await this.loadInProgressTasks()
  }

  onPopupCancelado() {
    this.modoPopup = 'CLOSED';
    this.selectedTask = null;
  }
  trackById(index: number, item: Task) {
    return item.id;
  }
  abrirCrearTarea() {
    this.modoPopup = 'CREAR';
    this.selectedTask = null;
  }
  verDetalles(task: Task) {
    const dialogRef = this.dialog.open(TaskDetailsComponent, {
      data: task,
      width: '400px',
    });

    dialogRef.componentInstance.edit.subscribe((taskToEdit: Task) => {
      this.modoPopup = 'EDITAR';
      this.selectedTask = taskToEdit;
    });
  }
}
