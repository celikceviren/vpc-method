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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CommonModule,
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
  ],
  providers: [PladisMethodEditorService, WindowMsgService, InfoDialogService, DecimalPipe, UUIDService],
  bootstrap: [AppComponent],
})
export class AppModule {}
