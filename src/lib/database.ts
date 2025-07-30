import Database from 'better-sqlite3';
import path from 'path';

// Database types
export interface PredictionVerdict {
  id?: number;
  user_id: string;
  symbol: string;
  prediction_date: string;
  verdict: 'UP' | 'DOWN' | 'NEUTRAL';
  confidence: number;
  reasoning: string;
  market_context: string;
  created_at: string;
  actual_price?: number;
  actual_date?: string;
  accuracy?: boolean;
  profit_loss?: number;
  performance_notes?: string;
  entry?: number;
  tp?: number;
  sl?: number;
  timeframe?: string;
  style?: string;
}

export interface PerformanceMetrics {
  total_predictions: number;
  correct_predictions: number;
  accuracy_rate: number;
  average_confidence: number;
  total_profit_loss: number;
  win_rate: number;
  symbol: string;
  timeframe: string;
}

class DatabaseManager {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(process.cwd(), 'data', 'predictions.db');
    
    // Ensure data directory exists
    const fs = require('fs');
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.initializeTables();
  }

  private initializeTables() {
    // Create predictions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS prediction_verdicts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        prediction_date TEXT NOT NULL,
        verdict TEXT NOT NULL CHECK (verdict IN ('UP', 'DOWN', 'NEUTRAL')),
        confidence REAL NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
        reasoning TEXT NOT NULL,
        market_context TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        actual_price REAL,
        actual_date TEXT,
        accuracy BOOLEAN,
        profit_loss REAL,
        performance_notes TEXT,
        entry REAL,
        tp REAL,
        sl REAL,
        timeframe TEXT,
        style TEXT
      )
    `);

    // Create performance metrics table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        timeframe TEXT NOT NULL,
        total_predictions INTEGER NOT NULL DEFAULT 0,
        correct_predictions INTEGER NOT NULL DEFAULT 0,
        accuracy_rate REAL NOT NULL DEFAULT 0,
        average_confidence REAL NOT NULL DEFAULT 0,
        total_profit_loss REAL NOT NULL DEFAULT 0,
        win_rate REAL NOT NULL DEFAULT 0,
        last_updated TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(user_id, symbol, timeframe)
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_user_id_symbol_date ON prediction_verdicts(user_id, symbol, prediction_date);
      CREATE INDEX IF NOT EXISTS idx_user_id_created_at ON prediction_verdicts(user_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_user_id_accuracy ON prediction_verdicts(user_id, accuracy);
    `);
  }

  // Save a new prediction verdict
  savePredictionVerdict(prediction: Omit<PredictionVerdict, 'id' | 'created_at'>): number {
    const stmt = this.db.prepare(`
      INSERT INTO prediction_verdicts 
      (user_id, symbol, prediction_date, verdict, confidence, reasoning, market_context, created_at, entry, tp, sl, timeframe, style)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      prediction.user_id,
      prediction.symbol,
      prediction.prediction_date,
      prediction.verdict,
      prediction.confidence,
      prediction.reasoning,
      prediction.market_context,
      prediction.entry ?? null,
      prediction.tp ?? null,
      prediction.sl ?? null,
      prediction.timeframe ?? null,
      prediction.style ?? null
    );

    return result.lastInsertRowid as number;
  }

  // Update prediction with actual results
  updatePredictionResults(
    user_id: string,
    symbol: string,
    predictionDate: string,
    actualPrice: number,
    actualDate: string,
    accuracy: boolean,
    profitLoss?: number,
    performanceNotes?: string
  ): boolean {
    const stmt = this.db.prepare(`
      UPDATE prediction_verdicts 
      SET actual_price = ?, actual_date = ?, accuracy = ?, profit_loss = ?, performance_notes = ?
      WHERE user_id = ? AND symbol = ? AND prediction_date = ?
    `);

    const result = stmt.run(actualPrice, actualDate, accuracy, profitLoss, performanceNotes, user_id, symbol, predictionDate);
    return result.changes > 0;
  }

  // Get all predictions for a symbol (for a user)
  getPredictionsBySymbol(user_id: string, symbol: string, limit: number = 50): PredictionVerdict[] {
    const stmt = this.db.prepare(`
      SELECT * FROM prediction_verdicts 
      WHERE user_id = ? AND symbol = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `);

    return stmt.all(user_id, symbol, limit) as PredictionVerdict[];
  }

  // Get predictions with actual results (for backtesting, for a user)
  getPredictionsWithResults(user_id: string, symbol: string, limit: number = 100): PredictionVerdict[] {
    const stmt = this.db.prepare(`
      SELECT * FROM prediction_verdicts 
      WHERE user_id = ? AND symbol = ? AND actual_price IS NOT NULL
      ORDER BY prediction_date DESC 
      LIMIT ?
    `);

    return stmt.all(user_id, symbol, limit) as PredictionVerdict[];
  }

  // Calculate performance metrics (for a user)
  calculatePerformanceMetrics(user_id: string, symbol: string, timeframe: string = 'all'): PerformanceMetrics {
    let dateFilter = '';
    if (timeframe !== 'all') {
      const days = timeframe === '30d' ? 30 : timeframe === '7d' ? 7 : 1;
      dateFilter = `AND created_at >= datetime('now', '-${days} days')`;
    }

    const stmt = this.db.prepare(`
      SELECT 
        COUNT(*) as total_predictions,
        SUM(CASE WHEN accuracy = 1 THEN 1 ELSE 0 END) as correct_predictions,
        AVG(confidence) as average_confidence,
        SUM(COALESCE(profit_loss, 0)) as total_profit_loss,
        SUM(CASE WHEN profit_loss > 0 THEN 1 ELSE 0 END) as wins
      FROM prediction_verdicts 
      WHERE user_id = ? AND symbol = ? ${dateFilter}
    `);

    const result = stmt.get(user_id, symbol) as any;
    
    if (!result || result.total_predictions === 0) {
      return {
        total_predictions: 0,
        correct_predictions: 0,
        accuracy_rate: 0,
        average_confidence: 0,
        total_profit_loss: 0,
        win_rate: 0,
        symbol,
        timeframe
      };
    }

    const accuracy_rate = (result.correct_predictions / result.total_predictions) * 100;
    const win_rate = (result.wins / result.total_predictions) * 100;

    return {
      total_predictions: result.total_predictions,
      correct_predictions: result.correct_predictions,
      accuracy_rate: Math.round(accuracy_rate * 100) / 100,
      average_confidence: Math.round(result.average_confidence * 100) / 100,
      total_profit_loss: Math.round(result.total_profit_loss * 100) / 100,
      win_rate: Math.round(win_rate * 100) / 100,
      symbol,
      timeframe
    };
  }

  // Get recent predictions for dashboard (for a user)
  getRecentPredictions(user_id: string, limit: number = 10): PredictionVerdict[] {
    const stmt = this.db.prepare(`
      SELECT * FROM prediction_verdicts 
      WHERE user_id = ?
      ORDER BY created_at DESC 
      LIMIT ?
    `);

    return stmt.all(user_id, limit) as PredictionVerdict[];
  }

  // Get prediction accuracy trends (for a user)
  getAccuracyTrends(user_id: string, symbol: string, days: number = 30): Array<{date: string, accuracy: number}> {
    const stmt = this.db.prepare(`
      SELECT 
        DATE(created_at) as date,
        AVG(CASE WHEN accuracy = 1 THEN 1.0 ELSE 0.0 END) * 100 as accuracy
      FROM prediction_verdicts 
      WHERE user_id = ? AND symbol = ? AND created_at >= datetime('now', '-${days} days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    return stmt.all(user_id, symbol) as Array<{date: string, accuracy: number}>;
  }

  // Get paginated predictions for a user (optionally filtered by symbol)
  getPaginatedPredictions(user_id: string, page: number = 1, pageSize: number = 10, symbol?: string) {
    const offset = (page - 1) * pageSize;
    let query = `
      SELECT * FROM prediction_verdicts
      WHERE user_id = ?
    `;
    const params: any[] = [user_id];

    if (symbol) {
      query += ' AND symbol = ?';
      params.push(symbol);
    }

    query += `
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(pageSize, offset);

    const predictions = this.db.prepare(query).all(...params);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM prediction_verdicts WHERE user_id = ?`;
    const countParams: any[] = [user_id];
    if (symbol) {
      countQuery += ' AND symbol = ?';
      countParams.push(symbol);
    }
    const totalRow = this.db.prepare(countQuery).get(...countParams) as { total: number };
    const total = totalRow.total;

    return { predictions, total };
  }

  // Close database connection
  close() {
    this.db.close();
  }
}

// Export singleton instance
export const db = new DatabaseManager(); 