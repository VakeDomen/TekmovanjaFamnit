import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FileModel } from '../models/file.model';
import { ApiResponse } from '../models/response';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) { }

  postSubmission(fileToUpload: File, contestant: string): Observable<ApiResponse<FileModel>> {
    const formData: FormData = new FormData();
    formData.append('submission', fileToUpload, fileToUpload.name);
    return this.http.post<ApiResponse<FileModel>>(`${this.apiUrl}/submission/upload/${this.auth.getName()}/${fileToUpload.name}`, formData);
  }
  
  postGamePack(fileToUpload: File, gameName: string): Observable<ApiResponse<FileModel>> {
    const formData: FormData = new FormData();
    formData.append('pack', fileToUpload, fileToUpload.name);
    return this.http.post<ApiResponse<FileModel>>(`${this.apiUrl}/game/upload/pack/${gameName}`, formData);
  }

  postThumbnail(fileToUpload: File, gameName: string): Observable<ApiResponse<FileModel>> {
    const formData: FormData = new FormData();
    formData.append('thumbnail', fileToUpload, fileToUpload.name);
    return this.http.post<ApiResponse<FileModel>>(`${this.apiUrl}/game/upload/thumbnail/${gameName}`, formData);
  }

  getOpenFileUrl(fileId: string): string {
    return `${this.apiUrl}/open/serve/${fileId}`;
  }

  getOpenFileDownloadUrl(fileId: string): string {
    return `${this.apiUrl}/open/download/${fileId}`;
  }
}
