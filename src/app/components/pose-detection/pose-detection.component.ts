import { Component, ElementRef, ViewChild, AfterViewInit, Input } from '@angular/core';
import * as posenet from '@tensorflow-models/posenet';

@Component({
    selector: 'app-pose-detector',
    templateUrl: './pose-detector.component.html',
    styleUrls: ['./pose-detector.component.css']
})
export class PoseDetectionComponent implements AfterViewInit {
    @ViewChild('webcam') videoRef!: ElementRef;
    @ViewChild('canvas') canvasRef!: ElementRef;
    @Input() videoClass: string;

    ngAfterViewInit(): void {
        this.startVideo();
    }

    async startVideo() {
        try {
            const video = this.videoRef.nativeElement;
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            video.onloadedmetadata = () => video.play();
            video.addEventListener('play', () => this.runPosenet());
        } catch (error) {
            console.error('Error starting the webcam:', error);
        }
    }

    async runPosenet() {
        const net = await posenet.load({
            inputResolution: { width: 640, height: 480 },
            quantBytes: 2, // Optional: Reduces the loaded model size
            architecture: "MobileNetV1", // Optional: Defines the model architecture
            outputStride: 16, // Defines the output precision
        });

        setInterval(() => {
            this.detect(net);
        }, 100);
    }

    async detect(net: any) {
        const video = this.videoRef.nativeElement;

        if (video.readyState === 4) {
            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;

            video.width = videoWidth;
            video.height = videoHeight;

            const pose = await net.estimateSinglePose(video);
            console.log(pose);

            this.drawCanvas(pose, videoWidth, videoHeight);
        }
    }

    drawCanvas(pose: any, videoWidth: number, videoHeight: number) {
        const canvas = this.canvasRef.nativeElement;
        const ctx = canvas.getContext('2d');

        canvas.width = videoWidth;
        canvas.height = videoHeight;

        drawKeypoints(pose['keypoints'], 0.6, ctx);
        drawSkeleton(pose['keypoints'], 0.7, ctx);
    }
}

export const drawKeypoints = (keypoints: any, minConfidence: number, ctx: CanvasRenderingContext2D) => {
    keypoints.forEach((keypoint: any) => {
        if (keypoint.score >= minConfidence) {
            const { x, y } = keypoint.position;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#64bcf4';
            ctx.fill();
        }
    });
};

export const drawSkeleton = (keypoints: any, minConfidence: number, ctx: CanvasRenderingContext2D) => {
    const adjacentKeyPoints = posenet.getAdjacentKeyPoints(keypoints, minConfidence);
    
    adjacentKeyPoints.forEach(([start, end]: any) => {
        ctx.beginPath();
        ctx.moveTo(start.position.x, start.position.y);
        ctx.lineTo(end.position.x, end.position.y);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#2a7fb5';
        ctx.stroke();
    });
};