#!/usr/bin/env ts-node

const tf = require('@tensorflow/tfjs-node');
import TensorFlowMedicalCNN from '../services/aiAlgorithms/tensorflowCNN';
import path from 'path';

/**
 * Training Script for Medical AI Model
 * 
 * This script demonstrates how to:
 * 1. Create a new CNN model
 * 2. Generate synthetic training data
 * 3. Train the model
 * 4. Evaluate performance
 * 5. Save the trained model
 */

class ModelTrainer {
  private cnn: TensorFlowMedicalCNN;
  private modelsDir: string;

  constructor() {
    this.cnn = new TensorFlowMedicalCNN();
    this.modelsDir = path.join(__dirname, '../../models');
  }

  /**
   * Main training pipeline
   */
  async runTraining(): Promise<void> {
    try {
      console.log('🚀 Starting Medical AI Model Training Pipeline...\n');

      // Step 1: Create model architecture
      console.log('📋 Step 1: Creating CNN Model Architecture');
      const model = await this.cnn.createModel();
      console.log('✅ Model architecture created\n');

      // Step 2: Generate synthetic training data
      console.log('📊 Step 2: Generating Synthetic Training Data');
      const { trainingData, validationData, testData } = this.generateSyntheticData();
      console.log(`✅ Generated ${trainingData.images.length} training images`);
      console.log(`✅ Generated ${validationData.images.length} validation images`);
      console.log(`✅ Generated ${testData.images.length} test images\n`);

      // Step 3: Train the model
      console.log('🎯 Step 3: Training the Model');
      const trainingHistory = await this.cnn.trainModel(trainingData, validationData, {
        epochs: 50,
        batchSize: 32
      });
      console.log('✅ Model training completed\n');

      // Step 4: Evaluate model performance
      console.log('📈 Step 4: Evaluating Model Performance');
      const evaluation = await this.cnn.evaluate(testData);
      this.printEvaluationResults(evaluation);
      console.log('✅ Model evaluation completed\n');

      // Step 5: Save the trained model
      console.log('💾 Step 5: Saving Trained Model');
      const modelPath = path.join(this.modelsDir, 'medical-cnn-v1.0');
      await this.cnn.saveModel(`file://${modelPath}`);
      console.log(`✅ Model saved to: ${modelPath}\n`);

      // Step 6: Test prediction with saved model
      console.log('🧪 Step 6: Testing Saved Model');
      await this.testSavedModel(modelPath);

      console.log('🎉 Training Pipeline Completed Successfully!');
      console.log('\n📋 Next Steps:');
      console.log('1. Use the saved model in your AI service');
      console.log('2. Collect real medical image data');
      console.log('3. Fine-tune the model with real data');
      console.log('4. Deploy to production');

    } catch (error) {
      console.error('❌ Training pipeline failed:', error);
      process.exit(1);
    }
  }

  /**
   * Generate synthetic training data for demonstration
   * In practice, you would use real medical images
   */
  private generateSyntheticData(): {
    trainingData: { images: number[]; labels: number[] };
    validationData: { images: number[]; labels: number[] };
    testData: { images: number[]; labels: number[] };
  } {
    const imageSize = 224 * 224 * 3; // RGB image
    const numClasses = 10;
    
    // Training data: 10 images per class (reduced for demo)
    const trainingImages: number[] = [];
    const trainingLabels: number[] = [];
    
    for (let classIndex = 0; classIndex < numClasses; classIndex++) {
      for (let i = 0; i < 10; i++) {
        const image = this.generateSyntheticImage(classIndex, imageSize);
        // Flatten the array more efficiently
        for (let j = 0; j < image.length; j++) {
          trainingImages.push(image[j]);
        }
        trainingLabels.push(classIndex);
      }
    }

    // Validation data: 2 images per class (reduced for demo)
    const validationImages: number[] = [];
    const validationLabels: number[] = [];
    
    for (let classIndex = 0; classIndex < numClasses; classIndex++) {
      for (let i = 0; i < 2; i++) {
        const image = this.generateSyntheticImage(classIndex, imageSize);
        // Flatten the array more efficiently
        for (let j = 0; j < image.length; j++) {
          validationImages.push(image[j]);
        }
        validationLabels.push(classIndex);
      }
    }

    // Test data: 1 image per class (reduced for demo)
    const testImages: number[] = [];
    const testLabels: number[] = [];
    
    for (let classIndex = 0; classIndex < numClasses; classIndex++) {
      for (let i = 0; i < 1; i++) {
        const image = this.generateSyntheticImage(classIndex, imageSize);
        // Flatten the array more efficiently
        for (let j = 0; j < image.length; j++) {
          testImages.push(image[j]);
        }
        testLabels.push(classIndex);
      }
    }

    return {
      trainingData: { images: trainingImages, labels: trainingLabels },
      validationData: { images: validationImages, labels: validationLabels },
      testData: { images: testImages, labels: testLabels }
    };
  }

