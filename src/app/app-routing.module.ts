import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AreagroupsListComponent } from './feature/areagroups-list/areagroups-list.component';
import { AreasListComponent } from './feature/areas-list/areas-list.component';
import { CommonCtreviewFormComponent } from './feature/common-ctreview-form/common-ctreview-form.component';
import { CommonCtreviewMainComponent } from './feature/common-ctreview-main/common-ctreview-main.component';
import { CommonWorkpermitFormsComponent } from './feature/common-workpermit-forms/common-workpermit-forms.component';
import { WorkpermitMainComponent } from './feature/common-workpermit-main/common-workpermit-main.component';
import { NestleMethodEditorComponent } from './feature/nestle-method-editor/nestle-method-editor.component';
import { NestleMethodReviewerComponent } from './feature/nestle-method-reviewer/nestle-method-reviewer.component';
import { NestleMethodViewerComponent } from './feature/nestle-method-viewer/nestle-method-viewer.component';
import { PladisMethodEditorComponent } from './feature/pladis-method-editor/pladis-method-editor.component';
import { PladisMethodReviewerComponent } from './feature/pladis-method-reviewer/pladis-method-reviewer.component';
import { PladisMethodViewerComponent } from './feature/pladis-method-viewer/pladis-method-viewer.component';
import { PladisWorkpermitApproveComponent } from './feature/pladis-workpermit-approve/pladis-workpermit-approve.component';
import { PladisWorkpermitCloseApproveComponent } from './feature/pladis-workpermit-close-approve/pladis-workpermit-close-approve.component';
import { PladisWorkpermitExtendComponent } from './feature/pladis-workpermit-extend/pladis-workpermit-extend.component';
import { PladisWorkpermitNewComponent } from './feature/pladis-workpermit-new/pladis-workpermit-new.component';
import { PladisWorkpermitViewComponent } from './feature/pladis-workpermit-view/pladis-workpermit-view.component';

const routes: Routes = [
  {
    path: 'doc/edit/PLADIS/:versionCode',
    component: PladisMethodEditorComponent,
  },
  {
    path: 'doc/view/PLADIS/:versionCode',
    component: PladisMethodViewerComponent,
  },
  {
    path: 'doc/review/PLADIS/:versionCode',
    component: PladisMethodReviewerComponent,
  },
  {
    path: 'doc/edit/NESTLE/:versionCode',
    component: NestleMethodEditorComponent,
  },
  {
    path: 'doc/view/NESTLE/:versionCode',
    component: NestleMethodViewerComponent,
  },
  {
    path: 'doc/review/NESTLE/:versionCode',
    component: NestleMethodReviewerComponent,
  },
  {
    path: 'workpermit/main/:company',
    component: WorkpermitMainComponent,
  },
  {
    path: 'workpermit/new/PLADIS',
    component: PladisWorkpermitNewComponent,
  },
  {
    path: 'workpermit/extend/PLADIS',
    component: PladisWorkpermitExtendComponent,
  },
  {
    path: 'workpermit/approve/PLADIS/:kind',
    component: PladisWorkpermitApproveComponent,
  },
  {
    path: 'workpermit/view/PLADIS/:id/:role',
    component: PladisWorkpermitViewComponent,
  },
  {
    path: 'workpermit/form/:company/:formtype',
    component: CommonWorkpermitFormsComponent,
  },
  {
    path: 'workpermit/approve-close/PLADIS/:kind',
    component: PladisWorkpermitCloseApproveComponent,
  },
  {
    path: 'ctreview/form/:company/:type/:param',
    component: CommonCtreviewFormComponent,
  },
  {
    path: 'ctreview/main/:company',
    component: CommonCtreviewMainComponent,
  },
  {
    path: 'aregroups',
    component: AreagroupsListComponent,
  },
  {
    path: 'areas',
    component: AreasListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
