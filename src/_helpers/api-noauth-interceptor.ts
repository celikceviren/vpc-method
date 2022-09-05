import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { InfoDialogService } from 'src/app/data/info-dialog.service';
import { WindowMsgService } from 'src/app/data/window-msg.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class ApiNoauthInterceptor implements HttpInterceptor {
  constructor(private dialogService: InfoDialogService, private windowMsgService: WindowMsgService) {}

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error) => {
        const httpError: HttpErrorResponse = error as HttpErrorResponse;
        if (httpError.status === 401) {
          const path = req.url.replace(environment.apiUrl, '');
          this.dialogService.show({
            heading: 'Hata',
            title: '',
            body: 'Uzun süredir işlem yapmadığınız için oturumunuz sona erdi.<br/><small><i>Ref: ' + path,
          });
        }
        return throwError(error);
      })
    );
  }
}
