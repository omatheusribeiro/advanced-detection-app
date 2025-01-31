import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { WebcamDirective } from './shared/webcam/webcam.directive';
import { PoseDetectionComponent } from './components/pose-detection/pose-detection.component';
import { HandDetectionComponent } from './components/hand-detection/hand-detection.component';
import { ObjectDetectionComponent } from './components/object-detection/object-detection.component';
import { FaceDetectionComponent } from './components/face-detection/face-detection.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, WebcamDirective, HandDetectionComponent, PoseDetectionComponent, ObjectDetectionComponent, FaceDetectionComponent],
  templateUrl: './app.component.html',
  styleUrls: ['/app.component.css']
})
export class AppComponent {
  title = 'advanced-detection-app';

  switches = [
    { id: 'face-detection', label: 'Face Detection', checked: true },
    { id: 'object-detection', label: 'Object Detection', checked: false },
    { id: 'hand-detection', label: 'Hand Detection', checked: false },
    { id: 'pose-detection', label: 'Pose Detection', checked: false }
  ];

  activeComponent: string | null = 'face-detection';

  toggleSwitch(selectedIndex: number) {
    this.switches = this.switches.map((switchItem, index) => ({
      ...switchItem,
      checked: index === selectedIndex
    }));

    this.activeComponent = this.switches[selectedIndex].checked ? this.switches[selectedIndex].id : null;
  }
}
