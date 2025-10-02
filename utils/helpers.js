class Helpers {
    static formatPosition(position) {
        return `X:${Math.round(position.x)} Y:${Math.round(position.y)} Z:${Math.round(position.z)}`;
    }

    static distanceBetween(pos1, pos2) {
        return Math.sqrt(
            Math.pow(pos2.x - pos1.x, 2) +
            Math.pow(pos2.y - pos1.y, 2) +
            Math.pow(pos2.z - pos1.z, 2)
        );
    }

    static getCardinalDirection(yaw) {
        const directions = ['North', 'North East', 'East', 'South East', 'South', 'South West', 'West', 'North West'];
        const index = Math.round(((yaw + 180) % 360) / 45) % 8;
        return directions[index];
    }
}

module.exports = Helpers;