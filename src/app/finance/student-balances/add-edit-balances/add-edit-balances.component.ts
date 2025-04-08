import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { BalancesModel } from '../../models/balances.model';
import { Store } from '@ngrx/store';
import { balancesActions } from '../../store/finance.actions';

@Component({
  selector: 'app-add-edit-balances',
  templateUrl: './add-edit-balances.component.html',
  styleUrls: ['./add-edit-balances.component.css'],
})
export class AddEditBalancesComponent implements OnInit {
  @Input()
  student!: StudentsModel;

  balancesForm!: FormGroup;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.balancesForm = new FormGroup({
      amount: new FormControl('', Validators.required),
      // description: new FormControl('')
    });
  }

  get amount() {
    return this.balancesForm.get('amount');
  }

  saveBalance() {
    const amount = this.amount?.value;
    const studentNumber = this.student.studentNumber;
    const balance: BalancesModel = {
      amount,
      studentNumber,
    };
    console.log('save balance: ', balance);
    this.store.dispatch(balancesActions.saveBalance({ balance }));
  }
}
