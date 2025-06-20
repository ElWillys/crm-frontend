import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskStatus } from '../app/model/task.model';
import ConstUrls from '../app/shared/constants/const-urls';
import to, { headers } from './utils.service';



@Injectable({
  providedIn: 'root',
})
export class TaskService {
  
  constructor(private http: HttpClient) {}
  private TASK_URL = ConstUrls.API_URL + '/tasks';

  async getTasks() {
        return await to(
            this.http
                .get<any[]>(this.TASK_URL + '/listarTareas', {
                    headers: headers,
                    // params: loadCredentials(),
                    observe: "response"
                })
                .toPromise()
        )
    }

async createTask(task: Task) {
        return await to(
            this.http
                .post<any>(this.TASK_URL + '/crearTarea', task, {
                    headers: headers,
                    // params: loadCredentials(),
                    observe: "response",
                })
                .toPromise()
        )
    }

 async deleteTask(id: number) {
        return await to(
            this.http
                .delete<boolean>(this.TASK_URL + '/eliminarTarea/' + id, {
                    headers: headers,
                    // params: loadCredentials(),
                    observe: "response"
                })
                .toPromise()
        )
    }

    async updateTask(task: Task) {

        return await to(
            this.http
                .put<any>(this.TASK_URL + '/actualizarTarea', task, {
                    headers: headers,
                    // params: loadCredentials(),
                    observe: "response",
                })
                .toPromise()
        )
    }
}