import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { CameraComponent } from './shared/camera/camera.component';
import { WebcamDirective } from './shared/webcam/webcam.directive';
import { PoseDetectionComponent } from './components/pose-detection/pose-detection.component';
import { HandDetectionComponent } from './components/hand-detection/hand-detection.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CameraComponent, WebcamDirective, HandDetectionComponent, PoseDetectionComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'advanced-detection-app';
}
