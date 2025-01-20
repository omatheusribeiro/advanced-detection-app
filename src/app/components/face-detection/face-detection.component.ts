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
        try {
            this.model = await blazeface.load();
            const video = this.webcamElement.nativeElement;
            this.startVideo(video);
        } catch (error) {
            console.error('Erro ao carregar o modelo:', error);
        }
    }

    private async startVideo(video: HTMLVideoElement) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            video.onloadedmetadata = () => video.play();
            video.addEventListener('play', () => this.detectFaces(video));
        } catch (error) {
            console.error('Erro ao iniciar a webcam:', error);
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
                    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpar o canvas antes de desenhar uma nova frame
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height); // Desenhar o vídeo no canvas

                    predictions.forEach((prediction: any) => {
                        if (!prediction || prediction.landmarks.length < 5) {
                            console.error('Landmarks insuficientes para detecção de olhos');
                            return;
                        }

                        const [x, y, width, height] = prediction.topLeft.concat(prediction.bottomRight)
                            .map((coord: number[], i: number) => (i % 2 === 0 ? coord[0] : coord[1]));

                        // Desenhar contorno ao redor do rosto
                        ctx.strokeStyle = '#FF0000';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(x, y, width - x, height - y);

                        // Desenhar keypoints e calcular a idade aproximada
                        prediction.landmarks.forEach(([px, py]: [number, number]) => {
                            ctx.fillStyle = 'blue';
                            ctx.beginPath();
                            ctx.arc(px, py, 3, 0, Math.PI * 2);
                            ctx.fill();
                        });

                        // Calcular a idade com base na largura da face
                        const faceWidth = width - x;
                        const approximateAge = Math.max(18, Math.min(60, Math.floor(faceWidth * 0.5))); // Exemplo de cálculo simples
                        ctx.font = '14px Arial';
                        ctx.fillStyle = 'black';
                        ctx.fillText(`Age: 20`, x, y - 10); // Mostra a idade acima do rosto

                        // Identificar a expressão facial
                        const eyeDistances: [number, number][][] = this.calculateEyeDistance(prediction.landmarks);
                        if (eyeDistances.length > 0) {
                            const expression = this.detectExpression(eyeDistances);
                            ctx.fillText(`Expression: ${expression}`, x, y - 30); // Mostra a expressão facial abaixo da idade
                        }
                    });
                } catch (error) {
                    console.error('Erro ao estimar faces:', error);
                }
            }, 50); // Atualiza o canvas a cada 50ms
        } else {
            console.error('Cannot get canvas 2D context.');
        }
    }


    private calculateEyeDistance(landmarks: number[][]): any {
        try {
            const leftEye: number[][] = landmarks.slice(0, 6).map(coord => [coord[0], coord[1]]);  // Extrair o par [x, y]
            const rightEye: number[][] = landmarks.slice(6, 12).map(coord => [coord[0], coord[1]]);  // Extrair o par [x, y]

            return [leftEye, rightEye];
        } catch (error) {
            console.error('Erro ao calcular a distância dos olhos:', error);
            return [];
        }
    }





    private detectExpression(eyeDistances: [number, number][][]) {
        const [leftEye, rightEye] = eyeDistances;

        const leftEyeWidth = Math.abs(leftEye?.[0]?.[0] - rightEye?.[0]?.[0]);
        const leftEyeHeight = Math.abs(leftEye?.[0]?.[1] - rightEye?.[0]?.[1]);
        const rightEyeWidth = Math.abs(leftEye?.[1]?.[0] - rightEye?.[1]?.[0]);
        const rightEyeHeight = Math.abs(leftEye?.[1]?.[1] - rightEye?.[1]?.[1]);

        if (leftEyeWidth === 0 || leftEyeHeight === 0 || rightEyeWidth === 0 || rightEyeHeight === 0) {
            return 'Neutral';  // Retorna Neutral se os olhos não puderem ser detectados
        }

        const eyeRatio = (leftEyeWidth / leftEyeHeight) + (rightEyeWidth / rightEyeHeight) / 2;

        if (eyeRatio > 2.5) {
            return 'Happy';
        } else if (eyeRatio < 2.0) {
            return 'Sad';
        } else {
            return 'Neutral';
        }
    }

}
