# AI Signal Platform – Product & Roadmap Reminder

**This project is a premium SaaS platform for AI-powered trading signals.**

## Core Product Mission
- Deliver transparent, actionable, and highly accurate trading signals for stocks, crypto, and forex.
- Empower users with explainable AI, advanced analytics, and a beautiful, cohesive black/gold/white UI.

## Features (Current & Future)

### 🚀 Core Signal Engine
- Asset & timeframe selection (via gold/black tags, no dropdown)
- Trading style presets (swing, day, long-term, scalper)
- Directional signal (UP/DOWN/NEUTRAL) with confidence score
- Entry, TP, SL generation
- Plain English AI reasoning
- Signal expiration window

### 🔍 Transparency
- Agent breakdown (see which AI agents contributed)
- Weight visualizations (pie/bar chart of agent influence)
- Signal reliability score (historical performance)
- Highlighted news/sentiment/technical indicators used

### 🧠 Intelligence Layer
- Volatility-adjusted risk and uncertainty scores
- Agent accuracy tracking (per symbol)
- Model personalization (adapts to user feedback)

### 🔔 Alerts & Notifications
- Custom signal alerts (e.g., "BTC > 85% BUY")
- Signal flip, SL/TP, and market event notifications

### 🧰 User Tools
- Ticker/sector search, signal filter, historical log
- Signal backtesting, portfolio simulation (paper trading)
- AI leaderboard (top signals/users)

### 📊 Visualizations
- Live signal feed, multi-timeframe alignment
- Contrarian view, sentiment/TA overlays on charts

### 🧪 Strategy Tools
- AI strategy builder (custom scan builder)
- Save/rerun scans, performance comparison

### 📲 Experience & Access
- Responsive UI (desktop, tablet, mobile)
- Theme control (premium black-gold UI)
- Export signals (PDF/CSV), push notifications (Telegram, Discord, SMS)
- API & webhook access

### 💳 Plans & Tiers
- Free plan (limited signals/filters)
- Pro plan (full access, backtesting, customization)
- Enterprise/white-label (API, custom dashboards)

### 🔐 Trust & Security
- Audit trail (logs every prediction/rationale)
- User feedback loop (rate signal accuracy)
- Secure login (MFA, encryption)
- Transparency policy (explainable AI, data source disclosure)

## Design & UX Principles
- All pages must be visually cohesive: black/gold/white, glassmorphism, bold/modern typography, no blue, no drop shadows.
- Navigation should make all major features easily accessible as top-level pages.
- Prioritize transparency, explainability, and user empowerment in every feature.

## Future Direction
- Build out MVP with core signal engine, transparency, history, and alerts.
- Add advanced analytics, backtesting, portfolio simulation, and community features.
- Continuously improve AI accuracy, explainability, and user personalization.
- Expand integrations (API, brokers, notifications) and support for more asset classes.

---

**Whenever you work on this project, always refer back to this section to ensure all features, designs, and decisions align with the product's mission, feature set, and premium user experience.**

---

# AI Trading Signals Platform

An AI-powered trading signal platform with comprehensive backtesting and performance analysis capabilities.

## Features

### 🎯 Real-time Predictions
- AI-powered sentiment analysis using Perplexity and OpenAI
- Real-time market data integration
- Confidence scoring for each prediction
- Detailed reasoning and market context

### 📊 Performance Tracking
- SQLite database for storing all predictions
- Automatic accuracy calculation
- Profit/loss tracking
- Performance metrics and analytics

### 🔬 Backtesting & Analysis
- Historical performance evaluation
- Advanced metrics (Sharpe ratio, max drawdown, win rate)
- Accuracy trends over time
- Cumulative profit/loss visualization
- Prediction distribution analysis

### 📈 Dashboard Features
- Real-time performance metrics
- Interactive charts and visualizations
- Recent predictions overview
- Accuracy trends display

## Database Schema

The platform uses SQLite with the following main tables:

### `prediction_verdicts`
- Stores all AI predictions with metadata
- Tracks accuracy and profit/loss when actual results are available
- Includes market context and reasoning

### `performance_metrics`
- Aggregated performance statistics
- Calculated for different timeframes
- Used for dashboard displays

## API Endpoints

### `/api/sentiment`
- **POST**: Generate new predictions with sentiment analysis
- Saves predictions to database automatically

### `/api/predictions`
- **GET**: Retrieve predictions by symbol with optional filters
- **POST**: Update prediction results with actual market data

### `/api/performance`
- **GET**: Get performance metrics and trends for a symbol

### `/api/update-results`
- **POST**: Update prediction accuracy and profit/loss calculations

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file with:
   ```
   PERPLEXITY_API_KEY=your_perplexity_api_key
   OPENAI_API_KEY=your_openai_api_key
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Main Dashboard: http://localhost:3000
   - Backtesting: http://localhost:3000/backtest

## Usage

### Making Predictions
1. Select a symbol from the dropdown
2. Choose a date (optional)
3. Click "Analyze" to generate a prediction
4. View the AI verdict, confidence, and reasoning

### Backtesting
1. Navigate to the Backtesting page
2. Select a symbol and timeframe
3. View comprehensive performance metrics
4. Analyze historical accuracy and profit/loss

### Updating Results
Use the `/api/update-results` endpoint to provide actual market data:
```json
{
  "symbol": "BHP.AX",
  "predictionDate": "2024-01-15",
  "actualPrice": 45.67,
  "actualDate": "2024-01-16"
}
```

## Performance Metrics

The platform calculates various performance indicators:

- **Accuracy Rate**: Percentage of correct predictions
- **Win Rate**: Percentage of profitable trades
- **Sharpe Ratio**: Risk-adjusted return measure
- **Max Drawdown**: Largest peak-to-trough decline
- **Average Confidence**: Mean confidence level of predictions
- **Best/Worst Streaks**: Consecutive correct/incorrect predictions

## Database Location

The SQLite database is stored in `/data/predictions.db` and is automatically created on first run.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