  /**
   * Generate a synthetic image with class-specific patterns
   */
  private generateSyntheticImage(classIndex: number, imageSize: number): Float32Array {
    const image = new Float32Array(imageSize);
    
    // Generate random pixel values with class-specific characteristics
    for (let i = 0; i < imageSize; i++) {
      let pixelValue = Math.random() * 255;
      
      // Add class-specific patterns
      switch (classIndex) {
        case 0: // Normal - more uniform
          pixelValue = pixelValue * 0.8 + 50;
          break;
        case 1: // Pneumonia - more variation
          pixelValue = pixelValue * 1.2 + Math.sin(i * 0.01) * 30;
          break;
        case 2: // Pulmonary Edema - high contrast
          pixelValue = pixelValue * 1.5 + (i % 100 < 50 ? 100 : 0);
          break;
        case 3: // Pneumothorax - linear patterns
          pixelValue = pixelValue + (i % 224 < 20 ? 80 : 0);
          break;
        case 4: // Pleural Effusion - smooth gradients
          pixelValue = pixelValue + Math.cos(i * 0.001) * 40;
          break;
        case 5: // Cardiomegaly - circular patterns
          const x = (i / 3) % 224;
          const y = Math.floor((i / 3) / 224);
          const centerX = 112;
          const centerY = 112;
          const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          if (distance < 60) pixelValue += 60;
          break;
        case 6: // Atelectasis - patchy patterns
          pixelValue = pixelValue + (Math.random() > 0.7 ? 70 : 0);
          break;
        case 7: // Consolidation - dense areas
          pixelValue = pixelValue + (Math.random() > 0.6 ? 90 : 0);
          break;
        case 8: // Pulmonary Nodule - small circular
          const nx = (i / 3) % 224;
          const ny = Math.floor((i / 3) / 224);
          const noduleX = 150;
          const noduleY = 150;
          const noduleDistance = Math.sqrt((nx - noduleX) ** 2 + (ny - noduleY) ** 2);
          if (noduleDistance < 15) pixelValue += 120;
          break;
        case 9: // Other - random patterns
          pixelValue = pixelValue + Math.sin(i * 0.02) * 50;
          break;
      }
      
      // Clamp values to 0-255 range
      image[i] = Math.max(0, Math.min(255, pixelValue));
    }
    
    return image;
  }

