import { createReducer, on } from '@ngrx/store';
import { ClassesModel } from '../models/classes.model';
import { EnrolsModel } from '../models/enrols.model';
import { TermsModel } from '../models/terms.model';
import * as enrolmentActions from './enrolment.actions';
import { editClassFail } from './enrolment.actions';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { EnrolStats } from '../models/enrol-stats.model';
import { RegisterModel } from '../../attendance/models/register.model';

export interface State {
  terms: TermsModel[];
  classes: ClassesModel[];
  enrols: EnrolsModel[];
  registeredStudents: StudentsModel[];
  isLoading: boolean;
  errorMessage: string;
  deleteSuccess: boolean | null;
  // addSuccess: boolean | null;
  enrolStats: EnrolStats | null;
  migrateClassResult: boolean;
}

export const initialState: State = {
  terms: [],
  classes: [],
  enrols: [],
  registeredStudents: [],
  isLoading: false,
  errorMessage: '',
  deleteSuccess: null,
  // addSuccess: null,
  enrolStats: null,
  migrateClassResult: false,
};

export const enrolmentReducer = createReducer(
  initialState,
  on(enrolmentActions.fetchClasses, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(enrolmentActions.fetchClassesSuccess, (state, { classes }) => ({
    ...state,
    classes,
    errorMessage: '',
    isLoading: false,
  })),
  on(enrolmentActions.fetchClassesFailure, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    isLoading: false,
  })),
  on(enrolmentActions.addClassAction, (state, { clas }) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(enrolmentActions.addClassActionSuccess, (state, { clas }) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
    classes: [clas, ...state.classes],
    addSuccess: true,
  })),
  on(enrolmentActions.addClassActionFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
    addSuccess: false,
  })),
  on(enrolmentActions.deleteClassAction, (state, { name }) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(enrolmentActions.deleteClassSuccess, (state, { name }) => ({
    ...state,
    isLoading: false,
    classes: [...state.classes.filter((clas) => clas.name !== name)],
    deleteSuccess: true,
  })),
  on(enrolmentActions.deleteClassFail, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    isLoading: false,
    deleteSuccess: false,
  })),
  on(enrolmentActions.editClassAction, (state, { clas }) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(enrolmentActions.editClassSuccess, (state, { clas }) => ({
    ...state,
    isLoading: false,
    editSuccess: true,
    classes: [...state.classes.map((cl) => (cl.id !== clas.id ? cl : clas))],
  })),
  on(enrolmentActions.editClassFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
    editSuccess: false,
  })),
  on(enrolmentActions.fetchTerms, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(enrolmentActions.fetchTermsSuccess, (state, { terms }) => ({
    ...state,
    terms,
    errorMessage: '',
    isLoading: false,
  })),
  on(enrolmentActions.fetchTermsFailure, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    isLoading: false,
  })),
  on(enrolmentActions.addTermAction, (state, { term }) => ({
    ...state,
    isLoading: true,
  })),
  on(enrolmentActions.addTermActionSuccess, (state, { term }) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
    terms: [term, ...state.terms],
  })),
  on(enrolmentActions.addTermActionFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(enrolmentActions.editTermAction, (state, { term }) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(enrolmentActions.editTermSuccess, (state, { term }) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
    terms: [
      ...state.terms.map((trm) =>
        trm.num !== term.num && trm.year !== term.year ? trm : term
      ),
    ],
  })),
  on(enrolmentActions.fetchEnrols, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(enrolmentActions.getEnrolmentByClass, (state, { name, num, year }) => ({
    ...state,
    isLoading: true,
  })),
  on(enrolmentActions.getEnrolmentByClassSuccess, (state, { enrols }) => ({
    ...state,
    isLoading: false,
    enrols,
  })),
  on(enrolmentActions.getEnrolmentByClassFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(enrolmentActions.enrolStudents, (state, { enrols }) => ({
    ...state,
    isLoading: true,
  })),
  on(enrolmentActions.enrolStudentsSuccess, (state, { enrols }) => ({
    ...state,
    isLoading: false,
    enrols: [...enrols, ...state.enrols],
  })),
  on(enrolmentActions.enrolStudentsFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(enrolmentActions.fetchEnrolsStats, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(enrolmentActions.fetchEnrolsStatsSuccess, (state, { stats }) => ({
    ...state,
    isLoading: false,
    enrolStats: stats,
  })),
  on(enrolmentActions.fetchEnrolsStatsFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(
    enrolmentActions.UnenrolStudentActions.unenrolStudent,
    (state, { enrol }) => ({
      ...state,
      isLoading: true,
    })
  ),
  on(
    enrolmentActions.UnenrolStudentActions.unenrolStudentSuccess,
    (state, { enrol }) => ({
      ...state,
      isLoading: false,
      enrols: [
        ...state.enrols.filter(
          (enr) => enr.student.studentNumber !== enrol.student.studentNumber
        ),
      ],
    })
  ),
  on(
    enrolmentActions.UnenrolStudentActions.unenrolStudentFail,
    (state, { error }) => ({
      ...state,
      isLoading: false,
      errorMessage: error.message,
    })
  ),

  on(
    enrolmentActions.migrateClassActions.migrateClassEnrolment,
    (state, { fromName, fromNum, fromYear, toName, toNum, toYear }) => ({
      ...state,
      isLoading: true,
      errorMessage: '',
    })
  ),
  on(
    enrolmentActions.migrateClassActions.migrateClassEnrolmentSuccess,
    (state, { result }) => ({
      ...state,
      isLoading: false,
      errorMessage: '',
      migrateClassResult: result,
    })
  ),
  on(
    enrolmentActions.migrateClassActions.migrateClassEnrolmentFail,
    (state, { error }) => ({
      ...state,
      isLoading: false,
      errorMessage: error.message,
    })
  )
);
