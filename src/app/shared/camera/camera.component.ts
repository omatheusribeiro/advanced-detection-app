import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
    selector: 'app-camera',
    templateUrl: './camera.component.html',
    styleUrls: ['./camera.component.css']
})
export class CameraComponent implements AfterViewInit {
    @ViewChild('webcam', { static: false }) webcamElement!: ElementRef<HTMLVideoElement>;

    isCameraActive: boolean = false;

    async ngAfterViewInit() {
        // Verifique se a câmera está ativa
        if (this.isCameraActive) {
            await this.startCamera();
        }
    }

    async startCamera() {
        try {
            const video = this.webcamElement.nativeElement;
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            video.onloadedmetadata = () => video.play();
            this.isCameraActive = true;
        } catch (error) {
            console.error('Erro ao acessar a câmera:', error);
        }
    }

    stopCamera() {
        const video = this.webcamElement.nativeElement;
        const stream = video.srcObject as MediaStream;

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }

        this.isCameraActive = false;
    }
}
