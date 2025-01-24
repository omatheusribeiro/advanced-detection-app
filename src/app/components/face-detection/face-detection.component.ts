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
                        const [x1, y1] = prediction.topLeft; // Coordenadas do canto superior esquerdo
                        const [x2, y2] = prediction.bottomRight; // Coordenadas do canto inferior direito

                        const width = x2 - x1; // Largura do rosto
                        const height = y2 - y1; // Altura do rosto

                        // Estimar a idade com base na largura e altura do rosto
                        let approximateAge = 30; // Valor base para estimativa
                        const faceRatio = width / height;

                        if (faceRatio > 0.9) {
                            approximateAge -= 5; // Rostos mais largos tendem a ser mais jovens
                        } else if (faceRatio < 0.7) {
                            approximateAge += 5; // Rostos mais alongados tendem a ser mais velhos
                        }

                        approximateAge = Math.max(18, Math.min(60, Math.floor(approximateAge))); // Limitar a idade entre 18 e 60

                        // Identificar expressão facial
                        const expression = this.detectExpression(prediction.landmarks);

                        // Exibir a idade abaixo do retângulo
                        ctx.font = '16px Arial';
                        ctx.fillStyle = 'purple';
                        ctx.fillText(`Idade: ${approximateAge}`, x1, y2 + 20); // Texto logo abaixo do retângulo

                        // Exibir a expressão dentro do retângulo
                        ctx.fillText(`Expressão: ${expression}`, x1, y2 + 40); // Texto logo abaixo da idade

                        // Desenhar o retângulo ao redor do rosto
                        ctx.strokeStyle = 'purple';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(x1, y1, width, height);

                        // Desenhar landmarks
                        prediction.landmarks.forEach(([px, py]: [number, number]) => {
                            ctx.fillStyle = 'purple';
                            ctx.beginPath();
                            ctx.arc(px, py, 3, 0, Math.PI * 1.5);
                            ctx.fill();
                        });
                    });


                } catch (error) {
                    console.error('Erro ao estimar faces:', error);
                }
            }, 50); // Atualiza o canvas a cada 50ms
        } else {
            console.error('Cannot get canvas 2D context.');
        }
    }

    private detectExpression(landmarks: [number, number][]): string {
        // Verificar se existem landmarks suficientes
        if (landmarks.length < 6) {
            console.error('Número insuficiente de landmarks para detectar expressões.');
            return 'Neutro';
        }

        // Coordenadas dos landmarks relevantes
        const [leftEye, rightEye, nose, mouthLeft, mouthRight, mouthBottom] = landmarks;

        // Calcular distâncias para análise
        const mouthWidth = Math.abs(mouthRight[0] - mouthLeft[0]); // Largura da boca
        const mouthHeight = Math.abs(mouthBottom[1] - nose[1]); // Altura da boca (distância do nariz ao centro inferior da boca)
        const eyeDistance = Math.abs(rightEye[0] - leftEye[0]); // Distância entre os olhos

        // Lógica para determinar a expressão
        if (mouthHeight > 15 && mouthWidth > eyeDistance * 0.5) {
            return 'Feliz'; // Boca aberta e larga
        } else if (mouthHeight < 10 && mouthWidth < eyeDistance * 0.4) {
            return 'Triste'; // Boca pequena e fechada
        } else {
            return 'Neutro'; // Caso padrão
        }
    }
}
