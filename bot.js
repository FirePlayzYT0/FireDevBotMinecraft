const mineflayer = require('mineflayer');
const fs = require('fs');
const path = require('path');

// Load configurations
const botInfo = JSON.parse(fs.readFileSync('./bot-info.json', 'utf8'));
const serverConfig = require('./config/serverConfig');

// Import all handlers
const WhisperHandler = require('./commands/whisperHandler');
const ChatCommands = require('./commands/chatCommands');
const PlayerCommands = require('./commands/playerCommands');
const AdminCommands = require('./commands/adminCommands');
const ConsoleManager = require('./console/consoleManager');
const ConsoleCommands = require('./console/consoleCommands');

// ✅ Initialize logging FIRST
const logFile = path.join(__dirname, 'logs', 'bot.log');
let logStream;

function setupLogging() {
    try {
        // Ensure logs directory exists
        if (!fs.existsSync(path.dirname(logFile))) {
            fs.mkdirSync(path.dirname(logFile), { recursive: true });
            console.log('📁 Created logs directory');
        }
        
        logStream = fs.createWriteStream(logFile, { flags: 'a' });
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        const getTimestamp = () => new Date().toISOString();
        
        console.log = function(...args) {
            const timestamp = getTimestamp();
            const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ');
            
            if (logStream && logStream.writable) {
                logStream.write(`[${timestamp}] [INFO] ${message}\n`);
            }
            originalLog.apply(console, args);
        };

        console.error = function(...args) {
            const timestamp = getTimestamp();
            const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ');
            
            if (logStream && logStream.writable) {
                logStream.write(`[${timestamp}] [ERROR] ${message}\n`);
            }
            originalError.apply(console, args);
        };

        console.warn = function(...args) {
            const timestamp = getTimestamp();
            const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ');
            
            if (logStream && logStream.writable) {
                logStream.write(`[${timestamp}] [WARN] ${message}\n`);
            }
            originalWarn.apply(console, args);
        };

        console.log('✅ Logging system initialized');
    } catch (error) {
        console.error('❌ Failed to setup logging:', error);
    }
}

// ✅ Setup logging immediately
setupLogging();

// Choose which server to use
const selectedServer = serverConfig.aternos;

// Validate server configuration
if (!selectedServer.host) {
    console.log('❌ ERROR: No server host configured!');
    console.log('💡 Please edit config/serverConfig.js and set your server IP');
    process.exit(1);
}

console.log(`🚀 Connecting to: ${selectedServer.description}`);
console.log(`📍 Server: ${selectedServer.host}:${selectedServer.port}`);

let bot;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

function createBot() {
    try {
        bot = mineflayer.createBot({
            host: selectedServer.host,
            port: selectedServer.port,
            version: selectedServer.version,
            username: botInfo.botIdentity.name,
            // auth: 'microsoft' // Uncomment for premium account
        });

        setupBotEvents();
    } catch (error) {
        console.error('❌ Failed to create bot:', error);
        process.exit(1);
    }
}

