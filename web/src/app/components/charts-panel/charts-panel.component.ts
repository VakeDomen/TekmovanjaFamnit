import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Match } from 'src/app/models/match.model';
import { Submission } from 'src/app/models/submission.model';

@Component({
  selector: 'app-charts-panel',
  templateUrl: './charts-panel.component.html',
  styleUrls: ['./charts-panel.component.sass']
})
export class ChartsPanelComponent implements OnChanges {


  @Input() submissions: Submission[] = [];
  @Input() matches: Match[] = [];


  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
  }
}
