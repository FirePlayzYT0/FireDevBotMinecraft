class ConsoleCommands {
    constructor(bot, botInfo, logger) {
        this.bot = bot;
        this.botInfo = botInfo;
        this.logger = logger;
    }

    handleCommand(command, args) {
        this.logger.action('ConsoleExtended', `Command: ${command} ${args.join(' ')}`);

        switch (command) {
            case 'move':
                return this.moveCommand(args);
            case 'look':
                return this.lookCommand(args);
            case 'jump':
                return this.jumpCommand();
            case 'craft':
                return this.craftCommand(args);
            case 'mine':
                return this.mineCommand(args);
            default:
                return false;
        }
    }

    moveCommand(args) {
        if (args.length < 1) {
            console.log('❌ Usage: move <forward|back|left|right|stop>');
            return true;
        }

        const direction = args[0].toLowerCase();
        const directions = {
            'forward': 'forward',
            'back': 'back',
            'left': 'left', 
            'right': 'right',
            'stop': 'forward'
        };

        if (direction === 'stop') {
            Object.keys(directions).forEach(key => {
                if (key !== 'stop') this.bot.setControlState(key, false);
            });
            console.log('🛑 Stopped all movement');
            this.logger.action('ConsoleMove', 'Stopped');
        } else if (directions[direction]) {
            this.bot.setControlState(directions[direction], true);
            console.log(`🎮 Moving ${direction}`);
            this.logger.action('ConsoleMove', direction);
            
            setTimeout(() => {
                this.bot.setControlState(directions[direction], false);
            }, 2000);
        } else {
            console.log('❌ Invalid direction. Use: forward, back, left, right, stop');
        }
        return true;
    }

    lookCommand(args) {
        if (args.length < 2) {
            console.log('❌ Usage: look <yaw> <pitch>');
            return true;
        }

        const yaw = parseFloat(args[0]);
        const pitch = parseFloat(args[1]);

        if (isNaN(yaw) || isNaN(pitch)) {
            console.log('❌ Invalid yaw or pitch values');
            return true;
        }

        this.bot.look(yaw, pitch, true);
        console.log(`👀 Looking at yaw: ${yaw}, pitch: ${pitch}`);
        this.logger.action('ConsoleLook', `Yaw: ${yaw}, Pitch: ${pitch}`);
        return true;
    }

    jumpCommand() {
        this.bot.setControlState('jump', true);
        console.log('🦘 Jumping!');
        this.logger.action('ConsoleJump', 'Performed');
        
        setTimeout(() => {
            this.bot.setControlState('jump', false);
        }, 500);
        return true;
    }

    craftCommand(args) {
        if (args.length === 0) {
            console.log('❌ Usage: craft <item>');
            return true;
        }

        const itemName = args.join(' ').toLowerCase();
        console.log(`🛠️ Would craft: ${itemName}`);
        this.logger.action('ConsoleCraft', `Attempted: ${itemName}`);
        return true;
    }

    mineCommand(args) {
        if (args.length === 0) {
            console.log('❌ Usage: mine <block>');
            return true;
        }

        const blockName = args.join(' ').toLowerCase();
        console.log(`⛏️ Would mine: ${blockName}`);
        this.logger.action('ConsoleMine', `Attempted: ${blockName}`);
        return true;
    }
}

module.exports = ConsoleCommands;