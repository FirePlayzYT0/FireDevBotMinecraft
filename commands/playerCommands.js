class PlayerCommands {
    constructor(bot, botInfo, logger) {
        this.bot = bot;
        this.botInfo = botInfo;
        this.logger = logger;
        this.followTarget = null;
        this.followInterval = null;
    }

    handleCommand(username, command, args) {
        this.logger.command(username, command, args);

        switch (command) {
            case 'follow':
                return this.followPlayer(username, args);
            case 'stop':
                return this.stopFollowing(username);
            case 'come':
                return this.comeToPlayer(username);
            case 'dance':
                return this.danceAction(username);
            case 'wave':
                return this.waveAction(username);
        }
    }

    followPlayer(username, args) {
        if (args[0] === 'me') {
            const player = this.bot.players[username];
            if (player && player.entity) {
                this.followTarget = username;
                this.bot.chat(`👣 Now following ${username}!`);
                this.logger.action('Follow', `Started following ${username}`);
                this.startFollowing();
            } else {
                this.bot.chat(`❌ Cannot find player ${username}`);
                this.logger.action('Follow', `Failed - player ${username} not found`);
            }
        } else {
            this.bot.chat('❌ Usage: !follow me');
        }
    }

    stopFollowing(username) {
        if (this.followTarget) {
            this.bot.chat(`🛑 Stopped following ${this.followTarget}`);
            this.logger.action('Follow', `Stopped following ${this.followTarget}`);
            this.followTarget = null;
            if (this.followInterval) {
                clearInterval(this.followInterval);
                this.followInterval = null;
            }
        } else {
            this.bot.chat('🤔 I\'m not following anyone');
        }
    }

    comeToPlayer(username) {
        const player = this.bot.players[username];
        if (player && player.entity) {
            this.bot.chat(`🚶 Coming to you, ${username}!`);
            this.logger.action('Come', `Moving to ${username}`);
            // Movement logic would go here
        } else {
            this.bot.chat(`❌ Cannot find player ${username}`);
            this.logger.action('Come', `Failed - player ${username} not found`);
        }
    }

    danceAction(username) {
        const dances = ['💃', '🕺', '👯', '🎉', '✨'];
        const dance = dances[Math.floor(Math.random() * dances.length)];
        this.bot.chat(`${dance} ${this.bot.username} starts dancing! ${dance}`);
        this.logger.action('Dance', `Performed by ${username}`);
        
        // Add some movement for dance effect
        setTimeout(() => {
            this.bot.setControlState('jump', true);
            setTimeout(() => this.bot.setControlState('jump', false), 500);
        }, 1000);
    }

    waveAction(username) {
        this.bot.chat(`👋 Hello ${username}! *waves enthusiastically*`);
        this.logger.action('Wave', `Waved at ${username}`);
        
        // Look at the player
        const player = this.bot.players[username];
        if (player && player.entity) {
            this.bot.lookAt(player.entity.position.offset(0, 1.6, 0));
        }
    }

    startFollowing() {
        if (this.followInterval) {
            clearInterval(this.followInterval);
        }

        this.followInterval = setInterval(() => {
            if (!this.followTarget) {
                clearInterval(this.followInterval);
                return;
            }

            const player = this.bot.players[this.followTarget];
            if (player && player.entity) {
                const targetPos = player.entity.position;
                this.bot.lookAt(targetPos.offset(0, 1.6, 0));
                
                // Simple movement toward player
                const distance = this.bot.entity.position.distanceTo(targetPos);
                if (distance > 3) {
                    this.bot.setControlState('forward', true);
                } else {
                    this.bot.setControlState('forward', false);
                }
            } else {
                this.bot.chat(`❌ Lost sight of ${this.followTarget}`);
                this.logger.action('Follow', `Lost sight of ${this.followTarget}`);
                this.followTarget = null;
                clearInterval(this.followInterval);
            }
        }, 1000);
        
        this.logger.action('Follow', `Following interval started for ${this.followTarget}`);
    }
}

module.exports = PlayerCommands;