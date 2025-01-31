import { Component, ElementRef, ViewChild, AfterViewInit, Input } from '@angular/core';
import * as handpose from '@tensorflow-models/handpose';

@Component({
  selector: 'app-hand-detection',
  templateUrl: './hand-detection.component.html',
  styleUrls: ['./hand-detection.component.css']
})
export class HandDetectionComponent implements AfterViewInit {
  @ViewChild('webcam') webcamRef!: ElementRef;
  @ViewChild('canvas') canvasRef!: ElementRef;
  @Input() videoClass: string;

  ngAfterViewInit(): void {
    const video = this.webcamRef.nativeElement;
    this.startVideo(video);
  }

  private async startVideo(video: HTMLVideoElement) {
    try {
      // Initialize webcam and assign to the video
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      video.onloadedmetadata = () => video.play();
      video.addEventListener('play', () => this.loadHandpose());
    } catch (error) {
      console.error('Error starting webcam:', error);
    }
  }

  async loadHandpose() {
    const net = await handpose.load();
    console.log('Handpose model loaded.');
    setInterval(() => {
      this.detect(net);
    }, 100);
  }

  async detect(net: any) {
    const videoElement = this.webcamRef.nativeElement;

    if (videoElement.readyState === 4) {
      const videoWidth = videoElement.videoWidth;
      const videoHeight = videoElement.videoHeight;

      // Setting video and canvas dimensions
      videoElement.width = videoWidth;
      videoElement.height = videoHeight;

      const canvasElement = this.canvasRef.nativeElement;
      canvasElement.width = videoWidth;
      canvasElement.height = videoHeight;

      // Estimating hands
      const hand = await net.estimateHands(videoElement);
      console.log(hand);

      // Drawing hands
      const ctx = canvasElement.getContext('2d');
      drawHands(hand, ctx);
    }
  }
}

export const drawHands = (predictions: any, ctx: CanvasRenderingContext2D) => {
  if (predictions.length > 0) {
    predictions.forEach((prediction: any) => {
      const landmarks = prediction.landmarks;

      // Draw points
      for (let i = 0; i < landmarks.length; i++) {
        const [x, y] = landmarks[i];
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI); // Draw a circle at each point
        ctx.fillStyle = '#64bcf4';
        ctx.fill();
      }

      // Hand connections (optional)
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
        [0, 5], [5, 6], [6, 7], [7, 8], // Index finger
        [5, 9], [9, 10], [10, 11], [11, 12], // Middle finger
        [9, 13], [13, 14], [14, 15], [15, 16], // Ring finger
        [13, 17], [17, 18], [18, 19], [19, 20], // Pinky finger
      ];

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#2a7fb5';

      connections.forEach(([start, end]) => {
        ctx.beginPath();
        ctx.moveTo(landmarks[start][0], landmarks[start][1]); // Start point
        ctx.lineTo(landmarks[end][0], landmarks[end][1]); // End point
        ctx.stroke();
      });
    });
  }
};