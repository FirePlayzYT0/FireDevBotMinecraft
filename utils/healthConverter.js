function getHearts(healthPoints) {
    if (typeof healthPoints !== 'number' || healthPoints < 0 || healthPoints > 20) {
        return 'Invalid health';
    }
    
    const fullHearts = Math.floor(healthPoints / 2);
    const hasHalfHeart = healthPoints % 2 === 1;
    
    if (hasHalfHeart) {
        return `${fullHearts}.5`;
    } else {
        return `${fullHearts}`;
    }
}

function getDetailedHealth(healthPoints) {
    const hearts = getHearts(healthPoints);
    const fullHearts = Math.floor(healthPoints / 2);
    const halfHeart = healthPoints % 2 === 1;
    
    return {
        points: healthPoints,
        hearts: hearts,
        fullHearts: fullHearts,
        hasHalfHeart: halfHeart,
        display: `${hearts} ❤️ (${healthPoints}/20 HP)`
    };
}

function test() {
    console.log('🧪 Testing health conversion:');
    for (let i = 0; i <= 20; i++) {
        console.log(`${i} HP = ${getHearts(i)} hearts`);
    }
}

module.exports = {
    getHearts,
    getDetailedHealth,
    test
};