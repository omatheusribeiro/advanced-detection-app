import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs';

@Component({
    selector: 'app-face-detection',
    templateUrl: './face-detection.component.html',
    styleUrls: ['./face-detection.component.css']
})
export class FaceDetectionComponent implements AfterViewInit {
    @ViewChild('webcam', { static: false }) webcamElement!: ElementRef<HTMLVideoElement>;
    @ViewChild('canvas', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;
    private model: any;

    async ngAfterViewInit() {
        this.model = await blazeface.load();
        const video = this.webcamElement.nativeElement;
        this.startVideo(video);
    }

    private async startVideo(video: HTMLVideoElement) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.onloadedmetadata = () => video.play();
        video.addEventListener('play', () => this.detectFaces(video));
    }

    private async detectFaces(video: HTMLVideoElement) {
        const canvas = this.canvasElement.nativeElement;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            setInterval(async () => {
                const predictions = await this.model.estimateFaces(video, false);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                predictions.forEach((prediction: any) => {
                    const [x, y, width, height] = prediction.topLeft.concat(prediction.bottomRight)
                        .map((coord: number[], i: number) => (i % 2 === 0 ? coord[0] : coord[1]));

                    // Draw bounding box
                    ctx.strokeStyle = '#FF0000';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x, y, width - x, height - y);

                    // Draw keypoints
                    prediction.landmarks.forEach(([px, py]: [number, number]) => {
                        ctx.fillStyle = 'blue';
                        ctx.beginPath();
                        ctx.arc(px, py, 3, 0, Math.PI * 2);
                        ctx.fill();
                    });
                });
            }, 100);
        } else {
            console.error('Cannot get canvas 2D context.');
        }
    }
}
