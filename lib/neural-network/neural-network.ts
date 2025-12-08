/**
 * Pure TypeScript Neural Network Implementation
 * No external ML libraries - built from scratch for LedgerMind
 */

export interface NeuralNetworkConfig {
  inputSize: number
  hiddenLayers: number[]
  outputSize: number
  learningRate: number
}

export interface TrainingData {
  inputs: number[]
  targets: number[]
}

/**
 * Matrix operations for neural network
 */
class Matrix {
  data: number[][]
  rows: number
  cols: number

  constructor(rows: number, cols: number) {
    this.rows = rows
    this.cols = cols
    this.data = Array(rows).fill(null).map(() => Array(cols).fill(0))
  }

  static fromArray(arr: number[]): Matrix {
    const m = new Matrix(arr.length, 1)
    for (let i = 0; i < arr.length; i++) {
      m.data[i][0] = arr[i]
    }
    return m
  }

  toArray(): number[] {
    const arr: number[] = []
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        arr.push(this.data[i][j])
      }
    }
    return arr
  }

  randomize(): void {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        // Xavier initialization for better training
        this.data[i][j] = (Math.random() * 2 - 1) * Math.sqrt(2 / (this.rows + this.cols))
      }
    }
  }

  static multiply(a: Matrix, b: Matrix): Matrix {
    if (a.cols !== b.rows) {
      throw new Error(`Matrix dimensions don't match: ${a.cols} vs ${b.rows}`)
    }
    const result = new Matrix(a.rows, b.cols)
    for (let i = 0; i < result.rows; i++) {
      for (let j = 0; j < result.cols; j++) {
        let sum = 0
        for (let k = 0; k < a.cols; k++) {
          sum += a.data[i][k] * b.data[k][j]
        }
        result.data[i][j] = sum
      }
    }
    return result
  }

  static transpose(m: Matrix): Matrix {
    const result = new Matrix(m.cols, m.rows)
    for (let i = 0; i < m.rows; i++) {
      for (let j = 0; j < m.cols; j++) {
        result.data[j][i] = m.data[i][j]
      }
    }
    return result
  }

  static subtract(a: Matrix, b: Matrix): Matrix {
    const result = new Matrix(a.rows, a.cols)
    for (let i = 0; i < a.rows; i++) {
      for (let j = 0; j < a.cols; j++) {
        result.data[i][j] = a.data[i][j] - b.data[i][j]
      }
    }
    return result
  }

  static hadamard(a: Matrix, b: Matrix): Matrix {
    const result = new Matrix(a.rows, a.cols)
    for (let i = 0; i < a.rows; i++) {
      for (let j = 0; j < a.cols; j++) {
        result.data[i][j] = a.data[i][j] * b.data[i][j]
      }
    }
    return result
  }

  add(other: Matrix): void {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] += other.data[i][j]
      }
    }
  }

  scale(n: number): void {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] *= n
      }
    }
  }

  map(fn: (val: number, i: number, j: number) => number): Matrix {
    const result = new Matrix(this.rows, this.cols)
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.data[i][j] = fn(this.data[i][j], i, j)
      }
    }
    return result
  }
}

/**
 * Activation functions
 */
const activations = {
  relu: (x: number) => Math.max(0, x),
  reluDerivative: (x: number) => x > 0 ? 1 : 0,
  sigmoid: (x: number) => 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))),
  sigmoidDerivative: (x: number) => x * (1 - x),
  tanh: (x: number) => Math.tanh(x),
  tanhDerivative: (x: number) => 1 - x * x,
}

/**
 * LedgerMind Neural Network
 * Custom implementation for spending prediction and pattern recognition
 */
export class NeuralNetwork {
  private weights: Matrix[] = []
  private biases: Matrix[] = []
  private config: NeuralNetworkConfig
  private trained: boolean = false
  private trainingLoss: number[] = []

  constructor(config: NeuralNetworkConfig) {
    this.config = config
    this.initializeNetwork()
  }

  private initializeNetwork(): void {
    const layers = [this.config.inputSize, ...this.config.hiddenLayers, this.config.outputSize]
    
    for (let i = 0; i < layers.length - 1; i++) {
      const weights = new Matrix(layers[i + 1], layers[i])
      weights.randomize()
      this.weights.push(weights)

      const bias = new Matrix(layers[i + 1], 1)
      bias.randomize()
      this.biases.push(bias)
    }
  }

