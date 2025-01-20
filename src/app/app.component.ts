import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HandDetectionComponent } from './components/hand-detection/hand-detection.component';
import { CameraComponent } from './shared/camera/camera.component';
import { WebcamDirective } from './shared/webcam/webcam.directive';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HandDetectionComponent, CameraComponent, WebcamDirective],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'advanced-detection-app';
}
