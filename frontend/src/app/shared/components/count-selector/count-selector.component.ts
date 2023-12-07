import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'count-selector',
  templateUrl: './count-selector.component.html',
  styleUrls: ['./count-selector.component.scss']
})
export class CountSelectorComponent {
  @Input() public count: number = 1;
  @Output() public onCountChange: EventEmitter<number> = new EventEmitter<number>();

  public countChange(): void {
    this.onCountChange.emit(this.count);
  }

  public decreaseCount(): void {
    if (this.count > 1) {
      this.count--;
      this.countChange();
    }
  }

  public increaseCount(): void {
    this.count++;
    this.countChange();
  }
}