  /**
   * Forward propagation
   */
  predict(inputs: number[]): number[] {
    let current = Matrix.fromArray(inputs)

    for (let i = 0; i < this.weights.length; i++) {
      current = Matrix.multiply(this.weights[i], current)
      current.add(this.biases[i])
      
      // Apply ReLU for hidden layers, sigmoid for output
      if (i < this.weights.length - 1) {
        current = current.map(v => activations.relu(v))
      } else {
        current = current.map(v => activations.sigmoid(v))
      }
    }

    return current.toArray()
  }

  /**
   * Train the network using backpropagation
   */
  train(trainingData: TrainingData[], epochs: number = 1000, batchSize: number = 32): void {
    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0
      
      // Shuffle training data
      const shuffled = [...trainingData].sort(() => Math.random() - 0.5)
      
      // Mini-batch training
      for (let b = 0; b < shuffled.length; b += batchSize) {
        const batch = shuffled.slice(b, b + batchSize)
        
        for (const sample of batch) {
          const loss = this.trainSingle(sample.inputs, sample.targets)
          totalLoss += loss
        }
      }
      
      const avgLoss = totalLoss / trainingData.length
      this.trainingLoss.push(avgLoss)
    }
    
    this.trained = true
  }

  /**
   * Train on a single sample (backpropagation)
   */
  private trainSingle(inputs: number[], targets: number[]): number {
    // Forward pass - store all layer outputs
    const layerOutputs: Matrix[] = []
    let current = Matrix.fromArray(inputs)
    layerOutputs.push(current)

    for (let i = 0; i < this.weights.length; i++) {
      current = Matrix.multiply(this.weights[i], current)
      current.add(this.biases[i])
      
      if (i < this.weights.length - 1) {
        current = current.map(v => activations.relu(v))
      } else {
        current = current.map(v => activations.sigmoid(v))
      }
      layerOutputs.push(current)
    }

    // Calculate output error
    const targetMatrix = Matrix.fromArray(targets)
    let error = Matrix.subtract(targetMatrix, current)
    
    // Calculate loss (MSE)
    const loss = error.toArray().reduce((sum, e) => sum + e * e, 0) / error.toArray().length

    // Backpropagation
    for (let i = this.weights.length - 1; i >= 0; i--) {
      const output = layerOutputs[i + 1]
      
      // Calculate gradient
      let gradient: Matrix
      if (i === this.weights.length - 1) {
        gradient = output.map(v => activations.sigmoidDerivative(v))
      } else {
        gradient = output.map(v => activations.reluDerivative(v))
      }
      
      gradient = Matrix.hadamard(gradient, error)
      gradient.scale(this.config.learningRate)

      // Calculate deltas
      const prevOutput = layerOutputs[i]
      const prevOutputT = Matrix.transpose(prevOutput)
      const weightDeltas = Matrix.multiply(gradient, prevOutputT)

      // Update weights and biases
      this.weights[i].add(weightDeltas)
      this.biases[i].add(gradient)

      // Calculate error for previous layer
      if (i > 0) {
        const weightsT = Matrix.transpose(this.weights[i])
        error = Matrix.multiply(weightsT, error)
      }
    }

    return loss
  }

  /**
   * Save model to JSON
   */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      weights: this.weights.map(w => w.data),
      biases: this.biases.map(b => b.data),
      trained: this.trained,
      trainingLoss: this.trainingLoss
    })
  }

  /**
   * Load model from JSON
   */
  static deserialize(json: string): NeuralNetwork {
    const data = JSON.parse(json)
    const nn = new NeuralNetwork(data.config)
    
    nn.weights = data.weights.map((w: number[][]) => {
      const m = new Matrix(w.length, w[0].length)
      m.data = w
      return m
    })
    
    nn.biases = data.biases.map((b: number[][]) => {
      const m = new Matrix(b.length, b[0].length)
      m.data = b
      return m
    })
    
    nn.trained = data.trained
    nn.trainingLoss = data.trainingLoss
    
    return nn
  }

  isReady(): boolean {
    return this.trained
  }

  getLossHistory(): number[] {
    return this.trainingLoss
  }
}
