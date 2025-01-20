import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as handpose from '@tensorflow-models/handpose';
import * as tf from '@tensorflow/tfjs';

@Component({
    selector: 'app-hand-detection',
    templateUrl: './hand-detection.component.html',
    styleUrls: ['./hand-detection.component.css']
})
export class HandDetectionComponent implements AfterViewInit {
    @ViewChild('webcam', { static: false }) webcamElement: ElementRef<HTMLVideoElement>;
    private model: any;

    async ngAfterViewInit() {
        this.model = await handpose.load();
        const video = this.webcamElement.nativeElement;
        this.startVideo(video);
    }

    private async startVideo(video: HTMLVideoElement) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.onloadedmetadata = () => video.play();
        video.addEventListener('play', () => this.detectHands(video));
    }

    private async detectHands(video: HTMLVideoElement) {
        if (video.parentElement && video.parentElement instanceof HTMLCanvasElement) {
            const ctx = video.parentElement.getContext('2d');
            if (ctx) {
                setInterval(async () => {
                    const predictions = await this.model.estimateHands(video);
                    ctx.drawImage(video, 0, 0, ctx.canvas.width, ctx.canvas.height);

                    predictions.forEach((p: any) => {
                        p.landmarks.forEach(([x, y] : any) => {
                            ctx.fillStyle = 'blue';
                            ctx.beginPath();
                            ctx.arc(x, y, 5, 0, Math.PI * 2);
                            ctx.fill();
                        });
                    });
                }, 500);
            } else {
                console.error('Não foi possível obter o contexto 2D do canvas.');
            }

        } else {
            console.error('O parentElement é nulo ou não é um canvas válido.');
        }
    }
}
