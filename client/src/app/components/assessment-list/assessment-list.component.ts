import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable } from '@angular/material/table';
import { SelfAssessmentForTable, User, SelfAssessmentTest } from 'shared/models/models';
import { NavigationService } from 'src/app/navigation.service';
import { SelfAssessmentTestService } from 'src/app/services/self-assessment-test.service';
import { UserService } from 'src/app/services/user.service';
import { DialogChooseDoctorComponent } from '../view-self-assessments/dialog-choose-doctor/dialog-choose-doctor.component';
import { RejectionService } from 'src/app/services/rejection.service';
import { DialogConfirmComponent } from '../dialog-confirm/dialog-confirm.component';
import { DialogBookAppointmentComponent } from '../dialog-book-appointment/dialog-book-appointment.component';

@Component({
  selector: 'app-assessment-list',
  templateUrl: './assessment-list.component.html',
  styleUrls: ['./assessment-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AssessmentListComponent implements OnInit {

  @ViewChild(MatTable) table!: MatTable<SelfAssessmentForTable>;

  isLoading: boolean = true;
  currentUser!: User;
  displayedColumns: string[] = ['id', 'patient-name', 'patient-id', 'date'];
  dataSource!: SelfAssessmentForTable[];

  dataSourceInner!: SelfAssessmentForTable;
  displayedColumnsInner: string[] = ['question', 'answer'];
  expandedElement!: SelfAssessmentForTable | null;
  doctors: User[] = [];

  constructor(
    private selfAssessmentTestService: SelfAssessmentTestService,
    private userService: UserService,
    private rejectionService: RejectionService,    
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private navigationService: NavigationService
  ) { }

  refreshData() {
    this.userService.getCurrentUser().subscribe
    (res => {
      this.currentUser = res;
      // if nurse, get unviewed patients and list of doctors
      if (this.isNurse()) {
        console.log('Fetching patients for nurse');
        this.selfAssessmentTestService.getUnviewedTests()
        .subscribe(res => {
          this.dataSource = res;
        },
        err => {
          console.log(err)
        })
        this.userService.getDoctors()
        .subscribe(res => {
          this.doctors = res
          this.isLoading = false;
        },
          err => console.log(err)
        )
        // if doctor, get list of assigned doctors.
      } else if (this.isDoctor()) {
        console.log('Fetching patients for doctor');
        this.selfAssessmentTestService.getTestsForDoctor(this.currentUser.id)
        .subscribe(res => {
          this.dataSource = res;
          this.isLoading = false;
        },
        err => {
          console.log(err)
        })
      }
    },
    err => {
      this.navigationService.goLogin();
    });
  }

  ngOnInit(): void {
    this.refreshData();
  }

  yesOrNo(value: number): string {
    if (value === null) {
      return 'N/A';
    }
    return value === 1 ? 'Yes' : 'No';
  }

  ageRange(value: string): string {
    if (value === '5') {
      return '6 months - 5 years';
    }
    if (value === '6-17') {
      return '6-17 years';
    }
    if (value === '18+') {
      return '18 years+'
    } else {
      return 'N/A'
    }
  }

  rejectClicked(test: SelfAssessmentForTable) {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        question: 'Do you really want to reject this self-assessement test?'
      },
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res.isConfirm === true) {
        this.rejectionService.postRejectStatus(test).subscribe(
          response => {
            this.snackBar.open(
              'Patient succesfully rejected.', 'Dismiss', { duration: 10000});
            console.log("done")     
          }
        )
        this.refreshRows(test);
      }
    })
  };

  referToDoctorClicked(test: SelfAssessmentForTable) {
    const dialogRef = this.dialog.open(DialogChooseDoctorComponent, {
      data: {
        doctors: this.doctors
      },
    });

    dialogRef.afterClosed().subscribe(res => {
      this.selfAssessmentTestService.assignToDoctor(test, res.doctor)
      .subscribe(res => {
        this.snackBar.open(
          'Patient succesfully assigned to Doctor.', 'Dismiss', { duration: 10000});

        for (let i = 0; i < this.dataSource.length; i++) {
          if(this.dataSource[i].testId === test.testId) {
            this.dataSource.splice(i, 1);    
        }
        this.table.renderRows();
      }})});
  }

  bookAppointmentClicked(test: SelfAssessmentForTable) {
    let dialogRef = this.dialog.open(DialogBookAppointmentComponent, {
      data: {
        patientTest: test,
        professional: this.currentUser
      },
    });

    dialogRef.afterClosed().subscribe(x => {
      dialogRef.close();
      this.refreshData();
   });
  }

  isNurse() {
    return this.currentUser !== null ? this.currentUser.fkUserType === 3 : false;
  }

  isDoctor() {
    return this.currentUser !== null ? this.currentUser.fkUserType === 2 : false;
  }

  refreshRows(selfAssessmentForTable:SelfAssessmentForTable)
  {
    for (let i = 0; i < this.dataSource.length; i++) 
    {

             if(this.dataSource[i].userId == selfAssessmentForTable.userId)
             {
               //console.log(this.dataSource[i].email)
               this.dataSource.splice(i, 1);
             }
    }
    this.table.renderRows();
  }
}