function setupBotEvents() {
    let whisperHandler, chatCommands, playerCommands, adminCommands, consoleManager, consoleCommands;

    bot.on('login', () => {
        console.log(`✅ ${botInfo.botIdentity.name} logged in to server`);
        reconnectAttempts = 0;
    });

    bot.on('spawn', () => {
        console.log('🎮 Bot spawned in world');
        
        // Send first join message
        if (botInfo.botIdentity.firstJoinMessage) {
            setTimeout(() => {
                bot.chat(botInfo.botIdentity.firstJoinMessage);
                console.log(`💬 Sent first join message`);
            }, 2000);
        }
        
        // ✅ Create comprehensive logger object for handlers
        const logger = {
            chat: (username, message) => {
                const timestamp = new Date().toISOString();
                const logMessage = `[${timestamp}] [CHAT] ${username}: ${message}`;
                console.log(logMessage);
            },
            command: (username, command, args) => {
                const timestamp = new Date().toISOString();
                const logMessage = `[${timestamp}] [COMMAND] ${username}: ${command} ${args.join(' ')}`;
                console.log(logMessage);
            },
            whisper: (from, to, message) => {
                const timestamp = new Date().toISOString();
                const logMessage = `[${timestamp}] [WHISPER] ${from} -> ${to}: ${message}`;
                console.log(logMessage);
            },
            action: (action, details) => {
                const timestamp = new Date().toISOString();
                const logMessage = `[${timestamp}] [ACTION] ${action}: ${details}`;
                console.log(logMessage);
            },
            error: (context, error) => {
                const timestamp = new Date().toISOString();
                const logMessage = `[${timestamp}] [ERROR] ${context}: ${error}`;
                console.log(logMessage);
            }
        };
        
        // ✅ Initialize all handlers with logger
        whisperHandler = new WhisperHandler(bot, botInfo, logger);
        whisperHandler.initialize();
        
        chatCommands = new ChatCommands(bot, botInfo, logger);
        chatCommands.initialize();
        
        playerCommands = new PlayerCommands(bot, botInfo, logger);
        adminCommands = new AdminCommands(bot, botInfo, logger);
        
        consoleCommands = new ConsoleCommands(bot, botInfo, logger);
        consoleManager = new ConsoleManager(bot, botInfo, consoleCommands, logger);
        consoleManager.initialize();
        
        console.log('✅ All handlers initialized');
    });

    // Handle chat commands with logging
    bot.on('chat', (username, message) => {
        if (username === bot.username) return;
        
        console.log(`💬 ${username}: ${message}`);
        
        // Process chat commands through appropriate handlers
        if (message.startsWith(botInfo.commands.prefix)) {
            const args = message.slice(1).split(' ');
            const command = args[0].toLowerCase();
            const commandArgs = args.slice(1);
            
            console.log(`🔧 Command detected: ${command} by ${username}`);
            
            // Try different command handlers
            chatCommands.handleCommand(username, message);
            playerCommands.handleCommand(username, command, commandArgs);
            adminCommands.handleCommand(username, command, commandArgs);
        }
    });

    // Handle whispers with logging
    bot.on('message', (jsonMsg) => {
        const message = jsonMsg.toString();
        if (message.includes('whispers:') || message.includes('whispers to you:')) {
            console.log(`🔒 ${message}`);
        }
    });

    bot.on('error', (err) => {
        console.log('❌ Bot Error:', err.message);
    });

    bot.on('end', (reason) => {
        console.log(`🔌 Disconnected from server: ${reason}`);
        
        if (botInfo.serverSettings.autoReconnect && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            const delay = botInfo.serverSettings.reconnectDelay * reconnectAttempts;
            console.log(`🔄 Reconnecting in ${delay}ms... (Attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
            
            setTimeout(() => {
                console.log('Attempting to reconnect...');
                createBot();
            }, delay);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
            console.log('❌ Max reconnection attempts reached. Shutting down.');
            process.exit(1);
        }
    });

    bot.on('kicked', (reason) => {
        console.log('🚫 Kicked from server:', reason);
    });

    // Additional events with logging
    bot.on('death', () => {
        console.log('💀 Bot died!');
    });

    bot.on('health', () => {
        if (bot.health <= 6) {
            console.log(`⚠️ Low health: ${bot.health}/20`);
        }
    });

    bot.on('spawn', () => {
        console.log('🔁 Bot respawned');
    });
}

// Initialize bot
createBot();

// Graceful shutdown
function gracefulShutdown() {
    console.log('\n🛑 Received shutdown signal...');
    if (bot) {
        bot.chat('Bot shutting down... 👋');
        bot.quit();
    }
    
    // Close log stream
    if (logStream) {
        logStream.end();
    }
    
    setTimeout(() => {
        console.log('Shutdown complete.');
        process.exit(0);
    }, 1000);
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

process.on('uncaughtException', (err) => {
    console.log('⚠️ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.log('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Close log stream on exit
process.on('exit', () => {
    if (logStream) {
        logStream.end();
    }
});