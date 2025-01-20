import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as posedetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';

@Component({
    selector: 'app-pose-detection',
    templateUrl: './pose-detection.component.html',
    styleUrls: ['./pose-detection.component.css']
})
export class PoseDetectionComponent implements AfterViewInit {
    @ViewChild('canvas', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;
    @ViewChild('webcam', { static: false }) webcamElement!: ElementRef<HTMLVideoElement>;

    private model: any;

    async ngAfterViewInit() {
        this.model = await posedetection.createDetector(posedetection.SupportedModels.MoveNet);
        const video = this.webcamElement.nativeElement;
        this.startVideo(video);
    }

    private async startVideo(video: HTMLVideoElement) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.onloadedmetadata = () => video.play();
        video.addEventListener('play', () => this.detectPoses(video));
    }

    private async detectPoses(video: HTMLVideoElement) {
        const canvas = this.canvasElement.nativeElement;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            setInterval(async () => {
                const poses = await this.model.estimatePoses(video);
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                poses.forEach((pose: any) => {
                    pose.keypoints.forEach(({ x, y, score }: any) => {
                        if (score > 0.5) {
                            ctx.fillStyle = 'green';
                            ctx.beginPath();
                            ctx.arc(x, y, 5, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    });
                });
            }, 500);
        } else {
            console.error('Erro ao acessar o contexto do canvas.');
        }
    }

}