import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as handpose from '@tensorflow-models/handpose';
import * as tf from '@tensorflow/tfjs';

@Component({
  selector: 'app-hand-detection',
  templateUrl: './hand-detection.component.html',
  styleUrls: ['./hand-detection.component.css']
})
export class HandDetectionComponent implements AfterViewInit {
  @ViewChild('webcam', { static: true }) webcamElement: ElementRef<HTMLVideoElement>;
  private model: any;

  async ngAfterViewInit() {
    try {
      // Carregar o modelo de detecção de mãos
      this.model = await handpose.load();
      const video = this.webcamElement.nativeElement;
      this.startVideo(video);
    } catch (error) {
      console.error('Erro ao carregar o modelo:', error);
    }
  }

  private async startVideo(video: HTMLVideoElement) {
    try {
      // Inicializa a webcam e atribui ao vídeo
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      video.onloadedmetadata = () => video.play();
      video.addEventListener('play', () => this.detectHands(video));
    } catch (error) {
      console.error('Erro ao iniciar a webcam:', error);
    }
  }

  private async detectHands(video: HTMLVideoElement) {
    const canvas = video.nextElementSibling as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      setInterval(async () => {
        try {
          const predictions = await this.model.estimateHands(video);
          ctx.drawImage(video, 0, 0, ctx.canvas.width, ctx.canvas.height);

          predictions.forEach((hand: any) => {
            // Desenhar cada ponto de landmark
            hand.landmarks.forEach(([x, y]: [number, number]) => {
              ctx.fillStyle = 'blue';
              ctx.beginPath();
              ctx.arc(x, y, 5, 0, Math.PI * 2);
              ctx.fill();
            });

            // Adicionar traços entre os landmarks
            if (hand.landmarks.length > 1) {
              ctx.strokeStyle = 'green';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(hand.landmarks[0][0], hand.landmarks[0][1]); // Primeiro ponto
              hand.landmarks.forEach(([x, y]: [number, number], index: number) => {
                if (index > 0) {
                  ctx.lineTo(x, y);
                }
              });
              ctx.stroke();
            }
          });
        } catch (error) {
          console.error('Erro ao estimar mãos:', error);
        }
      }, 50);  // Atualização do canvas a cada 50ms
    } else {
      console.error('Não foi possível obter o contexto 2D do canvas.');
    }
  }

}