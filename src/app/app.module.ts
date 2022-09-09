import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { PladisMethodEditorComponent } from './feature/pladis-method-editor/pladis-method-editor.component';
import { PladisMethodEditorService } from './data/pladis-method-editor.service';
import { UiCheckboxListComponent } from './ui/ui-checkbox-list/ui-checkbox-list.component';
import { UiWorkInfoComponent } from './ui/ui-work-info/ui-work-info.component';
import { UiGeneralInfoComponent } from './ui/ui-general-info/ui-general-info.component';
import { UiTasksListComponent } from './ui/ui-tasks-list/ui-tasks-list.component';
import { UiTaskFormComponent } from './ui/ui-task-form/ui-task-form.component';
import { UiConfirmDialogComponent } from './ui/ui-confirm-dialog/ui-confirm-dialog.component';
import { UiTaskRiskFormComponent } from './ui/ui-task-risk-form/ui-task-risk-form.component';
import { UiContractorsListComponent } from './ui/ui-contractors-list/ui-contractors-list.component';
import { UiContractorFormComponent } from './ui/ui-contractor-form/ui-contractor-form.component';
import { WindowMsgService } from './data/window-msg.service';
import { UiInfoDialogComponent } from './ui/ui-info-dialog/ui-info-dialog.component';
import { InfoDialogService } from './data/info-dialog.service';
import { PladisMethodViewerComponent } from './feature/pladis-method-viewer/pladis-method-viewer.component';
import { UiMethodDocViewComponent } from './ui/ui-method-doc-view/ui-method-doc-view.component';
import { PladisMethodReviewerComponent } from './feature/pladis-method-reviewer/pladis-method-reviewer.component';
import { UiReviewRejectComponent } from './ui/ui-review-reject/ui-review-reject.component';
import { UUIDService } from './data/uuid.service';
import { NestleMethodEditorComponent } from './feature/nestle-method-editor/nestle-method-editor.component';
import { NestleMethodViewerComponent } from './feature/nestle-method-viewer/nestle-method-viewer.component';
import { NestleMethodReviewerComponent } from './feature/nestle-method-reviewer/nestle-method-reviewer.component';
import { PladisWorkpermitNewComponent } from './feature/pladis-workpermit-new/pladis-workpermit-new.component';
import { WpLocationScannerComponent } from './ui/wp-location-scanner/wp-location-scanner.component';
import { WpLocationApproveComponent } from './ui/wp-location-approve/wp-location-approve.component';
import { WpItemSelectorComponent } from './ui/wp-item-selector/wp-item-selector.component';
import { WpWorkInfoFormComponent } from './ui/wp-work-info-form/wp-work-info-form.component';
import { WpCheckboxListComponent } from './ui/wp-checkbox-list/wp-checkbox-list.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiNoauthInterceptor } from 'src/_helpers/api-noauth-interceptor';
import { WpQuestionsComponent } from './ui/wp-questions/wp-questions.component';
import { WpGasMeasurementFormComponent } from './ui/wp-gas-measurement-form/wp-gas-measurement-form.component';
import { WpReviewApproveComponent } from './ui/wp-review-approve/wp-review-approve.component';
import { WorkpermitMainComponent } from './feature/common-workpermit-main/common-workpermit-main.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { PladisWorkpermitViewComponent } from './feature/pladis-workpermit-view/pladis-workpermit-view.component';
import { PladisWorkpermitApproveComponent } from './feature/pladis-workpermit-approve/pladis-workpermit-approve.component';
import { WpDetailsViewComponent } from './ui/wp-details-view/wp-details-view.component';
import { WpApproveFormComponent } from './ui/wp-approve-form/wp-approve-form.component';
import { PladisWorkpermitExtendComponent } from './feature/pladis-workpermit-extend/pladis-workpermit-extend.component';
import { WpExtendApproveComponent } from './ui/wp-extend-approve/wp-extend-approve.component';

@NgModule({
  declarations: [
    AppComponent,
    UiGeneralInfoComponent,
    UiCheckboxListComponent,
    UiWorkInfoComponent,
    PladisMethodEditorComponent,
    UiTasksListComponent,
    UiTaskFormComponent,
    UiConfirmDialogComponent,
    UiTaskRiskFormComponent,
    UiContractorsListComponent,
    UiContractorFormComponent,
    UiInfoDialogComponent,
    PladisMethodViewerComponent,
    UiMethodDocViewComponent,
    PladisMethodReviewerComponent,
    UiReviewRejectComponent,
    NestleMethodEditorComponent,
    NestleMethodViewerComponent,
    NestleMethodReviewerComponent,
    PladisWorkpermitNewComponent,
    WpLocationScannerComponent,
    WpLocationApproveComponent,
    WpItemSelectorComponent,
    WpWorkInfoFormComponent,
    WpCheckboxListComponent,
    WpQuestionsComponent,
    WpGasMeasurementFormComponent,
    WpReviewApproveComponent,
    WorkpermitMainComponent,
    PladisWorkpermitViewComponent,
    PladisWorkpermitApproveComponent,
    WpDetailsViewComponent,
    WpApproveFormComponent,
    PladisWorkpermitExtendComponent,
    WpExtendApproveComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CommonModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatListModule,
    MatDialogModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatRadioModule,
    MatCardModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatTabsModule,
    MatPaginatorModule,
    MatTableModule,
    MatMenuModule,
    ZXingScannerModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ApiNoauthInterceptor, multi: true },
    PladisMethodEditorService,
    WindowMsgService,
    InfoDialogService,
    DecimalPipe,
    UUIDService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
