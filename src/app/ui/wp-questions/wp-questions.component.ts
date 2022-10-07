import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ControlQuestions, Question, QuestionGroup } from 'src/app/data/workpermit.model';
import { StaticValues } from 'src/app/data/common.model';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-wp-questions',
  templateUrl: './wp-questions.component.html',
  styleUrls: ['./wp-questions.component.scss'],
})
export class WpQuestionsComponent implements OnInit {
  @Input() controlQuestions!: ControlQuestions;
  @Output() complete: EventEmitter<ControlQuestions> = new EventEmitter<ControlQuestions>();
  @Output() cancel: EventEmitter<void> = new EventEmitter<void>();

  form!: FormGroup<{ notes: FormControl<string | null> }>;
  group!: QuestionGroup;
  groupIx: number = 0;
  title!: string;
  question!: Question;
  questionIx: number = 0;
  numTotalQuestions: number = 0;
  completed: boolean = false;

  optionYes = StaticValues.QUESTION_ANSWER_YES_CODE;
  optionYesText = StaticValues.QUESTION_ANSWER_YES_VALUE;
  optionNo = StaticValues.QUESTION_ANSWER_NO_CODE;
  optionNoText = StaticValues.QUESTION_ANSWER_NO_VALUE;
  optionNan = StaticValues.QUESTION_ANSWER_NAN_CODE;
  optionNanText = StaticValues.QUESTION_ANSWER_NAN_VALUE;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    if (
      !this.controlQuestions ||
      !this.controlQuestions?.questionGroups?.length ||
      !this.controlQuestions?.questionGroups[0].questions?.length
    ) {
      return;
    }

    //Note: Shortes questions
    /*
    this.controlQuestions.questionGroups.forEach((group) => {
      group.questions = group.questions.slice(0, 2);
    });
    */

    this.group = this.controlQuestions.questionGroups[0];
    this.title = this.group.name;
    this.numTotalQuestions = this.group.questions?.length;
    this.question = this.group.questions[0];
    this.form = this.formBuilder.group({
      notes: [this.controlQuestions.controlNotes ?? '', Validators.maxLength(250)],
    });
  }

  onOptionSelected(event: MatButtonToggleChange): void {
    this.question.answer = event.value;
    switch (event.value) {
      case StaticValues.QUESTION_ANSWER_YES_CODE:
        this.question.answerText = StaticValues.QUESTION_ANSWER_YES_VALUE;
        break;
      case StaticValues.QUESTION_ANSWER_NO_CODE:
        this.question.answerText = StaticValues.QUESTION_ANSWER_NO_VALUE;
        break;
      case StaticValues.QUESTION_ANSWER_NAN_CODE:
        this.question.answerText = StaticValues.QUESTION_ANSWER_NAN_VALUE;
        break;
      default:
        this.question.answer = 0;
        this.question.answerText = '';
        break;
    }
  }

  onPreviousQuestion(skipToGroupStart?: boolean): void {
    if (!this.groupIx && !this.questionIx) {
      return;
    }

    if (this.completed) {
      this.completed = false;
      return;
    }

    if (this.questionIx === 0) {
      this.groupIx--;
      this.group = this.controlQuestions.questionGroups[this.groupIx];
      this.title = this.group.name;
      this.numTotalQuestions = this.group.questions.length;
      this.questionIx = this.group.questions.length - 1;
      this.question = this.group.questions[this.questionIx];

      if (this.group.code === 'PLADIS_QGR1') {
        const firstQuestionAnswer = this.group.questions[0].answer;
        if (firstQuestionAnswer !== StaticValues.QUESTION_ANSWER_YES_CODE) {
          this.onPreviousQuestion(true);
        }
      }

      return;
    }

    this.questionIx--;
    this.question = this.group.questions[this.questionIx];
    this.completed = false;

    if (skipToGroupStart) {
      this.onPreviousQuestion(true);
    }
  }

  onNextQuestion(skipToGroupEnd?: boolean) {
    if (!this.question.answer) {
      return;
    }

    const shouldSkipPladisGroup =
      skipToGroupEnd ||
      (this.group.code === 'PLADIS_QGR1' &&
        this.questionIx === 0 &&
        this.question.answer !== StaticValues.QUESTION_ANSWER_YES_CODE);

    let newQuestionIx = this.questionIx + 1;
    if (newQuestionIx === this.group.questions.length) {
      const newGroupIx = this.groupIx + 1;
      newQuestionIx = 0;
      if (newGroupIx === this.controlQuestions.questionGroups.length) {
        this.completed = true;
        return;
      }

      this.groupIx++;
      this.group = this.controlQuestions.questionGroups[this.groupIx];
      this.title = this.group.name;
      this.numTotalQuestions = this.group.questions.length;
    }

    this.questionIx = newQuestionIx;
    this.question = this.group.questions[this.questionIx];

    if (shouldSkipPladisGroup && this.group.code === 'PLADIS_QGR1') {
      this.question.answer = StaticValues.QUESTION_ANSWER_NAN_CODE;
      this.question.answerText = StaticValues.QUESTION_ANSWER_NAN_VALUE;
      this.onNextQuestion(true);
    }
  }

  onSaveForm(): void {
    this.controlQuestions.controlNotes = this.form.controls.notes.value ?? '';
    this.complete.emit(this.controlQuestions);
  }
}
