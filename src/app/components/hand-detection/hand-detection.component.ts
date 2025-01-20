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
                    hand.landmarks.forEach(([x, y]: any) => {
                        ctx.fillStyle = 'blue';
                        ctx.beginPath();
                        ctx.arc(x, y, 5, 0, Math.PI * 2);
                        ctx.fill();
                    });
                });
            } catch (error) {
                console.error('Erro ao estimar mãos:', error);
            }
        }, 100);  // Aqui o intervalo foi reduzido para 300ms para ser mais rápido.        
    } else {
      console.error('Não foi possível obter o contexto 2D do canvas.');
    }
  }
}