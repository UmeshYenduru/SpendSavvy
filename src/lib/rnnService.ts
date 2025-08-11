import * as tf from '@tensorflow/tfjs';

// This is a simple RNN model for text classification
export class TransactionClassifier {
  private model: tf.LayersModel | null = null;
  private wordIndex: { [word: string]: number } = {};
  private categoryIndex: { [category: string]: number } = {};
  private reverseIndex: { [index: number]: string } = {};
  private initialized = false;
  private maxSequenceLength = 20;

  constructor(categories: string[]) {
    this.setupCategories(categories);
  }

  private setupCategories(categories: string[]) {
    categories.forEach((category, i) => {
      this.categoryIndex[category] = i;
      this.reverseIndex[i] = category;
    });
  }

  // Process text to sequence of word indices
  private textToSequence(text: string): number[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);
    
    return words.map(word => {
      if (!this.wordIndex[word]) {
        this.wordIndex[word] = Object.keys(this.wordIndex).length + 1;
      }
      return this.wordIndex[word];
    });
  }

  // Pad sequences to fixed length
  private padSequences(sequences: number[][]): number[][] {
    return sequences.map(seq => {
      if (seq.length >= this.maxSequenceLength) {
        return seq.slice(0, this.maxSequenceLength);
      }
      return [...seq, ...Array(this.maxSequenceLength - seq.length).fill(0)];
    });
  }

  // Build and compile model
  public async buildModel(): Promise<void> {
    // Ensure we have a reasonable vocabulary size
    const vocabSize = Object.keys(this.wordIndex).length + 1;
    const numCategories = Object.keys(this.categoryIndex).length;

    // Create a sequential model
    const model = tf.sequential();
    
    // Add an embedding layer
    model.add(tf.layers.embedding({
      inputDim: Math.max(vocabSize, 100),
      outputDim: 32,
      inputLength: this.maxSequenceLength
    }));
    
    // Add LSTM layer
    model.add(tf.layers.lstm({
      units: 64,
      returnSequences: false
    }));
    
    // Add Dense layers with dropout
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.3 }));
    
    // Output layer
    model.add(tf.layers.dense({ units: numCategories, activation: 'softmax' }));
    
    // Compile model
    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    this.model = model;
    this.initialized = true;
    console.log('RNN model built and compiled successfully');
  }

  // Train model with transaction data
  public async trainModel(transactions: { description: string, category: string }[]): Promise<void> {
    if (!this.initialized) {
      await this.buildModel();
    }

    if (!this.model) {
      throw new Error('Model not initialized');
    }

    // Prepare training data
    const sequences = transactions.map(t => this.textToSequence(t.description));
    const paddedSequences = this.padSequences(sequences);
    
    // Prepare labels
    const labels = transactions.map(t => {
      const oneHot = Array(Object.keys(this.categoryIndex).length).fill(0);
      const categoryIdx = this.categoryIndex[t.category];
      if (categoryIdx !== undefined) {
        oneHot[categoryIdx] = 1;
      }
      return oneHot;
    });

    // Convert to tensors
    const xs = tf.tensor2d(paddedSequences, [paddedSequences.length, this.maxSequenceLength]);
    const ys = tf.tensor2d(labels, [labels.length, Object.keys(this.categoryIndex).length]);

    // Train model
    await this.model.fit(xs, ys, {
      epochs: 10,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch + 1}: loss = ${logs?.loss}, accuracy = ${logs?.acc}`);
        }
      }
    });

    console.log('Model training completed');
    
    // Dispose tensors to free memory
    xs.dispose();
    ys.dispose();
  }

  // Predict category for new transaction description
  public async predictCategory(description: string): Promise<string> {
    if (!this.model || !this.initialized) {
      throw new Error('Model not trained yet');
    }

    const sequence = this.textToSequence(description);
    const paddedSequence = this.padSequences([sequence]);
    
    const input = tf.tensor2d(paddedSequence, [1, this.maxSequenceLength]);
    const prediction = this.model.predict(input) as tf.Tensor;
    
    const categoryIdx = Array.from(await prediction.argMax(1).data())[0];
    
    // Cleanup
    input.dispose();
    prediction.dispose();
    
    return this.reverseIndex[categoryIdx] || 'Other';
  }

  // Save model to localStorage (simplified)
  public async saveModel(): Promise<void> {
    if (!this.model) return;
    
    try {
      const modelJSON = this.model.toJSON();
      localStorage.setItem('rnnModel', JSON.stringify(modelJSON));
      localStorage.setItem('wordIndex', JSON.stringify(this.wordIndex));
      console.log('Model saved to localStorage');
    } catch (error) {
      console.error('Error saving model:', error);
    }
  }

  // Load model from localStorage (simplified)
  public async loadModel(): Promise<boolean> {
    try {
      const modelJSON = localStorage.getItem('rnnModel');
      const wordIndexData = localStorage.getItem('wordIndex');
      
      if (!modelJSON || !wordIndexData) {
        return false;
      }
      
      this.wordIndex = JSON.parse(wordIndexData);
      this.model = await tf.models.modelFromJSON(JSON.parse(modelJSON));
      this.initialized = true;
      console.log('Model loaded from localStorage');
      return true;
    } catch (error) {
      console.error('Error loading model:', error);
      return false;
    }
  }
}

// Create a singleton instance
let classifierInstance: TransactionClassifier | null = null;

export const getClassifier = (categories: string[]): TransactionClassifier => {
  if (!classifierInstance) {
    classifierInstance = new TransactionClassifier(categories);
  }
  return classifierInstance;
};

