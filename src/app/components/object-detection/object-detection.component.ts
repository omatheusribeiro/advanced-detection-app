import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';

@Component({
    selector: 'app-object-detection',
    templateUrl: './object-detection.component.html',
    styleUrls: ['./object-detection.component.css']
})
export class ObjectDetectionComponent implements AfterViewInit {
    @ViewChild('webcam', { static: false }) webcamElement: ElementRef<HTMLVideoElement>;
    private model: any;
    private detectionInterval: any;

    async ngAfterViewInit() {
        this.model = await cocoSsd.load();
        const video = this.webcamElement.nativeElement;
        this.startVideo(video);
    }

    private async startVideo(video: HTMLVideoElement) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.onloadedmetadata = () => video.play();
    }

    public async startDetection() {
        const video = this.webcamElement.nativeElement;
        const canvas = video.nextElementSibling as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            this.detectionInterval = setInterval(async () => {
                const predictions = await this.model.detect(video);

                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                predictions.forEach((p: any) => {
                    // Aqui estamos filtrando objetos que NÃO sejam pessoas
                    if (p.class !== 'person') {
                        ctx.strokeStyle = 'purple';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(p.bbox[0], p.bbox[1], p.bbox[2], p.bbox[3]);
                        ctx.fillStyle = 'purple';
                        ctx.fillText(p.class, p.bbox[0], p.bbox[1] - 5);
                    }
                });
            }, 50);
        }
    }

    public stopDetection() {
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
        }
    }
}
