import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { CalendarOptions } from '@fullcalendar/angular';
import { ScheduleEvent, User } from 'shared/models/models';
import { NavigationService } from 'src/app/navigation.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import * as moment from 'moment';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {

  userId!: number;
  scheduleEvents: ScheduleEvent[] = []
  displayEvents: any[] = [];
  isLoading: boolean = false;

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    contentHeight: '75vh',
    allDaySlot: false,
    events: this.displayEvents
  };

  constructor(
    private scheduleService: ScheduleService,
    private navigationService: NavigationService,
    private snackBar: MatSnackBar,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.activatedRoute.paramMap.subscribe(
      params => {
        this.userId = parseInt(params.get('userId')!);

        console.log('path param:', this.userId);
      
        this.scheduleService.getSchedule(this.userId)
          .subscribe(
            res => {
              console.log(res);
              this.scheduleEvents = res;
              this.scheduleEvents.forEach(e => {
                this.displayEvents.push(
                  {
                    title: `${e.patientFullName}, ${e.location}`,
                    start: `${e.startDateTime}`,
                    end: `${e.endDateTime}`,
                    id: `${e.scheduleId}`
                  }
                )
              }
              )
              this.calendarOptions = {
                initialView: 'timeGridWeek',
                contentHeight: '75vh',
                weekends: false,
                allDaySlot: false,
                nowIndicator: true,
                slotMinTime: '06:00:00',
                slotMaxTime: '23:00:00',
                scrollTime: '07:00:00',
                events: this.displayEvents
              };
              this.isLoading = false;
            },
            err => {
              this.snackBar.open(
                'Failed to retrive schedule', 'Dismiss', { duration: 10000, panelClass: ['snackbar-error']});
                this.navigationService.goHome();
            }
      )
    },
    err => {
      this.navigationService.goLogin();
    });
  }

}
