const commandsConfig = {
    basic: ['ping', 'health', 'pos', 'time', 'players', 'stats'],
    interaction: ['follow', 'stop', 'come', 'dance', 'wave'],
    utility: ['inventory', 'equipped', 'dig', 'place', 'build'],
    combat: ['attack', 'defend', 'run'],
    world: ['biome', 'weather', 'find', 'explore'],
    admin: ['shutdown', 'restart', 'config'],
    fun: ['joke', 'quote', 'tpa']
};

module.exports = commandsConfig;