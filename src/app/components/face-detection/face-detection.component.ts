import { Component, ElementRef, ViewChild, AfterViewInit, Input } from '@angular/core';
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
    @Input() classVideo: string;

    private model: any;

    async ngAfterViewInit() {
        try {
            this.model = await blazeface.load();
            const video = this.webcamElement.nativeElement;
            this.startVideo(video);
        } catch (error) {
            console.error('Error loading model:', error);
        }
    }

    private async startVideo(video: HTMLVideoElement) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            video.onloadedmetadata = () => video.play();
            video.addEventListener('play', () => this.detectFaces(video));
        } catch (error) {
            console.error('Error starting webcam:', error);
        }
    }

    private async detectFaces(video: HTMLVideoElement) {
        const canvas = this.canvasElement.nativeElement;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            setInterval(async () => {
                try {
                    const predictions = await this.model.estimateFaces(video, false);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    predictions.forEach((prediction: any) => {
                        const [x1, y1] = prediction.topLeft;
                        const [x2, y2] = prediction.bottomRight;

                        const width = x2 - x1;
                        const height = y2 - y1;

                        let approximateAge = 30;
                        const faceRatio = width / height;

                        if (faceRatio > 0.9) {
                            approximateAge -= 5;
                        } else if (faceRatio < 0.7) {
                            approximateAge += 5;
                        }

                        approximateAge = Math.max(18, Math.min(60, Math.floor(approximateAge)));

                        const expression = this.detectExpression(prediction.landmarks);

                        ctx.font = '16px Arial';
                        ctx.fillStyle = '#64bcf4';
                        ctx.fillText(`Age: ${approximateAge}`, x1, y2 + 20);
                        ctx.fillText(`Expression: ${expression}`, x1, y2 + 40);

                        ctx.strokeStyle = '#64bcf4';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(x1, y1, width, height);

                        prediction.landmarks.forEach(([px, py]: [number, number]) => {
                            ctx.fillStyle = '#64bcf4';
                            ctx.beginPath();
                            ctx.arc(px, py, 3, 0, Math.PI * 1.5);
                            ctx.fill();
                        });
                    });
                } catch (error) {
                    console.error('Error estimating faces:', error);
                }
            }, 50);
        } else {
            console.error('Cannot get canvas 2D context.');
        }
    }

    private detectExpression(landmarks: [number, number][]): string {
        if (landmarks.length < 6) {
            console.error('Insufficient number of landmarks to detect expressions.');
            return 'Neutral';
        }

        const [leftEye, rightEye, nose, mouthLeft, mouthRight, mouthBottom] = landmarks;

        const mouthWidth = Math.abs(mouthRight[0] - mouthLeft[0]);
        const mouthHeight = Math.abs(mouthBottom[1] - nose[1]);
        const eyeDistance = Math.abs(rightEye[0] - leftEye[0]);

        if (mouthHeight > 15 && mouthWidth > eyeDistance * 0.5) {
            return 'Happy';
        } else if (mouthHeight < 10 && mouthWidth < eyeDistance * 0.4) {
            return 'Sad';
        } else {
            return 'Neutral';
        }
    }
}