import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NestleMethodEditorComponent } from './feature/nestle-method-editor/nestle-method-editor.component';
import { NestleMethodReviewerComponent } from './feature/nestle-method-reviewer/nestle-method-reviewer.component';
import { NestleMethodViewerComponent } from './feature/nestle-method-viewer/nestle-method-viewer.component';
import { PladisMethodEditorComponent } from './feature/pladis-method-editor/pladis-method-editor.component';
import { PladisMethodReviewerComponent } from './feature/pladis-method-reviewer/pladis-method-reviewer.component';
import { PladisMethodViewerComponent } from './feature/pladis-method-viewer/pladis-method-viewer.component';

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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
