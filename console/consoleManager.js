const readline = require('readline');
const healthConverter = require('../utils/healthConverter');

class ConsoleManager {
    constructor(bot, botInfo, consoleCommands, logger) {
        this.bot = bot;
        this.botInfo = botInfo;
        this.consoleCommands = consoleCommands;
        this.logger = logger;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: 'BOT> '
        });
    }

    initialize() {
        console.log('\n🎮 Console commands activated!');
        console.log('Type "help" for available commands\n');
        this.logger.action('Console', 'Manager initialized');
        
        this.rl.prompt();

        this.rl.on('line', (input) => {
            this.handleConsoleCommand(input.trim());
            this.rl.prompt();
        });

        this.rl.on('close', () => {
            console.log('\n👋 Console manager shutting down...');
            this.logger.action('Console', 'Manager shutdown');
            process.exit(0);
        });
    }

    handleConsoleCommand(input) {
        if (!input) return;

        const args = input.split(' ');
        const command = args[0].toLowerCase();
        const commandArgs = args.slice(1);

        this.logger.action('Console', `Command: ${command} ${commandArgs.join(' ')}`);

        // First try the extended console commands
        if (this.consoleCommands && this.consoleCommands.handleCommand(command, commandArgs)) {
            return;
        }

        // Fall back to built-in commands
        switch (command) {
            case 'help': this.showHelp(); break;
            case 'say': this.sayCommand(commandArgs); break;
            case 'whisper': this.whisperCommand(commandArgs); break;
            case 'status': this.statusCommand(); break;
            case 'whispermode': this.whisperModeCommand(commandArgs); break;
            case 'quit': this.quitCommand(); break;
            case 'players': this.playersCommand(); break;
            case 'pos': this.positionCommand(); break;
            case 'health': this.healthCommand(); break;
            case 'time': this.timeCommand(); break;
            case 'stats': this.statsCommand(); break;
            case 'inventory': this.inventoryCommand(); break;
            case 'biome': this.biomeCommand(); break;
            case 'joke': this.jokeCommand(); break;
            case 'quote': this.quoteCommand(); break;
            case 'shutdown': this.shutdownCommand(); break;
            case 'reconnect': this.reconnectCommand(); break;
            case 'logs': this.logsCommand(commandArgs); break;
            case 'clearlogs': this.clearLogsCommand(); break;
            default: console.log('❌ Unknown command. Type "help" for available commands.');
        }
    }

    showHelp() {
        console.log('\n📋 Available Console Commands:');
        console.log('  say <message>        - Send chat message');
        console.log('  whisper <player> <msg> - Whisper to player');
        console.log('  status               - Show bot status');
        console.log('  whispermode <on|off> - Toggle whisper repeating');
        console.log('  players              - List online players');
        console.log('  pos                  - Show bot position');
        console.log('  health               - Show bot health');
        console.log('  time                 - Show game time');
        console.log('  stats                - Show bot statistics');
        console.log('  inventory            - Show bot inventory');
        console.log('  biome                - Show current biome');
        console.log('  joke                 - Tell a joke');
        console.log('  quote                - Random quote');
        console.log('  move <direction>     - Move bot');
        console.log('  look <yaw> <pitch>   - Change bot view');
        console.log('  jump                 - Make bot jump');
        console.log('  logs <lines>         - View logs');
        console.log('  clearlogs            - Clear logs');
        console.log('  reconnect            - Reconnect to server');
        console.log('  shutdown             - Safely shutdown bot');
        console.log('  quit                 - Exit console');
        console.log('  help                 - Show this help\n');
    }

    sayCommand(args) {
        if (args.length === 0) {
            console.log('❌ Usage: say <message>');
            return;
        }
        const message = args.join(' ');
        this.bot.chat(message);
        console.log(`💬 Sent: ${message}`);
        this.logger.action('ConsoleSay', message);
    }

    whisperCommand(args) {
        if (args.length < 2) {
            console.log('❌ Usage: whisper <player> <message>');
            return;
        }
        const player = args[0];
        const message = args.slice(1).join(' ');
        this.bot.whisper(player, message);
        console.log(`🔒 Whispered to ${player}: ${message}`);
        this.logger.action('ConsoleWhisper', `${player}: ${message}`);
    }

    statusCommand() {
        console.log('\n🤖 Bot Status:');
        console.log(`  Name: ${this.bot.username}`);
        console.log(`  Health: ${this.bot.health}/20`);
        if (this.bot.entity) {
            const pos = this.bot.entity.position;
            console.log(`  Position: X:${Math.round(pos.x)} Y:${Math.round(pos.y)} Z:${Math.round(pos.z)}`);
        }
        console.log(`  Food: ${this.bot.food}/20`);
        console.log(`  Whisper Mode: ${this.botInfo.whisperSettings.enabled ? 'ENABLED ✅' : 'DISABLED ❌'}`);
        this.logger.action('ConsoleStatus', 'Checked');
    }

    whisperModeCommand(args) {
        if (args.length === 0) {
            console.log('❌ Usage: whispermode <on|off>');
            return;
        }
        
        const mode = args[0].toLowerCase();
        if (mode === 'on') {
            this.botInfo.whisperSettings.enabled = true;
            console.log('✅ Whisper repeating ENABLED');
            this.logger.action('ConsoleWhisperMode', 'Enabled');
        } else if (mode === 'off') {
            this.botInfo.whisperSettings.enabled = false;
            console.log('❌ Whisper repeating DISABLED');
            this.logger.action('ConsoleWhisperMode', 'Disabled');
        } else {
            console.log('❌ Usage: whispermode <on|off>');
        }
    }

    quitCommand() {
        console.log('👋 Goodbye!');
        this.logger.action('Console', 'Quit');
        this.rl.close();
    }

    playersCommand() {
        const players = Object.keys(this.bot.players).filter(name => name !== this.bot.username);
        if (players.length === 0) {
            console.log('👥 No other players online');
        } else {
            console.log(`👥 Online players: ${players.join(', ')}`);
        }
        this.logger.action('ConsolePlayers', `Listed ${players.length} players`);
    }

    positionCommand() {
        if (this.bot.entity) {
            const pos = this.bot.entity.position;
            console.log(`📍 Position: X:${Math.round(pos.x)} Y:${Math.round(pos.y)} Z:${Math.round(pos.z)}`);
            this.logger.action('ConsolePosition', 'Checked');
        } else {
            console.log('❌ Bot not spawned yet');
        }
    }

    healthCommand() {
        const hearts = healthConverter.getHearts(this.bot.health);
        console.log(`❤️ Health: ${hearts}/10 hearts (${this.bot.health}/20 HP) | 🍖 Food: ${this.bot.food}/20`);
        this.logger.action('ConsoleHealth', 'Checked');
    }

    timeCommand() {
        if (this.bot.time) {
            const time = this.bot.time.timeOfDay;
            const days = Math.floor(time / 24000);
            console.log(`⏰ Game Time: Day ${days + 1} | Time: ${time}`);
            this.logger.action('ConsoleTime', 'Checked');
        } else {
            console.log('❌ Time data not available');
        }
    }

    statsCommand() {
        if (this.bot.entity) {
            const pos = this.bot.entity.position;
            const hearts = healthConverter.getHearts(this.bot.health);
            console.log(`📊 Bot Statistics:`);
            console.log(`  Health: ${hearts}/10 hearts`);
            console.log(`  Food: ${this.bot.food}/20`);
            console.log(`  Position: X:${Math.round(pos.x)} Y:${Math.round(pos.y)} Z:${Math.round(pos.z)}`);
            console.log(`  On Ground: ${this.bot.entity.onGround}`);
            this.logger.action('ConsoleStats', 'Checked');
        }
    }

    inventoryCommand() {
        const items = this.bot.inventory.items();
        if (items.length === 0) {
            console.log('🎒 Inventory is empty');
        } else {
            console.log(`🎒 Inventory (${items.length} items):`);
            items.forEach(item => {
                console.log(`  - ${item.name} x${item.count}`);
            });
        }
        this.logger.action('ConsoleInventory', `Listed ${items.length} items`);
    }

    biomeCommand() {
        console.log('🌳 Biome command - would show current biome');
        this.logger.action('ConsoleBiome', 'Checked');
    }

    jokeCommand() {
        const jokes = [
            "Why did the Creeper go to therapy? It had too much TNTsion!",
            "What do you call a lazy Minecraft cow? A couch potato!"
        ];
        const joke = jokes[Math.floor(Math.random() * jokes.length)];
        console.log(`😄 ${joke}`);
        this.logger.action('ConsoleJoke', 'Told');
    }

    quoteCommand() {
        const quotes = [
            "The cave you fear to enter holds the treasure you seek.",
            "It's not about the blocks you place, but the world you build."
        ];
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        console.log(`💭 "${quote}"`);
        this.logger.action('ConsoleQuote', 'Shared');
    }

    shutdownCommand() {
        console.log('🔌 Shutting down bot...');
        this.logger.action('ConsoleShutdown', 'Initiated');
        this.bot.quit();
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    }

    reconnectCommand() {
        console.log('🔌 Reconnecting to server...');
        this.logger.action('ConsoleReconnect', 'Initiated');
        this.bot.quit();
        setTimeout(() => {
            console.log('Reconnection initiated...');
        }, 2000);
    }

    logsCommand(args) {
        const lines = parseInt(args[0]) || 20;
        console.log(`📜 Log viewing for ${lines} lines would be implemented here`);
        this.logger.action('ConsoleLogs', `Viewed ${lines} lines`);
        // Actual log viewing would be implemented
    }

    clearLogsCommand() {
        console.log('🗑️ Log clearing would be implemented here');
        this.logger.action('ConsoleClearLogs', 'Attempted');
        // Actual log clearing would be implemented
    }
}

module.exports = ConsoleManager;