  /**
   * Print evaluation results in a formatted way
   */
  private printEvaluationResults(evaluation: {
    loss: number;
    accuracy: number;
    precision: number;
    recall: number;
    confusionMatrix: number[][];
  }): void {
    console.log('📊 Model Performance Results:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📉 Loss:           ${evaluation.loss.toFixed(4)}`);
    console.log(`🎯 Accuracy:       ${(evaluation.accuracy * 100).toFixed(2)}%`);
    console.log(`🎯 Precision:      ${(evaluation.precision * 100).toFixed(2)}%`);
    console.log(`🎯 Recall:         ${(evaluation.recall * 100).toFixed(2)}%`);
    console.log('');
    
    console.log('📋 Confusion Matrix:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const classNames = [
      'Normal', 'Pneumonia', 'Pulm.Edema', 'Pneumothorax', 'Pleural Eff',
      'Cardiomegaly', 'Atelectasis', 'Consolidation', 'Pulm.Nodule', 'Other'
    ];
    
    // Print header
    console.log('Pred\\True'.padEnd(15) + classNames.map(name => name.padEnd(12)).join(''));
    console.log('─'.repeat(135));
    
    // Print matrix rows
    evaluation.confusionMatrix.forEach((row, i) => {
      const className = classNames[i].padEnd(15);
      const values = row.map(val => val.toString().padEnd(12)).join('');
      console.log(className + values);
    });
  }

  /**
   * Test the saved model by loading it and making a prediction
   */
  private async testSavedModel(modelPath: string): Promise<void> {
    try {
      console.log('🔄 Loading saved model for testing...');
      
      // Create new CNN instance and load saved model
      const testCNN = new TensorFlowMedicalCNN();
      await testCNN.loadModel(modelPath);
      
      // Generate test image
      const testImage = this.generateSyntheticImage(1, 224 * 224 * 3); // Pneumonia class
      
      // Make prediction
      const prediction = await testCNN.predict(testImage);
      
      console.log('🧪 Test Prediction Results:');
      console.log(`   Diagnosis: ${prediction.diagnosis}`);
      console.log(`   Confidence: ${(prediction.confidence * 100).toFixed(1)}%`);
      console.log(`   Findings: ${prediction.findings.join(', ')}`);
      
      // Clean up
      testCNN.dispose();
      
      console.log('✅ Model testing completed successfully\n');
      
    } catch (error) {
      console.error('❌ Model testing failed:', error);
    }
  }

  /**
   * Generate a simple training report
   */
  private generateTrainingReport(history: any): void {
    console.log('📈 Training History Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (history.history.loss) {
      const finalLoss = history.history.loss[history.history.loss.length - 1];
      const initialLoss = history.history.loss[0];
      const finalLossNum = typeof finalLoss === 'number' ? finalLoss : 0;
      const initialLossNum = typeof initialLoss === 'number' ? initialLoss : 0;
      console.log(`📉 Loss: ${initialLossNum.toFixed(4)} → ${finalLossNum.toFixed(4)}`);
    }
    
    if (history.history.accuracy) {
      const finalAccuracy = history.history.accuracy[history.history.accuracy.length - 1];
      const initialAccuracy = history.history.accuracy[0];
      const finalAccuracyNum = typeof finalAccuracy === 'number' ? finalAccuracy : 0;
      const initialAccuracyNum = typeof initialAccuracy === 'number' ? initialAccuracy : 0;
      console.log(`🎯 Accuracy: ${(initialAccuracyNum * 100).toFixed(2)}% → ${(finalAccuracyNum * 100).toFixed(2)}%`);
    }
    
    if (history.history.val_loss) {
      const finalValLoss = history.history.val_loss[history.history.val_loss.length - 1];
      const finalValLossNum = typeof finalValLoss === 'number' ? finalValLoss : 0;
      console.log(`📊 Validation Loss: ${finalValLossNum.toFixed(4)}`);
    }
    
    if (history.history.val_accuracy) {
      const finalValAccuracy = history.history.val_accuracy[history.history.val_accuracy.length - 1];
      const finalValAccuracyNum = typeof finalValAccuracy === 'number' ? finalValAccuracy : 0;
      console.log(`📊 Validation Accuracy: ${(finalValAccuracyNum * 100).toFixed(2)}%`);
    }
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    // Check if TensorFlow.js is available
    if (!tf) {
      throw new Error('TensorFlow.js not available. Please install @tensorflow/tfjs-node');
    }

    console.log('🤖 Medical AI Model Training Script');
    console.log('=====================================\n');
    
    const trainer = new ModelTrainer();
    await trainer.runTraining();
    
  } catch (error) {
    console.error('❌ Training script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export default ModelTrainer;
