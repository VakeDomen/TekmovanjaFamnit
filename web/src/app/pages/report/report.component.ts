import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ReportService } from 'src/app/services/report.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.sass']
})
export class ReportComponent implements OnInit {
  
  public report: string = '';

  constructor(
    private reportService: ReportService,
    private toast: ToastrService,
  ) { }

  ngOnInit(): void {
  }


  submitReport() {
    this.reportService.sendReport(this.report).subscribe((resp: any) => {
      this.toast.success("Report send!", "Success!");
      this.report = '';
    }, err => {
      this.toast.error("Unable to send report!", "Error!");
    });

  }

}
