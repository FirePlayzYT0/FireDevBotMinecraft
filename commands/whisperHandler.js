class WhisperHandler {
    constructor(bot, botInfo, logger) {
        this.bot = bot;
        this.botInfo = botInfo;
        this.logger = logger;
        this.whisperCooldown = new Map();
        this.settings = botInfo.whisperSettings;
    }

    initialize() {
        this.bot.on('message', (jsonMsg) => {
            const message = jsonMsg.toString();
            this.handleMessage(message);
        });

        this.bot.on('chat', (username, message) => {
            this.handleChatCommand(username, message);
        });

        console.log('🔊 Whisper handler initialized');
        this.logger.action('WhisperHandler', 'Initialized');
    }

    handleMessage(rawMessage) {
        if (!this.settings.enabled) return;

        if (rawMessage.includes('whispers:') || rawMessage.includes('whispers to you:')) {
            this.logger.action('Whisper', `Detected: ${rawMessage}`);
            this.processWhisper(rawMessage);
        }
    }

    processWhisper(rawMessage) {
        try {
            const whisperRegex = /^([A-Za-z0-9_]{1,16}) (?:whispers|whispers to you): (.+)$/;
            const match = rawMessage.match(whisperRegex);
            
            if (match) {
                const [_, sender, message] = match;
                
                this.logger.whisper(sender, this.bot.username, message);
                
                if (this.isOnCooldown(sender)) {
                    console.log(`⏳ ${sender} is on cooldown`);
                    this.logger.action('Whisper', `Cooldown for ${sender}`);
                    return;
                }

                let cleanMessage = this.cleanMessage(message);
                
                if (cleanMessage.length > this.settings.maxLength) {
                    console.log(`📏 Message too long from ${sender}`);
                    this.logger.action('Whisper', `Message too long from ${sender}`);
                    return;
                }

                this.repeatMessage(cleanMessage, sender);
                this.setCooldown(sender);
                
                this.logger.action('Whisper', `Repeated message from ${sender}`);
            }
        } catch (error) {
            console.log('❌ Error processing whisper:', error);
            this.logger.error('WhisperHandler', error);
        }
    }

    cleanMessage(message) {
        let clean = message.replace(new RegExp(this.bot.username, 'gi'), '').trim();
        clean = clean.replace(/\s+/g, ' ').trim();
        return clean;
    }

    repeatMessage(message, sender) {
        if (!message || message.length === 0) return;
        
        this.bot.chat(message);
        console.log(`🔊 Repeated whisper from ${sender}: ${message}`);
        this.logger.action('WhisperRepeat', `${sender} -> PUBLIC: ${message}`);
    }

    handleChatCommand(username, message) {
        if (message.startsWith(this.botInfo.commands.prefix)) {
            const command = message.slice(1).toLowerCase().split(' ')[0];
            const args = message.slice(1).split(' ').slice(1);

            this.logger.command(username, command, args);

            switch (command) {
                case 'whispermode':
                    this.toggleWhisperMode(username, args);
                    break;
                case 'whisperstatus':
                    this.showWhisperStatus(username);
                    break;
            }
        }
    }

    toggleWhisperMode(username, args) {
        if (args.length === 0) {
            this.bot.whisper(username, `Usage: ${this.botInfo.commands.prefix}whispermode <on|off>`);
            return;
        }

        const mode = args[0].toLowerCase();
        if (mode === 'on') {
            this.settings.enabled = true;
            this.bot.whisper(username, '🔊 Whisper repeating is now ENABLED');
            this.logger.action('WhisperMode', `Enabled by ${username}`);
        } else if (mode === 'off') {
            this.settings.enabled = false;
            this.bot.whisper(username, '🔇 Whisper repeating is now DISABLED');
            this.logger.action('WhisperMode', `Disabled by ${username}`);
        }
    }

    showWhisperStatus(username) {
        const status = this.settings.enabled ? 'ENABLED ✅' : 'DISABLED ❌';
        this.bot.whisper(username, `Whisper repeating: ${status}`);
        this.logger.action('WhisperStatus', `Checked by ${username}: ${status}`);
    }

    isOnCooldown(sender) {
        if (!this.whisperCooldown.has(sender)) return false;
        const lastTime = this.whisperCooldown.get(sender);
        return Date.now() - lastTime < this.settings.cooldown;
    }

    setCooldown(sender) {
        this.whisperCooldown.set(sender, Date.now());
    }
}

module.exports = WhisperHandler;