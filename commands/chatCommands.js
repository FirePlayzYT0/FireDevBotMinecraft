const healthConverter = require('../utils/healthConverter');

class ChatCommands {
    constructor(bot, botInfo, logger) {
        this.bot = bot;
        this.botInfo = botInfo;
        this.logger = logger;
        this.following = null;
        this.isExploring = false;
        this.jokes = [
            "Why did the Creeper go to therapy? It had too much TNTsion!",
            "What do you call a lazy Minecraft cow? A couch potato!",
            "Why did the player bring a bed to the Nether? They wanted to have a nightmare!",
            "What's a Minecraft player's favorite type of music? Block rock!",
            "Why did the Enderman bring a friend to the party? Because it couldn't handle it!"
        ];
        this.quotes = [
            "The cave you fear to enter holds the treasure you seek.",
            "It's not about the blocks you place, but the world you build.",
            "In Minecraft, as in life, the only limit is your imagination.",
            "Sometimes you have to mine through a lot of stone to find the diamonds.",
            "Adventure is out there! Well, actually it's right in this chunk."
        ];
    }

    initialize() {
        console.log('💬 Chat commands initialized');
        this.logger.action('ChatCommands', 'Initialized');
    }

    handleCommand(username, message) {
        if (!message.startsWith(this.botInfo.commands.prefix)) return;
        
        const args = message.slice(1).split(' ');
        const command = args[0].toLowerCase();
        const commandArgs = args.slice(1);

        this.logger.command(username, command, commandArgs);

        switch (command) {
            case 'ping': return this.pingCommand(username);
            case 'health': return this.healthCommand(username);
            case 'pos': return this.posCommand(username);
            case 'time': return this.timeCommand(username);
            case 'players': return this.playersCommand(username);
            case 'stats': return this.statsCommand(username);
            case 'follow': return this.followCommand(username, commandArgs);
            case 'stop': return this.stopCommand(username);
            case 'come': return this.comeCommand(username);
            case 'dance': return this.danceCommand(username);
            case 'wave': return this.waveCommand(username);
            case 'inventory': return this.inventoryCommand(username);
            case 'equipped': return this.equippedCommand(username);
            case 'dig': return this.digCommand(username);
            case 'place': return this.placeCommand(username);
            case 'build': return this.buildCommand(username, commandArgs);
            case 'attack': return this.attackCommand(username, commandArgs);
            case 'defend': return this.defendCommand(username);
            case 'run': return this.runCommand(username);
            case 'biome': return this.biomeCommand(username);
            case 'weather': return this.weatherCommand(username);
            case 'find': return this.findCommand(username, commandArgs);
            case 'explore': return this.exploreCommand(username);
            case 'shutdown': return this.shutdownCommand(username);
            case 'restart': return this.restartCommand(username);
            case 'config': return this.configCommand(username);
            case 'joke': return this.jokeCommand(username);
            case 'quote': return this.quoteCommand(username);
            case 'tpa': return this.tpaCommand(username);
            case 'help': return this.helpCommand(username);
            case 'logs': return this.logsCommand(username, commandArgs);
        }
    }

    pingCommand(username) {
        this.bot.chat('Pong! 🏓');
        this.logger.action('Ping', `Responded to ${username}`);
    }

    healthCommand(username) {
        const hearts = healthConverter.getHearts(this.bot.health);
        const food = this.bot.food;
        this.bot.chat(`❤️ Health: ${hearts}/10 hearts (${this.bot.health}/20) | 🍖 Food: ${food}/20`);
        this.logger.action('Health', `Checked by ${username}: ${hearts} hearts`);
    }

    posCommand(username) {
        const pos = this.bot.entity.position;
        this.bot.chat(`📍 Position: X:${Math.round(pos.x)} Y:${Math.round(pos.y)} Z:${Math.round(pos.z)}`);
        this.logger.action('Position', `Checked by ${username}`);
    }

    timeCommand(username) {
        const time = this.bot.time.timeOfDay;
        const days = Math.floor(time / 24000);
        const timeString = this.formatTime(time);
        this.bot.chat(`⏰ Game Time: ${timeString} | Day ${days + 1}`);
        this.logger.action('Time', `Checked by ${username}`);
    }

    playersCommand(username) {
        const players = Object.keys(this.bot.players).filter(name => name !== this.bot.username);
        if (players.length === 0) {
            this.bot.chat('👥 No other players online');
        } else {
            this.bot.chat(`👥 Online players: ${players.join(', ')}`);
        }
        this.logger.action('Players', `Listed by ${username}: ${players.length} players`);
    }

    statsCommand(username) {
        const pos = this.bot.entity.position;
        const hearts = healthConverter.getHearts(this.bot.health);
        this.bot.chat(`📊 Stats: ❤️ ${hearts}/10 | 🍖 ${this.bot.food}/20 | 📍 ${Math.round(pos.x)},${Math.round(pos.y)},${Math.round(pos.z)}`);
        this.logger.action('Stats', `Checked by ${username}`);
    }

    followCommand(username, args) {
        if (args[0] === 'me') {
            this.following = username;
            this.bot.chat(`👣 Following ${username}!`);
            this.logger.action('Follow', `Started following ${username}`);
        }
    }

    stopCommand(username) {
        if (this.following) {
            this.bot.chat(`🛑 Stopped following ${this.following}`);
            this.logger.action('Follow', `Stopped following ${this.following}`);
            this.following = null;
        } else {
            this.bot.chat('🤔 I\'m not following anyone');
        }
    }

