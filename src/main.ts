import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';import * as tf from '@tensorflow/tfjs';

async function initializeTensorFlow() {
  try {
    // Forçando o backend para WebGL ou CPU
    await tf.setBackend('webgl');
    console.log('TensorFlow.js backend initialized');
  } catch (error) {
    console.error('Error initializing TensorFlow.js:', error);
  }
}

initializeTensorFlow();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
