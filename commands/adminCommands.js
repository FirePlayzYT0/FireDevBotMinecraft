class AdminCommands {
    constructor(bot, botInfo, logger) {
        this.bot = bot;
        this.botInfo = botInfo;
        this.logger = logger;
    }

    handleCommand(username, command, args) {
        // Check if user has admin privileges
        if (!this.isAdmin(username)) {
            this.bot.whisper(username, '❌ You do not have admin permissions');
            this.logger.action('Admin', `Permission denied for ${username}`);
            return;
        }

        this.logger.command(username, command, args);

        switch (command) {
            case 'shutdown':
                return this.shutdownBot(username);
            case 'restart':
                return this.restartBot(username);
            case 'config':
                return this.showConfig(username);
            case 'reconnect':
                return this.reconnectBot(username);
            case 'eval':
                return this.evalCode(username, args);
            case 'logs':
                return this.showLogs(username, args);
        }
    }

    isAdmin(username) {
        // Simple admin check - you can expand this
        const admins = ['Admin', 'Owner', 'Moderator']; // Add actual admin usernames
        return admins.includes(username);
    }

    shutdownBot(username) {
        this.bot.chat('🔌 Admin shutdown initiated... Goodbye! 👋');
        this.logger.action('Shutdown', `Admin shutdown by ${username}`);
        console.log(`🛑 Shutdown command received from ${username}`);
        
        setTimeout(() => {
            this.bot.quit();
            console.log('Bot shutdown complete');
            process.exit(0);
        }, 3000);
    }

    restartBot(username) {
        this.bot.chat('🔄 Admin restart initiated... Be right back!');
        this.logger.action('Restart', `Admin restart by ${username}`);
        console.log(`🔄 Restart command received from ${username}`);
        
        setTimeout(() => {
            this.bot.quit();
            console.log('Bot restarting...');
            // In a real implementation, you'd restart the process
        }, 2000);
    }

    showConfig(username) {
        const configInfo = `
🤖 Bot Configuration:
• Name: ${this.botInfo.botIdentity.name}
• Version: ${this.botInfo.botIdentity.version}
• Whisper Mode: ${this.botInfo.whisperSettings.enabled ? 'ON' : 'OFF'}
• Auto Reconnect: ${this.botInfo.serverSettings.autoReconnect ? 'ON' : 'OFF'}
        `.trim();

        this.bot.whisper(username, configInfo);
        this.logger.action('Config', `Viewed by admin ${username}`);
    }

    reconnectBot(username) {
        this.bot.chat('🔌 Admin reconnect initiated...');
        this.logger.action('Reconnect', `Admin reconnect by ${username}`);
        console.log(`🔌 Reconnect command from ${username}`);
        
        this.bot.quit();
        setTimeout(() => {
            console.log('Attempting to reconnect...');
        }, 5000);
    }

    evalCode(username, args) {
        if (args.length === 0) {
            this.bot.whisper(username, '❌ Usage: !eval <code>');
            return;
        }

        const code = args.join(' ');
        try {
            // WARNING: This is dangerous - only for trusted admins
            const result = eval(code);
            this.bot.whisper(username, `✅ Eval result: ${result}`);
            this.logger.action('Eval', `Executed by ${username}: ${code} = ${result}`);
            console.log(`⚡ Admin eval by ${username}: ${code} = ${result}`);
        } catch (error) {
            this.bot.whisper(username, `❌ Eval error: ${error.message}`);
            this.logger.error('Eval', `Error by ${username}: ${error.message}`);
        }
    }

    showLogs(username, args) {
        const lines = parseInt(args[0]) || 10;
        this.bot.whisper(username, `📜 Last ${lines} log entries would be shown here`);
        this.logger.action('Logs', `Admin ${username} viewed ${lines} log entries`);
        // Actual log viewing implementation would go here
    }
}

module.exports = AdminCommands;