    comeCommand(username) {
        this.bot.chat(`🚶 Coming to ${username}!`);
        this.logger.action('Come', `Moving to ${username}`);
    }

    danceCommand(username) {
        const dances = ['💃', '🕺', '👯', '🎉'];
        const dance = dances[Math.floor(Math.random() * dances.length)];
        this.bot.chat(`${dance} ${this.bot.username} is dancing! ${dance}`);
        this.logger.action('Dance', `${username} made bot dance`);
    }

    waveCommand(username) {
        this.bot.chat(`👋 Hello ${username}! *waves*`);
        this.logger.action('Wave', `Waved at ${username}`);
    }

    inventoryCommand(username) {
        const items = this.bot.inventory.items();
        if (items.length === 0) {
            this.bot.whisper(username, '🎒 Inventory is empty');
        } else {
            const itemCount = items.length;
            this.bot.whisper(username, `🎒 I have ${itemCount} item(s) in inventory`);
            items.slice(0, 5).forEach(item => {
                this.bot.whisper(username, `- ${item.name} x${item.count}`);
            });
        }
        this.logger.action('Inventory', `Checked by ${username}: ${items.length} items`);
    }

    equippedCommand(username) {
        const equipped = this.bot.inventory.slots[this.bot.inventory.hotbarStart + this.bot.quickBarSlot];
        if (equipped) {
            this.bot.whisper(username, `🛡️ Equipped: ${equipped.name} x${equipped.count}`);
        } else {
            this.bot.whisper(username, '🛡️ Nothing equipped');
        }
        this.logger.action('Equipped', `Checked by ${username}`);
    }

    digCommand(username) {
        this.bot.chat('⛏️ Dig command activated!');
        this.logger.action('Dig', `Attempted by ${username}`);
    }

    placeCommand(username) {
        this.bot.chat('🪵 Place command activated!');
        this.logger.action('Place', `Attempted by ${username}`);
    }

    buildCommand(username, args) {
        if (args[0] === 'house') {
            this.bot.chat('🏠 Building a simple house...');
            this.logger.action('Build', `House build started by ${username}`);
        } else {
            this.bot.chat('❌ Usage: !build house');
        }
    }

    attackCommand(username, args) {
        if (args[0] === 'nearest') {
            this.bot.chat('⚔️ Attacking nearest mob!');
            this.logger.action('Attack', `Nearest mob attack by ${username}`);
        }
    }

    defendCommand(username) {
        this.bot.chat('🛡️ Entering defense mode!');
        this.logger.action('Defend', `Defense mode by ${username}`);
    }

    runCommand(username) {
        this.bot.chat('🏃 Running away from danger!');
        this.logger.action('Run', `Escape by ${username}`);
    }

    biomeCommand(username) {
        this.bot.chat('🌳 Biome detection activated!');
        this.logger.action('Biome', `Checked by ${username}`);
    }

    weatherCommand(username) {
        this.bot.chat('☀️ Weather check activated!');
        this.logger.action('Weather', `Checked by ${username}`);
    }

    findCommand(username, args) {
        if (args[0] === 'village') {
            this.bot.chat('🏘️ Searching for village...');
            this.logger.action('Find', `Village search by ${username}`);
        } else {
            this.bot.chat('❌ Usage: !find village');
        }
    }

    exploreCommand(username) {
        this.isExploring = !this.isExploring;
        const status = this.isExploring ? 'STARTED' : 'STOPPED';
        this.bot.chat(`🗺️ Exploration ${status}!`);
        this.logger.action('Explore', `${status} by ${username}`);
    }

    shutdownCommand(username) {
        this.bot.chat('🔌 Shutting down bot... Goodbye! 👋');
        this.logger.action('Shutdown', `Initiated by ${username}`);
        setTimeout(() => {
            this.bot.quit();
            process.exit(0);
        }, 2000);
    }

    restartCommand(username) {
        this.bot.chat('🔄 Restarting bot...');
        this.logger.action('Restart', `Initiated by ${username}`);
    }

    configCommand(username) {
        this.bot.whisper(username, `⚙️ Bot: ${this.botInfo.botIdentity.name} v${this.botInfo.botIdentity.version}`);
        this.logger.action('Config', `Checked by ${username}`);
    }

    jokeCommand(username) {
        const joke = this.jokes[Math.floor(Math.random() * this.jokes.length)];
        this.bot.chat(`😄 ${joke}`);
        this.logger.action('Joke', `Told by ${username}`);
    }

    quoteCommand(username) {
        const quote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
        this.bot.chat(`💭 "${quote}"`);
        this.logger.action('Quote', `Shared by ${username}`);
    }

    tpaCommand(username) {
        this.bot.chat(`📬 ${username} wants to teleport! Type !tpaccept`);
        this.logger.action('TPA', `Requested by ${username}`);
    }

    helpCommand(username) {
        this.bot.whisper(username, '📚 Commands: !ping, !health, !pos, !time, !players, !stats, !follow me, !stop, !dance, !inventory, !joke, !quote, !shutdown');
        this.logger.action('Help', `Requested by ${username}`);
    }

    logsCommand(username, args) {
        const lines = parseInt(args[0]) || 5;
        this.bot.whisper(username, `📜 Logs command - would show last ${lines} entries`);
        this.logger.action('Logs', `Checked by ${username}, requested ${lines} lines`);
    }

    formatTime(time) {
        const hours = Math.floor((time / 1000 + 6) % 24);
        const minutes = Math.floor((time % 1000) / 1000 * 60);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }
}

module.exports = ChatCommands;