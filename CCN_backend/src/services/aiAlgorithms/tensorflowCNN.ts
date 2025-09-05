import * as tf from '@tensorflow/tfjs-node';

// Medical Image CNN using TensorFlow.js
export class TensorFlowMedicalCNN {
  private model: tf.LayersModel | null = null;
  private isLoaded = false;
  private inputShape: [number, number, number] = [224, 224, 3]; // Standard input size
  private numClasses: number = 10; // Number of diagnosis classes

  constructor() {
    // Enable memory management for better performance
    tf.enableProdMode();
  }

  /**
   * Create a new CNN model architecture
   */
  async createModel(): Promise<tf.LayersModel> {
    console.log('🏗️ Creating Medical Image CNN architecture...');

    const model = tf.sequential({
      name: 'MedicalImageCNN'
    });

    // Input layer
    model.add(tf.layers.conv2d({
      inputShape: this.inputShape,
      filters: 32,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same',
      name: 'conv1'
    }));

    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));

    // Second convolutional block
    model.add(tf.layers.conv2d({
      filters: 64,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same',
      name: 'conv2'
    }));

    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));

    // Third convolutional block
    model.add(tf.layers.conv2d({
      filters: 128,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same',
      name: 'conv3'
    }));

    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));

    // Fourth convolutional block
    model.add(tf.layers.conv2d({
      filters: 256,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same',
      name: 'conv4'
    }));

    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));

    // Flatten and dense layers
    model.add(tf.layers.flatten());
    model.add(tf.layers.dropout({ rate: 0.5 }));

    model.add(tf.layers.dense({
      units: 512,
      activation: 'relu',
      name: 'dense1'
    }));

    model.add(tf.layers.dropout({ rate: 0.3 }));

    model.add(tf.layers.dense({
      units: 256,
      activation: 'relu',
      name: 'dense2'
    }));

    model.add(tf.layers.dropout({ rate: 0.3 }));

    // Output layer
    model.add(tf.layers.dense({
      units: this.numClasses,
      activation: 'softmax',
      name: 'output'
    }));

    // Compile the model
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'] // Only use available metrics
    });

    // Store the model in the instance
    this.model = model;
    this.isLoaded = true;

    console.log('✅ CNN model architecture created successfully');
    console.log('📊 Model summary:');
    model.summary();

    return model;
  }

  /**
   * Load a pre-trained model from file
   */
  async loadModel(modelPath: string): Promise<void> {
    try {
      console.log(`📥 Loading pre-trained model from: ${modelPath}`);
      
      // For local files, TensorFlow.js expects the path to model.json
      let modelUrl: string;
      if (modelPath.startsWith('file://')) {
        modelUrl = modelPath;
      } else if (modelPath.endsWith('.json')) {
        modelUrl = `file://${modelPath}`;
      } else {
        // If it's a directory, append model.json
        modelUrl = `file://${modelPath}/model.json`;
      }
      
      this.model = await tf.loadLayersModel(modelUrl);
      this.isLoaded = true;
      
      console.log('✅ Pre-trained model loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load pre-trained model:', error);
      throw error;
    }
  }

  /**
   * Save the trained model to file
   */
  async saveModel(modelPath: string): Promise<void> {
    if (!this.model) {
      throw new Error('No model to save');
    }

    try {
      console.log(`💾 Saving model to: ${modelPath}`);
      
      await this.model.save(modelPath);
      
      console.log('✅ Model saved successfully');
    } catch (error) {
      console.error('❌ Failed to save model:', error);
      throw error;
    }
  }

  /**
   * Train the model with medical image data
   */
  async trainModel(
    trainingData: {
      images: number[];
      labels: number[];
    },
    validationData: {
      images: number[];
      labels: number[];
    },
    options: {
      epochs: number;
      batchSize: number;
      callbacks?: tf.Callback[];
    }
  ): Promise<tf.History> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    try {
      console.log('🎯 Starting model training...');
      console.log(`📊 Training data: ${trainingData.images.length} images`);
      console.log(`📊 Validation data: ${validationData.images.length} images`);

      // Convert data to tensors
      const trainImages = tf.tensor4d(trainingData.images, [
        trainingData.labels.length,
        ...this.inputShape
      ]);
      
      const trainLabels = tf.oneHot(trainingData.labels, this.numClasses);
      
      const valImages = tf.tensor4d(validationData.images, [
        validationData.labels.length,
        ...this.inputShape
      ]);
      
      const valLabels = tf.oneHot(validationData.labels, this.numClasses);

      // Training callbacks
      const callbacks = [
        tf.callbacks.earlyStopping({
          monitor: 'val_loss',
          patience: 10
        }),
        // Note: reduceLROnPlateau is not available in this version
        // Using manual learning rate reduction instead
        ...(options.callbacks || [])
      ];

      // Train the model
      const history = await this.model.fit(trainImages, trainLabels, {
        epochs: options.epochs,
        batchSize: options.batchSize,
        validationData: [valImages, valLabels],
        callbacks,
        verbose: 1
      });

      // Clean up tensors
      trainImages.dispose();
      trainLabels.dispose();
      valImages.dispose();
      valLabels.dispose();

      console.log('✅ Model training completed successfully');
      return history;

    } catch (error) {
      console.error('❌ Model training failed:', error);
      throw error;
    }
  }

  /**
   * Predict diagnosis from medical image
   */
  async predict(imageData: Float32Array): Promise<{
    predictions: number[];
    diagnosis: string;
    confidence: number;
    findings: string[];
  }> {
    if (!this.model) {
      throw new Error('Model not loaded');
    }

    try {
      console.log('🔍 Running image prediction...');

      // Preprocess image
      const processedImage = this.preprocessImage(imageData);
      
      // Run prediction
      const predictions = this.model.predict(processedImage) as tf.Tensor;
      const predictionArray = await predictions.array() as number[][];
      
      // Get top prediction
      const topPrediction = predictionArray[0];
      const maxIndex = topPrediction.indexOf(Math.max(...topPrediction));
      const confidence = topPrediction[maxIndex];

      // Clean up tensors
      processedImage.dispose();
      predictions.dispose();

      // Generate diagnosis and findings
      const diagnosis = this.getDiagnosisLabel(maxIndex);
      const findings = this.generateFindings(topPrediction, confidence);

      console.log(`✅ Prediction completed: ${diagnosis} (${(confidence * 100).toFixed(1)}%)`);

      return {
        predictions: topPrediction,
        diagnosis,
        confidence,
        findings
      };

    } catch (error) {
      console.error('❌ Prediction failed:', error);
      throw error;
    }
  }

  /**
   * Preprocess image for model input
   */
  private preprocessImage(imageData: Float32Array): tf.Tensor4D {
    // Reshape image data
    const reshapedImage = tf.tensor4d(imageData, [1, ...this.inputShape]);
    
    // Normalize pixel values (0-255 to 0-1)
    const normalizedImage = tf.div(reshapedImage, 255.0) as tf.Tensor4D;
    
    // Apply data augmentation if needed
    // const augmentedImage = this.applyDataAugmentation(normalizedImage);
    
    return normalizedImage;
  }

  /**
   * Apply data augmentation for training
   */
  private applyDataAugmentation(image: tf.Tensor4D): tf.Tensor4D {
    // Random horizontal flip
    const shouldFlip = Math.random() > 0.5;
    if (shouldFlip) {
      return tf.image.flipLeftRight(image);
    }

    // Random rotation (small angles)
    const rotationAngle = (Math.random() - 0.5) * 0.2; // ±0.1 radians
    if (Math.abs(rotationAngle) > 0.05) {
      return tf.image.rotateWithOffset(image, rotationAngle);
    }

    // Random brightness adjustment
    const brightnessFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
    if (brightnessFactor !== 1.0) {
      return tf.mul(image, brightnessFactor);
    }

    return image;
  }

  /**
   * Get diagnosis label from prediction index
   */
  private getDiagnosisLabel(index: number): string {
    const diagnoses = [
      'Normal',
      'Pneumonia',
      'Pulmonary Edema',
      'Pneumothorax',
      'Pleural Effusion',
      'Cardiomegaly',
      'Atelectasis',
      'Consolidation',
      'Pulmonary Nodule',
      'Other'
    ];

    return diagnoses[index] || 'Unknown';
  }

  /**
   * Generate clinical findings from predictions
   */
  private generateFindings(predictions: number[], confidence: number): string[] {
    const findings: string[] = [];
    const threshold = 0.1; // Only report findings above 10% confidence

    predictions.forEach((prob, index) => {
      if (prob > threshold) {
        const diagnosis = this.getDiagnosisLabel(index);
        findings.push(`${diagnosis}: ${(prob * 100).toFixed(1)}%`);
      }
    });

    // Add confidence-based findings
    if (confidence > 0.8) {
      findings.push('High confidence in primary diagnosis');
    } else if (confidence > 0.6) {
      findings.push('Moderate confidence - consider additional tests');
    } else {
      findings.push('Low confidence - manual review recommended');
    }

    return findings;
  }

  /**
   * Fine-tune model with new data
   */
  async fineTune(
    newData: {
      images: number[];
      labels: number[];
    },
    options: {
      epochs: number;
      batchSize: number;
      learningRate: number;
    }
  ): Promise<tf.History> {
    if (!this.model) {
      throw new Error('Model not loaded');
    }

    try {
      console.log('🔧 Starting model fine-tuning...');

      // Compile with lower learning rate for fine-tuning
      this.model.compile({
        optimizer: tf.train.adam(options.learningRate),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy', 'precision', 'recall']
      });

      // Convert data to tensors
      const images = tf.tensor4d(newData.images, [
        newData.labels.length,
        ...this.inputShape
      ]);
      
      const labels = tf.oneHot(newData.labels, this.numClasses);

      // Fine-tune the model
      const history = await this.model.fit(images, labels, {
        epochs: options.epochs,
        batchSize: options.batchSize,
        validationSplit: 0.2,
        callbacks: [
          tf.callbacks.earlyStopping({
            monitor: 'val_loss',
            patience: 5,
            restoreBestWeights: true
          })
        ],
        verbose: 1
      });

      // Clean up tensors
      images.dispose();
      labels.dispose();

      console.log('✅ Model fine-tuning completed successfully');
      return history;

    } catch (error) {
      console.error('❌ Model fine-tuning failed:', error);
      throw error;
    }
  }

  /**
   * Evaluate model performance
   */
  async evaluate(
    testData: {
      images: number[];
      labels: number[];
    }
  ): Promise<{
    loss: number;
    accuracy: number;
    precision: number;
    recall: number;
    confusionMatrix: number[][];
  }> {
    if (!this.model) {
      throw new Error('Model not loaded');
    }

    try {
      console.log('📊 Evaluating model performance...');

      // Convert data to tensors
      const images = tf.tensor4d(testData.images, [
        testData.labels.length,
        ...this.inputShape
      ]);
      
      const labels = tf.oneHot(testData.labels, this.numClasses);

      // Evaluate model
      const evaluation = await this.model.evaluate(images, labels, {
        batchSize: 32
      }) as tf.Scalar[];

      // Get metrics
      const loss = await evaluation[0].data();
      const accuracy = await evaluation[1].data();

      // Calculate precision and recall
      const predictions = this.model.predict(images) as tf.Tensor;
      const predictionArray = await predictions.array() as number[][];
      const labelArray = await labels.array() as number[][];

      const { precision, recall, confusionMatrix } = this.calculateMetrics(
        predictionArray,
        labelArray
      );

      // Clean up tensors
      images.dispose();
      labels.dispose();
      predictions.dispose();
      evaluation.forEach(tensor => tensor.dispose());

      console.log('✅ Model evaluation completed');

      return {
        loss: loss[0],
        accuracy: accuracy[0],
        precision,
        recall,
        confusionMatrix
      };

    } catch (error) {
      console.error('❌ Model evaluation failed:', error);
      throw error;
    }
  }

  /**
   * Calculate precision, recall, and confusion matrix
   */
  private calculateMetrics(
    predictions: number[][],
    labels: number[][]
  ): {
    precision: number;
    recall: number;
    confusionMatrix: number[][];
  } {
    const numClasses = this.numClasses;
    const confusionMatrix = Array(numClasses).fill(0).map(() => Array(numClasses).fill(0));

    let truePositives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;

    predictions.forEach((pred, i) => {
      const predIndex = pred.indexOf(Math.max(...pred));
      const trueIndex = labels[i].indexOf(1);

      confusionMatrix[trueIndex][predIndex]++;

      if (predIndex === trueIndex) {
        truePositives++;
      } else {
        falsePositives++;
        falseNegatives++;
      }
    });

    const precision = truePositives / (truePositives + falsePositives);
    const recall = truePositives / (truePositives + falseNegatives);

    return { precision, recall, confusionMatrix };
  }

  /**
   * Get model information
   */
  getModelInfo(): {
    isLoaded: boolean;
    inputShape: [number, number, number];
    numClasses: number;
    totalParams: number;
  } {
    if (!this.model) {
      return {
        isLoaded: false,
        inputShape: this.inputShape,
        numClasses: this.numClasses,
        totalParams: 0
      };
    }

    const totalParams = this.model.countParams();

    return {
      isLoaded: this.isLoaded,
      inputShape: this.inputShape,
      numClasses: this.numClasses,
      totalParams
    };
  }

  /**
   * Clean up model resources
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.isLoaded = false;
    }
  }
}

export default TensorFlowMedicalCNN;
