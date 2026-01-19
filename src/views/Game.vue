<template>
  <div class="game-page">
    <div class="page-header">
      <h1 class="page-title pixel-text">{{ t('game.title') }}</h1>
      <div class="page-meta">
        <span class="meta-item mono">{{ t('game.totalScore') }}: {{ totalScore }}</span>
        <span class="meta-item mono">{{ t('game.level') }}: {{ playerLevel }}</span>
      </div>
    </div>

    <!-- 全社区排行榜 - 可展开 -->
    <div class="community-leaderboard" :class="{ expanded: showCommunityLeaderboard }">
      <div class="leaderboard-header" @click="toggleCommunityLeaderboard">
        <div class="header-left">
          <span class="leaderboard-icon">🏆</span>
          <span class="leaderboard-title pixel-text">{{ t('game.communityLeaderboard') }}</span>
          <span class="leaderboard-count">({{ communityRankings.length }})</span>
        </div>
        <div class="header-right">
          <span class="toggle-icon" :class="{ rotated: showCommunityLeaderboard }">▼</span>
        </div>
      </div>
      <div class="leaderboard-content" v-if="showCommunityLeaderboard">
        <div class="leaderboard-list">
          <div 
            v-for="(player, index) in communityRankings" 
            :key="player.id"
            class="leaderboard-item"
            :class="{ 
              'top-three': index < 3,
              'current-user': player.isCurrentUser
            }"
          >
            <div class="rank-badge" :class="'rank-' + (index + 1)">
              <span v-if="index === 0">🥇</span>
              <span v-else-if="index === 1">🥈</span>
              <span v-else-if="index === 2">🥉</span>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="player-avatar">{{ player.name.charAt(0).toUpperCase() }}</div>
            <div class="player-info">
              <div class="player-name">{{ player.name }}</div>
              <div class="player-level">{{ t('game.level') }} {{ player.level }}</div>
            </div>
            <div class="player-score">
              <span class="score-value">{{ formatNumber(player.totalScore) }}</span>
              <span class="score-label">{{ t('game.points') }}</span>
            </div>
            <div class="player-badge" v-if="index < 3">
              <span class="badge-text">{{ getRankBadge(index) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏网格 -->
    <div class="games-grid">
      <!-- 游戏1: 交易模拟器 -->
      <div class="game-card pixel-border" @click="openGame('trading')">
        <div class="game-icon">💰</div>
        <h3 class="game-title pixel-text">{{ t('game.tradingSimulator') }}</h3>
        <p class="game-desc">{{ t('game.tradingSimulatorDesc') }}</p>
        <div class="game-stats">
          <span class="stat-item">{{ t('game.highScore') }}: {{ gameScores.trading }}</span>
          <span class="stat-item">{{ t('game.plays') }}: {{ gamePlays.trading }}</span>
        </div>
        <div class="game-badge badge-newbie">{{ t('game.newbieGuide') }}</div>
      </div>

      <!-- 游戏2: 策略拼图 -->
      <div class="game-card pixel-border" @click="openGame('puzzle')">
        <div class="game-icon">🧩</div>
        <h3 class="game-title pixel-text">{{ t('game.strategyPuzzle') }}</h3>
        <p class="game-desc">{{ t('game.strategyPuzzleDesc') }}</p>
        <div class="game-stats">
          <span class="stat-item">{{ t('game.highScore') }}: {{ gameScores.puzzle }}</span>
          <span class="stat-item">{{ t('game.plays') }}: {{ gamePlays.puzzle }}</span>
        </div>
        <div class="game-badge badge-puzzle">{{ t('game.puzzle') }}</div>
      </div>

      <!-- 游戏3: 价格预测 -->
      <div class="game-card pixel-border" @click="openGame('predict')">
        <div class="game-icon">📈</div>
        <h3 class="game-title pixel-text">{{ t('game.pricePrediction') }}</h3>
        <p class="game-desc">{{ t('game.pricePredictionDesc') }}</p>
        <div class="game-stats">
          <span class="stat-item">{{ t('game.accuracy') }}: {{ gameScores.predict }}%</span>
          <span class="stat-item">{{ t('game.plays') }}: {{ gamePlays.predict }}</span>
        </div>
        <div class="game-badge badge-competition">{{ t('game.competition') }}</div>
      </div>

      <!-- 游戏4: 挖矿小游戏 -->
      <div class="game-card pixel-border" @click="openGame('mining')">
        <div class="game-icon">⛏️</div>
        <h3 class="game-title pixel-text">{{ t('game.miningGame') }}</h3>
        <p class="game-desc">{{ t('game.miningGameDesc') }}</p>
        <div class="game-stats">
          <span class="stat-item">{{ t('game.coins') }}: {{ gameScores.mining }}</span>
          <span class="stat-item">{{ t('game.plays') }}: {{ gamePlays.mining }}</span>
        </div>
        <div class="game-badge badge-addictive">{{ t('game.addictive') }}</div>
      </div>

      <!-- 游戏5: 交易对匹配 -->
      <div class="game-card pixel-border" @click="openGame('match')">
        <div class="game-icon">🎯</div>
        <h3 class="game-title pixel-text">{{ t('game.pairMatching') }}</h3>
        <p class="game-desc">{{ t('game.pairMatchingDesc') }}</p>
        <div class="game-stats">
          <span class="stat-item">{{ t('game.highScore') }}: {{ gameScores.match }}</span>
          <span class="stat-item">{{ t('game.plays') }}: {{ gamePlays.match }}</span>
        </div>
        <div class="game-badge badge-memory">{{ t('game.memory') }}</div>
      </div>

      <!-- 游戏6: 收益计算挑战 -->
      <div class="game-card pixel-border" @click="openGame('calculator')">
        <div class="game-icon">🧮</div>
        <h3 class="game-title pixel-text">{{ t('game.profitChallenge') }}</h3>
        <p class="game-desc">{{ t('game.profitChallengeDesc') }}</p>
        <div class="game-stats">
          <span class="stat-item">{{ t('game.highScore') }}: {{ gameScores.calculator }}</span>
          <span class="stat-item">{{ t('game.plays') }}: {{ gamePlays.calculator }}</span>
        </div>
        <div class="game-badge badge-challenge">{{ t('game.challenge') }}</div>
      </div>
    </div>

    <!-- 交易模拟器游戏 -->
    <div v-if="currentGame === 'trading'" class="game-modal pixel-border" @click="handleGameBackdropClick">
      <div class="game-content-with-sidebar">
        <div class="game-main-content">
          <div class="game-header">
            <h2 class="pixel-text">{{ t('game.tradingSimulator') }}</h2>
            <button class="btn-close pixel-border" @click="closeGame">×</button>
          </div>
          <div class="game-body">
          <div class="trading-game">
            <div class="game-info">
              <div class="info-item">
                <span class="label">{{ t('game.balance') }}:</span>
                <span class="value neon-text">${{ tradingBalance.toFixed(2) }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('game.profit') }}:</span>
                <span :class="['value', tradingProfit >= 0 ? 'text-success' : 'text-danger']">
                  {{ tradingProfit >= 0 ? '+' : '' }}${{ tradingProfit.toFixed(2) }}
                </span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('game.round') }}:</span>
                <span class="value">{{ tradingRound }}/10</span>
              </div>
            </div>
            <div class="price-display pixel-border">
              <div class="current-price neon-text">${{ currentPrice.toFixed(2) }}</div>
              <div :class="['price-change', priceChange >= 0 ? 'text-success' : 'text-danger']">
                {{ priceChange >= 0 ? '+' : '' }}{{ priceChange.toFixed(2) }}%
              </div>
            </div>
            <div class="action-buttons">
              <button class="btn-action btn-buy pixel-border" @click="makeTrade('buy')" :disabled="tradingRound >= 10">
                {{ t('common.buy') }}
              </button>
              <button class="btn-action btn-sell pixel-border" @click="makeTrade('sell')" :disabled="tradingRound >= 10">
                {{ t('common.sell') }}
              </button>
              <button class="btn-action btn-hold pixel-border" @click="makeTrade('hold')" :disabled="tradingRound >= 10">
                {{ t('game.hold') }}
              </button>
            </div>
            <div v-if="tradingRound >= 10" class="game-result pixel-border">
              <h3>{{ t('game.gameOver') }}</h3>
              <p>{{ t('game.finalProfit') }}: ${{ tradingProfit.toFixed(2) }}</p>
              <button class="btn-restart pixel-border" @click="restartTrading">{{ t('game.restart') }}</button>
            </div>
          </div>
          </div>
        </div>
        <!-- 好友排行榜侧边栏 -->
        <div class="friends-leaderboard pixel-border">
          <div class="sidebar-header">
            <span class="sidebar-icon">👥</span>
            <span class="sidebar-title pixel-text">{{ t('game.friendsRanking') }}</span>
          </div>
          <div class="friends-list">
            <div 
              v-for="(friend, index) in friendsRankings" 
              :key="friend.id"
              class="friend-item"
              :class="{ 'current-user': friend.isCurrentUser }"
            >
              <div class="friend-rank">{{ index + 1 }}</div>
              <div class="friend-avatar">{{ friend.name.charAt(0).toUpperCase() }}</div>
              <div class="friend-info">
                <div class="friend-name">{{ friend.name }}</div>
                <div class="friend-game-score">{{ getGameScore('trading', friend.id) }}</div>
              </div>
            </div>
            <div v-if="friendsRankings.length === 0" class="no-friends">
              {{ t('game.noFriends') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 策略拼图游戏 -->
    <div v-if="currentGame === 'puzzle'" class="game-modal pixel-border" @click="handleGameBackdropClick">
      <div class="game-content-with-sidebar">
        <div class="game-main-content">
          <div class="game-header">
            <h2 class="pixel-text">{{ t('game.strategyPuzzle') }}</h2>
            <button class="btn-close pixel-border" @click="closeGame">×</button>
          </div>
          <div class="game-body">
          <div class="puzzle-game">
            <div class="puzzle-info">
              <span>{{ t('game.moves') }}: {{ puzzleMoves }}</span>
              <span>{{ t('game.time') }}: {{ puzzleTime }}s</span>
            </div>
            <div class="puzzle-board pixel-border">
              <div 
                v-for="(tile, index) in puzzleTiles" 
                :key="index"
                class="puzzle-tile pixel-border"
                :class="{ empty: tile === 0, correct: tile === index + 1 }"
                @click="moveTile(index)"
              >
                {{ tile !== 0 ? tile : '' }}
              </div>
            </div>
            <div v-if="puzzleSolved" class="game-result pixel-border">
              <h3>{{ t('game.congratulations') }}!</h3>
              <p>{{ t('game.puzzleSolved') }} {{ puzzleMoves }} {{ t('game.moves') }}</p>
              <button class="btn-restart pixel-border" @click="restartPuzzle">{{ t('game.restart') }}</button>
            </div>
          </div>
          </div>
        </div>
        <!-- 好友排行榜侧边栏 -->
        <div class="friends-leaderboard pixel-border">
          <div class="sidebar-header">
            <span class="sidebar-icon">👥</span>
            <span class="sidebar-title pixel-text">{{ t('game.friendsRanking') }}</span>
          </div>
          <div class="friends-list">
            <div 
              v-for="(friend, index) in friendsRankings" 
              :key="friend.id"
              class="friend-item"
              :class="{ 'current-user': friend.isCurrentUser }"
            >
              <div class="friend-rank">{{ index + 1 }}</div>
              <div class="friend-avatar">{{ friend.name.charAt(0).toUpperCase() }}</div>
              <div class="friend-info">
                <div class="friend-name">{{ friend.name }}</div>
                <div class="friend-game-score">{{ getGameScore('puzzle', friend.id) }}</div>
              </div>
            </div>
            <div v-if="friendsRankings.length === 0" class="no-friends">
              {{ t('game.noFriends') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 价格预测游戏 -->
    <div v-if="currentGame === 'predict'" class="game-modal pixel-border" @click="handleGameBackdropClick">
      <div class="game-content-with-sidebar">
        <div class="game-main-content">
          <div class="game-header">
            <h2 class="pixel-text">{{ t('game.pricePrediction') }}</h2>
            <button class="btn-close pixel-border" @click="closeGame">×</button>
          </div>
          <div class="game-body">
          <div class="predict-game">
            <div class="predict-intro pixel-border">
              <h4>🎯 {{ t('game.pricePredictionTitle') }}</h4>
              <p>{{ t('game.pricePredictionDescFull') }}</p>
              <div class="chart-legend">
                <div class="legend-item">
                  <span class="legend-dot legend-bullish"></span>
                  <span>{{ t('game.chartLegendBullish') }}</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot legend-bearish"></span>
                  <span>{{ t('game.chartLegendBearish') }}</span>
                </div>
              </div>
            </div>
            <div class="predict-info">
              <span>{{ t('game.round') }}: {{ predictRound }}/10</span>
              <span>{{ t('game.correct') }}: {{ predictCorrect }}/{{ predictRound || 0 }}</span>
            </div>
            <div class="price-chart pixel-border">
              <div class="chart-label-top">{{ t('game.chartLabelPrice') }}</div>
              <div class="chart-line" :style="{ transform: `translateX(${chartOffset}px)` }">
                <div 
                  v-for="(candle, index) in priceHistory" 
                  :key="index"
                  class="candlestick"
                  :style="{
                    left: (index * 60) + 'px',
                    width: '40px'
                  }"
                >
                  <!-- 影线（最高到最低） -->
                  <div 
                    class="candlestick-shadow"
                    :style="getCandlestickShadowStyle(candle)"
                  ></div>
                  <!-- 实体（开盘到收盘） -->
                  <div 
                    class="candlestick-body"
                    :class="{ 'bullish': candle.close >= candle.open, 'bearish': candle.close < candle.open }"
                    :style="getCandlestickBodyStyle(candle)"
                    :title="`O:$${candle.open.toFixed(2)} H:$${candle.high.toFixed(2)} L:$${candle.low.toFixed(2)} C:$${candle.close.toFixed(2)}`"
                  ></div>
                </div>
              </div>
              <div class="chart-label-bottom">{{ t('game.chartLabelTime') }}</div>
            </div>
            <div class="current-price-display neon-text pixel-border">
              ${{ currentPredictPrice.toFixed(2) }}
            </div>
            <div class="prediction-buttons" v-if="predictRound < 10">
              <button class="btn-predict btn-up pixel-border" @click="makePrediction('up')">
                ↑ {{ t('game.up') }}
              </button>
              <button class="btn-predict btn-down pixel-border" @click="makePrediction('down')">
                ↓ {{ t('game.down') }}
              </button>
            </div>
            <div v-if="predictRound >= 10" class="game-result pixel-border">
              <h3>{{ t('game.gameOver') }}</h3>
              <p>{{ t('game.accuracy') }}: {{ (predictCorrect / 10 * 100).toFixed(0) }}%</p>
              <button class="btn-restart pixel-border" @click="restartPredict">{{ t('game.restart') }}</button>
            </div>
          </div>
          </div>
        </div>
        <!-- 好友排行榜侧边栏 -->
        <div class="friends-leaderboard pixel-border">
          <div class="sidebar-header">
            <span class="sidebar-icon">👥</span>
            <span class="sidebar-title pixel-text">{{ t('game.friendsRanking') }}</span>
          </div>
          <div class="friends-list">
            <div 
              v-for="(friend, index) in friendsRankings" 
              :key="friend.id"
              class="friend-item"
              :class="{ 'current-user': friend.isCurrentUser }"
            >
              <div class="friend-rank">{{ index + 1 }}</div>
              <div class="friend-avatar">{{ friend.name.charAt(0).toUpperCase() }}</div>
              <div class="friend-info">
                <div class="friend-name">{{ friend.name }}</div>
                <div class="friend-game-score">{{ getGameScore('predict', friend.id) }}%</div>
              </div>
            </div>
            <div v-if="friendsRankings.length === 0" class="no-friends">
              {{ t('game.noFriends') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 挖矿小游戏 -->
    <div v-if="currentGame === 'mining'" class="game-modal pixel-border" @click="handleGameBackdropClick">
      <div class="game-content-with-sidebar">
        <div class="game-main-content">
          <div class="game-header">
            <h2 class="pixel-text">{{ t('game.miningGame') }}</h2>
            <button class="btn-close pixel-border" @click="closeGame">×</button>
          </div>
          <div class="game-body">
          <div class="mining-game">
            <div class="mining-intro pixel-border">
              <div class="mining-intro-header" @click="showMiningRules = !showMiningRules">
                <h4>🎮 {{ t('game.miningGameTitle') }}</h4>
                <span class="toggle-rules-icon" :class="{ 'expanded': showMiningRules }">▼</span>
              </div>
              <div class="mining-intro-content" v-if="showMiningRules">
                <p>{{ t('game.miningGameDescFull') }}</p>
                <ul>
                  <li>{{ t('game.miningRule1') }}</li>
                  <li>{{ t('game.miningRule2') }}</li>
                  <li>{{ t('game.miningRule3') }}</li>
                  <li><strong>{{ t('game.miningRule4') }}</strong></li>
                  <li>{{ t('game.miningRule5') }}</li>
                </ul>
              </div>
            </div>
            <div class="mining-info">
              <span>{{ t('game.coins') }}: <strong>{{ miningCoins }}</strong> / {{ miningTarget }}</span>
              <span>{{ t('game.power') }}: <strong>{{ miningPower }}</strong></span>
              <span v-if="miningCompleted" class="mining-status-completed">✅ {{ t('game.completed') }}</span>
            </div>
            <div class="mining-area pixel-border" :class="{ 'mining-active': isMining, 'mining-completed': miningCompleted }">
              <div class="mining-animation" @click="mineCoin">
                <div 
                  class="pixel-block" 
                  v-for="n in miningBlockCount" 
                  :key="n" 
                  :class="{ 'block-flash': isMining && clickedBlockIndex === n - 1, 'block-empty': isMining && clickedBlockIndex === n - 1 && miningResult === 'empty' }"
                  @click.stop="mineCoin"
                ></div>
              </div>
              <div class="click-hint neon-text" v-if="!hasClickedMining && !miningCompleted">{{ t('game.clickToMine') }}</div>
              <div v-if="isMining && miningResult === 'success'" class="mining-feedback neon-text success">+{{ miningPower }} {{ t('game.coins') }}!</div>
              <div v-if="isMining && miningResult === 'empty'" class="mining-feedback neon-text empty">{{ t('game.miningEmpty') }}</div>
              <div v-if="miningCompleted" class="mining-completed-message neon-text">
                <h3>🎉 {{ t('game.miningCompleted') }}</h3>
                <p>{{ t('game.miningCompletedDesc') }}</p>
                <button class="btn-restart pixel-border" @click="restartMining">{{ t('game.restart') }}</button>
              </div>
            </div>
            <div class="upgrade-shop pixel-border">
              <h4>{{ t('game.upgrades') }}</h4>
              <p class="upgrade-desc">{{ t('game.upgradeDesc') }}</p>
              <div class="upgrade-item" v-for="upgrade in upgrades" :key="upgrade.id">
                <div class="upgrade-info">
                  <span class="upgrade-name">{{ upgrade.name }}</span>
                  <span class="upgrade-effect">+{{ upgrade.power }} {{ t('game.power') }}</span>
                </div>
                <button 
                  class="btn-upgrade pixel-border" 
                  @click="buyUpgrade(upgrade)"
                  :disabled="miningCoins < upgrade.cost"
                >
                  {{ t('game.buy') }} ${{ upgrade.cost }}
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
        <!-- 好友排行榜侧边栏 -->
        <div class="friends-leaderboard pixel-border">
          <div class="sidebar-header">
            <span class="sidebar-icon">👥</span>
            <span class="sidebar-title pixel-text">{{ t('game.friendsRanking') }}</span>
          </div>
          <div class="friends-list">
            <div 
              v-for="(friend, index) in friendsRankings" 
              :key="friend.id"
              class="friend-item"
              :class="{ 'current-user': friend.isCurrentUser }"
            >
              <div class="friend-rank">{{ index + 1 }}</div>
              <div class="friend-avatar">{{ friend.name.charAt(0).toUpperCase() }}</div>
              <div class="friend-info">
                <div class="friend-name">{{ friend.name }}</div>
                <div class="friend-game-score">{{ getGameScore('mining', friend.id) }}</div>
              </div>
            </div>
            <div v-if="friendsRankings.length === 0" class="no-friends">
              {{ t('game.noFriends') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 交易对匹配游戏 -->
    <div v-if="currentGame === 'match'" class="game-modal pixel-border" @click="handleGameBackdropClick">
      <div class="game-content-with-sidebar">
        <div class="game-main-content">
          <div class="game-header">
            <h2 class="pixel-text">{{ t('game.pairMatching') }}</h2>
            <button class="btn-close pixel-border" @click="closeGame">×</button>
          </div>
          <div class="game-body">
          <div class="match-game">
            <div class="match-info">
              <span>{{ t('game.pairs') }}: {{ matchedPairs }}/8</span>
              <span>{{ t('game.attempts') }}: {{ matchAttempts }}</span>
            </div>
            <div class="match-board pixel-border">
              <div 
                v-for="(card, index) in matchCards" 
                :key="index"
                class="match-card pixel-border"
                :class="{ flipped: card.flipped, matched: card.matched }"
                @click="flipCard(index)"
              >
                <div class="card-front">?</div>
                <div class="card-back">{{ card.value }}</div>
              </div>
            </div>
            <div v-if="matchedPairs >= 8" class="game-result pixel-border">
              <h3>{{ t('game.congratulations') }}!</h3>
              <p>{{ t('game.allPairsMatched') }}</p>
              <button class="btn-restart pixel-border" @click="restartMatch">{{ t('game.restart') }}</button>
            </div>
          </div>
          </div>
        </div>
        <!-- 好友排行榜侧边栏 -->
        <div class="friends-leaderboard pixel-border">
          <div class="sidebar-header">
            <span class="sidebar-icon">👥</span>
            <span class="sidebar-title pixel-text">{{ t('game.friendsRanking') }}</span>
          </div>
          <div class="friends-list">
            <div 
              v-for="(friend, index) in friendsRankings" 
              :key="friend.id"
              class="friend-item"
              :class="{ 'current-user': friend.isCurrentUser }"
            >
              <div class="friend-rank">{{ index + 1 }}</div>
              <div class="friend-avatar">{{ friend.name.charAt(0).toUpperCase() }}</div>
              <div class="friend-info">
                <div class="friend-name">{{ friend.name }}</div>
                <div class="friend-game-score">{{ getGameScore('match', friend.id) }}</div>
              </div>
            </div>
            <div v-if="friendsRankings.length === 0" class="no-friends">
              {{ t('game.noFriends') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 收益计算挑战 -->
    <div v-if="currentGame === 'calculator'" class="game-modal pixel-border" @click="handleGameBackdropClick">
      <div class="game-content-with-sidebar">
        <div class="game-main-content">
          <div class="game-header">
            <h2 class="pixel-text">{{ t('game.profitChallenge') }}</h2>
            <button class="btn-close pixel-border" @click="closeGame">×</button>
          </div>
          <div class="game-body">
          <div class="calculator-game">
            <div class="calc-info">
              <span>{{ t('game.round') }}: {{ calcRound }}/10</span>
              <span>{{ t('game.correct') }}: {{ calcCorrect }}</span>
            </div>
            <div class="calc-question pixel-border">
              <div class="question-text">
                {{ calcQuestion.text }}
              </div>
              <div class="question-answer neon-text">
                = ?
              </div>
            </div>
            <div class="calc-options">
              <button 
                v-for="(option, index) in calcOptions" 
                :key="index"
                class="btn-calc pixel-border"
                @click="selectAnswer(option)"
                :disabled="calcRound >= 10"
              >
                {{ option }}
              </button>
            </div>
            <div v-if="calcRound >= 10" class="game-result pixel-border">
              <h3>{{ t('game.gameOver') }}</h3>
              <p>{{ t('game.finalScore') }}: {{ calcCorrect }}/10</p>
              <button class="btn-restart pixel-border" @click="restartCalculator">{{ t('game.restart') }}</button>
            </div>
          </div>
          </div>
        </div>
        <!-- 好友排行榜侧边栏 -->
        <div class="friends-leaderboard pixel-border">
          <div class="sidebar-header">
            <span class="sidebar-icon">👥</span>
            <span class="sidebar-title pixel-text">{{ t('game.friendsRanking') }}</span>
          </div>
          <div class="friends-list">
            <div 
              v-for="(friend, index) in friendsRankings" 
              :key="friend.id"
              class="friend-item"
              :class="{ 'current-user': friend.isCurrentUser }"
            >
              <div class="friend-rank">{{ index + 1 }}</div>
              <div class="friend-avatar">{{ friend.name.charAt(0).toUpperCase() }}</div>
              <div class="friend-info">
                <div class="friend-name">{{ friend.name }}</div>
                <div class="friend-game-score">{{ getGameScore('calculator', friend.id) }}/10</div>
              </div>
            </div>
            <div v-if="friendsRankings.length === 0" class="no-friends">
              {{ t('game.noFriends') }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, watch } from 'vue'
import { getCurrentLanguage, t as translate } from '../i18n'

const currentLanguage = inject('language', ref(getCurrentLanguage()))
const t = (key) => translate(key, currentLanguage.value)

const totalScore = ref(0)
const playerLevel = ref(1)
const currentGame = ref(null)
const showCommunityLeaderboard = ref(false)

const gameScores = ref({
  trading: 0,
  puzzle: 0,
  predict: 0,
  mining: 0,
  match: 0,
  calculator: 0
})

const gamePlays = ref({
  trading: 0,
  puzzle: 0,
  predict: 0,
  mining: 0,
  match: 0,
  calculator: 0
})

// 全社区排行榜数据
const communityRankings = ref([
  { id: 1, name: 'CryptoWhale', totalScore: 125800, level: 15, isCurrentUser: false },
  { id: 2, name: 'DeFiMaster', totalScore: 112300, level: 14, isCurrentUser: false },
  { id: 3, name: 'TradingPro', totalScore: 98700, level: 13, isCurrentUser: false },
  { id: 4, name: 'QuantGuru', totalScore: 85600, level: 12, isCurrentUser: false },
  { id: 5, name: 'AlgoTrader', totalScore: 72300, level: 11, isCurrentUser: false },
  { id: 6, name: 'MarketMaker', totalScore: 65400, level: 10, isCurrentUser: false },
  { id: 7, name: 'StrategyKing', totalScore: 58900, level: 9, isCurrentUser: false },
  { id: 8, name: 'ProfitHunter', totalScore: 52100, level: 8, isCurrentUser: false },
  { id: 9, name: 'BlockchainDev', totalScore: 45600, level: 7, isCurrentUser: false },
  { id: 10, name: 'SmartContract', totalScore: 38900, level: 6, isCurrentUser: false },
  { id: 11, name: 'Web3Builder', totalScore: 32100, level: 5, isCurrentUser: true },
  { id: 12, name: 'DeFiExplorer', totalScore: 25400, level: 4, isCurrentUser: false },
  { id: 13, name: 'CryptoNewbie', totalScore: 18700, level: 3, isCurrentUser: false },
  { id: 14, name: 'TokenCollector', totalScore: 12300, level: 2, isCurrentUser: false },
  { id: 15, name: 'NFTTrader', totalScore: 5600, level: 1, isCurrentUser: false }
])

// 好友排行榜数据（包含当前用户）
const friendsRankings = ref([
  { id: 11, name: 'Web3Builder', totalScore: 32100, level: 5, isCurrentUser: true, gameScores: { trading: 1250, puzzle: 45, predict: 78, mining: 1234, match: 12, calculator: 8 } },
  { id: 1, name: 'CryptoWhale', totalScore: 125800, level: 15, isCurrentUser: false, gameScores: { trading: 2450, puzzle: 32, predict: 85, mining: 5678, match: 8, calculator: 10 } },
  { id: 2, name: 'DeFiMaster', totalScore: 112300, level: 14, isCurrentUser: false, gameScores: { trading: 1890, puzzle: 38, predict: 72, mining: 3456, match: 10, calculator: 9 } },
  { id: 3, name: 'TradingPro', totalScore: 98700, level: 13, isCurrentUser: false, gameScores: { trading: 1670, puzzle: 42, predict: 80, mining: 4321, match: 9, calculator: 8 } },
  { id: 4, name: 'QuantGuru', totalScore: 85600, level: 12, isCurrentUser: false, gameScores: { trading: 1340, puzzle: 35, predict: 75, mining: 2345, match: 11, calculator: 7 } }
])

// 交易模拟器
const tradingBalance = ref(1000)
const tradingProfit = ref(0)
const tradingRound = ref(0)
const currentPrice = ref(100)
const priceChange = ref(0)

// 策略拼图
const puzzleTiles = ref([])
const puzzleMoves = ref(0)
const puzzleTime = ref(0)
const puzzleSolved = ref(false)
let puzzleTimer = null

// 价格预测 - 使用K线数据（开盘、收盘、最高、最低）
const predictRound = ref(0)
const predictCorrect = ref(0)
const currentPredictPrice = ref(100)
const priceHistory = ref([
  { open: 100, high: 102, low: 98, close: 101 },
  { open: 101, high: 105, low: 99, close: 103 },
  { open: 103, high: 107, low: 101, close: 105 }
])
const chartOffset = ref(0)
const minPrice = computed(() => {
  if (!priceHistory.value || priceHistory.value.length === 0) return 90
  return Math.min(...priceHistory.value.map(c => c.low))
})
const maxPrice = computed(() => {
  if (!priceHistory.value || priceHistory.value.length === 0) return 110
  return Math.max(...priceHistory.value.map(c => c.high))
})

// K线样式计算函数，确保不溢出
const getCandlestickShadowStyle = (candle) => {
  if (maxPrice.value - minPrice.value === 0) {
    return { top: '0%', height: '100%' }
  }
  const topPercent = Math.max(0, Math.min(100, ((maxPrice.value - candle.high) / (maxPrice.value - minPrice.value) * 100)))
  const heightPercent = Math.min(100 - topPercent, ((candle.high - candle.low) / (maxPrice.value - minPrice.value) * 100))
  return {
    top: topPercent + '%',
    height: Math.max(0, heightPercent) + '%'
  }
}

const getCandlestickBodyStyle = (candle) => {
  if (maxPrice.value - minPrice.value === 0) {
    return { top: '50%', height: '5%', minHeight: '2px' }
  }
  const bodyTop = Math.max(candle.open, candle.close)
  const bodyBottom = Math.min(candle.open, candle.close)
  const topPercent = Math.max(0, Math.min(100, ((maxPrice.value - bodyTop) / (maxPrice.value - minPrice.value) * 100)))
  const heightPercent = Math.min(100 - topPercent, ((bodyTop - bodyBottom) / (maxPrice.value - minPrice.value) * 100))
  return {
    top: topPercent + '%',
    height: Math.max(2, heightPercent) + '%',
    minHeight: '2px'
  }
}

// 监听价格历史变化，自动滚动图表以确保最后一个K线可见
watch(() => priceHistory.value.length, (newLength) => {
  if (newLength > 0) {
    // 计算需要偏移的距离，确保最后一个K线（当前价格）在可见区域右侧
    const chartWidth = 600 // 图表可见区域宽度（px）
    const candleSpacing = 60 // 每个K线之间的间距（px）
    const lastCandlePosition = (newLength - 1) * candleSpacing
    // 如果最后一个K线在可见区域右侧，需要向左偏移
    if (lastCandlePosition > chartWidth - 100) {
      chartOffset.value = -(lastCandlePosition - chartWidth + 100)
    } else {
      chartOffset.value = 0
    }
  }
})

// 挖矿游戏
const miningCoins = ref(0)
const miningPower = ref(1)
const isMining = ref(false)
const clickedBlockIndex = ref(-1)
const hasClickedMining = ref(false)
const showMiningRules = ref(false) // 规则折叠状态
const miningBlockCount = 64 // 8x8 = 64个方块
const upgrades = ref([
  { id: 1, name: 'Pickaxe', power: 1, cost: 10 },
  { id: 2, name: 'Drill', power: 2, cost: 50 },
  { id: 3, name: 'Laser', power: 5, cost: 200 }
])

// 交易对匹配
const matchCards = ref([])
const matchedPairs = ref(0)
const matchAttempts = ref(0)
const flippedCards = ref([])

// 收益计算
const calcRound = ref(0)
const calcCorrect = ref(0)
const calcQuestion = ref({ text: '', answer: 0 })
const calcOptions = ref([])

const openGame = (game) => {
  currentGame.value = game
  gamePlays.value[game]++
  
  if (game === 'trading') {
    restartTrading()
  } else if (game === 'puzzle') {
    restartPuzzle()
  } else if (game === 'predict') {
    restartPredict()
  } else if (game === 'mining') {
    restartMining()
  } else if (game === 'match') {
    restartMatch()
  } else if (game === 'calculator') {
    restartCalculator()
  }
}

// 阻止点击遮罩层关闭游戏弹窗
const handleGameBackdropClick = (e) => {
  // 如果点击的是遮罩层本身（不是游戏内容），阻止关闭
  if (e.target === e.currentTarget) {
    e.preventDefault()
    e.stopPropagation()
    // 不执行任何操作，强制用户使用关闭按钮
  }
}

const closeGame = () => {
  currentGame.value = null
  if (puzzleTimer) {
    clearInterval(puzzleTimer)
    puzzleTimer = null
  }
}

// 交易模拟器逻辑
const restartTrading = () => {
  tradingBalance.value = 1000
  tradingProfit.value = 0
  tradingRound.value = 0
  currentPrice.value = 100
  priceChange.value = 0
}

const makeTrade = (action) => {
  if (tradingRound.value >= 10) return
  
  const oldPrice = currentPrice.value
  const change = (Math.random() - 0.5) * 10
  currentPrice.value = Math.max(50, Math.min(150, oldPrice + change))
  priceChange.value = ((currentPrice.value - oldPrice) / oldPrice) * 100
  
  if (action === 'buy' && priceChange.value > 0) {
    tradingProfit.value += Math.abs(change) * 10
  } else if (action === 'sell' && priceChange.value < 0) {
    tradingProfit.value += Math.abs(change) * 10
  } else if (action === 'hold') {
    tradingProfit.value -= Math.abs(change) * 5
  }
  
  tradingRound.value++
  
  if (tradingRound.value >= 10) {
    if (tradingProfit.value > gameScores.value.trading) {
      gameScores.value.trading = Math.floor(tradingProfit.value)
      totalScore.value += Math.floor(tradingProfit.value)
    }
  }
}

// 策略拼图逻辑
const restartPuzzle = () => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 0]
  puzzleTiles.value = numbers.sort(() => Math.random() - 0.5)
  puzzleMoves.value = 0
  puzzleTime.value = 0
  puzzleSolved.value = false
  
  if (puzzleTimer) clearInterval(puzzleTimer)
  puzzleTimer = setInterval(() => {
    puzzleTime.value++
  }, 1000)
}

const moveTile = (index) => {
  if (puzzleSolved.value) return
  
  const emptyIndex = puzzleTiles.value.indexOf(0)
  const row = Math.floor(index / 3)
  const col = index % 3
  const emptyRow = Math.floor(emptyIndex / 3)
  const emptyCol = emptyIndex % 3
  
  if ((row === emptyRow && Math.abs(col - emptyCol) === 1) ||
      (col === emptyCol && Math.abs(row - emptyRow) === 1)) {
    [puzzleTiles.value[index], puzzleTiles.value[emptyIndex]] = 
    [puzzleTiles.value[emptyIndex], puzzleTiles.value[index]]
    puzzleMoves.value++
    
    checkPuzzleSolved()
  }
}

const checkPuzzleSolved = () => {
  const solved = puzzleTiles.value.every((tile, index) => 
    tile === (index === 8 ? 0 : index + 1)
  )
  if (solved) {
    puzzleSolved.value = true
    if (puzzleTimer) clearInterval(puzzleTimer)
    if (puzzleMoves.value < gameScores.value.puzzle || gameScores.value.puzzle === 0) {
      gameScores.value.puzzle = puzzleMoves.value
      totalScore.value += (100 - puzzleMoves.value)
    }
  }
}

// 价格预测逻辑
const restartPredict = () => {
  predictRound.value = 0
  predictCorrect.value = 0
  currentPredictPrice.value = 100
  priceHistory.value = [
    { open: 100, high: 102, low: 98, close: 101 },
    { open: 101, high: 105, low: 99, close: 103 },
    { open: 103, high: 107, low: 101, close: 105 }
  ]
  chartOffset.value = 0
}

const makePrediction = (direction) => {
  if (predictRound.value >= 10) return
  
  const lastCandle = priceHistory.value[priceHistory.value.length - 1]
  const basePrice = lastCandle.close
  
  // 生成新的K线数据
  const volatility = 5
  const open = basePrice
  const change = (Math.random() - 0.5) * volatility * 2
  const close = Math.max(50, Math.min(150, basePrice + change))
  const high = Math.max(open, close) + Math.random() * volatility
  const low = Math.min(open, close) - Math.random() * volatility
  
  const newCandle = {
    open: open,
    high: Math.max(open, close, high),
    low: Math.min(open, close, low),
    close: close
  }
  
  const actualDirection = close > open ? 'up' : 'down'
  
  if (direction === actualDirection) {
    predictCorrect.value++
  }
  
  currentPredictPrice.value = close
  priceHistory.value.push(newCandle)
  if (priceHistory.value.length > 10) {
    priceHistory.value.shift()
  }
  
  predictRound.value++
  
  if (predictRound.value >= 10) {
    const accuracy = (predictCorrect.value / 10 * 100)
    if (accuracy > gameScores.value.predict) {
      gameScores.value.predict = Math.floor(accuracy)
      totalScore.value += Math.floor(accuracy)
    }
  }
}

// 挖矿游戏逻辑
const miningTarget = ref(1000) // 目标：收集1000个代币通关
const miningCompleted = ref(false)
const miningResult = ref('success') // 'success' 或 'empty'
const miningFailureRate = 0.15 // 15%的概率挖不到

const restartMining = () => {
  miningCoins.value = 0
  miningPower.value = 1
  hasClickedMining.value = false
  clickedBlockIndex.value = -1
  miningCompleted.value = false
  miningResult.value = 'success'
  // 重置升级成本
  upgrades.value = [
    { id: 1, name: 'Pickaxe', power: 1, cost: 10 },
    { id: 2, name: 'Drill', power: 2, cost: 50 },
    { id: 3, name: 'Laser', power: 5, cost: 200 }
  ]
}

const mineCoin = (event) => {
  if (isMining.value || miningCompleted.value) return // 防止重复点击或已完成
  
  hasClickedMining.value = true
  
  // 计算点击的是哪个方块
  const miningArea = event.currentTarget.closest('.mining-animation')
  const rect = miningArea.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  // 计算点击的方块索引（8x8网格）
  const gridSize = Math.sqrt(miningBlockCount) // 8
  const blockWidth = rect.width / gridSize
  const blockHeight = rect.height / gridSize
  const col = Math.floor(x / blockWidth)
  const row = Math.floor(y / blockHeight)
  clickedBlockIndex.value = row * gridSize + col
  
  // 判断是否挖到（有15%概率挖不到）
  const random = Math.random()
  miningResult.value = random < miningFailureRate ? 'empty' : 'success'
  
  isMining.value = true
  
  // 只有成功时才增加代币
  if (miningResult.value === 'success') {
    miningCoins.value += miningPower.value
    
    // 检查是否通关
    if (miningCoins.value >= miningTarget.value && !miningCompleted.value) {
      miningCompleted.value = true
      // 通关奖励
      totalScore.value += 500
    }
    
    // 更新游戏分数
    if (miningCoins.value > gameScores.value.mining) {
      const scoreIncrease = miningCoins.value - gameScores.value.mining
      gameScores.value.mining = miningCoins.value
      totalScore.value += scoreIncrease
    } else {
      totalScore.value += miningPower.value
    }
  }
  
  setTimeout(() => {
    isMining.value = false
    clickedBlockIndex.value = -1
  }, 400)
}

const buyUpgrade = (upgrade) => {
  if (miningCoins.value >= upgrade.cost) {
    miningCoins.value -= upgrade.cost
    miningPower.value += upgrade.power
    // 更新升级项的成本（不直接修改原对象，而是找到对应的升级项）
    const upgradeIndex = upgrades.value.findIndex(u => u.id === upgrade.id)
    if (upgradeIndex !== -1) {
      upgrades.value[upgradeIndex].cost = Math.floor(upgrade.cost * 1.5)
    }
  }
}

// 交易对匹配逻辑
const restartMatch = () => {
  const pairs = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'DOT', 'LINK', 'MATIC']
  const values = [...pairs, ...pairs]
  matchCards.value = values
    .sort(() => Math.random() - 0.5)
    .map(value => ({ value, flipped: false, matched: false }))
  matchedPairs.value = 0
  matchAttempts.value = 0
  flippedCards.value = []
}

const flipCard = (index) => {
  const card = matchCards.value[index]
  if (card.flipped || card.matched || flippedCards.value.length >= 2) return
  
  card.flipped = true
  flippedCards.value.push(index)
  
  if (flippedCards.value.length === 2) {
    matchAttempts.value++
    const [idx1, idx2] = flippedCards.value
    const card1 = matchCards.value[idx1]
    const card2 = matchCards.value[idx2]
    
    if (card1.value === card2.value) {
      card1.matched = true
      card2.matched = true
      matchedPairs.value++
      
      if (matchedPairs.value >= 8) {
        if (matchAttempts.value < gameScores.value.match || gameScores.value.match === 0) {
          gameScores.value.match = matchAttempts.value
          totalScore.value += (100 - matchAttempts.value)
        }
      }
    } else {
      setTimeout(() => {
        card1.flipped = false
        card2.flipped = false
      }, 1000)
    }
    
    setTimeout(() => {
      flippedCards.value = []
    }, 1000)
  }
}

// 收益计算逻辑
const restartCalculator = () => {
  calcRound.value = 0
  calcCorrect.value = 0
  generateQuestion()
}

const generateQuestion = () => {
  const price = Math.floor(Math.random() * 1000) + 100
  const amount = Math.floor(Math.random() * 10) + 1
  const profitRate = (Math.random() * 20 - 10).toFixed(2)
  const profit = (price * amount * profitRate / 100).toFixed(2)
  
  calcQuestion.value = {
    text: `Price: $${price}, Amount: ${amount}, Profit Rate: ${profitRate}%`,
    answer: parseFloat(profit)
  }
  
  const wrongAnswers = [
    parseFloat(profit) + (Math.random() - 0.5) * 100,
    parseFloat(profit) + (Math.random() - 0.5) * 100,
    parseFloat(profit) + (Math.random() - 0.5) * 100
  ]
  
  calcOptions.value = [parseFloat(profit), ...wrongAnswers]
    .sort(() => Math.random() - 0.5)
    .map(v => v.toFixed(2))
}

const selectAnswer = (answer) => {
  if (calcRound.value >= 10) return
  
  if (Math.abs(parseFloat(answer) - calcQuestion.value.answer) < 0.01) {
    calcCorrect.value++
  }
  
  calcRound.value++
  
  if (calcRound.value < 10) {
    generateQuestion()
  } else {
    if (calcCorrect.value > gameScores.value.calculator) {
      gameScores.value.calculator = calcCorrect.value
      totalScore.value += calcCorrect.value * 10
    }
  }
}

onMounted(() => {
  // 从localStorage加载分数
  const savedScores = localStorage.getItem('gameScores')
  if (savedScores) {
    gameScores.value = JSON.parse(savedScores)
  }
  
  const savedPlays = localStorage.getItem('gamePlays')
  if (savedPlays) {
    gamePlays.value = JSON.parse(savedPlays)
  }
  
  const savedTotal = localStorage.getItem('totalScore')
  if (savedTotal) {
    totalScore.value = parseInt(savedTotal)
  }
})

// 保存分数
const saveScores = () => {
  localStorage.setItem('gameScores', JSON.stringify(gameScores.value))
  localStorage.setItem('gamePlays', JSON.stringify(gamePlays.value))
  localStorage.setItem('totalScore', totalScore.value.toString())
}

// 监听分数变化
watch([gameScores, gamePlays, totalScore], () => {
  saveScores()
  playerLevel.value = Math.floor(totalScore.value / 100) + 1
  
  // 更新排行榜中的当前用户数据
  const currentUserIndex = communityRankings.value.findIndex(p => p.isCurrentUser)
  if (currentUserIndex !== -1) {
    communityRankings.value[currentUserIndex].totalScore = totalScore.value
    communityRankings.value[currentUserIndex].level = playerLevel.value
  }
  // 重新排序社区排行榜
  communityRankings.value.sort((a, b) => b.totalScore - a.totalScore)
  
  // 更新好友排行榜中的当前用户数据
  const friendUserIndex = friendsRankings.value.findIndex(p => p.isCurrentUser)
  if (friendUserIndex !== -1) {
    friendsRankings.value[friendUserIndex].totalScore = totalScore.value
    friendsRankings.value[friendUserIndex].level = playerLevel.value
    friendsRankings.value[friendUserIndex].gameScores = { ...gameScores.value }
  }
  // 重新排序好友排行榜
  friendsRankings.value.sort((a, b) => b.totalScore - a.totalScore)
}, { deep: true })

// 切换全社区排行榜显示
const toggleCommunityLeaderboard = () => {
  showCommunityLeaderboard.value = !showCommunityLeaderboard.value
}

// 获取好友在特定游戏的分数
const getGameScore = (gameType, friendId) => {
  const friend = friendsRankings.value.find(f => f.id === friendId)
  if (!friend || !friend.gameScores) return 0
  
  switch (gameType) {
    case 'trading':
      return friend.gameScores.trading || 0
    case 'puzzle':
      return friend.gameScores.puzzle || 0
    case 'predict':
      return friend.gameScores.predict || 0
    case 'mining':
      return formatNumber(friend.gameScores.mining || 0)
    case 'match':
      return friend.gameScores.match || 0
    case 'calculator':
      return friend.gameScores.calculator || 0
    default:
      return 0
  }
}

// 获取排名徽章文本
const getRankBadge = (index) => {
  if (index === 0) return t('game.champion')
  if (index === 1) return t('game.runnerUp')
  if (index === 2) return t('game.thirdPlace')
  return ''
}

// 格式化数字
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toLocaleString()
}
</script>

<style scoped>
.game-page {
  padding-bottom: var(--spacing-xl);
}

.page-header {
  margin-bottom: var(--spacing-md);
}

.page-title {
  font-size: 32px;
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-primary);
}

.page-meta {
  display: flex;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-xs);
}

.meta-item {
  font-size: 12px;
  color: var(--text-secondary);
  font-family: var(--font-mono);
}

.pixel-text {
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 700;
  text-shadow: 
    2px 2px 0px #000,
    4px 4px 0px rgba(99, 102, 241, 0.5);
}

.pixel-border {
  border: 3px solid var(--text-primary);
  box-shadow: 
    inset -3px -3px 0px rgba(0, 0, 0, 0.5),
    3px 3px 0px rgba(99, 102, 241, 0.3);
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.neon-text {
  color: #4ade80;
}

/* 全社区排行榜 */
.community-leaderboard {
  background: transparent;
  margin-top: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  overflow: hidden;
  transition: all 0.3s ease;
  border: none;
  box-shadow: none;
}

.community-leaderboard.expanded {
  max-height: 800px;
}

.leaderboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  cursor: pointer;
  background: transparent;
  border: none;
  transition: all 0.2s;
  border-radius: var(--radius-md);
  opacity: 0.7;
}

.leaderboard-header:hover {
  background: rgba(99, 102, 241, 0.03);
  opacity: 1;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.leaderboard-icon {
  font-size: 20px;
}

.leaderboard-title {
  font-size: 13px;
  color: var(--text-secondary);
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 500;
}

.leaderboard-count {
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.header-right {
  display: flex;
  align-items: center;
}

.toggle-icon {
  font-size: 12px;
  color: var(--text-secondary);
  transition: transform 0.3s;
  font-family: var(--font-mono);
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

.leaderboard-content {
  max-height: 600px;
  overflow-y: auto;
  padding: var(--spacing-md);
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.leaderboard-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  transition: all 0.2s;
  border: 1px solid transparent;
}

.leaderboard-item:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-color);
}

.leaderboard-item.top-three {
  background: var(--bg-tertiary);
  border-color: var(--tech-primary);
}

.leaderboard-item.current-user {
  background: rgba(99, 102, 241, 0.1);
  border-color: var(--tech-primary);
  font-weight: 600;
}

.rank-badge {
  min-width: 40px;
  text-align: center;
  font-weight: 700;
  font-size: 18px;
  font-family: var(--font-mono);
}

.rank-1 { color: #ffd700; }
.rank-2 { color: #c0c0c0; }
.rank-3 { color: #cd7f32; }

.player-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--tech-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  color: white;
  flex-shrink: 0;
}

.player-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.player-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.player-level {
  font-size: 11px;
  color: var(--text-muted);
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.player-score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.score-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-mono);
}

.score-label {
  font-size: 10px;
  color: var(--text-muted);
}

.player-badge {
  padding: 2px 8px;
  background: var(--tech-primary);
  color: white;
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-text {
  font-family: var(--font-mono);
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-md);
}

.game-card {
  background: var(--bg-secondary);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.game-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent);
  transition: left 0.5s;
}

.game-card:hover::before {
  left: 100%;
}

.game-card:hover {
  transform: translateY(-5px);
  border-color: var(--tech-primary);
  box-shadow: 
    inset -3px -3px 0px rgba(0, 0, 0, 0.5),
    3px 3px 0px rgba(99, 102, 241, 0.6),
    0 10px 30px rgba(99, 102, 241, 0.3);
}

.game-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
  filter: drop-shadow(2px 2px 0px rgba(0, 0, 0, 0.5));
}

.game-title {
  font-size: 20px;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.game-desc {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  font-size: 13px;
  line-height: 1.6;
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.game-stats {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
  font-size: 11px;
  color: var(--text-muted);
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.game-badge {
  display: inline-block;
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  border: 2px solid;
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.badge-newbie {
  border-color: #3fb950;
  color: #3fb950;
  background: rgba(63, 185, 80, 0.1);
}

.badge-puzzle {
  border-color: #8b5cf6;
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.1);
}

.badge-competition {
  border-color: #ff6b4a;
  color: #ff6b4a;
  background: rgba(255, 107, 74, 0.1);
}

.badge-addictive {
  border-color: #ffd700;
  color: #ffd700;
  background: rgba(255, 215, 0, 0.1);
}

.badge-memory {
  border-color: #58a6ff;
  color: #58a6ff;
  background: rgba(88, 166, 255, 0.1);
}

.badge-challenge {
  border-color: #a855f7;
  color: #a855f7;
  background: rgba(168, 85, 247, 0.1);
}

/* 游戏弹窗 */
.game-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
}

.game-content {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.game-content-with-sidebar {
  display: flex;
  gap: var(--spacing-md);
  max-width: 1200px;
  width: 100%;
  max-height: 90vh;
}

.game-main-content {
  flex: 1;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

/* 好友排行榜侧边栏 */
.friends-leaderboard {
  width: 280px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--bg-tertiary);
  border-bottom: 2px solid var(--border-color);
}

.sidebar-icon {
  font-size: 18px;
}

.sidebar-title {
  font-size: 12px;
  color: var(--text-primary);
}

.friends-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.friend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  transition: all 0.2s;
  border: 1px solid transparent;
}

.friend-item:hover {
  background: var(--bg-hover);
  border-color: var(--border-color);
}

.friend-item.current-user {
  background: rgba(99, 102, 241, 0.15);
  border-color: var(--tech-primary);
  font-weight: 600;
}

.friend-rank {
  min-width: 24px;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.friend-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--tech-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: white;
  flex-shrink: 0;
}

.friend-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.friend-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.friend-game-score {
  font-size: 10px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.no-friends {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--text-muted);
  font-size: 12px;
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 2px solid var(--border-color);
}

.btn-close {
  width: 32px;
  height: 32px;
  background: var(--bg-tertiary);
  border: none;
  color: var(--text-primary);
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover {
  background: var(--danger);
  color: white;
}

.game-body {
  padding: var(--spacing-lg);
  overflow-y: auto;
  flex: 1;
}

/* 交易模拟器 */
.trading-game {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.game-info {
  display: flex;
  justify-content: space-around;
  gap: var(--spacing-md);
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.info-item .label {
  font-size: 12px;
  color: var(--text-muted);
}

.info-item .value {
  font-size: 18px;
  font-weight: 600;
  font-family: var(--font-mono);
}

.price-display {
  text-align: center;
  padding: var(--spacing-xl);
  background: var(--bg-primary);
}

.current-price {
  font-size: 48px;
  font-weight: 700;
  font-family: var(--font-mono);
  margin-bottom: var(--spacing-sm);
}

.price-change {
  font-size: 24px;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.btn-action {
  flex: 1;
  padding: var(--spacing-md);
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: none;
}

.btn-buy:hover {
  background: var(--success);
  color: white;
}

.btn-sell:hover {
  background: var(--danger);
  color: white;
}

.btn-hold:hover {
  background: var(--text-muted);
  color: white;
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 策略拼图 */
.puzzle-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
}

.puzzle-info {
  display: flex;
  gap: var(--spacing-lg);
  font-size: 14px;
  color: var(--text-secondary);
}

.puzzle-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  width: 300px;
  height: 300px;
  padding: 4px;
  background: var(--bg-primary);
}

.puzzle-tile {
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-primary);
}

.puzzle-tile.empty {
  background: transparent;
  cursor: default;
}

.puzzle-tile:not(.empty):hover {
  background: var(--tech-primary);
  transform: scale(1.05);
}

.puzzle-tile.correct {
  background: var(--success);
  color: white;
}

/* 价格预测 */
.predict-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
}

.predict-intro {
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  width: 100%;
  margin-bottom: var(--spacing-sm);
}

.predict-intro h4 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-primary);
  font-size: 16px;
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.predict-intro p {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.6;
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.chart-legend {
  display: flex;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-sm);
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 12px;
  color: var(--text-secondary);
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.legend-bullish {
  background: #00ff00;
  width: 20px;
  height: 12px;
  border-radius: 2px;
}

.legend-bearish {
  background: #ff0000;
  width: 20px;
  height: 12px;
  border-radius: 2px;
}

.predict-info {
  display: flex;
  gap: var(--spacing-lg);
  font-size: 14px;
  color: var(--text-secondary);
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.price-chart {
  width: 100%;
  height: 220px;
  background: var(--bg-primary);
  position: relative;
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-lg) var(--spacing-md);
  overflow: hidden;
}

.chart-label-top {
  position: absolute;
  top: 4px;
  left: var(--spacing-md);
  font-size: 11px;
  color: var(--text-muted);
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.chart-label-bottom {
  position: absolute;
  bottom: 4px;
  right: var(--spacing-md);
  font-size: 11px;
  color: var(--text-muted);
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.chart-line {
  position: relative;
  width: 100%;
  height: calc(100% - 32px);
  margin-top: 16px;
  margin-bottom: 16px;
  overflow-x: auto;
  overflow-y: hidden;
  min-width: max-content;
}

/* K线图样式 */
.candlestick {
  position: absolute;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  top: 0;
  bottom: 0;
}

.candlestick-shadow {
  position: absolute;
  width: 1px;
  background: #888;
  left: 50%;
  transform: translateX(-50%);
  top: 0;
  bottom: 0;
  max-height: 100%;
}

.candlestick-body {
  position: absolute;
  width: 80%;
  left: 10%;
  border: 1px solid;
  transition: all 0.3s ease;
  min-height: 2px;
}

.candlestick-body.bullish {
  background: #00ff00;
  border-color: #00ff00;
}

.candlestick-body.bearish {
  background: #ff0000;
  border-color: #ff0000;
}

.candlestick:hover .candlestick-body {
  transform: scaleX(1.2);
  z-index: 10;
}

.current-price-display {
  font-size: 48px;
  font-weight: 700;
  font-family: var(--font-mono);
  text-align: center;
  padding: var(--spacing-lg);
  background: var(--bg-primary);
}

.prediction-buttons {
  display: flex;
  gap: var(--spacing-md);
  width: 100%;
}

.btn-predict {
  flex: 1;
  padding: var(--spacing-lg);
  font-size: 24px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: none;
  text-transform: uppercase;
}

.btn-up:hover {
  background: var(--success);
  color: white;
}

.btn-down:hover {
  background: var(--danger);
  color: white;
}

.btn-predict:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 挖矿游戏 */
.mining-game {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.mining-intro {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
}

.mining-intro-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.mining-intro-header:hover {
  opacity: 0.8;
}

.mining-intro-header h4 {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.toggle-rules-icon {
  font-size: 12px;
  color: var(--text-muted);
  transition: transform 0.3s ease;
}

.toggle-rules-icon.expanded {
  transform: rotate(180deg);
}

.mining-intro-content {
  margin-top: var(--spacing-sm);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}

.mining-intro-content p {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.6;
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.mining-intro-content ul {
  margin: var(--spacing-sm) 0 0 0;
  padding-left: var(--spacing-lg);
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.8;
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.mining-intro-content li {
  margin-bottom: var(--spacing-xs);
}

.mining-info {
  display: flex;
  justify-content: space-around;
  font-size: 14px;
  color: var(--text-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-xs);
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.mining-info strong {
  color: var(--tech-primary);
  font-size: 16px;
}

.mining-area {
  width: 100%;
  height: 400px;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  margin-bottom: var(--spacing-xs);
}

.mining-area:hover {
  background: rgba(99, 102, 241, 0.05);
  border-color: var(--tech-primary);
  transform: scale(1.02);
}

.mining-area.mining-active {
  background: rgba(255, 215, 0, 0.1);
  border-color: #ffd700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.mining-animation {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 3px;
  width: 100%;
  max-width: 500px;
  height: 100%;
  max-height: 380px;
  transition: transform 0.3s ease;
  pointer-events: auto;
  padding: var(--spacing-sm);
  cursor: pointer;
  align-items: stretch;
  justify-items: stretch;
}


.pixel-block {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
  cursor: pointer;
  pointer-events: auto;
  user-select: none;
}

.pixel-block.block-flash {
  animation: mine-flash 0.4s ease;
  background: #ffd700 !important;
  box-shadow: 0 0 15px #ffd700 !important;
  transform: scale(1.2) !important;
  z-index: 10;
}

.pixel-block.block-empty {
  background: #666 !important;
  box-shadow: 0 0 10px #666 !important;
  transform: scale(0.9) !important;
  opacity: 0.7;
}

@keyframes mine-flash {
  0% { 
    background: var(--bg-tertiary);
    transform: scale(1);
  }
  50% { 
    background: #ffd700;
    transform: scale(1.2);
    box-shadow: 0 0 15px #ffd700;
  }
  100% { 
    background: var(--bg-tertiary);
    transform: scale(1);
  }
}

.click-hint {
  position: absolute;
  font-size: 18px;
  font-weight: 600;
  animation: pulse 1s ease-in-out infinite;
  pointer-events: none;
}

.mining-area.mining-active .click-hint {
  opacity: 0;
}

.mining-completed-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 20;
  background: rgba(0, 0, 0, 0.9);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  border: 2px solid #ffd700;
}

.mining-completed-message h3 {
  margin: 0 0 var(--spacing-sm) 0;
  color: #ffd700;
  font-size: 24px;
}

.mining-completed-message p {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-primary);
  font-size: 14px;
}

.mining-status-completed {
  color: #00ff00 !important;
  font-weight: 600;
}

.mining-feedback {
  position: absolute;
  font-size: 24px;
  font-weight: 700;
  animation: feedback-pop 0.4s ease-out;
  pointer-events: none;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
}

.mining-feedback.success {
  color: #00ff00;
}

.mining-feedback.empty {
  color: #999;
  font-size: 20px;
}

@keyframes feedback-pop {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -70%) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -90%) scale(1);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}

.upgrade-shop {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-primary);
  margin-top: var(--spacing-xs);
}

.upgrade-shop h4 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-primary);
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.upgrade-desc {
  margin: 0 0 var(--spacing-md) 0;
  padding: var(--spacing-sm);
  background: rgba(99, 102, 241, 0.1);
  border-left: 3px solid var(--tech-primary);
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.6;
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.upgrade-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  gap: var(--spacing-md);
}

.upgrade-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.upgrade-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.upgrade-effect {
  font-size: 12px;
  color: var(--text-muted);
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.upgrade-shop h4 {
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.upgrade-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.btn-upgrade {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: none;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.btn-upgrade:hover:not(:disabled) {
  background: var(--tech-primary);
  color: white;
}

.btn-upgrade:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 交易对匹配 */
.match-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
}

.match-info {
  display: flex;
  gap: var(--spacing-lg);
  font-size: 14px;
  color: var(--text-secondary);
}

.match-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  width: 100%;
  max-width: 500px;
  padding: var(--spacing-md);
  background: var(--bg-primary);
}

.match-card {
  aspect-ratio: 1;
  background: var(--bg-tertiary);
  cursor: pointer;
  position: relative;
  transition: transform 0.3s;
}

.match-card:hover:not(.flipped):not(.matched) {
  transform: scale(1.05);
}

.match-card.flipped,
.match-card.matched {
  background: var(--bg-secondary);
}

.match-card.matched {
  opacity: 0.5;
  cursor: default;
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  backface-visibility: hidden;
  transition: transform 0.3s;
}

.card-front {
  background: var(--tech-primary);
  color: white;
}

.card-back {
  transform: rotateY(180deg);
  color: var(--text-primary);
}

.match-card.flipped .card-front {
  transform: rotateY(180deg);
}

.match-card.flipped .card-back {
  transform: rotateY(0deg);
}

/* 收益计算 */
.calculator-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
}

.calc-info {
  display: flex;
  gap: var(--spacing-lg);
  font-size: 14px;
  color: var(--text-secondary);
}

.calc-question {
  width: 100%;
  padding: var(--spacing-xl);
  background: var(--bg-primary);
  text-align: center;
}

.question-text {
  font-size: 18px;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  font-family: var(--font-mono);
}

.question-answer {
  font-size: 48px;
  font-weight: 700;
  font-family: var(--font-mono);
}

.calc-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  width: 100%;
}

.btn-calc {
  padding: var(--spacing-lg);
  font-size: 24px;
  font-weight: 700;
  font-family: var(--font-mono);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-calc:hover:not(:disabled) {
  background: var(--tech-primary);
  color: white;
  transform: scale(1.05);
}

.btn-calc:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 游戏结果 */
.game-result {
  text-align: center;
  padding: var(--spacing-xl);
  background: var(--bg-primary);
  margin-top: var(--spacing-lg);
}

.game-result h3 {
  font-size: 24px;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.game-result p {
  font-size: 18px;
  margin-bottom: var(--spacing-lg);
  color: var(--text-secondary);
}

.btn-restart {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  background: var(--tech-primary);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-restart:hover {
  background: var(--tech-primary-hover);
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .games-grid {
    grid-template-columns: 1fr;
  }
  
  .game-modal {
    padding: var(--spacing-md);
  }
  
  .game-content-with-sidebar {
    flex-direction: column;
  }
  
  .friends-leaderboard {
    width: 100%;
    max-height: 300px;
  }
  
  .puzzle-board {
    width: 250px;
    height: 250px;
  }
  
  .match-board {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .community-leaderboard.expanded {
    max-height: 500px;
  }
  
  .leaderboard-content {
    max-height: 400px;
  }
}
</style>
