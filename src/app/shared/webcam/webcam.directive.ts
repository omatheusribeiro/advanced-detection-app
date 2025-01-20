import { Directive, ElementRef, Renderer2, HostListener } from '@angular/core';

@Directive({
  selector: '[appWebcam]'
})
export class WebcamDirective {

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('click') onClick() {
    const videoElement = this.renderer.createElement('video');
    videoElement.setAttribute('autoplay', 'true');
    this.renderer.appendChild(this.el.nativeElement, videoElement);
    this.startWebcam(videoElement);
  }

  private async startWebcam(videoElement: HTMLVideoElement) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoElement.srcObject = stream;

      videoElement.onloadedmetadata = () => {
        videoElement.play();
      };
    } catch (err) {
      console.error("Erro ao iniciar a webcam: ", err);
    }
  }
}