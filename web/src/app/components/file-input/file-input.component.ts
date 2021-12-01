import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-file-input',
  templateUrl: './file-input.component.html',
  styleUrls: ['./file-input.component.sass']
})
export class FileInputComponent implements OnInit {

  @Input() public label = "Choose a file...";
  @Input() public fileName = "";
  @Output() fileSelected = new EventEmitter<File>();

  constructor() { }

  ngOnInit(): void {
  }

  handleFileInput(files: any | null) {
    if (!files) {
      return;
    }
    const file = files.target?.files.item(0);
    if (file) {
      this.fileSelected.emit(file);
    }
  }

}
